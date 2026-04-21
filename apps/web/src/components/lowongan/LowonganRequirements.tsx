"use client";

import { useTranslations } from "next-intl";
import { Accent, AsymmetricSectionHeader, DisplayHeadline, Italic } from "@/components/editorial";

interface Props {
  /** Role-level namespace, e.g. "lowongan.perawat-saudi-arabia". */
  namespace: string;
}

type Item = { key: string; value: string; note: string };
type Headline = { lead: string; italic?: string; accent?: string; trail?: string };

export default function LowonganRequirements({ namespace }: Props) {
  const t = useTranslations(namespace);
  const tag = t("editorial.requirements.tag");
  const headline = t.raw("editorial.requirements.headline") as Headline;
  const body = t("editorial.requirements.body");
  const items = t.raw("editorial.requirements.items") as Item[];

  return (
    <section
      id="requirements"
      className="bg-[var(--color-dtg-cream)] px-6 py-20 lg:px-14 lg:py-24"
    >
      <div className="mx-auto max-w-[1440px]">
        <AsymmetricSectionHeader
          number="04"
          label={tag}
          headline={
            <DisplayHeadline size="section">
              {headline.lead}
              {headline.italic && (
                <>
                  {" "}
                  <Accent>
                    <Italic>{headline.italic}</Italic>
                  </Accent>
                </>
              )}
              {headline.accent && (
                <>
                  {" "}
                  <Accent>
                    <Italic>{headline.accent}</Italic>
                  </Accent>
                </>
              )}
              {headline.trail && <> {headline.trail}</>}
            </DisplayHeadline>
          }
          body={body}
        />

        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, i) => (
            <div
              key={i}
              className="flex items-start gap-5 border-l border-t border-[var(--color-dtg-ink)] bg-white p-8 lg:[&:nth-child(3n+1)]:border-l [&:nth-last-child(-n+1)]:border-b sm:[&:nth-last-child(-n+2)]:border-b lg:[&:nth-last-child(-n+3)]:border-b [&:last-child]:border-r sm:[&:nth-child(2n)]:border-r lg:[&:nth-child(3n)]:border-r"
              style={{ minHeight: 220 }}
            >
              <div
                className="grid size-11 shrink-0 place-items-center border-2 border-[var(--color-dtg-red)] bg-[var(--color-dtg-cream)] font-[family-name:var(--font-mono)] text-xs font-extrabold tracking-[0.05em] text-[var(--color-dtg-red)]"
                style={{ transform: `rotate(${i % 2 === 0 ? -4 : 4}deg)` }}
              >
                OK
              </div>
              <div>
                <div className="font-[family-name:var(--font-mono)] text-[10px] font-bold uppercase tracking-[0.12em] opacity-60">
                  {item.key}
                </div>
                <p className="mt-1.5 font-[family-name:var(--font-display)] text-[22px] font-extrabold tracking-[-0.03em]">
                  {item.value}
                </p>
                <p className="mt-1.5 text-[13px] leading-[1.5] opacity-70">{item.note}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
