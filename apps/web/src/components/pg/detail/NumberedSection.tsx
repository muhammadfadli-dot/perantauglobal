import type { ReactNode } from "react";

/**
 * Section header with mono numeral (01-06) + eyebrow + h2 with optional red accent.
 * Body content rendered as children below.
 */
export function NumberedSection({
  num,
  eyebrow,
  title,
  children,
}: {
  num: string;
  eyebrow: string;
  title: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="mb-12 md:mb-14">
      <div className="flex items-start gap-4 mb-5">
        <span
          className="font-mono text-[28px] md:text-[32px] font-extrabold leading-none text-pg-red-600 shrink-0"
          style={{ letterSpacing: "-0.02em" }}
        >
          {num}
        </span>
        <div className="flex flex-col gap-1">
          <span className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-pg-red-600">
            {eyebrow}
          </span>
          <h2
            className="font-extrabold tracking-[-0.025em] leading-[1.1] text-pg-ink-900 m-0 text-balance"
            style={{ fontSize: "clamp(24px, 3.4vw, 36px)" }}
          >
            {title}
          </h2>
        </div>
      </div>
      {children}
    </section>
  );
}
