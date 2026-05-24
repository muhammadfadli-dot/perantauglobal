import { createServerClient } from "./supabase-server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@perantauglobal/db";

/**
 * Per-application completeness — the post-Fase 5 model. Each application
 * stands on its own: filled-ness is computed from applications.answers
 * matched against position_application_fields (not the cross-candidate
 * profile_data.credentials path of the legacy readiness_v3).
 *
 * Used by candidate-facing surfaces:
 *   - /applications/[id]/lengkapi    (this is the form to fill in)
 *   - /applications/[id]/page.tsx    (status + progress)
 *   - /applications/[id]/welcome
 *
 * Admin-facing pre-apply eligibility (readiness_view aggregating across all
 * candidates × positions) remains on the legacy compute_readiness path —
 * different semantics, different table.
 */

export type FieldImportance = "required" | "optional";
export type FieldSection = "syarat_utama" | "kualifikasi" | "screening";

export type ApplicationField = {
  field_key: string;
  field_label: string;
  field_help: string | null;
  field_type: string;
  options: { value: string; label: string }[] | null;
  importance: FieldImportance;
  section: FieldSection;
  tier_weight: number;
  sort_order: number;
  collect_at_stage: Database["public"]["Enums"]["pipeline_stage"];
  document_type: Database["public"]["Enums"]["doc_type"] | null;

  /** Stored answer (if any). For multiselect this is JSON-stringified array. */
  value: string | null;
  /** A doc has been uploaded for this field (file fields only). */
  doc_uploaded: boolean;
  /** Field is satisfied — either answer present or doc uploaded. */
  passed: boolean;
};

export type ApplicationCompleteness = {
  fields: ApplicationField[];
  hard_pass: boolean;
  score_pct: number;
};

const EMPTY: ApplicationCompleteness = {
  fields: [],
  hard_pass: true,
  score_pct: 100,
};

/**
 * Compute completeness for a single application.
 * Returns EMPTY if application not found OR no fields defined yet (treat as
 * "nothing to ask" rather than blocked).
 */
export async function getApplicationCompleteness(
  applicationId: string,
  client?: SupabaseClient<Database>,
): Promise<ApplicationCompleteness & { positionSlug: string | null }> {
  const sb = client ?? (await createServerClient());

  const { data: appData } = await sb
    .from("applications")
    .select("id, position_slug, answers")
    .eq("id", applicationId)
    .single();

  if (!appData) return { ...EMPTY, positionSlug: null };

  const positionSlug = appData.position_slug;
  const answers = (appData.answers as Record<string, unknown> | null) ?? {};

  const [{ data: fieldsData }, { data: docsData }] = await Promise.all([
    sb
      .from("position_application_fields")
      .select(
        "field_key, field_label, field_help, field_type, options, importance, section, tier_weight, sort_order, collect_at_stage, document_type",
      )
      .eq("position_slug", positionSlug)
      .order("sort_order", { ascending: true }),
    sb
      .from("candidate_documents")
      .select("doc_type")
      .eq("application_id", applicationId),
  ]);

  const docsByType = new Set<string>();
  for (const d of (docsData ?? []) as Array<{ doc_type: string }>) {
    docsByType.add(d.doc_type);
  }

  const rawFields = (fieldsData ?? []) as Array<{
    field_key: string;
    field_label: string;
    field_help: string | null;
    field_type: string;
    options: { value: string; label: string }[] | null;
    importance: FieldImportance;
    section: FieldSection;
    tier_weight: number;
    sort_order: number;
    collect_at_stage: Database["public"]["Enums"]["pipeline_stage"];
    document_type: Database["public"]["Enums"]["doc_type"] | null;
  }>;

  const fields: ApplicationField[] = rawFields.map((f) => {
    const rawAnswer = answers[f.field_key];
    const value =
      rawAnswer == null
        ? null
        : typeof rawAnswer === "string"
          ? rawAnswer
          : Array.isArray(rawAnswer)
            ? JSON.stringify(rawAnswer)
            : String(rawAnswer);

    const docUploaded = f.field_type === "file" && f.document_type
      ? docsByType.has(f.document_type)
      : false;

    const answerPassed =
      value !== null && value !== "" && value !== "[]" && value !== "null";

    const passed = f.field_type === "file" ? docUploaded : answerPassed;

    return {
      field_key: f.field_key,
      field_label: f.field_label,
      field_help: f.field_help,
      field_type: f.field_type,
      options: f.options,
      importance: f.importance,
      section: f.section,
      tier_weight: f.tier_weight,
      sort_order: f.sort_order,
      collect_at_stage: f.collect_at_stage,
      document_type: f.document_type,
      value,
      doc_uploaded: docUploaded,
      passed,
    };
  });

  const required = fields.filter((f) => f.importance === "required");
  const hardPass = required.every((f) => f.passed);

  const total = fields.length;
  const passedCount = fields.filter((f) => f.passed).length;
  const scorePct = total === 0 ? 100 : Math.round((passedCount / total) * 100);

  return {
    fields,
    hard_pass: hardPass,
    score_pct: scorePct,
    positionSlug,
  };
}
