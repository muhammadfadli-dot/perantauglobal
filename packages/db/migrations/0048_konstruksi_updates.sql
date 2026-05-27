-- Migration 0048: konstruksi (TG Jepang) usia fix + cardMeta + qualification rebuild
-- Applied to prod Supabase project jeadtvxgxmqnsqwxjmhj on 2026-05-27.
--
-- Aligns konstruksi with the final approved poster
-- (PG_JP_konstruksi_260406.png).
--
-- Content changes:
--   - qualifications: "Usia tidak dibatasi" → "Usia maksimal 35 tahun"
--     (poster explicitly says max 35)
--   - cardMeta: was null; added so listing card renders consistent metadata
--     (age max 35, Laki-laki, ¥240.000/bulan, Sistem SSW)
--
-- Qualification field changes:
--   Before: 2 multiselect required fields (level_bahasa_jepang_..., punya_ssw_konstruksi)
--   After:  3 radio fields (SSW → JLPT → exp_konstruksi)
--           First 2 required, last optional.

UPDATE positions
SET content = content
  || jsonb_build_object(
       'qualifications', jsonb_build_array(
         'Laki-laki',
         'Usia maksimal 35 tahun',
         'Minimal JLPT N4 atau JFT A2',
         'Memiliki SSW Konstruksi'
       ),
       'cardMeta', jsonb_build_object(
         'age', 'max 35',
         'icon', 'briefcase',
         'gender', 'Laki-laki',
         'salary', '¥240.000',
         'salaryNote', '/bulan',
         'contractLabel', 'Sistem SSW'
       )
     )
WHERE slug = 'konstruksi';

DELETE FROM position_application_fields WHERE position_slug = 'konstruksi';

INSERT INTO position_application_fields
  (position_slug, sort_order, section, field_key, field_label, field_type, importance, collect_at_stage, options)
VALUES
  ('konstruksi', 1, 'syarat_utama', 'ssw_konstruksi',
   'Punya sertifikat SSW Konstruksi?', 'radio', 'required', 'applied',
   '[{"label":"Sudah punya","value":"sudah_punya"},{"label":"Sedang proses","value":"sedang_proses"},{"label":"Belum punya","value":"belum_punya"}]'::jsonb),
  ('konstruksi', 2, 'syarat_utama', 'jepang_level',
   'Level bahasa Jepang kamu?', 'radio', 'required', 'applied',
   '[{"label":"Belum belajar","value":"belum_belajar"},{"label":"JLPT N5 atau JFT A1","value":"n5_a1"},{"label":"JLPT N4 atau JFT A2","value":"n4_a2"},{"label":"JLPT N3","value":"n3"},{"label":"JLPT N2 atau lebih tinggi","value":"n2_plus"}]'::jsonb),
  ('konstruksi', 3, 'syarat_utama', 'exp_konstruksi',
   'Pengalaman kerja konstruksi?', 'radio', 'optional', 'applied',
   '[{"label":"Tidak ada","value":"none"},{"label":"Kurang dari 1 tahun","value":"lt_1y"},{"label":"1-3 tahun","value":"1_3y"},{"label":"Lebih dari 3 tahun","value":"gt_3y"}]'::jsonb);
