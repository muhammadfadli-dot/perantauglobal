import Link from "next/link";
import { Icon } from "@/components/pg/Icon";
import { waLink } from "@/lib/contact";

/**
 * FinalCTAv2 — homepage postcard-stack closer.
 *
 * Replaces the generic red-bookend FinalCTA primitive for the homepage.
 * Other pages (lowongan/[slug], sertifikasi, etc.) still use the original
 * `FinalCTA` from primitives.tsx.
 */

const POSTCARDS = [
  {
    flag: "🇸🇦",
    eyebrow: "Outbound · Batch Juni",
    fromLabel: "From",
    from: "Indonesia",
    toLabel: "To",
    to: "Riyadh",
    salary: "SAR 3.200",
    role: "Perawat · 2 thn",
    rotate: -3,
  },
  {
    flag: "🇯🇵",
    eyebrow: "Sistem SSW",
    fromLabel: "From",
    from: "Indonesia",
    toLabel: "To",
    to: "Osaka",
    salary: "¥250.000",
    role: "Truck Driver · 5 thn",
    rotate: 2,
  },
  {
    flag: "🇹🇼",
    eyebrow: "Kontrak 3 tahun",
    fromLabel: "From",
    from: "Indonesia",
    toLabel: "To",
    to: "Taipei",
    salary: "NT$ 29.500",
    role: "Caregiver · 3 thn",
    rotate: -1.5,
  },
  {
    flag: "🇮🇩",
    eyebrow: "Domestik",
    fromLabel: "Lokasi",
    from: "Indonesia",
    toLabel: "Penempatan",
    to: "Jakarta+",
    salary: "SPG",
    role: "Domestik · Fleksibel",
    rotate: 3,
  },
];

