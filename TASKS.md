# Perantau Global — Active Tasks

Session handoff. Next Claude Code session yang baca file ini harus tau exactly where to pick up.

**Last updated:** 2026-04-30 (Phase 3 — Schema v3 wired into UI: requirement library, document metadata, readiness v3, Lengkapi Lamaran flow)

## Phase 3 — Schema v3 → UI (2026-04-30) ✅ DONE

**Migrations applied to production Supabase:**
- `0020_requirements_v3` — `positions.requirements` JSONB schema bump from v2 to v3 (`importance` rename, `category`, `evidence_mode`, `collect_at_stage`, `document_type`, `document_filter`). Backfill via `migrate_requirement_v2_to_v3()` ILIKE heuristic. `compute_readiness()` updated to handle v3 field shape (still self-declared only).
- `0021_candidate_documents_metadata` — extends `doc_type` enum (8 new values: formal_photo, str_certificate, driving_license, language_certificate, professional_certificate, education_certificate, work_certificate, medical_check). Adds `metadata JSONB`, `expires_at TIMESTAMPTZ`, `display_name TEXT`. New `compute_readiness_v3(candidate_id, position_slug)` joins documents + profile, evidence-mode aware. CHECK constraint `metadata < 4096 bytes`. GIN index `jsonb_path_ops` on metadata.
- `0022_position_form_fields_stage` — adds `collect_at_stage pipeline_stage NOT NULL DEFAULT 'screening'`. Index `(position_slug, collect_at_stage, sort_order)`.
- `0023_backfill_photo_to_formal_photo` — written but not yet applied (see "User action items" below).

