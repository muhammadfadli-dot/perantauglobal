# UI/UX Cross-Surface Audit + Implementation Plan — 2026-06-12

**Scope:** Setiap fitur/komponen UI/UX yang dirasakan user di portal kandidat (`app.perantauglobal.com`), di-cross-check terhadap kapabilitas di web publik (`perantauglobal.com`) dan admin CRM. Fokus: parity lintas-surface, polish, detail kecil yang kelewat, dan vulnerability.

**Metode:** Workflow multi-agent (32 agent, ~3M token) — 4 research strand (best-practice synthesis) + 7 auditor evidence-based (code + curl prod + SQL production) → tiap temuan critical/high di-verifikasi adversarial (di-refute dulu sebelum diterima) → 1 synthesizer dedupe + tema + sequencing.

**Hasil:** **63 temuan, semua lolos verifikasi (0 refuted).** Severity: 1 Critical · 10 High · 32 Medium · 16 Low. Disusun jadi **10 batch** dengan mode eksekusi eksplisit.

> Ini lanjutan dari `AUDIT-2026-06-10.md` (round 1, hanya 3/8 auditor selesai). Dua temuan prior yang sudah dikonfirmasi **masih open** hari ini: `country=europe` unmapped + foto portal 404. Round ini lebih dalam di UX-component polish & cross-surface parity yang round lalu under-cover.

---

## 0. Akar masalah (7 global recommendation)

Ini fix struktural yang menutup banyak temuan sekaligus. Plan per-batch di bawah mengeksekusi ini.

1. **Satu sumber kebenaran country mapping** di `packages/db` (key, db-value, label "Eropa Timur", flag, tint, city). Bug europe berulang karena portal menduplikasi tabel ini di 4+ file, admin di 3+ file, semua drift dari `web/lib/lowonganCountries.ts` yang sudah tersentralisasi. → menutup 6 temuan europe/country.
2. **Satu strategi asset:** public Supabase Storage bucket `position-media`, URL absolut disimpan di `positions.content.media.heroUrl`, dikonsumsi DUA app via `next/image` + `images.remotePatterns`. PG sudah 90% wired (field `heroUrl` ada, web prefer-nya, CSP whitelist `*.supabase.co`) tapi `heroUrl` null di 21/21 posisi aktif. **Tolak** build-time copy / symlink / web→portal rewrite sebagai fix utama. → menutup cluster foto 404.
3. **Baseline route-state boundary** di kedua app: `loading.tsx` (skeleton), `error.tsx` (Client Component, copy Indonesia, tombol coba-lagi + escape WhatsApp, jangan stack trace), `not-found.tsx`. **Nol** yang eksis sekarang → tiap hiccup Supabase = halaman error Next default yang nggak di-style. Jadikan "renders content/loading/empty/error/disabled" sebagai definition-of-done tiap komponen data-driven.
4. **Aggregate RPC / windowed query** ganti full-table scan in-memory di admin (standing pattern). 5 halaman admin + 1 list kandidat fetch ratusan-ribuan row buat render puluhan; di apps=973 / candidates=908 / pending_subs=1078 ini hitungan minggu dari silent-undercount KPI & drop dokumen dari antrian.
5. **ApplicationFieldForm di `/lengkapi` = template form aksesibel kanonik**, propagasikan ke 2 surface apply yang lebih ramai & lebih lemah (web `ApplyForm`, platform `ApplyWizard`). Pair dengan CI guard (tolak sr-only input tanpa focus style; tolak `#hex` baru di `components/pg`; diff signature primitive antar 2 app).
6. **`active` jadi state yang dijaga, ter-screening, dual-deploy.** Default `createPosition` → `active=false`; gate `active=true` pada `published_at` set + content non-kosong + ≥1 field syarat_utama; saat toggle panggil `notifyWebRevalidate(slug)`; tambah "deploy hero ke DUA app" di checklist add-position.
7. **Screening logic = data ter-audit & berdampak ke kandidat:** rutekan setiap create/update/delete/reorder `position_application_field` + perubahan opsi qualifying lewat audit log; warning destruktif sebelum type-switch nge-null qualifying flag.

---

## 1. Decisions yang butuh keputusan Panji (sebelum / saat batch terkait)

