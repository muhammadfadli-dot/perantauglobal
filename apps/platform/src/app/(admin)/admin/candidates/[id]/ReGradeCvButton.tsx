"use client";

import { useState, useTransition } from "react";
import { Icon } from "@/components/pg/Icon";
import { reGradeCv } from "../actions";

/**
 * Admin trigger to (re)grade a candidate's CV. Reads the CV + credential docs,
 * re-extracts, and re-fits the candidate's open applications. Runs via a
 * service-role server action (grade-cv is privileged-only for cross-candidate
 * grading) — see candidates/actions.ts.
 */
export default function ReGradeCvButton({ candidateId }: { candidateId: string }) {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<{ kind: "err" | "ok"; text: string } | null>(null);

  function run() {
    setMsg(null);
    start(async () => {
      const res = await reGradeCv(candidateId);
      setMsg(res.ok ? { kind: "ok", text: "CV dinilai ulang." } : { kind: "err", text: res.error });
    });
  }

  return (
    <div className="flex flex-col items-end gap-0.5">
      <button
        type="button"
        onClick={run}
        disabled={pending}
        className="inline-flex items-center gap-1 text-[10px] font-bold tracking-[0.06em] uppercase disabled:opacity-50"
        style={{ color: "var(--pg-ink-tertiary)", fontFamily: "var(--font-mono)" }}
        title="Baca ulang CV + sertifikat, lalu nilai ulang kecocokan ke posisi"
      >
        <Icon name="sparkle" size={11} />
        {pending ? "menilai…" : "grade ulang"}
      </button>
      {msg && (
        <span
          className="text-[10px] max-w-[200px] text-right leading-tight"
          style={{ color: msg.kind === "err" ? "var(--pg-err)" : "var(--pg-ok-soft-fg)" }}
        >
          {msg.text}
        </span>
      )}
    </div>
  );
}
