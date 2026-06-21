# Paspor Perantau Global — Seri Arab Saudi · Product & Dev Plan

> Status: **DRAFT untuk review Panji** · dibuat sesi 2026-06-17
> Konteks: produk berbayar pertama Akademi Perantau. Konten kursus ("Siap Kerja Arab Saudi") ditulis terpisah via multi-agent (lihat `_paspor-arab-curriculum.json` + `paspor-arab-siap-kerja*.{json,md}`). Dokumen ini = arsitektur, alur, payment, harga, dan rencana build.

---

## 0. Update keputusan (2026-06-17, sesi 2) — dari Panji

- **Payment provider = Xendit** (lihat §4 + lampiran setup di bawah).
- **Psikotes:** BUKAN paket CORE/DIVE/MOVE/English-for-Business penuh. DayaLima / EnGauge punya **produk khusus psikotes ke luar negeri** yang lebih ringkas. **Bahasanya Bahasa Indonesia (belum 100% confirm)**, dan **SUDAH INCLUDE di harga Rp500.000** (bukan biaya terpisah).
- **Pengakuan (per Panji):** psikotes ini **diakui negara** dan bisa dipakai sebagai **prasyarat ke luar negeri** — analog seperti membeli asesmen DELF. ⚠️ **PIN sebelum klaim ini tayang ke kandidat:** (a) nama produk EnGauge-nya persis, (b) dasar pengakuannya (lembaga/regulasi apa — KP2MI? psikolog HIMPSI? eKTKLN?). Ini bukan menahan; ini supaya klaim "diakui negara" di materi punya bukti & aman dari sisi kepatuhan. Materi Modul 6 sekarang masih frame "asesmen profesional yang memperkuat kesiapan" — bisa di-upgrade ke "diakui & bisa jadi prasyarat" begitu (a)+(b) terkunci.
- **Sertifikat = DUA, keluar bareng** saat peserta menyelesaikan **dua tahap** (kursus Siap Kerja + psikotes): (1) **Sertifikat Psikotes** (dari DayaLima/EnGauge), (2) **Sertifikat Paspor Perantau Global – Arab Saudi**. → Implikasi model (revisi §3c): `academy_enrollments.certificate_id/url` (single) perlu di-extend jadi dua cert (mis. kolom `psikotes_certificate_url` + `paspor_certificate_url`, atau `certificates jsonb`). Dua-duanya di-issue saat kursus `passed` DAN psikotes `result_received`.

---

## 1. Definisi Produk

**Paspor Perantau Global — Arab Saudi** = paket **berbayar Rp 500.000** yang isinya 2 komponen → selesai dua-duanya → dapat **Sertifikat Paspor Perantau Global – Arab Saudi**:

| # | Komponen | Delivery | Di mana |
|---|----------|----------|---------|
| 1 | **Kursus "Siap Kerja Arab Saudi"** (6 modul / 24 lesson, 18 reading + 6 kuis, ~2–2,5 jam) | `in_app` (guided learning, sama seperti kursus Finansial) | Di dalam app Perantau Global |
| 2 | **Psikotes DayaLima** (EnGauge: CORE/DIVE/MOVE, ~2 jam) | `external` | Di platform/tools DayaLima, **dipandu tim PG**, hasil di-track balik |

**Narasi (guardrail enabler-not-gate):** Paspor = bekal mandiri berbayar yang **memperkuat** kesiapan kandidat. **TERPISAH** dari biaya penempatan resmi yang harus *zero-cost* bagi PMI. Bukan paywall yang menghalangi keberangkatan. (Lihat memory `feedback_sertifikasi_narrative`.)

**Anti-overlap:** kursus Finansial yang sudah live (`finansial-cerdas-pmi-saudi`, gratis) cover uang/gaji/nabung/kirim/anti-tipu-finansial. Paspor "Siap Kerja Arab" cover **kesiapan kerja & hidup** (hukum/kontrak/hak, jalur resmi/anti-calo/TPPO, budaya/agama/garis-merah, bahasa Arab kerja+darurat, kesehatan + lapor masalah, psikotes + peran penyalur + sertifikat).

---

## 2. Bentuk Kursus (sudah final di konten)

6 modul, ditulis menurut audience PMI low-skill (mayoritas calon PRT/care-giver):

1. **Berangkatnya Dulu yang Benar** — jalur resmi vs calo, visa kerja vs umroh, cek SISKOP2MI, red flag TPPO. *(+ status moratorium domestik Saudi disampaikan jujur)*
2. **Hak Kerjamu & Isi Kontrak** — cara baca PK, hak resmi (10 jam, libur, paspor di tangan sendiri), kafala/Musaned, kapan boleh pindah majikan resmi.
3. **Hidup di Rumah Majikan** — budaya/agama/norma + 5 garis merah berisiko pidana.
4. **Bahasa Arab Kerja & Darurat** — frasa inti harian + **Kartu Frasa Darurat (artefak cetak)**.
5. **Sehat Sebelum & Sesudah + Lapor Kalau Kena Masalah** — persiapan badan pra-berangkat, **Kartu SOS (artefak cetak)** + nomor resmi terverifikasi, huroob, heat stroke, mental.
6. **Psikotes DayaLima, Peran Penyalur & Sertifikat** — siap psikotes, tanggung jawab P3MI selama penempatan, alur Paspor + CTA.

