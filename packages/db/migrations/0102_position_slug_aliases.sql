-- 0102: Position slug rename support — aliases (301) + ON UPDATE CASCADE.
--
-- Fase 1.3 of the position-flow audit. Two capabilities, both additive/inert:
--
--  1. position_slug_aliases: old_slug -> new_slug map so a renamed position's
--     OLD landing-page URL keeps resolving (web issues a permanent redirect).
--     Without this, renaming a slug kills any live ad pointing at the old URL —
--     the exact "LP 404 while the ad is running" incident we're guarding against.
--
--  2. ON UPDATE CASCADE on every FK that references positions(slug). Postgres
--     defaults child FKs to ON UPDATE NO ACTION, so UPDATE positions SET slug
--     would violate them. Cascading makes a rename a single parent UPDATE that
--     propagates to applications / job_orders / pending_submissions /
--     position_application_fields (and alias rows) atomically.
--
-- Nothing renames automatically — this only makes an admin-initiated rename
-- (admin_rename_position_slug below) safe. Existing behaviour is unchanged.

-- ── 1. Alias table ──────────────────────────────────────────────────────
create table if not exists public.position_slug_aliases (
  old_slug   text primary key,
  new_slug   text not null
    references public.positions(slug) on update cascade on delete cascade,
  created_at timestamptz not null default now()
);

comment on table public.position_slug_aliases is
  'Retired position slugs -> current slug. Web resolves old_slug with a permanent redirect so ad URLs never die after a rename.';

alter table public.position_slug_aliases enable row level security;

-- Public read: the web detail route (anon) looks up the alias to 301. No public
-- write policy — writes happen only through admin_rename_position_slug (SECURITY
-- DEFINER) or the service role, both of which bypass RLS.
drop policy if exists psa_public_read on public.position_slug_aliases;
create policy psa_public_read on public.position_slug_aliases
  for select to anon, authenticated using (true);

grant select on public.position_slug_aliases to anon, authenticated;

-- ── 2. ON UPDATE CASCADE on child FKs ───────────────────────────────────
-- Drop + recreate each FK preserving its existing ON DELETE action, adding
-- ON UPDATE CASCADE. Constraint names verified against live schema.
alter table public.applications
  drop constraint applications_position_slug_fkey,
  add constraint applications_position_slug_fkey
    foreign key (position_slug) references public.positions(slug)
    on update cascade on delete restrict;

alter table public.job_orders
  drop constraint job_orders_position_slug_fkey,
  add constraint job_orders_position_slug_fkey
    foreign key (position_slug) references public.positions(slug)
    on update cascade on delete restrict;

alter table public.pending_submissions
  drop constraint pending_submissions_position_slug_fkey,
  add constraint pending_submissions_position_slug_fkey
    foreign key (position_slug) references public.positions(slug)
    on update cascade on delete cascade;

alter table public.position_application_fields
  drop constraint position_application_fields_position_slug_fkey,
  add constraint position_application_fields_position_slug_fkey
    foreign key (position_slug) references public.positions(slug)
    on update cascade on delete cascade;

-- ── 3. Atomic rename function ───────────────────────────────────────────
-- SECURITY DEFINER so it can write the alias + rename regardless of the
-- caller's RLS, but it self-checks is_admin() first. One statement per concern,
-- all inside the implicit function transaction.
create or replace function public.admin_rename_position_slug(p_old text, p_new text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'forbidden: admin only';
  end if;
  if p_new is null or p_new !~ '^[a-z0-9]+(-[a-z0-9]+)*$' then
    raise exception 'invalid slug format: %', p_new;
  end if;
  if p_old = p_new then
    return; -- no-op
  end if;
  if not exists (select 1 from positions where slug = p_old) then
    raise exception 'position not found: %', p_old;
  end if;
  if exists (select 1 from positions where slug = p_new) then
    raise exception 'slug already taken: %', p_new;
  end if;

  -- Rename the parent. ON UPDATE CASCADE propagates to applications,
  -- job_orders, pending_submissions, position_application_fields, and any
  -- existing alias row whose new_slug pointed at p_old (chain preserved).
  update positions set slug = p_new where slug = p_old;

  -- Record old -> new so the web can permanently redirect the old URL.
  insert into position_slug_aliases (old_slug, new_slug)
  values (p_old, p_new)
  on conflict (old_slug) do update set new_slug = excluded.new_slug;

  -- If p_new was itself a previously-retired slug, drop that now-stale row so we
  -- never redirect the live slug onto itself.
  delete from position_slug_aliases where old_slug = p_new;
end;
$$;

revoke all on function public.admin_rename_position_slug(text, text) from public, anon;
grant execute on function public.admin_rename_position_slug(text, text) to authenticated;
