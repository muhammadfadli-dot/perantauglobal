-- 0116_akademi_lesson_paywall_rls.sql
--
-- Audit Akademi 2026-07-21, temuan K4.
--
-- `academy_lessons_read` cuma menuntut program berstatus published. Diuji
-- sebagai role anon: 37 pelajaran terbaca tanpa login. Hari ini kerugiannya
-- NOL, karena satu-satunya program yang punya pelajaran memang gratis dan 3
-- program sertifikasi punya 0 pelajaran (pelatihannya tatap muka).
--
-- Masalahnya bukan hari ini. Pertahanan paywall saat ini murni di layer
-- aplikasi (apps/platform .../lesson/[lessonId]/page.tsx). Begitu kursus
-- berbayar berbasis dalam-aplikasi yang pertama dibuat, seluruh isinya
-- langsung terbaca siapa pun lewat REST API pakai anon key, tanpa ada satu
-- baris kode pun yang berubah dan tanpa peringatan apa pun.
--
-- Policy ini menutupnya SEKARANG, selagi dampaknya nol, supaya defaultnya
-- gagal-tertutup. Diverifikasi sebelum diterapkan: pelajaran terbaca anon
-- 37 sebelum, 37 sesudah, 0 yang jadi tertutup.
--
-- Konsekuensi yang disengaja untuk nanti: kurikulum kursus BERBAYAR tidak akan
-- tampil ke pengunjung anonim. Kalau nanti halaman publik perlu memamerkan
-- daftar pelajarannya, ekspos lewat view tanpa kolom `content`, jangan dengan
-- melonggarkan policy ini lagi.

DROP POLICY IF EXISTS academy_lessons_read ON academy_lessons;

CREATE POLICY academy_lessons_read ON academy_lessons
  FOR SELECT TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM academy_modules m
      JOIN academy_programs p ON p.slug = m.program_slug
      WHERE m.id = academy_lessons.module_id
        AND p.status = 'published'
        AND (
          p.is_free
          OR EXISTS (
            SELECT 1
            FROM academy_enrollments e
            JOIN candidates c ON c.id = e.candidate_id
            WHERE e.program_slug = m.program_slug
              AND c.auth_user_id = auth.uid()
              AND e.payment_status IN ('paid', 'waived')
          )
        )
    )
  );
