-- =========================================================================
-- MIGRATION 0022: position_form_fields — collect_at_stage
-- =========================================================================
-- Adds `collect_at_stage` to position_form_fields. Lets admin specify WHEN
-- in the candidate's pipeline a custom field should be collected, supporting
-- the staged-data-collection model from Phase 0:
--
--   applied        → critical hard-pass disqualifiers (e.g. "Bersedia
--                     tinggal di asrama 6 bulan?")
--   screening      → tier-scoring questions, soft profile fields (default)
--   document_check → motivation essays, detailed bio
--
-- Default 'screening' to avoid front-loading apply form. Aligns with
-- research best-practice (JobStreet redesign, Wellfound criticism on
-- upfront essay walls).
-- =========================================================================

ALTER TABLE position_form_fields
  ADD COLUMN IF NOT EXISTS collect_at_stage pipeline_stage NOT NULL DEFAULT 'screening';

CREATE INDEX IF NOT EXISTS idx_form_fields_position_stage
  ON position_form_fields (position_slug, collect_at_stage, sort_order);

COMMENT ON COLUMN position_form_fields.collect_at_stage IS
  'Pipeline stage at which this custom field should be collected from the candidate. Default screening (post-apply) to keep apply form lean.';

-- =========================================================================
-- DONE — migration 0022
-- =========================================================================
