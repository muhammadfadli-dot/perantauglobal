-- 0107_learning_hub_products.sql
--
-- Learning Hub launch (keputusan Weekly MKT x DTG 2026-07-20): halaman /akademi
-- rilis dengan 5 produk sekaligus.
--
--   3 sertifikasi berbayar : Sertifikat Perantau Barista / Waiter / Caregiver
--                            (kerja sama Lembaga Vokasi UI, nama final dikunci
--                            di working session 16 Jul)
--   2 kelas gratis         : Modul 1 + Modul 2 seri persiapan CPMI dari Indria
--                            (Modul 2 kontennya menyusul di 0108)
--
-- Keputusan yang di-encode di sini, jangan diubah tanpa balik ke sumbernya:
--
--  1. price NULL + is_free=false  -> halaman menampilkan "Berbayar" tanpa angka.
--     Price list dari Vokasi UI belum pernah dikirim (dicek tuntas 20 Jul), dan
--     mengarang angka biaya ke calon PMI = risiko trust yang tidak sepadan.
--     Begitu price list masuk, cukup UPDATE kolom price.
--
--  2. delivery_mode='offline' -> pelatihan tatap muka di LEMKASI, bukan kelas
--     in-app. Konsekuensinya program ini sengaja TIDAK punya modul/pelajaran,
--     dan _recompute_academy_enrollment() memang skip program tanpa lesson.
--
--  3. Pembayaran TIDAK lewat platform. Commitment fee dibayar kandidat langsung
--     ke Vokasi UI (keputusan 15 Jul, alasan pajak), dan hanya SETELAH lolos
--     screening. Xendit tidak dipakai untuk produk ini.
--
--  4. content.fee_note wajib ada di tiap produk berbayar: yang berbayar adalah
--     pelatihan + sertifikasi, sementara proses penempatan kerja tetap tanpa
--     biaya ke kandidat. Ini trust signal inti DTG di industri yang penuh calo,
--     jadi jangan dihapus dari copy.
--
-- Additif sepenuhnya: nol DDL, nol perubahan baris existing kecuali satu
-- sort_order display (finansial-cerdas-pmi-saudi 0 -> 3) supaya seri CPMI tampil
-- lebih dulu di seksi kelas gratis.

BEGIN;

-- ---------------------------------------------------------------------------
-- 1. Tiga produk sertifikasi (Vokasi UI)
-- ---------------------------------------------------------------------------

