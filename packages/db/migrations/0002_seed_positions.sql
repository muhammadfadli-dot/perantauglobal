-- ============================================================================
-- Migration 0002 — Seed positions
-- ============================================================================
-- Populates the `positions` table from the Zod registry in
-- `packages/db/schemas/positions/`. Requirements JSONB matches the keys
-- collected by each lowongan/program form; readiness is computed by
-- compare with `candidates.profile_data` via `compute_readiness()`.
--
-- Idempotent: upserts by slug. Safe to re-run.
-- ============================================================================

INSERT INTO positions (slug, role, country, name, description, requirements, scoring, pipeline, active)
VALUES
  (
    'perawat-saudi-arabia',
    'nurse',
    'saudi_arabia',
    'Perawat — Saudi Arabia',
    'Lowongan perawat Indonesia untuk rumah sakit & klinik di Saudi Arabia.',
    jsonb_build_object(
      'str_active', jsonb_build_object('required', true, 'label', 'STR aktif'),
      'experience_years', jsonb_build_object('required', true, 'label', 'Pengalaman kerja'),
      'english_level', jsonb_build_object('required', true, 'label', 'Bahasa Inggris')
    ),
    '{}'::jsonb,
    '{}'::jsonb,
    true
  ),
  (
    'barista-saudi-arabia',
    'barista',
    'saudi_arabia',
    'Barista — Saudi Arabia',
    'Lowongan barista untuk coffee shop & hotel chains di Saudi Arabia.',
    jsonb_build_object(
      'experience_type', jsonb_build_object('required', true, 'label', 'Jenis pengalaman kerja'),
      'english_level', jsonb_build_object('required', true, 'label', 'Bahasa Inggris')
    ),
    '{}'::jsonb,
    '{}'::jsonb,
    true
  ),
  (
    'waiter-saudi-arabia',
    'waiter',
    'saudi_arabia',
    'Waiter — Saudi Arabia',
    'Lowongan waiter untuk restoran & hotel di Saudi Arabia.',
    jsonb_build_object(
      'experience_type', jsonb_build_object('required', true, 'label', 'Jenis pengalaman kerja'),
      'english_level', jsonb_build_object('required', true, 'label', 'Bahasa Inggris')
    ),
    '{}'::jsonb,
    '{}'::jsonb,
    true
  ),
  (
    'kaigo-jepang',
    'kaigo',
    'japan',
    'Kaigo (Caregiver) — Jepang',
    'Lowongan kaigo untuk panti jompo & fasilitas perawatan di Jepang (jalur SSW Kaigo).',
    jsonb_build_object(
      'jlpt_level', jsonb_build_object('required', true, 'label', 'Level JLPT'),
      'care_certification', jsonb_build_object('required', true, 'label', 'Sertifikasi perawatan'),
      'experience_years', jsonb_build_object('required', true, 'label', 'Pengalaman kerja')
    ),
    '{}'::jsonb,
    '{}'::jsonb,
    true
  ),
  (
    'food-service-jepang',
    'food_service',
    'japan',
    'Food Service — Jepang',
    'Lowongan food service untuk restoran & hotel di Jepang (jalur SSW Food Service).',
    jsonb_build_object(
      'jlpt_level', jsonb_build_object('required', true, 'label', 'Level JLPT'),
      'food_certification', jsonb_build_object('required', true, 'label', 'Sertifikasi food service'),
      'experience_type', jsonb_build_object('required', true, 'label', 'Jenis pengalaman kerja')
    ),
    '{}'::jsonb,
    '{}'::jsonb,
    true
  ),
  (
    'truck-driver-jepang',
    'truck_driver',
    'japan',
    'Truck Driver — Jepang',
    'Lowongan sopir truk untuk perusahaan logistik di Jepang (jalur Tokutei Ginou).',
    jsonb_build_object(
      'sim_type', jsonb_build_object('required', true, 'label', 'Jenis SIM'),
      'driving_years', jsonb_build_object('required', true, 'label', 'Pengalaman mengemudi'),
      'jlpt_level', jsonb_build_object('required', true, 'label', 'Level JLPT')
    ),
    '{}'::jsonb,
    '{}'::jsonb,
    true
  ),
  (
    'global-talent-hub',
    'general',
    'any',
    'Global Talent Hub',
    'Program penyaluran umum. Calon mendaftar minat lalu dicocokkan ke lowongan spesifik.',
    jsonb_build_object(
      'interested_country', jsonb_build_object('required', true, 'label', 'Negara tujuan minat'),
      'current_status', jsonb_build_object('required', true, 'label', 'Status saat ini')
    ),
    '{}'::jsonb,
    '{}'::jsonb,
    true
  )
ON CONFLICT (slug) DO UPDATE SET
  role = EXCLUDED.role,
  country = EXCLUDED.country,
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  requirements = EXCLUDED.requirements,
  scoring = EXCLUDED.scoring,
  pipeline = EXCLUDED.pipeline,
  active = EXCLUDED.active,
  updated_at = NOW();
