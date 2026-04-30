import Link from "next/link";
import { Icon } from "@/components/pg/Icon";

export type Crumb = { label: string; href?: string; emphasis?: boolean };

export default function AdminTopBar({
  crumbs = [],
  searchPlaceholder = "Cari kandidat, posisi, atau JO…",
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
        <div
          className="hidden lg:flex items-center gap-2 px-3.5 py-2 rounded-lg w-[320px]"
          style={{ background: "var(--pg-white)", border: "1px solid var(--pg-border)" }}
        >
          <Icon name="search" size={13} className="shrink-0 text-pg-ink-quaternary" />
          <span className="text-[13px] text-pg-ink-quaternary">
            {searchPlaceholder}
          </span>
        </div>
      )}
    </div>
  );
}
