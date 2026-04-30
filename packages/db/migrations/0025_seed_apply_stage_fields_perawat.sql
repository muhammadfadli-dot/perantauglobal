-- =========================================================================
-- MIGRATION 0025: Seed position_form_fields for Perawat Saudi (collect_at_stage='applied')
-- =========================================================================
-- Lifts qualifying-Q collection from post-apply (talent hub /applications/new
-- ApplyWizard Step 2) UP to the web apply form (apps/web). The 3 lean
-- questions below capture STR/experience/English at apply-time so candidates
-- who drop before completing talent hub still leave us actionable
-- qualification data instead of blank profiles.
--
-- field_key matches REQUIREMENT_LIBRARY in packages/db/schemas/requirements/
-- library.ts so that:
--   - applications.answers populated by web ApplyForm flow into the same
--     keys the candidate dashboard / readiness_view already understands
--   - candidates.profile_data.credentials picks them up via the
--     handle_new_auth_user trigger (migration 0015)
--
-- Pilot scope: perawat-saudi-arabia only (highest conversion + currently
-- the only "open" job_order). Other positions remain default 'screening'
-- collection. Re-seed via additional migrations or admin UI per position.
-- =========================================================================

INSERT INTO position_form_fields (
  position_slug,
  field_key,
  field_label,
  field_help,
  field_type,
  options,
  required,
  tier_weight,
  sort_order,
  collect_at_stage
)
VALUES
  (
    'perawat-saudi-arabia',
    'str_active',
    'Status STR keperawatan kamu?',
    NULL,
    'radio',
    '[
      {"value":"yes","label":"STR aktif"},
      {"value":"inProgress","label":"Sedang dalam proses"},
      {"value":"belum","label":"Belum punya"}
    ]'::jsonb,
    true,
    3,
    1,
    'applied'
  ),
  (
    'perawat-saudi-arabia',
    'exp_nursing',
    'Pengalaman kerja sebagai perawat?',
    'Hitung mulai dari STR aktif. Boleh perkiraan kasar.',
    'radio',
    '[
      {"value":"none","label":"Belum ada"},
      {"value":"less_than_1","label":"Kurang dari 1 tahun"},
      {"value":"1-3","label":"1–3 tahun"},
      {"value":"3+","label":"Lebih dari 3 tahun"}
    ]'::jsonb,
    false,
    2,
    2,
    'applied'
  ),
  (
    'perawat-saudi-arabia',
    'english_self',
    'Bahasa Inggris kamu?',
    NULL,
    'radio',
    '[
      {"value":"basic","label":"Bisa percakapan dasar"},
      {"value":"intermediate","label":"Bisa diskusi profesional"},
      {"value":"fluent","label":"Fasih bicara & menulis"}
    ]'::jsonb,
    false,
    1,
    3,
    'applied'
  )
ON CONFLICT (position_slug, field_key) DO NOTHING;

-- =========================================================================
-- DONE — migration 0025
-- =========================================================================
