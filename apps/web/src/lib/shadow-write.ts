import type { NextRequest } from "next/server";
import type { Json } from "@perantauglobal/db";
import { supabaseV2, isV2Configured } from "./supabase-v2";

/**
 * Shape passed into shadowPendingSubmission. Matches the `pending_submissions`
 * + `consents` tables in the new perantauglobal schema.
 */
export interface ShadowWriteArgs {
  /** Position slug — must match `positions.slug` in new Supabase. */
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

/**
 * Fire-and-forget shadow write to new Supabase.
 *
 * Writes to `pending_submissions` + `consents` atomically-ish (consent
 * inserts happen after pending_submission insert; if consent fails the
 * pending row still stands, which is acceptable — we have the core lead).
 *
 * Never throws to caller — logs on failure. Legacy form path remains
 * source of truth until cutover.
 */
export async function shadowPendingSubmission(
  args: ShadowWriteArgs,
  request: NextRequest,
): Promise<void> {
  if (!isV2Configured()) {
    console.info("[shadow-write] skipped: V2 env not configured");
    return;
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
      console.warn("[shadow-write] pending_submissions insert failed:", pendingErr.message);
      return;
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
        console.warn("[shadow-write] consents insert failed:", consentErr.message);
      }
    }

    console.info("[shadow-write] ok:", {
      position: args.position_slug,
      pending_id: pendingId,
      consents: grantedConsents.length,
    });
  } catch (err) {
    console.warn("[shadow-write] unexpected error:", err);
  }
}
