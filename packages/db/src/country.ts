/**
 * Canonical country mapping — the ONE source of truth shared by web, portal,
 * and admin so the surfaces cannot drift.
 *
 * Background: country metadata used to be duplicated in 8+ files across the two
 * apps. They diverged, and `country=europe` (the live Head Driller / Assistant
 * Driller positions) was never added to the portal/admin tables — candidates
 * saw a Japanese flag, a raw "europe" token, or vanished from /explore. Import
 * from here instead of re-declaring a local map.
 *
 * `dbValue` is the literal value stored in `positions.country`.
 */

export type CountryKey =
  | "saudi"
  | "jepang"
  | "taiwan"
  | "indonesia"
  | "europe"
  | "mexico";

export type CountryMeta = {
  key: CountryKey;
  /** literal value stored in positions.country */
  dbValue: string;
  /** Indonesian candidate-facing label */
  label: string;
  /** 2-letter badge initials used in the admin CRM */
  initials: string;
  /** flag emoji */
  flag: string;
  /** solid hex tint used as portal card background behind the photo */
  tintHex: string;
  /** CSS filter applied to portal hero images (country grade) */
  tintFilter: string;
};

export const COUNTRY_META: Record<CountryKey, CountryMeta> = {
  saudi: {
    key: "saudi",
    dbValue: "saudi_arabia",
    label: "Arab Saudi",
    initials: "SA",
    flag: "🇸🇦",
    tintHex: "#8a5a14",
    tintFilter: "saturate(1.05) brightness(0.94) sepia(0.16)",
  },
  jepang: {
    key: "jepang",
    dbValue: "japan",
    label: "Jepang",
    initials: "JP",
    flag: "🇯🇵",
    tintHex: "#1c3d6e",
    tintFilter: "saturate(0.85) brightness(0.92) hue-rotate(-8deg)",
  },
  taiwan: {
    key: "taiwan",
    dbValue: "taiwan",
    label: "Taiwan",
    initials: "TW",
    flag: "🇹🇼",
    tintHex: "#1e6d4d",
    tintFilter: "saturate(1.1) brightness(0.95)",
  },
  indonesia: {
    key: "indonesia",
    dbValue: "indonesia",
    label: "Indonesia",
    initials: "ID",
    flag: "🇮🇩",
    tintHex: "#b8341c",
    tintFilter: "saturate(1.05) brightness(0.93)",
  },
  europe: {
    key: "europe",
    dbValue: "europe",
    label: "Eropa Timur",
    initials: "EU",
    flag: "🇪🇺",
    tintHex: "#4f6d7a",
    tintFilter: "saturate(0.95) brightness(0.93)",
  },
  mexico: {
    key: "mexico",
    dbValue: "mexico",
    label: "Meksiko",
    initials: "MX",
    flag: "🇲🇽",
    tintHex: "#9c5a2a",
    tintFilter: "saturate(1.08) brightness(0.93) sepia(0.08)",
  },
};

/** Display order for tiles/filters. */
export const COUNTRY_KEYS: CountryKey[] = [
  "saudi",
  "jepang",
  "taiwan",
  "europe",
  "mexico",
  "indonesia",
];

/** Every alias we have ever stored in positions.country, lowercased. */
const ALIASES: Record<string, CountryKey> = {
  saudi: "saudi",
  saudi_arabia: "saudi",
  "saudi arabia": "saudi",
  "arab saudi": "saudi",
  ksa: "saudi",
  japan: "jepang",
  jepang: "jepang",
  taiwan: "taiwan",
  indonesia: "indonesia",
  europe: "europe",
  eropa: "europe",
  "eropa timur": "europe",
  ee: "europe",
  mexico: "mexico",
  meksiko: "mexico",
  mx: "mexico",
};

/** Map any stored/aliased country string to a key. Returns null for "any"/unknown. */
export function normalizeCountryKey(
  s: string | null | undefined,
): CountryKey | null {
  if (!s) return null;
  return ALIASES[s.trim().toLowerCase()] ?? null;
}