INSERT INTO academy_programs (
  slug, title, subtitle, category, delivery_mode, facilitated_by, country,
  is_free, price, output_type, credential_issuer, credential_delivery,
  duration_label, status, sort_order, content, published_at
) VALUES
(
  'sertifikat-perantau-barista',
  'Sertifikat Perantau Barista',
  'Pelatihan dan sertifikasi kompetensi barista bersama Lembaga Vokasi UI, lalu jalur kerja resmi ke Arab Saudi',
  'sertifikasi', 'offline', 'Perantau Global x Lembaga Vokasi UI', 'saudi_arabia',
  false, NULL, 'certificate', 'Lembaga Vokasi UI', 'physical',
  'Pelatihan tatap muka, jadwal diinfokan setelah screening',
  'published', 1,
  jsonb_build_object(
    'intro', 'Kamu belajar keterampilan barista sampai standar kerja profesional, dapat sertifikasi kompetensi dari Lembaga Vokasi UI, lalu diarahkan ke peluang kerja di coffee shop, hotel, dan restoran di Arab Saudi lewat jalur resmi Perantau Global. Daftarnya gratis. Kami screening dulu kecocokanmu sebelum bicara biaya.',
    'benefits', jsonb_build_array(
      'Pelatihan barista berbasis kebutuhan industri, bukan cuma teori',
      'Sertifikasi kompetensi dari Lembaga Vokasi UI',
      'Pembekalan bahasa dan budaya kerja sesuai negara tujuan',
      'Diarahkan ke lowongan Perantau Global lewat jalur penempatan resmi P3MI',
      'Pendampingan sampai keberangkatan buat yang lolos'
    ),
    'curriculum', jsonb_build_array(
      jsonb_build_object('title', 'Teknik penyajian minuman', 'detail', 'Espresso, manual brew, latte art, dan beverage crafting.'),
      jsonb_build_object('title', 'Pelayanan pelanggan', 'detail', 'Komunikasi, taking order, POS, dan service excellence.'),
      jsonb_build_object('title', 'Operasional coffee bar', 'detail', 'Penggunaan mesin espresso, grinder, maintenance, dan inventory.'),
      jsonb_build_object('title', 'Standar kerja profesional', 'detail', 'Hygiene, teamwork, disiplin kerja, dan budaya kerja industri.')
    ),
    'flow', jsonb_build_array(
      jsonb_build_object('title', 'Daftar di halaman ini', 'detail', 'Gratis, tanpa bayar apa pun di tahap ini.'),
      jsonb_build_object('title', 'Tim kami hubungi kamu', 'detail', 'Lewat WhatsApp, buat screening kecocokan: usia, pengalaman, dan kualifikasi lain sesuai kebutuhan posisi.'),
      jsonb_build_object('title', 'Lolos screening, baru bicara biaya', 'detail', 'Kami informasikan rincian biaya program dan cara pembayarannya. Pembayaran dilakukan langsung ke lembaga pelatihan, bukan ke Perantau Global.'),
      jsonb_build_object('title', 'Verifikasi pembayaran', 'detail', 'Dicek bersama sebelum pelatihan dimulai.'),
      jsonb_build_object('title', 'Pelatihan dan sertifikasi', 'detail', 'Pelatihan tatap muka di LEMKASI, ditutup dengan uji kompetensi dan sertifikasi.'),
      jsonb_build_object('title', 'Proses penempatan kerja', 'detail', 'Wawancara dengan pemberi kerja, pengurusan dokumen, sampai keberangkatan.')
    ),
    'fee_note', 'Yang berbayar di sini adalah pelatihan dan sertifikasinya, dan pembayarannya ke lembaga pelatihan. Untuk proses penempatan kerjanya sendiri, Perantau Global tidak menarik biaya penempatan dari kandidat.'
  ),
  now()
),
(
  'sertifikat-perantau-waiter',
  'Sertifikat Perantau Waiter',
  'Pelatihan dan sertifikasi kompetensi pelayanan restoran bersama Lembaga Vokasi UI, lalu jalur kerja resmi ke Arab Saudi',
  'sertifikasi', 'offline', 'Perantau Global x Lembaga Vokasi UI', 'saudi_arabia',
  false, NULL, 'certificate', 'Lembaga Vokasi UI', 'physical',
  'Pelatihan tatap muka, jadwal diinfokan setelah screening',
  'published', 2,
  jsonb_build_object(
    'intro', 'Kamu belajar keterampilan pelayanan profesional sampai standar hospitality internasional, dapat sertifikasi kompetensi dari Lembaga Vokasi UI, lalu diarahkan ke peluang kerja di hotel, restoran, dan kafe di Arab Saudi lewat jalur resmi Perantau Global. Daftarnya gratis. Kami screening dulu kecocokanmu sebelum bicara biaya.',
    'benefits', jsonb_build_array(
      'Pelatihan pelayanan restoran berbasis kebutuhan industri',
      'Sertifikasi kompetensi dari Lembaga Vokasi UI',
      'Pembekalan bahasa dan budaya kerja sesuai negara tujuan',
      'Diarahkan ke lowongan Perantau Global lewat jalur penempatan resmi P3MI',
      'Pendampingan sampai keberangkatan buat yang lolos'
    ),
    'curriculum', jsonb_build_array(
      jsonb_build_object('title', 'Restaurant service', 'detail', 'Mise en place, food and beverage service, table setting, dan tray handling.'),
      jsonb_build_object('title', 'Guest experience', 'detail', 'Customer service, komunikasi, taking order, menu knowledge, dan service excellence.'),
      jsonb_build_object('title', 'Restaurant operation', 'detail', 'POS system, table management, complaint handling, dan operasional restoran.'),
      jsonb_build_object('title', 'Professional workplace skills', 'detail', 'Teamwork, disiplin kerja, grooming, kebersihan, dan problem solving.')
    ),
    'flow', jsonb_build_array(
      jsonb_build_object('title', 'Daftar di halaman ini', 'detail', 'Gratis, tanpa bayar apa pun di tahap ini.'),
      jsonb_build_object('title', 'Tim kami hubungi kamu', 'detail', 'Lewat WhatsApp, buat screening kecocokan: usia, pengalaman, dan kualifikasi lain sesuai kebutuhan posisi.'),
      jsonb_build_object('title', 'Lolos screening, baru bicara biaya', 'detail', 'Kami informasikan rincian biaya program dan cara pembayarannya. Pembayaran dilakukan langsung ke lembaga pelatihan, bukan ke Perantau Global.'),
      jsonb_build_object('title', 'Verifikasi pembayaran', 'detail', 'Dicek bersama sebelum pelatihan dimulai.'),
      jsonb_build_object('title', 'Pelatihan dan sertifikasi', 'detail', 'Pelatihan tatap muka di LEMKASI, ditutup dengan uji kompetensi dan sertifikasi.'),
      jsonb_build_object('title', 'Proses penempatan kerja', 'detail', 'Wawancara dengan pemberi kerja, pengurusan dokumen, sampai keberangkatan.')
    ),
    'fee_note', 'Yang berbayar di sini adalah pelatihan dan sertifikasinya, dan pembayarannya ke lembaga pelatihan. Untuk proses penempatan kerjanya sendiri, Perantau Global tidak menarik biaya penempatan dari kandidat.'
  ),
  now()
),
(
  'sertifikat-perantau-caregiver',
  'Sertifikat Perantau Caregiver',
  'Pelatihan dan sertifikasi kompetensi perawatan bersama Lembaga Vokasi UI, lalu jalur kerja resmi ke Taiwan',
  'sertifikasi', 'offline', 'Perantau Global x Lembaga Vokasi UI', 'taiwan',
  false, NULL, 'certificate', 'Lembaga Vokasi UI', 'physical',
  'Pelatihan tatap muka, jadwal diinfokan setelah screening',
  'published', 3,
  jsonb_build_object(
    'intro', 'Kamu belajar keterampilan perawatan profesional sampai standar layanan kesehatan internasional, dapat sertifikasi kompetensi dari Lembaga Vokasi UI, lalu diarahkan ke peluang kerja perawatan lansia dan layanan kesehatan di Taiwan lewat jalur resmi Perantau Global. Daftarnya gratis. Kami screening dulu kecocokanmu sebelum bicara biaya.',
    'benefits', jsonb_build_array(
      'Pelatihan caregiving berbasis kebutuhan industri kesehatan',
      'Sertifikasi kompetensi dari Lembaga Vokasi UI',
      'Pembekalan bahasa dan budaya kerja sesuai negara tujuan',
      'Diarahkan ke lowongan Perantau Global lewat jalur penempatan resmi P3MI',
      'Pendampingan sampai keberangkatan buat yang lolos'
    ),
    'curriculum', jsonb_build_array(
      jsonb_build_object('title', 'Basic patient care', 'detail', 'Perawatan harian, personal hygiene, mobilisasi pasien, dan pendampingan aktivitas sehari-hari.'),
      jsonb_build_object('title', 'Health monitoring', 'detail', 'Pemantauan kondisi pasien, tanda vital, pemberian obat sesuai prosedur, dan pencatatan perkembangan.'),
      jsonb_build_object('title', 'Patient assistance', 'detail', 'Pendampingan emosional, komunikasi dengan pasien dan keluarga, serta pelayanan yang berempati.'),
      jsonb_build_object('title', 'Professional healthcare skills', 'detail', 'Keselamatan pasien, etika profesi, penanganan kondisi darurat dasar, dan dokumentasi pelayanan.')
    ),
    'flow', jsonb_build_array(
      jsonb_build_object('title', 'Daftar di halaman ini', 'detail', 'Gratis, tanpa bayar apa pun di tahap ini.'),
      jsonb_build_object('title', 'Tim kami hubungi kamu', 'detail', 'Lewat WhatsApp, buat screening kecocokan: usia, pengalaman, dan kualifikasi lain sesuai kebutuhan posisi.'),
      jsonb_build_object('title', 'Lolos screening, baru bicara biaya', 'detail', 'Kami informasikan rincian biaya program dan cara pembayarannya. Pembayaran dilakukan langsung ke lembaga pelatihan, bukan ke Perantau Global.'),
      jsonb_build_object('title', 'Verifikasi pembayaran', 'detail', 'Dicek bersama sebelum pelatihan dimulai.'),
      jsonb_build_object('title', 'Pelatihan dan sertifikasi', 'detail', 'Pelatihan tatap muka di LEMKASI, ditutup dengan uji kompetensi dan sertifikasi.'),
      jsonb_build_object('title', 'Proses penempatan kerja', 'detail', 'Wawancara dengan pemberi kerja, pengurusan dokumen, sampai keberangkatan.')
    ),
    'fee_note', 'Yang berbayar di sini adalah pelatihan dan sertifikasinya, dan pembayarannya ke lembaga pelatihan. Untuk proses penempatan kerjanya sendiri, Perantau Global tidak menarik biaya penempatan dari kandidat.'
  ),
  now()
);

