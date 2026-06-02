export function LearningPortalExplainer() {
  return (
    <section
      id="apa-itu"
      className="relative px-5 md:px-8 py-14 md:py-20 bg-pg-paper border-t border-pg-ink-100"
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col gap-2 max-w-2xl mb-10">
          <div className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-pg-gold-700">
            Apa itu Akademi Perantau
          </div>
          <h2 className="text-[24px] md:text-[40px] font-extrabold tracking-[-0.02em] leading-[1.1] text-pg-ink-900 text-balance m-0">
            Tempat semua kredensial siap berangkat{" "}
            <span className="text-pg-gold-700">terkumpul.</span>
          </h2>
          <p className="text-[14px] md:text-[16px] font-medium leading-relaxed text-pg-ink-500 mt-2 max-w-[64ch]">
            Sister portal dari Job Portal. Bukan jualan kursus — tempat kamu cari semua kredensial
            yang memang dibutuhin untuk berangkat kerja LN. Sekarang baru Paspor Perantau Global
            (Saudi &amp; Jepang); ke depan akan ditambah sertifikasi bahasa, SIM internasional, dan
            kerja sama mitra lain.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
          {[
            {
              num: "01 · Sekarang",
              title: "Paspor Perantau Global",
              desc: "Bundle psikotes formal + modul fundamental per negara. Live untuk Saudi Arabia dan Jepang. Dikeluarkan resmi PT Daya Talenta Global.",
              tone: "active" as const,
            },
            {
              num: "02 · Segera",
              title: "Sertifikasi skill-specific",
              desc: "Bahasa Jepang (JLPT), Mandarin dasar, SIM internasional — lewat mitra resmi. Diumumkan di aplikasi Perantau Global ketika sudah siap.",
              tone: "neutral" as const,
            },
            {
              num: "03 · Ke depan",
              title: "Kredensial sesuai kebutuhan",
              desc: "Setiap negara dan industri punya syarat berbeda. Akademi Perantau akan terus berkembang sesuai apa yang dibutuhkan kandidat untuk lulus seleksi employer.",
              tone: "active" as const,
            },
          ].map((tile) => (
            <div
              key={tile.title}
              className="flex flex-col gap-3 p-5 md:p-6 rounded-2xl"
              style={
                tile.tone === "active"
                  ? {
                      background: "var(--pg-white)",
                      border: "1px solid rgba(201,138,20,0.22)",
                      boxShadow: "var(--pg-shadow-1)",
                    }
                  : {
                      background: "var(--pg-ink-50)",
                      border: "1px dashed var(--pg-ink-200)",
                    }
              }
            >
              <span
                className="font-mono text-[10.5px] font-bold uppercase tracking-[0.14em]"
                style={{
                  color: tile.tone === "active" ? "var(--pg-gold-700)" : "var(--pg-ink-400)",
                }}
              >
                {tile.num}
              </span>
              <div className="text-[18px] md:text-[20px] font-extrabold tracking-[-0.015em] text-pg-ink-900">
                {tile.title}
              </div>
              <p className="text-[13px] md:text-[14px] leading-relaxed text-pg-ink-500 m-0">
                {tile.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
