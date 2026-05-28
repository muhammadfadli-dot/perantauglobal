-- Migration 0054: qualifying framework for the 4 newly-advertised Saudi positions
-- Applied to prod Supabase project jeadtvxgxmqnsqwxjmhj on 2026-05-28.
--
-- perawat / roaster / waiter / barista (Saudi Arabia) were seeded BEFORE the
-- qualification framework that migrations 0044-0052 applied to the original 8.
-- They had three problems:
--   1. radio options carried NO `qualifying` flag, so application_readiness_view
--      (0053) could not compute a real hard_pass — it fell back to
--      "answered-anything = passes".
--   2. tier_weight used the legacy 1/2/3 scale instead of 100/60/40.
--   3. each carried 1-3 duplicate/legacy junk fields (english_level,
--      experience_years, experience_type, gender_male, min_age_21) left over
--      from an older form version.
--
-- These 4 already have 177 live applications (barista 98, perawat 43, roaster
-- 18, waiter 18). To keep existing answers mapped, the DELETE + re-INSERT below
-- RE-USES the exact primary field_keys that already hold answers
-- (str_active / exp_nursing / english_self / exp_roasting / cupping_qgrader /
-- exp_fnb / hospitality_skill / exp_barista / cert_barista). Only the junk
-- fields are dropped (their few stray answers become inert JSONB, harmless).
--
-- Standard slots (matches 0052):
--   slot 1: hard gate      (tier_weight 100)
--   slot 2: language       (tier_weight  60)
--   slot 3: role-specific  (tier_weight  40)

BEGIN;

-- ============================================================
-- perawat-saudi-arabia (Nurse)
--   STR aktif is the regulatory hard gate — an active/in-process STR already
--   implies the D3+ nursing education the poster requires, so we don't gate on
--   education separately. Poster: min 1 yr experience, English communication.
-- ============================================================
DELETE FROM position_application_fields WHERE position_slug = 'perawat-saudi-arabia';

INSERT INTO position_application_fields
  (position_slug, sort_order, section, field_key, field_label, field_type, importance, tier_weight, collect_at_stage, options)
VALUES
  ('perawat-saudi-arabia', 1, 'syarat_utama', 'str_active',
   'Status STR keperawatan kamu?',
   'radio', 'required', 100, 'applied',
   '[{"label":"STR aktif","value":"yes","qualifying":true},{"label":"Sedang dalam proses","value":"inProgress","qualifying":true},{"label":"Belum punya","value":"belum","qualifying":false}]'::jsonb),
  ('perawat-saudi-arabia', 2, 'syarat_utama', 'exp_nursing',
   'Pengalaman kerja sebagai perawat?',
   'radio', 'required', 60, 'applied',
   '[{"label":"Belum ada","value":"none","qualifying":false},{"label":"Kurang dari 1 tahun","value":"less_than_1","qualifying":false},{"label":"1–3 tahun","value":"1-3","qualifying":true},{"label":"Lebih dari 3 tahun","value":"3+","qualifying":true}]'::jsonb),
  ('perawat-saudi-arabia', 3, 'syarat_utama', 'english_self',
   'Bahasa Inggris kamu?',
   'radio', 'required', 40, 'applied',
   '[{"label":"Bisa percakapan dasar","value":"basic","qualifying":true},{"label":"Bisa diskusi profesional","value":"intermediate","qualifying":true},{"label":"Fasih bicara & menulis","value":"fluent","qualifying":true}]'::jsonb);

-- ============================================================
-- roaster-saudi-arabia (Coffee Roaster)
--   Roasting experience is the gate; English required; cupping/Q-grader is a
--   bonus craft signal (not a disqualifier — a strong roaster without formal
--   cupping training is still hireable), so all its options qualify.
-- ============================================================
DELETE FROM position_application_fields WHERE position_slug = 'roaster-saudi-arabia';

INSERT INTO position_application_fields
  (position_slug, sort_order, section, field_key, field_label, field_type, importance, tier_weight, collect_at_stage, options)
