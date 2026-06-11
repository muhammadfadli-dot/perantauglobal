"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/pg/Icon";
import { createPosition } from "./actions";
import { COUNTRY_OPTIONS } from "@perantauglobal/db/country";

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function PositionCreateForm() {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();
  const [name, setName] = React.useState("");
  const [slugInput, setSlugInput] = React.useState("");
  const [slugTouched, setSlugTouched] = React.useState(false);
  const [country, setCountry] = React.useState<string>("");
  const [error, setError] = React.useState<string | null>(null);

  const effectiveSlug = slugTouched ? slugInput : slugify(name);
  const nameOk = name.trim().length >= 2;
  const slugOk = SLUG_RE.test(effectiveSlug);
  const countryOk = country !== "";
  const canSubmit = nameOk && slugOk && countryOk && !pending;

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setError(null);
    startTransition(async () => {
      try {
        const result = await createPosition({
          name: name.trim(),
          slug: effectiveSlug,
          country,
        });
        if (!result.ok) {
          // Expected validation / duplicate slug — show inline, don't navigate.
          setError(result.error);
          return;
        }
        router.push(`/admin/positions/${result.slug}`);
      } catch (err) {
        // Unexpected throw (auth failure, DB outage). Message is opaque in
        // production by design — surface a generic note + suggest reload.
        setError(
          err instanceof Error
            ? err.message
            : "Gagal membuat posisi. Coba reload halaman & ulangi.",
        );
      }
    });
  }

  return (
    <main className="px-8 py-7 max-w-2xl">
      <div className="flex flex-col gap-1.5 mb-6">
        <div
          className="text-[11px] font-semibold tracking-[0.12em] uppercase"
          style={{ color: "var(--pg-red-600)", fontFamily: "var(--font-mono)" }}
        >
          Catalog · Posisi baru
        </div>
        <h1 className="text-[28px] font-extrabold leading-[32px] tracking-[-0.02em] text-pg-ink-primary">
          Mulai dari basic.
        </h1>
        <p className="text-[13px] text-pg-ink-tertiary mt-1 leading-relaxed">
          Isi nama + negara dulu — langsung masuk ke editor di mana kamu bisa
          tulis deskripsi, set syarat, dan preview LP-nya langsung di samping.
          Mirip bikin landing page.
        </p>
      </div>

      <form
        onSubmit={onSubmit}
        className="bg-pg-white rounded-2xl p-6 flex flex-col gap-5"
        style={{ border: "1px solid var(--pg-border)" }}
      >
        <Field
          label="Nama posisi"
          hint="Yang akan dilihat kandidat di /lowongan."
          required
        >
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Contoh: Perawat Saudi Arabia"
            className="w-full text-[15px] px-3.5 py-2.5 rounded-lg outline-none focus:border-pg-red-600 transition-colors"
            style={{ border: "1.5px solid var(--pg-border)" }}
            autoFocus
            required
          />
        </Field>

        <Field
          label="Slug URL"
          hint="Otomatis dari nama, bisa di-edit. Pakai huruf kecil, angka, tanda hubung."
          required
        >
          <div className="flex items-center gap-2">
            <span
              className="text-[12px] text-pg-ink-tertiary font-mono shrink-0"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              /lowongan/
            </span>
            <input
              type="text"
              value={effectiveSlug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlugInput(slugify(e.target.value));
              }}
              placeholder="perawat-saudi-arabia"
              className="flex-1 text-[14px] px-3 py-2 rounded-lg outline-none focus:border-pg-red-600 transition-colors font-mono"
              style={{
                border: "1.5px solid var(--pg-border)",
                fontFamily: "var(--font-mono)",
              }}
            />
          </div>
          {!slugOk && effectiveSlug.length > 0 && (
            <div
              className="text-[11px] mt-1.5"
              style={{ color: "var(--pg-err)" }}
            >
              Format slug invalid (hanya lowercase, angka, tanda hubung).
            </div>
          )}
        </Field>

        <Field label="Negara penempatan" required>
          <div className="grid grid-cols-3 gap-2">
            {COUNTRY_OPTIONS.map((c) => {
              const active = country === c.value;
              return (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setCountry(c.value)}
                  className="flex flex-col items-center gap-1.5 px-2 py-3 rounded-lg transition-colors"
                  style={{
                    border: active
                      ? "1.5px solid var(--pg-red-600)"
                      : "1.5px solid var(--pg-border)",
                    background: active ? "var(--pg-red-soft-bg)" : "transparent",
                  }}
                >
                  <span
                    className="w-8 h-8 rounded-md grid place-items-center font-bold text-white"
                    style={{
                      background: active
                        ? "var(--pg-red-600)"
                        : "var(--pg-ink-primary)",
                      fontFamily: "var(--font-mono)",
                      fontSize: "10px",
                    }}
                  >
                    {c.initials}
                  </span>
                  <span
                    className="text-[11px] font-bold"
                    style={{
                      color: active
                        ? "var(--pg-red-600)"
                        : "var(--pg-ink-secondary)",
                    }}
                  >
                    {c.label}
                  </span>
                </button>
              );
            })}
          </div>
        </Field>

        {error && (
          <div
            className="px-3.5 py-3 rounded-lg flex items-start gap-2.5 text-[13px]"
            style={{ background: "var(--pg-err-bg)", color: "var(--pg-err)" }}
          >
            <Icon name="warn" size={14} className="shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="submit"
            disabled={!canSubmit}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[14px] font-bold text-white no-underline disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: "var(--pg-red-600)" }}
          >
            {pending ? (
              "Membuat..."
            ) : (
              <>
                Buat posisi & buka editor
                <Icon name="arrow_right" size={14} stroke={2.4} />
              </>
            )}
          </button>
        </div>
      </form>

      <div className="mt-5 px-4 py-3 rounded-lg flex items-start gap-2.5 text-[12px] text-pg-ink-tertiary"
        style={{ background: "var(--pg-paper)" }}>
        <Icon name="info" size={14} className="shrink-0 mt-0.5 text-pg-info" />
        <div>
          Setelah dibuat, kamu akan masuk ke editor untuk: tulis deskripsi
          posisi, atur syarat & dokumen yang perlu di-upload kandidat, preview
          landing page-nya, lalu publish.
        </div>
      </div>
    </main>
  );
}

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="flex items-baseline gap-1.5">
        <div className="text-[13px] font-bold text-pg-ink-primary">{label}</div>
        {required && (
          <span
            className="text-[10px] font-semibold tracking-[0.08em] uppercase"
            style={{ color: "var(--pg-red-600)" }}
          >
            wajib
          </span>
        )}
      </div>
      {hint && (
        <div className="text-[11px] text-pg-ink-tertiary mt-0.5 mb-2 leading-relaxed">
          {hint}
        </div>
      )}
      {!hint && <div className="mt-2" />}
      {children}
    </label>
  );
}
