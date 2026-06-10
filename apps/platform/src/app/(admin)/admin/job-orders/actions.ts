"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerClient, getSessionAndRole } from "@/lib/supabase-server";
import { logAdminAction } from "@/lib/audit-log";
import { ACCEPTED_STAGES } from "@/lib/applicationStatus";

async function assertAdmin() {
  const { session, role } = await getSessionAndRole();
  if (!session || role !== "admin") throw new Error("Forbidden");
  return session;
}

export type CreateJobOrderInput = {
  position_slug: string;
  internal_employer_name: string;
  public_employer_name?: string | null;
  employer_city?: string | null;
  intake_label: string;
  slot_count: number;
  deadline?: string | null;
  public_description?: string | null;
  notes?: string | null;
};

export type UpdateJobOrderInput = Omit<CreateJobOrderInput, "position_slug">;

export async function createJobOrder(input: CreateJobOrderInput) {
  const session = await assertAdmin();
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("job_orders")
    .insert({
      position_slug: input.position_slug,
      internal_employer_name: input.internal_employer_name,
      public_employer_name: input.public_employer_name || null,
      employer_city: input.employer_city || null,
      intake_label: input.intake_label,
      slot_count: input.slot_count,
      deadline: input.deadline || null,
      public_description: input.public_description || null,
      notes: input.notes || null,
      created_by: session.userId,
      status: "open",
    } as never)
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  const id = (data as { id: string }).id;
  await logAdminAction("create_job_order", "job_order", id, {
    position_slug: input.position_slug,
    intake_label: input.intake_label,
    slot_count: input.slot_count,
  });

  revalidatePath("/admin/job-orders");
  revalidatePath("/admin/positions");
  redirect(`/admin/job-orders/${id}`);
}

/**
 * Edit a job order's core fields after creation. position_slug is intentionally
 * NOT editable (applications are linked to it). Guards slot_count so it can't drop
 * below the number of candidates already placed (accepted stages) in this JO.
 */
export type UpdateJobOrderResult = { ok: true } | { ok: false; error: string };

export async function updateJobOrder(
  id: string,
  input: UpdateJobOrderInput,
): Promise<UpdateJobOrderResult | void> {
  await assertAdmin();
  const supabase = await createServerClient();

  // User-facing validation errors are RETURNED (Next.js strips thrown messages to a
  // generic overlay in prod). On success the action redirects, so it returns void.
  if (!Number.isInteger(input.slot_count) || input.slot_count < 1) {
    return { ok: false, error: "Jumlah slot harus minimal 1." };
  }

  // Don't let slot_count fall below current placements.
  const { count: placed } = await supabase
    .from("applications")
    .select("*", { count: "exact", head: true })
    .eq("job_order_id", id)
    .in("pipeline_stage", [...ACCEPTED_STAGES]);
  if ((placed ?? 0) > input.slot_count) {
    return {
      ok: false,
      error: `Sudah ada ${placed} kandidat diterima — slot tidak bisa kurang dari itu.`,
    };
  }

  await logAdminAction("update_job_order", "job_order", id, {
    intake_label: input.intake_label,
    slot_count: input.slot_count,
  });

  const { error } = await supabase
    .from("job_orders")
    .update({
      internal_employer_name: input.internal_employer_name,
      public_employer_name: input.public_employer_name || null,
      employer_city: input.employer_city || null,
      intake_label: input.intake_label,
      slot_count: input.slot_count,
      deadline: input.deadline || null,
      public_description: input.public_description || null,
      notes: input.notes || null,
    } as never)
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath(`/admin/job-orders/${id}`);
  revalidatePath("/admin/job-orders");
  revalidatePath("/admin/positions");
  redirect(`/admin/job-orders/${id}`);
}

export async function updateJobOrderStatus(
  id: string,
  status: "open" | "closed" | "filled" | "cancelled",
) {
  await assertAdmin();
  await logAdminAction("update_job_order_status", "job_order", id, {
    new_status: status,
  });
  const supabase = await createServerClient();
  const { error } = await supabase.from("job_orders").update({ status } as never).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/job-orders/${id}`);
  revalidatePath("/admin/job-orders");
  revalidatePath("/admin");
}

export async function updateJobOrderNotes(id: string, notes: string) {
  await assertAdmin();
  await logAdminAction("update_job_order_notes", "job_order", id, {
    notes_length: notes.length,
  });
  const supabase = await createServerClient();
  const { error } = await supabase.from("job_orders").update({ notes } as never).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/job-orders/${id}`);
}
