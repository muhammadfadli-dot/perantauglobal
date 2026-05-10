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

/**
 * Move a talent-pool application into a specific job order, entering its
 * pipeline at 'screening'. Idempotent: callable on already-assigned apps to
 * reassign to a different job order.
 *
 * - Updates applications.job_order_id
 * - Advances pipeline_stage to 'screening' if currently 'applied' (so the
 *   trigger logs the transition into application_status_history). If the
 *   app is already past 'applied', stage is preserved — caller can manage
 *   transitions via the job order kanban from there.
 * - Sets reviewed_at + reviewed_by on the row.
 */
export async function moveApplicationToJobOrder(
  applicationId: string,
  jobOrderId: string,
) {
  const { reviewedBy } = await assertAdmin();
  await logAdminAction(
    "move_application_to_job_order",
    "application",
    applicationId,
    { job_order_id: jobOrderId },
  );

  const supabase = await createServerClient();

  // Validate the job order exists and is open.
  const { data: jo, error: joErr } = await supabase
    .from("job_orders")
    .select("id, status, position_slug")
    .eq("id", jobOrderId)
    .maybeSingle();
  if (joErr) throw new Error(joErr.message);
  if (!jo) throw new Error("Job order tidak ditemukan");
  if (jo.status !== "open")
    throw new Error("Job order tidak open — tidak bisa menerima kandidat baru");

  // Validate the application's position matches the job order's position.
  const { data: app, error: appErr } = await supabase
    .from("applications")
    .select("id, pipeline_stage, position_slug, job_order_id")
    .eq("id", applicationId)
    .single();
  if (appErr) throw new Error(appErr.message);
  if (app.position_slug !== jo.position_slug) {
    throw new Error(
      "Posisi kandidat tidak match dengan job order — pilih job order yang sesuai",
    );
  }

  const payload: {
    job_order_id: string;
    reviewed_at: string;
    reviewed_by: string;
    pipeline_stage?: string;
  } = {
    job_order_id: jobOrderId,
    reviewed_at: new Date().toISOString(),
    reviewed_by: reviewedBy,
  };
  if (app.pipeline_stage === "applied") {
    payload.pipeline_stage = "screening";
  }

  const { error } = await supabase
    .from("applications")
    .update(payload as never)
    .eq("id", applicationId);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/applications", "layout");
  revalidatePath("/admin/candidates", "layout");
  revalidatePath(`/admin/job-orders/${jobOrderId}`, "layout");
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
