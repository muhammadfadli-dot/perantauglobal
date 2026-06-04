"use client";

import { Icon } from "@/components/pg/Icon";

/**
 * PublishBar v2 — sticky bottom action bar for the admin Position Editor.
 *
 * Matches design C (Position Editor — Variation C, the final direction).
 *
 * Three states, in priority order:
 *   1. CLIENT-DIRTY: admin has unsaved local edits. Yellow warn + "Ada
 *      perubahan belum tersimpan · auto-save 30 dtk".
 *   2. SERVER-DRAFT: server has a saved draft that's not yet published. Green
 *      check + "Draft tersimpan {relative} · live versi {date}".
 *   3. CLEAN (default): no draft, no local edits. Subtle info + "Live versi
 *      {date}".
 *
 * Four actions on the right:
 *   - Riwayat (history) — optional (passes onRiwayat to enable)
 *   - Preview tab baru — opens /lowongan/{slug} in new tab
 *   - Simpan draft — manual save (skips debounce)
 *   - Publish ke live — promote draft to live (primary CTA)
 *
 * State is server-driven: hasPendingDraft, draftSavedAt, publishedAt come
 * from positions table. Client dirty state is signaled via window event
 * `pg-editor-state` dispatched by PositionEditorShell when local content
 * diverges from the saved snapshot.
 */
export function PublishBar({
  dirty,
  saving,
  hasPendingDraft,
  draftSavedAt,
  publishedAt,
  positionName,
  publicHref,
  busyAction,
  onSaveDraft,
  onPublish,
  onDiscard,
  onRiwayat,
}: {
  /** True while admin is actively editing (client-side, before auto-save fires) */
  dirty: boolean;
  /** True while saveDraft or publishPosition is in flight */
  saving: boolean;
  /** Server state: does positions.draft_content exist? */
  hasPendingDraft: boolean;
  /** Server state: when draft was last saved (positions.updated_at while draft exists). ISO string. */
  draftSavedAt: string | null;
  /** Server state: when content was last promoted to live. ISO string. */
  publishedAt: string | null;
  positionName: string;
  /** Public URL for "Preview tab baru" button (apps/web /lowongan/[slug]) */
  publicHref: string;
  /** Which action is currently busy (so the corresponding button shows spinner) */
  busyAction: "save" | "publish" | "discard" | null;
  onSaveDraft: () => void;
  onPublish: () => void;
  onDiscard?: () => void;
  onRiwayat?: () => void;
}) {
  const statusContent = (() => {
    if (saving || busyAction === "save") {
      return (
        <>
          <Icon name="clock" size={14} stroke={2.4} className="text-pg-info" />
          <span className="font-bold text-pg-info">Menyimpan draft…</span>
        </>
      );
    }
    if (dirty) {
      return (
        <>
          <span style={{ color: "var(--pg-warn-soft-fg)", display: "inline-flex" }}>
            <Icon name="warn" size={14} stroke={2.4} />
          </span>
          <span style={{ fontWeight: 700, color: "var(--pg-warn-soft-fg)" }}>
            Ada perubahan belum tersimpan
          </span>
          <span style={{ color: "var(--pg-ink-500)" }}>· auto-save 30 dtk</span>
        </>
      );
    }
    if (hasPendingDraft) {
      return (
        <>
          <span style={{ color: "var(--pg-ok)", display: "inline-flex" }}>
            <Icon name="check" size={14} stroke={2.8} />
          </span>
          <span style={{ color: "var(--pg-ink-700)", fontWeight: 600 }}>
            Draft tersimpan {formatRelative(draftSavedAt)}
          </span>
          {publishedAt && (
            <span style={{ color: "var(--pg-ink-500)" }}>
              · live versi {formatShortDate(publishedAt)}
            </span>
          )}
        </>
      );
    }
    return (
      <>
        <span style={{ color: "var(--pg-ink-500)", display: "inline-flex" }}>
          <Icon name="globe" size={14} stroke={2.4} />
        </span>
        <span style={{ color: "var(--pg-ink-700)", fontWeight: 600 }}>
          Live versi {publishedAt ? formatShortDate(publishedAt) : "—"}
        </span>
        <span style={{ color: "var(--pg-ink-500)" }}>· draft sinkron</span>
      </>
    );
  })();

  const canPublish = hasPendingDraft && !dirty && busyAction == null;
  const canSave = (dirty || hasPendingDraft) && busyAction == null;
  const canDiscard = hasPendingDraft && busyAction == null;

  return (
    <div
      className="sticky bottom-3 z-30 mx-auto max-w-[1400px] px-4 mb-3"
      style={{ pointerEvents: "none" }}
    >
      <div
        className="rounded-2xl border flex items-center gap-3 px-4 py-2.5"
        style={{
          pointerEvents: "auto",
          background: "rgba(255,255,255,0.97)",
          backdropFilter: "saturate(140%) blur(10px)",
          WebkitBackdropFilter: "saturate(140%) blur(10px)",
          borderColor: "var(--pg-ink-100)",
          boxShadow:
            "0 1px 2px rgba(20,16,12,0.04), 0 18px 40px -16px rgba(20,16,12,0.18)",
        }}
        aria-label={`PublishBar untuk ${positionName}`}
      >
        {/* Status */}
        <div
          className="flex items-center gap-2 flex-1 min-w-0 text-[12.5px] truncate"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {statusContent}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          {onRiwayat && (
            <BarButton onClick={onRiwayat} variant="ghost" icon="clock">
              Riwayat
            </BarButton>
          )}
          <a
            href={publicHref}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12.5px] font-semibold no-underline transition-colors"
            style={{
              color: "var(--pg-ink-secondary)",
              background: "transparent",
            }}
          >
            <Icon name="arrow_right" size={12} stroke={2.2} />
            Preview tab baru
          </a>
          {canDiscard && onDiscard && (
            <BarButton
              onClick={onDiscard}
              variant="ghost"
              busy={busyAction === "discard"}
              icon="trash"
            >
              Discard
            </BarButton>
          )}
          <BarButton
            onClick={onSaveDraft}
            variant="ghost"
            disabled={!canSave}
            busy={busyAction === "save"}
            icon="doc_check"
          >
            Simpan draft
          </BarButton>
          <BarButton
            onClick={onPublish}
            variant="primary"
            disabled={!canPublish}
            busy={busyAction === "publish"}
            icon="check"
          >
            Publish ke live
          </BarButton>
        </div>
      </div>
    </div>
  );
}

