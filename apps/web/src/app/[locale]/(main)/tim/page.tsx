import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { Icon } from "@/components/pg/Icon";

export const metadata: Metadata = {
  title: "Tim — Perantau Global",
  description: "Tim profesional Perantau Global yang membantu kamu kerja di luar negeri.",
};

export const dynamic = "force-static";
export function generateStaticParams() {
  return [{ locale: "id" }];
}

export default async function TimPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (locale !== "id") notFound();
  setRequestLocale(locale);

  return (
    <main className="px-5 md:px-8 py-10 md:py-16">
      <div className="max-w-3xl mx-auto">
        <div className="text-[12px] font-bold tracking-[0.12em] uppercase text-pg-red-600">Tim</div>
        <h1 className="text-[34px] md:text-6xl font-extrabold tracking-tight mt-2">
          Tim kami.
        </h1>
        <p className="text-base md:text-lg text-pg-ink-700 leading-relaxed mt-3">
          Tim Perantau Global terdiri dari recruiter berpengalaman, PIC tiap negara tujuan, tim
          dokumen, dan tim aftercare. Kami semua di Jakarta, siap pandu kamu dari pendaftaran
          sampai berangkat — dan setelahnya.
        </p>

        <div className="mt-8 bg-pg-white border border-pg-ink-100 rounded-2xl p-5 md:p-6 flex gap-4 items-start">
          <div
            className="w-12 h-12 rounded-xl grid place-items-center shrink-0"
            style={{ background: "var(--pg-red-50)", color: "var(--pg-red-700)" }}
          >
            <Icon name="info" size={24} stroke={2} />
          </div>
          <div>
            <div className="text-base md:text-lg font-bold tracking-tight">Profil tim lengkap</div>
            <div className="text-sm md:text-base text-pg-ink-700 mt-1 leading-relaxed">
              Daftar lengkap tim & PIC kami akan diumumkan secara berkala di aplikasi Perantau Global. Untuk
              pertanyaan spesifik, email{" "}
              <a href="mailto:halo@perantauglobal.com" className="text-pg-red-600 font-semibold">
                halo@perantauglobal.com
              </a>
              .
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
