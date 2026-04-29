"use server";

import { revalidatePath } from "next/cache";
import { createServerClient, getSessionAndRole } from "@/lib/supabase-server";
import { logAdminAction } from "@/lib/audit-log";

async function assertAdmin() {
  const { session, role } = await getSessionAndRole();
  if (!session || role !== "admin") {
    throw new Error("Unauthorized");
  }
  // applications.reviewed_by is UUID, so pass the auth_user_id not the email.
  return { reviewedBy: session.userId };
}

export async function updateApplicationStage(
  applicationId: string,
  stage: string,
) {
  const { reviewedBy } = await assertAdmin();
  await logAdminAction("update_application_stage", "application", applicationId, {
    new_stage: stage,
  });
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
  await logAdminAction("update_application_notes", "application", applicationId, {
    notes_length: notes.length,
  });
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
  await logAdminAction("toggle_reached_out", "application", applicationId, {
    reached_out: reachedOut,
  });
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

export async function assignTier(
  applicationId: string,
  tier: "A" | "B" | "C" | "D" | "rejected",
  notes?: string,
) {
  const { reviewedBy } = await assertAdmin();
  await logAdminAction("assign_tier", "application", applicationId, {
    tier,
    has_notes: Boolean(notes && notes.trim()),
  });
  const supabase = await createServerClient();
  const { error } = await supabase
    .from("application_tiers")
    .upsert({
      application_id: applicationId,
      tier,
      notes: notes ?? null,
      assigned_by: reviewedBy,
      assigned_at: new Date().toISOString(),
    } as never);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/candidates", "layout");
  revalidatePath("/admin/applications", "layout");
}

export async function clearTier(applicationId: string) {
  await assertAdmin();
  await logAdminAction("clear_tier", "application", applicationId);
  const supabase = await createServerClient();
  const { error } = await supabase
    .from("application_tiers")
    .delete()
    .eq("application_id", applicationId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/candidates", "layout");
  revalidatePath("/admin/applications", "layout");
}
