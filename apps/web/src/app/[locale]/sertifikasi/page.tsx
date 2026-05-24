import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { Icon } from "@/components/pg/Icon";
import { TrustStrip } from "@/components/pg/TrustStrip";
import { WhatsAppFab } from "@/components/pg/WhatsAppFab";
import { CERTIFICATIONS } from "@/lib/certifications";

export const metadata: Metadata = {
  title: "Sertifikasi Siap Kerja — Paspor Perantau Global",
  description:
    "Paspor Perantau Global: psikotes yang diakui formal + pelatihan fundamental per negara tujuan (Saudi Arabia, Jepang). Bukan syarat dari kami — kredensial yang memang kamu butuhkan untuk berangkat.",
};

export const dynamic = "force-static";

export function generateStaticParams() {
  return [{ locale: "id" }];
}

const GOLD = "#8a5e0a";

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
      <TrustStrip />
      <main>
        {/* HERO */}
        <section
          className="px-5 md:px-8 pt-10 md:pt-16 pb-12 md:pb-16"
          style={{ background: "linear-gradient(180deg, #fefbf3 0%, var(--pg-paper) 100%)" }}
        >
          <div className="max-w-4xl mx-auto">
            <div
              className="text-[11px] md:text-[12px] font-bold tracking-[0.18em] uppercase font-mono mb-3"
              style={{ color: GOLD }}
            >
              Sertifikasi · Paspor Perantau Global
            </div>
            <h1 className="text-[34px] md:text-6xl font-extrabold tracking-[-0.03em] leading-[1.04]">
              Bekal yang bikin kamu{" "}
              <span style={{ color: GOLD }}>siap berangkat.</span>
            </h1>
            <p className="text-base md:text-lg text-pg-ink-700 leading-relaxed mt-5 max-w-prose">
              Untuk kerja ke luar negeri, kamu memang butuh beberapa kredensial —
              salah satunya psikotes yang diakui. <b>Paspor Perantau Global</b>{" "}
              menyatukannya dalam satu paket per negara: psikotes yang diakui
              formal + pelatihan fundamental. Bukan syarat dari kami — tapi hal
              yang memang kamu perlukan, dan kami bantu siapkan.
            </p>
          </div>
        </section>

        {/* KATALOG — Paspor (live) */}
        <section className="px-5 md:px-8 py-14 md:py-20">
          <div className="max-w-6xl mx-auto">
            <div className="max-w-2xl mb-8">
              <h2 className="text-[26px] md:text-4xl font-extrabold tracking-[-0.03em] leading-[1.05]">
                Paspor Perantau Global
              </h2>
              <p className="text-[15px] md:text-[16px] text-pg-ink-700 leading-relaxed mt-3">
                Tersedia per negara tujuan. Pilih yang sesuai lowongan yang kamu incar.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 md:gap-5">
              {paspor.map((c) => (
                <Link
                  key={c.slug}
                  href={`/sertifikasi/${c.slug}`}
                  className="group flex flex-col gap-4 p-6 md:p-8 rounded-3xl no-underline transition-all hover:-translate-y-1 hover:shadow-lg"
                  style={{
                    background: "rgba(201,138,20,0.06)",
                    border: "1px solid rgba(201,138,20,0.22)",
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div
                      className="w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center"
                      style={{ background: "rgba(201,138,20,0.14)", color: GOLD }}
                    >
                      <Icon name="passport" size={26} stroke={2.2} />
                    </div>
                    <span
                      className="text-[10px] font-bold tracking-[0.16em] uppercase font-mono px-2.5 py-1 rounded-full"
                      style={{ background: "rgba(15,138,74,0.10)", color: "#0a6e3a" }}
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
                        <span style={{ color: GOLD }} className="mt-0.5">
                          <Icon name="check" size={14} stroke={2.6} />
                        </span>
                        {it}
                      </li>
                    ))}
                  </ul>
                  <div
                    className="mt-auto pt-3 flex items-center justify-between"
                    style={{ borderTop: "1px solid rgba(201,138,20,0.22)" }}
                  >
                    <span className="text-[13px] font-bold text-pg-ink-900">
                      {c.price}
                      {c.priceNote ? (
                        <span className="text-pg-ink-500 font-medium"> · {c.priceNote}</span>
                      ) : null}
                    </span>
                    <span
                      className="inline-flex items-center gap-1 text-[13px] font-bold"
                      style={{ color: GOLD }}
                    >
                      Lihat detail <Icon name="arrow_right" size={14} />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CARA KERJA */}
        <section className="px-5 md:px-8 py-14 md:py-20 bg-white border-y border-pg-ink-100">
          <div className="max-w-6xl mx-auto">
            <div className="max-w-2xl mb-10">
              <div
                className="text-[11px] md:text-[12px] font-bold tracking-[0.18em] uppercase font-mono mb-3"
                style={{ color: GOLD }}
              >
                Cara kerja
              </div>
              <h2 className="text-[26px] md:text-4xl font-extrabold tracking-[-0.03em] leading-[1.05]">
                4 langkah, semua dari aplikasi.
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 md:gap-5">
              {STEPS.map((s) => (
                <div
                  key={s.n}
                  className="flex flex-col gap-3 p-5 md:p-6 rounded-2xl bg-pg-paper border border-pg-ink-100"
                >
                  <div
                    className="text-2xl font-mono font-extrabold"
                    style={{ color: GOLD }}
                  >
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
          </div>
        </section>

        {/* SKILL-SPECIFIC — coming soon */}
        {skill.length > 0 && (
          <section className="px-5 md:px-8 py-14 md:py-20">
            <div className="max-w-6xl mx-auto">
              <div className="max-w-2xl mb-8">
                <div className="text-[11px] md:text-[12px] font-bold tracking-[0.18em] uppercase text-pg-ink-500 font-mono mb-3">
                  Segera
                </div>
                <h2 className="text-[24px] md:text-3xl font-extrabold tracking-[-0.03em] leading-[1.1]">
                  Sertifikasi skill-specific
                </h2>
                <p className="text-[14px] md:text-[15px] text-pg-ink-600 leading-relaxed mt-3">
                  Sertifikasi seperti bahasa atau SIM internasional sedang kami
                  siapkan lewat mitra resmi. Diumumkan di aplikasi Perantau Global.
                </p>
              </div>
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
            </div>
          </section>
        )}
      </main>
      <WhatsAppFab />
    </>
  );
}
