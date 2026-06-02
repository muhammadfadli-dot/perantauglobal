import { Icon } from "@/components/pg/Icon";
import { PasporCardMockup } from "./PasporCardMockup";

export function SertHero() {
  return (
    <section className="relative overflow-hidden px-5 md:px-8 pt-12 pb-16 md:pt-16 md:pb-20">
      {/* Gold tint backdrop — soft gradient */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 20% 0%, #fcf6e8 0%, transparent 50%), radial-gradient(circle at 80% 100%, #f8eecf 0%, transparent 40%)",
        }}
      />

      <div className="relative max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-10 lg:gap-14 items-center">
          {/* Copy column */}
          <div className="flex flex-col gap-5">
            <div className="inline-flex flex-wrap items-center gap-2.5">
              <span
                className="inline-flex items-center px-3 py-1.5 rounded-full font-mono text-[10.5px] font-bold uppercase tracking-[0.12em]"
                style={{
                  background: "rgba(201,138,20,0.18)",
                  color: "var(--pg-gold-700)",
                  border: "1px solid rgba(201,138,20,0.25)",
                }}
              >
                Akademi Perantau
              </span>
              <span className="font-mono text-[11px] font-semibold text-pg-ink-500 tracking-[0.04em]">
                Paspor Perantau Global · sister of Job Portal
              </span>
            </div>
            <h1
              className="font-extrabold tracking-[-0.035em] leading-[1.02] text-pg-ink-900 text-balance m-0"
              style={{ fontSize: "clamp(36px, 5.4vw, 64px)" }}
            >
              Bekal yang memang kamu butuhin,{" "}
              <span className="text-pg-gold-700">dalam satu paket.</span>
            </h1>
            <p
              className="text-pg-ink-700 leading-relaxed font-medium m-0"
              style={{ fontSize: "clamp(15px, 1.3vw, 18px)", maxWidth: "52ch" }}
            >
              Untuk berangkat kerja ke luar negeri, kamu butuh kredensial yang diakui — salah
              satunya psikotes formal. Perantau Global menyatukannya dalam satu paket per negara,
              biar kamu nggak perlu cari sendiri-sendiri.
            </p>
            <div className="flex flex-wrap gap-3 mt-2">
              <a
                href="#tersedia"
                className="inline-flex items-center justify-center gap-2 px-[22px] py-4 bg-pg-red-600 text-white font-bold text-[15px] rounded-[14px] no-underline transition-all hover:bg-pg-red-700 hover:-translate-y-0.5"
                style={{ boxShadow: "0 4px 12px rgba(215,38,47,0.15)" }}
              >
                Lihat yang tersedia
                <Icon name="arrow_right" size={15} stroke={2.4} />
              </a>
              <a
                href="#apa-itu"
                className="inline-flex items-center justify-center px-[22px] py-4 bg-pg-white text-pg-ink-900 font-bold text-[15px] rounded-[14px] border-[1.5px] border-pg-ink-200 no-underline transition-all hover:border-pg-ink-300 hover:-translate-y-0.5"
              >
                Apa itu Akademi Perantau?
              </a>
            </div>
          </div>

          {/* Paspor mockup stage */}
          <div
            className="relative w-full mx-auto"
            style={{ maxWidth: 460, height: 420 }}
            aria-hidden
          >
            <PasporCardMockup
              variant="peek"
              countryName="JEPANG"
              flag="🇯🇵"
              serial="PPG/JPN/0001"
              holderName="{ NAMA KANDIDAT }"
              rotation={-6}
              zIndex={1}
              offset={{ top: 16, left: 0 }}
            />
            <PasporCardMockup
              variant="main"
              countryName="SAUDI ARABIA"
              flag="🇸🇦"
              serial="PPG/SAU/0001"
              holderName="{ NAMA KANDIDAT }"
              rotation={4}
              zIndex={2}
              offset={{ top: 50, right: 0 }}
            />
            <div
              className="absolute z-[3] w-[100px] h-[100px] grid place-items-center rounded-full text-pg-cream"
              style={{
                bottom: 20,
                left: "30%",
                background: "radial-gradient(circle, #c98a14 0%, #8a5e0a 100%)",
                transform: "rotate(-8deg)",
                boxShadow: "0 12px 28px rgba(138,94,10,0.40), 0 0 0 4px rgba(255,255,255,0.55) inset",
              }}
            >
              <div className="text-center leading-tight">
                <div className="font-mono text-[8px] uppercase tracking-[0.12em] opacity-85">Psikotes</div>
                <div className="font-extrabold text-[15px] tracking-[0.04em] my-0.5">Diakui</div>
                <div className="font-mono text-[8px] uppercase tracking-[0.12em] opacity-85">P3MI · 2026</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
