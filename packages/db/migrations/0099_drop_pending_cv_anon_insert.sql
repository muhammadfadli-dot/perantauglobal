-- 0099_drop_pending_cv_anon_insert.sql
--
-- CV Grader Hygiene plan — WS-5 FINAL step. Cabut policy anon-INSERT langsung ke
-- pending-cv. Setelah ini upload CV HANYA lewat signed URL yang di-mint server
-- (edge fn issue-cv-upload-url, digate rate-limit + secret di route). Signed URL
-- bypass RLS jadi tetap works; jalur direct anon .upload() (publishable key
-- ter-embed di bundle) sekarang DITOLAK -> nutup vektor flood upload terbuka.
--
-- PRASYARAT (sudah dipenuhi sebelum apply): jalur signed URL diverifikasi E2E di
-- prod (route -> token -> uploadToSignedUrl -> object landed). cv-materialize +
-- admin akses pending-cv via service-role (bypass RLS), TIDAK terpengaruh.
--
-- ROLLBACK: re-create policy (definisi verbatim dari 0078):
--   CREATE POLICY pending_cv_anon_insert ON storage.objects
--     FOR INSERT TO anon
--     WITH CHECK (bucket_id = 'pending-cv'
--       AND (storage.foldername(name))[1] = 'pending'
--       AND array_length(storage.foldername(name), 1) = 2);

DROP POLICY IF EXISTS pending_cv_anon_insert ON storage.objects;
