import { useTranslations } from "next-intl";
import {
  Accent,
  DisplayHeadline,
  EditorialButton,
  IllPlane,
  IllStamp,
  IllTicket,
  Italic,
  MetaStrip,
} from "@/components/editorial";

interface Props {
  namespace: string;
  scarcity: string;
  /** Headline: "Waktu | mulai | merantau." style */
  headline: { lead: string; italic?: string; trail?: string };
  ctaPrimary: string;
  ctaPrimaryHref?: string;
  ctaSecondary: string;
  ctaSecondaryHref?: string;
  stampLabel?: string;
  ticketRoute?: string;
  ticketLabel?: string;
  ticketGate?: string;
  ticketSeat?: string;
}

export default function ProgramFinalCTA({
  namespace,
  scarcity,
  headline,
  ctaPrimary,
  ctaPrimaryHref = "#form",
  ctaSecondary,
  ctaSecondaryHref = "https://wa.me/6285211415104",
  stampLabel = "APPLY",
  ticketRoute = "CGK → ∞",
  ticketLabel = "JAKARTA · 50+ NEGARA",
  ticketGate = "A1",
  ticketSeat = "LEAD",
}: Props) {
  const t = useTranslations(namespace);
  const body = t("subheadline");

  return (
    <section className="relative overflow-hidden bg-[var(--color-dtg-red)] text-white">
      <MetaStrip
        left="§ Next step"
        right={<span className="text-white">● {scarcity}</span>}
        tone="red"
        border="bottom"
        className="text-white"
      />
      <div className="mx-auto grid max-w-[1440px] lg:grid-cols-[1.3fr_1fr] lg:items-center lg:min-h-[420px]">
        <div className="flex flex-col gap-8 px-6 py-14 lg:px-14 lg:py-16">
          <DisplayHeadline size="poster">
            {headline.lead}
            {headline.italic && (
              <>
                <br />
                <Italic>{headline.italic}</Italic>
              </>
            )}
            {headline.trail && (
              <>
                <br />
                {headline.trail}
              </>
            )}
          </DisplayHeadline>
          <p className="max-w-[42ch] text-lg leading-[1.5] text-white/90">{body}</p>
          <div className="mt-2 flex flex-wrap gap-3">
            <EditorialButton href={ctaPrimaryHref} variant="ink" suffix="↓">
              {ctaPrimary}
            </EditorialButton>
            <EditorialButton
              href={ctaSecondaryHref}
              variant="cream"
              suffix="→"
              target="_blank"
              rel="noopener noreferrer"
            >
              {ctaSecondary}
            </EditorialButton>
          </div>
        </div>
        <div className="relative min-h-[260px] lg:min-h-[380px]">
          <div className="absolute left-6 top-10 rotate-[8deg]">
            <IllPlane size={150} />
          </div>
          <div className="absolute right-10 top-40 -rotate-[8deg]">
            <IllStamp size={120} label={stampLabel} />
          </div>
          <div className="absolute bottom-10 left-12 -rotate-[4deg]">
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
      <MetaStrip
        left="© 2026 Perantau Global · PT Daya Talenta Global"
        right="SIP No. KEP.1847/MEN/2019"
        tone="red"
        border="top"
        className="text-white opacity-90"
      />
    </section>
  );
}
