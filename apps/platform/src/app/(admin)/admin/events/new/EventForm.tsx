"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Icon } from "@/components/pg/Icon";
import { Button } from "@/components/pg/primitives";
import { createEvent, updateEvent } from "../actions";

const INPUT_CLASS =
  "w-full bg-pg-white border-[1.5px] border-pg-ink-200 rounded-lg px-3.5 py-3 text-base text-pg-ink-900 font-medium placeholder:text-pg-ink-400 focus:border-pg-red-600 outline-none transition-colors";

const TIMEZONES = [
  "Asia/Jakarta",
  "Asia/Makassar",
  "Asia/Jayapura",
  "Asia/Riyadh",
  "Asia/Tokyo",
  "Asia/Taipei",
];

export type EventInitial = {
  slug: string;
  title: string;
  kind: string;
  status: "draft" | "published" | "closed";
  starts_at_local: string;
  timezone: string;
  platform: string;
  join_url: string | null;
  capacity: number | null;
  tagline: string | null;
  intro: string | null;
  benefits: string[];
};

export default function EventForm({
  mode = "create",
  initial,
}: {
  mode?: "create" | "edit";
  initial?: EventInitial;
}) {
  const isEdit = mode === "edit";
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const capRaw = String(fd.get("capacity") ?? "").trim();
    const input = {
      title: String(fd.get("title") ?? "").trim(),
      kind: String(fd.get("kind") ?? "sharing_session"),
      status: (fd.get("status") as "draft" | "published" | "closed") || "draft",
      starts_at_local: String(fd.get("starts_at_local") ?? ""),
      timezone: String(fd.get("timezone") ?? "Asia/Jakarta"),
      platform: String(fd.get("platform") ?? "").trim() || "Zoom",
      join_url: (fd.get("join_url") as string) || null,
      capacity: capRaw ? Number(capRaw) : null,
      tagline: (fd.get("tagline") as string) || null,
      intro: (fd.get("intro") as string) || null,
      benefits: String(fd.get("benefits") ?? "").split("\n"),
    };

    start(async () => {
      const res =
        isEdit && initial
          ? await updateEvent(initial.slug, input)
          : await createEvent(String(fd.get("slug") ?? ""), input);
      if (res && !res.ok) setError(res.error);
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-pg-white border border-pg-ink-100 rounded-2xl p-5 md:p-6"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Judul event" required>
          <input
            name="title"
            type="text"
            required
            defaultValue={initial?.title ?? ""}
            placeholder="Sharing Session: Kerja Perawat di Arab Saudi"
            className={INPUT_CLASS}
          />
        </Field>
        {isEdit ? (
          <Field label="Slug (URL)" help="Tidak bisa diubah setelah dibuat.">
            <input
              type="text"
              value={initial?.slug ?? ""}
              disabled
              className={`${INPUT_CLASS} opacity-60`}
            />
          </Field>
        ) : (
          <Field label="Slug (URL)" required help="huruf kecil-dengan-strip → /event/slug">
            <input
              name="slug"
              type="text"
              required
              placeholder="sharing-session-perawat-juni"
              className={INPUT_CLASS}
            />
          </Field>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-3 mt-4">
        <Field label="Jenis">
          <select name="kind" defaultValue={initial?.kind ?? "sharing_session"} className={INPUT_CLASS}>
            <option value="sharing_session">Sharing session</option>
            <option value="webinar">Webinar</option>
            <option value="workshop">Workshop</option>
            <option value="info_session">Info session</option>
          </select>
        </Field>
        <Field label="Status" help="Published = tayang di /event/[slug].">
          <select name="status" defaultValue={initial?.status ?? "draft"} className={INPUT_CLASS}>
            <option value="draft">Draft</option>
            <option value="published">Published (live)</option>
            <option value="closed">Ditutup</option>
          </select>
        </Field>
        <Field label="Kapasitas" help="Optional.">
          <input
            name="capacity"
            type="number"
            min={1}
            defaultValue={initial?.capacity ?? ""}
            placeholder="100"
            className={INPUT_CLASS}
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-3 mt-4">
        <Field label="Tanggal & jam mulai" required>
          <input
            name="starts_at_local"
            type="datetime-local"
            required
            defaultValue={initial?.starts_at_local ?? ""}
            className={INPUT_CLASS}
          />
        </Field>
        <Field label="Timezone">
          <select name="timezone" defaultValue={initial?.timezone ?? "Asia/Jakarta"} className={INPUT_CLASS}>
            {TIMEZONES.map((tz) => (
              <option key={tz} value={tz}>
                {tz}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Platform">
          <input
            name="platform"
            type="text"
            defaultValue={initial?.platform ?? "Zoom"}
            placeholder="Zoom"
            className={INPUT_CLASS}
          />
        </Field>
      </div>

      <div className="mt-4">
        <Field label="Join URL" help="Link Zoom/meeting. Dikirim ke pendaftar.">
          <input
            name="join_url"
            type="url"
            defaultValue={initial?.join_url ?? ""}
            placeholder="https://zoom.us/j/…"
            className={INPUT_CLASS}
          />
        </Field>
      </div>

      <div className="mt-4">
        <Field label="Tagline" help="Satu kalimat hook di hero.">
          <input
            name="tagline"
            type="text"
            defaultValue={initial?.tagline ?? ""}
            placeholder="Gratis. Online. Untuk calon perawat ke Arab Saudi."
            className={INPUT_CLASS}
          />
        </Field>
      </div>

      <div className="mt-4">
        <Field label="Intro" help="Paragraf pembuka di landing page.">
          <textarea
            name="intro"
            rows={3}
            defaultValue={initial?.intro ?? ""}
            className={INPUT_CLASS}
            placeholder="Sesi sharing langsung dari perawat yang sudah bekerja di Arab Saudi…"
          />
        </Field>
      </div>

      <div className="mt-4">
        <Field label="Benefit (satu per baris)" help="Poin-poin yang ditampilkan sebagai daftar.">
          <textarea
            name="benefits"
            rows={4}
            defaultValue={initial?.benefits?.join("\n") ?? ""}
            className={INPUT_CLASS}
            placeholder={"Tips lolos seleksi\nGambaran gaji & biaya hidup\nTanya jawab langsung"}
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
              {isEdit ? "Simpan perubahan" : "Buat event"} <Icon name="arrow_right" size={18} />
            </>
          )}
        </Button>
        <Link
          href={isEdit && initial ? `/admin/events/${initial.slug}` : "/admin/events"}
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