**TS catalogs (PR [#30](https://github.com/panji-firmansyah/perantauglobal/pull/30) `ed660db`):**
- `packages/db/schemas/requirements/library.ts` — REQUIREMENT_LIBRARY (28 templates) grouped by category. Wired into Admin Position Builder via the new RequirementLibraryPanel.
- `packages/db/schemas/documents/index.ts` — DOC_TYPE_METADATA_SCHEMAS (10 doc types). Renders the right form fields per doc_type in the new DocumentUploadModal.

**Phase 3 UI shipped (PR [#31](https://github.com/panji-firmansyah/perantauglobal/pull/31)):**
- `apps/platform/src/lib/readiness.ts` — wraps `compute_readiness_v3` RPC. `getRequirementsWithStatus()` returns per-key pass/fail + the source RequirementDef so UIs can render forms-to-fill, not just display.
- `components/pg/DocumentUploadModal.tsx` — generic bottom-sheet modal driven by DOC_TYPE_METADATA_SCHEMAS. Renders text/select/date/number per `MetadataField`, promotes `is_expires_at` field to the column, dumps the rest to `metadata` JSONB. `prefillMetadata` prop for auto-derived values from `document_filter`.
- `(candidate)/profile/DocUploader.tsx` refactored to use the modal — KTP / paspor / foto / CV uploads now capture metadata. Switch from legacy `photo` to `formal_photo` with back-compat lookup.
- `(candidate)/applications/[id]/lengkapi/` — RequirementInlineForm per requirement: self_declared (radio against allowed_values, free text fallback), document (modal pre-filled with `document_filter`), either (both stacked).
- `(candidate)/applications/[id]/page.tsx` — live "Persyaratan posisi" section sourced from `compute_readiness_v3`, with "Lengkapi N persyaratan" CTA.
- `(admin)/admin/positions/[slug]/RequirementLibraryPanel.tsx` — one-click add/remove from REQUIREMENT_LIBRARY with category filter chips. Backed by `addRequirementToPosition` / `removeRequirementFromPosition` server actions that merge into the JSONB.

**Polish (PR [#?] this commit):**
- `RequirementsEditor` JSON schema hint updated v2 → v3.
- `FormFieldsEditor` exposes `collect_at_stage` selector (Saat apply / Screening / Doc check) — actions + page query both updated to roundtrip the column.
- `apps/platform/eslint.config.mjs` rewritten as ESLint 9 flat config (mirror of apps/web). Removes `@eslint/eslintrc` shim. `pnpm --filter platform lint` now runs cleanly. Fixed 1 collateral pre-existing `no-html-link-for-pages` in JobOrderForm.
- DocumentUploadModal restructured to mount-on-open via `SheetBody` extraction, eliminating `useEffect` setState reset pattern (cleaner React 19 idiom).

**User action items:**
- [ ] Smoke test PR #31 on Vercel preview (URLs in PR comments) — see chat for step-by-step.
- [ ] Apply migration 0023 (`photo → formal_photo` backfill) via Supabase MCP after smoke test passes.
- [ ] Optional follow-up: collect_at_stage filtering in apply flow (only show `applied`-stage fields/requirements upfront, defer rest to Lengkapi Lamaran).

---

## Phase S — Security hardening for PII readiness (2026-04-29) ✅ DONE

**Trigger:** Pre-flight check sebelum host PII serius (KTP, paspor, sertifikat) per PDP UU 27/2022. `/cso --comprehensive` audit produces 10 findings (3 P0, 4 P1, 3 P2) — full report di `.gstack/security-reports/2026-04-29-comprehensive-pii-readiness.md`.

**P0 shipped (PR [#21](https://github.com/panji-firmansyah/perantauglobal/pull/21) `4f004de`):**
- **Next.js 16.1.6 → 16.2.4** di kedua app. Patches GHSA-mq59-m269-xvcx (Server Actions CSRF bypass via null Origin, affect SEMUA admin action) + GHSA-q4gf-8mx6-v5v3 (DoS via Server Components). Plus pnpm override on `postcss<8.5.10`. `pnpm audit` zero vulnerabilities.
- **Migration 0017 admin_audit_log** — append-only table + `log_admin_action()` SECURITY DEFINER helper (gates via `is_admin()`, stamps `auth.uid()` + `auth.jwt().email`). PDP UU 27/2022 Pasal 35 compliance ("records of processing activities"). Wired ke 11 admin server actions: documents (view via signed URL, verify, reject), applications (stage, notes, reached_out, tier assign/clear), admin allowlist (invite, remove), inbox (status, notes). Pre-existing `application_status_history` trigger continues to log stage transitions in addition.
- **`/admin/audit-log` page** dengan filter (action, resource type, admin email, date range) + paginated 50/page. Sidebar entry "Audit Log" added.
- **Security headers** di kedua `next.config.ts`: HSTS (2yr, no preload), X-Frame-Options DENY, X-Content-Type-Options nosniff, Referrer-Policy strict-origin-when-cross-origin, Permissions-Policy disables camera/mic/geo. **CSP**: `apps/platform` enforce mode (Supabase + first-party only), `apps/web` Report-Only mode (GTM container can load arbitrary tags from marketing — flip to enforce after monitoring violations 1-2 weeks). Toggle constant `CSP_ENFORCE` in each file.
- **Side effect:** drop `apps/web/src/app/icon.svg` — Next.js 16.2.4 regression in `next-metadata-image-loader` (verified: even minimal valid SVG fails). icon.png + favicon.ico cover same use case.

**Cleanup follow-up:**
- **PR [#22](https://github.com/panji-firmansyah/perantauglobal/pull/22) `fcba505`** — Apply migration 0017 ke prod via MCP, regen TS types, drop semua `as never` casts. Bonus: bump `@supabase/ssr` `0.5.2 → 0.10.2`. ssr 0.5.2 declare `SupabaseClient<Database, SchemaName, Schema>` (3 generics) tapi supabase-js 2.104.0 udah upgrade ke 5 generics dengan slot `SchemaNameOrClientOptions`. Silent mismatch bikin SEMUA `.from(...)` jadi `never[]` dan `.rpc(...)` expected `args: undefined`. Lesson: kalau supabase-js bump, audit ssr version compat.
- **PR [#23](https://github.com/panji-firmansyah/perantauglobal/pull/23) `9dfdffd`** — Migration `0018_tighten_security_definer_grants`. REVOKE EXECUTE FROM PUBLIC + anon di `log_admin_action`, `is_admin`, `handle_new_auth_user`. Authenticated grants retained where server code requires (is_admin, log_admin_action). handle_new_auth_user revoked from authenticated too (trigger only).
- **PR [#25](https://github.com/panji-firmansyah/perantauglobal/pull/25) `62ec707`** — Migration `0019_set_search_path_on_functions`. ALTER FUNCTION ... SET search_path = public di 4 legacy functions (`set_updated_at`, `compute_readiness`, `log_application_stage_change`, `update_job_order_slot_filled`).

**Migrations applied to production:** 0017 + 0018 + 0019 (all via Supabase MCP). TS types regenerated; `Database["public"]["Functions"]["log_admin_action"]` and `Tables.admin_audit_log` now in `packages/db/src/types.ts`.

**Advisor state:** 8 warnings cleared this session. Sisa:
- 1 ERROR pre-existing (`security_definer_view` di `readiness_view` dari 0001 — view rewrite needed, deferred)
- 2 WARN intentional (`is_admin` + `log_admin_action` callable by authenticated — server code emang butuh, defensive coded)
- 4 WARN by-design (anon insert policies untuk form submission `WITH CHECK (true)` — correct karena anon gak punya auth context)
- 1 WARN config (`auth_leaked_password_protection` — Panji enable manual di Supabase dashboard → Auth → Settings → "Check passwords against HaveIBeenPwned")

**Strengths confirmed by audit (no action needed):**
- RLS comprehensive di 11 tabel sensitif, pattern `*_self_read` / `*_admin_all` konsisten
- Storage bucket `candidate-documents` private + MIME whitelist + 5MB cap + path-based ownership + verified-doc-undeletable
- `is_admin()` defense-in-depth dual-source (JWT claim OR `admin_users` allowlist)
- Pending submissions email-squat defense (24h nonce + trigger fires only on `email_confirmed_at` flip per migration 0012)
- Consents schema PDP-ready (purpose, version, granted_at/withdrawn_at, IP, UA captured)
- Service role never di browser code (verified)
- Secrets hygiene clean (no real leaks in git history; only placeholder `eyJ...` in markdown spec)

**Sprint 2 (P1/P2 deferred):**
- Rate limiting di `/api/contact` + `/api/lowongan/[slug]` (Upstash Ratelimit recommended)
- Hapus GET handler dari `/auth/sign-out` (CSRF logout vector)
- Zod `.max()` length caps untuk text inputs di public forms
- Confirm Supabase HIBP password check enabled (config gate above)
- Implement PDP rights flows: account deletion (Pasal 23), data export (Pasal 21), per-purpose consent revoke UI (Pasal 24)
- Define + enforce data retention policy (auto-delete `pending_submissions` >30 days, etc.)
- Incident response runbook (3x24h breach notification per Pasal 39-40)
- Branch protection rules + minimal CI security gate (`pnpm audit --audit-level=moderate` + secret scan)

**User action items (not in repo, manual):**
- [ ] Enable HIBP leaked-password check di Supabase dashboard → Auth → Settings
- [ ] Smoke test admin doc view triggers audit log entry visible at `/admin/audit-log`
- [ ] After 1-2 weeks of clean CSP violation reports on www, flip `apps/web/next.config.ts` `CSP_ENFORCE = true`

---

## Phase 2 — Job Orders + Admin CRM essentials (2026-04-23) ✅ DONE

**Migrations applied to production Supabase:**
- `0009_job_orders_and_phase2_tables`: 4 new tables (`job_orders`, `position_form_fields`, `application_tiers`, `application_status_history`) + auto-history trigger + auto-slot-counter trigger + RLS for each
- `0010_candidate_documents_storage`: Supabase Storage bucket `candidate-documents` (5MB cap, jpg/png/heic/webp/pdf) + RLS path-based + `rejected_*` columns on `candidate_documents`
- `0011_reseed_positions_2026_04`: 13 positions seeded per FEEDBACK PDF (6 new posisi: waitress, chef-bakery, spa-therapist, laundry, pengolahan-makanan, caregiver-taiwan, spg-indonesia). Deactivated `global-talent-hub` (now THE app, not a position).
- TS types regenerated via Supabase MCP into `packages/db/src/types.ts`.

**Admin CRM new pages (apps/platform):**
- `/admin/positions` — read-only list of 13 positions + open job_order count + total apps. Per-row "Buat JO" CTA.
- `/admin/positions/[slug]` — detail with requirements list, custom form fields list, job orders for this position. CRUD UI for positions catalog deferred (do via SQL for now).
- `/admin/job-orders` — list with status filter chips (open/filled/closed/cancelled), slot progress bar per row.
- `/admin/job-orders/new` — create wizard with all fields: position picker, internal+public employer name, city, intake label, slot count, deadline, public description override, internal notes.
- `/admin/job-orders/[id]` — detail with slot meter, employer info, applicants list (filtered by `job_order_id`), status controls (radio), internal notes editor.
- `/admin/documents` — review queue with filter chips (pending/verified/rejected) + counts. Per-row: signed-URL viewer (60s TTL via service-role server action), Verify, Tolak (with reason).

**Tier scoring:**
- `TierPicker` component (A/B/C/D/rejected) added to `ApplicationCard` — shown wherever admin sees applications (candidate detail page).
- `assignTier` + `clearTier` server actions in `/admin/actions.ts`. Upserts into `application_tiers`.
- Candidate detail query joins `application_tiers (tier)` so the picker shows current state.

**Status history (real backing):**
- `log_application_stage_change()` trigger auto-writes to `application_status_history` on every `pipeline_stage` UPDATE.
- Existing 192 applications backfilled with one "applied" entry from `created_at`.
- Candidate `/applications/[id]` timeline now reads from `application_status_history` (real data) with `public_note` shown as "Dari recruiter" callout.

**Document upload (candidate side):**
- `DocUploader` client component in `/profile`. Uploads via `supabase.storage.from('candidate-documents').upload()` to path `<candidate_id>/<doc_type>/<filename>`, then INSERTs row to `candidate_documents`.
- Status per doc_type (KTP, Passport, Foto, CV) computed server-side: missing/pending/verified/rejected (with reason).
- 5MB cap, accepts jpg/png/heic/webp/pdf.

**www ↔ DB live overlay:**
- `apps/web/src/lib/positions-db.ts` — `fetchOpenJobOrders()` + `mergePositionsWithJobOrders()` server-side helpers.
- Homepage, `/lowongan` index, `/lowongan/[slug]` now overlay live `job_orders.status='open'` data on the static catalog. ISR 60s.
- Position detail shows real batch label, slot_filled/slot_count, deadline when JO open.

**Admin sidebar nav updated:** Overview · Job Orders · Posisi · Kandidat · Lamaran · Review Dokumen.
**Admin overview** shows 5 stat cards (kandidat, lamaran, JO buka, doc pending, pending verifikasi) + 6 quick action cards.

**Verified:**
- `pnpm --filter @perantauglobal/web build` ✅ — 13 SSG lowongan slugs with ISR
- `pnpm --filter @perantauglobal/platform build` ✅ — 18 routes incl. 6 new admin
- TypeScript clean

**Not in scope (Phase 3+):**
- Position catalog CRUD UI (currently SQL-only)
- Custom form field editor UI (currently SQL-only)
- Pipeline kanban view (drag-drop) — listed in design but list view sudah cukup operate-able
- Apply flow Step 1-5 wizard (currently still one-click)
- Admin team management UI
- Email broadcast on job order close
- Analytics dashboard
- WhatsApp integration (Meta Cloud API)

---

## Phase R — Big Redesign (2026-04-23) ✅ DONE

Source: SPEC.md + Claude Design handoff (`design/perantauglobal-v2/`).

**Design system (red-dominant, anti-editorial, mobile-first low-skilled-worker UX):**
- New token set in both apps: `pg-red-{50,100,200,500,600,700,800}` + `pg-ink-*` + `pg-ok/warn/err/info` + `pg-paper`
- Plus Jakarta Sans 400-800 jadi font primary (was Source Sans)
- Shared UI primitives: `Icon` (43 inline-SVG Phosphor-style), `Button/ButtonLink` (primary/ghost/dark, block, 52px tap target), `Badge` (5 variants), `Chip`, `Card`, `RedHero` (typographic position header)
- Located: `apps/{web,platform}/src/components/pg/`

**apps/web — full content rebuild:**
- `(main)/layout.tsx` → `TopBarWWW` + new `Footer` (no WhatsApp anywhere)
- Homepage (`/`) — red-accent hero, lowongan grid pulled from `lib/positions.ts`, "Cara kerja 4-step" black block, FAQ
- `/lowongan` index — NEW route, 13 positions, country chips, badge "Lagi buka" vs "Daftar antrian"
- `/lowongan/[slug]` — dynamic route w/ generateStaticParams (13 SSG pages), data from `lib/positions.ts` + `lib/positionDetails.ts`. Apply form sticky CTA + sidebar form on desktop. **Copy fixed per Mas Martin feedback**: "Saudi Arabia" general (bukan Riyadh-specific), "diterima setiap bulan" bukan "tanggal 27", "bebas biaya sebelum offering letter" bukan "tanpa biaya kandidat", no training claims, no fake testimonials/slot/deadline.
- `/talent-hub` — NEW (renamed from `/program/global-talent-hub`). Position GTH as THE app, not a program. Includes "training Global Talent Ready (coming soon)" callout
- `/lowongan/spg-indonesia` — SPG re-treated as domestic lowongan (not separate program)
- Secondary pages rebuilt: `tentang`, `tim`, `proses` (5-step generic), `layanan`, `faq` (3-group accordion), `kontak` (email-only ContactForm)
- **DELETED:** `/destinasi/*` (info merged into lowongan), `/blog/*` (no content strategy yet), `/cerita-sukses` (testimonials need real ones), `/program/*` (replaced by `/lowongan` + `/talent-hub`), `/design-system`, all old editorial component packages (`components/{editorial,home,destinasi,blog,layanan,faq,kontak,proses,tentang,tim,program,mdx}`), `lib/{mdx,form-utils}`, `apps/web/content/`, `messages/{id,en}.json` no longer used
- **Redirects added** in `next.config.ts`: `/program/* → /lowongan/* | /talent-hub`, `/destinasi/* → /lowongan`, `/blog/* → /`, `/cerita-sukses → /`
- Sitemap rewritten — no more MDX content discovery; static pages + 13 lowongan slugs
- API: `/api/lowongan/[slug]` SLUG_MAP expanded to all 13 positions, consent text de-WhatsApp'd. `/api/program` removed.

**apps/platform — full UI rebuild (data layer untouched):**
- Globals.css with same pg-* tokens, Plus Jakarta Sans loaded via Next font
- `TopBarApp` + `BottomNav` (4-item: Beranda/Jelajah/Lamaran/Profil) + `ApplyHeader` + `StickyCTA`
- Candidate `/dashboard` — profile completion ring, 4-stage user-visible application badges (mapped from 13 internal stages per SPEC.md §3.8), top-3 cocok carousel
- Candidate `/profile` — header w/ initials, Data diri table, Dokumen placeholders ("Coming soon"), `ProfileForm` with 6 credential fields (was 10) styled with new radio cards
- Candidate `/explore` — pill tab "Semua / Lolos syarat", top-match red hero card + smaller cards, profile-empty warning callout
- Candidate `/applications` — NEW list route (bottom-nav target)
- Candidate `/applications/[id]` — 4-stage progress bar + timeline + redesigned `AnswersForm`
- `/auth/sign-in` — full redesign: red top ribbon, large heading, mail-icon input, info banner, success state with red-circle envelope motif + "Cek email" copy
- Admin sidebar — dark slate w/ white text, red-accent active state
- Admin `/admin` overview — 3 stat cards + quick action cards + "coming soon" callout for SPEC §6 features (Job Orders, Kanban, Doc Review, Tier, Analytics, Team)
- Admin `/admin/candidates` list + `/admin/applications` list — restyled tables with new tokens, search/filter components rebuilt
- Admin candidate detail — initials avatar header, badge for auth status, 2-col layout (bio aside + applications)
- Admin action components: `StageSelector`, `NotesEditor`, `ReachOutToggle`, `ApplicationCard`, `ApplicationFilters`, `CandidateFilters` — all rebuilt with pg-* tokens

**Design source stashed:** `design/` folder at repo root contains the full Claude Design export (README, chats, project JSX/CSS/HTML) for future reference.

**Verified:**
- `pnpm --filter @perantauglobal/web build` ✅ — 33 routes generated incl. 13 SSG lowongan slugs
- `pnpm --filter @perantauglobal/platform build` ✅ — 14 routes
- TypeScript clean in both apps

**Known gaps (Phase 2+ per SPEC.md):**
- DB migration for `job_orders`, `position_form_fields`, `application_tiers`, `application_status_history`, `candidate_documents` UI
- Admin CRUD UI for positions + job orders + custom form fields + document review queue + tier assignment + analytics + team management
- Apply flow Step 1-5 wizard (currently still goes via `applyToPosition` server action from /explore)
- Document upload (Supabase Storage)
- Notifications inbox
- Cleanup of deprecated DB columns (e.g. `applications.role_data`)

---

## Where we are (handoff snapshot)

**Latest commit on main:** `2036269` — feat(web): Phase C — strip forms to bio-only

**Talent pool flow LIVE on prod:**
1. User submits bio-only form at `www.perantauglobal.com/lowongan/[slug]` (or `/program/global-talent-hub`)
2. `/api/lowongan/[slug]` writes legacy gt-tools + shadow pending_submission, triggers `signInWithOtp` (implicit flow)
3. Magic-link → `app.perantauglobal.com/auth/confirm` (hash fragment → setSession)
4. Trigger `handle_new_auth_user` materializes candidate + application with profile_data v2 shape `{schema_version:1, credentials:{}, onboarding:{}}`
5. User lands on `/dashboard` → banner "Lengkapi profil" → fills `/profile` (10 credential fields) → saves
6. Application detail `/applications/[id]` shows requirements with hard/soft badges + readiness meter

**E2E smoke test passed** 2026-04-22/23 via `panjifrmansyah+test5@gmail.com` (alias trick, since admin email auto-redirects to /admin).

**PRs merged this sprint:**
- [#2](https://github.com/panji-firmansyah/perantauglobal/pull/2) `cd84fb9` — cutover + migration 0005 + portal core
- [#3](https://github.com/panji-firmansyah/perantauglobal/pull/3) `a839dc5` — migration 0006 (trigger v2)
- [#4](https://github.com/panji-firmansyah/perantauglobal/pull/4) `728a4c1` — drop candidates.phone UNIQUE
- [#5](https://github.com/panji-firmansyah/perantauglobal/pull/5) `2036269` — Phase C strip forms

**Gotchas learned (may bite next session):**
- Supabase `merge_branch` via MCP does NOT reliably persist schema changes to main. 0006 + 0007 both had to be re-applied directly via `apply_migration` after branch merge "succeeded". Future: apply migrations directly after branch test, OR verify constraint state post-merge before trusting.
- `candidates.phone` UNIQUE dropped — talent pool allows phone collisions (family share devices, same person multi-email).
- `role_data` column on `pending_submissions` + `applications.answers` still receives data from legacy forms during transition. After Phase C, role_data = `{}` always. Can drop column in Phase 2 sunset.

---

## Current phase

**Phase 0 — Foundation** ✅ DONE
- [x] Supabase project `perantauglobal` created (Dayalima Group Pro, `jeadtvxgxmqnsqwxjmhj`, ap-southeast-1)
- [x] Initial migration `0001_initial_schema.sql` applied (6 tables, RLS, triggers, readiness view)
- [x] Monorepo scaffolded (pnpm + Turborepo)
- [x] `apps/web/` ported from legacy `~/Developer/perantauglobal.com/` (17MB, minus node_modules)
- [x] `apps/web/package.json` renamed to `@perantauglobal/web`
- [x] `apps/web/tsconfig.json` extends monorepo base

**Phase 1 — Platform Core** 🚧 IN PROGRESS
Focus: working dev env + bridge apps/web to new Supabase + build apps/platform MVP.

**Phase 1.5 — Cutover prep** 🚧 IN PROGRESS
Finishing wiring + user-action items before flipping DNS to the new stack.
- [x] GTH form → `signInWithOtp` (2026-04-22, `GTHForm.tsx`)
- [x] Truck-driver — already wired via `LowonganForm` (lives under `/lowongan/truck-driver-jepang`, not `/program/truck-driver`)
- [x] SPG — deferred (legacy-only until SPG position seeded w/ custom scoring; Task 10 Phase 2)
- [x] **USER ACTION**: Supabase Auth → URL Configuration → Redirect URLs added (2026-04-22):
  - `http://localhost:3000/**`, `http://localhost:3100/**`, `http://localhost:3200/**`, `https://app.perantauglobal.com/**`
- [ ] Run backfill (Task 9) — `--dry-run` first, inspect, then `--apply`
- [ ] Customize Supabase magic-link email template (DTG branding)
- [x] Vercel projects (2026-04-22): `perantauglobal-web` + `perantauglobal-platform` created in Dayalima Group team
  - Both linked to `panji-firmansyah/perantauglobal` GitHub repo, rootDirectory set, framework=nextjs
  - Env vars pushed (sensitive = sensitive type, rest encrypted)
  - `turbo.json` updated with `globalEnv` so Turbo passes env vars through to builds
  - Preview deployments: both READY (web + platform), behind Vercel SSO protection
  - First web preview: `perantauglobal-m77gtdstd-dayalima-group.vercel.app`
  - First platform preview: `perantauglobal-platform-d7e73abxt-dayalima-group.vercel.app`
  - Future pushes to `main` → prod deployments (no DNS yet)
  - Future branch pushes → preview deployments
- [x] **Production cutover — COMPLETE** (2026-04-22):
  1. [x] `app.perantauglobal.com` → NEW platform (live)
  2. [x] `dashboard.perantauglobal.com` → retired (404)
  3. [x] `perantauglobal.com` + `www.perantauglobal.com` → NEW web (Dayalima Group)
  4. [x] Supabase Auth Site URL set to `https://app.perantauglobal.com`
  5. [ ] Customize Supabase magic-link email template (DTG branding) — deferred Phase 2
  6. [ ] Delete `SUPABASE_SERVICE_ROLE_KEY` from apps/web — deferred Phase 2 (kept for legacy dual-write)
  7. [ ] Remove legacy `/api/lowongan/[slug]` + `/api/program/[slug]` legacy write paths — deferred Phase 2
  8. [ ] Archive `gt-tools` Supabase project — deferred Phase 2 (keep 3 months)

**Phase A — Schema v2 (requirements + readiness)** ✅ DONE 2026-04-22
- Migration 0005: positions.requirements → typed `{type:hard|soft, label, allowed_values?}`
- `compute_readiness()` rewritten to return JSONB `{per_field, hard_pass, score_pct}`
- `readiness_view` gains `hard_pass` + `completion_pct` columns
- `candidates.profile_data` migrated to v2 `{schema_version, credentials, onboarding}`
- Hand-tuned hard/soft per 7 positions (talent-pool MVP intuition; program PIC session to refine later)

**Phase B — Portal core** ✅ DONE 2026-04-22
- B.1: web browser client switched to implicit flow; new `/auth/confirm` client page handles hash-fragment tokens → setSession → /dashboard
- B.2: `/profile` page (10-field credential editor, mobile-first, sticky save)
- B.3: `/applications/[id]` page (requirements list with hard/soft badges + answers form: motivation/earliest_start/visa_status/referral)
- B.4: `/dashboard` rebuilt mobile-first (profile completion banner, readiness bar per app, sticky bottom nav)
- B.6 hotfix: migration 0006 — trigger writes profile_data v2 shape (was writing flat v1)
- B.7 hotfix: migration 0007 — drop `candidates_phone_key` UNIQUE (was blocking trigger on phone collisions from backfilled candidates)

**Phase C — Strip www forms to bio-only** ✅ DONE 2026-04-23
- LowonganForm: dropped `roleFields` prop + checkbox logic → bio-only (7 fields)
- GTHForm: dropped current_status/interested_country/has_lpk → bio + education (5 fields)
- 6 lowongan Content components + lowongan/index.ts: remove `FormFieldConfig` references
- API routes unchanged (accept `role_data: {}` cleanly)

---

## Next session — pick up here

### Perf — sisa punch list (mid-impact, after region pin + parallelize)
Region pin ke `sin1` + `Promise.all` di candidate dashboard/explore udah shipped via PR [#20](https://github.com/panji-firmansyah/perantauglobal/pull/20) (commit `a753f41`). Sisa item dari audit, urut prioritas:
1. **Suspense streaming di apps/web** — 0 `<Suspense>` boundary saat ini; pages block on all data sebelum render. Wrap data-fetching sections (homepage, /lowongan, /lowongan/[slug]) di `<Suspense fallback={<Skeleton />}>` biar shell muncul progressive. Estimasi: 200-400ms perceived improvement.
2. **Compress hero image** — `apps/web/public/images/home-hero.jpg` 2.75 MB JPEG (2752x1536). Generate WebP/AVIF variant atau reduce resolution. `next/image` udah dipakai dengan `priority` flag, source-nya yg kegedean.
3. **`unstable_cache` untuk expensive Supabase views** — `readiness_view` join pricey kalau dipanggil tiap request. Wrap di `unstable_cache()` dengan TTL 30-60s. Skip kalau Phase D bawa requirement real-time match update.
4. **Audit middleware latency** — `apps/platform/src/middleware.ts:34` panggil `supabase.auth.getUser()` di setiap request. Setelah region pin udah co-located, harusnya cepet, tapi worth profile sekali.

### Phase D (~2 days) — Multi-position apply "magic"
1. `apps/platform/src/app/(candidate)/explore/page.tsx` — rank all active positions by readiness % for current candidate. Filter: hard-pass only / all. One-click Apply CTA per card.
2. Server action `applyToPosition(positionSlug)` — INSERT applications row with `answers: {}`, `pipeline_stage: 'applied'`. Unique constraint `(candidate_id, position_slug)` handles double-click.
3. Dashboard enhancement: show top 3 matched positions preview card + "Lihat semua" CTA to /explore.
4. Add `/explore` to bottom nav label (currently "Jelajah" — confirm wording).
5. E2E: test user with filled profile → /explore shows ranked list → one-click apply → dashboard shows new application row.

### Phase 2 polish (after Phase D, or parallel)
- [x] **Phase 2A — dual-write sunset (2026-04-23):**
  - `/api/lowongan/[slug]` + `/api/program/[slug]` no longer write to gt-tools; new Supabase is canonical. Fire-and-forget shadow → strict result. Route returns 500 if `pending_submissions` insert fails.
  - `shadow-write.ts` → renamed `pending-write.ts`; fn `shadowPendingSubmission` → `writePendingSubmission`, returns `{ ok, pendingId } | { ok: false, error }`.
  - `/api/program/[slug]` simplified to GTH-only (truck-driver dead code removed; truck-driver lives at `/lowongan/truck-driver-jepang`). GTH `required` list trimmed to match Phase C bio-only form — fixes latent 400 from stale `currentStatus/interestedCountry/hasLPK` requirement.
  - `insertToSupabase` helper + `role_data` field removed.
  - Dead `apps/web/src/app/[locale]/auth/callback/` deleted (unreachable post-implicit-flow).
- [x] **Phase 2B — service_role sunset (2026-04-23):**
  - Migration 0008 — new tables `contact_submissions` + `employer_inquiries` on new Supabase (anon INSERT, admin SELECT/UPDATE via `is_admin()`).
  - `/api/contact` + `/api/employer-inquiry` rewired to `supabaseV2()` anon client.
  - `/daftar` page + `RegisterForm` + `/api/register` + `DaftarHero` **deleted** (redundant with GTH talent-hub funnel). `/daftar` → `/program/global-talent-hub` permanent redirect added. All 5 `/daftar` CTA refs across layanan/cerita-sukses/faq/tim/proses + nav ctaHref + mobileSticky formAnchor updated.
  - `/program/spg` form **paused** — `SPGSmartForm.tsx` replaced with waitlist notice + WhatsApp CTA. `spg-form/` subdir (FormStep1-4, Success/StopScreen, FormProgress, types.ts with SCORE_WEIGHTS) deleted. `/api/program/spg` route deleted. SPG program IP in git history, ready for Phase 2 re-wire when position seeded with 7-dimension scoring.
  - `apps/web/src/lib/supabase.ts` (service_role client) **deleted**.
  - `apps/web/.env.example` cleaned: legacy `SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY` removed; only anon-key envs remain.
  - **USER ACTION:** delete `SUPABASE_SERVICE_ROLE_KEY` + `SUPABASE_URL` (legacy) from Vercel `perantauglobal-web` project env after this PR lands.
- Customize Supabase magic-link email template (DTG branding via Resend template) — user action, Supabase dashboard
- Archive gt-tools Supabase — user action, after 2-3 weeks prod observation

### Features waiting for Panji direction (not yet planned)
- Copywriting / content review for new portal flow
- WhatsApp reminder automation (Meta business verification dependency)
- Program PIC session → fine-tune requirements hard/soft per position
- SPG re-wire with custom 7-dimension scoring
- BP2MI SISKOP2MI integration (Phase 2 compliance)

## Historical tasks (completed; reference only)

### TASK 1: Verify dev env ✅ DONE (2026-04-21)
- `pnpm install` — 676 packages, 34s
- `pnpm --filter @perantauglobal/web build` — sukses setelah 2 fix:
  1. `apps/web/tsconfig.json` → set `"noUncheckedIndexedAccess": false` (legacy port; strict base kept for new packages/apps)
  2. `.env.local` copied from legacy `~/Developer/perantauglobal.com/.env.local` (still points at `gt-tools` until Task 6)
- Dev: `pnpm exec next dev --port 3100` (legacy server was on 3000) → homepage HTTP 200, title correct.

### TASK 2: Create GitHub repo + push monorepo ✅ DONE (2026-04-21)
- Repo: https://github.com/panji-firmansyah/perantauglobal (private)
- 217 files, initial commit on `main`. Only `.env.example` committed (no secrets).

### TASK 3: Link 2 Vercel projects in Dayalima Group Pro team
- Create Vercel project `perantauglobal-web` → root `apps/web`, team: Dayalima Group
- Create Vercel project `perantauglobal-platform` → root `apps/platform`, team: Dayalima Group
- Copy env vars from old `dtg-website` Vercel project → new `perantauglobal-web`
- Don't point DNS yet — preview deployments only until cutover

### TASK 4: `packages/db` client + types ✅ DONE (2026-04-21)
- `src/types.ts` — generated Supabase types via MCP
- `src/client.ts` — `createBrowserClient(url, anonKey)` browser/edge anon
- `src/server.ts` — `createServerClient` (per-request anon, optional user JWT) + `createServiceRoleClient` (edge fn / CLI only)
- `src/index.ts` — re-exports
- `schemas/positions/common.ts` — `sharedCandidateSchema`, `definePosition()` helper
- `schemas/positions/*.ts` — 6 lowongan + GTH (barista/waiter-SA, perawat-SA, kaigo/food-service/truck-driver-JP, global-talent-hub)
- `schemas/positions/index.ts` — `positions` registry + `getPosition(slug)`
- Skipped for now: dental-nurse, spa-therapist, caregiver-taiwan (not yet on apps/web), SPG (custom scoring — add when needed)
- `apps/web` deps: added `@perantauglobal/db` (workspace:*) + `zod`
- Typecheck + build both green.

### TASK 5: Seed positions ✅ DONE (2026-04-21)
- Migration `0002_seed_positions.sql` — idempotent upsert by slug
- Applied via MCP `apply_migration`
- 7 positions active (6 lowongan + GTH). Requirement keys verified 1:1 against Zod.
- Dental nurse, spa therapist, caregiver-taiwan NOT seeded (not yet on apps/web; add when pages ported)

### TASK 6: Refactor `apps/web` forms → new Supabase + RLS pattern 🚧 PHASE 1 DONE (2026-04-22)
**Dual-write shadow** (risk-adjusted: legacy gt-tools remains source of truth; new Supabase accumulates shadow data for shape/volume verification before cutover):
- `apps/web/src/lib/supabase-v2.ts` — server anon client to new project (SUPABASE_URL_V2 + SUPABASE_ANON_KEY_V2)
- `apps/web/src/lib/shadow-write.ts` — `shadowPendingSubmission()` helper. Client-generated UUID (avoids SELECT policy requirement), inserts `pending_submissions` + linked `consents` via anon key / RLS.
- Wired into:
  - `/api/lowongan/[slug]/route.ts` — after legacy insert, `waitUntil(shadowPendingSubmission(...))` for all 6 lowongan
  - `/api/program/[slug]/route.ts` — same, mapped via `PROGRAM_TO_POSITION_SLUG` (truck-driver → truck-driver-jepang, global-talent-hub → global-talent-hub)
- **Not yet wired**: SPG (`/api/program/spg`), generic register (`/api/register`), contact/employer-inquiry (intentional — not position-specific)
- Verified end-to-end: POST /api/lowongan/perawat-saudi-arabia → row in `pending_submissions` (Supabase) with role_data JSONB + 1 linked consent (`application_processing`, version 2026-04-22).

**Phase 2 (needs Task 7 edge function + Supabase Auth SMTP)** — convert to magic-link-primary flow:
- Remove `shadow` nomenclature; `/api/apply` becomes canonical
- Add `signInWithOtp` call after pending_submission insert
- Edge function `handle-magic-link-verify` materializes candidate + application on click
- Delete legacy routes + `SUPABASE_SERVICE_ROLE_KEY` from apps/web entirely

### TASK 7: Magic-link materialization ✅ DONE (2026-04-22)
Implemented as a **PostgreSQL trigger on auth.users INSERT** (simpler than edge function — no deploy, no cold start, transactional).

**Infra:**
- Resend account + API key (sender: `noreply@perantauglobal.com`, Vercel DNS auto-config)
- Supabase Auth → Custom SMTP: smtp.resend.com:465, user `resend`, password = Resend API key
- URL Configuration: localhost:3000 + `/**` redirect allowlist for dev

**DB (migration 0003):** `handle_new_auth_user()` rewrites the stub from 0001:
- Finds most recent unconsumed `pending_submissions` for email
- Upserts `candidates` (new insert OR additive merge on existing), sets `auth_user_id`, source = 'magic_link'
- Loops all unconsumed pendings for email → inserts `applications` (unique candidate+position dedupes), links `consents.candidate_id`, merges `profile_data` additively, marks `consumed_at`
- Fallback: no pendings → legacy email-link path

**apps/web:**
- `src/lib/supabase-browser-v2.ts` — singleton browser client (PKCE state stays coherent)
- `LowonganForm.tsx` calls `signInWithOtp` after successful form POST; shadow-write switched from `waitUntil` to `await` (fixes race: consent must commit before trigger reads it)
- `src/lib/shadow-write.ts` explicitly sets `consents.granted_at = NOW()` (col had no default)
- `src/app/[locale]/auth/callback/page.tsx` + `CallbackClient.tsx` — handles PKCE `?code=` and implicit `#access_token` flows; renders "Verifikasi berhasil" on success
- Success screen copy updated: "📩 Kami juga kirim tautan verifikasi ke email kamu..."

**E2E verified (2026-04-22):** form submit → email arrives via Resend → click link → auth.users INSERT → candidates + applications + linked consents all materialized in one transaction.

**Open items (Phase 2):**
- Wire `signInWithOtp` into program forms (`/api/program/[slug]`) — currently only lowongan
- Wire SPG (`/api/program/spg`)
- Customize Supabase magic-link email template (DTG branding)
- Test with real PMI email providers (Gmail Indonesia, Yahoo) for deliverability
- **Cross-subdomain session sharing**: Post-cutover, forms on `www.*` trigger `signInWithOtp` with PKCE. Code verifier stored in localStorage on www, so pointing `emailRedirectTo` at `app.*` breaks exchange. Current workaround: redirect stays on `www.*/auth/callback` (same origin), session established on www only — user must re-sign-in on `app.*`. Real fix: switch web browser client to `@supabase/ssr` with cookie `Domain=.perantauglobal.com`, OR trigger magic-link server-side via `admin.generateLink` from `/api/lowongan` (no PKCE).

### TASK 8: `apps/platform` scaffold ✅ DONE (2026-04-22)
Next.js 16 + @supabase/ssr + route groups.

- `apps/platform/package.json` — `@perantauglobal/platform`, dev on `:3200` (web is 3000, legacy 3100)
- Route groups:
  - `app/(candidate)/dashboard/page.tsx` — candidate portal shell. Queries `candidates` by `auth_user_id` + lists `applications` with joined `positions`. Redirects admin → `/admin`, anon → `/`.
  - `app/(admin)/admin/page.tsx` — CRM overview with 3 stats (kandidat, applications, pending). Redirects non-admin → `/dashboard`.
- `app/page.tsx` — root router: no session → perantauglobal.com/lowongan, admin → /admin, candidate → /dashboard
- `src/lib/supabase-server.ts` — `createServerClient()` via @supabase/ssr with cookie-based PKCE, `getSessionAndRole()` reads JWT `app_metadata.role` (defaults to candidate)
- `src/middleware.ts` — refreshes session cookies on every request so server components see auth reliably
- `tsconfig.json` extends base, `noUncheckedIndexedAccess: false` (consistent with web for pragmatic DX)
- `.env.local` seeded, `.env.example` committed
- Typecheck + build green (4 routes: `/`, `/admin`, `/dashboard`, `/_not-found`)
- **Not wired yet**: admin role elevation (need Supabase Auth hook to set `app_metadata.role = 'admin'` for seeded admin emails)

### TASK 9: Backfill script ✅ DONE (2026-04-22) — ready to run
- `packages/db/scripts/backfill.ts` — tsx-runnable CLI
- Reads 3 legacy tables: `candidate_applications` (lowongan), `tdp_registrations` (truck-driver), `gth_registrations` (GTH)
- Transforms → dedupes by lowercased email → merges applications per candidate
- Inserts into `candidates` + `applications` + synthetic `consents` (backfill version marker) via target service role
- Idempotent: `source = 'backfill_gt_tools'` marks imported rows; re-run skips (override with `--force`)
- Flags: `--dry-run` (default), `--apply`, `--force`, `--table=<X>`, `--limit=<N>`
- Not imported: `spg_applicants` (custom scoring, port via Task 10), `registrations` (schema unclear — revisit if needed)

**To run** (when ready — needs both service role keys):
```bash
cd ~/Developer/perantauglobal
GT_TOOLS_URL=https://piopuidmmzvewjeeezfv.supabase.co \
GT_TOOLS_SERVICE_ROLE_KEY=<legacy_key> \
SUPABASE_URL=https://jeadtvxgxmqnsqwxjmhj.supabase.co \
SUPABASE_SERVICE_ROLE_KEY=<new_key_from_supabase_dashboard> \
pnpm --filter @perantauglobal/db backfill -- --dry-run --limit=10
```
Inspect output → if happy, swap `--dry-run` for `--apply`. Drop `--limit` for full run.

### TASK 10: Admin CRM ✅ DONE (2026-04-22) — Option A (thin rebuild, native schema)
Chose Option A after survey (not full port with adapter — avoids tech debt). Legacy had ~3.5k LOC + hardcoded admin auth + per-program tables, all incompatible with new unified schema.

**DB (migration 0004):**
- `admin_users` table (email-keyed) + seed for panji
- `is_admin()` SQL function (JWT role OR admin_users match)
- All protected RLS policies swapped from hardcoded `auth.jwt() ->> 'role' = 'admin'` to `is_admin()`
- Generated types regenerated

**apps/platform routes:**
- `/auth/sign-in` + `SignInForm` — magic-link OTP entry
- `/auth/callback` (route handler) — PKCE code exchange, sets cookies, redirects to `/`
- `/admin` (layout-enforced) — overview stats (kandidat, applications, pending)
- `/admin/candidates` — search + paginated list (ilike name/email/phone, 25/page)
- `/admin/candidates/[id]` — bio + profile_data JSONB + applications list with inline stage editor, notes, outreach toggle
- `/admin/applications` — pipeline list filter by stage + position, 40/page
- `(admin)/layout.tsx` — enforces `role=admin` redirect; anon → `/auth/sign-in`, candidate → `/dashboard`

**Shared components:** Sidebar, SignOutButton, CandidateFilters, ApplicationFilters, ApplicationCard, StageSelector, NotesEditor, ReachOutToggle

**Server actions:** `updateApplicationStage`, `updateApplicationNotes`, `toggleReachedOut` — all assertAdmin + revalidate

**`getSessionAndRole()` updated:** Calls `is_admin()` RPC under user JWT → boolean → role

**Phase 2 TODO:**
- Add platform callback URL (`http://localhost:3200/**` + prod) to Supabase redirect allowlist
- Port SPG scoring logic (7 dimensions) — defer until SPG form re-wired into new positions system
- Kanban/board view across stages (currently just filtered list)
- CSV export
- Bulk stage update
- Audit timeline (who changed stage, when, from → to)

---

## Critical decisions (locked from previous session)

Don't revisit these without strong reason — they were reviewed via `/plan-eng-review` + outside voice.

1. **2 apps** (web + platform unified with route groups), NOT 3
2. **Hybrid schema**: core bio normalized on `candidates`, shared credentials in `candidates.profile_data` JSONB, application-specific in `applications.answers` JSONB
3. **Anon key + RLS policies** everywhere; service role ONLY in edge functions + migrations + triggers
4. **Auth**: email magic link primary (Resend SMTP), Twilio SMS fallback. WhatsApp deferred to Phase 2.
5. **Migration strategy**: backfill-once + switch. `gt-tools` read-only archive for 3 months.
6. **PDP compliance day 1**: `consents` table with per-purpose + version tracking
7. **BP2MI SISKOP2MI integration**: Phase 2 (compliance risk noted)
8. **Email squat defense**: `pending_submissions` + nonce. Never pre-create candidate from form.

---

## Deferred (Phase 2+)

- Learning modules + progress tracking
- WhatsApp OTP (Meta Cloud API after business verification)
- BP2MI SISKOP2MI integration
- Multi-admin roles (recruiter vs manager)
- Real-time notifications
- Native mobile app (PWA first)
- Employer EN portal rebuild
- Readiness as materialized view (only if current view gets slow)

---

## Known risks / concerns

| # | Risk | Mitigation |
|---|------|-----------|
| 1 | Email deliverability to Indonesian Gmail/Yahoo 10-20% bounce | Use Resend/Postmark from day 1 (not Supabase default SMTP) |
| 2 | WhatsApp deferral may miscalibrate MVP for PMI audience | Measure email magic link conversion at week 4. If <70%, pull WhatsApp into Phase 1.5 |
| 3 | 6-week timeline ambitious | Track weekly, adjust scope if slipping |
| 4 | BP2MI audit before Phase 2 | Get legal review of current data model against P3MI obligations |
| 5 | JSONB schema drift across positions | `profile_schema_version` field + Zod migrator runner (build in Phase 2) |

---

## References

- Legacy website: `~/Developer/perantauglobal.com/` (port source, keep running until cutover)
- Legacy admin: `~/Developer/dashboard.perantauglobal.com/` (port source for apps/platform admin)
- Old Supabase (archive after cutover): `gt-tools` (`piopuidmmzvewjeeezfv`) in personal org
- Design system source: [DESIGN.md](./DESIGN.md)
- Brand voice + ICP: `~/Cowork/memory/brands/dtg/`
