-- 0108_modul2_kenali_jalurmu.sql
--
-- Isi Modul 2 seri persiapan CPMI: "Kenali Jalurmu, Verifikasi P3MI-mu".
-- Sumber: dokumen revisi dari Indria Dwiyana (lampiran email 10 Jul 2026),
-- disimpan di Cowork/Projects/2026-07-20_pg-learning-hub-launch/inputs/.
--
-- Program-nya sendiri sudah dibuat di 0107 dengan status draft. Migrasi ini
-- mengisi modul + pelajarannya, lalu menaikkannya ke published.
--
-- Struktur: 4 modul, 8 pelajaran (7 bacaan + 1 kuis).
-- Bagian 8 dokumen aslinya memang ditulis sebagai simulasi tanya-jawab dengan
-- kunci, jadi dijadikan lesson bertipe quiz mengikuti pola finansial-cerdas.
-- pass_threshold lesson diset 60 supaya benar 2 dari 3 sudah lulus; ini modul
-- kesadaran gratis, bukan ujian saringan.
--
-- Dua hal dari dokumen sengaja dipertahankan apa adanya karena melindungi
-- pembaca: nuansa "menahan dokumen itu wajar kalau ada bukti serah terima"
-- (supaya pembaca tidak salah menuduh P3MI yang benar), dan disclaimer penutup
-- bahwa nomor kontak serta prosedur bisa berubah dan wajib dicek ulang.

INSERT INTO academy_modules (program_slug, module_num, title, summary, sort_order, content) VALUES
(
  'kenali-jalurmu-verifikasi-p3mi', 1,
  'Kenali Jalur Resmi',
  'Kenapa penipuan bisa terjadi ke siapa saja, dan seperti apa bentuk jalur keberangkatan yang resmi.',
  1,
  jsonb_build_object('outcomes', jsonb_build_array(
    'Paham pola modus penipuan yang paling sering berulang',
    'Bisa membedakan tiga jalur resmi keberangkatan dan ciri jalur tidak resmi'
  ), 'est_minutes', 12)
),
(
  'kenali-jalurmu-verifikasi-p3mi', 2,
  'Tanda Bahaya dan Cara Verifikasi',
  'Lima tanda bahaya yang harus bikin kamu berhenti, dan tiga langkah verifikasi yang bisa kamu lakukan sendiri.',
  2,
  jsonb_build_object('outcomes', jsonb_build_array(
    'Bisa mengenali lima tanda bahaya pada agen atau penawaran kerja',
    'Bisa memverifikasi statusmu sendiri lewat SISKOP2MI dan Kartu E-PMI'
  ), 'est_minutes', 12)
),
(
  'kenali-jalurmu-verifikasi-p3mi', 3,
  'Dokumen, Kontrak, dan Biaya',
  'Dokumen yang wajib kamu miliki, cara membaca kontrak kerja, dan mana biaya yang wajar.',
  3,
  jsonb_build_object('outcomes', jsonb_build_array(
    'Punya daftar dokumen wajib sebelum berangkat',
    'Tahu enam hal yang harus diperiksa di setiap kontrak sebelum tanda tangan',
    'Paham layanan perlindungan pemerintah selalu gratis'
  ), 'est_minutes', 12)
),
(
  'kenali-jalurmu-verifikasi-p3mi', 4,
  'Uji Pemahaman dan Checklist Akhir',
  'Tiga simulasi situasi nyata, checklist terakhir sebelum berangkat, dan kontak pengaduan resmi.',
  4,
  jsonb_build_object('outcomes', jsonb_build_array(
    'Bisa mengambil keputusan yang benar di tiga situasi penipuan yang umum',
    'Punya checklist akhir dan kontak pengaduan resmi yang tersimpan'
  ), 'est_minutes', 12)
);

