"use server";

import { revalidatePath } from "next/cache";
import { createServiceRoleClient, requireAdmin } from "@/lib/supabase-server";

async function assertAdmin() {
  return requireAdmin("Unauthorized");
}

/**
 * Admin "Grade ulang CV" — re-runs the grade-cv edge function for a candidate:
 * re-extract the CV together with their uploaded credential docs (sertifikat,
 * ijazah, SIM, …) and re-fit their non-terminal applications against each
 * position's real requirements.
 *
 * Invoked with the SERVICE ROLE client on purpose: grade-cv decides "privileged"
 * from the JWT `role` claim, and admin sessions carry role=authenticated (the
 * admin-role auth hook isn't wired — see supabase-server.getSessionAndRole), so
 * a plain cookie-session invoke would 403. createServiceRoleClient is the
 * sanctioned helper for admin actions that need elevation; assertAdmin() gates it.
 */
export async function reGradeCv(
  candidateId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  await assertAdmin();

  let admin: ReturnType<typeof createServiceRoleClient>;
  try {
    admin = createServiceRoleClient();
  } catch {
    return { ok: false, error: "Service role belum dikonfigurasi di server ini." };
  }

  // Most recent CV document for this candidate.
  const { data: doc } = await admin
    .from("candidate_documents")
    .select("id")
    .eq("candidate_id", candidateId)
    .eq("doc_type", "cv")
    .order("uploaded_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!doc) return { ok: false, error: "Kandidat belum punya CV untuk dinilai." };

  const { data, error } = await admin.functions.invoke("grade-cv", {
    body: { document_id: (doc as { id: string }).id },
  });
  if (error) {
    return { ok: false, error: `Gagal grade CV: ${error.message ?? "tidak diketahui"}` };
  }
  const res = data as { ok?: boolean; status?: string; error?: string } | null;
  if (res && res.ok === false) {
    return { ok: false, error: res.error ?? `Penilaian gagal (status: ${res.status ?? "?"})` };
  }

  revalidatePath(`/admin/candidates/${candidateId}`, "layout");
  return { ok: true };
}
