import type { NextRequest } from "next/server";
import { mintCvUploadUrl } from "@/lib/cv-upload-url";

/**
 * Signed upload URL untuk CV di langkah lamaran kerja.
 *
 * Isinya pindah ke `lib/cv-upload-url.ts` 4 Agustus 2026 supaya jalur akademi
 * memakai handler yang persis sama (rate limit, feature flag, dan validasi
 * ekstensi yang sama). Route ini tinggal jadi pintunya. Alasan lengkap kenapa
 * tanpa Turnstile dan kenapa feature-flagged ada di lib itu.
 */
export async function POST(request: NextRequest) {
  return mintCvUploadUrl(request);
}