-- ---------------------------------------------------------------------------
-- 2. Dua kelas gratis (seri persiapan CPMI, materi Indria)
-- ---------------------------------------------------------------------------

INSERT INTO academy_programs (
  slug, title, subtitle, category, delivery_mode, facilitated_by, country,
  is_free, price, output_type, credential_issuer, credential_delivery,
  duration_label, status, sort_order, content, published_at
) VALUES
(
  'restu-dulu-baru-berangkat',
  'Restu Dulu, Baru Berangkat',
  'Cara menyampaikan niat kerja ke luar negeri ke orang tua, dan benar-benar mendapat restunya',
  'masterclass', 'in_app', 'Perantau Global', NULL,
  true, NULL, 'completion', 'Perantau Global', 'in_app',
  'Sekitar 45 menit, bisa dicicil per pelajaran',
  'published', 1,
  jsonb_build_object(
    'intro', 'Modul pembuka seri persiapan CPMI. Banyak calon pekerja migran gagal berangkat bukan karena syaratnya kurang, tapi karena restu orang tua tidak pernah benar-benar didapat. Kelas ini membahas cara menyampaikan niatmu, menjawab ketakutan orang tua dengan bukti, dan menghadapi penolakan tanpa merusak hubungan keluarga.',
    'benefits', jsonb_build_array(
      'Paham akar kekhawatiran orang tua, termasuk yang jarang diucapkan',
      'Tahu cara membuka pembicaraan supaya orang tua merasa dilibatkan, bukan diberi tahu',
      'Bisa menjawab tiga ketakutan terbesar dengan dokumen dan bukti, bukan adu argumen',
      'Punya contoh dialog siap pakai untuk lima situasi tersulit',
      'Tahu apa yang harus dilakukan kalau percobaan pertama ditolak'
    ),
    'learning_outcomes', jsonb_build_array(
      'Menyiapkan waktu, orang, dan mental sebelum bicara',
      'Membedakan kekhawatiran yang bisa dijawab dokumen dan yang harus dijawab dengan empati',
      'Mengenali ciri penempatan resmi dibanding modus penipuan',
      'Menjaga komunikasi setelah mendapat restu'
    )
  ),
  now()
),
(
  'kenali-jalurmu-verifikasi-p3mi',
  'Kenali Jalurmu, Verifikasi P3MI-mu',
  'Cara mengenali jalur resmi keberangkatan, membaca tanda penipuan, dan memeriksa kontrak sebelum tanda tangan',
  'masterclass', 'in_app', 'Perantau Global', NULL,
  true, NULL, 'completion', 'Perantau Global', 'in_app',
  'Sekitar 45 menit, bisa dicicil per pelajaran',
  'draft', 2,
  jsonb_build_object(
    'intro', 'Modul kedua seri persiapan CPMI. Membahas cara mengenali jalur resmi keberangkatan, tanda bahaya penipuan, cara memverifikasi P3MI dan LPK, sampai hal-hal yang wajib diperiksa sebelum menandatangani kontrak kerja.',
    'benefits', jsonb_build_array(
      'Bisa memverifikasi legalitas P3MI lewat kanal resmi pemerintah',
      'Mengenali tanda bahaya penipuan sejak awal proses',
      'Tahu apa saja yang wajib diperiksa sebelum tanda tangan kontrak kerja'
    )
  ),
  NULL
);

-- Seri CPMI tampil lebih dulu di seksi kelas gratis. Satu-satunya perubahan
-- terhadap baris existing, murni urutan tampilan, dan reversible.
UPDATE academy_programs SET sort_order = 3 WHERE slug = 'finansial-cerdas-pmi-saudi';

-- ---------------------------------------------------------------------------
-- 3. Modul + pelajaran untuk "Restu Dulu, Baru Berangkat"
--    Sumber: dokumen Modul 1 dari Indria (Perantau Global GTH / PT DTG).
--    Sengaja TIDAK diikutkan ke materi publik: catatan internal penulis soal
--    verifikasi ulang kanal pemerintah. Sengaja DIPERTAHANKAN: disclaimer tabel
--    penipuan dan disclaimer contoh dialog, karena keduanya melindungi pembaca
--    sekaligus perusahaan.
-- ---------------------------------------------------------------------------

