# Perantau Global — Product Spec (v1)

**Status:** Final scope before design rework
**Last updated:** 2026-04-23
**Source:** Feedback Mas Martin & Tim Sourcing (PDF 2026-04-23) + sesi planning Panji

> **Buat siapa dokumen ini:**
> 1. **Claude Design** — input untuk rework UI/UX (visual + wireframe + copy)
> 2. **Claude Code** — input untuk implementasi setelah desain disetujui
> 3. **Panji** — single source of truth scope yang udah disepakati

---

## 1. Repositioning (penting — baca dulu)

### 1.1 Global Talent Hub = THE APP, bukan program
- Selama ini GTH ditampilkan sebagai "program training 6-8 minggu" → **salah framing**
- Reposisi: **GTH adalah produk/aplikasi Perantau Global** — di mana PMI bisa: (a) apply kerja luar negeri, (b) dapet training gratis untuk sertifikasi **Global Talent Ready** (training feature belum dibangun, tapi disebut sbg roadmap)
- Konsekuensi:
  - Halaman `/program/global-talent-hub` jadi **landing page penjelasan apa itu GTH** + CTA "Daftar di Talent Hub" → ngarah ke sign-in/register di `app.perantauglobal.com`
  - **Tidak ada form pendaftaran terpisah** lagi di www. Cuma ada "lihat lowongan" + "buka aplikasi"
  - Branding: tagline tetep ada ("Global Talent Hub — tempat kerja luar negeri"), tapi positioning jelas = nama produk

### 1.2 SPG = lowongan domestic, bukan program
- Sebelumnya SPG di-frame sebagai "field partner program" terpisah
- Reposisi: SPG = **lowongan posisi SPG di Indonesia**. Penempatan domestic (Jakarta, Surabaya, dll), tetapi alur apply sama dengan lowongan lain (form bio → magic link → portal → fill credentials → apply)
- Konsekuensi:
  - Hapus `/program/spg` → jadiin `/lowongan/spg-indonesia`
  - SPG masuk catalog `positions` dengan `country = "Indonesia"`
  - Tier/scoring system SPG yang lama (7-dimensi) → diadopsi sbg **tier system universal** (semua posisi punya admin-side tier scoring)

### 1.3 Yang dihapus dari www
- `/destinasi` (semua sub-page) — info destinasi cukup ditempel di lowongan detail
- `/blog` (12 MDX articles) — Panji handle blog manual nanti, gak perlu fitur sekarang
- Mention WhatsApp di mana pun (footer, kontak, CTA, FAQ) — semua ganti email
- "Tanpa biaya kandidat" → ganti "Bebas biaya **sebelum** menerima offering letter" (lihat copy guidelines §6)
- Klaim training bahasa gratis — DTG **tidak menyediakan** training bhs Inggris/Arab/dll. Hapus dari semua page
- Testimonial palsu (R. Setiawan dll) — hapus sampai ada testimonial real
- Slot count + deadline ngarang (12/24, 30 Apr) — hapus, ganti placeholder atau kosongkan sampai job_order beneran ada
- "Balasan WA rata-rata 11 menit" — hapus, atau kalau perlu ada SLA komitmen "kami balas dalam 30 menit"

---

## 2. Final position catalog (13 posisi)

Daftar posisi yang **boleh** ada di catalog (bukan berarti aktif sekarang). Sumber: PDF Sourcing & Recruitment.

### A. Saudi Arabia (7)
| Slug | Posisi | Gaji | Gender | Usia | Highlight requirement | Biaya |
|---|---|---|---|---|---|---|
| `perawat-saudi-arabia` | Perawat / Nurse | SAR 3.200 + makan SAR 200 | P | 21–38 | D3 Keperawatan, STR aktif, min 1 tahun pengalaman | Rp 20jt |
| `barista-saudi-arabia` | Barista | SAR 1.500 + makan SAR 300 | L/P | 21–30 | English aktif, keahlian kopi | Rp 8jt |
| `waiter-saudi-arabia` | Waiter | SAR 1.500 + makan SAR 300 | L | 21–30 | English aktif | Rp 8jt |
| `waitress-saudi-arabia` | Waitress | SAR 1.600 + makan | P | 21–35 | English aktif | Rp 8jt |
| `chef-bakery-saudi-arabia` | Chef Bakery | SAR 2.000 + makan | L | 21–35 | English aktif | TBD |
| `spa-therapist-saudi-arabia` | Spa Therapist (Dany Salon) | SAR 1.500 + makan SAR 300 + 2% invoice | P | 28–40 | min 1 thn pengalaman, English | Rp 4jt |
| `laundry-worker-saudi-arabia` | Laundry Worker | SAR 1.500 + makan SAR 300 | P | 23–33 | English dasar | TBD |

### B. Jepang (4)
| Slug | Posisi | Gaji | Gender | Usia | Highlight requirement | Biaya |
|---|---|---|---|---|---|---|
| `truck-driver-jepang` | Truck Driver | ¥250.000/bulan | L | max 44 | SMA/SMK, JLPT N4/JFT A2, SIM A/B (>1 thn), 2 thn pengalaman menyetir, komitmen 5 thn | TBD |
| `food-service-jepang` | Food Service (Restoran) | ¥1.226/jam | L/P | max 35 | SMA/SMK, JFT A2/JLPT N4, SSW Restoran | TBD |
| `kaigo-jepang` | Caregiver (Panti Lansia) | ¥190.000/bulan THP | P | 18–35 | D3 Keperawatan, JLPT N4/JFT A2, SSW Kaigo | TBD |
| `pengolahan-makanan-jepang` | Pengolahan Makanan | ¥210.000/bulan | P | 20–35 | SMA/SMK, JLPT N4/JFT A2, SSW Pengolahan Makanan | TBD |

