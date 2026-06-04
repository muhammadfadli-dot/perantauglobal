"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Icon } from "@/components/pg/Icon";
import { Button } from "@/components/pg/primitives";
import { createAffiliateAgent } from "../actions";
import type { AffiliateAgentStatus } from "@perantauglobal/db";

const INPUT_CLASS =
  "w-full bg-pg-white border-[1.5px] border-pg-ink-200 rounded-lg px-3.5 py-3 text-base text-pg-ink-900 font-medium placeholder:text-pg-ink-400 focus:border-pg-red-600 outline-none transition-colors";

export default function AgentForm() {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const name = String(fd.get("name") ?? "").trim();
    if (name.length < 2) {
      setError("Nama agen wajib diisi (minimal 2 karakter).");
      return;
    }

    start(async () => {
      const res = await createAffiliateAgent({
        name,
        email: (fd.get("email") as string) || null,
        phone: (fd.get("phone") as string) || null,
        city: (fd.get("city") as string) || null,
        notes: (fd.get("notes") as string) || null,
        status: (fd.get("status") as AffiliateAgentStatus) || "active",
      });
      // Success redirects server-side; only a failure returns here.
      if (res && !res.ok) setError(res.error);
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-pg-white border border-pg-ink-100 rounded-2xl p-5 md:p-6"
    >
      <Field label="Nama agen" required>
        <input
          name="name"
          type="text"
          required
          placeholder="Budi Santoso"
          className={INPUT_CLASS}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2 mt-4">
        <Field label="Email" help="Optional. Dipakai sebagai identitas unik kalau diisi.">
          <input
            name="email"
            type="email"
            placeholder="budi@example.com"
            className={INPUT_CLASS}
          />
        </Field>
        <Field label="No. HP / WhatsApp" help="Optional. Format +62…">
          <input
            name="phone"
            type="tel"
            placeholder="+628123456789"
            className={INPUT_CLASS}
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 mt-4">
        <Field label="Kota" help="Optional.">
          <input name="city" type="text" placeholder="Surabaya" className={INPUT_CLASS} />
        </Field>
        <Field label="Status">
          <select name="status" defaultValue="active" className={INPUT_CLASS}>
            <option value="active">Aktif</option>
            <option value="inactive">Nonaktif</option>
            <option value="suspended">Suspended</option>
          </select>
        </Field>
      </div>

      <div className="mt-4">
        <Field label="Catatan internal" help="Optional. Hanya admin yang lihat.">
          <textarea
            name="notes"
            rows={3}
            className={INPUT_CLASS}
            placeholder="Misal: rekomendasi dari PIC Saudi, fokus posisi nakes."
          />
        </Field>
      </div>

      {error && (
        <div
          className="mt-4 px-3.5 py-3 rounded-lg flex items-start gap-2 text-sm"
          style={{ background: "var(--pg-err-bg)", color: "var(--pg-err)" }}
        >
          <Icon name="warn" size={16} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-3">
        <Button type="submit" variant="primary" disabled={pending}>
          {pending ? (
            "Menyimpan…"
          ) : (
            <>
              Simpan & buat kode <Icon name="arrow_right" size={18} />
            </>
          )}
        </Button>
        <Link
          href="/admin/agents"
          className="inline-flex items-center justify-center gap-2 min-h-[52px] px-[22px] text-base font-semibold rounded-xl border-[1.5px] border-pg-ink-200 text-pg-ink-900 no-underline hover:bg-pg-ink-50"
        >
          Batal
        </Link>
      </div>
    </form>
  );
}

function Field({
  label,
  required,
  help,
  children,
}: {
  label: string;
  required?: boolean;
  help?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="text-[13px] font-bold text-pg-ink-500 mb-1.5">
        {label}
        {required && <span className="ml-1 text-pg-red-600">*</span>}
      </div>
      {children}
      {help && <div className="text-[12px] text-pg-ink-500 mt-1.5">{help}</div>}
    </label>
  );
}
