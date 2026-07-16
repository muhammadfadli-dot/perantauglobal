"use client";

import Link from "next/link";

/**
 * Error boundary for the lowongan routes (list + detail).
 *
 * Scope note: this does NOT catch a Supabase outage on the catalog.
 * fetchPositionsForCatalog deliberately swallows DB errors and returns [] so
 * ISR keeps serving the last good render instead of erroring (positions-db.ts).
 * This boundary is for the unexpected render-time throw, which previously fell
 * through to Next's unstyled default page (finding F3).
 */
export default function LowonganError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main
      className="min-h-[60vh] flex flex-col items-center justify-center px-6 text-center"
      style={{ background: "var(--pg-paper, #fff)" }}
    >
      <div
        className="w-12 h-12 rounded-xl grid place-items-center text-white font-extrabold text-[22px] mb-5"
        style={{ background: "var(--pg-red-600, #d7262f)" }}
      >
        P
      </div>
      <h1 className="text-[24px] md:text-[32px] font-extrabold tracking-[-0.02em] text-pg-ink-900">
        Gagal memuat lowongan
      </h1>
      <p className="text-[14px] md:text-[15px] text-pg-ink-500 mt-2 max-w-md leading-relaxed">
        Ada gangguan sesaat di sisi kami, bukan di kamu. Coba muat ulang, atau
        lihat daftar lowongan yang lain.
      </p>
      {error.digest && (
        <p className="font-mono text-[11px] text-pg-ink-500 mt-3">ref: {error.digest}</p>
      )}
      <div className="flex flex-wrap items-center justify-center gap-3 mt-7">
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center justify-center min-h-[48px] px-6 rounded-xl font-bold text-[15px] text-white"
          style={{ background: "var(--pg-red-600, #d7262f)" }}
        >
          Coba lagi
        </button>
        <Link
          href="/id/lowongan"
          className="inline-flex items-center justify-center min-h-[48px] px-6 rounded-xl font-bold text-[15px] text-pg-ink-900 no-underline"
          style={{ border: "1px solid var(--pg-ink-200, #e5e2dc)" }}
        >
          Lihat lowongan
        </Link>
      </div>
    </main>
  );
}