INSERT INTO academy_modules (program_slug, module_num, title, summary, sort_order, content) VALUES
(
  'restu-dulu-baru-berangkat', 1,
  'Pahami Dulu, Baru Bicara',
  'Kenapa orang tua khawatir, dan apa yang perlu kamu siapkan sebelum membuka pembicaraan.',
  1,
  jsonb_build_object('outcomes', jsonb_build_array(
    'Paham empat akar kekhawatiran orang tua, termasuk rasa takut kehilangan yang jarang diucapkan',
    'Bisa memilih waktu, lawan bicara pertama, dan kesiapan mental sebelum menyampaikan niat'
  ), 'est_minutes', 12)
),
(
  'restu-dulu-baru-berangkat', 2,
  'Membuka Pembicaraan dan Menjawab Ketakutan',
  'Cara memulai obrolan tanpa bikin panik, dan cara menjawab tiga ketakutan terbesar orang tua.',
  2,
  jsonb_build_object('outcomes', jsonb_build_array(
    'Bisa membuka pembicaraan dengan mengajak diskusi, bukan mengumumkan keputusan',
    'Bisa menjawab ketakutan soal calo, kejelasan pekerjaan, dan perdagangan manusia dengan bukti'
  ), 'est_minutes', 12)
),
(
  'restu-dulu-baru-berangkat', 3,
  'Kalau Orang Tua Emosional, dan Kalau Kamu Ditolak',
  'Menghadapi air mata dan penolakan tanpa merusak hubungan keluarga.',
  3,
  jsonb_build_object('outcomes', jsonb_build_array(
    'Bisa merespons reaksi emosional dengan validasi lebih dulu, bukan langsung data',
    'Tahu langkah lanjutan kalau percobaan pertama ditolak, dan kapan penolakan harus dihormati'
  ), 'est_minutes', 12)
),
(
  'restu-dulu-baru-berangkat', 4,
  'Contoh Dialog, Checklist, dan Setelah Dapat Restu',
  'Lima contoh percakapan, daftar persiapan, dan cara menjaga komitmen setelah restu didapat.',
  4,
  jsonb_build_object('outcomes', jsonb_build_array(
    'Punya referensi dialog untuk lima situasi tersulit',
    'Punya checklist dokumen dan kesiapan diri sebelum bicara',
    'Tahu cara menjaga kepercayaan orang tua selama bekerja di luar negeri'
  ), 'est_minutes', 12)
);

-- Modul 1, Pelajaran 1
INSERT INTO academy_lessons (module_id, lesson_num, title, lesson_type, estimated_minutes, sort_order, content)
SELECT id, 1, 'Kekhawatiran Orang Tua Itu Wajar, Bukan Penghalang', 'reading', 6, 1,
jsonb_build_object('blocks', jsonb_build_array(
  jsonb_build_object('type','paragraph','text','Sebelum membahas cara meminta izin, ada satu hal yang perlu kamu pahami dulu: kekhawatiran orang tua itu wajar dan beralasan. Itu bukan halangan yang harus dilawan, melainkan bentuk kasih sayang yang perlu direspons dengan bukti dan empati, bukan dengan emosi atau debat.'),
  jsonb_build_object('type','heading','text','Dari mana kekhawatiran itu datang'),
  jsonb_build_object('type','list','items', jsonb_build_array(
    'Maraknya kasus penipuan oleh agen atau calo ilegal yang menjanjikan pekerjaan tetapi berujung masalah.',
    'Cerita pekerja migran bermasalah yang viral di media sosial maupun televisi, sehingga terbentuk persepsi bahwa bekerja ke luar negeri itu berisiko tinggi.',
    'Trauma kolektif dari kasus di lingkungan sekitar, entah tetangga, kerabat, atau cerita turun-temurun tentang pekerja migran yang gagal atau menjadi korban.',
    'Kekhawatiran yang lebih personal: takut kehilangan kedekatan dengan anak, takut kesepian di rumah, atau cemas soal siapa yang akan membantu mengurus keluarga sehari-hari.'
  )),
  jsonb_build_object('type','callout','variant','tip','title','Yang paling sering terlewat','text','Poin terakhir jarang diucapkan, tapi paling menentukan. Tidak semua kekhawatiran orang tua bisa dijawab dengan dokumen dan legalitas. Sebagian besar justru soal perasaan kehilangan. Kelas ini membahas keduanya.')
))
FROM academy_modules WHERE program_slug='restu-dulu-baru-berangkat' AND module_num=1;

