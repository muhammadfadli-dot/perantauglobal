# Perantau Global Platform — Monorepo

Website + candidate portal + internal CRM untuk PT Daya Talenta Global (P3MI brand: **Perantau Global**).

> **⚡ New session picking up work?** Read [TASKS.md](./TASKS.md) first — it has the current phase, punch list, and decision log from the previous session.
>
> **Doc convention:** `CLAUDE.md` = stable architecture + conventions (this file). `TASKS.md` = the living session handoff (what's in flight, dated newest-first). Per-fact memory lives in `.claude/projects/.../memory/` (indexed by `MEMORY.md`). On every session wrap-up (`/session-wrap`), update TASKS.md + memory, and refresh the **Phase status** / **Major milestones** section below when something architectural changed (new app, table, edge fn, or model shift) — not for routine content/copy edits.

## Architecture

**2 apps, 1 monorepo, 1 Supabase project.** Config-driven multi-position recruitment platform with evergreen talent pool development.

```
perantauglobal/ (monorepo root, pnpm + Turborepo)
├── apps/
│   ├── web/          → perantauglobal.com       (marketing, SEO, public landing pages)
│   └── platform/     → app.perantauglobal.com   (candidate portal + admin CRM)
│                        ├── (candidate)/*       mobile-first portal
│                        └── (admin)/*           data-dense CRM
│                        admin.perantauglobal.com → rewrites to /admin/*
│
└── packages/
    ├── db/           → Supabase client, Zod schemas, generated types, SQL migrations
    ├── ui/           → shared design system (themes, components)
    └── config/       → shared tsconfig, eslint, tailwind
```

## Infra

| Item | Detail |
|------|--------|
| GitHub | `panji-firmansyah/perantauglobal` (monorepo) |
| Vercel | Dayalima Group Pro team — 2 projects: `web`, `platform` |
| Supabase | `perantauglobal` project (`jeadtvxgxmqnsqwxjmhj`) di Dayalima Group Pro org |
| Region | ap-southeast-1 (Singapore) |
| Framework | Next.js 16 + React 19 + TypeScript + Tailwind CSS 4 |
| Email | Resend/Postmark via Supabase Auth SMTP |

## Commands

Run from monorepo root:
- `pnpm dev` — jalankan semua app paralel
- `pnpm dev --filter web` — cuma apps/web
- `pnpm dev --filter platform` — cuma apps/platform
- `pnpm build` — build semua
- `pnpm lint` — lint semua
- `pnpm db:migrate` — apply Supabase migrations
- `pnpm db:types` — regenerate TS types dari schema

## Schema (user-centric)

- `candidates` — canonical identity (bio + profile_data JSONB shared facts)
- `candidate_documents` — file URLs (KTP, passport, CV, certs)
- `positions` — 17-slot registry (role × country, requirements JSONB)
- `applications` — candidate × position (pipeline_stage, answers JSONB)
- `pending_submissions` — nonce-based staging until magic link verify
- `consents` — PDP UU 27/2022 compliance log per purpose

See [packages/db/migrations/](packages/db/migrations/) for SQL.

## Auth

- **Candidate:** Supabase Auth, email magic link primary + Twilio SMS fallback
- **Admin:** Supabase Auth with `role=admin` JWT claim (bypass RLS)
- **Anon form submission:** anon key + RLS allow-insert-only policies
- **Server/edge:** service role key ONLY in Edge Functions + CLI migrations + DB triggers

Magic link flow: form → `pending_submissions` (nonce) → magic link sent → user clicks → auth.users created → edge function materializes `candidates` + `applications` → trigger links `auth_user_id`.

## Key rules

- **Never commit** `.env.local` or `SUPABASE_SERVICE_ROLE_KEY`
- **Always update** Zod schemas in `packages/db/schemas/positions/` when position requirements change
- **Profile data** = candidate-owned shared facts (JLPT, SIM, certs). Isi sekali, apply berkali-kali.
- **Application answers** = per-apply context (motivation, availability)
- **Readiness** computed from `candidates.profile_data` matched against `positions.requirements`
- **JSONB versioning:** `profile_data.schema_version` untuk Zod evolution

## Phase status

**Foundation (done):** monorepo scaffolded · Supabase `perantauglobal` created (Dayalima Pro) · schema 0001 · positions seeded · apps/web + candidate portal + admin CRM built · gt-tools backfill · **production cutover 2026-04-22**.

**Position model rework — fully done** (2026-05-24, PRs #45/#47/#48/#49 + migrations 0031–0037): dropped shared `profile_data.credentials`, consolidated requirements + form_fields into `position_application_fields`, moved landing content into `positions.content` JSONB, unified admin Position Editor with live preview. `/applications/[id]/lengkapi` reads fields + `answers`; `/profile/kualifikasi` removed; `position_form_fields` / `positions.requirements` / `application_tiers` dropped. Only WA/SMS OTP wiring remains open (see Deferred; sketch route at `/auth/whatsapp`).

### Major milestones since launch

Newest first. Each has a memory note under `.claude/projects/.../memory/` (indexed in `MEMORY.md`); ongoing detail lives in `TASKS.md`.

- **2026-06-16** — Open-country support (PR #167): admin can create a position for ANY country; Meksiko / Welding Mexico = first case. Making a new country first-class on the public web = 5 code spots + 2 images → see `project_open_country_add_country`.
- **2026-06-13** — Completeness vs qualifying split (PR #157, migration 0077): candidate "done" = presence (`application_completeness_view`); admin eligibility = qualifying (`hard_pass`). Never key candidate surfaces off `hard_pass`.
- **2026-06-12** — UI/UX audit, 10-batch execution (PRs #147–155, migrations 0074–0076).
- **2026-06-10** — Admin portal deep audit + overhaul (PR #144, migrations 0069+0070): driveable pipeline kanban, dashboard rebuild, audit-log governance, events CMS. Living detail in `TASKS.md`.
- **2026-06-10** — AI CV grader (migration 0071, edge fn `grade-cv`): Flash-Lite extract + Flash fit via Vercel AI Gateway. CV = score, not a gate.
- **2026-06-04** — Affiliate / referral system LIVE (migrations 0067+0068, PR #141): admin-managed codes + commission ledger.
- **2026-06-02** — Akademi Perantau learning-platform foundation (migration 0060); first product = paid **Paspor Perantau Global** cert bundle.
- **2026-05-28** — Event registration platform (events + event_registrations): standalone no-auth `/event/[slug]` LP.
- **2026-05-27** — apps/web full redesign (Airbnb-style) + admin draft/publish flow (`positions.draft_content` + `published_at`, migration 0043).

> Migrations now climb past 0080; the list above is curated, not exhaustive. `packages/db/migrations/` is the ledger of record — always apply via Supabase MCP `apply_migration`, never the SQL editor (`project_migration_apply_discipline`). Position landing content (salary, fee, benefits, etc.) is **DB data in `positions.content`**, edited via the admin Position Editor — not code; it goes live through `/lowongan` ISR (`revalidate=60`).

## Related

- Legacy website: `~/Developer/perantauglobal.com/` (akan di-port ke `apps/web/`)
- Legacy admin: `~/Developer/dashboard.perantauglobal.com/` (akan di-port ke `apps/platform/(admin)/`)
- Brand context: `~/Cowork/memory/brands/clients/dtg/`
- Old Supabase (archive): `gt-tools` project di personal org

## Deferred (Phase 2)

- Learning modules (courses + progress tracking)
- WhatsApp OTP (Meta Cloud API setelah business verification)
- BP2MI SISKOP2MI integration
- Multi-admin roles (recruiter vs manager)
- Real-time notifications
- Native mobile app (PWA dulu)
- Employer EN portal rebuild
