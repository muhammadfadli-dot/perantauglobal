/**
 * CV grader schemas (Fase 1, 2026-06-10).
 *
 * Two sources consume these shapes:
 *   - The `grade-cv` Edge Function WRITES `cv_assessments.parsed/derived/quality`
 *     and `application_cv_fit.reasons/verification`. It runs in Deno and keeps its
 *     OWN copy of the JSON schema (see supabase/functions/grade-cv/schema.ts) —
 *     keep both in sync and bump CV_SCHEMA_VERSION on any breaking change.
 *   - The platform app READS these via the Zod schemas below for typing + safe
 *     parsing in admin UI and the candidate completeness nudge.
 *
 * `parsed`  = what the AI extracted from the CV document (raw-ish, as written).
 * `derived` = facts computed in CODE from `parsed` (umur, total_pengalaman_tahun)
 *             so they are accurate — the model is bad at "today's date" math.
 * `quality` = intrinsic completeness score (position-agnostic), for the nudge.
 */

import { z } from "zod";

export const CV_SCHEMA_VERSION = 1;

export const cvExperienceSchema = z.object({
  posisi: z.string(),
  perusahaan: z.string().nullable(),
  lokasi: z.string().nullable(),
  mulai: z.string().nullable(), // as written, e.g. "Maret 2020" / "2017"
  selesai: z.string().nullable(), // "sekarang" allowed
  deskripsi: z.array(z.string()).default([]),
});

export const cvEducationSchema = z.object({
  sekolah: z.string(),
  jenjang: z.string().nullable(), // SMA / SMK / D3 / S1 ...
  jurusan: z.string().nullable(),
  tahun_lulus: z.string().nullable(),
});

export const cvCertificateSchema = z.object({
  nama: z.string(),
  penerbit: z.string().nullable(),
  tahun: z.string().nullable(),
});

export const cvLanguageSchema = z.object({
  bahasa: z.string(),
  level: z.string().nullable(),
});

/** The structured CV the AI extracts from the document image/PDF. */
export const parsedCvSchema = z.object({
  schema_version: z.number().default(CV_SCHEMA_VERSION),
  nama: z.string().nullable(),
  kontak: z.object({
    hp: z.string().nullable(),
    email: z.string().nullable(),
  }),
  tanggal_lahir: z.string().nullable(), // raw, e.g. "14 Agustus 1996"
  gender: z.string().nullable(),
  status_pernikahan: z.string().nullable(),
  domisili: z.string().nullable(),
  ringkasan: z.string().nullable(),
  pengalaman: z.array(cvExperienceSchema).default([]),
  pendidikan: z.array(cvEducationSchema).default([]),
  sertifikat: z.array(cvCertificateSchema).default([]),
  keahlian: z.array(z.string()).default([]),
  bahasa: z.array(cvLanguageSchema).default([]),
});

/** Intrinsic completeness score (position-agnostic) — drives candidate nudge. */
export const cvQualitySchema = z.object({
  skor_kelengkapan: z.number().min(0).max(100),
  kekurangan: z.array(z.string()).default([]),
});

/** Code-computed facts (NOT from the model) — accurate by construction. */
export const cvDerivedSchema = z.object({
  umur: z.number().nullable(),
  total_pengalaman_tahun: z.number().nullable(),
  computed_at: z.string(), // ISO timestamp
});

/** Per-position fit reasoning (application_cv_fit.reasons). */
export const cvFitReasonsSchema = z.object({
  alasan: z.string(),
  yang_kurang: z.array(z.string()).default([]),
});

/**
 * CV-vs-qualifying-answer consistency (application_cv_fit.verification).
 * Filled in a later batch. `verdict`:
 *   - confirmed     CV supports the self-reported answer
 *   - unconfirmed   CV neither supports nor contradicts (no evidence)
 *   - contradicted  CV contradicts the answer → flagged for admin (no score effect)
 */
export const cvVerificationItemSchema = z.object({
  field_key: z.string(),
  field_label: z.string(),
  claim: z.string(), // candidate's self-reported answer
  evidence: z.string().nullable(), // what the CV shows
  verdict: z.enum(["confirmed", "unconfirmed", "contradicted"]),
});

export type ParsedCv = z.infer<typeof parsedCvSchema>;
export type CvQuality = z.infer<typeof cvQualitySchema>;
export type CvDerived = z.infer<typeof cvDerivedSchema>;
export type CvFitReasons = z.infer<typeof cvFitReasonsSchema>;
export type CvVerificationItem = z.infer<typeof cvVerificationItemSchema>;
