// issue-cv-upload-url — mint a signed upload URL for the apply-step CV upload.
//
// verify_jwt=FALSE, gated on the shared CV_PREVIEW_SECRET (same secret as
// grade-cv-preview). The apps/web route holds the secret + rate-limits, then
// proxies here. Returns { token, path } the browser uses with
// storage.uploadToSignedUrl — so the open anon-INSERT policy on pending-cv can
// be removed (migration 0099) and every upload rides a server-minted,
// rate-limited URL instead of the publishable-key-embedded direct path.
//
// The signed URL bypasses RLS (that's the point), so it keeps working after the
// anon policy is dropped. Path is strictly `pending/<uuid>/cv.<ext>` — the same
// shape the trigger + cv-materialize expect.

import { createClient } from "npm:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const PREVIEW_SECRET = Deno.env.get("CV_PREVIEW_SECRET") ?? "";

const CORS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-preview-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", ...CORS } });

const svc = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SAFE_EXT = new Set(["pdf", "jpg", "jpeg", "png", "heic", "heif", "webp"]);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "POST only" }, 405);
  if (!PREVIEW_SECRET || req.headers.get("x-preview-secret") !== PREVIEW_SECRET) {
    return json({ error: "forbidden" }, 403);
  }

  const body = await req.json().catch(() => ({}));
  const pendingId = String(body.pending_id ?? "");
  const ext = String(body.ext ?? "").toLowerCase();
  if (!UUID_RE.test(pendingId) || !SAFE_EXT.has(ext)) return json({ error: "bad input" }, 400);

  const path = `pending/${pendingId}/cv.${ext}`;
  const { data, error } = await svc.storage.from("pending-cv").createSignedUploadUrl(path);
  if (error || !data?.token) return json({ error: `mint failed: ${error?.message ?? "no token"}` }, 500);

  return json({ ok: true, token: data.token, path: data.path ?? path });
});
