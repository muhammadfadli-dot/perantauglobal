"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/pg/Icon";
import { Button } from "@/components/pg/primitives";
import {
  updatePositionMeta,
  updatePositionCountry,
  renamePositionSlug,
} from "../actions";

type CountryOption = { value: string; label: string; initials: string };

/**
 * Edits a position's identity: name + description, placement country, and slug.
 * The publish/active toggle lives in a separate PositionActiveToggle card above.
 *
 * Country + slug (Fase 1.3) are editable here so a typo or a country change no
 * longer needs an engineer + SQL. Country comes from the live registry dropdown
 * (safe values only); slug rename writes an alias so the old URL keeps working
 * (301) — critical while an ad points at the old link.
 */
export default function PositionMetaEditor({
  slug,
  initial,
  countryOptions,
}: {
  slug: string;
  initial: { name: string; description: string | null; country: string };
  countryOptions: CountryOption[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [name, setName] = useState(initial.name);
  const [desc, setDesc] = useState(initial.description ?? "");
  const [saved, setSaved] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Country ----------------------------------------------------------------
  // Ensure the current value is always selectable even if it's inactive/legacy.
  const options: CountryOption[] = countryOptions.some((o) => o.value === initial.country)
    ? countryOptions
    : [{ value: initial.country, label: initial.country, initials: "?" }, ...countryOptions];
  const [country, setCountry] = useState(initial.country);
  const [countryState, setCountryState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [countryError, setCountryError] = useState<string | null>(null);

  function saveCountry(next: string) {
    const prev = country;
    setCountry(next);
    setCountryState("saving");
    setCountryError(null);
    start(async () => {
      const res = await updatePositionCountry(slug, next);
      if (res.ok) {
        setCountryState("saved");
      } else {
        setCountry(prev); // revert on failure
        setCountryState("error");
        setCountryError(res.error);
      }
    });
  }

  // Slug rename ------------------------------------------------------------
  const [newSlug, setNewSlug] = useState(slug);
  const [renaming, setRenaming] = useState(false);
  const [slugError, setSlugError] = useState<string | null>(null);

  function save() {
    setError(null);
    start(async () => {
      try {
        await updatePositionMeta(slug, {
          name: name.trim(),
          description: desc.trim() || undefined,
        });
        setSaved(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal menyimpan");
      }
    });
  }

  function doRename() {
    const clean = newSlug.trim().toLowerCase();
    setSlugError(null);
    if (clean === slug) return;
    const ok = window.confirm(
      `Ganti slug "${slug}" jadi "${clean}"?\n\nURL lama (perantauglobal.com/lowongan/${slug}) akan otomatis redirect ke yang baru, jadi iklan yang lagi jalan tetap aman. Lanjut?`,
    );
    if (!ok) return;
    setRenaming(true);
    start(async () => {
      const res = await renamePositionSlug(slug, clean);
      setRenaming(false);
      if (res.ok) {
        // The editor URL changed with the slug — navigate to the new one.
        router.replace(`/admin/positions/${res.slug}`);
        router.refresh();
      } else {
        setSlugError(res.error);
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

      {/* Country — auto-saves on change */}
      <div className="mt-5 pt-4 border-t border-pg-ink-100">
        <div className="flex items-center justify-between mb-1.5">
          <div className="text-[13px] font-bold text-pg-ink-500">Negara penempatan</div>
          {countryState === "saving" && (
            <span className="text-[11px] font-mono text-pg-info">Menyimpan…</span>
          )}
          {countryState === "saved" && (
            <span className="text-[11px] font-mono text-pg-ok flex items-center gap-1">
              <Icon name="check" size={11} /> Tersimpan
            </span>
          )}
        </div>
        <select
          value={country}
          onChange={(e) => saveCountry(e.target.value)}
          disabled={pending}
          className="w-full bg-pg-white border-[1.5px] border-pg-ink-200 rounded-lg px-3.5 py-2.5 text-sm font-semibold focus:border-pg-red-600 outline-none"
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <p className="mt-1.5 text-[11.5px] text-pg-ink-tertiary">
          Menentukan pengelompokan di halaman /lowongan. Negara baru ditambah di
          form &quot;Tambah posisi&quot; &rarr; &quot;Tambah negara&quot;.
        </p>
        {countryError && (
          <div className="mt-2 text-[12px] text-pg-err flex items-center gap-1">
            <Icon name="warn" size={12} /> {countryError}
          </div>
        )}
      </div>

      {/* Slug rename */}
      <div className="mt-5 pt-4 border-t border-pg-ink-100">
        <div className="text-[13px] font-bold text-pg-ink-500 mb-1.5">Slug (URL)</div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[12px] font-mono text-pg-ink-tertiary shrink-0">/lowongan/</span>
          <input
            type="text"
            value={newSlug}
            onChange={(e) => {
              setNewSlug(e.target.value);
              setSlugError(null);
            }}
            className="flex-1 min-w-[140px] bg-pg-white border-[1.5px] border-pg-ink-200 rounded-lg px-3 py-2 text-sm font-mono focus:border-pg-red-600 outline-none"
          />
          <Button
            onClick={doRename}
            disabled={pending || renaming || newSlug.trim().toLowerCase() === slug}
            small
            variant="ghost"
          >
            {renaming ? "Mengganti…" : "Ganti slug"}
          </Button>
        </div>
        <p className="mt-1.5 text-[11.5px] text-pg-ink-tertiary">
          URL lama otomatis redirect (301) ke yang baru — iklan yang lagi jalan
          tetap aman.
        </p>
        {slugError && (
          <div className="mt-2 text-[12px] text-pg-err flex items-center gap-1">
            <Icon name="warn" size={12} /> {slugError}
          </div>
        )}
      </div>
    </div>
  );
}
