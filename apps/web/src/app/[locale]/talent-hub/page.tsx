import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { Icon } from "@/components/pg/Icon";
import { ButtonLink } from "@/components/pg/primitives";

export const metadata: Metadata = {
  title: "Talent Hub — Aplikasi Perantau Global",
  description:
    "Talent Hub adalah aplikasi Perantau Global tempat kamu apply lowongan kerja luar negeri, lengkapi profil sekali, pantau status lamaran. Coming soon: training gratis Global Talent Ready.",
};

export const dynamic = "force-static";

export function generateStaticParams() {
  return [{ locale: "id" }];
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://app.perantauglobal.com";

const FEATURES: { icon: Parameters<typeof Icon>[0]["name"]; title: string; desc: string }[] = [
  {
    icon: "briefcase",
    title: "Apply lowongan luar negeri",
    desc: "13 posisi di Saudi Arabia, Jepang, Taiwan, dan Indonesia. Satu profil bisa apply ke banyak posisi.",
  },
  {
    icon: "user",
    title: "Lengkapi profil sekali",
    desc: "Upload KTP, passport, foto, CV. Pakai untuk semua lamaran ke depan — gak perlu isi ulang.",
  },
  {
    icon: "clock",
    title: "Pantau status lamaran",
    desc: "Lihat tahap lamaran kamu real-time: sedang diseleksi, wawancara, diterima.",
  },
  {
    icon: "sparkle",
    title: "Training gratis (coming soon)",
    desc: "Sertifikasi Global Talent Ready — kami sedang siapkan kurikulumnya. Stay tuned.",
  },
];

const STEPS = [
  { n: "01", t: "Daftar", d: "Email + nomor HP. Tanpa password — kami kirim tautan masuk." },
  { n: "02", t: "Lengkapi profil", d: "Data diri, dokumen, kualifikasi — sekali isi, dipakai semua." },
  { n: "03", t: "Apply lowongan", d: "Pilih posisi yang cocok, jawab pertanyaan tambahan, kirim." },
];

export default async function TalentHubPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (locale !== "id") notFound();
  setRequestLocale(locale);

  return (
    <main>
      {/* Hero */}
      <section className="px-5 md:px-8 pt-8 md:pt-16 pb-10 md:pb-16">
        <div className="max-w-6xl mx-auto md:grid md:grid-cols-2 md:gap-12 md:items-center">
          <div>
            <div className="text-[12px] font-bold tracking-[0.12em] uppercase text-pg-red-600">
              Aplikasi Perantau Global
            </div>
            <h1 className="text-[34px] md:text-6xl font-extrabold leading-[1.1] tracking-tight mt-3">
              Talent Hub.
              <br />
              <span className="text-pg-red-600">Pintu kerja luar negeri kamu.</span>
            </h1>
            <p className="text-base md:text-lg text-pg-ink-700 leading-relaxed mt-4 max-w-prose">
              Tempat kamu apply lowongan, lengkapi profil sekali, dan pantau status lamaran. Tanpa
              password, tanpa biaya sebelum kamu diterima.
            </p>
            <div className="flex flex-col sm:flex-row gap-2.5 mt-6 max-w-md">
              <ButtonLink href={APP_URL} variant="primary" block>
                Buka Talent Hub <Icon name="arrow_right" size={18} />
              </ButtonLink>
              <ButtonLink href="/lowongan" variant="ghost" block>
                Lihat lowongan dulu
              </ButtonLink>
            </div>
          </div>
          {/* Hero photo */}
          <div className="hidden md:block">
            <div className="relative rounded-3xl overflow-hidden text-white aspect-[4/5]">
              <Image
                src="/images/program/global-talent-hub-hero.jpg"
                alt="Kandidat Perantau Global sedang belajar dengan peta dunia di belakang"
                fill
                priority
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover"
              />
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(14,14,16,.05) 0%, rgba(14,14,16,.2) 45%, rgba(14,14,16,.82) 100%)",
                }}
              />
              <div className="absolute top-5 left-5 inline-flex items-center gap-2 bg-white/95 backdrop-blur text-pg-ink-900 px-3 py-1.5 rounded-full text-[11px] font-bold tracking-[0.12em] uppercase">
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: "var(--pg-red-600)" }}
                />
                Talent Hub · Aplikasi
              </div>
              <div className="absolute inset-x-0 bottom-0 p-8">
                <div
                  className="text-[11px] font-bold tracking-[0.14em] uppercase"
                  style={{ color: "var(--pg-red-500)" }}
                >
                  Satu pintu
                </div>
                <div className="text-5xl font-extrabold leading-[0.98] tracking-tight mt-2 text-balance">
                  Daftar.
                  <br />
                  Apply.
                  <br />
                  Berangkat.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-5 md:px-8 pb-12 md:pb-20 bg-pg-ink-50 py-10 md:py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-[12px] font-bold tracking-[0.12em] uppercase text-pg-red-600">
            Yang bisa kamu lakukan
          </div>
          <h2 className="text-[22px] md:text-4xl font-extrabold tracking-tight mt-1.5 mb-6 md:mb-10">
            Semua dalam satu aplikasi.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="bg-pg-white border border-pg-ink-100 rounded-2xl p-5 flex gap-4"
              >
                <div
                  className="w-12 h-12 rounded-xl grid place-items-center shrink-0"
                  style={{ background: "var(--pg-red-50)", color: "var(--pg-red-700)" }}
                >
                  <Icon name={f.icon} size={24} stroke={2} />
                </div>
                <div>
                  <div className="text-base md:text-lg font-bold tracking-tight">{f.title}</div>
                  <div className="text-sm md:text-base text-pg-ink-700 mt-1 leading-relaxed">
                    {f.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How to start */}
      <section className="px-5 md:px-8 py-10 md:py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-[12px] font-bold tracking-[0.12em] uppercase text-pg-red-600">
            Cara mulai
          </div>
          <h2 className="text-[22px] md:text-4xl font-extrabold tracking-tight mt-1.5 mb-8 md:mb-12">
            3 langkah, semuanya online.
          </h2>
          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {STEPS.map((s) => (
              <div key={s.n} className="bg-pg-white border border-pg-ink-100 rounded-2xl p-6">
                <div className="text-2xl font-mono font-semibold text-pg-red-600">{s.n}</div>
                <div className="text-xl font-extrabold tracking-tight mt-2">{s.t}</div>
                <div className="text-base text-pg-ink-700 leading-relaxed mt-2">{s.d}</div>
              </div>
            ))}
          </div>
          <div className="mt-8 max-w-md">
            <ButtonLink href={APP_URL} variant="primary" block>
              Buka Talent Hub <Icon name="arrow_right" size={18} />
            </ButtonLink>
          </div>
        </div>
      </section>
    </main>
  );
}
