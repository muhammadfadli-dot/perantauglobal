import { useTranslations } from "next-intl";
import { AsymmetricSectionHeader, DisplayHeadline, Italic } from "@/components/editorial";

const NS = "home.editorial";

type Headline = { lead: string; italic?: string; trail?: string };
type Row = { country: string; flag: string; openings: string; industries: string; slots: string };

export default function HomeDestinasiAtlas() {
  const t = useTranslations(NS);
  const tag = t("atlas.tag");
  const headline = t.raw("atlas.headline") as Headline;
  const body = t("atlas.body");
  const rows = t.raw("atlas.rows") as Row[];

  return (
    <section id="atlas" className="bg-white px-6 py-20 lg:px-14 lg:py-24">
      <div className="mx-auto max-w-[1440px]">
        <AsymmetricSectionHeader
          number="02"
          label={tag}
          headline={
            <DisplayHeadline size="section">
              {headline.lead}{" "}
              {headline.italic && <Italic>{headline.italic}</Italic>}{" "}
              {headline.trail}
            </DisplayHeadline>
          }
          body={body}
        />

        <div className="mt-12 border-t border-[var(--color-dtg-ink)]">
          {rows.map((row, i) => (
            <div
              key={i}
              className="grid gap-4 border-b border-[color:rgba(26,26,26,0.15)] py-6 sm:grid-cols-[64px_1fr_1fr] sm:items-baseline sm:gap-8 lg:grid-cols-[80px_1.2fr_2fr_1fr] lg:gap-12"
            >
              <div className="grid h-12 w-12 place-items-center border-2 border-[var(--color-dtg-ink)] bg-[var(--color-dtg-cream)] font-[family-name:var(--font-mono)] text-[10px] font-extrabold uppercase tracking-[0.08em]">
                {row.flag}
              </div>
              <div>
                <div className="font-[family-name:var(--font-mono)] text-[10px] font-bold uppercase tracking-[0.12em] opacity-60">
                  Negara
                </div>
                <p className="mt-1.5 font-[family-name:var(--font-display)] text-[clamp(24px,2.6vw,36px)] font-extrabold tracking-[-0.03em]">
                  {row.country}
                </p>
              </div>
              <div>
                <div className="font-[family-name:var(--font-mono)] text-[10px] font-bold uppercase tracking-[0.12em] opacity-60">
                  Industri
                </div>
                <p className="mt-1.5 text-[15px] leading-[1.5] opacity-80">{row.industries}</p>
              </div>
              <div className="lg:text-right">
                <div className="font-[family-name:var(--font-mono)] text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--color-dtg-red)]">
                  {row.openings}
                </div>
                <p className="mt-1.5 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.08em] opacity-70">
                  {row.slots}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
