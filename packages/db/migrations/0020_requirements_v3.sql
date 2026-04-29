-- =========================================================================
-- MIGRATION 0020: requirements v3 — category + evidence_mode + collect_at_stage
-- =========================================================================
-- Extends positions.requirements JSONB schema from v2 to v3.
--
-- v2 shape: { key: { type: "hard"|"soft", label, allowed_values? } }
-- v3 shape: { key: {
--   importance: "hard"|"soft",        -- renamed from `type`
--   label,
--   allowed_values?,
--   category: "personal"|"certification"|"language"|"experience",
--   evidence_mode: "document"|"self_declared"|"either",
--   collect_at_stage: pipeline_stage, -- when in pipeline this is required
--   document_type?,                    -- ref candidate_documents.doc_type
--   document_filter?,                  -- JSONB filter on doc metadata
--   description?,
--   value_labels?
-- }}
--
-- Backfill heuristics:
--   - category from key/label keyword match (jlpt/inggris → language, etc.)
--   - evidence_mode default 'self_declared' (lossless — was implicit before)
--   - collect_at_stage: hard → 'applied', soft → 'screening'
--   - rename `type` → `importance` (keep both temporarily for backward compat)
--
-- compute_readiness() updates: handle v3 field shape, fall back to v2 if
-- importance/category absent.
-- =========================================================================

-- =========================================================================
-- Step 1: Helper function to backfill v3 fields from v2 row
-- =========================================================================

CREATE OR REPLACE FUNCTION migrate_requirement_v2_to_v3(req JSONB) RETURNS JSONB
LANGUAGE plpgsql IMMUTABLE AS $$
DECLARE
  result JSONB := req;
  inferred_category TEXT;
  inferred_stage TEXT;
  imp TEXT;
  lbl TEXT;
BEGIN
  -- Rename type → importance (keep type for backward compat readers)
  IF (result ? 'type') AND NOT (result ? 'importance') THEN
    result := result || jsonb_build_object('importance', result->>'type');
  END IF;

  imp := COALESCE(result->>'importance', result->>'type', 'hard');
  lbl := COALESCE(result->>'label', '');

  -- Infer category if absent
  IF NOT (result ? 'category') THEN
    inferred_category := CASE
      WHEN lbl ILIKE '%bahasa%' OR lbl ILIKE '%jlpt%' OR lbl ILIKE '%inggris%'
        OR lbl ILIKE '%arab%' OR lbl ILIKE '%korea%' OR lbl ILIKE '%topik%'
        THEN 'language'
      WHEN lbl ILIKE '%sertifik%' OR lbl ILIKE '%STR%' OR lbl ILIKE '%SIM%'
        OR lbl ILIKE '%license%'
        THEN 'certification'
      WHEN lbl ILIKE '%pengalaman%' OR lbl ILIKE '%experience%'
        THEN 'experience'
      ELSE 'personal'
    END;
    result := result || jsonb_build_object('category', inferred_category);
  END IF;

  -- Default evidence_mode = self_declared (matches existing behavior)
  IF NOT (result ? 'evidence_mode') THEN
    result := result || jsonb_build_object('evidence_mode', 'self_declared');
  END IF;

  -- Default collect_at_stage based on importance
  IF NOT (result ? 'collect_at_stage') THEN
    inferred_stage := CASE WHEN imp = 'hard' THEN 'applied' ELSE 'screening' END;
    result := result || jsonb_build_object('collect_at_stage', inferred_stage);
  END IF;

  RETURN result;
END;
$$;

-- =========================================================================
-- Step 2: Backfill all existing positions to v3
-- =========================================================================

UPDATE positions
SET requirements = (
  SELECT jsonb_object_agg(key, migrate_requirement_v2_to_v3(value))
  FROM jsonb_each(requirements)
)
WHERE requirements IS NOT NULL
  AND requirements != '{}'::jsonb;

-- =========================================================================
-- Step 3: Update compute_readiness() to handle v3 (backward compat)
-- =========================================================================
-- Note: still takes (profile, requirements). Document-evidence checking
-- requires candidate_documents access — added in 0021 as new function
-- compute_readiness_v3(candidate_id, position_slug). This 0020 update only
-- handles the field-shape change, not document evidence.