| # | Decision | Konteks | Rekomendasi |
|---|----------|---------|-------------|
| D1 | **machine-operator** (active, unpublished, content kosong, 0 field, **5 pelamar** auto-100%-ready) | Reconcile sekarang | **Deactivate** dulu (cepat, stop kebocoran) + triage 5 lamaran manual. Atau publish+seed fields kalau posisi ini memang mau dijual. |
| D2 | **Asset strategy** foto portal | Bucket Supabase `position-media` vs alternatif | **Public Supabase Storage bucket** (sudah 90% wired) — rekomendasi kuat. |
| D3 | **Portal position-detail** (B10) | Build screen detail read-only di portal (reuse `positionContent` via `packages/db`) **vs** link ke web `/lowongan/[slug]` | **Build minimal**: surface benefits + fee + jobDescription + salary di ApplyWizard Step 1 dulu; full detail page menyusul. (link-ke-web bikin user keluar dari app — kurang ideal.) |
| D4 | **Primitives** (B7) | Reconcile 2 `primitives.tsx` in-place + CI parity check **vs** extract `packages/ui` | **Reconcile in-place + parity lint** — research eksplisit menolak wholesale `packages/ui` untuk hanya ~3 primitive yang benar-benar shared. |
| D5 | **Retention/PII** (B9) | 1078 `pending_submissions` (lewat cap 1000) + junk positions + PII tak ke-purge | Perlu kebijakan retensi (purge nonce kadaluarsa). Butuh sign-off karena hapus data. |
| D6 | **Backfill salaryIdr/processDuration/city** (B10) | Sumber data dari `apps/web/lib/positionDetails.ts` (static) | Backfill via migration dari static lib — datanya sudah ada di sana. |

---

## 2. Batch plan (urutan eksekusi)

Legend mode: **parallel-workflow** = file independen, aman fan-out agent (worktree). **sequential** = sentuh file shared / ada urutan / migration. **single-pass** = satu agent satu commit.

### BATCH 1 — Funnel rails: europe mapping + screening guardrails
`sequential` · ~2–3 hari · **9 temuan** · ⚠️ di belakang LIVE Head Driller ads
> Leverage uang/trust tertinggi. 27 pelamar europe salah-label hari ini; machine-operator (5 apps) live tanpa screening tapi tampil 100% ready; edit field diam-diam ubah pass/fail tanpa jejak; type 'file' bisa matiin funnel; deactivate nggak bust cache publik. Semua sentuh country-map portal + `admin/positions/actions.ts` + `ApplicationFieldsEditor` → harus di-sequence, jangan fan-out (konflik file). Mulai: extract `COUNTRY_META`, lalu layer admin guard. Termasuk reconcile machine-operator (D1).

- 🔴→🟠 **europe-unmapped-portal-country-maps** (HIGH) — `LowonganTiles.tsx:9-43`, `JourneyHero.tsx:4-32,68`, `explore/page.tsx:98,127,151,184`, `ApplyWizard.tsx:55-60,279`, `applications/[id]/page.tsx:114-119`, `dashboard/page.tsx:35-45,226`. **Impact:** head-driller (24 apps) + assistant-driller (3 apps) active+published country=europe; 27 kandidat ads Meta nggak bisa nemu posisinya di /explore, lihat bendera 🇯🇵 + "Jepang" di hero, lihat token mentah "europe". **Fix:** satu entry europe ("Eropa Timur") + konsumsi `COUNTRY_META` shared; hapus fallback `?? 'jepang'`; copy "4 negara" jadi data-derived.
- **country-map-duplicated-4x** (LOW) — extract `COUNTRY_META` module, idealnya di `packages/db`.
- **europe-uncreatable-unlabeled-admin** (HIGH) — `PositionCreateForm.tsx:8-16`, `positions/page.tsx:29-43`, `[slug]/page.tsx:47-52`, `PositionPreview.tsx:72`. Admin lihat "europe"/"GL" mentah & nggak bisa bikin posisi Eropa baru.
- **active-no-content-guard** (HIGH) — `new/actions.ts:69`, `PositionActiveToggle.tsx:40-52`, `positions/actions.ts:43-65`. machine-operator confirmed active+unpublished+content{}+0 fields+5 pelamar auto-100%. **Fix:** default `active=false` + guard tolak active saat published_at NULL / content kosong / 0 field syarat_utama. (D1)
- **active-toggle-no-web-revalidate** (MED) — `updatePositionMeta` cuma revalidate path admin → posisi nonaktif masih tampil ~60s di web. **Fix:** `await notifyWebRevalidate(slug)` saat `patch.active !== undefined`.
- **file-type-submit-killer** (MED) — editor tawarkan type 'file' yang form apply nggak render → posisi un-submittable kalau required. **Fix:** disable type 'file' utk section syarat_utama.
- **field-crud-not-audited** (MED) — create/update/delete/reorder field bypass audit log. **Fix:** tambah ke `AUDIT_ACTIONS` + `logAdminAction`.
- **type-switch-nulls-qualifying** (MED) — ganti type field nge-null options + qualifying flag, live, tanpa warning. **Fix:** badge qualifying + confirm destruktif.
- **createposition-role-from-slug-segment** (LOW) — `role` diturunkan dari segmen slug pertama, nggak kelihatan admin.

