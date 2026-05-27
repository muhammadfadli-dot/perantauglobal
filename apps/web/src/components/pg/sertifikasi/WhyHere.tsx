const ROWS = [
  {
    label: "Psikotes",
    theirs: "Cari tempat tes, biaya terpisah, hasilnya belum tentu diakui employer.",
    ours: "Sudah include dalam paket, dirancang sesuai standar keberangkatan.",
  },
  {
    label: "Pelatihan fundamental",
    theirs: "Tidak ada panduan resmi yang fokus per negara — cari di YouTube / forum.",
    ours: "Modul kurikulum per negara, fokus dan langsung kepakai, bisa dari HP.",
  },
  {
    label: "Sertifikat",
    theirs: "Tidak ada bukti formal kalau kamu udah siap berangkat.",
    ours: "Sertifikat resmi PT Daya Talenta Global (P3MI Kemnaker), bisa dipakai melamar.",
  },
  {
    label: "Biaya",
    theirs: "Tersebar di beberapa tempat — sulit estimate total.",
    ours: "Satu paket per negara, transparent, gak ada biaya tersembunyi.",
  },
  {
    label: "Waktu",
    theirs: "Mingguan sampai berbulan-bulan koordinasi sendiri.",
    ours: "Modul + psikotes paralel sambil kamu lamar lowongan.",
  },
];

export function WhyHere() {
  return (
    <section className="px-5 md:px-8 py-14 md:py-20 bg-pg-white border-t border-pg-ink-100">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col gap-2 max-w-2xl mb-10">
          <div className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-pg-gold-700">
            Kenapa di Perantau Global
          </div>
          <h2 className="text-[24px] md:text-[40px] font-extrabold tracking-[-0.02em] leading-[1.1] text-pg-ink-900 text-balance m-0">
            Vs urus <span className="text-pg-gold-700">sendiri.</span>
          </h2>
          <p className="text-[14px] md:text-[16px] font-medium leading-relaxed text-pg-ink-500 mt-2 max-w-[60ch]">
            Sebenarnya kamu bisa cari sendiri-sendiri kredensial yang dibutuhkan. Tapi ini cara
            kami menyatukannya dalam satu paket.
          </p>
        </div>

        {/* Desktop: table grid */}
        <div className="hidden md:grid grid-cols-[160px_1fr_1fr] gap-0 bg-pg-paper border border-pg-ink-100 rounded-2xl overflow-hidden">
          {/* Header row */}
          <div className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-pg-ink-500 px-5 py-4 bg-pg-ink-50 border-b border-pg-ink-200">
            Aspek
          </div>
          <div className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-pg-ink-500 px-5 py-4 bg-pg-ink-50 border-b border-pg-ink-200 border-l border-pg-ink-100">
            Urus sendiri
          </div>
          <div
            className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] px-5 py-4 border-b border-pg-ink-200 border-l border-pg-ink-100"
            style={{ background: "rgba(201,138,20,0.10)", color: "var(--pg-gold-700)" }}
          >
            Paspor Perantau Global
          </div>

          {ROWS.map((row, i) => (
            <div key={row.label} className="contents">
              <div className={`px-5 py-4 font-bold text-[13.5px] text-pg-ink-900 ${i ? "border-t border-pg-ink-100" : ""}`}>
                {row.label}
              </div>
              <div className={`px-5 py-4 text-[13.5px] text-pg-ink-500 border-l border-pg-ink-100 ${i ? "border-t border-pg-ink-100" : ""}`}>
                {row.theirs}
              </div>
              <div
                className={`px-5 py-4 text-[13.5px] text-pg-ink-900 font-medium border-l border-pg-ink-100 ${i ? "border-t border-pg-ink-100" : ""}`}
                style={{ background: "rgba(201,138,20,0.05)" }}
              >
                {row.ours}
              </div>
            </div>
          ))}
        </div>

        {/* Mobile: stacked cards */}
        <div className="md:hidden flex flex-col gap-3">
          {ROWS.map((row) => (
            <div key={row.label} className="rounded-2xl bg-pg-paper border border-pg-ink-100 overflow-hidden">
              <div className="px-4 py-3 border-b border-pg-ink-100 bg-pg-ink-50">
                <span className="font-mono text-[10.5px] font-bold uppercase tracking-[0.14em] text-pg-ink-500">
                  Aspek
                </span>
                <div className="text-[14px] font-extrabold text-pg-ink-900 mt-0.5">{row.label}</div>
              </div>
              <div className="px-4 py-3 border-b border-pg-ink-100">
                <span className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-pg-ink-400">
                  Urus sendiri
                </span>
                <div className="text-[13px] text-pg-ink-500 leading-relaxed mt-0.5">{row.theirs}</div>
              </div>
              <div className="px-4 py-3" style={{ background: "rgba(201,138,20,0.05)" }}>
                <span className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-pg-gold-700">
                  Paspor Perantau Global
                </span>
                <div className="text-[13px] text-pg-ink-900 font-medium leading-relaxed mt-0.5">{row.ours}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
