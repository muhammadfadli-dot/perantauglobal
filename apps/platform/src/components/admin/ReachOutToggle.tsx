"use client";

import { useState, useTransition } from "react";
import { Icon } from "@/components/pg/Icon";
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
      className={`inline-flex items-center gap-2 min-h-[36px] px-3 text-[12px] font-bold tracking-wide uppercase rounded-lg border-[1.5px] transition-colors disabled:opacity-60 ${
        value
          ? "bg-pg-red-600 text-white border-pg-red-600"
          : "bg-pg-white text-pg-ink-700 border-pg-ink-200 hover:border-pg-ink-300"
      }`}
    >
      <Icon name={value ? "check" : "phone"} size={12} stroke={2.4} />
      {value
        ? `Outreach ${at ? new Date(at).toLocaleDateString("id-ID") : ""}`
        : "Belum outreach"}
    </button>
  );
}
