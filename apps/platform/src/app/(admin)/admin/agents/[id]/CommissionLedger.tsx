"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Icon } from "@/components/pg/Icon";
import {
  setCommissionAmount,
  approveCommissionEvent,
  markCommissionPaid,
  voidCommissionEvent,
} from "../actions";
import type { CommissionEventStatus, CommissionEventType } from "@perantauglobal/db";

export type LedgerEvent = {
  id: string;
  candidate_id: string;
  candidate_name: string;
  event_type: CommissionEventType;
  amount: number | null;
  currency: string;
  status: CommissionEventStatus;
  triggered_stage: string | null;
  created_at: string;
};

const TYPE_LABEL: Record<CommissionEventType, string> = {
  registration: "Registrasi",
  departure: "Berangkat",
};
const TYPE_TONE: Record<CommissionEventType, { bg: string; fg: string }> = {
  registration: { bg: "var(--pg-info-bg)", fg: "var(--pg-info)" },
  departure: { bg: "var(--pg-ok-soft-bg)", fg: "var(--pg-ok-soft-fg)" },
};

const STATUS_LABEL: Record<CommissionEventStatus, string> = {
  pending: "Pending",
  approved: "Disetujui",
  paid: "Dibayar",
  void: "Void",
};
const STATUS_TONE: Record<CommissionEventStatus, { bg: string; fg: string }> = {
  pending: { bg: "var(--pg-warn-soft-bg)", fg: "var(--pg-warn-soft-fg)" },
  approved: { bg: "var(--pg-info-bg)", fg: "var(--pg-info)" },
  paid: { bg: "var(--pg-ok-soft-bg)", fg: "var(--pg-ok-soft-fg)" },
  void: { bg: "var(--pg-ink-50)", fg: "var(--pg-ink-tertiary)" },
};

/** "Rp 500.000" — no decimals for whole IDR; null → "—". */
export function formatIDR(amount: number | null): string {
  if (amount == null) return "—";
  return `Rp ${new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 0,
  }).format(amount)}`;
}

