-- Migration 0052: qualification fields v2 — standardized framework
-- Applied to prod Supabase project jeadtvxgxmqnsqwxjmhj on 2026-05-28.
--
-- Establishes a consistent qualification-Q framework across the 8 positions
-- being actively advertised. Every field now has:
--
--   1. Explicit `tier_weight` (100 hard gate, 60 language, 40 role/context, 20 bonus)
--      so admin editor surfaces relative importance.
--
--   2. Each `options[*]` entry has a `qualifying: boolean` flag that says
--      whether picking that option counts as "passes the gate". Used by
--      application_readiness_view (migration 0053) to compute a meaningful
--      hard_pass (a candidate who answers "Belum punya SSW" now correctly
--      shows as hard_pass = FALSE instead of TRUE-because-they-typed-anything).
--
-- Standard slots per position:
--   slot 1: hard gate          (tier_weight 100, required)
--   slot 2: language           (tier_weight  60, required)
--   slot 3: role-specific      (tier_weight  40, required or optional)
--   slot 4: context fit        (tier_weight  40, required where relevant)
--   slot 5: bonus signal       (tier_weight  20, optional)

-- ============================================================
-- #1 Caregiver Taiwan
-- ============================================================
DELETE FROM position_application_fields WHERE position_slug = 'caregiver-taiwan';

INSERT INTO position_application_fields
  (position_slug, sort_order, section, field_key, field_label, field_type, importance, tier_weight, collect_at_stage, options)
VALUES
  ('caregiver-taiwan', 1, 'syarat_utama', 'physical_meets_min',
   'Tinggi badan minimal 155cm dan berat minimal 55kg?',
   'radio', 'required', 100, 'applied',
   '[{"label":"Ya, sesuai","value":"yes","qualifying":true},{"label":"Tidak / belum","value":"no","qualifying":false}]'::jsonb),
  ('caregiver-taiwan', 2, 'syarat_utama', 'exp_caregiving',
   'Pengalaman merawat orang sakit / lansia?',
   'radio', 'required', 40, 'applied',
   '[{"label":"Belum ada","value":"none","qualifying":false},{"label":"Kurang dari 1 tahun","value":"less_than_1","qualifying":false},{"label":"1–3 tahun","value":"1-3","qualifying":true},{"label":"Lebih dari 3 tahun","value":"3+","qualifying":true}]'::jsonb),
  ('caregiver-taiwan', 3, 'syarat_utama', 'commitment_3y',
   'Siap berkomitmen 3 tahun jauh dari keluarga?',
   'radio', 'required', 40, 'applied',
   '[{"label":"Ya, siap","value":"yes","qualifying":true},{"label":"Masih perlu diskusi keluarga","value":"discuss","qualifying":false}]'::jsonb),
  ('caregiver-taiwan', 4, 'syarat_utama', 'mandarin_self',
   'Bahasa Mandarin kamu?',
   'radio', 'optional', 20, 'applied',
   '[{"label":"Belum bisa","value":"none","qualifying":true},{"label":"Bisa kata-kata dasar","value":"basic","qualifying":true},{"label":"Bisa percakapan sehari-hari","value":"intermediate","qualifying":true},{"label":"Fasih","value":"fluent","qualifying":true}]'::jsonb),
  ('caregiver-taiwan', 5, 'syarat_utama', 'care_cert_status',
   'Punya sertifikat caregiver atau pelatihan formal?',
   'radio', 'optional', 20, 'applied',
   '[{"label":"Sudah ada","value":"have","qualifying":true},{"label":"Sedang proses","value":"in_progress","qualifying":true},{"label":"Belum / tidak tahu apa itu","value":"none","qualifying":true}]'::jsonb);

-- ============================================================
-- #2 Manufaktur Pengelasan (already solid; just add tier_weight + qualifying)
-- ============================================================
DELETE FROM position_application_fields WHERE position_slug = 'manufaktur-pengelasan';

INSERT INTO position_application_fields
  (position_slug, sort_order, section, field_key, field_label, field_type, importance, tier_weight, collect_at_stage, options)
