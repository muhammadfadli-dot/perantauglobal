import type { ReactNode } from "react";

type CalloutType = "info" | "warning" | "success" | "tip";

const labels: Record<CalloutType, string> = {
  info: "INFO",
  warning: "PERHATIAN",
  success: "DIKONFIRMASI",
  tip: "TIPS",
};

const iconChar: Record<CalloutType, string> = {
  info: "ⓘ",
  warning: "⚠",
  success: "✓",
  tip: "★",
};

const barColor: Record<CalloutType, string> = {
  info: "var(--color-info)",
  warning: "var(--color-warning)",
  success: "var(--color-success)",
  tip: "var(--color-dtg-red)",
};

export default function Callout({
  type = "info",
  title,
  children,
}: {
  type?: CalloutType;
  title?: string;
  children: ReactNode;
}) {
  return (
    <div
      className="not-prose my-8 border border-[var(--color-dtg-ink)] bg-[var(--color-dtg-paper)]"
      style={{ borderLeftWidth: 6, borderLeftColor: barColor[type] }}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[color:rgba(26,26,26,0.15)] px-5 py-2.5 font-[family-name:var(--font-mono)] text-[10px] font-bold uppercase tracking-[0.14em]">
        <span>
          <span style={{ color: barColor[type] }}>{iconChar[type]}</span>{" "}
          <span className="opacity-80">§ {labels[type]}</span>
        </span>
        {title && <span className="opacity-70">{title}</span>}
      </div>
      <div className="px-5 py-4 text-[15px] leading-[1.6] text-[var(--color-dtg-ink)] [&>p]:m-0 [&>p+p]:mt-3">
        {children}
      </div>
    </div>
  );
}