**2 artefak konkret** (bikin value Rp500K kerasa): Kartu SOS + Kartu Frasa Darurat yang bisa dicetak & dibawa (dirancang dari konten lesson 14 & 17).

---

## 3. Data Modeling (cocokin ke schema `academy_*` yang sudah ada)

Schema Akademi sudah punya hampir semua yang dibutuhkan. Yang **belum ada**: payment gate + gating sertifikat ke langkah external. Rekomendasi:

### 3a. Satu `academy_program` (bukan dua)
Model Paspor sebagai **satu program** `in_app`, psikotes ditangani lewat field `external_*` di enrollment yang **sudah ada**.

```
slug:                'paspor-arab-saudi'        (atau 'paspor-perantau-global-arab')
title:               'Paspor Perantau Global – Arab Saudi'
subtitle:            'Bekal lengkap biar berangkat benar, tahu hakmu, dan siap kerja di Saudi'
category:            'paspor'
delivery_mode:       'in_app'                   (komponen kursus)
facilitated_by:      'Daya Skill'
country:             'saudi_arabia'
is_free:             false
price:               500000
output_type:         'certificate'
credential_issuer:   'Perantau Global'          (cek: 'Perantau Global' vs 'Daya Skill' — keputusan Panji)
credential_delivery: 'in_app'                   (sertifikat digital; PDF = follow-up)
pass_threshold:      70
status:              'published' (setelah review)
```

Modul + lesson + answer keys → seed migration baru `00XX_academy_seed_paspor_arab.sql` (pola persis 0063).

### 3b. Psikotes (external) — pakai field enrollment yang sudah ada
`academy_enrollments` sudah punya: `external_status` (`link_sent`/`scheduled`/`attended`/`result_received`), `external_url`, `external_ref`. Tim PG/admin update status ini selagi kandidat ngerjain psikotes EnGauge. **Tidak perlu tabel baru.**

### 3c. GAP 1 — Gating sertifikat ke psikotes ⚠️ butuh migration kecil
Sekarang `_recompute_academy_enrollment` nge-issue sertifikat begitu **kursus** selesai/lulus — itu **sebelum** psikotes. Salah untuk bundle Paspor. Fix yang direkomendasikan:

- Tambah kolom `academy_programs.requires_external_completion boolean default false`.
- Untuk Paspor: set `true`. Ubah `_recompute` → **jangan** issue `certificate_id` selama `requires_external_completion = true` DAN `external_status <> 'result_received'`.
- Sertifikat terbit saat: kursus lulus **DAN** psikotes `result_received` (di-set tim PG, atau admin action `confirmPaspor`).

> Alternatif (tanpa ubah `_recompute`): sertifikat di-issue manual lewat admin action setelah cek dua-duanya. Lebih sederhana tapi manual. **Rekomendasi: kolom flag** (lebih bersih, auditable).

### 3d. GAP 2 — Payment gate ⚠️ belum ada sama sekali
`enroll_in_academy_program` enroll gratis tanpa cek bayar. Untuk produk Rp500K perlu:

- Tambah `academy_enrollments.payment_status text default 'unpaid'` (`unpaid`/`paid`/`waived`) + `paid_at timestamptz` + opsional `payment_ref text`.
- Lesson player **dikunci** selama `payment_status='unpaid'` (kecuali 1 lesson preview gratis kalau mau jadi lead magnet).
- Lihat §4 untuk opsi cara bayar.

---

## 4. Cara Bayar (keputusan Panji) — rekomendasi bertahap

**Fase 1 (launch cepat) — assisted/manual confirm:**
Audience low-skill, low-digital-trust, dan PG udah punya motion sales terpandu (WA + PIC). Jadi:
- Web LP → daftar → enrollment `payment_status='unpaid'` → muncul instruksi bayar (transfer/QRIS statis) + tombol WA ke tim PG.
- Tim PG konfirmasi pembayaran → admin action `markEnrollmentPaid` → akses kebuka.
- **Pro:** cepat dibangun, cocok funnel terpandu, gak butuh integrasi gateway. **Con:** manual, ada lag.

**Fase 2 (scale) — gateway self-serve:**
- **Xendit** atau **Midtrans** (dua-duanya kuat di ID: QRIS, Virtual Account, e-wallet OVO/Dana/GoPay). QRIS = paling ramah audience.
- Webhook → flip `payment_status='paid'` otomatis.
- **Rekomendasi provider: Xendit** (DX bagus, QRIS + VA + e-wallet, docs jelas). Konfirmasi ke Panji.

---

## 5. Alur End-to-End (target)

