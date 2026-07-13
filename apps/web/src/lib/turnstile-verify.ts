/**
 * Server-side Cloudflare Turnstile verification for the public apply funnel.
 *
 * Feature-flagged on TURNSTILE_SECRET_KEY (server-only env). When the secret is
 * absent (preview/dev, or before rollout) the check is a no-op ("off") so the
 * funnel keeps working — Turnstile is enforced on production only.
 *
 * Reasons let each caller pick its own policy:
 *   - cv-preview: fail-CLOSED on "no-token"/"failed" (a bot without a real token
 *     gets no LLM call), but fail-OPEN on "network-error" (a Cloudflare outage
 *     must never blanket-block previews). The gate itself is fail-open anyway.
 *   - submit: never blocks (conversion). It only logs a failed/absent token;
 *     honeypot + DB rate limit + email verification still guard the write.
 */

const SITEVERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export type TurnstileReason =
  | "off" // secret not configured — feature disabled
  | "verified" // token valid
  | "no-token" // client sent no token
  | "failed" // Cloudflare rejected the token
  | "network-error"; // couldn't reach Cloudflare

export type TurnstileResult = { pass: boolean; reason: TurnstileReason };

export async function verifyTurnstile(
  token: string | null | undefined,
  ip: string | null,
): Promise<TurnstileResult> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return { pass: true, reason: "off" };
  if (!token || typeof token !== "string") return { pass: false, reason: "no-token" };

  try {
    const form = new URLSearchParams();
    form.set("secret", secret);
    form.set("response", token);
    if (ip) form.set("remoteip", ip);

    const res = await fetch(SITEVERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: form,
    });
    const data = (await res.json().catch(() => null)) as { success?: boolean } | null;
    return data?.success
      ? { pass: true, reason: "verified" }
      : { pass: false, reason: "failed" };
  } catch {
    // Couldn't reach Cloudflare — don't punish the user for our outage.
    return { pass: false, reason: "network-error" };
  }
}
