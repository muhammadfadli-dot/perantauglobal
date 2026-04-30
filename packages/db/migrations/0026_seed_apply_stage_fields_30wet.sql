-- =========================================================================
-- MIGRATION 0026: Seed position_form_fields for 30WET coffee/pastry roles
-- =========================================================================
-- Adds qualifying questions (collect_at_stage='applied') for the 4 positions
-- with active ad campaigns:
--   - head-barista-saudi-arabia
--   - barista-saudi-arabia
--   - roaster-saudi-arabia
--   - chef-pastry-saudi-arabia
--
-- Pattern: 3 questions per position. Q1 = role-specific experience (Wajib),
-- Q2 = English level (Wajib, shared key `english_self` for cross-position
-- credential reuse), Q3 = role-specific bonus signal.
--
-- field_key for English uses the REQUIREMENT_LIBRARY key `english_self` so
-- candidate.profile_data.credentials.english_self surfaces consistently in
-- readiness_view and dashboard regardless of which position they applied for.
-- =========================================================================

INSERT INTO position_form_fields (
  position_slug, field_key, field_label, field_help, field_type, options,
  required, tier_weight, sort_order, collect_at_stage
)
VALUES

  -- ========================= HEAD BARISTA =========================
  (
    'head-barista-saudi-arabia',
    'exp_barista',
    'Pengalaman sebagai barista (termasuk head barista)?',
    'Hitung total pengalaman, bukan hanya posisi head barista.',
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
    'head-barista-saudi-arabia',
    'english_self',
    'Bahasa Inggris kamu?',
    NULL,
    'radio',
    '[
      {"value":"basic","label":"Bisa percakapan dasar"},
      {"value":"intermediate","label":"Bisa diskusi profesional"},
      {"value":"fluent","label":"Fasih bicara & menulis"}
    ]'::jsonb,
    true, 1, 2, 'applied'
  ),
  (
    'head-barista-saudi-arabia',
    'latte_art_skill',
    'Kemampuan latte art kamu?',
    'Untuk cocokkan kamu dengan menu specialty café yang fokus visual coffee.',
    'radio',
    '[
      {"value":"none","label":"Belum bisa"},
      {"value":"basic","label":"Bisa dasar (heart, rosetta)"},
      {"value":"advanced","label":"Mahir (multi-layer, freepour kompleks)"}
    ]'::jsonb,
    false, 2, 3, 'applied'
  ),

  -- ========================= BARISTA =========================
  (
    'barista-saudi-arabia',
    'exp_barista',
    'Pengalaman sebagai barista?',
    NULL,
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
    'barista-saudi-arabia',
    'english_self',
    'Bahasa Inggris kamu?',
    NULL,
    'radio',
    '[
      {"value":"basic","label":"Bisa percakapan dasar"},
      {"value":"intermediate","label":"Bisa diskusi profesional"},
      {"value":"fluent","label":"Fasih bicara & menulis"}
    ]'::jsonb,
    true, 1, 2, 'applied'
  ),
  (
    'barista-saudi-arabia',
    'cert_barista',
    'Punya sertifikat training kopi / barista?',
    'SCA, brewing course, atau sertifikat barista lain.',
    'radio',
    '[
      {"value":"yes","label":"Punya"},
      {"value":"no","label":"Belum punya"}
    ]'::jsonb,
    false, 1, 3, 'applied'
  ),

  -- ========================= ROASTER =========================
  (
    'roaster-saudi-arabia',
    'exp_roasting',
    'Pengalaman coffee roasting?',
    'Termasuk menjalankan mesin roaster dan profiling.',
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
    'roaster-saudi-arabia',
    'english_self',
    'Bahasa Inggris kamu?',
    NULL,
    'radio',
    '[
      {"value":"basic","label":"Bisa percakapan dasar"},
      {"value":"intermediate","label":"Bisa diskusi profesional"},
      {"value":"fluent","label":"Fasih bicara & menulis"}
    ]'::jsonb,
    true, 1, 2, 'applied'
  ),
  (
    'roaster-saudi-arabia',
    'cupping_qgrader',
    'Pengalaman cupping atau Q-grader?',
    NULL,
    'radio',
    '[
      {"value":"none","label":"Belum pernah"},
      {"value":"training","label":"Pernah training cupping"},
      {"value":"qgrader","label":"Bersertifikat Q-grader"}
    ]'::jsonb,
    false, 2, 3, 'applied'
  ),

  -- ========================= CHEF PASTRY =========================
  (
    'chef-pastry-saudi-arabia',
    'exp_pastry',
    'Pengalaman pastry / dessert?',
    NULL,
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
    'chef-pastry-saudi-arabia',
    'english_self',
    'Bahasa Inggris kamu?',
    NULL,
    'radio',
    '[
      {"value":"basic","label":"Bisa percakapan dasar"},
      {"value":"intermediate","label":"Bisa diskusi profesional"},
      {"value":"fluent","label":"Fasih bicara & menulis"}
    ]'::jsonb,
    true, 1, 2, 'applied'
  ),
  (
    'chef-pastry-saudi-arabia',
    'menu_dev_exp',
    'Pernah develop menu / resep baru?',
    'Termasuk eksperimen resep dan adaptasi tren pasar.',
    'radio',
    '[
      {"value":"yes","label":"Pernah, sudah jadi menu reguler"},
      {"value":"experimented","label":"Pernah eksperimen, belum dirilis"},
      {"value":"no","label":"Belum pernah"}
    ]'::jsonb,
    false, 2, 3, 'applied'
  )

ON CONFLICT (position_slug, field_key) DO NOTHING;

-- =========================================================================
-- DONE — migration 0026
-- =========================================================================