export function FinalCTAv2() {
  return (
    <section
      className="relative overflow-hidden border-t border-pg-ink-100"
      style={{ background: "var(--pg-red-900)" }}
    >
      {/* Decoration: dashed flight paths */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{ color: "rgba(255,255,255,0.4)" }}
      >
        <svg viewBox="0 0 1200 600" preserveAspectRatio="xMidYMid slice" className="w-full h-full">
          <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 6" strokeLinecap="round">
            <path d="M 0,420 C 200,360 400,310 600,290 S 1000,260 1200,200" />
            <path d="M 0,500 C 250,440 450,400 650,360 S 1050,300 1200,280" />
            <path d="M 0,340 C 180,300 380,260 580,240 S 980,210 1200,160" />
          </g>
          <g fill="currentColor">
            <circle cx="120" cy="430" r="3" />
            <circle cx="320" cy="380" r="3" />
            <circle cx="600" cy="320" r="3" />
            <circle cx="880" cy="270" r="3" />
            <circle cx="1080" cy="220" r="3" />
          </g>
        </svg>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-5 md:px-8 py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-12 items-center">
          {/* Left: copy + CTAs */}
          <div className="flex flex-col gap-5">
            <div
              className="inline-flex self-start font-mono text-[11px] font-bold uppercase tracking-[0.16em]"
              style={{ color: "var(--pg-gold-200)" }}
            >
              Siap mulai?
            </div>
            <h2
              className="font-extrabold tracking-[-0.03em] leading-[1.05] text-balance"
              style={{
                fontSize: "clamp(32px, 4.5vw, 54px)",
                color: "var(--pg-cream)",
                textShadow: "0 1px 2px rgba(0,0,0,0.18), 0 2px 18px rgba(0,0,0,0.22)",
              }}
            >
              Dari Indonesia, ke <span style={{ color: "var(--pg-gold-200)" }}>seluruh dunia.</span>
            </h2>
            <p
              className="font-medium leading-relaxed max-w-md"
              style={{
                fontSize: "clamp(14px, 1.3vw, 17px)",
                color: "var(--pg-cream)",
                opacity: 0.94,
                textShadow: "0 1px 6px rgba(0,0,0,0.18)",
              }}
            >
              Perjalananmu mulai dari satu langkah kecil — lihat lowongan, atau ngobrol sama orang
              kami dulu. Gratis, tanpa komitmen.
            </p>
            <div className="flex flex-wrap gap-3 mt-3">
              <Link
                href="/lowongan"
                className="inline-flex items-center justify-center gap-2 px-7 py-4 bg-pg-cream text-pg-red-700 font-extrabold text-[16px] rounded-2xl no-underline transition-transform hover:-translate-y-0.5"
                style={{ boxShadow: "0 14px 34px rgba(0,0,0,0.30)" }}
              >
                Lihat lowongan
                <Icon name="arrow_right" size={16} stroke={2.4} />
              </Link>
              <a
                href={waLink("Halo, saya mau tanya soal kerja luar negeri.")}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2.5 px-7 py-4 bg-transparent font-extrabold text-[16px] rounded-2xl no-underline transition-colors border-[1.5px] hover:bg-white/10"
                style={{
                  color: "var(--pg-cream)",
                  borderColor: "rgba(246,239,224,0.45)",
                }}
              >
                <span
                  aria-hidden
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ background: "#25D366" }}
                />
                Tanya via WhatsApp
              </a>
            </div>
            <div
              className="flex flex-wrap gap-x-4 gap-y-2 mt-3 font-mono text-[10px] font-semibold uppercase tracking-[0.08em]"
              style={{ color: "var(--pg-cream)", opacity: 0.92 }}
            >
              <span>Gratis</span>
              <span>·</span>
              <span>Tanpa bayar di awal</span>
              <span>·</span>
              <span>Tanpa calo</span>
            </div>
          </div>

          {/* Right: postcard stack */}
          <div
            aria-hidden
            className="relative grid grid-cols-2 gap-3 md:gap-4 max-w-md mx-auto lg:ml-auto lg:mr-0"
          >
            {POSTCARDS.map((p, i) => (
              <div
                key={p.flag}
                className="relative flex flex-col gap-2 p-4 bg-pg-cream/95 rounded-2xl transition-transform"
                style={{
                  transform: `rotate(${p.rotate}deg)`,
                  boxShadow: "0 18px 36px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.06)",
                  zIndex: i + 1,
                }}
              >
                <span
                  className="absolute -top-2 -right-2 inline-grid place-items-center w-9 h-9 rounded-full bg-pg-white"
                  style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}
                >
                  <span className="text-[18px] leading-none">{p.flag}</span>
                </span>
                <div className="font-mono text-[9.5px] font-bold uppercase tracking-[0.1em] text-pg-red-700 flex items-center gap-1.5">
                  <span className="inline-grid place-items-center w-4 h-4 rounded-full bg-pg-red-700 text-white text-[8px]">
                    ✈
                  </span>
                  {p.eyebrow}
                </div>
                <div className="flex items-end gap-2 mt-1">
                  <div className="flex flex-col">
                    <span className="font-mono text-[8.5px] uppercase tracking-[0.1em] text-pg-ink-500">{p.fromLabel}</span>
                    <span className="text-[13px] font-extrabold text-pg-ink-900 leading-tight">{p.from}</span>
                  </div>
                  <div className="flex-1 h-px border-t border-dashed border-pg-ink-300 self-end mb-2 mx-1" />
                  <div className="flex flex-col items-end">
                    <span className="font-mono text-[8.5px] uppercase tracking-[0.1em] text-pg-ink-500">{p.toLabel}</span>
                    <span className="text-[13px] font-extrabold text-pg-ink-900 leading-tight">{p.to}</span>
                  </div>
                </div>
                <div className="flex flex-col mt-1 pt-2 border-t border-pg-ink-100">
                  <span className="font-mono text-[12px] font-extrabold text-pg-ink-900">{p.salary}</span>
                  <span className="text-[10.5px] font-medium text-pg-ink-500 mt-0.5 truncate">{p.role}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
