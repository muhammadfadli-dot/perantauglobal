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

### TASK 5: Seed 16 positions — `migrations/0002_seed_positions.sql`
Port existing position list from `~/Developer/perantauglobal.com/src/app/[locale]/lowongan/` + `program/`. Format each with:
- `slug` (match URL)
- `role`, `country`, `name`, `description`
- `requirements` JSONB: keys yang harus ada di `candidates.profile_data` biar ready
- `scoring` JSONB: optional weights
- `pipeline` JSONB: stages spesifik posisi

Apply via MCP `apply_migration`.

### TASK 6: Refactor `apps/web` forms → new Supabase + RLS pattern
Current: forms POST `/api/program/[slug]` or `/api/lowongan/[slug]` → service_role_key → insert to old tables.

Target flow (anon + RLS):
1. Form POST → `/api/apply` (single endpoint, takes `position_slug` in body)
2. Insert to `pending_submissions` (anon key + RLS insert policy)
3. Insert related `consents` entries (PDP log)
4. Call Supabase Auth `signInWithOtp` via edge function or API → triggers magic link email
5. Return success response

Remove: all references to `SUPABASE_SERVICE_ROLE_KEY` in `apps/web/`. Only `SUPABASE_ANON_KEY`.

### TASK 7: Edge Function — `handle-magic-link-verify`
Triggered when user clicks magic link + verifies.
- Find matching `pending_submissions` by email
- Materialize `candidates` row (from `form_data`)
- Materialize `applications` row (position_slug + answers)
- Link consent rows (update `candidate_id` from `pending_id`)
- Mark `consumed_at` on pending
- Return redirect to `app.perantauglobal.com/dashboard`

### TASK 8: `apps/platform` scaffold
```bash
cd apps && npx create-next-app@latest platform --typescript --tailwind --app --no-src-dir --import-alias "@/*"
```
Then:
- Add route groups: `app/(candidate)/` + `app/(admin)/`
- Add `middleware.ts` checking Supabase session + role
- Add `@perantauglobal/db` as workspace dep
- Minimal pages: `/dashboard` (candidate), `/admin` (admin)

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
