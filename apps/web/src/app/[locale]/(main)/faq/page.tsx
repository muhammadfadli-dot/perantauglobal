import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { faqJsonLd } from "@/lib/jsonld";
import { Icon } from "@/components/pg/Icon";
import { FinalCTA, PageHero } from "@/components/pg/primitives";
import { waLink } from "@/lib/contact";

export const metadata: Metadata = {
  title: "FAQ — Pertanyaan umum Perantau Global",
  description:
    "Jawaban untuk pertanyaan paling sering ditanyakan tentang biaya, proses, persyaratan, dan timeline kerja luar negeri via Perantau Global.",
};

export const dynamic = "force-static";
export function generateStaticParams() {
  return [{ locale: "id" }];
}

const FAQ_GROUPS = [
  {
    title: "Biaya & pembayaran",
    items: [
      {
        q: "Apakah benar-benar bebas biaya?",
        a: "Iya. Kamu bebas biaya sebelum menerima offering letter dari employer. Setelah employer menerima kamu, baru muncul biaya keberangkatan untuk dokumen (MCU GAMCA, Apostille, QVP, Enjaz, dll.) — angkanya berbeda per posisi & negara.",
      },
      {
        q: "Berapa biaya keberangkatannya?",
        a: "Berbeda per posisi: contoh Perawat Saudi Arabia Rp 20 juta, Barista Saudi Rp 8 juta, Spa Therapist Rp 4 juta. Cek detail di halaman lowongan masing-masing.",
      },
      {
        q: "Apakah ada cicilan untuk biaya keberangkatan?",
        a: "Untuk diskusi cicilan, hubungi tim kami via email setelah kamu terima offering letter. Kami akan bantu cari skema yang paling masuk akal untuk kamu.",
      },
    ],
  },
  {
    title: "Proses & timeline",
    items: [
      {
        q: "Berapa lama proses dari daftar sampai berangkat?",
        a: "Rata-rata sekitar 4 bulan. Bergantung pada posisi, kelengkapan dokumen kamu, dan jadwal employer / kedutaan negara tujuan.",
      },
      {
        q: "Apa saja tahapnya?",
        a: "5 tahap: (1) Daftar & lengkapi profil, (2) Seleksi awal, (3) Wawancara dengan employer, (4) Dokumen & medical check-up, (5) Berangkat.",
      },
      {
        q: "Apakah ada sertifikasi atau pelatihan dari Perantau Global?",
        a: "Ada. Perantau Global menyediakan Paspor Perantau Global — sertifikasi siap kerja (psikotes yang diakui formal + pelatihan fundamental) per negara tujuan, tersedia untuk Saudi Arabia & Jepang. Ini berbayar dan bukan syarat dari kami, tapi membantu kamu siap berangkat. Sertifikasi skill-specific (bahasa, SIM) sedang kami siapkan lewat mitra resmi.",
      },
    ],
  },
  {
    title: "Persyaratan",
    items: [
      {
        q: "Bagaimana jika saya belum punya passport?",
        a: "Tidak masalah. Kamu bisa daftar dulu, kami pandu cara mengurus passport sambil proses seleksi berjalan.",
      },
      {
        q: "Apakah harus sudah pernah kerja di luar negeri?",
        a: "Tidak. Banyak posisi terbuka untuk first-timer. Yang penting kamu memenuhi persyaratan minimal (pendidikan, usia, kualifikasi spesifik).",
      },
      {
        q: "Apakah kontrak bisa diperpanjang?",
        a: "Bisa. Setelah kontrak pertama (umumnya 2 tahun), kamu bisa perpanjang dengan employer atau ambil posisi baru via DTG.",
      },
    ],
  },
];

export default async function FAQPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (locale !== "id") notFound();
  setRequestLocale(locale);

  const allFaqItems = FAQ_GROUPS.flatMap((g) =>
    g.items.map((it) => ({ question: it.q, answer: it.a }))
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(allFaqItems)) }}
      />
      <main>
        <PageHero
          eyebrow="FAQ"
          title="Pertanyaan umum."
          lede={
            <>
              Jawaban untuk hal-hal yang paling sering ditanyakan calon kandidat. Kalau masih ada
              pertanyaan, email kami di{" "}
              <a href="mailto:halo@perantauglobal.com" className="text-pg-red-600 font-semibold">
                halo@perantauglobal.com
              </a>
              .
            </>
          }
        />

        <section className="px-5 md:px-8 pb-10 md:pb-16">
          <div className="max-w-3xl mx-auto">
            {FAQ_GROUPS.map((group) => (
              <section key={group.title} className="mt-10">
                <h2 className="text-xl md:text-2xl font-extrabold tracking-tight mb-3">
                  {group.title}
                </h2>
                <div>
                  {group.items.map((item, i) => (
                    <details
                      key={item.q}
                      className={`group py-4 ${i ? "border-t border-pg-ink-100" : ""}`}
                    >
                      <summary className="flex items-center justify-between cursor-pointer list-none">
                        <span className="text-base font-semibold text-pg-ink-900 pr-3">{item.q}</span>
                        <Icon
                          name="chevron_down"
                          size={18}
                          className="text-pg-ink-400 group-open:rotate-180 transition-transform shrink-0"
                        />
                      </summary>
                      <div className="mt-2 text-[15px] text-pg-ink-700 leading-relaxed">
                        {item.a}
                      </div>
                    </details>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </section>

        <FinalCTA
          title={<>Masih ada pertanyaan?</>}
          body="Tim kami siap bantu. Mulai dari lowongan atau langsung tanya via WhatsApp."
          primaryHref="/lowongan"
          primaryLabel="Lihat lowongan"
          whatsappHref={waLink("Halo, saya mau tanya tentang Perantau Global.")}
        />
      </main>
    </>
  );
}
