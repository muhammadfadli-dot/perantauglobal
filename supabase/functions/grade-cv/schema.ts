// CV grader schemas + prompts + code-side helpers (extraction & fit scoring).
//
// EXTRACTION (Batch 1): read a candidate's CV **plus any uploaded credential
// documents** (sertifikat, ijazah, surat pengalaman, SIM, sertifikat bahasa)
// -> one merged structured JSON + completeness. Feeding the certificates in
// alongside the CV means the parsed `sertifikat`/`bahasa`/`pendidikan` reflect
// real uploaded evidence, not just what the CV text happened to mention.
//
// FIT (Batch 2): score the parsed CV against ONE position's REAL requirements.
// Grounding = positions.content (jobDescription + qualifications + details +
// benefits), NOT just the application form screeners. Produces a per-requirement
// checklist (`requirement_checks`) so admins see exactly which qualifications
// are met, partial, or missing — and on what evidence.
//
// Decision (2026-06-10, kept): fit_score reflects CV-vs-position match ONLY. A
// CV/answer contradiction is reported in `verification` (verdict=contradicted)
// and flagged for admin, but NEVER lowers the score (the CV may be outdated).
//
// JSON schemas mirror packages/db/schemas/cv/index.ts. Bump versions on change.

export const CV_SCHEMA_VERSION = 2;
export const PROMPT_VERSION = "extract-v2";
export const EXTRACT_MODEL = "google/gemini-2.5-flash-lite";

export const FIT_PROMPT_VERSION = "fit-v2";
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
      // `sumber`: "cv" when only seen in the CV text, "dokumen" when backed by a
      // separately uploaded certificate file. Lets admins trust verified certs.
      sertifikat: { type: "array", items: { type: "object", additionalProperties: false, required: ["nama", "penerbit", "tahun", "sumber"], properties: { nama: { type: "string" }, penerbit: nullableStr, tahun: nullableStr, sumber: { type: "string", enum: ["cv", "dokumen"] } } } },
      keahlian: { type: "array", items: { type: "string" } },
      bahasa: { type: "array", items: { type: "object", additionalProperties: false, required: ["bahasa", "level"], properties: { bahasa: { type: "string" }, level: nullableStr } } },
      kualitas: { type: "object", additionalProperties: false, required: ["skor_kelengkapan", "kekurangan"], properties: { skor_kelengkapan: { type: "integer", minimum: 0, maximum: 100 }, kekurangan: { type: "array", items: { type: "string" } } } },
    },
  },
} as const;

export const EXTRACTION_PROMPT =
  `Kamu asisten rekrutmen PMI (pekerja migran Indonesia). Kamu diberi SATU ATAU BEBERAPA ` +
  `dokumen milik SATU pelamar: dokumen pertama adalah CV utama, dokumen berikutnya (kalau ada) ` +
  `adalah sertifikat/ijazah/surat pengalaman/SIM/sertifikat bahasa pendukung. Setiap dokumen ` +
  `diberi label "=== DOKUMEN n: <jenis> ===". Ekstrak dan GABUNGKAN semuanya ke satu struktur data.\n\n` +
  `Aturan:\n` +
  `- Salin apa adanya dari dokumen. Jangan mengarang data yang tidak ada — pakai null kalau tidak tertera.\n` +
  `- Gabungkan info dari semua dokumen. Sertifikat/ijazah/SIM dari dokumen pendukung WAJIB masuk ke "sertifikat" (atau "pendidikan"/"bahasa" kalau lebih sesuai), jangan dilewat.\n` +
  `- sertifikat.sumber: isi "dokumen" kalau sertifikat itu berasal dari file dokumen terpisah yang diupload (bukan cuma disebut di teks CV); isi "cv" kalau cuma tertulis di CV.\n` +
  `- tanggal_lahir, mulai, selesai: tulis PERSIS seperti di dokumen (mis. "14 Agustus 1996", "Maret 2020", "sekarang"). Jangan hitung umur.\n` +
  `- kualitas.skor_kelengkapan (0-100): seberapa lengkap & jelas berkas pelamar ini (CV + dokumen) sebagai lamaran kerja luar negeri.\n` +
  `- kualitas.kekurangan: daftar singkat hal yang kurang/ambigu.\n` +
  `Jawab dalam Bahasa Indonesia.`;