-- Modul 1, Pelajaran 1
INSERT INTO academy_lessons (module_id, lesson_num, title, lesson_type, estimated_minutes, sort_order, content)
SELECT id, 1, 'Kamu Tertipu Bukan karena Bodoh', 'reading', 5, 1,
jsonb_build_object('blocks', jsonb_build_array(
  jsonb_build_object('type','paragraph','text','Kamu tidak tertipu karena bodoh. Kamu tertipu karena tidak tahu apa yang harus diperiksa. Modul ini menunjukkan persis apa saja itu, langkah demi langkah, sebelum kamu menandatangani apa pun.'),
  jsonb_build_object('type','stat','value','15.000+','label','kasus pekerja migran bermasalah','sub','Dilaporkan Kementerian P2MI hanya di awal tahun 2026, sebagian besar berawal dari jalur yang tidak resmi.'),
  jsonb_build_object('type','heading','text','Modusnya sederhana dan berulang'),
  jsonb_build_object('type','paragraph','text','Modus penipuan terhadap calon pekerja migran biasanya begitu-begitu saja: janji gaji besar tanpa proses seleksi, proses cepat tanpa pelatihan, dan permintaan biaya di muka tanpa bukti resmi. Korbannya bukan orang yang ceroboh. Mereka cuma belum pernah diberi tahu apa yang seharusnya diperiksa sebelum percaya.'),
  jsonb_build_object('type','paragraph','text','Modul ini menuntunmu lewat hal-hal itu satu per satu: cara mengenali jalur resmi, tanda bahaya yang harus diwaspadai, cara memverifikasi agen, dokumen yang wajib kamu miliki, sampai ke mana harus melapor kalau terjadi sesuatu.')
))
FROM academy_modules WHERE program_slug='kenali-jalurmu-verifikasi-p3mi' AND module_num=1;

-- Modul 1, Pelajaran 2
INSERT INTO academy_lessons (module_id, lesson_num, title, lesson_type, estimated_minutes, sort_order, content)
SELECT id, 2, 'Tiga Jalur Resmi dan Ciri Jalur yang Bukan', 'reading', 7, 2,
jsonb_build_object('blocks', jsonb_build_array(
  jsonb_build_object('type','paragraph','text','Perusahaan yang berhak menempatkan pekerja migran ke luar negeri disebut P3MI, Perusahaan Penempatan Pekerja Migran Indonesia, dulu dikenal sebagai PJTKI. Sejak UU No. 18 Tahun 2017 tentang Pelindungan Pekerja Migran Indonesia, setiap P3MI wajib punya izin resmi dari Kementerian Ketenagakerjaan dan terdaftar di Kementerian Pelindungan Pekerja Migran Indonesia, yang dulu bernama BP2MI.'),
  jsonb_build_object('type','heading','text','Tiga jalur resmi keberangkatan'),
  jsonb_build_object('type','list','items', jsonb_build_array(
    'Government to Government, lewat program pemerintah seperti EPS Korea atau IM Japan.',
    'Private to Private, lewat P3MI yang berizin.',
    'Mandiri, lewat perusahaan pemberi kerja langsung, yang tetap wajib melapor dan mengurus dokumen resmi.'
  )),
  jsonb_build_object('type','heading','text','Ciri jalur resmi'),
  jsonb_build_object('type','list','items', jsonb_build_array(
    'Terdaftar di Kemnaker dan Kementerian P2MI.',
    'Punya nomor izin P3MI yang bisa dicek.',
    'Punya kantor tetap yang bisa didatangi.',
    'Ada kontrak kerja tertulis.'
  )),
  jsonb_build_object('type','callout','variant','warn','title','Ciri jalur tidak resmi','text','Calo perorangan tanpa badan hukum, tidak bisa menunjukkan nomor izin, hanya bisa dihubungi lewat WhatsApp atau media sosial, dan menjanjikan berangkat cepat tanpa seleksi.'),
  jsonb_build_object('type','heading','text','Catatan khusus untuk Jepang'),
  jsonb_build_object('type','paragraph','text','Ada dua sistem izin yang berbeda, jadi cara ceknya juga beda. Jangan langsung curiga kalau tidak ketemu di satu tempat saja.'),
  jsonb_build_object('type','list','items', jsonb_build_array(
    'Kerja profesional atau Tokutei Ginou (SSW) lewat P3MI. Izinnya SIP3MI dari Kementerian P2MI, dicek di siskop2mi.bp2mi.go.id.',
    'Program magang (Technical Intern Training) lewat LPK berstatus SO atau Sending Organization. Izinnya dari Kemnaker, dicek di binalattas.kemnaker.go.id, bukan di SISKOP2MI. LPK yang tidak muncul di SISKOP2MI bukan berarti otomatis ilegal, selama dia terdaftar sebagai SO resmi di Kemnaker.'
  )),
  jsonb_build_object('type','heading','text','Contoh P3MI berizin resmi'),
  jsonb_build_object('type','paragraph','text','Sebagai gambaran seperti apa P3MI yang legal dan bisa diverifikasi, ini contohnya: PT Daya Talenta Global, dengan brand Perantau Global.'),
  jsonb_build_object('type','list','items', jsonb_build_array(
    'Nama perusahaan: Daya Talenta Global Co. Ltd.',
    'Nomor izin P3MI: 18102402375120001',
    'Nomor Induk Berusaha: 1810240237512',
    'Kantor pusat: Kantor Taman E3.3 Unit B 3-3A, Jl. Mega Kuningan Barat, Kuningan, Kecamatan Setiabudi, Jakarta Selatan, DKI Jakarta 12950',
    'Direktur Utama: Martin William',
    'Tanggal berdiri: 15 Oktober 2024'
  ))
))
FROM academy_modules WHERE program_slug='kenali-jalurmu-verifikasi-p3mi' AND module_num=1;

