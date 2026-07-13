import { NextRequest, NextResponse } from "next/server";
import { supabaseV2 } from "@/lib/supabase-v2";

/**
 * Mint a signed upload URL for the apply-step CV upload (WS-5).
 *
 * The browser used to write straight to the `pending-cv` bucket with the
 * publishable key (an open anon-INSERT surface, un-rate-limited). This route
 * moves that behind the server: per-IP rate limit (migration 0098) + proxy to
 * the `issue-cv-upload-url` edge fn (which holds the service role and mints a
 * signed upload URL). The browser then uploads with `uploadToSignedUrl`, which
 * bypasses RLS — so the anon-INSERT policy can be dropped (0099).
 *
 * Feature-flagged: no CV_PREVIEW_SECRET → `{ ok: false }`, and the client falls
 * back to a direct upload (dev/preview, or a safe rollback while the policy is
 * still in place).
 *
 * No Turnstile here (deliberate deviation from the WS-5 spec): this is the CV
 * upload, and a CV is required to submit, so a fail-CLOSED Turnstile check would
 * kill legitimate applications whose widget was blocked — unlike cv-preview,
 * whose gate is fail-open. The residual risk (scripted storage flood) is small
 * and already bounded: per-IP rate limit (10/10min, migration 0098), 5 MB + MIME
 * caps on the bucket, and the 48 h orphan purge. The expensive LLM path stays
 * Turnstile-gated at cv-preview, so a flood here burns only transient storage.
 */

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SAFE_EXT = new Set(["pdf", "jpg", "jpeg", "png", "heic", "heif", "webp"]);

const off = () => NextResponse.json({ ok: false });

export async function POST(request: NextRequest) {
  try {
    if (!process.env.CV_PREVIEW_SECRET) return off(); // feature off → client falls back

    const body = (await request.json().catch(() => ({}))) as { pending_id?: string; ext?: string };
    const pendingId = typeof body.pending_id === "string" ? body.pending_id : "";
    const ext = typeof body.ext === "string" ? body.ext.toLowerCase() : "";
    if (!UUID_RE.test(pendingId) || !SAFE_EXT.has(ext)) return off();

    const clientIp =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      null;

    const db = supabaseV2();
    // Bind rpc to the client (a detached method loses `this` and throws).
    const rpc = db.rpc.bind(db) as unknown as (
      fn: string,
      args: Record<string, unknown>,
    ) => Promise<{ data: boolean | null; error: { message: string } | null }>;
    try {
      const { data: underLimit, error } = await rpc("check_cv_upload_rate_limit", { p_ip: clientIp });
      if (!error && underLimit === false) {
        return NextResponse.json({ ok: false, error: "rate" }, { status: 429 });
      }
    } catch {
      // ignore — fail open
    }

    const { data, error } = await db.functions.invoke("issue-cv-upload-url", {
      body: { pending_id: pendingId, ext },
      headers: { "x-preview-secret": process.env.CV_PREVIEW_SECRET },
    });
    if (error || !data?.ok || !data?.token) return off();

    return NextResponse.json({ ok: true, token: data.token, path: data.path });
  } catch {
    return off();
  }
}
