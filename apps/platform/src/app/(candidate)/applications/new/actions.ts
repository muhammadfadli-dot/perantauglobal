"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerClient, getSessionAndRole } from "@/lib/supabase-server";

export type SubmitInput = {
  position_slug: string;
  job_order_id: string | null;
  answers: Record<string, unknown>;
};

export async function submitApplication(input: SubmitInput) {
  const { session, role } = await getSessionAndRole();
  if (!session) throw new Error("Belum masuk");
  if (role === "admin") throw new Error("Admin tidak boleh apply");

  const supabase = await createServerClient();

  const { data: candData } = await supabase
    .from("candidates")
    .select("id")
    .eq("auth_user_id", session.userId)
    .single();
  const candidate = candData as { id: string } | null;
  if (!candidate) throw new Error("Profil kandidat tidak ditemukan");

  // Idempotent — if already exists, redirect to detail
  const { data: existing } = await supabase
    .from("applications")
    .select("id")
    .eq("candidate_id", candidate.id)
    .eq("position_slug", input.position_slug)
    .maybeSingle();
  if (existing) {
    redirect(`/applications/${(existing as { id: string }).id}`);
  }

  const { data: created, error } = await supabase
    .from("applications")
    .insert({
      candidate_id: candidate.id,
      position_slug: input.position_slug,
      job_order_id: input.job_order_id,
      pipeline_stage: "applied",
      answers: input.answers,
    } as never)
    .select("id")
    .single();
  if (error) throw new Error(error.message);

  revalidatePath("/dashboard");
  revalidatePath("/applications");
  revalidatePath("/explore");
  redirect(`/applications/${(created as { id: string }).id}/welcome`);
}
