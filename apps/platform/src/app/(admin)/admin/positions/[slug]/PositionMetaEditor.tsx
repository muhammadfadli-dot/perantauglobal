"use client";

import { useState, useTransition } from "react";
import { Icon } from "@/components/pg/Icon";
import { Button } from "@/components/pg/primitives";
import { updatePositionMeta } from "../actions";

export default function PositionMetaEditor({
  slug,
  initial,
}: {
  slug: string;
  initial: { name: string; description: string | null; active: boolean };
}) {
  const [pending, start] = useTransition();
  const [name, setName] = useState(initial.name);
  const [desc, setDesc] = useState(initial.description ?? "");
  const [active, setActive] = useState(initial.active);
  const [saved, setSaved] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function save() {
    setError(null);
    start(async () => {
      try {
        await updatePositionMeta(slug, {
          name: name.trim(),
          description: desc.trim() || undefined,
          active,
        });
        setSaved(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal menyimpan");
      }
    });
  }

  function toggleActive() {
    setError(null);
    const next = !active;
    setActive(next);
    start(async () => {
      try {
        await updatePositionMeta(slug, { active: next });
      } catch (err) {
        setActive(!next);
        setError(err instanceof Error ? err.message : "Gagal toggle active");
      }
    });
  }

  return (
    <div className="bg-pg-white border border-pg-ink-100 rounded-2xl p-5">
      <div className="text-[12px] font-bold tracking-[0.12em] uppercase text-pg-ink-500">
        Edit posisi
      </div>

      <div className="mt-4 grid gap-3">
        <label className="block">
          <div className="text-[13px] font-bold text-pg-ink-500 mb-1.5">Nama posisi</div>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setSaved(false);
            }}
            className="w-full bg-pg-white border-[1.5px] border-pg-ink-200 rounded-lg px-3.5 py-2.5 text-base font-semibold focus:border-pg-red-600 outline-none"
          />
        </label>
        <label className="block">
          <div className="text-[13px] font-bold text-pg-ink-500 mb-1.5">Deskripsi</div>
          <textarea
            value={desc}
            onChange={(e) => {
              setDesc(e.target.value);
              setSaved(false);
            }}
            rows={3}
            className="w-full bg-pg-white border-[1.5px] border-pg-ink-200 rounded-lg px-3.5 py-2.5 text-sm focus:border-pg-red-600 outline-none"
          />
        </label>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3 pt-4 border-t border-pg-ink-100">
        <button
          type="button"
          onClick={toggleActive}
          disabled={pending}
          className={`inline-flex items-center gap-2 min-h-[36px] px-3.5 text-[13px] font-bold tracking-wide uppercase rounded-lg border-[1.5px] disabled:opacity-50 ${
            active
              ? "bg-pg-ok-bg border-pg-ok text-pg-ok"
              : "bg-pg-ink-100 border-pg-ink-300 text-pg-ink-500"
          }`}
        >
          <span className={`inline-block w-2 h-2 rounded-full ${active ? "bg-pg-ok" : "bg-pg-ink-400"}`} />
          {active ? "Aktif" : "Nonaktif"}
        </button>
        <div className="flex-1" />
        <Button onClick={save} disabled={pending || saved} small>
          {pending ? "Menyimpan…" : saved ? (
            <>
              <Icon name="check" size={14} /> Tersimpan
            </>
          ) : "Simpan perubahan"}
        </Button>
      </div>

      {error && (
        <div className="mt-3 text-[12px] text-pg-err flex items-center gap-1">
          <Icon name="warn" size={12} /> {error}
        </div>
      )}
    </div>
  );
}