-- Modul 1, Pelajaran 2
INSERT INTO academy_lessons (module_id, lesson_num, title, lesson_type, estimated_minutes, sort_order, content)
SELECT id, 2, 'Siapkan Waktu, Orangnya, dan Mentalmu', 'reading', 6, 2,
jsonb_build_object('blocks', jsonb_build_array(
  jsonb_build_object('type','paragraph','text','Cara meminta izin sama pentingnya dengan apa yang kamu sampaikan. Persiapan berikut membantu percakapan berjalan lebih tenang dan tidak berujung konflik.'),
  jsonb_build_object('type','heading','text','Pilih waktu dan suasana yang tepat'),
  jsonb_build_object('type','list','items', jsonb_build_array(
    'Pilih waktu ketika orang tua sedang tidak lelah, terburu-buru, atau memikirkan masalah lain.',
    'Hindari menyampaikan niat ini tiba-tiba di tengah acara keluarga atau saat sedang bertengkar soal hal lain.',
    'Sediakan waktu khusus, empat mata, tanpa distraksi. Bukan sambil lalu atau lewat pesan singkat.'
  )),
  jsonb_build_object('type','heading','text','Tentukan siapa yang diajak bicara lebih dulu'),
  jsonb_build_object('type','list','items', jsonb_build_array(
    'Kenali dinamika keluargamu sendiri: siapa yang biasanya jadi pengambil keputusan atau paling didengar.',
    'Kalau perlu, bicarakan dulu dengan orang tua yang secara pribadi paling dekat, supaya ada dukungan internal sebelum bicara ke seluruh keluarga.',
    'Pertimbangkan melibatkan figur yang dipercaya orang tua, misalnya kakak, om, atau tante, untuk menjembatani kalau situasinya sensitif.'
  )),
  jsonb_build_object('type','heading','text','Siapkan diri secara mental, bukan cuma dokumen'),
  jsonb_build_object('type','list','items', jsonb_build_array(
    'Sadari bahwa reaksi pertama orang tua bisa berupa penolakan, kekhawatiran berlebih, atau air mata. Itu wajar, dan bukan tanda mereka tidak akan pernah setuju.',
    'Latih diri untuk tetap tenang dan tidak defensif, meskipun orang tua bereaksi emosional.',
    'Siapkan dokumen pendukung sebagai pelengkap, bukan sebagai satu-satunya senjata dalam percakapan.'
  ))
))
FROM academy_modules WHERE program_slug='restu-dulu-baru-berangkat' AND module_num=1;

-- Modul 2, Pelajaran 1
INSERT INTO academy_lessons (module_id, lesson_num, title, lesson_type, estimated_minutes, sort_order, content)
SELECT id, 1, 'Membuka Pembicaraan Tanpa Bikin Panik', 'reading', 5, 1,
jsonb_build_object('blocks', jsonb_build_array(
  jsonb_build_object('type','paragraph','text','Cara memulai percakapan menentukan arah keseluruhan diskusi. Membuka dengan cara yang membuat orang tua merasa dilibatkan jauh lebih efektif dibanding langsung menyampaikan keputusan yang sudah bulat.'),
  jsonb_build_object('type','list','items', jsonb_build_array(
    'Mulai dengan menyampaikan alasan dan tujuan, bukan langsung keputusan. Cerita dulu soal harapan dan rencana ke depan, sebelum bicara soal peluang kerja ke luar negeri.',
    'Gunakan kalimat yang mengajak diskusi, misalnya "Bu, Yah, aku mau cerita sesuatu dan minta pendapat Ibu atau Ayah", dibanding "Aku sudah memutuskan untuk kerja ke luar negeri".',
    'Tunjukkan bahwa keputusan ini sudah dipikirkan matang, bukan dorongan sesaat atau ikut-ikutan teman.',
    'Beri ruang bagi orang tua untuk bertanya dan meluapkan kekhawatiran sebelum kamu buru-buru menjawab dengan argumen atau data.'
  ))
))
FROM academy_modules WHERE program_slug='restu-dulu-baru-berangkat' AND module_num=2;

-- Modul 2, Pelajaran 2
INSERT INTO academy_lessons (module_id, lesson_num, title, lesson_type, estimated_minutes, sort_order, content)
SELECT id, 2, 'Tiga Ketakutan Utama dan Cara Meresponnya', 'reading', 7, 2,
jsonb_build_object('blocks', jsonb_build_array(
  jsonb_build_object('type','heading','text','Takut kamu ditipu agen atau calo'),
  jsonb_build_object('type','paragraph','text','Ketakutan ini muncul karena banyak kasus penipuan dilakukan oknum yang mengaku agen resmi padahal tidak terdaftar.'),
  jsonb_build_object('type','list','items', jsonb_build_array(
    'Tunjukkan legalitas P3MI atau perusahaan penempatan secara langsung kepada orang tua.',
    'Ajak orang tua mengecek sendiri status perusahaan lewat kanal resmi pemerintah, supaya mereka tidak hanya percaya pada kata-katamu.',
    'Jelaskan rincian biaya penempatan secara transparan dan tertulis, sehingga tidak ada kesan biaya tersembunyi.'
  )),
  jsonb_build_object('type','heading','text','Takut pekerjaan di sana tidak jelas'),
  jsonb_build_object('type','paragraph','text','Orang tua sering khawatir karena tidak tahu persis pekerjaan apa yang akan kamu lakukan, di mana, dan dengan kondisi seperti apa.'),
  jsonb_build_object('type','list','items', jsonb_build_array(
    'Tunjukkan kontrak kerja asli yang mencantumkan deskripsi pekerjaan secara rinci.',
    'Jelaskan gaji, jam kerja, dan fasilitas yang akan diterima, semuanya tertulis, bukan janji lisan.',
    'Ajak orang tua membaca kontrak bersama supaya mereka merasa dilibatkan dan paham isinya.'
  )),
  jsonb_build_object('type','heading','text','Takut kamu menjadi korban perdagangan manusia'),
  jsonb_build_object('type','paragraph','text','Ini ketakutan paling mendalam, mengingat banyak pemberitaan tentang korban perdagangan manusia yang berkedok pekerjaan ke luar negeri. Cara meresponsnya adalah dengan mengenali ciri penempatan resmi dibanding modusnya.'),
  jsonb_build_object('type','list','items', jsonb_build_array(
    'Penempatan resmi punya kontrak kerja tertulis dan sah. Modus penipuan tidak punya dokumen atau kontrak yang jelas.',
    'Penempatan resmi punya asuransi dan perlindungan hukum. Modus penipuan tidak memberi jaminan apa pun.',
    'Penempatan resmi memungkinkan kamu dihubungi kapan saja selama bekerja. Modus penipuan membatasi atau memutus komunikasi dengan sengaja.'
  )),
  jsonb_build_object('type','callout','variant','warn','title','Catatan','text','Perbandingan di atas adalah materi edukasi pencegahan supaya kamu dan keluarga bisa mengenali risiko penipuan yang umum terjadi di industri penempatan kerja luar negeri. Ini bukan pernyataan mengenai praktik PT Daya Talenta Global.')
))
FROM academy_modules WHERE program_slug='restu-dulu-baru-berangkat' AND module_num=2;

