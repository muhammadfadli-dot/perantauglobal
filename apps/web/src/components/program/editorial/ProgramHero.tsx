import Image from "next/image";
import { useTranslations } from "next-intl";
import {
  Accent,
  DisplayHeadline,
  EditorialButton,
  IllStamp,
  IllTicket,
  Italic,
  MetaStrip,
  MonoLabel,
} from "@/components/editorial";

interface Props {
  namespace: string;
  imageSrc: string;
  /** Mono meta tag above headline, e.g. "Program · SPG · partner lapangan" */
  kicker: string;
  /** Left word in headline, e.g. "Partner lapangan," */
  lead: string;
  /** Optional italic middle word */
  italic?: string;
  /** Optional red accent final word */
  accent?: string;
  /** Serial number for meta strip */
  serial: string;
  /** Live label right side of meta strip */
  liveLabel: string;
  /** Primary CTA href (typically #form) */
  ctaPrimaryHref?: string;
  /** Primary CTA text override */
  ctaPrimaryText?: string;
  /** Secondary CTA href */
  ctaSecondaryHref?: string;
  /** Stamp label on photo */
  stampLabel: string;
  /** Boarding-pass route code */
  ticketRoute: string;
  /** Boarding-pass route label */
  ticketLabel: string;
  /** Boarding-pass gate */
  ticketGate: string;
  /** Boarding-pass seat */
  ticketSeat: string;
  /** Bottom meta bar (4 cells) */
  metaBar?: Array<{ label: string; value: string; sub: string }>;
}

export default function ProgramHero({
  namespace,
  imageSrc,
  kicker,
  lead,
  italic,
  accent,
  serial,
  liveLabel,
  ctaPrimaryHref = "#form",
  ctaPrimaryText,
  ctaSecondaryHref = "#about",
  stampLabel,
  ticketRoute,
  ticketLabel,
  ticketGate,
  ticketSeat,
  metaBar,
}: Props) {
  const t = useTranslations(namespace);
  const body = t("subheadline");
  const cta = ctaPrimaryText ?? t("cta");
  const ctaSecondary = t("ctaSecondary");
  const imageAlt = t("heroImageAlt");

  return (
    <section
      id="top"
      className="overflow-hidden border-b border-[var(--color-dtg-ink)] bg-[var(--color-dtg-cream)] text-[var(--color-dtg-ink)]"
    >
      <MetaStrip
        left={serial}
        right={<span className="text-[var(--color-dtg-red)]">● {liveLabel}</span>}
        tone="cream"
        border="bottom"
      />

      <div className="mx-auto grid max-w-[1440px] lg:grid-cols-[1.1fr_1fr] lg:min-h-[620px]">
        <div className="flex flex-col justify-center gap-6 px-6 py-12 lg:px-14 lg:py-16 animate-[slideUp_0.6s_var(--ease-out-expo)]">
          <div className="flex items-center gap-3">
            <span className="block h-[2px] w-9 bg-[var(--color-dtg-red)]" />
            <MonoLabel className="text-[var(--color-dtg-red)] opacity-100" size="sm">
              {kicker}
            </MonoLabel>
          </div>

          <DisplayHeadline as="h1" size="hero" className="max-w-[18ch]">
            {lead}
            {italic && (
              <>
                <br />
                <Italic>{italic}</Italic>{" "}
              </>
            )}
            {accent && <Accent>{accent}</Accent>}
          </DisplayHeadline>

          <p className="max-w-[42ch] text-[clamp(16px,2vw,21px)] leading-[1.5] opacity-80">{body}</p>

          <div className="mt-2 flex flex-wrap items-center gap-4">
            <EditorialButton href={ctaPrimaryHref} variant="ink" suffix="→">
              {cta}
            </EditorialButton>
            <EditorialButton href={ctaSecondaryHref} variant="outline" suffix="↓">
              {ctaSecondary}
            </EditorialButton>
          </div>
        </div>

        <div className="relative min-h-[340px] bg-[var(--color-dtg-ink)]">
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
            priority
          />
          <div className="pointer-events-none absolute right-6 top-6 rotate-[6deg] lg:right-10 lg:top-10">
            <IllStamp size={130} label={stampLabel} />
          </div>
          <div className="pointer-events-none absolute bottom-5 left-5 -rotate-4 lg:bottom-10 lg:left-10">
            <IllTicket
              size={220}
              routeCode={ticketRoute}
              routeLabel={ticketLabel}
              gate={ticketGate}
              seat={ticketSeat}
            />
          </div>
        </div>
      </div>

      {metaBar && metaBar.length > 0 && (
        <div className="mx-auto grid max-w-[1440px] grid-cols-2 border-t border-[var(--color-dtg-ink)] lg:grid-cols-4">
          {metaBar.map((cell, i) => (
            <div
              key={i}
              className={
                "px-6 py-5 lg:px-8 " +
                (i > 0 ? "border-l border-[color:rgba(26,26,26,0.15)]" : "")
              }
            >
              <MonoLabel className="opacity-60" size="xs">
                {cell.label}
              </MonoLabel>
              <p className="mt-1.5 font-[family-name:var(--font-display)] text-[clamp(20px,2.2vw,28px)] font-extrabold tracking-[-0.03em]">
                {cell.value}
              </p>
              <p className="mt-0.5 text-xs opacity-60">{cell.sub}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
