# Perantau Global Platform — Monorepo

Website + candidate portal + internal CRM untuk PT Daya Talenta Global (P3MI brand: **Perantau Global**).

> **⚡ New session picking up work?** Read [TASKS.md](./TASKS.md) first — it has the current phase, punch list, and decision log from the previous session.

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

- [x] Monorepo scaffolded
- [x] Supabase project `perantauglobal` created (Dayalima Pro)
- [ ] Schema migration 0001 applied
- [ ] Positions seeded (16 slots)
- [ ] apps/web ported from legacy repo
- [ ] apps/platform candidate portal built
- [ ] apps/platform admin ported from legacy dashboard
- [ ] Data backfill from gt-tools
- [ ] Production cutover

## Related

- Legacy website: `~/Developer/perantauglobal.com/` (akan di-port ke `apps/web/`)
- Legacy admin: `~/Developer/dashboard.perantauglobal.com/` (akan di-port ke `apps/platform/(admin)/`)
- Brand context: `~/Cowork/memory/brands/dtg/`
- Old Supabase (archive): `gt-tools` project di personal org

## Deferred (Phase 2)

- Learning modules (courses + progress tracking)
- WhatsApp OTP (Meta Cloud API setelah business verification)
- BP2MI SISKOP2MI integration
- Multi-admin roles (recruiter vs manager)
- Real-time notifications
- Native mobile app (PWA dulu)
- Employer EN portal rebuild
