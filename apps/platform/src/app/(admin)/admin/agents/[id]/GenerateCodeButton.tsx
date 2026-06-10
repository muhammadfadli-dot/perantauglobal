"use client";

import { useState, useTransition } from "react";
import { Icon } from "@/components/pg/Icon";
import { generateReferralCode } from "../actions";

export default function GenerateCodeButton({ agentId }: { agentId: string }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [custom, setCustom] = useState("");

  function run(code?: string) {
    setError(null);
    start(async () => {
      const res = await generateReferralCode(agentId, code ?? null);
      if (!res.ok) {
        setError(res.error);
      } else {
        setCustom("");
        setOpen(false);
      }
    });
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-bold text-pg-ink-secondary"
        style={{ border: "1px solid var(--pg-border)", background: "var(--pg-white)" }}
      >
        <Icon name="plus" size={13} stroke={2.4} /> Tambah kode
      </button>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1.5">
      <div className="flex items-center gap-1.5">
        <input
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          placeholder="WAHYU-2026"
          autoCapitalize="characters"
          disabled={pending}
          className="w-[150px] bg-pg-white border border-pg-ink-200 rounded-lg px-2.5 py-1.5 text-[12px] font-bold uppercase outline-none focus:border-pg-red-600 disabled:opacity-50"
          style={{ fontFamily: "var(--font-mono)" }}
        />
        <button
          type="button"
          onClick={() => run(custom.trim() || undefined)}
          disabled={pending || custom.trim().length === 0}
          className="inline-flex items-center px-2.5 py-1.5 rounded-lg text-[12px] font-bold text-white disabled:opacity-50"
          style={{ background: "var(--pg-red-600)" }}
        >
          {pending ? "…" : "Buat"}
        </button>
      </div>
      <div className="flex items-center gap-2 text-[11px]">
        <button
          type="button"
          onClick={() => run(undefined)}
          disabled={pending}
          className="font-bold text-pg-ink-tertiary hover:text-pg-red-600 disabled:opacity-50"
        >
          atau buat kode acak
        </button>
        <span className="text-pg-ink-quaternary">·</span>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setError(null);
          }}
          className="font-bold text-pg-ink-tertiary hover:text-pg-ink-primary"
        >
          batal
        </button>
      </div>
      {error && (
        <span className="text-[11px] text-pg-err flex items-center gap-1 text-right max-w-[220px]">
          <Icon name="warn" size={11} className="shrink-0" /> {error}
        </span>
      )}
    </div>
  );
}
