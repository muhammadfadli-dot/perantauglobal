import { headers } from "next/headers";
import { createServerClient } from "./supabase-server";

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
 *
 * After applying migration 0017 + regenerating types via Supabase MCP, the
 * `as never` casts below can be removed.
 */

export type AuditAction =
  // Document operations (PII view)
  | "view_document"
  | "verify_document"
  | "reject_document"
  // Application pipeline operations
  | "update_application_stage"
  | "update_application_notes"
  | "toggle_reached_out"
  | "assign_tier"
  | "clear_tier"
  // Admin allowlist operations (escalation events)
  | "invite_admin"
  | "remove_admin"
  // Inbox triage
  | "update_inbox_status"
  | "update_inbox_notes";

export type AuditResourceType =
  | "candidate_document"
  | "application"
  | "candidate"
  | "admin_user"
  | "contact_submission";

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
  const { error } = await supabase.rpc(
    "log_admin_action" as never,
    {
      p_action: action,
      p_resource_type: resourceType,
      p_resource_id: resourceId,
      p_metadata: metadata ?? null,
      p_ip_address: ip,
      p_user_agent: userAgent,
    } as never,
  );

  if (error) {
    throw new Error(
      `audit-log: failed to record ${action} on ${resourceType}:${resourceId} — ${error.message}`,
    );
  }
}
