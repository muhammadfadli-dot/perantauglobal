import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { FinalCTA, PageHero } from "@/components/pg/primitives";
import { waLink } from "@/lib/contact";

export const metadata: Metadata = {
  title: "Proses Penempatan — Perantau Global",
  description:
    "5 tahap proses penempatan kerja luar negeri yang transparan: daftar, seleksi awal, wawancara, dokumen & medical, berangkat. Rata-rata 4 bulan total.",
};

export const dynamic = "force-static";
export function generateStaticParams() {
  return [{ locale: "id" }];
}

const STEPS = [
  {
    n: "01",
    t: "Daftar & lengkapi profil",
    d: "Isi form singkat (nama, email, kota, pendidikan). Kami kirim tautan ke email — tinggal klik untuk masuk Perantau Global. Lengkapi profil dan upload dokumen (KTP, passport, foto, CV).",
    duration: "1–7 hari",
  },
  {
    n: "02",
    t: "Seleksi awal",
    d: "Tim recruiter cocokkan profil kamu dengan kebutuhan posisi. Kalau hard requirement terpenuhi, kamu lanjut ke tahap berikutnya.",
    duration: "3–7 hari",
  },
  {
    n: "03",
    t: "Wawancara",
    d: "Wawancara dengan tim PIC kami dulu, lalu dengan employer langsung (online via video call atau onsite di kantor employer / Jakarta).",
    duration: "1–3 minggu",
  },
  {
    n: "04",
    t: "Dokumen & medical",
    d: "Pengurusan dokumen: passport, visa, MCU, apostille, dll. Daftar lengkap tergantung negara tujuan. Biaya keberangkatan keluar di tahap ini.",
    duration: "1–2 bulan",
  },
  {
    n: "05",
    t: "Berangkat",
    d: "Tiket pesawat siap, briefing pre-departure, dan jemput di bandara tujuan oleh tim employer atau partner kami di sana.",
    duration: "1 hari",
  },
];

export default async function ProsesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (locale !== "id") notFound();
  setRequestLocale(locale);

  return (
    <main>
      <PageHero
        eyebrow="Proses"
        title={
          <>
            Dari daftar
            <br />
            ke <span className="text-pg-red-600">terbang.</span>
          </>
        }
        lede={
          <>
            5 tahap, rata-rata <b className="text-pg-ink-900">4 bulan</b>. Semua transparan — kamu
            tahu di tahap mana, tinggal apa, dan biayanya kapan.
          </>
        }
      />

      <section className="px-5 md:px-8 pb-10 md:pb-16">
        <div className="max-w-3xl mx-auto">
          <div className="mt-2 md:mt-4">
            {STEPS.map((s, i, arr) => (
              <div
                key={s.n}
                className="grid grid-cols-[40px_1fr] md:grid-cols-[60px_1fr] gap-4 md:gap-6 pb-8"
              >
                <div className="relative">
                  <div
                    className="w-9 h-9 md:w-12 md:h-12 rounded-full grid place-items-center text-white text-sm md:text-base font-extrabold"
                    style={{ background: "var(--pg-red-600)" }}
                  >
                    {s.n}
                  </div>
                  {i < arr.length - 1 && (
                    <div className="absolute left-[17px] md:left-[23px] top-9 md:top-12 -bottom-8 w-0.5 bg-pg-ink-200" />
                  )}
                </div>
                <div className="pt-1">
                  <div className="text-lg md:text-2xl font-extrabold tracking-tight">{s.t}</div>
                  <div className="text-sm font-mono text-pg-red-600 mt-1">{s.duration}</div>
                  <div className="text-base text-pg-ink-700 leading-relaxed mt-2 max-w-prose">
                    {s.d}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <FinalCTA
        title={<>Mulai dari sini?</>}
        body="Pilih lowongan yang sesuai, lalu kami pandu tiap tahap."
        primaryHref="/lowongan"
        primaryLabel="Lihat lowongan"
        whatsappHref={waLink("Halo, saya mau tanya tentang proses penempatan.")}
      />
    </main>
  );
}
