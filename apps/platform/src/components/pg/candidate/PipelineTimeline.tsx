import type { ReactNode } from "react";
import { Icon } from "@/components/pg/Icon";

/**
 * Pipeline 5-step timeline used on /applications/[id].
 *
 * Steps:
 *  1. Lamaran terkirim
 *  2. Verifikasi awal
 *  3. Lengkapi dokumen
 *  4. Wawancara
 *  5. Keputusan & offering
 */
export const PIPELINE_STEPS = [
  { label: "Lamaran terkirim", defaultMeta: "Konfirmasi WhatsApp dikirim" },
  { label: "Verifikasi awal", defaultMeta: "Tim Perantau Global cek data" },
  { label: "Lengkapi dokumen", defaultMeta: "Upload + isi pertanyaan sisanya" },
  { label: "Wawancara", defaultMeta: "Via WhatsApp / Zoom — jadwal nyusul" },
  { label: "Keputusan & offering", defaultMeta: "3-5 hari setelah wawancara" },
];

export function PipelineTimeline({
  currentIdx,
  customMeta = {},
  insets = {},
}: {
  /** 0-indexed: 0 = lamaran terkirim done, 1 = verifikasi current, etc. */
  currentIdx: number;
  /** Override meta for specific step index */
  customMeta?: Record<number, string>;
  /** Optional inline content under a specific step */
  insets?: Record<number, ReactNode>;
}) {
  return (
    <div className="flex flex-col">
      {PIPELINE_STEPS.map((step, i) => {
        const done = i < currentIdx;
        const current = i === currentIdx;
        const upcoming = i > currentIdx;
        const last = i === PIPELINE_STEPS.length - 1;
        return (
          <div key={i} className="grid grid-cols-[28px_1fr] gap-3 pb-4 last:pb-0">
            <div className="relative">
              <span
                className="w-7 h-7 rounded-full grid place-items-center text-white font-mono text-[12px] font-extrabold"
                style={{
                  background: done
                    ? "var(--pg-ok)"
                    : current
                    ? "var(--pg-red-600)"
                    : "var(--pg-ink-100)",
                  color: upcoming ? "var(--pg-ink-400)" : "#fff",
                  boxShadow: current
                    ? "0 0 0 4px rgba(215,38,47,0.10)"
                    : undefined,
                }}
              >
                {done ? <Icon name="check" size={12} stroke={3} /> : i + 1}
              </span>
              {!last && (
                <span
                  aria-hidden
                  className="absolute left-[13px] top-7 -bottom-1 w-0.5"
                  style={{
                    background: done ? "var(--pg-ok)" : "var(--pg-ink-100)",
                  }}
                />
              )}
            </div>
            <div className={`pt-0.5 ${upcoming ? "opacity-60" : ""}`}>
              <div
                className="text-[14px] font-extrabold tracking-[-0.01em] leading-snug"
                style={{
                  color: done
                    ? "var(--pg-ok)"
                    : current
                    ? "var(--pg-ink-900)"
                    : "var(--pg-ink-700)",
                }}
              >
                {step.label}
              </div>
              <div className="text-[11.5px] text-pg-ink-500 mt-0.5 leading-snug">
                {customMeta[i] ?? step.defaultMeta}
              </div>
              {insets[i] && <div className="mt-2.5">{insets[i]}</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * DocStateBadge — small status badge for document rows.
 */
export function DocStateBadge({
  state,
}: {
  state: "verified" | "review" | "missing" | "locked";
}) {
  const colors =
    state === "verified"
      ? { bg: "var(--pg-ok-bg)", fg: "var(--pg-ok)", label: "Verified" }
      : state === "review"
      ? { bg: "var(--pg-info-bg)", fg: "var(--pg-info)", label: "Dicek" }
      : state === "missing"
      ? { bg: "var(--pg-red-50)", fg: "var(--pg-red-700)", label: "Belum" }
      : { bg: "var(--pg-ink-50)", fg: "var(--pg-ink-500)", label: "Nanti" };
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded font-mono text-[9.5px] font-bold uppercase tracking-[0.06em]"
      style={{ background: colors.bg, color: colors.fg }}
    >
      {colors.label}
    </span>
  );
}
