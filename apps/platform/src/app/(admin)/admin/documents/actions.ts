"use server";

import { revalidatePath } from "next/cache";
import { createServerClient, getSessionAndRole, createServiceRoleClient } from "@/lib/supabase-server";

async function assertAdmin() {
  const { session, role } = await getSessionAndRole();
  if (!session || role !== "admin") throw new Error("Forbidden");
  return session;
}

export async function verifyDocument(id: string) {
  const session = await assertAdmin();
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

/** Returns a 60-second signed URL to view the document file. */
export async function getDocumentSignedUrl(filePath: string): Promise<string> {
  await assertAdmin();
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase.storage
    .from("candidate-documents")
    .createSignedUrl(filePath, 60);
  if (error || !data) throw new Error(error?.message ?? "Gagal generate signed URL");
  return data.signedUrl;
}
