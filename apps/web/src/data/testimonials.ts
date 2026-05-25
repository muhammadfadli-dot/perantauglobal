/**
 * Hardcoded PMI testimonials for marketing pages. Per session decision
 * (2026-05-12), keep as data file until volume >10 — only then migrate
 * to a `testimonials` table with admin CRUD + image storage.
 *
 * Real names/photos require PMI's written consent. Until cleared real
 * cases land, photoPath stays empty and the UI renders a gradient
 * placeholder keyed by the `accent` color.
 */

export type Testimonial = {
  slug: string;
  name: string;
  age: number;
  role: string;
  country: "Saudi Arabia" | "Jepang" | "Taiwan" | "Indonesia";
  city: string;
  workplace: string;
  origin: string; // home town
  quote: string;
  sinceYear: number;
  contractYears: number;
  /** Used by placeholder photo + avatar gradient. */
  accent: "amber" | "blue" | "rose";
  /** Optional path under /public/images/testimonials/ */
  photoPath?: string;
};

export const TESTIMONIALS: Testimonial[] = [
  {
    slug: "sari-perawat-saudi",
    name: "Sari Wahyuni",
    age: 32,
    role: "Perawat",
    country: "Saudi Arabia",
    city: "Riyadh",
    workplace: "King Faisal Specialist Hospital",
    origin: "Bandung",
    quote:
      "Saya kira proses ke Saudi rumit dan mahal. Ternyata transparan — tiap rupiah dijelasin di depan, semua dokumen diurus. 4 bulan dari daftar, saya udah di Riyadh.",
    sinceYear: 2024,
    contractYears: 2,
    accent: "amber",
  },
  {
    slug: "budi-driver-jepang",
    name: "Budi Santoso",
    age: 28,
    role: "Truck Driver SSW",
    country: "Jepang",
    city: "Osaka",
    workplace: "Cargo Osaka Distribution",
    origin: "Surabaya",
    quote:
      "3 bulan dari daftar sampai terbang. Visa, MCU, semua diurus DTG. Saya cuma datang, tanda tangan kontrak, jalan. PIC selalu balas WhatsApp dalam jam kerja.",
    sinceYear: 2025,
    contractYears: 3,
    accent: "blue",
  },
  {
    slug: "rini-caregiver-taiwan",
    name: "Rini Anggraini",
    age: 26,
    role: "Caregiver",
    country: "Taiwan",
    city: "Taipei",
    workplace: "Panti Wisma Taipei",
    origin: "Malang",
    quote:
      "Yang bikin saya tenang: kontrak resmi, gaji jelas masuk rekening tiap bulan. Kalau ada apa-apa, PIC DTG di Jakarta langsung. Bukan calo.",
    sinceYear: 2024,
    contractYears: 3,
    accent: "rose",
  },
];