-- Modul 3, Pelajaran 1
INSERT INTO academy_lessons (module_id, lesson_num, title, lesson_type, estimated_minutes, sort_order, content)
SELECT id, 1, 'Menghadapi Reaksi Emosional Orang Tua', 'reading', 5, 1,
jsonb_build_object('blocks', jsonb_build_array(
  jsonb_build_object('type','paragraph','text','Argumen yang rasional dan dokumen yang lengkap tidak selalu cukup kalau orang tua sedang dikuasai rasa takut kehilangan. Sebelum masuk ke fakta dan data, validasi dulu perasaan mereka.'),
  jsonb_build_object('type','list','items', jsonb_build_array(
    'Akui perasaan orang tua secara langsung, misalnya "Aku tahu Ibu khawatir dan itu wajar", sebelum melanjutkan ke penjelasan berbasis data.',
    'Hindari langsung membalas kekhawatiran dengan argumen. Beri jeda supaya orang tua merasa didengar lebih dulu.',
    'Kalau orang tua menangis atau menyampaikan rasa takut kehilangan, jangan buru-buru mengalihkan ke topik dokumen. Tanggapi perasaan itu dulu.'
  )),
  jsonb_build_object('type','callout','variant','info','title','Ukuran keberhasilan yang realistis','text','Tujuan percakapan bukan membuat orang tua berhenti khawatir sepenuhnya dalam satu pertemuan, melainkan membangun rasa percaya secara bertahap.')
))
FROM academy_modules WHERE program_slug='restu-dulu-baru-berangkat' AND module_num=3;

-- Modul 3, Pelajaran 2
INSERT INTO academy_lessons (module_id, lesson_num, title, lesson_type, estimated_minutes, sort_order, content)
SELECT id, 2, 'Strategi Jangka Panjang dan Kalau Ditolak', 'reading', 7, 2,
jsonb_build_object('blocks', jsonb_build_array(
  jsonb_build_object('type','heading','text','Strategi komunikasi jangka panjang'),
  jsonb_build_object('type','list','items', jsonb_build_array(
    'Libatkan orang tua sejak awal proses, bukan memberi kabar setelah semuanya sudah selesai. Ini membangun rasa percaya karena mereka merasa jadi bagian dari keputusan.',
    'Ajak orang tua datang langsung ke kantor perusahaan penempatan kalau memungkinkan, supaya mereka bisa melihat dan bertanya sendiri.',
    'Siapkan dokumen pendukung secara lengkap: kontrak kerja, sertifikat pelatihan, dan izin resmi perusahaan.',
    'Gunakan cerita pekerja migran yang sudah berhasil dari daerah yang sama, karena cerita yang relatable lebih mudah dipercaya dibanding penjelasan abstrak.',
    'Sampaikan jalur komunikasi resmi yang tersedia dari perusahaan selama kamu bekerja, sesuai ketentuan penempatan yang berlaku.'
  )),
  jsonb_build_object('type','heading','text','Kalau ditolak di percobaan pertama'),
  jsonb_build_object('type','paragraph','text','Tidak semua percakapan pertama berakhir dengan restu. Penolakan di awal bukan berarti pintu tertutup selamanya.'),
  jsonb_build_object('type','list','items', jsonb_build_array(
    'Jangan memaksakan keputusan atau merajuk saat itu juga. Beri waktu bagi orang tua untuk memproses informasi yang baru diterima.',
    'Tanyakan secara spesifik apa yang membuat mereka belum yakin, supaya percakapan berikutnya bisa langsung menjawab kekhawatiran itu.',
    'Gunakan waktu jeda untuk melengkapi bukti atau melibatkan pihak lain yang dipercaya keluarga.',
    'Jadwalkan percakapan lanjutan, tapi beri jarak waktu yang wajar, bukan mengejar di hari yang sama.',
    'Kalau penolakan didasari alasan yang sangat personal, misalnya kekhawatiran ekonomi keluarga atau siapa yang mengurus rumah, akui itu kekhawatiran yang sah dan cari solusi konkret bersama.'
  )),
  jsonb_build_object('type','callout','variant','warn','title','Batas yang perlu dihormati','text','Kalau setelah beberapa kali percakapan orang tua tetap menolak, itu hak mereka. Meneruskan proses penempatan tanpa izin yang benar-benar diberikan secara sadar dan sukarela bukan cuma tidak etis, tapi juga bisa menimbulkan masalah hukum di kemudian hari. Dan kalau penolakan disertai tekanan emosional yang berat, misalnya ancaman pemutusan hubungan keluarga, kamu tidak perlu menyelesaikannya sendirian. Hentikan sementara pembicaraan dan konsultasikan ke pendamping atau tim perusahaan sebelum melanjutkan.')
))
FROM academy_modules WHERE program_slug='restu-dulu-baru-berangkat' AND module_num=3;

