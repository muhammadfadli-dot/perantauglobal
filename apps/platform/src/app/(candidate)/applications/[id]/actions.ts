"use server";

import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { createServerClient, getSessionAndRole } from "@/lib/supabase-server";

/**
 * Re-run CV-to-position fit for an application after its answers change, so
 * contradiction flags + fit_score don't go stale (audit fix 2026-06-10). Runs
 * after the response (non-blocking); grade-cv lets a candidate re-fit their OWN
 * application. Best-effort — never surfaced to the candidate.
 */
function triggerRefit(
  supabase: Awaited<ReturnType<typeof createServerClient>>,
  applicationId: string,
) {
  after(async () => {
    try {
      await supabase.functions.invoke("grade-cv", { body: { application_id: applicationId } });
    } catch {
      // best-effort
    }
  });
}

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

  triggerRefit(supabase, applicationId);
  revalidatePath(`/applications/${applicationId}`);
  revalidatePath("/dashboard");
  return { ok: true };
}

/**
 * Set a single answer on an application — merges into applications.answers
 * JSONB. Used by the inline answer form on /lengkapi for per-field saves
 * as the candidate fills out.
 *
 * Value can be:
 *   - string (radio/select/text/textarea/number)
 *   - string[] (multiselect)
 *   - null (clear)
 *
 * For "file" field type, this server action is NOT the path — those upload
 * to candidate_documents directly via the existing DocumentUploadModal
 * with application_id set (per Fase 5 model).
 */
export async function setApplicationAnswer(
  applicationId: string,
  fieldKey: string,
  value: string | string[] | null,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { session, role } = await getSessionAndRole();
  if (!session) return { ok: false, error: "Belum masuk." };
  if (role === "admin") return { ok: false, error: "Admin tidak boleh ubah lamaran kandidat." };

  if (typeof fieldKey !== "string" || fieldKey.length === 0 || fieldKey.length > 64) {
    return { ok: false, error: "field_key invalid." };
  }

  const supabase = await createServerClient();

  const { data: cand } = await supabase
    .from("candidates")
    .select("id")
    .eq("auth_user_id", session.userId)
    .single();
  const candidate = cand as { id: string } | null;
  if (!candidate) return { ok: false, error: "Kandidat tidak ditemukan." };

  // Fetch current answers, merge, write back. JSONB merge via PostgREST
  // would be faster but requires a custom RPC; this two-roundtrip is fine
  // for a single-field save.
  const { data: appRow, error: fetchErr } = await supabase
    .from("applications")
    .select("answers")
    .eq("id", applicationId)
    .eq("candidate_id", candidate.id)
    .single();
  if (fetchErr) return { ok: false, error: fetchErr.message };

  const current = ((appRow as { answers: Record<string, unknown> | null } | null)?.answers ??
    {}) as Record<string, unknown>;

  let nextAnswers: Record<string, unknown>;
  if (value === null) {
    const { [fieldKey]: _removed, ...rest } = current;
    void _removed;
    nextAnswers = rest;
  } else {
    nextAnswers = { ...current, [fieldKey]: value };
  }

  const { error } = await supabase
    .from("applications")
    .update({ answers: nextAnswers } as never)
    .eq("id", applicationId)
    .eq("candidate_id", candidate.id);
  if (error) return { ok: false, error: error.message };

  triggerRefit(supabase, applicationId);
  revalidatePath(`/applications/${applicationId}`);
  revalidatePath(`/applications/${applicationId}/lengkapi`);
  return { ok: true };
}
