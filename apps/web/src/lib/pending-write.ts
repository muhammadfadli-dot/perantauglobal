import type { NextRequest } from "next/server";
import type { Json } from "@perantauglobal/db";
import { supabaseV2, isV2Configured } from "./supabase-v2";

/**
 * Shape passed into writePendingSubmission. Matches the `pending_submissions`
 * + `consents` tables in the perantauglobal schema.
 */
export interface WritePendingArgs {
  /**
   * Optional caller-provided pending id. When the LP staged a CV upload anon to
   * `pending-cv/pending/<id>/cv.*` BEFORE submit (Fase 2 CV grader), the upload
   * path must equal this pending_submissions PK so the trigger + cv-materialize
   * can reconnect file -> candidate. Caller passes the SAME uuid it uploaded
   * under. Falls back to a fresh uuid (no-CV path) when omitted.
   */
  pendingId?: string;
  /**
   * Intent of the submission. 'job' → materializes an application; 'academy' →
   * materializes an academy_enrollment (migration 0060). Defaults to 'job' for
   * backward compatibility with the existing apply flow.
   */
  intent?: "job" | "academy" | "event";
  /** Position slug - required when intent='job'. Must match `positions.slug`. */
  position_slug?: string;
  /** Program slug - required when intent='academy'. Must match `academy_programs.slug`. */
  program_slug?: string;
  /** Event slug - required when intent='event'. Must match `events.slug` (migration 0081). */
  event_slug?: string;
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
   *   - "application_processing" - required to apply
   *   - "marketing_email" - optional
   *   - "marketing_whatsapp" - optional
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
 * insert. Post-Phase-2 cleanup, this is the only write path - if it fails we
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
  // Caller may supply one (CV staged under pending/<id>/ must match this PK);
  // validate shape defensively before trusting a client-influenced value.
  const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const pendingId =
    args.pendingId && UUID_RE.test(args.pendingId) ? args.pendingId : crypto.randomUUID();

  try {
    const db = supabaseV2();

    const intent = args.intent ?? "job";
    // `event_slug` lives only in the DB after migration 0081 (types not yet
    // regenerated), so cast the row — mirrors the codebase's `as never` insert
    // pattern. Other fields keep their shape.
    const { error: pendingErr } = await db.from("pending_submissions").insert({
      id: pendingId,
      intent,
      position_slug: intent === "job" ? (args.position_slug ?? null) : null,
      program_slug: intent === "academy" ? (args.program_slug ?? null) : null,
      event_slug: intent === "event" ? (args.event_slug ?? null) : null,
      email: args.email.toLowerCase().trim(),
      phone: args.phone || null,
      form_data: args.form_data as unknown as Json,
      ip_address: ip ?? undefined,
      user_agent: userAgent,
    } as never);

    if (pendingErr) {
      // 23505 = unique_violation on the PK. This is a RETRY of a submission we
      // already staged: the LP writes the pending row before signUp, so any
      // signUp failure (wrong password, weak password, rate limit) leaves the
      // row behind, and the client resubmits with the SAME client-generated
      // pending id because the CV is staged at pending/<id>/ and the id must
      // keep matching that path. Before this branch the retry died on the PK
      // and the candidate got "Gagal menyimpan data" — a second, more confusing
      // error for a problem they had already half-solved, with no way out but
      // reloading the page. Observed live on 2026-07-22 in the welder funnel.
      //
      // Treat it as success: the staged row already holds this submission's
      // form_data + consents, and nothing that changes between attempts (the
      // password) is stored here. Do NOT re-insert consents — that would log a
      // duplicate grant for one act of consent.
      //
      // Caveat, deliberate: if the candidate edited an answer between attempts,
      // the row keeps the FIRST attempt's answers. Anon holds INSERT-only rights
      // (see supabase-v2), so there is no update path to reconcile it here, and
      // a stale answer beats a dead end. Revisit if the apply form ever gains a
      // server-side draft.
      const isDuplicatePk =
        (pendingErr as { code?: string }).code === "23505" ||
        pendingErr.message.includes("pending_submissions_pkey");
      if (isDuplicatePk) {
        console.info(
          "[pending-write] pending already staged, treating as retry:",
          pendingId,
        );
        return { ok: true, pendingId };
      }
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