-- Modul 4, Pelajaran 1
INSERT INTO academy_lessons (module_id, lesson_num, title, lesson_type, estimated_minutes, sort_order, content)
SELECT id, 1, 'Lima Contoh Dialog dengan Orang Tua', 'reading', 7, 1,
jsonb_build_object('blocks', jsonb_build_array(
  jsonb_build_object('type','paragraph','text','Bagian ini berisi contoh percakapan yang bisa kamu jadikan referensi. Gunakan sebagai panduan, bukan naskah yang harus dihafal, dan sesuaikan dengan gaya bicara keluargamu.'),
  jsonb_build_object('type','callout','variant','info','title','Catatan','text','Kalimat pada contoh dialog ini adalah gaya komunikasi personal kamu ke keluarga, bukan pernyataan layanan resmi perusahaan. Untuk detail layanan komunikasi yang benar-benar tersedia, rujuk ketentuan penempatan yang berlaku.'),
  jsonb_build_object('type','heading','text','Situasi 1: "Nanti kamu ditipu gimana?"'),
  jsonb_build_object('type','quote','text','Orang tua: "Kamu yakin ini bukan penipuan? Banyak lho yang awalnya dijanjiin kerja enak, ujung-ujungnya hilang kabar."'),
  jsonb_build_object('type','paragraph','text','Kamu bisa menjawab: "Bu, ini bukan kerja ilegal, ini resmi. Perusahaannya terdaftar dan Ibu bisa cek sendiri lewat kanal resmi pemerintah. Aku juga sudah punya rincian biaya penempatannya secara tertulis, jadi nggak ada yang ditutup-tutupi."'),
  jsonb_build_object('type','heading','text','Situasi 2: "Kerjanya beneran jelas?"'),
  jsonb_build_object('type','quote','text','Orang tua: "Kamu nanti kerja apa sebenarnya? Jangan-jangan beda sama yang dijanjiin."'),
  jsonb_build_object('type','paragraph','text','Kamu bisa menjawab: "Jelas Bu, ini ada kontrak kerjanya. Gaji, jam kerja, sampai fasilitas tinggal semua tertulis. Ibu boleh baca sendiri sebelum aku berangkat, biar Ibu juga yakin."'),
  jsonb_build_object('type','heading','text','Situasi 3: "Kalau kamu kenapa-napa gimana?"'),
  jsonb_build_object('type','quote','text','Orang tua: "Ibu takut kalau kamu di sana susah dihubungi, atau ada apa-apa Ibu nggak tahu."'),
  jsonb_build_object('type','paragraph','text','Kamu bisa menjawab: "Aku akan usahakan update kabar secara rutin ke Ibu, dan kalau ada jalur komunikasi resmi dari perusahaan yang bisa Ibu pakai, itu juga akan aku kasih tahu. Jadi Ibu nggak perlu nunggu kabar dariku doang."'),
  jsonb_build_object('type','heading','text','Situasi 4: Orang tua tetap menolak walau semua bukti sudah ditunjukkan'),
  jsonb_build_object('type','quote','text','Orang tua: "Ibu tahu semua itu benar, tapi Ibu tetap nggak bisa izinkan. Titik."'),
  jsonb_build_object('type','paragraph','text','Kamu bisa menjawab: "Aku ngerti, Bu. Aku nggak akan maksa hari ini. Boleh nggak kita ngobrol lagi lain waktu? Aku pengin tahu apa yang paling bikin Ibu belum tenang, biar aku bisa carikan jawabannya bareng-bareng."'),
  jsonb_build_object('type','heading','text','Situasi 5: Tekanan emosional yang berat'),
  jsonb_build_object('type','quote','text','Orang tua: "Kalau kamu tetap pergi, jangan pernah pulang ke rumah ini lagi."'),
  jsonb_build_object('type','paragraph','text','Kamu bisa menjawab: "Bu, aku tahu ini berat buat Ibu, dan omongan itu keluar karena Ibu takut kehilangan aku, bukan karena Ibu nggak sayang. Aku nggak akan lanjutkan proses ini kalau itu bikin hubungan kita rusak. Aku mau kasih jeda dulu, nggak akan bahas ini lagi sekarang."'),
  jsonb_build_object('type','callout','variant','warn','title','Kalau situasinya seberat ini','text','Jangan berusaha menyelesaikannya sendirian. Hentikan sementara pembahasan, beri jeda yang cukup, dan konsultasikan situasinya ke pendamping atau tim perusahaan sebelum melanjutkan pembicaraan berikutnya.')
))
FROM academy_modules WHERE program_slug='restu-dulu-baru-berangkat' AND module_num=4;

-- Modul 4, Pelajaran 2
INSERT INTO academy_lessons (module_id, lesson_num, title, lesson_type, estimated_minutes, sort_order, content)
SELECT id, 2, 'Checklist Persiapan dan Menjaga Komitmen', 'reading', 6, 2,
jsonb_build_object('blocks', jsonb_build_array(
  jsonb_build_object('type','heading','text','Dokumen dan bukti yang perlu disiapkan'),
  jsonb_build_object('type','list','items', jsonb_build_array(
    'Kontrak kerja asli yang mencantumkan gaji, jam kerja, dan deskripsi pekerjaan.',
    'Sertifikat pelatihan resmi sebelum keberangkatan.',
    'Bukti legalitas P3MI atau perusahaan penempatan.',
    'Rincian biaya penempatan secara tertulis dan transparan.',
    'Kontak orang yang bisa dihubungi orang tua kapan saja selama proses sampai masa kerja.'
  )),
  jsonb_build_object('type','heading','text','Kesiapan diri dan percakapan'),
  jsonb_build_object('type','list','items', jsonb_build_array(
    'Waktu dan suasana bicara sudah dipilih dengan tenang, bukan tergesa-gesa.',
    'Sudah menentukan siapa yang diajak bicara lebih dulu.',
    'Siap menghadapi reaksi emosional tanpa langsung membalas dengan argumen.',
    'Punya rencana lanjutan kalau percobaan pertama belum berhasil.',
    'Tahu figur pendukung keluarga yang bisa membantu menjembatani percakapan kalau dibutuhkan.'
  )),
  jsonb_build_object('type','heading','text','Setelah mendapat restu'),
  jsonb_build_object('type','paragraph','text','Mendapatkan izin bukan akhir dari proses, melainkan awal dari sebuah komitmen. Jaga komunikasi rutin dengan orang tua selama bekerja di luar negeri, supaya kekhawatiran berangsur berkurang dan mereka tetap merasa dilibatkan, bukan ditinggalkan.'),
  jsonb_build_object('type','list','items', jsonb_build_array(
    'Tepati janji yang sudah kamu buat saat meminta izin, misalnya jadwal video call rutin.',
    'Kabari orang tua secara proaktif, jangan hanya menunggu ditanya.',
    'Kalau ada kendala di tempat kerja, sampaikan dengan jujur namun tetap tenang, supaya orang tua belajar bahwa mereka akan selalu diberi tahu.'
  )),
  jsonb_build_object('type','callout','variant','tip','title','Penutup','text','Ketika orang tua merasa cukup informasi dan dilibatkan dalam prosesnya, baik sebelum berangkat maupun selama bekerja, dukungan mereka justru bisa menjadi kekuatan terbesarmu selama menjalani masa kerja di luar negeri.')
))
FROM academy_modules WHERE program_slug='restu-dulu-baru-berangkat' AND module_num=4;

