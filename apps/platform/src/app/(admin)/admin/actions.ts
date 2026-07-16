"use server";

import { revalidatePath } from "next/cache";
import { createServerClient, requireAdmin } from "@/lib/supabase-server";
import { logAdminAction } from "@/lib/audit-log";
import {
  isAcceptedStage,
  isRejectedStage,
  isValidStage,
  stageLabel,
} from "@/lib/applicationStatus";

async function assertAdmin() {
  const session = await requireAdmin("Unauthorized");
  // applications.reviewed_by is UUID, so pass the auth_user_id not the email.
  return { reviewedBy: session.userId };
}

export async function updateApplicationStage(
  applicationId: string,
  stage: string,
) {
  const { reviewedBy } = await assertAdmin();
  // Guard: only accept known pipeline stages — never write an arbitrary string
  // (the kanban/select could otherwise persist a typo'd or removed stage).
  if (!isValidStage(stage)) {
    throw new Error(`Stage tidak dikenal: ${stage}`);
  }
  await logAdminAction("update_application_stage", "application", applicationId, {
    new_stage: stage,
    new_stage_label: stageLabel(stage),
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
  // The "layout" scope covers /admin/job-orders/[id] too, so moving a card on the
  // JO board re-groups it into the right column instead of going stale until reload.
  revalidatePath("/admin/job-orders", "layout");
  revalidatePath("/admin", "layout"); // dashboard pipeline snapshot
}

export async function scheduleInterview(input: {
  applicationId: string;
  scheduledAt: string;
  platform: string;
  meetingUrl?: string;
  candidateNote?: string;
  adminNote?: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const { reviewedBy } = await assertAdmin();
  const validPlatforms = ["whatsapp", "zoom", "google_meet", "phone", "in_person"];
  if (!input.applicationId || !validPlatforms.includes(input.platform)) {
    return { ok: false, error: "Data jadwal belum lengkap." };
  }
  const when = new Date(input.scheduledAt);
  if (Number.isNaN(when.getTime())) {
    return { ok: false, error: "Tanggal & jam wawancara tidak valid." };
  }
  await logAdminAction("schedule_interview", "application", input.applicationId, {
    scheduled_at: when.toISOString(),
    platform: input.platform,
  });
  const supabase = await createServerClient();
  const { error } = await (
    supabase as unknown as import("@supabase/supabase-js").SupabaseClient
  )
    .from("interview_scheduled")
    .insert({
      application_id: input.applicationId,
      scheduled_at: when.toISOString(),
      platform: input.platform,
      meeting_url: input.meetingUrl?.trim() || null,
      candidate_note: input.candidateNote?.trim() || null,
      admin_note: input.adminNote?.trim() || null,
      scheduled_by: reviewedBy,
    });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/job-orders", "layout");
  revalidatePath("/admin/candidates", "layout");
  return { ok: true };
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

// assignTier / clearTier — removed in Fase 6A (tier feature sunset).
// application_tiers table dropped in migration 0036.

/**
 * Move a talent-pool application into a specific job order, entering its
 * pipeline at 'screening'. Idempotent: callable on already-assigned apps to
 * reassign to a different job order.
 *
 * - Updates applications.job_order_id
 * - Advances pipeline_stage to 'screening' if currently 'applied' (so the
 *   trigger logs the transition into application_status_history). If the
 *   app is already past 'applied', stage is preserved — caller can manage
 *   transitions via the pipeline board on the job order detail page from there.
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

// Bulk pool triage. The list can hold 600+ applications; clearing obvious
// no-goes or shortlisting a batch one row at a time is the single biggest admin
// time-sink the audit flagged. Both actions:
//  - re-validate eligibility SERVER-SIDE off the live rows (never trust the
//    posted id list): only in-flight pool rows (no job_order, not terminal) can
//    be touched, so a stale tab or replayed call can't flip someone who's
//    already accepted / deployed / rejected.
//  - audit-log one entry PER application before mutating (PDP Pasal 35), reusing
//    the same action types as the single-row paths (tagged bulk:true).
const BULK_MAX = 100;

function dedupeIds(ids: string[]): string[] {
  return [...new Set(ids)].filter(Boolean);
}

export async function bulkRejectApplications(
  applicationIds: string[],
): Promise<{ ok: true; count: number; skipped: number } | { ok: false; error: string }> {
  const { reviewedBy } = await assertAdmin();
  const ids = dedupeIds(applicationIds);
  if (ids.length === 0) return { ok: false, error: "Tidak ada lamaran terpilih." };
  if (ids.length > BULK_MAX)
    return { ok: false, error: `Maksimal ${BULK_MAX} lamaran sekaligus.` };

  const supabase = await createServerClient();
  const { data: apps, error: fErr } = await supabase
    .from("applications")
    .select("id, pipeline_stage, job_order_id")
    .in("id", ids);
  if (fErr) return { ok: false, error: fErr.message };

  const eligible = (apps ?? [])
    .filter(
      (a) =>
        !a.job_order_id &&
        !isRejectedStage(a.pipeline_stage) &&
        !isAcceptedStage(a.pipeline_stage),
    )
    .map((a) => a.id);
  if (eligible.length === 0)
    return { ok: false, error: "Tidak ada lamaran di pilihan yang bisa ditolak." };

  for (const id of eligible) {
    await logAdminAction("update_application_stage", "application", id, {
      new_stage: "rejected",
      new_stage_label: stageLabel("rejected"),
      bulk: true,
    });
  }

  const { error } = await supabase
    .from("applications")
    .update({
      pipeline_stage: "rejected",
      reviewed_at: new Date().toISOString(),
      reviewed_by: reviewedBy,
    } as never)
    .in("id", eligible);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/applications", "layout");
  revalidatePath("/admin/candidates", "layout");
  revalidatePath("/admin/job-orders", "layout");
  revalidatePath("/admin", "layout");
  return { ok: true, count: eligible.length, skipped: ids.length - eligible.length };
}

export async function bulkMoveApplicationsToJobOrder(
  applicationIds: string[],
  jobOrderId: string,
): Promise<{ ok: true; count: number; skipped: number } | { ok: false; error: string }> {
  const { reviewedBy } = await assertAdmin();
  const ids = dedupeIds(applicationIds);
  if (ids.length === 0) return { ok: false, error: "Tidak ada lamaran terpilih." };
  if (ids.length > BULK_MAX)
    return { ok: false, error: `Maksimal ${BULK_MAX} lamaran sekaligus.` };

  const supabase = await createServerClient();
  const { data: jo, error: joErr } = await supabase
    .from("job_orders")
    .select("id, status, position_slug")
    .eq("id", jobOrderId)
    .maybeSingle();
  if (joErr) return { ok: false, error: joErr.message };
  if (!jo) return { ok: false, error: "Job order tidak ditemukan." };
  if (jo.status !== "open")
    return { ok: false, error: "Job order tidak open — tidak bisa terima kandidat baru." };

  const { data: apps, error: aErr } = await supabase
    .from("applications")
    .select("id, position_slug, pipeline_stage, job_order_id")
    .in("id", ids);
  if (aErr) return { ok: false, error: aErr.message };

  // Only untracked pool rows for THIS position — job orders are position-scoped.
  const eligible = (apps ?? []).filter(
    (a) =>
      a.position_slug === jo.position_slug &&
      !a.job_order_id &&
      !isRejectedStage(a.pipeline_stage) &&
      !isAcceptedStage(a.pipeline_stage),
  );
  if (eligible.length === 0)
    return {
      ok: false,
      error: "Tidak ada kandidat di pilihan yang cocok dengan posisi job order ini.",
    };

  for (const a of eligible) {
    await logAdminAction("move_application_to_job_order", "application", a.id, {
      job_order_id: jobOrderId,
      bulk: true,
    });
  }

  const now = new Date().toISOString();
  const base = { job_order_id: jobOrderId, reviewed_at: now, reviewed_by: reviewedBy };
  // 'applied' enters the pipeline at 'screening'; rows already past applied keep
  // their stage (the JO board manages transitions from there).
  const appliedIds = eligible.filter((a) => a.pipeline_stage === "applied").map((a) => a.id);
  const keepIds = eligible.filter((a) => a.pipeline_stage !== "applied").map((a) => a.id);

  if (appliedIds.length > 0) {
    const { error } = await supabase
      .from("applications")
      .update({ ...base, pipeline_stage: "screening" } as never)
      .in("id", appliedIds);
    if (error) return { ok: false, error: error.message };
  }
  if (keepIds.length > 0) {
    const { error } = await supabase
      .from("applications")
      .update(base as never)
      .in("id", keepIds);
    if (error) return { ok: false, error: error.message };
  }

  revalidatePath("/admin/applications", "layout");
  revalidatePath("/admin/candidates", "layout");
  revalidatePath("/admin/job-orders", "layout");
  revalidatePath(`/admin/job-orders/${jobOrderId}`, "layout");
  revalidatePath("/admin", "layout");
  return { ok: true, count: eligible.length, skipped: ids.length - eligible.length };
}

