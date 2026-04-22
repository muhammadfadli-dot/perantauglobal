"use client";

import { useTransition, useState } from "react";
import { updateApplicationStage } from "@/app/(admin)/admin/actions";

const STAGES = [
  "applied",
  "screening",
  "voice_screen",
  "interview",
  "document_check",
  "briefing",
  "trial",
  "selected",
  "training",
  "deployed",
  "active",
  "rejected",
  "exit",
] as const;

export default function StageSelector({
  applicationId,
  current,
}: {
  applicationId: string;
  current: string;
}) {
  const [pending, start] = useTransition();
  const [value, setValue] = useState(current);
  const [error, setError] = useState<string | null>(null);

  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value;
    setValue(next);
    setError(null);
    start(async () => {
      try {
        await updateApplicationStage(applicationId, next);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Update gagal");
        setValue(current);
      }
    });
  }

  return (
    <div>
      <select
        value={value}
        onChange={onChange}
        disabled={pending}
        className="w-full border border-[var(--color-dtg-ink)]/20 bg-white px-3 py-2 text-sm outline-none focus:border-[var(--color-dtg-red)] disabled:opacity-60"
      >
        {STAGES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      {pending && (
        <p className="mt-1 font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.1em] opacity-60">
          Menyimpan…
        </p>
      )}
      {error && (
        <p className="mt-1 text-[11px] text-[var(--color-dtg-red)]">{error}</p>
      )}
    </div>
  );
}
