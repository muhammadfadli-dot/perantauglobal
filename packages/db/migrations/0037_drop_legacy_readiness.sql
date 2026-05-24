-- =========================================================================
-- MIGRATION 0037: drop legacy readiness path
-- =========================================================================
-- Final cleanup of the position-model rework. Removes:
--   - readiness_view (cross-join candidates × positions, computed from
--     candidates.profile_data.credentials + positions.requirements)
--   - compute_readiness(profile, requirements) SQL function
--   - compute_readiness_v3(candidate_id, position_slug) SQL function
--   - migrate_requirement_v2_to_v3(req) backfill helper
--   - positions.requirements JSONB column
--
-- Replaced by application_readiness_view — per-application hard_pass
-- computed from applications.answers + position_application_fields. New
-- semantics match the Fase 5 fresh-per-apply model (no cross-application
-- bleed via shared credentials).
--
-- 4 callers updated in this same PR (dashboard, applications list, admin
-- candidates list, admin positions list).
-- =========================================================================

DROP VIEW IF EXISTS readiness_view CASCADE;
DROP FUNCTION IF EXISTS compute_readiness(jsonb, jsonb) CASCADE;
DROP FUNCTION IF EXISTS compute_readiness_v3(uuid, text) CASCADE;
DROP FUNCTION IF EXISTS migrate_requirement_v2_to_v3(jsonb) CASCADE;
ALTER TABLE positions DROP COLUMN IF EXISTS requirements;

-- New per-application readiness view. hard_pass = TRUE if all required
-- fields are satisfied (either an answer is stored or, for file fields,
-- a document of the required type is uploaded for the application).
-- Applications with no required fields trivially pass (hard_pass=TRUE).
CREATE VIEW application_readiness_view AS
SELECT
  a.id AS application_id,
  a.candidate_id,
  a.position_slug,
  COALESCE(
    (
      SELECT BOOL_AND(
        CASE
          WHEN paf.field_type = 'file' AND paf.document_type IS NOT NULL THEN EXISTS (
            SELECT 1 FROM candidate_documents cd
            WHERE cd.application_id = a.id AND cd.doc_type = paf.document_type
          )
          ELSE (a.answers ->> paf.field_key) IS NOT NULL
            AND (a.answers ->> paf.field_key) NOT IN ('', '[]', 'null')
        END
      )
      FROM position_application_fields paf
      WHERE paf.position_slug = a.position_slug
        AND paf.importance = 'required'
    ),
    TRUE
  ) AS hard_pass
FROM applications a;

COMMENT ON VIEW application_readiness_view IS
  'Per-application hard_pass: TRUE when all required fields in position_application_fields are satisfied via applications.answers or candidate_documents. Replaces legacy readiness_view post-Fase 6B.';

-- RLS — view inherits security from underlying tables. Anon should NOT see
-- this view (applications + candidate_documents are not public). Grants
-- restricted to authenticated.
REVOKE ALL ON application_readiness_view FROM PUBLIC;
GRANT SELECT ON application_readiness_view TO authenticated;
