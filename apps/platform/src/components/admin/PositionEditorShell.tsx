"use client";

import { useEffect, useRef, useState } from "react";
import ContentEditor from "./ContentEditor";
import { type PositionContent } from "@/lib/position-content";
import { saveDraft } from "../../app/(admin)/admin/positions/actions";

const AUTOSAVE_DELAY_MS = 30_000;

/**
 * Client orchestrator for the Konten tab. Phase 8f drops the side-by-side
 * PositionPreview in favor of the design-C overlay flow (preview lives
 * only in PreviewOverlay, triggered by PreviewToggleStrip above PublishBar).
 *
 * Responsibilities:
 *   - Single source of truth for editor content (state lives here, ContentEditor
 *     calls onChange / onSave callbacks)
 *   - 30s debounced auto-save (saveDraft writes to positions.draft_content)
 *   - Bridge to PublishBar / MediaSeoTab / PreviewOverlay via `pg-editor-state`
 *     window events with {dirty, saving, savedAt, content}
 *   - Listens for `pg-editor-save-now` (PublishBar's "Simpan draft" button)
 *     to force an immediate save bypassing the debounce
 */
export default function PositionEditorShell({
  slug,
  initialContent,
}: {
  slug: string;
  initialContent: PositionContent;
}) {
  const [content, setContent] = useState<PositionContent>(initialContent);
  const [savedSnapshot, setSavedSnapshot] = useState<PositionContent>(initialContent);
  const [saving, setSaving] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isDirty = JSON.stringify(content) !== JSON.stringify(savedSnapshot);

  // Dispatch dirty/saving state + latest content to PublishBar + MediaSeoTab + PreviewOverlay.
  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("pg-editor-state", {
        detail: { dirty: isDirty, saving, content },
      }),
    );
  }, [isDirty, saving, content]);

  // Auto-save: every content change starts a 30s timer; if user stops typing,
  // saveDraft fires. Explicit save-now bypasses entirely.
  useEffect(() => {
    if (!isDirty || saving) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      void persistDraft(content);
    }, AUTOSAVE_DELAY_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- persistDraft stable in scope
  }, [content, isDirty, saving]);

  // Listen for explicit "save now" from PublishBar
  useEffect(() => {
    const handler = () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      void persistDraft(content);
    };
    window.addEventListener("pg-editor-save-now", handler);
    return () => window.removeEventListener("pg-editor-save-now", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- handler captures current content via closure
  }, [content]);

  async function persistDraft(next: PositionContent) {
    if (saving) return;
    setSaving(true);
    try {
      await saveDraft(slug, next);
      setSavedSnapshot(next);
      const savedAt = new Date().toISOString();
      window.dispatchEvent(
        new CustomEvent("pg-editor-state", {
          detail: { dirty: false, saving: false, savedAt, content: next },
        }),
      );
    } catch (e) {
      console.error("[editor] auto-save failed:", e);
    } finally {
      setSaving(false);
    }
  }

  async function handleEditorSave(next: PositionContent) {
    await persistDraft(next);
  }

  return (
    <div className="max-w-4xl">
      <ContentEditor initial={initialContent} onChange={setContent} onSave={handleEditorSave} />
    </div>
  );
}
