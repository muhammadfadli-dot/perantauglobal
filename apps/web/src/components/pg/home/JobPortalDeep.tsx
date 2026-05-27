import Link from "next/link";
import { Icon } from "@/components/pg/Icon";

const FEATURES = [
  {
    icon: "shield" as const,
    title: "Resmi P3MI Kemnaker",
    sub: "Izin No. 1810240237512001 — bisa kamu cek sendiri di sipptki.kemnaker.go.id.",
  },
  {
    icon: "user" as const,
    title: "1 profil, semua lamaran",
    sub: "Lengkapi profil & dokumen sekali. Apply ke banyak posisi tanpa upload ulang.",
  },
  {
    icon: "clock" as const,
    title: "Pantau status real-time",
    sub: "Tiap tahap (Terkirim → Diproses → Hasil) update di akun-mu. Gak nebak-nebak.",
  },
  {
    icon: "info" as const,
    title: "Bebas biaya sebelum offering letter",
    sub: "Biaya cuma muncul setelah kamu diterima — untuk dokumen, angkanya tertera di tiap lowongan.",
  },
];

export function JobPortalDeep({ totalPositions }: { totalPositions: number }) {
  return (
    <section className="relative py-14 md:py-20 px-5 md:px-8 bg-pg-white border-t border-pg-ink-100" id="jobs">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-12 lg:gap-16 items-center">
          {/* Left column: copy */}
          <div className="flex flex-col gap-6">
            <div className="inline-flex items-center gap-2 self-start">
              <span className="font-mono text-[15px] font-extrabold text-pg-red-600">01</span>
              <span className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-pg-red-600">
                Job Portal
              </span>
            </div>
            <h2 className="text-[28px] md:text-[44px] font-extrabold tracking-[-0.025em] leading-[1.05] text-pg-ink-900 text-balance">
              Lowongan beneran. Resmi. <span className="text-pg-red-600">Bebas calo.</span>
            </h2>
            <p className="text-[14px] md:text-[16px] text-pg-ink-700 leading-relaxed max-w-prose">
              Bukan ngiklanin lowongan kosong. Setiap posisi dikonfirmasi langsung ke employer-nya.
              Gaji, syarat, kontrak — semua tertulis di depan, sebelum kamu apply.
            </p>

            <div className="flex flex-col gap-3 mt-2">
              {FEATURES.map((f) => (
                <div
                  key={f.title}
                  className="flex items-start gap-3 p-3.5 bg-pg-paper rounded-2xl border border-pg-ink-100"
                >
                  <div className="w-9 h-9 rounded-[10px] grid place-items-center shrink-0 bg-pg-red-50 text-pg-red-600">
                    <Icon name={f.icon} size={18} stroke={2.2} />
                  </div>
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <div className="text-[14px] font-extrabold text-pg-ink-900">{f.title}</div>
                    <div className="text-[12.5px] text-pg-ink-500 leading-snug">{f.sub}</div>
                  </div>
                </div>
              ))}
            </div>

            <Link
              href="/lowongan"
              className="inline-flex self-start items-center gap-2 px-[22px] py-4 bg-pg-red-600 text-white font-bold text-[15px] rounded-[14px] no-underline transition-all hover:bg-pg-red-700 hover:-translate-y-0.5"
              style={{ boxShadow: "0 4px 12px rgba(215,38,47,0.15)" }}
            >
              Lihat {totalPositions} lowongan
              <Icon name="arrow_right" size={15} stroke={2.4} />
            </Link>
          </div>

          {/* Right column: phone mockup */}
          <div className="relative flex justify-center lg:justify-end">
            <div
              className="relative w-[280px] md:w-[320px] bg-pg-ink-900 rounded-[38px] p-2"
              style={{ boxShadow: "0 30px 60px rgba(20,20,20,0.18), 0 0 0 1px rgba(20,20,20,0.06)" }}
            >
              {/* Notch */}
              <div className="absolute left-1/2 -translate-x-1/2 top-3 w-24 h-5 bg-pg-ink-900 rounded-full z-10" />
              {/* Screen */}
              <div className="relative bg-pg-paper rounded-[30px] overflow-hidden h-[540px] md:h-[600px] flex flex-col">
                {/* App topbar */}
                <div className="flex items-center justify-between px-4 pt-10 pb-3 border-b border-pg-ink-100 bg-pg-paper">
                  <div className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-[6px] grid place-items-center bg-pg-red-600 text-white font-extrabold text-[10px]">
                      PG
                    </span>
                    <span className="font-extrabold text-[13px] text-pg-ink-900">Perantau</span>
                  </div>
                  <span className="text-pg-ink-500 text-[18px]">≡</span>
                </div>
                {/* Mini country tabs */}
                <div className="flex gap-1.5 px-3 py-2.5 overflow-hidden border-b border-pg-ink-100">
                  <span className="flex items-center gap-1.5 px-2.5 py-1 bg-pg-ink-900 text-white rounded-full text-[10.5px] font-bold whitespace-nowrap">
                    <span className="w-3.5 h-3.5 rounded-full bg-white/16 inline-grid place-items-center text-[7px]">•</span>
                    Semua
                  </span>
                  {[
                    { thumb: "/images/countries/saudi.jpg", name: "Saudi" },
                    { thumb: "/images/countries/jepang.jpg", name: "Jepang" },
                    { thumb: "/images/countries/taiwan.jpg", name: "Taiwan" },
                  ].map((c) => (
                    <span
                      key={c.name}
                      className="flex items-center gap-1.5 pl-1 pr-2.5 py-1 bg-pg-white rounded-full border border-pg-ink-100 text-[10.5px] font-semibold text-pg-ink-700 whitespace-nowrap"
                    >
                      <span
                        className="w-4 h-4 rounded-full bg-cover bg-center"
                        style={{ backgroundImage: `url(${c.thumb})` }}
                      />
                      {c.name}
                    </span>
                  ))}
                </div>
                {/* Job list */}
                <div className="flex flex-col gap-2 p-3 overflow-hidden">
                  {[
                    { pic: "/images/lowongan/perawat-saudi-arabia.jpg", role: "Perawat", meta: "🇸🇦 Riyadh · Wanita · 21-38", salary: "SAR 3.200", open: true },
                    { pic: "/images/lowongan/kaigo-jepang.jpg", role: "Caregiver Kaigo", meta: "🇯🇵 Nagoya · Wanita · 18-35", salary: "¥190K", open: false },
                    { pic: "/images/lowongan/truck-driver-jepang.jpg", role: "Truck Driver", meta: "🇯🇵 Osaka · L · maks 44", salary: "¥250K", open: false },
                    { pic: "/images/lowongan/barista-saudi-arabia.jpg", role: "Barista", meta: "🇸🇦 Jeddah · L/P · 21-30", salary: "SAR 1.500", open: false },
                  ].map((j) => (
                    <div key={j.role} className="flex items-center gap-2.5 p-2 bg-pg-white border border-pg-ink-100 rounded-[12px]">
                      <div
                        className="w-9 h-9 rounded-[8px] bg-cover bg-center bg-pg-ink-50 shrink-0"
                        style={{ backgroundImage: `url(${j.pic})` }}
                      />
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="text-[11.5px] font-extrabold text-pg-ink-900 truncate">{j.role}</span>
                        <span className="font-mono text-[9.5px] text-pg-ink-500 truncate">{j.meta}</span>
                      </div>
                      <div className="flex flex-col items-end shrink-0">
                        <span className="font-mono text-[10.5px] font-extrabold text-pg-ink-900">{j.salary}</span>
                        <span
                          className={`font-mono text-[8px] font-bold uppercase tracking-[0.08em] mt-0.5 ${
                            j.open ? "text-pg-ok" : "text-pg-ink-500"
                          }`}
                        >
                          {j.open ? "Buka" : "Antrian"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Floating callouts */}
              <div
                className="absolute -left-4 top-24 inline-flex items-center gap-1.5 px-3 py-2 bg-pg-white border border-pg-ink-100 rounded-full font-mono text-[10.5px] font-bold text-pg-ink-700"
                style={{ boxShadow: "0 8px 20px rgba(20,20,20,0.10)" }}
              >
                <div className="w-5 h-5 rounded-full bg-pg-ok-bg text-pg-ok grid place-items-center">
                  <Icon name="shield" size={11} stroke={2.4} />
                </div>
                Izin bisa dicek
              </div>
              <div
                className="absolute -right-3 bottom-32 inline-flex items-center gap-1.5 px-3 py-2 bg-pg-white border border-pg-ink-100 rounded-full font-mono text-[10.5px] font-bold text-pg-ink-700"
                style={{ boxShadow: "0 8px 20px rgba(20,20,20,0.10)" }}
              >
                <div className="w-5 h-5 rounded-full bg-pg-info-bg text-pg-info grid place-items-center">
                  <Icon name="clock" size={11} stroke={2.4} />
                </div>
                Status real-time
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
