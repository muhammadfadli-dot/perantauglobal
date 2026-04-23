"use client";

import { useState, useTransition } from "react";
import { Icon } from "@/components/pg/Icon";
import { assignTier, clearTier } from "@/app/(admin)/admin/actions";

const TIERS: { value: "A" | "B" | "C" | "D" | "rejected"; label: string; bg: string; fg: string }[] = [
  { value: "A", label: "A", bg: "var(--pg-ok-bg)", fg: "var(--pg-ok)" },
  { value: "B", label: "B", bg: "var(--pg-info-bg)", fg: "var(--pg-info)" },
  { value: "C", label: "C", bg: "var(--pg-warn-bg)", fg: "var(--pg-warn)" },
  { value: "D", label: "D", bg: "var(--pg-ink-100)", fg: "var(--pg-ink-700)" },
  { value: "rejected", label: "Rejected", bg: "var(--pg-err-bg)", fg: "var(--pg-err)" },
];

export default function TierPicker({
  applicationId,
  current,
}: {
  applicationId: string;
  current: "A" | "B" | "C" | "D" | "rejected" | null;
}) {
  const [pending, start] = useTransition();
  const [value, setValue] = useState(current);
  const [error, setError] = useState<string | null>(null);

  function pick(next: "A" | "B" | "C" | "D" | "rejected") {
    setError(null);
    const prev = value;
    setValue(next);
    start(async () => {
      try {
        await assignTier(applicationId, next);
      } catch (err) {
        setValue(prev);
        setError(err instanceof Error ? err.message : "Gagal assign tier");
      }
    });
  }

  function clear() {
    setError(null);
    const prev = value;
    setValue(null);
    start(async () => {
      try {
        await clearTier(applicationId);
      } catch (err) {
        setValue(prev);
        setError(err instanceof Error ? err.message : "Gagal hapus tier");
      }
    });
  }

  return (
    <div>
      <div className="text-[11px] font-bold tracking-[0.1em] uppercase text-pg-ink-500">
        Tier assignment
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {TIERS.map((t) => {
          const active = t.value === value;
          return (
            <button
              key={t.value}
              type="button"
              onClick={() => pick(t.value)}
              disabled={pending}
              className="inline-flex items-center justify-center min-h-[32px] px-2.5 text-[12px] font-bold tracking-wide uppercase rounded-lg border-[1.5px] disabled:opacity-50 transition-colors"
              style={{
                background: active ? t.bg : "var(--pg-white)",
                color: active ? t.fg : "var(--pg-ink-500)",
                borderColor: active ? t.fg : "var(--pg-ink-200)",
              }}
            >
              {t.label}
            </button>
          );
        })}
        {value && (
          <button
            type="button"
            onClick={clear}
            disabled={pending}
            className="inline-flex items-center gap-1 min-h-[32px] px-2 text-[11px] font-semibold text-pg-ink-500 hover:text-pg-ink-900"
          >
            <Icon name="x" size={12} /> Hapus
          </button>
        )}
      </div>
      {error && (
        <div className="text-[11px] text-pg-err mt-1.5 flex items-center gap-1">
          <Icon name="warn" size={12} /> {error}
        </div>
      )}
    </div>
  );
}
