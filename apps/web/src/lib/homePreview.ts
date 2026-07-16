/**
 * Shapes the homepage's decorative portal previews from the REAL catalog.
 *
 * These mockups used to be hardcoded (finding F5), which drifted exactly as
 * predicted: the barista card claimed "Jeddah · Antrian" for a position the DB
 * calls "Barista Riyadh" with an open batch, and the stat tiles claimed "17
 * posisi / 4 negara" one section above the real, DB-driven count. The rows stay
 * decorative (aria-hidden) — they illustrate the app, the CTA goes to the real
 * catalog — but they are now fed by the same fetch as everything else, so they
 * cannot contradict it again.
 */
import type { Position } from "./positions";
import type { CountryRegistry } from "./countries";

export type HomePreviewRow = {
  slug: string;
  /** Bucket hero when authored, else the static per-slug asset (mirrors PositionCard). */
  thumb: string;
  role: string;
  /** "🇸🇦 Saudi Arabia · Wanita · 21-38" — omits parts the position hasn't authored. */
  meta: string;
  salary: string;
  open: boolean;
};

export type HomeCountryChip = {
  key: string;
  name: string;
  /** Band image, or null when the registry has none (kuwait) — caller tints instead. */
  thumb: string | null;
  tint: string;
};

/** Open batches first, then the catalog's own order (country, then slug). */
function openFirst(positions: Position[]): Position[] {
  return [...positions].sort(
    (a, b) => Number(b.status === "open") - Number(a.status === "open"),
  );
}

export function buildHomePreviewRows(
  positions: Position[],
  registry: CountryRegistry,
  limit: number,
): HomePreviewRow[] {
  return openFirst(positions)
    .slice(0, limit)
    .map((p) => {
      const country = registry.resolve(p.country);
      const meta = [
        country?.flag ? `${country.flag} ${p.country}` : p.country,
        p.gender,
        p.age,
      ]
        .map((part) => (typeof part === "string" ? part.trim() : ""))
        .filter((part) => part.length > 0)
        .join(" · ");

      return {
        slug: p.slug,
        thumb: p.heroUrl || `/images/lowongan/${p.slug}.jpg`,
        role: p.role,
        meta,
        salary: p.salary,
        open: p.status === "open",
      };
    });
}

/**
 * Country chips for the phone mockup: only countries that actually have a
 * position rendering today, in the catalog's own order. Indonesia is registered
 * but has zero active positions, so it correctly drops out — the old hardcoded
 * copy advertised it anyway.
 */
export function buildHomeCountryChips(
  positions: Position[],
  registry: CountryRegistry,
  limit: number,
): HomeCountryChip[] {
  const seen = new Set<string>();
  const chips: HomeCountryChip[] = [];

  for (const p of positions) {
    const country = registry.resolve(p.country);
    if (!country || seen.has(country.key)) continue;
    seen.add(country.key);
    chips.push({
      key: country.key,
      name: country.label,
      thumb: country.imageUrl?.trim() ? country.imageUrl.trim() : null,
      tint: country.tintHex,
    });
    if (chips.length >= limit) break;
  }

  return chips;
}
