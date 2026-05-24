"use server";

import { revalidatePath } from "next/cache";
import { createServerClient, getSessionAndRole } from "@/lib/supabase-server";
import type { PositionContent } from "@/lib/position-content";

async function assertAdmin() {
  const { session, role } = await getSessionAndRole();
  if (!session || role !== "admin") throw new Error("Forbidden");
}

/**
 * Fire-and-forget POST to apps/web's /api/revalidate endpoint to trigger
 * on-demand cache busting after admin changes form fields. Skipped silently
 * if env is missing (dev / non-prod).
 *
 * Required env (production):
 *   - WEB_REVALIDATE_URL      e.g. https://perantauglobal.com/api/revalidate
 *   - REVALIDATE_SECRET       same shared secret as the web endpoint
 */
async function notifyWebRevalidate(slug: string): Promise<void> {
  const url = process.env.WEB_REVALIDATE_URL;
  const secret = process.env.REVALIDATE_SECRET;
  if (!url || !secret) return;
  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret, slug }),
      // Don't block admin UI on this — best effort, ISR fallback covers it
      // within 60s if the call fails.
      signal: AbortSignal.timeout(3000),
    });
  } catch (err) {
    console.warn(
      `[revalidate-web] failed to notify ${url} for slug=${slug}:`,
      err instanceof Error ? err.message : String(err),
    );
  }
}

export async function updatePositionMeta(
  slug: string,
  patch: { name?: string; description?: string; active?: boolean }
) {
  await assertAdmin();
  const supabase = await createServerClient();
  const { error } = await supabase
    .from("positions")
    .update({
      ...(patch.name !== undefined ? { name: patch.name } : {}),
      ...(patch.description !== undefined ? { description: patch.description } : {}),
      ...(patch.active !== undefined ? { active: patch.active } : {}),
    } as never)
    .eq("slug", slug);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/positions");
  revalidatePath(`/admin/positions/${slug}`);
}

// =========================================================================
// Removed in Fase 4 sunset (2026-05-25):
//   - updatePositionRequirements (raw JSON textarea for positions.requirements)
//   - addRequirementToPosition / removeRequirementFromPosition
//     (library catalog add/remove on positions.requirements JSONB)
//   - createFormField / updateFormField / deleteFormField / reorderFormField
//     (CRUD on position_form_fields)
// All replaced by the position_application_fields editor + positions.content
// JSONB editor. The positions.requirements column + position_form_fields
// table still exist (deferred drop until Fase 5 — see TASKS.md).
// =========================================================================


// =========================================================================
// Fase 2: position content + position_application_fields
// =========================================================================

/**
 * Persist the entire positions.content JSONB blob. Whole-blob replacement
 * is safer than jsonb merge for this editor since admin sees + edits the
 * full shape together. Size guard at DB layer (< 100KB).
 */
export async function updatePositionContent(slug: string, content: PositionContent) {
  await assertAdmin();
  const supabase = await createServerClient();
  const { error } = await supabase
    .from("positions")
    .update({ content: content as never } as never)
    .eq("slug", slug);
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/positions/${slug}`);
  await notifyWebRevalidate(slug);
}

export type ApplicationFieldInput = {
  field_key: string;
  field_label: string;
  field_help?: string;
  field_type: "select" | "radio" | "number" | "text" | "textarea" | "file" | "multiselect";
  options?: { value: string; label: string }[] | null;
  importance?: "required" | "optional";
  section?: "syarat_utama" | "kualifikasi" | "screening";
  tier_weight?: number;
  sort_order?: number;
  collect_at_stage?: "applied" | "screening" | "document_check";
};

export async function createApplicationField(positionSlug: string, input: ApplicationFieldInput) {
  await assertAdmin();
  const supabase = await createServerClient();
  const { error } = await supabase.from("position_application_fields").insert({
    position_slug: positionSlug,
    field_key: input.field_key,
    field_label: input.field_label,
    field_help: input.field_help ?? null,
    field_type: input.field_type,
    options: input.options ?? null,
    importance: input.importance ?? "optional",
    section: input.section ?? "kualifikasi",
    tier_weight: input.tier_weight ?? 0,
    sort_order: input.sort_order ?? 0,
    collect_at_stage: input.collect_at_stage ?? "applied",
  } as never);
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/positions/${positionSlug}`);
  await notifyWebRevalidate(positionSlug);
}

export async function updateApplicationField(
  id: string,
  positionSlug: string,
  patch: Partial<ApplicationFieldInput>,
) {
  await assertAdmin();
  const supabase = await createServerClient();
  const { error } = await supabase
    .from("position_application_fields")
    .update({
      ...(patch.field_label !== undefined ? { field_label: patch.field_label } : {}),
      ...(patch.field_help !== undefined ? { field_help: patch.field_help } : {}),
      ...(patch.field_type !== undefined ? { field_type: patch.field_type } : {}),
      ...(patch.options !== undefined ? { options: patch.options } : {}),
      ...(patch.importance !== undefined ? { importance: patch.importance } : {}),
      ...(patch.section !== undefined ? { section: patch.section } : {}),
      ...(patch.tier_weight !== undefined ? { tier_weight: patch.tier_weight } : {}),
      ...(patch.sort_order !== undefined ? { sort_order: patch.sort_order } : {}),
      ...(patch.collect_at_stage !== undefined ? { collect_at_stage: patch.collect_at_stage } : {}),
    } as never)
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/positions/${positionSlug}`);
  await notifyWebRevalidate(positionSlug);
}

export async function deleteApplicationField(id: string, positionSlug: string) {
  await assertAdmin();
  const supabase = await createServerClient();
  const { error } = await supabase.from("position_application_fields").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/positions/${positionSlug}`);
  await notifyWebRevalidate(positionSlug);
}

export async function reorderApplicationField(
  id: string,
  positionSlug: string,
  direction: "up" | "down",
) {
  await assertAdmin();
  const supabase = await createServerClient();
  const { data, error: fetchErr } = await supabase
    .from("position_application_fields")
    .select("id, sort_order")
    .eq("position_slug", positionSlug)
    .order("sort_order", { ascending: true });
  if (fetchErr) throw new Error(fetchErr.message);
  const fields = (data ?? []) as { id: string; sort_order: number }[];
  const idx = fields.findIndex((f) => f.id === id);
  if (idx === -1) throw new Error("Field tidak ditemukan.");
  const swapIdx = direction === "up" ? idx - 1 : idx + 1;
  if (swapIdx < 0 || swapIdx >= fields.length) return;
  const a = fields[idx];
  const b = fields[swapIdx];
  const { error: e1 } = await supabase
    .from("position_application_fields")
    .update({ sort_order: b.sort_order } as never)
    .eq("id", a.id);
  if (e1) throw new Error(e1.message);
  const { error: e2 } = await supabase
    .from("position_application_fields")
    .update({ sort_order: a.sort_order } as never)
    .eq("id", b.id);
  if (e2) throw new Error(e2.message);
  revalidatePath(`/admin/positions/${positionSlug}`);
  await notifyWebRevalidate(positionSlug);
}
