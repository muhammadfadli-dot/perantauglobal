import { useTranslations } from "next-intl";
import Image from "next/image";
import {
  Accent,
  AsymmetricSectionHeader,
  DisplayHeadline,
  Italic,
} from "@/components/editorial";

export default function SPGAbout() {
  const t = useTranslations("program.spg.about");

  return (
    <section
      id="about-spg"
      className="bg-white px-6 py-20 text-[var(--color-dtg-ink)] lg:px-14 lg:py-24"
    >
      <div className="mx-auto max-w-[1440px]">
        <AsymmetricSectionHeader
          number="01"
          label="Tentang SPG"
          headline={
            <DisplayHeadline size="section">
              Apa itu{" "}
              <Italic>Sahabat</Italic>{" "}
              <Accent>Perantau Global?</Accent>
            </DisplayHeadline>
          }
          body={t("description")}
        />

        <div className="mt-12 grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
          <div className="relative aspect-[4/3] overflow-hidden border border-[var(--color-dtg-ink)]">
            <Image
              src="/images/program/spg-about.jpg"
              alt={t("imageAlt")}
              fill
              sizes="(min-width: 1024px) 55vw, 100vw"
              className="object-cover"
            />
          </div>
          <div className="flex flex-col justify-center gap-6">
            <div className="border-l-4 border-[var(--color-dtg-red)] bg-[var(--color-dtg-paper)] px-6 py-5">
              <p className="font-[family-name:var(--font-display)] text-[clamp(20px,2.2vw,28px)] font-extrabold leading-[1.25] tracking-[-0.02em]">
                {t("summary")}
              </p>
            </div>
            <div className="grid gap-5">
              {[
                { n: "01", label: "Kunjungi", text: "LPK di wilayah Jawa sesuai rute harian kamu" },
                { n: "02", label: "Survey & bangun relasi", text: "Kumpulkan data LPK + membuka peluang kemitraan DTG" },
                { n: "03", label: "Dapat komisi", text: "Rp 50.000 per LPK yang datanya lengkap, plus bonus milestone & PKS" },
              ].map((row) => (
                <div key={row.n} className="flex gap-5 border-t border-[color:rgba(26,26,26,0.15)] pt-4 first:border-t-0 first:pt-0">
                  <span className="font-[family-name:var(--font-display)] text-[2rem] font-extrabold leading-none tracking-[-0.05em] text-[var(--color-dtg-red)]">
                    {row.n}
                  </span>
                  <div>
                    <p className="font-[family-name:var(--font-mono)] text-[11px] font-bold uppercase tracking-[0.12em] opacity-60">
                      {row.label}
                    </p>
                    <p className="mt-1 text-[15px] leading-[1.55] opacity-85">{row.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