VALUES
  ('roaster-saudi-arabia', 1, 'syarat_utama', 'exp_roasting',
   'Pengalaman coffee roasting?',
   'radio', 'required', 100, 'applied',
   '[{"label":"Belum ada","value":"none","qualifying":false},{"label":"Kurang dari 1 tahun","value":"less_than_1","qualifying":false},{"label":"1–3 tahun","value":"1-3","qualifying":true},{"label":"Lebih dari 3 tahun","value":"3+","qualifying":true}]'::jsonb),
  ('roaster-saudi-arabia', 2, 'syarat_utama', 'english_self',
   'Bahasa Inggris kamu?',
   'radio', 'required', 60, 'applied',
   '[{"label":"Bisa percakapan dasar","value":"basic","qualifying":true},{"label":"Bisa diskusi profesional","value":"intermediate","qualifying":true},{"label":"Fasih bicara & menulis","value":"fluent","qualifying":true}]'::jsonb),
  ('roaster-saudi-arabia', 3, 'syarat_utama', 'cupping_qgrader',
   'Pengalaman cupping atau Q-grader?',
   'radio', 'required', 40, 'applied',
   '[{"label":"Belum pernah","value":"none","qualifying":true},{"label":"Pernah training cupping","value":"training","qualifying":true},{"label":"Bersertifikat Q-grader","value":"qgrader","qualifying":true}]'::jsonb);

-- ============================================================
-- waiter-saudi-arabia (Waiter)
--   Poster: min 6 bulan pengalaman waiter — so "kurang dari 1 tahun" (which
--   includes 6mo+) qualifies. English required. Customer-facing exp is a soft
--   signal (both options qualify).
-- ============================================================
DELETE FROM position_application_fields WHERE position_slug = 'waiter-saudi-arabia';

INSERT INTO position_application_fields
  (position_slug, sort_order, section, field_key, field_label, field_type, importance, tier_weight, collect_at_stage, options)
VALUES
  ('waiter-saudi-arabia', 1, 'syarat_utama', 'exp_fnb',
   'Pengalaman F&B service / restoran?',
   'radio', 'required', 100, 'applied',
   '[{"label":"Belum ada","value":"none","qualifying":false},{"label":"Kurang dari 1 tahun","value":"less_than_1","qualifying":true},{"label":"1–3 tahun","value":"1-3","qualifying":true},{"label":"Lebih dari 3 tahun","value":"3+","qualifying":true}]'::jsonb),
  ('waiter-saudi-arabia', 2, 'syarat_utama', 'english_self',
   'Bahasa Inggris kamu?',
   'radio', 'required', 60, 'applied',
   '[{"label":"Bisa percakapan dasar","value":"basic","qualifying":true},{"label":"Bisa diskusi profesional","value":"intermediate","qualifying":true},{"label":"Fasih bicara & menulis","value":"fluent","qualifying":true}]'::jsonb),
  ('waiter-saudi-arabia', 3, 'syarat_utama', 'hospitality_skill',
   'Pengalaman customer-facing (kasir, retail, customer service) atau sebagai Waiter?',
   'radio', 'required', 40, 'applied',
   '[{"label":"Ya, pernah","value":"yes","qualifying":true},{"label":"Belum pernah","value":"no","qualifying":true}]'::jsonb);

-- ============================================================
-- barista-saudi-arabia (Barista)
--   Poster: min 6 months barista experience — "kurang dari 1 tahun" qualifies.
--   English required. Barista cert is a bonus signal (both options qualify).
--   gender_male / min_age_21 hard-gates dropped: gender + age are handled by
--   Meta ad targeting + recruiter screening + the /onboarding birth_date+gender
--   capture, not the apply form.
-- ============================================================
DELETE FROM position_application_fields WHERE position_slug = 'barista-saudi-arabia';

INSERT INTO position_application_fields
  (position_slug, sort_order, section, field_key, field_label, field_type, importance, tier_weight, collect_at_stage, options)
VALUES
  ('barista-saudi-arabia', 1, 'syarat_utama', 'exp_barista',
   'Pengalaman sebagai barista?',
   'radio', 'required', 100, 'applied',
   '[{"label":"Belum ada","value":"none","qualifying":false},{"label":"Kurang dari 1 tahun","value":"less_than_1","qualifying":true},{"label":"1–3 tahun","value":"1-3","qualifying":true},{"label":"Lebih dari 3 tahun","value":"3+","qualifying":true}]'::jsonb),
  ('barista-saudi-arabia', 2, 'syarat_utama', 'english_self',
   'Bahasa Inggris kamu?',
   'radio', 'required', 60, 'applied',
   '[{"label":"Bisa percakapan dasar","value":"basic","qualifying":true},{"label":"Bisa diskusi profesional","value":"intermediate","qualifying":true},{"label":"Fasih bicara & menulis","value":"fluent","qualifying":true}]'::jsonb),
  ('barista-saudi-arabia', 3, 'syarat_utama', 'cert_barista',
   'Punya sertifikat training kopi / barista?',
   'radio', 'required', 40, 'applied',
   '[{"label":"Punya","value":"yes","qualifying":true},{"label":"Belum punya","value":"no","qualifying":true}]'::jsonb);

COMMIT;
