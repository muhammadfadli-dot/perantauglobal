-- =========================================================================
-- Perantau Global — Events + event registrations
-- Migration: 0055_events_registrations
-- Created: 2026-05-28
--
-- Standalone event landing pages (sharing sessions / webinars) with
-- first-party registration capture, so paid traffic is measurable
-- end-to-end (Meta CAPI CompleteRegistration) instead of leaking into
-- Google Forms where conversions can't be attributed to ad spend.
--
-- Deliberately NOT reusing candidates/applications: an event signup is a
-- frictionless top-of-funnel lead, NOT a job application. No magic-link /
-- auth — anon insert only, mirroring pending_submissions. Verified email
-- isn't required for a free webinar (Zoom link goes to email + WhatsApp).
-- =========================================================================

-- -------------------------------------------------------------------------
-- EVENTS — one row per event; LP copy lives in `content` JSONB so a new
-- event = one INSERT, no code change.
-- -------------------------------------------------------------------------
CREATE TABLE events (
  slug          TEXT PRIMARY KEY,
  title         TEXT NOT NULL,
  kind          TEXT NOT NULL DEFAULT 'sharing_session',
  status        TEXT NOT NULL DEFAULT 'draft',          -- draft | published | closed
  starts_at     TIMESTAMPTZ NOT NULL,
  ends_at       TIMESTAMPTZ,
  timezone      TEXT NOT NULL DEFAULT 'Asia/Jakarta',
  platform      TEXT NOT NULL DEFAULT 'Zoom',
  join_url      TEXT,                                    -- revealed post-register / via reminder
  capacity      INTEGER,
  content       JSONB NOT NULL DEFAULT '{}',             -- tagline, intro, benefits[], speakers[], poster, audience
  cover_image   TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT events_status_check CHECK (status IN ('draft', 'published', 'closed')),
  CONSTRAINT events_kind_check   CHECK (kind IN ('sharing_session', 'webinar', 'workshop', 'info_session'))
);

CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_starts_at ON events(starts_at);

CREATE TRIGGER trg_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- -------------------------------------------------------------------------
-- EVENT_REGISTRATIONS — the leads. Frictionless anon capture + attribution.
-- (`profession` not `current_role`: CURRENT_ROLE is a reserved SQL keyword.)
-- -------------------------------------------------------------------------
CREATE TABLE event_registrations (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_slug         TEXT NOT NULL REFERENCES events(slug) ON DELETE CASCADE,
  full_name          TEXT NOT NULL,
  whatsapp           TEXT NOT NULL,
  email              TEXT NOT NULL,
  city               TEXT,
  profession         TEXT,                               -- Perawat / Bidan / Mahasiswa keperawatan / ...
  interest           TEXT,                               -- negara/posisi yang diminati — qualifying signal
  answers            JSONB NOT NULL DEFAULT '{}',
  status             TEXT NOT NULL DEFAULT 'registered', -- registered | reminded | attended | no_show
  consent_marketing  BOOLEAN NOT NULL DEFAULT false,
  source             TEXT,
  utm_source         TEXT,
  utm_medium         TEXT,
  utm_campaign       TEXT,
  utm_content        TEXT,
  utm_term           TEXT,
  referrer_url       TEXT,
  fbp                TEXT,
  fbc                TEXT,
  meta_event_id      TEXT,
  ip_address         INET,
  user_agent         TEXT,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT event_registrations_status_check
    CHECK (status IN ('registered', 'reminded', 'attended', 'no_show')),
  CONSTRAINT event_registrations_unique_email UNIQUE (event_slug, email)
);

CREATE INDEX idx_event_reg_event   ON event_registrations(event_slug);
CREATE INDEX idx_event_reg_created ON event_registrations(created_at);
CREATE INDEX idx_event_reg_status  ON event_registrations(event_slug, status);

-- -------------------------------------------------------------------------
-- RLS — events: public read published, admin all.
--       registrations: anon insert (submit), admin read + manage.
-- -------------------------------------------------------------------------
ALTER TABLE events              ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "events_anon_read_published"
  ON events FOR SELECT
  TO anon, authenticated
  USING (status = 'published');

-- Admin elevation = is_admin() (admin_users table), NOT a raw JWT role claim —
-- the JWT role hook isn't wired (see migration 0004). Matches every other
-- admin policy in the schema (candidates, contact_submissions, etc.).
CREATE POLICY "events_admin_all"
  ON events FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "event_reg_anon_insert"
  ON event_registrations FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "event_reg_admin_read"
  ON event_registrations FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "event_reg_admin_write"
  ON event_registrations FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- -------------------------------------------------------------------------
-- SEED — first event: nurse sharing session (29 Mei 2026, 18:30 WIB).
-- -------------------------------------------------------------------------
INSERT INTO events (slug, title, kind, status, starts_at, timezone, platform, content, cover_image)
VALUES (
  'sharing-session-perawat',
  'Merawat Dunia, Mengharumkan Indonesia',
  'sharing_session',
  'published',
  '2026-05-29T11:30:00Z',                                -- 18:30 WIB
  'Asia/Jakarta',
  'Zoom',
  jsonb_build_object(
    'tagline', 'Berani melangkah lebih jauh, demi masa depan yang lebih cerah.',
    'intro', 'Banyak perawat Indonesia yang punya impian berkarier di luar negeri, tapi nggak tahu harus mulai dari mana. Proses dokumen terasa rumit, informasi yang beredar simpang siur, dan rasa ragu sering kali mengalahkan semangat. Padahal, sudah banyak perawat kita yang berhasil melewatinya — dan kini tengah merawat pasien di Saudi Arabia, sambil mengharumkan nama Indonesia di kancah global.',
    'audience', 'Gratis & terbuka untuk seluruh tenaga perawat Indonesia.',
    'host', 'Perantau Global',
    'poster', '/images/events/sharing-session-perawat/poster.png',
    'benefits', jsonb_build_array(
      'Mendengar cerita sukses dari perawat Indonesia yang sudah bertugas di Saudi Arabia',
      'Memahami alur lengkap proses dokumen keberangkatan — dari awal hingga siap terbang',
      'Mendapatkan gambaran nyata tentang kehidupan dan tantangan bekerja di luar negeri',
      'Termotivasi untuk mengambil langkah pertama menuju karier internasional'
    ),
    'speakers', jsonb_build_array(
      jsonb_build_object(
        'name', 'Alfi Ainur Rosikho',
        'role', 'Kandidat Nurse',
        'org', 'Euphoria Clinic, Riyadh',
        'photo', '/images/events/sharing-session-perawat/alfi.jpg'
      ),
      jsonb_build_object(
        'name', 'Tessa Eka Angganish, Amd. Keb',
        'role', 'Bidan',
        'org', 'RS Al Salam Health Medical Hospital, Riyadh',
        'photo', '/images/events/sharing-session-perawat/tessa.jpg'
      )
    )
  ),
  '/images/events/sharing-session-perawat/poster.png'
);
