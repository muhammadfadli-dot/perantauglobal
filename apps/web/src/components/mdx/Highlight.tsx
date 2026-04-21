import type { ReactNode } from "react";

export default function Highlight({
  children,
  label,
}: {
  children: ReactNode;
  label?: string;
}) {
  return (
    <div className="not-prose my-10 border-2 border-[var(--color-dtg-ink)] bg-[var(--color-dtg-paper)]">
      {label && (
        <div className="flex items-center justify-between border-b border-[var(--color-dtg-ink)] bg-[var(--color-dtg-ink)] px-5 py-2.5 font-[family-name:var(--font-mono)] text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--color-dtg-cream)]">
          <span>
            <span className="text-[var(--color-dtg-red)]">●</span> § {label}
          </span>
          <span className="opacity-60">Highlight</span>
        </div>
      )}
      <div
        className={[
          "p-6 md:p-8 text-[15px] leading-[1.65] text-[var(--color-dtg-ink)]",
          "[&>p]:m-0 [&>p+p]:mt-3 [&_strong]:font-extrabold",
          // table
          "[&_table]:mt-3 [&_table]:w-full [&_table]:border [&_table]:border-[var(--color-dtg-ink)] [&_table]:text-left",
          "[&_thead]:bg-[var(--color-dtg-cream)]",
          "[&_th]:border [&_th]:border-[var(--color-dtg-ink)] [&_th]:px-4 [&_th]:py-3 [&_th]:font-[family-name:var(--font-mono)] [&_th]:text-[10px] [&_th]:font-bold [&_th]:uppercase [&_th]:tracking-[0.12em]",
          "[&_td]:border [&_td]:border-[color:rgba(26,26,26,0.15)] [&_td]:px-4 [&_td]:py-3 [&_td]:text-[14px]",
          // lists
          "[&_ul]:mt-3 [&_ul]:grid [&_ul]:gap-2 [&_li]:flex [&_li]:items-start [&_li]:gap-3 [&_li]:before:content-['▸'] [&_li]:before:text-[var(--color-dtg-red)] [&_li]:before:font-bold",
        ].join(" ")}
      >
        {children}
      </div>
    </div>
  );
}
