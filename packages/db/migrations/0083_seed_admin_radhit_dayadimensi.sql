-- Migration 0083 — Grant admin access to Radhitya Budiputranto (Head Marketing, Dayalima Group)
-- Adds email to the admin_users allowlist; is_admin() then elevates this user on sign-in.
-- The auth.users account already existed (registered as a candidate 2026-04-23);
-- password was reset to the agreed value out-of-band. This migration only handles the allowlist.
INSERT INTO public.admin_users (email, added_by, notes)
VALUES (
  'radhitya.budiputranto@dayadimensi.id',
  NULL,
  'Head Marketing Dayalima — provisioned 2026-06-18'
)
ON CONFLICT (email) DO NOTHING;
