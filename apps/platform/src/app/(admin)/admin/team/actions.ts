"use server";

import { revalidatePath } from "next/cache";
import { createServerClient, getSessionAndRole } from "@/lib/supabase-server";

async function assertAdmin() {
  const { session, role } = await getSessionAndRole();
  if (!session || role !== "admin") throw new Error("Forbidden");
  return session;
}

export async function inviteAdmin(email: string, notes?: string) {
  const session = await assertAdmin();
  const cleaned = email.trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(cleaned)) {
    throw new Error("Email tidak valid.");
  }
  const supabase = await createServerClient();
  const { error } = await supabase.from("admin_users").insert({
    email: cleaned,
    notes: notes ?? null,
    added_by: session.userId,
  } as never);
  if (error) {
    if (error.code === "23505") throw new Error("Email itu sudah ada di daftar admin.");
    throw new Error(error.message);
  }
  revalidatePath("/admin/team");
}

export async function removeAdmin(email: string) {
  const session = await assertAdmin();
  if (session.email && session.email.toLowerCase() === email.toLowerCase()) {
    throw new Error("Kamu tidak bisa hapus akun sendiri.");
  }
  const supabase = await createServerClient();
  const { error } = await supabase.from("admin_users").delete().eq("email", email);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/team");
}
