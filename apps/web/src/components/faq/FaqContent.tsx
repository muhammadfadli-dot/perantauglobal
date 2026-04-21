"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Accent,
  DisplayHeadline,
  EditorialButton,
  Italic,
  MetaStrip,
  MonoLabel,
  SectionTag,
} from "@/components/editorial";

const CATEGORIES = ["general", "cost", "requirements", "process", "abroad"] as const;
type Cat = (typeof CATEGORIES)[number];
const CATEGORY_QUESTIONS: Record<Cat, string[]> = {
  general: ["q1", "q2", "q3"],
  cost: ["q1", "q2"],
  requirements: ["q1", "q2", "q3"],
  process: ["q1", "q2", "q3"],
  abroad: ["q1", "q2", "q3"],
};

const CATEGORY_NUMBERS: Record<Cat, string> = {
  general: "01",
  cost: "02",
  requirements: "03",
  process: "04",
  abroad: "05",
};

export default function FaqContent() {
  const t = useTranslations("faq");
  const [openKey, setOpenKey] = useState<string>("general:q1");

  return (
    <>
      {/* Editorial hero */}
      <section className="overflow-hidden border-b border-[var(--color-dtg-ink)] bg-[var(--color-dtg-cream)] text-[var(--color-dtg-ink)]">
        <MetaStrip
          left="§ FAQ · Pertanyaan umum"
          right={<span className="text-[var(--color-dtg-red)]">● Chat WA · dibalas 11 menit</span>}
          tone="cream"
          border="bottom"
        />
        <div className="mx-auto max-w-[1440px] px-6 py-16 lg:px-14 lg:py-20 animate-[slideUp_0.6s_var(--ease-out-expo)]">
          <div className="flex items-center gap-3">
            <span className="block h-[2px] w-9 bg-[var(--color-dtg-red)]" />
            <MonoLabel className="text-[var(--color-dtg-red)] opacity-100" size="sm">
              Tanya jawab · Perantau Global
            </MonoLabel>
          </div>
          <DisplayHeadline as="h1" size="hero" className="mt-6 max-w-[20ch]">
            Jawaban,{" "}
            <Italic>hitam di atas</Italic>{" "}
            <Accent>putih.</Accent>
          </DisplayHeadline>
          <p className="mt-8 max-w-[58ch] text-[clamp(16px,1.6vw,20px)] leading-[1.5] opacity-80">
            {t("subtitle")}
          </p>
        </div>
      </section>

      {/* Categories, each as its own § section with accordion */}
      {CATEGORIES.map((cat) => {
        const qs = CATEGORY_QUESTIONS[cat];
        return (
          <section
            key={cat}
            className={
              "px-6 py-16 text-[var(--color-dtg-ink)] lg:px-14 lg:py-20 " +
              (CATEGORIES.indexOf(cat) % 2 === 0 ? "bg-white" : "bg-[var(--color-dtg-cream)]")
            }
          >
            <div className="mx-auto grid max-w-[1440px] gap-10 lg:grid-cols-[340px_1fr] lg:gap-16">
              <aside>
                <SectionTag number={CATEGORY_NUMBERS[cat]} label={t(`categories.${cat}.title`)} />
                <DisplayHeadline size="sidebar" className="mt-4">
                  {t(`categories.${cat}.title`)}
                </DisplayHeadline>
                <p className="mt-6 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.12em] opacity-60">
                  {qs.length} pertanyaan
                </p>
              </aside>
              <div>
                {qs.map((qKey) => {
                  const itemKey = `${cat}:${qKey}`;
                  const isOpen = openKey === itemKey;
                  return (
                    <div
                      key={qKey}
                      className={
                        "border-b border-[color:rgba(26,26,26,0.15)] py-6 first:border-t first:border-[var(--color-dtg-ink)]"
                      }
                    >
                      <button
                        onClick={() => setOpenKey(isOpen ? "" : itemKey)}
                        className="flex w-full items-baseline gap-5 text-left"
                        aria-expanded={isOpen}
                      >
                        <span className="font-[family-name:var(--font-display)] text-[clamp(28px,3.5vw,44px)] font-extrabold leading-[0.8] tracking-[-0.05em] text-[var(--color-dtg-red)]">
                          Q
                        </span>
                        <p className="flex-1 font-[family-name:var(--font-display)] text-[clamp(17px,1.8vw,22px)] font-extrabold leading-[1.2] tracking-[-0.02em]">
                          {t(`categories.${cat}.items.${qKey}.question`)}
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
                            {t(`categories.${cat}.items.${qKey}.answer`)}
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
      })}

      {/* CTA poster */}
      <section className="relative overflow-hidden bg-[var(--color-dtg-red)] text-white">
        <MetaStrip
          left="§ Masih ada pertanyaan?"
          right={<span className="text-white">● Chat WA · dibalas 11 menit</span>}
          tone="red"
          border="bottom"
          className="text-white"
        />
        <div className="mx-auto max-w-[1440px] px-6 py-14 lg:px-14 lg:py-20">
          <DisplayHeadline size="poster" className="max-w-[14ch]">
            Tanya{" "}
            <Italic>apa</Italic> aja.
          </DisplayHeadline>
          <p className="mt-6 max-w-[42ch] text-lg leading-[1.5] text-white/90">
            Tim kami siap jawab apapun — dari biaya, proses, sampai kontrak. Chat WhatsApp, dibalas rata-rata 11 menit.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <EditorialButton href="https://wa.me/6285211415104" variant="ink" suffix="→" target="_blank" rel="noopener noreferrer">
              WhatsApp langsung
            </EditorialButton>
            <EditorialButton href="/daftar" variant="cream" suffix="→">
              Daftar sekarang
            </EditorialButton>
          </div>
        </div>
      </section>
    </>
  );
}
