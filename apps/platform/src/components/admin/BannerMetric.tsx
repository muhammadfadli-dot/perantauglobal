import { Sparkline } from "./Sparkline";

/**
 * BannerMetric — compact KPI tile for the editor page header.
 * Matches design C (admin-editor-c.jsx) banner metrics strip:
 * a 3-up row above the tabs showing position-level health at a glance.
 *
 * Smaller than KpiStat — designed to live inline in a flexible header,
 * not as a standalone card.
 */
export function BannerMetric({
  label,
  value,
  suffix,
  delta,
  deltaTone,
  sparkline,
}: {
  label: string;
  value: string | number;
  /** e.g. "hr" or "%" rendered after the value */
  suffix?: string;
  /** e.g. "↑ 18%" or "+4pt" */
  delta?: string;
  deltaTone?: "ok" | "warn" | "err" | "mute";
  /** 7-element daily series (or longer); rendered as small bar chart */
  sparkline?: number[];
}) {
  const deltaColor =
    deltaTone === "ok"
      ? "var(--pg-ok)"
      : deltaTone === "warn"
        ? "var(--pg-warn-soft-fg)"
        : deltaTone === "err"
          ? "var(--pg-err)"
          : "var(--pg-ink-500)";

  return (
    <div
      className="rounded-[10px] px-3 py-2 flex flex-col gap-1 min-w-[140px]"
      style={{
        background: "var(--pg-paper)",
        border: "1px solid var(--pg-ink-100)",
      }}
    >
      <span
        className="text-[10px] font-bold tracking-[0.1em] uppercase"
        style={{
          color: "var(--pg-ink-500)",
          fontFamily: "var(--font-mono)",
        }}
      >
        {label}
      </span>
      <div className="flex items-end gap-1.5">
        <span className="text-[18px] font-extrabold tracking-[-0.025em] leading-none text-pg-ink-900 tabular-nums">
          {value}
          {suffix && (
            <span
              className="text-[11px] font-bold ml-0.5"
              style={{ color: "var(--pg-ink-tertiary)" }}
            >
              {suffix}
            </span>
          )}
        </span>
        {delta && (
          <span
            className="font-mono text-[10px] font-bold uppercase tracking-[0.04em] mb-0.5"
            style={{ color: deltaColor }}
          >
            {delta}
          </span>
        )}
        {sparkline && sparkline.length > 0 && (
          <div className="ml-auto mb-0.5">
            <Sparkline data={sparkline} width={56} height={16} barGap={1.5} />
          </div>
        )}
      </div>
    </div>
  );
}
