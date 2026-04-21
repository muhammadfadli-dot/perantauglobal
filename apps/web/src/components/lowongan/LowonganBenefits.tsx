"use client";

import { useTranslations } from "next-intl";
import { Accent, AsymmetricSectionHeader, DisplayHeadline, Italic } from "@/components/editorial";

interface Props {
  /** Role-level namespace, e.g. "lowongan.perawat-saudi-arabia". */
  namespace: string;
}

type Tile = { big: string; small: string; note: string };
type Headline = { lead: string; italic?: string; trail?: string };

export default function LowonganBenefits({ namespace }: Props) {
  const t = useTranslations(namespace);
  const tag = t("editorial.benefits.tag");
  const headline = t.raw("editorial.benefits.headline") as Headline;
  const body = t("editorial.benefits.body");
  const tiles = t.raw("editorial.benefits.tiles") as Tile[];

  return (
    <section id="benefits" className="bg-[var(--color-dtg-cream)] px-6 py-20 lg:px-14 lg:py-24">
      <div className="mx-auto max-w-[1440px]">
        <AsymmetricSectionHeader
          number="02"
          label={tag}
          headline={
            <DisplayHeadline size="section">
              {headline.lead}
              {headline.italic && (
                <>
                  <br />
                  <Accent>
                    <Italic>{headline.italic}</Italic>
                  </Accent>
                </>
              )}{" "}
              {headline.trail}
            </DisplayHeadline>
          }
          body={body}
        />

        <div className="mt-12 grid gap-px border border-[var(--color-dtg-ink)] bg-[var(--color-dtg-ink)] sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr]">
          {tiles.map((tile, i) => {
            const isHero = i === 0;
            return (
              <div
                key={i}
                className={
                  "relative flex flex-col justify-between gap-6 overflow-hidden " +
                  (isHero
                    ? "bg-[var(--color-dtg-red)] text-white p-10 lg:row-span-2"
                    : "bg-white text-[var(--color-dtg-ink)] p-8")
                }
              >
                <div className="font-[family-name:var(--font-mono)] text-[10px] font-bold uppercase tracking-[0.12em] opacity-70">
                  {String(i + 1).padStart(2, "0")} / {String(tiles.length).padStart(2, "0")}
                </div>
                <div>
                  <p
                    className={
                      "font-[family-name:var(--font-display)] font-extrabold leading-[0.92] tracking-[-0.05em] " +
                      (isHero ? "text-[clamp(56px,9vw,108px)]" : "text-[clamp(32px,4vw,48px)]")
                    }
                  >
                    {tile.big}
                  </p>
                  <p
                    className={
                      "mt-3 max-w-[24ch] leading-[1.4] opacity-90 " +
                      (isHero ? "text-lg" : "text-sm")
                    }
                  >
                    {tile.small}
                  </p>
                  <p className="mt-2 font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.08em] opacity-65">
                    {tile.note}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
