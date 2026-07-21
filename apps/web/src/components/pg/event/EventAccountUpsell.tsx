"use client";

import { useState } from "react";
import { Field, Input } from "@/components/pg/primitives";
import { Icon } from "@/components/pg/Icon";
import {
  EVENT_ACCOUNT_CONSENT_TEXT,
  EVENT_ACCOUNT_CONSENT_REQUIRED_MSG,
} from "@/lib/event-consent";

type Status = "idle" | "submitting" | "success" | "error";

/**
 * Optional post-registration upsell shown on the event success screen: create a
 * talent-pool account from the data the user just submitted. Stages an
 * intent='event' pending + signUp (see /api/event/[slug]/account); on email
 * confirmation the trigger materializes a candidate + links the registration.
 */
export function EventAccountUpsell({
  eventSlug,
  prefill,
}: {
  eventSlug: string;
  prefill: { full_name: string; whatsapp: string; email: string; city?: string };
}) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  // PDP UU 27/2022 Pasal 20: consent must be affirmative - default UNCHECKED.
  // Creating the account is heavier processing than the event registration
  // itself (auth user + candidate record that outlives the event), so it gets
  // its own tick. Re-validated in /api/event/[slug]/account.
  const [agree, setAgree] = useState(false);

  async function handle(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "submitting") return;

    const fd = new FormData(e.currentTarget);
    const password = String(fd.get("password") || "");
    const confirm = String(fd.get("confirm") || "");
    const website = String(fd.get("website") || "");

    if (
      password.length < 10 ||
      !/[a-z]/.test(password) ||
      !/[A-Z]/.test(password) ||
      !/[0-9]/.test(password)
    ) {
      setError("Password minimal 10 karakter, ada huruf besar, kecil, dan angka.");
      setStatus("error");
      return;
    }
    if (password !== confirm) {
      setError("Konfirmasi password belum cocok.");
      setStatus("error");
      return;
    }
    // PDP: affirmative consent is the last gate before anything is sent.
    if (!agree) {
      setError(EVENT_ACCOUNT_CONSENT_REQUIRED_MSG);
      setStatus("error");
      return;
    }

    setError(null);
    setStatus("submitting");
    try {
      const res = await fetch(`/api/event/${eventSlug}/account`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: prefill.full_name,
          whatsapp: prefill.whatsapp,
          email: prefill.email,
          city: prefill.city,
          password,
          // PDP: the ticked box travels with the payload. The route rejects the
          // submit when this is absent, so no consent row is ever written by
          // default.
          consent_granted: agree,
          website,
          source_url: typeof window !== "undefined" ? window.location.href : undefined,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        success?: boolean;
        error?: string;
      };
      if (!res.ok || !data.success) {
        setError(data.error || "Gagal membuat akun. Coba lagi sebentar.");
        setStatus("error");
        return;
      }
      setStatus("success");
    } catch {
      setError("Koneksi bermasalah. Coba lagi sebentar.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="mt-5 w-full rounded-2xl p-4 text-left" style={{ background: "var(--pg-ok-bg)" }}>
        <div className="flex gap-2.5 items-start">
          <span style={{ color: "var(--pg-ok)" }} className="shrink-0 mt-0.5">
            <Icon name="mail" size={18} />
          </span>
          <div>
            <div className="text-[14px] font-extrabold" style={{ color: "var(--pg-ok)" }}>
              Satu langkah lagi — cek email kamu
            </div>
            <p className="text-[13px] mt-1 leading-relaxed text-pg-ink-700">
              Kami kirim link konfirmasi ke <strong>{prefill.email}</strong>. Klik
              linknya buat aktifin akun talent pool kamu — biar nanti bisa lamar
              lowongan 1-klik &amp; simpan progres.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-5 w-full inline-flex items-center justify-center gap-2 min-h-[48px] px-5 rounded-xl font-bold text-[14px] border border-pg-ink-200 bg-pg-white text-pg-ink-900 hover:border-pg-ink-300 transition-colors"
      >
        <Icon name="sparkle" size={16} className="text-pg-red-600" /> Sekalian buat akun talent pool?
      </button>
    );
  }

  return (
    <form onSubmit={handle} className="mt-5 w-full text-left rounded-2xl border border-pg-ink-100 bg-pg-white p-4 flex flex-col gap-3">
      <div>
        <div className="text-[14px] font-extrabold text-pg-ink-900">Buat akun talent pool</div>
        <p className="text-[12.5px] text-pg-ink-500 mt-0.5 leading-relaxed">
          Biar bisa lamar lowongan 1-klik &amp; simpan progres. Pakai email{" "}
          <strong>{prefill.email}</strong>.
        </p>
      </div>

      {/* Honeypot — off-screen, humans never fill it. */}
      <div aria-hidden className="absolute -left-[9999px] top-auto w-px h-px overflow-hidden">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <Field label="Buat password" required htmlFor="acct_pw" helper="Min 10 karakter — ada huruf besar, kecil, & angka.">
        <Input id="acct_pw" name="password" type="password" autoComplete="new-password" required />
      </Field>
      <Field label="Ulangi password" required htmlFor="acct_pw2">
        <Input id="acct_pw2" name="confirm" type="password" autoComplete="new-password" required />
      </Field>

      {/* PDP UU 27/2022 Pasal 20: persetujuan afirmatif, default KOSONG.
          Teks di dalam <span> WAJIB sama persis dengan yang di-log server
          (SoT: lib/event-consent.ts), jadi tautan kebijakan sengaja ditaruh di
          baris terpisah supaya string-nya tetap utuh. */}
      <div>
        <label className="flex items-start gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={agree}
            onChange={(e) => setAgree(e.target.checked)}
            aria-required
            className="mt-1 w-4 h-4 accent-[var(--pg-red-600)] shrink-0"
          />
          <span className="text-[12.5px] text-pg-ink-600 leading-relaxed">
            {EVENT_ACCOUNT_CONSENT_TEXT}
          </span>
        </label>
        <div className="text-[12px] text-pg-ink-500 mt-1.5 leading-relaxed pl-[26px]">
          Baca{" "}
          <a
            href="/privacy"
            target="_blank"
            rel="noreferrer"
            className="text-pg-red-600 font-bold no-underline"
          >
            Kebijakan Privasi
          </a>{" "}
          dan{" "}
          <a
            href="/terms"
            target="_blank"
            rel="noreferrer"
            className="text-pg-red-600 font-bold no-underline"
          >
            Syarat &amp; Ketentuan
          </a>
          .
        </div>
      </div>

      {error && (
        <div
          className="flex gap-2 items-start px-3.5 py-2.5 rounded-xl text-[13px]"
          style={{ background: "var(--pg-err-bg)", color: "var(--pg-err)" }}
        >
          <Icon name="warn" size={16} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="inline-flex items-center justify-center gap-2 min-h-[48px] px-6 rounded-xl font-extrabold text-[15px] text-white bg-pg-red-600 hover:bg-pg-red-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors w-full"
      >
        {status === "submitting" ? "Membuat akun…" : <>Buat akun talent pool</>}
      </button>
    </form>
  );
}
