import Link from "next/link";

/**
 * Public-site 404 — also the friendly landing for a deactivated/old lowongan
 * (detail now returns notFound for inactive rows). Hardcoded id copy so it
 * renders without next-intl message context.
 */
export default function NotFound() {
  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
      style={{ background: "var(--pg-paper, #fff)" }}
    >
      <div
        className="w-12 h-12 rounded-xl grid place-items-center text-white font-extrabold text-[22px] mb-5"
        style={{ background: "var(--pg-red-600, #d7262f)" }}
      >
        P
      </div>
      <h1 className="text-[24px] md:text-[32px] font-extrabold tracking-[-0.02em] text-pg-ink-900">
        Halaman tidak ditemukan
      </h1>
      <p className="text-[14px] md:text-[15px] text-pg-ink-500 mt-2 max-w-md leading-relaxed">
        Lowongan ini mungkin sudah ditutup atau halamannya sudah pindah. Lihat
        lowongan lain yang masih buka.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3 mt-7">
        <Link
          href="/id/lowongan"
          className="inline-flex items-center justify-center min-h-[48px] px-6 rounded-xl font-bold text-[15px] text-white no-underline"
          style={{ background: "var(--pg-red-600, #d7262f)" }}
        >
          Lihat lowongan
        </Link>
        <Link
          href="/id"
          className="inline-flex items-center justify-center min-h-[48px] px-6 rounded-xl font-bold text-[15px] text-pg-ink-900 no-underline"
          style={{ border: "1px solid var(--pg-ink-200, #e5e2dc)" }}
        >
          Ke beranda
        </Link>
      </div>
    </main>
  );
}
