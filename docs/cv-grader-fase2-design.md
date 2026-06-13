# CV di Depan Funnel + Auto-Grade (Fase 2) - Design Doc

> **STATUS = DESAIN. Belum di-implement. Belum di-ship. Belum di-review /cso + /plan-eng-review.**
> Dokumen ini cuma rencana arsitektur. NOL baris kode produksi diubah saat doc ini ditulis.
> Sebelum sebaris kode ditulis: WAJIB lewat (1) /plan-eng-review buat lock keputusan MOVE+GRADE, (2) /cso buat anon-storage-write surface + PDP purge.

- **Repo:** `~/Developer/perantauglobal` (monorepo, single Supabase project `jeadtvxgxmqnsqwxjmhj`, ap-southeast-1)
- **Tanggal desain:** 2026-06-13
- **Migration berikutnya:** `0078` (terakhir di-confirm = `0077_application_completeness_view.sql`)
- **Author:** tech-lead synthesis dari panel desain (2 approach) + 3 verdict review (security/PDP, anti-abuse, reuse/simplicity)

---

## 1. Ringkasan Keputusan

### Masalah
CV upload sekarang 100% **post-account** - kandidat baru bisa upload CV setelah bikin akun + verifikasi email + masuk portal. Akibatnya cuma **~21% akun yang punya CV**, admin gak punya sinyal kualitas di depan, dan Meta "Lead" conversion (= 1 row `pending_submissions` saat submit) jadi sinyal lemah (cuma nama+email+WA).

### Approach terpilih: **A-frame (anon-staging-upload-first) + B-hardening (security/PDP) + grade-via-session-kandidat**

Tarik upload CV ke **depan funnel** (di `ApplyForm`, sebelum akun jadi) dengan **extend pola staging yang sudah ada dan battle-tested**: `pending_submissions` + trigger `handle_new_auth_user()`. CV staged anon ke Storage pakai path ber-prefix `pending/<pendingId>/`, lalu di-materialize jadi `candidate_documents` saat email diverifikasi, lalu auto-grade reuse 100% engine `grade-cv` yang sudah live.

Ini **hibrida** dari kedua approach panel + koreksi dua bug teknis yang ditemukan verdict:

| Dimensi | Pilihan | Dari | Kenapa |
|---|---|---|---|
| Pointer CV | `form_data.cv` JSONB di `pending_submissions` | **A** | Nol kolom baru, konsisten pola `form_data->>'ref'` / utm existing. B (kolom `cv_path/cv_mime/cv_size` + CHECK + index) = surface migration berlebih buat MVP CV-only. |
| Bucket | **Bucket BARU `pending-cv`** (terisolasi) | **B** | Blast-radius anon-write dikurung di bucket sendiri. A (tempel policy anon ke `candidate-documents`) = kalau salah-scope, radius = SELURUH CV kandidat authenticated. Isolasi menang di lensa security. |
| Storage MOVE | **DI TS `/auth/callback`, BUKAN di trigger Postgres** | **A (fallback)** | Verified: pg_net + pg_cron TIDAK terinstall (cuma `uuid-ossp` + `pgcrypto`); nol precedent `storage.move`/`UPDATE storage.objects` di repo. Trigger tidak bisa mindahin file fisik. |
| Invoke grade-cv | **Pakai SESSION KANDIDAT** (post-`exchangeCodeForSession`), BUKAN service-role | **A** | Verified: `/auth/callback` = anon SSR client only (`NEXT_PUBLIC_SUPABASE_ANON_KEY`), TIDAK ada service-role. Authz "candidate=own CV" sudah terbukti di `grade-cv/index.ts:228-231`. Hindari nyebar service-role secret baru ke surface callback. |
| Consent profiling AI | **Purpose granular `cv_processing` + SoT constant** | **B** | CV + auto-grade = profiling otomatis -> consent granular lebih patuh PDP + bisa di-withdraw terpisah. Sekalian tutup consent-drift pre-existing. |
| Timing grading | **Post-verify (bukan anon stage)** | **A & B (identik)** | ~50% dropout email-verify + bot TIDAK PERNAH ngabisin AI Gateway credits. Gak ada `candidate_id` buat di-key di anon stage. Nol perubahan ke engine. |
| Anti-abuse | **honeypot + rate-limit DB-level + cron purge** SHIP BARENGAN | **A & B (identik)** | Verified: NOL anti-abuse existing; `pending_anon_insert` masih `WITH CHECK (true)`. Tanpa purge = pelanggaran PDP data-minimization, bukan future work. |

### Kenapa hibrida ini (bukan A murni / B murni)
- Verdict **security/PDP**: B menang isolasi bucket + granularitas consent (inti lensa), TAPI B punya 2 bug faktual - klaim "service-role invoke dari /auth/callback" SALAH (route itu anon-only, diverifikasi), dan "UPDATE storage.objects" sebagai jalur MOVE utama rapuh + nyentuh internal Storage.
- Verdict **anti-abuse**: B sedikit menang (bucket terpisah + guard ketat), TAPI invoke pattern B (service-role) naikin blast radius tanpa untung. Pakai invoke pattern A.
- Verdict **reuse/simplicity**: A menang (`form_data` JSONB, nol kolom baru, reuse engine), TAPI A buta terhadap 2 risiko yang HANYA B sebutkan (email_exists orphan, service-role callback env-dependency). Impor kedua risk-register itu.

