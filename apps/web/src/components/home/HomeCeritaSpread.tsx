import { useTranslations } from "next-intl";
import {
  Accent,
  AsymmetricSectionHeader,
  DisplayHeadline,
  Italic,
  MonoLabel,
} from "@/components/editorial";

const NS = "home.editorial";

type Headline = { lead: string; italic?: string; accent?: string };
type Featured = { quote: string; name: string; role: string; year: string; imageAlt: string };
type Side = { name: string; role: string; quote: string };

export default function HomeCeritaSpread() {
  const t = useTranslations(NS);
  const tag = t("cerita.tag");
  const headline = t.raw("cerita.headline") as Headline;
  const featured = t.raw("cerita.featured") as Featured;
  const side = t.raw("cerita.side") as Side[];

  return (
    <section id="cerita" className="bg-white px-6 py-20 lg:px-14 lg:py-24">
      <div className="mx-auto max-w-[1440px]">
        <AsymmetricSectionHeader
          number="04"
          label={tag}
          headline={
            <DisplayHeadline size="section">
              {headline.lead}{" "}
              {headline.italic && <Italic>{headline.italic}</Italic>}{" "}
              {headline.accent && <Accent>{headline.accent}</Accent>}
            </DisplayHeadline>
          }
        />

        <div className="mt-12 grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
          {/* Featured pull-quote */}
          <figure className="border-y-2 border-[var(--color-dtg-ink)] bg-[var(--color-dtg-paper)] px-8 py-12 lg:px-14 lg:py-16">
            <MonoLabel className="block opacity-60">Cerita unggulan</MonoLabel>
            <blockquote className="mt-6 font-[family-name:var(--font-display)] text-[clamp(28px,3.6vw,52px)] font-extrabold leading-[1.12] tracking-[-0.03em] text-balance">
              <span className="text-[var(--color-dtg-red)]">“</span>
              {featured.quote}
              <span className="text-[var(--color-dtg-red)]">”</span>
            </blockquote>
            <figcaption className="mt-10 flex flex-wrap items-end justify-between gap-4 border-t border-[var(--color-dtg-ink)] pt-6">
              <div>
                <p className="font-[family-name:var(--font-display)] text-xl font-extrabold tracking-[-0.02em]">
                  {featured.name}
                </p>
                <MonoLabel className="mt-1 block opacity-70">{featured.role}</MonoLabel>
              </div>
              <MonoLabel className="opacity-60">{featured.year}</MonoLabel>
            </figcaption>
          </figure>

          {/* Side quotes stacked */}
          <div className="grid gap-px border border-[var(--color-dtg-ink)] bg-[var(--color-dtg-ink)]">
            {side.map((s, i) => (
              <div key={i} className="flex flex-col justify-between gap-5 bg-white p-6 lg:p-8">
                <p className="font-[family-name:var(--font-display)] text-[18px] font-extrabold leading-[1.25] tracking-[-0.02em] text-balance">
                  <span className="text-[var(--color-dtg-red)]">“</span>
                  {s.quote}
                  <span className="text-[var(--color-dtg-red)]">”</span>
                </p>
                <div className="flex items-baseline justify-between gap-3 border-t border-[color:rgba(26,26,26,0.15)] pt-3">
                  <span className="font-[family-name:var(--font-display)] text-sm font-extrabold tracking-[-0.02em]">
                    {s.name}
                  </span>
                  <MonoLabel className="text-right opacity-70">{s.role}</MonoLabel>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
