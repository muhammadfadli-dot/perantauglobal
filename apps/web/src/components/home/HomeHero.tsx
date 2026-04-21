import Image from "next/image";
import { useTranslations } from "next-intl";
import { EditorialButton, IllStamp, IllTicket, MetaStrip } from "@/components/editorial";

const NS = "home.editorial";

type Headline = { lead: string; italic?: string; accent?: string; trail?: string };
type MetaCell = { label: string; value: string; sub: string };

export default function HomeHero() {
  const t = useTranslations(NS);
  const hero = t.raw("hero") as {
    kicker: string;
    tag: string;
    headline: Headline;
    body: string;
    ctaPrimary: string;
    ctaPrimaryHref: string;
    ctaSecondary: string;
    ctaSecondaryHref: string;
    imageAlt: string;
    responseTimeLabel: string;
    responseTime: string;
    metaBar: MetaCell[];
  };

  return (
    <section
      id="top"
      className="overflow-hidden border-b border-[var(--color-dtg-ink)] bg-[var(--color-dtg-cream)] text-[var(--color-dtg-ink)]"
    >
      <MetaStrip
        left={hero.kicker}
        right={<span>{hero.tag}</span>}
        tone="cream"
        border="bottom"
      />

      <div className="mx-auto grid max-w-[1440px] lg:grid-cols-[1.1fr_1fr] lg:min-h-[640px]">
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

          <p className="max-w-[42ch] text-[clamp(16px,2vw,21px)] leading-[1.5] opacity-80">{hero.body}</p>

          <div className="mt-2 flex flex-wrap items-center gap-4">
            <EditorialButton href={hero.ctaPrimaryHref} variant="ink" suffix="→">
              {hero.ctaPrimary}
            </EditorialButton>
            <EditorialButton href={hero.ctaSecondaryHref} variant="outline" suffix="↓">
              {hero.ctaSecondary}
            </EditorialButton>
            <div className="ml-auto text-right">
              <div className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.1em] opacity-60">
                {hero.responseTimeLabel}
              </div>
              <div className="font-[family-name:var(--font-display)] text-[22px] font-extrabold tracking-[-0.03em] text-[var(--color-dtg-red)]">
                {hero.responseTime}
              </div>
            </div>
          </div>
        </div>

        <div className="relative min-h-[360px] bg-[var(--color-dtg-ink)]">
          <Image
            src="/images/home-hero.jpg"
            alt={hero.imageAlt}
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
            priority
          />
          <div className="pointer-events-none absolute right-6 top-6 rotate-[6deg] lg:right-10 lg:top-10">
            <IllStamp size={140} label="EDITION" />
          </div>
          <div className="pointer-events-none absolute bottom-5 left-5 -rotate-4 lg:bottom-10 lg:left-10">
            <IllTicket size={240} routeCode="CGK → ∞" routeLabel="JAKARTA · 50+ NEGARA" gate="A1" seat="LEAD" />
          </div>
        </div>
      </div>

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
