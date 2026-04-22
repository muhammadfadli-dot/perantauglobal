"use client";

import { useState, useTransition } from "react";
import { updateApplicationNotes } from "@/app/(admin)/admin/actions";

export default function NotesEditor({
  applicationId,
  initialNotes,
}: {
  applicationId: string;
  initialNotes: string;
}) {
  const [value, setValue] = useState(initialNotes);
  const [saved, setSaved] = useState(true);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function save() {
    setError(null);
    start(async () => {
      try {
        await updateApplicationNotes(applicationId, value);
        setSaved(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal menyimpan");
      }
    });
  }

  return (
    <div>
      <label className="block font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.1em] opacity-60">
        Catatan PO
      </label>
      <textarea
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          setSaved(false);
        }}
        rows={3}
        placeholder="Catatan internal — screening notes, next action, concerns…"
        className="mt-2 w-full border border-[var(--color-dtg-ink)]/20 bg-white px-3 py-2 text-sm outline-none focus:border-[var(--color-dtg-red)]"
      />
      <div className="mt-2 flex items-center gap-3">
        <button
          type="button"
          onClick={save}
          disabled={pending || saved}
          className="border border-[var(--color-dtg-ink)] bg-[var(--color-dtg-ink)] px-3 py-1.5 font-[family-name:var(--font-mono)] text-[11px] font-bold uppercase tracking-[0.12em] text-white hover:bg-[var(--color-dtg-red)] disabled:opacity-40"
        >
          {pending ? "Menyimpan…" : saved ? "Tersimpan" : "Simpan"}
        </button>
        {error && (
          <span className="text-[11px] text-[var(--color-dtg-red)]">{error}</span>
        )}
      </div>
    </div>
  );
}
