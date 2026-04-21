import { useTranslations } from "next-intl";
import {
  Accent,
  AsymmetricSectionHeader,
  DisplayHeadline,
  Italic,
  MonoLabel,
} from "@/components/editorial";

const STEP_KEYS = ["step1", "step2", "step3", "step4", "step5"] as const;

export default function GTHJourney() {
  const t = useTranslations("program.gth.journey");

  return (
    <section className="bg-white px-6 py-20 text-[var(--color-dtg-ink)] lg:px-14 lg:py-24">
      <div className="mx-auto max-w-[1440px]">
        <AsymmetricSectionHeader
          number="03"
          label={t("label")}
          headline={
            <DisplayHeadline size="section">
              Dua jalur,{" "}
              <Italic>satu</Italic>{" "}
              <Accent>sertifikat GTR.</Accent>
            </DisplayHeadline>
          }
          body={t("subtitle")}
        />

        <div className="mt-12 grid gap-px border border-[var(--color-dtg-ink)] bg-[var(--color-dtg-ink)] lg:grid-cols-2">
          {/* Path A */}
          <div className="flex flex-col gap-6 bg-[var(--color-dtg-paper)] p-10 lg:p-14">
            <div className="flex flex-wrap items-baseline gap-3">
              <MonoLabel className="opacity-60" size="xs">Jalur A</MonoLabel>
              <span className="border border-[var(--color-dtg-red)] bg-[var(--color-dtg-red)] px-2 py-0.5 font-[family-name:var(--font-mono)] text-[10px] font-bold uppercase tracking-[0.1em] text-white">
                {t("pathA.badge")}
              </span>
            </div>
            <DisplayHeadline size="sidebar" as="h3">
              {t("pathA.title")}
            </DisplayHeadline>
            <ol className="mt-4 grid gap-5 border-t border-[color:rgba(26,26,26,0.15)] pt-5">
              {STEP_KEYS.map((step, i) => (
                <li key={step} className="flex gap-5 border-t border-[color:rgba(26,26,26,0.15)] pt-4 first:border-t-0 first:pt-0">
                  <span className="font-[family-name:var(--font-display)] text-3xl font-extrabold leading-none tracking-[-0.05em] text-[var(--color-dtg-red)]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p className="pt-1 text-[15px] leading-[1.5] opacity-85">{t(`pathA.steps.${step}`)}</p>
                </li>
              ))}
            </ol>
          </div>

          {/* Path B */}
          <div className="flex flex-col gap-6 bg-white p-10 lg:p-14">
            <div className="flex flex-wrap items-baseline gap-3">
              <MonoLabel className="opacity-60" size="xs">Jalur B</MonoLabel>
              <span className="border border-[var(--color-dtg-ink)] bg-[var(--color-dtg-cream)] px-2 py-0.5 font-[family-name:var(--font-mono)] text-[10px] font-bold uppercase tracking-[0.1em]">
                {t("pathB.badge")}
              </span>
            </div>
            <DisplayHeadline size="sidebar" as="h3">
              {t("pathB.title")}
            </DisplayHeadline>
            <ol className="mt-4 grid gap-5 border-t border-[color:rgba(26,26,26,0.15)] pt-5">
              {STEP_KEYS.map((step, i) => (
                <li key={step} className="flex gap-5 border-t border-[color:rgba(26,26,26,0.15)] pt-4 first:border-t-0 first:pt-0">
                  <span className="font-[family-name:var(--font-display)] text-3xl font-extrabold leading-none tracking-[-0.05em] text-[var(--color-dtg-ink)] opacity-60">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p className="pt-1 text-[15px] leading-[1.5] opacity-85">{t(`pathB.steps.${step}`)}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
