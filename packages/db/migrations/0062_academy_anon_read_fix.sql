-- =========================================================================
-- MIGRATION 0062: fix Akademi anon-read policies (drop is_admin() from them)
-- =========================================================================
-- BUG (introduced in 0060): the four anon-facing SELECT policies on
-- academy_programs / program_registration_fields / academy_modules /
-- academy_lessons used `USING (status = 'published' OR is_admin())`. But
-- migration 0018 REVOKEd EXECUTE on is_admin() from anon — so when an
-- anonymous visitor (the public marketing site reading published programs via
-- the anon key) evaluates these policies, Postgres raises
-- "permission denied for function is_admin" (SQLSTATE 42501) and the read
-- fails entirely. Effect: the web course pages + /api/akademi/[slug] program
-- lookup return empty → notFound()/404 for anon.
--
-- FIX: anon-facing read policies gate ONLY on status='published' (no is_admin
-- call), exactly like positions_anon_read_active / events_anon_read_published.
-- Admin access to DRAFT rows is already covered by the separate *_admin_all
-- policies (FOR ALL TO authenticated USING is_admin()), so admins still see
-- everything; we just stop forcing anon to execute a function it can't.
--
-- Permissive policies are OR'd, so: published row → readable via the read
-- policy (anon + authenticated); draft row → readable by admin via admin_all.
-- =========================================================================

DROP POLICY IF EXISTS "academy_programs_read_published" ON academy_programs;
CREATE POLICY "academy_programs_read_published" ON academy_programs
  FOR SELECT TO anon, authenticated
  USING (status = 'published');

DROP POLICY IF EXISTS "prf_read_published" ON program_registration_fields;
CREATE POLICY "prf_read_published" ON program_registration_fields
  FOR SELECT TO anon, authenticated
  USING (
    EXISTS (SELECT 1 FROM academy_programs p
            WHERE p.slug = program_slug AND p.status = 'published')
  );

DROP POLICY IF EXISTS "academy_modules_read" ON academy_modules;
CREATE POLICY "academy_modules_read" ON academy_modules
  FOR SELECT TO anon, authenticated
  USING (
    EXISTS (SELECT 1 FROM academy_programs p
            WHERE p.slug = program_slug AND p.status = 'published')
  );

DROP POLICY IF EXISTS "academy_lessons_read" ON academy_lessons;
CREATE POLICY "academy_lessons_read" ON academy_lessons
  FOR SELECT TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM academy_modules m
      JOIN academy_programs p ON p.slug = m.program_slug
      WHERE m.id = module_id AND p.status = 'published'
    )
  );

-- =========================================================================
-- DONE — migration 0062
-- =========================================================================
