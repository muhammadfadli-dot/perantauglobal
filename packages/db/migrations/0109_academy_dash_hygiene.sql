-- 0109_academy_dash_hygiene.sql
--
-- Sapu em dash (U+2014) dan en dash (U+2013) dari konten Akademi.
--
-- Kenapa sekarang: halaman /akademi yang baru menampilkan subtitle dan
-- duration_label program langsung di kartu katalog, jadi tanda pisah panjang
-- yang selama ini cuma ada di data lama sekarang ikut tayang di permukaan
-- publik yang baru. Aturan penulisan Dayalima: jangan pakai tanda pisah panjang.
--
-- Cakupan sengaja dibatasi ke academy_programs saja (2 baris kena: satu draft,
-- satu published). Pelajaran dan modul sudah bersih. Posisi lowongan TIDAK
-- disentuh di sini, itu permukaan lain dan bukan bagian dari rilis ini.

-- Perbaikan kalimat, ditulis ulang supaya enak dibaca, bukan sekadar tukar tanda baca.
UPDATE academy_programs
   SET subtitle = 'Cara jaga, kirim, dan tumbuhkan gajimu biar 2 tahun di Saudi nggak balik nol',
       duration_label = 'Sekitar 2 sampai 3 jam, bisa dicicil per pelajaran'
 WHERE slug = 'finansial-cerdas-pmi-saudi';

UPDATE academy_programs
   SET subtitle = 'Kelas demo Akademi Perantau, coba alur daftar sampai kuis dan sertifikat.'
 WHERE slug = 'contoh-persiapan-kerja';

-- Sisa di dalam blob konten: ganti tanda pisah panjang berspasi jadi koma,
-- lalu sisa yang menempel jadi tanda hubung biasa.
UPDATE academy_programs
   SET content = replace(
                   replace(
                     replace(content::text, ' ' || chr(8212) || ' ', ', '),
                     chr(8212), '-'
                   ),
                   chr(8211), '-'
                 )::jsonb
 WHERE content::text LIKE '%' || chr(8212) || '%'
    OR content::text LIKE '%' || chr(8211) || '%';
