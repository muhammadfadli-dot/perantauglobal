-- 0067_affiliate_referral_system.sql
--
-- Affiliate / referral-code recruitment channel (admin-managed MVP).
--
-- Affiliate agents scout talents. A talent registers via the normal apply flow
-- but types the agent's referral code into the form. The code lands in
-- pending_submissions.form_data.ref, and the existing handle_new_auth_user()
-- materialization trigger (extended below) resolves it -> agent, attributes the
-- candidate (first-touch), and logs a `registration` commission event. When that
-- candidate later reaches a departed/placed pipeline stage ('deployed'/'active'),
-- a second trigger logs a `departure` commission event.
--
-- Commission AMOUNTS are intentionally manual: the ledger records the EVENTS;
-- admin fills `amount` and approves/pays in the admin UI. No auto-calculation.
--
-- Decisions (2026-06-04): admin-managed only (no agent portal), record-events
-- (manual amount), manual code field (no ?ref= URL capture). See
-- docs/affiliate-referral/SPEC.md.

-- ============================================================================
-- 1. Tables
-- ============================================================================

CREATE TABLE IF NOT EXISTS affiliate_agents (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL CHECK (length(btrim(name)) BETWEEN 2 AND 200),
  email       TEXT CHECK (email IS NULL OR email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  phone       TEXT CHECK (phone IS NULL OR phone ~ '^\+?[0-9]{8,15}$'),
  city        TEXT,
  status      TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  notes       TEXT,
  created_by  UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Email unique only when present (agents may be phone-only).
CREATE UNIQUE INDEX IF NOT EXISTS uq_affiliate_agents_email
  ON affiliate_agents (lower(email)) WHERE email IS NOT NULL;

CREATE TABLE IF NOT EXISTS referral_codes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id    UUID NOT NULL REFERENCES affiliate_agents(id) ON DELETE CASCADE,
  code        TEXT NOT NULL CHECK (code = upper(code) AND code ~ '^[A-Z0-9-]{4,32}$'),
  label       TEXT,
  status      TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_referral_codes_code ON referral_codes (code);
CREATE INDEX IF NOT EXISTS idx_referral_codes_agent ON referral_codes (agent_id);

-- First-touch attribution columns on candidates (mirrors the utm pattern in 0066).
ALTER TABLE candidates
  ADD COLUMN IF NOT EXISTS referred_by_agent_id   UUID REFERENCES affiliate_agents(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS referred_by_code_id    UUID REFERENCES referral_codes(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS referral_code_input    TEXT,
  ADD COLUMN IF NOT EXISTS referral_attributed_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_candidates_referred_by_agent
  ON candidates (referred_by_agent_id) WHERE referred_by_agent_id IS NOT NULL;

-- Commission event ledger. amount stays NULL until an admin sets it.
CREATE TABLE IF NOT EXISTS affiliate_commission_events (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id         UUID NOT NULL REFERENCES affiliate_agents(id) ON DELETE CASCADE,
  candidate_id     UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  application_id   UUID REFERENCES applications(id) ON DELETE SET NULL,
  event_type       TEXT NOT NULL CHECK (event_type IN ('registration', 'departure')),
  triggered_stage  pipeline_stage,
  amount           NUMERIC(12, 2) CHECK (amount IS NULL OR amount >= 0),
  currency         TEXT NOT NULL DEFAULT 'IDR',
  status           TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid', 'void')),
  notes            TEXT,
  approved_by      UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_at      TIMESTAMPTZ,
  paid_at          TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Idempotency: at most one registration + one departure per candidate-agent.
CREATE UNIQUE INDEX IF NOT EXISTS uq_commission_event
  ON affiliate_commission_events (agent_id, candidate_id, event_type);
CREATE INDEX IF NOT EXISTS idx_commission_events_agent_status
  ON affiliate_commission_events (agent_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_commission_events_candidate
  ON affiliate_commission_events (candidate_id);

-- updated_at maintenance (reuses the existing set_updated_at() helper).
DROP TRIGGER IF EXISTS trg_affiliate_agents_updated ON affiliate_agents;
CREATE TRIGGER trg_affiliate_agents_updated
  BEFORE UPDATE ON affiliate_agents
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_commission_events_updated ON affiliate_commission_events;
CREATE TRIGGER trg_commission_events_updated
  BEFORE UPDATE ON affiliate_commission_events
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================================
-- 2. RLS — admin-only on all three tables
-- ============================================================================

ALTER TABLE affiliate_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_commission_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS affiliate_agents_admin_all ON affiliate_agents;
CREATE POLICY affiliate_agents_admin_all ON affiliate_agents
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS referral_codes_admin_all ON referral_codes;
CREATE POLICY referral_codes_admin_all ON referral_codes
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS commission_events_admin_all ON affiliate_commission_events;
CREATE POLICY commission_events_admin_all ON affiliate_commission_events
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- ============================================================================
-- 3. Public code validation (boolean only — no agent enumeration)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.validate_referral_code(p_code TEXT)
  RETURNS boolean
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM referral_codes rc
    JOIN affiliate_agents a ON a.id = rc.agent_id
    WHERE rc.code = upper(btrim(p_code))
      AND rc.status = 'active'
      AND a.status = 'active'
  );
$$;

REVOKE EXECUTE ON FUNCTION public.validate_referral_code(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.validate_referral_code(TEXT) TO anon, authenticated;

-- ============================================================================
-- 4. Attribution helper (called only by the materialization trigger)
-- ============================================================================

CREATE OR REPLACE FUNCTION public._attribute_candidate_referral(p_candidate_id UUID, p_raw TEXT)
  RETURNS void
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = public
AS $$
DECLARE
  v_norm    TEXT;
  v_code_id UUID;
  v_agent   UUID;
BEGIN
  v_norm := upper(btrim(COALESCE(p_raw, '')));
  IF v_norm = '' THEN
    RETURN;
  END IF;

  -- Record the raw input for audit, even if it never resolves (first-touch).
  UPDATE candidates
  SET referral_code_input = COALESCE(referral_code_input, left(v_norm, 64))
  WHERE id = p_candidate_id;

  SELECT rc.id, rc.agent_id
  INTO v_code_id, v_agent
  FROM referral_codes rc
  JOIN affiliate_agents a ON a.id = rc.agent_id
  WHERE rc.code = v_norm
    AND rc.status = 'active'
    AND a.status = 'active'
  LIMIT 1;

  IF v_agent IS NULL THEN
    RETURN;
  END IF;

  -- Attribute first-touch only (never overwrite an existing referral).
  UPDATE candidates
  SET referred_by_agent_id   = COALESCE(referred_by_agent_id, v_agent),
      referred_by_code_id    = COALESCE(referred_by_code_id, v_code_id),
      referral_attributed_at = COALESCE(referral_attributed_at, NOW())
  WHERE id = p_candidate_id;

  -- Log the registration commission event, but only against the agent the
  -- candidate is actually attributed to (guards a second code from logging
  -- against a candidate already attributed to someone else).
  INSERT INTO affiliate_commission_events (agent_id, candidate_id, event_type, status)
  SELECT c.referred_by_agent_id, p_candidate_id, 'registration', 'pending'
  FROM candidates c
  WHERE c.id = p_candidate_id
    AND c.referred_by_agent_id = v_agent
  ON CONFLICT (agent_id, candidate_id, event_type) DO NOTHING;
END;
$$;

REVOKE EXECUTE ON FUNCTION public._attribute_candidate_referral(UUID, TEXT) FROM PUBLIC;

-- ============================================================================
-- 5. Extend handle_new_auth_user() — exact 0066 body + one PERFORM line
--    (marked "AFFILIATE:" below). Recreated verbatim otherwise.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_candidate_id UUID;
  v_pending      RECORD;
  v_latest_form  JSONB;
  v_existing     UUID;
  v_meta_name    TEXT;
  v_meta_source  TEXT;
  v_fallback     TEXT;
  v_src          TEXT;
  v_utm_source   TEXT;
  v_utm_campaign TEXT;
BEGIN
  SELECT form_data INTO v_latest_form
  FROM pending_submissions
  WHERE lower(email) = lower(NEW.email)
    AND consumed_at IS NULL
  ORDER BY created_at DESC
  LIMIT 1;

  -- Case 1: No pending — direct signup. Link existing candidate or create stub.
  IF v_latest_form IS NULL THEN
    UPDATE candidates
    SET auth_user_id = NEW.id, updated_at = NOW()
    WHERE lower(email) = lower(NEW.email)
      AND auth_user_id IS NULL
    RETURNING id INTO v_candidate_id;

    IF v_candidate_id IS NOT NULL THEN
      RETURN NEW;
    END IF;

    v_meta_name   := NULLIF(trim(NEW.raw_user_meta_data->>'full_name'), '');
    v_meta_source := NULLIF(NEW.raw_user_meta_data->>'source', '');

    IF v_meta_name IS NULL THEN
      v_fallback := COALESCE(NULLIF(split_part(NEW.email, '@', 1), ''), 'Kandidat baru');
      IF length(v_fallback) < 2 THEN
        v_fallback := 'Kandidat baru';
      ELSIF length(v_fallback) > 200 THEN
        v_fallback := substring(v_fallback from 1 for 200);
      END IF;
      v_meta_name := v_fallback;
    ELSIF length(v_meta_name) > 200 THEN
      v_meta_name := substring(v_meta_name from 1 for 200);
    END IF;

    INSERT INTO candidates (auth_user_id, email, full_name, profile_data, source)
    VALUES (
      NEW.id,
      lower(NEW.email),
      v_meta_name,
      jsonb_build_object('schema_version', 2, 'onboarding', '{}'::jsonb),
      COALESCE(v_meta_source, 'direct_signup')
    )
    ON CONFLICT (auth_user_id) DO NOTHING;
    RETURN NEW;
  END IF;

  -- Derive Meta attribution from the staged form. Prefer an explicit
  -- form_data.utm_* key (forward-compat) else parse it out of source_url, which
  -- the apply form always sends as window.location.href.
  -- source_url is user-influenceable (apps/web forwards window.location.href),
  -- so cap the extracted tokens defensively. Legit values are short
  -- (utm_source "fb"/"ig", utm_campaign = numeric campaign ID); 128 is generous.
  v_src          := v_latest_form->>'source_url';
  v_utm_source   := left(COALESCE(
                      NULLIF(v_latest_form->>'utm_source', ''),
                      (regexp_match(v_src, '[?&]utm_source=([^&#]+)'))[1]
                    ), 128);
  v_utm_campaign := left(COALESCE(
                      NULLIF(v_latest_form->>'utm_campaign', ''),
                      (regexp_match(v_src, '[?&]utm_campaign=([^&#]+)'))[1]
                    ), 128);

  -- Case 2: pending(s) exist. Upsert candidate bio from latest form.
  SELECT id INTO v_existing
  FROM candidates
  WHERE lower(email) = lower(NEW.email)
  LIMIT 1;

  IF v_existing IS NOT NULL THEN
    UPDATE candidates
    SET
      auth_user_id = COALESCE(auth_user_id, NEW.id),
      full_name    = COALESCE(full_name, v_latest_form->>'full_name'),
      phone        = COALESCE(phone, v_latest_form->>'whatsapp', v_latest_form->>'phone'),
      city         = COALESCE(city, v_latest_form->>'city'),
      gender       = COALESCE(gender, v_latest_form->>'gender'),
      education    = COALESCE(education, v_latest_form->>'education'),
      utm_source   = COALESCE(utm_source, v_utm_source),
      utm_campaign = COALESCE(utm_campaign, v_utm_campaign),
      referrer_url = COALESCE(referrer_url, v_src),
      profile_data = jsonb_build_object(
        'schema_version', 2,
        'onboarding', COALESCE(profile_data->'onboarding', '{}'::jsonb)
      ),
      updated_at = NOW()
    WHERE id = v_existing;
    v_candidate_id := v_existing;
  ELSE
    INSERT INTO candidates (
      auth_user_id, email, full_name, phone, city, birth_date, gender,
      education, profile_data, source, utm_source, utm_campaign, referrer_url
    ) VALUES (
      NEW.id,
      lower(NEW.email),
      COALESCE(v_latest_form->>'full_name', 'Unknown'),
      COALESCE(v_latest_form->>'whatsapp', v_latest_form->>'phone'),
      v_latest_form->>'city',
      CASE
        WHEN v_latest_form->>'birth_date' IS NOT NULL
          AND v_latest_form->>'birth_date' <> ''
        THEN (v_latest_form->>'birth_date')::DATE
        ELSE NULL
      END,
      v_latest_form->>'gender',
      v_latest_form->>'education',
      jsonb_build_object('schema_version', 2, 'onboarding', '{}'::jsonb),
      'form_apply',
      v_utm_source,
      v_utm_campaign,
      v_src
    )
    RETURNING id INTO v_candidate_id;
  END IF;

  -- AFFILIATE: resolve a manually-typed referral code (form_data.ref) -> agent,
  -- attribute the candidate (first-touch), and log the registration event.
  -- Best-effort: referral attribution must NEVER abort a candidate signup, so any
  -- failure (e.g. the helper missing under a partial apply) degrades to a warning.
  BEGIN
    PERFORM public._attribute_candidate_referral(v_candidate_id, v_latest_form->>'ref');
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'affiliate attribution skipped for candidate %: %', v_candidate_id, SQLERRM;
  END;

  -- Materialize each pending by intent.
  FOR v_pending IN
    SELECT id, intent, position_slug, program_slug, form_data
    FROM pending_submissions
    WHERE lower(email) = lower(NEW.email)
      AND consumed_at IS NULL
    ORDER BY created_at ASC
  LOOP
    IF v_pending.intent = 'academy' THEN
      INSERT INTO academy_enrollments (
        candidate_id, program_slug, answers, status
      ) VALUES (
        v_candidate_id,
        v_pending.program_slug,
        COALESCE(v_pending.form_data->'answers', '{}'::jsonb),
        'registered'
      )
      ON CONFLICT (candidate_id, program_slug) DO NOTHING;
    ELSE
      INSERT INTO applications (
        candidate_id, position_slug, answers, pipeline_stage
      ) VALUES (
        v_candidate_id,
        v_pending.position_slug,
        COALESCE(v_pending.form_data->'role_data', '{}'::jsonb),
        'applied'
      )
      ON CONFLICT (candidate_id, position_slug) DO NOTHING;
    END IF;

    UPDATE consents
    SET candidate_id = v_candidate_id
    WHERE pending_id = v_pending.id
      AND candidate_id IS NULL;

    UPDATE pending_submissions
    SET consumed_at = NOW()
    WHERE id = v_pending.id;
  END LOOP;

  RETURN NEW;
END;
$function$;

-- ============================================================================
-- 6. Departure commission event — fires when a referred candidate is placed
-- ============================================================================

CREATE OR REPLACE FUNCTION public.log_affiliate_departure_event()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = public
AS $$
DECLARE
  v_agent UUID;
BEGIN
  -- Only on a real transition INTO a departed/placed stage.
  IF NEW.pipeline_stage NOT IN ('deployed', 'active') THEN
    RETURN NEW;
  END IF;
  IF OLD.pipeline_stage IS NOT DISTINCT FROM NEW.pipeline_stage THEN
    RETURN NEW;
  END IF;

  SELECT referred_by_agent_id INTO v_agent
  FROM candidates
  WHERE id = NEW.candidate_id;

  IF v_agent IS NULL THEN
    RETURN NEW;
  END IF;

  -- UNIQUE(agent, candidate, 'departure') => one departure event per candidate,
  -- even across a deployed -> active double transition.
  INSERT INTO affiliate_commission_events (
    agent_id, candidate_id, application_id, event_type, triggered_stage, status
  ) VALUES (
    v_agent, NEW.candidate_id, NEW.id, 'departure', NEW.pipeline_stage, 'pending'
  )
  ON CONFLICT (agent_id, candidate_id, event_type) DO NOTHING;

  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.log_affiliate_departure_event() FROM PUBLIC;

DROP TRIGGER IF EXISTS trg_affiliate_departure ON applications;
CREATE TRIGGER trg_affiliate_departure
  AFTER UPDATE OF pipeline_stage ON applications
  FOR EACH ROW
  EXECUTE FUNCTION log_affiliate_departure_event();
