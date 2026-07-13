import { NextRequest, NextResponse } from "next/server";
import { supabaseV2 } from "@/lib/supabase-v2";

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
    };

    if (!validCvPath(body.pending_id, body.cv_path)) return noFit();

    const clientIp =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      null;

    const rpc = supabaseV2().rpc as unknown as (
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

    const { data, error } = await supabaseV2().functions.invoke("grade-cv-preview", {
      body: {
        cv_path: body.cv_path,
        cv_mime: body.cv_mime ?? null,
        position_slug: slug,
        answers: body.answers ?? {},
      },
      headers: { "x-preview-secret": process.env.CV_PREVIEW_SECRET },
    });

    const scored = Boolean(!error && data?.ok && data?.fit);

    // Telemetry (fire-and-forget): stamp fit_score + outcome onto the event row so
    // the gate threshold can be tuned from the real distribution (WS-6a). Never
    // blocks or delays the response.
    if (eventId != null) {
      const outcome = error ? "error" : scored ? "scored" : "no_fit";
      const fitScore =
        scored && typeof data.fit.fit_score === "number" ? data.fit.fit_score : null;
      void rpc("record_cv_preview_outcome", {
        p_event_id: eventId,
        p_fit_score: fitScore,
        p_outcome: outcome,
      }).catch(() => {});
    }

    if (!scored) return noFit();
    return NextResponse.json({ fit: data.fit });
  } catch {
    return noFit();
  }
}
