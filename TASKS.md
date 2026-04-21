# Perantau Global — Active Tasks

Session handoff. Next Claude Code session yang baca file ini harus tau exactly where to pick up.

**Last updated:** 2026-04-21 (dev env verified)

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

---

## Next session punch list (pick up here)

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
- Once apps/platform exists: point `emailRedirectTo` at `app.perantauglobal.com/dashboard` not localhost callback

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

### TASK 9: Backfill script `packages/db/scripts/backfill.ts`
Connects to both Supabase projects (old `gt-tools` via service role, new `perantauglobal` via service role — CLI only). Reads 4 old tables, dedupes by (email, phone), maps to new schema, inserts. Dry-run flag mandatory.

### TASK 10: apps/platform admin — port from legacy dashboard
Source: `~/Developer/dashboard.perantauglobal.com/`. Copy to `apps/platform/app/(admin)/`. Refactor config-driven `programs.ts` to query new schema (applications + positions + candidates).

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
