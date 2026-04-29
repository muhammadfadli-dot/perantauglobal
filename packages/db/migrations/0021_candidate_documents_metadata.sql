-- =========================================================================
-- MIGRATION 0021: candidate_documents — extended doc_type + metadata
-- =========================================================================
-- Extends doc_type enum to support reusable specific certificates, and
-- adds metadata JSONB + expires_at + display_name columns to enable
-- per-position requirement matching via document filters.
--
-- Approach (per Phase 0 design, Opsi B):
--   - Curated enum (~16 doc types, additive)
--   - metadata JSONB for type-specific extras (level, language, issuer)
--   - expires_at TIMESTAMPTZ as first-class queryable column
--   - display_name TEXT for human-friendly cards in UI
--
-- Existing rows with doc_type='certificate' (single bucket) stay as-is.
-- Admin can recategorize manually post-migration if needed.
-- =========================================================================

-- =========================================================================
-- Step 1: Extend doc_type enum (additive, no breaking change)
-- =========================================================================
-- Existing values (kept): ktp, passport, cv, certificate, medical, photo, other

ALTER TYPE doc_type ADD VALUE IF NOT EXISTS 'formal_photo';
ALTER TYPE doc_type ADD VALUE IF NOT EXISTS 'str_certificate';
ALTER TYPE doc_type ADD VALUE IF NOT EXISTS 'driving_license';
ALTER TYPE doc_type ADD VALUE IF NOT EXISTS 'language_certificate';
ALTER TYPE doc_type ADD VALUE IF NOT EXISTS 'professional_certificate';
ALTER TYPE doc_type ADD VALUE IF NOT EXISTS 'education_certificate';
ALTER TYPE doc_type ADD VALUE IF NOT EXISTS 'work_certificate';
ALTER TYPE doc_type ADD VALUE IF NOT EXISTS 'medical_check';

-- =========================================================================
-- Step 2: Add metadata, expires_at, display_name to candidate_documents
-- =========================================================================

ALTER TABLE candidate_documents
  ADD COLUMN IF NOT EXISTS metadata     JSONB        NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS expires_at   TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS display_name TEXT;

-- Constrain metadata size (defense in depth)
ALTER TABLE candidate_documents
  ADD CONSTRAINT candidate_documents_metadata_size
    CHECK (pg_column_size(metadata) < 4096);

-- =========================================================================
-- Step 3: Indexes for compute_readiness_v3 queries
-- =========================================================================
-- Match pattern: WHERE candidate_id = ? AND doc_type = ? AND
--                (expires_at IS NULL OR expires_at > NOW())
--                AND metadata @> ?

CREATE INDEX IF NOT EXISTS idx_docs_candidate_type_expiry
  ON candidate_documents (candidate_id, doc_type, expires_at);

-- GIN index for metadata containment queries (jsonb @> filter)
CREATE INDEX IF NOT EXISTS idx_docs_metadata_gin
  ON candidate_documents USING GIN (metadata jsonb_path_ops);

-- =========================================================================
-- Step 4: compute_readiness_v3 — joins documents + profile for full evidence check
-- =========================================================================
-- New function. Existing compute_readiness() (self-declared only) stays
-- for backward compat with readiness_view & legacy callers.
--
-- v3 logic per requirement:
--   evidence_mode = 'self_declared' → check profile_data.credentials.<key>
--   evidence_mode = 'document'      → check candidate_documents matching
--                                     doc_type + document_filter, not expired
--   evidence_mode = 'either'        → either passes
-- =========================================================================

CREATE OR REPLACE FUNCTION compute_readiness_v3(
  p_candidate_id UUID,
  p_position_slug TEXT
) RETURNS JSONB
LANGUAGE plpgsql STABLE AS $$
DECLARE
  v_profile JSONB;
  v_requirements JSONB;
  v_per_field JSONB := '{}'::jsonb;
  v_req_key TEXT;
  v_req_value JSONB;
  v_req_importance TEXT;
  v_req_category TEXT;
  v_req_evidence_mode TEXT;
  v_req_allowed JSONB;
  v_req_doc_type TEXT;
  v_req_doc_filter JSONB;
  v_self_passed BOOLEAN;
  v_doc_passed BOOLEAN;
  v_passed BOOLEAN;
  v_total_count INT := 0;
  v_passed_count INT := 0;
  v_hard_pass BOOLEAN := TRUE;
  v_score_pct INT := 100;
  v_profile_creds JSONB;
  v_profile_value JSONB;