### BATCH 2 — Web public funnel + portal asset strategy
`parallel-workflow` · ~1–2 hari · **7 temuan**
> 4 item web sentuh file independen (fan-out bersih). Cluster foto-404 = 1 pekerjaan (bucket + backfill heroUrl + helper packages/db + remotePatterns + konversi next/image) bawa migration storage → track sendiri.

- 🔴 **web-inactive-positions-live-applyable** (CRITICAL, prior 1.1 STILL OPEN) — `positions-db.ts:341-367,393-413`. Kandidat isi form lengkap utk job nonaktif → 404 saat submit. **Fix:** skip static backfill saat DB active=false; detail `notFound()` saat row inactive.
- **web-fake-testimonial-disclaimer-live** (MED) — `Testimoni.tsx:93-95`, `HomeHero.tsx:204-211`. Homepage label satu-satunya social proof sebagai "contoh palsu". **Fix:** pakai cerita real consented atau hapus; jangan ship disclaimer "ini fake".
- **web-canonical-missing-sitewide** (HIGH) — cuma homepage emit canonical; job-detail & lainnya nggak. **Fix:** rutekan metadata via `generateMeta` / `alternates.canonical`.
- **web-mobile-cta-tap-target-under-44** (LOW) — CTA + hamburger 36px (<44px). **Fix:** min-h-[44px].
- 🟠 **portal-images-404** (HIGH, prior 3.1 STILL OPEN) — `apps/platform/public/images` cuma logo; `heroUrl` null 21/21. Tiap surface foto di portal render tint flat sementara halaman publik yang baru ditinggalkan penuh foto real. **Fix:** bucket `position-media` + upload 23 foto + backfill heroUrl + `positionHeroUrl(slug)` di packages/db + remotePatterns di 2 next.config + konversi 7 `backgroundImage` ke next/image dengan fallback foto-negara (bukan tint flat).
- **portal-hero-images-404** + **portal-images-404-plain-tint-fallback** — merged ke atas (fix sekali).

### BATCH 3 — Candidate clarity + anxiety reduction
`sequential` · ~2 hari · **12 temuan**
> Cluster yang bikin portal terasa rusak/nggak terpercaya buat audiens low-literacy scam-fearful. Banyak sentuh `profile/page.tsx`, `applications/[id]/page.tsx`, `explore/page.tsx` (file overlap → sequence). Item doc-status (pending→over-red→messaging) chain berurutan konvergen ke satu kebijakan doc-status.

- **profile-pending-docs-mislabeled** (HIGH) — `profile/page.tsx:74-79,205-210,242-244`. 601/698 dokumen uploaded-pending; cuma 6 verified. Yang sudah upload + nunggu verifikasi lihat "X belum upload" → kira upload-nya gagal, re-upload, distrust. **Fix:** track missing/pending/verified; pending = "sedang dicek".
- **lengkapi-cta-counts-optional** (HIGH) — `applications/[id]/page.tsx:103-112,263-264,384`. CTA merah "Lengkapi N syarat" hitung field Bonus & nyala walau hard_pass=true. **Fix:** pisah requiredOpen vs bonusOpen.
- **over-red-document-urgency** (MED) — dokumen belum-perlu di-style merah penuh. **Fix:** merah cuma utk blocker nyata.
- **doc-required-messaging-contradictory** (MED) — pesan dokumen wajib beda di 4 surface. **Fix:** satu kebijakan + copy identik.
- **applications-list-orphan-nav** (MED) — `/applications` nggak ada path dari nav; 97 kandidat punya 2+ lamaran nggak bisa lihat semua. **Fix:** row "Semua lamaran (N)" di Beranda saat >1.
- **explore-search-dead-affordance** (MED) — search bar = div statis, nggak ada behavior. **Fix:** jadikan input real yang filter, atau hapus.
- **profile-dead-chevron-rows** (MED) — "Privasi & izin data" + "Notifikasi" punya chevron tapi mati. **Fix:** chevron cuma di dalam Link; bikin halaman privacy (PDP) atau drop.
- **berandatopbar-inert-info-button** (LOW) — tombol "Informasi" di top bar mati. **Fix:** wire ke help/PIC sheet.
- **applywizard-terms-not-linked** (MED) — "syarat & ketentuan" bold merah kayak link tapi nggak. **Fix:** link ke halaman terms web (PDP + a11y).
- **explore-jargon-chapter-copy** (LOW) — "chapter ini" → "negara ini".
- **explore-position-deeplink-ignored** (LOW) — `?position=` di-declare tapi diabaikan.
- **dashboard-paspor-card-hardcoded-jepang** (LOW) — Paspor invite hardcode "Jepang".

