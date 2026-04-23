"use client";

import { useState } from "react";
import { Icon } from "./Icon";
import { Button } from "./primitives";
import { trackEvent, generateEventId, getMetaCookies } from "@/lib/tracking";
import { supabaseBrowserV2 } from "@/lib/supabase-browser-v2";

type ApplyFormProps = {
  positionSlug: string;
  positionRole: string;
  positionCountry: string;
  apiEndpoint?: string;
};

export function ApplyForm({
  positionSlug,
  positionRole,
  positionCountry,
  apiEndpoint,
}: ApplyFormProps) {
  const endpoint = apiEndpoint ?? `/api/lowongan/${positionSlug}`;
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [submittedEmail, setSubmittedEmail] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    const form = e.currentTarget;
    const fd = new FormData(form);

    const sharedData = {
      full_name: String(fd.get("fullName") ?? ""),
      whatsapp: String(fd.get("whatsapp") ?? ""),
      email: String(fd.get("email") ?? ""),
      city: String(fd.get("city") ?? ""),
      birth_date: (fd.get("birthDate") as string) || null,
      gender: (fd.get("gender") as string) || null,
      education: String(fd.get("education") ?? ""),
    };

    const eventId = generateEventId(`lowongan_${positionSlug}`);
    const { fbp, fbc } = getMetaCookies();

    const payload = {
      ...sharedData,
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
        try {
          const sb = supabaseBrowserV2();
          const platformBase = process.env.NEXT_PUBLIC_PLATFORM_URL || window.location.origin;
          sb.auth
            .signInWithOtp({
              email: sharedData.email,
              options: {
                shouldCreateUser: true,
                emailRedirectTo: `${platformBase}/auth/confirm`,
              },
            })
            .then(({ error }) => {
              if (error) console.warn("[magic-link]", error.message);
            });
        } catch (err) {
          console.warn("[magic-link] skipped:", err);
        }
        form.reset();
      } else {
        setStatus("error");
      }
    } catch {
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
        <h3 className="text-xl font-extrabold tracking-tight mt-4">Kami sudah terima!</h3>
        <p className="text-base text-pg-ink-700 leading-relaxed mt-2">
          Tautan masuk ke Talent Hub kami kirim ke <b className="text-pg-ink-900">{submittedEmail}</b>.
          Klik tautan itu untuk lengkapi profil dan lanjutkan lamaran.
        </p>
        <div
          className="mt-4 px-4 py-3 rounded-lg text-left text-[13px]"
          style={{ background: "var(--pg-info-bg)", color: "var(--pg-info)" }}
        >
          Belum ada email? Cek folder Spam atau Promosi. Tautan berlaku 15 menit.
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
        Kami kirim tautan ke email kamu untuk lanjut di Talent Hub. Tanpa password.
      </p>

      <div className="grid gap-3 mt-5">
        <Field label="Nama lengkap" required>
          <input
            name="fullName"
            type="text"
            required
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
              placeholder="maya@email.com"
              className={INPUT_CLASS}
            />
          </Field>
          <Field label="Nomor HP" required>
            <input
              name="whatsapp"
              type="tel"
              required
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

      {status === "error" && (
        <div
          className="mt-4 px-4 py-3 rounded-lg text-sm flex items-start gap-2"
          style={{ background: "var(--pg-err-bg)", color: "var(--pg-err)" }}
        >
          <Icon name="warn" size={16} />
          <span>Maaf, ada masalah saat mengirim. Coba lagi sebentar.</span>
        </div>
      )}

      <div className="mt-5">
        <Button type="submit" variant="primary" block disabled={status === "loading"}>
          {status === "loading" ? "Mengirim…" : (
            <>
              Kirim tautan ke email <Icon name="arrow_right" size={18} />
            </>
          )}
        </Button>
        <div className="text-[12px] text-pg-ink-500 mt-3 text-center">
          Kami tidak kirim spam. Data kamu aman & sesuai UU PDP.
        </div>
      </div>
    </form>
  );
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