export default function CommissionLedger({ events }: { events: LedgerEvent[] }) {
  if (events.length === 0) {
    return (
      <div className="text-[13px] text-pg-ink-tertiary italic py-4 text-center">
        Belum ada event komisi. Event muncul otomatis saat kandidat ter-refer mendaftar atau
        berangkat.
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div
        className="hidden md:grid items-center px-3 py-2 text-[10px] font-semibold tracking-[0.1em] uppercase"
        style={{
          gridTemplateColumns: "minmax(0,1.6fr) 0.9fr 1.2fr 0.9fr 1.7fr",
          color: "var(--pg-ink-tertiary)",
          fontFamily: "var(--font-mono)",
          borderBottom: "1px solid var(--pg-border)",
        }}
      >
        <span>Kandidat</span>
        <span>Tipe</span>
        <span>Nominal</span>
        <span>Status</span>
        <span className="text-right">Aksi</span>
      </div>
      {events.map((ev) => (
        <LedgerRow key={ev.id} ev={ev} />
      ))}
    </div>
  );
}

function LedgerRow({ ev }: { ev: LedgerEvent }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [amountStr, setAmountStr] = useState(ev.amount != null ? String(ev.amount) : "");

  const locked = ev.status === "void" || ev.status === "paid";

  function run(fn: () => Promise<{ ok: true } | { ok: false; error: string }>) {
    setError(null);
    start(async () => {
      const res = await fn();
      if (!res.ok) setError(res.error);
    });
  }

  function saveAmount() {
    const trimmed = amountStr.trim();
    const parsed = trimmed === "" ? null : Number(trimmed.replace(/[.,\s]/g, ""));
    if (parsed != null && (!Number.isFinite(parsed) || parsed < 0)) {
      setError("Nominal harus angka ≥ 0.");
      return;
    }
    setError(null);
    start(async () => {
      const res = await setCommissionAmount(ev.id, parsed);
      if (!res.ok) setError(res.error);
      else setEditing(false);
    });
  }

  return (
    <div
      className="grid items-center gap-y-2 px-3 py-3 md:gap-y-0"
      style={{
        gridTemplateColumns: "minmax(0,1.6fr) 0.9fr 1.2fr 0.9fr 1.7fr",
        borderBottom: "1px solid var(--pg-border-soft)",
      }}
    >
      {/* Candidate */}
      <div className="min-w-0">
        <Link
          href={`/admin/candidates/${ev.candidate_id}`}
          className="text-[13px] font-bold text-pg-ink-primary no-underline hover:text-pg-red-600 truncate block"
        >
          {ev.candidate_name}
        </Link>
        <div
          className="text-[10px] mt-0.5"
          style={{ color: "var(--pg-ink-tertiary)", fontFamily: "var(--font-mono)" }}
        >
          {new Date(ev.created_at).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </div>
      </div>

      {/* Type badge */}
      <div>
        <span
          className="inline-flex w-fit px-2 py-0.5 rounded-md text-[10px] font-bold tracking-[0.06em] uppercase"
          style={{
            background: TYPE_TONE[ev.event_type].bg,
            color: TYPE_TONE[ev.event_type].fg,
            fontFamily: "var(--font-mono)",
          }}
        >
          {TYPE_LABEL[ev.event_type]}
        </span>
      </div>

      {/* Amount (inline edit) */}
      <div className="min-w-0">
        {editing && !locked ? (
          <div className="flex items-center gap-1.5">
            <span className="text-[12px] text-pg-ink-tertiary">Rp</span>
            <input
              type="text"
              inputMode="numeric"
              autoFocus
              value={amountStr}
              onChange={(e) => setAmountStr(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") saveAmount();
                if (e.key === "Escape") {
                  setEditing(false);
                  setAmountStr(ev.amount != null ? String(ev.amount) : "");
                }
              }}
              placeholder="500000"
              className="w-24 bg-pg-white border-[1.5px] border-pg-ink-200 rounded-md px-2 py-1 text-[13px] font-semibold outline-none focus:border-pg-red-600 tabular-nums"
            />
            <button
              type="button"
              onClick={saveAmount}
              disabled={pending}
              className="text-pg-ok-soft-fg disabled:opacity-50"
              title="Simpan nominal"
            >
              <Icon name="check" size={15} stroke={2.4} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => !locked && setEditing(true)}
            disabled={locked}
            className="text-[14px] font-bold text-pg-ink-primary tabular-nums no-underline disabled:cursor-default inline-flex items-center gap-1.5 group"
            title={locked ? undefined : "Klik untuk isi nominal"}
          >
            {formatIDR(ev.amount)}
            {!locked && (
              <Icon
                name="edit"
                size={12}
                className="text-pg-ink-quaternary opacity-0 group-hover:opacity-100"
              />
            )}
          </button>
        )}
      </div>

      {/* Status badge */}
      <div>
        <span
          className="inline-flex w-fit px-2 py-0.5 rounded-md text-[10px] font-bold tracking-[0.06em] uppercase"
          style={{
            background: STATUS_TONE[ev.status].bg,
            color: STATUS_TONE[ev.status].fg,
            fontFamily: "var(--font-mono)",
          }}
        >
          {STATUS_LABEL[ev.status]}
        </span>
      </div>

      {/* Actions */}
      <div className="flex flex-col items-start md:items-end gap-1">
        <div className="flex flex-wrap items-center gap-1.5 md:justify-end">
          {ev.status === "pending" && (
            <ActionBtn
              label="Approve"
              tone="primary"
              disabled={pending}
              onClick={() => run(() => approveCommissionEvent(ev.id))}
            />
          )}
          {ev.status === "approved" && (
            <ActionBtn
              label="Tandai dibayar"
              tone="ok"
              disabled={pending}
              onClick={() => run(() => markCommissionPaid(ev.id))}
            />
          )}
          {ev.status !== "void" && ev.status !== "paid" && (
            <ActionBtn
              label="Void"
              tone="mute"
              disabled={pending}
              onClick={() => run(() => voidCommissionEvent(ev.id))}
            />
          )}
          {(ev.status === "void" || ev.status === "paid") && (
            <span className="text-[11px] text-pg-ink-quaternary">Final</span>
          )}
        </div>
        {error && (
          <span className="text-[10px] text-pg-err flex items-center gap-1 text-right">
            <Icon name="warn" size={10} /> {error}
          </span>
        )}
      </div>
    </div>
  );
}

function ActionBtn({
  label,
  tone,
  disabled,
  onClick,
}: {
  label: string;
  tone: "primary" | "ok" | "mute";
  disabled?: boolean;
  onClick: () => void;
}) {
  const style =
    tone === "primary"
      ? { background: "var(--pg-red-600)", color: "white", border: "none" }
      : tone === "ok"
      ? { background: "var(--pg-ok-soft-bg)", color: "var(--pg-ok-soft-fg)", border: "none" }
      : {
          background: "var(--pg-white)",
          color: "var(--pg-ink-tertiary)",
          border: "1px solid var(--pg-border)",
        };
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="px-2.5 py-1 rounded-md text-[11px] font-bold disabled:opacity-50"
      style={style}
    >
      {label}
    </button>
  );
}
