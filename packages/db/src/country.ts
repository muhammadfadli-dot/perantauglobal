/**
 * Country registry — the ONE source of truth for country metadata shared by
 * apps/web, apps/platform, and the admin position editor.
 *
 * Source of truth is the `public.countries` table (migration 0101). This module
 * exposes:
 *   - getCountryRegistry(supabase): async DB read (falls back to the embedded
 *     snapshot on error) — use this on render paths so a country added in the
 *     admin appears live with no code deploy.
 *   - COUNTRY_SNAPSHOT + the sync COUNTRY_* maps: the embedded snapshot mirror
 *     of the seed, used as the offline fallback and for the handful of sync
 *     call sites. It carries all 8 live countries, so even the sync path can no
 *     longer drift (the previous 6-vs-8 split hid Bulgaria + Kuwait from the
 *     candidate portal).
 *
 * When you add a country: insert a row in `public.countries` (admin UI) AND, so
 * the offline snapshot stays correct, append it to COUNTRY_SNAPSHOT here.
 */

export type CountryKey =
  | "saudi"
  | "jepang"
  | "taiwan"
  | "indonesia"
  | "europe"
  | "mexico"
  | "bulgaria"
  | "kuwait";

/** Full country row as stored in `public.countries` (sans audit timestamps). */
export type CountryMeta = {
  /** internal key: saudi, jepang, … (also the country-image basename) */
  key: string;
  /** literal value stored in positions.country */
  dbValue: string;
  /** candidate-facing display name (also the web PositionCountry string) */
  label: string;
  /** 2-letter badge for the admin CRM */
  initials: string;
  /** flag emoji */
  flag: string;
  /** e.g. "SAR riyal", "¥ yen" */
  currency: string;
  /** default contract label */
  contract: string;
  /** chapter band tagline (web) */
  tagline: string;
  /** country band/card image (path or URL) */
  imageUrl: string;
  /** CSS filter over the web band image */
  imgFilter: string;
  /** web band + card fallback tint */
  tintHex: string;
  /** portal card background tint */
  portalTintHex: string;
  /** portal hero image grade filter */
  portalTintFilter: string;
  /** ISO 3166-1 alpha-2 for JobPosting JSON-LD */
  iso: string;
  /** fallback city when a slug has none */
  defaultCity: string;
  /** raw country strings that normalize to this row */
  aliases: string[];
  /** display order for tiles/chapters */
  sortOrder: number;
  /** shows as a country chapter/filter */
  active: boolean;
};

/**
 * Embedded mirror of the `public.countries` seed (migration 0101). Keep in sync
 * when countries change. Includes the inactive "any"/Global bucket last.
 */
