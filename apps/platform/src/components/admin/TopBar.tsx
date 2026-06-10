import Link from "next/link";
import TopBarSearch from "./TopBarSearch";

export type Crumb = { label: string; href?: string; emphasis?: boolean };

export default function AdminTopBar({
  crumbs = [],
  searchPlaceholder,
  rightSlot,
}: {
  crumbs?: Crumb[];
  searchPlaceholder?: string;
  rightSlot?: React.ReactNode;
}) {
  return (
    <div
      className="sticky top-0 z-20 flex items-center gap-4 px-8 py-5 bg-pg-white"
      style={{ borderBottom: "1px solid var(--pg-border)" }}
    >
      <div className="flex items-center gap-2 min-w-0 flex-1">
        {crumbs.map((c, i) => {
          const last = i === crumbs.length - 1;
          const color =
            c.emphasis || last ? "var(--pg-ink-primary)" : "var(--pg-ink-tertiary)";
          const weight = c.emphasis || last ? 700 : 500;
          return (
            <span key={i} className="flex items-center gap-2 truncate">
              {c.href && !last ? (
                <Link
                  href={c.href}
                  className="text-[13px] no-underline hover:text-pg-red-600 truncate"
                  style={{ color, fontWeight: weight }}
                >
                  {c.label}
                </Link>
              ) : (
                <span
                  className="text-[13px] truncate"
                  style={{ color, fontWeight: weight }}
                >
                  {c.label}
                </span>
              )}
              {!last && (
                <span className="text-pg-ink-300 text-[13px]">/</span>
              )}
            </span>
          );
        })}
      </div>

      {rightSlot ? (
        <div className="shrink-0">{rightSlot}</div>
      ) : (
        <TopBarSearch placeholder={searchPlaceholder} />
      )}
    </div>
  );
}
