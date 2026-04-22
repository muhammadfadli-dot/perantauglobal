"use server";

import { revalidatePath } from "next/cache";
import { createServerClient, getSessionAndRole } from "@/lib/supabase-server";

async function assertAdmin() {
  const { session, role } = await getSessionAndRole();
  if (!session || role !== "admin") {
    throw new Error("Unauthorized");
  }
  return { reviewedBy: session.email ?? "admin" };
}

export async function updateApplicationStage(
  applicationId: string,
  stage: string,
) {
  const { reviewedBy } = await assertAdmin();
  const supabase = await createServerClient();
  const payload = {
    pipeline_stage: stage,
    reviewed_at: new Date().toISOString(),
    reviewed_by: reviewedBy,
  };
  const { error } = await supabase
    .from("applications")
    .update(payload as never)
    .eq("id", applicationId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/candidates", "layout");
  revalidatePath("/admin/applications", "layout");
}

export async function updateApplicationNotes(
  applicationId: string,
  notes: string,
) {
  const { reviewedBy } = await assertAdmin();
  const supabase = await createServerClient();
  const payload = {
    po_notes: notes,
    reviewed_at: new Date().toISOString(),
    reviewed_by: reviewedBy,
  };
  const { error } = await supabase
    .from("applications")
    .update(payload as never)
    .eq("id", applicationId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/candidates", "layout");
}

export async function toggleReachedOut(
  applicationId: string,
  reachedOut: boolean,
) {
  const { reviewedBy } = await assertAdmin();
  const supabase = await createServerClient();
  const payload = {
    reached_out: reachedOut,
    reached_out_at: reachedOut ? new Date().toISOString() : null,
    reviewed_at: new Date().toISOString(),
    reviewed_by: reviewedBy,
  };
  const { error } = await supabase
    .from("applications")
    .update(payload as never)
    .eq("id", applicationId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/candidates", "layout");
  revalidatePath("/admin/applications", "layout");
}