-- Modul 2, Pelajaran 1
INSERT INTO academy_lessons (module_id, lesson_num, title, lesson_type, estimated_minutes, sort_order, content)
SELECT id, 1, 'Lima Tanda Bahaya', 'reading', 6, 1,
jsonb_build_object('blocks', jsonb_build_array(
  jsonb_build_object('type','paragraph','text','Kalau kamu menemukan salah satu dari ini pada agen atau penawaran kerja yang kamu terima, berhenti dulu dan jangan lanjutkan sebelum diverifikasi.'),
  jsonb_build_object('type','steps','items', jsonb_build_array(
    'Tidak ada kantor tetap. Hanya bisa dihubungi lewat WhatsApp atau media sosial, tidak ada alamat yang bisa dikunjungi.',
    'Tidak bisa menunjukkan nomor izin P3MI. Agen resmi selalu bisa menyebutkan dan membuktikan nomor izinnya.',
    'Dokumen pribadimu ditahan tanpa kejelasan.',
    'Minta uang di muka tanpa bukti resmi, terutama transfer ke rekening pribadi, bukan rekening atas nama perusahaan.',
    'Janji gaji besar dan berangkat cepat tanpa seleksi. Proses resmi selalu melalui seleksi, pelatihan, dan verifikasi dokumen. Tidak ada jalan pintas.'
  )),
  jsonb_build_object('type','callout','variant','info','title','Soal dokumen ditahan, jangan salah tuduh','text','Penyimpanan sementara untuk keperluan administrasi, misalnya proses visa atau paspor, itu wajar. Termasuk kalau P3MI minta paspormu di awal proses, supaya dokumen bisa langsung diurus begitu kamu lolos seleksi dan tidak hilang di tengah jalan. Yang penting selalu ada bukti serah terima tertulis, dan kamu tahu kapan dokumenmu dikembalikan atau digunakan. Yang jadi tanda bahaya bukan soal diminta di awal atau di akhir, tapi kalau dokumenmu ditahan tanpa bukti serah terima, tanpa kejelasan waktu, atau dijadikan alasan supaya kamu tidak bisa mundur dari proses.')
))
FROM academy_modules WHERE program_slug='kenali-jalurmu-verifikasi-p3mi' AND module_num=2;

