"use client";

import { useEffect, useState } from "react";
import { supabaseBrowserV2 } from "@/lib/supabase-browser-v2";

type State =
  | { kind: "pending" }
  | { kind: "ok"; email: string }
  | { kind: "error"; message: string };

/**
 * Magic-link callback. Handles both PKCE (?code=) and implicit (#access_token)
 * flows that Supabase Auth may return depending on client configuration.
 *
 * On success, the auth.users INSERT fires the `handle_new_auth_user` trigger
 * server-side which materializes candidates + applications from any matching
 * `pending_submissions`.
 */
export default function CallbackClient() {
  const [state, setState] = useState<State>({ kind: "pending" });

  useEffect(() => {
    const sb = supabaseBrowserV2();
    const url = new URL(window.location.href);
    const code = url.searchParams.get("code");
    const errorParam = url.searchParams.get("error_description") || url.searchParams.get("error");

    if (errorParam) {
      setState({ kind: "error", message: decodeURIComponent(errorParam) });
      return;
    }

    (async () => {
      if (code) {
        const { data, error } = await sb.auth.exchangeCodeForSession(code);
        if (error) {
          setState({ kind: "error", message: error.message });
          return;
        }
        setState({ kind: "ok", email: data.session?.user.email ?? "" });
        return;
      }

      // Implicit flow: supabase-js auto-parses URL fragment on client init.
      const { data, error } = await sb.auth.getSession();
      if (error) {
        setState({ kind: "error", message: error.message });
        return;
      }
      if (data.session) {
        setState({ kind: "ok", email: data.session.user.email ?? "" });
        return;
      }
      setState({
        kind: "error",
        message: "Sesi tidak ditemukan. Link mungkin sudah expired atau sudah dipakai.",
      });
    })();
  }, []);

  return (
    <div className="mx-auto max-w-[560px] px-6 py-24">
      {state.kind === "pending" && (
        <p className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.12em] opacity-60">
          Memverifikasi tautan…
        </p>
      )}

      {state.kind === "ok" && (
        <div className="border border-[var(--color-dtg-ink)] bg-white p-10 text-center">
          <p className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.12em] opacity-60">
            Verifikasi berhasil
          </p>
          <h1 className="mt-4 font-[family-name:var(--font-display)] text-3xl leading-[1.1]">
            Terima kasih,
            <br />
            data kamu sudah tersimpan.
          </h1>
          <p className="mt-4 text-sm leading-[1.5] opacity-80">
            Akun untuk <span className="font-semibold">{state.email}</span> udah aktif.
            Kami akan hubungi lewat WhatsApp dalam 1-2 hari kerja.
          </p>
          <p className="mt-6 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.1em] opacity-50">
            Dashboard kandidat sedang dalam pembangunan.
          </p>
        </div>
      )}

      {state.kind === "error" && (
        <div className="border border-[var(--color-dtg-red)] bg-white p-10">
          <p className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.12em] text-[var(--color-dtg-red)]">
            Verifikasi gagal
          </p>
          <p className="mt-4 text-sm leading-[1.5]">{state.message}</p>
          <p className="mt-4 text-sm leading-[1.5] opacity-70">
            Coba submit form lagi untuk dapat magic link baru, atau hubungi kami via WhatsApp.
          </p>
        </div>
      )}
    </div>
  );
}
