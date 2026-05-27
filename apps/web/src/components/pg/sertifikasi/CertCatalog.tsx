import Link from "next/link";
import { Icon } from "@/components/pg/Icon";
import { waLink } from "@/lib/contact";

const CARDS = [
  {
    slug: "paspor-perantau-global-saudi-arabia",
    country: "Saudi Arabia",
    flag: "🇸🇦",
    name: "Paspor Perantau Global — Saudi Arabia",
    tagline: "Bekal fundamental + psikotes yang diakui, biar kamu makin siap berangkat ke Saudi.",
    xlinkText: "Cocok buat semua lowongan Saudi",
    xlinkHref: "/lowongan?country=Saudi+Arabia",
  },
  {
    slug: "paspor-perantau-global-jepang",
    country: "Jepang",
    flag: "🇯🇵",
    name: "Paspor Perantau Global — Jepang",
    tagline: "Bekal fundamental + psikotes yang diakui, biar kamu makin siap berangkat ke Jepang.",
    xlinkText: "Cocok buat semua lowongan Jepang",
    xlinkHref: "/lowongan?country=Jepang",
  },
];

const INCLUDES = [
  "Psikotes diakui formal",
  "Pelatihan fundamental kerja",
  "Sertifikat Paspor Perantau Global",
];

export function CertCatalog() {
  return (
    <section id="tersedia" className="px-5 md:px-8 py-14 md:py-20 bg-pg-white border-t border-pg-ink-100">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col gap-2 max-w-2xl mb-10">
          <div className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-pg-gold-700">
            Yang tersedia sekarang
          </div>
          <h2 className="text-[24px] md:text-[40px] font-extrabold tracking-[-0.02em] leading-[1.1] text-pg-ink-900 text-balance m-0">
            2 Paspor Perantau Global, <span className="text-pg-gold-700">live.</span>
          </h2>
          <p className="text-[14px] md:text-[16px] font-medium leading-relaxed text-pg-ink-500 mt-2 max-w-[60ch]">
            Pilih yang sesuai negara tujuan kamu. Tiap Paspor berisi psikotes yang diakui formal +
            modul fundamental kerja di negara tersebut + sertifikat resmi.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {CARDS.map((c) => (
            <div
              key={c.slug}
              className="flex flex-col gap-4 p-6 md:p-7 rounded-[22px]"
              style={{
                background: "linear-gradient(135deg, #fcf6e8 0%, #f8eecf 100%)",
                border: "1px solid rgba(201,138,20,0.22)",
                boxShadow: "var(--pg-shadow-1)",
              }}
            >
              <div className="flex items-center justify-between gap-3">
                <span
                  className="inline-flex items-center gap-2 pl-1.5 pr-3 py-1 rounded-full font-mono text-[11px] font-bold tracking-[0.04em] text-pg-ink-900"
                  style={{ background: "var(--pg-white)", border: "1px solid rgba(201,138,20,0.22)" }}
                >
                  <span aria-hidden className="inline-grid place-items-center w-5 h-5 rounded-full text-[13px] leading-none">
                    {c.flag}
                  </span>
                  {c.country}
                </span>
                <span
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-mono text-[10px] font-bold uppercase tracking-[0.08em]"
                  style={{ background: "var(--pg-ok-bg)", color: "var(--pg-ok)" }}
                >
                  <span aria-hidden className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "var(--pg-ok)" }} />
                  Live
                </span>
              </div>

              <h3 className="text-[20px] md:text-[24px] font-extrabold tracking-[-0.018em] text-pg-ink-900 m-0">
                {c.name}
              </h3>
              <p className="text-[13.5px] md:text-[14.5px] text-pg-ink-700 leading-relaxed m-0">
                {c.tagline}
              </p>

              <div className="flex flex-col gap-1.5 mt-1">
                {INCLUDES.map((it) => (
                  <div key={it} className="flex items-start gap-2 text-[13px] text-pg-ink-700">
                    <span
                      className="w-4 h-4 rounded-full grid place-items-center shrink-0 mt-0.5"
                      style={{ background: "var(--pg-gold-700)", color: "var(--pg-cream)" }}
                    >
                      <Icon name="check" size={9} stroke={3} />
                    </span>
                    {it}
                  </div>
                ))}
              </div>

              <div
                className="flex items-center justify-between gap-3 mt-3 pt-3"
                style={{ borderTop: "1px dashed rgba(201,138,20,0.25)" }}
              >
                <div className="flex flex-col">
                  <span className="text-[13.5px] font-bold text-pg-ink-900">Berbayar</span>
                  <span className="font-mono text-[11px] text-pg-ink-500">Rincian biaya menyusul</span>
                </div>
                <a
                  href={waLink(`Halo, saya tertarik Paspor Perantau Global ${c.country}.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 font-bold text-[13px] no-underline"
                  style={{ color: "var(--pg-gold-700)" }}
                >
                  Tanya via WhatsApp
                  <Icon name="arrow_right" size={13} stroke={2.4} />
                </a>
              </div>

              <div className="text-[12px] text-pg-ink-500 mt-1">
                {c.xlinkText} —{" "}
                <Link href={c.xlinkHref} className="text-pg-ink-900 font-semibold underline decoration-pg-ink-300 underline-offset-2 hover:text-pg-red-600">
                  lihat lowongannya
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
