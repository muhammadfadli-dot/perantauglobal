# Brief Redesign — Portal Peserta Perantau Global
### Fokus utama: pengalaman belajar (course experience) di Akademi Perantau

> **Untuk:** Claude Design
> **Dari:** tim Perantau Global (Panji)
> **Codebase:** dilampirkan terpisah (monorepo `perantauglobal`). Dokumen ini = peta + brief. Semua path file di bawah relatif ke root repo.
> **Platform target:** mobile-first web app (portal peserta). Mayoritas user buka dari HP Android murah.

---

## 0. Yang kami minta (deliverables)

Tolong redesign **UX portal peserta**, dengan urutan prioritas:

1. **Akademi** — *terutama pengalaman ambil kursus per-modul / per-chapter.* Ini fokus #1. Yang sekarang terasa kurang enak buat user.
2. **Home (Beranda)** — bagaimana Akademi & lamaran hidup berdampingan di satu beranda.
3. **Lamaran (Lowongan)** — alur melamar + memantau status.

Untuk tiap surface kami butuh:

- **Flow / IA** — peta layar, urutan, navigasi, state transitions.
- **Desain layar** — wireframe → hi-fi, mobile-first, pakai design system kami (Bagian 6).
- **Inventory komponen** — komponen apa yang muncul di tiap layar, terutama **per chapter/modul akademi** (intro modul, kartu pelajaran, player bacaan, kuis, hasil, transisi antar-modul, momen selesai).
- **State coverage** — semua state penting (lihat checklist di Bagian 5d).

Yang **TIDAK** perlu didesain ulang sekarang: sisi admin/CRM, halaman auth/onboarding, dan struktur data (DB sudah fix — desain harus muat di model data Bagian 5a).

---

## 1. Konteks produk & AUDIENS — baca ini dulu, ini paling menentukan

**Perantau Global** = platform PT Daya Talenta Global (P3MI berlisensi) untuk menempatkan Pekerja Migran Indonesia (PMI) ke luar negeri. Dua produk inti di portal:

- **Lamaran / Lowongan** — kayak "loker perantau": cari posisi (negara × peran) → lamar → dipantau sampai berangkat.
- **Akademi Perantau** — kelas persiapan kerja ke luar negeri. Produk pertama berbayar: **Paspor Perantau Global — Seri Arab Saudi** (kursus "Siap Kerja Arab" di dalam aplikasi + psikotes eksternal → 2 sertifikat).

### Audiens: ini bukan user aplikasi biasa

Penggunanya **calon PMI low-skill** — sering kali:
- **Literasi digital rendah.** Banyak yang baru pertama pakai aplikasi selain WhatsApp & TikTok.
- **Literasi baca terbatas.** Dinding teks panjang = ditinggal. Banyak yang lebih nyaman *mendengar* dan *melihat* daripada membaca.
- **Takut ditipu (scam-fearful).** Calo & penipuan penempatan PMI marak. Setiap elemen yang terasa "robot/palsu/terlalu canggih" justru menurunkan kepercayaan.
- **HP kelas bawah, kuota terbatas.** Performa & ukuran aset penting.

### Aturan desain WAJIB (hasil pembelajaran kami, jangan dilanggar)

1. **Pakai pola yang sudah familiar**, bukan yang modern/pintar. Acuan mental: Settings iOS (list baris rapi), kartu marketplace (Tokopedia/Shopee), WhatsApp. Hindari interaksi yang butuh "dipelajari".
2. **Status biner & jelas.** "Selesai / Belum", "Lulus / Belum lulus". Hindari status ambigu atau banyak tingkat.
3. **Value harus kelihatan jelas & cepat.** User harus paham "ini buat apa, saya dapat apa" dalam hitungan detik. (Ini kursus **berbayar Rp500.000** — pengalaman belajarnya harus terasa *worth it* & sepadan harganya, tapi tetap sangat sederhana.)
4. **Navigasi country-first.** User berpikir "saya mau ke Arab/Jepang", bukan "saya mau peran X".
5. **Anti-redundansi.** Jangan tampilkan info yang sama dua kali. Layar bersih.
6. **Autentik > AI/stok.** Wajah asli, dokumen asli, nama PIC asli, kontak WhatsApp yang beneran bisa dihubungi = sinyal kepercayaan terkuat. Foto stok/AI orang = sinyal negatif. (Ilustrasi bergaya / foto dokumenter pekerja-di-tempat-kerja boleh; headshot stok-AI tidak.)
7. **Bantuan manusia selalu terjangkau.** Tombol bantuan WhatsApp adalah bagian dari kepercayaan (lawan calo: "ada manusia yang bisa saya tanya"), bukan sekadar dekorasi.
8. **Soal "gamifikasi": hati-hati.** Jangan poin/leaderboard/streak kompetitif yang kekanakan. **TAPI** *pengakuan milestone yang tulus* (mis. "Modul 2 selesai 🎉", progres yang kelihatan, sertifikat yang terasa diraih) itu **boleh dan diinginkan** — bedakan antara "mainan" vs "rasa pencapaian yang bermartabat".
9. **Touch target besar.** Tombol utama tinggi ±50–52px sekarang (disengaja). Pertahankan ukuran ramah-jempol.