DROP VIEW IF EXISTS readiness_view;
DROP FUNCTION IF EXISTS compute_readiness(JSONB, JSONB);

CREATE OR REPLACE FUNCTION compute_readiness(
  profile JSONB,
  requirements JSONB
) RETURNS JSONB
LANGUAGE plpgsql IMMUTABLE AS $$
DECLARE
  per_field JSONB := '{}'::jsonb;
  req_key TEXT;
  req_value JSONB;
  req_importance TEXT;
  req_category TEXT;
  req_evidence_mode TEXT;
  req_allowed JSONB;
  passed BOOLEAN;
  total_count INT := 0;
  passed_count INT := 0;
  hard_pass BOOLEAN := TRUE;
  score_pct INT := 100;
  profile_creds JSONB;
  profile_value JSONB;
BEGIN
  IF requirements IS NULL OR requirements = '{}'::jsonb THEN
    RETURN jsonb_build_object('per_field', '{}'::jsonb, 'hard_pass', true, 'score_pct', 100);
  END IF;

  profile_creds := COALESCE(profile -> 'credentials', profile, '{}'::jsonb);

  FOR req_key IN SELECT jsonb_object_keys(requirements) LOOP
    req_value := requirements -> req_key;
    -- v3 prefers `importance`, falls back to `type` (v2)
    req_importance := COALESCE(req_value ->> 'importance', req_value ->> 'type', 'hard');
    req_category := COALESCE(req_value ->> 'category', 'personal');
    req_evidence_mode := COALESCE(req_value ->> 'evidence_mode', 'self_declared');
    req_allowed := req_value -> 'allowed_values';
    profile_value := profile_creds -> req_key;
    total_count := total_count + 1;

    -- This function only handles self_declared evidence (profile_data check).
    -- For document/either evidence, callers should use compute_readiness_v3.
    IF req_allowed IS NOT NULL AND jsonb_typeof(req_allowed) = 'array' THEN
      passed := profile_value IS NOT NULL
                AND jsonb_typeof(profile_value) != 'null'
                AND req_allowed @> to_jsonb(profile_creds ->> req_key);
    ELSE
      passed := profile_value IS NOT NULL
                AND jsonb_typeof(profile_value) != 'null'
                AND (jsonb_typeof(profile_value) != 'string' OR profile_creds ->> req_key != '');
    END IF;

    IF passed THEN
      passed_count := passed_count + 1;
    ELSIF req_importance = 'hard' THEN
      hard_pass := FALSE;
    END IF;

    per_field := per_field || jsonb_build_object(
      req_key,
      jsonb_build_object(
        'passed', passed,
        'importance', req_importance,
        'category', req_category,
        'evidence_mode', req_evidence_mode,
        'label', COALESCE(req_value ->> 'label', req_key),
        'collect_at_stage', COALESCE(req_value ->> 'collect_at_stage', 'screening')
      )
    );
  END LOOP;

  IF total_count > 0 THEN
    score_pct := (passed_count * 100) / total_count;
  END IF;

  RETURN jsonb_build_object(
    'per_field', per_field,
    'hard_pass', hard_pass,
    'score_pct', score_pct,
    'schema_version', 3
  );
END;
$$;

-- Recreate readiness_view (signature unchanged at view level)
CREATE OR REPLACE VIEW readiness_view AS
SELECT
  c.id AS candidate_id,
  p.slug AS position_slug,
  p.name AS position_name,
  p.country,
  compute_readiness(c.profile_data, p.requirements) AS readiness,
  (compute_readiness(c.profile_data, p.requirements) ->> 'score_pct')::int AS completion_pct,
  ((compute_readiness(c.profile_data, p.requirements) ->> 'hard_pass')::boolean) AS hard_pass
FROM candidates c
CROSS JOIN positions p
WHERE p.active = true;

-- =========================================================================
-- DONE — migration 0020 (v3 schema field shape, self-declared only)
-- =========================================================================
-- Document-evidence support comes in 0021 with compute_readiness_v3()
-- =========================================================================
