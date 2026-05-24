/**
 * Bridge between the new positions.content JSONB (admin-authored, source of
 * truth post Fase 3) and the existing PositionDetail shape used by the
 * /lowongan/[slug] page renderer.
 *
 * Resolution order:
 *   1. positions.content from DB (admin authored)
 *   2. lib/positionDetails.ts (legacy static fallback for positions where
 *      admin hasn't yet authored content)
 *
 * The bridge keeps page.tsx ignorant of where content came from — it just
 * receives a PositionDetail-shaped object either way.
 */

import { getPositionDetail, type PositionDetail } from "./positionDetails";
import type { IconName } from "@/components/pg/Icon";

type BenefitJson = { icon: string; label: string; value: string };
type DetailJson = { label: string; value: string };
type FeeJson = { amount: string; breakdown?: unknown; note?: string };

/** Coerce arbitrary JSON into the PositionDetail shape; missing keys map to undefined. */
function fromContent(raw: unknown): PositionDetail | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const obj = raw as Record<string, unknown>;

  // If everything is empty, treat as "no DB content" so fallback wins.
  const hasAny =
    Array.isArray(obj.jobDescription) ||
    Array.isArray(obj.details) ||
    Array.isArray(obj.benefits) ||
    Array.isArray(obj.qualifications) ||
    Array.isArray(obj.process) ||
    (obj.fee && typeof obj.fee === "object");
  if (!hasAny) return null;

  const detail: PositionDetail = {
    details:
      Array.isArray(obj.details)
        ? (obj.details as DetailJson[])
            .filter((d) => d && typeof d === "object" && typeof d.label === "string" && typeof d.value === "string")
        : [],
    benefits:
      Array.isArray(obj.benefits)
        ? (obj.benefits as BenefitJson[])
            .filter(
              (b) =>
                b &&
                typeof b === "object" &&
                typeof b.icon === "string" &&
                typeof b.label === "string" &&
                typeof b.value === "string",
            )
            .map((b) => ({ icon: b.icon as IconName, label: b.label, value: b.value }))
        : [],
    qualifications:
      Array.isArray(obj.qualifications)
        ? (obj.qualifications as unknown[]).filter((q): q is string => typeof q === "string")
        : [],
  };

  if (Array.isArray(obj.jobDescription)) {
    detail.jobDescription = (obj.jobDescription as unknown[]).filter(
      (s): s is string => typeof s === "string",
    );
  }
  if (Array.isArray(obj.process)) {
    detail.process = (obj.process as unknown[]).filter((s): s is string => typeof s === "string");
  }
  if (obj.fee && typeof obj.fee === "object" && !Array.isArray(obj.fee)) {
    const f = obj.fee as FeeJson;
    if (typeof f.amount === "string") {
      detail.fee = {
        amount: f.amount,
        breakdown: Array.isArray(f.breakdown)
          ? (f.breakdown as unknown[]).filter((s): s is string => typeof s === "string")
          : [],
        ...(typeof f.note === "string" ? { note: f.note } : {}),
      };
    }
  }

  return detail;
}

/**
 * Resolve PositionDetail for a slug, preferring DB content over the static
 * fallback. Pass dbContent in from a server-side fetchPositionContent call.
 *
 * Returns undefined if neither source has content (page should 404).
 */
export function resolvePositionDetail(
  slug: string,
  dbContent: unknown | null,
): PositionDetail | undefined {
  const fromDb = fromContent(dbContent);
  if (fromDb) return fromDb;
  return getPositionDetail(slug);
}
