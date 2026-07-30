-- 0119: Koreksi fee_note Sertifikat Perantau Barista.
--
-- LATAR: 0107 menyemai fee_note yang berbunyi "Untuk proses penempatan kerjanya
-- sendiri, Perantau Global tidak menarik biaya penempatan dari kandidat."
-- Ifa (PO, siti.lathifah@dayalima.id) mengoreksi klaim itu pada 30 Jul 2026:
-- biaya keberangkatan TETAP ditagih ke kandidat. Yang berubah kalau kandidat
-- ikut Sertifikat Perantau adalah biaya itu masuk ke dana talang, jadi
-- ditanggung dulu lalu dilunasi kemudian. Bukan dihapuskan.
--
-- Teks lama tayang di dua tempat: hub /akademi dan halaman kelas
-- /akademi/kelas/[slug]. Menyangkal adanya biaya di halaman yang menjual
-- programnya adalah janji yang bisa ditagih kandidat, jadi diperbaiki.
--
-- LINGKUP SENGAJA DIPERSEMPIT KE BARISTA SAJA.
-- Waiter dan Caregiver masih `draft` (nol pembaca) dan TIDAK disentuh, karena
-- Caregiver berpotensi masuk 10 kategori zero-cost UU 18/2017 Pasal 30, yaitu
-- kategori yang biaya penempatannya WAJIB nol bagi PMI dan ada ancaman pidana
-- kalau dilanggar. Materi kursus kita sendiri mengajarkan aturan itu
-- (docs/akademi-perantau/masterclass-finansial-saudi.md). Barista dan Waiter
-- jalur formal/skilled, jadi biaya sah mungkin ada. Sebelum salah satu dari
-- keduanya di-publish, wording biayanya harus dikonfirmasi ke Ifa DAN diperiksa
-- kepatuhannya per posisi, bukan disamakan begitu saja dengan Barista.

update academy_programs
set content = jsonb_set(
      content,
      '{fee_note}',
      to_jsonb(
        'Yang berbayar di sini adalah pelatihan dan sertifikasinya, dan pembayarannya ke lembaga pelatihan. Biaya keberangkatan dihitung terpisah dan tetap menjadi tanggungan kandidat, bedanya lewat Sertifikat Perantau biaya itu bisa ditanggung dulu lewat dana talang lalu dilunasi kemudian. Rinciannya dijelaskan sebelum kamu memutuskan.'::text
      )
    ),
    updated_at = clock_timestamp()
where slug = 'sertifikat-perantau-barista';

-- Invarian: tidak boleh ada produk berbayar TAYANG yang masih menyangkal
-- adanya biaya penempatan. Draft dibiarkan supaya migrasi ini tidak
-- diam-diam mengubah dua produk yang belum diputuskan.
do $$
declare
  v_sisa int;
begin
  select count(*) into v_sisa
  from academy_programs
  where is_free = false
    and status = 'published'
    and content->>'fee_note' ilike '%tidak menarik biaya penempatan%';

  if v_sisa > 0 then
    raise exception
      'Masih ada % produk berbayar published dengan klaim "tidak menarik biaya penempatan"', v_sisa;
  end if;
end $$;
