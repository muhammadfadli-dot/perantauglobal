"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  DisplayHeadline,
  Italic,
  SectionTag,
} from "@/components/editorial";

const FAQ_KEYS = ["cost", "gtr", "lpk", "duration", "who", "klob"] as const;

export default function GTHFAQ() {
  const t = useTranslations("program.gth.faq");
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className="bg-white px-6 py-20 text-[var(--color-dtg-ink)] lg:px-14 lg:py-24">
      <div className="mx-auto grid max-w-[1440px] gap-10 lg:grid-cols-[340px_1fr] lg:gap-16">
        <aside>
          <SectionTag number="06" label="Tanya jawab GTH" />
          <DisplayHeadline size="sidebar" className="mt-4">
            Pertanyaan yang{" "}
            <Italic>sering</Italic> muncul.
          </DisplayHeadline>
          <p className="mt-6 text-[15px] leading-[1.55] opacity-72">{t("subtitle")}</p>
        </aside>
        <div>
          {FAQ_KEYS.map((key, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={key}
                className={
                  "border-b border-[color:rgba(26,26,26,0.15)] py-6 " +
                  (i === 0 ? "border-t border-[var(--color-dtg-ink)]" : "")
                }
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? -1 : i)}
                  className="flex w-full items-baseline gap-5 text-left"
                  aria-expanded={isOpen}
                >
                  <span className="font-[family-name:var(--font-display)] text-[clamp(28px,3.5vw,44px)] font-extrabold leading-[0.8] tracking-[-0.05em] text-[var(--color-dtg-red)]">
                    Q
                  </span>
                  <p className="flex-1 font-[family-name:var(--font-display)] text-[clamp(17px,1.8vw,22px)] font-extrabold leading-[1.2] tracking-[-0.02em]">
                    {t(`items.${key}.question`)}
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
                    <p className="mt-4 max-w-[62ch] text-[15px] leading-[1.6] opacity-80" style={{ marginLeft: "clamp(40px, 4vw, 56px)" }}>
                      <span className="mr-2.5 font-bold opacity-100">A.</span>
                      {t(`items.${key}.answer`)}
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
