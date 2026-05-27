/**
 * Lineage — "kenapa bisa dipercaya" + P3MI license card.
 *
 * Note: 1998 belongs to DayaLima Group, NOT Perantau Global / DTG (est. Oct 2024).
 * Per project_corporate_lineage_trust_claims memory — always phrase as
 * "bagian dari DayaLima Group sejak 1998", never "Perantau sejak 1998".
 */
export function Lineage() {
  return (
    <section className="relative py-14 md:py-20 px-5 md:px-8 bg-pg-paper border-t border-pg-ink-100">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-8 lg:gap-12 items-center">
          <div className="flex flex-col gap-3">
            <div className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-pg-red-600">
              Kenapa bisa dipercaya
            </div>
            <h2 className="text-[24px] md:text-[36px] font-extrabold tracking-[-0.022em] leading-[1.1] text-pg-ink-900 text-balance">
              Bukan pemain baru. Bagian dari DayaLima Group.
            </h2>
            <p className="text-[14px] md:text-[16px] font-medium text-pg-ink-700 leading-relaxed max-w-[60ch] mt-2">
              Perantau Global dijalankan PT Daya Talenta Global — unit penempatan kerja luar
              negeri dari <b className="text-pg-ink-900">DayaLima Group</b>, grup layanan SDM
              Indonesia yang sudah berpengalaman <b className="text-pg-ink-900">sejak 1998</b>.
              Resmi berizin P3MI Kemnaker.
            </p>
          </div>
          <div
            className="flex flex-col gap-3 p-5 md:p-6 bg-pg-white rounded-2xl border border-pg-ink-200"
            style={{ boxShadow: "var(--pg-shadow-2)" }}
          >
            <span className="font-mono text-[10.5px] font-bold uppercase tracking-[0.18em] text-pg-ink-500">
              Izin Resmi P3MI
            </span>
            <span className="font-mono text-[19px] md:text-[22px] font-extrabold text-pg-ink-900 tracking-[0.01em]">
              No. 1810240237512001
            </span>
            <a
              href="https://sipptki.kemnaker.go.id"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-between gap-2 mt-1 px-4 py-3 bg-pg-red-50 rounded-xl no-underline text-pg-red-600 font-mono text-[12px] font-bold tracking-[0.02em]"
            >
              Cek di sipptki.kemnaker.go.id
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" aria-hidden>
                <path d="M7 17L17 7M9 7h8v8" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
