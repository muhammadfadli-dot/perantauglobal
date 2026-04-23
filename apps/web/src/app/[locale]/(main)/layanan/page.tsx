import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { Icon, type IconName } from "@/components/pg/Icon";

export const metadata: Metadata = {
  title: "Layanan — Perantau Global",
  description:
    "Layanan penempatan tenaga kerja Indonesia ke luar negeri oleh PT Daya Talenta Global: rekrutmen, dokumen, briefing, dan aftercare.",
};

export const dynamic = "force-static";
export function generateStaticParams() {
  return [{ locale: "id" }];
}

const SERVICES: { icon: IconName; title: string; desc: string }[] = [
  {
    icon: "search",
    title: "Rekrutmen & sourcing",
    desc: "Cari kandidat yang cocok dengan kebutuhan employer — dari posting lowongan, screening, sampai shortlist.",
  },
  {
    icon: "users",
    title: "Wawancara & seleksi",
    desc: "Fasilitasi wawancara antara kandidat dan employer, baik online maupun onsite.",
  },
  {
    icon: "doc",
    title: "Dokumen & legalisasi",
    desc: "Pengurusan passport, visa, MCU, apostille, dan dokumen lain sesuai negara tujuan.",
  },
  {
    icon: "shield",
    title: "Briefing pre-departure",
    desc: "Pembekalan pre-departure: budaya negara tujuan, hak-hak PMI, kontak darurat, do's & don'ts.",
  },
  {
    icon: "globe",
    title: "Aftercare",
    desc: "Dukungan setelah berangkat: monitoring kesejahteraan, mediasi jika ada masalah dengan employer.",
  },
];

export default async function LayananPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (locale !== "id") notFound();
  setRequestLocale(locale);

  return (
    <main className="px-5 md:px-8 py-10 md:py-16">
      <div className="max-w-6xl mx-auto">
        <div className="text-[12px] font-bold tracking-[0.12em] uppercase text-pg-red-600">
          Layanan
        </div>
        <h1 className="text-[34px] md:text-6xl font-extrabold tracking-tight mt-2 leading-[1.05]">
          Apa yang kami
          <br />
          <span className="text-pg-red-600">kerjakan.</span>
        </h1>
        <p className="text-base md:text-lg text-pg-ink-700 leading-relaxed mt-4 max-w-prose">
          Sebagai P3MI resmi, kami tangani end-to-end dari sourcing kandidat sampai aftercare di
          negara tujuan. Berikut layanan utama kami.
        </p>

        <div className="grid md:grid-cols-2 gap-4 mt-8 md:mt-10">
          {SERVICES.map((s) => (
            <div key={s.title} className="bg-pg-white border border-pg-ink-100 rounded-2xl p-5 flex gap-4">
              <div
                className="w-12 h-12 rounded-xl grid place-items-center shrink-0"
                style={{ background: "var(--pg-red-50)", color: "var(--pg-red-700)" }}
              >
                <Icon name={s.icon} size={24} stroke={2} />
              </div>
              <div>
                <div className="text-base md:text-lg font-bold tracking-tight">{s.title}</div>
                <div className="text-sm md:text-base text-pg-ink-700 mt-1 leading-relaxed">
                  {s.desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
