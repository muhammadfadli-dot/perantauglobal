"use client";

import { useRouter } from "next/navigation";

export default function ApplicationFilters({
  positions,
  stages,
  initialStage,
  initialPosition,
}: {
  positions: Array<{ slug: string; name: string; country: string }>;
  stages: string[];
  initialStage: string;
  initialPosition: string;
}) {
  const router = useRouter();

  function apply(overrides: { stage?: string; position?: string }) {
    const sp = new URLSearchParams();
    const stage = overrides.stage ?? initialStage;
    const position = overrides.position ?? initialPosition;
    if (stage) sp.set("stage", stage);
    if (position) sp.set("position", position);
    const qs = sp.toString();
    router.push(`/admin/applications${qs ? `?${qs}` : ""}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <select
        value={initialStage}
        onChange={(e) => apply({ stage: e.target.value })}
        className="border border-[var(--color-dtg-ink)]/20 bg-white px-3 py-2 text-sm outline-none focus:border-[var(--color-dtg-red)]"
      >
        <option value="">Semua stage</option>
        {stages.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>

      <select
        value={initialPosition}
        onChange={(e) => apply({ position: e.target.value })}
        className="border border-[var(--color-dtg-ink)]/20 bg-white px-3 py-2 text-sm outline-none focus:border-[var(--color-dtg-red)]"
      >
        <option value="">Semua posisi</option>
        {positions.map((p) => (
          <option key={p.slug} value={p.slug}>
            {p.name}
          </option>
        ))}
      </select>

      {(initialStage || initialPosition) && (
        <button
          type="button"
          onClick={() => router.push("/admin/applications")}
          className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.1em] opacity-60 hover:opacity-100"
        >
          Reset
        </button>
      )}
    </div>
  );
}
