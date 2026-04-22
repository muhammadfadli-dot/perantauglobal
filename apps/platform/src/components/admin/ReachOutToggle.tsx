"use client";

import { useState, useTransition } from "react";
import { toggleReachedOut } from "@/app/(admin)/admin/actions";

export default function ReachOutToggle({
  applicationId,
  reachedOut,
  reachedOutAt,
}: {
  applicationId: string;
  reachedOut: boolean;
  reachedOutAt: string | null;
}) {
  const [value, setValue] = useState(reachedOut);
  const [at, setAt] = useState(reachedOutAt);
  const [pending, start] = useTransition();

  function toggle() {
    const next = !value;
    setValue(next);
    setAt(next ? new Date().toISOString() : null);
    start(async () => {
      try {
        await toggleReachedOut(applicationId, next);
      } catch {
        setValue(!next);
        setAt(reachedOutAt);
      }
    });
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      className={
        "flex items-center gap-2 border px-3 py-1.5 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.1em] transition-colors disabled:opacity-60 " +
        (value
          ? "border-[var(--color-dtg-ink)] bg-[var(--color-dtg-ink)] text-white"
          : "border-[var(--color-dtg-ink)]/30 hover:border-[var(--color-dtg-ink)]")
      }
    >
      <span
        className={
          "inline-block h-2 w-2 rounded-full " +
          (value ? "bg-white" : "bg-[var(--color-dtg-ink)]/30")
        }
      />
      {value
        ? `Di-outreach ${at ? new Date(at).toLocaleDateString("id-ID") : ""}`
        : "Belum di-outreach"}
    </button>
  );
}
