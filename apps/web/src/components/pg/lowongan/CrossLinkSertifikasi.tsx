import Link from "next/link";
import { Icon } from "@/components/pg/Icon";

export function CrossLinkSertifikasi() {
  return (
    <Link
      href="/akademi"
      className="flex items-center gap-5 p-6 rounded-[20px] no-underline text-pg-ink-900 transition-all hover:-translate-y-0.5"
      style={{
        background: "linear-gradient(135deg, #fcf6e8 0%, #f8eecf 100%)",
        border: "1px solid rgba(201,138,20,0.22)",
        boxShadow: "var(--pg-shadow-1)",
      }}
    >
      <div
        className="w-[52px] h-[52px] rounded-[14px] grid place-items-center shrink-0"
        style={{ background: "rgba(201,138,20,0.18)", color: "var(--pg-gold-700)" }}
      >
        <Icon name="passport" size={26} stroke={2.2} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[16px] md:text-[18px] font-extrabold tracking-[-0.015em] text-pg-ink-900">
          Biar makin siap berangkat
        </div>
        <div className="text-[13px] md:text-[14px] text-pg-ink-500 mt-1 leading-relaxed">
          Paspor Perantau Global menyiapkan psikotes &amp; fundamental per negara. Bukan syarat —
          tapi bikin kamu lebih siap diterima employer.
        </div>
      </div>
      <span
        className="inline-flex items-center gap-1.5 font-bold text-[13px] shrink-0"
        style={{ color: "var(--pg-gold-700)" }}
      >
        <span className="hidden sm:inline">Lihat Akademi Perantau</span>
        <Icon name="arrow_right" size={16} stroke={2.4} />
      </span>
    </Link>
  );
}
