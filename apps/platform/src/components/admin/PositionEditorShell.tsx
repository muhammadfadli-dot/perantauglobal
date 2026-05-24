"use client";

import { useState } from "react";
import ContentEditor from "./ContentEditor";
import PositionPreview from "./PositionPreview";
import { type PositionContent } from "@/lib/position-content";
import { updatePositionContent } from "../../app/(admin)/admin/positions/actions";
import { Icon } from "@/components/pg/Icon";

/**
 * Client orchestrator wiring ContentEditor (left) ↔ PositionPreview (right).
 *
 * Keeps a working copy of `content` here so the preview updates reactively
 * as the admin types. Save action persists to the server.
 *
 * Application fields (position_application_fields) are NOT edited here —
 * they live in ApplicationFieldsEditor (separate component, persists each
 * change immediately). The preview just shows the current persisted fields
 * passed in as initialFields.
 */
export default function PositionEditorShell({
  slug,
  name,
  country,
  description,
  initialContent,
  initialFields,
}: {
  slug: string;
  name: string;
  country: string;
  description: string | null;
  initialContent: PositionContent;
  initialFields: Array<{
    field_key: string;
    field_label: string;
    field_help: string | null;
    field_type: string;
    importance: "required" | "optional";
    section: "syarat_utama" | "kualifikasi" | "screening";
  }>;
}) {
  const [content, setContent] = useState<PositionContent>(initialContent);
  const [viewport, setViewport] = useState<"desktop" | "mobile">("desktop");

  async function handleSave(next: PositionContent) {
    await updatePositionContent(slug, next);
  }

  return (
    <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-5">
      <ContentEditor initial={initialContent} onChange={setContent} onSave={handleSave} />
      <div className="lg:sticky lg:top-4 lg:self-start">
        <div
          className="flex items-center justify-between mb-2 px-2"
        >
          <div className="text-[10px] font-bold tracking-[0.12em] uppercase font-mono text-pg-ink-tertiary">
            Live preview
          </div>
          <div
            className="inline-flex rounded-lg overflow-hidden"
            style={{ border: "1px solid var(--pg-border)" }}
          >
            <button
              type="button"
              onClick={() => setViewport("desktop")}
              aria-pressed={viewport === "desktop"}
              className="px-2.5 py-1 text-[11px] font-bold"
              style={{
                background: viewport === "desktop" ? "var(--pg-ink-primary)" : "var(--pg-white)",
                color: viewport === "desktop" ? "white" : "var(--pg-ink-secondary)",
              }}
            >
              <Icon name="globe" size={11} stroke={2.4} /> Desktop
            </button>
            <button
              type="button"
              onClick={() => setViewport("mobile")}
              aria-pressed={viewport === "mobile"}
              className="px-2.5 py-1 text-[11px] font-bold"
              style={{
                background: viewport === "mobile" ? "var(--pg-ink-primary)" : "var(--pg-white)",
                color: viewport === "mobile" ? "white" : "var(--pg-ink-secondary)",
              }}
            >
              📱 Mobile
            </button>
          </div>
        </div>
        <PositionPreview
          name={name}
          country={country}
          description={description}
          content={content}
          fields={initialFields}
          viewport={viewport}
        />
      </div>
    </div>
  );
}
