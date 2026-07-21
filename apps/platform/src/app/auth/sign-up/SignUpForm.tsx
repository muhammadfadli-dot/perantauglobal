"use client";

import { useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { translateAuthError, validatePassword } from "@/lib/auth-errors";
import { Icon } from "@/components/pg/Icon";
import { Button } from "@/components/pg/primitives";
import {
  SIGNUP_CONSENT_TEXT,
  SIGNUP_CONSENT_VERSION,
  SIGNUP_CONSENT_REQUIRED_MSG,
  WEB_POLICY_ORIGIN,
} from "@/lib/signup-consent";

type State =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "verify-sent"; email: string }
  | { kind: "error"; message: string };

export default function SignUpForm() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  // PDP UU 27/2022 Pasal 20: persetujuan afirmatif, default KOSONG.
  const [agree, setAgree] = useState(false);
  const [state, setState] = useState<State>({ kind: "idle" });

  async function submit(e: React.FormEvent) {
    e.preventDefault();

    const trimmedName = fullName.trim();
    if (trimmedName.length < 2) {
      setState({ kind: "error", message: "Nama minimal 2 karakter." });
      return;
    }
    if (!email.includes("@")) {
      setState({ kind: "error", message: "Email tidak valid." });
      return;
    }
    const pwErr = validatePassword(password);
    if (pwErr) {
      setState({ kind: "error", message: pwErr });
      return;
    }
    if (password !== confirm) {
      setState({ kind: "error", message: "Password tidak cocok." });
      return;
    }
    // PDP: affirmative consent is the last gate before the account is created.
    if (!agree) {
      setState({ kind: "error", message: SIGNUP_CONSENT_REQUIRED_MSG });
      return;
    }

    setState({ kind: "submitting" });

    const sb = supabaseBrowser();
    const emailRedirectTo = `${window.location.origin}/auth/callback`;
    const { data, error } = await sb.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo,
        // Consent is stamped into user metadata: this path writes straight to
        // Supabase Auth from the browser, so there is no API route of ours to
        // log a `consents` ledger row from. Storing the verbatim text + version
        // keeps the same audit property (what was agreed, and when).
        data: {
          full_name: trimmedName,
          source: "direct_signup",
          consent_text: SIGNUP_CONSENT_TEXT,
          consent_version: SIGNUP_CONSENT_VERSION,
          consent_granted_at: new Date().toISOString(),
        },
      },
    });

    if (error) {
      setState({ kind: "error", message: translateAuthError(error.message) });
      return;
    }

    // When "Confirm email" is ON in Supabase, `data.user` is returned but
    // `data.session` is null. User must click the verification link.
    if (data.session) {
      // Edge case: project has "Confirm email" = OFF. Shouldn't happen in
      // prod, but handle it — user is already logged in.
      window.location.href = "/";
      return;
    }

    setState({ kind: "verify-sent", email });
  }

  if (state.kind === "verify-sent") {
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
        <p className="text-base text-pg-ink-700 mt-3">Kami kirim link verifikasi ke</p>
        <div className="text-[17px] font-extrabold text-pg-red-600 mt-1">{state.email}</div>
        <p className="text-sm text-pg-ink-500 mt-4 max-w-xs mx-auto leading-relaxed">
          Klik link di email untuk aktifkan akun. Setelah itu kamu bisa masuk pakai
          password.
        </p>

        <div className="bg-pg-white border border-pg-ink-100 rounded-2xl p-4 mt-6 text-left">
          <div className="text-[13px] font-bold">Belum ada email masuk?</div>
          <ul className="text-[13px] text-pg-ink-500 mt-2 space-y-1 leading-relaxed list-disc pl-5">
            <li>Cek folder Spam atau Promosi</li>
            <li>Tunggu 1–2 menit, kadang sedikit delay</li>
            <li>Pastikan email kamu benar</li>
          </ul>
        </div>

        <Link
          href="/auth/sign-in"
          className="block mt-6 text-sm text-pg-red-600 font-bold underline"
        >
          Kembali ke halaman masuk
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <Field
        label="Nama lengkap"
        icon="user"
        type="text"
        autoComplete="name"
        value={fullName}
        onChange={setFullName}
        placeholder="Maya Sari"
        required
      />

      <Field
        label="Email"
        icon="mail"
        type="email"
        autoComplete="email"
        value={email}
        onChange={setEmail}
        placeholder="kamu@email.com"
        required
      />

      <Field
        label="Password"
        icon="lock"
        type={showPw ? "text" : "password"}
        autoComplete="new-password"
        value={password}
        onChange={setPassword}
        placeholder="Minimal 10 karakter"
        required
        trailing={
          <button
            type="button"
            onClick={() => setShowPw((v) => !v)}
            className="text-pg-ink-400 p-1"
            aria-label={showPw ? "Sembunyikan password" : "Tampilkan password"}
          >
            <Icon name={showPw ? "eye_off" : "eye"} size={18} />
          </button>
        }
      />

      <Field
        label="Konfirmasi password"
        icon="lock"
        type={showPw ? "text" : "password"}
        autoComplete="new-password"
        value={confirm}
        onChange={setConfirm}
        placeholder="Ketik ulang password"
        required
      />

      <div className="text-[12px] text-pg-ink-500 leading-relaxed">
        Minimal 10 karakter, kombinasi huruf besar, kecil, dan angka.
      </div>

      {/* PDP UU 27/2022 Pasal 20: persetujuan afirmatif, default KOSONG. Teks di
          <span> WAJIB sama persis dengan yang disimpan ke metadata akun (SoT:
          lib/signup-consent.ts), jadi tautan kebijakan ditaruh di baris terpisah. */}
      <label className="flex items-start gap-2.5 cursor-pointer rounded-xl p-1 -m-1 focus-within:ring-2 focus-within:ring-pg-red-600 focus-within:ring-offset-1">
        <input
          type="checkbox"
          checked={agree}
          onChange={(e) => setAgree(e.target.checked)}
          aria-required
          className="mt-0.5 w-4 h-4 shrink-0 accent-[var(--pg-red-600)]"
        />
        <span className="text-[12.5px] text-pg-ink-700 leading-relaxed">
          {SIGNUP_CONSENT_TEXT}
        </span>
      </label>
      <div className="text-[12px] text-pg-ink-500 leading-relaxed pl-[26px]">
        Baca{" "}
        <a
          href={`${WEB_POLICY_ORIGIN}/privacy`}
          target="_blank"
          rel="noreferrer"
          className="text-pg-red-600 font-bold no-underline"
        >
          Kebijakan Privasi
        </a>{" "}
        dan{" "}
        <a
          href={`${WEB_POLICY_ORIGIN}/terms`}
          target="_blank"
          rel="noreferrer"
          className="text-pg-red-600 font-bold no-underline"
        >
          Syarat &amp; Ketentuan
        </a>
        .
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

      <Button type="submit" variant="primary" block disabled={state.kind === "submitting"}>
        {state.kind === "submitting" ? "Mendaftarkan…" : <>Daftar akun <Icon name="arrow_right" size={18} /></>}
      </Button>
    </form>
  );
}

function Field({
  label,
  icon,
  type,
  autoComplete,
  value,
  onChange,
  placeholder,
  required,
  trailing,
}: {
  label: string;
  icon: "mail" | "lock" | "user";
  type: string;
  autoComplete?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  trailing?: React.ReactNode;
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
        <Icon name={icon} size={18} className={active ? "text-pg-red-600" : "text-pg-ink-400"} />
        <input
          type={type}
          required={required}
          autoComplete={autoComplete}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 text-base text-pg-ink-900 font-semibold outline-none bg-transparent placeholder:font-medium placeholder:text-pg-ink-400 min-w-0"
        />
        {trailing}
      </div>
    </div>
  );
}
