"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerClient, getSessionAndRole } from "@/lib/supabase-server";

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

  revalidatePath("/admin/job-orders");
  revalidatePath("/admin/positions");
  redirect(`/admin/job-orders/${(data as { id: string }).id}`);
}

export async function updateJobOrderStatus(id: string, status: "open" | "closed" | "filled" | "cancelled") {
  await assertAdmin();
  const supabase = await createServerClient();
  const { error } = await supabase.from("job_orders").update({ status } as never).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/job-orders/${id}`);
  revalidatePath("/admin/job-orders");
}

export async function updateJobOrderNotes(id: string, notes: string) {
  await assertAdmin();
  const supabase = await createServerClient();
  const { error } = await supabase.from("job_orders").update({ notes } as never).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/job-orders/${id}`);
}
