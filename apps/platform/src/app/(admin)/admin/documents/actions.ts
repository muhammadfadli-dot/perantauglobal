"use server";

import { revalidatePath } from "next/cache";
import { createServerClient, requireAdmin } from "@/lib/supabase-server";
import { logAdminAction } from "@/lib/audit-log";

async function assertAdmin() {
  return requireAdmin("Forbidden");
}

export async function verifyDocument(id: string) {
  const session = await assertAdmin();
  await logAdminAction("verify_document", "candidate_document", id);
  const supabase = await createServerClient();
  const { error } = await supabase
    .from("candidate_documents")
    .update({
      verified: true,
      verified_at: new Date().toISOString(),
      verified_by: session.userId,
      rejected_at: null,
      rejected_by: null,
      rejected_reason: null,
    } as never)
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/documents");
}

export async function rejectDocument(id: string, reason: string) {
  const session = await assertAdmin();
  if (!reason.trim()) throw new Error("Alasan tolak wajib diisi.");
  await logAdminAction("reject_document", "candidate_document", id, {
    reason: reason.trim().slice(0, 500),
  });
  const supabase = await createServerClient();
  const { error } = await supabase
    .from("candidate_documents")
    .update({
      verified: false,
      verified_at: null,
      verified_by: null,
      rejected_at: new Date().toISOString(),
      rejected_by: session.userId,
      rejected_reason: reason.trim(),
    } as never)
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/documents");
}

export type DocUrlResult =
  | { ok: true; url: string }
  | { ok: false; message: string };

/**
 * Returns a 60-second signed URL to view the document file, or a clear message
 * when the file can't be opened.
 *
 * Returns a structured result instead of throwing on a missing object: a thrown
 * error is masked to a generic "digest" string in production, which is exactly
 * the crash admins saw for CVs whose storage object was missing (2026-07-23).
 *
 * A CV that never materialized still points at the pending-cv staging bucket
 * (path "pending/<id>/cv.*"); everything else lives in candidate-documents.
 * BOTH are signed with the ADMIN'S OWN SESSION. Storage RLS already allows it
 * on both buckets: `docs_storage_select_own_or_admin` (migration 0010) and
 * `pending_cv_admin_all` — FOR ALL ... USING (bucket_id = 'pending-cv' AND
 * is_admin()) — migration 0078.
 *
 * The pending branch used to call createServiceRoleClient(). That was wrong on
 * two counts, and it is what admins actually hit (2026-08-10, Zalfa):
 *   1. Factually stale. The claim "admin sessions can't SELECT there" stopped
 *      being true the moment migration 0078 added pending_cv_admin_all.
 *   2. It THREW instead of returning a message. createServiceRoleClient()
 *      raises when SUPABASE_SERVICE_ROLE_KEY is absent, and that key is not set
 *      on the platform's Vercel project. The throw escaped this function's
 *      careful ok:false contract and surfaced to the admin as the opaque
 *      "An error occurred in the Server Components render" (7 occurrences,
 *      route /admin/candidates/[id], 27 Jul - 11 Agu). KTP and formal photo on
 *      the same profile opened fine because they never take this branch.
 * Using the admin session removes the secret from this path entirely: least
 * privilege, and one less environment variable that can silently be missing.
 *
 * PDP-critical: every call writes an admin_audit_log entry naming the admin,
 * the file_path requested, and request metadata (IP, UA). Audit insert
 * failure still blocks URL generation, so there is no untracked PII view.
 */
export async function getDocumentSignedUrl(
  filePath: string,
): Promise<DocUrlResult> {
  await assertAdmin();
  await logAdminAction("view_document", "candidate_document", filePath);

  const isPending = filePath.startsWith("pending/");
  const bucket = isPending ? "pending-cv" : "candidate-documents";
  const client = await createServerClient();

  const { data, error } = await client.storage
    .from(bucket)
    .createSignedUrl(filePath, 60);
  if (error || !data) {
    return {
      ok: false,
      message: isPending
        ? "CV ini belum selesai diproses saat pendaftaran. Minta kandidat upload ulang CV lewat profil."
        : "File tidak ditemukan di penyimpanan. Kemungkinan gagal diupload, minta kandidat upload ulang.",
    };
  }
  return { ok: true, url: data.signedUrl };
}
