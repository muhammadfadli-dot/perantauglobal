"use client";

/**
 * Browser anon Supabase client - upload CV staged ANON ke bucket pending-cv
 * SEBELUM akun jadi (Fase 2 CV grader, depan funnel). Blind write-only:
 * bucket policy cuma anon INSERT scoped pending/<uuid>/ (migration 0078), gak
 * ada SELECT/UPDATE/DELETE buat anon -> file gak bisa dibaca/ditimpa orang lain.
 *
 * Butuh env NEXT_PUBLIC (di-inline ke bundle saat build):
 *   - NEXT_PUBLIC_SUPABASE_URL_V2
 *   - NEXT_PUBLIC_SUPABASE_ANON_KEY_V2   (ANON, BUKAN service-role)
 * (apps/web yang lain pakai SUPABASE_URL_V2/SUPABASE_ANON_KEY_V2 server-side;
 *  upload dari browser butuh varian NEXT_PUBLIC.)
 *
 * Kalau env belum di-set, uploadPendingCv balikin {ok:false} dan caller fallback
 * ke submit tanpa CV (jangan blok pendaftaran).
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const PENDING_CV_BUCKET = "pending-cv";
const MAX_CV_BYTES = 5 * 1024 * 1024; // 5MB, mirror cap bucket (0078) + 0010
const CV_MIME = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/heic",
  "image/heif",
  "image/webp",
]);
const MIME_EXT: Record<string, string> = {
  "application/pdf": "pdf",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/heic": "heic",
  "image/heif": "heif",
  "image/webp": "webp",
};
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

let _client: SupabaseClient | null = null;
function client(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL_V2;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_V2;
  if (!url || !key) return null;
  if (!_client) _client = createClient(url, key, { auth: { persistSession: false } });
  return _client;
}

export function isCvUploadConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL_V2 && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_V2,
  );
}

export function validateCvFile(file: File): { ok: true } | { ok: false; error: string } {
  if (!CV_MIME.has(file.type)) {
    return { ok: false, error: "Format CV harus PDF atau gambar (JPG/PNG/HEIC/WEBP)." };
  }
  if (file.size === 0) return { ok: false, error: "File CV kosong." };
  if (file.size > MAX_CV_BYTES) return { ok: false, error: "Ukuran CV maksimal 5MB." };
  return { ok: true };
}

export type CvUploadResult =
  | { ok: true; path: string; mime: string; size: number }
  | { ok: false; error: string };

/** Map raw Supabase Storage errors to friendly Bahasa Indonesia messages. */
function friendlyUploadError(msg: string): string {
  const m = (msg || "").toLowerCase();
  if (m.includes("exceeded") && m.includes("size")) return "Ukuran CV maksimal 5MB.";
  if (m.includes("mime") || m.includes("not allowed") || m.includes("invalid"))
    return "Format CV harus PDF atau gambar (JPG/PNG/HEIC/WEBP).";
  if (m.includes("already exists")) return "Coba unggah ulang CV kamu sebentar ya.";
  if (m.includes("network") || m.includes("fetch") || m.includes("load failed"))
    return "Gagal mengunggah CV. Cek koneksi internet lalu coba lagi.";
  return "Gagal mengunggah CV. Coba lagi sebentar ya.";
}

/** Ask the server to mint a signed upload URL for this pending path (WS-5). */
async function mintSignedUpload(
  slug: string,
  pendingId: string,
  ext: string,
): Promise<{ token: string; path: string } | null> {
  try {
    const res = await fetch(`/api/lowongan/${slug}/cv-upload-url`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pending_id: pendingId, ext }),
    });
    const data = res.ok ? await res.json().catch(() => null) : null;
    if (data?.ok && typeof data.token === "string" && typeof data.path === "string") {
      return { token: data.token, path: data.path };
    }
  } catch {
    // ignore — caller falls back to a direct upload
  }
  return null;
}

/**
 * Upload CV ke pending-cv/pending/<pendingId>/cv.<ext>. pendingId WAJIB sama
 * dengan PK pending_submissions yang nanti dibikin server (path === PK), biar
 * trigger + cv-materialize bisa nyambungin.
 *
 * WS-5: pakai signed upload URL yang di-mint server (rate-limited) kalau `slug`
 * ada + route-nya aktif. Kalau nggak (dev/preview tanpa secret, atau error),
 * fallback ke direct anon upload. Setelah policy anon-INSERT dicabut (0099),
 * jalur signed URL yang jadi satu-satunya yang works.
 */
export async function uploadPendingCv(
  pendingId: string,
  file: File,
  slug?: string,
): Promise<CvUploadResult> {
  const v = validateCvFile(file);
  if (!v.ok) return v;
  if (!UUID_RE.test(pendingId)) return { ok: false, error: "ID sesi tidak valid." };
  const c = client();
  if (!c) return { ok: false, error: "Upload CV belum tersedia, lanjut tanpa CV dulu." };

  const ext = MIME_EXT[file.type] ?? "pdf";
  const path = `pending/${pendingId}/cv.${ext}`;

  // Preferred path: server-minted signed URL (no open anon INSERT).
  if (slug) {
    const signed = await mintSignedUpload(slug, pendingId, ext);
    if (signed) {
      const { error } = await c.storage
        .from(PENDING_CV_BUCKET)
        .uploadToSignedUrl(signed.path, signed.token, file, { contentType: file.type });
      if (!error) return { ok: true, path: signed.path, mime: file.type, size: file.size };
      // fall through to direct upload on a signed-URL upload error
    }
  }

  // Fallback: direct anon upload (works only while the 0078 anon-INSERT policy
  // is still in place; after 0099 this fails and returns a friendly error).
  const { error } = await c.storage.from(PENDING_CV_BUCKET).upload(path, file, {
    upsert: false,
    contentType: file.type,
  });
  if (error) return { ok: false, error: friendlyUploadError(error.message) };
  return { ok: true, path, mime: file.type, size: file.size };
}
