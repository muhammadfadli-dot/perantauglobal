"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Icon } from "@/components/pg/Icon";
import { Badge } from "@/components/pg/primitives";
import { updateApplicationStage } from "@/app/(admin)/admin/actions";

type Card = {
  id: string;
  candidate_id: string;
  pipeline_stage: string;
  created_at: string;
  candidates: { full_name: string; city: string | null } | null;
  application_tiers: { tier: "A" | "B" | "C" | "D" | "rejected" } | null;
};

type Column = {
  key: string;
  label: string;
  stages: string[];
  tone: "warn" | "info" | "ok" | "err" | "mute";
  cards: Card[];
};

const TONE_COLOR: Record<Column["tone"], { bg: string; fg: string }> = {
  warn: { bg: "var(--pg-warn-bg)", fg: "var(--pg-warn)" },
  info: { bg: "var(--pg-info-bg)", fg: "var(--pg-info)" },
  ok: { bg: "var(--pg-ok-bg)", fg: "var(--pg-ok)" },
  err: { bg: "var(--pg-err-bg)", fg: "var(--pg-err)" },
  mute: { bg: "var(--pg-ink-100)", fg: "var(--pg-ink-500)" },
};

const TIER_VARIANT: Record<"A" | "B" | "C" | "D" | "rejected", "ok" | "info" | "warn" | "mute" | "err"> = {
  A: "ok", B: "info", C: "warn", D: "mute", rejected: "err",
};

export default function KanbanColumn({ column }: { column: Column }) {
  const tone = TONE_COLOR[column.tone];
  return (
    <div
      className="rounded-2xl border border-pg-ink-100 flex flex-col min-h-[200px]"
      style={{ background: column.tone === "err" ? "var(--pg-paper)" : "var(--pg-paper)" }}
    >
      <div
        className="px-4 py-3 rounded-t-2xl flex items-center justify-between"
        style={{ background: tone.bg, color: tone.fg }}
      >
        <div className="text-[12px] font-bold tracking-[0.1em] uppercase">{column.label}</div>
        <div className="text-[12px] font-bold tabular-nums">{column.cards.length}</div>
      </div>
      <div className="flex-1 p-3 grid gap-2.5">
        {column.cards.length === 0 ? (
          <div className="py-6 text-center text-[12px] text-pg-ink-400">Kosong</div>
        ) : (
          column.cards.map((c) => <CardRow key={c.id} card={c} columnStages={column.stages} />)
        )}
      </div>
    </div>
  );
}

function CardRow({ card, columnStages }: { card: Card; columnStages: string[] }) {
  const [pending, start] = useTransition();
  const [stage, setStage] = useState(card.pipeline_stage);
  const [error, setError] = useState<string | null>(null);
  const tier = card.application_tiers?.tier ?? null;

  function changeStage(next: string) {
    setError(null);
    const prev = stage;
    setStage(next);
    start(async () => {
      try {
        await updateApplicationStage(card.id, next);
      } catch (err) {
        setStage(prev);
        setError(err instanceof Error ? err.message : "Gagal");
      }
    });
  }

  return (
    <div className="bg-pg-white border border-pg-ink-100 rounded-xl p-3">
      <Link
        href={`/admin/candidates/${card.candidate_id}`}
        className="text-[14px] font-bold no-underline text-pg-ink-900 hover:text-pg-red-600"
      >
        {card.candidates?.full_name ?? "—"}
      </Link>
      <div className="text-[11px] text-pg-ink-500 mt-0.5">
        {card.candidates?.city ?? "—"} · {new Date(card.created_at).toLocaleDateString("id-ID")}
      </div>
      <div className="mt-2 flex items-center gap-1.5 flex-wrap">
        {tier && <Badge variant={TIER_VARIANT[tier]}>Tier {tier}</Badge>}
      </div>
      <div className="mt-2.5">
        <select
          value={stage}
          onChange={(e) => changeStage(e.target.value)}
          disabled={pending}
          className="w-full bg-pg-paper border border-pg-ink-200 rounded-md px-2 py-1.5 text-[12px] font-mono outline-none focus:border-pg-red-600 disabled:opacity-50"
        >
          <optgroup label="Di kolom ini">
            {columnStages.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </optgroup>
          <optgroup label="Pindah ke kolom lain">
            {[
              "applied", "screening", "voice_screen", "interview", "document_check",
              "briefing", "trial", "selected", "training", "deployed", "active",
              "rejected", "exit",
            ].filter((s) => !columnStages.includes(s)).map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </optgroup>
        </select>
      </div>
      {error && (
        <div className="mt-1.5 text-[11px] text-pg-err flex items-center gap-1">
          <Icon name="warn" size={10} /> {error}
        </div>
      )}
    </div>
  );
}
