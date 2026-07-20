-- 0110_akademi_cover_images.sql
--
-- Pasang foto sampul untuk 6 program Akademi yang sudah tayang.
--
-- Kenapa sekarang: halaman /akademi yang baru menampilkan kartu katalog
-- bergambar, dan halaman kelas menampilkan foto berbingkai di hero. Sebelum
-- ini `cover_image` kosong untuk semua program, jadi kartunya cuma blok abu.
-- Audiens CPMI membaca gambar lebih dulu daripada teks, jadi kartu tanpa foto
-- kehilangan sebagian besar dayanya.
--
-- Satu foto per program dipakai di DUA tempat (kartu katalog 3:2 dan hero
-- halaman kelas 4:3). Sengaja tidak menambah kolom `card_image` terpisah:
-- fotonya dipilih supaya masuk akal di dua peran itu, dan menambah kolom bisa
-- menyusul kalau memang terasa perlu.
--
-- File aset ada di apps/web/public/images/akademi/, dinamai mengikuti slug.
-- Digenerate lewat fal-ai (Flux 2 Max), gaya dokumenter, subjek orang
-- Indonesia. Kalau nanti diganti foto asli, cukup timpa filenya, tanpa migrasi.
--
-- Sengaja ditulis eksplisit per baris (bukan '/images/akademi/' || slug)
-- supaya daftar file yang diasumsikan ada terlihat langsung waktu direview.
-- Sengaja TIDAK menyentuh 'contoh-persiapan-kerja' (status draft, sudah punya
-- cover sendiri).

UPDATE academy_programs AS p
   SET cover_image = v.path
  FROM (VALUES
    ('sertifikat-perantau-barista',    '/images/akademi/sertifikat-perantau-barista.jpg'),
    ('sertifikat-perantau-waiter',     '/images/akademi/sertifikat-perantau-waiter.jpg'),
    ('sertifikat-perantau-caregiver',  '/images/akademi/sertifikat-perantau-caregiver.jpg'),
    ('restu-dulu-baru-berangkat',      '/images/akademi/restu-dulu-baru-berangkat.jpg'),
    ('kenali-jalurmu-verifikasi-p3mi', '/images/akademi/kenali-jalurmu-verifikasi-p3mi.jpg'),
    ('finansial-cerdas-pmi-saudi',     '/images/akademi/finansial-cerdas-pmi-saudi.jpg')
  ) AS v(slug, path)
 WHERE p.slug = v.slug
   -- Jangan timpa sampul yang sudah diisi manusia lewat admin.
   AND p.cover_image IS NULL;
