-- =========================================================================
-- MIGRATION 0031: position_application_fields
-- =========================================================================
-- Consolidates positions.requirements (JSONB v3) + position_form_fields
-- into one source of truth. Both originals remain for now (additive); they
-- will be sunset in migration 0034+ after admin editor + candidate flip.
--
-- Mental model:
--   - One row per question the admin authors for a position.
--   - Section: syarat_utama (hard at apply) | kualifikasi (soft, tier scoring)
--     | screening (deferred, post-apply).
--   - importance: required (must-pass) | optional (bonus, contributes to score).
--   - field_type: select|radio|text|textarea|number|multiselect|file (reuses
--     existing enum form_field_type).
--   - collect_at_stage: pipeline_stage enum (applied|screening|document_check).
-- =========================================================================

CREATE TYPE application_field_importance AS ENUM ('required', 'optional');
CREATE TYPE application_field_section AS ENUM ('syarat_utama', 'kualifikasi', 'screening');

CREATE TABLE position_application_fields (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  position_slug   TEXT NOT NULL REFERENCES positions(slug) ON DELETE CASCADE,

  sort_order      INTEGER NOT NULL DEFAULT 0,
  section         application_field_section NOT NULL DEFAULT 'kualifikasi',

  field_key       TEXT NOT NULL,
  field_label     TEXT NOT NULL,
  field_help      TEXT,
  field_type      form_field_type NOT NULL,
  options         JSONB,

  importance      application_field_importance NOT NULL DEFAULT 'optional',
  tier_weight     INTEGER NOT NULL DEFAULT 0,
  collect_at_stage pipeline_stage NOT NULL DEFAULT 'applied',

  document_type   doc_type,

  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT uniq_paf_position_field_key UNIQUE (position_slug, field_key)
);

CREATE INDEX idx_paf_position ON position_application_fields (position_slug, section, sort_order);

CREATE TRIGGER trg_paf_updated_at
  BEFORE UPDATE ON position_application_fields
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =========================================================================
-- RLS
-- =========================================================================
ALTER TABLE position_application_fields ENABLE ROW LEVEL SECURITY;

CREATE POLICY "paf_anon_read"
  ON position_application_fields FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "paf_admin_all"
  ON position_application_fields FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- =========================================================================
-- Backfill: position_form_fields → position_application_fields
-- =========================================================================
-- Maps required → importance (true → 'required', false → 'optional'),
-- collect_at_stage → section (applied → syarat_utama, screening → kualifikasi,
-- document_check → screening). Preserves tier_weight, sort_order, options.
-- =========================================================================
INSERT INTO position_application_fields (
  position_slug, sort_order, section,
  field_key, field_label, field_help, field_type, options,
  importance, tier_weight, collect_at_stage
)
SELECT
  pff.position_slug,
  pff.sort_order,
  CASE pff.collect_at_stage
    WHEN 'applied'::pipeline_stage        THEN 'syarat_utama'::application_field_section
    WHEN 'screening'::pipeline_stage      THEN 'kualifikasi'::application_field_section
    ELSE 'screening'::application_field_section
  END,
  pff.field_key,
  pff.field_label,
  pff.field_help,
  pff.field_type,
  pff.options,
  CASE WHEN pff.required THEN 'required' ELSE 'optional' END::application_field_importance,
  pff.tier_weight,
  pff.collect_at_stage
FROM position_form_fields pff
ON CONFLICT (position_slug, field_key) DO NOTHING;

-- =========================================================================
-- Backfill: positions.requirements (v3 JSONB) → position_application_fields
-- =========================================================================
-- Each requirement key becomes a field. importance type=hard|soft maps to
-- required|optional. allowed_values + value_labels become options JSONB.
-- If a key already exists from position_form_fields backfill, skip
-- (form_fields wins — they're more structured).
-- =========================================================================
WITH expanded AS (
  SELECT
    p.slug AS position_slug,
    req.key AS field_key,
    req.value AS req_value,
    row_number() OVER (PARTITION BY p.slug ORDER BY req.key) AS rn
  FROM positions p
  CROSS JOIN LATERAL jsonb_each(p.requirements) AS req
  WHERE p.requirements IS NOT NULL AND p.requirements != '{}'::jsonb
)
INSERT INTO position_application_fields (
  position_slug, sort_order, section,
  field_key, field_label, field_help, field_type, options,
  importance, tier_weight, collect_at_stage
)
SELECT
  e.position_slug,
  1000 + e.rn::int AS sort_order,
  CASE COALESCE(e.req_value->>'collect_at_stage', 'applied')
    WHEN 'applied'        THEN 'syarat_utama'::application_field_section
    WHEN 'screening'      THEN 'kualifikasi'::application_field_section
    ELSE 'screening'::application_field_section
  END AS section,
  e.field_key,
  COALESCE(e.req_value->>'label', e.field_key) AS field_label,
  e.req_value->>'description' AS field_help,
  CASE
    WHEN (e.req_value->'allowed_values') IS NOT NULL THEN 'radio'::form_field_type
    ELSE 'text'::form_field_type
  END AS field_type,
  CASE
    WHEN (e.req_value->'allowed_values') IS NOT NULL THEN (
      SELECT jsonb_agg(
        jsonb_build_object(
          'value', av,
          'label', COALESCE(e.req_value->'value_labels'->>av, av)
        )
        ORDER BY av
      )
      FROM jsonb_array_elements_text(e.req_value->'allowed_values') AS av
    )
    ELSE NULL
  END AS options,
  CASE
    WHEN COALESCE(e.req_value->>'importance', e.req_value->>'type') = 'hard' THEN 'required'
    ELSE 'optional'
  END::application_field_importance AS importance,
  0 AS tier_weight,
  COALESCE((e.req_value->>'collect_at_stage')::pipeline_stage, 'applied'::pipeline_stage) AS collect_at_stage
FROM expanded e
ON CONFLICT (position_slug, field_key) DO NOTHING;

-- =========================================================================
-- DONE — migration 0031
-- =========================================================================
