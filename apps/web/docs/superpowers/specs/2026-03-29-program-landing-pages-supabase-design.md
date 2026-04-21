# Program Landing Pages + Supabase Integration

**Date:** 2026-03-29
**Status:** Approved

## Context

Perantau Global needs dedicated conversion landing pages for recruitment programs (starting with "Sahabat Perantau Global" / SPG — a sales representative recruitment program). These pages share the brand identity but have a conversion-focused layout without the full site navigation.

Additionally, all existing forms (contact, registration) currently log to console. This spec covers connecting them to Supabase Postgres for actual data persistence.

## Scope

**In scope:**
1. Supabase client setup (`@supabase/supabase-js`)
2. Upgrade `/api/contact` route to persist to Supabase
3. Upgrade `/api/register` route to persist to Supabase
4. New `ProgramLayout` — minimal, conversion-focused (logo only, no navbar/footer)
5. SPG landing page at `/program/spg`
6. New `/api/program/spg` route for SPG form submissions
7. i18n routing update for `/program/spg`
8. Supabase setup guide for the user

**Out of scope:**
- Email notifications on form submission
- Admin dashboard for viewing submissions
- Other program landing pages (Nurs Hijack, etc. — later)
- Supabase Auth (not needed — public form submissions)

## Architecture

### Supabase Client

```
src/lib/supabase.ts
```

Server-side only client using `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` env vars. Service role key is used because these are server-side API routes (not exposed to browser). No Supabase Auth needed.

**Dependency:** `@supabase/supabase-js@^2` (stable v2)

### Database Schema

Three tables in Supabase:

**`contact_submissions`**

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK, default `gen_random_uuid()` |
| name | text | NOT NULL |
| email | text | NOT NULL |
| phone | text | nullable |
| subject | text | NOT NULL |
| message | text | NOT NULL |
| created_at | timestamptz | default `now()` |

**`registrations`**

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK, default `gen_random_uuid()` |
| full_name | text | NOT NULL |
| email | text | NOT NULL |
| phone | text | NOT NULL |
| birth_date | text | NOT NULL |
| gender | text | NOT NULL |
| address | text | NOT NULL |
| education | text | NOT NULL |
| major | text | nullable |
| experience | text | NOT NULL |
| skills | text | nullable |
| destination | text | NOT NULL |
| language | text | nullable |
| has_passport | text | NOT NULL |
| motivation | text | nullable |
| created_at | timestamptz | default `now()` |

**`spg_registrations`**

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK, default `gen_random_uuid()` |
| full_name | text | NOT NULL |
| email | text | NOT NULL |
| phone | text | NOT NULL |
| city | text | NOT NULL |
| experience | text | NOT NULL |
| motivation | text | nullable |
| created_at | timestamptz | default `now()` |

**RLS:** Enable Row Level Security on all three tables. No anon policies needed — all access is through service role key in server-side API routes.

**Key mapping:** API routes receive camelCase from frontend (e.g., `fullName`). Transform to snake_case before Supabase insert (e.g., `full_name`). Mapping is done in each API route handler.

### SQL Migration

```sql
-- Run in Supabase SQL Editor

create table contact_submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  subject text not null,
  message text not null,
  created_at timestamptz default now()
);
alter table contact_submissions enable row level security;

create table registrations (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone text not null,
  birth_date text not null,
  gender text not null,
  address text not null,
  education text not null,
  major text,
  experience text not null,
  skills text,
  destination text not null,
  language text,
  has_passport text not null,
  motivation text,
  created_at timestamptz default now()
);
alter table registrations enable row level security;

create table spg_registrations (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone text not null,
  city text not null,
  experience text not null,
  motivation text,
  created_at timestamptz default now()
);
alter table spg_registrations enable row level security;
```

### API Routes

**`/api/contact` (existing, upgrade)**
- Keep existing validation logic
- Replace `console.log` with Supabase insert to `contact_submissions`
- Map: `name`, `email`, `phone`, `subject`, `message` (already snake_case)
- Return `{ success: true }` or `{ error: "..." }` with appropriate status
- On Supabase error: return 500 with generic error message (don't leak DB details)

**`/api/register` (existing, upgrade)**
- Keep existing validation logic
- Add `hasPassport` to required fields validation (missing in current code, but column is NOT NULL)
- Replace `console.log` with Supabase insert to `registrations`
- Map camelCase → snake_case: `fullName`→`full_name`, `birthDate`→`birth_date`, `hasPassport`→`has_passport`

**`/api/program/spg` (new)**
- Validate: fullName, email, phone, city, experience (required)
- Map camelCase → snake_case before insert
- Insert to `spg_registrations`
- On Supabase error: return 500 with generic error message
- On missing env vars: return 500 (graceful degradation, log error server-side)

### Routing

Add to `src/i18n/routing.ts`:
```typescript
"/program/spg": {
  id: "/program/spg",
  en: "/program/spg",
},
```

Program routes stay the same in both locales (program names are brand names, not translatable).

### File Structure

```
src/
├── lib/
│   └── supabase.ts                    ← NEW: Supabase server client
├── app/
│   ├── [locale]/program/
│   │   ├── layout.tsx                 ← NEW: ProgramLayout (minimal)
│   │   └── spg/
│   │       └── page.tsx               ← NEW: SPG landing page
│   └── api/
│       ├── contact/route.ts           ← MODIFY: add Supabase insert
│       ├── register/route.ts          ← MODIFY: add Supabase insert
│       └── program/spg/route.ts       ← NEW: SPG form handler
├── components/
│   └── program/
│       ├── ProgramHero.tsx            ← NEW: conversion hero section
│       ├── ProgramBenefits.tsx        ← NEW: benefits grid
│       └── SPGForm.tsx                ← NEW: SPG registration form
└── messages/
    ├── id.json                        ← MODIFY: add program.spg keys
    └── en.json                        ← MODIFY: add program.spg keys
```

### ProgramLayout

Minimal layout for conversion pages:
- Logo (paper plane) top-left, links to homepage
- No navigation menu
- No footer (or ultra-minimal footer with just copyright)
- Floating WhatsApp button stays
- Background: clean white

### SPG Landing Page Sections

1. **ProgramHero** — headline "Jadi Sahabat Perantau Global", subheadline about the opportunity, CTA button scrolling to form
2. **ProgramBenefits** — 3-4 benefit cards (komisi menarik, fleksibel, pelatihan gratis, jaringan luas)
3. **SPGForm** — registration form with fields: nama, email, telepon, kota, pengalaman, motivasi

### Environment Variables

```env
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

To be set in:
- `.env.local` for local development
- Vercel project settings for production

## Supabase Setup Guide (for user)

1. Go to supabase.com → Create new project (or use existing)
2. Go to SQL Editor → Run the CREATE TABLE statements (provided during implementation)
3. Go to Settings → API → Copy Project URL and service_role key
4. Add to `.env.local` and Vercel environment variables

## Verification

1. `npm run build` — clean build with no errors
2. Local dev: submit contact form → check Supabase table has new row
3. Local dev: visit `/program/spg` → see landing page with form
4. Submit SPG form → check `spg_registrations` table
5. Visual check: ProgramLayout has no navbar, logo links home
6. Mobile responsive check on SPG landing page
