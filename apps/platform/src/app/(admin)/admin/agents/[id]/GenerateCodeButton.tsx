"use client";

import { useState, useTransition } from "react";
import { Icon } from "@/components/pg/Icon";
import { generateReferralCode } from "../actions";

export default function GenerateCodeButton({ agentId }: { agentId: string }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function generate() {
    setError(null);
    start(async () => {
      const res = await generateReferralCode(agentId);
      if (!res.ok) setError(res.error);
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={generate}
        disabled={pending}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-bold text-pg-ink-secondary no-underline disabled:opacity-50"
        style={{ border: "1px solid var(--pg-border)", background: "var(--pg-white)" }}
      >
        <Icon name="plus" size={13} stroke={2.4} />
        {pending ? "Membuat…" : "Generate kode"}
      </button>
      {error && (
        <span className="text-[11px] text-pg-err flex items-center gap-1">
          <Icon name="warn" size={11} /> {error}
        </span>
      )}
    </div>
  );
}
