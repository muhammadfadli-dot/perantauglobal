/**
 * Type definitions for positions.content JSONB.
 *
 * Mirrors the shape backfilled by packages/db/scripts/backfill-position-content.ts
 * and authored by admin via /admin/positions/[slug]. Read by both admin
 * (PositionPreview) and web /lowongan/[slug] (Fase 3).
 *
 * Keep this in sync with the admin editor + the backfill script. Add new keys
 * as optional — the rendering layer should handle missing keys gracefully.
 */

import type { Json } from "@perantauglobal/db";

export type ContentDetailRow = { label: string; value: string };

export type ContentBenefit = { icon: string; label: string; value: string };

/**
 * Card meta authored by admin and rendered as the position's catalog card
 * on apps/web /lowongan. Required for a DB-created position to appear on
 * the public site with a complete card (fallback path: static catalog or
 * sensible defaults if cardMeta is missing).
 *
 * Persisted at positions.content.cardMeta so admin owns the full
 * presentation layer without touching code.
 */
export type ContentCardMeta = {
  icon: string;
  salary: string;
  salaryNote: string;
  gender: string;
  age: string;
  contractLabel?: string;
};

export type ContentFee = {
  amount: string;
  breakdown: string[];
  note?: string;
};

export type ContentTrustPic = {
  name: string;
  photo?: string;
  wa?: string;
  role?: string;
};

export type ContentTrustEmployer = {
  name?: string;
  verified?: boolean;
  bp2miLicense?: string;
  photo?: string;
};

export type ContentTrustSignals = {
  pic?: ContentTrustPic;
  employer?: ContentTrustEmployer;
};

export type PositionContent = {
  hero?: { metaLine?: string };
  cardMeta?: ContentCardMeta;
  jobDescription?: string[];
  details?: ContentDetailRow[];
  benefits?: ContentBenefit[];
  qualifications?: string[];
  fee?: ContentFee;
  process?: string[];
  trustSignals?: ContentTrustSignals;
};

/**
 * Coerce raw JSONB into a typed PositionContent. Defensive against legacy
 * shapes or missing keys — anything malformed gets dropped.
 */
export function parseContent(raw: Json | null | undefined): PositionContent {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const obj = raw as Record<string, unknown>;
  const out: PositionContent = {};

  if (obj.hero && typeof obj.hero === "object" && !Array.isArray(obj.hero)) {
    const h = obj.hero as Record<string, unknown>;
    if (typeof h.metaLine === "string") out.hero = { metaLine: h.metaLine };
  }
  if (obj.cardMeta && typeof obj.cardMeta === "object" && !Array.isArray(obj.cardMeta)) {
    const c = obj.cardMeta as Record<string, unknown>;
    if (
      typeof c.icon === "string" &&
      typeof c.salary === "string" &&
      typeof c.salaryNote === "string" &&
      typeof c.gender === "string" &&
      typeof c.age === "string"
    ) {
      out.cardMeta = {
        icon: c.icon,
        salary: c.salary,
        salaryNote: c.salaryNote,
        gender: c.gender,
        age: c.age,
        ...(typeof c.contractLabel === "string" ? { contractLabel: c.contractLabel } : {}),
      };
    }
  }
  if (Array.isArray(obj.jobDescription)) {
    out.jobDescription = obj.jobDescription.filter((v): v is string => typeof v === "string");
  }
  if (Array.isArray(obj.details)) {
    out.details = obj.details
      .filter((d): d is { label: string; value: string } => {
        return d != null && typeof d === "object"
          && typeof (d as { label?: unknown }).label === "string"
          && typeof (d as { value?: unknown }).value === "string";
      });
  }
  if (Array.isArray(obj.benefits)) {
    out.benefits = obj.benefits
      .filter((b): b is { icon: string; label: string; value: string } => {
        return b != null && typeof b === "object"
          && typeof (b as { icon?: unknown }).icon === "string"
          && typeof (b as { label?: unknown }).label === "string"
          && typeof (b as { value?: unknown }).value === "string";
      });
  }
  if (Array.isArray(obj.qualifications)) {
    out.qualifications = obj.qualifications.filter((v): v is string => typeof v === "string");
  }
  if (obj.fee && typeof obj.fee === "object" && !Array.isArray(obj.fee)) {
    const f = obj.fee as Record<string, unknown>;
    if (typeof f.amount === "string") {
      const breakdown = Array.isArray(f.breakdown)
        ? f.breakdown.filter((v): v is string => typeof v === "string")
        : [];
      out.fee = {
        amount: f.amount,
        breakdown,
        ...(typeof f.note === "string" ? { note: f.note } : {}),
      };
    }
  }
  if (Array.isArray(obj.process)) {
    out.process = obj.process.filter((v): v is string => typeof v === "string");
  }
  if (obj.trustSignals && typeof obj.trustSignals === "object" && !Array.isArray(obj.trustSignals)) {
    const ts = obj.trustSignals as Record<string, unknown>;
    const trustSignals: ContentTrustSignals = {};
    if (ts.pic && typeof ts.pic === "object" && !Array.isArray(ts.pic)) {
      const p = ts.pic as Record<string, unknown>;
      if (typeof p.name === "string") {
        trustSignals.pic = {
          name: p.name,
          ...(typeof p.photo === "string" ? { photo: p.photo } : {}),
          ...(typeof p.wa === "string" ? { wa: p.wa } : {}),
          ...(typeof p.role === "string" ? { role: p.role } : {}),
        };
      }
    }
    if (ts.employer && typeof ts.employer === "object" && !Array.isArray(ts.employer)) {
      const e = ts.employer as Record<string, unknown>;
      trustSignals.employer = {
        ...(typeof e.name === "string" ? { name: e.name } : {}),
        ...(typeof e.verified === "boolean" ? { verified: e.verified } : {}),
        ...(typeof e.bp2miLicense === "string" ? { bp2miLicense: e.bp2miLicense } : {}),
        ...(typeof e.photo === "string" ? { photo: e.photo } : {}),
      };
    }
    if (Object.keys(trustSignals).length > 0) out.trustSignals = trustSignals;
  }

  return out;
}

/** Empty content scaffold for new positions */
export const EMPTY_CONTENT: PositionContent = {
  hero: { metaLine: "" },
  jobDescription: [],
  details: [],
  benefits: [],
  qualifications: [],
  process: [],
  trustSignals: {},
};
