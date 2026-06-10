// CV grader schemas + prompts + code-side helpers (extraction & fit scoring).
//
// EXTRACTION (Batch 1): read a CV document -> structured JSON + completeness.
// FIT (Batch 2): score a parsed CV against ONE position's requirements, and
// cross-check the candidate's self-reported qualifying answers vs the CV.
//
// Decision (2026-06-10): fit_score reflects CV-vs-position match ONLY. A
// CV/answer contradiction is reported in `verification` (verdict=contradicted)
// and flagged for admin, but NEVER lowers the score (the CV may be outdated).
//
// JSON schemas mirror packages/db/schemas/cv/index.ts. Bump versions on change.

export const CV_SCHEMA_VERSION = 1;
export const PROMPT_VERSION = "extract-v1";
export const EXTRACT_MODEL = "google/gemini-2.5-flash-lite";

export const FIT_PROMPT_VERSION = "fit-v1";
export const FIT_MODEL = "google/gemini-2.5-flash";

const nullableStr = { type: ["string", "null"] };

// ── Extraction schema (Batch 1) ──────────────────────────────────────────

export const EXTRACTION_JSON_SCHEMA = {
  name: "cv_extraction",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    required: [
      "nama", "kontak", "tanggal_lahir", "gender", "status_pernikahan",
      "domisili", "ringkasan", "pengalaman", "pendidikan", "sertifikat",
      "keahlian", "bahasa", "kualitas",
    ],
    properties: {
      nama: nullableStr,
      kontak: { type: "object", additionalProperties: false, required: ["hp", "email"], properties: { hp: nullableStr, email: nullableStr } },
      tanggal_lahir: nullableStr,
      gender: nullableStr,
      status_pernikahan: nullableStr,
      domisili: nullableStr,
      ringkasan: nullableStr,
      pengalaman: { type: "array", items: { type: "object", additionalProperties: false, required: ["posisi", "perusahaan", "lokasi", "mulai", "selesai", "deskripsi"], properties: { posisi: { type: "string" }, perusahaan: nullableStr, lokasi: nullableStr, mulai: nullableStr, selesai: nullableStr, deskripsi: { type: "array", items: { type: "string" } } } } },
      pendidikan: { type: "array", items: { type: "object", additionalProperties: false, required: ["sekolah", "jenjang", "jurusan", "tahun_lulus"], properties: { sekolah: { type: "string" }, jenjang: nullableStr, jurusan: nullableStr, tahun_lulus: nullableStr } } },
      sertifikat: { type: "array", items: { type: "object", additionalProperties: false, required: ["nama", "penerbit", "tahun"], properties: { nama: { type: "string" }, penerbit: nullableStr, tahun: nullableStr } } },
      keahlian: { type: "array", items: { type: "string" } },
      bahasa: { type: "array", items: { type: "object", additionalProperties: false, required: ["bahasa", "level"], properties: { bahasa: { type: "string" }, level: nullableStr } } },
      kualitas: { type: "object", additionalProperties: false, required: ["skor_kelengkapan", "kekurangan"], properties: { skor_kelengkapan: { type: "integer", minimum: 0, maximum: 100 }, kekurangan: { type: "array", items: { type: "string" } } } },
    },
  },
} as const;

export const EXTRACTION_PROMPT =
  `Kamu asisten rekrutmen PMI (pekerja migran Indonesia). Baca dokumen CV pelamar ini ` +
  `(gambar atau PDF) dan ekstrak isinya ke struktur data seakurat mungkin.\n\n` +
  `Aturan:\n` +
  `- Salin apa adanya dari CV. Jangan mengarang data yang tidak ada — pakai null kalau tidak tertera.\n` +
  `- tanggal_lahir, mulai, selesai: tulis PERSIS seperti di CV (mis. "14 Agustus 1996", "Maret 2020", "sekarang"). Jangan hitung umur.\n` +
  `- kualitas.skor_kelengkapan (0-100): seberapa lengkap & jelas CV ini sebagai dokumen lamaran kerja luar negeri.\n` +
  `- kualitas.kekurangan: daftar singkat hal yang kurang/ambigu.\n` +
  `Jawab dalam Bahasa Indonesia.`;

// ── Fit schema (Batch 2) ─────────────────────────────────────────────────

