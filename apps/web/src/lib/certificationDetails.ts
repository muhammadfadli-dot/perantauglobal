/**
 * Deep copy per certification — mirrors positionDetails.ts.
 *
 * Copy guardrail (see memory feedback_sertifikasi_narrative):
 * - Enabler tone: a credential you ALREADY NEED to go abroad that Perantau
 *   Global happens to provide. NEVER "wajib lewat kami".
 * - NO fabricated prices/numbers. Pricing display lives in certifications.ts
 *   as honest placeholder until real numbers are confirmed.
 * - Paspor = paid bundle (pelatihan fundamental + psikotes diakui), per-country.
 *   Skill-specific certs are third-party / coming soon — no deep detail here.
 */

export type CertDetailItem = { label: string; desc: string };

export type CertificationDetail = {
  /** Intro paragraphs — what this is, enabler framing */
  intro: string[];
  /** Bundle contents */
  includes: CertDetailItem[];
  /** How it works, step by step */
  howItWorks: string[];
  /** The credential you walk away with */
  credential: { title: string; body: string };
  /** Honest "why this helps" — not a gate */
  why: string[];
  faq?: { q: string; a: string }[];
};

const PASPOR_FAQ = [
  {
    q: "Apakah Paspor Perantau Global wajib untuk berangkat?",
    a: "Tidak wajib dari kami. Tapi untuk berangkat kerja ke luar negeri, kamu memang butuh kredensial seperti hasil psikotes yang diakui. Paspor Perantau Global menyediakannya dalam satu paket — supaya kamu nggak bingung urus sendiri-sendiri.",
  },
  {
    q: "Berapa biayanya?",
    a: "Paspor Perantau Global berbayar (sekali bayar per paket per negara). Rincian biaya kami umumkan di aplikasi Perantau Global. Tidak ada biaya tersembunyi.",
  },
  {
    q: "Psikotesnya diakui di mana?",
    a: "Psikotes dalam Paspor Perantau Global dirancang sesuai standar yang dipakai untuk keberangkatan kerja luar negeri, dan hasilnya bisa kamu pakai sebagai kredensial pada proses lamaran.",
  },
  {
    q: "Apakah ada sertifikasi bahasa atau SIM?",
    a: "Sertifikasi skill-specific seperti bahasa Jepang atau SIM internasional sedang kami siapkan lewat mitra resmi, dan akan diumumkan terpisah. Paspor Perantau Global fokus pada psikotes + pelatihan fundamental per negara.",
  },
];

export const CERTIFICATION_DETAILS: Record<string, CertificationDetail> = {
  "paspor-perantau-global-saudi-arabia": {
    intro: [
      "Paspor Perantau Global — Saudi Arabia adalah paket persiapan resmi dari PT Daya Talenta Global untuk kamu yang mau kerja di Saudi Arabia.",
      "Untuk berangkat, kamu memang butuh beberapa kredensial — salah satunya hasil psikotes yang diakui. Daripada urus sendiri ke sana ke mari, Paspor Perantau Global menyatukannya dalam satu paket: psikotes yang diakui formal + pelatihan fundamental kerja di Saudi Arabia.",
    ],
    includes: [
      {
        label: "Psikotes yang diakui formal",
        desc: "Tes kesiapan & integritas kerja sesuai standar keberangkatan luar negeri. Hasilnya bisa kamu pakai sebagai kredensial pada lamaran.",
      },
      {
        label: "Pelatihan fundamental kerja di Saudi Arabia",
        desc: "Dasar yang wajib kamu tahu: aturan kerja, budaya & adat, hak pekerja, dan cara cari bantuan. Modul fokus, langsung kepakai.",
      },
      {
        label: "Sertifikat Paspor Perantau Global",
        desc: "Bukti kamu sudah siap berangkat — terbit setelah kamu menyelesaikan psikotes & pelatihan.",
      },
    ],
    howItWorks: [
      "Daftar & ambil Paspor Perantau Global — Saudi Arabia di aplikasi.",
      "Ikuti pelatihan fundamental — modul singkat, bisa dari HP.",
      "Kerjakan psikotes.",
      "Sertifikat Paspor Perantau Global terbit di akun kamu.",
    ],
    credential: {
      title: "Hasil psikotes + Sertifikat Paspor Perantau Global",
      body: "Dikeluarkan resmi oleh PT Daya Talenta Global (P3MI Kemnaker). Bisa kamu pakai sebagai bukti kesiapan saat melamar lowongan Saudi Arabia.",
    },
    why: [
      "Kredensial ini memang kamu butuhkan untuk berangkat — bukan syarat tambahan dari kami.",
      "Satu paket, jelas biayanya, dikeluarkan pihak resmi — bukan calo.",
      "Hemat waktu: nggak perlu cari tempat psikotes & pelatihan sendiri.",
    ],
    faq: PASPOR_FAQ,
  },

  "paspor-perantau-global-jepang": {
    intro: [
      "Paspor Perantau Global — Jepang adalah paket persiapan resmi dari PT Daya Talenta Global untuk kamu yang mau kerja di Jepang.",
      "Untuk berangkat, kamu memang butuh beberapa kredensial — salah satunya hasil psikotes yang diakui. Paspor Perantau Global menyatukannya dalam satu paket: psikotes yang diakui formal + pelatihan fundamental kerja di Jepang.",
    ],
    includes: [
      {
        label: "Psikotes yang diakui formal",
        desc: "Tes kesiapan & integritas kerja sesuai standar keberangkatan luar negeri. Hasilnya bisa kamu pakai sebagai kredensial pada lamaran.",
      },
      {
        label: "Pelatihan fundamental kerja di Jepang",
        desc: "Dasar yang wajib kamu tahu: etika & hierarki kerja Jepang, kedisiplinan, hak pekerja, dan adaptasi hidup. Modul fokus, langsung kepakai.",
      },
      {
        label: "Sertifikat Paspor Perantau Global",
        desc: "Bukti kamu sudah siap berangkat — terbit setelah kamu menyelesaikan psikotes & pelatihan.",
      },
    ],
    howItWorks: [
      "Daftar & ambil Paspor Perantau Global — Jepang di aplikasi.",
      "Ikuti pelatihan fundamental — modul singkat, bisa dari HP.",
      "Kerjakan psikotes.",
      "Sertifikat Paspor Perantau Global terbit di akun kamu.",
    ],
    credential: {
      title: "Hasil psikotes + Sertifikat Paspor Perantau Global",
      body: "Dikeluarkan resmi oleh PT Daya Talenta Global (P3MI Kemnaker). Bisa kamu pakai sebagai bukti kesiapan saat melamar lowongan Jepang.",
    },
    why: [
      "Kredensial ini memang kamu butuhkan untuk berangkat — bukan syarat tambahan dari kami.",
      "Satu paket, jelas biayanya, dikeluarkan pihak resmi — bukan calo.",
      "Hemat waktu: nggak perlu cari tempat psikotes & pelatihan sendiri.",
    ],
    faq: PASPOR_FAQ,
  },
};

export function getCertificationDetail(
  slug: string,
): CertificationDetail | undefined {
  return CERTIFICATION_DETAILS[slug];
}
