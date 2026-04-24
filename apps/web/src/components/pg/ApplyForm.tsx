"use client";

import { useState } from "react";
import { Icon } from "./Icon";
import { Button } from "./primitives";
import { trackEvent, generateEventId, getMetaCookies } from "@/lib/tracking";

type ApplyFormProps = {
  positionSlug: string;
  positionRole: string;
  positionCountry: string;
  apiEndpoint?: string;
};

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://app.perantauglobal.com";

export function ApplyForm({
  positionSlug,
  positionRole,
  positionCountry,
  apiEndpoint,
}: ApplyFormProps) {
  const endpoint = apiEndpoint ?? `/api/lowongan/${positionSlug}`;
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [showPw, setShowPw] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMsg("");
    setStatus("loading");
    const form = e.currentTarget;
    const fd = new FormData(form);

    const password = String(fd.get("password") ?? "");
    const confirmPw = String(fd.get("confirmPassword") ?? "");

    if (!validatePassword(password)) {
      setStatus("error");
      setErrorMsg("Password minimal 10 karakter, huruf besar, kecil, dan angka.");
      return;
    }
    if (password !== confirmPw) {
      setStatus("error");
      setErrorMsg("Password tidak cocok.");
      return;
    }

    const sharedData = {
      full_name: String(fd.get("fullName") ?? ""),
      whatsapp: String(fd.get("whatsapp") ?? ""),
      email: String(fd.get("email") ?? "").trim().toLowerCase(),
      city: String(fd.get("city") ?? ""),
      birth_date: (fd.get("birthDate") as string) || null,
      gender: (fd.get("gender") as string) || null,
      education: String(fd.get("education") ?? ""),
    };

    const eventId = generateEventId(`lowongan_${positionSlug}`);
    const { fbp, fbc } = getMetaCookies();

    const payload = {
      ...sharedData,
      password,
      role: positionSlug,
      country: positionCountry,
      source_url: typeof window !== "undefined" ? window.location.href : "",
      role_data: {},
      eventId,
      fbp,
      fbc,
    };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSubmittedEmail(sharedData.email);
        setStatus("success");
        trackEvent(
          "form_submission",
          { form_name: `lowongan_${positionSlug}`, form_location: window.location.pathname },
          eventId
        );
        form.reset();
      } else {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        setErrorMsg(data?.error ?? "Maaf, ada masalah saat mengirim. Coba lagi sebentar.");
        setStatus("error");
      }
    } catch {
      setErrorMsg("Gagal terhubung ke server. Cek koneksi internet kamu.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="bg-pg-white border border-pg-ink-100 rounded-2xl p-6 text-center">
        <div
          className="w-16 h-16 rounded-full grid place-items-center mx-auto text-white"
          style={{ background: "var(--pg-red-600)" }}
        >
          <Icon name="check" size={32} stroke={3} />
        </div>
        <h3 className="text-xl font-extrabold tracking-tight mt-4">Lamaran kamu masuk!</h3>
        <p className="text-base text-pg-ink-700 leading-relaxed mt-2">
          Kami kirim email verifikasi ke <b className="text-pg-ink-900">{submittedEmail}</b>.
          Klik link di email untuk aktifkan akun kamu.
        </p>
        <p className="text-sm text-pg-ink-500 mt-3">
          Setelah verifikasi, masuk ke Talent Hub pakai email dan password yang baru kamu buat.
        </p>
        <a
          href={`${APP_URL}/auth/sign-in?email=${encodeURIComponent(submittedEmail)}`}
          className="mt-5 inline-flex items-center gap-2 font-bold text-pg-red-600 no-underline"
        >
          Masuk ke Talent Hub <Icon name="arrow_right" size={18} />
        </a>
        <div
          className="mt-4 px-4 py-3 rounded-lg text-left text-[13px]"
          style={{ background: "var(--pg-info-bg)", color: "var(--pg-info)" }}
        >
          Belum ada email verifikasi? Cek folder Spam atau Promosi.
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-pg-white border border-pg-ink-100 rounded-2xl p-5 md:p-6">
      <div className="text-[12px] font-bold tracking-[0.12em] uppercase text-pg-red-600">
        Daftar untuk {positionRole}
      </div>
      <h3 className="text-xl md:text-2xl font-extrabold tracking-tight mt-1">
        Mulai dari sini.
      </h3>
      <p className="text-sm text-pg-ink-500 mt-1.5">
        Isi data + pilih password. Kami buatkan akun Talent Hub kamu sekaligus.
      </p>

      <div className="grid gap-3 mt-5">
        <Field label="Nama lengkap" required>
          <input
            name="fullName"
            type="text"
            required
            autoComplete="name"
            placeholder="Maya Sari"
            className={INPUT_CLASS}
          />
        </Field>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Email" required>
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="maya@email.com"
              className={INPUT_CLASS}
            />
          </Field>
          <Field label="Nomor HP" required>
            <input
              name="whatsapp"
              type="tel"
              required
              autoComplete="tel"
              placeholder="+62 812 …"
              className={INPUT_CLASS}
            />
          </Field>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Kota" required>
            <input
              name="city"
              type="text"
              required
              placeholder="Jakarta"
              className={INPUT_CLASS}
            />
          </Field>
          <Field label="Tanggal lahir">
            <input name="birthDate" type="date" className={INPUT_CLASS} />
          </Field>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Gender">
            <select name="gender" defaultValue="" className={INPUT_CLASS}>
              <option value="">— Pilih —</option>
              <option value="male">Laki-laki</option>
              <option value="female">Wanita</option>
            </select>
          </Field>
          <Field label="Pendidikan terakhir" required>
            <select name="education" required defaultValue="" className={INPUT_CLASS}>
              <option value="" disabled>— Pilih —</option>
              <option value="sma">SMA / SMK</option>
              <option value="d3">D3 / D4</option>
              <option value="s1">S1</option>
              <option value="s2">S2</option>
            </select>
          </Field>
        </div>
      </div>

      <div className="mt-5 border-t border-pg-ink-100 pt-5">
        <div className="text-[12px] font-bold tracking-[0.12em] uppercase text-pg-ink-500 mb-3">
          Akun Talent Hub
        </div>
        <div className="grid gap-3">
          <Field label="Password" required>
            <div className="relative">
              <input
                name="password"
                type={showPw ? "text" : "password"}
                required
                autoComplete="new-password"
                minLength={10}
                placeholder="Minimal 10 karakter"
                className={INPUT_CLASS}
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] font-bold text-pg-red-600 p-1"
                aria-label={showPw ? "Sembunyikan password" : "Tampilkan password"}
              >
                {showPw ? "Sembunyikan" : "Tampilkan"}
              </button>
            </div>
          </Field>
          <Field label="Konfirmasi password" required>
            <input
              name="confirmPassword"
              type={showPw ? "text" : "password"}
              required
              autoComplete="new-password"
              minLength={10}
              placeholder="Ketik ulang password"
              className={INPUT_CLASS}
            />
          </Field>
          <div className="text-[12px] text-pg-ink-500 leading-relaxed">
            Kombinasi huruf besar, huruf kecil, dan angka. Disimpan aman — kami nggak bisa lihat password kamu.
          </div>
        </div>
      </div>

      {status === "error" && (
        <div
          className="mt-4 px-4 py-3 rounded-lg text-sm flex items-start gap-2"
          style={{ background: "var(--pg-err-bg)", color: "var(--pg-err)" }}
        >
          <Icon name="warn" size={16} />
          <span>{errorMsg || "Maaf, ada masalah saat mengirim. Coba lagi sebentar."}</span>
        </div>
      )}

      <div className="mt-5">
        <Button type="submit" variant="primary" block disabled={status === "loading"}>
          {status === "loading" ? "Mengirim…" : (
            <>
              Daftar & buat akun <Icon name="arrow_right" size={18} />
            </>
          )}
        </Button>
        <div className="text-[12px] text-pg-ink-500 mt-3 text-center">
          Sudah punya akun?{" "}
          <a href={`${APP_URL}/auth/sign-in`} className="text-pg-red-600 font-bold no-underline">
            Masuk di sini
          </a>
        </div>
        <div className="text-[12px] text-pg-ink-500 mt-2 text-center">
          Kami tidak kirim spam. Data kamu aman & sesuai UU PDP.
        </div>
      </div>
    </form>
  );
}

function validatePassword(pw: string): boolean {
  if (pw.length < 10) return false;
  if (!/[a-z]/.test(pw)) return false;
  if (!/[A-Z]/.test(pw)) return false;
  if (!/[0-9]/.test(pw)) return false;
  return true;
}

const INPUT_CLASS =
  "w-full bg-pg-white border-[1.5px] border-pg-ink-200 rounded-lg px-3.5 py-3 text-base text-pg-ink-900 font-medium placeholder:text-pg-ink-400 focus:border-pg-red-600 outline-none transition-colors";

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="text-[13px] font-bold text-pg-ink-500 mb-1.5">
        {label}
        {required && <span className="ml-1 text-pg-red-600">*</span>}
      </div>
      {children}
    </label>
  );
}
