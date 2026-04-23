"use client";

import { useState, useTransition } from "react";
import { Icon } from "@/components/pg/Icon";
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
      <label className="text-[11px] font-bold tracking-[0.1em] uppercase text-pg-ink-500 block">
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
        className="mt-2 w-full bg-pg-white border-[1.5px] border-pg-ink-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-pg-red-600"
      />
      <div className="mt-2 flex items-center gap-3">
        <button
          type="button"
          onClick={save}
          disabled={pending || saved}
          className="inline-flex items-center justify-center gap-1.5 min-h-[36px] px-3.5 text-[13px] font-semibold rounded-lg bg-pg-red-600 text-white hover:bg-pg-red-700 disabled:opacity-40"
        >
          {pending ? "Menyimpan…" : saved ? (
            <>
              <Icon name="check" size={14} /> Tersimpan
            </>
          ) : "Simpan"}
        </button>
        {error && (
          <span className="text-[12px] text-pg-err flex items-center gap-1">
            <Icon name="warn" size={12} /> {error}
          </span>
        )}
      </div>
    </div>
  );
}
