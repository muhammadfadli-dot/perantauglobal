import { useTranslations } from "next-intl";
import {
  Accent,
  AsymmetricSectionHeader,
  DisplayHeadline,
  Italic,
  MonoLabel,
} from "@/components/editorial";

const COMPONENTS = ["assessment", "learning", "tryout", "certificate"] as const;

export default function GTHComponents() {
  const t = useTranslations("program.gth.components");

  return (
    <section
      id="program-components"
      className="bg-[var(--color-dtg-cream)] px-6 py-20 text-[var(--color-dtg-ink)] lg:px-14 lg:py-24"
    >
      <div className="mx-auto max-w-[1440px]">
        <AsymmetricSectionHeader
          number="02"
          label={t("label")}
          headline={
            <DisplayHeadline size="section">
              Empat komponen,{" "}
              <Italic>satu</Italic>{" "}
              <Accent>sertifikat.</Accent>
            </DisplayHeadline>
          }
          body={t("subtitle")}
        />

        <div className="mt-12 grid gap-px border border-[var(--color-dtg-ink)] bg-[var(--color-dtg-ink)] sm:grid-cols-2 lg:grid-cols-4">
          {COMPONENTS.map((key, i) => (
            <div key={key} className="flex flex-col justify-between gap-6 bg-white p-8 lg:p-10 lg:min-h-[320px]">
              <div className="font-[family-name:var(--font-display)] text-[clamp(44px,4.5vw,72px)] font-extrabold leading-none tracking-[-0.05em] text-[var(--color-dtg-red)]">
                {String(i + 1).padStart(2, "0")}
              </div>
              <div>
                <MonoLabel className="text-[var(--color-dtg-red)] opacity-100" size="xs">
                  {t(`${key}.tag`)}
                </MonoLabel>
                <h3 className="mt-3 font-[family-name:var(--font-display)] text-[clamp(18px,1.8vw,22px)] font-extrabold leading-[1.15] tracking-[-0.02em]">
                  {t(`${key}.title`)}
                </h3>
                <p className="mt-3 text-[14px] leading-[1.55] opacity-75">
                  {t(`${key}.description`)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