VALUES
  ('manufaktur-pengelasan', 1, 'syarat_utama', 'ssw_manufaktur',
   'Punya sertifikat SSW Manufaktur (Pengelasan)?',
   'radio', 'required', 100, 'applied',
   '[{"label":"Sudah punya","value":"sudah_punya","qualifying":true},{"label":"Sedang proses","value":"sedang_proses","qualifying":true},{"label":"Belum punya","value":"belum_punya","qualifying":false}]'::jsonb),
  ('manufaktur-pengelasan', 2, 'syarat_utama', 'jepang_level',
   'Level bahasa Jepang kamu?',
   'radio', 'required', 60, 'applied',
   '[{"label":"Belum belajar","value":"belum_belajar","qualifying":false},{"label":"JLPT N5 atau JFT A1","value":"n5_a1","qualifying":false},{"label":"JLPT N4 atau JFT A2","value":"n4_a2","qualifying":true},{"label":"JLPT N3","value":"n3","qualifying":true},{"label":"JLPT N2 atau lebih tinggi","value":"n2_plus","qualifying":true}]'::jsonb),
  ('manufaktur-pengelasan', 3, 'syarat_utama', 'ex_magang',
   'Status ex-magang di Jepang?',
   'radio', 'required', 40, 'applied',
   '[{"label":"Ya, ex-magang (sertifikat Tokutei Katsudou)","value":"yes","qualifying":true},{"label":"Belum pernah ke Jepang","value":"no","qualifying":true}]'::jsonb),
  ('manufaktur-pengelasan', 4, 'syarat_utama', 'exp_pengelasan',
   'Pengalaman pengelasan?',
   'radio', 'optional', 20, 'applied',
   '[{"label":"Tidak ada","value":"none","qualifying":true},{"label":"Kurang dari 3 bulan","value":"lt_3m","qualifying":true},{"label":"3-6 bulan","value":"3_6m","qualifying":true},{"label":"6-12 bulan","value":"6_12m","qualifying":true},{"label":"Lebih dari 1 tahun","value":"gt_1y","qualifying":true}]'::jsonb);

-- ============================================================
-- #3 Laundry Worker Saudi
-- ============================================================
DELETE FROM position_application_fields WHERE position_slug = 'laundry-worker-saudi-arabia';

INSERT INTO position_application_fields
  (position_slug, sort_order, section, field_key, field_label, field_type, importance, tier_weight, collect_at_stage, options)
VALUES
  ('laundry-worker-saudi-arabia', 1, 'syarat_utama', 'exp_laundry',
   'Pengalaman kerja laundry / dry-cleaner?',
   'radio', 'required', 100, 'applied',
   '[{"label":"Belum ada","value":"none","qualifying":false},{"label":"Kurang dari 1 tahun","value":"less_than_1","qualifying":true},{"label":"1–3 tahun","value":"1-3","qualifying":true},{"label":"Lebih dari 3 tahun","value":"3+","qualifying":true}]'::jsonb),
  ('laundry-worker-saudi-arabia', 2, 'syarat_utama', 'english_self',
   'Bahasa Inggris kamu?',
   'radio', 'required', 60, 'applied',
   '[{"label":"Belum bisa sama sekali","value":"none","qualifying":false},{"label":"Bisa percakapan dasar","value":"basic","qualifying":true},{"label":"Bisa diskusi profesional","value":"intermediate","qualifying":true},{"label":"Fasih bicara & menulis","value":"fluent","qualifying":true}]'::jsonb),
  ('laundry-worker-saudi-arabia', 3, 'syarat_utama', 'operate_machines',
   'Pengalaman operasi mesin cuci industri / pengering besar?',
   'radio', 'optional', 20, 'applied',
   '[{"label":"Pernah, mesin industri","value":"yes","qualifying":true},{"label":"Mesin rumahan saja","value":"home_only","qualifying":true},{"label":"Belum pernah","value":"no","qualifying":true}]'::jsonb);

-- ============================================================
-- #4 Spa Therapist Saudi
-- ============================================================
DELETE FROM position_application_fields WHERE position_slug = 'spa-therapist-saudi-arabia';

