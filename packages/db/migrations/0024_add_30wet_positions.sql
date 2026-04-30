-- =========================================================================
-- MIGRATION 0024: Add 3 new positions for 30WET (wet30s) di Muhayil Asir, Saudi Arabia
-- =========================================================================
-- Source: 30WET (Head Barista, Barista, Roaster & Chef pastry).docx PDF
--
-- New slugs:
--   - head-barista-saudi-arabia
--   - roaster-saudi-arabia
--   - chef-pastry-saudi-arabia
--
-- Note: Barista existing slug `barista-saudi-arabia` already covers the
-- 4th role in the PDF (same SAR 1.500 + makan SAR 300, 21-30, English).
-- 30WET-specific employer info should be a job_order on top of those slugs
-- (created via Admin CRM / migration when batch dibuka).
--
-- Requirements written in v3 shape (importance/category/evidence_mode/
-- collect_at_stage) to match schema post-0020.
-- =========================================================================

INSERT INTO positions (slug, role, country, name, description, requirements, scoring, pipeline, active)
VALUES
  (
    'head-barista-saudi-arabia', 'head_barista', 'saudi_arabia',
    'Head Barista — Saudi Arabia',
    'Lowongan head barista untuk coffee shop 30WET di Muhayil Asir, Saudi Arabia. SAR 2.200/bulan, akomodasi & transport disediakan, kontrak 2 tahun.',
    jsonb_build_object(
      'english_level', jsonb_build_object(
        'importance', 'hard',
        'label', 'Bahasa Inggris',
        'allowed_values', jsonb_build_array('intermediate', 'fluent'),
        'category', 'language',
        'evidence_mode', 'self_declared',
        'collect_at_stage', 'applied'
      ),
      'experience_years', jsonb_build_object(
        'importance', 'hard',
        'label', 'Pengalaman head barista / barista',
        'allowed_values', jsonb_build_array('1-3', '3+'),
        'category', 'experience',
        'evidence_mode', 'self_declared',
        'collect_at_stage', 'applied'
      )
    ),
    '{}'::jsonb, '{}'::jsonb, true
  ),
  (
    'roaster-saudi-arabia', 'roaster', 'saudi_arabia',
    'Roaster — Saudi Arabia',
    'Lowongan coffee roaster untuk 30WET di Muhayil Asir, Saudi Arabia. Mulai dari SAR 2.800/bulan, akomodasi & transport disediakan, kontrak 2 tahun.',
    jsonb_build_object(
      'english_level', jsonb_build_object(
        'importance', 'hard',
        'label', 'Bahasa Inggris',
        'allowed_values', jsonb_build_array('intermediate', 'fluent'),
        'category', 'language',
        'evidence_mode', 'self_declared',
        'collect_at_stage', 'applied'
      ),
      'experience_years', jsonb_build_object(
        'importance', 'hard',
        'label', 'Pengalaman coffee roasting',
        'allowed_values', jsonb_build_array('1-3', '3+'),
        'category', 'experience',
        'evidence_mode', 'self_declared',
        'collect_at_stage', 'applied'
      )
    ),
    '{}'::jsonb, '{}'::jsonb, true
  ),
  (
    'chef-pastry-saudi-arabia', 'chef_pastry', 'saudi_arabia',
    'Chef Pastry — Saudi Arabia',
    'Lowongan chef pastry untuk 30WET di Muhayil Asir, Saudi Arabia. Mulai dari SAR 2.500/bulan, akomodasi & transport disediakan, kontrak 2 tahun.',
    jsonb_build_object(
      'english_level', jsonb_build_object(
        'importance', 'hard',
        'label', 'Bahasa Inggris',
        'allowed_values', jsonb_build_array('intermediate', 'fluent'),
        'category', 'language',
        'evidence_mode', 'self_declared',
        'collect_at_stage', 'applied'
      ),
      'experience_years', jsonb_build_object(
        'importance', 'hard',
        'label', 'Pengalaman pastry / dessert',
        'allowed_values', jsonb_build_array('1-3', '3+'),
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
-- DONE — migration 0024
-- =========================================================================
