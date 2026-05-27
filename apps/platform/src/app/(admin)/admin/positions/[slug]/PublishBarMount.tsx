"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { PublishBar } from "@/components/admin/PublishBar";
import { publishPosition, discardDraft } from "../actions";

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
}: {
  slug: string;
  positionName: string;
  hasPendingDraft: boolean;
  draftSavedAt: string | null;
  publishedAt: string | null;
}) {
  const router = useRouter();
  const [clientDirty, setClientDirty] = useState(false);
  const [clientSaving, setClientSaving] = useState(false);

  // Local mirror of server state — flips immediately on save/publish so the
  // bar doesn't lag the router refresh. router.refresh() will reconcile.
  const [hasPendingDraft, setHasPendingDraft] = useState(initialHasPendingDraft);
  const [draftSavedAt, setDraftSavedAt] = useState(initialDraftSavedAt);

  const [busyAction, setBusyAction] = useState<"save" | "publish" | "discard" | null>(
    null,
  );
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

  async function handlePublish() {
    if (busyAction) return;
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

  const publicHref = `https://perantauglobal.com/lowongan/${slug}`;

  return (
    <PublishBar
      dirty={clientDirty}
      saving={clientSaving}
      hasPendingDraft={hasPendingDraft}
      draftSavedAt={draftSavedAt}
      publishedAt={publishedAt}
      positionName={positionName}
      publicHref={publicHref}
      busyAction={busyAction}
      onSaveDraft={handleSaveDraft}
      onPublish={handlePublish}
      onDiscard={handleDiscard}
    />
  );
}
