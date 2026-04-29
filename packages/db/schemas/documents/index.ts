/**
 * DOC_TYPE_METADATA_SCHEMAS — Per-doc_type form field configurations
 * for the Upload Modal in candidate Profile and Lengkapi Lamaran flows.
 *
 * Migration 0021 extends candidate_documents.doc_type enum with reusable
 * cert categories (str_certificate, language_certificate, etc.) and adds
 * `metadata` JSONB + `expires_at` columns. This module declares what
 * metadata fields should appear in the Upload Modal per doc_type.
 *
 * Used by:
 *   - apps/platform/(candidate)/profile/_components/DocumentUploadModal.tsx
 *   - apps/platform/(candidate)/applications/[id]/lengkapi/RequirementInlineForm.tsx
 *
 * The UI consumes this to dynamically render the right form fields.
 * The DB stores the resulting values in candidate_documents.metadata (JSONB).
 *
 * For evidence-mode = 'document' or 'either' requirements, the position's
 * `document_filter` JSONB matches against these metadata values via
 * compute_readiness_v3() (migration 0021).
 */

export type MetadataFieldType = "text" | "select" | "date" | "number";

export type MetadataField = {
  /** JSONB key in candidate_documents.metadata */
  key: string;
  /** Label shown in upload modal */
  label: string;
  /** Helper text below input */
  description?: string;
  /** Form input type */
  type: MetadataFieldType;
  /** Required to upload (cannot save without) */
  required: boolean;
  /** For type=select: enum options */
  options?: string[];
  /** For type=select: human label per option */
  option_labels?: Record<string, string>;
  /** For type=date: maps to candidate_documents.expires_at column */
  is_expires_at?: boolean;
  /** Auto-derived from doc_type, shown as read-only context */
  auto_derived?: boolean;
};

export type DocTypeSchema = {
  /** Display label for the doc type */
  label: string;
  /** Short description of what this document is */
  description: string;
  /** Whether this doc type is universal (every candidate uploads) or position-specific */
  universal: boolean;
  /** Metadata fields rendered in upload modal */
  fields: MetadataField[];
};