-- Modul 2, Pelajaran 2
INSERT INTO academy_lessons (module_id, lesson_num, title, lesson_type, estimated_minutes, sort_order, content)
SELECT id, 2, 'Verifikasi dalam Tiga Langkah', 'reading', 7, 2,
jsonb_build_object('blocks', jsonb_build_array(
  jsonb_build_object('type','paragraph','text','Ini berlaku untuk semua skema, mau lewat P3MI, LPK-SO, Government to Government, atau mandiri sekalipun. Yang wajib selalu ada adalah kamu terdaftar di SISKOP2MI dan mendapat Kartu E-PMI atau E-ID sebelum berangkat. Ini pengganti KTKLN lama, dan jadi identitas resmimu sebagai pekerja migran di mata pemerintah. Kalau ini tidak ada, kamu dianggap non-prosedural meskipun perusahaannya kelihatan meyakinkan.'),
  jsonb_build_object('type','steps','items', jsonb_build_array(
    'Punya akun SISKOP2MI. Daftar sendiri di siskop2mi.bp2mi.go.id, gratis, pakai NIK. Jangan biarkan orang lain mendaftarkan atas namamu tanpa kamu tahu datanya.',
    'Pastikan statusmu bergerak lewat tahapan resmi. Login ke akunmu dan cek prosesnya berjalan: verifikasi dokumen, pelatihan, uji kompetensi, sampai penerbitan E-PMI atau E-ID.',
    'Pastikan Kartu E-PMI atau E-ID terbit sebelum berangkat. Cek lewat kp2mi.go.id. Kalau sampai H-1 keberangkatan ini belum ada, hentikan dulu dan tanya ke Call Center 0800-1000.'
  )),
  jsonb_build_object('type','heading','text','Tambahan yang bagus dilakukan, tapi jangan jadi patokan utama'),
  jsonb_build_object('type','paragraph','text','Kamu juga bisa mengecek institusinya. Tapi dokumen tingkat perusahaan atau per-lowongan seperti SIP3MI, SIP2MI, atau izin SO kadang memang sulit diurus untuk skema tertentu, misalnya untuk banyak lowongan ke Jepang, meskipun prosesnya tetap sah. Kalau kamu tidak menemukan salah satu dokumen ini, itu bukan otomatis tanda penipuan. Yang wajib dan selalu bisa kamu cek sendiri tetap dua hal di atas: status SISKOP2MI dan Kartu E-PMI atau E-ID atas namamu.'),
  jsonb_build_object('type','list','items', jsonb_build_array(
    'SIP3MI adalah izin perusahaan secara umum, dicek di siskop2mi.bp2mi.go.id.',
    'SIP2MI adalah izin per lowongan atau Job Order yang diajukan P3MI. Gratis, dan kadang belum terbit untuk lowongan tertentu meski lowongannya sah. Kalau ragu, tanyakan progresnya langsung ke P3MI atau Call Center 0800-1000, jangan langsung curiga.',
    'Untuk LPK-SO jalur magang termasuk Jepang, cek status Sending Organization di binalattas.kemnaker.go.id. Wajar kalau tidak muncul di SISKOP2MI, karena izinnya memang dari Kemnaker.'
  ))
))
FROM academy_modules WHERE program_slug='kenali-jalurmu-verifikasi-p3mi' AND module_num=2;

-- Modul 3, Pelajaran 1
INSERT INTO academy_lessons (module_id, lesson_num, title, lesson_type, estimated_minutes, sort_order, content)
SELECT id, 1, 'Dokumen yang Wajib Kamu Miliki', 'reading', 4, 1,
jsonb_build_object('blocks', jsonb_build_array(
  jsonb_build_object('type','paragraph','text','Pastikan kamu memahami dan memiliki setiap dokumen ini sebelum berangkat.'),
  jsonb_build_object('type','list','items', jsonb_build_array(
    'Paspor dengan masa berlaku cukup untuk negara tujuan.',
    'Visa kerja resmi sesuai jenis pekerjaan dan negara tujuan.',
    'Kontrak kerja tertulis yang diketahui P3MI dan Kementerian P2MI.',
    'Sertifikat kompetensi atau pelatihan sesuai bidang kerja.',
    'Surat keterangan sehat dari klinik atau rumah sakit resmi.',
    'Asuransi Pekerja Migran Indonesia.',
    'Bukti pendaftaran atau Kartu PMI di SISKOP2MI.'
  ))
))
FROM academy_modules WHERE program_slug='kenali-jalurmu-verifikasi-p3mi' AND module_num=3;

