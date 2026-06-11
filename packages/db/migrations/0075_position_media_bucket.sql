-- 0075: Public Storage bucket for position + country imagery.
--
-- Problem: the 23 lowongan photos + 5 country photos live only in
-- apps/web/public/images and 404 on app.perantauglobal.com — every photo-driven
-- portal surface (country tiles, job cards, journey hero, thumbnails) renders a
-- flat color tint while the public page the candidate just left was full of real
-- photos. A bucket decouples imagery from per-app deploys and is consumed by
-- both apps by absolute URL.
--
-- public=true → objects are served at
--   {SUPABASE_URL}/storage/v1/object/public/position-media/<path>
-- with no auth, so the portal (and web) can reference them directly. CSP on both
-- apps already whitelists https://*.supabase.co for img-src.
insert into storage.buckets (id, name, public)
values ('position-media', 'position-media', true)
on conflict (id) do update set public = true;
