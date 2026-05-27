import { Icon } from "@/components/pg/Icon";
import { waLink } from "@/lib/contact";

const TILES = [
  { ic: "search" as const, label: "Job Portal", title: "17 lowongan terbuka", tone: "red" as const },
  { ic: "passport" as const, label: "Learning Portal", title: "2 Paspor tersedia", tone: "gold" as const },
  { ic: "user" as const, label: "Profil & Lamaran", title: "2 lamaran aktif", tone: "red" as const },
  { ic: "check" as const, label: "Status", title: "Diproses · Riyadh", tone: "gold" as const },
];

export function SertFinalCTA() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://app.perantauglobal.com";
  return (
    <section
      className="relative overflow-hidden px-5 md:px-8 py-14 md:py-20"
      style={{ background: "var(--pg-red-900)" }}
    >
      <div className="relative max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-10 lg:gap-14 items-center">
          <div className="flex flex-col gap-5">
            <div
              className="font-mono text-[11px] font-bold uppercase tracking-[0.16em]"
              style={{ color: "var(--pg-gold-200)" }}
            >
              Siap mulai?
            </div>
            <h2
              className="font-extrabold tracking-[-0.03em] leading-[1.05] text-balance m-0"
              style={{
                fontSize: "clamp(32px, 4.5vw, 54px)",
                color: "var(--pg-cream)",
                textShadow: "0 1px 2px rgba(0,0,0,0.18), 0 2px 18px rgba(0,0,0,0.22)",
              }}
            >
              Job &amp; Learning Portal,{" "}
              <span style={{ color: "var(--pg-gold-200)" }}>dalam satu aplikasi.</span>
            </h2>
            <p
              className="font-medium leading-relaxed max-w-[52ch] m-0"
              style={{
                fontSize: "clamp(14px, 1.3vw, 17px)",
                color: "var(--pg-cream)",
                opacity: 0.92,
              }}
            >
              Dream outcome kamu — berangkat ke luar negeri — kamu dapet dari satu pintu: aplikasi
              Perantau Global. Lowongan resmi, persiapan kredensial, status lamaran real-time —
              semuanya di sana.
            </p>
            <div className="flex flex-wrap gap-3 mt-2">
              <a
                href={appUrl}
                className="inline-flex items-center gap-2 px-7 py-4 bg-pg-cream text-pg-red-700 font-extrabold text-[15px] rounded-2xl no-underline transition-transform hover:-translate-y-0.5"
                style={{ boxShadow: "0 14px 34px rgba(0,0,0,0.30)" }}
              >
                Buka Perantau Global
                <Icon name="arrow_right" size={15} stroke={2.4} />
              </a>
              <a
                href={waLink("Halo, saya mau tanya soal Paspor Perantau Global.")}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 px-7 py-4 bg-transparent font-extrabold text-[15px] rounded-2xl no-underline transition-colors border-[1.5px] hover:bg-white/10"
                style={{
                  color: "var(--pg-cream)",
                  borderColor: "rgba(246,239,224,0.45)",
                }}
              >
                <span aria-hidden className="w-2 h-2 rounded-full" style={{ background: "#25D366" }} />
                Tanya via WhatsApp
              </a>
            </div>
          </div>

          {/* App mockup — 4 tiles */}
          <div
            className="relative w-[280px] md:w-[320px] mx-auto lg:ml-auto lg:mr-0 bg-pg-ink-900 rounded-[36px] p-2"
            style={{ boxShadow: "0 30px 60px rgba(20,20,20,0.45), 0 0 0 1px rgba(255,255,255,0.06) inset" }}
            aria-hidden
          >
            <div className="absolute left-1/2 -translate-x-1/2 top-3 w-24 h-5 rounded-full bg-pg-ink-900 z-10" />
            <div className="bg-pg-paper rounded-[28px] overflow-hidden p-3 pt-12 flex flex-col gap-2.5">
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-1.5">
                  <span className="inline-grid place-items-center w-5 h-5 rounded-md bg-pg-red-600 text-white font-extrabold text-[9px]">
                    PG
                  </span>
                  <span className="font-extrabold text-[12px] text-pg-ink-900">Perantau Global</span>
                </div>
                <span className="text-[9px] text-pg-ink-500">Halo, Sari 👋</span>
              </div>
              {TILES.map((t) => (
                <div
                  key={t.label}
                  className="flex items-center gap-2.5 p-2.5 bg-pg-white border border-pg-ink-100 rounded-[12px]"
                >
                  <span
                    className="w-8 h-8 rounded-[8px] grid place-items-center shrink-0"
                    style={
                      t.tone === "red"
                        ? { background: "var(--pg-red-50)", color: "var(--pg-red-600)" }
                        : { background: "rgba(201,138,20,0.18)", color: "var(--pg-gold-700)" }
                    }
                  >
                    <Icon name={t.ic} size={14} stroke={2.2} />
                  </span>
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="font-mono text-[9px] uppercase tracking-[0.08em] text-pg-ink-500">
                      {t.label}
                    </span>
                    <span className="text-[12px] font-extrabold text-pg-ink-900 truncate">{t.title}</span>
                  </div>
                  <span className="text-pg-ink-300 text-[14px]">→</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