### C. Lainnya (2)
| Slug | Posisi | Gaji | Gender | Usia | Highlight requirement | Biaya |
|---|---|---|---|---|---|---|
| `caregiver-taiwan` | Caregiver Taiwan | NT$ 29.500/bulan (akomodasi NT$ 2.500) | P | 20–40 | 155cm+, 55kg+, ijazah/sertifikat relevan, min 1 thn | TBD |
| `spg-indonesia` | SPG Indonesia | TBD (Rupiah) | P | TBD | Lokasi Indonesia, no passport needed | — |

### Status saat ini
- **Hanya `perawat-saudi-arabia` yang punya job order aktif.** Sisanya = catalog only (tampil "Lowongan akan dibuka — daftar antrian").
- **Hapus** `dental-nurse` dari admin dashboard (tidak aktif & tidak di-plan).

---

## 3. Data model (revised)

### 3.1 Tabel `positions` (catalog/template)
Sudah ada. Schema unchanged tapi seed ulang dengan 13 posisi di atas.
```
positions:
  - slug (PK)
  - role_label, country_label, summary
  - requirements JSONB { type: hard|soft, label, allowed_values? }
  - active boolean
```

### 3.2 Tabel `job_orders` (BARU)
Instance konkret dari sebuah position dengan employer + slot + batch.
```
job_orders:
  - id UUID (PK)
  - position_slug (FK → positions)
  - employer_name text         -- e.g. "Rumah sakit Saudi Arabia" (general kalau confidential)
  - employer_city text         -- e.g. "Riyadh" / "Madinah" (optional, boleh kosong)
  - intake_label text          -- e.g. "Batch Juni 2026"
  - slot_count int             -- total slot
  - slot_filled int            -- terisi (auto-update via trigger)
  - deadline date              -- batas apply (nullable)
  - status enum                -- 'open' | 'closed' | 'filled' | 'cancelled'
  - notes text                 -- internal notes (admin-only)
  - public_description text    -- copy yang muncul di www (override default position summary)
  - created_at, updated_at, created_by
```

**Penting:** kalau gak ada job_order aktif untuk sebuah position → posisi tetep tampil di www tapi state-nya "Belum ada batch aktif — daftar antrian".

### 3.3 Update `applications`
Tambah:
```
applications.job_order_id UUID NULL FK → job_orders
```
- Nullable karena legacy applications (talent-pool flow) bisa apply ke `position` tanpa job_order (jadi waitlist)
- Kalau apply ke `job_order` aktif → `job_orders.slot_filled` increment

### 3.4 Tabel `position_form_fields` (BARU — admin-defined custom fields)
Selain global credentials di `candidates.profile_data`, tiap position bisa punya custom field di form aplikasi.
```
position_form_fields:
  - id UUID (PK)
  - position_slug (FK)
  - field_key text             -- e.g. "experience_years_nurse"
  - field_label text           -- "Pengalaman sebagai perawat (tahun)"
  - field_type enum            -- 'select' | 'radio' | 'number' | 'text' | 'file'
  - options JSONB              -- untuk select/radio
  - required boolean
  - tier_weight int            -- 0 = info only, >0 = kontribusi ke tier score
  - sort_order int
```
**Custom field jawaban disimpan di `applications.answers JSONB`** (sudah ada).

### 3.5 Tabel `application_tiers` (BARU — admin scoring)
Per applicant per job_order, admin assign tier. Bisa auto-suggest dari custom field weights, tapi final = manual admin.
```
application_tiers:
  - application_id (PK, FK)
  - tier_label enum            -- 'A' | 'B' | 'C' | 'D' | 'rejected'
  - tier_score int             -- 0–100, auto-computed dari position_form_fields tier_weight
  - tier_notes text
  - assigned_by, assigned_at
```

### 3.6 Tabel `candidate_documents` (sudah ada di schema, surface-kan di UI)
Schema sudah ada. Pakai ini.
```
candidate_documents:
  - id, candidate_id
  - doc_type enum: 'ktp' | 'passport' | 'cv' | 'photo' | 'certificate' | 'medical' | 'other'
  - file_path text             -- Supabase Storage path
  - mime_type, size_bytes
  - verified boolean
  - verified_by, verified_at
  - rejected_reason text
```
**Storage:** Supabase Storage bucket `candidate-documents`, RLS:
- INSERT: candidate dirinya sendiri
- SELECT: candidate dirinya sendiri + admin
- DELETE: candidate dirinya sendiri (kalau belum verified) + admin
**Limits:** max 5MB per file, types whitelist (jpg/png/pdf/heic). Compress image client-side.

### 3.7 Tabel `application_status_history` (BARU — audit log + user-visible timeline)
Setiap stage change tercatat.
```
application_status_history:
  - id, application_id
  - from_stage, to_stage
  - changed_by (admin user_id)
  - changed_at
  - note text                  -- optional, ditampilkan ke user
  - public_label text          -- copy yang user lihat (mapped dari to_stage)
```

