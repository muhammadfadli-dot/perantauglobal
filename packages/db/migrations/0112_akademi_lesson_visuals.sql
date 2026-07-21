-- 0112_akademi_lesson_visuals.sql
--
-- Nyalakan visual di 16 pelajaran Akademi yang selama ini teks murni.
--
-- Dua jenis perlakuan, sesuai temuan waktu isinya dibaca:
--   1. DIAGRAM  dinyalakan lewat `variant` di atas tipe blok yang SUDAH ADA,
--               jadi tidak ada satu pun kalimat yang ditulis ulang.
--   2. FOTO     diisi ke `media.image_url` pada blok pertama tiap kartu.
--
-- Kenapa diagram dirender dari data dan bukan digenerate jadi gambar: teksnya
-- dijamin benar (model gambar terbukti mengarang huruf), bisa diedit lewat DB
-- tanpa bikin ulang aset, terbaca pembaca layar, dan jauh lebih ringan untuk
-- audiens yang kuotanya terbatas. Komponennya ada di
-- apps/platform/src/components/pg/academy/LessonPlayer.tsx.
--
-- Idempoten: menyetel nilai yang sama berulang kali tidak mengubah apa pun,
-- dan transformasi dialog memakai awalan teks yang hilang setelah dipakai.

-- ---------------------------------------------------------------------------
-- Helper: setel `variant` pada blok TERTENTU (per nomor urut) di satu pelajaran.
--
-- Sengaja per nomor urut, bukan per tipe blok. Beberapa pelajaran punya
-- beberapa blok `list` yang sifatnya berbeda: ada yang memang checklist untuk
-- dikerjakan, ada yang cuma informasi (nomor call center, data perusahaan).
-- Menandai semuanya jadi checklist akan menyuruh pembaca "mencentang" nomor
-- telepon, jadi targetnya dipilih satu per satu.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION pg_temp.set_variant_at(
  p_program text, p_module int, p_lesson int, p_ords int[], p_variant text
) RETURNS void LANGUAGE sql AS $$
  UPDATE academy_lessons l
     SET content = jsonb_set(
           l.content, '{blocks}',
           (SELECT jsonb_agg(
                     CASE WHEN ord = ANY(p_ords)
                          THEN b || jsonb_build_object('variant', p_variant)
                          ELSE b END
                     ORDER BY ord)
              FROM jsonb_array_elements(l.content->'blocks') WITH ORDINALITY AS t(b, ord)))
    FROM academy_modules m
   WHERE m.id = l.module_id
     AND m.program_slug = p_program
     AND m.module_num = p_module
     AND l.lesson_num = p_lesson;
$$;

-- ---------------------------------------------------------------------------
-- 1. DIAGRAM
-- ---------------------------------------------------------------------------

-- Lima tanda bahaya: daftar bernomor merah, dibaca sekali pandang.
SELECT pg_temp.set_variant_at('kenali-jalurmu-verifikasi-p3mi', 2, 1, ARRAY[2], 'danger');

-- Verifikasi tiga langkah: rel bertahap. Butir ditulis "Judul. Penjelasan",
-- dan komponen memecahnya sendiri, jadi teksnya tidak perlu diubah.
SELECT pg_temp.set_variant_at('kenali-jalurmu-verifikasi-p3mi', 2, 2, ARRAY[2], 'rail');

-- Checklist: hanya daftar yang memang dikerjakan satu per satu.
--   kenali M1L2 ord 5  ciri jalur resmi
--     (ord 3 tiga jalur, ord 9 sistem izin Jepang, ord 12 data perusahaan
--      sengaja DILEWAT: itu informasi, bukan hal untuk dicentang)
SELECT pg_temp.set_variant_at('kenali-jalurmu-verifikasi-p3mi', 1, 2, ARRAY[5], 'check');
--   dokumen wajib
SELECT pg_temp.set_variant_at('kenali-jalurmu-verifikasi-p3mi', 3, 1, ARRAY[2], 'check');
--   dokumen wajib punya salinan + hal yang diperiksa di kontrak
SELECT pg_temp.set_variant_at('kenali-jalurmu-verifikasi-p3mi', 3, 2, ARRAY[2, 5], 'check');
--   checklist akhir (ord 5 nomor call center DILEWAT, itu kontak bukan tugas)
SELECT pg_temp.set_variant_at('kenali-jalurmu-verifikasi-p3mi', 4, 2, ARRAY[2], 'check');
--   siapkan waktu, orangnya, mentalmu
SELECT pg_temp.set_variant_at('restu-dulu-baru-berangkat', 1, 2, ARRAY[3, 5, 7], 'check');
--   dokumen, persiapan bicara, menjaga komitmen
SELECT pg_temp.set_variant_at('restu-dulu-baru-berangkat', 4, 2, ARRAY[2, 4, 7], 'check');

