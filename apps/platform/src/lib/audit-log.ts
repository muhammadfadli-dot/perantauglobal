import { headers } from "next/headers";
import type { Database } from "@perantauglobal/db";
import { createServerClient } from "./supabase-server";

type LogActionArgs = Database["public"]["Functions"]["log_admin_action"]["Args"];

/**
 * Admin action audit log helper. PDP UU 27/2022 Pasal 35 compliance.
 *
 * Every admin server action that mutates candidate state OR accesses PII
 * (KTP, paspor, dokumen via signed URL) calls `logAdminAction()` BEFORE
 * the operation. If the audit insert fails, we throw — no untracked admin
 * action ever happens.
 *
 * Insert is gated server-side by the `log_admin_action()` SECURITY DEFINER
 * function (migration 0017): it stamps auth.uid() + auth.jwt()->'email' so
 * admins can't impersonate or backdate entries.
 */

export type AuditActionTone = "info" | "ok" | "warn" | "err" | "mute";

/**
 * Single source of truth for admin audit actions: label (Indonesian) + display
 * tone. The `AuditAction` union is DERIVED from these keys, so adding an action
 * here updates the type AND the audit-log viewer's filter/label/tone maps at once
 * — no more drift where a new mutating action is unlabelled or missing from filters.
 */
export const AUDIT_ACTIONS = {
  // Document operations (PII view)
  view_document: { label: "Lihat dokumen", tone: "info" },
  verify_document: { label: "Verifikasi dokumen", tone: "ok" },
  reject_document: { label: "Tolak dokumen", tone: "err" },
  // Application pipeline operations
  update_application_stage: { label: "Ubah stage", tone: "info" },
  update_application_notes: { label: "Ubah notes lamaran", tone: "mute" },
  toggle_reached_out: { label: "Reached out", tone: "info" },
  assign_tier: { label: "Assign tier (legacy)", tone: "mute" },
  clear_tier: { label: "Clear tier (legacy)", tone: "mute" },
  move_application_to_job_order: { label: "Pindah ke job order", tone: "info" },
  // Admin allowlist operations (escalation events)
  invite_admin: { label: "Invite admin", tone: "ok" },
  remove_admin: { label: "Remove admin", tone: "err" },
  // Inbox triage
  update_inbox_status: { label: "Ubah status inbox", tone: "mute" },
  update_inbox_notes: { label: "Ubah notes inbox", tone: "mute" },
  // Bulk / data export (PII egress)
  export_candidates_csv: { label: "Export CSV kandidat", tone: "warn" },
  // Job order operations
  create_job_order: { label: "Buat job order", tone: "ok" },
  update_job_order: { label: "Edit job order", tone: "info" },
  update_job_order_status: { label: "Ubah status job order", tone: "info" },
  update_job_order_notes: { label: "Ubah notes job order", tone: "mute" },
  // Position catalog operations (content + visibility)
  create_position: { label: "Buat posisi", tone: "ok" },
  publish_position: { label: "Publish posisi", tone: "ok" },
  discard_position_draft: { label: "Buang draft posisi", tone: "mute" },
  delete_position: { label: "Hapus posisi", tone: "err" },
  update_position_meta: { label: "Ubah meta/visibility posisi", tone: "info" },
  // Application-field (screening) operations — these drive hard_pass/readiness,
  // so every mutation is tracked (PDP + scoring accountability).
  create_application_field: { label: "Tambah field lamaran", tone: "ok" },
  update_application_field: { label: "Ubah field lamaran", tone: "info" },
  delete_application_field: { label: "Hapus field lamaran", tone: "err" },
  reorder_application_field: { label: "Urut ulang field lamaran", tone: "mute" },
  // Event CMS operations
  create_event: { label: "Buat event", tone: "ok" },
  update_event: { label: "Edit event", tone: "info" },
  set_registration_status: { label: "Ubah status pendaftar event", tone: "info" },
  // Affiliate / referral operations
  create_affiliate_agent: { label: "Buat agen afiliasi", tone: "ok" },
  update_affiliate_agent: { label: "Edit agen afiliasi", tone: "info" },
  generate_referral_code: { label: "Generate kode referral", tone: "ok" },
  update_referral_code: { label: "Ubah kode referral", tone: "info" },
  set_commission_amount: { label: "Set nominal komisi", tone: "info" },
  approve_commission: { label: "Approve komisi", tone: "ok" },
  mark_commission_paid: { label: "Tandai komisi dibayar", tone: "ok" },
  void_commission: { label: "Void komisi", tone: "err" },
  // Akademi payment operations
  mark_enrollment_paid: { label: "Tandai pembayaran lunas", tone: "ok" },
  waive_enrollment_fee: { label: "Bebaskan biaya (waive)", tone: "info" },
} as const satisfies Record<string, { label: string; tone: AuditActionTone }>;

export type AuditAction = keyof typeof AUDIT_ACTIONS;

export const AUDIT_RESOURCES = {
  candidate_document: "Dokumen",
  application: "Lamaran",
  candidate: "Kandidat",
  admin_user: "Admin user",
  contact_submission: "Inbox",
  affiliate_agent: "Agen afiliasi",
  referral_code: "Kode referral",
  commission_event: "Komisi",
  job_order: "Job order",
  position: "Posisi",
  application_field: "Field lamaran",
  event: "Event",
  event_registration: "Pendaftar event",
  academy_enrollment: "Pendaftaran akademi",
} as const satisfies Record<string, string>;

export type AuditResourceType = keyof typeof AUDIT_RESOURCES;

export type AuditMetadata = Record<string, string | number | boolean | null>;

/**
 * Logs an admin action. Call BEFORE performing the action — if the audit
 * insert fails, the calling action throws and the operation is not performed.
 *
 * @throws if the audit insert fails (DB error, RLS denial, missing migration).
 */
export async function logAdminAction(
  action: AuditAction,
  resourceType: AuditResourceType,
  resourceId: string,
  metadata?: AuditMetadata,
): Promise<void> {
  const h = await headers();
  const ip =
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip") ||
    null;
  const userAgent = h.get("user-agent") ?? null;

  const supabase = await createServerClient();
  const args: LogActionArgs = {
    p_action: action,
    p_resource_type: resourceType,
    p_resource_id: resourceId,
    p_metadata: metadata ?? null,
    // p_ip_address is `unknown` (INET) and p_user_agent is `string | undefined`
    // in the generated RPC types — pass undefined when missing, not null.
    p_ip_address: ip ?? undefined,
    p_user_agent: userAgent ?? undefined,
  };
  const { error } = await supabase.rpc("log_admin_action", args);

  if (error) {
    throw new Error(
      `audit-log: failed to record ${action} on ${resourceType}:${resourceId} — ${error.message}`,
    );
  }
}