### 3.8 User-visible pipeline stages (4 stages only)
Internal pipeline ada 13 stage. Yang dimapping ke user view cuma:
| Internal stage | User-visible label |
|---|---|
| `applied`, `screening`, `reviewing`, `pending_documents` | **Sedang diseleksi** |
| `interview_scheduled`, `interview_done`, `medical`, `documentation` | **Wawancara & dokumen** |
| `offer_sent`, `accepted`, `placed` | **Diterima** |
| `rejected`, `withdrawn`, `inactive` | **Tidak lolos** |

User di `/applications/[id]` cuma lihat 4 stage label di atas. Admin tetep lihat 13 detail stage.

---

## 4. Pages spec (www)

### 4.1 `/` (homepage)
**Purpose:** funnel utama — pengunjung baru paham (1) ini siapa, (2) ada lowongan apa, (3) cara daftar.

**Sections (urutan dari atas):**
1. **Hero** — tagline (e.g. "Kerja luar negeri yang sah & terjamin"), 1 sub-headline, 2 CTA: [Lihat Lowongan] [Daftar di Talent Hub]
2. **Lowongan aktif** — grid cards posisi yang status job_order = `open`. Per card: poster/foto, role, negara, gaji, slot info kalau ada, CTA "Lihat detail". **Pull dari DB, bukan hardcoded.**
3. **Cara kerja Talent Hub** — 4-step explainer (Daftar → Lengkapi profil → Apply → Berangkat). Tone: simpel, gak teknis.
4. **Tentang DTG (singkat)** — 1 paragraf + key proof (lisensi P3MI, sejak 1998, dll), CTA "Pelajari lebih lanjut" → `/tentang`
5. **FAQ singkat** — 5 Q&A paling penting, CTA "Lihat semua FAQ" → `/faq`
6. **Footer** — kontak (email only, no WhatsApp), alamat kantor, copyright, link legal

**Wireframe (mobile-first):**
```
┌─────────────────────────────────┐
│ [logo]  [☰ menu]   [Daftar]    │
├─────────────────────────────────┤
│   HERO                          │
│   "Kerja luar negeri            │
│    yang sah & terjamin."        │
│   1 baris sub                   │
│   [Lihat Lowongan][Buka Talent] │
│   [foto kandidat berseragam]    │
├─────────────────────────────────┤
│   LOWONGAN AKTIF                │
│   ┌─────┐ ┌─────┐               │
│   │card │ │card │  ...          │
│   └─────┘ └─────┘               │
│   [Lihat semua lowongan →]      │
├─────────────────────────────────┤
│   CARA KERJA                    │
│   1. Daftar  2. Profil          │
│   3. Apply   4. Berangkat       │
├─────────────────────────────────┤
│   TENTANG DTG (singkat)         │
│   [Pelajari lebih lanjut →]     │
├─────────────────────────────────┤
│   FAQ                           │
│   [chevron] Pertanyaan 1        │
│   [chevron] Pertanyaan 2        │
│   ...                           │
├─────────────────────────────────┤
│   FOOTER (email contact)        │
└─────────────────────────────────┘
```

### 4.2 `/lowongan` (NEW — index page)
**Purpose:** daftar semua posisi (catalog 13 posisi), dgn marker mana yang lagi `open` job order.

**Layout:**
- Filter chips di atas: [Semua] [Saudi Arabia] [Jepang] [Taiwan] [Indonesia]
- Grid cards. Per card:
  - Foto/ikon role
  - Nama posisi + negara
  - 2-3 highlight (gaji, gender/usia, requirement utama)
  - Status badge: 🟢 "Lagi buka" (ada job_order open) | ⚪ "Daftar antrian" (catalog only)
  - CTA: [Lihat detail]

**Wireframe:**
```
┌─────────────────────────────────┐
│ Lowongan Kerja                  │
│ 13 posisi tersedia              │
├─────────────────────────────────┤
│ [Semua][Saudi][Jepang][TW][ID]  │
├─────────────────────────────────┤
│ ┌─────────┐ ┌─────────┐         │
│ │[foto]   │ │[foto]   │         │
│ │Perawat  │ │Barista  │         │
│ │S.Arabia │ │S.Arabia │         │
│ │SAR 3200 │ │SAR 1500 │         │
│ │🟢 Buka  │ │⚪ Antri │         │
│ │[Detail] │ │[Detail] │         │
│ └─────────┘ └─────────┘         │
│ ...                             │
└─────────────────────────────────┘
```

### 4.3 `/lowongan/[slug]` (existing, rework copy)
**Purpose:** detail satu posisi — kandidat paham requirements, benefit, biaya, cara apply.

