-- Migration 0049: perawatan-otomotif (TG Jepang) alignment with poster
-- Applied to prod Supabase project jeadtvxgxmqnsqwxjmhj on 2026-05-27.
--
-- Aligns perawatan-otomotif with the final approved poster
-- (PG_JP_perawatan-otomotif_260406.png).
--
-- Content changes:
--   - qualifications gender: "Laki-laki" → "Laki-laki dan perempuan"
--     (poster explicitly says L/P)
--   - qualifications usia: "Usia tidak dibatasi" → "Usia maksimal 35 tahun"
--     (poster says max 35)
--   - jobDescription: expand from generic 1-liner to 4 specific duties
--     matching the poster (perawatan inspeksi berkala, shaken, perawatan
--     umum, diagnosis kerusakan mesin)
--   - cardMeta: was null; added with L/P + max 35 + ¥235.000 + Sistem SSW
--
-- Qualification field changes:
--   Before: 2 multiselect required fields
--   After:  3 radio fields (SSW → JLPT → exp_otomotif)

UPDATE positions
SET content = content
  || jsonb_build_object(
       'qualifications', jsonb_build_array(
         'Laki-laki dan perempuan',
         'Usia maksimal 35 tahun',
         'Minimal JLPT N4 atau JFT A2',
         'Memiliki sertifikat SSW Perawatan Otomotif / Jidousha Seibi'
       ),
       'jobDescription', jsonb_build_array(
         'Melakukan perawatan inspeksi berkala kendaraan sesuai standar manufaktur',
         'Inspeksi kendaraan wajib (shaken)',
         'Perawatan umum dan pelayanan service rutin',
         'Diagnosis kerusakan mesin menggunakan alat diagnostik'
       ),
       'cardMeta', jsonb_build_object(
         'age', 'max 35',
         'icon', 'briefcase',
         'gender', 'Laki-laki / Perempuan',
         'salary', '¥235.000',
         'salaryNote', '/bulan',
         'contractLabel', 'Sistem SSW'
       )
     )
WHERE slug = 'perawatan-otomotif';

DELETE FROM position_application_fields WHERE position_slug = 'perawatan-otomotif';

INSERT INTO position_application_fields
  (position_slug, sort_order, section, field_key, field_label, field_type, importance, collect_at_stage, options)
VALUES
  ('perawatan-otomotif', 1, 'syarat_utama', 'ssw_otomotif',
   'Punya sertifikat SSW Perawatan Otomotif (Jidousha Seibi)?', 'radio', 'required', 'applied',
   '[{"label":"Sudah punya","value":"sudah_punya"},{"label":"Sedang proses","value":"sedang_proses"},{"label":"Belum punya","value":"belum_punya"}]'::jsonb),
  ('perawatan-otomotif', 2, 'syarat_utama', 'jepang_level',
   'Level bahasa Jepang kamu?', 'radio', 'required', 'applied',
   '[{"label":"Belum belajar","value":"belum_belajar"},{"label":"JLPT N5 atau JFT A1","value":"n5_a1"},{"label":"JLPT N4 atau JFT A2","value":"n4_a2"},{"label":"JLPT N3","value":"n3"},{"label":"JLPT N2 atau lebih tinggi","value":"n2_plus"}]'::jsonb),
  ('perawatan-otomotif', 3, 'syarat_utama', 'exp_otomotif',
   'Pengalaman kerja otomotif / bengkel?', 'radio', 'optional', 'applied',
   '[{"label":"Tidak ada","value":"none"},{"label":"Kurang dari 1 tahun","value":"lt_1y"},{"label":"1-3 tahun","value":"1_3y"},{"label":"Lebih dari 3 tahun","value":"gt_3y"}]'::jsonb);
