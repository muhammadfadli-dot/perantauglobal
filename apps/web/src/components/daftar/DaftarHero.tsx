import { useTranslations } from "next-intl";
import { Accent, DisplayHeadline, Italic, MetaStrip, MonoLabel } from "@/components/editorial";

export default function DaftarHero() {
  const t = useTranslations("register");
  return (
    <section className="overflow-hidden border-b border-[var(--color-dtg-ink)] bg-[var(--color-dtg-cream)] text-[var(--color-dtg-ink)]">
      <MetaStrip
        left="§ Form pendaftaran · umum"
        right={<span className="text-[var(--color-dtg-red)]">● Dibalas WA rata-rata 11 menit</span>}
        tone="cream"
        border="bottom"
      />
      <div className="mx-auto max-w-[1440px] px-6 py-16 lg:px-14 lg:py-20 animate-[slideUp_0.6s_var(--ease-out-expo)]">
        <div className="flex items-center gap-3">
          <span className="block h-[2px] w-9 bg-[var(--color-dtg-red)]" />
          <MonoLabel className="text-[var(--color-dtg-red)] opacity-100" size="sm">
            Pendaftaran Kandidat · Perantau Global
          </MonoLabel>
        </div>
        <DisplayHeadline as="h1" size="hero" className="mt-6 max-w-[22ch]">
          Mulai dari{" "}
          <Italic>satu form,</Italic>{" "}
          <Accent>4 menit.</Accent>
        </DisplayHeadline>
        <p className="mt-8 max-w-[58ch] text-[clamp(16px,1.6vw,20px)] leading-[1.5] opacity-80">
          {t("subtitle")}
        </p>
      </div>
    </section>
  );
}
