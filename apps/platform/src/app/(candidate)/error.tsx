"use client";

import Link from "next/link";
import { Icon } from "@/components/pg/Icon";
import { waLink } from "@/lib/contact";

/**
 * Candidate-portal error boundary. A Supabase hiccup or a slow RSC must never
 * drop a scam-fearful, low-literacy user onto Next's unstyled error page or a
 * stack trace. Plain Indonesian, a retry, and a reachable human (WhatsApp).
 */
export default function CandidateError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
      style={{ background: "var(--pg-paper)" }}
    >
      <span
        className="w-14 h-14 rounded-2xl grid place-items-center mb-4"
        style={{ background: "var(--pg-red-50)", color: "var(--pg-red-600)" }}
      >
        <Icon name="warn" size={26} stroke={2} />
      </span>
      <h1 className="text-[20px] font-extrabold tracking-[-0.01em] text-pg-ink-900">
        Ada gangguan sebentar
      </h1>
      <p className="text-[14px] text-pg-ink-500 mt-2 max-w-xs leading-relaxed">
        Halaman ini lagi nggak bisa dibuka. Coba lagi sebentar — kalau masih
        error, hubungi kami lewat WhatsApp ya.
      </p>
      <div className="flex flex-col gap-2.5 mt-6 w-full max-w-xs">
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center justify-center gap-2 min-h-[48px] rounded-xl font-bold text-[14px] text-white"
          style={{ background: "var(--pg-red-600)" }}
        >
          Coba lagi
        </button>
        <a
          href={waLink("Halo Perantau Global, aplikasi saya error pas mau buka halaman.")}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center gap-2 min-h-[48px] rounded-xl font-bold text-[14px] text-pg-ink-900 no-underline"
          style={{ background: "var(--pg-white)", border: "1px solid var(--pg-ink-200)" }}
        >
          <Icon name="phone" size={16} /> Hubungi via WhatsApp
        </a>
        <Link
          href="/dashboard"
          className="text-[13px] font-bold text-pg-ink-500 no-underline mt-1"
        >
          Ke beranda
        </Link>
      </div>
    </div>
  );
}