-- ---------------------------------------------------------------------------
-- 4. Field registrasi untuk tiga produk sertifikasi
--    Dipakai tim DTG buat screening manual. Engine-nya memang lebih sederhana
--    dari position_application_fields (tidak ada qualifying / importance),
--    jadi tidak ada satu pun jawaban yang otomatis menolak pendaftar di sini.
-- ---------------------------------------------------------------------------

INSERT INTO program_registration_fields (program_slug, field_key, field_label, field_help, field_type, required, sort_order, options) VALUES
('sertifikat-perantau-barista','usia','Usia kamu sekarang',NULL,'radio',true,1,
 '[{"value":"under_21","label":"Di bawah 21 tahun"},{"value":"21_30","label":"21 sampai 30 tahun"},{"value":"31_40","label":"31 sampai 40 tahun"},{"value":"above_40","label":"Di atas 40 tahun"}]'::jsonb),
('sertifikat-perantau-barista','pengalaman_barista','Pengalaman sebagai barista','Belum punya pengalaman tetap boleh mendaftar.','radio',true,2,
 '[{"value":"belum","label":"Belum ada"},{"value":"under_1","label":"Kurang dari 1 tahun"},{"value":"1_3","label":"1 sampai 3 tahun"},{"value":"above_3","label":"Lebih dari 3 tahun"}]'::jsonb),
('sertifikat-perantau-barista','pendidikan','Pendidikan terakhir',NULL,'radio',true,3,
 '[{"value":"smp","label":"SMP"},{"value":"sma_smk","label":"SMA atau SMK"},{"value":"d1_d3","label":"D1 sampai D3"},{"value":"s1","label":"S1 ke atas"}]'::jsonb),
('sertifikat-perantau-barista','domisili','Domisili kamu sekarang','Kota atau kabupaten, buat mengatur jadwal pelatihan.','text',true,4,NULL),

('sertifikat-perantau-waiter','usia','Usia kamu sekarang',NULL,'radio',true,1,
 '[{"value":"under_21","label":"Di bawah 21 tahun"},{"value":"21_30","label":"21 sampai 30 tahun"},{"value":"31_40","label":"31 sampai 40 tahun"},{"value":"above_40","label":"Di atas 40 tahun"}]'::jsonb),
('sertifikat-perantau-waiter','pengalaman_service','Pengalaman kerja di restoran, hotel, atau kafe','Belum punya pengalaman tetap boleh mendaftar.','radio',true,2,
 '[{"value":"belum","label":"Belum ada"},{"value":"under_1","label":"Kurang dari 1 tahun"},{"value":"1_3","label":"1 sampai 3 tahun"},{"value":"above_3","label":"Lebih dari 3 tahun"}]'::jsonb),
('sertifikat-perantau-waiter','pendidikan','Pendidikan terakhir',NULL,'radio',true,3,
 '[{"value":"smp","label":"SMP"},{"value":"sma_smk","label":"SMA atau SMK"},{"value":"d1_d3","label":"D1 sampai D3"},{"value":"s1","label":"S1 ke atas"}]'::jsonb),
('sertifikat-perantau-waiter','domisili','Domisili kamu sekarang','Kota atau kabupaten, buat mengatur jadwal pelatihan.','text',true,4,NULL),

('sertifikat-perantau-caregiver','usia','Usia kamu sekarang',NULL,'radio',true,1,
 '[{"value":"under_21","label":"Di bawah 21 tahun"},{"value":"21_30","label":"21 sampai 30 tahun"},{"value":"31_40","label":"31 sampai 40 tahun"},{"value":"above_40","label":"Di atas 40 tahun"}]'::jsonb),
('sertifikat-perantau-caregiver','pengalaman_perawatan','Pengalaman merawat lansia, anak, atau pasien','Pengalaman merawat keluarga sendiri juga dihitung.','radio',true,2,
 '[{"value":"belum","label":"Belum ada"},{"value":"keluarga","label":"Pernah, merawat keluarga sendiri"},{"value":"under_1","label":"Profesional, kurang dari 1 tahun"},{"value":"above_1","label":"Profesional, lebih dari 1 tahun"}]'::jsonb),
('sertifikat-perantau-caregiver','latar_kesehatan','Latar belakang pendidikan atau pelatihan kesehatan',NULL,'radio',true,3,
 '[{"value":"tidak_ada","label":"Tidak ada"},{"value":"pelatihan","label":"Pernah ikut pelatihan perawatan"},{"value":"smk_kesehatan","label":"SMK Kesehatan"},{"value":"keperawatan","label":"D3 atau S1 Keperawatan"}]'::jsonb),
('sertifikat-perantau-caregiver','domisili','Domisili kamu sekarang','Kota atau kabupaten, buat mengatur jadwal pelatihan.','text',true,4,NULL);

COMMIT;
