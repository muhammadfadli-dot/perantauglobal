-- 0084_academy_payment.sql
-- Payment plumbing for paid Akademi programs (first user: Paspor PG — Arab Saudi).
-- Adds payment state to enrollments + two SECURITY DEFINER RPCs:
--   • set_academy_enrollment_payment_pending  — owner-run: records the Xendit
--       invoice id on the caller's OWN enrollment before redirect (can only set
--       'pending', never 'paid').
--   • mark_academy_enrollment_paid            — service-role only: called by the
--       `xendit-webhook` edge function when Xendit confirms payment. Idempotent.
-- Candidates can NEVER self-mark paid: academy_enrollments has no candidate
-- INSERT/UPDATE RLS (see 0060); all writes go through definer RPCs.
-- Additive + re-runnable. NOT YET APPLIED — apply via Supabase MCP apply_migration
-- when the Xendit account + secrets are ready (see PAYMENT-XENDIT-KOORDINASI.md).

BEGIN;

-- 1. Payment columns -------------------------------------------------------
ALTER TABLE academy_enrollments
  ADD COLUMN IF NOT EXISTS payment_status  TEXT NOT NULL DEFAULT 'unpaid'
    CHECK (payment_status IN ('unpaid', 'pending', 'paid', 'waived', 'refunded')),
  ADD COLUMN IF NOT EXISTS payment_ref     TEXT,        -- Xendit invoice id
  ADD COLUMN IF NOT EXISTS payment_channel TEXT,        -- e.g. QRIS, BCA_VA, OVO, manual
  ADD COLUMN IF NOT EXISTS payment_amount  INTEGER,     -- IDR actually paid
  ADD COLUMN IF NOT EXISTS paid_at         TIMESTAMPTZ;

-- Existing enrollments of FREE programs are accessible → mark 'waived'. New
-- free-program enrollments default 'unpaid' but the app treats is_free as open
-- (see hasPaidAccess() in academy-db.ts), so this is just data hygiene.
UPDATE academy_enrollments e
   SET payment_status = 'waived'
  FROM academy_programs p
 WHERE e.program_slug = p.slug
   AND p.is_free = TRUE
   AND e.payment_status = 'unpaid';

CREATE INDEX IF NOT EXISTS idx_academy_enrollments_payment
  ON academy_enrollments (payment_status);

-- 2. RPC: owner-run "mark payment pending" --------------------------------
-- Records the Xendit invoice id on the caller's own enrollment before sending
-- them to the hosted invoice. Reuses _assert_academy_enrollment_owner (0060):
-- raises for non-owner / NULL candidate. Never escalates past 'pending', and
-- leaves an already paid/waived enrollment untouched.
CREATE OR REPLACE FUNCTION set_academy_enrollment_payment_pending(
  p_enrollment_id UUID,
  p_payment_ref   TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM _assert_academy_enrollment_owner(p_enrollment_id);
  UPDATE academy_enrollments
     SET payment_status = CASE WHEN payment_status IN ('paid', 'waived')
                               THEN payment_status ELSE 'pending' END,
         payment_ref    = COALESCE(p_payment_ref, payment_ref),
         updated_at     = NOW()
   WHERE id = p_enrollment_id;
END;
$$;

-- 3. RPC: service-role "mark paid" ----------------------------------------
-- Called ONLY by the xendit-webhook edge function (service role). Idempotent:
-- a duplicate PAID callback keeps the first paid_at.
CREATE OR REPLACE FUNCTION mark_academy_enrollment_paid(
  p_enrollment_id UUID,
  p_payment_ref   TEXT    DEFAULT NULL,
  p_channel       TEXT    DEFAULT NULL,
  p_amount        INTEGER DEFAULT NULL
)
RETURNS academy_enrollments
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public AS $$
DECLARE
  r academy_enrollments;
BEGIN
  UPDATE academy_enrollments
     SET payment_status  = 'paid',
         paid_at         = COALESCE(paid_at, NOW()),
         payment_ref     = COALESCE(p_payment_ref, payment_ref),
         payment_channel = COALESCE(p_channel, payment_channel),
         payment_amount  = COALESCE(p_amount, payment_amount),
         updated_at      = NOW()
   WHERE id = p_enrollment_id
  RETURNING * INTO r;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'enrollment not found: %', p_enrollment_id;
  END IF;
  RETURN r;
END;
$$;

-- 4. Grants ----------------------------------------------------------------
-- Lock down, then grant per role. Per the Supabase definer-grants gotcha
-- (reference_supabase_definer_grants_gotcha), REVOKE from anon/authenticated
-- explicitly, not just PUBLIC.
REVOKE EXECUTE ON FUNCTION set_academy_enrollment_payment_pending(UUID, TEXT)
  FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION set_academy_enrollment_payment_pending(UUID, TEXT)
  TO authenticated;

REVOKE EXECUTE ON FUNCTION mark_academy_enrollment_paid(UUID, TEXT, TEXT, INTEGER)
  FROM PUBLIC, anon, authenticated;
GRANT  EXECUTE ON FUNCTION mark_academy_enrollment_paid(UUID, TEXT, TEXT, INTEGER)
  TO service_role;

COMMIT;
