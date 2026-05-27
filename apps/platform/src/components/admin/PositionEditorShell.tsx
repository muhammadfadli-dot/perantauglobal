"use client";

import { useEffect, useRef, useState } from "react";
import ContentEditor from "./ContentEditor";
import PositionPreview from "./PositionPreview";
import { type PositionContent } from "@/lib/position-content";
import { saveDraft } from "../../app/(admin)/admin/positions/actions";
import { Icon } from "@/components/pg/Icon";

const AUTOSAVE_DELAY_MS = 30_000;

/**
 * Client orchestrator wiring ContentEditor (left) ↔ PositionPreview (right).
 *
 * Phase 8c changes:
 *   - Save now writes to positions.draft_content via `saveDraft` (not the
 *     deprecated updatePositionContent alias).
 *   - Auto-save: 30-second debounce on edits. Each setContent resets the
 *     timer; when it fires, saveDraft is called.
 *   - Bridge to PublishBarMount: dispatches `pg-editor-state` window
 *     events with { dirty, saving, savedAt }. Listens for
 *     `pg-editor-save-now` (fired by PublishBar's "Simpan draft" button)
 *     to force an immediate save bypassing the debounce.
 */
export default function PositionEditorShell({
  slug,
  name,
  country,
  description,
  initialContent,
  initialFields,
}: {
  slug: string;
  name: string;
  country: string;
  description: string | null;
  initialContent: PositionContent;
  initialFields: Array<{
    field_key: string;
    field_label: string;
    field_help: string | null;
    field_type: string;
    importance: "required" | "optional";
    section: "syarat_utama" | "kualifikasi" | "screening";
  }>;
}) {
  const [content, setContent] = useState<PositionContent>(initialContent);
  const [savedSnapshot, setSavedSnapshot] = useState<PositionContent>(initialContent);
  const [viewport, setViewport] = useState<"desktop" | "mobile">("desktop");
  const [saving, setSaving] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isDirty = JSON.stringify(content) !== JSON.stringify(savedSnapshot);

  // Dispatch dirty/saving state to the PublishBar
  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("pg-editor-state", {
        detail: { dirty: isDirty, saving },
      }),
    );
  }, [isDirty, saving]);

  // Auto-save: every content change starts a 30s timer; if user stops typing,
  // saveDraft fires. We bypass the timer entirely on `pg-editor-save-now`.
  useEffect(() => {
    if (!isDirty || saving) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      void persistDraft(content);
    }, AUTOSAVE_DELAY_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- persistDraft is stable in scope
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
      // Notify PublishBar that a save just landed so it can flip its server-
      // mirror state immediately without waiting for router.refresh().
      const savedAt = new Date().toISOString();
      window.dispatchEvent(
        new CustomEvent("pg-editor-state", {
          detail: { dirty: false, saving: false, savedAt },
        }),
      );
    } catch (e) {
      console.error("[editor] auto-save failed:", e);
      // Leave dirty state intact so the user can retry. Could surface a
      // toast here in a future PR.
    } finally {
      setSaving(false);
    }
  }

  // The ContentEditor still supports an explicit save (existing UX). We bind
  // it to the same persistDraft path so the button behaves identically to
  // PublishBar's "Simpan draft".
  async function handleEditorSave(next: PositionContent) {
    await persistDraft(next);
  }

  return (
    <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-5">
      <ContentEditor initial={initialContent} onChange={setContent} onSave={handleEditorSave} />
      <div className="lg:sticky lg:top-4 lg:self-start">
        <div className="flex items-center justify-between mb-2 px-2">
          <div className="text-[10px] font-bold tracking-[0.12em] uppercase font-mono text-pg-ink-tertiary">
            Live preview {isDirty && <span className="text-pg-warn-soft-fg">· belum tersimpan</span>}
          </div>
          <div
            className="inline-flex rounded-lg overflow-hidden"
            style={{ border: "1px solid var(--pg-border)" }}
          >
            <button
              type="button"
              onClick={() => setViewport("desktop")}
              aria-pressed={viewport === "desktop"}
              className="px-2.5 py-1 text-[11px] font-bold"
              style={{
                background: viewport === "desktop" ? "var(--pg-ink-primary)" : "var(--pg-white)",
                color: viewport === "desktop" ? "white" : "var(--pg-ink-secondary)",
              }}
            >
              <Icon name="globe" size={11} stroke={2.4} /> Desktop
            </button>
            <button
              type="button"
              onClick={() => setViewport("mobile")}
              aria-pressed={viewport === "mobile"}
              className="px-2.5 py-1 text-[11px] font-bold"
              style={{
                background: viewport === "mobile" ? "var(--pg-ink-primary)" : "var(--pg-white)",
                color: viewport === "mobile" ? "white" : "var(--pg-ink-secondary)",
              }}
            >
              📱 Mobile
            </button>
          </div>
        </div>
        <PositionPreview
          name={name}
          country={country}
          description={description}
          content={content}
          fields={initialFields}
          viewport={viewport}
        />
      </div>
    </div>
  );
}
