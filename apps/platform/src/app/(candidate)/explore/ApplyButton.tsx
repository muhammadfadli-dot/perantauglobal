"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { applyToPosition } from "./actions";

interface Props {
  positionSlug: string;
  hardPass: boolean;
}

export default function ApplyButton({ positionSlug, hardPass }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    setError(null);
    startTransition(async () => {
      const result = await applyToPosition(positionSlug);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.push(`/applications/${result.applicationId}`);
    });
  }

  return (
    <div className="mt-4 flex flex-col gap-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        className={`w-full px-4 py-3 text-sm font-semibold transition disabled:opacity-50 ${
          hardPass
            ? "bg-[var(--color-dtg-ink)] text-white hover:opacity-90"
            : "border border-[var(--color-dtg-ink)] text-[var(--color-dtg-ink)] hover:bg-[var(--color-dtg-ink)] hover:text-white"
        }`}
      >
        {isPending
          ? "Mendaftar..."
          : hardPass
            ? "Lamar posisi ini →"
            : "Lamar (syarat belum lengkap)"}
      </button>
      {error && (
        <p className="text-xs text-red-700">Gagal: {error}</p>
      )}
    </div>
  );
}
