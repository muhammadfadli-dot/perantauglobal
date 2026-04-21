import { useTranslations } from "next-intl";
import {
  Accent,
  DisplayHeadline,
  SectionTag,
} from "@/components/editorial";

const STEPS = ["step1", "step2", "step3", "step4", "step5"] as const;

export default function SPGHowItWorks() {
  const t = useTranslations("program.spg.howItWorks");

  return (
    <section
      id="how-it-works"
      className="bg-[var(--color-dtg-ink)] px-6 py-20 text-[var(--color-dtg-cream)] lg:px-14 lg:py-24 lg:pb-16"
    >
      <div className="mx-auto max-w-[1440px]">
        <div className="grid gap-10 border-b border-[color:rgba(245,240,232,0.2)] pb-12 lg:grid-cols-2 lg:items-end">
          <div>
            <SectionTag number="03" label="Alur kerja SPG" tone="cream" divider={false} />
            <DisplayHeadline size="section" className="mt-4">
              Dari daftar{" "}
              <Accent>ke</Accent>
              <br />
              komisi pertama.
            </DisplayHeadline>
          </div>
          <p className="text-[17px] leading-[1.55] opacity-80 lg:max-w-[42ch] lg:justify-self-end lg:text-right">
            {t("subtitle")}
          </p>
        </div>

        <div className="grid lg:grid-cols-5">
          {STEPS.map((key, i) => (
            <div
              key={key}
              className={
                "py-8 lg:px-6 lg:py-10 lg:min-h-[300px] " +
                (i < STEPS.length - 1
                  ? "border-b border-[color:rgba(245,240,232,0.15)] lg:border-b-0 lg:border-r"
                  : "")
              }
            >
              <div className="font-[family-name:var(--font-display)] text-[clamp(56px,7vw,88px)] font-extrabold leading-none tracking-[-0.05em] text-[var(--color-dtg-red)]">
                {String(i + 1).padStart(2, "0")}
              </div>
              <h3 className="mt-4 font-[family-name:var(--font-display)] text-xl font-extrabold tracking-[-0.02em]">
                {t(`${key}.title`)}
              </h3>
              <p className="mt-3 text-sm leading-[1.55] opacity-75">
                {t(`${key}.description`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