**Sections:**
1. **Hero** — Foto kandidat berseragam (kalau ada) + headline `[Posisi], [Negara]` (negara general, bukan kota spesifik kalau memang multi-kota)
2. **Status & batch info** — kalau ada job_order open: "Batch [intake_label] — [slot_filled]/[slot_count] terisi, deadline [tgl]". Kalau gak ada: "Belum ada batch aktif. Daftar antrian — kami hubungi via email saat batch dibuka."
3. **Detail posisi** — tabel: lokasi, jam kerja, hari libur, kontrak, masa percobaan
4. **Benefit** — gaji pokok, makan, akomodasi, asuransi, transportasi (yang VALID — jangan klaim listrik/air gratis kalau gak pasti)
5. **Kualifikasi** — gender, usia, pendidikan, sertifikasi bahasa, keahlian, pengalaman
6. **Biaya keberangkatan** — angka + breakdown (MCU, Apostille, dll). Disclaimer: "Biaya ini muncul **setelah** kandidat menerima offering letter dari employer."
7. **Proses (5 step)** — Daftar → Seleksi → Wawancara → Dokumen → Berangkat. Generic, jangan klaim training bahasa kalau memang tidak ada.
8. **CTA Apply** — sticky di mobile: [Lamar posisi ini]. Klik → kalau belum login: form bio singkat → magic link. Kalau sudah login: langsung ke `/applications/new?position=X` di app.

**Wireframe:**
```
┌─────────────────────────────────┐
│ [foto kandidat berseragam]      │
│ Perawat, Saudi Arabia.          │
│ Rumah sakit di Saudi Arabia.    │
│ Kontrak 2 tahun.                │
├─────────────────────────────────┤
│ 🟢 Batch Juni 2026              │
│ 0/12 terisi · Deadline 30 Jun   │
├─────────────────────────────────┤
│ DETAIL POSISI                   │
│ Lokasi:        Saudi Arabia     │
│ Jam kerja:     8 jam, 6 hari/mg │
│ Kontrak:       2 tahun          │
│ Masa percobaan:90 hari          │
├─────────────────────────────────┤
│ BENEFIT                         │
│ Gaji        SAR 3.200/bulan     │
│ Makan       SAR 200/bulan       │
│ Asuransi    Disediakan          │
│ Akomodasi   Disediakan          │
│ Transportasi Disediakan         │
├─────────────────────────────────┤
│ KUALIFIKASI                     │
│ Wanita, 21–38 tahun             │
│ D3 Keperawatan                  │
│ STR aktif                       │
│ Min 1 thn pengalaman            │
│ English B1+                     │
├─────────────────────────────────┤
│ BIAYA KEBERANGKATAN             │
│ Rp 20.000.000                   │
│ (MCU GAMCA, Apostille, QVP,     │
│  Enjaz, Psikotes, Dataflow,     │
│  Mumaris)                       │
│ ⓘ Biaya muncul setelah kamu     │
│   terima offering letter dari   │
│   employer.                     │
├─────────────────────────────────┤
│ PROSES                          │
│ 1.Daftar 2.Seleksi 3.Wawancara  │
│ 4.Dokumen 5.Berangkat           │
│                                 │
│ ±4 bulan dari daftar → terbang  │
├─────────────────────────────────┤
│ [STICKY CTA: Lamar posisi ini]  │
└─────────────────────────────────┘
```

### 4.4 `/program/global-talent-hub` → `/talent-hub` (rename, rework)
**Purpose:** menjelaskan apa itu Talent Hub (= aplikasi Perantau Global), CTA daftar/buka app.

**Sections:**
1. Hero: "Talent Hub — pintu kerja luar negeri kamu"
2. Apa yang bisa kamu lakukan di Talent Hub:
   - Apply lowongan luar negeri (Saudi, Jepang, Taiwan, Indonesia)
   - Lengkapi profil sekali, apply ke banyak posisi
   - Pantau status aplikasi real-time
   - **(Coming soon)** Training gratis untuk sertifikasi Global Talent Ready
3. Cara mulai (3 step): Daftar → Lengkapi profil → Apply
4. CTA: [Buka Talent Hub] → `app.perantauglobal.com`

### 4.5 `/lowongan/spg-indonesia` (BARU — SPG sebagai lowongan)
- Sama struktur dgn lowongan lain, cuma penempatan = "Indonesia"
- Field tambahan kalau perlu: kota target (Jakarta, Surabaya, dll)

### 4.6 Pages yg DIPERTAHANKAN (no major change, hanya copy fix)
- `/tentang` — tentang DTG
- `/tim` — tim DTG
- `/layanan` — layanan DTG (tetep MDX-based)
- `/proses` — proses penempatan transparan
- `/cerita-sukses` — testimonial WAJIB hapus yg palsu, ganti placeholder atau sembunyikan section sampai ada yg real
- `/faq` — fix copy (no training bhs gratis claim, no WA mention, etc.)
- `/kontak` — email only, no WA

### 4.7 Pages yg DIHAPUS
- `/destinasi` (semua) — info pindah ke lowongan
- `/blog` (semua) — gak ada strategi konten sekarang
- `/program/spg` → redirect ke `/lowongan/spg-indonesia`
- `/program/global-talent-hub` → redirect ke `/talent-hub`

---

## 5. Pages spec (apps/platform — candidate portal)

### 5.1 `/dashboard` (rework)
**Purpose:** home setelah login. User lihat: sapaan, status profil, applications-nya, rekomendasi.

**Sections:**
1. Sapaan + status profil (banner "Lengkapi profil" kalau belum lengkap)
2. **Lamaran kamu** — list applications dgn 4-stage badge (Sedang diseleksi / Wawancara & dokumen / Diterima / Tidak lolos), CTA "Lihat detail"
3. **Rekomendasi posisi** — top 3 yg cocok (hard_pass = true, belum di-apply), CTA "Lihat semua di Jelajah"
4. Bottom nav: Home / Profil / Jelajah