INSERT INTO position_application_fields
  (position_slug, sort_order, section, field_key, field_label, field_type, importance, tier_weight, collect_at_stage, options)
VALUES
  ('spa-therapist-saudi-arabia', 1, 'syarat_utama', 'exp_spa',
   'Pengalaman sebagai Spa Therapist?',
   'radio', 'required', 100, 'applied',
   '[{"label":"Belum ada","value":"none","qualifying":false},{"label":"Kurang dari 1 tahun","value":"less_than_1","qualifying":false},{"label":"1–3 tahun","value":"1-3","qualifying":true},{"label":"Lebih dari 3 tahun","value":"3+","qualifying":true}]'::jsonb),
  ('spa-therapist-saudi-arabia', 2, 'syarat_utama', 'english_self',
   'Bahasa Inggris kamu?',
   'radio', 'required', 60, 'applied',
   '[{"label":"Belum bisa sama sekali","value":"none","qualifying":false},{"label":"Bisa percakapan dasar","value":"basic","qualifying":true},{"label":"Bisa diskusi profesional","value":"intermediate","qualifying":true},{"label":"Fasih bicara & menulis","value":"fluent","qualifying":true}]'::jsonb),
  ('spa-therapist-saudi-arabia', 3, 'syarat_utama', 'saudi_dress_code',
   'Bersedia kerja dengan dress code Saudi (uniform tertutup, hijab)?',
   'radio', 'required', 40, 'applied',
   '[{"label":"Ya, siap","value":"yes","qualifying":true},{"label":"Masih perlu pertimbangan","value":"discuss","qualifying":false}]'::jsonb),
  ('spa-therapist-saudi-arabia', 4, 'syarat_utama', 'teknik_spa',
   'Teknik spa / pijat yang kamu kuasai?',
   'multiselect', 'optional', 20, 'applied',
   '[{"label":"Swedish Massage","value":"swedish","qualifying":true},{"label":"Deep Tissue Massage","value":"deep_tissue","qualifying":true},{"label":"Balinese Massage","value":"balinese","qualifying":true},{"label":"Thai Massage","value":"thai","qualifying":true},{"label":"Hot Stone Massage","value":"hot_stone","qualifying":true},{"label":"Aromatherapy Massage","value":"aromatherapy","qualifying":true},{"label":"Pedicure / Manicure","value":"pedi_mani","qualifying":true}]'::jsonb);

-- ============================================================
-- #5 Konstruksi Tokutei Ginou Jepang
-- ============================================================
DELETE FROM position_application_fields WHERE position_slug = 'konstruksi';

INSERT INTO position_application_fields
  (position_slug, sort_order, section, field_key, field_label, field_type, importance, tier_weight, collect_at_stage, options)
VALUES
  ('konstruksi', 1, 'syarat_utama', 'ssw_konstruksi',
   'Punya sertifikat SSW Konstruksi?',
   'radio', 'required', 100, 'applied',
   '[{"label":"Sudah punya","value":"sudah_punya","qualifying":true},{"label":"Sedang proses","value":"sedang_proses","qualifying":true},{"label":"Belum punya","value":"belum_punya","qualifying":false}]'::jsonb),
  ('konstruksi', 2, 'syarat_utama', 'jepang_level',
   'Level bahasa Jepang kamu?',
   'radio', 'required', 60, 'applied',
   '[{"label":"Belum belajar","value":"belum_belajar","qualifying":false},{"label":"JLPT N5 atau JFT A1","value":"n5_a1","qualifying":false},{"label":"JLPT N4 atau JFT A2","value":"n4_a2","qualifying":true},{"label":"JLPT N3","value":"n3","qualifying":true},{"label":"JLPT N2 atau lebih tinggi","value":"n2_plus","qualifying":true}]'::jsonb),
  ('konstruksi', 3, 'syarat_utama', 'ex_magang',
   'Status ex-magang di Jepang?',
   'radio', 'required', 40, 'applied',
   '[{"label":"Ya, ex-magang (sertifikat Tokutei Katsudou)","value":"yes","qualifying":true},{"label":"Belum pernah ke Jepang","value":"no","qualifying":true}]'::jsonb),
  ('konstruksi', 4, 'syarat_utama', 'outdoor_ready',
   'Sehat fisik & siap kerja outdoor di cuaca dingin/panas Jepang?',
   'radio', 'required', 40, 'applied',
   '[{"label":"Ya, siap","value":"yes","qualifying":true},{"label":"Perlu diskusi","value":"discuss","qualifying":false}]'::jsonb),
  ('konstruksi', 5, 'syarat_utama', 'exp_konstruksi',
   'Pengalaman kerja konstruksi?',
   'radio', 'optional', 20, 'applied',
   '[{"label":"Tidak ada","value":"none","qualifying":true},{"label":"Kurang dari 1 tahun","value":"lt_1y","qualifying":true},{"label":"1-3 tahun","value":"1_3y","qualifying":true},{"label":"Lebih dari 3 tahun","value":"gt_3y","qualifying":true}]'::jsonb);

