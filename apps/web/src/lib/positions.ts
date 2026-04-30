/**
 * Catalog of position templates — sourced from FEEDBACK LANDING PAGE PDF (2026-04-23).
 * Job orders (instances with employer + slots + batch) layered on top via DB later.
 *
 * Status semantic:
 *   - "open"  → there's an active job_order with open slots; show "Lagi buka" badge
 *   - "queue" → catalog only; user can register interest, hubungi via email saat batch dibuka
 */

import type { IconName } from "@/components/pg/Icon";

export type PositionCountry = "Saudi Arabia" | "Jepang" | "Taiwan" | "Indonesia";

export type PositionStatus = "open" | "queue";

export type Position = {
  slug: string;
  role: string;
  country: PositionCountry;
  icon: IconName;
  status: PositionStatus;
  /** Salary line — primary, e.g. "SAR 3.200" */
  salary: string;
  /** Salary suffix, e.g. "+ makan SAR 200" or "/bulan" */
  salaryNote: string;
  /** Gender requirement display label */
  gender: string;
  /** Age range display, e.g. "21-38" */
  age: string;
  /** Short summary, used on detail hero meta */
  contractLabel?: string;
  /** Active job order info (when status === "open") */
  batch?: {
    label: string;
    slotsFilled: number;
    slotsTotal: number;
    deadline: string;
  };
};

export const POSITIONS: Position[] = [
  // === Saudi Arabia ===
  {
    slug: "perawat-saudi-arabia",
    role: "Perawat",
    country: "Saudi Arabia",
    icon: "stethoscope",
    status: "open",
    salary: "SAR 3.200",
    salaryNote: "+ makan SAR 200",
    gender: "Wanita",
    age: "21–38",
    contractLabel: "Kontrak 2 tahun",
    batch: {
      label: "Batch Juni 2026",
      slotsFilled: 0,
      slotsTotal: 12,
      deadline: "30 Juni 2026",
    },
  },
  {
    slug: "barista-saudi-arabia",
    role: "Barista",
    country: "Saudi Arabia",
    icon: "coffee",
    status: "queue",
    salary: "SAR 1.500",
    salaryNote: "+ makan SAR 300",
    gender: "L/P",
    age: "21–30",
    contractLabel: "Kontrak 2 tahun",
  },
  {
    slug: "waiter-saudi-arabia",
    role: "Waiter",
    country: "Saudi Arabia",
    icon: "bowl",
    status: "queue",
    salary: "SAR 1.500",
    salaryNote: "+ makan SAR 300",
    gender: "Laki-laki",
    age: "21–30",
    contractLabel: "Kontrak 2 tahun",
  },
  {
    slug: "waitress-saudi-arabia",
    role: "Waitress",
    country: "Saudi Arabia",
    icon: "bowl",
    status: "queue",
    salary: "SAR 1.600",
    salaryNote: "+ makan",
    gender: "Wanita",
    age: "21–35",
    contractLabel: "Kontrak 2 tahun",
  },
  {
    slug: "chef-bakery-saudi-arabia",
    role: "Chef Bakery",
    country: "Saudi Arabia",
    icon: "bowl",
    status: "queue",
    salary: "SAR 2.000",
    salaryNote: "+ makan",
    gender: "Laki-laki",
    age: "21–35",
    contractLabel: "Kontrak 2 tahun",
  },
  {
    slug: "head-barista-saudi-arabia",
    role: "Head Barista",
    country: "Saudi Arabia",
    icon: "coffee",
    status: "queue",
    salary: "SAR 2.200",
    salaryNote: "/bulan",
    gender: "Laki-laki",
    age: "21–30",
    contractLabel: "Kontrak 2 tahun",
  },
  {
    slug: "roaster-saudi-arabia",
    role: "Roaster",
    country: "Saudi Arabia",
    icon: "coffee",
    status: "queue",
    salary: "SAR 2.800",
    salaryNote: "/bulan (mulai)",
    gender: "Laki-laki",
    age: "21–30",
    contractLabel: "Kontrak 2 tahun",
  },
  {
    slug: "chef-pastry-saudi-arabia",
    role: "Chef Pastry",
    country: "Saudi Arabia",
    icon: "bowl",
    status: "queue",
    salary: "SAR 2.500",
    salaryNote: "/bulan (mulai)",
    gender: "Laki-laki",
    age: "21–30",
    contractLabel: "Kontrak 2 tahun",
  },
  {
    slug: "spa-therapist-saudi-arabia",
    role: "Spa Therapist",
    country: "Saudi Arabia",
    icon: "sparkle",
    status: "queue",
    salary: "SAR 1.500",
    salaryNote: "+ makan SAR 300",
    gender: "Wanita",
    age: "28–40",
    contractLabel: "Kontrak 2 tahun",
  },
  {
    slug: "laundry-worker-saudi-arabia",
    role: "Laundry Worker",
    country: "Saudi Arabia",
    icon: "shield",
    status: "queue",
    salary: "SAR 1.500",
    salaryNote: "+ makan SAR 300",
    gender: "Wanita",
    age: "23–33",
    contractLabel: "Kontrak 2 tahun",
  },
  // === Jepang ===
  {
    slug: "truck-driver-jepang",
    role: "Truck Driver",
    country: "Jepang",
    icon: "truck",
    status: "queue",
    salary: "¥250.000",
    salaryNote: "/bulan",
    gender: "Laki-laki",
    age: "max 44",
    contractLabel: "Komitmen 5 tahun",
  },
  {
    slug: "food-service-jepang",
    role: "Food Service",
    country: "Jepang",
    icon: "bowl",
    status: "queue",
    salary: "¥1.226",
    salaryNote: "/jam",
    gender: "L/P",
    age: "max 35",
    contractLabel: "Sistem SSW",
  },
  {
    slug: "kaigo-jepang",
    role: "Caregiver Panti",
    country: "Jepang",
    icon: "heart",
    status: "queue",
    salary: "¥190.000",
    salaryNote: "/bulan THP",
    gender: "Wanita",
    age: "18–35",
    contractLabel: "Sistem SSW Kaigo",
  },
  {
    slug: "pengolahan-makanan-jepang",
    role: "Pengolahan Makanan",
    country: "Jepang",
    icon: "bowl",
    status: "queue",
    salary: "¥210.000",
    salaryNote: "/bulan",
    gender: "Wanita",
    age: "20–35",
    contractLabel: "Sistem SSW",
  },
  // === Taiwan ===
  {
    slug: "caregiver-taiwan",
    role: "Caregiver",
    country: "Taiwan",
    icon: "heart",
    status: "queue",
    salary: "NT$ 29.500",
    salaryNote: "/bulan",
    gender: "Wanita",
    age: "20–40",
    contractLabel: "Kontrak 3 tahun",
  },
  // === Indonesia ===
  {
    slug: "spg-indonesia",
    role: "SPG",
    country: "Indonesia",
    icon: "sparkle",
    status: "queue",
    salary: "Penempatan",
    salaryNote: "domestic",
    gender: "Wanita",
    age: "fleksibel",
    contractLabel: "Lokasi Indonesia",
  },
];

export function getPosition(slug: string): Position | undefined {
  return POSITIONS.find((p) => p.slug === slug);
}

export function listPositions(filter?: { country?: PositionCountry; status?: PositionStatus }) {
  return POSITIONS.filter((p) => {
    if (filter?.country && p.country !== filter.country) return false;
    if (filter?.status && p.status !== filter.status) return false;
    return true;
  });
}
