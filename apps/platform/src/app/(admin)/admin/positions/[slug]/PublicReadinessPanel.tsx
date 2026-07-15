import { Icon } from "@/components/pg/Icon";
import type { ReadinessItem } from "@/lib/position-readiness";

/**
 * "Kesiapan publik" - the position publish-readiness checklist (Fase 2.1).
 * Server component in the Settings & publish tab. Shows, at a glance, whether
 * the position will actually render + screen correctly in public BEFORE the
 * admin publishes/activates - the thing that (per the audit) used to require an
 * external audit to notice (marketing shipped with a dark hero + no screening).
 *
 * Two blocking items (kartu lengkap, ada yang menyaring) are what make a
 * position invisible or auto-pass-everyone; the rest are quality warnings.
 */
export function PublicReadinessPanel({
  items,
  active,
}: {
  items: ReadinessItem[];
  active: boolean;
}) {
  const okCount = items.filter((i) => i.ok).length;
  const blockersUnmet = items.filter((i) => i.blocking && !i.ok);
  const allOk = okCount === items.length;
  const hasBlockers = blockersUnmet.length > 0;

  const summaryTone = hasBlockers ? "warn" : allOk ? "ok" : "info";
  const summaryColor =
    summaryTone === "ok"
      ? "var(--pg-ok)"
      : summaryTone === "warn"
        ? "var(--pg-warn-soft-fg)"
        : "var(--pg-info)";

  return (
    <div
      className="rounded-2xl p-5"
      style={{ background: "var(--pg-white)", border: "1px solid var(--pg-border)" }}
    >
      <div className="flex items-center justify-between mb-3 gap-3">
        <div>
          <div
            className="text-[11px] font-bold tracking-[0.12em] uppercase font-mono"
            style={{ color: "var(--pg-red-600)" }}
          >
            Kesiapan publik
          </div>
          <div className="text-[15px] font-extrabold leading-tight mt-1">
            Checklist sebelum publish
          </div>
        </div>
        <span
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-bold shrink-0"
          style={{
            background: hasBlockers
              ? "var(--pg-warn-soft-bg)"
              : allOk
                ? "var(--pg-ok-soft-bg)"
                : "var(--pg-info-soft-bg, var(--pg-ink-50))",
            color: summaryColor,
          }}
        >
          <Icon name={allOk ? "check" : "warn"} size={12} stroke={2.6} />
          {okCount}/{items.length} siap
        </span>
      </div>

      {/* Blocking banner: the two states that actively harm (invisible card /
          screens nobody). Only shown when a blocker is unmet. */}
      {hasBlockers && (
        <div
          className="mb-3 px-3.5 py-2.5 rounded-xl text-[12px] leading-[17px]"
          style={{
            background: "var(--pg-warn-soft-bg)",
            color: "var(--pg-warn-soft-fg)",
            border: "1px solid var(--pg-warn-soft-border)",
          }}
        >
          <span className="font-bold">
            {active ? "Posisi ini AKTIF tapi " : ""}Ada {blockersUnmet.length} hal
            penting yang belum beres:
          </span>{" "}
          {blockersUnmet.map((b) => b.label.toLowerCase()).join(" · ")}. Item ini
          bikin posisi tidak tampil di listing atau meloloskan semua pelamar.
        </div>
      )}

      <ul className="flex flex-col gap-2 m-0 p-0 list-none">
        {items.map((item) => {
          const bad = !item.ok;
          const blockingBad = bad && item.blocking;
          const color = item.ok
            ? "var(--pg-ok)"
            : blockingBad
              ? "var(--pg-warn-soft-fg)"
              : "var(--pg-ink-500)";
          return (
            <li key={item.key} className="flex items-start gap-2.5">
              <span className="mt-[1px] shrink-0" style={{ color }}>
                <Icon name={item.ok ? "check" : "x"} size={13} stroke={2.6} />
              </span>
              <div className="min-w-0">
                <div
                  className="text-[13px] leading-[17px]"
                  style={{
                    color: item.ok ? "var(--pg-ink-700)" : "var(--pg-ink-900, var(--pg-ink-700))",
                    fontWeight: blockingBad ? 700 : 600,
                  }}
                >
                  {item.label}
                  {item.blocking && (
                    <span
                      className="ml-1.5 text-[9.5px] font-bold tracking-[0.08em] uppercase align-middle"
                      style={{ color: "var(--pg-red-600)" }}
                    >
                      wajib
                    </span>
                  )}
                </div>
                {bad && item.hint && (
                  <div
                    className="text-[11.5px] leading-[15px] mt-0.5"
                    style={{ color: "var(--pg-ink-tertiary)" }}
                  >
                    {item.hint}
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      <div
        className="mt-4 pt-3 text-[11.5px] leading-[16px]"
        style={{ color: "var(--pg-ink-tertiary)", borderTop: "1px solid var(--pg-border-soft)" }}
      >
        Item bertanda <span className="font-bold">wajib</span> harus beres supaya
        posisi bisa diaktifkan. Sisanya rekomendasi kualitas - publish tetap bisa,
        tapi hasilnya kurang optimal.
      </div>
    </div>
  );
}
