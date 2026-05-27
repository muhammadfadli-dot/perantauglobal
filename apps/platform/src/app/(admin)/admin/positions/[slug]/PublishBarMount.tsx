"use client";

import { PublishBar } from "@/components/admin/PublishBar";
import { updatePositionMeta } from "../actions";

/**
 * Client wrapper that mounts PublishBar (the sticky-bottom publish/unpublish
 * bar) and binds it to the existing `updatePositionMeta` server action.
 *
 * Server-side page.tsx provides snapshot data (initialActive, lastUpdatedAt,
 * positionName). PublishBar manages its own optimistic + busy + error state.
 */
export default function PublishBarMount({
  slug,
  positionName,
  initialActive,
  lastUpdatedAt,
}: {
  slug: string;
  positionName: string;
  initialActive: boolean;
  lastUpdatedAt: string | null;
}) {
  return (
    <PublishBar
      initialActive={initialActive}
      positionName={positionName}
      lastUpdatedAt={lastUpdatedAt}
      onToggle={async (next) => {
        await updatePositionMeta(slug, { active: next });
      }}
    />
  );
}
