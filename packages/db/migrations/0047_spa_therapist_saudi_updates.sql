-- Migration 0047: spa-therapist-saudi-arabia jobDescription + qualification cleanup
-- Applied to prod Supabase project jeadtvxgxmqnsqwxjmhj on 2026-05-27.
--
-- Aligns spa-therapist with the final approved poster
-- (PG_SA_spa-therapist-saudi-arabia_260325.png).
--
-- Content changes:
--   - jobDescription: was empty array; landing page showed no description.
--     Added 4 standard spa therapist duties.
--
-- Qualification field changes:
--   - Drop `english_level` text field at sort 1001 (duplicate of english_self radio at sort 2)
--   - Drop bogus `experience_years` multiselect at sort 1002 — its options were
--     massage technique names ("Swedish Massage", value "1-3"), field_key/label/options
--     all mismatched. Replaced with proper `teknik_spa` multiselect (optional)
--     so we can capture which techniques the candidate knows.

UPDATE positions
SET content = content
  || jsonb_build_object(
       'jobDescription', jsonb_build_array(
         'Memberikan layanan terapi spa dan pijat sesuai standar (Swedish, Deep Tissue, Balinese, dll.)',
         'Konsultasi singkat dengan klien untuk menentukan teknik yang sesuai',
         'Menyiapkan minyak, lilin aromaterapi, handuk, dan perlengkapan treatment sebelum sesi',
         'Menjaga kebersihan ruang treatment dan perlengkapan sesuai standar salon'
       )
     )
WHERE slug = 'spa-therapist-saudi-arabia';

DELETE FROM position_application_fields
  WHERE position_slug = 'spa-therapist-saudi-arabia'
    AND sort_order IN (1001, 1002);

INSERT INTO position_application_fields
  (position_slug, sort_order, section, field_key, field_label, field_type, importance, collect_at_stage, options)
VALUES
  ('spa-therapist-saudi-arabia', 3, 'syarat_utama', 'teknik_spa',
   'Teknik spa / pijat yang kamu kuasai?', 'multiselect', 'optional', 'applied',
   '[{"label":"Swedish Massage","value":"swedish"},{"label":"Deep Tissue Massage","value":"deep_tissue"},{"label":"Balinese Massage","value":"balinese"},{"label":"Thai Massage","value":"thai"},{"label":"Hot Stone Massage","value":"hot_stone"},{"label":"Aromatherapy Massage","value":"aromatherapy"},{"label":"Pedicure / Manicure","value":"pedi_mani"}]'::jsonb);
