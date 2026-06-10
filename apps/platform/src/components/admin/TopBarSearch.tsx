"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icon } from "@/components/pg/Icon";

/**
 * Global candidate search in the admin top bar. Replaces the old dead <span> that
 * looked like a search box but did nothing. Submits to the candidates list, which
 * already searches name / email / phone server-side.
 */
export default function TopBarSearch({
  placeholder = "Cari kandidat (nama / email / HP)…",
}: {
  placeholder?: string;
}) {
  const router = useRouter();
  const [q, setQ] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const v = q.trim();
    router.push(
      v ? `/admin/candidates?q=${encodeURIComponent(v)}` : "/admin/candidates",
    );
  }

  return (
    <form
      onSubmit={submit}
      className="hidden lg:flex items-center gap-2 px-3.5 py-2 rounded-lg w-[320px]"
      style={{ background: "var(--pg-white)", border: "1px solid var(--pg-border)" }}
    >
      <Icon name="search" size={13} className="shrink-0 text-pg-ink-quaternary" />
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={placeholder}
        aria-label="Cari kandidat"
        className="flex-1 min-w-0 bg-transparent text-[13px] text-pg-ink-primary outline-none placeholder:text-pg-ink-quaternary"
      />
    </form>
  );
}
