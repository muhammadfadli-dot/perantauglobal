import Image from "next/image";

const TESTIMONIALS = [
  {
    img: "/images/people/sari.jpg",
    name: "Sari",
    role: "Perawat",
    country: "Saudi Arabia",
    year: "2025",
    quote:
      "Dari nol, nggak punya paspor. Sekarang kerja perawat di Riyadh. Nggak ada calo, semua jelas 🙏",
  },
  {
    img: "/images/people/budi.jpg",
    name: "Budi",
    role: "Truck Driver",
    country: "Jepang",
    year: "2025",
    quote:
      "4 bulan dari daftar sampai terbang ke Osaka. Tiap tahap dikabarin PIC. Gaji sesuai kontrak.",
  },
  {
    img: "/images/people/rini.jpg",
    name: "Rini",
    role: "Caregiver",
    country: "Taiwan",
    year: "2025",
    quote:
      "Awalnya takut ketipu calo. Ternyata semua transparan, bisa dicek sendiri. Sekarang udah di Taipei.",
  },
];

export function Testimoni() {
  return (
    <section className="relative py-14 md:py-20 px-5 md:px-8 bg-pg-white border-t border-pg-ink-100">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col gap-2 max-w-2xl mb-10">
          <div className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-pg-red-600">
            Kata mereka yang udah berangkat
          </div>
          <h2 className="text-[24px] md:text-[40px] font-extrabold tracking-[-0.02em] leading-[1.1] text-pg-ink-900 text-balance">
            Orang biasa, sekarang kerja di luar negeri.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
          {TESTIMONIALS.map((t, i) => (
            <div
              key={t.name}
              className="flex flex-col gap-4 p-5 bg-pg-paper rounded-[18px] border border-pg-ink-100 transition-transform hover:-translate-y-1 hover:rotate-0"
              style={{
                transform: i % 2 === 0 ? "rotate(-0.4deg)" : "rotate(0.5deg)",
                boxShadow: "var(--pg-shadow-1)",
              }}
            >
              <div className="flex items-center gap-3">
                <Image
                  src={t.img}
                  alt={t.name}
                  width={48}
                  height={48}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 text-[15px] font-extrabold text-pg-ink-900">
                    {t.name}
                    <span
                      aria-hidden
                      className="inline-grid place-items-center w-4 h-4 rounded-full"
                      style={{ background: "var(--pg-ok)" }}
                    >
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                  </div>
                  <div className="text-[11.5px] text-pg-ink-500 font-mono">
                    {t.role} · {t.country}
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold text-pg-ok tracking-[0.06em] uppercase">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                  Berangkat {t.year}
                </span>
              </div>
              <p className="text-[14px] text-pg-ink-700 leading-relaxed italic">{t.quote}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center text-[12px] text-pg-ink-400 font-mono">
          Komentar contoh — akan diganti cerita kandidat asli sebelum rilis.
        </div>
      </div>
    </section>
  );
}
