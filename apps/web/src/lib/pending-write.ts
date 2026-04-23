import type { NextRequest } from "next/server";
import type { Json } from "@perantauglobal/db";
import { supabaseV2, isV2Configured } from "./supabase-v2";

/**
 * Shape passed into writePendingSubmission. Matches the `pending_submissions`
 * + `consents` tables in the perantauglobal schema.
 */
export interface WritePendingArgs {
  /** Position slug — must match `positions.slug`. */
  position_slug: string;
  /** Candidate email used for magic-link auth + dedupe. */
  email: string;
  /** Candidate phone (WhatsApp). */
  phone?: string | null;
  /**
   * Full form payload. Merged later into candidate profile_data + application
   * answers once magic link is verified. Shape is position-specific.
   */
  form_data: Record<string, unknown>;
  /**
   * Consent records. PDP UU 27/2022 compliance log.
   *
   * Common purposes:
   *   - "application_processing" — required to apply
   *   - "marketing_email" — optional
   *   - "marketing_whatsapp" — optional
   */
  consents: Array<{
    purpose: string;
    purpose_text: string;
    version: string;
    granted: boolean;
  }>;
}

export type WritePendingResult =
  | { ok: true; pendingId: string }
  | { ok: false; error: string };

/**
 * Canonical write of a pending_submission + linked consents.
 *
 * Previously this was a fire-and-forget "shadow" alongside a legacy gt-tools
 * insert. Post-Phase-2 cleanup, this is the only write path — if it fails we
 * surface the error to the caller so the form returns 500.
 */
export async function writePendingSubmission(
  args: WritePendingArgs,
  request: NextRequest,
): Promise<WritePendingResult> {
  if (!isV2Configured()) {
    return { ok: false, error: "supabase not configured" };
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    null;
  const userAgent = request.headers.get("user-agent") || null;

  // Pre-generate the pending_submission id so we can link consents without
  // needing a SELECT policy for anon (RLS blocks reading back after INSERT).
  const pendingId = crypto.randomUUID();

  try {
    const db = supabaseV2();

    const { error: pendingErr } = await db.from("pending_submissions").insert({
      id: pendingId,
      position_slug: args.position_slug,
      email: args.email.toLowerCase().trim(),
      phone: args.phone || null,
      form_data: args.form_data as unknown as Json,
      ip_address: ip ?? undefined,
      user_agent: userAgent,
    });

    if (pendingErr) {
      console.warn("[pending-write] pending_submissions insert failed:", pendingErr.message);
      return { ok: false, error: pendingErr.message };
    }

    const grantedConsents = args.consents.filter((c) => c.granted);
    if (grantedConsents.length > 0) {
      const nowIso = new Date().toISOString();
      const { error: consentErr } = await db.from("consents").insert(
        grantedConsents.map((c) => ({
          pending_id: pendingId,
          purpose: c.purpose,
          purpose_text: c.purpose_text,
          version: c.version,
          granted_at: nowIso,
          ip_address: ip ?? undefined,
          user_agent: userAgent,
        })),
      );
      if (consentErr) {
        console.warn("[pending-write] consents insert failed:", consentErr.message);
        return { ok: false, error: consentErr.message };
      }
    }

    return { ok: true, pendingId };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn("[pending-write] unexpected error:", message);
    return { ok: false, error: message };
  }
}
