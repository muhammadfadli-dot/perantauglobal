"use client";

import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { translateAuthError } from "@/lib/auth-errors";
import { Icon } from "@/components/pg/Icon";
import { Button } from "@/components/pg/primitives";

type State =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "sent"; email: string }
  | { kind: "error"; message: string };

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<State>({ kind: "idle" });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) {
      setState({ kind: "error", message: "Email tidak valid." });
      return;
    }
    setState({ kind: "sending" });

    const sb = supabaseBrowser();
    const redirectTo = `${window.location.origin}/auth/reset-password`;
    const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo });

    if (error) {
      setState({ kind: "error", message: translateAuthError(error.message) });
      return;
    }
    setState({ kind: "sent", email });
  }

  if (state.kind === "sent") {
    return (
      <div className="text-center py-6">
        <div className="relative mx-auto w-[120px] h-[120px]">
          <div className="absolute inset-0 rounded-full" style={{ background: "var(--pg-red-50)" }} />
          <div className="absolute inset-[18px] rounded-full" style={{ background: "var(--pg-red-100)" }} />
          <div
            className="absolute inset-[34px] rounded-full grid place-items-center text-white"
            style={{ background: "var(--pg-red-600)" }}
          >
            <Icon name="mail" size={28} stroke={2.2} />
          </div>
        </div>
        <h2 className="text-2xl font-extrabold tracking-tight mt-7">Cek email kamu.</h2>
        <p className="text-base text-pg-ink-700 mt-3">Link reset password kami kirim ke</p>
        <div className="text-[17px] font-extrabold text-pg-red-600 mt-1">{state.email}</div>
        <p className="text-sm text-pg-ink-500 mt-4 max-w-xs mx-auto leading-relaxed">
          Klik link di email untuk bikin password baru. Link berlaku 1 jam.
        </p>

        <button
          type="button"
          onClick={() => setState({ kind: "idle" })}
          className="mt-5 text-sm text-pg-ink-500 font-semibold underline"
        >
          Ganti email
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
        {state.kind === "sending" ? "Mengirim…" : <>Kirim link reset <Icon name="arrow_right" size={18} /></>}
      </Button>
    </form>
  );
}
