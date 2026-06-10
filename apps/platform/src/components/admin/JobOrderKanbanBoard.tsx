"use client";

import Link from "next/link";
import { useOptimistic, useState, useTransition } from "react";
import { Icon } from "@/components/pg/Icon";
import { updateApplicationStage } from "@/app/(admin)/admin/actions";
import {
  PIPELINE_COLUMNS,
  columnForStage,
  isRejectedStage,
  stageLabel,
  stageOrder,
  type PipelineColumnKey,
  type PipelineColumnTone,
} from "@/lib/applicationStatus";

export type KanbanApp = {
  id: string;
  candidate_id: string;
  pipeline_stage: string;
  created_at: string;
  candidates: { full_name: string; city: string | null } | null;
};

const TONE_DOT: Record<PipelineColumnTone, string> = {
  warn: "var(--pg-warn-soft-fg)",
  info: "var(--pg-info)",
  ok: "var(--pg-ok-soft-fg)",
  mute: "var(--pg-ink-quaternary)",
};

/**
 * The interactive pipeline board on the job-order detail page. Each card carries a
 * stage <select> (friendly labels), so a recruiter can advance a candidate through
 * the pipeline from where they actually work — the job order — instead of the now
 * deleted orphaned /kanban route. useOptimistic moves the card to its new column
 * instantly; updateApplicationStage revalidates the JO path so the server-grouped
 * data reconciles.
 */
export default function JobOrderKanbanBoard({
  apps,
  slotCount,
}: {
  apps: KanbanApp[];
  slotCount: number;
}) {
  const [optimisticApps, applyOptimistic] = useOptimistic(
    apps,
    (state: KanbanApp[], next: { id: string; stage: string }) =>
      state.map((a) =>
        a.id === next.id ? { ...a, pipeline_stage: next.stage } : a,
      ),
  );

  // Error state lives HERE, keyed by app id — not in PipelineCard. A failed
  // cross-column move unmounts the origin card (it relocates to a different column
  // subtree), so a card-local error would land on an unmounted instance and never
  // show. Keyed parent state survives the relocation.
  const [errorById, setErrorById] = useState<Record<string, string | null>>({});
  const setError = (id: string, msg: string | null) =>
    setErrorById((prev) => ({ ...prev, [id]: msg }));

  const byColumn = new Map<PipelineColumnKey, KanbanApp[]>();
  for (const col of PIPELINE_COLUMNS) byColumn.set(col.key, []);
  for (const a of optimisticApps) {
    byColumn.get(columnForStage(a.pipeline_stage))!.push(a);
  }

  return (
    <div className="grid gap-4 lg:grid-cols-4">
      {PIPELINE_COLUMNS.map((col) => {
        const items = byColumn.get(col.key) ?? [];
        const countLabel =
          col.key === "accepted"
            ? `${items.length} / ${slotCount}`
            : `${items.length}`;
        return (
          <div key={col.key} className="flex flex-col gap-3 min-w-0">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ background: TONE_DOT[col.tone] }}
                />
                <span className="text-[14px] font-bold text-pg-ink-primary">
                  {col.label}
                </span>
              </div>
              <span
                className="text-[12px] font-semibold tabular-nums"
                style={{
                  color: "var(--pg-ink-tertiary)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {countLabel}
              </span>
            </div>
            <div className="flex flex-col gap-2.5 min-h-[200px]">
              {items.map((a) => (
                <PipelineCard
                  key={a.id}
                  app={a}
                  muted={col.key === "rejected"}
                  applyOptimistic={applyOptimistic}
                  error={errorById[a.id] ?? null}
                  onError={setError}
                />
              ))}
              {items.length === 0 && (
                <div
                  className="rounded-xl px-4 py-6 text-center text-[12px]"
                  style={{
                    background: "var(--pg-paper)",
                    border: "1px dashed var(--pg-border)",
                    color: "var(--pg-ink-quaternary)",
                  }}
                >
                  Belum ada
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function PipelineCard({
  app,
  muted,
  applyOptimistic,
  error,
  onError,
}: {
  app: KanbanApp;
  muted: boolean;
  applyOptimistic: (next: { id: string; stage: string }) => void;
  error: string | null;
  onError: (id: string, msg: string | null) => void;
}) {
  const [pending, start] = useTransition();
  const c = app.candidates;
  const initials =
    c?.full_name
      ?.split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((s) => s[0]?.toUpperCase())
      .join("") ?? "??";

  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value;
    const current = app.pipeline_stage;
    if (next === current) return;
    // Confirm a backward move (target earlier in the flow), but treat moving INTO
    // rejected/exit as terminal — that's a normal decision, not a regression.
    if (
      stageOrder(next) < stageOrder(current) &&
      !isRejectedStage(next) &&
      !isRejectedStage(current)
    ) {
      const ok = window.confirm(
        `Mundurkan ${c?.full_name ?? "kandidat"} dari "${stageLabel(
          current,
        )}" ke "${stageLabel(next)}"?`,
      );
      if (!ok) return;
    }
    onError(app.id, null);
    start(async () => {
      applyOptimistic({ id: app.id, stage: next });
      try {
        await updateApplicationStage(app.id, next);
      } catch (err) {
        onError(app.id, err instanceof Error ? err.message : "Gagal update stage");
      }
    });
  }

  return (
    <div
      className="bg-pg-white rounded-xl p-3"
      style={{ border: "1px solid var(--pg-border)", opacity: muted ? 0.7 : 1 }}
    >
      <div className="flex items-start gap-2.5">
        <div
          className="w-8 h-8 rounded-full grid place-items-center font-bold text-[11px] shrink-0"
          style={{
            background: muted ? "var(--pg-ink-50)" : "var(--pg-ink-primary)",
            color: muted ? "var(--pg-ink-tertiary)" : "white",
            fontFamily: "var(--font-mono)",
          }}
        >
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <Link
            href={`/admin/candidates/${app.candidate_id}`}
            className="text-[13px] font-bold text-pg-ink-primary leading-tight truncate block no-underline hover:text-pg-red-600"
          >
            {c?.full_name ?? "—"}
          </Link>
          <div
            className="text-[11px] mt-0.5 leading-tight truncate"
            style={{
              color: "var(--pg-ink-tertiary)",
              fontFamily: "var(--font-mono)",
            }}
          >
            {c?.city ?? "—"} ·{" "}
            {new Date(app.created_at).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
            })}
          </div>
        </div>
      </div>
      <select
        value={app.pipeline_stage}
        onChange={onChange}
        disabled={pending}
        aria-label="Ubah stage pipeline"
        className="mt-2.5 w-full bg-pg-paper border border-pg-ink-200 rounded-md px-2 py-1.5 text-[12px] font-semibold outline-none focus:border-pg-red-600 disabled:opacity-50"
      >
        {PIPELINE_COLUMNS.map((col) => (
          <optgroup key={col.key} label={col.label}>
            {col.stages.map((s) => (
              <option key={s} value={s}>
                {stageLabel(s)}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
      {error && (
        <div className="mt-1.5 text-[11px] text-pg-err flex items-center gap-1">
          <Icon name="warn" size={10} /> {error}
        </div>
      )}
    </div>
  );
}
