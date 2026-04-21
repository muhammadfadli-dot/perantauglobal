"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { DisplayHeadline, Italic, SectionTag } from "@/components/editorial";

interface Props {
  /** Role-level namespace, e.g. "lowongan.perawat-saudi-arabia". */
  namespace: string;
}

type Item = { q: string; a: string };
type Headline = { lead: string; italic?: string };

export default function LowonganFAQ({ namespace }: Props) {
  const t = useTranslations(namespace);
  const tag = t("editorial.faq.tag");
  const headline = t.raw("editorial.faq.headline") as Headline;
  const footnote = t("editorial.faq.footnote");
  const items = t.raw("editorial.faq.items") as Item[];

  const [open, setOpen] = useState<number>(0);

  return (
    <section id="faq" className="bg-white px-6 py-20 lg:px-14 lg:py-24">
      <div className="mx-auto grid max-w-[1440px] gap-10 lg:grid-cols-[340px_1fr] lg:gap-16">
        <aside>
          <SectionTag number="05" label={tag} />
          <DisplayHeadline size="sidebar" className="mt-4">
            {headline.lead}{" "}
            {headline.italic && <Italic>{headline.italic}</Italic>}
          </DisplayHeadline>
          <p className="mt-6 text-[15px] leading-[1.55] opacity-72">{footnote}</p>
        </aside>

        <div>
          {items.map((item, i) => {
            const isOpen = open === i;
            return (
              <div
                key={i}
                className={
                  "border-b border-[color:rgba(26,26,26,0.15)] py-7 " +
                  (i === 0 ? "border-t border-[var(--color-dtg-ink)]" : "")
                }
              >
                <button
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  className="flex w-full items-baseline gap-5 text-left"
                  aria-expanded={isOpen}
                >
                  <span className="font-[family-name:var(--font-display)] text-[clamp(36px,5vw,52px)] font-extrabold leading-[0.8] tracking-[-0.05em] text-[var(--color-dtg-red)]">
                    Q
                  </span>
                  <p className="flex-1 font-[family-name:var(--font-display)] text-[clamp(19px,2.4vw,28px)] font-extrabold leading-[1.15] tracking-[-0.03em]">
                    {item.q}
                  </p>
                  <span
                    className={
                      "font-[family-name:var(--font-mono)] text-xl opacity-50 transition-transform duration-200 " +
                      (isOpen ? "rotate-45" : "")
                    }
                  >
                    +
                  </span>
                </button>
                <div
                  className="grid transition-[grid-template-rows] duration-300 ease-[var(--ease-out-expo)]"
                  style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                >
                  <div className="overflow-hidden">
                    <p
                      className="mt-4 max-w-[62ch] text-[16px] leading-[1.6] opacity-80"
                      style={{ marginLeft: "clamp(44px, 6vw, 72px)" }}
                    >
                      <span className="mr-2.5 font-bold opacity-100">A.</span>
                      {item.a}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
