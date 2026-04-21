import { useTranslations } from "next-intl";
import Image from "next/image";
import {
  Accent,
  AsymmetricSectionHeader,
  DisplayHeadline,
  Italic,
} from "@/components/editorial";

const TRAITS = ["vehicle", "communicative", "fieldWork", "javaArea"] as const;

export default function SPGTargetProfile() {
  const t = useTranslations("program.spg.targetProfile");

  return (
    <section className="bg-[var(--color-dtg-cream)] px-6 py-20 text-[var(--color-dtg-ink)] lg:px-14 lg:py-24">
      <div className="mx-auto max-w-[1440px]">
        <AsymmetricSectionHeader
          number="02"
          label="Target profil SPG"
          headline={
            <DisplayHeadline size="section">
              Siapa yang{" "}
              <Italic>cocok</Italic>{" "}
              <Accent>jadi SPG.</Accent>
            </DisplayHeadline>
          }
          body={t("subtitle")}
        />

        <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
          <div className="relative aspect-[4/3] overflow-hidden border border-[var(--color-dtg-ink)] order-2 lg:order-1">
            <Image
              src="/images/program/spg-target-profile.jpg"
              alt={t("title")}
              fill
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="object-cover"
            />
          </div>
          <div className="order-1 grid gap-px border border-[var(--color-dtg-ink)] bg-[var(--color-dtg-ink)] sm:grid-cols-2 lg:order-2">
            {TRAITS.map((key, i) => (
              <div key={key} className="bg-white p-7 lg:p-8">
                <div className="font-[family-name:var(--font-display)] text-[clamp(40px,4vw,56px)] font-extrabold leading-none tracking-[-0.05em] text-[var(--color-dtg-red)]">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <h3 className="mt-4 font-[family-name:var(--font-display)] text-lg font-extrabold tracking-[-0.02em]">
                  {t(`traits.${key}.title`)}
                </h3>
                <p className="mt-2 text-[14px] leading-[1.55] opacity-75">
                  {t(`traits.${key}.description`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
