-- 0097_list_stale_referenced_pending_cv.sql
--
-- CV Grader Hygiene plan — WS-2d backstop. Additive, 1 fungsi.
--
-- Konteks: setelah 0095 (list_orphan_pending_cv mengecualikan file yg masih
-- direferensikan) + cv-materialize yg bersihin metadata saat move not-found,
-- SUMBER dangling udah ketutup. Yang tersisa cuma kasus langka: kandidat verify
-- email (metadata candidate_documents kebikin) TAPI cv-materialize gagal MOVE
-- karena sebab TRANSIENT (bukan not-found), lalu nggak pernah keretry. File +
-- metadata-nya nyangkut. list_orphan_pending_cv SENGAJA nggak ngehapusnya (masih
-- direferensikan). Fungsi ini daftar file pending-cv yg direferensikan TAPI udah
-- tua (> N hari) = anomali; hygiene fn hapus file + metadata-nya sekalian.
--
-- Cuma BACA path (service-role only). Penghapusan fisik lewat Storage API di fn.

CREATE OR REPLACE FUNCTION public.list_stale_referenced_pending_cv(p_days INT DEFAULT 14)
  RETURNS SETOF TEXT
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path = public, storage
AS $$
  SELECT o.name
  FROM storage.objects o
  JOIN public.candidate_documents cd ON cd.file_path = o.name
  WHERE o.bucket_id = 'pending-cv'
    AND o.created_at < NOW() - make_interval(days => GREATEST(p_days, 1));
$$;

REVOKE EXECUTE ON FUNCTION public.list_stale_referenced_pending_cv(INT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.list_stale_referenced_pending_cv(INT) TO service_role;
