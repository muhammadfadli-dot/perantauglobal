import type { PositionCountry } from "./positions";

export type CountryMeta = {
  key: "saudi" | "jepang" | "taiwan" | "indonesia" | "europe" | "mexico";
  name: PositionCountry;
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

export const COUNTRY_META: Record<CountryMeta["key"], CountryMeta> = {
  saudi: {
    key: "saudi",
    name: "Saudi Arabia",
    short: "Saudi",
    flag: "🇸🇦",
    currency: "SAR riyal",
    contract: "Kontrak 2 tahun",
    img: "/images/countries/saudi.jpg",
    tagline:
      "Hospitality, perawat, mekanik berat — gaji riyal, makan ditanggung. Banyak posisi terbuka di Riyadh & Jeddah.",
    imgFilter: "saturate(1.05) brightness(0.96) sepia(0.18)",
    tint: "#b89358",
  },
  jepang: {
    key: "jepang",
    name: "Jepang",
    short: "Jepang",
    flag: "🇯🇵",
    currency: "¥ yen",
    contract: "Sistem SSW · 5 tahun",
    img: "/images/countries/jepang.jpg",
    tagline:
      "Sistem SSW resmi pemerintah Jepang. Caregiver (Kaigo), food service, dan pengolahan makanan — kerja terstruktur, hak penuh.",
    imgFilter: "saturate(0.85) brightness(0.92) hue-rotate(-8deg)",
    tint: "#36598c",
  },
  taiwan: {
    key: "taiwan",
    name: "Taiwan",
    short: "Taiwan",
    flag: "🇹🇼",
    currency: "NT$",
    contract: "Kontrak 3 tahun",
    img: "/images/countries/taiwan.jpg",
    tagline:
      "Caregiver di rumah tangga atau panti. Kontrak 3 tahun, lingkungan kerja yang dekat dengan keluarga Taiwan.",
    imgFilter: "saturate(1.1) brightness(0.97)",
    tint: "#3a8567",
  },
  indonesia: {
    key: "indonesia",
    name: "Indonesia",
    short: "Indonesia",
    flag: "🇮🇩",
    currency: "Rupiah",
    contract: "Penempatan domestik",
    img: "/images/countries/indonesia.jpg",
    tagline:
      "Penempatan SPG & posisi domestik di Indonesia — buat yang belum siap berangkat ke luar negeri, tetap dapat support resmi.",
    imgFilter: "saturate(1.05) brightness(0.95)",
    tint: "#c4452f",
  },
  europe: {
    key: "europe",
    name: "Eropa Timur",
    short: "Eropa Timur",
    flag: "🇪🇺",
    currency: "Euro (€)",
    contract: "Kontrak 1 tahun",
    img: "/images/countries/europe.jpg",
    tagline:
      "Posisi spesialis pengeboran (drilling) di project site Eropa Timur. Untuk tenaga berpengalaman — gaji euro, kontrak resmi lewat jalur yang benar.",
    imgFilter: "saturate(0.95) brightness(0.93)",
    tint: "#4f6d7a",
  },
  mexico: {
    key: "mexico",
    name: "Meksiko",
    short: "Meksiko",
    flag: "🇲🇽",
    currency: "USD / peso",
    contract: "Kontrak 1 tahun",
    img: "/images/countries/mexico.jpg",
    tagline:
      "Posisi welder fabrikasi baja berat di Meksiko. Untuk tenaga las berpengalaman & bersertifikat — kontrak resmi lewat jalur yang benar.",
    imgFilter: "saturate(1.08) brightness(0.93) sepia(0.08)",
    tint: "#9c5a2a",
  },
};

export const COUNTRY_KEYS: CountryMeta["key"][] = ["saudi", "jepang", "taiwan", "europe", "mexico", "indonesia"];

export function countryKeyFromName(name: PositionCountry): CountryMeta["key"] {
  switch (name) {
    case "Saudi Arabia": return "saudi";
    case "Jepang": return "jepang";
    case "Taiwan": return "taiwan";
    case "Indonesia": return "indonesia";
    case "Eropa Timur": return "europe";
    case "Meksiko": return "mexico";
  }
}

/** Heuristic city lookup per position slug — extracted from old static catalog notes.
 *  Falls back to the country's primary city when slug is unknown. */
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

const FALLBACK_CITY: Record<CountryMeta["key"], string> = {
  saudi: "Riyadh",
  jepang: "Tokyo",
  taiwan: "Taipei",
  indonesia: "Jakarta",
  europe: "Balkan",
  mexico: "Monterrey",
};

export function cityForSlug(slug: string, countryKey: CountryMeta["key"]): string {
  return CITY_BY_SLUG[slug] ?? FALLBACK_CITY[countryKey];
}
