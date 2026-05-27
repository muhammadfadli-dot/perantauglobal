import Link from "next/link";
import { Icon } from "@/components/pg/Icon";

/**
 * TerminalCard — final-state hero for hasil_diterima / hasil_ditolak.
 *
 * Stand-in for richer S4 (interview) / S5 (departure) flows which need new
 * schema (interview_scheduled, pre_departure_checklist) — Phase 7 deferred.
 */
export function TerminalCard({
  outcome,
  positionName,
  country,
  applicationId,
}: {
  outcome: "diterima" | "ditolak";
  positionName: string;
  country: string;
  applicationId: string;
}) {
  const accepted = outcome === "diterima";
  return (
    <div
      className="rounded-[22px] p-6 text-white overflow-hidden relative"
      style={{
        background: accepted
          ? "linear-gradient(160deg, var(--pg-ok) 0%, #0a6e3a 100%)"
          : "linear-gradient(160deg, var(--pg-ink-700) 0%, var(--pg-ink-900) 100%)",
        boxShadow: accepted
          ? "0 8px 24px rgba(10,110,58,0.22), 0 16px 48px rgba(10,110,58,0.10)"
          : "0 8px 24px rgba(20,16,12,0.18), 0 16px 48px rgba(20,16,12,0.10)",
      }}
    >
      <span
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-white"
        style={{ background: "rgba(255,255,255,0.16)" }}
      >
        {accepted ? "Hasil · Diterima" : "Hasil · Belum cocok"}
      </span>
      <h2 className="mt-3 text-[22px] font-extrabold tracking-[-0.02em] leading-tight">
        {accepted ? (
          <>Selamat! {positionName} di {country} 🎉</>
        ) : (
          <>Belum cocok untuk {positionName}</>
        )}
      </h2>
      <p className="text-[13px] mt-2 leading-relaxed opacity-92">
        {accepted
          ? "Tim Perantau Global akan kabari langkah berikutnya: pre-keberangkatan, briefing, dan tiket."
          : "Jangan menyerah — masih banyak posisi lain. Cek lowongan terbuka di Lowongan."}
      </p>
      <div className="flex gap-2 mt-4">
        <Link
          href={`/applications/${applicationId}`}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-[12px] font-extrabold text-[13px] no-underline"
          style={{
            background: "rgba(255,255,255,0.95)",
            color: accepted ? "var(--pg-ok)" : "var(--pg-ink-900)",
          }}
        >
          Detail lamaran
          <Icon name="arrow_right" size={13} stroke={2.4} />
        </Link>
        {!accepted && (
          <Link
            href="/explore"
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-[12px] font-extrabold text-[13px] no-underline text-white"
            style={{ background: "rgba(255,255,255,0.16)" }}
          >
            Cari lainnya
          </Link>
        )}
      </div>
    </div>
  );
}
