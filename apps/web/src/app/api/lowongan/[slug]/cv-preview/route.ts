import { NextRequest, NextResponse } from "next/server";
import { waitUntil } from "@vercel/functions";
import { supabaseV2 } from "@/lib/supabase-v2";
import { verifyTurnstile } from "@/lib/turnstile-verify";

/**
 * CV fit preview ("CV di depan") for the public apply form.
 *
 * The candidate has NO account/application yet, so we cannot use the persisted
 * grade-cv path. Instead this route proxies to the dedicated `grade-cv-preview`
 * edge function (verify_jwt=false, secret-gated), which reads the just-uploaded
 * file from `pending-cv`, runs extraction + fit IN-MEMORY keyed on position_slug
 * + the apply answers, and returns the candidate-safe fit inline. Nothing is
 * persisted. It is separate from grade-cv (which stays verify_jwt=true) so this
 * anon-reachable path never rides the JWT-gated grader.
 *
 * Why a proxy (not a direct browser -> edge fn call): keeps the LLM path off the
 * anon surface. The browser only ever hits this same-origin route; the shared
 * CV_PREVIEW_SECRET (server-only env) is what authorizes the edge function.
 * A missing secret = feature simply off (route returns no fit).
 *
 * Anti-abuse: per-IP rate limit (migration 0094, fail-open) + strict cv_path
 * validation against the caller's own pending_id (can't point at someone else's
 * staged object). Read-only, no DB writes here.
 */

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Only trust a cv_path that strictly matches the caller's own pending_id. */
function validCvPath(pendingId: unknown, cvPath: unknown): boolean {
  if (typeof pendingId !== "string" || !UUID_RE.test(pendingId)) return false;
  if (typeof cvPath !== "string") return false;
  return new RegExp(`^pending/${pendingId}/cv\\.(pdf|jpe?g|png|heic|heif|webp)$`, "i").test(cvPath);
}

// Soft "no fit to show" response — the client just renders nothing. Kept 200 so
// a preview miss never surfaces as an error on the apply form.
const noFit = () => NextResponse.json({ fit: null });

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    if (!process.env.CV_PREVIEW_SECRET) return noFit(); // feature off until secret set

    const body = (await request.json().catch(() => ({}))) as {
      pending_id?: string;
      cv_path?: string;
      cv_mime?: string;
      answers?: Record<string, string | string[]>;
      turnstile_token?: string;
    };

    if (!validCvPath(body.pending_id, body.cv_path)) return noFit();

    const clientIp =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      null;

    // Turnstile: keep bots off the LLM path. Fail-CLOSED on a missing/rejected
    // token (a bot gets no fit), but fail-OPEN on a Cloudflare outage or when the
    // feature is off — and the gate itself is fail-open, so a legit user whose
    // widget failed still just sees no card and can submit.
    const ts = await verifyTurnstile(body.turnstile_token, clientIp);
    if (!ts.pass && (ts.reason === "no-token" || ts.reason === "failed")) return noFit();

    const db = supabaseV2();
    // Bind rpc to the client. A detached `const rpc = db.rpc` loses `this` and
    // throws inside supabase-js (silently swallowed by the fail-open catch below),
    // so the rate limit + telemetry never actually ran. Bind so the call reaches
    // PostgREST.
    const rpc = db.rpc.bind(db) as unknown as (
      fn: string,
      args: Record<string, unknown>,
    ) => Promise<{ data: unknown; error: { message: string } | null }>;

    // Rate limit v2 (migration 0095): cap per-IP (8/10min) + per-pending (5/24h).
    // Returns the event id to stamp the outcome on, or null when blocked. Fail-open
    // if the RPC errors / isn't applied yet — a transient issue never blocks a legit
    // applicant; we just skip telemetry for that call (eventId stays null).
    let eventId: number | null = null;
    try {
      const { data: evId, error } = await rpc("check_cv_preview_rate_limit", {
        p_ip: clientIp,
        p_pending_id: body.pending_id,
        p_position_slug: slug,
      });
      if (!error) {
        if (evId == null) return noFit(); // rate limited
        eventId = Number(evId);
      }
    } catch {
      // ignore — fail open
    }

    const { data, error } = await db.functions.invoke("grade-cv-preview", {
      body: {
        cv_path: body.cv_path,
        cv_mime: body.cv_mime ?? null,
        position_slug: slug,
        answers: body.answers ?? {},
      },
      headers: { "x-preview-secret": process.env.CV_PREVIEW_SECRET },
    });

    const scored = Boolean(!error && data?.ok && data?.fit);
    // Distinguish "we couldn't read the CV" from a generic miss so the client can
    // nudge a re-upload (WS-7a). The gate stays fail-open on both.
    const unreadable = !scored && Boolean((data as { unreadable?: boolean } | null)?.unreadable);

    // Telemetry: stamp fit_score + outcome onto the event row so the gate threshold
    // can be tuned from the real distribution (WS-6a). waitUntil keeps the lambda
    // alive past the response so this background write actually completes — a bare
    // un-awaited promise gets frozen the moment Vercel flushes the response.
    if (eventId != null) {
      const outcome = error ? "error" : scored ? "scored" : unreadable ? "unreadable" : "no_fit";
      const fitScore =
        scored && typeof data.fit.fit_score === "number" ? data.fit.fit_score : null;
      waitUntil(
        rpc("record_cv_preview_outcome", {
          p_event_id: eventId,
          p_fit_score: fitScore,
          p_outcome: outcome,
        })
          .then(() => undefined)
          .catch(() => undefined),
      );
    }

    if (!scored) return NextResponse.json({ fit: null, ...(unreadable ? { reason: "unreadable" } : {}) });
    return NextResponse.json({ fit: data.fit });
  } catch {
    return noFit();
  }
}
