"use client";

import { useState, useTransition } from "react";
import { Icon } from "@/components/pg/Icon";
import { Button } from "@/components/pg/primitives";
import type { PositionContent } from "@/lib/position-content";

/**
 * Edits positions.content JSONB. Renders all sections (hero, jobDescription,
 * details, benefits, qualifications, fee, process, trustSignals) inline —
 * no modals, no accordion games. Admin scrolls top to bottom, makes changes,
 * clicks Save at the bottom (sticky save bar).
 *
 * State is fully client-side until the user clicks Save. Then a server
 * action persists the entire content blob (idempotent UPDATE).
 *
 * `onChange` is called on every edit so the parent can pipe the working copy
 * to a live preview component without round-tripping the server.
 */
export default function ContentEditor({
  initial,
  onChange,
  onSave,
}: {
  initial: PositionContent;
  onChange?: (next: PositionContent) => void;
  onSave: (next: PositionContent) => Promise<void>;
}) {
  const [content, setContent] = useState<PositionContent>(initial);
  const [pending, start] = useTransition();
  const [savedSnapshot, setSavedSnapshot] = useState(initial);
  const [error, setError] = useState<string | null>(null);

  function patch(next: PositionContent) {
    setContent(next);
    onChange?.(next);
  }

  function save() {
    setError(null);
    start(async () => {
      try {
        await onSave(content);
        setSavedSnapshot(content);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal menyimpan");
      }
    });
  }

  const isDirty = JSON.stringify(content) !== JSON.stringify(savedSnapshot);

  return (
    <div className="grid gap-4">
      <SectionCard title="Hero" hint="Garis info di header (gaji + kontrak).">
        <input
          type="text"
          value={content.hero?.metaLine ?? ""}
          onChange={(e) => patch({ ...content, hero: { metaLine: e.target.value } })}
          placeholder="SAR 3.200/bulan · Kontrak 2 tahun"
          className={INPUT_CLASS}
        />
      </SectionCard>

      <SectionCard
        title="Deskripsi pekerjaan"
        hint="Bullet apa yang dilakukan candidate sehari-hari."
      >
        <StringListEditor
          items={content.jobDescription ?? []}
          onChange={(items) => patch({ ...content, jobDescription: items })}
          placeholder="Mis. Menyiapkan dan meracik berbagai jenis minuman"
        />
      </SectionCard>

      <SectionCard
        title="Detail posisi"
        hint="Tabel label–value: lokasi, jam kerja, hari libur, dll."
      >
        <PairListEditor
          items={content.details ?? []}
          onChange={(items) => patch({ ...content, details: items })}
          labelPlaceholder="Lokasi"
          valuePlaceholder="Saudi Arabia"
        />
      </SectionCard>

      <SectionCard
        title="Benefits"
        hint="Card icon + label + value. Icon pakai nama dari pg/Icon."
      >
        <BenefitListEditor
          items={content.benefits ?? []}
          onChange={(items) => patch({ ...content, benefits: items })}
        />
      </SectionCard>

      <SectionCard
        title="Kualifikasi (narasi)"
        hint="Bullet kualifikasi yang ditampilkan di landing page (display only — tidak divalidasi)."
      >
        <StringListEditor
          items={content.qualifications ?? []}
          onChange={(items) => patch({ ...content, qualifications: items })}
          placeholder="Mis. Wanita, 21–38 tahun"
        />
      </SectionCard>

      <SectionCard title="Biaya keberangkatan" hint="Optional. Kosongkan jika tidak ada biaya.">
        <FeeEditor
          fee={content.fee}
          onChange={(fee) => patch({ ...content, fee })}
        />
      </SectionCard>

      <SectionCard title="Proses" hint="Step-step proses (numbered display).">
        <StringListEditor
          items={content.process ?? []}
          onChange={(items) => patch({ ...content, process: items })}
          placeholder="Mis. Daftar"
        />
      </SectionCard>

      <SectionCard
        title="Trust signals"
        hint="PIC + employer info untuk trust building. Opsional tapi sangat dianjurkan."
      >
        <TrustSignalsEditor
          trustSignals={content.trustSignals}
          onChange={(trustSignals) => patch({ ...content, trustSignals })}
        />
      </SectionCard>

      {/* Sticky save bar */}
      <div
        className="sticky bottom-4 z-20 px-4 py-3 rounded-2xl flex items-center justify-between gap-3 bg-pg-white"
        style={{
          border: "1px solid var(--pg-border)",
          boxShadow: "0 6px 20px rgba(20,20,20,0.08)",
        }}
      >
        <div className="text-[12px] font-semibold flex items-center gap-1.5">
          {isDirty ? (
            <span className="text-pg-warn-soft-fg">
              <Icon name="warn" size={14} stroke={2} /> Ada perubahan belum tersimpan
            </span>
          ) : (
            <span className="text-pg-ok-soft-fg">
              <Icon name="check" size={14} stroke={2} /> Semua tersimpan
            </span>
          )}
          {error && <span className="text-pg-red-600 ml-2">{error}</span>}
        </div>
        <Button onClick={save} disabled={!isDirty || pending} small>
          {pending ? "Menyimpan…" : "Simpan konten"}
        </Button>
      </div>
    </div>
  );
}