-- Modul 3, Pelajaran 2
INSERT INTO academy_lessons (module_id, lesson_num, title, lesson_type, estimated_minutes, sort_order, content)
SELECT id, 2, 'Membaca Kontrak dan Menakar Biaya', 'reading', 8, 2,
jsonb_build_object('blocks', jsonb_build_array(
  jsonb_build_object('type','paragraph','text','Jangan tanda tangan dokumen yang tidak kamu pahami isinya. Biasanya kamu akan bertemu beberapa jenis dokumen, dan tidak semuanya wajib berbahasa Indonesia.'),
  jsonb_build_object('type','list','items', jsonb_build_array(
    'Kontrak kerja resmi yang diketahui P3MI dan Kementerian P2MI. Ini yang wajib ada salinan atau penjelasannya dalam Bahasa Indonesia.',
    'Offering letter, biasanya berbahasa Inggris, sifatnya penawaran awal, bukan kontrak final.',
    'Kontrak kerja di tempat kerja luar negeri, umumnya sepenuhnya berbahasa asing sesuai standar perusahaan di negara tujuan.'
  )),
  jsonb_build_object('type','paragraph','text','Untuk dokumen berbahasa asing, kamu tetap berhak minta penjelasan lengkap isinya dari P3MI, dan berhak atas waktu untuk membacanya dengan tenang. Menolak tanda tangan semata karena bahasanya asing bukan sikap yang tepat, tapi menandatangani tanpa paham isinya jauh lebih berbahaya.'),
  jsonb_build_object('type','heading','text','Enam hal yang wajib diperiksa di setiap kontrak'),
  jsonb_build_object('type','list','items', jsonb_build_array(
    'Gaji dan mata uang. Nominalnya jelas, mata uangnya apa, dibayar kapan.',
    'Jam kerja dan lembur. Berapa jam per hari, bagaimana aturan lembur dan upahnya.',
    'Hari libur dan cuti. Berapa hari libur per minggu atau bulan, dan cuti tahunannya.',
    'Masa kontrak. Berapa lama, bisa diperpanjang atau tidak.',
    'Hak pemutusan kontrak. Bagaimana caranya kalau kamu ingin berhenti.',
    'Biaya pulang. Siapa yang menanggung kalau terjadi masalah.'
  )),
  jsonb_build_object('type','heading','text','Soal biaya'),
  jsonb_build_object('type','paragraph','text','Layanan perlindungan dari pemerintah untuk pekerja migran, termasuk pengecekan legalitas dan pengaduan, selalu gratis tanpa pungutan biaya apa pun. Kalau ada pihak yang meminta bayaran untuk itu, patut dicurigai sebagai penipuan.'),
  jsonb_build_object('type','paragraph','text','Untuk biaya penempatan sendiri, agen resmi selalu memberi rincian biaya yang transparan beserta kuitansi resmi atas nama perusahaan, bukan transfer ke rekening pribadi. Beberapa skema penempatan pemerintah bahkan menerapkan program zero cost, tanpa biaya penempatan, untuk negara dan sektor tertentu. Kalau ragu soal wajar tidaknya suatu biaya, tanyakan dulu ke Call Center 0800-1000 sebelum membayar apa pun.')
))
FROM academy_modules WHERE program_slug='kenali-jalurmu-verifikasi-p3mi' AND module_num=3;

-- Modul 4, Pelajaran 1 (KUIS)
INSERT INTO academy_lessons (module_id, lesson_num, title, lesson_type, estimated_minutes, sort_order, pass_threshold, content)
SELECT id, 1, 'Simulasi: Kamu Akan Pilih yang Mana?', 'quiz', 5, 1, 60,
jsonb_build_object('questions', jsonb_build_array(
  jsonb_build_object(
    'id','q1',
    'prompt','Seseorang menghubungimu lewat WhatsApp, menawarkan kerja di luar negeri dengan gaji 15 juta tanpa wawancara. Dia minta kamu transfer Rp2.000.000 hari ini juga untuk booking kuota, karena katanya terbatas. Kamu akan?',
    'options', jsonb_build_array(
      jsonb_build_object('key','a','label','Transfer sekarang juga, takut kuotanya habis'),
      jsonb_build_object('key','b','label','Cek nomor izin P3MI-nya, lalu hubungi hotline resmi P3MI tersebut untuk memastikan tawaran itu memang dari mereka')
    )
  ),
  jsonb_build_object(
    'id','q2',
    'prompt','Agen meminta paspormu ditahan di kantor mereka sampai hari keberangkatan, tanpa bukti serah terima dan tanpa kejelasan kapan bisa kamu ambil. Kamu akan?',
    'options', jsonb_build_array(
      jsonb_build_object('key','a','label','Setuju saja, karena terdengar masuk akal demi keamanan'),
      jsonb_build_object('key','b','label','Minta bukti serah terima tertulis dan kejelasan waktunya dulu sebelum menyerahkan dokumen')
    )
  ),
  jsonb_build_object(
    'id','q3',
    'prompt','Kamu diminta menandatangani kontrak kerja yang seluruhnya berbahasa asing, tanpa penjelasan, dan diminta tanda tangan saat itu juga. Kamu akan?',
    'options', jsonb_build_array(
      jsonb_build_object('key','a','label','Tanda tangan saja, toh nanti juga dijelaskan'),
      jsonb_build_object('key','b','label','Minta penjelasan lengkap isi kontrak dan waktu untuk membacanya sebelum tanda tangan')
    )
  )
))
FROM academy_modules WHERE program_slug='kenali-jalurmu-verifikasi-p3mi' AND module_num=4;

