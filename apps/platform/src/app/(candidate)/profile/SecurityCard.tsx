"use client";

import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { translateAuthError } from "@/lib/auth-errors";
import { Icon } from "@/components/pg/Icon";

type State =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "sent" }
  | { kind: "error"; message: string };

/**
 * Sends a password-reset email to the signed-in user so they can set or
 * change their password. Works for magic-link-only users (first-time set)
 * and password users (change existing). Single UX, no detection needed.
 */
export default function SecurityCard({ email }: { email: string }) {
  const [state, setState] = useState<State>({ kind: "idle" });

  async function send() {
    setState({ kind: "sending" });
    const sb = supabaseBrowser();
    const redirectTo = `${window.location.origin}/auth/reset-password`;
    const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo });
    if (error) {
      setState({ kind: "error", message: translateAuthError(error.message, error.code) });
      return;
    }
    setState({ kind: "sent" });
  }

  return (
    <div className="bg-pg-white border border-pg-ink-100 rounded-2xl p-4">
      <div className="flex items-start gap-3">
        <div
          className="w-9 h-9 rounded-lg grid place-items-center text-pg-red-600 shrink-0"
          style={{ background: "var(--pg-red-50)" }}
        >
          <Icon name="lock" size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold">Password akun</div>
          <div className="text-[13px] text-pg-ink-500 mt-0.5 leading-relaxed">
            Atur atau ubah password untuk masuk tanpa menunggu email.
          </div>
        </div>
      </div>

      {state.kind === "sent" ? (
        <div
          className="mt-3 px-3.5 py-3 rounded-lg flex items-start gap-2 text-[13px]"
          style={{ background: "var(--pg-info-bg)", color: "var(--pg-info)" }}
        >
          <Icon name="check" size={16} className="shrink-0 mt-0.5" />
          <span className="leading-relaxed">
            Link terkirim ke <span className="font-bold">{email}</span>. Klik link
            di email untuk bikin password baru.
          </span>
        </div>
      ) : state.kind === "error" ? (
        <>
          <div
            className="mt-3 px-3.5 py-3 rounded-lg flex items-start gap-2 text-[13px]"
            style={{ background: "var(--pg-err-bg)", color: "var(--pg-err)" }}
          >
            <Icon name="warn" size={16} className="shrink-0 mt-0.5" />
            <span className="leading-relaxed">{state.message}</span>
          </div>
          <button
            type="button"
            onClick={send}
            className="mt-3 w-full min-h-[44px] px-4 rounded-lg border-[1.5px] border-pg-ink-200 text-sm font-semibold text-pg-ink-900"
          >
            Coba lagi
          </button>
        </>
      ) : (
        <button
          type="button"
          onClick={send}
          disabled={state.kind === "sending"}
          className="mt-3 w-full min-h-[44px] px-4 rounded-lg text-sm font-semibold text-white disabled:opacity-60"
          style={{ background: "var(--pg-red-600)" }}
        >
          {state.kind === "sending" ? "Mengirim…" : "Kirim link setel password"}
        </button>
      )}
    </div>
  );
}
