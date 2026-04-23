"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient as createSSRBrowserClient } from "@supabase/ssr";
import { Icon } from "@/components/pg/Icon";

export default function SignOutButton({ variant = "subtle" }: { variant?: "subtle" | "ghost" }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function signOut() {
    setBusy(true);
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const sb = createSSRBrowserClient(url, key);
    await sb.auth.signOut();
    router.push("/");
    router.refresh();
  }

  if (variant === "ghost") {
    return (
      <button
        type="button"
        onClick={signOut}
        disabled={busy}
        className="inline-flex items-center justify-center gap-2 w-full min-h-[40px] px-4 text-sm font-semibold rounded-xl border-[1.5px] border-pg-ink-200 text-pg-ink-900 disabled:opacity-50 hover:bg-pg-ink-50"
      >
        {busy ? "Keluar…" : (
          <>
            Keluar <Icon name="arrow_right" size={14} />
          </>
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={signOut}
      disabled={busy}
      className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-wide uppercase text-white/80 hover:text-white disabled:opacity-50"
    >
      {busy ? "Keluar…" : (
        <>
          Keluar <Icon name="arrow_right" size={12} />
        </>
      )}
    </button>
  );
}
