"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  markEnrollmentPaidByAdmin,
  waiveEnrollmentByAdmin,
} from "@/app/(admin)/admin/academy/actions";

/**
 * Inline admin payment controls for a paid-program enrollment that hasn't been
 * settled yet. Mark-paid = manual confirm (offline transfer / Fase 1); Waive =
 * scholarship/comp. Both audit-logged server-side; refresh on success.
 */
export function EnrollmentPaymentActions({ enrollmentId }: { enrollmentId: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  function run(fn: () => Promise<{ ok: boolean; error?: string }>, confirmMsg: string) {
    if (!window.confirm(confirmMsg)) return;
    setErr(null);
    start(async () => {
      const r = await fn();
      if (!r.ok) {
        setErr(r.error ?? "Gagal.");
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-2 justify-end">
      {err && <span className="text-[11px] text-pg-err">{err}</span>}
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          run(
            () => markEnrollmentPaidByAdmin(enrollmentId),
            "Tandai pembayaran ini LUNAS? Akses kelas akan terbuka.",
          )
        }
        className="inline-flex items-center min-h-[34px] px-3 text-[12px] font-bold rounded-lg text-white disabled:opacity-60"
        style={{ background: "var(--pg-ok)" }}
      >
        Tandai lunas
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          run(
            () => waiveEnrollmentByAdmin(enrollmentId),
            "Bebaskan biaya (waive) untuk pendaftaran ini?",
          )
        }
        className="inline-flex items-center min-h-[34px] px-3 text-[12px] font-bold rounded-lg border-[1.5px] border-pg-ink-200 text-pg-ink-700 disabled:opacity-60"
      >
        Waive
      </button>
    </div>
  );
}
