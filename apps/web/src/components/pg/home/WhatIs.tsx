import Link from "next/link";
import { Icon } from "@/components/pg/Icon";
import type { HomePreviewRow } from "@/lib/homePreview";

type Props = {
  totalPositions: number;
  openCount: number;
  countryCount: number;
  /** Countries with a live position, in catalog order. */
  countryNames: string[];
  /** Real catalog rows for the decorative portal preview. */
  rows: HomePreviewRow[];
};

/** "Saudi Arabia, Jepang & Taiwan" / "Saudi Arabia, Jepang, Taiwan & 4 negara lain" */
function countryPhrase(names: string[]): string {
  if (names.length === 0) return "beberapa negara";
  const shown = names.slice(0, 3);
  const rest = names.length - shown.length;
  if (rest > 0) return `${shown.join(", ")} & ${rest} negara lain`;
  if (shown.length === 1) return shown[0]!;
  return `${shown.slice(0, -1).join(", ")} & ${shown[shown.length - 1]!}`;
}

/**
 * WhatIs — dual-portal preview cards.
 *
 * Two big cards: Job Portal (red accent) + Akademi Perantau (gold accent).
 * Akademi Perantau is a "rich coming-soon" stub — schema for Paspor lessons
 * isn't shipped yet, CTA points at /akademi marketing page.
 *
 * Every Job Portal number here comes from the same catalog fetch the rest of
 * the page uses. They were hardcoded ("17 posisi aktif", "4 negara tujuan",
 * and prose naming Indonesia, which has zero active positions) while
 * JobPortalDeep rendered the real count one section below - two different
 * answers on one screen (finding F5).
 */