-- ============================================================
-- #6 Perawatan Otomotif Tokutei Ginou Jepang
-- ============================================================
DELETE FROM position_application_fields WHERE position_slug = 'perawatan-otomotif';

INSERT INTO position_application_fields
  (position_slug, sort_order, section, field_key, field_label, field_type, importance, tier_weight, collect_at_stage, options)
VALUES
  ('perawatan-otomotif', 1, 'syarat_utama', 'ssw_otomotif',
   'Punya sertifikat SSW Perawatan Otomotif (Jidousha Seibi)?',
   'radio', 'required', 100, 'applied',
   '[{"label":"Sudah punya","value":"sudah_punya","qualifying":true},{"label":"Sedang proses","value":"sedang_proses","qualifying":true},{"label":"Belum punya","value":"belum_punya","qualifying":false}]'::jsonb),
  ('perawatan-otomotif', 2, 'syarat_utama', 'jepang_level',
   'Level bahasa Jepang kamu?',
   'radio', 'required', 60, 'applied',
   '[{"label":"Belum belajar","value":"belum_belajar","qualifying":false},{"label":"JLPT N5 atau JFT A1","value":"n5_a1","qualifying":false},{"label":"JLPT N4 atau JFT A2","value":"n4_a2","qualifying":true},{"label":"JLPT N3","value":"n3","qualifying":true},{"label":"JLPT N2 atau lebih tinggi","value":"n2_plus","qualifying":true}]'::jsonb),
  ('perawatan-otomotif', 3, 'syarat_utama', 'ex_magang',
   'Status ex-magang di Jepang?',
   'radio', 'required', 40, 'applied',
   '[{"label":"Ya, ex-magang (sertifikat Tokutei Katsudou)","value":"yes","qualifying":true},{"label":"Belum pernah ke Jepang","value":"no","qualifying":true}]'::jsonb),
  ('perawatan-otomotif', 4, 'syarat_utama', 'sim_a',
   'Punya SIM A (mobil)?',
   'radio', 'required', 40, 'applied',
   '[{"label":"Sudah punya","value":"have","qualifying":true},{"label":"Sedang proses","value":"in_progress","qualifying":true},{"label":"Belum punya","value":"none","qualifying":false}]'::jsonb),
  ('perawatan-otomotif', 5, 'syarat_utama', 'exp_otomotif',
   'Pengalaman kerja otomotif / bengkel?',
   'radio', 'optional', 20, 'applied',
   '[{"label":"Tidak ada","value":"none","qualifying":true},{"label":"Kurang dari 1 tahun","value":"lt_1y","qualifying":true},{"label":"1-3 tahun","value":"1_3y","qualifying":true},{"label":"Lebih dari 3 tahun","value":"gt_3y","qualifying":true}]'::jsonb);

-- ============================================================
-- #7 Heavy Diesel Mechanic Saudi
-- ============================================================
DELETE FROM position_application_fields WHERE position_slug = 'heavy-diesel-mechanic-saudi-arabia';

INSERT INTO position_application_fields
  (position_slug, sort_order, section, field_key, field_label, field_type, importance, tier_weight, collect_at_stage, options)
