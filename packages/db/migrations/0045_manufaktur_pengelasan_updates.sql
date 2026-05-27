-- Migration 0045: manufaktur-pengelasan landing content + qualification rebuild
-- Applied to prod Supabase project jeadtvxgxmqnsqwxjmhj on 2026-05-27.
--
-- Aligns the manufaktur-pengelasan position with the final approved poster
-- (PG_JP_manufaktur-pengelasan_260130.png) and replaces the broken
-- multiselect qualification fields with a clean radio-only screening flow.
--
-- Content changes (positions.content):
--   - hero.metaLine        ¥244.200/bulan → ¥244.000/bulan (match poster)
--   - cardMeta.salary      ¥244.200       → ¥244.000
--   - details              add "Prefektur Osaka" to location
--   - qualifications       add "Lulusan SMA/SMK/sederajat", strengthen ex-magang
--                          to "Diutamakan" (was "dipersilakan")
--   - benefits.akomodasi   "Disediakan oleh perusahaan" (misleading) →
--                          "Asrama tersedia (biaya bulanan ditanggung pekerja;
--                          listrik, gas, air, internet sharing)" (truthful)
--
-- Qualification field changes (position_application_fields):
--   Before: 3 multiselect required fields with leftover quirks
--   After:  4 radio fields (SSW → JLPT → ex-magang → exp_pengelasan)
--           First 3 required, last optional.

UPDATE positions
SET content = content
  || jsonb_build_object(
       'hero', jsonb_build_object('metaLine', '¥244.000/bulan'),
       'details', jsonb_build_array(
         jsonb_build_object('label', 'Lokasi', 'value', 'Prefektur Osaka, Jepang'),
         jsonb_build_object('label', 'Jenis Pekerjaan', 'value', 'Manufaktur (Pengelasan)')
       ),
       'cardMeta', content->'cardMeta' || jsonb_build_object('salary', '¥244.000'),
       'qualifications', jsonb_build_array(
         'Laki-laki',
         'Usia maksimal 35 tahun',
         'Lulusan SMA/SMK/sederajat',
         'Diutamakan ex-magang',
         'Memiliki JLPT N4 atau JFT A2 dan sertifikat SSW Manufaktur'
       ),
       'benefits', jsonb_build_array(
         jsonb_build_object('icon', 'wallet', 'label', 'Gaji pokok', 'value', '¥244.000/bulan'),
         jsonb_build_object('icon', 'shield', 'label', 'Asuransi', 'value', 'Disediakan'),
         jsonb_build_object('icon', 'home',   'label', 'Akomodasi', 'value', 'Asrama tersedia (biaya bulanan ditanggung pekerja; listrik, gas, air, internet sharing)')
       )
     )
WHERE slug = 'manufaktur-pengelasan';

DELETE FROM position_application_fields WHERE position_slug = 'manufaktur-pengelasan';

INSERT INTO position_application_fields
  (position_slug, sort_order, section, field_key, field_label, field_type, importance, collect_at_stage, options)
VALUES
  ('manufaktur-pengelasan', 1, 'syarat_utama', 'ssw_manufaktur',
   'Punya sertifikat SSW Manufaktur (Pengelasan)?', 'radio', 'required', 'applied',
   '[{"label":"Sudah punya","value":"sudah_punya"},{"label":"Sedang proses","value":"sedang_proses"},{"label":"Belum punya","value":"belum_punya"}]'::jsonb),
  ('manufaktur-pengelasan', 2, 'syarat_utama', 'jepang_level',
   'Level bahasa Jepang kamu?', 'radio', 'required', 'applied',
   '[{"label":"Belum belajar","value":"belum_belajar"},{"label":"JLPT N5 atau JFT A1","value":"n5_a1"},{"label":"JLPT N4 atau JFT A2","value":"n4_a2"},{"label":"JLPT N3","value":"n3"},{"label":"JLPT N2 atau lebih tinggi","value":"n2_plus"}]'::jsonb),
  ('manufaktur-pengelasan', 3, 'syarat_utama', 'ex_magang',
   'Status ex-magang di Jepang?', 'radio', 'required', 'applied',
   '[{"label":"Ya, ex-magang (sertifikat Tokutei Katsudou)","value":"yes"},{"label":"Belum pernah ke Jepang","value":"no"}]'::jsonb),
  ('manufaktur-pengelasan', 4, 'syarat_utama', 'exp_pengelasan',
   'Pengalaman pengelasan?', 'radio', 'optional', 'applied',
   '[{"label":"Tidak ada","value":"none"},{"label":"Kurang dari 3 bulan","value":"lt_3m"},{"label":"3-6 bulan","value":"3_6m"},{"label":"6-12 bulan","value":"6_12m"},{"label":"Lebih dari 1 tahun","value":"gt_1y"}]'::jsonb);
