import { Icon } from "@/components/pg/Icon";

/**
 * Read-only summary card in the "Settings & publish" tab. Shows the live
 * version timestamp + whether a pending draft exists + a link to the public
 * page. The actual publish/discard actions live in the sticky PublishBar
 * at the bottom of the editor.
 *
 * Server component — no client interactivity. Stays in sync with router
 * refreshes triggered by PublishBarMount after publish/discard.
 */
export function PublishHistoryCard({
  slug,
  active,
  hasPendingDraft,
  draftSavedAt,
  publishedAt,
  lastRevalidatedAt,
}: {
  slug: string;
  active: boolean;
  hasPendingDraft: boolean;
  draftSavedAt: string | null;
  publishedAt: string | null;
  /** Fase 2.5: when apps/web ISR was last confirmed-busted for this position.
   * NULL = no successful revalidate recorded (or webhook not configured). */
  lastRevalidatedAt: string | null;
}) {
  const publicHref = `https://perantauglobal.com/lowongan/${slug}`;

  const webUpdatedLabel = lastRevalidatedAt
    ? new Date(lastRevalidatedAt).toLocaleString("id-ID", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Belum tercatat";

  const publishedLabel = publishedAt
    ? new Date(publishedAt).toLocaleString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Belum pernah dipublish";

  const draftLabel = !hasPendingDraft
    ? "Tidak ada — draft in sync dengan live"
    : draftSavedAt
      ? `Terakhir edit ${new Date(draftSavedAt).toLocaleString("id-ID", {
          day: "numeric",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
        })}`
      : "Ada draft pending";

  return (
    <div
      className="rounded-2xl p-5"
      style={{
        background: "var(--pg-white)",
        border: "1px solid var(--pg-border)",
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div>
          <div
            className="text-[11px] font-bold tracking-[0.12em] uppercase font-mono"
            style={{ color: "var(--pg-red-600)" }}
          >
            Publish state
          </div>
          <div className="text-[15px] font-extrabold leading-tight mt-1">
            Status posisi
          </div>
        </div>
        <a
          href={publicHref}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-[12px] font-bold no-underline"
          style={{ color: "var(--pg-red-600)" }}
        >
          <Icon name="arrow_right" size={12} stroke={2.4} />
          Lihat halaman live
        </a>
      </div>

      <dl
        className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[12.5px]"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        <Row
          dt="Live versi"
          ddIcon={
            <Icon
              name={publishedAt ? "globe" : "warn"}
              size={11}
              stroke={2.4}
            />
          }
          dd={publishedLabel}
          tone={publishedAt ? "ok" : "mute"}
        />
        <Row
          dt="Draft pending"
          ddIcon={
            <Icon
              name={hasPendingDraft ? "doc_check" : "check"}
              size={11}
              stroke={2.4}
            />
          }
          dd={draftLabel}
          tone={hasPendingDraft ? "warn" : "ok"}
        />
        <Row
          dt="Visibility"
          ddIcon={<Icon name={active ? "globe" : "warn"} size={11} stroke={2.4} />}
          dd={
            active
              ? "Aktif — muncul di /lowongan publik"
              : "Disembunyikan — tidak muncul di /lowongan"
          }
          tone={active ? "ok" : "mute"}
        />
        <Row
          dt="Web ter-update"
          ddIcon={<Icon name={lastRevalidatedAt ? "check" : "clock"} size={11} stroke={2.4} />}
          dd={webUpdatedLabel}
          tone={lastRevalidatedAt ? "ok" : "mute"}
        />
        <Row
          dt="URL publik"
          dd={`/lowongan/${slug}`}
          tone="mute"
        />
      </dl>

      <div
        className="mt-4 pt-3 text-[11.5px] leading-[16px]"
        style={{
          color: "var(--pg-ink-tertiary)",
          borderTop: "1px solid var(--pg-border-soft)",
        }}
      >
        Action publish / discard ada di bar bawah halaman. Tab ini buat
        review state + edit metadata.
      </div>
    </div>
  );
}

function Row({
  dt,
  dd,
  ddIcon,
  tone,
}: {
  dt: string;
  dd: string;
  ddIcon?: React.ReactNode;
  tone: "ok" | "warn" | "mute";
}) {
  const color =
    tone === "ok"
      ? "var(--pg-ok)"
      : tone === "warn"
        ? "var(--pg-warn-soft-fg)"
        : "var(--pg-ink-700)";
  return (
    <div className="flex flex-col gap-0.5">
      <dt
        className="text-[10px] font-bold tracking-[0.1em] uppercase"
        style={{ color: "var(--pg-ink-tertiary)" }}
      >
        {dt}
      </dt>
      <dd
        className="flex items-center gap-1.5 m-0"
        style={{ color, fontWeight: 600 }}
      >
        {ddIcon}
        {dd}
      </dd>
    </div>
  );
}
