"use server";

import { revalidatePath } from "next/cache";
import { createServerClient, getSessionAndRole } from "@/lib/supabase-server";
import { logAdminAction } from "@/lib/audit-log";

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
  await logAdminAction("invite_admin", "admin_user", cleaned, {
    has_notes: Boolean(notes && notes.trim()),
  });
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
  const cleaned = email.toLowerCase();
  if (session.email && session.email.toLowerCase() === cleaned) {
    throw new Error("Kamu tidak bisa hapus akun sendiri.");
  }

  const supabase = await createServerClient();

  // Protect founder/bootstrap accounts: rows with added_by NULL were not invited
  // through this UI (they bootstrapped the allowlist), so they can't be removed here.
  // This stops any of the N admins from deleting the founder without needing an
  // is_owner schema column.
  const { data: target, error: targetErr } = await supabase
    .from("admin_users")
    .select("email, added_by")
    .eq("email", email)
    .maybeSingle();
  if (targetErr) throw new Error(targetErr.message);
  if (!target) throw new Error("Admin tidak ditemukan.");
  if ((target as { added_by: string | null }).added_by == null) {
    throw new Error("Akun owner/founder tidak bisa dihapus dari sini.");
  }

  // Anti-lockout: never remove the last remaining admin.
  const { count } = await supabase
    .from("admin_users")
    .select("*", { count: "exact", head: true });
  if ((count ?? 0) <= 1) {
    throw new Error("Tidak bisa hapus admin terakhir.");
  }

  await logAdminAction("remove_admin", "admin_user", cleaned);
  const { error } = await supabase.from("admin_users").delete().eq("email", email);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/team");
}
