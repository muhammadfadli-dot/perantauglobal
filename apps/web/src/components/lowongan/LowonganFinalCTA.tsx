"use client";

import { useTranslations } from "next-intl";
import {
  EditorialButton,
  IllPlane,
  IllStamp,
  IllTicket,
  MetaStrip,
} from "@/components/editorial";

interface Props {
  /** Role-level namespace, e.g. "lowongan.perawat-saudi-arabia". */
  namespace: string;
  whatsappUrl?: string;
}

type Headline = { lead: string; italic?: string; trail?: string };

export default function LowonganFinalCTA({
  namespace,
  whatsappUrl = "https://wa.me/6285211415104",
}: Props) {
  const t = useTranslations(namespace);
  const tag = t("editorial.finalCta.tag");
  const scarcity = t("editorial.finalCta.scarcity");
  const headline = t.raw("editorial.finalCta.headline") as Headline;
  const body = t("editorial.finalCta.body");
  const ctaPrimary = t("editorial.finalCta.ctaPrimary");
  const ctaSecondary = t("editorial.finalCta.ctaSecondary");
  const legalLeft = t("editorial.footer.legalLeft");
  const legalRight = t("editorial.footer.legalRight");
  const ticket = t.raw("editorial.hero.ticket") as {
    routeCode: string;
    routeLabel: string;
    gate: string;
    seat: string;
  };

  return (
    <section className="relative overflow-hidden bg-[var(--color-dtg-red)] text-white">
      <MetaStrip
        left={`§ ${tag}`}
        right={
          <>
            <span className="text-white">●</span> {scarcity}
          </>
        }
        tone="red"
        border="bottom"
        className="text-white"
      />

      <div className="mx-auto grid max-w-[1440px] lg:grid-cols-[1.3fr_1fr] lg:items-center lg:min-h-[480px]">
        <div className="flex flex-col gap-8 px-6 py-14 lg:px-14 lg:py-16">
          <h2 className="font-[family-name:var(--font-display)] text-[clamp(56px,10vw,144px)] font-extrabold leading-[0.88] tracking-[-0.05em] text-balance">
            {headline.lead}
            {headline.italic && (
              <>
                <br />
                <span className="italic font-medium">{headline.italic}</span>
              </>
            )}
            {headline.trail && (
              <>
                <br />
                {headline.trail}
              </>
            )}
          </h2>
          <p className="max-w-[36ch] text-lg leading-[1.5] text-white/90">{body}</p>
          <div className="mt-2 flex flex-wrap gap-3">
            <EditorialButton href="#form" variant="ink" suffix="↑">
              {ctaPrimary}
            </EditorialButton>
            <EditorialButton href={whatsappUrl} variant="cream" suffix="→" target="_blank" rel="noopener noreferrer">
              {ctaSecondary}
            </EditorialButton>
          </div>
        </div>

        <div className="relative min-h-[280px] lg:min-h-[400px]">
          <div className="absolute left-6 top-10 rotate-[8deg]">
            <IllPlane size={160} />
          </div>
          <div className="absolute right-10 top-44 -rotate-[8deg]">
            <IllStamp size={130} label="APPLY" />
          </div>
          <div className="absolute bottom-10 left-12 -rotate-[4deg]">
            <IllTicket size={240} {...ticket} />
          </div>
        </div>
      </div>

      <MetaStrip
        left={legalLeft + " · PT Daya Talenta Global"}
        right={legalRight}
        tone="red"
        border="top"
        className="text-white opacity-90"
      />
    </section>
  );
}