**Wireframe:**
```
┌─────────────────────────────────┐
│ Halo, Budi 👋  [logout]         │
├─────────────────────────────────┤
│ ⚠ Profil kamu 60% lengkap.      │
│ [Lengkapi profil →]             │
├─────────────────────────────────┤
│ LAMARAN KAMU (2)                │
│ ┌───────────────────────────┐   │
│ │ Perawat, Saudi Arabia     │   │
│ │ 🟡 Sedang diseleksi       │   │
│ │ Apply 12 Apr · [Detail →] │   │
│ └───────────────────────────┘   │
│ ┌───────────────────────────┐   │
│ │ Caregiver Taiwan          │   │
│ │ ✅ Diterima               │   │
│ │ Apply 28 Mar · [Detail →] │   │
│ └───────────────────────────┘   │
├─────────────────────────────────┤
│ POSISI LAIN YANG COCOK          │
│ [card] [card] [card]            │
│ [Lihat semua →]                 │
├─────────────────────────────────┤
│ [🏠 Home] [👤 Profil] [🔍 Jelajah]│
└─────────────────────────────────┘
```

### 5.2 `/profile` (rework — contextual approach)
**Perubahan utama:** tidak lagi "10 field semua sekaligus". Approach baru:
- Page ini = ringkasan profil + edit per kategori
- User bisa edit kapan aja, tapi pengisian utama happens **saat apply ke job** (lihat 5.4)

**Sections:**
1. **Foto profil + nama + bio** (nama, kota, tanggal lahir, gender, pendidikan)
2. **Dokumen kamu** — preview KTP, passport, foto, CV. Tiap doc punya status: ❌ Belum upload / 🟡 Menunggu verifikasi / ✅ Terverifikasi / ⚠ Ditolak (alasan)
3. **Kualifikasi & sertifikasi** — list credential yang udah diisi (JLPT, English, STR, SIM, dll). Edit per item.
4. **Pengalaman kerja** (BARU — free text + tahun)

**Wireframe:**
```
┌─────────────────────────────────┐
│ Profil Kamu                     │
├─────────────────────────────────┤
│ [foto]  Budi Santoso            │
│         Jakarta · 25 thn        │
│         [Edit bio →]            │
├─────────────────────────────────┤
│ DOKUMEN                         │
│ ✅ KTP            [Lihat]       │
│ 🟡 Passport (verif)             │
│ ❌ Foto formal    [Upload]      │
│ ❌ CV             [Upload]      │
├─────────────────────────────────┤
│ KUALIFIKASI                     │
│ Bahasa Inggris: B1 [Edit]       │
│ JLPT: belum diisi  [Tambah]     │
│ STR: aktif         [Edit]       │
│ ...                             │
├─────────────────────────────────┤
│ PENGALAMAN KERJA                │
│ • Perawat di RS Hermina         │
│   2022–2024 (2 thn)  [Edit]     │
│ [+ Tambah pengalaman]           │
└─────────────────────────────────┘
```

### 5.3 `/explore` (rework — clearer ranking + job_order awareness)
**Perubahan:**
- Tab: [Lowongan aktif] (default — punya job_order open) | [Semua posisi] (catalog antrian)
- Sort: by readiness desc by default
- Per card show: posisi+negara, batch info kalau ada, % readiness, hard-pass status, CTA Apply

**Wireframe:**
```
┌─────────────────────────────────┐
│ Jelajah Lowongan                │
│ [Lowongan aktif|Semua posisi]   │
├─────────────────────────────────┤
│ ┌───────────────────────────┐   │
│ │ Perawat, Saudi Arabia     │   │
│ │ Batch Juni 2026 · 0/12    │   │
│ │ ✅ 90% cocok              │   │
│ │ ✓ Syarat wajib OK         │   │
│ │ [Lamar posisi ini]        │   │
│ └───────────────────────────┘   │
│ ┌───────────────────────────┐   │
│ │ Barista, Saudi Arabia     │   │
│ │ ⚪ Daftar antrian         │   │
│ │ ⚠ 40% — perlu English     │   │
│ │ [Lengkapi profil →]       │   │
│ └───────────────────────────┘   │
└─────────────────────────────────┘
```

### 5.4 `/applications/new?position={slug}` (BARU — contextual application flow)
**Purpose:** alur khusus saat user click "Lamar" — tampilkan **hanya** field yang dibutuhkan untuk posisi itu, jelas konteksnya.

**Flow:**
1. **Step 1 — Konfirmasi posisi:** "Kamu mau lamar **Perawat, Saudi Arabia** di **Batch Juni 2026**? Yuk lengkapi data berikut."
2. **Step 2 — Cek requirement:** tampilkan list requirement posisi + status user. Kalau ada hard requirement yang belum lengkap → **highlight + form inline** untuk isi sekarang. Misalnya:
   - ✅ Pendidikan D3 Keperawatan (sudah)
   - ✅ STR aktif (sudah)
   - ❌ **Pengalaman kerja perawat (min 1 tahun)** — [pilih: <1 thn, 1–3 thn, 3+ thn]
   - ❌ **Sertifikat bahasa Inggris** — [pilih level + upload sertifikat (opsional)]
