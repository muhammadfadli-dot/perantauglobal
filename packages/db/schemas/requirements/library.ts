/**
 * REQUIREMENT_LIBRARY — Curated catalog of 30 reusable requirement templates
 * for the admin Position Builder UI.
 *
 * When admin creates a new position, the Builder shows this library so they
 * can pick from common, consistently-shaped requirements rather than authoring
 * each one from scratch.
 *
 * Each entry conforms to the v3 RequirementField shape (see migration 0020):
 *   { key, label, category, importance, evidence_mode, allowed_values?,
 *     value_labels?, document_type?, document_filter?, collect_at_stage?,
 *     description? }
 *
 * To extend: add a new entry to LIBRARY below. Library evolves via PR review,
 * not via runtime DB writes — keeps the catalog opinionated and reviewable.
 *
 * Used by:
 *   - apps/platform/(admin)/positions/_shared/RequirementLibraryPanel.tsx
 *   - apps/platform/(admin)/positions/new/PositionWizard.tsx (Step 2)
 */

import type { PipelineStage } from "../../src/types";

export type RequirementCategory =
  | "personal"
  | "certification"
  | "language"
  | "experience";

export type EvidenceMode = "document" | "self_declared" | "either";

export type RequirementImportance = "hard" | "soft";

export type RequirementTemplate = {
  /** Unique key — becomes field_key in position_application_fields when admin picks this from the library */
  key: string;
  /** Display label shown to candidate */
  label: string;
  /** Category for grouping in UI */
  category: RequirementCategory;
  /** Default importance — admin can override per position */
  importance: RequirementImportance;
  /** How candidate proves this requirement */
  evidence_mode: EvidenceMode;
  /** Allowed values for self_declared evidence (rendered as radio/pills) */
  allowed_values?: string[];
  /** Human-readable label per allowed value */
  value_labels?: Record<string, string>;
  /** Reference to candidate_documents.doc_type for document evidence */
  document_type?: string;
  /** JSONB filter on candidate_documents.metadata for document evidence */
  document_filter?: Record<string, unknown>;
  /** When in pipeline this is collected — defaults applied/screening per importance */
  collect_at_stage?: PipelineStage;
  /** Helper text shown to candidate */
  description?: string;
};

