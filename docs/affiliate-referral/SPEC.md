# Affiliate / Referral Code System — SPEC

**Status:** in build (branch `feat/affiliate-referral-system`)
**Date:** 2026-06-04
**Migration:** `0067_affiliate_referral_system.sql` (NOT applied — Panji applies via `apply_migration` after review)

## Goal

New recruitment channel: **affiliate agents** scout talents. A talent registers through
the normal Perantau Global apply flow but types the agent's **referral code**. The system
attributes the candidate to the agent, logs a **registration** commission event, and — when
that candidate eventually *berangkat* (departs / is placed abroad) — logs a **departure**
commission event. Admin manages everything and settles commission amounts manually.

## Locked product decisions (2026-06-04)

| Decision | Choice | Consequence |
|---|---|---|
| Agent access | **Admin-managed only (MVP)** | No agent login/portal. All management in `/admin/agents`. No agent-self RLS. |
| Commission model | **Record events, manual amount** | Ledger stores `registration` + `departure` events per candidate-agent; `amount` is NULL until admin fills + approves. No auto-calc. Anti-gaming, cashflow-safe. |
| Code entry | **Manual field only** | Candidate types code in the apply form. No `?ref=` URL auto-capture, no agent-link generation, no landing-page referral banner. |

## Why this is simple

The code travels with **zero** magic-link / auth-callback changes. It is written into
`pending_submissions.form_data.ref` at submit time; the existing `handle_new_auth_user()`
trigger already reads `form_data` at materialization. We only:
1. add a field to the apply form → `form_data.ref`
2. extend the trigger to resolve `ref` → agent + log the registration event
3. add a stage-change trigger to log the departure event
4. build the admin CRM section

`_fbc`/`_fbp` need the URL round-trip because they must become first-party cookies for CAPI;
`ref` does not — it only needs to reach the DB, which it already does via `form_data`.

## Data model (migration 0067)

The canonical SQL lives in `packages/db/migrations/0067_affiliate_referral_system.sql`.
Summary:

- **`affiliate_agents`** — `id, name, email?, phone?, city?, status(active|inactive|suspended), notes?, created_by, created_at, updated_at`. Unique partial index on `lower(email)`.
- **`referral_codes`** — `id, agent_id→affiliate_agents, code(UPPERCASE, [A-Z0-9-], 4–32, UNIQUE), label?, status(active|inactive), created_at`. One agent → many codes (one auto-generated on agent create).
- **`candidates`** new columns — `referred_by_agent_id?→affiliate_agents`, `referred_by_code_id?→referral_codes`, `referral_code_input?` (raw normalized text, audit even if unresolved), `referral_attributed_at?`. All first-touch (COALESCE-guarded), mirroring the existing utm pattern.
- **`affiliate_commission_events`** (the ledger) — `id, agent_id, candidate_id, application_id?, event_type(registration|departure), triggered_stage?(pipeline_stage), amount?(numeric, NULL until admin sets), currency(IDR), status(pending|approved|paid|void), notes?, approved_by?, approved_at?, paid_at?, created_at, updated_at`. **UNIQUE(agent_id, candidate_id, event_type)** → idempotent triggers (one registration + one departure per candidate-agent max).

### Functions / triggers

