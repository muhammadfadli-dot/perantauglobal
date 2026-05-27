"use client";

import { useState } from "react";
import { PreviewOverlay } from "@/components/admin/PreviewOverlay";
import { PreviewToggleStrip } from "@/components/admin/PreviewToggleStrip";
import type { PositionContent } from "@/lib/position-content";

/**
 * Client wrapper that owns the preview overlay open/close state. Renders
 * the always-visible PreviewToggleStrip above the PublishBar; opens the
 * full-screen PreviewOverlay on demand.
 *
 * Both components are client-only and listen to `pg-editor-state` window
 * events to stay in sync with the editor's latest content.
 */
export default function PreviewMount({
  slug,
  name,
  country,
  description,
  initialContent,
  fields,
}: {
  slug: string;
  name: string;
  country: string;
  description: string | null;
  initialContent: PositionContent;
  fields: Array<{
    field_key: string;
    field_label: string;
    field_help: string | null;
    field_type: string;
    importance: "required" | "optional";
    section: "syarat_utama" | "kualifikasi" | "screening";
  }>;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <PreviewToggleStrip slug={slug} onOpen={() => setOpen(true)} />
      <PreviewOverlay
        open={open}
        onClose={() => setOpen(false)}
        slug={slug}
        name={name}
        country={country}
        description={description}
        initialContent={initialContent}
        fields={fields}
      />
    </>
  );
}