// ─── Sub: bar button ─────────────────────────────────────────────────────

function BarButton({
  children,
  onClick,
  variant,
  icon,
  disabled,
  busy,
}: {
  children: React.ReactNode;
  onClick: () => void;
  variant: "primary" | "ghost";
  icon?: Parameters<typeof Icon>[0]["name"];
  disabled?: boolean;
  busy?: boolean;
}) {
  const isPrimary = variant === "primary";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || busy}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12.5px] font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      style={
        isPrimary
          ? {
              background: "var(--pg-red-600)",
              color: "#fff",
              boxShadow: disabled || busy ? "none" : "0 4px 10px rgba(215,38,47,0.18)",
            }
          : {
              background: "transparent",
              color: "var(--pg-ink-secondary)",
            }
      }
    >
      {busy ? (
        <Icon name="clock" size={12} stroke={2.4} />
      ) : icon ? (
        <Icon name={icon} size={12} stroke={2.4} />
      ) : null}
      {children}
    </button>
  );
}

// ─── Date formatting helpers ─────────────────────────────────────────────

function formatRelative(iso: string | null): string {
  if (!iso) return "—";
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diffMin = Math.round((now - then) / 60_000);
  if (diffMin < 1) return "baru saja";
  if (diffMin < 60) return `${diffMin} menit lalu`;
  const diffH = Math.round(diffMin / 60);
  if (diffH < 24) return `${diffH} jam lalu`;
  const diffD = Math.round(diffH / 24);
  if (diffD < 30) return `${diffD} hari lalu`;
  return formatShortDate(iso);
}

function formatShortDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
  });
}
