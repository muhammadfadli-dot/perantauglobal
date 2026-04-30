"use server";

import { revalidatePath } from "next/cache";
import { createServerClient, getSessionAndRole } from "@/lib/supabase-server";

async function assertAdmin() {
  const { session, role } = await getSessionAndRole();
  if (!session || role !== "admin") throw new Error("Forbidden");
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

export async function updatePositionRequirements(slug: string, requirementsJson: string) {
  await assertAdmin();
  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(requirementsJson);
  } catch (e) {
    throw new Error(`JSON tidak valid: ${e instanceof Error ? e.message : "parse error"}`);
  }
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    throw new Error("Requirements harus berupa object {key: {type, label, allowed_values?}}.");
  }
  const supabase = await createServerClient();
  const { error } = await supabase
    .from("positions")
    .update({ requirements: parsed } as never)
    .eq("slug", slug);
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/positions/${slug}`);
}

/**
 * Add or remove a single requirement from a position's requirements JSONB.
 * Used by the RequirementLibraryPanel — admin clicks "Add" on a curated
 * library entry, we merge it in (overwrite if key exists).
 */
export async function addRequirementToPosition(
  slug: string,
  key: string,
  requirement: Record<string, unknown>,
) {
  await assertAdmin();
  const supabase = await createServerClient();
  const { data: row } = await supabase
    .from("positions")
    .select("requirements")
    .eq("slug", slug)
    .single();
  const current = (((row?.requirements as Record<string, unknown>) ?? {}) as Record<
    string,
    unknown
  >);
  const next = { ...current, [key]: requirement };
  const { error } = await supabase
    .from("positions")
    .update({ requirements: next } as never)
    .eq("slug", slug);
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/positions/${slug}`);
}

export async function removeRequirementFromPosition(slug: string, key: string) {
  await assertAdmin();
  const supabase = await createServerClient();
  const { data: row } = await supabase
    .from("positions")
    .select("requirements")
    .eq("slug", slug)
    .single();
  const current = (((row?.requirements as Record<string, unknown>) ?? {}) as Record<
    string,
    unknown
  >);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { [key]: _removed, ...rest } = current;
  const { error } = await supabase
    .from("positions")
    .update({ requirements: rest } as never)
    .eq("slug", slug);
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/positions/${slug}`);
}

export type FormFieldInput = {
  field_key: string;
  field_label: string;
  field_help?: string;
  field_type: "select" | "radio" | "number" | "text" | "textarea" | "file" | "multiselect";
  options?: { value: string; label: string }[] | null;
  required?: boolean;
  tier_weight?: number;
  sort_order?: number;
  /**
   * Pipeline stage at which this question gets shown to the candidate.
   * - "applied"        → critical hard-pass disqualifier, asked on apply form
   * - "screening"      → tier-scoring questions, asked post-apply (default)
   * - "document_check" → motivation essays, deeper bio
   */
  collect_at_stage?: "applied" | "screening" | "document_check";
};

export async function createFormField(positionSlug: string, input: FormFieldInput) {
  await assertAdmin();
  const supabase = await createServerClient();
  const { error } = await supabase.from("position_form_fields").insert({
    position_slug: positionSlug,
    field_key: input.field_key,
    field_label: input.field_label,
    field_help: input.field_help ?? null,
    field_type: input.field_type,
    options: input.options ?? null,
    required: input.required ?? false,
    tier_weight: input.tier_weight ?? 0,
    sort_order: input.sort_order ?? 0,
    collect_at_stage: input.collect_at_stage ?? "screening",
  } as never);
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/positions/${positionSlug}`);
}

export async function updateFormField(id: string, positionSlug: string, patch: Partial<FormFieldInput>) {
  await assertAdmin();
  const supabase = await createServerClient();
  const { error } = await supabase
    .from("position_form_fields")
    .update({
      ...(patch.field_label !== undefined ? { field_label: patch.field_label } : {}),
      ...(patch.field_help !== undefined ? { field_help: patch.field_help } : {}),
      ...(patch.field_type !== undefined ? { field_type: patch.field_type } : {}),
      ...(patch.options !== undefined ? { options: patch.options } : {}),
      ...(patch.required !== undefined ? { required: patch.required } : {}),
      ...(patch.tier_weight !== undefined ? { tier_weight: patch.tier_weight } : {}),
      ...(patch.sort_order !== undefined ? { sort_order: patch.sort_order } : {}),
      ...(patch.collect_at_stage !== undefined ? { collect_at_stage: patch.collect_at_stage } : {}),
    } as never)
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/positions/${positionSlug}`);
}

export async function deleteFormField(id: string, positionSlug: string) {
  await assertAdmin();
  const supabase = await createServerClient();
  const { error } = await supabase.from("position_form_fields").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/positions/${positionSlug}`);
}
