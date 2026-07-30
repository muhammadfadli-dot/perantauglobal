-- 0121: fee_note Barista dipertegas dengan angka persis commitment fee.
--
-- LATAR: Ifa (PO) mengonfirmasi lewat email 30 Jul 2026 pukul 11:18:
-- "Commitment fee itu istilah untuk bayar 30 persen dari biaya program di
-- depan ya." Ini menjawab pertanyaan terbuka di migrasi 0120, yang sengaja
-- tidak mengklaim commitment fee sebagai total biaya karena belum dikonfirmasi.
--
-- Sekarang dikunci: commitment fee = uang muka 30% dari biaya program,
-- bukan seluruh biayanya. Kalimat lama sudah tidak salah (tidak pernah
-- mengklaim itu total), tapi sekarang bisa lebih presisi daripada sekadar
-- "yang kamu bayar".

update academy_programs
set content = jsonb_set(
      content,
      '{fee_note}',
      to_jsonb(
        'Sertifikat Perantau adalah satu paket: pelatihan, sertifikasi, sampai kesempatan masuk tahap screening penempatan. Yang kamu bayar untuk mengikuti program ini disebut commitment fee, yaitu uang muka 30% dari biaya program, dan dibayarkan ke lembaga pelatihan. Biaya keberangkatan dihitung terpisah dan tetap menjadi tanggungan kandidat, bedanya lewat program ini biaya itu bisa ditanggung dulu lewat dana talang lalu dilunasi kemudian. Rinciannya dijelaskan sebelum kamu memutuskan.'::text
      )
    ),
    updated_at = clock_timestamp()
where slug = 'sertifikat-perantau-barista';

-- Invarian dari 0119 + 0120 tetap berlaku, dibawa apa adanya supaya migrasi
-- ini konsisten dengan pola yang sudah ada.
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