**Net:** A-frame buat data model + reuse (JSONB pointer, reuse engine) + B-hardening buat security boundary (bucket isolasi, consent granular, orphan-aware) + grade-via-session-kandidat (jalur grade paling akurat + minim secret).

### Hasil bisnis
- Meta "Lead" jadi sinyal lebih kuat (orang yang beneran kasih CV). **Lead TETAP = submit** (jangan ubah jadi CV-only -> deflasi volume), tapi tambah `custom_data.has_cv=true` supaya optimisasi Meta bisa condong ke pelamar ber-CV. (Open question buat Panji.)
- Admin dapat CV + skor fit otomatis tanpa nunggu kandidat balik ke portal.
- **CV TETAP OPSIONAL di LP** (jangan wajibin -> nambah drop-off, konflik desain sub-5-field yang sengaja di-trim). WAJIB A/B test sebelum jadiin default.

---

## 2. Arsitektur Final

### Boundary yang dipakai (existing, tidak diubah)
- **apps/web** (`perantauglobal.com`): capture + submit. Client anon. Tulis `pending_submissions` + `consents` via anon key (`SUPABASE_ANON_KEY_V2`).
- **apps/platform** (`app.perantauglobal.com`): verify (`/auth/callback` PKCE) + materialize + portal. Cross-subdomain attribution (fbp/fbc) di-forward via `emailRedirectTo` + `user_metadata` (tidak berubah).
- **DB trigger** `handle_new_auth_user()` (canonical = migration `0067`): materialize candidate + applications + consents + referral saat `email_confirmed_at` flip NULL->NOT NULL (fire SEKALI).
- **Edge fn** `grade-cv` (Deno, service-role, satu-satunya writer ke `cv_assessments` + `application_cv_fit`): ZERO perubahan.

### Komponen BARU
1. Bucket Storage `pending-cv` (private, anon INSERT-only, scoped `pending/<uuid>/`).
2. Field `form_data.cv` di `pending_submissions` (JSONB, nol kolom baru).
3. SoT consent constant `apps/web/src/lib/cv-consent.ts` (+ extend `application_processing` consent).
4. Browser anon storage client di apps/web (saat ini cuma punya server-side `supabaseV2`).
5. MOVE + grade-trigger di `/auth/callback` `waitUntil()` (TS, bukan trigger).
6. Anti-abuse: honeypot field, rate-limit DB-level (per-IP/per-email window), cron purge orphan.

### Data flow (ASCII)
```
[apps/web LP: ApplyForm]
  | (1) pre-generate pendingId = crypto.randomUUID()  (client)
  | (2) user pilih CV (opsional) -> validate mime+5MB client-side
  | (3) upload anon -> bucket pending-cv  path: pending/<pendingId>/cv.<ext>
  |                                              (anon INSERT-only, blind write)
  v
[POST /api/lowongan/[slug]]
  | (4) terima pending_id + cv_path; validasi regex ^pending/<pending_id>/cv\.(ext)$
  | (5) honeypot check; rate-limit check (DB window per-IP/email)
  | (6) writePendingSubmission(pendingId, form_data.cv={path,mime,size}) + consents
  | (7) auth.signUp(email,password) -> Supabase kirim email verifikasi
  | (8) Meta CAPI 'Lead' + custom_data.has_cv
  v
[email verifikasi diklik]
  v
[apps/platform /auth/callback]
  | (9) exchangeCodeForSession(code) -> session kandidat aktif
  |     -> email_confirmed_at flip -> trigger handle_new_auth_user() fire (DB):
  |          - upsert candidates
  |          - loop pending -> applications (stage 'applied')
  |          - relink consents.pending_id -> candidate_id
  |          - attribute referral / utm
  |          - [BLOK BARU best-effort]: kalau form_data.cv ada,
  |            INSERT candidate_documents(doc_type='cv', file_path=pending/<id>/cv.*)
  |            -- file MASIH di pending-cv, belum di-move (trigger gak bisa move file)
  | (10) waitUntil() [TS, session kandidat]:
  |          - MOVE object pending-cv/pending/<id>/cv.* -> candidate-documents/<cid>/cv/cv-<ts>.<ext>
  |          - UPDATE candidate_documents.file_path -> path baru
  |          - functions.invoke('grade-cv', {document_id})  (fire-and-forget)
  |          - CompleteRegistration CAPI (existing)
  v
[grade-cv {document_id}]  (service-role, engine existing, ZERO change)
  | (11) gradeOne(doc) -> extract -> cv_assessments
  | (12) auto-fit SEMUA app non-terminal kandidat -> application_cv_fit  (index.ts:234-241)
  v
[Admin: CvAssessmentCard + CvFitBadge/CvFitPanel + sort 'fit']  (existing UI, ZERO change)
```

### Keputusan arsitektur kunci: kenapa MOVE di callback, bukan trigger
**Verified di repo (2026-06-13):**
- `0001_initial_schema.sql` cuma `CREATE EXTENSION uuid-ossp + pgcrypto`. **NO pg_net, NO pg_cron.**
- Nol precedent `storage.move()` / `UPDATE storage.objects SET bucket_id/name` di seluruh `packages/db/migrations/` + `supabase/` (cuma RLS di 0010).
- Postgres trigger TIDAK bisa mindahin file fisik object. `UPDATE storage.objects` cuma ubah metadata row -> file biner tetap di lokasi lama -> path baru nunjuk object kosong -> `grade-cv` download GAGAL.

