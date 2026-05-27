/**
 * Sparkline — minimal SVG bar chart for inline trend visualization.
 *
 * Used in:
 *  - Catalog power table: "Apply / minggu" column (7-bar weekly trend)
 *  - Admin dashboard: KPI hero stats (12-week inline trend)
 *
 * Pure server component — no client JS needed.
 */
export function Sparkline({
  data,
  width = 88,
  height = 24,
  barGap = 2,
  color = "var(--pg-red-600)",
  mutedColor = "var(--pg-ink-200)",
}: {
  /** Numeric series — most recent on the right. Min 1 item. */
  data: number[];
  width?: number;
  height?: number;
  barGap?: number;
  color?: string;
  /** Color used for zero-value bars (kept slightly visible) */
  mutedColor?: string;
}) {
  if (data.length === 0) {
    return <div style={{ width, height }} aria-hidden />;
  }

  const max = Math.max(...data, 1);
  const barWidth = (width - barGap * (data.length - 1)) / data.length;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      aria-hidden
      style={{ display: "block" }}
    >
      {data.map((v, i) => {
        const h = Math.max(2, (v / max) * height);
        const x = i * (barWidth + barGap);
        const y = height - h;
        return (
          <rect
            key={i}
            x={x}
            y={y}
            width={barWidth}
            height={h}
            rx={1.5}
            fill={v === 0 ? mutedColor : color}
          />
        );
      })}
    </svg>
  );
}

/**
 * KpiStat — large stat card for admin dashboard KPI hero row.
 * Value + delta + optional sparkline + caption.
 */
export function KpiStat({
  label,
  value,
  delta,
  deltaTone,
  caption,
  sparkline,
}: {
  label: string;
  value: string | number;
  /** e.g. "+18%" or "-2pt" */
  delta?: string;
  deltaTone?: "ok" | "warn" | "err" | "mute";
  caption?: string;
  /** Numeric series for inline sparkline */
  sparkline?: number[];
}) {
  const deltaColors =
    deltaTone === "ok"
      ? { bg: "var(--pg-ok-bg)", fg: "var(--pg-ok)" }
      : deltaTone === "warn"
      ? { bg: "var(--pg-warn-bg)", fg: "var(--pg-warn)" }
      : deltaTone === "err"
      ? { bg: "var(--pg-err-bg)", fg: "var(--pg-err)" }
      : { bg: "var(--pg-ink-50)", fg: "var(--pg-ink-500)" };

  return (
    <div
      className="p-4 rounded-[14px] bg-pg-white flex flex-col gap-1.5"
      style={{
        border: "1px solid var(--pg-ink-100)",
        boxShadow:
          "0 1px 2px rgba(20,16,12,0.04), 0 4px 12px rgba(20,16,12,0.04)",
      }}
    >
      <span className="font-mono text-[10.5px] font-bold uppercase tracking-[0.1em] text-pg-ink-500">
        {label}
      </span>
      <div className="flex items-end gap-2.5 mt-0.5">
        <span className="text-[28px] font-extrabold tracking-[-0.025em] leading-none text-pg-ink-900">
          {value}
        </span>
        {delta && (
          <span
            className="inline-flex items-center px-2 py-0.5 rounded font-mono text-[10px] font-bold uppercase tracking-[0.06em]"
            style={{ background: deltaColors.bg, color: deltaColors.fg }}
          >
            {delta}
          </span>
        )}
        {sparkline && sparkline.length > 0 && (
          <div className="ml-auto">
            <Sparkline data={sparkline} width={72} height={20} />
          </div>
        )}
      </div>
      {caption && (
        <span className="text-[11.5px] text-pg-ink-500 mt-0.5">{caption}</span>
      )}
    </div>
  );
}