```
[Web LP /akademi/kelas/paspor-arab-saudi]
   → daftar (buat/login akun PG, PDP consent)               [sudah ada: /api/akademi/[slug]]
   → enrollment dibuat: payment_status='unpaid'              [GAP: payment_status]
   → BAYAR (Fase 1: transfer+WA konfirmasi / Fase 2: QRIS)   [GAP: payment]
   → payment_status='paid' → akses kursus kebuka
[App /akademi/paspor-arab-saudi]
   → kerjain 6 modul / 24 lesson (reading + kuis)            [sudah ada: lesson player + grade RPC]
   → kursus 'passed'
   → diarahkan ke PSIKOTES DayaLima (tim PG kirim link/pandu)  [external_status: link_sent→...→result_received]
   → psikotes 'result_received'
   → SERTIFIKAT Paspor terbit                                [GAP: requires_external_completion gating]
```

Yang **sudah jalan** (reuse): akun/PDP/enroll, lesson player reading+quiz, grading RPC, sertifikat auto-issue (tinggal di-gate), field external_* untuk psikotes, web register route.
Yang **perlu dibangun**: payment gate (§3d/§4), gating sertifikat (§3c), admin UI buat (a) konfirmasi bayar, (b) update status psikotes, (c) terbitkan/cek sertifikat.

---

## 6. Pertanyaan Terbuka (BUTUH keputusan Panji)

**Psikotes DayaLima / EnGauge** (paling banyak, karena nentuin akurasi materi Modul 6 + alur):
1. **Modul mana** yang dipakai untuk PMI low-skill? Riset internal nunjukin EnGauge = platform DDI/DayaLima berisi **CORE** (kognitif/IQ ~60mnt), **DIVE** (kepribadian Big Five ~30-45mnt), **MOVE** (motivasi/nilai ~25-30mnt) — aslinya untuk rekrutmen korporat. Dipakai full (~2 jam) atau versi ringkas untuk PMI?
2. **Bahasa & literasi:** soal 100% Bahasa Indonesia? Ada mode bacakan/audio/pendampingan? (Krusial untuk literasi rendah.)
3. **Online sendiri vs terpandu:** PMI ngerjain sendiri dari HP, atau dikumpulkan + didampingi PG?
4. **Hasil:** berapa lama keluar, bentuknya apa (skor/profil/sertifikat yang bisa di-submit)?
5. **Biaya:** psikotes sudah include di Rp500K, atau terpisah?
6. **Pengakuan:** apakah psikotes ini diakui BP2MI/HIMPSI sebagai pemenuhan psikotes wajib CPMI, atau terpisah? → **materi TIDAK mengklaim "diakui resmi" sampai dikonfirmasi** (sekarang diframe sebagai asesmen profesional DayaLima yang memperkuat kesiapan).
7. **Boleh mengulang?** Dan apakah hasil "kurang" menghalangi berangkat? (Harus selaras enabler-not-gate.)

**Komersial & produk:**
8. **Harga Rp500K final?** (sekarang dipakai sebagai angka kerja.)
9. **Provider payment:** manual dulu (Fase 1) atau langsung gateway? Xendit oke?
10. **Penerbit sertifikat:** "Perantau Global" atau "Daya Skill"? Desain/PDF sertifikat?
11. **Standalone-purchasable?** Paspor cuma bisa dibeli per-negara (Saudi), atau kursusnya bisa dijual lepas?
12. **Lead magnet:** mau 1 lesson preview gratis biar orang ngerasain sebelum bayar?

---

## 7. Rencana Build (fase, urut)

**Sudah selesai sesi ini (konten + plan):**
- [x] Riset + verifikasi + kurikulum 6 modul / 24 lesson
- [x] Materi lengkap ditulis + review + revisi (workflow)
- [x] Draft seed migration `00XX_academy_seed_paspor_arab.sql` (BELUM di-apply)
- [x] Product & dev plan (dokumen ini)

**Build berikutnya (butuh keputusan §6 dulu, terutama harga/payment/psikotes):**
1. **Migration schema** — `payment_status`/`paid_at` di enrollments + `requires_external_completion` di programs + update `_recompute` + (opsional) admin RPC `mark_enrollment_paid` / `confirm_external_completion`. *(gated: Panji apply)*
2. **Apply seed konten** Paspor + regenerate types.
3. **Payment Fase 1** — kunci lesson kalau unpaid, instruksi bayar + WA, admin "Tandai lunas".
4. **Web LP** `/akademi/kelas/paspor-arab-saudi` (DB-driven, pakai program.content).
5. **Admin Akademi** minimal — konfirmasi bayar, update status psikotes, lihat enrollment. *(Sebelumnya deferred; sekarang naik prioritas karena produk berbayar perlu operasi.)*
6. **Artefak cetak** — Kartu SOS + Kartu Frasa Darurat (PDF/printable dari konten lesson).
7. **Sertifikat** — gating ke psikotes; PDF sertifikat = follow-up.
8. **(Fase 2)** Gateway Xendit/Midtrans QRIS self-serve.

---

## 8. File Terkait
- `_paspor-arab-curriculum.json` — outline final 6 modul / 24 lesson
- `_paspor-arab-dossier.json` — dossier riset + 24 verdict fact-check + voice guide + temuan psikotes
- `paspor-arab-siap-kerja.json` / `.md` — materi lengkap (output authoring)
- `00XX_academy_seed_paspor_arab.sql` — seed migration draft (belum apply)
