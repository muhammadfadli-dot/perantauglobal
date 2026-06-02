-- =========================================================================
-- MIGRATION 0061: Akademi Perantau — SAMPLE seed (optional, for testing)
-- =========================================================================
-- A clearly-labelled in_app sample program so the candidate guided-learning
-- flow (catalog → daftar → modul baca → kuis → hasil → sertifikat) can be
-- demoed end-to-end the moment 0060 is applied.
--
-- This is NOT the real Masterclass Financial — that content is authored later.
-- Safe to skip, or delete after testing:
--   DELETE FROM academy_programs WHERE slug = 'contoh-persiapan-kerja';
--   (cascades modules/lessons/keys; enrollments use RESTRICT so clear test
--    enrollments first if any exist.)
-- =========================================================================

INSERT INTO academy_programs (
  slug, title, subtitle, category, delivery_mode, facilitated_by, is_free,
  output_type, credential_issuer, credential_delivery, duration_label,
  pass_threshold, status, sort_order, published_at, content
) VALUES (
  'contoh-persiapan-kerja',
  '[CONTOH] Persiapan Kerja ke Luar Negeri',
  'Kelas contoh buat nguji alur Akademi Perantau',
  'masterclass', 'in_app', 'Daya Skill', true,
  'certificate', 'Daya Skill', 'in_app', '~30 menit',
  70, 'published', 0, NOW(),
  jsonb_build_object(
    'intro', 'Kelas contoh ini nunjukin gimana belajar di Akademi Perantau: baca materi singkat, lalu kerjain kuis. Selesai semua + lulus kuis, sertifikat kamu terbit otomatis.',
    'benefits', jsonb_build_array(
      'Paham langkah dasar sebelum berangkat kerja ke luar negeri',
      'Tahu dokumen apa aja yang harus disiapin',
      'Bisa bedain jalur resmi vs calo'
    ),
    'doc_checklist', jsonb_build_array(
      jsonb_build_object('label', 'KTP', 'note', 'Pastikan masih berlaku'),
      jsonb_build_object('label', 'Paspor', 'note', 'Kalau belum ada, urus dari sekarang')
    )
  )
)
ON CONFLICT (slug) DO NOTHING;

-- Optional registration field
INSERT INTO program_registration_fields (
  program_slug, sort_order, field_key, field_label, field_help, field_type, options, required
) VALUES (
  'contoh-persiapan-kerja', 0, 'negara_tujuan', 'Negara tujuan kamu',
  'Pilih negara yang paling kamu minati', 'select',
  jsonb_build_array(
    jsonb_build_object('value', 'jepang', 'label', 'Jepang'),
    jsonb_build_object('value', 'saudi', 'label', 'Arab Saudi'),
    jsonb_build_object('value', 'taiwan', 'label', 'Taiwan'),
    jsonb_build_object('value', 'belum', 'label', 'Belum tahu')
  ),
  false
)
ON CONFLICT (program_slug, field_key) DO NOTHING;

-- Modules
INSERT INTO academy_modules (id, program_slug, module_num, title, summary, sort_order) VALUES
  ('a0000000-0000-4000-8000-000000000001', 'contoh-persiapan-kerja', 1, 'Dasar Persiapan Berangkat', 'Langkah awal sebelum berangkat', 0),
  ('a0000000-0000-4000-8000-000000000002', 'contoh-persiapan-kerja', 2, 'Aman dari Calo', 'Kenali jalur resmi', 1)
ON CONFLICT (id) DO NOTHING;