export const DOC_TYPE_METADATA_SCHEMAS: Record<string, DocTypeSchema> = {
  // ─── UNIVERSAL IDENTITY DOCS ───────────────────────────────────────
  ktp: {
    label: "KTP",
    description: "Kartu Tanda Penduduk (e-KTP).",
    universal: true,
    fields: [],
  },
  passport: {
    label: "Paspor",
    description: "Paspor Indonesia (RI) yang masih berlaku.",
    universal: true,
    fields: [
      {
        key: "passport_number",
        label: "Nomor paspor",
        type: "text",
        required: false,
      },
      {
        key: "expires_at",
        label: "Berlaku sampai",
        type: "date",
        required: true,
        is_expires_at: true,
      },
    ],
  },
  formal_photo: {
    label: "Foto formal",
    description: "Foto pas ukuran 4×6, latar polos, pakaian formal.",
    universal: true,
    fields: [],
  },
  cv: {
    label: "CV / Daftar Riwayat Hidup",
    description: "CV dalam Bahasa Indonesia atau Inggris.",
    universal: true,
    fields: [],
  },
  medical_check: {
    label: "Hasil Medical Check-Up",
    description: "Surat keterangan sehat dari klinik/RS.",
    universal: false,
    fields: [
      {
        key: "issued_at",
        label: "Tanggal pemeriksaan",
        type: "date",
        required: true,
      },
      {
        key: "issuer",
        label: "Nama klinik/RS",
        type: "text",
        required: false,
      },
    ],
  },

  // ─── PROFESSIONAL CERTIFICATIONS ───────────────────────────────────
  str_certificate: {
    label: "Sertifikat STR",
    description: "Surat Tanda Registrasi keperawatan dari MTKI/KKI.",
    universal: false,
    fields: [
      {
        key: "status",
        label: "Status",
        type: "select",
        required: true,
        options: ["active", "in_progress"],
        option_labels: {
          active: "Aktif",
          in_progress: "Sedang proses",
        },
      },
      {
        key: "expires_at",
        label: "Berlaku sampai",
        type: "date",
        required: false,
        is_expires_at: true,
      },
    ],
  },
  driving_license: {
    label: "SIM Kendaraan",
    description: "Surat Izin Mengemudi (SIM) Indonesia.",
    universal: false,
    fields: [
      {
        key: "class",
        label: "Jenis SIM",
        type: "select",
        required: true,
        options: ["a", "b1", "b2", "internasional"],
        option_labels: {
          a: "SIM A (mobil pribadi)",
          b1: "SIM B1 (truk ringan)",
          b2: "SIM B2 (truk besar)",
          internasional: "SIM Internasional",
        },
      },
      {
        key: "issuing_country",
        label: "Negara penerbit",
        type: "select",
        required: false,
        options: ["ID"],
        option_labels: { ID: "Indonesia" },
      },
      {
        key: "expires_at",
        label: "Berlaku sampai",
        type: "date",
        required: true,
        is_expires_at: true,
      },
    ],
  },
  language_certificate: {
    label: "Sertifikat Bahasa",
    description: "Sertifikat kemampuan bahasa (JLPT, IELTS, EPS-TOPIK, dll).",
    universal: false,
    fields: [
      {
        key: "language",
        label: "Bahasa",
        type: "select",
        required: true,
        options: ["japanese", "english", "korean", "arabic", "mandarin"],
        option_labels: {
          japanese: "Jepang",
          english: "Inggris",
          korean: "Korea",
          arabic: "Arab",
          mandarin: "Mandarin",
        },
      },
      {
        key: "system",
        label: "Sistem ujian",
        type: "select",
        required: false,
        options: ["jlpt", "ielts", "toefl", "eps_topik", "hsk"],
        option_labels: {
          jlpt: "JLPT (Japanese Language Proficiency Test)",
          ielts: "IELTS",
          toefl: "TOEFL",
          eps_topik: "EPS-TOPIK",
          hsk: "HSK (Hanyu Shuiping Kaoshi)",
        },
      },
      {
        key: "level",
        label: "Level / Skor",
        description:
          "JLPT: N5/N4/N3/N2/N1 · IELTS: band 1–9 · EPS-TOPIK: 1 atau 2.",
        type: "text",
        required: true,
      },
      {
        key: "issued_at",
        label: "Tanggal terbit",
        type: "date",
        required: false,
      },
      {
        key: "expires_at",
        label: "Berlaku sampai",
        description: "Kosongkan jika tidak kedaluwarsa (e.g., JLPT seumur hidup).",
        type: "date",
        required: false,
        is_expires_at: true,
      },
    ],
  },
  professional_certificate: {
    label: "Sertifikat Profesi",
    description:
      "Sertifikat profesi seperti Caregiving SSW, Halal Handler, BLS, ACLS, dll.",
    universal: false,
    fields: [
      {
        key: "cert_name",
        label: "Jenis sertifikat",
        type: "select",
        required: true,
        options: [
          "ssw_kaigo",
          "halal_handler",
          "food_handler",
          "bls",
          "acls",
          "first_aid",
          "other",
        ],
        option_labels: {
          ssw_kaigo: "SSW Kaigo (Caregiving Jepang)",
          halal_handler: "Halal Handler",
          food_handler: "Food Handler",
          bls: "BLS (Basic Life Support)",
          acls: "ACLS (Advanced Cardiac LS)",
          first_aid: "First Aid",
          other: "Lainnya (isi nama di catatan)",
        },
      },
      {
        key: "issuer",
        label: "Lembaga penerbit",
        type: "text",
        required: false,
      },
      {
        key: "issued_at",
        label: "Tanggal terbit",
        type: "date",
        required: false,
      },
      {
        key: "expires_at",
        label: "Berlaku sampai",
        type: "date",
        required: false,
        is_expires_at: true,
      },
    ],
  },
  education_certificate: {
    label: "Ijazah / Transkrip",
    description: "Ijazah pendidikan terakhir atau transkrip nilai.",
    universal: false,
    fields: [
      {
        key: "level",
        label: "Jenjang",
        type: "select",
        required: true,
        options: ["sma", "smk", "d3", "d4", "s1", "s2"],
        option_labels: {
          sma: "SMA",
          smk: "SMK",
          d3: "D3 / Diploma",
          d4: "D4 / Sarjana Terapan",
          s1: "S1 / Sarjana",
          s2: "S2 / Magister",
        },
      },
      {
        key: "school",
        label: "Nama institusi",
        type: "text",
        required: false,
      },
      {
        key: "graduation_year",
        label: "Tahun lulus",
        type: "number",
        required: false,
      },
    ],
  },
  work_certificate: {
    label: "Surat Pengalaman Kerja",
    description: "Surat keterangan kerja dari employer sebelumnya.",
    universal: false,
    fields: [
      {
        key: "employer",
        label: "Nama perusahaan",
        type: "text",
        required: true,
      },
      {
        key: "role",
        label: "Posisi",
        type: "text",
        required: true,
      },
      {
        key: "period_start",
        label: "Mulai kerja",
        type: "date",
        required: false,
      },
      {
        key: "period_end",
        label: "Selesai kerja",
        description: "Kosongkan jika masih aktif.",
        type: "date",
        required: false,
      },
    ],
  },
};

/**
 * List of universal doc_types — every candidate must upload these regardless
 * of which position they apply to. Surfaced in /profile Identitas section.
 */
export const UNIVERSAL_DOC_TYPES = Object.entries(DOC_TYPE_METADATA_SCHEMAS)
  .filter(([, schema]) => schema.universal)
  .map(([key]) => key);

/**
 * Helper to get schema for a doc_type with safe fallback.
 */
export function getDocTypeSchema(docType: string): DocTypeSchema | null {
  return DOC_TYPE_METADATA_SCHEMAS[docType] ?? null;
}
