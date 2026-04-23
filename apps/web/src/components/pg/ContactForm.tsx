"use client";

import { useState } from "react";
import { Icon } from "./Icon";
import { Button } from "./primitives";

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    const fd = new FormData(e.currentTarget);
    const payload = {
      name: String(fd.get("name") ?? ""),
      email: String(fd.get("email") ?? ""),
      phone: (fd.get("phone") as string) || null,
      subject: String(fd.get("subject") ?? "Pertanyaan umum"),
      message: String(fd.get("message") ?? ""),
    };
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setStatus(res.ok ? "success" : "error");
      if (res.ok) e.currentTarget.reset();
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
        <h3 className="text-xl font-extrabold tracking-tight mt-4">Pesan kamu sudah terkirim.</h3>
        <p className="text-base text-pg-ink-700 leading-relaxed mt-2">
          Tim kami akan balas via email dalam 1×24 jam kerja.
        </p>
        <Button onClick={() => setStatus("idle")} variant="ghost" className="mt-4">
          Kirim pesan lain
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-pg-white border border-pg-ink-100 rounded-2xl p-5 md:p-6">
      <div className="text-[12px] font-bold tracking-[0.12em] uppercase text-pg-red-600">
        Kirim pesan
      </div>
      <h3 className="text-xl md:text-2xl font-extrabold tracking-tight mt-1">Form kontak</h3>

      <div className="grid gap-3 mt-5">
        <Field label="Nama" required>
          <input name="name" type="text" required className={INPUT_CLASS} />
        </Field>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Email" required>
            <input name="email" type="email" required className={INPUT_CLASS} />
          </Field>
          <Field label="Nomor HP">
            <input name="phone" type="tel" className={INPUT_CLASS} placeholder="+62 …" />
          </Field>
        </div>
        <Field label="Subjek">
          <select name="subject" defaultValue="Pertanyaan umum" className={INPUT_CLASS}>
            <option>Pertanyaan umum</option>
            <option>Tanya lowongan</option>
            <option>Tanya biaya & proses</option>
            <option>Lainnya</option>
          </select>
        </Field>
        <Field label="Pesan" required>
          <textarea
            name="message"
            required
            rows={5}
            className={INPUT_CLASS}
            placeholder="Tulis pertanyaan atau kebutuhan kamu di sini…"
          />
        </Field>
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
              Kirim pesan <Icon name="arrow_right" size={18} />
            </>
          )}
        </Button>
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
