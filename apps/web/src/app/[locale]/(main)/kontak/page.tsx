import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { localBusinessJsonLd } from "@/lib/jsonld";
import { Icon } from "@/components/pg/Icon";
import { waLink } from "@/lib/contact";
import { Eyebrow } from "@/components/pg/primitives";

export const metadata: Metadata = {
  title: "Kontak — Hubungi Perantau Global",
  description:
    "Hubungi PT Daya Talenta Global (Perantau Global) untuk konsultasi penempatan kerja di luar negeri. Chat WhatsApp atau email halo@perantauglobal.com",
};

export const dynamic = "force-static";
export function generateStaticParams() {
  return [{ locale: "id" }];
}

export default async function KontakPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (locale !== "id") notFound();
  setRequestLocale(locale);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd()) }}
      />
      <main className="px-5 md:px-8 py-10 md:py-16">
        <div className="max-w-6xl mx-auto md:grid md:grid-cols-2 md:gap-12">
          <div>
            <Eyebrow>Kontak</Eyebrow>
            <h1 className="text-[34px] md:text-6xl font-extrabold tracking-tight mt-2 leading-[1.05]">
              Hubungi kami.
            </h1>
            <p className="text-base md:text-lg text-pg-ink-700 leading-relaxed mt-3">
              Punya pertanyaan tentang lowongan, proses, atau biaya? Chat admin kami langsung di
              WhatsApp — cara paling cepat. Atau email kami di bawah.
            </p>

            <div className="mt-6 space-y-3">
              <a
                href="mailto:halo@perantauglobal.com"
                className="flex items-center gap-3 bg-pg-white border border-pg-ink-100 rounded-xl px-4 py-3 no-underline text-pg-ink-900 hover:border-pg-ink-200"
              >
                <div
                  className="w-10 h-10 rounded-[10px] grid place-items-center shrink-0"
                  style={{ background: "var(--pg-red-50)", color: "var(--pg-red-700)" }}
                >
                  <Icon name="mail" size={20} stroke={2} />
                </div>
                <div className="flex-1">
                  <div className="text-sm text-pg-ink-500">Email</div>
                  <div className="text-base font-bold">halo@perantauglobal.com</div>
                </div>
                <Icon name="arrow_right" size={18} className="text-pg-ink-400" />
              </a>
              <div className="flex items-start gap-3 bg-pg-white border border-pg-ink-100 rounded-xl px-4 py-3">
                <div
                  className="w-10 h-10 rounded-[10px] grid place-items-center shrink-0"
                  style={{ background: "var(--pg-red-50)", color: "var(--pg-red-700)" }}
                >
                  <Icon name="pin" size={20} stroke={2} />
                </div>
                <div>
                  <div className="text-sm text-pg-ink-500">Kantor</div>
                  <div className="text-base font-bold">Jakarta, Indonesia</div>
                  <div className="text-sm text-pg-ink-500 mt-1">PT Daya Talenta Global · P3MI Resmi</div>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-8 md:mt-0">
            <div className="bg-pg-white border border-pg-ink-100 rounded-2xl p-6 md:p-8">
              <div className="text-[12px] font-bold tracking-[0.12em] uppercase text-pg-red-600">
                Chat langsung
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mt-1">
                Tanya admin di WhatsApp
              </h2>
              <p className="text-base text-pg-ink-700 leading-relaxed mt-3">
                Cara tercepat dapat jawaban. Chat langsung dengan admin Perantau Global soal lowongan,
                proses, biaya, atau kendala akun — dijawab tim kami, bukan bot.
              </p>
              <a
                href={waLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex items-center justify-center gap-2 w-full min-h-[52px] px-6 rounded-xl text-white font-bold no-underline"
                style={{ background: "var(--pg-red-600)" }}
              >
                <Icon name="phone" size={20} stroke={2} /> Chat di WhatsApp
              </a>
              <p className="text-[13px] text-pg-ink-500 mt-3 text-center">
                Nomor WhatsApp resmi Perantau Global.
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
