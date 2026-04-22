"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function CandidateFilters({
  initialQuery,
}: {
  initialQuery: string;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [q, setQ] = useState(initialQuery);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const sp = new URLSearchParams(params.toString());
    if (q.trim()) sp.set("q", q.trim());
    else sp.delete("q");
    sp.delete("page");
    router.push(`/admin/candidates?${sp.toString()}`);
  }

  function clear() {
    setQ("");
    router.push("/admin/candidates");
  }

  return (
    <form onSubmit={submit} className="flex flex-wrap items-center gap-3">
      <input
        type="search"
        placeholder="Cari nama, email, atau WhatsApp…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        className="flex-1 min-w-[260px] border border-[var(--color-dtg-ink)]/20 bg-white px-4 py-2 text-sm outline-none focus:border-[var(--color-dtg-red)]"
      />
      <button
        type="submit"
        className="border border-[var(--color-dtg-ink)] bg-[var(--color-dtg-ink)] px-4 py-2 font-[family-name:var(--font-mono)] text-[11px] font-bold uppercase tracking-[0.12em] text-white hover:bg-[var(--color-dtg-red)]"
      >
        Cari
      </button>
      {initialQuery && (
        <button
          type="button"
          onClick={clear}
          className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.1em] opacity-60 hover:opacity-100"
        >
          Reset
        </button>
      )}
    </form>
  );
}
