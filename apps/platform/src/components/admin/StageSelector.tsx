"use client";

import { useTransition, useState } from "react";
import { Icon } from "@/components/pg/Icon";
import { updateApplicationStage } from "@/app/(admin)/admin/actions";
import { PIPELINE_COLUMNS, stageLabel } from "@/lib/applicationStatus";

export default function StageSelector({
  applicationId,
  current,
}: {
  applicationId: string;
  current: string;
}) {
  const [pending, start] = useTransition();
  const [value, setValue] = useState(current);
  const [error, setError] = useState<string | null>(null);

  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value;
    setValue(next);
    setError(null);
    start(async () => {
      try {
        await updateApplicationStage(applicationId, next);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Update gagal");
        setValue(current);
      }
    });
  }

  return (
    <div>
      <select
        value={value}
        onChange={onChange}
        disabled={pending}
        aria-label="Ubah stage pipeline"
        className="w-full bg-pg-white border-[1.5px] border-pg-ink-200 rounded-lg px-3 py-2 text-sm font-semibold outline-none focus:border-pg-red-600 disabled:opacity-60"
      >
        {PIPELINE_COLUMNS.map((col) => (
          <optgroup key={col.key} label={col.label}>
            {col.stages.map((s) => (
              <option key={s} value={s}>
                {stageLabel(s)}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
      {pending && (
        <p className="mt-1 text-[11px] font-bold tracking-wide uppercase text-pg-ink-500">
          Menyimpan…
        </p>
      )}
      {error && (
        <p className="mt-1 text-[11px] flex items-center gap-1 text-pg-err">
          <Icon name="warn" size={12} /> {error}
        </p>
      )}
    </div>
  );
}
