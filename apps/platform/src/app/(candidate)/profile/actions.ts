"use server";

import { revalidatePath } from "next/cache";
import { createServerClient, getSessionAndRole } from "@/lib/supabase-server";

const PROFILE_FIELDS = [
  "jlpt_level",
  "sim_type",
  "driving_years",
  "str_active",
  "english_level",
  "experience_years",
  "care_certification",
  "food_certification",
  "experience_type",
  "has_lpk",
] as const;

type ProfileField = (typeof PROFILE_FIELDS)[number];

export async function updateProfile(formData: FormData): Promise<
  { ok: true } | { ok: false; error: string }
> {
  const { session, role } = await getSessionAndRole();
  if (!session) return { ok: false, error: "Belum masuk." };
  if (role === "admin") return { ok: false, error: "Admin tidak boleh ubah profil kandidat." };

  const credentials: Record<string, string> = {};
  for (const field of PROFILE_FIELDS) {
    const value = formData.get(field);
    if (typeof value === "string" && value.trim() !== "") {
      credentials[field] = value.trim();
    }
  }

  const supabase = await createServerClient();
  const { data: existingRaw } = await supabase
    .from("candidates")
    .select("profile_data")
    .eq("auth_user_id", session.userId)
    .single();

  const existing = existingRaw as { profile_data: unknown } | null;
  const existingData = (existing?.profile_data ?? {}) as Record<string, unknown>;
  const existingCredentials = (existingData.credentials ?? {}) as Record<string, string>;
  const existingOnboarding = (existingData.onboarding ?? {}) as Record<string, unknown>;

  const nextProfileData = {
    schema_version: 1,
    credentials: { ...existingCredentials, ...credentials },
    onboarding: {
      ...existingOnboarding,
      completed_at: existingOnboarding.completed_at ?? new Date().toISOString(),
    },
  };

  const { error } = await supabase
    .from("candidates")
    .update({ profile_data: nextProfileData } as never)
    .eq("auth_user_id", session.userId);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/profile");
  revalidatePath("/dashboard");
  revalidatePath("/explore");
  return { ok: true };
}

export type { ProfileField };
export { PROFILE_FIELDS };
