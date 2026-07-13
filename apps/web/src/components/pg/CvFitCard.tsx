import { Icon, type IconName } from "./Icon";

/**
 * Apply-step CV-to-position fit ("CV di depan"), shown on the PUBLIC apply form
 * right after the candidate uploads their CV — powered by grade-cv preview mode
 * (extract + fit in-memory, nothing persisted, no account yet).
 *
 * Forked from the portal CvFitCard (apps/platform) with two changes for the
 * pre-account context: (1) apps/web token scale (--pg-ink-500 etc.), (2) no
 * "/profile/dokumen" CTA (there's no account to link to yet), replaced by a
 * headline "X dari Y syarat" counter.
 *
 * Deliberately NOT a gate: we never show the raw fit_score number or a
 * pass/fail verdict. We surface the actionable parts — which position
 * requirements the CV already shows, and what to strengthen — framed as help.
 */

export type CvFitPreview = {
  fit_score: number | null;
  alasan?: string | null;
  yang_kurang?: string[] | null;
  requirement_checks?: { syarat: string; status?: string | null; bukti?: string | null }[] | null;
};

const STATUS_META: Record<string, { icon: IconName; color: string; label: string }> = {
  terpenuhi: { icon: "check", color: "var(--pg-ok)", label: "Sesuai" },
  sebagian: { icon: "info", color: "var(--pg-warn)", label: "Sebagian" },
  belum: { icon: "warn", color: "var(--pg-ink-400)", label: "Belum terlihat di CV" },
  tidak_diketahui: { icon: "info", color: "var(--pg-ink-400)", label: "Belum jelas" },
};

function band(score: number | null): { text: string; color: string } {
  if (score == null) return { text: "Kami sudah baca CV kamu untuk posisi ini.", color: "var(--pg-ink-500)" };
  if (score >= 70) return { text: "CV kamu sudah cocok untuk posisi ini.", color: "var(--pg-ok)" };
  if (score >= 45) return { text: "CV kamu cukup cocok, bisa diperkuat sedikit lagi.", color: "var(--pg-warn)" };
  return { text: "Perkuat CV kamu biar makin cocok untuk posisi ini.", color: "var(--pg-ink-500)" };
}

function normalizeKurang(v: string[] | null | undefined): string[] {
  if (Array.isArray(v)) return v.filter((s) => typeof s === "string" && s.trim());
  return [];
}

export function CvFitCard({ fit }: { fit: CvFitPreview }) {
  const checks = Array.isArray(fit.requirement_checks)
    ? fit.requirement_checks.filter((c) => c && typeof c.syarat === "string")
    : [];
  const kurang = normalizeKurang(fit.yang_kurang);
  const b = band(fit.fit_score);
  const met = checks.filter((c) => c.status === "terpenuhi").length;

  // Nothing useful to show → don't render an empty card.
  if (checks.length === 0 && kurang.length === 0) return null;

  return (
    <div
      className="mt-3 rounded-2xl p-4 flex flex-col gap-3"
      style={{ background: "var(--pg-white)", border: "1px solid var(--pg-ink-100)" }}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-[13.5px] font-extrabold leading-snug" style={{ color: b.color }}>
          {b.text}
        </p>
        {checks.length > 0 && (
          <span
            className="shrink-0 inline-flex items-center px-2 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap"
            style={{ background: "var(--pg-paper)", color: "var(--pg-ink-700)" }}
          >
            {met}/{checks.length} syarat
          </span>
        )}
      </div>

      {checks.length > 0 && (
        <div className="flex flex-col gap-2">
          {checks.map((c, i) => {
            const meta = STATUS_META[c.status ?? "tidak_diketahui"] ?? STATUS_META.tidak_diketahui;
            return (
              <div key={i} className="flex items-start gap-2.5">
                <span className="mt-0.5 shrink-0" style={{ color: meta.color }}>
                  <Icon name={meta.icon} size={15} stroke={2.2} />
                </span>
                <div className="min-w-0">
                  <div className="text-[13px] font-semibold text-pg-ink-900 leading-tight">{c.syarat}</div>
                  <div className="text-[11.5px]" style={{ color: meta.color }}>{meta.label}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {kurang.length > 0 && (
        <div className="rounded-xl p-3 flex flex-col gap-1.5" style={{ background: "var(--pg-paper)" }}>
          <div className="text-[11px] font-bold uppercase tracking-wide text-pg-ink-400">Biar makin cocok</div>
          {kurang.slice(0, 4).map((k, i) => (
            <div key={i} className="flex items-start gap-2 text-[12.5px] text-pg-ink-500 leading-snug">
              <Icon name="arrow_right" size={13} className="mt-0.5 shrink-0" />
              <span>{k}</span>
            </div>
          ))}
        </div>
      )}

      <p className="text-[11px] text-pg-ink-400 leading-snug">
        Dibaca otomatis dari CV kamu untuk bantu memperkuat lamaran, bukan penilaian akhir. Tim kami tetap cek langsung.
      </p>
    </div>
  );
}
