"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Icon } from "@/components/pg/Icon";
import { Button } from "@/components/pg/primitives";
import { createJobOrder } from "../actions";

type Position = { slug: string; name: string; country: string };

const INPUT_CLASS =
  "w-full bg-pg-white border-[1.5px] border-pg-ink-200 rounded-lg px-3.5 py-3 text-base text-pg-ink-900 font-medium placeholder:text-pg-ink-400 focus:border-pg-red-600 outline-none transition-colors";

export default function JobOrderForm({
  positions,
  presetSlug,
}: {
  positions: Position[];
  presetSlug: string | null;
}) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [positionSlug, setPositionSlug] = useState(presetSlug ?? "");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const slot = Number(fd.get("slot_count"));
    if (!Number.isInteger(slot) || slot < 1) {
      setError("Jumlah slot harus minimal 1.");
      return;
    }

    start(async () => {
      try {
        await createJobOrder({
          position_slug: positionSlug,
          internal_employer_name: String(fd.get("internal_employer_name") ?? "").trim(),
          public_employer_name: (fd.get("public_employer_name") as string) || null,
          employer_city: (fd.get("employer_city") as string) || null,
          intake_label: String(fd.get("intake_label") ?? "").trim(),
          slot_count: slot,
          deadline: (fd.get("deadline") as string) || null,
          public_description: (fd.get("public_description") as string) || null,
          notes: (fd.get("notes") as string) || null,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal menyimpan job order.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="bg-pg-white border border-pg-ink-100 rounded-2xl p-5 md:p-6">
      <Field label="Posisi" required>
        <select
          name="position_slug"
          required
          value={positionSlug}
          onChange={(e) => setPositionSlug(e.target.value)}
          className={INPUT_CLASS}
        >
          <option value="" disabled>— Pilih posisi —</option>
          {positions.map((p) => (
            <option key={p.slug} value={p.slug}>
              {p.name}
            </option>
          ))}
        </select>
      </Field>

      <div className="grid gap-4 sm:grid-cols-2 mt-4">
        <Field
          label="Employer (internal)"
          required
          help="Nama lengkap untuk internal — bisa beda dari yang di-publish ke www."
        >
          <input
            name="internal_employer_name"
            type="text"
            required
            placeholder="King Faisal Specialist Hospital"
            className={INPUT_CLASS}
          />
        </Field>
        <Field label="Employer (public)" help="Optional. Kalau kosong, fallback ke nama generic.">
          <input
            name="public_employer_name"
            type="text"
            placeholder="Rumah sakit di Saudi Arabia"
            className={INPUT_CLASS}
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 mt-4">
        <Field label="Kota employer" help="Optional. Tampil di www kalau diisi.">
          <input
            name="employer_city"
            type="text"
            placeholder="Riyadh"
            className={INPUT_CLASS}
          />
        </Field>
        <Field label="Label batch" required>
          <input
            name="intake_label"
            type="text"
            required
            placeholder="Batch Juni 2026"
            className={INPUT_CLASS}
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 mt-4">
        <Field label="Jumlah slot" required>
          <input
            name="slot_count"
            type="number"
            min={1}
            required
            placeholder="12"
            className={INPUT_CLASS}
          />
        </Field>
        <Field label="Deadline apply" help="Optional. Format YYYY-MM-DD.">
          <input
            name="deadline"
            type="date"
            className={INPUT_CLASS}
          />
        </Field>
      </div>

      <div className="mt-4">
        <Field
          label="Deskripsi public"
          help="Optional. Override deskripsi default posisi di www. Kosongkan kalau cukup pakai deskripsi posisi."
        >
          <textarea
            name="public_description"
            rows={3}
            className={INPUT_CLASS}
            placeholder="Misal: 'Khusus perawat ICU dengan minimal 3 tahun pengalaman.'"
          />
        </Field>
      </div>

      <div className="mt-4">
        <Field label="Internal notes" help="Hanya admin yang lihat.">
          <textarea
            name="notes"
            rows={3}
            className={INPUT_CLASS}
            placeholder="Catatan untuk tim — kontak PIC employer, deadline khusus, dll."
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
          {pending ? "Menyimpan…" : (
            <>
              Simpan & publish <Icon name="arrow_right" size={18} />
            </>
          )}
        </Button>
        <Link
          href="/admin/job-orders"
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