BEGIN
  SELECT profile_data INTO v_profile FROM candidates WHERE id = p_candidate_id;
  SELECT requirements INTO v_requirements FROM positions WHERE slug = p_position_slug;

  IF v_requirements IS NULL OR v_requirements = '{}'::jsonb THEN
    RETURN jsonb_build_object(
      'per_field', '{}'::jsonb,
      'hard_pass', true,
      'score_pct', 100,
      'schema_version', 3
    );
  END IF;

  v_profile_creds := COALESCE(v_profile -> 'credentials', v_profile, '{}'::jsonb);

  FOR v_req_key IN SELECT jsonb_object_keys(v_requirements) LOOP
    v_req_value := v_requirements -> v_req_key;
    v_req_importance := COALESCE(v_req_value ->> 'importance', v_req_value ->> 'type', 'hard');
    v_req_category := COALESCE(v_req_value ->> 'category', 'personal');
    v_req_evidence_mode := COALESCE(v_req_value ->> 'evidence_mode', 'self_declared');
    v_req_allowed := v_req_value -> 'allowed_values';
    v_req_doc_type := v_req_value ->> 'document_type';
    v_req_doc_filter := COALESCE(v_req_value -> 'document_filter', '{}'::jsonb);
    v_profile_value := v_profile_creds -> v_req_key;
    v_total_count := v_total_count + 1;

    -- Check self-declared evidence
    v_self_passed := FALSE;
    IF v_req_evidence_mode IN ('self_declared', 'either') THEN
      IF v_req_allowed IS NOT NULL AND jsonb_typeof(v_req_allowed) = 'array' THEN
        v_self_passed := v_profile_value IS NOT NULL
                         AND jsonb_typeof(v_profile_value) != 'null'
                         AND v_req_allowed @> to_jsonb(v_profile_creds ->> v_req_key);
      ELSE
        v_self_passed := v_profile_value IS NOT NULL
                         AND jsonb_typeof(v_profile_value) != 'null'
                         AND (jsonb_typeof(v_profile_value) != 'string' OR v_profile_creds ->> v_req_key != '');
      END IF;
    END IF;

    -- Check document evidence
    v_doc_passed := FALSE;
    IF v_req_evidence_mode IN ('document', 'either') AND v_req_doc_type IS NOT NULL THEN
      v_doc_passed := EXISTS (
        SELECT 1 FROM candidate_documents cd
        WHERE cd.candidate_id = p_candidate_id
          AND cd.doc_type::text = v_req_doc_type
          AND (cd.expires_at IS NULL OR cd.expires_at > NOW())
          AND (v_req_doc_filter = '{}'::jsonb OR cd.metadata @> v_req_doc_filter)
      );
    END IF;

    -- Combine per evidence_mode
    v_passed := CASE v_req_evidence_mode
      WHEN 'self_declared' THEN v_self_passed
      WHEN 'document'      THEN v_doc_passed
      WHEN 'either'        THEN v_self_passed OR v_doc_passed
      ELSE FALSE
    END;

    IF v_passed THEN
      v_passed_count := v_passed_count + 1;
    ELSIF v_req_importance = 'hard' THEN
      v_hard_pass := FALSE;
    END IF;

    v_per_field := v_per_field || jsonb_build_object(
      v_req_key,
      jsonb_build_object(
        'passed', v_passed,
        'self_passed', v_self_passed,
        'doc_passed', v_doc_passed,
        'importance', v_req_importance,
        'category', v_req_category,
        'evidence_mode', v_req_evidence_mode,
        'label', COALESCE(v_req_value ->> 'label', v_req_key),
        'collect_at_stage', COALESCE(v_req_value ->> 'collect_at_stage', 'screening')
      )
    );
  END LOOP;

  IF v_total_count > 0 THEN
    v_score_pct := (v_passed_count * 100) / v_total_count;
  END IF;

  RETURN jsonb_build_object(
    'per_field', v_per_field,
    'hard_pass', v_hard_pass,
    'score_pct', v_score_pct,
    'schema_version', 3
  );
END;
$$;

-- Tighten EXECUTE (per project security policy, see migration 0018 pattern)
REVOKE EXECUTE ON FUNCTION compute_readiness_v3(UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION compute_readiness_v3(UUID, TEXT) TO authenticated;

-- Pin search_path (per migration 0019 pattern)
ALTER FUNCTION compute_readiness_v3(UUID, TEXT) SET search_path = public, pg_temp;

-- =========================================================================
-- DONE — migration 0021
-- =========================================================================
-- Next: 0022 adds collect_at_stage to position_form_fields
-- =========================================================================
