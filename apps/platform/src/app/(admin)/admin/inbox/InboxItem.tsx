"use client";

import { useState, useTransition } from "react";
import { Icon } from "@/components/pg/Icon";
import { Badge } from "@/components/pg/primitives";
import { updateInboxStatus, updateInboxNotes } from "./actions";

type Item = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  status: "new" | "in_progress" | "resolved";
  notes: string | null;
  created_at: string;
};

const STATUS_LABEL: Record<Item["status"], string> = {
  new: "Baru",
  in_progress: "Sedang ditangani",
  resolved: "Selesai",
};

const STATUS_VARIANT: Record<Item["status"], "warn" | "info" | "ok"> = {
  new: "warn",
  in_progress: "info",
  resolved: "ok",
};

export default function InboxItem({ item }: { item: Item }) {
  const [pending, start] = useTransition();
  const [open, setOpen] = useState(item.status === "new");
  const [status, setStatus] = useState<Item["status"]>(item.status);
  const [notes, setNotes] = useState(item.notes ?? "");
  const [notesSaved, setNotesSaved] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function changeStatus(next: Item["status"]) {
    setError(null);
    const prev = status;
    setStatus(next);
    start(async () => {
      try {
        await updateInboxStatus(item.id, next);
      } catch (err) {
        setStatus(prev);
        setError(err instanceof Error ? err.message : "Gagal update status");
      }
    });
  }

  function saveNotes() {
    setError(null);
    start(async () => {
      try {
        await updateInboxNotes(item.id, notes);
        setNotesSaved(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal simpan notes");
      }
    });
  }

  return (
    <article className="bg-pg-white border border-pg-ink-100 rounded-2xl">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={STATUS_VARIANT[status]}>{STATUS_LABEL[status]}</Badge>
            <div className="text-base font-bold">{item.name}</div>
            <div className="text-[12px] text-pg-ink-500 font-mono">
              {new Date(item.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
            </div>
          </div>
          <div className="text-sm text-pg-ink-700 mt-1">{item.subject}</div>
          <div className="text-[13px] text-pg-ink-500 mt-1 truncate">{item.message}</div>
        </div>
        <Icon name="chevron_down" size={18} className={`text-pg-ink-400 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="border-t border-pg-ink-100 px-5 py-4 grid gap-4">
          <div className="grid gap-2 sm:grid-cols-2">
            <a
              href={`mailto:${item.email}`}
              className="flex items-center gap-2 text-sm font-semibold text-pg-red-600 no-underline hover:underline"
            >
              <Icon name="mail" size={14} /> {item.email}
            </a>
            {item.phone && (
              <div className="flex items-center gap-2 text-sm text-pg-ink-700">
                <Icon name="phone" size={14} /> {item.phone}
              </div>
            )}
          </div>

          <div className="bg-pg-paper border border-pg-ink-100 rounded-lg px-4 py-3">
            <div className="text-[11px] font-bold tracking-wide uppercase text-pg-ink-500 mb-1.5">
              Pesan lengkap
            </div>
            <div className="text-[14px] leading-relaxed whitespace-pre-line">{item.message}</div>
          </div>

          <div>
            <div className="text-[11px] font-bold tracking-wide uppercase text-pg-ink-500 mb-2">
              Status
            </div>
            <div className="flex gap-2">
              {(["new", "in_progress", "resolved"] as const).map((s) => {
                const active = status === s;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => changeStatus(s)}
                    disabled={pending}
                    className={`inline-flex items-center justify-center min-h-[36px] px-3 text-[12px] font-bold tracking-wide uppercase rounded-lg border-[1.5px] disabled:opacity-50 ${
                      active
                        ? "bg-pg-red-600 text-white border-pg-red-600"
                        : "bg-pg-white text-pg-ink-700 border-pg-ink-200 hover:border-pg-ink-300"
                    }`}
                  >
                    {STATUS_LABEL[s]}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block">
              <div className="text-[11px] font-bold tracking-wide uppercase text-pg-ink-500 mb-1.5">
                Catatan internal
              </div>
              <textarea
                value={notes}
                onChange={(e) => {
                  setNotes(e.target.value);
                  setNotesSaved(false);
                }}
                rows={3}
                placeholder="Catatan internal — siapa yang handle, status, dll."
                className="w-full bg-pg-white border-[1.5px] border-pg-ink-200 rounded-lg px-3 py-2 text-sm focus:border-pg-red-600 outline-none"
              />
            </label>
            <button
              type="button"
              onClick={saveNotes}
              disabled={pending || notesSaved}
              className="mt-2 inline-flex items-center gap-1.5 min-h-[34px] px-3 text-[13px] font-semibold rounded-lg bg-pg-red-600 text-white hover:bg-pg-red-700 disabled:opacity-40"
            >
              {pending ? "Menyimpan…" : notesSaved ? (
                <>
                  <Icon name="check" size={14} /> Tersimpan
                </>
              ) : "Simpan catatan"}
            </button>
          </div>

          {error && (
            <div className="text-[12px] text-pg-err flex items-center gap-1">
              <Icon name="warn" size={12} /> {error}
            </div>
          )}
        </div>
      )}
    </article>
  );
}
