import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { Icon } from "@/components/pg/Icon";
import {
  FinalCTA,
  PageHero,
  Section,
  SectionHeader,
} from "@/components/pg/primitives";
import { WhatsAppFab } from "@/components/pg/WhatsAppFab";
import { CERTIFICATIONS } from "@/lib/certifications";
import { waLink } from "@/lib/contact";

export const metadata: Metadata = {
  title: "Sertifikasi Siap Kerja — Paspor Perantau Global",
  description:
    "Paspor Perantau Global: psikotes yang diakui formal + pelatihan fundamental per negara tujuan (Saudi Arabia, Jepang). Bukan syarat dari kami — kredensial yang memang kamu butuhkan untuk berangkat.",
};

export const dynamic = "force-static";

export function generateStaticParams() {
  return [{ locale: "id" }];
}

const STEPS = [
  { n: "01", t: "Pilih Paspor negara tujuan", d: "Saudi Arabia atau Jepang — sesuai lowongan yang kamu incar." },
  { n: "02", t: "Pelatihan fundamental", d: "Modul singkat soal aturan & budaya kerja negara tujuan. Bisa dari HP." },
  { n: "03", t: "Psikotes", d: "Tes kesiapan kerja sesuai standar keberangkatan luar negeri." },
  { n: "04", t: "Sertifikat terbit", d: "Paspor Perantau Global terbit di akun kamu, siap dipakai melamar." },
];

export default async function SertifikasiPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (locale !== "id") notFound();
  setRequestLocale(locale);

  const paspor = CERTIFICATIONS.filter((c) => c.kind === "paspor");
  const skill = CERTIFICATIONS.filter((c) => c.kind === "skill");

  return (
    <>
      <main>
        <PageHero
          eyebrow="Sertifikasi · Paspor Perantau Global"
          title={<>Bekal yang bikin kamu siap berangkat.</>}
          lede={
            <>
              Untuk kerja ke luar negeri, kamu memang butuh beberapa kredensial —
              salah satunya psikotes yang diakui. <b>Paspor Perantau Global</b>{" "}
              menyatukannya dalam satu paket per negara: psikotes yang diakui
              formal + pelatihan fundamental. Bukan syarat dari kami — tapi hal
              yang memang kamu perlukan, dan kami bantu siapkan.
            </>
          }
        />

        {/* KATALOG — Paspor (live) */}
        <Section size="lg" tone="transparent">
          <SectionHeader
            eyebrow="Katalog"
            eyebrowTone="red"
            title="Paspor Perantau Global"
            intro="Tersedia per negara tujuan. Pilih yang sesuai lowongan yang kamu incar."
            className="mb-8"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 md:gap-5">
            {paspor.map((c) => (
              <Link
                key={c.slug}
                href={`/sertifikasi/${c.slug}`}
                className="group flex flex-col gap-4 p-6 md:p-8 rounded-3xl no-underline transition-all hover:-translate-y-1 hover:shadow-lg bg-pg-gold-50 border border-pg-gold-border"
              >
                <div className="flex items-center justify-between">
                  <div
                    className="w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center bg-pg-gold-100 text-pg-gold-700"
                  >
                    <Icon name="passport" size={26} stroke={2.2} />
                  </div>
                  <span
                    className="text-[10px] font-bold tracking-[0.16em] uppercase font-mono px-2.5 py-1 rounded-full bg-pg-ok-bg text-pg-ok"
                  >
                    Tersedia
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="text-[20px] md:text-[24px] font-extrabold tracking-[-0.02em] leading-[1.15]">
                    {c.name}
                  </h3>
                  <p className="text-[13.5px] md:text-[15px] text-pg-ink-700 leading-relaxed mt-1">
                    {c.tagline}
                  </p>
                </div>
                <ul className="flex flex-col gap-1.5 mt-1">
                  {c.includes.map((it) => (
                    <li key={it} className="flex items-start gap-2 text-[13px] text-pg-ink-600">
                      <span className="mt-0.5 text-pg-gold-700">
                        <Icon name="check" size={14} stroke={2.6} />
                      </span>
                      {it}
                    </li>
                  ))}
                </ul>
                <div className="mt-auto pt-3 flex items-center justify-between border-t border-pg-gold-border">
                  <span className="text-[13px] font-bold text-pg-ink-900">
                    {c.price}
                    {c.priceNote ? (
                      <span className="text-pg-ink-500 font-medium"> · {c.priceNote}</span>
                    ) : null}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[13px] font-bold text-pg-gold-700">
                    Lihat detail <Icon name="arrow_right" size={14} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </Section>

        {/* CARA KERJA */}
        <Section size="lg" tone="white" border="both">
          <SectionHeader
            eyebrow="Cara kerja"
            eyebrowTone="red"
            title="4 langkah, semua dari aplikasi."
            className="mb-10"
          />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 md:gap-5">
            {STEPS.map((s) => (
              <div
                key={s.n}
                className="flex flex-col gap-3 p-5 md:p-6 rounded-2xl bg-pg-paper border border-pg-ink-100"
              >
                <div className="text-2xl font-mono font-extrabold text-pg-gold-700">
                  {s.n}
                </div>
                <div className="text-[16px] md:text-[17px] font-extrabold tracking-tight">
                  {s.t}
                </div>
                <div className="text-[13px] md:text-[14px] text-pg-ink-600 leading-relaxed">
                  {s.d}
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* SKILL-SPECIFIC — coming soon */}
        {skill.length > 0 && (
          <Section size="lg" tone="transparent">
            <SectionHeader
              eyebrow="Segera"
              eyebrowTone="ink"
              title="Sertifikasi skill-specific"
              intro="Sertifikasi seperti bahasa atau SIM internasional sedang kami siapkan lewat mitra resmi. Diumumkan di aplikasi Perantau Global."
              className="mb-8"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {skill.map((c) => (
                <div
                  key={c.slug}
                  className="flex items-center gap-3.5 p-4 rounded-2xl border border-pg-ink-100 bg-pg-paper"
                >
                  <div
                    className="w-10 h-10 rounded-xl grid place-items-center shrink-0"
                    style={{ background: "var(--pg-ink-100)", color: "var(--pg-ink-500)" }}
                  >
                    <Icon name={c.icon} size={20} stroke={2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[15px] font-bold text-pg-ink-900">{c.name}</div>
                    <div className="text-[12.5px] text-pg-ink-500">{c.tagline}</div>
                  </div>
                  <span className="text-[10px] font-bold tracking-[0.16em] uppercase font-mono text-pg-ink-400 shrink-0">
                    Segera
                  </span>
                </div>
              ))}
            </div>
          </Section>
        )}

        <FinalCTA
          eyebrow="Belum yakin?"
          title="Mau lihat lowongan dulu?"
          body="Sertifikasi sifatnya bantu kamu lebih cepat keterima — bukan syarat. Lowongan tetep bisa kamu lamar tanpa Paspor."
          primaryHref="/lowongan"
          primaryLabel="Lihat lowongan"
          whatsappHref={waLink("Halo, saya mau tanya soal Paspor Perantau Global.")}
        />
      </main>
      <WhatsAppFab />
    </>
  );
}
