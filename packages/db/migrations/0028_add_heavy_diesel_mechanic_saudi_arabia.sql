-- =========================================================================
-- MIGRATION 0028: Add Heavy Diesel Truck Mechanic position (Saudi Arabia)
-- =========================================================================
-- Source: Heavy Diesel Truck Mechanics.docx PDF (DTG, 2026-05)
--
-- New slug: heavy-diesel-mechanic-saudi-arabia
-- Penempatan: Provinsi Timur Saudi Arabia (Dammam, Khobar, Dhahran)
-- Salary: SAR 3.500 - 4.000 / bulan
-- Biaya keberangkatan: Rp 10.250.000 (incl. ID CPMI, BPJS PRA & PURNA,
-- Psikotes, MCU GAMCA, Enjaz Visa, Dokumen Terjemah, Apostille SKCK & Ijazah,
-- QVP).
--
-- Requirements written in v3 shape (importance/category/evidence_mode/
-- collect_at_stage) to match schema post-0020.
--
-- Apply-stage form fields seeded in same migration: 3 questions following
-- the 30WET pattern (role-specific experience + shared english_self +
-- bonus signal for CAT engine familiarity).
-- =========================================================================

INSERT INTO positions (slug, role, country, name, description, requirements, scoring, pipeline, active)
VALUES
  (
    'heavy-diesel-mechanic-saudi-arabia', 'heavy_diesel_mechanic', 'saudi_arabia',
    'Heavy Diesel Truck Mechanic — Saudi Arabia',
    'Lowongan heavy diesel truck mechanic untuk armada di Provinsi Timur Saudi Arabia (Dammam, Khobar, Dhahran). SAR 3.500–4.000/bulan, akomodasi & transport disediakan, kontrak 2 tahun.',
    jsonb_build_object(
      'experience_years', jsonb_build_object(
        'importance', 'hard',
        'label', 'Pengalaman heavy diesel truck mechanic',
        'allowed_values', jsonb_build_array('5+'),
        'category', 'experience',
        'evidence_mode', 'self_declared',
        'collect_at_stage', 'applied'
      ),
      'english_level', jsonb_build_object(
        'importance', 'hard',
        'label', 'Bahasa Inggris',
        'allowed_values', jsonb_build_array('basic', 'intermediate', 'fluent'),
        'category', 'language',
        'evidence_mode', 'self_declared',
        'collect_at_stage', 'applied'
      ),
      'cat_engine_exp', jsonb_build_object(
        'importance', 'soft',
        'label', 'Familiar dengan CAT atau alat berat sejenis',
        'allowed_values', jsonb_build_array('yes', 'no'),
        'category', 'experience',
        'evidence_mode', 'self_declared',
        'collect_at_stage', 'applied'
      )
    ),
    '{}'::jsonb, '{}'::jsonb, true
  )
ON CONFLICT (slug) DO UPDATE SET
  role         = EXCLUDED.role,
  country      = EXCLUDED.country,
  name         = EXCLUDED.name,
  description  = EXCLUDED.description,
  requirements = EXCLUDED.requirements,
  active       = true,
  updated_at   = NOW();

-- =========================================================================
-- Apply-stage qualifying questions
-- =========================================================================

INSERT INTO position_form_fields (
  position_slug, field_key, field_label, field_help, field_type, options,
  required, tier_weight, sort_order, collect_at_stage
)
VALUES
  (
    'heavy-diesel-mechanic-saudi-arabia',
    'exp_heavy_diesel',
    'Pengalaman sebagai heavy diesel truck mechanic?',
    'PDF mensyaratkan minimal 5 tahun. Hitung total pengalaman perawatan & perbaikan truk diesel berat.',
    'radio',
    '[
      {"value":"less_than_3","label":"Kurang dari 3 tahun"},
      {"value":"3-5","label":"3–5 tahun"},
      {"value":"5+","label":"Lebih dari 5 tahun"}
    ]'::jsonb,
    true, 3, 1, 'applied'
  ),
  (
    'heavy-diesel-mechanic-saudi-arabia',
    'english_self',
    'Bahasa Inggris kamu?',
    NULL,
    'radio',
    '[
      {"value":"basic","label":"Bisa percakapan dasar"},
      {"value":"intermediate","label":"Bisa diskusi profesional"},
      {"value":"fluent","label":"Fasih bicara & menulis"}
    ]'::jsonb,
    true, 1, 2, 'applied'
  ),
  (
    'heavy-diesel-mechanic-saudi-arabia',
    'cat_engine_exp',
    'Pengalaman dengan engine CAT atau alat berat sejenis?',
    'CAT (Caterpillar), Komatsu, Volvo, Hino, dsb. — termasuk engine excavator/loader.',
    'radio',
    '[
      {"value":"yes_cat","label":"Pernah, khusus CAT"},
      {"value":"yes_similar","label":"Pernah, alat berat lain (Komatsu/Volvo/dll.)"},
      {"value":"no","label":"Belum pernah"}
    ]'::jsonb,
    false, 2, 3, 'applied'
  )
ON CONFLICT (position_slug, field_key) DO NOTHING;

-- =========================================================================
-- DONE — migration 0028
-- =========================================================================
