# Perantau Global Platform

Monorepo untuk perantauglobal.com + app.perantauglobal.com + admin CRM.

See [CLAUDE.md](./CLAUDE.md) untuk arsitektur lengkap.

## Quick start

```bash
pnpm install
cp .env.example .env.local  # fill in Supabase keys
pnpm dev
```

## Structure

- `apps/web` — perantauglobal.com (marketing)
- `apps/platform` — app.perantauglobal.com (candidate + admin)
- `packages/db` — Supabase client + types + migrations
- `packages/ui` — shared design system
- `packages/config` — shared tsconfig/eslint/tailwind