// ─── Section card wrapper ──────────────────────────────────────────────────

function SectionCard({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="bg-pg-white rounded-2xl p-5"
      style={{ border: "1px solid var(--pg-border)" }}
    >
      <div className="text-[14px] font-bold text-pg-ink-primary">{title}</div>
      {hint && <div className="text-[12px] text-pg-ink-tertiary mt-0.5 leading-snug">{hint}</div>}
      <div className="mt-3.5">{children}</div>
    </div>
  );
}

// ─── String list editor (jobDescription, qualifications, process) ──────────

function StringListEditor({
  items,
  onChange,
  placeholder,
}: {
  items: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
}) {
  return (
    <div className="grid gap-2">
      {items.map((s, idx) => (
        <div key={idx} className="flex gap-2 items-start">
          <span
            className="w-6 h-9 grid place-items-center text-[11px] font-bold shrink-0"
            style={{ color: "var(--pg-ink-tertiary)", fontFamily: "var(--font-mono)" }}
          >
            {idx + 1}.
          </span>
          <input
            type="text"
            value={s}
            onChange={(e) => onChange(items.map((v, i) => (i === idx ? e.target.value : v)))}
            placeholder={placeholder}
            className={`${INPUT_CLASS} flex-1`}
          />
          <ReorderButtons
            disabled={items.length < 2}
            isFirst={idx === 0}
            isLast={idx === items.length - 1}
            onUp={() => onChange(swap(items, idx, idx - 1))}
            onDown={() => onChange(swap(items, idx, idx + 1))}
          />
          <DeleteButton onClick={() => onChange(items.filter((_, i) => i !== idx))} />
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...items, ""])}
        className="self-start inline-flex items-center gap-1.5 px-3 py-2 text-[12px] font-bold rounded-lg text-pg-ink-secondary"
        style={{ border: "1.5px dashed var(--pg-border)" }}
      >
        <Icon name="plus" size={12} stroke={2.4} /> Tambah baris
      </button>
    </div>
  );
}

// ─── Pair list editor (details = [{label, value}]) ─────────────────────────

function PairListEditor({
  items,
  onChange,
  labelPlaceholder,
  valuePlaceholder,
}: {
  items: { label: string; value: string }[];
  onChange: (next: { label: string; value: string }[]) => void;
  labelPlaceholder?: string;
  valuePlaceholder?: string;
}) {
  return (
    <div className="grid gap-2">
      {items.map((row, idx) => (
        <div key={idx} className="grid grid-cols-[1fr_1.5fr_auto_auto] gap-2 items-start">
          <input
            type="text"
            value={row.label}
            onChange={(e) =>
              onChange(items.map((v, i) => (i === idx ? { ...v, label: e.target.value } : v)))
            }
            placeholder={labelPlaceholder}
            className={INPUT_CLASS}
          />
          <input
            type="text"
            value={row.value}
            onChange={(e) =>
              onChange(items.map((v, i) => (i === idx ? { ...v, value: e.target.value } : v)))
            }
            placeholder={valuePlaceholder}
            className={INPUT_CLASS}
          />
          <ReorderButtons
            disabled={items.length < 2}
            isFirst={idx === 0}
            isLast={idx === items.length - 1}
            onUp={() => onChange(swap(items, idx, idx - 1))}
            onDown={() => onChange(swap(items, idx, idx + 1))}
          />
          <DeleteButton onClick={() => onChange(items.filter((_, i) => i !== idx))} />
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...items, { label: "", value: "" }])}
        className="self-start inline-flex items-center gap-1.5 px-3 py-2 text-[12px] font-bold rounded-lg text-pg-ink-secondary"
        style={{ border: "1.5px dashed var(--pg-border)" }}
      >
        <Icon name="plus" size={12} stroke={2.4} /> Tambah row
      </button>
    </div>
  );
}

