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

/**
 * Hard delete a position. Refuses if any applications or job orders exist
 * for this slug — those carry candidate / employer history we don't want
 * to orphan. Admin should nonaktifkan via PositionMetaEditor in that case.
 *
 * Cascading effects on hard delete (handled by FK constraints):
 *   - position_application_fields rows are auto-removed (ON DELETE CASCADE)
 *   - pending_submissions for this slug are auto-removed (ON DELETE CASCADE)
 *   - applications.position_slug + job_orders.position_slug are RESTRICT,
 *     so the DB itself would refuse the delete — we pre-check for a
 *     friendlier error than the raw Postgres FK violation.
 */
export async function deletePosition(slug: string): Promise<void> {
  await assertAdmin();
  const supabase = await createServerClient();

  const [{ count: appCount, error: appCountErr }, { count: joCount, error: joCountErr }] =
    await Promise.all([
      supabase
        .from("applications")
        .select("*", { count: "exact", head: true })
        .eq("position_slug", slug),
      supabase
        .from("job_orders")
        .select("*", { count: "exact", head: true })
        .eq("position_slug", slug),
    ]);
  if (appCountErr) throw new Error(`Gagal cek lamaran: ${appCountErr.message}`);
  if (joCountErr) throw new Error(`Gagal cek job order: ${joCountErr.message}`);

  if ((appCount ?? 0) > 0) {
    throw new Error(
      `Posisi ini punya ${appCount} lamaran. Hapus permanen tidak diizinkan — nonaktifkan aja kalau ga mau muncul di listing publik.`,
    );
  }
  if ((joCount ?? 0) > 0) {
    throw new Error(
      `Posisi ini punya ${joCount} job order. Hapus permanen tidak diizinkan — tutup / cancel JO-nya dulu.`,
    );
  }

  const { error } = await supabase.from("positions").delete().eq("slug", slug);
  if (error) {
    // Defense in depth: in case a record slipped in between our count check
    // and the DELETE, Postgres FK RESTRICT would surface as a "violates
    // foreign key constraint" error here. Translate to a friendly message.
    if (error.message.toLowerCase().includes("foreign key")) {
      throw new Error(
        "Tidak bisa hapus — ada data lain (lamaran / job order) yang masih mereferensikan posisi ini.",
      );
    }
    throw new Error(error.message);
  }

  revalidatePath("/admin/positions");
  await notifyWebRevalidate(slug);
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
 * Save editor changes to positions.draft_content (NOT live).
 *
 * Phase 8b: the editor now writes to a working draft instead of the live
 * content. The public /lowongan page keeps reading positions.content until
 * admin explicitly clicks "Publish ke live" (publishPosition action below).
 *
 * - Whole-blob replacement (safer than jsonb merge for this editor).
 * - Size guard enforced at DB layer (positions content_size_check, 100KB).
 * - Does NOT revalidate apps/web — draft is invisible to the public.
 */
export async function saveDraft(slug: string, content: PositionContent) {
  await assertAdmin();
  const supabase = await createServerClient();
  const { error } = await supabase
    .from("positions")
    .update({ draft_content: content as never } as never)
    .eq("slug", slug);
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/positions/${slug}`);
}

/**
 * Result type for user-facing publish actions. Friendly errors are RETURNED
 * (not thrown) because Next.js production strips server-action exception
 * messages to the generic "Server Components render" overlay. Throwing is
 * reserved for actual programming errors (auth, unexpected DB outage).
 */
export type PublishActionResult = { ok: true } | { ok: false; error: string };

/**
 * Promote the working draft to live: copy positions.draft_content into
 * positions.content, stamp published_at = now(), clear draft_content.
 *
 * After this:
 *   - /lowongan reads the new content
 *   - draft and live are back in sync (draft_content = NULL)
 *   - apps/web ISR is busted via notifyWebRevalidate
 *
 * Refuses (returns ok: false) if there is no draft to publish — returning
 * the friendly message preserves it through Next.js production filtering.
 */
export async function publishPosition(slug: string): Promise<PublishActionResult> {
  await assertAdmin();
  const supabase = await createServerClient();

  // Fetch current draft (cannot publish without one).
  const { data, error: readErr } = await supabase
    .from("positions")
    .select("draft_content")
    .eq("slug", slug)
    .maybeSingle();
  if (readErr) {
    // Unexpected DB read failure — alertable. Throw to log as 500.
    throw new Error(`DB read error: ${readErr.message}`);
  }
  if (!data) {
    return { ok: false, error: "Posisi tidak ditemukan." };
  }
  const draft = (data as { draft_content: unknown }).draft_content;
  if (draft == null) {
    return {
      ok: false,
      error: "Tidak ada draft untuk dipublish. Edit dulu sebelum publish.",
    };
  }

  const { error: writeErr } = await supabase
    .from("positions")
    .update({
      content: draft as never,
      draft_content: null,
      published_at: new Date().toISOString(),
    } as never)
    .eq("slug", slug);
  if (writeErr) {
    // Unexpected DB write failure — alertable. Throw to log as 500.
    throw new Error(`DB write error: ${writeErr.message}`);
  }

  revalidatePath(`/admin/positions/${slug}`);
  revalidatePath("/admin/positions");
  await notifyWebRevalidate(slug);
  return { ok: true };
}

/**
 * Discard pending draft changes — drops draft_content back to NULL.
 * Live content stays untouched. Useful for "saya batalin perubahan ini".
 *
 * Returns discriminated union for the same reason as publishPosition:
 * keeps user-facing copy intact through Next.js production filtering.
 */
export async function discardDraft(slug: string): Promise<PublishActionResult> {
  await assertAdmin();
  const supabase = await createServerClient();
  const { error } = await supabase
    .from("positions")
    .update({ draft_content: null } as never)
    .eq("slug", slug);
  if (error) {
    // Unexpected DB write failure — alertable. Throw to log as 500.
    throw new Error(`DB write error: ${error.message}`);
  }
  revalidatePath(`/admin/positions/${slug}`);
  return { ok: true };
}

/**
 * @deprecated since Phase 8b — use `saveDraft` directly. Kept as a thin
 * alias so existing callers (PositionEditorShell pre-PR-C) keep working
 * while we migrate them to the explicit draft/publish API.
 */
export async function updatePositionContent(slug: string, content: PositionContent) {
  await saveDraft(slug, content);
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
