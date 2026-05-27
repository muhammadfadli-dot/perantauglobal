/**
 * Dark trust strip — matches the redesign (ink-900 bg, mono font, white text).
 *
 * Replaces the previous gold permit-prominent band. Per Panji review
 * (2026-05-27): follow design file's header treatment exactly.
 *
 * Layout:
 *  - Desktop: 1-row inline, 3 chunks separated by mid-opacity dots.
 *  - Mobile: same layout, content scrolls horizontally if needed.
 */

const PERMIT_NO = "1810240237512001";

export function TrustStrip() {
  return (
    <div
      className="bg-pg-ink-900 text-white/92 overflow-hidden"
      aria-label={`Perantau Global — Izin resmi P3MI Kemnaker No. ${PERMIT_NO}. Bagian dari DayaLima Group sejak 1998. Bebas biaya sebelum offering letter.`}
    >
      <div className="max-w-6xl mx-auto px-5 md:px-8">
        <div
          className="flex items-center gap-3 md:gap-4 h-9 font-mono text-[11px] md:text-[12px] tracking-[0.04em] overflow-x-auto whitespace-nowrap scrollbar-none"
          style={{ scrollbarWidth: "none" as const }}
        >
          <span className="inline-flex items-center gap-1.5 text-white/92 shrink-0">
            <span
              aria-hidden
              className="inline-block w-1.5 h-1.5 rounded-full"
              style={{ background: "var(--pg-red-500)" }}
            />
            Resmi P3MI Kemnaker · No. {PERMIT_NO}
          </span>
          <span aria-hidden className="text-white/45 shrink-0">·</span>
          <span className="shrink-0">Bagian dari DayaLima Group, sejak 1998</span>
          <span aria-hidden className="text-white/45 shrink-0">·</span>
          <span className="shrink-0">Bebas biaya sebelum offering letter</span>
        </div>
      </div>
    </div>
  );
}
