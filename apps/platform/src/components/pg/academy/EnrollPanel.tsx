"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/pg/Icon";
import { enrollAction } from "@/app/(candidate)/akademi/actions";
import { ACADEMY_CONSENT_TEXT } from "@/lib/academy-consent";

export interface RegField {
  key: string;
  label: string;
  help: string | null;
  type: string; // form_field_type
  options: { value: string; label: string }[] | null;
  required: boolean;
}

export function EnrollPanel({
  slug,
  fields,
  isFree,
}: {
  slug: string;
  fields: RegField[];
  isFree: boolean;
}) {
  const router = useRouter();
  const [values, setValues] = useState<Record<string, string | string[]>>({});
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function setField(key: string, value: string | string[]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  function toggleMulti(key: string, optValue: string) {
    setValues((v) => {
      const cur = Array.isArray(v[key]) ? (v[key] as string[]) : [];
      return {
        ...v,
        [key]: cur.includes(optValue)
          ? cur.filter((x) => x !== optValue)
          : [...cur, optValue],
      };
    });
  }

  function validate(): string | null {
    if (!consent) return "Centang persetujuan dulu ya.";
    for (const f of fields) {
      if (!f.required) continue;
      const val = values[f.key];
      const empty =
        val === undefined ||
        val === "" ||
        (Array.isArray(val) && val.length === 0);
      if (empty) return `"${f.label}" wajib diisi.`;
    }
    return null;
  }

  function submit() {
    const v = validate();
    if (v) {
      setError(v);
      return;
    }
    setError(null);
    startTransition(async () => {
      // Consent goes to the server too: validate() above is UX, the action
      // re-checks it before any consent row can be written (PDP).
      const res = await enrollAction(slug, values, consent);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div
      className="rounded-[16px] p-4 flex flex-col gap-3.5"
      style={{ background: "var(--pg-white)", border: "1px solid var(--pg-ink-100)" }}
    >
      {fields.map((f) => (
        <div key={f.key} className="flex flex-col gap-1.5">
          <label className="text-[13px] font-semibold text-pg-ink-800">
            {f.label}
            {f.required && <span style={{ color: "var(--pg-red-600)" }}> *</span>}
          </label>
          {f.help && <span className="text-[11.5px] text-pg-ink-500">{f.help}</span>}
          {renderField(f, values[f.key], setField, toggleMulti)}
        </div>
      ))}

      <label className="flex items-start gap-2.5 cursor-pointer">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-0.5 w-4 h-4 shrink-0 accent-[var(--pa-amber-600)]"
        />
        <span className="text-[12px] text-pg-ink-600 leading-snug">
          {ACADEMY_CONSENT_TEXT}
        </span>
      </label>

      {error && (
        <div
          className="text-[12.5px] px-3 py-2 rounded-[10px]"
          style={{ background: "var(--pg-err-bg)", color: "var(--pg-err)" }}
        >
          {error}
        </div>
      )}

      <button
        type="button"
        onClick={submit}
        disabled={pending}
        className="inline-flex items-center justify-center gap-2 w-full min-h-[50px] px-5 text-[15px] font-bold rounded-xl text-white disabled:opacity-60"
        style={{ background: "linear-gradient(135deg, var(--pa-amber-500), var(--pa-amber-600))" }}
      >
        {pending ? "Memproses…" : isFree ? "Daftar gratis" : "Daftar kelas"}
        {!pending && <Icon name="arrow_right" size={18} />}
      </button>
    </div>
  );
}

function renderField(
  f: RegField,
  value: string | string[] | undefined,
  setField: (key: string, value: string | string[]) => void,
  toggleMulti: (key: string, optValue: string) => void,
) {
  const inputCls =
    "w-full px-3.5 py-2.5 rounded-[10px] text-[14px] text-pg-ink-900 outline-none";
  const inputStyle = {
    background: "var(--pg-paper)",
    border: "1px solid var(--pg-ink-200)",
  };
  const opts = f.options ?? [];

  switch (f.type) {
    case "file":
      // File upload isn't supported at registration (pre-account, no storage
      // context). Documents are uploaded later in the portal.
      return (
        <div className="text-[12px] text-pg-ink-500 px-3 py-2.5 rounded-[10px]" style={inputStyle}>
          Dokumen diunggah nanti di aplikasi setelah daftar.
        </div>
      );
    case "textarea":
      return (
        <textarea
          rows={3}
          className={inputCls}
          style={inputStyle}
          value={(value as string) ?? ""}
          onChange={(e) => setField(f.key, e.target.value)}
        />
      );
    case "number":
      return (
        <input
          type="number"
          className={inputCls}
          style={inputStyle}
          value={(value as string) ?? ""}
          onChange={(e) => setField(f.key, e.target.value)}
        />
      );
    case "select":
      return (
        <select
          className={inputCls}
          style={inputStyle}
          value={(value as string) ?? ""}
          onChange={(e) => setField(f.key, e.target.value)}
        >
          <option value="">Pilih…</option>
          {opts.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      );
    case "radio":
      return (
        <div className="flex flex-col gap-1.5">
          {opts.map((o) => (
            <label key={o.value} className="flex items-center gap-2.5 text-[13.5px] text-pg-ink-700 cursor-pointer">
              <input
                type="radio"
                name={f.key}
                checked={value === o.value}
                onChange={() => setField(f.key, o.value)}
                className="w-4 h-4 accent-[var(--pa-amber-600)]"
              />
              {o.label}
            </label>
          ))}
        </div>
      );
    case "multiselect":
      return (
        <div className="flex flex-col gap-1.5">
          {opts.map((o) => {
            const arr = Array.isArray(value) ? value : [];
            return (
              <label key={o.value} className="flex items-center gap-2.5 text-[13.5px] text-pg-ink-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={arr.includes(o.value)}
                  onChange={() => toggleMulti(f.key, o.value)}
                  className="w-4 h-4 accent-[var(--pa-amber-600)]"
                />
                {o.label}
              </label>
            );
          })}
        </div>
      );
    default:
      return (
        <input
          type="text"
          className={inputCls}
          style={inputStyle}
          value={(value as string) ?? ""}
          onChange={(e) => setField(f.key, e.target.value)}
        />
      );
  }
}
