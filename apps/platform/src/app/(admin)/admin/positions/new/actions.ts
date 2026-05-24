"use server";

import { revalidatePath } from "next/cache";
import { createServerClient, getSessionAndRole } from "@/lib/supabase-server";

async function assertAdmin() {
  const { session, role } = await getSessionAndRole();
  if (!session || role !== "admin") throw new Error("Forbidden");
}

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export type CustomFieldDraft = {
  field_key: string;
  field_label: string;
  field_type: "select" | "radio" | "number" | "text" | "textarea" | "file" | "multiselect";
  options?: { value: string; label: string }[];
  required?: boolean;
  tier_weight?: number;
  collect_at_stage?: "applied" | "screening" | "document_check";
};

/**
 * Library-curated requirement shape produced by PositionWizard Step 2.
 * Each key maps to a single application field — see translation below.
 */
type LibraryRequirement = {
  label?: string;
  category?: string;
  importance?: "hard" | "soft";
  evidence_mode?: "self_declared" | "document" | "either";
  allowed_values?: string[];
  value_labels?: Record<string, string>;
  document_type?: string;
  document_filter?: Record<string, unknown>;
  collect_at_stage?: "applied" | "screening" | "document_check";
  description?: string;
};

export type CreatePositionInput = {
  name: string;
  slug: string;
  country: string;
  description: string;
  /** Library-curated requirements; keyed by slug, value is LibraryRequirement-shaped. */
  requirements: Record<string, unknown>;
  custom_fields: CustomFieldDraft[];
};

type Section = "syarat_utama" | "kualifikasi" | "screening";

function stageToSection(
  stage: "applied" | "screening" | "document_check" | undefined,
): Section {
  if (stage === "applied") return "syarat_utama";
  if (stage === "document_check") return "screening";
  return "kualifikasi";
}

/**
 * Map a library requirement (from REQUIREMENT_LIBRARY catalog) into a
 * position_application_fields row. document_type → file field; allowed_values
 * → radio with options; else free-text.
 */
function libRequirementToField(
  slug: string,
  key: string,
  req: LibraryRequirement,
  sortOrder: number,
): {
  position_slug: string;
  field_key: string;
  field_label: string;
  field_help: string | null;
  field_type: "radio" | "file" | "text";
  options: { value: string; label: string }[] | null;
  importance: "required" | "optional";
  section: Section;
  tier_weight: number;
  sort_order: number;
  collect_at_stage: "applied" | "screening" | "document_check";
  document_type: string | null;
} {
  const fieldType: "radio" | "file" | "text" =
    req.evidence_mode === "document" && req.document_type
      ? "file"
      : req.allowed_values && req.allowed_values.length > 0
        ? "radio"
        : "text";

  const options =
    req.allowed_values && req.allowed_values.length > 0
      ? req.allowed_values.map((v) => ({
          value: v,
          label: req.value_labels?.[v] ?? v,
        }))
      : null;

  return {
    position_slug: slug,
    field_key: key,
    field_label: req.label ?? key,
    field_help: req.description ?? null,
    field_type: fieldType,
    options,
    importance: req.importance === "hard" ? "required" : "optional",
    section: stageToSection(req.collect_at_stage),
    tier_weight: 0,
    sort_order: sortOrder,
    collect_at_stage: req.collect_at_stage ?? "applied",
    document_type: req.document_type ?? null,
  };
}

export async function createPosition(input: CreatePositionInput) {
  await assertAdmin();

  if (!input.name || input.name.trim().length < 2) {
    throw new Error("Nama posisi minimum 2 karakter.");
  }
  if (!SLUG_RE.test(input.slug)) {
    throw new Error("Slug invalid (lowercase, angka, tanda hubung).");
  }
  if (!input.country) throw new Error("Pilih negara.");

  const supabase = await createServerClient();

  // Insert position shell — no longer writing to positions.requirements
  // (deprecated in Fase 5, drop in Fase 5D). Library + custom_fields all
  // go straight into position_application_fields below.
  const { error: posErr } = await supabase.from("positions").insert({
    slug: input.slug,
    name: input.name.trim(),
    country: input.country,
    description: input.description?.trim() || null,
    active: true,
  } as never);
  if (posErr) throw new Error(posErr.message);

  // Merge library-curated requirements + admin custom fields into one
  // position_application_fields insert. Library reqs go first (sort_order
  // 0…N-1), custom fields after (sort_order N…N+M-1). Both write to the
  // same canonical table — no more dual-write to position_form_fields.
  const libEntries = Object.entries(input.requirements ?? {});
  const libRows = libEntries.map(([key, req], idx) =>
    libRequirementToField(input.slug, key, (req ?? {}) as LibraryRequirement, idx),
  );

  const customRows = input.custom_fields.map((f, idx) => ({
    position_slug: input.slug,
    field_key: f.field_key,
    field_label: f.field_label,
    field_help: null,
    field_type: f.field_type,
    options: f.options ?? null,
    importance: (f.required ? "required" : "optional") as "required" | "optional",
    section: stageToSection(f.collect_at_stage),
    tier_weight: f.tier_weight ?? 0,
    sort_order: libRows.length + idx,
    collect_at_stage: f.collect_at_stage ?? "applied",
    document_type: null,
  }));

  const allRows = [...libRows, ...customRows];
  if (allRows.length > 0) {
    const { error: pafErr } = await supabase
      .from("position_application_fields")
      .insert(allRows as never);
    if (pafErr) {
      // best-effort cleanup
      await supabase.from("positions").delete().eq("slug", input.slug);
      throw new Error(`Application field error: ${pafErr.message}`);
    }
  }

  revalidatePath("/admin/positions");
  revalidatePath(`/admin/positions/${input.slug}`);
  return { ok: true, slug: input.slug };
}