3. **Step 3 — Dokumen wajib:** posisi ini butuh: KTP, Passport, Foto, CV. Status user: KTP ✅, Passport ❌. Inline upload kalau belum.
4. **Step 4 — Pertanyaan tambahan (kalau ada custom field di `position_form_fields`):** misalnya "Pernah training kopi di mana?", "Punya SIM B?", dll.
5. **Step 5 — Konfirmasi & submit** — preview semua, [Kirim lamaran].

**Key UX principle (untuk low-skilled worker):**
- 1 step 1 fokus, jangan tampilkan 4 hal sekaligus
- Tiap field dijelaskan **kenapa** dia harus diisi: "Kami butuh sertifikat bahasa Inggris karena Saudi Arabia mensyaratkan ini untuk visa kerja"
- Bahasa simpel, no jargon. "STR" → "Surat Tanda Registrasi (kartu putih dari MTKI)"
- Skip-able kalau soft requirement: "Lewati dulu, kembali nanti"
- Progress bar di atas: 2/5 langkah

**Wireframe (Step 2 example):**
```
┌─────────────────────────────────┐
│ ← Lamar Perawat S.Arabia (2/5)  │
│ ▓▓▓░░░░░░░ progress bar         │
├─────────────────────────────────┤
│ Cek requirement:                │
│                                 │
│ ✅ D3 Keperawatan               │
│ ✅ STR aktif                    │
│                                 │
│ ❌ Pengalaman kerja perawat     │
│    (min 1 tahun)                │
│    Berapa lama kamu udah jadi   │
│    perawat?                     │
│    ◯ Belum pernah               │
│    ◯ <1 tahun                   │
│    ◉ 1–3 tahun                  │
│    ◯ 3+ tahun                   │
│                                 │
│ ❌ Sertifikat bahasa Inggris    │
│    Saudi mensyaratkan ini untuk │
│    visa kerja.                  │
│    Level kamu?                  │
│    ◯ Pemula  ◉ B1  ◯ B2+        │
│                                 │
│ [Lanjut →]                      │
└─────────────────────────────────┘
```

### 5.5 `/applications/[id]` (rework — timeline + 4-stage)
**Sections:**
1. Header: posisi + negara + batch
2. **Status sekarang** — 1 dari 4 label (Sedang diseleksi / Wawancara & dokumen / Diterima / Tidak lolos), warna sesuai
3. **Timeline** — list event dari `application_status_history` user-visible:
   - 12 Apr 2026 — Lamaran diterima
   - 14 Apr 2026 — Sedang diseleksi
   - 18 Apr 2026 — Lolos seleksi awal
   - 20 Apr 2026 — Wawancara dijadwalkan: 25 Apr jam 10:00 (note dari admin)
4. **Detail lamaran kamu** — answers + dokumen yang udah dikirim (read-only)
5. **Catatan dari rekruter** (kalau ada) — admin bisa tulis catatan public yang user lihat
6. (No withdraw button — sesuai input Panji)

**Wireframe:**
```
┌─────────────────────────────────┐
│ ← Perawat, Saudi Arabia         │
│ Batch Juni 2026                 │
├─────────────────────────────────┤
│ Status saat ini                 │
│ 🟡 Sedang diseleksi             │
│                                 │
│ Tim kami lagi review profil     │
│ kamu. Biasanya 3–5 hari.        │
├─────────────────────────────────┤
│ TIMELINE                        │
│ ● 12 Apr · Lamaran diterima     │
│ ● 14 Apr · Sedang diseleksi     │
│ ● 18 Apr · Lolos seleksi awal   │
│   "Profil kamu sudah review,    │
│    kami hubungi untuk wawancara"│
│ ○ Wawancara                     │
│ ○ Diterima                      │
├─────────────────────────────────┤
│ DETAIL LAMARAN KAMU             │
│ Pengalaman: 1–3 tahun           │
│ English: B1                     │
│ ...                             │
└─────────────────────────────────┘
```

### 5.6 `/auth/sign-in` (existing, no change)

### 5.7 BARU — Notification (Phase E.5)
- Bell icon di header, badge counter
- Dropdown / page list:
  - Status update (Lamaran X dipindah ke Wawancara)
  - Recruiter note (Rekruter kirim catatan ke lamaran X)
  - System (KTP kamu sudah diverifikasi)
- Mark as read, link ke source

---

## 6. Pages spec (apps/platform — admin CRM)

### 6.1 `/admin` (overview — rework)
- Stats: kandidat aktif, applications, pending verifications, dokumen pending review
- Recent activity feed (last 20 events: stage change, doc upload, new candidate)
- Quick actions: [+ Job order baru] [+ Posisi baru] [Lihat inbox]

### 6.2 `/admin/positions` (BARU — CRUD posisi)
- List 13 posisi
- Per row: slug, name, country, active toggle, # job_orders, # applications
- Click → edit page: bio, requirements (JSON editor with helper UI), custom form fields (lihat 6.6)

### 6.3 `/admin/job-orders` (BARU — CRUD job order)
- List job orders + filter status (open/closed/filled/cancelled)
- Per row: position, employer, intake, slot_filled/slot_count, deadline, status
- Click → edit + lihat applicants