export const COUNTRY_SNAPSHOT: readonly CountryMeta[] = [
  {
    key: "saudi", dbValue: "saudi_arabia", label: "Saudi Arabia", initials: "SA", flag: "🇸🇦",
    currency: "SAR riyal", contract: "Kontrak 2 tahun",
    tagline: "Hospitality, perawat, mekanik berat, gaji riyal, makan ditanggung. Banyak posisi terbuka di Riyadh & Jeddah.",
    imageUrl: "/images/countries/saudi.jpg", imgFilter: "saturate(1.05) brightness(0.96) sepia(0.18)",
    tintHex: "#b89358", portalTintHex: "#8a5a14", portalTintFilter: "saturate(1.05) brightness(0.94) sepia(0.16)",
    iso: "SA", defaultCity: "Riyadh", aliases: ["saudi", "saudi_arabia", "saudi arabia", "arab saudi", "ksa"],
    sortOrder: 1, active: true,
  },
  {
    key: "jepang", dbValue: "japan", label: "Jepang", initials: "JP", flag: "🇯🇵",
    currency: "¥ yen", contract: "Sistem SSW · 5 tahun",
    tagline: "Sistem SSW resmi pemerintah Jepang. Caregiver (Kaigo), food service, dan pengolahan makanan, kerja terstruktur, hak penuh.",
    imageUrl: "/images/countries/jepang.jpg", imgFilter: "saturate(0.85) brightness(0.92) hue-rotate(-8deg)",
    tintHex: "#36598c", portalTintHex: "#1c3d6e", portalTintFilter: "saturate(0.85) brightness(0.92) hue-rotate(-8deg)",
    iso: "JP", defaultCity: "Tokyo", aliases: ["japan", "jepang"],
    sortOrder: 2, active: true,
  },
  {
    key: "taiwan", dbValue: "taiwan", label: "Taiwan", initials: "TW", flag: "🇹🇼",
    currency: "NT$", contract: "Kontrak 3 tahun",
    tagline: "Caregiver di rumah tangga atau panti. Kontrak 3 tahun, lingkungan kerja yang dekat dengan keluarga Taiwan.",
    imageUrl: "/images/countries/taiwan.jpg", imgFilter: "saturate(1.1) brightness(0.97)",
    tintHex: "#3a8567", portalTintHex: "#1e6d4d", portalTintFilter: "saturate(1.1) brightness(0.95)",
    iso: "TW", defaultCity: "Taipei", aliases: ["taiwan"],
    sortOrder: 3, active: true,
  },
  {
    key: "europe", dbValue: "europe", label: "Eropa Timur", initials: "EU", flag: "🇪🇺",
    currency: "Euro (€)", contract: "Kontrak 1 tahun",
    tagline: "Posisi spesialis pengeboran (drilling) di project site Eropa Timur. Untuk tenaga berpengalaman, gaji euro, kontrak resmi lewat jalur yang benar.",
    imageUrl: "/images/countries/europe.jpg", imgFilter: "saturate(0.95) brightness(0.93)",
    tintHex: "#4f6d7a", portalTintHex: "#4f6d7a", portalTintFilter: "saturate(0.95) brightness(0.93)",
    iso: "BG", defaultCity: "Balkan", aliases: ["europe", "eropa", "eropa timur", "ee"],
    sortOrder: 4, active: true,
  },
  {
    key: "mexico", dbValue: "mexico", label: "Meksiko", initials: "MX", flag: "🇲🇽",
    currency: "USD / peso", contract: "Kontrak 1 tahun",
    tagline: "Posisi welder fabrikasi baja berat di Meksiko. Untuk tenaga las berpengalaman & bersertifikat, kontrak resmi lewat jalur yang benar.",
    imageUrl: "/images/countries/mexico.jpg", imgFilter: "saturate(1.08) brightness(0.93) sepia(0.08)",
    tintHex: "#9c5a2a", portalTintHex: "#9c5a2a", portalTintFilter: "saturate(1.08) brightness(0.93) sepia(0.08)",
    iso: "MX", defaultCity: "Monterrey", aliases: ["mexico", "meksiko", "mx"],
    sortOrder: 5, active: true,
  },
  {
    key: "bulgaria", dbValue: "bulgaria", label: "Bulgaria", initials: "BG", flag: "🇧🇬",
    currency: "Euro (€)", contract: "Kontrak 8 bulan",
    tagline: "Posisi teknisi HVAC (AC) di Bulgaria untuk tenaga terampil. Instalasi dan maintenance unit, gaji euro, kontrak resmi lewat jalur yang benar.",
    imageUrl: "/images/countries/bulgaria.jpg", imgFilter: "saturate(0.98) brightness(0.94)",
    tintHex: "#5a6b8c", portalTintHex: "#5a6b8c", portalTintFilter: "saturate(0.98) brightness(0.94)",
    iso: "BG", defaultCity: "Sofia", aliases: ["bulgaria"],
    sortOrder: 6, active: true,
  },
  {
    key: "kuwait", dbValue: "kuwait", label: "Kuwait", initials: "KW", flag: "🇰🇼",
    currency: "KWD dinar", contract: "Kontrak 2 tahun",
    tagline: "Posisi hospitality di Kuwait. Gaji dinar, makan dan akomodasi ditanggung, buat tenaga yang siap kerja di kawasan Teluk.",
    imageUrl: "/images/countries/kuwait.jpg", imgFilter: "saturate(1.05) brightness(0.96) sepia(0.12)",
    tintHex: "#b0843f", portalTintHex: "#b0843f", portalTintFilter: "saturate(1.05) brightness(0.96) sepia(0.12)",
    iso: "KW", defaultCity: "Kuwait City", aliases: ["kuwait"],
    sortOrder: 7, active: true,
  },
  {
    key: "indonesia", dbValue: "indonesia", label: "Indonesia", initials: "ID", flag: "🇮🇩",
    currency: "Rupiah", contract: "Penempatan domestik",
    tagline: "Penempatan SPG & posisi domestik di Indonesia, buat yang belum siap berangkat ke luar negeri, tetap dapat support resmi.",
    imageUrl: "/images/countries/indonesia.jpg", imgFilter: "saturate(1.05) brightness(0.95)",
    tintHex: "#c4452f", portalTintHex: "#b8341c", portalTintFilter: "saturate(1.05) brightness(0.93)",
    iso: "ID", defaultCity: "Jakarta", aliases: ["indonesia"],
    sortOrder: 8, active: true,
  },
  {
    key: "any", dbValue: "any", label: "Global", initials: "GL", flag: "🌐",
    currency: "", contract: "", tagline: "",
    imageUrl: "", imgFilter: "", tintHex: "#4f6d7a", portalTintHex: "#4f6d7a", portalTintFilter: "",
    iso: "", defaultCity: "", aliases: ["any", "global", "semua", "lainnya"],
    sortOrder: 99, active: false,
  },
];

