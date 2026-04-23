"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Icon } from "@/components/pg/Icon";

export default function CandidateFilters({ initialQuery }: { initialQuery: string }) {
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
      <div className="flex-1 min-w-[260px] flex items-center gap-2.5 bg-pg-white border-[1.5px] border-pg-ink-200 rounded-lg px-3.5 py-2.5 focus-within:border-pg-red-600 transition-colors">
        <Icon name="search" size={18} className="text-pg-ink-400" />
        <input
          type="search"
          placeholder="Cari nama, email, atau nomor HP…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="flex-1 text-sm text-pg-ink-900 outline-none bg-transparent placeholder:text-pg-ink-400"
        />
      </div>
      <button
        type="submit"
        className="inline-flex items-center justify-center min-h-[42px] px-4 text-sm font-semibold rounded-xl bg-pg-red-600 text-white hover:bg-pg-red-700"
      >
        Cari
      </button>
      {initialQuery && (
        <button
          type="button"
          onClick={clear}
          className="text-[12px] font-bold tracking-wide uppercase text-pg-ink-500 hover:text-pg-ink-900"
        >
          Reset
        </button>
      )}
    </form>
  );
}
