import { useTranslations } from "next-intl";
import {
  Accent,
  AsymmetricSectionHeader,
  DisplayHeadline,
  Italic,
  MonoLabel,
} from "@/components/editorial";

const TIERS = ["tier1", "tier2", "tier3", "tier4"] as const;
const LEVELS = ["low", "medium", "high"] as const;

export default function SPGCommission() {
  const t = useTranslations("program.spg.commission");

  return (
    <section
      id="commission"
      className="bg-[var(--color-dtg-cream)] px-6 py-20 text-[var(--color-dtg-ink)] lg:px-14 lg:py-24"
    >
      <div className="mx-auto max-w-[1440px]">
        <AsymmetricSectionHeader
          number="04"
          label={t("label")}
          headline={
            <DisplayHeadline size="section">
              Komisi{" "}
              <Italic>transparan,</Italic>{" "}
              <Accent>dibayar bulanan.</Accent>
            </DisplayHeadline>
          }
          body={t("subtitle")}
        />

        <div className="mt-12 grid gap-px border border-[var(--color-dtg-ink)] bg-[var(--color-dtg-ink)] sm:grid-cols-2">
          {TIERS.map((tier, i) => {
            const isHero = i === 0;
            return (
              <div
                key={tier}
                className={
                  "relative flex flex-col justify-between gap-6 overflow-hidden p-8 lg:p-10 " +
                  (isHero
                    ? "bg-[var(--color-dtg-red)] text-white"
                    : "bg-white text-[var(--color-dtg-ink)]")
                }
              >
                <MonoLabel className={"opacity-70 " + (isHero ? "text-white" : "")} size="xs">
                  Tier {String(i + 1).padStart(2, "0")} / 04
                </MonoLabel>
                <div>
                  <p className="font-[family-name:var(--font-mono)] text-[11px] font-bold uppercase tracking-[0.12em] opacity-70">
                    {t(`${tier}.title`)}
                  </p>
                  <p
                    className={
                      "mt-3 font-[family-name:var(--font-display)] font-extrabold leading-[0.92] tracking-[-0.05em] " +
                      (isHero ? "text-[clamp(48px,6vw,88px)]" : "text-[clamp(32px,4vw,56px)]")
                    }
                  >
                    {t(`${tier}.amount`)}
                  </p>
                  <p className="mt-3 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.1em] opacity-80">
                    {t(`${tier}.unit`)}
                  </p>
                  <p className="mt-4 max-w-[42ch] text-[14px] leading-[1.55] opacity-85">
                    {t(`${tier}.description`)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Earnings example — dossier strip */}
        <div className="mt-12 border border-[var(--color-dtg-ink)] bg-white">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--color-dtg-ink)] bg-[var(--color-dtg-paper)] px-6 py-3 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.12em]">
            <span className="font-bold">§ {t("earningsExample.title")}</span>
            <span className="opacity-70">Simulasi · bulanan</span>
          </div>
          <div className="grid gap-px bg-[var(--color-dtg-ink)] sm:grid-cols-3">
            {LEVELS.map((level) => (
              <div key={level} className="flex flex-col justify-between gap-3 bg-white p-6 lg:p-8">
                <MonoLabel className="opacity-60" size="xs">
                  {t(`earningsExample.${level}.label`)}
                </MonoLabel>
                <p className="font-[family-name:var(--font-display)] text-[clamp(32px,4vw,48px)] font-extrabold leading-none tracking-[-0.05em] text-[var(--color-dtg-red)]">
                  {t(`earningsExample.${level}.amount`)}
                </p>
                <p className="text-[13px] leading-[1.5] opacity-70">
                  {t(`earningsExample.${level}.detail`)}
                </p>
              </div>
            ))}
          </div>
        </div>

        <p className="mt-6 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.1em] opacity-60">
          {t("note")}
        </p>
      </div>
    </section>
  );
}
