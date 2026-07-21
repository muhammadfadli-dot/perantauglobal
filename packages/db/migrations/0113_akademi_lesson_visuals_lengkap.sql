-- 0113_akademi_lesson_visuals_lengkap.sql
--
-- Melengkapi 0112: dua pelajaran terakhir yang belum punya visual.
--
-- Setelah 0112, 13 dari 16 pelajaran sudah punya diagram atau foto. Sisanya
-- tiga: satu kuis (memang tidak perlu ilustrasi) dan dua pelajaran ini.
--
-- Keduanya berisi daftar TINDAKAN ("tunjukkan legalitas", "ajak orang tua
-- mengecek", "beri waktu"), jadi kartu checklist adalah perlakuan yang benar:
-- pembaca memang diminta mengerjakannya satu per satu.
--
-- Sengaja DILEWAT di M2L2 ord 9: isinya perbandingan penempatan resmi lawan
-- modus penipuan, dua sisi digabung dalam satu kalimat per butir. Itu bukan
-- daftar tugas, jadi mencentangnya tidak masuk akal. Kandidat untuk blok
-- `compare` kalau nanti kalimatnya dipecah, dan itu keputusan editorial.

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

-- Tiga ketakutan utama: cara merespon tiap ketakutan (ord 9 dilewat, lihat atas).
SELECT pg_temp.set_variant_at('restu-dulu-baru-berangkat', 2, 2, ARRAY[3, 6], 'check');

-- Strategi jangka panjang + langkah kalau ditolak.
SELECT pg_temp.set_variant_at('restu-dulu-baru-berangkat', 3, 2, ARRAY[2, 5], 'check');
