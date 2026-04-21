import { useTranslations } from "next-intl";
import {
  Accent,
  AsymmetricSectionHeader,
  DisplayHeadline,
  Italic,
  MonoLabel,
} from "@/components/editorial";

export default function GTHProblemSolution() {
  const t = useTranslations("program.gth.problem");

  return (
    <section className="bg-white px-6 py-20 text-[var(--color-dtg-ink)] lg:px-14 lg:py-24">
      <div className="mx-auto max-w-[1440px]">
        <AsymmetricSectionHeader
          number="01"
          label={t("label")}
          headline={
            <DisplayHeadline size="section">
              Hard skill saja{" "}
              <Italic>tidak</Italic>{" "}
              <Accent>cukup.</Accent>
            </DisplayHeadline>
          }
          body={t("subtitle")}
        />

        <div className="mt-12 grid gap-px border border-[var(--color-dtg-ink)] bg-[var(--color-dtg-ink)] md:grid-cols-2">
          {/* Hard skill (already covered) */}
          <div className="bg-white p-10 lg:p-12">
            <MonoLabel className="opacity-60" size="xs">
              {t("gap.hardSkill.title")}
            </MonoLabel>
            <p className="mt-3 font-[family-name:var(--font-display)] text-[clamp(24px,2.6vw,36px)] font-extrabold leading-[1.1] tracking-[-0.03em] opacity-60">
              Sudah diajarkan di LPK.
            </p>
            <ul className="mt-6 grid gap-2">
              {t("gap.hardSkill.items")
                .split(", ")
                .map((item) => (
                  <li key={item} className="flex items-center gap-3 text-[15px] leading-[1.5]">
                    <span className="size-1.5 shrink-0 rounded-full bg-[var(--color-dtg-ink)] opacity-30" />
                    {item}
                  </li>
                ))}
            </ul>
          </div>

          {/* Soft skill (the gap) */}
          <div className="bg-[var(--color-dtg-red)] p-10 text-white lg:p-12">
            <MonoLabel className="text-white opacity-80" size="xs">
              {t("gap.softSkill.title")}
            </MonoLabel>
            <p className="mt-3 font-[family-name:var(--font-display)] text-[clamp(24px,2.6vw,36px)] font-extrabold leading-[1.1] tracking-[-0.03em]">
              Gap yang perlu diisi.
            </p>
            <ul className="mt-6 grid gap-2">
              {t("gap.softSkill.items")
                .split(", ")
                .map((item) => (
                  <li key={item} className="flex items-center gap-3 text-[15px] leading-[1.5] text-white">
                    <span className="size-1.5 shrink-0 rounded-full bg-white" />
                    {item}
                  </li>
                ))}
            </ul>
          </div>
        </div>

        {/* Solution callout — dossier strip */}
        <div className="mt-12 border border-[var(--color-dtg-ink)] bg-[var(--color-dtg-paper)]">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--color-dtg-ink)] bg-[var(--color-dtg-ink)] px-6 py-3 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.12em] text-[var(--color-dtg-cream)]">
            <span className="font-bold">§ {t("solutionLabel")}</span>
            <span className="text-[var(--color-dtg-red)]">● Global Talent Hub</span>
          </div>
          <div className="p-8 lg:p-12">
            <DisplayHeadline size="sidebar" as="h3">
              {t("solutionTitle")}
            </DisplayHeadline>
            <p className="mt-6 max-w-[70ch] text-[17px] leading-[1.6] opacity-85">
              {t("solutionDescription")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
