"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ReadinessBadge } from "@/components/admin/ReadinessBadge";
import { JobOrderPicker } from "@/components/admin/JobOrderPicker";
import ReachOutToggle from "@/components/admin/ReachOutToggle";
import QuickReject from "@/components/admin/QuickReject";
import { Icon } from "@/components/pg/Icon";
import { isRejectedStage, stageLabel } from "@/lib/applicationStatus";
import {
  bulkRejectApplications,
  bulkMoveApplicationsToJobOrder,
} from "@/app/(admin)/admin/actions";

export type OpenJobOrder = {
  id: string;
  intake_label: string;
  internal_employer_name: string;
  position_slug: string;
  slot_count: number;
  slot_filled: number;
};

export type AppRow = {
  id: string;
  candidate_id: string;
  position_slug: string;
  pipeline_stage: string;
  reached_out: boolean;
  score: number | null;
  created_at: string;
  candidate_name: string | null;
  candidate_phone: string | null;
  candidate_city: string | null;
  position_name: string | null;
  position_country: string | null;
  job_order_id: string | null;
  job_order_intake_label: string | null;
  readiness: unknown;
  cv_fit_score: number | null;
  cv_fit_status: string | null;
  cv_has_flags: boolean;
  candidate_has_cv: boolean;
  total_count: number;
};

// A row can be bulk-selected only when it's an actionable pool row — the same
// condition under which the per-row picker + reject show. In-JO rows (managed on
// the JO board) and already-rejected rows get no checkbox.
function isSelectable(r: AppRow): boolean {
  return !r.job_order_id && !isRejectedStage(r.pipeline_stage);
}

