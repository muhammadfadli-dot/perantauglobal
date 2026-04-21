import type { ReactNode } from "react";

export type FooterColumn = {
  label: string;
  items: ReactNode[];
};

type Props = {
  brand: {
    title: string;
    body: string;
  };
  columns: FooterColumn[];
  legal?: { left: string; right: string };
};

export function Footer({ brand, columns, legal }: Props) {
  return (
    <footer className="bg-[var(--color-dtg-ink)] px-6 py-12 text-[var(--color-dtg-cream)]">
      <div className="mx-auto max-w-[1440px]">
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-[2fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/logos/logo-icon.svg"
                alt=""
                width={32}
                height={32}
                className="size-8 shrink-0"
                aria-hidden
              />
              <span className="font-[family-name:var(--font-display)] text-[17px] font-extrabold tracking-[-0.02em]">
                {brand.title}
              </span>
            </div>
            <p className="mt-4 max-w-[40ch] text-[13px] leading-relaxed opacity-75">{brand.body}</p>
          </div>
          {columns.map((col) => (
            <div key={col.label}>
              <div className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.15em] opacity-60">
                {col.label}
              </div>
              <ul className="mt-3 grid gap-2 text-sm">
                {col.items.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        {legal && (
          <div className="mt-10 flex flex-wrap items-center justify-between gap-2 border-t border-[color:rgba(245,240,232,0.2)] pt-5 font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.12em] opacity-60">
            <span>{legal.left}</span>
            <span>{legal.right}</span>
          </div>
        )}
      </div>
    </footer>
  );
}
