-- 0103_position_quality_helpers.sql
-- Fase 2 of the position-flow audit - INERT helper layer.
--
-- This migration adds two building blocks that NOTHING enforces yet, so it is
-- safe to apply while the Fase 2 branch is still in review (same class as
-- 0101/0102): a canonical "does this position actually screen anyone?" SQL
-- predicate, and a column to record when the public web cache was last busted
-- for a position (observability). The behavior-changing invariants that USE the
-- predicate (activation trigger, country FK, JO uniqueness, RLS tightening) land
-- separately in 0104, applied at rollout together with the app code that shows
-- friendly errors before the raw DB error.

begin;

-- ── 1) Canonical effective-screening predicate ──────────────────────────────
-- "Effective screening" = at least one REQUIRED application field whose options
-- include an explicitly qualifying:true choice. This mirrors the pass math in
-- application_readiness_view (COALESCE((o->>'qualifying')::boolean,false)=true)
-- - deliberately STRICTER than 0082's has_gate, which used key-presence
-- (o ? 'qualifying') and would count a qualifying:false option as a gate.
--
-- The activation guard (app + the 0104 trigger) and the admin readiness panel
-- all resolve screening through this one definition so they can never drift.
-- SECURITY DEFINER so it sees all fields regardless of the caller's RLS.
create or replace function public.position_has_effective_screening(p_slug text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from position_application_fields f
    where f.position_slug = p_slug
      and f.importance = 'required'
      and f.options is not null
      and exists (
        select 1
        from jsonb_array_elements(f.options) o
        where coalesce((o ->> 'qualifying')::boolean, false) = true
      )
  );
$$;

comment on function public.position_has_effective_screening(text) is
  'Fase 2: true when the position has >=1 required field with >=1 qualifying:true option. Canonical screening-effectiveness predicate shared by the activation guard, the 0104 activation trigger, and the admin readiness panel.';

-- allow the anon/authenticated roles used by the app clients to call it
grant execute on function public.position_has_effective_screening(text) to anon, authenticated, service_role;

-- ── 2) Revalidation observability column ────────────────────────────────────
-- Stamped by notifyWebRevalidate() after a confirmed-OK cache bust so the admin
-- editor can show "web ter-update HH:MM" and a silently-failing webhook becomes
-- visible. Nullable + inert: no code reads it until the Fase 2 app ships.
alter table public.positions
  add column if not exists last_revalidated_at timestamptz;

comment on column public.positions.last_revalidated_at is
  'Fase 2: last time apps/web ISR was successfully busted for this position (set by notifyWebRevalidate on res.ok). Observability only.';

commit;
