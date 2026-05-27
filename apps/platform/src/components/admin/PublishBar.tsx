"use client";

import { useState } from "react";
import { Icon } from "@/components/pg/Icon";

/**
 * PublishBar — sticky bottom action bar for the admin Position Editor.
 *
 * Portal v2 design: shows current live/draft state prominently + Publish/
 * Unpublish CTA. Replaces the previous toggle-button-inside-meta-card pattern
 * with a persistent action bar always visible at editor bottom.
 *
 * Phase 6a: visual scaffold. Wires up to the existing
 * `updatePositionMeta({ active })` server action (passed in via prop).
 */
export function PublishBar({
  initialActive,
  positionName,
  lastUpdatedAt,
  onToggle,
}: {
  initialActive: boolean;
  positionName: string;
  lastUpdatedAt?: string | null;
  /** Server action invoked when admin clicks Publish/Unpublish. */
  onToggle: (next: boolean) => Promise<void>;
}) {
  const [active, setActive] = useState(initialActive);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const handleToggle = async () => {
    if (busy) return;
    const next = !active;
    setBusy(true);
    setErr(null);
    try {
      await onToggle(next);
      setActive(next);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Gagal — coba lagi.");
    } finally {
      setBusy(false);
    }
  };

  const lastUpdatedLabel = lastUpdatedAt
    ? new Date(lastUpdatedAt).toLocaleString("id-ID", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <div
      className="sticky bottom-0 z-30 px-5 py-3 border-t"
      style={{
        background: "rgba(255,255,255,0.96)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        borderColor: "var(--pg-ink-100)",
      }}
    >
      <div className="flex items-center gap-4 max-w-6xl mx-auto">
        {/* Status indicator */}
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <span
            aria-hidden
            className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
            style={{
              background: active ? "var(--pg-ok)" : "var(--pg-ink-400)",
              boxShadow: active ? "0 0 0 4px rgba(15,138,74,0.15)" : undefined,
            }}
          />
          <div className="flex flex-col min-w-0">
            <span className="text-[13px] font-extrabold tracking-[-0.01em] text-pg-ink-900">
              {active ? "Live di catalog publik" : "Disimpan sebagai draft"}
            </span>
            <span className="font-mono text-[10.5px] text-pg-ink-500 tracking-[0.04em] truncate">
              {positionName}
              {lastUpdatedLabel && (
                <span> · Update terakhir {lastUpdatedLabel}</span>
              )}
            </span>
          </div>
        </div>

        {err && (
          <span
            className="font-mono text-[10.5px] font-bold uppercase tracking-[0.06em] text-pg-err shrink-0 max-w-[200px] truncate"
            title={err}
          >
            ⚠ {err}
          </span>
        )}

        {/* Toggle button */}
        <button
          type="button"
          onClick={handleToggle}
          disabled={busy}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[10px] font-extrabold text-[13px] no-underline transition-colors shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
          style={
            active
              ? {
                  background: "var(--pg-white)",
                  color: "var(--pg-ink-900)",
                  border: "1.5px solid var(--pg-ink-200)",
                }
              : {
                  background: "var(--pg-red-600)",
                  color: "#fff",
                  boxShadow: "0 4px 12px rgba(215,38,47,0.20)",
                }
          }
        >
          {busy ? (
            <span className="font-mono text-[12px]">Memproses…</span>
          ) : active ? (
            <>
              <Icon name="eye_off" size={14} stroke={2.4} />
              Nonaktifkan
            </>
          ) : (
            <>
              <Icon name="check" size={14} stroke={2.8} />
              Publish ke live
            </>
          )}
        </button>
      </div>
    </div>
  );
}
