import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  Accent,
  AsymmetricSectionHeader,
  DisplayHeadline,
  EditorialButton,
  Italic,
  MetaStrip,
  MonoLabel,
} from "@/components/editorial";

type Destination = {
  slug: string;
  title: string;
  flag?: string;
  description: string;
  industries?: string[];
};

export default function DestinasiIndexContent({
  destinations,
}: {
  destinations: Array<Record<string, unknown>>;
}) {
  const t = useTranslations("destinations");
  const rows = destinations as unknown as Destination[];

  return (
    <>
      {/* Editorial hero */}
      <section className="overflow-hidden border-b border-[var(--color-dtg-ink)] bg-[var(--color-dtg-cream)] text-[var(--color-dtg-ink)]">
        <MetaStrip
          left="§ Atlas destinasi · 5 negara"
          right={<span className="text-[var(--color-dtg-red)]">● Peta kerja · bukan peta wisata</span>}
          tone="cream"
          border="bottom"
        />
        <div className="mx-auto max-w-[1440px] px-6 py-16 lg:px-14 lg:py-20 animate-[slideUp_0.6s_var(--ease-out-expo)]">
          <div className="flex items-center gap-3">
            <span className="block h-[2px] w-9 bg-[var(--color-dtg-red)]" />
            <MonoLabel className="text-[var(--color-dtg-red)] opacity-100" size="sm">
              Atlas negara penempatan
            </MonoLabel>
          </div>
          <DisplayHeadline as="h1" size="hero" className="mt-6 max-w-[22ch]">
            Peta kerja,{" "}
            <Italic>bukan peta</Italic>{" "}
            <Accent>wisata.</Accent>
          </DisplayHeadline>
          <p className="mt-8 max-w-[58ch] text-[clamp(16px,1.6vw,20px)] leading-[1.5] opacity-80">
            {t("pageSubtitle")}
          </p>
        </div>
      </section>

      {/* Dossier table of destinations */}
      <section className="bg-white px-6 py-20 text-[var(--color-dtg-ink)] lg:px-14 lg:py-24">
        <div className="mx-auto max-w-[1440px]">
          <AsymmetricSectionHeader
            number="01"
            label="Destinasi aktif"
            headline={
              <DisplayHeadline size="section">
                Lima negara,{" "}
                <Italic>regulasi</Italic>{" "}
                <Accent>berbeda.</Accent>
              </DisplayHeadline>
            }
            body="Klik negara untuk baca dosier lengkap — regulasi visa, industri, budaya kerja, dan lowongan aktif di sana."
          />

          {rows.length > 0 ? (
            <div className="mt-12 border-t border-[var(--color-dtg-ink)]">
              {rows.map((dest, i) => (
                <Link
                  key={dest.slug}
                  href={{ pathname: "/destinasi/[slug]", params: { slug: dest.slug } }}
                  className="group grid gap-4 border-b border-[color:rgba(26,26,26,0.15)] py-7 no-underline text-[var(--color-dtg-ink)] sm:grid-cols-[80px_1fr_1fr_auto] sm:items-baseline sm:gap-10 lg:px-4 transition-colors hover:bg-[var(--color-dtg-paper)]"
                >
                  <div className="flex items-center gap-4">
                    <span className="font-[family-name:var(--font-mono)] text-[11px] font-bold uppercase tracking-[0.14em] opacity-60">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {dest.flag && (
                      <span className="grid size-11 place-items-center border-2 border-[var(--color-dtg-ink)] bg-[var(--color-dtg-cream)] text-2xl">
                        {dest.flag}
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="font-[family-name:var(--font-mono)] text-[10px] font-bold uppercase tracking-[0.12em] opacity-60">
                      Negara
                    </div>
                    <p className="mt-1.5 font-[family-name:var(--font-display)] text-[clamp(24px,2.8vw,36px)] font-extrabold tracking-[-0.03em] group-hover:text-[var(--color-dtg-red)]">
                      {dest.title}
                    </p>
                    <p className="mt-1.5 max-w-[60ch] text-[14px] leading-[1.5] opacity-72">
                      {dest.description}
                    </p>
                  </div>
                  <div>
                    <div className="font-[family-name:var(--font-mono)] text-[10px] font-bold uppercase tracking-[0.12em] opacity-60">
                      Industri
                    </div>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {Array.isArray(dest.industries) &&
                        dest.industries.slice(0, 4).map((ind) => (
                          <span
                            key={ind}
                            className="border border-[var(--color-dtg-ink)] bg-[var(--color-dtg-cream)] px-2 py-0.5 font-[family-name:var(--font-mono)] text-[10px] font-bold uppercase tracking-[0.08em]"
                          >
                            {ind}
                          </span>
                        ))}
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-2 font-[family-name:var(--font-mono)] text-xs font-bold uppercase tracking-[0.12em] text-[var(--color-dtg-red)] transition-transform group-hover:translate-x-1">
                    {t("viewDetail")} →
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="mt-12 opacity-60">Content coming soon.</p>
          )}
        </div>
      </section>

      {/* CTA poster */}
      <section className="relative overflow-hidden bg-[var(--color-dtg-red)] text-white">
        <MetaStrip
          left="§ Next step"
          right={<span className="text-white">● 48 slot aktif · 50+ negara</span>}
          tone="red"
          border="bottom"
          className="text-white"
        />
        <div className="mx-auto max-w-[1440px] px-6 py-14 lg:px-14 lg:py-20">
          <DisplayHeadline size="poster" className="max-w-[14ch]">
            Pilih{" "}
            <Italic>negara</Italic>-mu.
          </DisplayHeadline>
          <p className="mt-6 max-w-[42ch] text-lg leading-[1.5] text-white/90">
            Jelajahi lowongan aktif di 6 role × 2 negara. Pilih yang cocok, isi form, berangkat.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <EditorialButton href="/" variant="ink" suffix="→">
              Semua lowongan aktif
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