### BATCH 4 — Satu vocabulary pipeline (3-stage) di hero/timeline/welcome
`single-pass` · ~½ hari · **4 temuan**
> Set single-concern: definisikan satu modul stage shared, konsumsi di JourneyHero/PipelineTimeline/welcome, collapse ke model 3-stage terdokumentasi + fix hero dots off-palette sekalian.

- **stage-model-divergence-5-vs-3** (MED) — JourneyHero tampil 5-stage vs model 3-stage.
- **two-contradictory-pipeline-models** (MED) — hero vs detail timeline beda vocabulary utk 1 lamaran.
- **welcome-timeline-step-divergence** (LOW) — welcome 4-step vs detail 5-step.
- **journeyhero-off-palette-status-colors** (MED) — dots pakai cyan `#7ad7ff` + yellow `#ffd166` di luar palette. **Fix:** map ke `--pg-info`/`--pg-warn`.

### BATCH 5 — Cross-surface design coherence + missing UI states
`parallel-workflow` · ~1–1.5 hari · **4 temuan**
> File independen, fan-out aman.

- **job-card-open-chip-color-mismatch** (HIGH) — chip "Lagi buka" HIJAU di web, MERAH di portal utk posisi sama. Merah = bahaya buat audiens anti-scam. **Fix:** standardize `--pg-ok` (hijau) di LowonganTiles.
- **ok-token-value-divergence** (MED) — `--pg-ok` resolve ke hex beda (web `#0a6e3a` vs portal `#0f8a4a`); web outlier vs DESIGN.md. **Fix:** set web ke `#0f8a4a`.
- **missing-route-state-boundaries** (HIGH) — 0 loading/error/not-found di kedua app; 0 skeleton. **Fix:** group-root loading/error/not-found + promote EmptyState + Skeleton ke primitive shared.
- **sub-10px-labels-low-literacy** (MED) — status/meta label 8.5–9.5px buat audiens yang paling sulit baca. **Fix:** min 11px (ideal 12px) utk teks status/decision.

### BATCH 6 — Apply-funnel accessibility upgrade
`sequential` · ~2–3 hari · **2 temuan** (bisa jalan paralel dengan Batch 5)
> Satu program a11y koheren lintas ApplyForm (web) + ApplyWizard + DocumentUploadModal (platform). Template = `lengkapi/ApplicationFieldForm`.

- **apply-funnel-a11y-bundle** (MED) — radio/checkbox custom sembunyiin native input sr-only TANPA focus-visible (WCAG 2.4.7 fail funnel-wide); error summary-only tanpa role=alert/aria-invalid (silent ke TalkBack); upload cuma "Mengupload…" tanpa progress/pending-review state; required signaled cuma by-absence; sebagian tap target <44px; raw Supabase error string bocor ke PMI. **Fix:** adopsi pola lengkapi — focus ring, error per-field via prop `error` yang sudah ada tapi nggak dipakai + aria-invalid + role=alert + focus-move, signaling Wajib/Bonus + aria-required, state upload indeterminate + sukses in-context, map error ke Indonesia plain, target 44px.
- **document-upload-modal-no-application-id** (MED) — juga di B9 (data-integrity).

### BATCH 7 — Design-system foundation: primitive parity + radius (needs-decision)
`sequential` · ~2–3 hari + decision gate · **2 temuan**
> Arsitektural. Research eksplisit: JANGAN wholesale `packages/ui` utk ~3 primitive yang truly-shared; reconcile + parity-lint dulu. (D4)

