"use client";

import { useState, useTransition } from "react";
import { Icon } from "@/components/pg/Icon";
import { setReferralCodeStatus } from "../actions";
import type { ReferralCodeStatus } from "@perantauglobal/db";

export default function CodeStatusButton({
  codeId,
  status,
}: {
  codeId: string;
  status: ReferralCodeStatus;
}) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const next: ReferralCodeStatus = status === "active" ? "inactive" : "active";

  function toggle() {
    setError(null);
    start(async () => {
      const res = await setReferralCodeStatus(codeId, next);
      if (!res.ok) setError(res.error);
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={toggle}
        disabled={pending}
        className="text-[11px] font-bold no-underline disabled:opacity-50"
        style={{ color: status === "active" ? "var(--pg-err)" : "var(--pg-ok-soft-fg)" }}
        title={status === "active" ? "Nonaktifkan kode" : "Aktifkan kembali"}
      >
        {pending ? "…" : status === "active" ? "Nonaktifkan" : "Aktifkan"}
      </button>
      {error && (
        <span className="text-[10px] text-pg-err flex items-center gap-1">
          <Icon name="warn" size={10} /> {error}
        </span>
      )}
    </div>
  );
}
