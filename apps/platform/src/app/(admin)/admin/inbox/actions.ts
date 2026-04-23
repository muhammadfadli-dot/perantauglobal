"use server";

import { revalidatePath } from "next/cache";
import { createServerClient, getSessionAndRole } from "@/lib/supabase-server";

async function assertAdmin() {
  const { session, role } = await getSessionAndRole();
  if (!session || role !== "admin") throw new Error("Forbidden");
}

export async function updateInboxStatus(id: string, status: "new" | "in_progress" | "done") {
  await assertAdmin();
  const supabase = await createServerClient();
  const { error } = await supabase
    .from("contact_submissions")
    .update({ status } as never)
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/inbox");
}

export async function updateInboxNotes(id: string, notes: string) {
  await assertAdmin();
  const supabase = await createServerClient();
  const { error } = await supabase
    .from("contact_submissions")
    .update({ notes } as never)
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/inbox");
}
