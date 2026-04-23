import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Icon } from "@/components/pg/Icon";
import { PositionCard } from "@/components/pg/PositionCard";
import { POSITIONS, type PositionCountry } from "@/lib/positions";
import { fetchOpenJobOrders, mergePositionsWithJobOrders } from "@/lib/positions-db";

export const metadata: Metadata = {
  title: "Lowongan Kerja Luar Negeri — Saudi Arabia, Jepang, Taiwan",
  description:
    "13 posisi tersedia di Saudi Arabia, Jepang, Taiwan, dan Indonesia. Bebas biaya sebelum offering letter. Proses resmi P3MI Perantau Global.",
};

export const revalidate = 60;

export function generateStaticParams() {
  return [{ locale: "id" }];
}

const COUNTRIES: ("Semua" | PositionCountry)[] = [
  "Semua",
  "Saudi Arabia",
  "Jepang",
  "Taiwan",
  "Indonesia",
];

export default async function LowonganIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (locale !== "id") notFound();
  setRequestLocale(locale);

  const jobOrders = await fetchOpenJobOrders();
  const merged = mergePositionsWithJobOrders(jobOrders);

  return (
    <main>
      <section className="px-5 md:px-8 pt-8 md:pt-12 pb-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-[12px] font-bold tracking-[0.12em] uppercase text-pg-red-600">
            {POSITIONS.length} posisi
          </div>
          <h1 className="text-[34px] md:text-6xl font-extrabold tracking-tight mt-2">
            Lowongan kerja.
          </h1>
          <p className="text-base md:text-lg text-pg-ink-700 leading-relaxed mt-3 max-w-prose">
            Pilih posisi yang cocok. Badge hijau berarti batch sedang dibuka — kamu bisa langsung
            apply.
          </p>
        </div>
      </section>

      {/* Filter chips — client interactivity later; for now visual */}
      <div className="px-5 md:px-8 pb-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {COUNTRIES.map((c, i) => (
              <a
                key={c}
                href={c === "Semua" ? "#all" : `#${c.toLowerCase().replace(/\s+/g, "-")}`}
                className={`inline-flex items-center gap-1.5 h-9 px-3.5 text-sm font-semibold rounded-full whitespace-nowrap border-[1.5px] no-underline transition-colors ${
                  i === 0
                    ? "bg-pg-ink-900 text-white border-pg-ink-900"
                    : "bg-pg-white text-pg-ink-700 border-pg-ink-200 hover:border-pg-ink-300"
                }`}
              >
                {c}
              </a>
            ))}
          </div>
        </div>
      </div>

      <section id="all" className="px-5 md:px-8 pb-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {merged.map((p) => (
              <PositionCard key={p.slug} p={p} />
            ))}
          </div>
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
              Daftar antrian untuk posisi yang kamu minati. Kami kabari lewat email saat batch baru
              dibuka.
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
