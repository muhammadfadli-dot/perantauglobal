"use client";

import { useState, useTransition } from "react";
import { Icon } from "@/components/pg/Icon";
import { moveApplicationToJobOrder } from "@/app/(admin)/admin/actions";

type OpenJobOrder = {
  id: string;
  intake_label: string;
  internal_employer_name: string;
  slot_count: number;
  slot_filled: number;
};

/**
 * Inline picker for moving a talent-pool application into one of the
 * position's open job orders. Disabled when the position has no open JO.
 */
export function JobOrderPicker({
  applicationId,
  candidateName,
  openJobOrders,
}: {
  applicationId: string;
  candidateName: string;
  openJobOrders: OpenJobOrder[];
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (openJobOrders.length === 0) {
    return (
      <span
        className="inline-flex items-center gap-1 text-[11px] text-pg-ink-400 italic"
        title="Tidak ada job order open untuk posisi ini — buat job order dulu"
      >
        <Icon name="info" size={11} />
        belum ada JO
      </span>
    );
  }

  function move(jobOrderId: string, intakeLabel: string) {
    setError(null);
    if (
      !window.confirm(
        `Pindahkan ${candidateName} ke job order "${intakeLabel}"?\n\nStage akan otomatis advance ke "screening".`,
      )
    ) {
      return;
    }
    startTransition(async () => {
      try {
        await moveApplicationToJobOrder(applicationId, jobOrderId);
        setOpen(false);
      } catch (e) {
        setError((e as Error).message);
      }
    });
  }

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={pending}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-[1.5px] border-pg-red-600 bg-pg-white text-[12px] font-bold tracking-wide text-pg-red-600 hover:bg-pg-red-600 hover:text-pg-white transition-colors disabled:opacity-50 whitespace-nowrap"
      >
        {pending ? (
          <span className="opacity-70">memindahkan…</span>
        ) : (
          <>
            <Icon name="plus" size={12} stroke={2.4} />
            Pindah ke JO
          </>
        )}
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Close"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-30 cursor-default"
          />
          <div className="absolute right-0 top-full mt-1.5 z-40 min-w-[260px] bg-pg-white border-[1.5px] border-pg-ink-200 rounded-xl shadow-lg overflow-hidden">
            <div className="px-3 py-2 border-b border-pg-ink-100 text-[10px] font-bold tracking-[0.12em] uppercase text-pg-ink-500">
              Pindahkan ke job order
            </div>
            <ul className="py-1 max-h-[260px] overflow-y-auto">
              {openJobOrders.map((jo) => {
                const full = jo.slot_filled >= jo.slot_count;
                return (
                  <li key={jo.id}>
                    <button
                      type="button"
                      onClick={() => move(jo.id, jo.intake_label)}
                      disabled={pending}
                      className="w-full text-left px-3 py-2 hover:bg-pg-ink-50 disabled:opacity-50 flex items-start justify-between gap-3"
                    >
                      <div>
                        <div className="text-[13px] font-bold text-pg-ink-900">
                          {jo.intake_label}
                        </div>
                        <div className="text-[11px] text-pg-ink-500 font-mono">
                          {jo.internal_employer_name}
                        </div>
                      </div>
                      <div
                        className={`text-[11px] font-mono whitespace-nowrap ${
                          full ? "text-pg-warn" : "text-pg-ink-500"
                        }`}
                      >
                        {jo.slot_filled}/{jo.slot_count}
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
            {error && (
              <div className="px-3 py-2 border-t border-pg-ink-100 text-[12px] text-pg-err">
                {error}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
