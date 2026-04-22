"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient as createSSRBrowserClient } from "@supabase/ssr";

export default function SignOutButton() {
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

  return (
    <button
      type="button"
      onClick={signOut}
      disabled={busy}
      className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.1em] text-[var(--color-dtg-red)] hover:underline disabled:opacity-50"
    >
      {busy ? "Keluar…" : "Keluar →"}
    </button>
  );
}