**Create new job order:**
```
- Pilih position dari dropdown (dari catalog)
- Employer name (text — boleh general "RS di Saudi Arabia")
- Employer city (optional)
- Intake label (text — "Batch Juni 2026")
- Slot count (number)
- Deadline (date, optional)
- Public description (textarea — override summary default position kalau perlu)
- Status default: 'open'
- [Simpan & publish] / [Simpan draft]
```

**Job order detail page:**
- Info job order
- Tab: [Applicants] [Pipeline (Kanban)] [Settings]
- Applicants tab: list semua applications ke job_order ini, filter by stage/tier
- Pipeline tab: kanban view, drag-drop antar 13 stage
- Action: [Tutup job order] (ubah status → closed/filled, broadcast email "Maaf, batch sudah penuh" ke applicants yang masih di pipeline awal)

### 6.4 `/admin/candidates` & `/admin/candidates/[id]` (rework)
- List sudah ada. Tambah filter: by tier, by document verified status, by readiness %
- Detail page tambahan:
  - **Documents tab**: list dokumen + verify/reject button + reason input
  - **Tier history**: kalau pernah di-tier ke jobs apa aja
  - **Activity log**: semua event terkait candidate (apply, doc upload, profile update, stage change)

### 6.5 `/admin/applications` (rework)
- Sudah ada. Tambah:
  - Filter by job_order
  - Filter by tier (A/B/C/D/rejected)
  - Filter by custom field values (e.g., "Pengalaman kopi: barista pro")
  - Bulk action: [Pindah stage] [Assign tier] [Export CSV]
- Per application card: tier badge + custom field summary

### 6.6 `/admin/positions/[slug]/form-fields` (BARU)
- CRUD untuk custom form field per posisi
- Drag-sort
- Per field: label, type, options, required, tier_weight
- Preview form sisi user

### 6.7 `/admin/inbox` (BARU — contact submissions)
- List `contact_submissions`
- Per item: name, email, subject, message, created_at, status (new/in_progress/done)
- Click → detail + action: [Mark as read] [Assign to me] [Mark done]

### 6.8 `/admin/team` (BARU — admin user management)
- List `admin_users`
- [+ Invite admin] — input email, role (admin/super_admin)
- Invitee dapet magic link → otomatis admin role
- Per row: email, last login, role, [Remove] (super_admin only)

### 6.9 `/admin/analytics` (BARU — reports)
**Funnel chart:** Form submit → Magic link clicked → Profile completed → Applied → Tier assigned → Placed
**Per source:** UTM source breakdown
**Per job order:** applicants, hard-pass %, tier distribution, time-in-stage avg
**Time range filter:** 7d / 30d / 90d / custom

---

## 7. Copy guidelines (DO / DON'T)

### Biaya
- ✅ "Bebas biaya **sebelum** kamu menerima offering letter dari employer"
- ✅ "Biaya keberangkatan: Rp X juta — muncul setelah kamu diterima"
- ❌ "Tanpa biaya kandidat" / "Rp 0" / "Semua biaya ditanggung employer"

### Training
- ✅ (gak usah disebut sama sekali kalau gak ada)
- ✅ (untuk GTH coming soon: "Training gratis untuk sertifikasi Global Talent Ready — sedang kami siapkan")
- ❌ "Pelatihan bahasa Inggris/Arab gratis"
- ❌ "Training apapun" yang faktanya belum ada

### Lokasi
- ✅ "Saudi Arabia" (kalau penempatan multi-kota / belum confirmed)
- ✅ "Riyadh & Madinah" (kalau confirmed dua kota tsb)
- ❌ "Riyadh" doang kalau ternyata bisa ke Madinah/Jeddah/dll

### Salary timing
- ✅ "Diterima setiap bulan"
- ❌ "Dibayar tanggal 27" (kecuali confirmed dari employer)

### Bonus & insentif
- ✅ Sebut hanya yang valid (e.g., spa therapist 2% invoice = valid)
- ❌ Klaim listrik/air gratis kalau cuma "kemungkinan"
- ❌ Jumlah bonus kalau belum confirmed

### Slot & deadline
- ✅ Tampilkan kalau ada job_order aktif dgn data real
- ❌ Slot ngarang (12/24 padahal belum ada applicant)
- ❌ Deadline palsu

### Testimonial
- ✅ Real testimonial dgn izin tertulis
- ❌ "R. Setiawan" dan testimonial palsu lainnya

### Response time
- ✅ "Kami balas dalam X jam kerja" (kalau ada SLA tim)
- ✅ Atau jangan disebut sama sekali
- ❌ "Balasan WA rata-rata 11 menit" (klaim agresif tanpa data)

### WhatsApp
- ❌ **Jangan disebut sama sekali** di www
- ❌ "Hubungi kami via WhatsApp" → ganti "Hubungi kami via email"
- ❌ Icon WA di footer/header
- (WA tetep dipakai internal oleh recruiter untuk reach out, tapi gak di-expose ke user via website)

---

## 8. Visual / design direction

**Source:** feedback Mas Martin (theme lama lebih disukai), input Panji (target = middle-low PMI).

### Theme
- **Revert ke red-dominant** (warna DTG identik merah)
- Tema sekarang (dominan putih + hitam) terlalu editorial / fancy
- Hitam tetap dipakai sbg accent + body text, bukan dominan background

