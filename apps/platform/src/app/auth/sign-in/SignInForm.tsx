"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { translateAuthError } from "@/lib/auth-errors";
import { Icon } from "@/components/pg/Icon";
import { Button } from "@/components/pg/primitives";

type State =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "error"; message: string };

export default function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefilledEmail = searchParams.get("email") ?? "";
  const [email, setEmail] = useState(prefilledEmail);
  const [password, setPassword] = useState("");
  const [state, setState] = useState<State>({ kind: "idle" });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) {
      setState({ kind: "error", message: "Email tidak valid." });
      return;
    }
    if (password.length === 0) {
      setState({ kind: "error", message: "Masukkan password kamu." });
      return;
    }
    setState({ kind: "sending" });

    const sb = supabaseBrowser();
    const { error } = await sb.auth.signInWithPassword({ email, password });
    if (error) {
      setState({ kind: "error", message: translateAuthError(error.message, error.code) });
      return;
    }
    // Session cookie is set by @supabase/ssr. Root page routes by role.
    router.replace("/");
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
        {state.kind === "sending" ? "Masuk…" : <>Masuk <Icon name="arrow_right" size={18} /></>}
      </Button>

      <div className="text-[12px] text-pg-ink-500 text-center pt-3">
        Belum punya akun?{" "}
        <Link href="/auth/sign-up" className="text-pg-red-600 font-bold no-underline">
          Daftar di sini
        </Link>
      </div>
    </form>
  );
}