export function ApplicationsTable({
  rows,
  jobOrdersByPosition,
  activePosition,
}: {
  rows: AppRow[];
  jobOrdersByPosition: Record<string, OpenJobOrder[]>;
  activePosition: string;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const [moveJo, setMoveJo] = useState("");

  const selectableIds = useMemo(
    () => rows.filter(isSelectable).map((r) => r.id),
    [rows],
  );
  const allSelected = selectableIds.length > 0 && selectableIds.every((id) => selected.has(id));
  const someSelected = selected.size > 0;

  // Bulk move-to-JO is only offered when the list is scoped to one position
  // (job orders are position-scoped, so a mixed selection has no single target).
  const movableJobOrders =
    activePosition && jobOrdersByPosition[activePosition]
      ? jobOrdersByPosition[activePosition]
      : [];

  function toggle(id: string) {
    setMsg(null);
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setMsg(null);
    setSelected((prev) =>
      prev.size === selectableIds.length ? new Set() : new Set(selectableIds),
    );
  }

  function clear() {
    setSelected(new Set());
    setMsg(null);
    setMoveJo("");
  }

  function runReject() {
    const ids = [...selected];
    if (
      !window.confirm(
        `Tolak ${ids.length} lamaran terpilih? Statusnya jadi "Tidak lolos". Bisa dikembalikan lewat halaman kandidat.`,
      )
    )
      return;
    setMsg(null);
    start(async () => {
      const res = await bulkRejectApplications(ids);
      if (res.ok) {
        setMsg(
          `${res.count} lamaran ditolak${res.skipped ? ` · ${res.skipped} dilewati` : ""}.`,
        );
        setSelected(new Set());
        router.refresh();
      } else {
        setMsg(res.error);
      }
    });
  }

  function runMove() {
    const ids = [...selected];
    const jo = movableJobOrders.find((j) => j.id === moveJo);
    if (!jo) {
      setMsg("Pilih job order dulu.");
      return;
    }
    if (!window.confirm(`Pindahkan ${ids.length} kandidat ke job order "${jo.intake_label}"?`))
      return;
    setMsg(null);
    start(async () => {
      const res = await bulkMoveApplicationsToJobOrder(ids, moveJo);
      if (res.ok) {
        setMsg(
          `${res.count} kandidat dipindah${res.skipped ? ` · ${res.skipped} dilewati` : ""}.`,
        );
        setSelected(new Set());
        setMoveJo("");
        router.refresh();
      } else {
        setMsg(res.error);
      }
    });
  }

  return (
    <>
      <div className="mt-6 bg-pg-white border border-pg-ink-100 rounded-2xl overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="border-b border-pg-ink-100 bg-pg-ink-50">
            <tr className="text-left text-[11px] font-bold tracking-[0.1em] uppercase text-pg-ink-500">
              <th className="px-4 py-3 w-10">
                <input
                  type="checkbox"
                  aria-label="Pilih semua di halaman ini"
                  checked={allSelected}
                  ref={(el) => {
                    if (el)
                      el.indeterminate = someSelected && !allSelected;
                  }}
                  onChange={toggleAll}
                  disabled={selectableIds.length === 0}
                  className="h-4 w-4 accent-pg-red-600 cursor-pointer disabled:opacity-30"
                />
              </th>
              <th className="px-4 py-3">Kandidat</th>
              <th className="px-4 py-3">Posisi</th>
              <th className="px-4 py-3">Syarat</th>
              <th className="px-4 py-3">Fit CV</th>
              <th className="px-4 py-3">Outreach</th>
              <th className="px-4 py-3">Masuk</th>
              <th className="px-4 py-3 text-right">Job order</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-pg-ink-500">
                  Tidak ada lamaran yang cocok.
                </td>
              </tr>
            )}
            {rows.map((r) => {
              const posJOs = jobOrdersByPosition[r.position_slug] ?? [];
              const selectable = isSelectable(r);
              const checked = selected.has(r.id);
              return (
                <tr
                  key={r.id}
                  className={`border-b border-pg-ink-100 last:border-b-0 hover:bg-pg-ink-50 ${
                    checked ? "bg-pg-red-50" : ""
                  }`}
                >
                  <td className="px-4 py-3">
                    {selectable ? (
                      <input
                        type="checkbox"
                        aria-label={`Pilih ${r.candidate_name ?? "kandidat"}`}
                        checked={checked}
                        onChange={() => toggle(r.id)}
                        className="h-4 w-4 accent-pg-red-600 cursor-pointer"
                      />
                    ) : null}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/candidates/${r.candidate_id}`}
                      className="font-bold text-pg-ink-900 hover:text-pg-red-600 no-underline"
                    >
                      {r.candidate_name ?? "—"}
                    </Link>
                    <div className="text-[11px] text-pg-ink-500 font-mono">
                      {r.candidate_city ?? "—"} · {r.candidate_phone ?? "—"}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[13px]">
                    <div className="font-semibold">
                      {r.position_name ?? r.position_slug}
                    </div>
                    <div className="text-[11px] text-pg-ink-500 font-mono">
                      {r.position_country ?? ""}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <ReadinessBadge readiness={r.readiness} />
                  </td>
                  <td className="px-4 py-3">
                    <FitCell
                      score={r.cv_fit_score}
                      status={r.cv_fit_status}
                      hasFlags={r.cv_has_flags}
                      candidateHasCv={r.candidate_has_cv}
                    />
                  </td>
                  <td className="px-4 py-3 text-[13px]">
                    <ReachOutToggle
                      applicationId={r.id}
                      reachedOut={r.reached_out}
                      reachedOutAt={null}
                    />
                  </td>
                  <td className="px-4 py-3 text-[12px] text-pg-ink-500 font-mono">
                    {new Date(r.created_at).toLocaleDateString("id-ID")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {r.job_order_id ? (
                      <Link
                        href={`/admin/job-orders/${r.job_order_id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg no-underline text-[12px] font-bold whitespace-nowrap transition-colors"
                        style={{
                          border: "1px solid var(--pg-info)",
                          background: "var(--pg-info-bg)",
                          color: "var(--pg-info)",
                        }}
                        title={`Pipeline stage: ${r.pipeline_stage}`}
                      >
                        <Icon name="arrow_right" size={12} stroke={2.4} />
                        <span className="truncate max-w-[160px]">
                          {r.job_order_intake_label ?? "in JO"}
                        </span>
                      </Link>
                    ) : isRejectedStage(r.pipeline_stage) ? (
                      <span
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[12px] font-bold"
                        style={{ background: "var(--pg-ink-50)", color: "var(--pg-ink-tertiary)" }}
                        title={`Stage: ${r.pipeline_stage}`}
                      >
                        <Icon name="x" size={11} stroke={2.4} /> {stageLabel(r.pipeline_stage)}
                      </span>
                    ) : (
                      <div className="inline-flex flex-col items-end gap-1.5">
                        <JobOrderPicker
                          applicationId={r.id}
                          candidateName={r.candidate_name ?? "kandidat"}
                          openJobOrders={posJOs}
                        />
                        <QuickReject
                          applicationId={r.id}
                          candidateName={r.candidate_name ?? "kandidat"}
                        />
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {someSelected && (
        <div className="fixed inset-x-0 bottom-4 z-40 flex justify-center px-4 pointer-events-none">
          <div className="pointer-events-auto flex flex-wrap items-center gap-3 rounded-2xl bg-pg-ink-900 text-white px-4 py-3 shadow-xl max-w-3xl">
            <span className="text-[13px] font-bold tabular-nums whitespace-nowrap">
              {selected.size} dipilih
            </span>
            <button
              type="button"
              onClick={clear}
              className="text-[12px] font-semibold text-white/70 hover:text-white"
            >
              Batal
            </button>
            <div className="h-5 w-px bg-white/20" />

            {movableJobOrders.length > 0 && (
              <div className="flex items-center gap-1.5">
                <select
                  value={moveJo}
                  onChange={(e) => setMoveJo(e.target.value)}
                  disabled={pending}
                  className="rounded-lg bg-white/10 text-white text-[12px] px-2 py-1.5 border border-white/20 max-w-[200px]"
                >
                  <option value="">Pindah ke job order…</option>
                  {movableJobOrders.map((jo) => (
                    <option key={jo.id} value={jo.id} className="text-pg-ink-900">
                      {jo.intake_label} ({jo.slot_filled}/{jo.slot_count})
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={runMove}
                  disabled={pending || !moveJo}
                  className="inline-flex items-center gap-1 rounded-lg bg-white/15 hover:bg-white/25 px-2.5 py-1.5 text-[12px] font-bold disabled:opacity-40"
                >
                  <Icon name="arrow_right" size={13} stroke={2.4} /> Pindah
                </button>
                <div className="h-5 w-px bg-white/20" />
              </div>
            )}

            <button
              type="button"
              onClick={runReject}
              disabled={pending}
              className="inline-flex items-center gap-1.5 rounded-lg bg-pg-red-600 hover:bg-pg-red-700 px-3 py-1.5 text-[12px] font-bold disabled:opacity-50"
            >
              <Icon name="x" size={13} stroke={2.4} />
              {pending ? "Memproses…" : "Tolak terpilih"}
            </button>

            {msg && <span className="text-[12px] text-white/80 whitespace-nowrap">{msg}</span>}
          </div>
        </div>
      )}

      {!someSelected && msg && (
        <p className="mt-3 text-[13px] font-semibold text-pg-ok-soft-fg">{msg}</p>
      )}
    </>
  );
}

function FitCell({
  score,
  status,
  hasFlags,
  candidateHasCv,
}: {
  score: number | null;
  status: string | null;
  hasFlags: boolean;
  candidateHasCv: boolean;
}) {
  if (score === null) {
    // No fit score. Disambiguate the reason off the candidate's actual CV doc
    // (candidate_has_cv) rather than the grader status — the grader hasn't run on
    // every app, so status alone left no-CV rows showing an ambiguous "—".
    let label: string;
    let title: string;
    if (!candidateHasCv) {
      label = "Belum CV";
      title = "Kandidat belum upload CV";
    } else if (status === "error") {
      label = "Gagal";
      title = "Penilaian CV gagal — buka kandidat";
    } else {
      label = "Belum dinilai";
      title = "CV sudah ada, tapi belum dinilai AI";
    }
    return (
      <span className="text-[11px] text-pg-ink-400" title={title}>
        {label}
      </span>
    );
  }
  const fg =
    score >= 75 ? "var(--pg-ok-soft-fg)" : score >= 50 ? "var(--pg-warn-soft-fg)" : "var(--pg-err)";
  const bg =
    score >= 75 ? "var(--pg-ok-soft-bg)" : score >= 50 ? "var(--pg-warn-soft-bg)" : "var(--pg-err-bg)";
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[12px] font-bold tabular-nums"
      style={{ background: bg, color: fg }}
      title={hasFlags ? "Ada klaim yang perlu dikonfirmasi vs CV" : "Kecocokan CV dengan posisi (AI)"}
    >
      {score}%
      {hasFlags && <Icon name="warn" size={11} />}
    </span>
  );
}