- **divergent-primitives-two-copies** (MED) — web Button nggak ada disabled styling; platform nggak ada Chip/Field/Input/Select. **Fix:** reconcile 2 file + CI parity check diff signature.
- **border-radius-scale-drift** (LOW) — radii abaikan skala 5-step DESIGN.md di kedua app. **Fix:** ganti ad-hoc `rounded-[Npx]` ke token scale + eslint guard.

### BATCH 8 — Admin/candidate scale: pagination + aggregate RPC
`parallel-workflow` · ~2–3 hari · **7 temuan**
> Full-scan di cap 1000-row (apps=973, candidates=908, pending_subs=1078 over cap, pending_docs=601). Mayoritas page-level independen (fan-out); RPC candidate-list bawa migration → track sendiri. Invisible hari ini tapi diam-diam korup KPI admin & drop dokumen dari antrian dalam hitungan minggu.

- **analytics-raw-queries-unpaginated-at-cap** (MED) · **dashboard-inflow-no-range** (MED) · **positions-admin-full-scan-aggregation** (MED) · **documents-page-no-pagination** (MED) · **candidates-page-four-full-scans-in-memory** (MED, migration RPC) · **applications-list-n-plus-1-hardpass** (MED) · **candidate-detail-completeness-loop** (LOW).
- **Fix umum:** `fetchAllRows` helper atau `COUNT(...) FILTER` aggregate RPC (mirror `list_applications_for_admin`); list pakai `.range()` pagination.

### BATCH 9 — DB integrity, PDP, RLS performance, security hardening
`sequential` · ~1.5–2 hari · **6 temuan** · migration-heavy + 1 retention decision (D5)
> Harus sequence (1–2 migration terkoordinasi + `get_advisors` verify). RLS pair strictly ordered.

- **rls-auth-initplan-per-row** (MED) — 13 tabel hot re-evaluasi `auth.*()` per row. **Fix:** wrap di scalar subquery `(select auth.uid())`.
- **rls-multiple-permissive-policies** (LOW) — ~20 combo punya multiple permissive policy. **Fix:** consolidate admin+self jadi satu policy.
- **consents-anon-forge-cid** (MED) — anon INSERT consents dengan candidate_id arbitrary (forgery ledger PDP). **Fix:** tighten WITH CHECK; bind ke nonce flow.
- **document-upload-modal-no-application-id** (MED) — application_id 0/698; latent funnel-blocker saat ada file requirement. **Fix:** prop applicationId di modal.
- **anon-retention-bundle** (MED, needs-decision D5) — 1078 pending_submissions unpurged, junk positions, weak-pw protection off, FK tak ter-index. **Fix:** purge job + delete junk + enable leaked-password protection + rate-limit referral + FK index.
- **dead-answersform-updateanswers-hazard** (LOW) — dead code yang silently wipe jawaban /lengkapi kalau rewired. **Fix:** hapus AnswersForm/updateAnswers/applyToPosition/RedHero.

### BATCH 10 — Portal position-detail parity (content gap, needs-decision)
`sequential` · ~3–4 hari · **6 temuan** · sengaja terakhir (D3, D6)
> Gap cross-surface terbesar: portal nggak punya view detail posisi, jadi salary fallback, city, salaryIdr/processDuration, input ContentEditor, fidelity preview semua gantung di satu keputusan arsitektur. Ditaruh terakhir biar keputusan dibuat saat asset strategy (B2) + label europe/admin (B1) sudah ada.

- **portal-no-position-detail** (HIGH) — kandidat login lompat dari deskripsi 1-baris langsung ke form; nggak ada salary breakdown/jobdesc/benefit/fee/proses — konten keputusan yang justru dikasih web ke pengunjung anonim. Experience login lebih miskin dari logout. (D3)
- **salary-fallback-divergence** (MED) — portal tampil "—" utk posisi tanpa cardMeta.salary, web tampil angka.
- **city-shown-web-absent-portal** (LOW) — kota tampil di web, nggak di portal.
- **salaryidr-processduration-empty** (MED) — "≈ Rp" + durasi proses nggak pernah di-author di mana pun.
- **content-editor-missing-salaryidr-duration** (LOW) — ContentEditor nggak punya input-nya.
- **preview-raw-country-no-cardmeta-media** (LOW) — live preview misrepresent halaman kandidat.

### BATCH 0 — (closed) micro-perf
- **akademi-lesson-sequential-guards** (LOW) — sudah fixed di main; tracked closed.

---

## 3. Proposed execution loop (setelah approval)

Per batch: branch → implementasi → `pnpm lint` + `pnpm build` → verify (SQL/curl/baca diff) → commit atomik → PR. Loop sampai semua batch beres.

