"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { translateAuthError } from "@/lib/auth-errors";
import { Icon } from "@/components/pg/Icon";
import { Button } from "@/components/pg/primitives";

type Mode = "password" | "magic";

type State =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "sent-link"; email: string }
  | { kind: "error"; message: string };

export default function SignInForm() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [state, setState] = useState<State>({ kind: "idle" });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) {
      setState({ kind: "error", message: "Email tidak valid." });
      return;
    }
    if (mode === "password" && password.length === 0) {
      setState({ kind: "error", message: "Masukkan password kamu." });
      return;
    }
    setState({ kind: "sending" });

    const sb = supabaseBrowser();

    if (mode === "password") {
      const { error } = await sb.auth.signInWithPassword({ email, password });
      if (error) {
        setState({ kind: "error", message: translateAuthError(error.message) });
        return;
      }
      // Session cookie is set by @supabase/ssr. Root page routes by role.
      router.replace("/");
      return;
    }

    // Magic link fallback — does NOT create new users (use sign-up page for that).
    const redirectTo = `${window.location.origin}/auth/callback`;
    const { error } = await sb.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo, shouldCreateUser: false },
    });
    if (error) {
      setState({ kind: "error", message: translateAuthError(error.message) });
      return;
    }
    setState({ kind: "sent-link", email });
  }

  if (state.kind === "sent-link") {
    return (
      <div className="text-center py-6">
        <div className="relative mx-auto w-[120px] h-[120px]">
          <div
            className="absolute inset-0 rounded-full"
            style={{ background: "var(--pg-red-50)" }}
          />
          <div
            className="absolute inset-[18px] rounded-full"
            style={{ background: "var(--pg-red-100)" }}
          />
          <div
            className="absolute inset-[34px] rounded-full grid place-items-center text-white"
            style={{ background: "var(--pg-red-600)" }}
          >
            <Icon name="mail" size={28} stroke={2.2} />
          </div>
        </div>
        <h2 className="text-2xl font-extrabold tracking-tight mt-7">Cek email kamu.</h2>
        <p className="text-base text-pg-ink-700 mt-3">Kami kirim link masuk ke</p>
        <div className="text-[17px] font-extrabold text-pg-red-600 mt-1">{state.email}</div>
        <p className="text-sm text-pg-ink-500 mt-4 max-w-xs mx-auto leading-relaxed">
          Link berlaku 15 menit. Tinggal klik tombol di email untuk masuk.
        </p>

        <button
          type="button"
          onClick={() => setState({ kind: "idle" })}
          className="mt-5 text-sm text-pg-ink-500 font-semibold underline"
        >
          Kembali
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="text-[13px] font-bold text-pg-ink-500 mb-1.5 block">Email</label>
        <div
          className={`flex items-center gap-2.5 bg-pg-white border-[1.5px] rounded-lg px-3.5 py-3 transition-colors ${
            email ? "border-pg-red-600" : "border-pg-ink-200"
          }`}
        >
          <Icon name="mail" size={18} className={email ? "text-pg-red-600" : "text-pg-ink-400"} />
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="kamu@email.com"
            className="flex-1 text-base text-pg-ink-900 font-semibold outline-none bg-transparent placeholder:font-medium placeholder:text-pg-ink-400"
          />
        </div>
      </div>

      {mode === "password" && (
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[13px] font-bold text-pg-ink-500">Password</label>
            <Link
              href="/auth/forgot-password"
              className="text-[12px] font-bold text-pg-red-600 no-underline"
            >
              Lupa password?
            </Link>
          </div>
          <div
            className={`flex items-center gap-2.5 bg-pg-white border-[1.5px] rounded-lg px-3.5 py-3 transition-colors ${
              password ? "border-pg-red-600" : "border-pg-ink-200"
            }`}
          >
            <Icon name="lock" size={18} className={password ? "text-pg-red-600" : "text-pg-ink-400"} />
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password kamu"
              className="flex-1 text-base text-pg-ink-900 font-semibold outline-none bg-transparent placeholder:font-medium placeholder:text-pg-ink-400"
            />
          </div>
        </div>
      )}

      {mode === "magic" && (
        <div
          className="flex gap-2.5 items-start px-3.5 py-3 rounded-lg"
          style={{ background: "var(--pg-info-bg)", color: "var(--pg-info)" }}
        >
          <Icon name="info" size={16} className="shrink-0 mt-0.5" />
          <div className="text-[12px] leading-relaxed">
            Kami kirim link ke email kamu — tinggal klik, tanpa password.
          </div>
        </div>
      )}

      {state.kind === "error" && (
        <div
          className="px-3.5 py-3 rounded-lg flex items-start gap-2 text-sm"
          style={{ background: "var(--pg-err-bg)", color: "var(--pg-err)" }}
        >
          <Icon name="warn" size={16} />
          <span>{state.message}</span>
        </div>
      )}

      <Button type="submit" variant="primary" block disabled={state.kind === "sending"}>
        {state.kind === "sending"
          ? mode === "password"
            ? "Masuk…"
            : "Mengirim…"
          : mode === "password"
            ? <>Masuk <Icon name="arrow_right" size={18} /></>
            : <>Kirim link ke email <Icon name="arrow_right" size={18} /></>}
      </Button>

      <button
        type="button"
        onClick={() => {
          setMode(mode === "password" ? "magic" : "password");
          setState({ kind: "idle" });
        }}
        className="block w-full text-center text-[13px] text-pg-ink-500 font-semibold underline pt-1"
      >
        {mode === "password"
          ? "Masuk tanpa password (kirim link ke email)"
          : "Masuk pakai password"}
      </button>

      <div className="text-[12px] text-pg-ink-500 text-center pt-3">
        Belum punya akun?{" "}
        <Link href="/auth/sign-up" className="text-pg-red-600 font-bold no-underline">
          Daftar di sini
        </Link>
      </div>
    </form>
  );
}