// ── Fit schema (Batch 2) ─────────────────────────────────────────────────

export const FIT_JSON_SCHEMA = {
  name: "cv_position_fit",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    required: ["fit_score", "alasan", "yang_kurang", "requirement_checks", "verification"],
    properties: {
      fit_score: { type: "integer", minimum: 0, maximum: 100 },
      alasan: { type: "string" },
      yang_kurang: { type: "array", items: { type: "string" } },
      // Per-requirement coverage — one entry per qualification of the position.
      // This is the transparent "variabel yang sudah cocok" breakdown.
      requirement_checks: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["syarat", "status", "bukti"],
          properties: {
            syarat: { type: "string" },
            status: { type: "string", enum: ["terpenuhi", "sebagian", "belum", "tidak_diketahui"] },
            bukti: nullableStr,
          },
        },
      },
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
  positionContext: string,
  fieldsText: string,
  answersText: string,
  docsText: string,
  cvJson: string,
): string {
  return (
    `Kamu asisten rekrutmen PMI. Nilai SEBERAPA COCOK berkas kandidat ini untuk posisi "${positionName}", ` +
    `berdasarkan REQUIREMENT ASLI posisi di bawah.\n\n` +
    `=== DESKRIPSI & KUALIFIKASI POSISI (acuan utama penilaian) ===\n${positionContext || "(deskripsi posisi belum diisi)"}\n\n` +
    `=== PERTANYAAN FORM SAAT MELAMAR ===\n${fieldsText}\n\n` +
    `=== JAWABAN KANDIDAT (klaim sendiri saat melamar) ===\n${answersText || "(tidak ada jawaban)"}\n\n` +
    `=== DOKUMEN PENDUKUNG YANG DIUPLOAD KANDIDAT ===\n${docsText || "(tidak ada dokumen pendukung selain CV)"}\n\n` +
    `=== CV KANDIDAT (hasil ekstraksi, sudah termasuk isi dokumen pendukung) ===\n${cvJson}\n\n` +
    `Tugas:\n` +
    `1. fit_score (0-100): seberapa cocok bukti kandidat (pengalaman, keahlian, sertifikat, pendidikan, dokumen) dengan KUALIFIKASI posisi di atas. Fokus ke BUKTI, bukan janji. Posisi yang minim deskripsi: nilai dari relevansi peran & pengalaman.\n` +
    `2. alasan: 1-2 kalimat kenapa skornya segitu.\n` +
    `3. yang_kurang: daftar singkat kualifikasi penting yang belum terlihat dari bukti.\n` +
    `4. requirement_checks: untuk SETIAP butir kualifikasi posisi (dan syarat penting di deskripsi), tentukan:\n` +
    `   - syarat: tulis ulang singkat butir kualifikasinya.\n` +
    `   - status: "terpenuhi" (bukti jelas), "sebagian" (mendekati/kurang kuat), "belum" (jelas tidak ada/tidak memenuhi), "tidak_diketahui" (tidak bisa dinilai dari berkas).\n` +
    `   - bukti: kutipan/ringkasan bukti dari CV/dokumen (atau null kalau tidak ada).\n` +
    `5. verification: untuk SETIAP jawaban kandidat yang bisa dicek dari CV/dokumen, bandingkan klaim vs bukti:\n` +
    `   - confirmed = bukti mendukung klaim; unconfirmed = bukti diam soal itu; contradicted = bukti jelas bertentangan.\n` +
    `   PENTING: verification & requirement_checks HANYA untuk laporan ke admin. JANGAN turunkan fit_score gara-gara kontradiksi — CV bisa versi lama.\n` +
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
