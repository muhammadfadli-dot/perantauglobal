-- 0105 position preview tokens (Fase 3.1) — ADDITIVE + INERT.
--
-- Closes finding D4: the editor's "Preview tab baru" opened
-- https://perantauglobal.com/lowongan/<slug>, i.e. the LIVE published page. An
-- admin with a pending draft clicked "Preview" and saw the *old* content; on a
-- never-published position the button just 404'd. There was no way to see a
-- draft as the public page would actually render it — apps/web had no notion of
-- a draft at all.
--
-- Model: a per-position, expiring, revocable token. apps/web resolves it via the
-- SECURITY DEFINER function below using the ANON key. That is deliberate:
--   * No new shared secret. The obvious alternative (HMAC over REVALIDATE_SECRET)
--     is impossible anyway — that env var is not actually set on either Vercel
--     project (see 3.6), so a token derived from it would verify nowhere.
--   * No service-role key on the read path. The DB decides whether the caller
--     may see the draft; apps/web never gets blanket rights to unpublished rows.
--   * Revocable + expiring, which an HMAC token is not without extra state.
--
-- Nothing reads this table until apps/web ships the /api/preview route, so this
-- migration is safe to apply ahead of the deploy.

create table if not exists public.position_preview_tokens (
  -- One live token per position: minting again rotates it, which instantly
  -- invalidates any link already shared. PK on slug gives us that for free.
  slug        text primary key references public.positions(slug)
                on update cascade on delete cascade,
  token       text        not null,
  expires_at  timestamptz not null,
  created_by  text,
  created_at  timestamptz not null default now()
);

comment on table public.position_preview_tokens is
  'Fase 3.1: short-lived tokens letting apps/web render positions.draft_content for one position. Rotated on re-mint, expired by expires_at. Read only through get_position_draft_preview().';

alter table public.position_preview_tokens enable row level security;

-- No anon/authenticated policies on purpose: every legitimate read goes through
-- the SECURITY DEFINER function, which requires the token itself. Admin writes
-- go through the server action's service-role client, which bypasses RLS.

create index if not exists idx_position_preview_tokens_expires
  on public.position_preview_tokens (expires_at);

-- Returns the draft as apps/web needs it, and ONLY for a caller holding a valid
-- unexpired token for that exact slug. Deliberately ignores positions.active:
-- previewing a not-yet-activated position is the entire point (that is the case
-- the old button 404'd on).
create or replace function public.get_position_draft_preview(
  p_slug  text,
  p_token text
)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'slug',         p.slug,
    'name',         p.name,
    'role',         p.role,
    'country',      p.country,
    'active',       p.active,
    -- draft_content is NULL once a draft is published (no pending changes), so
    -- fall back to the live blob: preview then simply shows what is live, which
    -- is the truthful answer rather than an empty page.
    'content',      coalesce(p.draft_content, p.content),
    'published_at', p.published_at,
    'updated_at',   p.updated_at
  )
  from public.positions p
  join public.position_preview_tokens t on t.slug = p.slug
  where p.slug = p_slug
    and t.token = p_token
    and t.expires_at > now();
$$;

comment on function public.get_position_draft_preview(text, text) is
  'Fase 3.1: returns a position draft blob for apps/web preview iff p_token matches an unexpired position_preview_tokens row for p_slug. Ignores active on purpose (previewing an unactivated position is the point). Anon-callable: the token IS the authorization.';

revoke all on function public.get_position_draft_preview(text, text) from public;
grant execute on function public.get_position_draft_preview(text, text) to anon, authenticated, service_role;
