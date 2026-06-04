"use client";

import { useState, useTransition } from "react";
import { Icon } from "@/components/pg/Icon";
import { updateAffiliateAgent } from "../actions";
import type { AffiliateAgentStatus } from "@perantauglobal/db";

const OPTIONS: { value: AffiliateAgentStatus; label: string }[] = [
  { value: "active", label: "Aktif" },
  { value: "inactive", label: "Nonaktif" },
  { value: "suspended", label: "Suspended" },
];

export default function AgentStatusControls({
  agentId,
  current,
}: {
  agentId: string;
  current: AffiliateAgentStatus;
}) {
  const [pending, start] = useTransition();
  const [value, setValue] = useState(current);
  const [error, setError] = useState<string | null>(null);

  function change(next: AffiliateAgentStatus) {
    if (next === value) return;
    setError(null);
    const prev = value;
    setValue(next);
    start(async () => {
      const res = await updateAffiliateAgent(agentId, { status: next });
      if (!res.ok) {
        setValue(prev);
        setError(res.error);
      }
    });
  }

  return (
    <div className="flex flex-col gap-2">
      {OPTIONS.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => change(opt.value)}
            disabled={pending}
            className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg border-[1.5px] text-sm font-bold transition-colors disabled:opacity-50 ${
              active
                ? "bg-pg-red-50 border-pg-red-600 text-pg-red-800"
                : "bg-pg-white border-pg-ink-200 text-pg-ink-700 hover:border-pg-ink-300"
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full border-2 grid place-items-center ${
                active ? "border-pg-red-600" : "border-pg-ink-300"
              }`}
            >
              {active && <div className="w-2 h-2 rounded-full bg-pg-red-600" />}
            </div>
            {opt.label}
          </button>
        );
      })}
      {pending && <div className="text-[11px] text-pg-ink-500 mt-1">Menyimpan…</div>}
      {error && (
        <div className="text-[11px] text-pg-err flex items-center gap-1 mt-1">
          <Icon name="warn" size={12} /> {error}
        </div>
      )}
    </div>
  );
}
