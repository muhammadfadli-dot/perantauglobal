-- =============================================================================
-- Migration 0042 — Pre-departure checklist for Beranda S5 (DRAFT)
--
-- Status: DRAFT — not applied. Apply only when admin UI for managing
-- departure checklists ships.
--
-- Per-application checklist of pre-departure items (paspor selesai, MCU,
-- briefing, visa, tiket, asuransi, tukar mata uang, briefing terakhir).
-- Each item is admin-managed (created/checked off) with optional due_date.
-- =============================================================================

CREATE TABLE IF NOT EXISTS pre_departure_checklist (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id  uuid NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  item_order      integer NOT NULL,
  item_label      text NOT NULL,
  item_description text,
  required        boolean NOT NULL DEFAULT true,
  due_date        date,
  completed_at    timestamptz,
  completed_by    uuid REFERENCES auth.users(id),         -- admin who checked it off
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (application_id, item_order)
);

CREATE INDEX pre_departure_checklist_app_idx
  ON pre_departure_checklist(application_id, item_order);

CREATE INDEX pre_departure_checklist_pending_idx
  ON pre_departure_checklist(application_id) WHERE completed_at IS NULL;

-- RLS
ALTER TABLE pre_departure_checklist ENABLE ROW LEVEL SECURITY;

CREATE POLICY pre_departure_checklist_own_read ON pre_departure_checklist
  FOR SELECT TO authenticated
  USING (
    is_admin() OR
    EXISTS (
      SELECT 1 FROM applications a
      JOIN candidates c ON c.id = a.candidate_id
      WHERE a.id = application_id AND c.auth_user_id = auth.uid()
    )
  );

CREATE POLICY pre_departure_checklist_admin_write ON pre_departure_checklist
  FOR ALL TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

-- Default checklist items template — admin can seed via:
--   SELECT seed_default_departure_checklist('app-id-here');
CREATE OR REPLACE FUNCTION seed_default_departure_checklist(p_application_id uuid)
RETURNS void AS $$
BEGIN
  INSERT INTO pre_departure_checklist (application_id, item_order, item_label, item_description, required)
  VALUES
    (p_application_id, 1, 'Paspor Perantau Global selesai', 'Modul siap kerja selesai + sertifikat terbit', true),
    (p_application_id, 2, 'MCU akhir di RS rekanan', 'Hasil sehat fisik lengkap', true),
    (p_application_id, 3, 'Briefing pra-keberangkatan', 'Briefing dari tim Perantau Global', true),
    (p_application_id, 4, 'Visa kerja diterima', 'Stempel visa di paspor fisik', true),
    (p_application_id, 5, 'Tiket pesawat', 'Tiket dari Perantau Global / employer', true),
    (p_application_id, 6, 'Asuransi kerja', 'Polis aktif, kartu di tangan', true),
    (p_application_id, 7, 'Tukar mata uang awal', 'Yen / Riyal / NT$ minimal 1 bulan biaya hidup', false),
    (p_application_id, 8, 'Briefing terakhir di kantor', 'Tatap muka di kantor Perantau Global sebelum berangkat', true)
  ON CONFLICT (application_id, item_order) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