- **Sequential batches** (1, 3, 4, 6, 7, 9): aku kerjakan sebagai long-running focused pass (atau 1 agent sekuensial per batch) karena sentuh file shared / migration / ada urutan.
- **Parallel-workflow batches** (2, 5, 8): fan-out agent dengan worktree isolation (mutasi file paralel, anti-konflik).
- **Migration discipline:** semua migration via `apply_migration` MCP (bukan SQL editor) biar ledger nggak drift; `get_advisors` setelah migration fungsi/RLS.
- **Urutan & dependency:** B1 (country meta + revalidate) unblock B2 (web inactive aman diverifikasi; asset pakai revalidate sama). B1 europe + B2 asset feed B10. Jadi 1 → 2 → 3 … → 10, dengan paralel di dalam batch parallel-workflow.

**Saran realistis:** kerjakan **Batch 1–2 dulu sebagai satu sprint** (funnel-critical, di belakang ads yang lagi bakar duit), ship, verifikasi di prod, baru lanjut 3+. Nggak harus semua 10 dalam satu malam.

---

## 4. Coverage gaps (round 2 — belum tertutup)

1. **Auth/magic-link flow** belum dites end-to-end (portal auth-gated, nggak bisa curl). Perlu smoke test pakai agent email: signup → capture OTP/link → verifikasi candidate+application ter-materialize. Ingat: ~50% nggak pernah klik link (conversion-gap memory).
2. **WhatsApp/SMS OTP** — friksi #1 funnel, masih sketch route `/auth/whatsapp`, out of scope round ini. **Lever konversi terbesar, ngalahin kebanyakan item UI-polish.**
3. **Akademi / Paspor paid-cert** — cuma spot-check; enrollment gating, progress tracking, payment/entitlement integrity belum diaudit.
4. **Edge functions & server-action trust boundary** (grade-cv, materialize, revalidate route, referral) belum di-review; temuan consents-forge nunjukin boundary anon/service-role lain layak pass khusus.
5. **Verifikasi visual/responsive live portal** — code-derived semua (auth-gated). Round 2: browser ter-autentikasi (agent email) buat screenshot layar kandidat real di viewport mobile.
6. **Affiliate/referral, events LP, job_orders pipeline** — belum diaudit UX/parity/integrity-nya di luar yang muncul insidental.
7. **Email/notification content** (template Resend/Postmark, copy magic-link) — full out of scope; surface trust-signal penting.

---

## 5. Design principles (dari research strand) — pegangan implementasi

1. **Country-first nav harus EXHAUSTIVE & data-derived** — tiap `positions.country` aktif harus map ke tile/filter terlihat, atau undiscoverable buat audiens yang navigasi by anchor visual bukan search. List country hardcoded = failure mode.
2. **Status BINARY, Indonesia plain, satu next-action** — jangan bocorin vocabulary pipeline internal; jangan English/all-caps-mono/<11px buat status decision-critical. Konsistensi semantic state lintas layar = sinyal trust.
3. **Merah cuma utk blocker nyata yang bisa di-action** — dinding merah buat dokumen non-blocking = anxiety + re-upload + kesan "rusak/scam". Model `/lengkapi` Sekarang/Berikutnya/Nanti = template benar.
4. **Di tiap anxiety peak (nunggu, ditolak, upload): sinyal trust spesifik + manusiawi** — PIC bernama + wajah real + WhatsApp deep-link > klaim institusional. Jangan ship disclaimer "ini fake" di social proof.
5. **Hilangkan dead affordance** — search harus search, chevron harus navigate, link T&C harus buka terms, tombol Info harus inform. Tap yang nggak ngapa-ngapain = app rusak/fake buat user low-literacy.
6. **Loading/empty/error/disabled = first-class state** — skeleton content-shaped utk >300ms, empty state spesifik + actionable, error boundary ramah (retry + WhatsApp, no stack trace), feedback saved/saving biar dropped 3G nggak silently hilangin input.
7. **Form control aksesibel = non-negotiable di conversion path** — focus terlihat saat native input sr-only, error per-field + role=alert + aria-invalid + focus-move, signaling required/optional + aria-required, target 44px. Pola sudah ada in-repo (`lengkapi`).

---

*Sumber mentah: workflow `wf_e606b9ab-2a8` (32 agent, 63 temuan ter-verifikasi). Evidence: SQL production + curl prod + code reads, 2026-06-12.*
