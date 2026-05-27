import type { Metadata } from "next";
import Link from "next/link";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Icon } from "@/components/pg/Icon";
import { PositionCard } from "@/components/pg/PositionCard";
import { WhatsAppFab } from "@/components/pg/WhatsAppFab";
import {
  Chip,
  Eyebrow,
  FinalCTA,
  Section,
} from "@/components/pg/primitives";
import { POSITIONS, type PositionCountry } from "@/lib/positions";
import { fetchOpenJobOrders, mergePositionsWithJobOrders } from "@/lib/positions-db";
import { waLink } from "@/lib/contact";

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

  const jobOrders = await fetchOpenJobOrders();
  const merged = mergePositionsWithJobOrders(jobOrders);
  const visible =
    activeCountry === "Semua"
      ? merged
      : merged.filter((p) => p.country === activeCountry);

  return (
    <>
      <main>
        {/* HERO — Job Portal vision */}
        <Section size="lg" tone="white">
          <Eyebrow>
            {POSITIONS.length} LOWONGAN AKTIF · 4 NEGARA
          </Eyebrow>
          <h1 className="text-[34px] md:text-6xl font-extrabold tracking-[-0.03em] leading-[1.04] mt-3">
            Lowongan kerja luar negeri{" "}
            <span className="text-pg-red-600">yang resmi.</span>
          </h1>
          <p className="text-base md:text-lg text-pg-ink-700 leading-relaxed mt-4 max-w-prose">
            {POSITIONS.length} posisi di Saudi Arabia, Jepang, Taiwan &
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
        </Section>

        {/* Country filter */}
        <Section size="sm" tone="white">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {COUNTRIES.map((c) => (
              <Chip
                key={c}
                active={c === activeCountry}
                href={c === "Semua" ? "/lowongan" : `/lowongan?country=${encodeURIComponent(c)}`}
              >
                {c}
              </Chip>
            ))}
          </div>
        </Section>

        {/* Job cards grid */}
        <Section size="md" tone="white">
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
        </Section>

        {/* Cross-link to sertifikasi — enabler tone */}
        <Section size="sm" tone="white">
          <Link
            href="/sertifikasi"
            className="flex items-center gap-4 p-5 md:p-6 rounded-2xl no-underline transition-all hover:-translate-y-0.5 bg-pg-gold-100/40 border border-pg-gold-border"
          >
            <div
              className="w-11 h-11 rounded-xl grid place-items-center shrink-0 bg-pg-gold-200 text-pg-gold-700"
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
            <span className="inline-flex items-center gap-1 text-[13px] font-bold shrink-0 text-pg-gold-700">
              <span className="hidden sm:inline">Lihat sertifikasi</span>
              <Icon name="arrow_right" size={16} />
            </span>
          </Link>
        </Section>

        {/* Final CTA bookend */}
        <FinalCTA
          eyebrow="Belum nemu yang cocok?"
          title="Kami kabari saat kuota buka."
          body="Daftar antrian buat negara/posisi yang kamu incar. Kami WhatsApp/email begitu batch berikutnya dibuka."
          primaryHref="/kontak"
          primaryLabel="Hubungi kami"
          whatsappHref={waLink(
            "Halo, saya mau daftar antrian buat lowongan berikutnya di Perantau Global.",
          )}
        />
      </main>
      <WhatsAppFab />
    </>
  );
}