export function WhatIs({ totalPositions, openCount, countryCount, countryNames, rows }: Props) {
  const stats = [
    { num: String(totalPositions), label: "posisi aktif" },
    { num: String(countryCount), label: "negara tujuan" },
    { num: String(openCount), label: "batch buka" },
  ];

  return (
    <section className="relative py-14 md:py-20 px-5 md:px-8 bg-pg-paper border-t border-pg-ink-100">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col gap-2 max-w-2xl mb-10 md:mb-12">
          <div className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-pg-red-600">
            Apa itu Perantau Global
          </div>
          <h2 className="text-[24px] md:text-[40px] font-extrabold tracking-[-0.02em] leading-[1.1] text-pg-ink-900 text-balance">
            Satu aplikasi. <span className="text-pg-red-600">Dua portal.</span>
          </h2>
          <p className="text-[14px] md:text-[16px] font-medium leading-relaxed text-pg-ink-500 mt-2">
            Lengkap dari cari kerjaan luar negeri sampai siap berangkat. Dua jalur yang saling
            melengkapi — kamu bisa pakai keduanya, atau pilih salah satu.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {/* Job Portal card */}
          <Link
            href="/lowongan"
            className="group flex flex-col gap-5 p-6 md:p-7 bg-pg-white rounded-[22px] border border-pg-ink-100 no-underline transition-all hover:-translate-y-1 hover:border-pg-red-100"
            style={{ boxShadow: "var(--pg-shadow-1)" }}
          >
            <div className="flex items-start gap-4">
              <div
                className="font-mono text-[28px] font-extrabold leading-none"
                style={{ color: "var(--pg-red-600)" }}
              >
                01
              </div>
              <div className="flex flex-col gap-1">
                <div className="font-mono text-[10.5px] font-bold uppercase tracking-[0.12em] text-pg-red-700">
                  Job Portal
                </div>
                <h3 className="text-[20px] md:text-[22px] font-extrabold text-pg-ink-900 tracking-[-0.015em]">
                  Lowongan resmi
                </h3>
              </div>
            </div>
            <p className="text-[14px] md:text-[15px] text-pg-ink-700 leading-relaxed">
              Cari &amp; lamar kerjaan beneran di {countryPhrase(countryNames)}. Semua dari
              employer terverifikasi P3MI — bukan calo, bukan agen luar.
            </p>

            <div
              className="rounded-2xl bg-pg-paper border border-pg-ink-100 p-3 flex flex-col gap-2"
              aria-hidden
            >
              {rows.map((item) => (
                <div key={item.slug} className="flex items-center gap-3 p-2 bg-pg-white rounded-xl border border-pg-ink-100">
                  <div
                    className="w-10 h-10 rounded-[10px] bg-cover bg-center bg-pg-ink-50 shrink-0"
                    style={{ backgroundImage: `url(${item.thumb})` }}
                  />
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="text-[12.5px] font-bold text-pg-ink-900 truncate">{item.role}</span>
                    <span className="font-mono text-[10.5px] text-pg-ink-500 truncate">{item.meta}</span>
                  </div>
                  <div className="flex flex-col items-end shrink-0">
                    <span className="font-mono text-[12px] font-extrabold text-pg-ink-900">{item.salary}</span>
                    {item.open && (
                      <span className="font-mono text-[9px] font-bold tracking-[0.08em] uppercase text-pg-ok mt-0.5 inline-flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-pg-ok inline-block" />
                        Buka
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-3 pt-3 mt-auto border-t border-dashed border-pg-ink-100">
              {stats.map((s) => (
                <div key={s.label} className="flex flex-col">
                  <span className="font-mono text-[20px] font-extrabold text-pg-ink-900 leading-none">{s.num}</span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-pg-ink-500 mt-1">{s.label}</span>
                </div>
              ))}
            </div>

            <span className="inline-flex items-center gap-2 mt-1 font-bold text-[13.5px] text-pg-red-600 transition-transform group-hover:gap-2.5">
              Lihat lowongan
              <Icon name="arrow_right" size={14} stroke={2.6} />
            </span>
          </Link>

          {/* Akademi Perantau card — gold accent, coming-soon stub */}
          <Link
            href="/akademi"
            className="group flex flex-col gap-5 p-6 md:p-7 rounded-[22px] no-underline transition-all hover:-translate-y-1"
            style={{
              background: "linear-gradient(135deg, #fcf6e8 0%, #f8eecf 100%)",
              border: "1px solid rgba(201,138,20,0.22)",
              boxShadow: "var(--pg-shadow-1)",
            }}
          >
            <div className="flex items-start gap-4">
              <div
                className="font-mono text-[28px] font-extrabold leading-none"
                style={{ color: "var(--pg-gold-700)" }}
              >
                02
              </div>
              <div className="flex flex-col gap-1">
                <div className="font-mono text-[10.5px] font-bold uppercase tracking-[0.12em] text-pg-gold-700">
                  Akademi Perantau
                </div>
                <h3 className="text-[20px] md:text-[22px] font-extrabold text-pg-ink-900 tracking-[-0.015em]">
                  Persiapan siap kerja
                </h3>
              </div>
            </div>
            <p className="text-[14px] md:text-[15px] text-pg-ink-700 leading-relaxed">
              Pelatihan bersertifikat bersama Lembaga Vokasi UI, plus kelas gratis persiapan kerja
              yang bisa kamu mulai sekarang. Bukan syarat melamar, tapi bekal yang bikin kamu lebih
              siap waktu diseleksi employer.
            </p>

            <div
              className="rounded-2xl border border-[rgba(201,138,20,0.18)] bg-pg-white/60 p-4 flex flex-col gap-2"
              aria-hidden
            >
              <div className="font-mono text-[10.5px] font-bold uppercase tracking-[0.1em] text-pg-gold-700">
                Paspor Perantau · Modul Negara
              </div>
              <div className="flex flex-wrap gap-2 mt-1">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-pg-white rounded-full border border-[rgba(201,138,20,0.22)] font-mono text-[11px] font-bold text-pg-ink-900">
                  <span className="text-[13px] leading-none">🇸🇦</span>
                  Saudi · Arab dasar
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-pg-white rounded-full border border-[rgba(201,138,20,0.22)] font-mono text-[11px] font-bold text-pg-ink-900">
                  <span className="text-[13px] leading-none">🇯🇵</span>
                  Jepang · JLPT N5
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-3 mt-auto border-t border-dashed border-[rgba(201,138,20,0.25)]">
              {[
                { num: "3", label: "modul utama" },
                { num: "4", label: "bahasa fundamental" },
                { num: "2×", label: "lebih siap lulus" },
              ].map((s) => (
                <div key={s.label} className="flex flex-col">
                  <span className="font-mono text-[20px] font-extrabold text-pg-ink-900 leading-none">{s.num}</span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-pg-ink-500 mt-1">{s.label}</span>
                </div>
              ))}
            </div>

            <span className="inline-flex items-center gap-2 mt-1 font-bold text-[13.5px] text-pg-gold-700 transition-transform group-hover:gap-2.5">
              Lihat Akademi Perantau
              <Icon name="arrow_right" size={14} stroke={2.6} />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
