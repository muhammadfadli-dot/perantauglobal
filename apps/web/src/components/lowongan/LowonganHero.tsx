"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { EditorialButton, IllStamp, IllTicket, MetaStrip } from "@/components/editorial";

interface Props {
  /** Role-level namespace, e.g. "lowongan.perawat-saudi-arabia". */
  namespace: string;
  imageSrc: string;
}

type MetaCell = { label: string; value: string; sub: string };
type Headline = { lead: string; italic?: string; accent?: string; trail?: string };
type TicketCfg = { routeCode: string; routeLabel: string; gate: string; seat: string };

export default function LowonganHero({ namespace, imageSrc }: Props) {
  const t = useTranslations(namespace);
  const heroAlt = t("heroImageAlt");

  const meta = t.raw("editorial.meta") as { serial: string; live: string; responseTime: string };
  const hero = t.raw("editorial.hero") as {
    tag: string;
    headline: Headline;
    body: string;
    ctaPrimary: string;
    ctaSecondary: string;
    responseTimeLabel: string;
    metaBar: MetaCell[];
    ticket: TicketCfg;
    stampLabel: string;
  };

  return (
    <section
      id="top"
      className="overflow-hidden border-b border-[var(--color-dtg-ink)] bg-[var(--color-dtg-cream)] text-[var(--color-dtg-ink)]"
    >
      <MetaStrip
        left={meta.serial}
        right={
          <span className="text-[var(--color-dtg-red)]">● {meta.live}</span>
        }
        tone="cream"
        border="bottom"
      />

      <div className="mx-auto grid max-w-[1440px] lg:grid-cols-[1.1fr_1fr] lg:min-h-[640px]">
        {/* LEFT: type column */}
        <div className="flex flex-col justify-center gap-6 px-6 py-12 lg:px-14 lg:py-16 animate-[slideUp_0.6s_var(--ease-out-expo)]">
          <div className="flex items-center gap-3">
            <span className="block h-[2px] w-9 bg-[var(--color-dtg-red)]" />
            <span className="font-[family-name:var(--font-mono)] text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--color-dtg-red)]">
              {hero.tag}
            </span>
          </div>

          <h1 className="font-[family-name:var(--font-display)] text-[clamp(48px,8.5vw,112px)] font-extrabold leading-[1.02] tracking-[-0.04em] text-balance">
            {hero.headline.lead}
            {hero.headline.italic && (
              <>
                <br />
                <span className="italic font-medium">{hero.headline.italic}</span>{" "}
              </>
            )}
            {hero.headline.accent && (
              <span className="text-[var(--color-dtg-red)]">{hero.headline.accent}</span>
            )}
            {hero.headline.trail && <> {hero.headline.trail}</>}
          </h1>

          <p className="max-w-[38ch] text-[clamp(16px,2vw,21px)] leading-[1.5] opacity-80">{hero.body}</p>

          <div className="mt-2 flex flex-wrap items-center gap-4">
            <EditorialButton href="#form" variant="ink" suffix="→">
              {hero.ctaPrimary}
            </EditorialButton>
            <EditorialButton href="#info" variant="outline" suffix="↓">
              {hero.ctaSecondary}
            </EditorialButton>
            <div className="ml-auto text-right">
              <div className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.1em] opacity-60">
                {hero.responseTimeLabel}
              </div>
              <div className="font-[family-name:var(--font-display)] text-[22px] font-extrabold tracking-[-0.03em] text-[var(--color-dtg-red)]">
                {meta.responseTime}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: photo + collage */}
        <div className="relative min-h-[360px] bg-[var(--color-dtg-ink)]">
          <Image
            src={imageSrc}
            alt={heroAlt}
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
            priority
          />
          <div className="pointer-events-none absolute right-6 top-6 rotate-[6deg] lg:right-10 lg:top-10">
            <IllStamp size={140} label={hero.stampLabel} />
          </div>
          <div className="pointer-events-none absolute bottom-5 left-5 -rotate-4 lg:bottom-10 lg:left-10">
            <IllTicket size={240} {...hero.ticket} />
          </div>
        </div>
      </div>

      {/* Bottom 4-col data bar */}
      <div className="mx-auto grid max-w-[1440px] grid-cols-2 border-t border-[var(--color-dtg-ink)] lg:grid-cols-4">
        {hero.metaBar.map((cell, i) => (
          <div
            key={i}
            className={
              "px-6 py-5 lg:px-8 " +
              (i > 0 ? "border-l border-[color:rgba(26,26,26,0.15)]" : "")
            }
          >
            <p className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.14em] opacity-60">
              {cell.label}
            </p>
            <p className="mt-1.5 font-[family-name:var(--font-display)] text-[clamp(20px,2.2vw,28px)] font-extrabold tracking-[-0.03em]">
              {cell.value}
            </p>
            <p className="mt-0.5 text-xs opacity-60">{cell.sub}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
