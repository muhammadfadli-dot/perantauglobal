"use client";

import { useTranslations } from "next-intl";
import { Accent, DisplayHeadline, SectionTag } from "@/components/editorial";

interface Props {
  /** Role-level namespace, e.g. "lowongan.perawat-saudi-arabia". */
  namespace: string;
}

type Step = { title: string; meta: string; detail: string };
type Headline = { lead: string; accent?: string; trail?: string };

export default function LowonganProcess({ namespace }: Props) {
  const t = useTranslations(namespace);
  const tag = t("editorial.process.tag");
  const headline = t.raw("editorial.process.headline") as Headline;
  const totalDurationLabel = t("editorial.process.totalDurationLabel");
  const totalDuration = t("editorial.process.totalDuration");
  const steps = t.raw("editorial.process.steps") as Step[];

  return (
    <section
      id="process"
      className="bg-[var(--color-dtg-ink)] px-6 py-20 text-[var(--color-dtg-cream)] lg:px-14 lg:py-24 lg:pb-16"
    >
      <div className="mx-auto max-w-[1440px]">
        <div className="grid gap-10 border-b border-[color:rgba(245,240,232,0.2)] pb-12 lg:grid-cols-2 lg:items-end">
          <div>
            <SectionTag number="03" label={tag} tone="cream" divider={false} />
            <DisplayHeadline size="section" className="mt-4">
              {headline.lead}{" "}
              {headline.accent && <Accent>{headline.accent}</Accent>}
              {headline.trail && (
                <>
                  <br />
                  {headline.trail}
                </>
              )}
            </DisplayHeadline>
          </div>
          <div className="lg:text-right">
            <div className="font-[family-name:var(--font-mono)] text-[11px] font-bold uppercase tracking-[0.15em] opacity-60">
              {totalDurationLabel}
            </div>
            <div className="mt-2 font-[family-name:var(--font-display)] text-[clamp(44px,7vw,72px)] font-extrabold leading-none tracking-[-0.05em] text-[var(--color-dtg-red)]">
              {totalDuration}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-5">
          {steps.map((step, i) => (
            <div
              key={i}
              className={
                "py-8 lg:px-6 lg:py-10 lg:min-h-[320px] " +
                (i < steps.length - 1
                  ? "border-b border-[color:rgba(245,240,232,0.15)] lg:border-b-0 lg:border-r"
                  : "")
              }
            >
              <div className="font-[family-name:var(--font-display)] text-[clamp(64px,8vw,96px)] font-extrabold leading-none tracking-[-0.05em] text-[var(--color-dtg-red)]">
                {String(i + 1).padStart(2, "0")}
              </div>
              <div className="mt-4">
                <h3 className="font-[family-name:var(--font-display)] text-2xl font-extrabold tracking-[-0.03em]">
                  {step.title}
                </h3>
                <div className="mt-1.5 font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.1em] opacity-60">
                  {step.meta}
                </div>
              </div>
              <p className="mt-3.5 text-sm leading-[1.55] opacity-75">{step.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
