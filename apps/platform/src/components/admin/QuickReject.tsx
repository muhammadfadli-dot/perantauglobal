"use client";

import { useState, useTransition } from "react";
import { Icon } from "@/components/pg/Icon";
import { updateApplicationStage } from "@/app/(admin)/admin/actions";

/**
 * One-click reject from the talent-pool list, so an admin can clear obviously
 * unqualified candidates from the 674-strong applied backlog without opening each
 * dossier. Confirms first (rejecting is a real decision), sets pipeline_stage =
 * 'rejected', and shows a settled state.
 */
export default function QuickReject({
  applicationId,
  candidateName,
}: {
  applicationId: string;
  candidateName: string;
}) {
  const [pending, start] = useTransition();
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function reject() {
    const ok = window.confirm(
      `Tolak lamaran ${candidateName}? Statusnya jadi "Tidak lolos".`,
    );
    if (!ok) return;
    setError(null);
    start(async () => {
      try {
        await updateApplicationStage(applicationId, "rejected");
        setDone(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal");
      }
    });
  }

  if (done) {
    return (
      <span className="text-[11px] font-bold text-pg-ink-400 uppercase tracking-wide">
        Ditolak
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={reject}
      disabled={pending}
      title="Tolak lamaran ini"
      className="inline-flex items-center gap-1 text-[11px] font-bold text-pg-ink-400 hover:text-pg-err disabled:opacity-50"
    >
      <Icon name="x" size={11} stroke={2.4} />
      {pending ? "…" : error ? "Coba lagi" : "Tolak"}
    </button>
  );
}
