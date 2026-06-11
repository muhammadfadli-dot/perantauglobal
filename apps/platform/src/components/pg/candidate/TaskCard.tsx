import Link from "next/link";
import { Icon, type IconName } from "@/components/pg/Icon";

/**
 * TaskCard — actionable card linking to a single next step. Used in S2's
 * "Tugas hari ini" section.
 */
export function TaskCard({
  icon = "passport",
  title,
  meta,
  deadline,
  urgent,
  href,
}: {
  icon?: IconName;
  title: string;
  meta?: string;
  deadline?: string;
  urgent?: boolean;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="block no-underline rounded-[14px] p-3.5 bg-pg-white"
      style={{
        border: urgent
          ? "1px solid var(--pg-red-200)"
          : "1px solid var(--pg-ink-100)",
        boxShadow: urgent
          ? "0 0 0 3px rgba(215,38,47,0.06), 0 1px 2px rgba(20,16,12,0.04), 0 8px 24px rgba(20,16,12,0.06)"
          : "0 1px 2px rgba(20,16,12,0.04), 0 8px 24px rgba(20,16,12,0.06)",
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-11 h-11 rounded-[12px] grid place-items-center shrink-0"
          style={{
            background: urgent ? "var(--pg-red-50)" : "var(--pg-ink-50)",
            color: urgent ? "var(--pg-red-600)" : "var(--pg-ink-900)",
          }}
        >
          <Icon name={icon} size={20} stroke={2} />
        </div>
        <div className="flex flex-col gap-0.5 flex-1 min-w-0">
          <span className="text-[14px] font-extrabold tracking-[-0.01em] text-pg-ink-900">
            {title}
          </span>
          {meta && (
            <span className="text-[11.5px] text-pg-ink-500 leading-tight">
              {meta}
            </span>
          )}
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          {deadline && (
            <span
              className="inline-flex items-center px-2 py-0.5 rounded-md font-mono text-[11px] font-bold tracking-[0.06em] uppercase"
              style={
                urgent
                  ? { background: "var(--pg-err-bg)", color: "var(--pg-err)" }
                  : { background: "var(--pg-ink-50)", color: "var(--pg-ink-700)" }
              }
            >
              {deadline}
            </span>
          )}
          <Icon name="arrow_right" size={14} className="text-pg-ink-400" />
        </div>
      </div>
    </Link>
  );
}