// ─── Sync maps (snapshot-backed; complete 8-country set, no longer drifts) ────

/** Active countries only, in display order — the sync default for the 8 keys. */
const ACTIVE_SNAPSHOT = COUNTRY_SNAPSHOT.filter((c) => c.active) as CountryMeta[];

export const COUNTRY_META: Record<CountryKey, CountryMeta> = Object.fromEntries(
  ACTIVE_SNAPSHOT.map((c) => [c.key, c]),
) as Record<CountryKey, CountryMeta>;

/** Display order for tiles/filters. */
export const COUNTRY_KEYS: CountryKey[] = ACTIVE_SNAPSHOT
  .slice()
  .sort((a, b) => a.sortOrder - b.sortOrder)
  .map((c) => c.key as CountryKey);

/** Every alias → key, lowercased (built from the snapshot's aliases arrays). */
const ALIASES: Record<string, CountryKey> = Object.fromEntries(
  ACTIVE_SNAPSHOT.flatMap((c) =>
    [c.dbValue, c.key, ...c.aliases].map((a) => [a.trim().toLowerCase(), c.key as CountryKey]),
  ),
) as Record<string, CountryKey>;

/** Map any stored/aliased country string to a key. Returns null for "any"/unknown. */
export function normalizeCountryKey(s: string | null | undefined): CountryKey | null {
  if (!s) return null;
  return ALIASES[s.trim().toLowerCase()] ?? null;
}

/** Candidate-facing label from a raw db value. Unknown → fallback (never wrong). */
export function countryLabelFromDb(db: string | null | undefined, fallback = "Global"): string {
  const k = normalizeCountryKey(db);
  return k ? COUNTRY_META[k].label : fallback;
}

/** Admin badge initials from a raw db value. */
export function countryInitialsFromDb(db: string | null | undefined, fallback = "GL"): string {
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

export const COUNTRY_TINT_FILTER: Record<CountryKey, string> = Object.fromEntries(
  COUNTRY_KEYS.map((k) => [k, COUNTRY_META[k].portalTintFilter]),
) as Record<CountryKey, string>;

export const COUNTRY_DB_VALUE: Record<CountryKey, string> = Object.fromEntries(
  COUNTRY_KEYS.map((k) => [k, COUNTRY_META[k].dbValue]),
) as Record<CountryKey, string>;

/**
 * Options for admin position-authoring selects. Built from the snapshot; the DB
 * registry may hold more (see getCountryOptions for the live version). Keeps a
 * trailing "any" (Lainnya / Global) misc bucket.
 */
export const COUNTRY_OPTIONS: { value: string; label: string; initials: string }[] = [
  ...COUNTRY_KEYS.map((k) => ({
    value: COUNTRY_META[k].dbValue,
    label: COUNTRY_META[k].label,
    initials: COUNTRY_META[k].initials,
  })),
  { value: "any", label: "Lainnya / Global", initials: "GL" },
];

// City per position slug (mirrors apps/web) so cards can show a city instead of
// country-only. Slug-scoped (not country metadata) — kept as a constant; city
// authoring per position is a later editor feature.
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
  hvac: "Sofia",
  "hvac-helper": "Sofia",
  "barista-kuwait": "Kuwait City",
};

