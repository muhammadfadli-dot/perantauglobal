"use client";

import { useState, useTransition } from "react";
import { Icon } from "@/components/pg/Icon";
import { Button } from "@/components/pg/primitives";
import { updatePositionRequirements } from "../actions";

export default function RequirementsEditor({
  slug,
  initial,
}: {
  slug: string;
  initial: Record<string, unknown> | null;
}) {
  const [pending, start] = useTransition();
  const [text, setText] = useState(JSON.stringify(initial ?? {}, null, 2));
  const [saved, setSaved] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function save() {
    setError(null);
    start(async () => {
      try {
        await updatePositionRequirements(slug, text);
        setSaved(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal menyimpan");
      }
    });
  }

  function format() {
    try {
      const parsed = JSON.parse(text);
      setText(JSON.stringify(parsed, null, 2));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "JSON tidak valid");
    }
  }

  return (
    <div className="bg-pg-white border border-pg-ink-100 rounded-2xl overflow-hidden">
      <div className="px-5 py-3 border-b border-pg-ink-100 flex items-center justify-between gap-2">
        <div className="text-[12px] font-bold tracking-[0.12em] uppercase text-pg-ink-500">
          Requirements (JSON)
        </div>
        <button
          type="button"
          onClick={format}
          className="text-[11px] font-bold tracking-wide uppercase text-pg-ink-500 hover:text-pg-ink-900"
        >
          Format
        </button>
      </div>
      <textarea
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          setSaved(false);
        }}
        rows={14}
        spellCheck={false}
        className="w-full bg-pg-paper px-4 py-3 text-[13px] font-mono leading-[1.5] outline-none focus:bg-pg-white border-y border-pg-ink-100"
      />
      <div className="px-5 py-3 flex items-center justify-between gap-3 flex-wrap">
        <div className="text-[12px] text-pg-ink-500 leading-snug max-w-[40ch]">
          v3 schema:{" "}
          <code className="font-mono text-[11px]">
            {`{ key: { importance, label, category, evidence_mode, allowed_values?, value_labels?, document_type?, document_filter?, collect_at_stage?, description? } }`}
          </code>
        </div>
        <Button onClick={save} disabled={pending || saved} small>
          {pending ? "Menyimpan…" : saved ? (
            <>
              <Icon name="check" size={14} /> Tersimpan
            </>
          ) : "Simpan requirements"}
        </Button>
      </div>
      {error && (
        <div
          className="px-5 py-2 text-[12px] flex items-start gap-1.5 border-t border-pg-err-bg"
          style={{ background: "var(--pg-err-bg)", color: "var(--pg-err)" }}
        >
          <Icon name="warn" size={14} className="mt-0.5 shrink-0" /> {error}
        </div>
      )}
    </div>
  );
}