-- ---------------------------------------------------------------------------
-- 2. DIALOG (Restu M4L1, lima contoh percakapan)
--
-- Isinya berpola tetap: blok `quote` berisi 'Orang tua: "..."' lalu blok
-- `paragraph` berisi 'Kamu bisa menjawab: "..."'. Keduanya diubah jadi
-- gelembung dua sisi. Awalannya dibuang karena sudah diwakili label `speaker`,
-- dan itu sekaligus membuat migrasi ini aman dijalankan ulang: setelah awalan
-- hilang, polanya tidak cocok lagi.
-- ---------------------------------------------------------------------------
UPDATE academy_lessons l
   SET content = jsonb_set(
         l.content, '{blocks}',
         (SELECT jsonb_agg(
                   CASE
                     WHEN b->>'type' = 'quote' AND b->>'text' LIKE 'Orang tua: %'
                       THEN b
                            || jsonb_build_object(
                                 'variant', 'dialog',
                                 'side', 'them',
                                 'speaker', 'Orang tua',
                                 'text', trim(both '"' from
                                          trim(replace(b->>'text', 'Orang tua: ', ''))))
                     WHEN b->>'type' = 'paragraph' AND b->>'text' LIKE 'Kamu bisa menjawab: %'
                       THEN b
                            || jsonb_build_object(
                                 'type', 'quote',
                                 'variant', 'dialog',
                                 'side', 'you',
                                 'speaker', 'Kamu',
                                 'text', trim(both '"' from
                                          trim(replace(b->>'text', 'Kamu bisa menjawab: ', ''))))
                     ELSE b
                   END
                   ORDER BY ord)
            FROM jsonb_array_elements(l.content->'blocks') WITH ORDINALITY AS t(b, ord)))
  FROM academy_modules m
 WHERE m.id = l.module_id
   AND m.program_slug = 'restu-dulu-baru-berangkat'
   AND m.module_num = 4
   AND l.lesson_num = 1;

-- ---------------------------------------------------------------------------
-- 3. FOTO
--
-- Ditaruh di blok PERTAMA pelajaran, karena chunkBlocks() mengambil media dari
-- blok pertama yang punya `media` di tiap kartu. URL absolut ke bucket, supaya
-- hidup di portal kandidat maupun situs web (pelajaran dari migrasi 0110).
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION pg_temp.set_lead_media(
  p_program text, p_module int, p_lesson int, p_file text, p_alt text
) RETURNS void LANGUAGE sql AS $$
  UPDATE academy_lessons l
     SET content = jsonb_set(
           l.content, '{blocks,0,media}',
           jsonb_build_object(
             'image_url',
             'https://jeadtvxgxmqnsqwxjmhj.supabase.co/storage/v1/object/public/position-media/akademi/'
               || p_file,
             'alt', p_alt))
    FROM academy_modules m
   WHERE m.id = l.module_id
     AND m.program_slug = p_program
     AND m.module_num = p_module
     AND l.lesson_num = p_lesson
     AND jsonb_array_length(l.content->'blocks') > 0;
$$;

SELECT pg_temp.set_lead_media(
  'restu-dulu-baru-berangkat', 1, 1,
  'restu-dulu-baru-berangkat.jpg',
  'Anak muda berbicara serius dengan bapak dan ibunya di ruang keluarga');

SELECT pg_temp.set_lead_media(
  'restu-dulu-baru-berangkat', 2, 1,
  'lessons/membuka-obrolan.jpg',
  'Anak membuka pembicaraan dengan ibunya sambil duduk bersama di ruang keluarga');

SELECT pg_temp.set_lead_media(
  'restu-dulu-baru-berangkat', 3, 1,
  'lessons/reaksi-emosional.jpg',
  'Ibu duduk tenang mendengarkan anaknya, anak menemani di sampingnya');

SELECT pg_temp.set_lead_media(
  'kenali-jalurmu-verifikasi-p3mi', 1, 1,
  'lessons/tertipu.jpg',
  'Anak muda termenung memeriksa ponselnya');
