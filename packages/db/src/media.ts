/**
 * Public URLs for the `position-media` Storage bucket (migration 0075, seeded
 * by the seed-position-media edge function). Both apps reference imagery by
 * absolute URL so it's decoupled from per-app /public deploys — fixing the
 * portal 404s where apps/platform never shipped the photos.
 *
 * Images are named by slug (lowongan/<slug>.jpg) and country key
 * (countries/<key>.jpg), mirroring apps/web/public/images.
 */

const STORAGE_BASE = (
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://jeadtvxgxmqnsqwxjmhj.supabase.co"
).replace(/\/$/, "");

const BUCKET = "position-media";

/** Absolute public URL for a path inside the position-media bucket. */
export function positionMediaUrl(path: string): string {
  return `${STORAGE_BASE}/storage/v1/object/public/${BUCKET}/${path}`;
}

/** Hero photo for a position slug. */
export function positionHeroUrl(slug: string): string {
  return positionMediaUrl(`lowongan/${slug}.jpg`);
}

/** Country photo for a CountryKey (saudi | jepang | taiwan | indonesia | europe). */
export function countryImageUrl(key: string): string {
  return positionMediaUrl(`countries/${key}.jpg`);
}
