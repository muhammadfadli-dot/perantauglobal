import Link from "next/link";
import { Icon, type IconName } from "@/components/pg/Icon";

/**
 * Candidate-facing CV-to-position fit (application_cv_fit).
 *
 * Deliberately NOT a gate: we never show the raw fit_score number or a
 * pass/fail verdict (CV = score, not gate). We surface the *actionable* parts —
 * which position requirements the CV already shows, and what to strengthen —
 * framed as help. The admin still sees the full score + evidence separately.
 */

export type CvFit = {
  fit_score: number | null;
  reasons: {
    alasan?: string | null;
    requirement_checks?: { syarat: string; status?: string | null; bukti?: string | null }[] | null;
    yang_kurang?: string | string[] | null;
  } | null;
};

const STATUS_META: Record<string, { icon: IconName; color: string; label: string }> = {
  terpenuhi: { icon: "check", color: "var(--pg-ok-soft-fg)", label: "Sesuai" },
  sebagian: { icon: "info", color: "var(--pg-warn-soft-fg)", label: "Sebagian" },
  belum: { icon: "warn", color: "var(--pg-ink-tertiary)", label: "Belum terlihat di CV" },
  tidak_diketahui: { icon: "info", color: "var(--pg-ink-tertiary)", label: "Belum jelas" },
};

function band(score: number | null): { text: string; color: string } {
  if (score == null)
    return { text: "Kami sudah baca CV kamu untuk posisi ini.", color: "var(--pg-ink-secondary)" };
  if (score >= 70)
    return { text: "CV kamu sudah cocok untuk posisi ini.", color: "var(--pg-ok-soft-fg)" };
  if (score >= 45)
    return { text: "CV kamu cukup cocok — bisa diperkuat sedikit lagi.", color: "var(--pg-warn-soft-fg)" };
  return { text: "Perkuat CV kamu biar makin cocok untuk posisi ini.", color: "var(--pg-ink-secondary)" };
}

function normalizeKurang(v: string | string[] | null | undefined): string[] {
  if (Array.isArray(v)) return v.filter((s) => typeof s === "string" && s.trim());
  if (typeof v === "string" && v.trim()) return [v.trim()];
  return [];
}

export function CvFitCard({ fit }: { fit: CvFit }) {
  const checks = Array.isArray(fit.reasons?.requirement_checks)
    ? fit.reasons!.requirement_checks!.filter((c) => c && typeof c.syarat === "string")
    : [];
  const kurang = normalizeKurang(fit.reasons?.yang_kurang);
  const b = band(fit.fit_score);

  // Nothing useful to show → don't render an empty card.
  if (checks.length === 0 && kurang.length === 0) return null;

  return (
    <div
      className="bg-pg-white rounded-2xl p-5 flex flex-col gap-3.5"
      style={{ border: "1px solid var(--pg-border)" }}
    >
      <p className="text-[14px] font-extrabold leading-snug" style={{ color: b.color }}>
        {b.text}
      </p>

      {checks.length > 0 && (
        <div className="flex flex-col gap-2">
          {checks.map((c, i) => {
            const meta = STATUS_META[c.status ?? "tidak_diketahui"] ?? STATUS_META.tidak_diketahui;
            return (
              <div key={i} className="flex items-start gap-2.5">
                <span className="mt-0.5 shrink-0" style={{ color: meta.color }}>
                  <Icon name={meta.icon} size={15} />
                </span>
                <div className="min-w-0">
                  <div className="text-[13.5px] font-semibold text-pg-ink-primary leading-tight">
                    {c.syarat}
                  </div>
                  <div className="text-[11.5px]" style={{ color: meta.color }}>
                    {meta.label}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {kurang.length > 0 && (
        <div className="rounded-[12px] p-3 flex flex-col gap-1.5" style={{ background: "var(--pg-paper)" }}>
          <div className="text-[11px] font-bold uppercase tracking-wide text-pg-ink-tertiary">
            Biar makin cocok
          </div>
          {kurang.slice(0, 4).map((k, i) => (
            <div key={i} className="flex items-start gap-2 text-[12.5px] text-pg-ink-secondary leading-snug">
              <Icon name="arrow_right" size={13} className="mt-0.5 shrink-0 text-pg-ink-quaternary" />
              <span>{k}</span>
            </div>
          ))}
        </div>
      )}

      <Link
        href="/profile/dokumen"
        className="inline-flex items-center justify-center gap-1.5 min-h-[44px] rounded-[12px] font-bold text-[13px] no-underline text-white"
        style={{ background: "var(--pg-red-600)" }}
      >
        Tambah dokumen pendukung
        <Icon name="arrow_right" size={15} stroke={2.4} />
      </Link>

      <p className="text-[11px] text-pg-ink-tertiary leading-snug">
        Dibaca otomatis dari CV kamu untuk bantu memperkuat lamaran — bukan penilaian akhir. Tim kami tetap
        cek langsung.
      </p>
    </div>
  );
}
