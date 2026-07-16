/**
 * Position detail loading skeleton.
 *
 * Its own file (rather than inheriting the catalog skeleton one level up) so a
 * cache-miss on a detail URL doesn't flash a grid of card placeholders for a
 * page that is a hero + prose. Matters most for a freshly created position,
 * whose URL was never pre-rendered — which is exactly the link an ad points at.
 */
export default function PositionDetailLoading() {
  return (
    <main aria-busy="true" aria-live="polite">
      <span className="sr-only">Memuat lowongan…</span>
      <div className="motion-safe:animate-pulse">
        {/* Hero */}
        <div className="h-[220px] md:h-[320px] bg-pg-ink-100" />

        <div className="max-w-4xl mx-auto px-5 md:px-8 py-8 md:py-12 flex flex-col gap-8">
          {/* Title block */}
          <div className="flex flex-col gap-3">
            <div className="h-3 w-32 rounded-full bg-pg-ink-100" />
            <div className="h-8 md:h-10 w-3/4 rounded-lg bg-pg-ink-100" />
            <div className="h-4 w-1/2 rounded bg-pg-ink-100" />
          </div>

          {/* Quick facts strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl border border-pg-ink-100 p-4 flex flex-col gap-2"
              >
                <div className="h-2.5 w-12 rounded-full bg-pg-ink-100" />
                <div className="h-4 w-20 rounded bg-pg-ink-100" />
              </div>
            ))}
          </div>

          {/* Body prose */}
          <div className="flex flex-col gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-3.5 rounded bg-pg-ink-100"
                style={{ width: `${[100, 92, 96, 78, 88][i]}%` }}
              />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
