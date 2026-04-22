"use server";

import { revalidatePath } from "next/cache";
import { createServerClient, getSessionAndRole } from "@/lib/supabase-server";

const ANSWER_FIELDS = [
  "motivation",
  "earliest_start",
  "visa_status",
  "referral",
] as const;

export async function updateAnswers(
  applicationId: string,
  formData: FormData,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { session, role } = await getSessionAndRole();
  if (!session) return { ok: false, error: "Belum masuk." };
  if (role === "admin") return { ok: false, error: "Admin tidak boleh ubah lamaran kandidat." };

  const answers: Record<string, string> = {};
  for (const field of ANSWER_FIELDS) {
    const value = formData.get(field);
    if (typeof value === "string" && value.trim() !== "") {
      answers[field] = value.trim();
    }
  }

  const supabase = await createServerClient();

  // RLS on applications: user can update applications where candidate_id
  // joins to candidates.auth_user_id = auth.uid(). We include both WHERE
  // clauses for defense-in-depth.
  const { data: cand } = await supabase
    .from("candidates")
    .select("id")
    .eq("auth_user_id", session.userId)
    .single();
  const candidate = cand as { id: string } | null;
  if (!candidate) return { ok: false, error: "Kandidat tidak ditemukan." };

  const { error } = await supabase
    .from("applications")
    .update({ answers } as never)
    .eq("id", applicationId)
    .eq("candidate_id", candidate.id);

  if (error) return { ok: false, error: error.message };

  revalidatePath(`/applications/${applicationId}`);
  revalidatePath("/dashboard");
  return { ok: true };
}
