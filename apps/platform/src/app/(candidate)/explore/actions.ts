"use server";

import { revalidatePath } from "next/cache";
import { createServerClient, getSessionAndRole } from "@/lib/supabase-server";

type ApplyResult =
  | { ok: true; applicationId: string; alreadyApplied?: boolean }
  | { ok: false; error: string };

export async function applyToPosition(positionSlug: string): Promise<ApplyResult> {
  const { session, role } = await getSessionAndRole();
  if (!session) return { ok: false, error: "Belum masuk." };
  if (role === "admin") return { ok: false, error: "Admin tidak bisa melamar." };

  const supabase = await createServerClient();

  const { data: cand } = await supabase
    .from("candidates")
    .select("id")
    .eq("auth_user_id", session.userId)
    .single();
  const candidate = cand as { id: string } | null;
  if (!candidate) return { ok: false, error: "Profil kandidat belum tersedia." };

  const { data: position } = await supabase
    .from("positions")
    .select("slug, active")
    .eq("slug", positionSlug)
    .single();
  const pos = position as { slug: string; active: boolean } | null;
  if (!pos || !pos.active) return { ok: false, error: "Posisi tidak aktif." };

  const { data: inserted, error } = await supabase
    .from("applications")
    .insert({
      candidate_id: candidate.id,
      position_slug: positionSlug,
      pipeline_stage: "applied",
      answers: {},
    } as never)
    .select("id")
    .single();

  if (error) {
    // Postgres unique violation = already applied; resolve to existing row.
    if (error.code === "23505") {
      const { data: existing } = await supabase
        .from("applications")
        .select("id")
        .eq("candidate_id", candidate.id)
        .eq("position_slug", positionSlug)
        .single();
      const row = existing as { id: string } | null;
      if (row) {
        return { ok: true, applicationId: row.id, alreadyApplied: true };
      }
    }
    return { ok: false, error: error.message };
  }

  const row = inserted as { id: string } | null;
  if (!row) return { ok: false, error: "Gagal membuat lamaran." };

  revalidatePath("/dashboard");
  revalidatePath("/explore");
  return { ok: true, applicationId: row.id };
}
