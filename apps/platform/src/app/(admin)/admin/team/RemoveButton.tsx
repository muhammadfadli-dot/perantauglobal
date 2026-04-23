"use client";

import { useState, useTransition } from "react";
import { Icon } from "@/components/pg/Icon";
import { removeAdmin } from "./actions";

export default function RemoveButton({ email }: { email: string }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function remove() {
    if (!confirm(`Hapus akses admin untuk ${email}?`)) return;
    setError(null);
    start(async () => {
      try {
        await removeAdmin(email);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal hapus");
      }
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={remove}
        disabled={pending}
        className="inline-flex items-center gap-1 text-[12px] font-bold text-pg-err hover:underline disabled:opacity-50"
      >
        <Icon name="trash" size={12} /> Hapus
      </button>
      {error && (
        <div className="text-[11px] text-pg-err">{error}</div>
      )}
    </div>
  );
}
