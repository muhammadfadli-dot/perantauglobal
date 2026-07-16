"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { PublishBar } from "@/components/admin/PublishBar";
import { publishPosition, discardDraft, createPreviewLink } from "../actions";

/**
 * Client wrapper that mounts PublishBar (the sticky-bottom publish/unpublish
 * bar) and binds it to the new draft/publish server actions.
 *
 * Editor state bridge:
 *   PositionEditorShell dispatches `pg-editor-state` window events as the
 *   user types + during auto-save. PublishBarMount listens and reflects
 *   that in PublishBar's dirty/saving state. Server-driven props
 *   (hasPendingDraft, draftSavedAt, publishedAt) come from the page.
 */
export default function PublishBarMount({
  slug,
  positionName,
  hasPendingDraft: initialHasPendingDraft,
  draftSavedAt: initialDraftSavedAt,
  publishedAt,
  publishBlockers,
}: {
  slug: string;
  positionName: string;
  hasPendingDraft: boolean;
  draftSavedAt: string | null;
  publishedAt: string | null;
  /** Fase 2.1: unmet blocking readiness items (card won't show / screens nobody).
   * Non-empty triggers an explicit confirm before publish. */
  publishBlockers: string[];
}) {
  const router = useRouter();
  const [clientDirty, setClientDirty] = useState(false);
  const [clientSaving, setClientSaving] = useState(false);

  // Local mirror of server state — flips immediately on save/publish so the
  // bar doesn't lag the router refresh. router.refresh() will reconcile.
  const [hasPendingDraft, setHasPendingDraft] = useState(initialHasPendingDraft);
  const [draftSavedAt, setDraftSavedAt] = useState(initialDraftSavedAt);

  const [busyAction, setBusyAction] = useState<
    "save" | "publish" | "discard" | "preview" | null
  >(null);
  const [, startTransition] = useTransition();

  // Listen for editor state changes (dirty / saving / saved)
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as {
        dirty?: boolean;
        saving?: boolean;
        savedAt?: string | null;
      };
      if (detail.dirty !== undefined) setClientDirty(detail.dirty);
      if (detail.saving !== undefined) setClientSaving(detail.saving);
      // When editor reports a successful save, flip the local mirror so the
      // bar shows "Draft tersimpan baru saja" immediately, then trigger a
      // router refresh for the server reconciliation.
      if (detail.savedAt) {
        setHasPendingDraft(true);
        setDraftSavedAt(detail.savedAt);
        startTransition(() => router.refresh());
      }
    };
    window.addEventListener("pg-editor-state", handler);
    return () => window.removeEventListener("pg-editor-state", handler);
  }, [router]);

  async function handlePreview() {
    if (busyAction) return;
    // Open the tab BEFORE awaiting: a window.open() that happens after an await
    // is no longer tied to the click, which is exactly what popup blockers stop.
    const tab = window.open("", "_blank");
    setBusyAction("preview");
    try {
      const result = await createPreviewLink(slug);
      if (!result.ok) {
        tab?.close();
        alert(result.error);
        return;
      }
      // Fall back to the current tab if the popup was blocked anyway, so the
      // click never silently does nothing.
      if (tab) tab.location.href = result.url;
      else window.location.href = result.url;
    } catch {
      tab?.close();
      alert("Gagal bikin link preview. Coba reload halaman.");
    } finally {
      setBusyAction(null);
    }
  }

  async function handlePublish() {
    if (busyAction) return;
    // Fase 2.1 - publishing with an unmet blocking item (card won't show in the
    // listing, or the position screens nobody) is allowed, but only as a
    // conscious choice with the consequence spelled out.
    if (publishBlockers.length > 0) {
      const proceed = window.confirm(
        "Posisi ini mau dipublish, tapi ada yang belum beres:\n\n" +
          publishBlockers.map((b) => `• ${b}`).join("\n") +
          "\n\nKalau tetap publish, posisi bisa tidak tampil di listing publik " +
          "atau meloloskan semua pelamar. Lanjut publish?",
      );
      if (!proceed) return;
    }
    setBusyAction("publish");
    try {
      const result = await publishPosition(slug);
      if (!result.ok) {
        // Expected user-facing failure (e.g. no draft to publish). Server
        // returns the friendly Indonesian copy as data; we'd have lost it
        // through Next.js production sanitization if it had been thrown.
        alert(result.error);
        return;
      }
      setHasPendingDraft(false);
      setDraftSavedAt(null);
      startTransition(() => router.refresh());
    } catch (e) {
      // Unexpected throw (auth failure, DB outage). Production strips the
      // real message — show a generic note + suggest reload.
      alert(
        e instanceof Error
          ? e.message
          : "Gagal publish. Coba reload halaman & ulangi.",
      );
    } finally {
      setBusyAction(null);
    }
  }

  async function handleDiscard() {
    if (busyAction) return;
    const ok = window.confirm(
      "Discard draft? Perubahan yang belum dipublish akan hilang. Live tetap utuh.",
    );
    if (!ok) return;
    setBusyAction("discard");
    try {
      const result = await discardDraft(slug);
      if (!result.ok) {
        alert(result.error);
        return;
      }
      setHasPendingDraft(false);
      setDraftSavedAt(null);
      startTransition(() => router.refresh());
    } catch (e) {
      alert(
        e instanceof Error
          ? e.message
          : "Gagal discard. Coba reload halaman & ulangi.",
      );
    } finally {
      setBusyAction(null);
    }
  }

  function handleSaveDraft() {
    // Trigger explicit save in the editor (bypass debounce). Editor listens
    // for `pg-editor-save-now` and calls saveDraft inline. After save, it
    // will dispatch `pg-editor-state` with savedAt populated, which we
    // capture above.
    window.dispatchEvent(new CustomEvent("pg-editor-save-now"));
  }

  return (
    <PublishBar
      dirty={clientDirty}
      saving={clientSaving}
      hasPendingDraft={hasPendingDraft}
      draftSavedAt={draftSavedAt}
      publishedAt={publishedAt}
      positionName={positionName}
      busyAction={busyAction}
      onSaveDraft={handleSaveDraft}
      onPublish={handlePublish}
      onDiscard={handleDiscard}
      onPreview={handlePreview}
    />
  );
}
