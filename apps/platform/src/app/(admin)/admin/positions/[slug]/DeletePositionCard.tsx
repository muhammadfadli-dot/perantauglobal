"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/pg/Icon";
import { deletePosition } from "../actions";

/**
 * Danger-zone card at the bottom of /admin/positions/[slug]/page.tsx.
 * Two-step confirmation (button → type-slug-to-confirm → submit) protects
 * against accidental clicks. Pre-disabled when the position has linked
 * applications or job orders, with explanatory copy.
 */
export default function DeletePositionCard({
  slug,
  name,
  appCount,
  joCount,
}: {
  slug: string;
  name: string;
  appCount: number;
  joCount: number;
}) {
  const router = useRouter();
  const [stage, setStage] = useState<"idle" | "confirming">("idle");
  const [confirmInput, setConfirmInput] = useState("");
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const hasBlockers = appCount > 0 || joCount > 0;
  const slugConfirmed = confirmInput.trim() === slug;

  function startConfirm() {
    setStage("confirming");
    setConfirmInput("");
    setError(null);
  }

  function cancel() {
    setStage("idle");
    setConfirmInput("");
    setError(null);
  }

  function doDelete() {
    if (!slugConfirmed || hasBlockers) return;
    setError(null);
    start(async () => {
      try {
        await deletePosition(slug);
        router.push("/admin/positions");
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal hapus");
      }
    });
  }

  return (
    <section className="mt-10">
      <div className="text-[10px] font-bold tracking-[0.12em] uppercase font-mono text-pg-ink-tertiary mb-3">
        Danger zone
      </div>

      <div
        className="bg-pg-white rounded-2xl p-5"
        style={{ border: "1.5px solid var(--pg-red-200)" }}
      >
        {hasBlockers ? (
          <DisabledState
            slug={slug}
            name={name}
            appCount={appCount}
            joCount={joCount}
          />
        ) : stage === "idle" ? (
          <IdleState onStart={startConfirm} />
        ) : (
          <ConfirmingState
            slug={slug}
            name={name}
            confirmInput={confirmInput}
            onConfirmInputChange={setConfirmInput}
            onCancel={cancel}
            onConfirm={doDelete}
            pending={pending}
            canConfirm={slugConfirmed}
            error={error}
          />
        )}
      </div>
    </section>
  );
}

function IdleState({ onStart }: { onStart: () => void }) {
  return (
    <div className="flex items-start justify-between gap-4 flex-wrap">
      <div className="flex-1 min-w-0">
        <div className="text-[14px] font-extrabold text-pg-ink-primary">
          Hapus posisi ini permanen
        </div>
        <div className="text-[12.5px] text-pg-ink-tertiary mt-1 leading-relaxed max-w-2xl">
          Aksi ini ga bisa di-undo. Form pertanyaan, draft pending, dan konten
          landing page ikut kehapus.
          <br />
          Cuma boleh kalau belum ada lamaran atau job order yang nge-link ke
          posisi ini. Kalau masih ada, nonaktifkan aja (toggle Aktif di atas).
        </div>
      </div>
      <button
        type="button"
        onClick={onStart}
        className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[12.5px] font-bold"
        style={{
          border: "1.5px solid var(--pg-red-200)",
          background: "var(--pg-white)",
          color: "var(--pg-red-600)",
        }}
      >
        <Icon name="trash" size={12} stroke={2.4} />
        Hapus posisi…
      </button>
    </div>
  );
}

function DisabledState({
  slug,
  name,
  appCount,
  joCount,
}: {
  slug: string;
  name: string;
  appCount: number;
  joCount: number;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon name="info" size={16} className="shrink-0 mt-0.5 text-pg-ink-tertiary" />
      <div className="flex-1 min-w-0">
        <div className="text-[14px] font-extrabold text-pg-ink-primary">
          Posisi ini ga bisa di-hapus permanen
        </div>
        <div className="text-[12.5px] text-pg-ink-tertiary mt-1 leading-relaxed max-w-2xl">
          <span className="font-bold text-pg-ink-secondary">{name}</span>{" "}
          <span style={{ fontFamily: "var(--font-mono)" }}>({slug})</span> punya
          data yang ngeblok hapus:
          <ul className="mt-2 list-disc list-inside space-y-0.5">
            {appCount > 0 && (
              <li>
                <b>{appCount}</b> lamaran kandidat masih nge-link ke posisi ini
              </li>
            )}
            {joCount > 0 && (
              <li>
                <b>{joCount}</b> job order masih ngacu posisi ini
              </li>
            )}
          </ul>
          <div className="mt-2.5">
            Kalau mau ngumpetin posisi dari listing publik, pakai tombol{" "}
            <b>Nonaktifkan</b> di kartu meta di atas. Data tetap aman, tinggal
            ga muncul lagi di /lowongan.
          </div>
        </div>
      </div>
    </div>
  );
}

function ConfirmingState({
  slug,
  name,
  confirmInput,
  onConfirmInputChange,
  onCancel,
  onConfirm,
  pending,
  canConfirm,
  error,
}: {
  slug: string;
  name: string;
  confirmInput: string;
  onConfirmInputChange: (v: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
  pending: boolean;
  canConfirm: boolean;
  error: string | null;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div>
        <div className="text-[14px] font-extrabold text-pg-red-600">
          Yakin mau hapus {name}?
        </div>
        <div className="text-[12.5px] text-pg-ink-tertiary mt-1 leading-relaxed">
          Tindakan ini permanen + ga bisa di-undo. Form pertanyaan + konten
          landing page ikut kehapus.
        </div>
      </div>

      <label className="block">
        <div className="text-[12px] font-bold text-pg-ink-secondary mb-1.5">
          Untuk konfirmasi, ketik slug-nya:{" "}
          <span
            className="font-mono px-1.5 py-0.5 rounded"
            style={{
              background: "var(--pg-ink-50)",
              color: "var(--pg-ink-primary)",
              fontFamily: "var(--font-mono)",
            }}
          >
            {slug}
          </span>
        </div>
        <input
          type="text"
          value={confirmInput}
          onChange={(e) => onConfirmInputChange(e.target.value)}
          placeholder={slug}
          autoFocus
          className="w-full bg-pg-white border-[1.5px] border-pg-ink-200 rounded-lg px-3 py-2 text-[14px] text-pg-ink-primary placeholder:text-pg-ink-quaternary focus:border-pg-red-600 outline-none font-mono"
          style={{ fontFamily: "var(--font-mono)" }}
        />
      </label>

      {error && (
        <div
          className="px-3 py-2.5 rounded-lg text-[12px] flex items-start gap-2"
          style={{ background: "var(--pg-err-bg)", color: "var(--pg-err)" }}
        >
          <Icon name="warn" size={12} className="shrink-0 mt-0.5" /> {error}
        </div>
      )}

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onConfirm}
          disabled={!canConfirm || pending}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-bold text-white disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ background: "var(--pg-red-600)" }}
        >
          <Icon name="trash" size={12} stroke={2.4} />
          {pending ? "Menghapus…" : "Hapus permanen"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={pending}
          className="inline-flex items-center justify-center px-4 py-2 text-[13px] font-semibold text-pg-ink-secondary hover:bg-pg-ink-50 rounded-lg"
        >
          Batal
        </button>
      </div>
    </div>
  );
}
