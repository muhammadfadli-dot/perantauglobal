/**
 * Catalog loading skeleton.
 *
 * /lowongan is ISR (revalidate 60), so a warm cache renders instantly and this
 * never shows. It covers the cache-miss path, where the page blocks on the
 * positions + job-orders + country-registry round-trips (finding F3: that wait
 * previously rendered nothing at all). The lowongan layout.tsx (topbar, trust
 * strip, footer) stays mounted around this, so only the content area swaps.
 */
export default function LowonganLoading() {
  return (
    <main className="px-5 md:px-8 py-10 md:py-14" aria-busy="true" aria-live="polite">
      <span className="sr-only">Memuat lowongan…</span>
      <div className="max-w-6xl mx-auto motion-safe:animate-pulse">
        {/* Hero copy */}
        <div className="flex flex-col gap-3 max-w-2xl">
          <div className="h-3 w-40 rounded-full bg-pg-ink-100" />
          <div className="h-8 md:h-11 w-full rounded-lg bg-pg-ink-100" />
          <div className="h-8 md:h-11 w-2/3 rounded-lg bg-pg-ink-100" />
        </div>

        {/* Country chips */}
        <div className="flex flex-wrap gap-2 mt-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-9 w-28 rounded-full bg-pg-ink-100" />
          ))}
        </div>

        {/* Position cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mt-10">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-[22px] border border-pg-ink-100 overflow-hidden bg-pg-white"
            >
              <div className="h-36 bg-pg-ink-100" />
              <div className="flex flex-col gap-3 p-5">
                <div className="h-4 w-3/4 rounded bg-pg-ink-100" />
                <div className="h-3 w-1/2 rounded bg-pg-ink-100" />
                <div className="h-3 w-2/3 rounded bg-pg-ink-100 mt-2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
