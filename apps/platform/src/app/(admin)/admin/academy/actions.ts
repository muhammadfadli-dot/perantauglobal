"use server";

import { revalidatePath } from "next/cache";
import { getSessionAndRole, createServerClient } from "@/lib/supabase-server";
import { logAdminAction } from "@/lib/audit-log";

/**
 * Admin payment actions for Akademi enrollments. Fase 1 (manual confirm) +
 * scholarships. Admin updates go through the per-request client → RLS
 * `academy_enrollments_admin_all` (is_admin) allows the write. Every mutation is
 * audit-logged BEFORE it runs (PDP UU 27/2022 Pasal 35).
 */

export type AdminResult = { ok: true } | { ok: false; error: string };

async function assertAdmin(): Promise<{ userId: string }> {
  const { session, role } = await getSessionAndRole();
  if (!session || role !== "admin") throw new Error("Unauthorized");
  return { userId: session.userId };
}

/** Manually mark a paid-program enrollment as paid (offline transfer / Fase 1). */
export async function markEnrollmentPaidByAdmin(
  enrollmentId: string,
  note?: string,
): Promise<AdminResult> {
  await assertAdmin();
  await logAdminAction("mark_enrollment_paid", "academy_enrollment", enrollmentId, {
    method: "manual",
    note: note ?? null,
  });
  const supabase = await createServerClient();
  const { error } = await supabase
    .from("academy_enrollments")
    .update({
      payment_status: "paid",
      paid_at: new Date().toISOString(),
      payment_channel: "manual",
    })
    .eq("id", enrollmentId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/academy");
  return { ok: true };
}

/** Waive the fee (scholarship / comp) — opens access without payment. */
export async function waiveEnrollmentByAdmin(
  enrollmentId: string,
  note?: string,
): Promise<AdminResult> {
  await assertAdmin();
  await logAdminAction("waive_enrollment_fee", "academy_enrollment", enrollmentId, {
    note: note ?? null,
  });
  const supabase = await createServerClient();
  const { error } = await supabase
    .from("academy_enrollments")
    .update({ payment_status: "waived" })
    .eq("id", enrollmentId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/academy");
  return { ok: true };
}