Karena itu: **trigger HANYA INSERT metadata `candidate_documents`** (file_path masih nunjuk ke `pending/<id>/cv.*`), lalu **`/auth/callback` (TS, punya storage client + session kandidat) yang MOVE file fisik + update `file_path` + invoke grade**. Logic ke-split trigger (metadata) + callback (file move), trade-off yang diterima karena tidak ada alternatif feasible.

> **OPSI "no-move" (alternatif lebih simpel, dipertimbangkan, ditunda):** Trigger INSERT `candidate_documents.file_path = pending/<id>/cv.*` (file tetap di bucket `pending-cv`, gak pernah di-move). Konsekuensi: `grade-cv` harus download dari bucket `pending-cv` (beda bucket), retention/purge jadi rumit (file ter-consume masih di `pending-cv` bareng orphan), candidate gak bisa lihat CV-nya lewat RLS `candidate-documents` existing. **Ditolak** untuk MVP karena bikin retention berantakan + butuh ekstra storage SELECT policy. Move-di-callback dipilih. (Lock final di /plan-eng-review.)

---

## 3. Flow Langkah (detail implementasi)

1. **LP render** (`apps/web/.../lowongan/[slug]/page.tsx` -> `ApplyForm`). Tambah field upload CV **OPSIONAL** di Step 2 (kualifikasi) wizard: section "Lampirkan CV (opsional, bikin lamaran kamu lebih kuat)". Ganti copy lama "CV diminta nanti di tahap Cek Dokumen". Tambah honeypot field tersembunyi.
2. **Client pre-generate** `pendingId = crypto.randomUUID()` di awal (sebelum submit). Validate file client-side: mime allowlist (`jpeg/png/heic/heif/webp/pdf`) + 5MB (mirror bucket cap + `DocumentUploadModal.onFileChange`).
3. **Upload anon** ke bucket `pending-cv` path `pending/<pendingId>/cv.<ext>` pakai browser anon client (BARU). `upsert:false`. Kalau gagal: JANGAN blok submit -> fallback ke manual (CV diminta nanti), submit tetap jalan tanpa `cv_path`.
4. **POST** ke `/api/lowongan/[slug]` dengan payload existing + `pending_id` + `cv_path` (atau null) + honeypot field.
5. **Server `route.ts`**: (a) honeypot terisi -> drop submit + skip upload; (b) rate-limit check (DB window per-IP/email); (c) validasi `cv_path` regex strict `^pending/<pending_id>/cv\.(pdf|jpe?g|png|heic|heif|webp)$` + `pending_id` valid UUIDv4; invalid -> drop pointer (jangan reject submit).
6. **`writePendingSubmission`** (UBAH: terima `pendingId` dari caller alih-alih generate internal). Insert `pending_submissions` (id = pendingId) + `consents`. `form_data.cv = {path, mime, size}`.
7. **`auth.signUp(email,password)`** -> email verifikasi (TIDAK berubah). Meta 'Lead' CAPI + `custom_data.has_cv`.
8. **User klik link** -> `/auth/callback` `exchangeCodeForSession(code)` -> session aktif -> `email_confirmed_at` flip -> trigger fire.
9. **Trigger `handle_new_auth_user()`** jalan persis seperti 0067 (upsert candidate, loop pending -> applications, relink consents, referral). **TAMBAHAN** di per-pending loop: kalau `v_pending.form_data->'cv'` ada -> INSERT `candidate_documents(candidate_id, doc_type='cv', file_path='pending/<id>/cv.*', mime_type, file_size, display_name='CV', application_id=NULL)`. Best-effort `BEGIN/EXCEPTION WHEN OTHERS THEN RAISE WARNING` (mirror blok `_attribute_candidate_referral`, JANGAN abort signup).
10. **`/auth/callback` `waitUntil()`** (TS, session kandidat): query `candidate_documents` doc_type='cv' terbaru milik user yang `file_path` masih `pending/...` -> `supabase.storage.move()` ke `<candidate_id>/cv/cv-<ts>.<ext>` -> UPDATE `candidate_documents.file_path` -> `functions.invoke('grade-cv',{document_id})` fire-and-forget (session kandidat; verify_jwt OK karena authz candidate=own CV ada di `index.ts:228-231`).
11. **`grade-cv {document_id}`** extract CV (`gradeOne`) -> `cv_assessments`, LALU auto-fit semua app non-terminal (`index.ts:234-241`, `runPool(_,4,_)`).
12. **Admin** langsung lihat `CvAssessmentCard` + `CvFitBadge`/`CvFitPanel` + sort 'fit' (existing UI, nol perubahan).

**Fallback manual** (user gak upload): `form_data.cv` null -> trigger skip blok CV -> behaviour 100% sama kayak sekarang. Nol regresi.

---

## 4. Perubahan DB + Draft Migration SQL

> **STATUS: DRAFT. Belum di-apply. Additive + non-destructive.**

Migration baru: `packages/db/migrations/0078_anon_cv_staging.sql`

