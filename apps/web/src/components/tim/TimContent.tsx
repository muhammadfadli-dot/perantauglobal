import { useTranslations } from "next-intl";
import {
  Accent,
  AsymmetricSectionHeader,
  DisplayHeadline,
  EditorialButton,
  Italic,
  MetaStrip,
  MonoLabel,
} from "@/components/editorial";

const DEPT_KEYS = ["recruitment", "training", "documentation", "support"] as const;

export default function TimContent() {
  const t = useTranslations("team");

  return (
    <>
      {/* Editorial hero */}
      <section className="overflow-hidden border-b border-[var(--color-dtg-ink)] bg-[var(--color-dtg-cream)] text-[var(--color-dtg-ink)]">
        <MetaStrip
          left="§ Tim · di balik meja kerja"
          right={<span className="text-[var(--color-dtg-red)]">● 300+ HR experts · Dayalima Group</span>}
          tone="cream"
          border="bottom"
        />
        <div className="mx-auto max-w-[1440px] px-6 py-16 lg:px-14 lg:py-20 animate-[slideUp_0.6s_var(--ease-out-expo)]">
          <div className="flex items-center gap-3">
            <span className="block h-[2px] w-9 bg-[var(--color-dtg-red)]" />
            <MonoLabel className="text-[var(--color-dtg-red)] opacity-100" size="sm">
              Tim Perantau Global
            </MonoLabel>
          </div>
          <DisplayHeadline as="h1" size="hero" className="mt-6 max-w-[22ch]">
            Orang{" "}
            <Italic>di balik</Italic>{" "}
            <Accent>setiap kontrak.</Accent>
          </DisplayHeadline>
          <p className="mt-8 max-w-[58ch] text-[clamp(16px,1.6vw,20px)] leading-[1.5] opacity-80">
            {t("subtitle")}
          </p>
        </div>
      </section>

      {/* § 01 — Manajemen */}
      <section className="bg-white px-6 py-20 text-[var(--color-dtg-ink)] lg:px-14 lg:py-24">
        <div className="mx-auto max-w-[1440px]">
          <AsymmetricSectionHeader
            number="01"
            label={t("management.title")}
            headline={
              <DisplayHeadline size="section">
                Tanda tangan di atas, <Italic>tanggung jawab</Italic> di lapangan.
              </DisplayHeadline>
            }
          />
          <div className="mt-12 grid gap-px border border-[var(--color-dtg-ink)] bg-[var(--color-dtg-ink)] lg:grid-cols-[1fr_1.2fr]">
            <div className="bg-[var(--color-dtg-paper)] p-10 lg:p-14">
              <MonoLabel className="opacity-60" size="xs">Direktur</MonoLabel>
              <p className="mt-3 font-[family-name:var(--font-display)] text-[clamp(40px,4.5vw,64px)] font-extrabold leading-[1] tracking-[-0.04em]">
                {t("management.members.m1.name")}
              </p>
              <p className="mt-4 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.1em] text-[var(--color-dtg-red)]">
                {t("management.members.m1.position")}
              </p>
            </div>
            <div className="bg-white p-10 lg:p-14">
              <MonoLabel className="opacity-60" size="xs">Latar belakang</MonoLabel>
              <p className="mt-3 text-[17px] leading-[1.6] opacity-85">
                {t("management.members.m1.description")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* § 02 — Departemen */}
      <section className="bg-[var(--color-dtg-cream)] px-6 py-20 text-[var(--color-dtg-ink)] lg:px-14 lg:py-24">
        <div className="mx-auto max-w-[1440px]">
          <AsymmetricSectionHeader
            number="02"
            label={t("departments.title")}
            headline={
              <DisplayHeadline size="section">
                Empat tim, <Italic>satu</Italic> <Accent>jalur.</Accent>
              </DisplayHeadline>
            }
            body="Dari rekrutmen sampai penempatan, setiap kandidat didampingi oleh 4 tim berbeda — masing-masing fokus di satu tahap proses."
          />
          <div className="mt-12 grid gap-px border border-[var(--color-dtg-ink)] bg-[var(--color-dtg-ink)] sm:grid-cols-2">
            {DEPT_KEYS.map((key, i) => (
              <div key={key} className="bg-white p-8 lg:p-10">
                <div className="font-[family-name:var(--font-display)] text-[clamp(44px,4.5vw,64px)] font-extrabold leading-none tracking-[-0.05em] text-[var(--color-dtg-red)]">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <h3 className="mt-4 font-[family-name:var(--font-display)] text-xl font-extrabold tracking-[-0.02em]">
                  {t(`departments.items.${key}.title`)}
                </h3>
                <p className="mt-3 text-[15px] leading-[1.55] opacity-75">
                  {t(`departments.items.${key}.description`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden bg-[var(--color-dtg-red)] text-white">
        <MetaStrip
          left="§ Next step"
          right={<span className="text-white">● Tim standby 09:00–17:00 WIB</span>}
          tone="red"
          border="bottom"
          className="text-white"
        />
        <div className="mx-auto max-w-[1440px] px-6 py-14 lg:px-14 lg:py-20">
          <DisplayHeadline size="poster" className="max-w-[14ch]">
            Bareng tim, <Italic>bukan</Italic> sendiri.
          </DisplayHeadline>
          <p className="mt-6 max-w-[42ch] text-lg leading-[1.5] text-white/90">
            Daftar sekarang, dampingan dari tim rekrutmen + pelatihan + dokumen + support tersedia sampai kamu tiba di negara tujuan.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <EditorialButton href="/program/global-talent-hub" variant="ink" suffix="→">
              Daftar sekarang
            </EditorialButton>
            <EditorialButton href="https://wa.me/6285211415104" variant="cream" suffix="→" target="_blank" rel="noopener noreferrer">
              WhatsApp langsung
            </EditorialButton>
          </div>
        </div>
      </section>
    </>
  );
}
