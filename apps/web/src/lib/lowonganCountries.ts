/**
 * Web-side country metadata — now an adapter over the shared country registry
 * (@perantauglobal/db/country), not a hand-maintained copy. This removes the
 * drift that hid Bulgaria + Kuwait from surfaces and makes the DB the single
 * source of truth.
 *
 * The sync COUNTRY_META / COUNTRY_KEYS below derive from the embedded snapshot
 * (all 8 live countries) and are the offline fallback. Render paths that must
 * reflect a just-added country with no deploy fetch the live registry via
 * lib/countries.getCountries() and map rows through toWebCountry().
 */
import {
  SNAPSHOT_REGISTRY,
  type CountryMeta as RegistryCountry,
} from "@perantauglobal/db/country";

/** Shape the web components consume (kept stable across the registry refactor). */
export type CountryMeta = {
  key: string;
  name: string;
  short: string;
  flag: string;
  currency: string;
  contract: string;
  img: string;
  tagline: string;
  /** CSS filter applied to chapter band hero image — country tint */
  imgFilter: string;
  /** Country tint hex used as solid background when heroImg is missing */
  tint: string;
};

/** Map a shared registry row to the web component shape. */
export function toWebCountry(m: RegistryCountry): CountryMeta {
  return {
    key: m.key,
    name: m.label,
    short: m.label,
    flag: m.flag,
    currency: m.currency,
    contract: m.contract,
    img: m.imageUrl,
    tagline: m.tagline,
    imgFilter: m.imgFilter,
    tint: m.tintHex,
  };
}

const ACTIVE = SNAPSHOT_REGISTRY.activeCountries();

export const COUNTRY_META: Record<string, CountryMeta> = Object.fromEntries(
  ACTIVE.map((m) => [m.key, toWebCountry(m)]),
);

export const COUNTRY_KEYS: string[] = ACTIVE.map((m) => m.key);

/** Resolve a display name / label back to a country key (snapshot-scoped). */
export function countryKeyFromName(name: string): string {
  return SNAPSHOT_REGISTRY.resolve(name)?.key ?? ACTIVE[0].key;
}

/** City for a position slug, falling back to the country's primary city. */
export function cityForSlug(slug: string, countryKey: string): string {
  return SNAPSHOT_REGISTRY.cityForSlug(slug, countryKey);
}