```sql
-- 0078_anon_cv_staging.sql
-- STATUS: DRAFT DESAIN - belum di-apply.
-- Tarik CV upload ke depan funnel: bucket anon-staging pending-cv +
-- recreate handle_new_auth_user dengan blok INSERT candidate_documents (CV).
-- Storage MOVE file fisik + invoke grade-cv dilakukan di TS /auth/callback,
-- BUKAN di sini (pg_net + pg_cron TIDAK terinstall; trigger tak bisa move file).

-- =====================================================================
-- 1. Bucket pending-cv (PRIVATE, mirror cap candidate-documents 0010).
--    Bucket TERPISAH dari candidate-documents biar blast-radius anon-write
--    terisolasi (kalau policy salah-scope, cuma staging yg ke-expose).
-- =====================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'pending-cv', 'pending-cv', false,
  5242880,  -- 5MB, identik candidate-documents
  ARRAY['image/jpeg','image/png','image/heic','image/heif','image/webp','application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit   = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- =====================================================================
-- 2. Storage RLS: anon INSERT-only, scoped KETAT ke pending/<uuid>/ (2 segmen).
--    Anon TIDAK punya SELECT/UPDATE/DELETE -> blind write-only.
--    pendingId = UUIDv4 unguessable -> gak bisa nebak/numpuk path orang lain.
-- =====================================================================
CREATE POLICY pending_cv_anon_insert ON storage.objects
  FOR INSERT TO anon
  WITH CHECK (
    bucket_id = 'pending-cv'
    AND (storage.foldername(name))[1] = 'pending'
    AND array_length(storage.foldername(name), 1) = 2
  );

-- Service role (edge fn + callback move + purge) full access via is_admin path
-- handled by service-role bypass; tambah SELECT/DELETE admin buat debug (opsional):
CREATE POLICY pending_cv_admin_all ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'pending-cv' AND public.is_admin())
  WITH CHECK (bucket_id = 'pending-cv' AND public.is_admin());

-- =====================================================================
-- 3. (TIDAK perlu kolom baru.) Pointer CV masuk pending_submissions.form_data->'cv'
--    = {path, mime, size}. Konsisten pola form_data->>'ref' / utm existing.
-- =====================================================================

-- =====================================================================
-- 4. Recreate handle_new_auth_user() - VERBATIM dari 0067 + 1 blok CV
--    best-effort di dalam per-pending LOOP (setelah INSERT applications).
--    (Body lengkap di-copy dari 0067; di bawah cuma DELTA buat ilustrasi.)
-- =====================================================================
-- CREATE OR REPLACE FUNCTION public.handle_new_auth_user() ...
--   ... (seluruh body 0067 di-recreate verbatim) ...
--   FOR v_pending IN
--     SELECT id, intent, position_slug, program_slug, form_data
--       FROM public.pending_submissions
--      WHERE lower(email) = lower(NEW.email) AND consumed_at IS NULL
--   LOOP
--     IF v_pending.intent = 'academy' THEN
--       ...
--     ELSE
--       INSERT INTO public.applications (...) ON CONFLICT (...) DO NOTHING;
--     END IF;
--
--     -- >>> BLOK BARU: stage CV metadata (file fisik di-move nanti di callback) <<<
--     IF v_pending.form_data ? 'cv'
--        AND v_pending.form_data->'cv'->>'path' IS NOT NULL THEN
--       BEGIN
--         INSERT INTO public.candidate_documents (
--           candidate_id, doc_type, file_path, mime_type, file_size,
--           display_name, application_id
--         ) VALUES (
--           v_candidate_id, 'cv',
--           v_pending.form_data->'cv'->>'path',      -- masih pending/<id>/cv.*
--           v_pending.form_data->'cv'->>'mime',
--           (v_pending.form_data->'cv'->>'size')::int,
--           'CV', NULL                                -- CV = identity doc, shared
--         )
--         ON CONFLICT DO NOTHING;                     -- idempotent
--       EXCEPTION WHEN OTHERS THEN
--         RAISE WARNING 'pending CV materialize skipped for candidate %: %',
--                       v_candidate_id, SQLERRM;       -- JANGAN abort signup
--       END;
--     END IF;
--     -- <<< END BLOK BARU >>>
--
--     UPDATE public.pending_submissions SET consumed_at = NOW() WHERE id = v_pending.id;
--   END LOOP;
-- ... (sisa body 0067 verbatim) ...
-- $$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth;
```

**Catatan migration:**
- `candidate_documents` schema TIDAK diubah (`candidate_id NOT NULL` tetap; row di-insert SETELAH candidate jadi).
- `cv_assessments` / `application_cv_fit` / `grade-cv` TIDAK diubah. FK `candidate_id + document_id` tetap satisfied.
- Recreate function (bukan ALTER); copy body 0067 verbatim + 1 blok. WAJIB juga handle cabang intent='academy' kalau academy CV di-scope (fase 2, lihat open questions).

---

## 5. Storage Policy (anon) + Consent PDP

### Storage policy
- Bucket BARU `pending-cv`: PRIVATE, 5MB cap, mime allowlist (identik `candidate-documents` 0010). Cap di-enforce di **level bucket Supabase** -> anon gak bisa bypass via policy.
- Anon HANYA `INSERT`, scoped `WITH CHECK (bucket_id='pending-cv' AND (storage.foldername(name))[1]='pending' AND array_length(...,1)=2)`. **Blind write-only** (no SELECT/UPDATE/DELETE buat anon) -> gak bisa enumerasi/baca CV orang lain, gak bisa numpuk/nimpa (`upsert:false`).
- `pendingId` = UUIDv4 unguessable, juga PK `pending_submissions`.
- Saat verify, `/auth/callback` (session kandidat + storage client) `storage.move()` object ke `candidate-documents/<candidate_id>/cv/` -> masuk RLS auth.uid() existing (candidate bisa lihat CV-nya di portal seperti biasa).
- **Isolasi sengaja:** bucket terpisah dari `candidate-documents` -> kalau scoping `pending/` salah tulis, radius kesalahan = cuma staging, BUKAN seluruh CV kandidat authenticated.

