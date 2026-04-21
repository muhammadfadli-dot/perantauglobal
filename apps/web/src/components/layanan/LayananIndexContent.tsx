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

type Service = { slug: string; title: string; description: string };

export default function LayananIndexContent({
  services,
}: {
  services: Array<Record<string, unknown>>;
}) {
  const t = useTranslations("services");
  const rows = services as unknown as Service[];

  return (
    <>
      {/* Editorial hero */}
      <section className="overflow-hidden border-b border-[var(--color-dtg-ink)] bg-[var(--color-dtg-cream)] text-[var(--color-dtg-ink)]">
        <MetaStrip
          left="§ Layanan · Perantau Global"
          right={<span className="text-[var(--color-dtg-red)]">● End-to-end · legal · tanpa biaya kandidat</span>}
          tone="cream"
          border="bottom"
        />
        <div className="mx-auto max-w-[1440px] px-6 py-16 lg:px-14 lg:py-20 animate-[slideUp_0.6s_var(--ease-out-expo)]">
          <div className="flex items-center gap-3">
            <span className="block h-[2px] w-9 bg-[var(--color-dtg-red)]" />
            <MonoLabel className="text-[var(--color-dtg-red)] opacity-100" size="sm">
              Layanan Perantau Global
            </MonoLabel>
          </div>
          <DisplayHeadline as="h1" size="hero" className="mt-6 max-w-[22ch]">
            Penempatan{" "}
            <Italic>bukan sekadar</Italic>{" "}
            <Accent>tiket pesawat.</Accent>
          </DisplayHeadline>
          <p className="mt-8 max-w-[58ch] text-[clamp(16px,1.6vw,20px)] leading-[1.5] opacity-80">
            {t("pageSubtitle")}
          </p>
        </div>
      </section>

      {/* Services as magazine grid */}
      <section className="bg-white px-6 py-20 text-[var(--color-dtg-ink)] lg:px-14 lg:py-24">
        <div className="mx-auto max-w-[1440px]">
          <AsymmetricSectionHeader
            number="01"
            label="Layanan aktif"
            headline={
              <DisplayHeadline size="section">
                Empat layanan,{" "}
                <Italic>satu jalur</Italic>{" "}
                <Accent>end-to-end.</Accent>
              </DisplayHeadline>
            }
            body="Klik tiap layanan untuk dosier detail: cakupan, industri target, prosedur, dan compliance."
          />

          {rows.length > 0 ? (
            <div className="mt-12 grid gap-px border border-[var(--color-dtg-ink)] bg-[var(--color-dtg-ink)] sm:grid-cols-2">
              {rows.map((service, i) => (
                <Link
                  key={service.slug}
                  href={{ pathname: "/layanan/[slug]", params: { slug: service.slug } }}
                  className="group flex flex-col justify-between gap-6 bg-white p-10 no-underline text-[var(--color-dtg-ink)] transition-colors hover:bg-[var(--color-dtg-paper)] lg:p-14"
                >
                  <div className="font-[family-name:var(--font-mono)] text-[10px] font-bold uppercase tracking-[0.12em] opacity-70">
                    {String(i + 1).padStart(2, "0")} / {String(rows.length).padStart(2, "0")}
                  </div>
                  <div>
                    <h3 className="font-[family-name:var(--font-display)] text-[clamp(24px,2.6vw,40px)] font-extrabold leading-[1.1] tracking-[-0.03em] group-hover:text-[var(--color-dtg-red)]">
                      {service.title}
                    </h3>
                    <p className="mt-4 max-w-[55ch] text-[15px] leading-[1.55] opacity-75">
                      {service.description}
                    </p>
                    <span className="mt-6 inline-flex items-center gap-2 font-[family-name:var(--font-mono)] text-xs font-bold uppercase tracking-[0.12em] text-[var(--color-dtg-red)] transition-transform group-hover:translate-x-1">
                      {t("viewDetail")} →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="mt-12 opacity-60">Content coming soon.</p>
          )}
        </div>
      </section>

      {/* Process preview */}
      <section className="bg-[var(--color-dtg-cream)] px-6 py-20 text-[var(--color-dtg-ink)] lg:px-14 lg:py-24">
        <div className="mx-auto grid max-w-[1440px] gap-10 lg:grid-cols-2 lg:items-end lg:gap-16">
          <div>
            <MonoLabel className="opacity-60" size="sm">
              § 02 — Alur kerja
            </MonoLabel>
            <DisplayHeadline size="section" className="mt-4">
              {t("processPreview.title")}
            </DisplayHeadline>
            <p className="mt-6 max-w-[42ch] text-[17px] leading-[1.55] opacity-80">
              {t("processPreview.description")}
            </p>
          </div>
          <div className="flex justify-start lg:justify-end">
            <EditorialButton href="/proses" variant="ink" suffix="→">
              {t("processPreview.cta")}
            </EditorialButton>
          </div>
        </div>
      </section>

      {/* CTA poster */}
      <section className="relative overflow-hidden bg-[var(--color-dtg-red)] text-white">
        <MetaStrip
          left="§ Next step"
          right={<span className="text-white">● Konsultasi gratis · 24 jam respons</span>}
          tone="red"
          border="bottom"
          className="text-white"
        />
        <div className="mx-auto max-w-[1440px] px-6 py-14 lg:px-14 lg:py-20">
          <DisplayHeadline size="poster" className="max-w-[14ch]">
            Pilih <Italic>layanan</Italic> kamu.
          </DisplayHeadline>
          <p className="mt-6 max-w-[42ch] text-lg leading-[1.5] text-white/90">
            Atau chat WhatsApp untuk konsultasi langsung dengan tim kami.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <EditorialButton href="/daftar" variant="ink" suffix="→">
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
