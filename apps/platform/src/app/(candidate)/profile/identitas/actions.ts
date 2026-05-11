"use server";

import { revalidatePath } from "next/cache";
import { createServerClient, getSessionAndRole } from "@/lib/supabase-server";

const EDUCATION_VALUES = ["sma", "smk", "d3", "s1", "s2"] as const;
const GENDER_VALUES = ["male", "female"] as const;

type Result = { ok: true } | { ok: false; error: string };

export async function updateIdentity(formData: FormData): Promise<Result> {
  const { session, role } = await getSessionAndRole();
  if (!session) return { ok: false, error: "Belum masuk." };
  if (role === "admin") return { ok: false, error: "Admin tidak boleh ubah data kandidat." };

  const fullName = String(formData.get("full_name") ?? "").trim();
  const phoneRaw = String(formData.get("phone") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const birthDate = String(formData.get("birth_date") ?? "").trim();
  const gender = String(formData.get("gender") ?? "").trim();
  const education = String(formData.get("education") ?? "").trim();

  if (fullName.length < 2) {
    return { ok: false, error: "Nama lengkap minimal 2 karakter." };
  }
  // Normalize phone to +62 format; accept "08..." or "+62..." input.
  let phone: string | null = null;
  if (phoneRaw) {
    const digits = phoneRaw.replace(/[^0-9+]/g, "");
    if (digits.startsWith("+")) phone = digits;
    else if (digits.startsWith("0")) phone = "+62" + digits.slice(1);
    else if (digits.startsWith("62")) phone = "+" + digits;
    else phone = "+62" + digits;
    if (!/^\+?[0-9]{8,15}$/.test(phone)) {
      return { ok: false, error: "Nomor HP tidak valid." };
    }
  }
  if (birthDate && !/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) {
    return { ok: false, error: "Tanggal lahir tidak valid." };
  }
  if (gender && !GENDER_VALUES.includes(gender as (typeof GENDER_VALUES)[number])) {
    return { ok: false, error: "Pilihan gender tidak valid." };
  }
  if (
    education &&
    !EDUCATION_VALUES.includes(education as (typeof EDUCATION_VALUES)[number])
  ) {
    return { ok: false, error: "Pilihan pendidikan tidak valid." };
  }

  const supabase = await createServerClient();
  const { data: cand } = await supabase
    .from("candidates")
    .select("id")
    .eq("auth_user_id", session.userId)
    .single();
  const candidate = cand as { id: string } | null;
  if (!candidate) return { ok: false, error: "Kandidat tidak ditemukan." };

  const { error } = await supabase
    .from("candidates")
    .update({
      full_name: fullName,
      phone: phone || null,
      city: city || null,
      birth_date: birthDate || null,
      gender: gender || null,
      education: education || null,
    } as never)
    .eq("id", candidate.id);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/profile");
  revalidatePath("/profile/identitas");
  revalidatePath("/dashboard");
  return { ok: true };
}