### Consent PDP (UU 27/2022)
CV = data pribadi; auto-grade = **profiling otomatis** (fit-score + flag kontradiksi) -> idealnya consent granular terpisah.

**Pre-existing drift (verified):** teks DITAMPILKAN di `ApplyForm.tsx` ("Dengan mendaftar, kamu setuju Syarat Layanan & Kebijakan Privasi UU PDP") BEDA dari yang DI-LOG di `route.ts:215` (hardcode purpose `application_processing` version `2026-04-23`), dan keduanya gak nyebut CV/AI. Logged-text != shown-text = consent record lemah.

**Keputusan:**
1. **SoT constant** `apps/web/src/lib/cv-consent.ts` (`CV_CONSENT_TEXT` + `CV_CONSENT_VERSION`), mirror pola `academy-consent.ts` yang sudah benar; di-import client (UI) + server (log) supaya shown-text == logged-text.
2. **Consent granular `cv_processing`** terpisah dari `application_processing`, di-log saat ada CV. Purpose_text eksplisit: "penyimpanan & pemrosesan otomatis dokumen CV (analisis AI untuk pencocokan lowongan)".
3. **Micro-copy** di dekat field upload: "CV kamu dipakai untuk pencocokan lowongan & dianalisis otomatis sesuai UU PDP".
4. Sekalian **tutup drift `application_processing`**: pindah teks ke SoT constant + bump version.
5. Consent tetap di-stage anon via `pending_id` (candidate_id NULL) -> sesuai 0076 (`WITH CHECK candidate_id IS NULL`); relink ke candidate_id di trigger loop existing.
6. **JANGAN ubah jadi blocking checkbox** kalau gak perlu (CRO) - tapi consent harus tetap auditable & granular.
7. **Retensi (kritis):** CV staged yang gak pernah jadi akun = PII nyangkut -> WAJIB purge (lihat anti-abuse).

---

## 6. Anti-Abuse

**Realita (verified):** NOL anti-abuse primitive - `pending_anon_insert` masih `WITH CHECK (true)`, nol honeypot/captcha/rate-limit, hanya pass-through 429 dari Supabase Auth signUp (terjadi SETELAH pending+consent rows ditulis). Nambah anon FILE upload = surface flood file 5MB.

**Wajib SHIP BARENGAN fitur ini (gate, bukan future work):**

| # | Kontrol | Detail | Prioritas |
|---|---|---|---|
| 1 | **Rate-limit DB-level** | Window per-IP + per-email di jalur insert `pending_submissions` (pakai `ip_address`/`user_agent` yang sudah distempel). **BUKAN** middleware in-memory Vercel (per-instance, cold-start reset, unreliable). | P0 |
| 2 | **Cron purge orphan** | Scheduled job (service-role) hapus object `pending-cv` umur >24-48h DAN `pending_submissions.consumed_at IS NULL` (alias dropout). Storage cost + PDP minimization. ~50% dropout = ~50% CV PII nyangkut. **NB: pg_cron TIDAK terinstall -> pakai Supabase scheduled edge function / GitHub Action cron, bukan pg_cron.** | P0 |
| 3 | **Honeypot field** | Field tersembunyi di `ApplyForm`. Murah, nol friction buat audiens PMI low-digital-literacy. Server drop submit + skip upload kalau terisi. (Catatan: honeypot lemah vs bot modern -> rate-limit DB yang benar-benar mengikat; honeypot lapis kedua.) | P0 |
| 4 | **Path guard strict** | Regex `^pending/<pending_id>/cv\.(ext)$` + `pending_id` valid UUIDv4 di server. Cegah path-injection (client sekarang kontrol `pendingId`). | P0 |
| 5 | **Grading defer post-verify** | Bot/dropout (50% gak verifikasi) GAK PERNAH ngabisin AI Gateway credits (`GATEWAY_KEY` single point, free tier rate-limited). Pertahankan mati-matian. | P0 |
| 6 | **Cap jumlah app auto-fit** | `index.ts:234-241` runPool TANPA cap. Aman buat kandidat front-funnel baru (1 app), tapi WAJIB cap sebelum jalur ini nyentuh returning-candidate multi-app (risiko N-fit-calls + IDLE_TIMEOUT 150s). | P1 |
| 7 | **/cso review** | Anon storage write PERTAMA ke Supabase Storage. Blocking gate. | P0 |

---

## 7. Reuse Trigger Auto-Grade (ZERO perubahan engine)

**Reuse 100% engine `grade-cv` existing. Verified di repo:**
- Mode `{document_id}` (POST JSON): authz candidate=own CV ada (`index.ts:228-231`, cek `candidates.auth_user_id == subFromJwt`). Setelah `gradeOne(doc)` sukses -> auto-fit SEMUA app non-terminal kandidat via `runPool((apps??[]),4,scoreFit)` (`index.ts:234-241`, skip `pipeline_stage in (rejected,exit)`).
- Jadi **satu `invoke {document_id}` = CV ke-extract + semua lamaran ke-skor otomatis.**

**Penempatan trigger (rekomendasi terpilih = Opsi A):** Di `apps/platform/src/app/auth/callback/route.ts` dalam `waitUntil()` yang SUDAH ada (tempat `CompleteRegistration` CAPI fire). Setelah `exchangeCodeForSession` + `getUser`: query `candidate_documents` doc_type='cv' terbaru milik user -> (move dulu kalau `file_path` masih `pending/`) -> `supabase.functions.invoke('grade-cv',{document_id})` fire-and-forget pakai **session kandidat** (bukan service-role). Reuse persis pola `DocumentUploadModal.tsx:177` yang sudah jalan di portal.

