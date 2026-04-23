import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { localBusinessJsonLd } from "@/lib/jsonld";
import { Icon } from "@/components/pg/Icon";
import { ContactForm } from "@/components/pg/ContactForm";

export const metadata: Metadata = {
  title: "Kontak — Hubungi Perantau Global",
  description:
    "Hubungi PT Daya Talenta Global (Perantau Global) untuk konsultasi penempatan kerja di luar negeri. Email: halo@perantauglobal.com",
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
            <div className="text-[12px] font-bold tracking-[0.12em] uppercase text-pg-red-600">
              Kontak
            </div>
            <h1 className="text-[34px] md:text-6xl font-extrabold tracking-tight mt-2">
              Hubungi kami.
            </h1>
            <p className="text-base md:text-lg text-pg-ink-700 leading-relaxed mt-3">
              Punya pertanyaan tentang lowongan, proses, atau biaya? Email kami atau kirim pesan via
              form di samping. Kami balas dalam 1×24 jam kerja.
            </p>

            <div className="mt-6 space-y-3.5">
              <a
                href="mailto:halo@perantauglobal.com"
                className="flex items-center gap-3 bg-pg-white border border-pg-ink-100 rounded-xl px-4 py-3.5 no-underline text-pg-ink-900 hover:border-pg-ink-200"
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
              <div className="flex items-start gap-3 bg-pg-white border border-pg-ink-100 rounded-xl px-4 py-3.5">
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
            <ContactForm />
          </div>
        </div>
      </main>
    </>
  );
}
