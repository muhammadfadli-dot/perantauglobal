import { useTranslations } from "next-intl";
import {
  Accent,
  AsymmetricSectionHeader,
  DisplayHeadline,
  Italic,
} from "@/components/editorial";

const BENEFITS = ["free", "commission", "flexible", "trusted", "impact", "community"] as const;

export default function ProgramBenefits() {
  const t = useTranslations("program.spg.benefits");

  return (
    <section className="bg-[var(--color-dtg-cream)] px-6 py-20 text-[var(--color-dtg-ink)] lg:px-14 lg:py-24">
      <div className="mx-auto max-w-[1440px]">
        <AsymmetricSectionHeader
          number="06"
          label="Keuntungan jadi SPG"
          headline={
            <DisplayHeadline size="section">
              Komisi bukan{" "}
              <Italic>satu-satunya</Italic>{" "}
              <Accent>yang dapat.</Accent>
            </DisplayHeadline>
          }
          body={t("subtitle")}
        />

        <div className="mt-12 grid gap-px border border-[var(--color-dtg-ink)] bg-[var(--color-dtg-ink)] sm:grid-cols-2 lg:grid-cols-3">
          {BENEFITS.map((key, i) => (
            <div key={key} className="bg-white p-8 lg:p-10">
              <div className="font-[family-name:var(--font-mono)] text-[10px] font-bold uppercase tracking-[0.12em] opacity-70">
                {String(i + 1).padStart(2, "0")} / 06
              </div>
              <h3 className="mt-6 font-[family-name:var(--font-display)] text-[clamp(20px,2vw,26px)] font-extrabold leading-[1.15] tracking-[-0.02em]">
                {t(`${key}.title`)}
              </h3>
              <p className="mt-3 text-[14px] leading-[1.55] opacity-75">
                {t(`${key}.description`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
