import Link from "next/link";
import { Icon } from "@/components/pg/Icon";

/** Admin CRM 404 — styled dead-end with a way back to the dashboard. */
export default function AdminNotFound() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
      style={{ background: "var(--pg-paper)" }}
    >
      <span
        className="w-14 h-14 rounded-2xl grid place-items-center mb-4"
        style={{ background: "var(--pg-ink-50)", color: "var(--pg-ink-400)" }}
      >
        <Icon name="search" size={26} stroke={2} />
      </span>
      <h1 className="text-[20px] font-extrabold tracking-[-0.01em] text-pg-ink-primary">
        Halaman nggak ketemu
      </h1>
      <p className="text-[14px] text-pg-ink-secondary mt-2 max-w-md leading-relaxed">
        Halaman admin yang kamu cari nggak ada atau sudah pindah.
      </p>
      <Link
        href="/admin"
        className="inline-flex items-center justify-center gap-2 min-h-[44px] px-6 rounded-xl font-bold text-[14px] text-white no-underline mt-6"
        style={{ background: "var(--pg-red-600)" }}
      >
        Ke dashboard
      </Link>
    </div>
  );
}
