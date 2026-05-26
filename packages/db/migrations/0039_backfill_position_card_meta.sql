-- ============================================================================
-- Migration 0039 — Backfill positions.content.cardMeta from static catalog
-- ============================================================================
-- The structural refactor of apps/web /lowongan flips the position LIST
-- from iterating a static array to fetching from `positions` and reading
-- card display data (icon, salary, gender, age, contractLabel) from
-- positions.content.cardMeta JSONB.
--
-- This migration seeds cardMeta into the 18 positions that previously
-- lived in apps/web/src/lib/positions.ts so admin can edit them via the
-- new editor section without losing fidelity.
--
-- Idempotent: uses `||` to merge; existing keys win. Re-running is safe.
-- ============================================================================

UPDATE positions p
SET content = COALESCE(p.content, '{}'::jsonb) || jsonb_build_object('cardMeta', v.card_meta)
FROM (
  VALUES
    ('perawat-saudi-arabia',          jsonb_build_object('icon','stethoscope','salary','SAR 3.200','salaryNote','+ makan SAR 200','gender','Wanita','age','21–38','contractLabel','Kontrak 2 tahun')),
    ('barista-saudi-arabia',          jsonb_build_object('icon','coffee',     'salary','SAR 1.500','salaryNote','+ makan SAR 300','gender','L/P',    'age','21–30','contractLabel','Kontrak 2 tahun')),
    ('waiter-saudi-arabia',           jsonb_build_object('icon','bowl',       'salary','SAR 1.500','salaryNote','+ makan SAR 300','gender','Laki-laki','age','21–30','contractLabel','Kontrak 2 tahun')),
    ('waitress-saudi-arabia',         jsonb_build_object('icon','bowl',       'salary','SAR 1.600','salaryNote','+ makan',        'gender','Wanita','age','21–35','contractLabel','Kontrak 2 tahun')),
    ('chef-bakery-saudi-arabia',      jsonb_build_object('icon','bowl',       'salary','SAR 2.000','salaryNote','+ makan',        'gender','Laki-laki','age','21–35','contractLabel','Kontrak 2 tahun')),
    ('head-barista-saudi-arabia',     jsonb_build_object('icon','coffee',     'salary','SAR 2.200','salaryNote','/bulan',         'gender','Laki-laki','age','21–30','contractLabel','Kontrak 2 tahun')),
    ('roaster-saudi-arabia',          jsonb_build_object('icon','coffee',     'salary','SAR 2.800','salaryNote','/bulan (mulai)', 'gender','Laki-laki','age','21–30','contractLabel','Kontrak 2 tahun')),
    ('chef-pastry-saudi-arabia',      jsonb_build_object('icon','bowl',       'salary','SAR 2.500','salaryNote','/bulan (mulai)', 'gender','Laki-laki','age','21–30','contractLabel','Kontrak 2 tahun')),
    ('spa-therapist-saudi-arabia',    jsonb_build_object('icon','sparkle',    'salary','SAR 1.500','salaryNote','+ makan SAR 300','gender','Wanita','age','28–40','contractLabel','Kontrak 2 tahun')),
    ('laundry-worker-saudi-arabia',   jsonb_build_object('icon','shield',     'salary','SAR 1.500','salaryNote','+ makan SAR 300','gender','Wanita','age','23–33','contractLabel','Kontrak 2 tahun')),
    ('heavy-diesel-mechanic-saudi-arabia', jsonb_build_object('icon','truck', 'salary','SAR 3.500–4.000','salaryNote','/bulan',   'gender','Laki-laki','age','25–37','contractLabel','Kontrak 2 tahun')),
    ('truck-driver-jepang',           jsonb_build_object('icon','truck',      'salary','¥250.000', 'salaryNote','/bulan',         'gender','Laki-laki','age','max 44','contractLabel','Komitmen 5 tahun')),
    ('food-service-jepang',           jsonb_build_object('icon','bowl',       'salary','¥1.226',   'salaryNote','/jam',           'gender','L/P',    'age','max 35','contractLabel','Sistem SSW')),
    ('kaigo-jepang',                  jsonb_build_object('icon','heart',      'salary','¥190.000', 'salaryNote','/bulan THP',     'gender','Wanita','age','18–35','contractLabel','Sistem SSW Kaigo')),
    ('pengolahan-makanan-jepang',     jsonb_build_object('icon','bowl',       'salary','¥210.000', 'salaryNote','/bulan',         'gender','Wanita','age','20–35','contractLabel','Sistem SSW')),
    ('manufaktur-pengelasan',         jsonb_build_object('icon','briefcase',  'salary','¥244.200', 'salaryNote','/bulan',         'gender','Laki-laki','age','max 35','contractLabel','Sistem SSW')),
    ('caregiver-taiwan',              jsonb_build_object('icon','heart',      'salary','NT$ 29.500','salaryNote','/bulan',        'gender','Wanita','age','20–40','contractLabel','Kontrak 3 tahun')),
    ('spg-indonesia',                 jsonb_build_object('icon','sparkle',    'salary','Penempatan','salaryNote','domestic',      'gender','Wanita','age','fleksibel','contractLabel','Lokasi Indonesia'))
) AS v(slug, card_meta)
WHERE p.slug = v.slug
  AND (p.content -> 'cardMeta') IS NULL;

-- ============================================================================
-- DONE — migration 0039
-- ============================================================================