-- Lessons (module 1)
INSERT INTO academy_lessons (id, module_id, lesson_num, title, lesson_type, estimated_minutes, sort_order, content) VALUES
  ('b0000000-0000-4000-8000-000000000011', 'a0000000-0000-4000-8000-000000000001', 1, 'Kenapa persiapan itu penting', 'reading', 5, 0,
   jsonb_build_object('blocks', jsonb_build_array(
     jsonb_build_object('type','paragraph','text','Berangkat kerja ke luar negeri itu peluang besar, tapi cuma aman kalau lewat jalur resmi dan kamu siap. Persiapan yang baik bikin proses lancar dan kamu nggak gampang ditipu.'),
     jsonb_build_object('type','heading','text','Tiga hal utama'),
     jsonb_build_object('type','list','items', jsonb_build_array('Dokumen lengkap dan asli','Paham hak dan kewajiban kamu','Lewat agen resmi (P3MI), bukan calo'))
   ))),
  ('b0000000-0000-4000-8000-000000000012', 'a0000000-0000-4000-8000-000000000001', 2, 'Dokumen yang harus disiapin', 'reading', 5, 1,
   jsonb_build_object('blocks', jsonb_build_array(
     jsonb_build_object('type','paragraph','text','Siapin dokumen ini dari awal biar nggak buru-buru nanti.'),
     jsonb_build_object('type','list','items', jsonb_build_array('KTP yang masih berlaku','Kartu Keluarga','Paspor','Ijazah terakhir')),
     jsonb_build_object('type','callout','text','Jangan pernah kasih dokumen asli ke orang yang nggak jelas. Foto/salinan dulu kalau diminta.')
   ))),
  ('b0000000-0000-4000-8000-000000000013', 'a0000000-0000-4000-8000-000000000001', 3, 'Kuis: Dasar persiapan', 'quiz', 3, 2,
   jsonb_build_object('questions', jsonb_build_array(
     jsonb_build_object('id','q1','prompt','Lewat siapa sebaiknya kamu berangkat kerja ke luar negeri?','options', jsonb_build_array(
       jsonb_build_object('key','a','label','Calo yang janji cepat'),
       jsonb_build_object('key','b','label','Agen resmi P3MI'),
       jsonb_build_object('key','c','label','Teman yang belum jelas')
     )),
     jsonb_build_object('id','q2','prompt','Mana yang termasuk dokumen wajib?','multiple', true, 'options', jsonb_build_array(
       jsonb_build_object('key','a','label','KTP'),
       jsonb_build_object('key','b','label','Paspor'),
       jsonb_build_object('key','c','label','Struk belanja')
     ))
   )))
ON CONFLICT (id) DO NOTHING;

-- Lessons (module 2)
INSERT INTO academy_lessons (id, module_id, lesson_num, title, lesson_type, estimated_minutes, sort_order, content) VALUES
  ('b0000000-0000-4000-8000-000000000021', 'a0000000-0000-4000-8000-000000000002', 1, 'Ciri-ciri calo', 'reading', 4, 0,
   jsonb_build_object('blocks', jsonb_build_array(
     jsonb_build_object('type','paragraph','text','Calo sering pakai cara yang sama. Kalau kamu tahu cirinya, kamu nggak akan kena.'),
     jsonb_build_object('type','list','items', jsonb_build_array('Minta bayar di muka sebelum ada kontrak jelas','Janji berangkat super cepat tanpa proses','Nggak mau kasih nama perusahaan resmi'))
   ))),
  ('b0000000-0000-4000-8000-000000000022', 'a0000000-0000-4000-8000-000000000002', 2, 'Kuis: Hindari calo', 'quiz', 3, 1,
   jsonb_build_object('questions', jsonb_build_array(
     jsonb_build_object('id','q1','prompt','Tanda paling jelas seseorang itu calo?','options', jsonb_build_array(
       jsonb_build_object('key','a','label','Minta uang besar di muka tanpa kontrak'),
       jsonb_build_object('key','b','label','Punya kantor resmi'),
       jsonb_build_object('key','c','label','Kasih kontrak kerja jelas')
     )),
     jsonb_build_object('id','q2','prompt','Kalau ketemu calo, sebaiknya?','options', jsonb_build_array(
       jsonb_build_object('key','a','label','Ikut aja biar cepat'),
       jsonb_build_object('key','b','label','Tolak dan cari agen resmi')
     ))
   )))
ON CONFLICT (id) DO NOTHING;

-- Answer keys (admin-only table — never exposed to candidates)
INSERT INTO academy_lesson_keys (lesson_id, keys) VALUES
  ('b0000000-0000-4000-8000-000000000013', jsonb_build_object(
     'q1', jsonb_build_object('correct', jsonb_build_array('b'), 'weight', 1, 'explanation', 'Selalu lewat agen resmi P3MI.'),
     'q2', jsonb_build_object('correct', jsonb_build_array('a','b'), 'weight', 1, 'explanation', 'KTP dan paspor wajib; struk belanja bukan.')
   )),
  ('b0000000-0000-4000-8000-000000000022', jsonb_build_object(
     'q1', jsonb_build_object('correct', jsonb_build_array('a'), 'weight', 1, 'explanation', 'Bayar besar di muka tanpa kontrak = tanda calo.'),
     'q2', jsonb_build_object('correct', jsonb_build_array('b'), 'weight', 1, 'explanation', 'Tolak dan cari agen resmi.')
   ))
ON CONFLICT (lesson_id) DO UPDATE SET keys = EXCLUDED.keys;

-- =========================================================================
-- DONE — migration 0061 (sample seed)
-- =========================================================================
