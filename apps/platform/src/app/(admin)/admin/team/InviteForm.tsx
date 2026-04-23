"use client";

import { useState, useTransition } from "react";
import { Icon } from "@/components/pg/Icon";
import { Button } from "@/components/pg/primitives";
import { inviteAdmin } from "./actions";

export default function InviteForm() {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") ?? "").trim();
    const notes = (fd.get("notes") as string) || undefined;
    start(async () => {
      try {
        await inviteAdmin(email, notes);
        setSuccess(`${email} ditambahkan sebagai admin.`);
        e.currentTarget.reset();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal menambah admin");
      }
    });
  }

  return (
    <form onSubmit={submit} className="bg-pg-white border border-pg-ink-100 rounded-2xl p-4 md:p-5">
      <div className="text-[12px] font-bold tracking-[0.12em] uppercase text-pg-red-600 mb-3">
        Tambah admin baru
      </div>
      <div className="grid gap-3 sm:grid-cols-[2fr_1fr]">
        <label className="block">
          <div className="text-[13px] font-bold text-pg-ink-500 mb-1.5">Email</div>
          <input
            name="email"
            type="email"
            required
            placeholder="kolega@perantauglobal.com"
            className="w-full bg-pg-white border-[1.5px] border-pg-ink-200 rounded-lg px-3.5 py-2.5 text-base font-semibold focus:border-pg-red-600 outline-none"
          />
        </label>
        <label className="block">
          <div className="text-[13px] font-bold text-pg-ink-500 mb-1.5">Catatan (opsional)</div>
          <input
            name="notes"
            type="text"
            placeholder="Recruiter Saudi"
            className="w-full bg-pg-white border-[1.5px] border-pg-ink-200 rounded-lg px-3.5 py-2.5 text-base focus:border-pg-red-600 outline-none"
          />
        </label>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={pending} small>
          {pending ? "Menambah…" : (
            <>
              <Icon name="plus" size={14} stroke={2.4} /> Tambah admin
            </>
          )}
        </Button>
        {success && (
          <div className="text-[12px] text-pg-ok flex items-center gap-1">
            <Icon name="check" size={12} stroke={2.4} /> {success}
          </div>
        )}
        {error && (
          <div className="text-[12px] text-pg-err flex items-center gap-1">
            <Icon name="warn" size={12} /> {error}
          </div>
        )}
      </div>
    </form>
  );
}
