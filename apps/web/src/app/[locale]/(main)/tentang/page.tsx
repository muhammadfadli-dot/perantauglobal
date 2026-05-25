import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { Icon } from "@/components/pg/Icon";
import { ButtonLink } from "@/components/pg/primitives";

export const metadata: Metadata = {
  title: "Tentang Kami — Perantau Global",
  description:
    "PT Daya Talenta Global (Perantau Global) — P3MI resmi Kemnaker. Berdiri 2024, bagian dari DayaLima yang sudah jalan di bidang rekrutmen sejak 1998. Kerja luar negeri legal, transparan, tanpa calo.",
};

export const dynamic = "force-static";
export function generateStaticParams() {
  return [{ locale: "id" }];
}

const VALUES = [
  {
    icon: "shield" as const,
    title: "Resmi & legal",
    desc: "Lisensi P3MI Kemnaker. Semua proses sesuai regulasi pemerintah Indonesia & negara tujuan.",
  },
  {
    icon: "wallet" as const,
    title: "Bebas biaya di awal",
    desc: "Kamu tidak bayar apapun sebelum employer menerima kamu lewat offering letter.",
  },
  {
    icon: "users" as const,
    title: "Pendampingan penuh",
    desc: "Tim recruiter & PIC kami pandu kamu dari daftar sampai berangkat — dan setelahnya.",
  },
];

export default async function TentangPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (locale !== "id") notFound();
  setRequestLocale(locale);

  return (
    <main>
      <section className="px-5 md:px-8 pt-10 md:pt-16 pb-10">
        <div className="max-w-4xl mx-auto">
          <div className="text-[12px] font-bold tracking-[0.12em] uppercase text-pg-red-600">
            Tentang kami
          </div>
          <h1 className="text-[34px] md:text-6xl font-extrabold tracking-tight mt-2 leading-[1.05]">
            Kerja luar negeri,
            <br />
            <span className="text-pg-red-600">aman & jelas.</span>
          </h1>
          <p className="text-base md:text-lg text-pg-ink-700 leading-relaxed mt-5 max-w-prose">
            PT Daya Talenta Global (DTG) resmi berdiri Oktober 2024 sebagai perusahaan
            penempatan kerja luar negeri, dengan izin P3MI No. 1810240237512001 dari
            Kementerian Tenaga Kerja. Walaupun nama Perantau Global terbilang baru, kami
            bagian dari <b className="text-pg-ink-900">DayaLima</b> — perusahaan Indonesia
            yang sudah jalan di bidang rekrutmen & pengembangan tenaga kerja sejak 1998.
          </p>
          <p className="text-base md:text-lg text-pg-ink-700 leading-relaxed mt-4 max-w-prose">
            Misi kami sederhana: kerja luar negeri harus aman, legal, dan jelas — bukan janji
            manis tanpa back-up. Kami percaya transparansi soal proses dan biaya adalah hak setiap
            PMI.
          </p>
        </div>
      </section>

      <section className="px-5 md:px-8 py-10 md:py-12 bg-pg-ink-50 border-y border-pg-ink-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-[12px] font-bold tracking-[0.12em] uppercase text-pg-red-600">
            Nilai kami
          </div>
          <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight mt-1.5 mb-6 md:mb-8">
            Yang kami pegang teguh.
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {VALUES.map((v) => (
              <div key={v.title} className="bg-pg-white border border-pg-ink-100 rounded-2xl p-5">
                <div
                  className="w-12 h-12 rounded-xl grid place-items-center"
                  style={{ background: "var(--pg-red-50)", color: "var(--pg-red-700)" }}
                >
                  <Icon name={v.icon} size={24} stroke={2} />
                </div>
                <div className="text-lg font-bold tracking-tight mt-3.5">{v.title}</div>
                <div className="text-base text-pg-ink-700 mt-1.5 leading-relaxed">{v.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 md:px-8 py-10 md:py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight">
            Siap mulai perjalanan kamu?
          </h2>
          <p className="text-base md:text-lg text-pg-ink-700 mt-3 leading-relaxed">
            Lihat lowongan yang lagi buka, atau jelajahi sertifikasi siap kerja untuk persiapan berangkat.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
            <ButtonLink href="/lowongan" variant="primary">
              Lihat lowongan <Icon name="arrow_right" size={18} />
            </ButtonLink>
            <ButtonLink href="/sertifikasi" variant="ghost">
              Lihat sertifikasi
            </ButtonLink>
          </div>
        </div>
      </section>
    </main>
  );
}
