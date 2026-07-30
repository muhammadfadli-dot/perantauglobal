-- 0120: fee_note Barista dibingkai ulang jadi "commitment fee" atas satu paket.
--
-- LATAR: 0119 sudah membetulkan klaim palsu "Perantau Global tidak menarik
-- biaya penempatan dari kandidat". Ifa (PO) lalu meminta revisi kedua pada
-- 30 Jul 2026, meneruskan arahan Mbak Desta: uang yang keluar dari kandidat
-- disebut COMMITMENT FEE, dan jangan disebut "biaya pelatihan + sertifikasi",
-- karena penyebutan itu membuat programnya terkesan terpisah-pisah padahal
-- yang mau dijual satu kesatuan pelatihan + sertifikasi + kesempatan
-- deployment.
--
-- CARA MENURUTINYA TANPA MEMBUAT JANJI BARU: paketnya disebut satu kesatuan,
-- tapi ujungnya ditulis "kesempatan masuk tahap screening penempatan", BUKAN
-- "kesempatan kerja di luar negeri". Bedanya bukan gaya bahasa. Kalau halaman
-- ini terbaca sebagai "bayar sekian, dapat penempatan", itu persis bentuk yang
-- diatur ketat UU 18/2017 soal biaya penempatan, dan kandidat berhak menagih
-- janji itu. Kalimat biaya keberangkatan tetap dipisah karena itu koreksi Ifa
-- sendiri di email sebelumnya.
--
-- MASIH TERBUKA, PERLU DIKUNCI IFA: di daftar harga Ifa 22 Jul, "commitment
-- fee" = 30 persen dari program (Rp5.275.500 dari Rp17.585.000), bukan seluruh
-- biaya program. Teks di bawah sengaja TIDAK mengklaim commitment fee adalah
-- total yang dibayar kandidat, cuma menyebutnya sebagai yang dibayar untuk
-- masuk program. Begitu Ifa mengunci definisinya, kalimat ini diperjelas.
--
-- Lingkup tetap Barista saja, alasan sama seperti 0119: Caregiver berpotensi
-- masuk 10 kategori zero-cost UU 18/2017 Pasal 30.

update academy_programs
set content = jsonb_set(
      content,
      '{fee_note}',
      to_jsonb(
        'Sertifikat Perantau adalah satu paket: pelatihan, sertifikasi, sampai kesempatan masuk tahap screening penempatan. Yang kamu bayar untuk mengikuti program ini disebut commitment fee, dan dibayarkan ke lembaga pelatihan. Biaya keberangkatan dihitung terpisah dan tetap menjadi tanggungan kandidat, bedanya lewat program ini biaya itu bisa ditanggung dulu lewat dana talang lalu dilunasi kemudian. Rinciannya dijelaskan sebelum kamu memutuskan.'::text
      )
    ),
    updated_at = clock_timestamp()
where slug = 'sertifikat-perantau-barista';

-- Invarian 1 (dibawa dari 0119): tidak boleh ada produk berbayar TAYANG yang
-- menyangkal adanya biaya penempatan.
-- Invarian 2 (baru): produk berbayar TAYANG tidak boleh menjanjikan penempatan
-- kerja sebagai isi paket. Yang boleh dijanjikan cuma kesempatan screening.
do $$
declare
  v_nyangkal int;
  v_janji    int;
begin
  select count(*) into v_nyangkal
  from academy_programs
  where is_free = false
    and status = 'published'
    and content->>'fee_note' ilike '%tidak menarik biaya penempatan%';

  if v_nyangkal > 0 then
    raise exception
      'Masih ada % produk berbayar published dengan klaim "tidak menarik biaya penempatan"', v_nyangkal;
  end if;

  select count(*) into v_janji
  from academy_programs
  where is_free = false
    and status = 'published'
    and (
      content->>'fee_note' ilike '%jaminan penempatan%'
      or content->>'fee_note' ilike '%pasti kerja%'
      or content->>'fee_note' ilike '%dijamin kerja%'
    );

  if v_janji > 0 then
    raise exception
      'Ada % produk berbayar published yang menjanjikan penempatan kerja di fee_note', v_janji;
  end if;
end $$;
