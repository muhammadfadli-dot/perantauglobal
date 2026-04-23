"use client";

import { useState } from "react";
import { createBrowserClient as createSSRBrowserClient } from "@supabase/ssr";
import { Icon } from "@/components/pg/Icon";
import { Button } from "@/components/pg/primitives";

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
      options: { emailRedirectTo: redirectTo, shouldCreateUser: true },
    });

    if (error) {
      setState({ kind: "error", message: error.message });
      return;
    }
    setState({ kind: "sent", email });
  }

  if (state.kind === "sent") {
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
          Link berlaku 15 menit. Tinggal klik tombol di email untuk masuk ke Talent Hub.
        </p>

        <div className="bg-pg-white border border-pg-ink-100 rounded-2xl p-4 mt-6 text-left">
          <div className="text-[13px] font-bold">Belum ada email masuk?</div>
          <ul className="text-[13px] text-pg-ink-500 mt-2 space-y-1 leading-relaxed list-disc pl-5">
            <li>Cek folder Spam atau Promosi</li>
            <li>Tunggu 1–2 menit, kadang sedikit delay</li>
            <li>Pastikan email kamu benar</li>
          </ul>
        </div>

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
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="kamu@email.com"
            className="flex-1 text-base text-pg-ink-900 font-semibold outline-none bg-transparent placeholder:font-medium placeholder:text-pg-ink-400"
          />
        </div>
      </div>

      <div
        className="flex gap-2.5 items-start px-3.5 py-3 rounded-lg"
        style={{ background: "var(--pg-info-bg)", color: "var(--pg-info)" }}
      >
        <Icon name="info" size={16} className="shrink-0 mt-0.5" />
        <div className="text-[12px] leading-relaxed">
          Kami tidak akan pernah kirim spam atau bagikan data kamu ke pihak ketiga.
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
        {state.kind === "sending" ? "Mengirim…" : (
          <>
            Kirim link ke email <Icon name="arrow_right" size={18} />
          </>
        )}
      </Button>
    </form>
  );
}