### Tone
- **Outsider-friendly**: anggap pembaca first-time visitor PMI usia 25-40, lulusan SMA/SMK/D3, mungkin tinggal di kampung
- **Straightforward**: judul = info, bukan poetry. "Perawat, Saudi Arabia" not "Menuju jalan terang di tanah suci"
- **Easy to read**: font size body min 16px di mobile, line-height 1.5+, paragraph pendek
- **Ringan di HP**: image lazy load + compress, no heavy animations, no autoplay video

### Anti-pattern (yg harus dihindari)
- ❌ AI slop look: gradien aneh, glassmorphism overkill, neon
- ❌ Editorial / magazine-style typography (huge serif headlines, italic emphasis tiap paragraf)
- ❌ Stock photo bule yg gak relevan
- ❌ Microcopy yg terlalu witty / pop culture reference

### Yes patterns
- ✅ Warna merah DTG sbg primary, putih sbg base, hitam sbg text
- ✅ Foto kandidat / orang Indonesia berseragam kerja (perawat, barista, dll) — autentik, bukan model bule
- ✅ Sans-serif friendly (Inter/IBM Plex Sans/Plus Jakarta Sans)
- ✅ Card-based layout, jelas mana yg clickable
- ✅ Big tap targets (min 44px), spacing generous di mobile
- ✅ Iconography sederhana (Lucide / Phosphor)

### Design deliverable yg dibutuhkan dari Claude Design
1. **Color palette + typography** revised (red-dominant)
2. **Component library**: button, card, input, badge, modal, nav, footer, toast
3. **Wireframe → high-fi** untuk semua page yg disebut di §4 + §5 + §6
4. **Mobile-first**, lalu desktop variant
5. **Empty state, loading state, error state** untuk tiap interactive page
6. **Iconography set** untuk position categories, status badge, doc types

---

## 9. Out of scope (Phase 2+)

- In-app messaging candidate ↔ recruiter (WA personal dipake internal)
- WhatsApp integration (Meta Cloud API setelah business verification)
- Withdraw application
- Account settings polish (password reset, email change, account deletion)
- Wishlist / saved positions
- Newsletter
- Blog CMS (Panji handle manual via Claude Code)
- BP2MI SISKOP2MI integration
- Native mobile app (PWA dulu)
- Real-time notifications (push) — current = polling/badge

---

## 10. Implementation roadmap (post-design)

### Sprint 1 — Data model + content fix (1 minggu)
- Migration: `job_orders`, `position_form_fields`, `application_tiers`, `application_status_history` tables
- Seed ulang positions (13, dgn requirement valid dari PDF)
- Hapus dental nurse dari catalog
- Fix copy semua lowongan page (no training claim, no fake testimonial, no fake slot, no WA mention)

### Sprint 2 — www rework (1 minggu)
- Hapus `/destinasi`, `/blog`
- Bikin `/lowongan` index
- Rework `/lowongan/[slug]` dgn data dari DB (pull job_order kalau ada)
- Rework `/talent-hub` (rename dari `/program/global-talent-hub`)
- Pindahin SPG ke `/lowongan/spg-indonesia`
- Theme revert (red dominant)

### Sprint 3 — Candidate portal rework (1 minggu)
- Document upload (Supabase Storage + UI)
- Contextual application flow `/applications/new?position=X`
- Application timeline (4-stage user-visible)
- Profile rework (per-kategori, bukan all-at-once)

### Sprint 4 — Admin CRM core (1.5 minggu)
- `/admin/job-orders` CRUD + applicants view + kanban
- `/admin/positions` CRUD + custom form fields editor
- Document review queue
- Tier assignment UI
- Inbox (contact submissions)

### Sprint 5 — Admin extras (0.5 minggu)
- Team management
- Analytics dashboard
- Bulk actions + CSV export
- Activity log

### Sprint 6 — Polish + launch (0.5 minggu)
- Notifications (in-app bell)
- E2E test all flows
- Deploy + monitor

**Total estimate:** ~5.5 minggu (sebelum design rework). Design rework bisa parallel dgn Sprint 1.

---

## 11. Open questions (perlu confirm sebelum implement)

1. **Position page foto** — Mas Martin saran "attach foto kandidat berseragam". Foto-foto ini lo punya di asset library? Atau perlu sourcing baru / generate via fal-ai?
2. **Talent Hub URL** — `/talent-hub` atau tetep `/program/global-talent-hub`? Gue propose `/talent-hub` (lebih clean).
3. **Job order public detail** — kalau confidential employer (e.g., "RS di Saudi Arabia" tanpa nama), apakah CRM punya field `internal_employer_name` separate dari `public_employer_name`?
4. **Tier system** — gue propose 5 tier (A/B/C/D/rejected). Cukup atau perlu lebih granular?
5. **Custom form field per position** — perawat butuh "STR aktif?", "pengalaman perawat berapa lama?". Ini auto-populate ke `candidates.profile_data` (jadi reusable across positions yg butuh field sama) atau cuma di `applications.answers`? Gue propose: **kalau field-nya generic (English level, JLPT) → profile_data shared. Kalau spesifik (pengalaman kopi 5 tahun) → answers per application.**
6. **Email broadcast** — saat job order ditutup, otomatis kirim email "maaf batch sudah ditutup" ke applicants? Atau manual admin trigger?
7. **GTH training feature** — disebut "coming soon" di landing. Estimasi kapan jadi real? (untuk planning roadmap Phase 2)
