/**
 * Single source of truth for the CV processing PDP consent (UU 27/2022).
 *
 * CV upload + auto-grade = automated profiling (fit score + contradiction flags),
 * so it gets its OWN granular consent, separate from application_processing, and
 * can be withdrawn independently. The text LOGGED to the consents table must be
 * verbatim what the data subject was SHOWN: both the ApplyForm client (checkbox /
 * micro-copy) and the /api/lowongan/[slug] server (consent log) import these, so
 * shown-text and logged-text can never drift.
 * No server-only imports here - safe for the client bundle. Mirrors academy-consent.ts.
 */
export const CV_CONSENT_PURPOSE = "cv_processing";

export const CV_CONSENT_TEXT =
  "Saya setuju CV/dokumen yang saya unggah disimpan dan dianalisis secara otomatis (AI) untuk mencocokkan saya dengan lowongan yang sesuai, sesuai UU PDP (UU 27/2022).";

export const CV_CONSENT_VERSION = "2026-06-13";

/** Micro-copy pendek di dekat field upload (bukan teks consent yang di-log). */
export const CV_UPLOAD_MICROCOPY =
  "CV kamu dipakai untuk pencocokan lowongan dan dianalisis otomatis sesuai UU PDP.";
