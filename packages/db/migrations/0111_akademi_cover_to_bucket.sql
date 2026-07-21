-- 0111_akademi_cover_to_bucket.sql
--
-- Pindahkan sampul Akademi dari path relatif ke URL absolut bucket.
--
-- BUG YANG DIPERBAIKI: migrasi 0110 mengisi academy_programs.cover_image dengan
-- path RELATIF '/images/akademi/<slug>.jpg', padahal file aslinya cuma ikut
-- deploy apps/web. Akibatnya di portal kandidat (app.perantauglobal.com) semua
-- sampul kelas 404 dan diam-diam jatuh ke gradien amber. Tidak ada error yang
-- kelihatan, gambarnya cuma hilang. Terverifikasi live sebelum perbaikan:
--
--   www.perantauglobal.com/images/akademi/...  -> 200
--   app.perantauglobal.com/images/akademi/...  -> 404
--
-- Ini kelas bug yang SAMA yang dulu sudah diselesaikan untuk foto lowongan
-- lewat bucket Storage; lihat komentar di packages/db/src/media.ts yang
-- menyebut "fixing the portal 404s where apps/platform never shipped the
-- photos". Jadi obatnya disamakan, bukan ditambal beda jalur: satu URL absolut
-- yang berlaku di kedua origin.
--
-- File dipindahkan ke bucket publik `position-media` prefix `akademi/` lewat
-- edge function `seed-academy-media` (mencerminkan `seed-position-media`).
-- Migrasi ini mencatat perubahan datanya supaya ledger repo cocok dengan
-- keadaan produksi, dan supaya rebuild dari nol menghasilkan hal yang sama.
--
-- Idempoten: hanya menyentuh baris yang masih memakai path relatif.

UPDATE academy_programs
   SET cover_image =
         'https://jeadtvxgxmqnsqwxjmhj.supabase.co/storage/v1/object/public/position-media/akademi/'
         || replace(cover_image, '/images/akademi/', '')
 WHERE cover_image LIKE '/images/akademi/%';
