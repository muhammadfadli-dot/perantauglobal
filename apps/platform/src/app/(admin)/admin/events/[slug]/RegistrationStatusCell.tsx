"use client";

import { useState, useTransition } from "react";
import { setRegistrationStatus } from "../actions";

const OPTIONS: { value: string; label: string }[] = [
  { value: "registered", label: "Terdaftar" },
  { value: "reminded", label: "Diingatkan" },
  { value: "attended", label: "Hadir" },
  { value: "no_show", label: "Tidak hadir" },
];

export default function RegistrationStatusCell({
  slug,
  id,
  value,
}: {
  slug: string;
  id: string;
  value: string;
}) {
  const [val, setVal] = useState(value);
  const [pending, startTransition] = useTransition();

  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value;
    const prev = val;
    setVal(next);
    startTransition(async () => {
      const res = await setRegistrationStatus(slug, id, next);
      if (!res.ok) {
        setVal(prev);
        alert(res.error ?? "Gagal mengubah status.");
      }
    });
  }

  return (
    <select
      value={val}
      onChange={onChange}
      disabled={pending}
      aria-label="Status pendaftar"
      className="text-[12px] font-semibold rounded-lg border border-pg-ink-200 bg-pg-white px-2 py-1 disabled:opacity-50"
    >
      {OPTIONS.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
