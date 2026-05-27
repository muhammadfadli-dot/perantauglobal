import { Icon } from "@/components/pg/Icon";
import { PasporCardMockup } from "./PasporCardMockup";

const FEATURES = [
  {
    icon: "passport" as const,
    title: "Paspor digital + serial verifikasi",
    desc: "Tersimpan di akun Perantau Global kamu. Serial bisa diverifikasi employer.",
  },
  {
    icon: "check" as const,
    title: "Hasil psikotes yang diakui formal",
    desc: "Hasil terstandarisasi yang biasa dipakai employer luar negeri saat seleksi.",
  },
  {
    icon: "shield" as const,
    title: "Sertifikat resmi PT Daya Talenta Global",
    desc: "Bukti kamu udah ikut bekal fundamental kerja di negara tujuan kamu.",
  },
];

export function KamuDapet() {
  return (
    <section className="px-5 md:px-8 py-14 md:py-20 bg-pg-paper border-t border-pg-ink-100">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-12 lg:gap-16 items-center">
          {/* Copy + features */}
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <div className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-pg-gold-700">
                Apa yang kamu dapet
              </div>
              <h2 className="text-[24px] md:text-[36px] font-extrabold tracking-[-0.022em] leading-[1.1] text-pg-ink-900 text-balance m-0">
                Sertifikat resmi{" "}
                <span className="text-pg-gold-700">+ kredensial yang bisa kamu pakai.</span>
              </h2>
              <p className="text-[14px] md:text-[15.5px] font-medium leading-relaxed text-pg-ink-500 mt-2 max-w-[60ch]">
                Setelah selesai modul + psikotes, kamu dapet 3 hal: paspor digital di akun, hasil
                psikotes yang bisa dipakai melamar, dan sertifikat resmi dari PT Daya Talenta
                Global.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              {FEATURES.map((f) => (
                <div
                  key={f.title}
                  className="flex items-start gap-3 p-3.5 rounded-2xl bg-pg-white"
                  style={{ border: "1px solid rgba(201,138,20,0.18)" }}
                >
                  <span
                    className="w-9 h-9 rounded-[10px] grid place-items-center shrink-0"
                    style={{ background: "rgba(201,138,20,0.18)", color: "var(--pg-gold-700)" }}
                  >
                    <Icon name={f.icon} size={18} stroke={2.2} />
                  </span>
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <div className="text-[14px] font-extrabold text-pg-ink-900">{f.title}</div>
                    <div className="text-[12.5px] text-pg-ink-500 leading-snug">{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Credential stage */}
          <div
            className="relative w-full mx-auto"
            style={{ maxWidth: 460, height: 420 }}
            aria-hidden
          >
            <PasporCardMockup
              variant="peek"
              countryName="JEPANG"
              flag="🇯🇵"
              serial="PPG/JPN/0042"
              holderName="BUDI SANTOSO"
              rotation={-5}
              zIndex={1}
              offset={{ top: 24, left: 0 }}
            />
            <PasporCardMockup
              variant="main"
              countryName="SAUDI ARABIA"
              flag="🇸🇦"
              serial="PPG/SAU/0127"
              holderName="SARI WIJAYA"
              rotation={3}
              zIndex={2}
              offset={{ top: 60, right: 0 }}
            />
            <div
              className="absolute z-[3] w-[110px] h-[110px] grid place-items-center rounded-full text-pg-cream"
              style={{
                bottom: 10,
                left: "32%",
                background: "radial-gradient(circle, #6e1923 0%, #4b1018 100%)",
                transform: "rotate(6deg)",
                boxShadow: "0 12px 28px rgba(74,16,24,0.45), 0 0 0 4px rgba(255,255,255,0.55) inset",
              }}
            >
              <div className="text-center leading-tight">
                <div className="font-mono text-[8px] uppercase tracking-[0.12em] opacity-85">Verifikasi</div>
                <div className="font-extrabold text-[15px] tracking-[0.04em] my-0.5">Resmi</div>
                <div className="font-mono text-[8px] uppercase tracking-[0.12em] opacity-85">PT DTG · 2026</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
