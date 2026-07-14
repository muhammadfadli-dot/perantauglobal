import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { Icon } from "@/components/pg/Icon";
import { FinalCTA, PageHero, Section, SectionHeader } from "@/components/pg/primitives";
import { waLink } from "@/lib/contact";

export const metadata: Metadata = {
  title: "Tentang Kami — Perantau Global",
  description:
    "PT Daya Talenta Global (Perantau Global) — P3MI resmi Kemnaker. Berdiri 2024, bagian dari Dayalima yang sudah jalan di bidang rekrutmen sejak 1998. Kerja luar negeri legal, transparan, tanpa calo.",
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
      <PageHero
        eyebrow="Tentang kami"
        title={
          <>
            Kerja luar negeri,
            <br />
            <span className="text-pg-red-600">aman & jelas.</span>
          </>
        }
      >
        <p className="text-base md:text-lg text-pg-ink-700 leading-relaxed max-w-prose">
          PT Daya Talenta Global (DTG) resmi berdiri Oktober 2024 sebagai perusahaan
          penempatan kerja luar negeri, dengan izin P3MI No. 1810240237512001 dari
          Kementerian Tenaga Kerja. Walaupun nama Perantau Global terbilang baru, kami
          bagian dari <b className="text-pg-ink-900">Dayalima</b> — perusahaan Indonesia
          yang sudah jalan di bidang rekrutmen & pengembangan tenaga kerja sejak 1998.
        </p>
        <p className="text-base md:text-lg text-pg-ink-700 leading-relaxed mt-4 max-w-prose">
          Misi kami sederhana: kerja luar negeri harus aman, legal, dan jelas — bukan janji
          manis tanpa back-up. Kami percaya transparansi soal proses dan biaya adalah hak setiap
          PMI.
        </p>
      </PageHero>

      <Section tone="ink" size="md" border="both">
        <SectionHeader
          eyebrow="Nilai kami"
          title="Yang kami pegang teguh."
        />
        <div className="grid md:grid-cols-3 gap-4 mt-6 md:mt-8">
          {VALUES.map((v) => (
            <div key={v.title} className="bg-pg-white border border-pg-ink-100 rounded-2xl p-5">
              <div
                className="w-12 h-12 rounded-xl grid place-items-center"
                style={{ background: "var(--pg-red-50)", color: "var(--pg-red-700)" }}
              >
                <Icon name={v.icon} size={24} stroke={2} />
              </div>
              <div className="text-lg font-bold tracking-tight mt-3">{v.title}</div>
              <div className="text-base text-pg-ink-700 mt-2 leading-relaxed">{v.desc}</div>
            </div>
          ))}
        </div>
      </Section>

      <FinalCTA
        title={<>Siap mulai perjalanan kamu?</>}
        body="Lihat lowongan yang lagi buka, atau jelajahi sertifikasi siap kerja."
        primaryHref="/lowongan"
        primaryLabel="Lihat lowongan"
        whatsappHref={waLink("Halo, saya mau tanya tentang Perantau Global.")}
      />
    </main>
  );
}
