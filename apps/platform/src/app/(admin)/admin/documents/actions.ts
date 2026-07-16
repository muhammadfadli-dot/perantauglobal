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

/**
 * Returns a 60-second signed URL to view the document file.
 *
 * Admin's own session is used (per fix #19) — the storage RLS policy
 * `docs_storage_select_own_or_admin` (migration 0010) grants SELECT to admins,
 * which is all `createSignedUrl` needs. No service role escalation required.
 *
 * PDP-critical: every call writes an admin_audit_log entry naming the admin,
 * the file_path requested, and request metadata (IP, UA). Audit insert
 * failure blocks URL generation — no untracked PII view.
 */
export async function getDocumentSignedUrl(filePath: string): Promise<string> {
  await assertAdmin();
  await logAdminAction("view_document", "candidate_document", filePath);
  const supabase = await createServerClient();
  const { data, error } = await supabase.storage
    .from("candidate-documents")
    .createSignedUrl(filePath, 60);
  if (error || !data) throw new Error(error?.message ?? "Gagal generate signed URL");
  return data.signedUrl;
}
