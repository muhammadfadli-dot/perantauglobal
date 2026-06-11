"use client";

import Link from "next/link";
import { Icon } from "@/components/pg/Icon";

/** Admin CRM error boundary — a styled retry instead of Next's default page. */
export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
      style={{ background: "var(--pg-paper)" }}
    >
      <span
        className="w-14 h-14 rounded-2xl grid place-items-center mb-4"
        style={{ background: "var(--pg-err-bg)", color: "var(--pg-err)" }}
      >
        <Icon name="warn" size={26} stroke={2} />
      </span>
      <h1 className="text-[20px] font-extrabold tracking-[-0.01em] text-pg-ink-primary">
        Terjadi error
      </h1>
      <p className="text-[14px] text-pg-ink-secondary mt-2 max-w-md leading-relaxed">
        Halaman admin ini gagal dimuat. Coba lagi — kalau berulang, cek koneksi
        atau log.
      </p>
      {error.digest && (
        <p className="font-mono text-[11px] text-pg-ink-tertiary mt-2">
          ref: {error.digest}
        </p>
      )}
      <div className="flex items-center gap-3 mt-6">
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center justify-center gap-2 min-h-[44px] px-5 rounded-xl font-bold text-[14px] text-white"
          style={{ background: "var(--pg-red-600)" }}
        >
          Coba lagi
        </button>
        <Link
          href="/admin"
          className="inline-flex items-center justify-center gap-2 min-h-[44px] px-5 rounded-xl font-bold text-[14px] text-pg-ink-primary no-underline"
          style={{ background: "var(--pg-white)", border: "1px solid var(--pg-ink-200)" }}
        >
          Ke dashboard
        </Link>
      </div>
    </div>
  );
}
