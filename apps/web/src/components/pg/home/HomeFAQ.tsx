const FAQS = [
  {
    q: "Belum punya paspor, bisa daftar?",
    a: "Bisa. Daftar dulu — kami pandu cara urus paspor sambil proses jalan.",
  },
  {
    q: "Harus pernah kerja di luar negeri?",
    a: "Nggak. Banyak yang kami berangkatkan baru pertama kali.",
  },
  {
    q: "Beneran gratis di awal?",
    a: "Iya. Biaya cuma muncul setelah kamu diterima employer, untuk dokumen — angkanya tertera di tiap lowongan.",
  },
  {
    q: "Data saya aman?",
    a: "Aman, sesuai UU Perlindungan Data Pribadi. Cuma tim recruiter & PIC kamu yang bisa akses.",
  },
];

export function HomeFAQ() {
  return (
    <section className="relative py-14 md:py-20 px-5 md:px-8 bg-pg-white border-t border-pg-ink-100">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col gap-2 max-w-2xl mb-8">
          <div className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-pg-red-600">
            Masih ragu?
          </div>
          <h2 className="text-[24px] md:text-[40px] font-extrabold tracking-[-0.02em] leading-[1.1] text-pg-ink-900 text-balance">
            Pertanyaan yang sering ditanya.
          </h2>
        </div>
        <div className="md:grid md:grid-cols-2 md:gap-x-10 md:gap-y-2">
          {FAQS.map((f, i) => (
            <div
              key={f.q}
              className={`flex flex-col gap-1.5 py-5 ${
                i === FAQS.length - 1 ? "" : "border-b border-pg-ink-100"
              } md:border-b`}
            >
              <div className="text-[15px] md:text-[16px] font-extrabold text-pg-ink-900">{f.q}</div>
              <div className="text-[13.5px] md:text-[14px] text-pg-ink-500 leading-relaxed">{f.a}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
