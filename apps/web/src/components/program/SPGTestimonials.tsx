import { useTranslations } from "next-intl";
import {
  Accent,
  AsymmetricSectionHeader,
  DisplayHeadline,
  Italic,
  MonoLabel,
} from "@/components/editorial";

const TESTIMONIAL_KEYS = ["rina", "andi", "mega"] as const;

export default function SPGTestimonials() {
  const t = useTranslations("program.spg.testimonials");

  return (
    <section className="bg-white px-6 py-20 text-[var(--color-dtg-ink)] lg:px-14 lg:py-24">
      <div className="mx-auto max-w-[1440px]">
        <AsymmetricSectionHeader
          number="07"
          label="Cerita partner SPG"
          headline={
            <DisplayHeadline size="section">
              Suara{" "}
              <Italic>dari</Italic>{" "}
              <Accent>lapangan.</Accent>
            </DisplayHeadline>
          }
          body={t("subtitle")}
        />

        <div className="mt-12 grid gap-px border border-[var(--color-dtg-ink)] bg-[var(--color-dtg-ink)] md:grid-cols-3">
          {TESTIMONIAL_KEYS.map((key, i) => (
            <figure
              key={key}
              className={
                "flex flex-col justify-between gap-6 p-8 lg:p-10 " +
                (i === 0 ? "bg-[var(--color-dtg-paper)]" : "bg-white")
              }
            >
              <MonoLabel className="opacity-60" size="xs">
                Cerita {String(i + 1).padStart(2, "0")}
              </MonoLabel>
              <blockquote className="font-[family-name:var(--font-display)] text-[clamp(18px,1.9vw,22px)] font-extrabold leading-[1.25] tracking-[-0.02em] text-balance">
                <span className="text-[var(--color-dtg-red)]">“</span>
                {t(`items.${key}.quote`)}
                <span className="text-[var(--color-dtg-red)]">”</span>
              </blockquote>
              <figcaption className="flex items-baseline justify-between border-t border-[color:rgba(26,26,26,0.15)] pt-4">
                <p className="font-[family-name:var(--font-display)] text-lg font-extrabold tracking-[-0.02em]">
                  {t(`items.${key}.name`)}
                </p>
                <MonoLabel className="opacity-70" size="xs">
                  {t(`items.${key}.city`)}
                </MonoLabel>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