/** City for a position slug, falling back to the country's primary city. */
export function cityForSlug(slug: string, countryKey: CountryKey | string): string {
  const meta = COUNTRY_SNAPSHOT.find((c) => c.key === countryKey);
  return CITY_BY_SLUG[slug] ?? meta?.defaultCity ?? "";
}

// ─── Async registry (DB-backed; enables adding a country with no deploy) ──────

/** Minimal Supabase client surface this module needs to read countries. */
type CountryQueryClient = {
  from: (table: string) => {
    select: (cols: string) => PromiseLike<{ data: unknown; error: unknown }>;
  };
};

type CountriesRow = {
  key: string; db_value: string; label: string; initials: string; flag: string;
  currency: string; contract: string; tagline: string; image_url: string; img_filter: string;
  tint_hex: string; portal_tint_hex: string; portal_tint_filter: string; iso: string;
  default_city: string; aliases: string[] | null; sort_order: number; active: boolean;
};

function rowToMeta(r: CountriesRow): CountryMeta {
  return {
    key: r.key, dbValue: r.db_value, label: r.label, initials: r.initials, flag: r.flag,
    currency: r.currency, contract: r.contract, tagline: r.tagline, imageUrl: r.image_url,
    imgFilter: r.img_filter, tintHex: r.tint_hex, portalTintHex: r.portal_tint_hex,
    portalTintFilter: r.portal_tint_filter, iso: r.iso, defaultCity: r.default_city,
    aliases: r.aliases ?? [], sortOrder: r.sort_order, active: r.active,
  };
}

/** Lookup helpers over a set of country rows (DB or snapshot). */
export class CountryRegistry {
  private byKeyMap = new Map<string, CountryMeta>();
  private byDbMap = new Map<string, CountryMeta>();
  private aliasMap = new Map<string, CountryMeta>();
  readonly all: CountryMeta[];

  constructor(rows: readonly CountryMeta[]) {
    this.all = rows.slice().sort((a, b) => a.sortOrder - b.sortOrder);
    for (const c of this.all) {
      this.byKeyMap.set(c.key, c);
      this.byDbMap.set(c.dbValue.toLowerCase(), c);
      for (const a of [c.dbValue, c.key, ...c.aliases]) {
        this.aliasMap.set(a.trim().toLowerCase(), c);
      }
    }
  }

  /** Active countries in display order (the chapters/tiles/presets). */
  activeCountries(): CountryMeta[] {
    return this.all.filter((c) => c.active);
  }

  byKey(key: string | null | undefined): CountryMeta | undefined {
    return key ? this.byKeyMap.get(key) : undefined;
  }

  /** Resolve a raw positions.country value (db_value / key / alias) to a row. */
  resolve(raw: string | null | undefined): CountryMeta | undefined {
    if (!raw) return undefined;
    return this.byDbMap.get(raw.trim().toLowerCase()) ?? this.aliasMap.get(raw.trim().toLowerCase());
  }

  /** Row for a raw value, falling back to the "Global" bucket so nothing is ever null. */
  resolveOrGlobal(raw: string | null | undefined): CountryMeta {
    return this.resolve(raw) ?? this.byKeyMap.get("any") ?? this.all[0];
  }

  labelFor(raw: string | null | undefined, fallback = "Global"): string {
    return this.resolve(raw)?.label ?? fallback;
  }

  cityForSlug(slug: string, raw: string | null | undefined): string {
    return CITY_BY_SLUG[slug] ?? this.resolve(raw)?.defaultCity ?? "";
  }
}

/** Registry built from the embedded snapshot (offline / build-time default). */
export const SNAPSHOT_REGISTRY = new CountryRegistry(COUNTRY_SNAPSHOT);

/**
 * Load the live country registry from the DB, falling back to the embedded
 * snapshot on any error/empty result. Pass the app's server Supabase client.
 * Cheap query; wrap the call in the app's cache layer if per-request dedup is
 * wanted. A country added in the admin appears here with no code deploy.
 */
export async function getCountryRegistry(sb: CountryQueryClient): Promise<CountryRegistry> {
  try {
    const { data, error } = await sb.from("countries").select("*");
    if (error || !Array.isArray(data) || data.length === 0) return SNAPSHOT_REGISTRY;
    return new CountryRegistry((data as CountriesRow[]).map(rowToMeta));
  } catch {
    return SNAPSHOT_REGISTRY;
  }
}