export const REQUIREMENT_LIBRARY: ReadonlyArray<RequirementTemplate> = [
  // ─── PERSONAL (5) ──────────────────────────────────────────────────
  {
    key: "min_age_18",
    label: "Usia minimum 18 tahun",
    category: "personal",
    importance: "hard",
    evidence_mode: "self_declared",
    description: "Minimum 18 tahun pada saat berangkat.",
  },
  {
    key: "min_age_21",
    label: "Usia minimum 21 tahun",
    category: "personal",
    importance: "hard",
    evidence_mode: "self_declared",
  },
  {
    key: "gender_female",
    label: "Khusus wanita",
    category: "personal",
    importance: "hard",
    evidence_mode: "self_declared",
  },
  {
    key: "gender_male",
    label: "Khusus pria",
    category: "personal",
    importance: "hard",
    evidence_mode: "self_declared",
  },
  {
    key: "education_min",
    label: "Pendidikan minimum",
    category: "personal",
    importance: "hard",
    evidence_mode: "self_declared",
    allowed_values: ["sma", "d3", "s1"],
    value_labels: { sma: "SMA/SMK", d3: "D3 sederajat", s1: "S1 sederajat" },
  },

  // ─── CERTIFICATION (10) ────────────────────────────────────────────
  {
    key: "str_active",
    label: "STR Aktif",
    category: "certification",
    importance: "hard",
    evidence_mode: "either",
    allowed_values: ["yes", "inProgress"],
    value_labels: { yes: "Aktif", inProgress: "Sedang proses" },
    document_type: "str_certificate",
    description: "Surat Tanda Registrasi keperawatan dari MTKI/KKI.",
  },
  {
    key: "sim_b1",
    label: "SIM B1",
    category: "certification",
    importance: "hard",
    evidence_mode: "document",
    document_type: "driving_license",
    document_filter: { class: "b1" },
  },
  {
    key: "sim_b2",
    label: "SIM B2",
    category: "certification",
    importance: "hard",
    evidence_mode: "document",
    document_type: "driving_license",
    document_filter: { class: "b2" },
  },
  {
    key: "sim_internasional",
    label: "SIM Internasional",
    category: "certification",
    importance: "hard",
    evidence_mode: "document",
    document_type: "driving_license",
    document_filter: { class: "internasional" },
  },
  {
    key: "caregiving_cert_ssw_kaigo",
    label: "Sertifikat Caregiving SSW Kaigo",
    category: "certification",
    importance: "hard",
    evidence_mode: "document",
    document_type: "professional_certificate",
    document_filter: { cert_name: "ssw_kaigo" },
    description: "Sertifikat Specified Skilled Worker — Caregiving (Jepang).",
  },
  {
    key: "halal_handler_cert",
    label: "Sertifikat Halal Handler",
    category: "certification",
    importance: "soft",
    evidence_mode: "document",
    document_type: "professional_certificate",
    document_filter: { cert_name: "halal_handler" },
  },
  {
    key: "food_handler_cert",
    label: "Sertifikat Food Handler",
    category: "certification",
    importance: "soft",
    evidence_mode: "document",
    document_type: "professional_certificate",
    document_filter: { cert_name: "food_handler" },
  },
  {
    key: "bls_cert",
    label: "BLS (Basic Life Support)",
    category: "certification",
    importance: "soft",
    evidence_mode: "document",
    document_type: "professional_certificate",
    document_filter: { cert_name: "bls" },
  },
  {
    key: "acls_cert",
    label: "ACLS (Advanced Cardiac Life Support)",
    category: "certification",
    importance: "soft",
    evidence_mode: "document",
    document_type: "professional_certificate",
    document_filter: { cert_name: "acls" },
  },
  {
    key: "first_aid_cert",
    label: "Sertifikat First Aid",
    category: "certification",
    importance: "soft",
    evidence_mode: "document",
    document_type: "professional_certificate",
    document_filter: { cert_name: "first_aid" },
  },

  // ─── LANGUAGE (8) ──────────────────────────────────────────────────
  {
    key: "english_self",
    label: "Bahasa Inggris",
    category: "language",
    importance: "soft",
    evidence_mode: "self_declared",
    allowed_values: ["basic", "intermediate", "fluent"],
    value_labels: {
      basic: "Bisa percakapan dasar",
      intermediate: "Bisa diskusi profesional",
      fluent: "Fasih bicara & menulis",
    },
  },
  {
    key: "english_cert_ielts",
    label: "Bahasa Inggris (IELTS)",
    category: "language",
    importance: "soft",
    evidence_mode: "document",
    document_type: "language_certificate",
    document_filter: { language: "english", system: "ielts" },
  },
  {
    key: "jlpt_n5",
    label: "JLPT N5",
    category: "language",
    importance: "hard",
    evidence_mode: "either",
    allowed_values: ["n5"],
    document_type: "language_certificate",
    document_filter: { language: "japanese", level: "n5" },
  },
  {
    key: "jlpt_n4",
    label: "JLPT N4",
    category: "language",
    importance: "hard",
    evidence_mode: "either",
    allowed_values: ["n4", "n3", "n2", "n1"],
    document_type: "language_certificate",
    document_filter: { language: "japanese", min_level: "n4" },
    description: "Level N4 atau lebih tinggi diterima.",
  },
  {
    key: "jlpt_n3",
    label: "JLPT N3",
    category: "language",
    importance: "hard",
    evidence_mode: "document",
    document_type: "language_certificate",
    document_filter: { language: "japanese", min_level: "n3" },
  },
  {
    key: "jlpt_n2",
    label: "JLPT N2",
    category: "language",
    importance: "hard",
    evidence_mode: "document",
    document_type: "language_certificate",
    document_filter: { language: "japanese", min_level: "n2" },
  },
  {
    key: "eps_topik",
    label: "EPS-TOPIK Korea",
    category: "language",
    importance: "hard",
    evidence_mode: "document",
    document_type: "language_certificate",
    document_filter: { language: "korean", system: "eps_topik" },
  },
  {
    key: "arabic_self",
    label: "Bahasa Arab",
    category: "language",
    importance: "soft",
    evidence_mode: "self_declared",
    allowed_values: ["basic", "intermediate", "fluent"],
    value_labels: {
      basic: "Bisa percakapan dasar",
      intermediate: "Bisa diskusi profesional",
      fluent: "Fasih",
    },
  },

  // ─── EXPERIENCE (5) ────────────────────────────────────────────────
  {
    key: "experience_years",
    label: "Pengalaman kerja umum",
    category: "experience",
    importance: "soft",
    evidence_mode: "self_declared",
    allowed_values: ["none", "less_than_1", "1-3", "3+"],
    value_labels: {
      none: "Belum ada",
      less_than_1: "<1 tahun",
      "1-3": "1–3 tahun",
      "3+": "3+ tahun",
    },
  },
  {
    key: "exp_nursing",
    label: "Pengalaman keperawatan",
    category: "experience",
    importance: "soft",
    evidence_mode: "self_declared",
    allowed_values: ["none", "less_than_1", "1-3", "3+"],
    value_labels: {
      none: "Belum ada",
      less_than_1: "<1 tahun",
      "1-3": "1–3 tahun",
      "3+": "3+ tahun",
    },
  },
  {
    key: "exp_caregiving",
    label: "Pengalaman caregiving",
    category: "experience",
    importance: "soft",
    evidence_mode: "self_declared",
    allowed_values: ["none", "less_than_1", "1-3", "3+"],
    value_labels: {
      none: "Belum ada",
      less_than_1: "<1 tahun",
      "1-3": "1–3 tahun",
      "3+": "3+ tahun",
    },
  },
  {
    key: "exp_fnb",
    label: "Pengalaman F&B service",
    category: "experience",
    importance: "soft",
    evidence_mode: "self_declared",
    allowed_values: ["none", "less_than_1", "1-3", "3+"],
    value_labels: {
      none: "Belum ada",
      less_than_1: "<1 tahun",
      "1-3": "1–3 tahun",
      "3+": "3+ tahun",
    },
  },
  {
    key: "exp_driving",
    label: "Pengalaman mengemudi profesional",
    category: "experience",
    importance: "soft",
    evidence_mode: "self_declared",
    allowed_values: ["none", "less_than_1", "1-3", "3+"],
    value_labels: {
      none: "Belum ada",
      less_than_1: "<1 tahun",
      "1-3": "1–3 tahun",
      "3+": "3+ tahun",
    },
  },
];

/**
 * Index by category for fast lookup in admin UI panels.
 */
export const REQUIREMENT_LIBRARY_BY_CATEGORY: Record<
  RequirementCategory,
  RequirementTemplate[]
> = {
  personal: REQUIREMENT_LIBRARY.filter((r) => r.category === "personal"),
  certification: REQUIREMENT_LIBRARY.filter((r) => r.category === "certification"),
  language: REQUIREMENT_LIBRARY.filter((r) => r.category === "language"),
  experience: REQUIREMENT_LIBRARY.filter((r) => r.category === "experience"),
};

/**
 * Total count for UI display ("Library · 28 items").
 */
export const REQUIREMENT_LIBRARY_COUNT = REQUIREMENT_LIBRARY.length;