INSERT INTO academy_lesson_keys (lesson_id, keys)
SELECT l.id, jsonb_build_object(
  'q1', jsonb_build_object('weight', 1, 'correct', jsonb_build_array('b'),
    'explanation','Tekanan waktu seperti kuota terbatas, digabung permintaan bayar di muka yang tidak bisa diverifikasi, adalah pola penipuan yang paling umum. Cek dulu nomor izinnya, lalu konfirmasi langsung ke P3MI lewat hotline resminya. Jangan percaya begitu saja hanya karena seseorang mengaku dari perusahaan tertentu.'),
  'q2', jsonb_build_object('weight', 1, 'correct', jsonb_build_array('b'),
    'explanation','P3MI menyimpan paspor untuk keperluan administrasi itu wajar. Yang tidak wajar adalah menahan dokumen tanpa bukti serah terima tertulis dan tanpa kejelasan waktu. Jadi yang kamu minta bukan menolak mentah-mentah, melainkan bukti dan kejelasannya.'),
  'q3', jsonb_build_object('weight', 1, 'correct', jsonb_build_array('b'),
    'explanation','Kontrak kerja di luar negeri memang wajar kalau berbahasa asing, dan itu bukan tanda penipuan. Tapi itu juga bukan alasan untuk buru-buru tanda tangan tanpa paham isinya. Kamu berhak minta penjelasan lengkap dan waktu yang cukup.')
)
FROM academy_lessons l
JOIN academy_modules m ON m.id = l.module_id
WHERE m.program_slug='kenali-jalurmu-verifikasi-p3mi' AND m.module_num=4 AND l.lesson_num=1;

-- Modul 4, Pelajaran 2
INSERT INTO academy_lessons (module_id, lesson_num, title, lesson_type, estimated_minutes, sort_order, content)
SELECT id, 2, 'Checklist Akhir dan Kontak Pengaduan', 'reading', 5, 2,
jsonb_build_object('blocks', jsonb_build_array(
  jsonb_build_object('type','heading','text','Checklist akhir sebelum berangkat'),
  jsonb_build_object('type','list','items', jsonb_build_array(
    'Sudah cek nama agen atau P3MI di SISKOP2MI, dan nomor izinnya cocok.',
    'Sudah punya salinan kontrak kerja resmi dalam Bahasa Indonesia, dan sudah paham isi seluruh kontrak yang akan ditandatangani, termasuk yang berbahasa asing.',
    'Semua dokumen wajib sudah lengkap.',
    'Tidak ada dokumen pribadi yang ditahan pihak lain tanpa bukti serah terima.',
    'Semua biaya yang sudah dibayar punya kuitansi resmi.',
    'Kontak pengaduan resmi sudah tersimpan di HP.'
  )),
  jsonb_build_object('type','heading','text','Kontak pengaduan resmi'),
  jsonb_build_object('type','paragraph','text','Simpan ini di HP-mu sekarang. Semua layanan di bawah ini gratis.'),
  jsonb_build_object('type','list','items', jsonb_build_array(
    'Call Center Kementerian P2MI dari dalam negeri: 0800-1000',
    'Call Center dari luar negeri: +6221-29244800',
    'WhatsApp pengaduan: 0811-8080-141',
    'Email pengaduan: halopelindungan@bp2mi.go.id',
    'Crisis Center Kemlu untuk WNI di luar negeri: +62-21-3441-5044',
    'Aplikasi darurat WNI di luar negeri: Safe Travel dari Kemlu'
  )),
  jsonb_build_object('type','callout','variant','info','title','Sumber dan masa berlaku informasi','text','Informasi dalam modul ini disusun berdasarkan UU No. 18 Tahun 2017 tentang Pelindungan Pekerja Migran Indonesia dan data resmi Kementerian Pelindungan Pekerja Migran Indonesia per pertengahan 2026. Nomor kontak dan prosedur bisa berubah, jadi selalu cek ulang di kp2mi.go.id atau siskop2mi.bp2mi.go.id sebelum mengambil keputusan.')
))
FROM academy_modules WHERE program_slug='kenali-jalurmu-verifikasi-p3mi' AND module_num=4;

UPDATE academy_programs
   SET status = 'published',
       published_at = now(),
       duration_label = 'Sekitar 50 menit, bisa dicicil per pelajaran'
 WHERE slug = 'kenali-jalurmu-verifikasi-p3mi';