export const FIT_JSON_SCHEMA = {
  name: "cv_position_fit",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    required: ["fit_score", "alasan", "yang_kurang", "verification"],
    properties: {
      fit_score: { type: "integer", minimum: 0, maximum: 100 },
      alasan: { type: "string" },
      yang_kurang: { type: "array", items: { type: "string" } },
      verification: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["field_key", "field_label", "claim", "evidence", "verdict"],
          properties: {
            field_key: { type: "string" },
            field_label: { type: "string" },
            claim: { type: "string" },
            evidence: nullableStr,
            verdict: { type: "string", enum: ["confirmed", "unconfirmed", "contradicted"] },
          },
        },
      },
    },
  },
} as const;

/** Build the fit-scoring prompt. All inputs are pre-rendered strings/JSON. */
export function buildFitPrompt(
  positionName: string,
  fieldsText: string,
  answersText: string,
  cvJson: string,
): string {
  return (
    `Kamu asisten rekrutmen PMI. Nilai SEBERAPA COCOK CV kandidat ini untuk posisi "${positionName}".\n\n` +
    `=== SYARAT & PERTANYAAN POSISI ===\n${fieldsText}\n\n` +
    `=== JAWABAN KANDIDAT (klaim sendiri saat melamar) ===\n${answersText || "(tidak ada jawaban)"}\n\n` +
    `=== CV KANDIDAT (hasil ekstraksi) ===\n${cvJson}\n\n` +
    `Tugas:\n` +
    `1. fit_score (0-100): seberapa cocok CV (pengalaman, keahlian, sertifikat, pendidikan) dengan syarat posisi. Fokus ke BUKTI di CV, bukan ke janji.\n` +
    `2. alasan: 1-2 kalimat kenapa skornya segitu.\n` +
    `3. yang_kurang: daftar singkat syarat penting yang belum terlihat di CV.\n` +
    `4. verification: untuk SETIAP jawaban kandidat yang bisa dicek dari CV, bandingkan klaim vs isi CV:\n` +
    `   - confirmed = CV mendukung klaim\n` +
    `   - unconfirmed = CV tidak menyebut apa pun soal itu (netral)\n` +
    `   - contradicted = CV jelas-jelas bertentangan dengan klaim\n` +
    `   PENTING: verification HANYA untuk pelaporan ke admin. JANGAN turunkan fit_score karena kontradiksi — CV bisa saja versi lama.\n` +
    `Jawab dalam Bahasa Indonesia, ringkas.`
  );
}

// ── Code-side derived facts (extraction; NOT from the model) ──────────────

const ID_MONTHS: Record<string, number> = {
  januari: 1, februari: 2, maret: 3, april: 4, mei: 5, juni: 6, juli: 7,
  agustus: 8, september: 9, oktober: 10, november: 11, desember: 12,
  jan: 1, feb: 2, mar: 3, apr: 4, jun: 6, jul: 7, agu: 8, agt: 8, sep: 9, okt: 10, nov: 11, des: 12,
};

function extractYear(s: string | null): number | null {
  if (!s) return null;
  const m = s.match(/\b(19|20)\d{2}\b/);
  return m ? parseInt(m[0], 10) : null;
}

export function computeUmur(tanggalLahir: string | null, now: Date): number | null {
  if (!tanggalLahir) return null;
  const year = extractYear(tanggalLahir);
  if (!year || year < 1940 || year > now.getFullYear()) return null;
  const lower = tanggalLahir.toLowerCase();
  let month: number | null = null;
  for (const [name, num] of Object.entries(ID_MONTHS)) { if (lower.includes(name)) { month = num; break; } }
  const dayM = tanggalLahir.match(/\b([0-3]?\d)\b/);
  const day = dayM ? parseInt(dayM[1], 10) : null;
  let age = now.getFullYear() - year;
  if (month) { const m = now.getMonth() + 1; if (m < month || (m === month && day && now.getDate() < day)) age -= 1; }
  return age >= 0 && age < 100 ? age : null;
}

export function computeTotalPengalaman(pengalaman: Array<{ mulai: string | null; selesai: string | null }>, now: Date): number | null {
  if (!pengalaman?.length) return null;
  let total = 0, counted = 0;
  for (const p of pengalaman) {
    const start = extractYear(p.mulai);
    if (!start) continue;
    const isOngoing = !p.selesai || /sekarang|now|present|kini/i.test(p.selesai);
    const end = isOngoing ? now.getFullYear() : extractYear(p.selesai);
    if (!end) continue;
    const dur = end - start;
    if (dur >= 0 && dur < 60) { total += dur; counted++; }
  }
  return counted ? Math.round(total * 10) / 10 : null;
}
