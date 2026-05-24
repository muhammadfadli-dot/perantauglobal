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

export type CreatePositionInput = {
  name: string;
  slug: string;
  country: string;
  description: string;
  requirements: Record<string, unknown>;
  custom_fields: CustomFieldDraft[];
};

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

  const { error: posErr } = await supabase.from("positions").insert({
    slug: input.slug,
    name: input.name.trim(),
    country: input.country,
    description: input.description?.trim() || null,
    active: true,
    requirements: input.requirements,
  } as never);
  if (posErr) throw new Error(posErr.message);

  if (input.custom_fields.length > 0) {
    // Write to NEW position_application_fields (canonical source post Fase 2).
    // Old position_form_fields still gets a parallel write until Fase 4
    // sunset — keeps web /lowongan apply form working while the candidate
    // side hasn't flipped yet.
    const stageToSection = (
      stage: CustomFieldDraft["collect_at_stage"] | undefined,
    ): "syarat_utama" | "kualifikasi" | "screening" => {
      if (stage === "applied") return "syarat_utama";
      if (stage === "document_check") return "screening";
      return "kualifikasi";
    };

    const pafRows = input.custom_fields.map((f, idx) => ({
      position_slug: input.slug,
      field_key: f.field_key,
      field_label: f.field_label,
      field_type: f.field_type,
      options: f.options ?? null,
      importance: f.required ? "required" : "optional",
      section: stageToSection(f.collect_at_stage),
      tier_weight: f.tier_weight ?? 0,
      sort_order: idx,
      collect_at_stage: f.collect_at_stage ?? "applied",
    }));
    const { error: pafErr } = await supabase
      .from("position_application_fields")
      .insert(pafRows as never);
    if (pafErr) {
      await supabase.from("positions").delete().eq("slug", input.slug);
      throw new Error(`Application field error: ${pafErr.message}`);
    }

    const legacyRows = input.custom_fields.map((f, idx) => ({
      position_slug: input.slug,
      field_key: f.field_key,
      field_label: f.field_label,
      field_type: f.field_type,
      options: f.options ?? null,
      required: f.required ?? false,
      tier_weight: f.tier_weight ?? 0,
      sort_order: idx,
      collect_at_stage: f.collect_at_stage ?? "applied",
    }));
    const { error: legacyErr } = await supabase
      .from("position_form_fields")
      .insert(legacyRows as never);
    if (legacyErr) {
      // best-effort cleanup
      await supabase.from("position_application_fields").delete().eq("position_slug", input.slug);
      await supabase.from("positions").delete().eq("slug", input.slug);
      throw new Error(`Legacy custom field error: ${legacyErr.message}`);
    }
  }

  revalidatePath("/admin/positions");
  revalidatePath(`/admin/positions/${input.slug}`);
  return { ok: true, slug: input.slug };
}
