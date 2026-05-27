import { createServerClient } from "./supabase-server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@perantauglobal/db";

/**
 * Per-application completeness — the post-Fase 5 model. Each application
 * stands on its own: filled-ness is computed from applications.answers
 * matched against position_application_fields (no cross-application bleed
 * via the old shared profile_data.credentials path, which was sunset).
 *
 * Used by candidate-facing surfaces:
 *   - /applications/[id]/lengkapi    (this is the form to fill in)
 *   - /applications/[id]/page.tsx    (status + progress)
 *   - /applications/[id]/welcome
 *
 * Admin-facing equivalent: application_readiness_view (SQL view, same
 * underlying inputs, exposes only hard_pass per application). Use that
 * when you need per-app hard_pass without the per-field detail.
 */

export type FieldImportance = "required" | "optional";
export type FieldSection = "syarat_utama" | "kualifikasi" | "screening";

/**
 * Option for radio/select/multiselect fields.
 * `qualifying` (added 2026-05-28): when true, picking this option counts the
 * field as "passing" for hard_pass. When omitted/null on every option, the
 * field falls back to legacy presence-check (answer just needs to exist).
 */
export type FieldOption = {
  value: string;
  label: string;
  qualifying?: boolean;
};

export type ApplicationField = {
  field_key: string;
  field_label: string;
  field_help: string | null;
  field_type: string;
  options: FieldOption[] | null;
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
  /**
   * Field is satisfied for hard_pass:
   * - file: doc uploaded
   * - radio/select/text with options carrying `qualifying`: answer matches a qualifying option
   * - multiselect with options carrying `qualifying`: at least one selected value is qualifying
   * - everything else: presence check (legacy fallback)
   */
  passed: boolean;
  /**
   * Did the candidate provide some answer? Distinct from `passed` — useful
   * for showing a "answered but not qualifying" state in admin UI.
   */
  answered: boolean;
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
    options: FieldOption[] | null;
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

    const answered =
      value !== null && value !== "" && value !== "[]" && value !== "null";

    const hasQualifyingFlag = f.options?.some((o) => typeof o.qualifying === "boolean") ?? false;

    let passed: boolean;
    if (f.field_type === "file") {
      passed = docUploaded;
    } else if (!answered) {
      passed = false;
    } else if (!hasQualifyingFlag) {
      passed = true;
    } else if (f.field_type === "multiselect" && Array.isArray(rawAnswer)) {
      passed = rawAnswer.some((sel) => {
        const opt = f.options?.find((o) => o.value === sel);
        return opt?.qualifying === true;
      });
    } else {
      const opt = f.options?.find((o) => o.value === value);
      passed = opt?.qualifying === true;
    }

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
      answered,
    };
  });

  const required = fields.filter((f) => f.importance === "required");
  const hardPass = required.every((f) => f.passed);

  // score_pct = completeness (how much of the form is filled). This is the
  // candidate-facing progress signal — fills as they answer questions,
  // regardless of whether their answer is qualifying. Admin uses
  // `hard_pass` (qualifying-aware) for the actual eligibility check.
  const total = fields.length;
  const answeredCount = fields.filter((f) => f.answered || (f.field_type === "file" && f.doc_uploaded)).length;
  const scorePct = total === 0 ? 100 : Math.round((answeredCount / total) * 100);

  return {
    fields,
    hard_pass: hardPass,
    score_pct: scorePct,
    positionSlug,
  };
}
