import { createServerClient } from "./supabase-server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@perantauglobal/db";
import { getRequirementVocabulary } from "@perantauglobal/db/schemas/requirements";

/**
 * Readiness v3 — joins candidate profile + documents to compute pass/fail
 * per requirement key, including document_filter matching against
 * candidate_documents.metadata.
 *
 * Wraps the SQL function `compute_readiness_v3(candidate_id, position_slug)`
 * added in migration 0021. Falls back to a stable empty-result on error.
 */

export type EvidenceMode = "self_declared" | "document" | "either";
export type RequirementImportance = "hard" | "soft";
export type RequirementCategory =
  | "personal"
  | "certification"
  | "language"
  | "experience";
export type PipelineStage = Database["public"]["Enums"]["pipeline_stage"];

export type ReadinessFieldV3 = {
  passed: boolean;
  self_passed: boolean;
  doc_passed: boolean;
  importance: RequirementImportance;
  category: RequirementCategory;
  evidence_mode: EvidenceMode;
  label: string;
  collect_at_stage: PipelineStage;
};

export type ReadinessResultV3 = {
  per_field: Record<string, ReadinessFieldV3>;
  hard_pass: boolean;
  score_pct: number;
  schema_version: 3;
};

const EMPTY: ReadinessResultV3 = {
  per_field: {},
  hard_pass: true,
  score_pct: 100,
  schema_version: 3,
};

export async function getReadinessV3(
  candidateId: string,
  positionSlug: string,
  client?: SupabaseClient<Database>,
): Promise<ReadinessResultV3> {
  const sb = client ?? (await createServerClient());
  const { data, error } = await sb.rpc("compute_readiness_v3", {
    p_candidate_id: candidateId,
    p_position_slug: positionSlug,
  });
  if (error || !data) return EMPTY;
  return data as unknown as ReadinessResultV3;
}

/**
 * Readiness, augmented with the source requirement definition (allowed_values,
 * description, document_type, document_filter, value_labels). Convenient for
 * UIs that need to render the form to *fill* a requirement, not just display
 * its pass state.
 */
export type RequirementDef = {
  key: string;
  label: string;
  importance: RequirementImportance;
  category: RequirementCategory;
  evidence_mode: EvidenceMode;
  allowed_values?: string[];
  value_labels?: Record<string, string>;
  description?: string;
  document_type?: string;
  document_filter?: Record<string, unknown>;
  collect_at_stage?: PipelineStage;
};

export type RequirementWithStatus = RequirementDef & {
  passed: boolean;
  self_passed: boolean;
  doc_passed: boolean;
};

export async function getRequirementsWithStatus(
  candidateId: string,
  positionSlug: string,
  client?: SupabaseClient<Database>,
): Promise<{
  requirements: RequirementWithStatus[];
  hard_pass: boolean;
  score_pct: number;
}> {
  const sb = client ?? (await createServerClient());

  const [{ data: posData }, readiness] = await Promise.all([
    sb.from("positions").select("requirements").eq("slug", positionSlug).single(),
    getReadinessV3(candidateId, positionSlug, sb),
  ]);

  const reqs = (posData?.requirements ?? {}) as Record<string, RequirementDef>;

  const requirements: RequirementWithStatus[] = Object.entries(reqs).map(
    ([key, raw]) => {
      const status = readiness.per_field[key];
      const vocab =
        raw.allowed_values && raw.allowed_values.length > 0
          ? undefined
          : getRequirementVocabulary(key);
      return {
        key,
        label: raw.label ?? key,
        importance: raw.importance ?? "hard",
        category: raw.category ?? "personal",
        evidence_mode: raw.evidence_mode ?? "self_declared",
        allowed_values: raw.allowed_values ?? vocab?.allowed_values,
        value_labels: raw.value_labels ?? vocab?.value_labels,
        description: raw.description,
        document_type: raw.document_type,
        document_filter: raw.document_filter,
        collect_at_stage: raw.collect_at_stage,
        passed: status?.passed ?? false,
        self_passed: status?.self_passed ?? false,
        doc_passed: status?.doc_passed ?? false,
      };
    },
  );

  return {
    requirements,
    hard_pass: readiness.hard_pass,
    score_pct: readiness.score_pct,
  };
}
