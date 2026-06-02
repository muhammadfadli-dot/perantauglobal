-- Migration 0059: optional gender screener for single-gender positions
-- Applied to prod Supabase project jeadtvxgxmqnsqwxjmhj on 2026-06-02.
--
-- Context: single-gender roles (Saudi male-only / female-only, Japan caregiver, etc.)
-- did not ask gender at all on the apply form, so a wrong-gender applicant could
-- apply and still show hard_pass=true. (chef-pastry already had a legacy gender_male
-- field, left untouched.)
--
-- Decision (Panji, 2026-06-02): add gender as OPTIONAL — collect the answer and show
-- the question, but do NOT gate hard_pass. Rationale: making it required would flip
-- hundreds of in-flight applicants whose candidates.gender is unknown to "not ready"
-- (e.g. truck-driver-jepang: 173 of 249). Optional = zero readiness disruption.
--
-- Per-option `qualifying` flags ARE set to match each role's allowed gender, so the
-- field can be promoted to importance='required' later (one UPDATE) and gate correctly
-- with no rework. Optional fields don't enter the hard_pass `required` gate, so the
-- flags are inert for now.
--
-- Additive only: touches no existing field. sort_order = (min existing - 1) so the
-- question appears first. Existing applications are backfilled from candidates.gender
-- where known (additive — never overwrites an existing answer). Reverse with:
--   DELETE FROM position_application_fields WHERE field_key='jenis_kelamin' AND created_at::date='2026-06-02';
--   UPDATE applications SET answers = answers - 'jenis_kelamin' WHERE ...;

-- ── Male-only roles (laki_laki qualifying, perempuan not) ──────────────────
INSERT INTO position_application_fields
  (position_slug, section, field_key, field_label, field_help, field_type, options, importance, sort_order, collect_at_stage)
SELECT
  p.slug, 'syarat_utama', 'jenis_kelamin', 'Jenis kelamin', NULL, 'radio',
  '[{"value":"laki_laki","label":"Laki-laki","qualifying":true},{"value":"perempuan","label":"Perempuan","qualifying":false}]'::jsonb,
  'optional',
  (SELECT COALESCE(MIN(f.sort_order),1) - 1 FROM position_application_fields f
     WHERE f.position_slug = p.slug AND f.section = 'syarat_utama'),
  'applied'
FROM positions p
WHERE p.slug IN (
  'assistant-driller','head-driller','chef-bakery-saudi-arabia','head-barista-saudi-arabia',
  'heavy-diesel-mechanic-saudi-arabia','konstruksi','manufaktur-pengelasan','plant-engineer',
  'roaster-saudi-arabia','sales-engineering','truck-driver-jepang'
)
AND NOT EXISTS (
  SELECT 1 FROM position_application_fields f
  WHERE f.position_slug = p.slug AND f.section = 'syarat_utama' AND f.field_key = 'jenis_kelamin'
);

-- ── Female-only roles (perempuan qualifying, laki_laki not) ────────────────
INSERT INTO position_application_fields
  (position_slug, section, field_key, field_label, field_help, field_type, options, importance, sort_order, collect_at_stage)
SELECT
  p.slug, 'syarat_utama', 'jenis_kelamin', 'Jenis kelamin', NULL, 'radio',
  '[{"value":"laki_laki","label":"Laki-laki","qualifying":false},{"value":"perempuan","label":"Perempuan","qualifying":true}]'::jsonb,
  'optional',
  (SELECT COALESCE(MIN(f.sort_order),1) - 1 FROM position_application_fields f
     WHERE f.position_slug = p.slug AND f.section = 'syarat_utama'),
  'applied'
FROM positions p
WHERE p.slug IN (
  'caregiver-taiwan','kaigo-jepang','laundry-worker-saudi-arabia','pengolahan-makanan-jepang',
  'perawat-saudi-arabia','spa-therapist-saudi-arabia','waitress-saudi-arabia'
)
AND NOT EXISTS (
  SELECT 1 FROM position_application_fields f
  WHERE f.position_slug = p.slug AND f.section = 'syarat_utama' AND f.field_key = 'jenis_kelamin'
);

-- ── Backfill existing applications from candidates.gender (known only) ──────
UPDATE applications a
SET answers = COALESCE(a.answers, '{}'::jsonb)
  || jsonb_build_object('jenis_kelamin',
       CASE c.gender WHEN 'male' THEN 'laki_laki' WHEN 'female' THEN 'perempuan' END)
FROM candidates c
WHERE a.candidate_id = c.id
  AND c.gender IN ('male','female')
  AND NOT (COALESCE(a.answers, '{}'::jsonb) ? 'jenis_kelamin')
  AND a.position_slug IN (
    'assistant-driller','head-driller','chef-bakery-saudi-arabia','head-barista-saudi-arabia',
    'heavy-diesel-mechanic-saudi-arabia','konstruksi','manufaktur-pengelasan','plant-engineer',
    'roaster-saudi-arabia','sales-engineering','truck-driver-jepang',
    'caregiver-taiwan','kaigo-jepang','laundry-worker-saudi-arabia','pengolahan-makanan-jepang',
    'perawat-saudi-arabia','spa-therapist-saudi-arabia','waitress-saudi-arabia'
  );
