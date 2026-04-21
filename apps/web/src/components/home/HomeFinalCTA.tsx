import { useTranslations } from "next-intl";
import { EditorialButton, IllPlane, IllStamp, IllTicket, MetaStrip } from "@/components/editorial";

const NS = "home.editorial";

type Headline = { lead: string; italic?: string; trail?: string };

export default function HomeFinalCTA() {
  const t = useTranslations(NS);
  const tag = t("finalCta.tag");
  const scarcity = t("finalCta.scarcity");
  const headline = t.raw("finalCta.headline") as Headline;
  const body = t("finalCta.body");
  const ctaPrimary = t("finalCta.ctaPrimary");
  const ctaPrimaryHref = t("finalCta.ctaPrimaryHref");
  const ctaSecondary = t("finalCta.ctaSecondary");
  const ctaSecondaryHref = t("finalCta.ctaSecondaryHref");
  const legalLeft = t("footer.legalLeft");
  const legalRight = t("footer.legalRight");

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

        <div className="relative min-h-[280px] lg:min-h-[400px]">
          <div className="absolute left-6 top-10 rotate-[8deg]">
            <IllPlane size={160} />
          </div>
          <div className="absolute right-10 top-44 -rotate-[8deg]">
            <IllStamp size={130} label="EDISI" />
          </div>
          <div className="absolute bottom-10 left-12 -rotate-[4deg]">
            <IllTicket
              size={240}
              routeCode="CGK → ∞"
              routeLabel="JAKARTA · 50+ NEGARA"
              gate="A1"
              seat="LEAD"
            />
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
