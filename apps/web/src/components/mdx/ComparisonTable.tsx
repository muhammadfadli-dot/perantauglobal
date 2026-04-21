import type { ReactNode } from "react";

export default function ComparisonTable({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div
      className={[
        "not-prose my-10 overflow-x-auto border border-[var(--color-dtg-ink)] bg-white",
        // table
        "[&_table]:m-0 [&_table]:w-full [&_table]:border-collapse",
        // thead
        "[&_thead]:bg-[var(--color-dtg-ink)]",
        // th
        "[&_th]:border [&_th]:border-[var(--color-dtg-ink)] [&_th]:px-5 [&_th]:py-3.5 [&_th]:text-left [&_th]:font-[family-name:var(--font-mono)] [&_th]:text-[10px] [&_th]:font-bold [&_th]:uppercase [&_th]:tracking-[0.14em] [&_th]:text-[var(--color-dtg-cream)]",
        // tbody rows
        "[&_tbody_tr]:border-b [&_tbody_tr]:border-[color:rgba(26,26,26,0.12)] [&_tbody_tr]:transition-colors [&_tbody_tr:hover]:bg-[var(--color-dtg-paper)] [&_tbody_tr:last-child]:border-b-0",
        // td
        "[&_td]:border-r [&_td]:border-[color:rgba(26,26,26,0.08)] [&_td]:px-5 [&_td]:py-4 [&_td]:text-[14px] [&_td]:text-[var(--color-dtg-ink)] [&_td:last-child]:border-r-0",
        // bold
        "[&_td_strong]:font-extrabold [&_td_strong]:text-[var(--color-dtg-ink)]",
      ].join(" ")}
    >
      {children}
    </div>
  );
}
