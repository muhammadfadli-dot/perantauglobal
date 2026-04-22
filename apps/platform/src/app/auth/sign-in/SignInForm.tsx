"use client";

import { useState } from "react";
import { createBrowserClient as createSSRBrowserClient } from "@supabase/ssr";

type State =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "sent"; email: string }
  | { kind: "error"; message: string };

export default function SignInForm() {
  const [state, setState] = useState<State>({ kind: "idle" });
  const [email, setEmail] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) {
      setState({ kind: "error", message: "Email tidak valid." });
      return;
    }
    setState({ kind: "sending" });

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const sb = createSSRBrowserClient(url, key);

    const redirectTo = `${window.location.origin}/auth/callback`;
    const { error } = await sb.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo, shouldCreateUser: false },
    });

    if (error) {
      setState({ kind: "error", message: error.message });
      return;
    }
    setState({ kind: "sent", email });
  }

  if (state.kind === "sent") {
    return (
      <div className="border border-[var(--color-dtg-ink)] bg-white p-6">
        <p className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.12em] opacity-60">
          Terkirim
        </p>
        <h2 className="mt-3 font-[family-name:var(--font-display)] text-xl">
          Cek email kamu.
        </h2>
        <p className="mt-3 text-sm leading-[1.5] opacity-80">
          Kami kirim tautan masuk ke <strong>{state.email}</strong>. Klik
          tautannya untuk masuk ke portal.
        </p>
        <p className="mt-4 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.1em] opacity-60">
          Link valid ~1 jam · cek juga folder spam/promosi
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="border border-[var(--color-dtg-ink)] bg-white p-6">
      <label className="font-[family-name:var(--font-mono)] text-[11px] font-bold uppercase tracking-[0.1em]">
        Email
      </label>
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="kamu@email.com"
        className="mt-2 w-full border border-[var(--color-dtg-ink)]/20 bg-white px-3 py-3 text-base outline-none focus:border-[var(--color-dtg-red)]"
      />
      <button
        type="submit"
        disabled={state.kind === "sending"}
        className="mt-5 w-full border border-[var(--color-dtg-ink)] bg-[var(--color-dtg-ink)] px-4 py-3 font-[family-name:var(--font-mono)] text-xs font-bold uppercase tracking-[0.12em] text-white hover:bg-[var(--color-dtg-red)] disabled:opacity-60"
      >
        {state.kind === "sending" ? "Mengirim…" : "Kirim tautan masuk →"}
      </button>

      {state.kind === "error" && (
        <p className="mt-3 text-[12px] text-[var(--color-dtg-red)]">
          {state.message}
        </p>
      )}

      <p className="mt-5 font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.1em] opacity-50">
        Belum punya akun? Daftar lewat{" "}
        <a href="https://perantauglobal.com/lowongan" className="underline">
          perantauglobal.com
        </a>
      </p>
    </form>
  );
}
