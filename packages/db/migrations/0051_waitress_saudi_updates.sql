-- Migration 0051: waitress-saudi-arabia poster alignment + duplicate cleanup
-- Applied to prod Supabase project jeadtvxgxmqnsqwxjmhj on 2026-05-28.
--
-- Aligns waitress-saudi-arabia with the final approved poster
-- (PG_SA_waitress-saudi-arabia_260416.png). Poster is the source of truth.
--
-- Content changes:
--   - Gaji          SAR 1.600 → SAR 1.500 (hero, cardMeta, benefits)
--   - Usia          21-35     → 21-30     (cardMeta, qualifications)
--   - Uang makan    "Disediakan" → "SAR 300 / bulan" (poster spec)
--   - salaryNote    "+ makan"  → "+ makan SAR 300"
--
-- Qualification field changes:
--   - Drop duplicate english_level radio (sort 1001) — covered by
--     english_self at sort 2
--   - Drop generic experience_type text (sort 1002) — covered by
--     exp_fnb at sort 1
--
-- Final flow: exp_fnb → english_self → hospitality_skill.

UPDATE positions
SET content = content
  || jsonb_build_object(
       'hero', jsonb_build_object('metaLine', 'SAR 1.500/bulan · Kontrak 2 tahun'),
       'cardMeta', content->'cardMeta'
         || jsonb_build_object(
              'age', '21–30',
              'salary', 'SAR 1.500',
              'salaryNote', '+ makan SAR 300'
            ),
       'qualifications', jsonb_build_array(
         'Wanita, 21–30 tahun',
         'Mampu berkomunikasi bahasa Inggris',
         'Memiliki pengalaman sebagai Waitress'
       ),
       'benefits', jsonb_build_array(
         jsonb_build_object('icon', 'wallet', 'label', 'Gaji pokok', 'value', 'SAR 1.500 / bulan'),
         jsonb_build_object('icon', 'bowl',   'label', 'Uang makan', 'value', 'SAR 300 / bulan'),
         jsonb_build_object('icon', 'shield', 'label', 'Asuransi',   'value', 'Disediakan'),
         jsonb_build_object('icon', 'home',   'label', 'Akomodasi',  'value', 'Disediakan oleh perusahaan')
       )
     )
WHERE slug = 'waitress-saudi-arabia';

DELETE FROM position_application_fields
  WHERE position_slug = 'waitress-saudi-arabia'
    AND sort_order IN (1001, 1002)
    AND field_key IN ('english_level', 'experience_type');
