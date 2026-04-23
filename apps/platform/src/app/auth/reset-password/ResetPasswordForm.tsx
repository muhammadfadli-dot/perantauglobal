"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { translateAuthError, validatePassword } from "@/lib/auth-errors";
import { Icon } from "@/components/pg/Icon";
import { Button } from "@/components/pg/primitives";

type Phase =
  | { kind: "verifying" }
  | { kind: "ready" }
  | { kind: "submitting" }
  | { kind: "done" }
  | { kind: "invalid"; message: string }
  | { kind: "error"; message: string };

export default function ResetPasswordForm() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>({ kind: "verifying" });
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);

  // Exchange the `?code=` from the reset email for a session, which puts the
  // user into password-recovery auth state. Only then can updateUser() run.
  useEffect(() => {
    (async () => {
      const sb = supabaseBrowser();
      const url = new URL(window.location.href);
      const code = url.searchParams.get("code");
      const errDesc = url.searchParams.get("error_description") ?? url.searchParams.get("error");

      if (errDesc) {
        setPhase({ kind: "invalid", message: decodeURIComponent(errDesc) });
        return;
      }

      // Already authenticated via PASSWORD_RECOVERY flow? (e.g. Supabase
      // detectSessionInUrl handled it before this effect ran.)
      const { data: existing } = await sb.auth.getSession();
      if (existing.session && !code) {
        setPhase({ kind: "ready" });
        return;
      }

      if (!code) {
        setPhase({
          kind: "invalid",
          message: "Tautan reset tidak valid atau sudah digunakan.",
        });
        return;
      }

      const { error } = await sb.auth.exchangeCodeForSession(code);
      if (error) {
        setPhase({ kind: "invalid", message: translateAuthError(error.message) });
        return;
      }

      // Strip the code from the URL history so refreshes don't re-exchange.
      window.history.replaceState(null, "", window.location.pathname);
      setPhase({ kind: "ready" });
    })();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const pwErr = validatePassword(password);
    if (pwErr) {
      setPhase({ kind: "error", message: pwErr });
      return;
    }
    if (password !== confirm) {
      setPhase({ kind: "error", message: "Password tidak cocok." });
      return;
    }

    setPhase({ kind: "submitting" });

    const sb = supabaseBrowser();
    const { error } = await sb.auth.updateUser({ password });

    if (error) {
      setPhase({ kind: "error", message: translateAuthError(error.message) });
      return;
    }

    setPhase({ kind: "done" });
    setTimeout(() => router.replace("/"), 1200);
  }

  if (phase.kind === "verifying") {
    return (
      <div className="bg-pg-white border border-pg-ink-100 rounded-2xl p-5">
        <p className="text-[10px] uppercase tracking-[0.12em] text-pg-ink-500 font-bold">
          Memverifikasi
        </p>
        <p className="text-base text-pg-ink-700 mt-2">
          Sebentar ya, kita memverifikasi tautan dari email kamu…
        </p>
      </div>
    );
  }

  if (phase.kind === "invalid") {
    return (
      <div
        className="px-4 py-4 rounded-xl"
        style={{ background: "var(--pg-err-bg)", color: "var(--pg-err)" }}
      >
        <div className="flex gap-2.5 items-start">
          <Icon name="warn" size={16} className="shrink-0 mt-0.5" />
          <div className="text-sm leading-relaxed">
            <div className="font-bold">Tautan tidak bisa dipakai.</div>
            <div className="mt-1">{phase.message}</div>
          </div>
        </div>
        <Link
          href="/auth/forgot-password"
          className="mt-4 inline-block text-sm font-bold underline"
        >
          Minta link baru
        </Link>
      </div>
    );
  }

  if (phase.kind === "done") {
    return (
      <div className="bg-pg-white border border-pg-ink-100 rounded-2xl p-5">
        <div className="flex items-center gap-2 text-pg-red-600">
          <Icon name="check" size={18} />
          <div className="text-sm font-bold uppercase tracking-[0.1em]">Berhasil</div>
        </div>
        <div className="text-lg font-extrabold tracking-tight mt-2">
          Password baru kamu aktif.
        </div>
        <div className="text-sm text-pg-ink-500 mt-1">Mengalihkan ke dashboard…</div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <PwField
        label="Password baru"
        value={password}
        onChange={setPassword}
        show={showPw}
        onToggleShow={() => setShowPw((v) => !v)}
        autoComplete="new-password"
        placeholder="Minimal 10 karakter"
      />
      <PwField
        label="Konfirmasi password baru"
        value={confirm}
        onChange={setConfirm}
        show={showPw}
        onToggleShow={() => setShowPw((v) => !v)}
        autoComplete="new-password"
        placeholder="Ketik ulang"
      />

      <div className="text-[12px] text-pg-ink-500 leading-relaxed">
        Minimal 10 karakter, kombinasi huruf besar, kecil, dan angka.
      </div>

      {phase.kind === "error" && (
        <div
          className="px-3.5 py-3 rounded-lg flex items-start gap-2 text-sm"
          style={{ background: "var(--pg-err-bg)", color: "var(--pg-err)" }}
        >
          <Icon name="warn" size={16} />
          <span>{phase.message}</span>
        </div>
      )}

      <Button type="submit" variant="primary" block disabled={phase.kind === "submitting"}>
        {phase.kind === "submitting" ? "Menyimpan…" : <>Simpan password baru <Icon name="arrow_right" size={18} /></>}
      </Button>
    </form>
  );
}

function PwField({
  label,
  value,
  onChange,
  show,
  onToggleShow,
  autoComplete,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  onToggleShow: () => void;
  autoComplete?: string;
  placeholder?: string;
}) {
  const active = value.length > 0;
  return (
    <div>
      <label className="text-[13px] font-bold text-pg-ink-500 mb-1.5 block">{label}</label>
      <div
        className={`flex items-center gap-2.5 bg-pg-white border-[1.5px] rounded-lg px-3.5 py-3 transition-colors ${
          active ? "border-pg-red-600" : "border-pg-ink-200"
        }`}
      >
        <Icon name="lock" size={18} className={active ? "text-pg-red-600" : "text-pg-ink-400"} />
        <input
          type={show ? "text" : "password"}
          required
          autoComplete={autoComplete}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 text-base text-pg-ink-900 font-semibold outline-none bg-transparent placeholder:font-medium placeholder:text-pg-ink-400 min-w-0"
        />
        <button
          type="button"
          onClick={onToggleShow}
          className="text-pg-ink-400 p-1"
          aria-label={show ? "Sembunyikan password" : "Tampilkan password"}
        >
          <Icon name={show ? "eye_off" : "eye"} size={18} />
        </button>
      </div>
    </div>
  );
}
