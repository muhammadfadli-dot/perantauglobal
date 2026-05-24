/**
 * Catalog of certification products surfaced on the marketing site.
 *
 * Model (locked 2026-05-17):
 *  - "paspor" = Paspor Perantau Global. First-party, PAID bundle, per-country
 *    series. Launch = Jepang + Saudi Arabia. Bundle = pelatihan fundamental +
 *    psikotes yang diakui formal (the psikotes is the payable core value).
 *  - "skill" = skill-specific (bahasa, SIM, course-provider prereqs). Comes via
 *    THIRD-PARTY partners. Status "soon" — not launching yet.
 *
 * Copy guardrail (mandatory — see memory feedback_sertifikasi_narrative):
 *  - Frame certs as a credential the candidate ALREADY NEEDS to go abroad that
 *    Perantau Global happens to help with — NEVER as a mandatory gate to
 *    placement. Tone: "biar makin siap", not "wajib lewat kami".
 *  - NO fabricated prices. Real pricing is a Fase-5 input from Panji; until
 *    then use honest placeholder copy, not a fake rupiah number.
 *  - Linkage to lowongan = per-country only (Paspor is NOT skill-specific).
 */

import type { IconName } from "@/components/pg/Icon";
import { getPosition, POSITIONS, type Position } from "@/lib/positions";

export type CertCountry = "Jepang" | "Saudi Arabia";
export type CertKind = "paspor" | "skill";
export type CertProvider = "perantau_global" | "partner";
export type CertStatus = "live" | "soon";

export type Certification = {
  slug: string;
  /** Full name, e.g. "Paspor Perantau Global — Saudi Arabia" */
  name: string;
  /** Short name for cards/chips, e.g. "Paspor Saudi Arabia" */
  shortName: string;
  kind: CertKind;
  provider: CertProvider;
  status: CertStatus;
  /** Country scope for paspor series; undefined for general/skill certs */
  country?: CertCountry;
  icon: IconName;
  /** One-line value prop */
  tagline: string;
  /** Price display — PAID. Placeholder until Fase 5 (no fabricated numbers). */
  price: string;
  priceNote?: string;
  /** Bundle contents (paspor) */
  includes: string[];
  /** Whether the credential (psikotes) is formally recognized */
  recognized: boolean;
};

export const CERTIFICATIONS: Certification[] = [
  // === Paspor Perantau Global — first-party, paid, LIVE ===
  {
    slug: "paspor-perantau-global-saudi-arabia",
    name: "Paspor Perantau Global — Saudi Arabia",
    shortName: "Paspor Saudi Arabia",
    kind: "paspor",
    provider: "perantau_global",
    status: "live",
    country: "Saudi Arabia",
    icon: "passport",
    tagline: "Bekal fundamental + psikotes yang diakui, biar kamu makin siap berangkat ke Saudi Arabia.",
    price: "Berbayar",
    priceNote: "Rincian biaya menyusul", // TODO(fase5): real price from Panji
    includes: [
      "Pelatihan fundamental kerja di Saudi Arabia",
      "Psikotes yang diakui secara formal",
      "Sertifikat Paspor Perantau Global",
    ],
    recognized: true,
  },
  {
    slug: "paspor-perantau-global-jepang",
    name: "Paspor Perantau Global — Jepang",
    shortName: "Paspor Jepang",
    kind: "paspor",
    provider: "perantau_global",
    status: "live",
    country: "Jepang",
    icon: "passport",
    tagline: "Bekal fundamental + psikotes yang diakui, biar kamu makin siap berangkat ke Jepang.",
    price: "Berbayar",
    priceNote: "Rincian biaya menyusul", // TODO(fase5): real price from Panji
    includes: [
      "Pelatihan fundamental kerja di Jepang",
      "Psikotes yang diakui secara formal",
      "Sertifikat Paspor Perantau Global",
    ],
    recognized: true,
  },
  // === Skill-specific — third-party partners, COMING SOON ===
  {
    slug: "sertifikasi-bahasa-jepang",
    name: "Sertifikasi Bahasa Jepang",
    shortName: "Bahasa Jepang",
    kind: "skill",
    provider: "partner",
    status: "soon",
    icon: "globe",
    tagline: "Sertifikasi kemampuan bahasa Jepang lewat mitra resmi.",
    price: "Segera",
    includes: [],
    recognized: true,
  },
  {
    slug: "sim-internasional",
    name: "SIM Internasional",
    shortName: "SIM Internasional",
    kind: "skill",
    provider: "partner",
    status: "soon",
    icon: "id_card",
    tagline: "Pengurusan SIM internasional lewat mitra resmi.",
    price: "Segera",
    includes: [],
    recognized: false,
  },
];

export function getCertification(slug: string): Certification | undefined {
  return CERTIFICATIONS.find((c) => c.slug === slug);
}

export function listCertifications(filter?: {
  kind?: CertKind;
  status?: CertStatus;
}) {
  return CERTIFICATIONS.filter((c) => {
    if (filter?.kind && c.kind !== filter.kind) return false;
    if (filter?.status && c.status !== filter.status) return false;
    return true;
  });
}

/**
 * Certs that help a candidate get ready for a given position.
 * Linkage is per-country only: a live Paspor for the position's country.
 * Enabler framing — these are NOT a requirement imposed by Perantau Global.
 */
export function getCertsForPosition(positionSlug: string): Certification[] {
  const position = getPosition(positionSlug);
  if (!position) return [];
  return CERTIFICATIONS.filter(
    (c) =>
      c.kind === "paspor" &&
      c.status === "live" &&
      c.country === position.country,
  );
}

/**
 * Reverse of getCertsForPosition: positions a Paspor helps you get ready for.
 * Per-country match. Enabler framing — not a requirement.
 */
export function getPositionsForCert(certSlug: string): Position[] {
  const cert = getCertification(certSlug);
  if (!cert || cert.kind !== "paspor" || !cert.country) return [];
  return POSITIONS.filter((p) => p.country === cert.country);
}
