import { useTranslations } from "next-intl";
import {
  Accent,
  AsymmetricSectionHeader,
  DisplayHeadline,
  Italic,
  MetaStrip,
  MonoLabel,
} from "@/components/editorial";
import EditorialContactForm from "./EditorialContactForm";

const CONTACT_KEYS = ["address", "phone", "whatsapp", "email", "hours"] as const;

export default function KontakContent() {
  const t = useTranslations("contact");

  return (
    <>
      {/* Editorial hero */}
      <section className="overflow-hidden border-b border-[var(--color-dtg-ink)] bg-[var(--color-dtg-cream)] text-[var(--color-dtg-ink)]">
        <MetaStrip
          left="§ Kontak · Perantau Global"
          right={<span className="text-[var(--color-dtg-red)]">● WA dibalas rata-rata 11 menit</span>}
          tone="cream"
          border="bottom"
        />
        <div className="mx-auto max-w-[1440px] px-6 py-16 lg:px-14 lg:py-20 animate-[slideUp_0.6s_var(--ease-out-expo)]">
          <div className="flex items-center gap-3">
            <span className="block h-[2px] w-9 bg-[var(--color-dtg-red)]" />
            <MonoLabel className="text-[var(--color-dtg-red)] opacity-100" size="sm">
              Kontak · Perantau Global
            </MonoLabel>
          </div>
          <DisplayHeadline as="h1" size="hero" className="mt-6 max-w-[22ch]">
            Kirim{" "}
            <Italic>kabar,</Italic>{" "}
            <Accent>kami balas.</Accent>
          </DisplayHeadline>
          <p className="mt-8 max-w-[58ch] text-[clamp(16px,1.6vw,20px)] leading-[1.5] opacity-80">
            {t("subtitle")}
          </p>
        </div>
      </section>

      {/* § 01 — Kontak info + form */}
      <section className="bg-white px-6 py-20 text-[var(--color-dtg-ink)] lg:px-14 lg:py-24">
        <div className="mx-auto max-w-[1440px]">
          <AsymmetricSectionHeader
            number="01"
            label="Informasi kontak"
            headline={
              <DisplayHeadline size="section">
                Datang langsung,{" "}
                <Italic>chat,</Italic> atau <Accent>telepon.</Accent>
              </DisplayHeadline>
            }
            body="Tim kami siap di jam kerja. WhatsApp 24 jam, rata-rata dibalas 11 menit."
          />

          <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
            {/* Contact info as dossier table */}
            <div className="border-t border-[var(--color-dtg-ink)]">
              {CONTACT_KEYS.map((key) => {
                const value = t(`info.${key}.value`);
                const href =
                  key === "phone" ? `tel:${value.replace(/[^+\d]/g, "")}` :
                  key === "whatsapp" ? `https://wa.me/${value.replace(/[^+\d]/g, "")}` :
                  key === "email" ? `mailto:${value}` :
                  undefined;
                return (
                  <div
                    key={key}
                    className="grid gap-4 border-b border-[color:rgba(26,26,26,0.15)] py-5 sm:grid-cols-[140px_1fr] sm:gap-8"
                  >
                    <div className="pt-1 font-[family-name:var(--font-mono)] text-[11px] font-bold uppercase tracking-[0.12em] opacity-70">
                      {t(`info.${key}.label`)}
                    </div>
                    {href ? (
                      <a
                        href={href}
                        target={key === "whatsapp" ? "_blank" : undefined}
                        rel={key === "whatsapp" ? "noopener noreferrer" : undefined}
                        className="font-[family-name:var(--font-display)] text-[clamp(16px,1.8vw,22px)] font-extrabold tracking-[-0.02em] text-[var(--color-dtg-ink)] underline-offset-4 hover:text-[var(--color-dtg-red)] hover:underline"
                      >
                        {value}
                      </a>
                    ) : (
                      <p className="font-[family-name:var(--font-display)] text-[clamp(16px,1.8vw,22px)] font-extrabold tracking-[-0.02em]">
                        {value}
                      </p>
                    )}
                  </div>
                );
              })}

              <div className="mt-8 border-t-2 border-[var(--color-dtg-ink)] pt-6">
                <MonoLabel className="opacity-60" size="xs">{t("social.title")}</MonoLabel>
                <ul className="mt-3 grid gap-1.5 text-[15px]">
                  <li><span className="opacity-60">LinkedIn:</span> {t("social.linkedin")}</li>
                  <li><span className="opacity-60">Instagram:</span> {t("social.instagram")}</li>
                </ul>
              </div>
            </div>

            <EditorialContactForm />
          </div>
        </div>
      </section>

      {/* § 02 — Map */}
      <section className="bg-[var(--color-dtg-cream)] px-6 py-20 text-[var(--color-dtg-ink)] lg:px-14 lg:py-24">
        <div className="mx-auto max-w-[1440px]">
          <AsymmetricSectionHeader
            number="02"
            label="Lokasi kantor"
            headline={
              <DisplayHeadline size="section">
                Kantor kami, <Italic>di jantung</Italic> Jakarta.
              </DisplayHeadline>
            }
            body="Taman E3.3 · Jl. Mega Kuningan · Jakarta Selatan. Walk-in welcome di jam kerja."
          />

          <div className="mt-12 border border-[var(--color-dtg-ink)] bg-white">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.2123456789!2d106.8234567!3d-6.2345678!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f3e97510b0e9%3A0x123456789!2sKantor%20Taman%20E3.3!5e0!3m2!1sid!2sid!4v1234567890"
              width="100%"
              height="420"
              style={{ border: 0, display: "block" }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Office Location"
            />
          </div>
        </div>
      </section>
    </>
  );
}
