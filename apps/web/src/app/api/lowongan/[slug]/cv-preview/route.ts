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

    // Per-IP rate limit (migration 0094). Fail-open if the RPC errors / isn't
    // applied yet, so a transient issue never blocks a legit applicant.
    try {
      const rpc = supabaseV2().rpc as unknown as (
        fn: string,
        args: Record<string, unknown>,
      ) => Promise<{ data: boolean | null; error: { message: string } | null }>;
      const { data: underLimit, error } = await rpc("check_cv_preview_rate_limit", { p_ip: clientIp });
      if (!error && underLimit === false) return noFit();
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

    if (error || !data?.ok || !data?.fit) return noFit();
    return NextResponse.json({ fit: data.fit });
  } catch {
    return noFit();
  }
}
