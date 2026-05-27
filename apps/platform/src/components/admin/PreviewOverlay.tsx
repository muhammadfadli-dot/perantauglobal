"use client";

import { useEffect, useState } from "react";
import PositionPreview from "./PositionPreview";
import type { PositionContent } from "@/lib/position-content";
import { Icon } from "@/components/pg/Icon";

/**
 * PreviewOverlay — full-screen modal showing the live preview of the
 * position landing page. Matches design C's preview overlay UX:
 *
 *   - Triggered from PreviewToggleStrip (which sits above PublishBar)
 *   - Covers the editor area completely
 *   - Has a desktop / mobile viewport toggle
 *   - "Tutup" CTA returns to the editor
 *
 * Listens to `pg-editor-state` window events so the overlay always shows
 * the most recent editor content (not just the initial snapshot from page
 * load).
 */
export function PreviewOverlay({
  open,
  onClose,
  slug,
  name,
  country,
  description,
  initialContent,
  fields,
}: {
  open: boolean;
  onClose: () => void;
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
  const [content, setContent] = useState<PositionContent>(initialContent);
  const [viewport, setViewport] = useState<"desktop" | "mobile">("desktop");

  // Track latest content from Konten tab via window events
  useEffect(() => {
    const h = (e: Event) => {
      const detail = (e as CustomEvent).detail as { content?: PositionContent };
      if (detail.content) setContent(detail.content);
    };
    window.addEventListener("pg-editor-state", h);
    return () => window.removeEventListener("pg-editor-state", h);
  }, []);

  // Close on Escape, lock body scroll while open
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex flex-col"
      style={{ background: "var(--pg-paper)" }}
      role="dialog"
      aria-label={`Preview lowongan ${name}`}
    >
      {/* Top toolbar */}
      <div
        className="flex items-center justify-between gap-4 px-5 py-3"
        style={{
          background: "var(--pg-white)",
          borderBottom: "1px solid var(--pg-ink-100)",
        }}
      >
        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12.5px] font-bold no-underline"
          style={{
            background: "var(--pg-ink-50)",
            color: "var(--pg-ink-900)",
          }}
        >
          <Icon name="arrow_right" size={14} stroke={2.4} className="rotate-180" />
          Tutup preview
        </button>

        <div className="flex items-center gap-3 flex-1 min-w-0 justify-center">
          <span
            className="text-[10px] font-bold tracking-[0.12em] uppercase"
            style={{
              color: "var(--pg-red-600)",
              fontFamily: "var(--font-mono)",
            }}
          >
            Preview
          </span>
          <span
            className="text-[13px] font-extrabold truncate"
            style={{ color: "var(--pg-ink-900)" }}
          >
            {name}
          </span>
          <span
            className="font-mono text-[10.5px]"
            style={{ color: "var(--pg-ink-tertiary)" }}
          >
            /lowongan/{slug}
          </span>
        </div>

        <div
          className="inline-flex rounded-lg overflow-hidden"
          style={{ border: "1px solid var(--pg-ink-100)" }}
        >
          <ViewportBtn
            label="Desktop"
            active={viewport === "desktop"}
            onClick={() => setViewport("desktop")}
            icon="globe"
          />
          <ViewportBtn
            label="Mobile"
            active={viewport === "mobile"}
            onClick={() => setViewport("mobile")}
            icon="phone"
          />
        </div>
      </div>

      {/* Preview canvas */}
      <div
        className="flex-1 min-h-0 overflow-y-auto"
        style={{ background: "var(--pg-paper)" }}
      >
        <div
          className="mx-auto py-6 px-3"
          style={{
            maxWidth: viewport === "mobile" ? 420 : 1100,
            transition: "max-width 200ms ease",
          }}
        >
          <PositionPreview
            name={name}
            country={country}
            description={description}
            content={content}
            fields={fields}
            viewport={viewport}
          />
        </div>
      </div>
    </div>
  );
}

function ViewportBtn({
  label,
  active,
  onClick,
  icon,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  icon: Parameters<typeof Icon>[0]["name"];
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11.5px] font-bold transition-colors"
      style={
        active
          ? { background: "var(--pg-ink-900)", color: "#fff" }
          : { background: "var(--pg-white)", color: "var(--pg-ink-secondary)" }
      }
    >
      <Icon name={icon} size={11} stroke={2.4} />
      {label}
    </button>
  );
}