- **`validate_referral_code(p_code text) → boolean`** — SECURITY DEFINER, `STABLE`, granted to `anon, authenticated`. Returns whether an *active* code on an *active* agent exists. Returns **only a boolean** (no agent name) → no enumeration of who the agents are. *(Rate-limiting deferred — codes aren't secrets; false attribution benefits the agent and admin settles manually.)*
- **`_attribute_candidate_referral(p_candidate_id uuid, p_raw text)`** — SECURITY DEFINER helper. Normalizes raw → UPPER/trim, records `referral_code_input` (first-touch), resolves active code → agent, sets candidate attribution (first-touch), inserts `registration` event (ON CONFLICT DO NOTHING). No-op on empty/unresolved. NOT granted to anon/authenticated (called only by the definer trigger).
- **`handle_new_auth_user()`** — recreated = exact current 0066 body **plus** one line after candidate upsert: `PERFORM public._attribute_candidate_referral(v_candidate_id, v_latest_form->>'ref');`. Existing grants preserved.
- **`log_affiliate_departure_event()` + `trg_affiliate_departure`** — `AFTER UPDATE OF pipeline_stage ON applications`. On transition INTO `'deployed'` OR `'active'` (distinct from old), if the candidate has `referred_by_agent_id`, insert a `departure` event (ON CONFLICT DO NOTHING). UNIQUE ensures one departure event per candidate regardless of deployed→active double-hop.

### RLS

All three new tables: **admin-only** (`is_admin()`) for ALL. No anon/candidate policies.
Trigger writes happen in SECURITY DEFINER context → bypass RLS. Public code check goes
through the `validate_referral_code` RPC, never the table.

## App-layer contracts

### `packages/db/src/types.ts` (hand-added by the contract author, regenerate after apply)
- Add Tables: `affiliate_agents`, `referral_codes`, `affiliate_commission_events` (Row/Insert/Update).
- Add to `candidates` Row/Insert/Update: the 4 new nullable columns.
- Add Function: `validate_referral_code(p_code: string) → boolean`.
- Add convenience aliases at the bottom: `AffiliateAgent`, `ReferralCode`, `AffiliateCommissionEvent`, `CommissionEventType`, `CommissionEventStatus`.

### apps/web (candidate capture)
- **`components/pg/ApplyForm.tsx`** — add an **optional** field "Kode referral / kode agen (opsional)" in Step 1 (low-skill UX: plain, optional, helper text "Isi kalau kamu didaftarin sama agen Perantau Global"). Normalize on change (uppercase, strip spaces, `[A-Z0-9-]`, max 32). Optional debounced live check via `/api/referral/validate` → show ✓ "Kode dikenali" / ✗ "Kode nggak ketemu" (NON-blocking — a bad code never blocks registration). Add `ref` to the POST payload.
- **`app/api/lowongan/[slug]/route.ts`** — add `ref?: string` to the payload interface; normalize server-side (UPPER, trim, charset `^[A-Z0-9-]+$`, ≤32, else `null`); write it into the `form_data` object persisted to `pending_submissions` (read whichever file actually builds `form_data` — `route.ts` and/or `lib/pending-write.ts`).
- **`app/api/referral/validate/route.ts`** (NEW) — anon Supabase client → `rpc('validate_referral_code', { p_code })` → `{ valid: boolean }`. No agent data returned.
- **No change** to `auth/callback` (platform) — trigger reads `form_data.ref` directly.
- **Out of scope:** `/api/akademi/[slug]` (academy has no placement/departure event).

### apps/platform (admin CRM) — clone `/admin/job-orders` patterns
- **`(admin)/admin/agents/page.tsx`** — list + status tabs (all/active/inactive/suspended) + KPI strip (Total agen / Agen aktif / Event pending / Kandidat ke-refer). Table → row links to detail.
- **`(admin)/admin/agents/new/page.tsx` + `AgentForm.tsx`** — create agent (name required; email/phone/city/notes optional; status default active). Create action **also auto-generates the agent's first referral code**.
- **`(admin)/admin/agents/[id]/page.tsx`** — detail: header + hero metrics; **Referral codes** card (list + `GenerateCodeButton` + deactivate); **Referrals** table (candidates where `referred_by_agent_id` = this agent, link to `/admin/candidates/[id]`); **Commission ledger** table (`CommissionLedger`) with inline amount entry + approve / mark-paid / void.
- **`(admin)/admin/agents/actions.ts`** — `assertAdmin()` + `logAdminAction()` + `revalidatePath`, discriminated-union `{ ok, error }` returns. Actions: `createAffiliateAgent`, `updateAffiliateAgent`, `generateReferralCode`, `setReferralCodeStatus`, `setCommissionAmount`, `approveCommissionEvent`, `markCommissionPaid`, `voidCommissionEvent`. Code generation server-side: name-initials + crypto-random suffix, uppercase, charset-safe, retry on unique collision.
- **`components/admin/Sidebar.tsx`** — add `{ href: "/admin/agents", label: "Agen afiliasi", icon: <referral-ish, else "users">, count: counts?.agents }` in **Operasi**, after "Job orders", before "Kandidat". Add `agents?: number` to `SidebarCounts`.
- **`(admin)/layout.tsx`** — add `affiliate_agents` count to the parallel KPI fetch → Sidebar.
- **`lib/audit-log.ts`** — add `AuditAction`: `create_affiliate_agent | update_affiliate_agent | generate_referral_code | update_referral_code | set_commission_amount | approve_commission | mark_commission_paid | void_commission`; `AuditResourceType`: `affiliate_agent | referral_code | commission_event`.
- **`(admin)/admin/candidates/[id]/page.tsx`** — surface "Direferral oleh: [agent name]" when `referred_by_agent_id` is set (small bio-section addition).

## Verification
- `pnpm --filter @perantauglobal/web build` green.
- `pnpm --filter @perantauglobal/platform build` green.
- typecheck + lint both apps.
- Migration SQL reviewed (NOT applied to prod).
- Adversarial review: RLS admin-only; RPC grants minimal + boolean-only; trigger idempotency (UNIQUE) + first-touch; bad/empty code never blocks registration; charset/length caps on `ref`; no PII leak in validate.

## Out of scope (follow-ups)
Agent portal/login · auto commission calculation · academy referral · candidate-facing referral display · rate-limiting on `/api/referral/validate` · `?ref=` URL auto-capture + agent-link generation + landing referral banner.
