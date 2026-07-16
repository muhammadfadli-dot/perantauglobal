import { Icon } from "@/components/pg/Icon";
import type { ReadinessItem } from "@/lib/position-readiness";
import { AdsUrlField } from "./AdsUrlField";

/**
 * "Siap diiklankan" (Fase 3.2) — the ads handoff, one panel below the publish
 * checklist in the Settings tab.
 *
 * The audit asked for a "wizard siap iklan" that unifies the verification steps
 * currently living in a skill + the meta CLI. This is that, minus the wizard:
 * the checks are facts about the position, and a panel states facts better than
 * a multi-step flow. What it adds over "Kesiapan publik" is the money lens —
 * inactive + unscreened + photoless are mere warnings before publish, but each
 * one turns paid clicks into waste, so here they block.
 */
export function AdsReadinessPanel({
  items,
  adsUrl,
}: {
  items: ReadinessItem[];
  adsUrl: string;
}) {
  const okCount = items.filter((i) => i.ok).length;
  const blockersUnmet = items.filter((i) => i.blocking && !i.ok);
  const ready = blockersUnmet.length === 0;

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
            Siap diiklankan
          </div>
          <div className="text-[15px] font-extrabold leading-tight mt-1">
            Checklist sebelum pasang iklan
          </div>
        </div>
        <span
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-bold shrink-0"
          style={{
            background: ready ? "var(--pg-ok-soft-bg)" : "var(--pg-warn-soft-bg)",
            color: ready ? "var(--pg-ok)" : "var(--pg-warn-soft-fg)",
          }}
        >
          <Icon name={ready ? "check" : "warn"} size={12} stroke={2.6} />
          {okCount}/{items.length} siap
        </span>
      </div>

      {!ready && (
        <div
          className="mb-3 px-3.5 py-2.5 rounded-xl text-[12px] leading-[17px]"
          style={{
            background: "var(--pg-warn-soft-bg)",
            color: "var(--pg-warn-soft-fg)",
            border: "1px solid var(--pg-warn-soft-border)",
          }}
        >
          <span className="font-bold">Jangan pasang iklan dulu.</span> {blockersUnmet
            .map((b) => b.label.toLowerCase())
            .join(" · ")}
          . Ngiklan sekarang = bayar klik yang mendarat di halaman rusak atau lead
          yang belum tersaring.
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
                    color: item.ok
                      ? "var(--pg-ink-700)"
                      : "var(--pg-ink-900, var(--pg-ink-700))",
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
        className="mt-4 pt-4"
        style={{ borderTop: "1px solid var(--pg-border-soft)" }}
      >
        <AdsUrlField url={adsUrl} />
      </div>
    </div>
  );
}