// ─── Benefit list editor ───────────────────────────────────────────────────

const ICON_OPTIONS = [
  "wallet",
  "bowl",
  "shield",
  "home",
  "truck",
  "stethoscope",
  "clock",
  "sparkle",
  "globe",
  "heart",
  "check",
];

function BenefitListEditor({
  items,
  onChange,
}: {
  items: { icon: string; label: string; value: string }[];
  onChange: (next: { icon: string; label: string; value: string }[]) => void;
}) {
  return (
    <div className="grid gap-2">
      {items.map((row, idx) => (
        <div key={idx} className="grid grid-cols-[120px_1fr_1.5fr_auto_auto] gap-2 items-start">
          <select
            value={row.icon}
            onChange={(e) =>
              onChange(items.map((v, i) => (i === idx ? { ...v, icon: e.target.value } : v)))
            }
            className={INPUT_CLASS}
          >
            {ICON_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={row.label}
            onChange={(e) =>
              onChange(items.map((v, i) => (i === idx ? { ...v, label: e.target.value } : v)))
            }
            placeholder="Gaji pokok"
            className={INPUT_CLASS}
          />
          <input
            type="text"
            value={row.value}
            onChange={(e) =>
              onChange(items.map((v, i) => (i === idx ? { ...v, value: e.target.value } : v)))
            }
            placeholder="SAR 3.200 / bulan"
            className={INPUT_CLASS}
          />
          <ReorderButtons
            disabled={items.length < 2}
            isFirst={idx === 0}
            isLast={idx === items.length - 1}
            onUp={() => onChange(swap(items, idx, idx - 1))}
            onDown={() => onChange(swap(items, idx, idx + 1))}
          />
          <DeleteButton onClick={() => onChange(items.filter((_, i) => i !== idx))} />
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...items, { icon: "wallet", label: "", value: "" }])}
        className="self-start inline-flex items-center gap-1.5 px-3 py-2 text-[12px] font-bold rounded-lg text-pg-ink-secondary"
        style={{ border: "1.5px dashed var(--pg-border)" }}
      >
        <Icon name="plus" size={12} stroke={2.4} /> Tambah benefit
      </button>
    </div>
  );
}

// ─── Fee editor ────────────────────────────────────────────────────────────

function FeeEditor({
  fee,
  onChange,
}: {
  fee: PositionContent["fee"];
  onChange: (next: PositionContent["fee"]) => void;
}) {
  const enabled = fee != null;
  if (!enabled) {
    return (
      <button
        type="button"
        onClick={() => onChange({ amount: "", breakdown: [], note: "" })}
        className="inline-flex items-center gap-1.5 px-3 py-2 text-[12px] font-bold rounded-lg text-pg-ink-secondary"
        style={{ border: "1.5px dashed var(--pg-border)" }}
      >
        <Icon name="plus" size={12} stroke={2.4} /> Aktifkan section biaya
      </button>
    );
  }
  return (
    <div className="grid gap-3">
      <label className="block">
        <div className="text-[12px] font-bold text-pg-ink-tertiary mb-1">Jumlah</div>
        <input
          type="text"
          value={fee.amount}
          onChange={(e) => onChange({ ...fee, amount: e.target.value })}
          placeholder="Rp 20.000.000"
          className={INPUT_CLASS}
        />
      </label>
      <div>
        <div className="text-[12px] font-bold text-pg-ink-tertiary mb-1">Breakdown</div>
        <StringListEditor
          items={fee.breakdown}
          onChange={(breakdown) => onChange({ ...fee, breakdown })}
          placeholder="Mis. MCU GAMCA"
        />
      </div>
      <label className="block">
        <div className="text-[12px] font-bold text-pg-ink-tertiary mb-1">Catatan (opsional)</div>
        <textarea
          value={fee.note ?? ""}
          onChange={(e) => onChange({ ...fee, note: e.target.value })}
          rows={2}
          placeholder="Gratis sampai kamu terima offering letter."
          className={INPUT_CLASS}
        />
      </label>
      <button
        type="button"
        onClick={() => onChange(undefined)}
        className="self-start text-[12px] text-pg-red-600 font-semibold inline-flex items-center gap-1"
      >
        <Icon name="trash" size={12} /> Hapus section biaya
      </button>
    </div>
  );
}

// ─── Trust signals editor ──────────────────────────────────────────────────

function TrustSignalsEditor({
  trustSignals,
  onChange,
}: {
  trustSignals: PositionContent["trustSignals"];
  onChange: (next: PositionContent["trustSignals"]) => void;
}) {
  const ts = trustSignals ?? {};
  return (
    <div className="grid gap-4">
      <fieldset className="grid gap-2.5">
        <legend className="text-[12px] font-bold text-pg-ink-secondary">PIC Perantau Global</legend>
        <input
          type="text"
          value={ts.pic?.name ?? ""}
          onChange={(e) =>
            onChange({ ...ts, pic: { ...(ts.pic ?? { name: "" }), name: e.target.value } })
          }
          placeholder="Nama PIC"
          className={INPUT_CLASS}
        />
        <input
          type="text"
          value={ts.pic?.role ?? ""}
          onChange={(e) =>
            onChange({ ...ts, pic: { ...(ts.pic ?? { name: "" }), role: e.target.value } })
          }
          placeholder="Role (mis. Recruiter)"
          className={INPUT_CLASS}
        />
        <input
          type="text"
          value={ts.pic?.wa ?? ""}
          onChange={(e) =>
            onChange({ ...ts, pic: { ...(ts.pic ?? { name: "" }), wa: e.target.value } })
          }
          placeholder="Nomor WhatsApp"
          className={INPUT_CLASS}
        />
      </fieldset>
      <fieldset className="grid gap-2.5">
        <legend className="text-[12px] font-bold text-pg-ink-secondary">Employer</legend>
        <input
          type="text"
          value={ts.employer?.name ?? ""}
          onChange={(e) =>
            onChange({ ...ts, employer: { ...(ts.employer ?? {}), name: e.target.value } })
          }
          placeholder="Nama employer / agency"
          className={INPUT_CLASS}
        />
        <input
          type="text"
          value={ts.employer?.bp2miLicense ?? ""}
          onChange={(e) =>
            onChange({
              ...ts,
              employer: { ...(ts.employer ?? {}), bp2miLicense: e.target.value },
            })
          }
          placeholder="No. BP2MI license (opsional)"
          className={INPUT_CLASS}
        />
        <label className="inline-flex items-center gap-2 text-[13px] font-semibold text-pg-ink-secondary">
          <input
            type="checkbox"
            checked={ts.employer?.verified ?? false}
            onChange={(e) =>
              onChange({
                ...ts,
                employer: { ...(ts.employer ?? {}), verified: e.target.checked },
              })
            }
            className="w-4 h-4 accent-pg-red-600"
          />
          Employer ter-verifikasi (badge)
        </label>
      </fieldset>
    </div>
  );
}

// ─── Shared bits ────────────────────────────────────────────────────────────

function ReorderButtons({
  disabled,
  isFirst,
  isLast,
  onUp,
  onDown,
}: {
  disabled?: boolean;
  isFirst: boolean;
  isLast: boolean;
  onUp: () => void;
  onDown: () => void;
}) {
  if (disabled) return null;
  return (
    <div className="flex flex-col">
      <button
        type="button"
        onClick={onUp}
        disabled={isFirst}
        className="w-6 h-4 grid place-items-center text-pg-ink-tertiary disabled:opacity-25 hover:text-pg-red-600"
        aria-label="Naik"
      >
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="18 15 12 9 6 15" />
        </svg>
      </button>
      <button
        type="button"
        onClick={onDown}
        disabled={isLast}
        className="w-6 h-4 grid place-items-center text-pg-ink-tertiary disabled:opacity-25 hover:text-pg-red-600"
        aria-label="Turun"
      >
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
    </div>
  );
}

function DeleteButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-9 h-9 grid place-items-center text-pg-ink-tertiary hover:text-pg-red-600"
      aria-label="Hapus"
    >
      <Icon name="trash" size={14} />
    </button>
  );
}

function swap<T>(arr: T[], i: number, j: number): T[] {
  if (i < 0 || j < 0 || i >= arr.length || j >= arr.length) return arr;
  const out = [...arr];
  const tmp = out[i]!;
  out[i] = out[j]!;
  out[j] = tmp;
  return out;
}

const INPUT_CLASS =
  "w-full bg-pg-white border-[1.5px] border-pg-ink-200 rounded-lg px-3 py-2 text-sm text-pg-ink-primary placeholder:text-pg-ink-quaternary focus:border-pg-red-600 outline-none";