VALUES
  ('heavy-diesel-mechanic-saudi-arabia', 1, 'syarat_utama', 'exp_heavy_diesel',
   'Pengalaman sebagai heavy diesel truck mechanic?',
   'radio', 'required', 100, 'applied',
   '[{"label":"Kurang dari 3 tahun","value":"less_than_3","qualifying":false},{"label":"3–5 tahun","value":"3-5","qualifying":true},{"label":"Lebih dari 5 tahun","value":"5+","qualifying":true}]'::jsonb),
  ('heavy-diesel-mechanic-saudi-arabia', 2, 'syarat_utama', 'english_self',
   'Bahasa Inggris kamu?',
   'radio', 'required', 60, 'applied',
   '[{"label":"Belum bisa sama sekali","value":"none","qualifying":false},{"label":"Bisa percakapan dasar","value":"basic","qualifying":true},{"label":"Bisa diskusi profesional","value":"intermediate","qualifying":true},{"label":"Fasih bicara & menulis","value":"fluent","qualifying":true}]'::jsonb),
  ('heavy-diesel-mechanic-saudi-arabia', 3, 'syarat_utama', 'cat_engine_exp',
   'Pengalaman dengan engine CAT atau alat berat sejenis?',
   'radio', 'optional', 20, 'applied',
   '[{"label":"Pernah, khusus CAT","value":"yes_cat","qualifying":true},{"label":"Pernah, alat berat lain (Komatsu/Volvo/dll.)","value":"yes_similar","qualifying":true},{"label":"Belum pernah","value":"no","qualifying":true}]'::jsonb),
  ('heavy-diesel-mechanic-saudi-arabia', 4, 'syarat_utama', 'sim_b',
   'Punya SIM B Umum atau SIM B1 (truk/alat berat)?',
   'radio', 'optional', 20, 'applied',
   '[{"label":"Sudah punya","value":"have","qualifying":true},{"label":"Belum punya","value":"none","qualifying":true}]'::jsonb);

-- ============================================================
-- #8 Waitress Saudi
-- ============================================================
DELETE FROM position_application_fields WHERE position_slug = 'waitress-saudi-arabia';

INSERT INTO position_application_fields
  (position_slug, sort_order, section, field_key, field_label, field_type, importance, tier_weight, collect_at_stage, options)
VALUES
  ('waitress-saudi-arabia', 1, 'syarat_utama', 'exp_fnb',
   'Pengalaman sebagai Waitress di F&B service / restoran?',
   'radio', 'required', 100, 'applied',
   '[{"label":"Belum ada","value":"none","qualifying":false},{"label":"Kurang dari 1 tahun","value":"less_than_1","qualifying":false},{"label":"1–3 tahun","value":"1-3","qualifying":true},{"label":"Lebih dari 3 tahun","value":"3+","qualifying":true}]'::jsonb),
  ('waitress-saudi-arabia', 2, 'syarat_utama', 'english_self',
   'Bahasa Inggris kamu?',
   'radio', 'required', 60, 'applied',
   '[{"label":"Belum bisa sama sekali","value":"none","qualifying":false},{"label":"Bisa percakapan dasar","value":"basic","qualifying":true},{"label":"Bisa diskusi profesional","value":"intermediate","qualifying":true},{"label":"Fasih bicara & menulis","value":"fluent","qualifying":true}]'::jsonb),
  ('waitress-saudi-arabia', 3, 'syarat_utama', 'saudi_restaurant_fit',
   'Bersedia kerja dengan dress code restoran Saudi (uniform tertutup, hijab) + shift termasuk weekend?',
   'radio', 'required', 40, 'applied',
   '[{"label":"Ya, siap","value":"yes","qualifying":true},{"label":"Perlu diskusi","value":"discuss","qualifying":false}]'::jsonb),
  ('waitress-saudi-arabia', 4, 'syarat_utama', 'hospitality_skill',
   'Pengalaman customer-facing (kasir, retail, customer service)?',
   'radio', 'optional', 20, 'applied',
   '[{"label":"Ya, pernah","value":"yes","qualifying":true},{"label":"Belum pernah","value":"no","qualifying":true}]'::jsonb);
