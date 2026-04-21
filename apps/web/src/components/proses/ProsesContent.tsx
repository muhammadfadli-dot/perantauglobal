"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Accent,
  AsymmetricSectionHeader,
  DisplayHeadline,
  EditorialButton,
  Italic,
  MetaStrip,
  MonoLabel,
  SectionTag,
} from "@/components/editorial";

type Step = { number: number; title: string; description: string };
type FaqItem = { question: string; answer: string };

export default function ProsesContent() {
  const t = useTranslations("process");
  const [openFaq, setOpenFaq] = useState(0);

  const steps: Step[] = Array.from({ length: 9 }, (_, i) => ({
    number: i + 1,
    title: t(`steps.step${i + 1}.title`),
    description: t(`steps.step${i + 1}.description`),
  }));

  const faqItems: FaqItem[] = Array.from({ length: 5 }, (_, i) => ({
    question: t(`faq.items.q${i + 1}.question`),
    answer: t(`faq.items.q${i + 1}.answer`),
  }));

  // Split 9 steps into 2 rows (5 + 4) for desktop magazine layout
  const row1 = steps.slice(0, 5);
  const row2 = steps.slice(5);

  return (
    <>
      {/* Editorial hero */}
      <section className="overflow-hidden border-b border-[var(--color-dtg-ink)] bg-[var(--color-dtg-cream)] text-[var(--color-dtg-ink)]">
        <MetaStrip
          left="§ Proses · 9 tahapan"
          right={<span className="text-[var(--color-dtg-red)]">● Total ±4 bulan · rata-rata</span>}
          tone="cream"
          border="bottom"
        />
        <div className="mx-auto max-w-[1440px] px-6 py-16 lg:px-14 lg:py-20 animate-[slideUp_0.6s_var(--ease-out-expo)]">
          <div className="flex items-center gap-3">
            <span className="block h-[2px] w-9 bg-[var(--color-dtg-red)]" />
            <MonoLabel className="text-[var(--color-dtg-red)] opacity-100" size="sm">
              Proses penempatan · transparan
            </MonoLabel>
          </div>
          <DisplayHeadline as="h1" size="hero" className="mt-6 max-w-[22ch]">
            Dari daftar,{" "}
            <Italic>ke hari</Italic>{" "}
            <Accent>keberangkatan.</Accent>
          </DisplayHeadline>
          <p className="mt-8 max-w-[58ch] text-[clamp(16px,1.6vw,20px)] leading-[1.5] opacity-80">
            {t("subtitle")}
          </p>
        </div>
      </section>

      {/* § 01 — Timeline 9 steps, magazine style (2 rows) */}
      <section className="bg-[var(--color-dtg-ink)] px-6 py-20 text-[var(--color-dtg-cream)] lg:px-14 lg:py-24 lg:pb-16">
        <div className="mx-auto max-w-[1440px]">
          <div className="grid gap-10 border-b border-[color:rgba(245,240,232,0.2)] pb-12 lg:grid-cols-2 lg:items-end">
            <div>
              <SectionTag number="01" label="9 tahapan" tone="cream" divider={false} />
              <DisplayHeadline size="section" className="mt-4">
                Setiap langkah,{" "}
                <Accent>dicatat</Accent>
                <br />
                dan diverifikasi.
              </DisplayHeadline>
            </div>
            <div className="lg:text-right">
              <MonoLabel className="opacity-60">Total durasi rata-rata</MonoLabel>
              <div className="mt-2 font-[family-name:var(--font-display)] text-[clamp(44px,7vw,72px)] font-extrabold leading-none tracking-[-0.05em] text-[var(--color-dtg-red)]">
                3–6 bulan
              </div>
              <p className="mt-3 max-w-[36ch] text-sm opacity-70 lg:ml-auto">
                {t("timelineNote")}
              </p>
            </div>
          </div>

          {/* Row 1: 5 steps */}
          <div className="grid lg:grid-cols-5">
            {row1.map((step, i) => (
              <StepTile key={step.number} step={step} last={i === row1.length - 1} />
            ))}
          </div>
          {/* Row 2: 4 steps (spans 5-col grid with 1 empty gap) */}
          <div className="mt-4 grid border-t border-[color:rgba(245,240,232,0.2)] lg:grid-cols-5">
            {row2.map((step, i) => (
              <StepTile key={step.number} step={step} last={i === row2.length - 1} />
            ))}
          </div>
        </div>
      </section>

      {/* § 02 — FAQ */}
      <section className="bg-white px-6 py-20 text-[var(--color-dtg-ink)] lg:px-14 lg:py-24">
        <div className="mx-auto grid max-w-[1440px] gap-10 lg:grid-cols-[340px_1fr] lg:gap-16">
          <aside>
            <SectionTag number="02" label="Tanya jawab" />
            <DisplayHeadline size="sidebar" className="mt-4">
              Pertanyaan yang{" "}
              <Italic>sering</Italic> muncul.
            </DisplayHeadline>
            <p className="mt-6 text-[15px] leading-[1.55] opacity-72">
              Masih ada yang ingin ditanya? Chat WhatsApp — rata-rata dibalas 11 menit.
            </p>
          </aside>
          <div>
            {faqItems.map((item, i) => {
              const isOpen = openFaq === i;
              return (
                <div
                  key={i}
                  className={
                    "border-b border-[color:rgba(26,26,26,0.15)] py-7 " +
                    (i === 0 ? "border-t border-[var(--color-dtg-ink)]" : "")
                  }
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? -1 : i)}
                    className="flex w-full items-baseline gap-5 text-left"
                    aria-expanded={isOpen}
                  >
                    <span className="font-[family-name:var(--font-display)] text-[clamp(32px,4vw,44px)] font-extrabold leading-[0.8] tracking-[-0.05em] text-[var(--color-dtg-red)]">
                      Q
                    </span>
                    <p className="flex-1 font-[family-name:var(--font-display)] text-[clamp(18px,2vw,24px)] font-extrabold leading-[1.2] tracking-[-0.03em]">
                      {item.question}
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
                      <p className="mt-4 max-w-[62ch] text-[15px] leading-[1.6] opacity-80" style={{ marginLeft: "clamp(44px, 5vw, 64px)" }}>
                        <span className="mr-2.5 font-bold opacity-100">A.</span>
                        {item.answer}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA poster */}
      <section className="relative overflow-hidden bg-[var(--color-dtg-red)] text-white">
        <MetaStrip
          left="§ Next step"
          right={<span className="text-white">● Siap mulai kapan saja</span>}
          tone="red"
          border="bottom"
          className="text-white"
        />
        <div className="mx-auto max-w-[1440px] px-6 py-14 lg:px-14 lg:py-20">
          <DisplayHeadline size="poster" className="max-w-[14ch]">
            Mulai dari{" "}
            <Italic>langkah</Italic> pertama.
          </DisplayHeadline>
          <p className="mt-6 max-w-[42ch] text-lg leading-[1.5] text-white/90">
            Daftarkan diri sekarang. Tim placement balas WhatsApp rata-rata 11 menit.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <EditorialButton href="/daftar" variant="ink" suffix="→">
              Daftar sekarang
            </EditorialButton>
            <EditorialButton href="https://wa.me/6285211415104" variant="cream" suffix="→" target="_blank" rel="noopener noreferrer">
              WhatsApp langsung
            </EditorialButton>
          </div>
        </div>
      </section>
    </>
  );
}

function StepTile({ step, last }: { step: Step; last: boolean }) {
  return (
    <div
      className={
        "py-8 lg:px-6 lg:py-10 lg:min-h-[280px] " +
        (last ? "" : "border-b border-[color:rgba(245,240,232,0.15)] lg:border-b-0 lg:border-r")
      }
    >
      <div className="font-[family-name:var(--font-display)] text-[clamp(56px,7vw,88px)] font-extrabold leading-none tracking-[-0.05em] text-[var(--color-dtg-red)]">
        {String(step.number).padStart(2, "0")}
      </div>
      <h3 className="mt-4 font-[family-name:var(--font-display)] text-xl font-extrabold tracking-[-0.02em]">
        {step.title}
      </h3>
      <p className="mt-3 text-sm leading-[1.55] opacity-75">{step.description}</p>
    </div>
  );
}
