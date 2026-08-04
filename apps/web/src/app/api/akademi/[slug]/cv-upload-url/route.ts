import type { NextRequest } from "next/server";
import { mintCvUploadUrl } from "@/lib/cv-upload-url";

/**
 * Signed upload URL untuk CV di pendaftaran Akademi Perantau.
 *
 * Ada karena Ifa (PO) meminta 3 Agustus 2026 kandidat Sertifikat Perantau
 * Barista bisa mengunggah CV saat mendaftar, bahan screening yang sebelumnya
 * cuma dimiliki jalur lamaran kerja. Jalurnya sama persis dengan lowongan:
 * file di-stage anon ke `pending-cv/pending/<pendingId>/cv.*`, `pendingId` sama
 * dengan PK pending_submissions, lalu trigger `handle_new_auth_user` membuat
 * baris candidate_documents dan `cv-materialize` memindahkan filenya. Blok CV di
 * trigger itu tidak melihat intent sama sekali, jadi pendaftaran akademi ikut
 * tertangani tanpa perubahan skema.
 */
export async function POST(request: NextRequest) {
  return mintCvUploadUrl(request);
}