> Ringkasnya: **target perasaan user = "ini gampang, ini jujur, ini ngebantu saya beneran, dan saya merasa maju."**

---

## 2. Arsitektur teknis (biar desain langsung implementable)

- **Stack:** Next.js 16 (App Router) · React 19 (Server Components default) · Tailwind CSS 4 · Supabase (Postgres + RLS).
- **App:** `apps/platform` → `app.perantauglobal.com`. Portal peserta ada di route group `apps/platform/src/app/(candidate)/`.
- **Rendering:** mobile-first. Ada layout desktop (sidebar kiri) tapi **mobile adalah warga kelas satu** — desain dari mobile dulu.
- **Bahasa UI:** Bahasa Indonesia, gaya santai-membumi (bukan formal/korporat).

### Chrome (kerangka yang sudah ada)

File: `apps/platform/src/components/pg/AppChrome.tsx` + `components/pg/candidate/BerandaShared.tsx`

- **`BottomNav`** — 4 tab tetap di bawah (mobile): **Beranda · Lowongan · Akademi · Saya**. Indikator aktif = bar merah 3px di atas ikon. (Di desktop jadi sidebar kiri.)
- **`BerandaTopBar`** — top bar khusus Beranda: brand mark "PG" kiri, label tengah, tombol **"Bantuan" (WhatsApp)** kanan.
- **`TopBarApp`** — top bar halaman dalam: tombol back kiri, judul tengah, slot kanan kosong. **Catatan:** halaman lesson akademi sekarang pakai ini → **tidak ada tombol bantuan saat user lagi belajar** (lihat weak spot #10).
- **`StickyCTA`** — tombol aksi nempel di bawah (dipakai di flow lamaran).
- **`ApplyHeader`** — header progress "Langkah N dari 5" + progress bar (flow lamaran).

### Icon set

`apps/platform/src/components/pg/Icon.tsx` — komponen `<Icon name=... size=... stroke=... />` (stroke-based, satu gaya konsisten). Nama yang sudah ada a.l.: `home, search, passport, user, arrow_right, arrow_left, chevron_right, check, x, lock, doc, doc_check, sparkle, sparkle_dot, info, warn, clock, phone, mail, bell, briefcase, compass, share, users, shield`. Boleh usul ikon baru kalau perlu.

---

## 3. Tiga surface utama — kondisi sekarang & yang diminta

### 3a. HOME — Beranda (`/dashboard`)

File: `apps/platform/src/app/(candidate)/dashboard/page.tsx` · helper `lib/journey.ts` · komponen `components/pg/candidate/*`

**Kondisi sekarang:** Beranda **adaptif** — berubah sesuai keadaan lamaran utama user, via `deriveBerandaState()`. Ada 5 state:

- **S1 — belum punya lamaran:** headline "Mau kerja di mana?" + country picker (scroll horizontal `CountryBigTile`) + nudge lengkapi profil + ajakan Akademi (`PasporInviteCard` compact).
- **S2 — punya lamaran, perlu dilengkapi (paling umum):** `JourneyHero` (mode applying) + "Tugas hari ini" (`TaskCard`) + "Sambil nunggu" Akademi + "Eksplor lowongan lain" (`ExploreCard` scroll).
- **S3 — lamaran sedang diproses:** `JourneyHero` (processing) + Akademi jadi *primer* ("Manfaatkan waktu nunggu") + `PendampingCard` (pesan dari tim).
- **Terminal — diterima / ditolak:** `TerminalCard` + (kalau diterima) modul persiapan keberangkatan.

Komponen Beranda: `BerandaHeader` (eyebrow greeting + pill member-ID + headline), `JourneyHero`, `TaskCard`, `CountryBigTile`, `PasporInviteCard` (3 varian: compact/default/primary), `PendampingCard`, `TerminalCard`, `ExploreCard`.

**Ask:** Beranda ini sebenarnya cukup matang. Yang kami mau dari kamu: **pastikan Akademi punya tempat yang jelas & konsisten di sini** — bukan sekadar cross-sell yang nyempil. Saat user sudah punya kelas berjalan, Beranda harus nunjukin "lanjutkan belajar" dengan jelas (sekarang progres kelas tidak muncul di Beranda sama sekali). Pikirkan: **bagaimana 3 hal — lamaran berjalan, kelas berjalan, dan profil — hidup bareng di satu beranda tanpa bikin user bingung?**

### 3b. LAMARAN — Lowongan & Aplikasi

File: browse `(candidate)/explore/page.tsx` · daftar lamaran `(candidate)/applications/page.tsx` · detail `applications/[id]/page.tsx` · lengkapi syarat `applications/[id]/lengkapi/` · wizard lamar `applications/new/`

**Kondisi sekarang:** Kartu lamaran = thumbnail hero negara + eyebrow bendera/negara + nama posisi + `StagePill` status. Status pakai model **3 tahap yang dilihat user**: **Terkirim → Diproses → Hasil** (pipeline internal yang lebih detail disembunyikan; dipetakan via `lib/applicationStatus.ts`). Kalau syarat belum lengkap → CTA merah "Lengkapi syarat lamaran".

**Ask:** Surface ini relatif sehat. Tinjau saja **konsistensi visual & status** supaya selaras dengan Akademi hasil redesign — terutama bahasa status biner dan kartu. Tidak perlu perombakan besar.

### 3c. AKADEMI — ⭐ FOKUS UTAMA

Tiga layar, dari luar ke dalam:

**(i) Daftar kelas — `/akademi`** (`(candidate)/akademi/page.tsx`)
- Section "Kelas saya" (yang sudah didaftar, `EnrolledRow` + progress bar mini) lalu "Semua kelas" (`ProgramCard`: cover gambar amber + badge harga/durasi).

**(ii) Detail program — `/akademi/[slug]`** (`(candidate)/akademi/[slug]/page.tsx`)
- Hero amber (judul, mode, fasilitator, chip harga/durasi/output).
- `StatusCard` (kalau sudah enroll): progress bar % + sertifikat kalau sudah terbit.
- Section: intro · "Yang kamu dapat" (benefits) · "Siapin dokumen ini" (checklist).
- **Outline materi:** per **Modul** → daftar `LessonRow`. Tiap baris pelajaran punya state: **done** (centang hijau) / **failed** (kuis belum lulus, merah) / **current** ("lanjut di sini") / **locked** (gembok abu — terkunci sampai pelajaran sebelumnya selesai, atau sampai dibayar).
- Lalu: `EnrollPanel` (form daftar + consent) kalau belum enroll · `PayButton` (kalau berbayar & belum lunas) · CTA "Mulai/Lanjutkan belajar".

**(iii) Player pelajaran — `/akademi/[slug]/lesson/[lessonId]`** ← **INI JANTUNGNYA**
File: page `(candidate)/akademi/[slug]/lesson/[lessonId]/page.tsx` · komponen `components/pg/academy/LessonPlayer.tsx`

- `TopBarApp` (back ke detail program) + eyebrow "Modul N · Judul Modul" + judul pelajaran.
- **`ReadingView`** — render blok konten (`heading / paragraph / list / steps / stat / quote / callout`) dalam **satu kolom scroll panjang**, lalu **satu tombol** di bawah: "Tandai selesai & lanjut".
- **`QuizView`** — daftar pertanyaan pilihan (single/multi) → tombol "Kumpulkan jawaban" → **`QuizResult`** (skor %, daftar benar/salah per soal, lalu: kalau lulus "Lanjut"; kalau belum "Baca lagi materi" / "Coba lagi kuisnya").
- **`AdvanceTransition`** — animasi sukses 850ms ("Mantap, selesai!") lalu auto-pindah ke pelajaran berikutnya / balik ke detail program.

---

## 4. Kenapa kami redesign — masalah yang dirasakan

Keluhan inti Panji: **"pengalaman user ketika ngambil kursusnya kurang enak."** Dari membaca kodenya, ini titik-titik lemah konkret yang kami lihat (anggap ini *input*, bukan resep — silakan rancang ulang secara holistik):

1. **User nggak tau "saya di mana".** Di dalam pelajaran cuma ada eyebrow modul + judul. Tidak ada indikator "Pelajaran 3 dari 24", tidak ada progress modul, tidak ada peta chapter. Untuk user literasi rendah, hilang jangkar spasial.
2. **Bacaan = dinding teks + satu tombol di paling bawah.** Tidak ada pemecahan jadi kartu/langkah/layar kecil. Pelajaran 5 menit terasa seperti tembok. (Audiens ini paling rentan di sini.)
3. **Nihil media.** Tidak ada gambar, audio, atau video dalam pelajaran — `lesson_type: "video"` malah di-`notFound()`. Padahal **narasi audio + ilustrasi/gambar** bisa melipatgandakan pemahaman untuk audiens yang lebih suka dengar & lihat. Ini peluang terbesar.
4. **Modul/chapter tak terlihat saat belajar.** Modul cuma muncul di outline detail program. Begitu masuk pelajaran, tidak ada "kamu di Modul 2", "sisa pelajaran di modul ini", apalagi layar **intro modul** / **selesai modul**. Chapter bukan objek navigasi yang nyata.
5. **Transisi antar-pelajaran terasa hambar/membingungkan.** Selesai → animasi 850ms → pelajaran berikut muncul di atas. (Ada komentar di kode soal "looks like the same button" — gejala bahwa perpindahan tidak terasa sebagai "maju ke bab berikutnya".)
6. **Hasil kuis datar & tanpa penjelasan.** Hanya skor + centang/silang per soal. Tidak ada *kenapa* jawaban salah. Untuk produk belajar, ini miss. (Catatan keamanan: kunci jawaban sengaja admin-only di tabel terpisah, **tidak** ada di konten pelajaran — jadi "penjelasan" harus dirancang tanpa membocorkan kunci. Bisa lewat field rationale per-opsi yang aman, dsb. — usulkan modelnya.)
7. **Feedback progres tipis.** Cuma satu bar %. Tidak ada penyelesaian per-modul, tidak ada "X dari Y pelajaran", tidak ada momen perayaan di batas modul (lihat aturan #8 soal milestone yang bermartabat).
8. **Pelajaran terkunci terasa seperti "dilarang", bukan "akan terbuka".** Baris locked tampil abu/redup. Nilai "buka berikutnya" tidak memotivasi, cuma menggerbang.
9. **Tidak ada bantuan di dalam pelajaran.** Tombol bantuan WhatsApp ada di Beranda, tapi player pelajaran pakai `TopBarApp` tanpa tombol bantuan. User bingung di tengah materi tidak punya pintu keluar.
10. **Resume kurang menonjol.** "Lanjutkan belajar" cuma di detail program. Tidak ada penanda "lanjut dari tempat terakhir" yang persisten (mis. di Beranda / daftar kelas).
11. **Bingkai masuk/keluar lompat.** Dari daftar pelajaran flat langsung nyemplung ke isi pelajaran — tanpa "ringkasan modul" sebagai jeda. Awal & akhir perjalanan belajar kurang dirayakan, padahal **sertifikat** adalah hadiah utamanya (psikotes + Paspor → 2 sertifikat).

**Bintang utara pengalaman:** seluruh perjalanan belajar menuju **sertifikat yang diakui & terasa diraih**. Redesign harus bikin sertifikat itu terasa *dekat & layak diperjuangkan*, sambil tiap langkah tetap **dead-simple**.

---

## 5. Deep-dive Akademi — model data, flow, & state (constraint desain)

### 5a. Model data (FIX — desain harus muat di sini)

File acuan: `apps/platform/src/lib/academy-db.ts` (migration `0060`).

Hierarki: **Program → Modul → Pelajaran**, plus enrollment & progress per user.

- **`academy_programs`** — `slug, title, subtitle, cover_image, delivery_mode (in_app|webinar|offline|external), output_type (certificate|psikotes_result|completion|none), is_free, price, duration_label, facilitated_by, status (draft|published), content` (JSONB: `intro, benefits[], outcomes[], for_who[], doc_checklist[], instructor`).
- **`academy_modules`** — `program_slug, module_num, title, sort_order`.
- **`academy_lessons`** — `module_id, lesson_num, title, lesson_type (reading|quiz|video), estimated_minutes, content` (JSONB), `sort_order`.
  - **reading.content** = `{ blocks: [{ type, text?, items?, variant?, title?, value?, label?, sub? }] }` — tipe blok: `heading, paragraph, list, callout (variant tip|info|warn), steps, stat, quote`.
  - **quiz.content** = `{ questions: [{ id, prompt, options: [{key,label}], multiple? }] }`.
  - ⚠️ **Kunci jawaban TIDAK ada di sini** — ada di tabel admin-only `academy_lesson_keys`. Aman membaca `lesson.content` di client.
- **`academy_enrollments`** — `candidate_id, program_slug, status (registered|in_progress|completed|passed|failed|cancelled), progress_pct, certificate_id, payment_status (unpaid|pending|paid|waived|refunded)`.
- **`academy_lesson_progress`** — `enrollment_id, lesson_id, status, score`.
- **`program_registration_fields`** — field form pendaftaran per-program (dipakai `EnrollPanel`).

> Boleh **mengusulkan kolom/field baru** kalau desain butuh (mis. `lesson.media`, `option.rationale`, `module.intro`) — sebutkan eksplisit; kami yang implement migrasinya.

### 5b. Aturan akses & locking (jangan diubah logikanya)

- **Locking berurutan:** pelajaran "current" = pelajaran belum-selesai pertama; setelahnya terkunci sampai yang sebelumnya selesai. Kuis yang gagal tetap jadi "current" (biar tombol coba-lagi muncul).
- **Gerbang bayar:** program berbayar → **tidak ada akses pelajaran** sampai `payment_status = paid/waived` (`hasPaidAccess()`). Program gratis selalu terbuka.
- Desain harus punya state untuk: terkunci-karena-urutan, terkunci-karena-belum-bayar, dan terbuka.

### 5c. Produk nyata pertama (biar desain konkret)

**Paspor Perantau Global — Seri Arab Saudi:** `delivery_mode = in_app`, **berbayar Rp500.000**, `output_type = certificate`. **6 modul / 24 pelajaran** (campuran bacaan + kuis). Plus **psikotes EnGauge** eksternal. Saat user menuntaskan kursus **dan** psikotes → **2 sertifikat terbit bareng**. Materi sudah ditulis (lihat `docs/akademi-perantau/paspor-arab-siap-kerja.md` + `paspor-arab-preview.html` untuk merasakan isi penuhnya). Desain pengalaman belajar harus pas untuk konten selevel ini.

### 5d. Checklist state yang harus tercakup desain

Pengalaman belajar (minimal):
- [ ] Detail program — **belum enroll** (gratis vs berbayar) → daftar / bayar.
- [ ] **Pembayaran**: perlu-bayar · sedang-diproses · sukses · gagal (lihat `PaymentBanner`).
- [ ] Sudah enroll, **belum mulai** → "Mulai belajar".
- [ ] **Pelajaran bacaan** (idealnya: + media/audio, ter-chunk).
- [ ] **Kuis**: belum dijawab · sebagian dijawab · hasil **lulus** · hasil **belum lulus** (+ jalur coba-lagi / baca-lagi).
- [ ] **Transisi antar-pelajaran** & **batas modul** (selesai Modul N → masuk Modul N+1).
- [ ] **Pelajaran terkunci** (urutan) & **kelas terkunci** (belum bayar).
- [ ] **Resume** "lanjut dari terakhir" (di Beranda / daftar kelas / detail program).
- [ ] **Kursus selesai** → **sertifikat terbit** (+ koneksi ke psikotes & sertifikat kedua).
- [ ] **Empty states** (materi belum tersedia, belum ada kelas dibuka).
- [ ] **Bantuan** dapat diakses dari dalam pelajaran.

---

## 6. Design system — pakai ini (jangan bikin bahasa visual baru)

Token ada di `apps/platform/src/app/globals.css`. Inti:

**Warna**
- **Brand merah** (warna utama portal): `--pg-red-600 #d7262f`, `--pg-red-700 #b91d24`, soft `--pg-red-50 #fff4f4`.
- **Akademi / Paspor = palet AMBER/EMAS** (signature "medali yang diraih") — **inilah warna khas pengalaman Akademi**: `--pa-amber-500 #c98a14`, `--pa-amber-600 #a16d0c`, `--pa-amber-700 #6e4906`, `--pa-amber-100 #fcecc7`, `--pa-amber-200 #f6d896`, `--pa-amber-50 #fff7e8`. Tombol utama Akademi sekarang gradient `135deg, amber-500 → amber-600`.
  > Penting: **portal umumnya merah; Akademi condong emas.** Pertahankan kontras identitas ini — Akademi terasa seperti "ruang istimewa yang berharga".
- **Ink (teks/abu):** `--pg-ink-900 #141414` (utama) → `500 #5a5a5a` (sekunder) → `200/100/50` (garis/permukaan). Kertas `--pg-paper #fafaf8`, putih `--pg-white`.
- **Status:** ok `#0a6e3a`, warn `#a66500`, err `#b91d24`, info `#1e5aa8` (+ varian `-bg` lembut). Sudah lolos kontras WCAG AA — jaga.

**Tipografi**
- **Plus Jakarta Sans** — display & body. Headline `extrabold`, tracking ketat (`-0.02em`), `text-balance`.
- **IBM Plex Mono** — khusus eyebrow / label / badge / status: `uppercase`, tracking lebar. (Pola khas kami: label kecil mono di atas judul.)

**Bentuk & elevasi**
- Radius: kartu ~14–16px, tombol ~12px (`rounded-xl`), badge kecil / pill `rounded-full`.
- Shadow: skala `--pg-shadow-1/2/3` + kartu hangat `--pa-shadow-card`, `--pa-shadow-lift`.
- Tombol utama: tinggi ~50–52px, full-width, teks bold + ikon `arrow_right`.

**Aset gambar**
- Cover/hero pakai foto dengan overlay gelap amber. Foto **dokumenter pekerja-di-tempat-kerja / dokumen asli OK**; **headshot stok-AI TIDAK** (aturan autentisitas #6). Ilustrasi bergaya untuk membantu pemahaman (audiens literasi rendah) sangat dianjurkan.

---

## 7. Pertanyaan terbuka untuk dipikirkan (boleh kamu jawab lewat desain)

1. **Chapter sebagai objek nyata?** Apakah modul layak punya layar **intro** ("Modul 2: Hidup & Kerja di Saudi — 4 pelajaran, ±15 menit") dan **outro** ("Modul 2 selesai 🎉")? Bagaimana bentuknya tanpa terasa kekanakan?
2. **Media & audio.** Bagaimana memasukkan **narasi audio** + **gambar/ilustrasi** ke pelajaran bacaan untuk audiens literasi rendah — tanpa memberatkan kuota? (Usulkan field data + pola UI.)
3. **Chunking bacaan.** Satu-scroll-panjang vs. kartu per-langkah / "next" bertahap — mana yang lebih cocok untuk audiens ini?
4. **Penjelasan kuis** tanpa membocorkan kunci jawaban (yang admin-only). Model datanya seperti apa?
5. **Resume & momentum.** Di mana "lanjut belajar" paling efektif muncul (Beranda? daftar kelas? notifikasi?) supaya user balik lagi.
6. **Milestone bermartabat.** Bentuk perayaan selesai-modul & terbit-sertifikat yang terasa membanggakan untuk orang dewasa pekerja keras — bukan confetti mainan.
7. **Sertifikat ganda.** Bagaimana memvisualkan jalur "kursus + psikotes → 2 sertifikat" supaya user paham dari awal apa yang sedang mereka tuju.

---

## 8. Rangkuman satu kalimat

> Rancang ulang pengalaman belajar Akademi Perantau supaya **calon PMI yang gaptek & takut ditipu** merasa belajarnya **gampang, jujur, dan jelas memajukan mereka menuju sertifikat yang diakui** — dengan modul/chapter yang terasa nyata, media yang membantu yang kurang suka membaca, dan momen pencapaian yang bermartabat — semuanya di dalam design system merah-emas kami, mobile-first.
