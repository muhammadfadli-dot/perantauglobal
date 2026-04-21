import { useTranslations } from "next-intl";
import Image from "next/image";
import {
  Accent,
  AsymmetricSectionHeader,
  DisplayHeadline,
  Italic,
  MonoLabel,
} from "@/components/editorial";

const AREAS = [
  { key: "jabar", priority: true },
  { key: "jateng", priority: false },
  { key: "jatim", priority: false },
  { key: "banten", priority: false },
  { key: "jakarta", priority: false },
  { key: "yogyakarta", priority: false },
] as const;

export default function SPGAreaCoverage() {
  const t = useTranslations("program.spg.areaCoverage");

  return (
    <section className="bg-white px-6 py-20 text-[var(--color-dtg-ink)] lg:px-14 lg:py-24">
      <div className="mx-auto max-w-[1440px]">
        <AsymmetricSectionHeader
          number="05"
          label="Area cakupan"
          headline={
            <DisplayHeadline size="section">
              Jawa,{" "}
              <Italic>dari barat</Italic>{" "}
              <Accent>ke timur.</Accent>
            </DisplayHeadline>
          }
          body={t("subtitle")}
        />

        <div className="mt-12 grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
          <div className="border-t border-[var(--color-dtg-ink)]">
            {AREAS.map(({ key, priority }) => (
              <div
                key={key}
                className="grid items-center gap-4 border-b border-[color:rgba(26,26,26,0.15)] py-5 sm:grid-cols-[60px_1fr_auto] sm:gap-6"
              >
                <div className="grid size-11 place-items-center border-2 border-[var(--color-dtg-ink)] bg-[var(--color-dtg-cream)] font-[family-name:var(--font-mono)] text-[10px] font-extrabold uppercase tracking-[0.06em]">
                  {key.slice(0, 3).toUpperCase()}
                </div>
                <div>
                  <p className="font-[family-name:var(--font-display)] text-[clamp(18px,1.8vw,22px)] font-extrabold tracking-[-0.02em]">
                    {t(`areas.${key}.name`)}
                  </p>
                  <p className="mt-1 text-[14px] leading-[1.5] opacity-70">{t(`areas.${key}.detail`)}</p>
                </div>
                {priority ? (
                  <span className="border border-[var(--color-dtg-red)] bg-[var(--color-dtg-red)] px-2.5 py-1 font-[family-name:var(--font-mono)] text-[10px] font-bold uppercase tracking-[0.1em] text-white">
                    ● {t("priorityBadge")}
                  </span>
                ) : (
                  <MonoLabel className="opacity-60" size="xs">
                    Aktif
                  </MonoLabel>
                )}
              </div>
            ))}
            <p className="mt-5 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.1em] opacity-60">
              {t("note")}
            </p>
          </div>

          <div className="relative aspect-[4/3] overflow-hidden border border-[var(--color-dtg-ink)]">
            <Image
              src="/images/program/spg-area-coverage.jpg"
              alt={t("title")}
              fill
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
