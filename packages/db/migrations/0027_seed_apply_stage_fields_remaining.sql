-- =========================================================================
-- MIGRATION 0027: Seed position_form_fields for the 11 remaining positions
-- =========================================================================
-- Completes apply-stage qualifying-question coverage for the full 16-slot
-- catalog. After this migration:
--   - All Saudi positions seeded (perawat done in 0025; 30WET coffee/pastry
--     done in 0026; this migration finishes waiter/waitress/chef_bakery/
--     spa_therapist/laundry_worker)
--   - All Jepang positions seeded (jlpt_level + role-specific SSW cert)
--   - Caregiver Taiwan + SPG Indonesia seeded
--
-- Pattern (3 Q per position):
--   Q1 = role-specific experience or hard-pass disqualifier (most often Wajib)
--   Q2 = primary language (english_self or jlpt_level)
--   Q3 = role-specific bonus signal
--
-- Shared field_keys leveraged from REQUIREMENT_LIBRARY for cross-position
-- credential reuse: english_self, exp_fnb, exp_caregiving, exp_driving,
-- jlpt_level (new — but follows the same convention).
-- =========================================================================

INSERT INTO position_form_fields (
  position_slug, field_key, field_label, field_help, field_type, options,
  required, tier_weight, sort_order, collect_at_stage
)
VALUES

  -- ========================= WAITER (Saudi) =========================
  (
    'waiter-saudi-arabia', 'exp_fnb',
    'Pengalaman F&B service / restoran?', NULL, 'radio',
    '[
      {"value":"none","label":"Belum ada"},
      {"value":"less_than_1","label":"Kurang dari 1 tahun"},
      {"value":"1-3","label":"1–3 tahun"},
      {"value":"3+","label":"Lebih dari 3 tahun"}
    ]'::jsonb,
    true, 2, 1, 'applied'
  ),
  (
    'waiter-saudi-arabia', 'english_self',
    'Bahasa Inggris kamu?', NULL, 'radio',
    '[
      {"value":"basic","label":"Bisa percakapan dasar"},
      {"value":"intermediate","label":"Bisa diskusi profesional"},
      {"value":"fluent","label":"Fasih bicara & menulis"}
    ]'::jsonb,
    true, 1, 2, 'applied'
  ),
  (
    'waiter-saudi-arabia', 'hospitality_skill',
    'Pengalaman customer-facing (kasir, retail, customer service)?',
    'Termasuk pengalaman selain F&B yang melayani pelanggan langsung.',
    'radio',
    '[
      {"value":"yes","label":"Ya, pernah"},
      {"value":"no","label":"Belum pernah"}
    ]'::jsonb,
    false, 1, 3, 'applied'
  ),

  -- ========================= WAITRESS (Saudi) =========================
  (
    'waitress-saudi-arabia', 'exp_fnb',
    'Pengalaman F&B service / restoran?', NULL, 'radio',
    '[
      {"value":"none","label":"Belum ada"},
      {"value":"less_than_1","label":"Kurang dari 1 tahun"},
      {"value":"1-3","label":"1–3 tahun"},
      {"value":"3+","label":"Lebih dari 3 tahun"}
    ]'::jsonb,
    true, 2, 1, 'applied'
  ),
  (
    'waitress-saudi-arabia', 'english_self',
    'Bahasa Inggris kamu?', NULL, 'radio',
    '[
      {"value":"basic","label":"Bisa percakapan dasar"},
      {"value":"intermediate","label":"Bisa diskusi profesional"},
      {"value":"fluent","label":"Fasih bicara & menulis"}
    ]'::jsonb,
    true, 1, 2, 'applied'
  ),
  (
    'waitress-saudi-arabia', 'hospitality_skill',
    'Pengalaman customer-facing (kasir, retail, customer service)?',
    'Termasuk pengalaman selain F&B yang melayani pelanggan langsung.',
    'radio',
    '[
      {"value":"yes","label":"Ya, pernah"},
      {"value":"no","label":"Belum pernah"}
    ]'::jsonb,
    false, 1, 3, 'applied'
  ),

  -- ========================= CHEF BAKERY (Saudi) =========================
  (
    'chef-bakery-saudi-arabia', 'exp_bakery',
    'Pengalaman bakery / pastry?',
    'Termasuk produksi roti, kue, dan dessert.',
    'radio',
    '[
      {"value":"none","label":"Belum ada"},
      {"value":"less_than_1","label":"Kurang dari 1 tahun"},
      {"value":"1-3","label":"1–3 tahun"},
      {"value":"3+","label":"Lebih dari 3 tahun"}
    ]'::jsonb,
    false, 2, 1, 'applied'
  ),
  (
    'chef-bakery-saudi-arabia', 'english_self',
    'Bahasa Inggris kamu?', NULL, 'radio',
    '[
      {"value":"basic","label":"Bisa percakapan dasar"},
      {"value":"intermediate","label":"Bisa diskusi profesional"},
      {"value":"fluent","label":"Fasih bicara & menulis"}
    ]'::jsonb,
    true, 1, 2, 'applied'
  ),
  (
    'chef-bakery-saudi-arabia', 'cert_bakery',
    'Punya sertifikat training bakery / pastry?',
    'Termasuk sertifikat sekolah kuliner atau training profesional.',
    'radio',
    '[
      {"value":"yes","label":"Punya"},
      {"value":"no","label":"Belum punya"}
    ]'::jsonb,
    false, 1, 3, 'applied'
  ),

  -- ========================= SPA THERAPIST (Saudi) =========================
  (
    'spa-therapist-saudi-arabia', 'exp_spa',
    'Pengalaman sebagai Spa Therapist?', NULL, 'radio',
    '[
      {"value":"none","label":"Belum ada"},
      {"value":"less_than_1","label":"Kurang dari 1 tahun"},
      {"value":"1-3","label":"1–3 tahun"},
      {"value":"3+","label":"Lebih dari 3 tahun"}
    ]'::jsonb,
    true, 3, 1, 'applied'
  ),
  (
    'spa-therapist-saudi-arabia', 'english_self',
    'Bahasa Inggris kamu?', NULL, 'radio',
    '[
      {"value":"basic","label":"Bisa percakapan dasar"},
      {"value":"intermediate","label":"Bisa diskusi profesional"},
      {"value":"fluent","label":"Fasih bicara & menulis"}
    ]'::jsonb,
    true, 1, 2, 'applied'
  ),
  (
    'spa-therapist-saudi-arabia', 'spa_specialty',
    'Spesialisasi treatment yang kamu kuasai?',
    'Pilih semua yang sesuai. Membantu salon menempatkan kamu di section yang pas.',
    'multiselect',
    '[
      {"value":"swedish","label":"Swedish massage"},
      {"value":"thai","label":"Thai massage"},
      {"value":"deep_tissue","label":"Deep tissue"},
      {"value":"facial","label":"Facial / skincare"},
      {"value":"general","label":"General relaxation"}
    ]'::jsonb,
    false, 2, 3, 'applied'
  ),

  -- ========================= LAUNDRY WORKER (Saudi) =========================
  (
    'laundry-worker-saudi-arabia', 'exp_laundry',
    'Pengalaman kerja laundry / dry-cleaner?', NULL, 'radio',
    '[
      {"value":"none","label":"Belum ada"},
      {"value":"less_than_1","label":"Kurang dari 1 tahun"},
      {"value":"1-3","label":"1–3 tahun"},
      {"value":"3+","label":"Lebih dari 3 tahun"}
    ]'::jsonb,
    false, 1, 1, 'applied'
  ),
  (
    'laundry-worker-saudi-arabia', 'english_self',
    'Bahasa Inggris kamu?',
    'Untuk laundry cukup level dasar — kamu hanya perlu mengerti instruksi singkat.',
    'radio',
    '[
      {"value":"basic","label":"Bisa percakapan dasar"},
      {"value":"intermediate","label":"Bisa diskusi profesional"},
      {"value":"fluent","label":"Fasih bicara & menulis"}
    ]'::jsonb,
    true, 1, 2, 'applied'
  ),
  (
    'laundry-worker-saudi-arabia', 'operate_machines',
    'Pengalaman operasi mesin cuci industri / pengering besar?',
    NULL,
    'radio',
    '[
      {"value":"yes","label":"Pernah, mesin industri"},
      {"value":"home_only","label":"Mesin rumahan saja"},
      {"value":"no","label":"Belum pernah"}
    ]'::jsonb,
    false, 1, 3, 'applied'
  ),

  -- ========================= TRUCK DRIVER (Jepang) =========================
  (
    'truck-driver-jepang', 'jlpt_level',
    'Level Bahasa Jepang kamu (JLPT atau JFT)?',
    'JLPT N4 atau JFT A2 minimal untuk posisi ini.',
    'radio',
    '[
      {"value":"none","label":"Belum belajar"},
      {"value":"n5","label":"JLPT N5 / JFT A1"},
      {"value":"n4","label":"JLPT N4 / JFT A2"},
      {"value":"n3","label":"JLPT N3"},
      {"value":"n2_or_higher","label":"JLPT N2 atau lebih tinggi"}
    ]'::jsonb,
    true, 3, 1, 'applied'
  ),
  (
    'truck-driver-jepang', 'exp_driving',
    'Pengalaman menyetir di Indonesia (truk atau kendaraan besar)?', NULL, 'radio',
    '[
      {"value":"none","label":"Belum ada"},
      {"value":"less_than_2","label":"Kurang dari 2 tahun"},
      {"value":"2-5","label":"2–5 tahun"},
      {"value":"5+","label":"Lebih dari 5 tahun"}
    ]'::jsonb,
    true, 3, 2, 'applied'
  ),
  (
    'truck-driver-jepang', 'ssw_truck_driver',
    'Punya sertifikat SSW Truck Driver?',
    'Sertifikat resmi Specified Skilled Worker untuk truck driving.',
    'radio',
    '[
      {"value":"yes","label":"Sudah punya"},
      {"value":"in_progress","label":"Sedang proses ujian"},
      {"value":"no","label":"Belum punya"}
    ]'::jsonb,
    false, 2, 3, 'applied'
  ),

  -- ========================= FOOD SERVICE (Jepang) =========================
  (
    'food-service-jepang', 'jlpt_level',
    'Level Bahasa Jepang kamu (JLPT atau JFT)?',
    'JLPT N4 atau JFT A2 minimal untuk posisi ini.',
    'radio',
    '[
      {"value":"none","label":"Belum belajar"},
      {"value":"n5","label":"JLPT N5 / JFT A1"},
      {"value":"n4","label":"JLPT N4 / JFT A2"},
      {"value":"n3","label":"JLPT N3"},
      {"value":"n2_or_higher","label":"JLPT N2 atau lebih tinggi"}
    ]'::jsonb,
    true, 3, 1, 'applied'
  ),
  (
    'food-service-jepang', 'ssw_restoran',
    'Punya sertifikat SSW Restoran (Foodservice Industry)?',
    NULL,
    'radio',
    '[
      {"value":"yes","label":"Sudah punya"},
      {"value":"in_progress","label":"Sedang proses ujian"},
      {"value":"no","label":"Belum punya"}
    ]'::jsonb,
    true, 3, 2, 'applied'
  ),
  (
    'food-service-jepang', 'exp_cooking',
    'Pengalaman memasak / di dapur restoran?', NULL, 'radio',
    '[
      {"value":"none","label":"Belum ada"},
      {"value":"less_than_1","label":"Kurang dari 1 tahun"},
      {"value":"1-3","label":"1–3 tahun"},
      {"value":"3+","label":"Lebih dari 3 tahun"}
    ]'::jsonb,
    false, 1, 3, 'applied'
  ),

  -- ========================= KAIGO (Jepang) =========================
  (
    'kaigo-jepang', 'jlpt_level',
    'Level Bahasa Jepang kamu (JLPT atau JFT)?',
    'JLPT N4 atau JFT A2 minimal untuk caregiving SSW.',
    'radio',
    '[
      {"value":"none","label":"Belum belajar"},
      {"value":"n5","label":"JLPT N5 / JFT A1"},
      {"value":"n4","label":"JLPT N4 / JFT A2"},
      {"value":"n3","label":"JLPT N3"},
      {"value":"n2_or_higher","label":"JLPT N2 atau lebih tinggi"}
    ]'::jsonb,
    true, 3, 1, 'applied'
  ),
  (
    'kaigo-jepang', 'ssw_kaigo',
    'Punya sertifikat SSW Kaigo (Caregiver)?',
    NULL,
    'radio',
    '[
      {"value":"yes","label":"Sudah punya"},
      {"value":"in_progress","label":"Sedang proses ujian"},
      {"value":"no","label":"Belum punya"}
    ]'::jsonb,
    true, 3, 2, 'applied'
  ),
  (
    'kaigo-jepang', 'exp_caregiving',
    'Pengalaman caregiving (panti, RS, atau home care)?', NULL, 'radio',
    '[
      {"value":"none","label":"Belum ada"},
      {"value":"less_than_1","label":"Kurang dari 1 tahun"},
      {"value":"1-3","label":"1–3 tahun"},
      {"value":"3+","label":"Lebih dari 3 tahun"}
    ]'::jsonb,
    false, 2, 3, 'applied'
  ),

  -- ========================= PENGOLAHAN MAKANAN (Jepang) =========================
  (
    'pengolahan-makanan-jepang', 'jlpt_level',
    'Level Bahasa Jepang kamu (JLPT atau JFT)?',
    'JLPT N4 atau JFT A2 minimal untuk posisi ini.',
    'radio',
    '[
      {"value":"none","label":"Belum belajar"},
      {"value":"n5","label":"JLPT N5 / JFT A1"},
      {"value":"n4","label":"JLPT N4 / JFT A2"},
      {"value":"n3","label":"JLPT N3"},
      {"value":"n2_or_higher","label":"JLPT N2 atau lebih tinggi"}
    ]'::jsonb,
    true, 3, 1, 'applied'
  ),
  (
    'pengolahan-makanan-jepang', 'ssw_food_processing',
    'Punya sertifikat SSW Pengolahan Makanan?',
    NULL,
    'radio',
    '[
      {"value":"yes","label":"Sudah punya"},
      {"value":"in_progress","label":"Sedang proses ujian"},
      {"value":"no","label":"Belum punya"}
    ]'::jsonb,
    true, 3, 2, 'applied'
  ),
  (
    'pengolahan-makanan-jepang', 'exp_food_processing',
    'Pengalaman kerja pabrik / pengolahan makanan?', NULL, 'radio',
    '[
      {"value":"none","label":"Belum ada"},
      {"value":"less_than_1","label":"Kurang dari 1 tahun"},
      {"value":"1-3","label":"1–3 tahun"},
      {"value":"3+","label":"Lebih dari 3 tahun"}
    ]'::jsonb,
    false, 1, 3, 'applied'
  ),

  -- ========================= CAREGIVER (Taiwan) =========================
  (
    'caregiver-taiwan', 'exp_caregiving',
    'Pengalaman merawat orang sakit / lansia?',
    'Termasuk pengalaman di panti, RS, atau merawat keluarga.',
    'radio',
    '[
      {"value":"none","label":"Belum ada"},
      {"value":"less_than_1","label":"Kurang dari 1 tahun"},
      {"value":"1-3","label":"1–3 tahun"},
      {"value":"3+","label":"Lebih dari 3 tahun"}
    ]'::jsonb,
    true, 3, 1, 'applied'
  ),
  (
    'caregiver-taiwan', 'physical_meets_min',
    'Tinggi badan minimal 155cm dan berat minimal 55kg?',
    'Posisi ini secara fisik menuntut — angkat lansia & bantuan mobilitas.',
    'radio',
    '[
      {"value":"yes","label":"Ya, sesuai"},
      {"value":"no","label":"Tidak / belum"}
    ]'::jsonb,
    true, 2, 2, 'applied'
  ),
  (
    'caregiver-taiwan', 'mandarin_self',
    'Bahasa Mandarin kamu?',
    'Tidak wajib, tapi sangat membantu komunikasi dengan keluarga pasien.',
    'radio',
    '[
      {"value":"none","label":"Belum bisa"},
      {"value":"basic","label":"Bisa kata-kata dasar"},
      {"value":"intermediate","label":"Bisa percakapan sehari-hari"},
      {"value":"fluent","label":"Fasih"}
    ]'::jsonb,
    false, 2, 3, 'applied'
  ),

  -- ========================= SPG (Indonesia) =========================
  (
    'spg-indonesia', 'exp_spg',
    'Pengalaman sebagai SPG / sales promotion?', NULL, 'radio',
    '[
      {"value":"none","label":"Belum ada"},
      {"value":"less_than_1","label":"Kurang dari 1 tahun"},
      {"value":"1-3","label":"1–3 tahun"},
      {"value":"3+","label":"Lebih dari 3 tahun"}
    ]'::jsonb,
    false, 1, 1, 'applied'
  ),
  (
    'spg-indonesia', 'spg_locations',
    'Kota mana yang kamu siap untuk ditempatkan?',
    'Pilih semua yang oke. Kami match-kan kamu dengan brand yang sedang buka di kota tersebut.',
    'multiselect',
    '[
      {"value":"jakarta","label":"Jakarta"},
      {"value":"bandung","label":"Bandung"},
      {"value":"surabaya","label":"Surabaya"},
      {"value":"semarang","label":"Semarang"},
      {"value":"medan","label":"Medan"},
      {"value":"lainnya","label":"Lainnya / fleksibel"}
    ]'::jsonb,
    true, 2, 2, 'applied'
  ),
  (
    'spg-indonesia', 'shift_availability',
    'Ketersediaan shift kerja kamu?',
    NULL,
    'radio',
    '[
      {"value":"full_time","label":"Full-time, semua hari"},
      {"value":"weekdays","label":"Weekdays saja"},
      {"value":"weekends","label":"Weekends saja"},
      {"value":"flexible","label":"Fleksibel sesuai jadwal brand"}
    ]'::jsonb,
    false, 1, 3, 'applied'
  )

ON CONFLICT (position_slug, field_key) DO NOTHING;

-- =========================================================================
-- DONE — migration 0027
-- All 16 positions now have apply-stage qualifying questions seeded.
-- =========================================================================
