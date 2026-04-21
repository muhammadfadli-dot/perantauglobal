"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export type NavAnchor = { id: string; label: string; href?: string };

export type Masthead = {
  edition: string;
  month: string;
  site: string;
  live: string;
};

type Props = {
  anchors: NavAnchor[];
  ctaLabel: string;
  ctaHref: string;
  brand?: { title: string; subtitle: string };
  masthead?: Masthead;
};

export function Nav({
  anchors,
  ctaLabel,
  ctaHref,
  brand = { title: "Perantau Global", subtitle: "PT Daya Talenta Global · P3MI" },
  masthead,
}: Props) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 120);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--color-dtg-ink)] bg-[var(--color-dtg-cream)]">
      {masthead && (
        <div className="flex flex-wrap items-center justify-between gap-2 bg-[var(--color-dtg-ink)] px-6 py-2.5 font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.14em] text-[var(--color-dtg-cream)]">
          <span className="flex items-center gap-3">
            <span className="font-extrabold tracking-[0.18em] text-white">PERANTAU</span>
            <span className="opacity-70">{masthead.edition} · {masthead.month}</span>
          </span>
          <span className="flex items-center gap-3">
            <span className="hidden opacity-70 sm:inline">{masthead.site}</span>
            <span className="text-[var(--color-dtg-red)]">● {masthead.live}</span>
          </span>
        </div>
      )}
      <div
        className={cn(
          "mx-auto flex max-w-[1440px] items-center justify-between gap-5 px-6 transition-[padding]",
          scrolled ? "py-2" : "py-3.5",
        )}
      >
        <a href="#top" className="flex items-center gap-2.5 text-[var(--color-dtg-ink)] no-underline">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/logos/logo-icon.svg"
            alt=""
            width={28}
            height={28}
            className="size-7 shrink-0"
            aria-hidden
          />
          <span className="leading-tight">
            <span className="block font-[family-name:var(--font-display)] text-[15px] font-extrabold tracking-[-0.02em]">
              {brand.title}
            </span>
            <span className="mt-0.5 block font-[family-name:var(--font-mono)] text-[9px] uppercase tracking-[0.1em] opacity-60">
              {brand.subtitle}
            </span>
          </span>
        </a>

        <nav className="hidden items-center gap-1 md:flex">
          {anchors.map((a) => (
            <a
              key={a.id}
              href={a.href ?? `#${a.id}`}
              className="px-3.5 py-2 font-[family-name:var(--font-sans)] text-sm font-semibold text-[var(--color-dtg-ink)] no-underline transition-colors hover:text-[var(--color-dtg-red)]"
            >
              {a.label}
            </a>
          ))}
        </nav>

        <a
          href={ctaHref}
          className="inline-flex items-center gap-2.5 bg-[var(--color-dtg-ink)] px-4 py-2.5 text-[13px] font-bold text-[var(--color-dtg-cream)] no-underline transition-colors hover:bg-black"
        >
          <span>{ctaLabel}</span>
          <span className="font-[family-name:var(--font-mono)]">→</span>
        </a>
      </div>
    </header>
  );
}
