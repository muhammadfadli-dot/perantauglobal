import type { Metadata } from "next";
import Link from "next/link";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Icon } from "@/components/pg/Icon";
import { PositionCard } from "@/components/pg/PositionCard";
import { TrustStrip } from "@/components/pg/TrustStrip";
import { WhatsAppFab } from "@/components/pg/WhatsAppFab";
import { type PositionCountry } from "@/lib/positions";
import { fetchPositionsForCatalog } from "@/lib/positions-db";

export const metadata: Metadata = {
  title: "Lowongan Kerja Luar Negeri — Saudi Arabia, Jepang, Taiwan",
  description:
    "Job Portal Perantau Global: lowongan resmi dari employer terverifikasi P3MI di Saudi Arabia, Jepang, Taiwan & Indonesia. Bebas biaya sebelum offering letter, tanpa calo.",
};

export const revalidate = 60;

const COUNTRIES: ("Semua" | PositionCountry)[] = [
  "Semua",
  "Saudi Arabia",
  "Jepang",
  "Taiwan",
  "Indonesia",
];

const FEATURES = [
  {
    icon: "shield" as const,
    title: "Lowongan resmi P3MI",
    body: "Setiap lowongan dikonfirmasi langsung ke employer. Bukan calo, bukan agen luar.",
  },
  {
    icon: "user" as const,
    title: "1 profil, semua lamaran",
    body: "Lengkapi profil & dokumen sekali. Apply ke banyak posisi tanpa upload ulang.",
  },
  {
    icon: "clock" as const,
    title: "Pantau status real-time",
    body: "Tiap tahap (Terkirim → Diproses → Hasil) update di akun Perantau Global kamu.",
  },
];

export default async function LowonganIndexPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ country?: string }>;
}) {
  const { locale } = await params;
  if (locale !== "id") notFound();
  setRequestLocale(locale);

  const { country } = await searchParams;
  const activeCountry =
    country && COUNTRIES.includes(country as PositionCountry)
      ? (country as PositionCountry)
      : "Semua";

  const merged = await fetchPositionsForCatalog();
  const visible =
    activeCountry === "Semua"
      ? merged
      : merged.filter((p) => p.country === activeCountry);

  return (
    <>
      <TrustStrip />
      <main>
        {/* HERO — Job Portal vision */}
        <section className="px-5 md:px-8 pt-10 md:pt-16 pb-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-[11px] md:text-[12px] font-bold tracking-[0.18em] uppercase text-pg-red-600 font-mono">
              Job Portal · Fitur 1
            </div>
            <h1 className="text-[34px] md:text-6xl font-extrabold tracking-[-0.03em] leading-[1.04] mt-3">
              Lowongan kerja luar negeri{" "}
              <span className="text-pg-red-600">yang resmi.</span>
            </h1>
            <p className="text-base md:text-lg text-pg-ink-700 leading-relaxed mt-4 max-w-prose">
              {merged.length} posisi di Saudi Arabia, Jepang, Taiwan &
              Indonesia — semua dari employer terverifikasi P3MI. Satu profil,
              apply ke banyak posisi, pantau status real-time. Bebas biaya
              sebelum offering letter.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mt-8">
              {FEATURES.map((f) => (
                <div
                  key={f.title}
                  className="flex flex-col gap-2 p-4 md:p-5 rounded-2xl bg-pg-paper border border-pg-ink-100"
                >
                  <div
                    className="w-10 h-10 rounded-xl grid place-items-center"
                    style={{ background: "var(--pg-red-50)", color: "var(--pg-red-600)" }}
                  >
                    <Icon name={f.icon} size={20} stroke={2.2} />
                  </div>
                  <div className="text-[15px] md:text-base font-extrabold tracking-tight">
                    {f.title}
                  </div>
                  <div className="text-[13px] md:text-[14px] text-pg-ink-600 leading-relaxed">
                    {f.body}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Country filter */}
        <div className="px-5 md:px-8 pb-4 pt-2">
          <div className="max-w-6xl mx-auto">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {COUNTRIES.map((c) => {
                const active = c === activeCountry;
                return (
                  <Link
                    key={c}
                    href={c === "Semua" ? "/lowongan" : `/lowongan?country=${encodeURIComponent(c)}`}
                    scroll={false}
                    className={`inline-flex items-center gap-1.5 h-9 px-3.5 text-sm font-semibold rounded-full whitespace-nowrap border-[1.5px] no-underline transition-colors ${
                      active
                        ? "bg-pg-ink-900 text-white border-pg-ink-900"
                        : "bg-pg-white text-pg-ink-700 border-pg-ink-200 hover:border-pg-ink-300"
                    }`}
                  >
                    {c}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        <section className="px-5 md:px-8 pb-10">
          <div className="max-w-6xl mx-auto">
            {visible.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {visible.map((p) => (
                  <PositionCard key={p.slug} p={p} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-pg-ink-500">
                Belum ada posisi untuk {activeCountry} saat ini.{" "}
                <Link href="/lowongan" className="text-pg-red-600 font-bold no-underline">
                  Lihat semua
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Cross-link to sertifikasi — enabler tone */}
        <section className="px-5 md:px-8 pb-4">
          <div className="max-w-6xl mx-auto">
            <Link
              href="/sertifikasi"
              className="flex items-center gap-4 p-5 md:p-6 rounded-2xl no-underline transition-all hover:-translate-y-0.5"
              style={{
                background: "rgba(201,138,20,0.07)",
                border: "1px solid rgba(201,138,20,0.22)",
              }}
            >
              <div
                className="w-11 h-11 rounded-xl grid place-items-center shrink-0"
                style={{ background: "rgba(201,138,20,0.14)", color: "#8a5e0a" }}
              >
                <Icon name="passport" size={22} stroke={2.2} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[15px] md:text-base font-extrabold text-pg-ink-900">
                  Biar makin siap berangkat
                </div>
                <div className="text-[13px] md:text-[14px] text-pg-ink-600 leading-relaxed mt-0.5">
                  Paspor Perantau Global menyiapkan psikotes & fundamental per
                  negara. Bukan syarat — tapi bikin kamu lebih siap.
                </div>
              </div>
              <span
                className="inline-flex items-center gap-1 text-[13px] font-bold shrink-0"
                style={{ color: "#8a5e0a" }}
              >
                <span className="hidden sm:inline">Lihat sertifikasi</span>
                <Icon name="arrow_right" size={16} />
              </span>
            </Link>
          </div>
        </section>

        <section className="px-5 md:px-8 py-10 md:py-12 bg-pg-ink-50 border-t border-pg-ink-100">
          <div className="max-w-3xl mx-auto flex gap-3 items-start">
            <div
              className="w-9 h-9 rounded-[10px] grid place-items-center shrink-0"
              style={{ background: "var(--pg-red-100)", color: "var(--pg-red-700)" }}
            >
              <Icon name="info" size={20} />
            </div>
            <div>
              <div className="font-bold text-base">Belum ada batch yang cocok?</div>
              <div className="text-sm text-pg-ink-500 mt-1 leading-relaxed">
                Daftar antrian untuk posisi yang kamu minati. Kami kabari lewat
                email saat batch baru dibuka.
              </div>
            </div>
          </div>
        </section>
      </main>
      <WhatsAppFab />
    </>
  );
}
