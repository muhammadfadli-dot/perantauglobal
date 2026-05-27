"use client";

import { Icon } from "@/components/pg/Icon";

/**
 * Sticky strip sitting just above PublishBar. Single CTA: "Lihat preview"
 * which opens PreviewOverlay (full-screen) over the editor.
 *
 * Visual: lower-profile than PublishBar (smaller, no shadow), so the
 * eye-flow reads bar > strip as a hierarchy of action importance.
 */
export function PreviewToggleStrip({
  slug,
  onOpen,
}: {
  slug: string;
  onOpen: () => void;
}) {
  return (
    <div
      className="mx-auto max-w-[1400px] px-4"
      style={{ pointerEvents: "none" }}
    >
      <button
        type="button"
        onClick={onOpen}
        className="w-full flex items-center justify-between gap-3 px-4 py-2 rounded-xl border text-[12.5px] no-underline transition-colors"
        style={{
          pointerEvents: "auto",
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "saturate(140%) blur(8px)",
          WebkitBackdropFilter: "saturate(140%) blur(8px)",
          borderColor: "var(--pg-ink-100)",
          color: "var(--pg-ink-700)",
          fontFamily: "var(--font-mono)",
        }}
      >
        <span className="flex items-center gap-2">
          <Icon name="globe" size={13} stroke={2.2} />
          Lihat preview full-screen
          <span style={{ color: "var(--pg-ink-tertiary)" }}>· /lowongan/{slug}</span>
        </span>
        <span
          className="text-[11px] font-bold uppercase tracking-[0.08em]"
          style={{ color: "var(--pg-red-600)" }}
        >
          Buka preview →
        </span>
      </button>
    </div>
  );
}
