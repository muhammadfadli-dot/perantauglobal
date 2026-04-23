-- =========================================================================
-- MIGRATION 0011: Re-seed positions per FEEDBACK LANDING PAGE PDF (2026-04-23)
-- =========================================================================
-- Adds the 6 missing positions per Mas Martin & Sourcing team:
--   waitress-saudi-arabia, chef-bakery-saudi-arabia, spa-therapist-saudi-arabia,
--   laundry-worker-saudi-arabia, pengolahan-makanan-jepang, caregiver-taiwan,
--   spg-indonesia
-- Deactivates: dental-nurse-saudi-arabia (if exists), global-talent-hub
--   (GTH is now THE app, not a position; talent-pool catch-all retired).
-- Updates copy on existing 6 to match PDF (general country names, etc).
-- =========================================================================

INSERT INTO positions (slug, role, country, name, description, requirements, scoring, pipeline, active)
VALUES
  -- ========== Saudi Arabia (7) ==========
  (
    'perawat-saudi-arabia', 'nurse', 'saudi_arabia',
    'Perawat — Saudi Arabia',
    'Lowongan perawat Indonesia untuk rumah sakit & klinik di Saudi Arabia. Kontrak 2 tahun, gaji SAR 3.200/bulan + makan SAR 200.',
    jsonb_build_object(
      'str_active', jsonb_build_object('type', 'hard', 'label', 'STR aktif',
        'allowed_values', jsonb_build_array('yes', 'inProgress')),
      'experience_years', jsonb_build_object('type', 'hard', 'label', 'Pengalaman kerja perawat',
        'allowed_values', jsonb_build_array('1-3', '3+')),
      'english_level', jsonb_build_object('type', 'soft', 'label', 'Bahasa Inggris')
    ),
    '{}'::jsonb, '{}'::jsonb, true
  ),
  (
    'barista-saudi-arabia', 'barista', 'saudi_arabia',
    'Barista — Saudi Arabia',
    'Lowongan barista untuk coffee shop di Saudi Arabia. SAR 1.500/bulan + makan SAR 300.',
    jsonb_build_object(
      'english_level', jsonb_build_object('type', 'hard', 'label', 'Bahasa Inggris',
        'allowed_values', jsonb_build_array('intermediate', 'fluent')),
      'experience_type', jsonb_build_object('type', 'soft', 'label', 'Pengalaman kerja')
    ),
    '{}'::jsonb, '{}'::jsonb, true
  ),
  (
    'waiter-saudi-arabia', 'waiter', 'saudi_arabia',
    'Waiter — Saudi Arabia',
    'Lowongan waiter untuk restoran di Saudi Arabia. SAR 1.500/bulan + makan SAR 300.',
    jsonb_build_object(
      'english_level', jsonb_build_object('type', 'hard', 'label', 'Bahasa Inggris',
        'allowed_values', jsonb_build_array('intermediate', 'fluent')),
      'experience_type', jsonb_build_object('type', 'soft', 'label', 'Pengalaman kerja')
    ),
    '{}'::jsonb, '{}'::jsonb, true
  ),
  (
    'waitress-saudi-arabia', 'waitress', 'saudi_arabia',
    'Waitress — Saudi Arabia',
    'Lowongan waitress untuk restoran di Saudi Arabia. SAR 1.600/bulan + makan disediakan.',
    jsonb_build_object(
      'english_level', jsonb_build_object('type', 'hard', 'label', 'Bahasa Inggris',
        'allowed_values', jsonb_build_array('intermediate', 'fluent')),
      'experience_type', jsonb_build_object('type', 'soft', 'label', 'Pengalaman kerja')
    ),
    '{}'::jsonb, '{}'::jsonb, true
  ),
  (
    'chef-bakery-saudi-arabia', 'chef_bakery', 'saudi_arabia',
    'Chef Bakery — Saudi Arabia',
    'Lowongan chef bakery untuk hotel/restaurant di Saudi Arabia. SAR 2.000/bulan + makan disediakan.',
    jsonb_build_object(
      'english_level', jsonb_build_object('type', 'hard', 'label', 'Bahasa Inggris',
        'allowed_values', jsonb_build_array('intermediate', 'fluent')),
      'experience_type', jsonb_build_object('type', 'soft', 'label', 'Pengalaman bakery / pastry')
    ),
    '{}'::jsonb, '{}'::jsonb, true
  ),
  (
    'spa-therapist-saudi-arabia', 'spa_therapist', 'saudi_arabia',
    'Spa Therapist — Saudi Arabia',
    'Lowongan spa therapist (Dany Salon) di Saudi Arabia. SAR 1.500/bulan + makan SAR 300 + bonus 2% invoice.',
    jsonb_build_object(
      'experience_years', jsonb_build_object('type', 'hard', 'label', 'Pengalaman Spa Therapist',
        'allowed_values', jsonb_build_array('1-3', '3+')),
      'english_level', jsonb_build_object('type', 'soft', 'label', 'Bahasa Inggris')
    ),
    '{}'::jsonb, '{}'::jsonb, true
  ),
  (
    'laundry-worker-saudi-arabia', 'laundry_worker', 'saudi_arabia',
    'Laundry Worker — Saudi Arabia',
    'Lowongan laundry worker di Saudi Arabia. SAR 1.500/bulan + makan SAR 300.',
    jsonb_build_object(
      'english_level', jsonb_build_object('type', 'soft', 'label', 'Bahasa Inggris dasar')
    ),
    '{}'::jsonb, '{}'::jsonb, true
  ),
  -- ========== Jepang (4) ==========
  (
    'truck-driver-jepang', 'truck_driver', 'japan',
    'Truck Driver — Jepang',
    'Lowongan sopir truk untuk perusahaan logistik di Jepang. ¥250.000/bulan, komitmen 5 tahun.',
    jsonb_build_object(
      'sim_type', jsonb_build_object('type', 'hard', 'label', 'SIM A/B (>1 tahun)',
        'allowed_values', jsonb_build_array('sim_a', 'sim_b1', 'sim_b2', 'sim_internasional')),
      'jlpt_level', jsonb_build_object('type', 'hard', 'label', 'Bahasa Jepang JLPT N4 / JFT A2',
        'allowed_values', jsonb_build_array('n4', 'n3', 'n2')),
      'driving_years', jsonb_build_object('type', 'hard', 'label', 'Pengalaman menyetir min 2 tahun',
        'allowed_values', jsonb_build_array('1-2', '3-5', '5+'))
    ),
    '{}'::jsonb, '{}'::jsonb, true
  ),
  (
    'food-service-jepang', 'food_service', 'japan',
    'Food Service — Jepang',
    'Lowongan food service (restoran) di Jepang. ¥1.226/jam (sistem SSW Restoran).',
    jsonb_build_object(
      'jlpt_level', jsonb_build_object('type', 'hard', 'label', 'Bahasa Jepang JFT A2 / JLPT N4',
        'allowed_values', jsonb_build_array('n4', 'n3', 'n2')),
      'food_certification', jsonb_build_object('type', 'hard', 'label', 'SSW Restoran',
        'allowed_values', jsonb_build_array('ssw_food_service')),
      'experience_type', jsonb_build_object('type', 'soft', 'label', 'Pengalaman memasak')
    ),
    '{}'::jsonb, '{}'::jsonb, true
  ),
  (
    'kaigo-jepang', 'kaigo', 'japan',
    'Caregiver Panti — Jepang',
    'Lowongan caregiver panti lansia di Jepang. ¥190.000/bulan THP (sistem SSW Kaigo).',
    jsonb_build_object(
      'jlpt_level', jsonb_build_object('type', 'hard', 'label', 'Bahasa Jepang JLPT N4 / JFT A2',
        'allowed_values', jsonb_build_array('n4', 'n3', 'n2')),
      'care_certification', jsonb_build_object('type', 'hard', 'label', 'SSW Kaigo / D3 Keperawatan',
        'allowed_values', jsonb_build_array('ssw_kaigo', 'nursing_d3', 'nursing_s1'))
    ),
    '{}'::jsonb, '{}'::jsonb, true
  ),
  (
    'pengolahan-makanan-jepang', 'pengolahan_makanan', 'japan',
    'Pengolahan Makanan — Jepang',
    'Lowongan pengolahan makanan (seafood/sushi line) di Jepang. ¥210.000/bulan (sistem SSW).',
    jsonb_build_object(
      'jlpt_level', jsonb_build_object('type', 'hard', 'label', 'Bahasa Jepang JLPT N4 / JFT A2',
        'allowed_values', jsonb_build_array('n4', 'n3', 'n2')),
      'food_certification', jsonb_build_object('type', 'hard', 'label', 'SSW Pengolahan Makanan',
        'allowed_values', jsonb_build_array('ssw_food_service'))
    ),
    '{}'::jsonb, '{}'::jsonb, true
  ),
  -- ========== Lainnya (2) ==========
  (
    'caregiver-taiwan', 'caregiver', 'taiwan',
    'Caregiver — Taiwan',
    'Lowongan caregiver lansia/sakit di Taiwan. NT$ 29.500/bulan (akomodasi potong gaji NT$ 2.500).',
    jsonb_build_object(
      'experience_years', jsonb_build_object('type', 'hard', 'label', 'Pengalaman caregiver min 1 tahun',
        'allowed_values', jsonb_build_array('1-3', '3+')),
      'care_certification', jsonb_build_object('type', 'soft', 'label', 'Sertifikasi caregiver / pelatihan')
    ),
    '{}'::jsonb, '{}'::jsonb, true
  ),
  (
    'spg-indonesia', 'spg', 'indonesia',
    'SPG — Indonesia',
    'Lowongan SPG penempatan domestic di Indonesia. Multi-kota (Jakarta, Surabaya, Bandung, dll).',
    jsonb_build_object(
      'experience_type', jsonb_build_object('type', 'soft', 'label', 'Pengalaman SPG / retail')
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

-- Deactivate retired slugs (per PDF feedback)
UPDATE positions SET active = false, updated_at = NOW()
WHERE slug IN ('dental-nurse-saudi-arabia', 'global-talent-hub');

-- =========================================================================
-- DONE — migration 0011
-- =========================================================================