**Opsi B (ditolak):** pg_net dari trigger - INFEASIBLE (pg_net tidak terinstall). Service-role invoke dari callback - ditolak (nambah secret baru ke surface callback, env-dependency fragile per `requireCandidate` no-op).

**Tidak menyentuh** `applications/new/actions.ts` atau `applications/[id]/actions.ts` (jalur returning-candidate, tetap apa adanya).

---

## 8. Daftar File yang Diubah + Draft Snippet Kode Kunci

> **STATUS: DRAFT, belum ditulis ke kode produksi.**

### File yang DIUBAH

1. **`apps/web/src/components/pg/ApplyForm.tsx`** - field upload CV opsional di Step 2 + pre-generate `pendingId` + upload anon ke `pending/<id>/cv.*` + honeypot field + micro-copy consent CV; ganti copy "CV diminta nanti".

2. **`apps/web/src/app/api/lowongan/[slug]/route.ts`** - terima `pending_id` + `cv_path`; honeypot check; rate-limit check; validasi path regex strict; teruskan ke `writePendingSubmission` via `form_data.cv`; log consent `cv_processing`; upgrade Meta Lead `custom_data.has_cv`.

3. **`apps/web/src/lib/pending-write.ts`** - terima `pendingId` dari caller (saat ini generate internal `crypto.randomUUID()` di baris 72) supaya path upload & PK `pending_submissions` konsisten; tambah `cv` ke `form_data` type.

   Draft delta:
   ```ts
   // SEBELUM: const pendingId = crypto.randomUUID();
   // SESUDAH:
   export async function writePendingSubmission(args: {
     pendingId?: string;           // <- caller-provided (path upload sama dgn PK)
     form_data: Record<string, unknown>;  // form_data.cv = {path,mime,size}
     // ...field lain tetap
   }): Promise<{ ok: true; pendingId: string } | { ok: false; error: string }> {
     const pendingId = args.pendingId ?? crypto.randomUUID();  // fallback no-CV path
     // ... insert id: pendingId (existing), consents pending_id: pendingId (existing)
   }
   ```

4. **`apps/platform/src/app/auth/callback/route.ts`** - di `waitUntil()` existing: move CV + invoke grade.

   Draft delta (TS, session kandidat):
   ```ts
   waitUntil((async () => {
     // ... CompleteRegistration CAPI existing ...
     const { data: { user } } = await supabase.auth.getUser();
     if (!user) return;
     // candidate_documents CV terbaru yg masih staged di pending-cv
     const { data: doc } = await supabase
       .from("candidate_documents")
       .select("id, candidate_id, file_path")
       .eq("doc_type", "cv")
       .like("file_path", "pending/%")
       .order("created_at", { ascending: false })
       .limit(1).maybeSingle();
     if (!doc) return;
     try {
       const ext = doc.file_path.split(".").pop();
       const dest = `${doc.candidate_id}/cv/cv-${Date.now()}.${ext}`;
       // move LINTAS-bucket: pending-cv -> candidate-documents
       await supabase.storage.from("pending-cv").move(doc.file_path, dest, {
         destinationBucket: "candidate-documents",  // verifikasi API signature di spike
       });
       await supabase.from("candidate_documents")
         .update({ file_path: dest }).eq("id", doc.id);
       // grade pakai SESSION KANDIDAT (authz candidate=own CV, index.ts:228-231)
       await supabase.functions.invoke("grade-cv", { body: { document_id: doc.id } });
     } catch (e) {
       console.error("[callback] cv move/grade skipped:", e);  // non-blocking
     }
   })());
   ```
   > **SPIKE WAJIB:** signature `storage.move` lintas-bucket (`destinationBucket`) + apakah session kandidat punya akses move dari `pending-cv` (anon write-only, no SELECT/DELETE buat anon - session kandidat authenticated, BUKAN anon; perlu policy SELECT/DELETE buat owner di `pending-cv` ATAU lakukan move pakai service-role di edge fn kecil). **Ini risk #1 yang harus di-lock di /plan-eng-review.**

5. **`apps/web/src/lib/supabase-v2.ts`** (atau file baru `apps/web/src/lib/supabase-storage-anon.ts`) - browser anon storage client. **GAP env (verified):** apps/web cuma punya `SUPABASE_ANON_KEY_V2` (non-public, server-side). Upload dari browser butuh key ber-prefix `NEXT_PUBLIC` buat project V2 - saat ini TIDAK ada. WAJIB tambah `NEXT_PUBLIC_SUPABASE_ANON_KEY_V2` (anon, BUKAN service) + pastikan gak bocorin service key.

### File BARU

6. **`packages/db/migrations/0078_anon_cv_staging.sql`** - bucket `pending-cv` + anon INSERT RLS scoped `pending/` + recreate `handle_new_auth_user` (verbatim 0067 + blok CV best-effort). (Draft SQL di §4.)

7. **`apps/web/src/lib/cv-consent.ts`** - SoT `CV_CONSENT_TEXT` + `CV_CONSENT_VERSION`, pola `academy-consent.ts`.

8. **Cron purge** - Supabase scheduled edge function ATAU GitHub Action cron (pg_cron tidak terinstall): hapus object `pending-cv` >24-48h tanpa `consumed_at`.

