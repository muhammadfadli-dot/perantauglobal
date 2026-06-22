/**
 * "Analisa Kesiapan Merantau" — shared content + scoring for the live webinar
 * engagement tool and its realtime dashboard.
 *
 * 6 readiness questions (a/b/c) score a persona; 1 sector-interest question
 * personalises the result with a salary teaser. Kept framework-free so the
 * participant page, the API route, and the dashboard all share one source.
 */

export const SESSION_KEY = "wtr-2026-06-23";

export type AnswerKey = "a" | "b" | "c";
export type Persona = "pemimpi" | "penjajak" | "siap";
export type Sector = "hospitality" | "healthcare" | "unsure";

export const QUESTION_IDS = ["q1", "q2", "q3", "q4", "q5", "q6"] as const;
export type QuestionId = (typeof QUESTION_IDS)[number];

export interface Question {
  id: QuestionId;
  q: string;
  hint?: string;
  options: { key: AnswerKey; label: string }[];
}

export const QUESTIONS: Question[] = [
  {
    id: "q1",
    q: "Gimana status paspor kamu?",
    options: [
      { key: "a", label: "Aktif dan masih berlaku" },
      { key: "b", label: "Pernah punya, tapi habis" },
      { key: "c", label: "Belum pernah bikin" },
    ],
  },
  {
    id: "q2",
    q: "Kemampuan bahasa asing kamu?",
    hint: "Inggris, Jepang, Arab, atau bahasa negara tujuan",
    options: [
      { key: "a", label: "Bisa ngobrol lumayan lancar" },
      { key: "b", label: "Bisa sedikit-sedikit" },
      { key: "c", label: "Belum bisa" },
    ],
  },
  {
    id: "q3",
    q: "Punya sertifikat kompetensi kerja?",
    hint: "BNSP atau sertifikat keahlian lain",
    options: [
      { key: "a", label: "Punya" },
      { key: "b", label: "Pernah denger" },
      { key: "c", label: "Apa itu?" },
    ],
  },
  {
    id: "q4",
    q: "Kalau ada tawaran berangkat 6 bulan lagi?",
    options: [
      { key: "a", label: "Gas, siap berangkat" },
      { key: "b", label: "Mikir-mikir dulu" },
      { key: "c", label: "Masih takut" },
    ],
  },
  {
    id: "q5",
    q: "Keluarga tahu dan dukung rencana ini?",
    options: [
      { key: "a", label: "Dukung penuh" },
      { key: "b", label: "Belum ngomong" },
      { key: "c", label: "Belum, atau menolak" },
    ],
  },
  {
    id: "q6",
    q: "Tabungan buat modal awal berangkat?",
    options: [
      { key: "a", label: "Sudah ada" },
      { key: "b", label: "Lagi nabung" },
      { key: "c", label: "Belum ada" },
    ],
  },
];

export const SECTOR_QUESTION = {
  id: "sector" as const,
  q: "Sektor mana yang paling kamu minati?",
  options: [
    { key: "hospitality" as Sector, label: "Hospitality (barista / waiter)" },
    { key: "healthcare" as Sector, label: "Healthcare (caregiver)" },
    { key: "unsure" as Sector, label: "Belum tahu, mau lihat dulu" },
  ],
};

const POINTS: Record<AnswerKey, number> = { a: 2, b: 1, c: 0 };

/** Score 0..12 across the 6 readiness questions, mapped to a persona. */
export function scorePersona(answers: Partial<Record<QuestionId, AnswerKey>>): {
  score: number;
  persona: Persona;
} {
  let score = 0;
  for (const id of QUESTION_IDS) {
    const a = answers[id];
    if (a) score += POINTS[a];
  }
  const persona: Persona = score >= 9 ? "siap" : score >= 5 ? "penjajak" : "pemimpi";
  return { score, persona };
}

export interface PersonaMeta {
  label: string;
  tagline: string;
  desc: string;
  /** Tailwind accent classes (text / bg / soft bg) for cards + dashboard. */
  text: string;
  bg: string;
  soft: string;
}

export const PERSONA_META: Record<Persona, PersonaMeta> = {
  siap: {
    label: "Siap Berangkat",
    tagline: "Kamu paling siap di antara peserta.",
    desc: "Kesiapanmu udah matang. Tinggal lengkapi sertifikasi dan dokumen, lalu masuk radar penyalur resmi. Langkah berikutnya: ambil Analisa lengkap dan sertifikat di app.",
    text: "text-emerald-700",
    bg: "bg-emerald-600",
    soft: "bg-emerald-50",
  },
  penjajak: {
    label: "Penjajak",
    tagline: "Kamu udah di jalur yang benar.",
    desc: "Beberapa hal tinggal disiapin: bahasa, sertifikat, atau dokumen. Konsisten dikit lagi dan kamu siap berangkat. Mulai dari langkah kecil hari ini.",
    text: "text-amber-700",
    bg: "bg-amber-500",
    soft: "bg-amber-50",
  },
  pemimpi: {
    label: "Pemimpi",
    tagline: "Mimpinya udah ada, itu modal utama.",
    desc: "Sekarang waktunya nyiapin langkah konkret pertama: paspor, bahasa, dan cari tahu jalur resmi yang aman. Semua orang mulai dari sini.",
    text: "text-sky-700",
    bg: "bg-sky-600",
    soft: "bg-sky-50",
  },
};

export interface SectorMeta {
  label: string;
  teaser: string;
}

/**
 * Salary teasers respect the two hard guardrails from the data pack:
 * hospitality points to Saudi/Australia (NOT Japan); caregiver to Japan/Australia.
 * All framed as gross potential, never a promise.
 */
export const SECTOR_META: Record<Sector, SectorMeta> = {
  hospitality: {
    label: "Hospitality",
    teaser:
      "Barista dan waiter: dari sekitar Rp3 juta di Indonesia bisa ke Rp22 juta (Arab Saudi) sampai Rp46 juta lebih (Australia). Gambaran potensi gaji kotor, bukan janji.",
  },
  healthcare: {
    label: "Healthcare",
    teaser:
      "Caregiver: dari sekitar Rp3 sampai 4 juta di Indonesia bisa ke Rp20 sampai 28 juta (Jepang) atau Rp52 juta (Australia). Gambaran potensi gaji kotor, bukan janji.",
  },
  unsure: {
    label: "Belum tahu",
    teaser:
      "Banyak sektor lagi kebuka. Di app Perantau Global kamu bisa lihat rekomendasi sektor yang paling cocok sama profilmu.",
  },
};

export const PERSONAS: Persona[] = ["pemimpi", "penjajak", "siap"];
export const SECTORS: Sector[] = ["hospitality", "healthcare", "unsure"];
