import { NextRequest, NextResponse } from "next/server";
import { supabaseV2 } from "@/lib/supabase-v2";

/**
 * Menerbitkan signed upload URL untuk CV yang di-stage di depan funnel (WS-5).
 *
 * Dulu browser menulis langsung ke bucket `pending-cv` dengan publishable key
 * (permukaan anon-INSERT terbuka, tanpa rate limit). Handler ini memindahkannya
 * ke belakang server: rate limit per IP (migration 0098) + proxy ke edge fn
 * `issue-cv-upload-url` (yang memegang service role dan menerbitkan signed
 * upload URL). Browser lalu mengunggah lewat `uploadToSignedUrl`, yang melewati
 * RLS, sehingga policy anon-INSERT bisa dicabut (0099).
 *
 * Feature-flagged: tanpa CV_PREVIEW_SECRET balasannya `{ ok: false }`, dan klien
 * jatuh ke direct upload (dev/preview, atau rollback aman selama policy lama
 * masih terpasang).
 *
 * Tanpa Turnstile (penyimpangan sengaja dari spec WS-5): ini upload CV, dan CV
 * wajib untuk submit, jadi cek Turnstile yang fail-CLOSED akan mematikan lamaran
 * sah yang widget-nya keblokir. Risiko sisanya (banjir storage lewat script)
 * kecil dan sudah dibatasi: rate limit per IP (10 per 10 menit, migration 0098),
 * batas 5 MB + MIME di bucket, dan purge orphan 48 jam.
 *
 * Handler ini SENGAJA tidak melihat slug sama sekali. Yang dibutuhkan cuma
 * `pending_id` dan ekstensi, karena path upload ditentukan PK
 * pending_submissions, bukan produk yang dilamar. Itu sebabnya route lowongan
 * dan route akademi bisa memakai satu handler yang sama; menyalinnya jadi dua
 * berarti dua tempat yang harus ingat rate limit dan feature flag yang sama.
 */

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SAFE_EXT = new Set(["pdf", "jpg", "jpeg", "png", "heic", "heif", "webp"]);

const off = () => NextResponse.json({ ok: false });

export async function mintCvUploadUrl(request: NextRequest) {
  try {
    if (!process.env.CV_PREVIEW_SECRET) return off(); // fitur mati, klien fallback

    const body = (await request.json().catch(() => ({}))) as {
      pending_id?: string;
      ext?: string;
    };
    const pendingId = typeof body.pending_id === "string" ? body.pending_id : "";
    const ext = typeof body.ext === "string" ? body.ext.toLowerCase() : "";
    if (!UUID_RE.test(pendingId) || !SAFE_EXT.has(ext)) return off();

    const clientIp =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      null;

    const db = supabaseV2();
    // Bind rpc ke client (method yang dilepas kehilangan `this` lalu throw).
    const rpc = db.rpc.bind(db) as unknown as (
      fn: string,
      args: Record<string, unknown>,
    ) => Promise<{ data: boolean | null; error: { message: string } | null }>;
    try {
      const { data: underLimit, error } = await rpc("check_cv_upload_rate_limit", {
        p_ip: clientIp,
      });
      if (!error && underLimit === false) {
        return NextResponse.json({ ok: false, error: "rate" }, { status: 429 });
      }
    } catch {
      // abaikan, fail open
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