9. **Rate-limit** - DB function/jalur per-IP+per-email window di `route.ts` insert path.

### OPSIONAL (fase 2, out of MVP scope)

- `apps/web/src/app/api/akademi/[slug]/route.ts` + `EnrollPanel.tsx` - sejajarkan academy register (stub "File upload isn't supported at registration" = target overturn yang sama).

---

## 9. Urutan Implementasi

**Gate 0 (sebelum coding):**
1. `/plan-eng-review` - LOCK keputusan MOVE+GRADE: storage.move lintas-bucket feasibility (spike), apakah session kandidat cukup atau perlu service-role move di edge fn kecil, cap auto-fit app count.
2. `/cso` - anon storage write surface + PDP purge + consent granular.

**Fase 1 - DB + Storage foundation:**
3. Migration `0078`: bucket `pending-cv` + anon INSERT RLS + recreate trigger (blok CV). Apply ke branch DB dulu, test trigger fire dgn `form_data.cv` dummy.
4. Spike `storage.move` lintas-bucket di `/auth/callback` (resolve risk #1).

**Fase 2 - Consent + anti-abuse (gate, ship barengan):**
5. `cv-consent.ts` SoT + extend `application_processing` (tutup drift).
6. Honeypot + rate-limit DB-level + cron purge. (P0, gak boleh ship tanpa ini.)

**Fase 3 - Capture (apps/web):**
7. `NEXT_PUBLIC_SUPABASE_ANON_KEY_V2` env + browser anon storage client.
8. `ApplyForm` field upload + honeypot + micro-copy + `pendingId` pre-gen.
9. `route.ts` terima `pending_id`/`cv_path` + validasi + consent log + Meta `has_cv`.
10. `pending-write.ts` terima caller `pendingId`.

**Fase 4 - Materialize + grade (apps/platform):**
11. `/auth/callback` waitUntil: move + invoke grade (session kandidat).

**Fase 5 - Verify + ship:**
12. `/agent-email` smoke test end-to-end (signup ber-CV -> verify -> cek `candidate_documents` + `cv_assessments` + `application_cv_fit` muncul + file pindah ke `candidate-documents/<cid>/cv/`).
13. A/B test CV-opsional vs tanpa (jangan jadiin default sebelum data submit-rate).
14. `/review` + `/ship`.

---

## 10. Open Questions buat Panji

1. **Meta "Lead" definition** - tetap fire 'Lead' di semua submit + `custom_data.has_cv=true` (volume Lead tetap, optimisasi condong ke ber-CV), ATAU fire 'Lead' cuma saat ada CV (volume deflasi drastis tapi sinyal murni)? Rekomendasi: tetap = submit + `has_cv`, tapi ini keputusan ads (Panji owner).
2. **CV opsional vs wajib di LP** - desain ini paksa OPSIONAL (konflik desain sub-5-field). A/B test dulu. Setuju CV tetap opsional + A/B sebelum jadiin default?
3. **Penempatan CV di wizard** - di Step 2 (kualifikasi) atau section terpisah setelah Step 2? Trade-off: makin awal = makin keliatan, tapi makin nambah friction kognitif di funnel yang sengaja di-trim.
4. **Scope academy** - apakah academy register (`/api/akademi` + `EnrollPanel` stub) juga di-overturn di rilis yang sama, atau tunda ke fase 2 (MVP job-apply only)?
5. **email_exists (409) orphan CV** - user yang SUDAH verified sebelumnya, re-apply + upload CV -> trigger fire-once (cuma di `email_confirmed_at` flip) gak re-fire -> CV nyangkut di `pending-cv` (di-purge cron). Acceptable buat MVP (cron purge handle), atau perlu jalur khusus materialize CV buat returning-verified-user? Rekomendasi: acceptable, andalkan purge.
6. **Retensi window purge** - 24h (selaras `pending_submissions.expires_at`) atau 48h (buffer dropout yang verify telat)? Implikasi PDP minimization vs UX recovery.
7. **storage.move feasibility** - kalau spike membuktikan session kandidat gak bisa move dari `pending-cv` (anon write-only), fallback ke edge fn kecil service-role buat move. OK nambah 1 hop edge fn, atau prefer opsi "no-move" (file tetap di `pending-cv`, grade-cv download dari sana)?

---

## 11. KEPUTUSAN TERKUNCI (v2, 2026-06-13, by Panji - "ikut rekomendasi")

Semua open question §10 di-resolve. Plus tambahan: A/B test varian **CV-wajib** + submission flow. Verifikasi repo dilakukan sendiri (bukan cuma output workflow).

### 11.1 Resolusi 7 open question

| # | Topik | KEPUTUSAN |
|---|---|---|
| 1 | Meta "Lead" | **Lead = submit (semua varian) + `custom_data.has_cv` (true/false).** JANGAN fire Lead cuma saat ada CV (deflasi volume + ngerusak pembanding top-funnel A/B). Meta optimisasi condong ke ber-CV via flag. |
| 2 | CV opsional vs wajib | **Bangun DUA mode di balik flag varian.** Default = opsional (kontrol). Treatment = **CV WAJIB** (sesuai harapan Panji buat di-test). A/B yang nentuin mana yang menang. |
| 3 | Penempatan | **Step 2 (kualifikasi), blok CV khusus.** Di treatment = blok wajib (gating submit). |
| 4 | Scope academy | **DITUNDA ke fase 2.** MVP = job-apply only (`/api/akademi` + EnrollPanel out of scope). |
| 5 | email_exists orphan | **Acceptable buat MVP, andalkan cron purge.** Returning-verified-user re-upload = CV nyangkut di pending-cv, di-purge. Nggak bikin jalur khusus dulu. |
| 6 | Window purge | **48 jam** (bukan 24h). Audiens PMI sering verify telat; buffer recovery > minimization ketat, masih patuh PDP. |
| 7 | storage.move | **KOREKSI dari rekomendasi v1.** Session kandidat TIDAK bisa move dari `pending-cv` (verified: bucket itu cuma punya policy anon-INSERT + admin; kandidat authenticated bukan admin -> nggak ada SELECT/DELETE di source). Pakai **edge fn service-role kecil `cv-materialize`** buat move + invoke grade. Bukan candidate-session, bukan no-move. |

### 11.2 Koreksi arsitektur: edge fn `cv-materialize` (ganti move-di-callback)

Flow materialize berubah dari "move di /auth/callback pakai session kandidat" jadi:

```
/auth/callback waitUntil() (anon, session kandidat):
  - setelah trigger fire + getUser
  - functions.invoke('cv-materialize', { }) pakai SESSION KANDIDAT (verify_jwt)
    -> edge fn cv-materialize (service-role, BYPASS RLS):
         1. auth: ambil candidate dari JWT sub (auth_user_id), pastikan caller = owner
         2. cari candidate_documents doc_type='cv' file_path LIKE 'pending/%' milik candidate
         3. storage move pending-cv/pending/<id>/cv.* -> candidate-documents/<cid>/cv/cv-<ts>.<ext> (service-role)
         4. UPDATE candidate_documents.file_path
         5. invoke grade-cv { document_id }  (atau langsung, tetap ZERO change ke grade-cv)
```

Kenapa edge fn baru (bukan tambah mode ke grade-cv): jaga prinsip **ZERO change ke engine grade-cv**. `cv-materialize` = fungsi privileged kecil yang auditable, satu-satunya yang nyentuh bucket anon `pending-cv` dengan service-role. Secret service-role TIDAK masuk surface Next.js callback (tetap di env edge fn, sama kayak grade-cv). Trigger DB tetap cuma INSERT metadata `candidate_documents` (file_path = pending/...), persis §4.

### 11.3 A/B test varian CV-wajib (mekanisme)

**Pertanyaan Panji:** "dua landing page untuk satu posisi yang sama, atau masih optional?" -> **Rekomendasi: satu codebase, varian via URL param** (bukan duplikat halaman -> hindari drift).

- URL: `/lowongan/[slug]` (kontrol, CV opsional) vs `/lowongan/[slug]?ab=cv_req` (treatment, CV wajib).
- Varian distempel ke `pending_submissions.form_data.ab_variant` ('control' | 'cv_required') -> bisa diukur di funnel sendiri + cross-check Meta.
- Meta (pas iklan diaktifin lagi): 2 ad set per posisi, masing-masing nunjuk 1 URL varian (ATAU pakai fitur A/B test native Meta). **Catatan: iklan PG lagi PAUSED (funding ditunda), jadi A/B ini di-WIRE-and-READY, jalan pas reactivate.**
- Metrik: submit-rate per varian (sesi->submit), CV-attach rate, kualitas downstream (fit score + verified rate) per rupiah iklan. Hipotesis: wajib nurunin top-funnel tapi naikin kualitas/biaya-per-lead-berkualitas. A/B yang buktiin.

### 11.4 Submission flow varian WAJIB (yang Panji minta lihat)

Step 2 (kualifikasi) di treatment `cv_required`:
1. Render blok "Lampirkan CV (wajib) - lamaran kamu langsung dinilai tim kami" + micro-copy consent (CV dipakai pencocokan lowongan + analisis AI, sesuai UU PDP).
2. User pilih file -> validasi client: mime (pdf/jpeg/png/heic/heif/webp) + <=5MB. Invalid -> error inline, nggak bisa lanjut.
3. Valid -> upload anon ke `pending-cv` `pending/<pendingId>/cv.<ext>` + indikator progress.
4. Upload sukses -> CV ke-tandai (check hijau), tombol submit AKTIF.
5. Upload gagal -> tombol retry; submit tetap DISABLED (treatment = hard gate, nggak ada skip).
6. Submit -> POST + `pending_id` + `cv_path` + `ab_variant='cv_required'` + consent `cv_processing`.
7. Sisa flow identik (signUp -> verify -> trigger -> cv-materialize -> grade).

Kontrol (`control`): blok CV sama persis TAPI opsional - ada teks "(opsional)" + tombol submit aktif tanpa CV. Bedanya cuma: required gate ON/OFF + copy.

**Catatan audiens:** PMI low-digital-literacy mungkin nggak punya file CV -> treatment wajib berisiko nurunin konversi tajam. Itu justru yang di-ukur. Kalau drop terlalu parah, kontrol menang; kalau kualitas lead treatment jauh lebih tinggi, wajib menang. Data > asumsi.

### 11.5 Gate sebelum ship (tetap berlaku)
- **/cso** wajib: surface anon file-upload pertama ke Storage (flood 5MB, path injection, PDP purge). Blocking sebelum merge.
- Spike kecil: konfirmasi `storage.move` cross-bucket service-role signature di `cv-materialize` (low risk, service-role bypass RLS).
- Anti-abuse (honeypot + rate-limit DB + cron purge 48h) ship BARENGAN, bukan future work.