/** Candidate-facing label from a raw db value. Never silently wrong: unknown → fallback. */
export function countryLabelFromDb(
  db: string | null | undefined,
  fallback = "Global",
): string {
  const k = normalizeCountryKey(db);
  return k ? COUNTRY_META[k].label : fallback;
}

/** Admin badge initials from a raw db value. */
export function countryInitialsFromDb(
  db: string | null | undefined,
  fallback = "GL",
): string {
  const k = normalizeCountryKey(db);
  return k ? COUNTRY_META[k].initials : fallback;
}

// Convenience maps keyed by CountryKey (portal components prefer these).
export const COUNTRY_LABEL: Record<CountryKey, string> = Object.fromEntries(
  COUNTRY_KEYS.map((k) => [k, COUNTRY_META[k].label]),
) as Record<CountryKey, string>;

export const COUNTRY_FLAG: Record<CountryKey, string> = Object.fromEntries(
  COUNTRY_KEYS.map((k) => [k, COUNTRY_META[k].flag]),
) as Record<CountryKey, string>;

export const COUNTRY_TINT: Record<CountryKey, string> = Object.fromEntries(
  COUNTRY_KEYS.map((k) => [k, COUNTRY_META[k].tintHex]),
) as Record<CountryKey, string>;

export const COUNTRY_TINT_FILTER: Record<CountryKey, string> =
  Object.fromEntries(
    COUNTRY_KEYS.map((k) => [k, COUNTRY_META[k].tintFilter]),
  ) as Record<CountryKey, string>;

export const COUNTRY_DB_VALUE: Record<CountryKey, string> = Object.fromEntries(
  COUNTRY_KEYS.map((k) => [k, COUNTRY_META[k].dbValue]),
) as Record<CountryKey, string>;

/**
 * Options for admin position-authoring selects. Includes a trailing "any"
 * (Lainnya / Global) so admins keep the misc bucket the create form had.
 */
export const COUNTRY_OPTIONS: {
  value: string;
  label: string;
  initials: string;
}[] = [
  ...COUNTRY_KEYS.map((k) => ({
    value: COUNTRY_META[k].dbValue,
    label: COUNTRY_META[k].label,
    initials: COUNTRY_META[k].initials,
  })),
  { value: "any", label: "Lainnya / Global", initials: "GL" },
];

// City per position slug (mirrors apps/web) so portal cards can show a city
// like the public ones do, instead of country-only.
const CITY_BY_SLUG: Record<string, string> = {
  "perawat-saudi-arabia": "Riyadh",
  "barista-saudi-arabia": "Jeddah",
  "waiter-saudi-arabia": "Riyadh",
  "waitress-saudi-arabia": "Riyadh",
  "chef-bakery-saudi-arabia": "Jeddah",
  "head-barista-saudi-arabia": "Riyadh",
  "roaster-saudi-arabia": "Jeddah",
  "chef-pastry-saudi-arabia": "Riyadh",
  "spa-therapist-saudi-arabia": "Jeddah",
  "laundry-worker-saudi-arabia": "Riyadh",
  "heavy-diesel-mechanic-saudi-arabia": "Dammam",
  "truck-driver-jepang": "Osaka",
  "food-service-jepang": "Tokyo",
  "kaigo-jepang": "Nagoya",
  "pengolahan-makanan-jepang": "Hokkaido",
  "manufaktur-pengelasan": "Aichi",
  "caregiver-taiwan": "Taipei",
  "spg-indonesia": "Jakarta",
  "head-driller": "Balkan",
  "assistant-driller": "Balkan",
  "welder-heavy-steel-plate-fabrication": "Monterrey",
};

const FALLBACK_CITY: Record<CountryKey, string> = {
  saudi: "Riyadh",
  jepang: "Tokyo",
  taiwan: "Taipei",
  indonesia: "Jakarta",
  europe: "Balkan",
  mexico: "Monterrey",
};

/** City for a position slug, falling back to the country's primary city. */
export function cityForSlug(slug: string, countryKey: CountryKey): string {
  return CITY_BY_SLUG[slug] ?? FALLBACK_CITY[countryKey];
}
