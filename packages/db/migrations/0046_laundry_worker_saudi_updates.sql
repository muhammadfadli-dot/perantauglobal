-- Migration 0046: laundry-worker-saudi-arabia landing content + drop duplicate field
-- Applied to prod Supabase project jeadtvxgxmqnsqwxjmhj on 2026-05-27.
--
-- Aligns laundry-worker with the final approved poster
-- (PG_SA_laundry-worker-saudi-arabia_260325.png).
--
-- Content changes (positions.content):
--   - details.lokasi       "Saudi Arabia" → "Ras Tanourah, Saudi Arabia"
--   - benefits             add Transportasi (was missing, poster lists it)
--
-- Qualification field changes:
--   Drop leftover duplicate `english_level` text field at sort_order 1001
--   (the binary radio `english_self` at sort_order 2 already covers it).

UPDATE positions
SET content = content
  || jsonb_build_object(
       'details', jsonb_build_array(
         jsonb_build_object('label', 'Lokasi', 'value', 'Ras Tanourah, Saudi Arabia'),
         jsonb_build_object('label', 'Jam kerja', 'value', '9 jam/hari · 6 hari/minggu'),
         jsonb_build_object('label', 'Istirahat', 'value', '1 hari/minggu'),
         jsonb_build_object('label', 'Annual leave', 'value', '21 hari'),
         jsonb_build_object('label', 'Status kepegawaian', 'value', 'Kontrak 2 tahun'),
         jsonb_build_object('label', 'Masa percobaan', 'value', '90 hari')
       ),
       'benefits', jsonb_build_array(
         jsonb_build_object('icon', 'wallet', 'label', 'Gaji pokok',   'value', 'SAR 1.500 / bulan'),
         jsonb_build_object('icon', 'bowl',   'label', 'Uang makan',   'value', 'SAR 300 / bulan'),
         jsonb_build_object('icon', 'truck',  'label', 'Transportasi', 'value', 'Disediakan oleh perusahaan'),
         jsonb_build_object('icon', 'shield', 'label', 'Asuransi',     'value', 'Disediakan'),
         jsonb_build_object('icon', 'home',   'label', 'Akomodasi',    'value', 'Disediakan oleh perusahaan')
       )
     )
WHERE slug = 'laundry-worker-saudi-arabia';

DELETE FROM position_application_fields
  WHERE position_slug = 'laundry-worker-saudi-arabia'
    AND sort_order   = 1001
    AND field_key    = 'english_level';
