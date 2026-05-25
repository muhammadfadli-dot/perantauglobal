"use client";

import { useState, useTransition } from "react";
import { Icon } from "@/components/pg/Icon";
import { Button } from "@/components/pg/primitives";
import type {
  PositionContent,
  ContentBenefit,
  ContentDetailRow,
} from "@/lib/position-content";

/**
 * Edits positions.content JSONB. Renders all sections (hero, jobDescription,
 * details, benefits, qualifications, fee, process, trustSignals) inline —
 * no modals, no accordion games. Admin scrolls top to bottom, makes changes,
 * clicks Save at the bottom (sticky save bar).
 *
 * Essentials scaffolding:
 *   Sections that follow a standard structure (Detail posisi, Benefits,
 *   Proses, Fee breakdown) are auto-seeded with a list of essential
 *   templates when the position hasn't been authored yet — distinguished
 *   by `undefined` (never set) vs `[]` (admin explicitly emptied). Admin
 *   sees the standard rows ready to be filled, can edit / remove, or
 *   re-template from the empty state.
 *
 * State is fully client-side until the user clicks Save. Then a server
 * action persists the entire content blob (idempotent UPDATE). Empty rows
 * are filtered on save so the public LP doesn't render blank lines.
 *
 * `onChange` is called on every edit so the parent can pipe the working copy
 * to a live preview component without round-tripping the server.
 */

// ─── Essentials catalog ──────────────────────────────────────────────────────

const ESSENTIALS_DETAILS: { label: string; example: string }[] = [
  { label: "Lokasi", example: "Saudi Arabia" },
  { label: "Jam kerja", example: "8 jam/hari · 6 hari/minggu" },
  { label: "Istirahat", example: "1 hari/minggu" },
  { label: "Annual leave", example: "21 hari" },
  { label: "Hari libur", example: "Sesuai hukum negara" },
  { label: "Status kepegawaian", example: "Kontrak 2 tahun" },
  { label: "Masa percobaan", example: "90 hari" },
];

const ESSENTIALS_BENEFITS: { icon: string; label: string; example: string }[] = [
  { icon: "wallet", label: "Gaji pokok", example: "SAR 3.200 / bulan" },
  { icon: "bowl", label: "Uang makan", example: "SAR 200 / bulan" },
  { icon: "shield", label: "Asuransi", example: "Disediakan" },
  { icon: "home", label: "Akomodasi", example: "Disediakan oleh perusahaan" },
  { icon: "truck", label: "Transportasi", example: "Disediakan oleh perusahaan" },
  { icon: "stethoscope", label: "Fasilitas medis", example: "Disediakan oleh perusahaan" },
];

const ESSENTIALS_PROCESS: string[] = [
  "Daftar",
  "Seleksi awal",
  "Wawancara",
  "Dokumen & medical",
  "Berangkat",
];

const ESSENTIALS_FEE_BREAKDOWN: string[] = [
  "MCU GAMCA",
  "Apostille",
  "Visa kerja",
  "Psikotes",
  "Tiket pesawat",
];

// Helpers to build essential rows with empty values (admin fills in).
function essentialsDetails(): ContentDetailRow[] {
  return ESSENTIALS_DETAILS.map((e) => ({ label: e.label, value: "" }));
}
function essentialsBenefits(): ContentBenefit[] {
  return ESSENTIALS_BENEFITS.map((e) => ({ icon: e.icon, label: e.label, value: "" }));
}

/**
 * Seed essentials into sections that have never been authored (undefined).
 * Sections explicitly emptied to [] are preserved — admin's "I don't want
 * this here" intent stays respected.
 */
function seedEssentials(content: PositionContent): PositionContent {
  return {
    ...content,
    details: content.details ?? essentialsDetails(),
    benefits: content.benefits ?? essentialsBenefits(),
    process: content.process ?? [...ESSENTIALS_PROCESS],
  };
}

/**
 * Filter empty rows before persisting. A row counts as empty when its
 * meaningful fields are blank — we don't want blank table rows on the
 * public LP just because admin saved with a scaffolded row untouched.
 */
function cleanForSave(content: PositionContent): PositionContent {
  return {
    ...content,
    jobDescription: (content.jobDescription ?? []).map((s) => s.trim()).filter(Boolean),
    details: (content.details ?? []).filter(
      (r) => r.label.trim().length > 0 || r.value.trim().length > 0,
    ),
    benefits: (content.benefits ?? []).filter(
      (r) => r.label.trim().length > 0 || r.value.trim().length > 0,
    ),
    qualifications: (content.qualifications ?? []).map((s) => s.trim()).filter(Boolean),
    process: (content.process ?? []).map((s) => s.trim()).filter(Boolean),
    fee: content.fee
      ? {
          ...content.fee,
          breakdown: content.fee.breakdown.map((s) => s.trim()).filter(Boolean),
        }
      : content.fee,
  };
}

// ─── Main editor ──────────────────────────────────────────────────────────

export default function ContentEditor({
  initial,
  onChange,
  onSave,
}: {
  initial: PositionContent;
  onChange?: (next: PositionContent) => void;
  onSave: (next: PositionContent) => Promise<void>;
}) {
  // Seed essentials at mount for never-authored sections. The seeded shape
  // becomes the savedSnapshot too so isDirty starts false — admin doesn't
  // see "unsaved changes" just from us laying out the standard rows.
  const [content, setContent] = useState<PositionContent>(() => seedEssentials(initial));
  const [savedSnapshot, setSavedSnapshot] = useState<PositionContent>(() =>
    seedEssentials(initial),
  );
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function patch(next: PositionContent) {
    setContent(next);
    onChange?.(next);
  }

  function save() {
    setError(null);
    const cleaned = cleanForSave(content);
    start(async () => {
      try {
        await onSave(cleaned);
        // Sync local + snapshot to the cleaned shape so isDirty resets and
        // empty rows disappear from the editor too.
        setContent(cleaned);
        setSavedSnapshot(cleaned);
        onChange?.(cleaned);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal menyimpan");
      }
    });
  }

  const isDirty = JSON.stringify(content) !== JSON.stringify(savedSnapshot);

  return (
    <div className="grid gap-4">
      <div
        className="px-4 py-3 rounded-xl flex items-start gap-2.5 text-[12px] leading-relaxed"
        style={{ background: "var(--pg-info-bg)", color: "var(--pg-info)" }}
      >
        <Icon name="info" size={14} className="shrink-0 mt-0.5" />
        <div>
          <b>Cara pakai:</b> Section di bawah udah disiapin dengan baris-baris standar
          (Detail posisi, Benefits, Proses). Tinggal isi nilai-nya, atau hapus yang
          ga relevan. Bisa nambah row custom kapan aja.
        </div>
      </div>

      <SectionCard
        title="Hero"
        hint="Garis info di bagian atas landing page (gaji + jenis kontrak)."
      >
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
        hint="Daftar tugas sehari-hari kandidat di posisi ini."
      >
        <StringListEditor
          items={content.jobDescription ?? []}
          onChange={(items) => patch({ ...content, jobDescription: items })}
          placeholder="Mis. Menyiapkan dan meracik berbagai jenis minuman"
          addLabel="Tambah tugas"
          emptyStateText="Belum ada tugas yang dimasukin."
        />
      </SectionCard>

      <SectionCard
        title="Detail posisi"
        hint="Tabel info standar: lokasi, jam kerja, hari libur, status kontrak, dll."
      >
        <PairListEditor
          items={content.details ?? []}
          onChange={(items) => patch({ ...content, details: items })}
          essentials={ESSENTIALS_DETAILS.map((e) => ({ label: e.label, value: "" }))}
          essentialsName="Detail posisi"
          labelPlaceholder="Lokasi"
          valuePlaceholder="Saudi Arabia"
          examplesByLabel={Object.fromEntries(
            ESSENTIALS_DETAILS.map((e) => [e.label, e.example]),
          )}
        />
      </SectionCard>

      <SectionCard
        title="Benefits"
        hint="Apa yang kandidat dapet — gaji, makan, akomodasi, dll."
      >
        <BenefitListEditor
          items={content.benefits ?? []}
          onChange={(items) => patch({ ...content, benefits: items })}
          essentials={ESSENTIALS_BENEFITS.map((e) => ({ icon: e.icon, label: e.label, value: "" }))}
          examplesByLabel={Object.fromEntries(
            ESSENTIALS_BENEFITS.map((e) => [e.label, e.example]),
          )}
        />
      </SectionCard>

      <SectionCard
        title="Kualifikasi (narasi)"
        hint="Bullet kualifikasi ditampilkan di landing page (display only — bukan filter aplikasi)."
      >
        <StringListEditor
          items={content.qualifications ?? []}
          onChange={(items) => patch({ ...content, qualifications: items })}
          placeholder="Mis. Wanita, 21–38 tahun"
          addLabel="Tambah kualifikasi"
          emptyStateText="Belum ada kualifikasi yang dimasukin."
        />
      </SectionCard>

      <SectionCard
        title="Biaya keberangkatan"
        hint="Optional. Kosongkan kalau ga ada biaya yang ditanggung kandidat."
      >
        <FeeEditor fee={content.fee} onChange={(fee) => patch({ ...content, fee })} />
      </SectionCard>

      <SectionCard
        title="Proses"
        hint="Step-by-step alur seleksi (ditampilkan dengan nomor di LP)."
      >
        <StringListEditor
          items={content.process ?? []}
          onChange={(items) => patch({ ...content, process: items })}
          placeholder="Mis. Daftar"
          addLabel="Tambah step"
          essentials={ESSENTIALS_PROCESS}
          essentialsName="Proses standar (5 step)"
          emptyStateText="Belum ada step proses yang dimasukin."
        />
      </SectionCard>

      <SectionCard
        title="Trust signals"
        hint="Info PIC + employer buat ngebangun kepercayaan kandidat. Opsional tapi sangat disarankan."
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
            <span className="text-pg-warn-soft-fg inline-flex items-center gap-1.5">
              <Icon name="warn" size={14} stroke={2} /> Ada perubahan belum tersimpan
            </span>
          ) : (
            <span className="text-pg-ok-soft-fg inline-flex items-center gap-1.5">
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
      {hint && (
        <div className="text-[12px] text-pg-ink-tertiary mt-0.5 leading-snug">{hint}</div>
      )}
      <div className="mt-3.5">{children}</div>
    </div>
  );
}

// ─── Empty-state with template CTA ─────────────────────────────────────────

function EmptyStateCTA({
  text,
  onUseTemplate,
  onStartFromScratch,
  templateLabel,
  scratchLabel,
}: {
  text: string;
  onUseTemplate?: () => void;
  onStartFromScratch: () => void;
  templateLabel?: string;
  scratchLabel: string;
}) {
  return (
    <div
      className="px-4 py-5 rounded-xl text-center"
      style={{ background: "var(--pg-paper)", border: "1px dashed var(--pg-border)" }}
    >
      <div className="text-[12.5px] text-pg-ink-tertiary mb-3">{text}</div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        {onUseTemplate && (
          <button
            type="button"
            onClick={onUseTemplate}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-[12.5px] font-bold text-white rounded-lg"
            style={{ background: "var(--pg-red-600)" }}
          >
            <Icon name="check" size={12} stroke={2.4} />
            {templateLabel ?? "Pakai template"}
          </button>
        )}
        <button
          type="button"
          onClick={onStartFromScratch}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-[12.5px] font-bold text-pg-ink-secondary rounded-lg"
          style={{ border: "1px solid var(--pg-border)", background: "var(--pg-white)" }}
        >
          <Icon name="plus" size={12} stroke={2.4} />
          {scratchLabel}
        </button>
      </div>
    </div>
  );
}

// ─── String list editor (jobDescription, qualifications, process) ──────────

function StringListEditor({
  items,
  onChange,
  placeholder,
  addLabel,
  essentials,
  essentialsName,
  emptyStateText,
}: {
  items: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  addLabel?: string;
  essentials?: string[];
  essentialsName?: string;
  emptyStateText?: string;
}) {
  if (items.length === 0) {
    return (
      <EmptyStateCTA
        text={emptyStateText ?? "Belum ada baris."}
        onUseTemplate={
          essentials && essentials.length > 0 ? () => onChange([...essentials]) : undefined
        }
        templateLabel={essentialsName ? `Pakai ${essentialsName}` : "Pakai template"}
        scratchLabel="Mulai dari nol"
        onStartFromScratch={() => onChange([""])}
      />
    );
  }
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
        <Icon name="plus" size={12} stroke={2.4} /> {addLabel ?? "Tambah baris"}
      </button>
    </div>
  );
}

// ─── Pair list editor (details = [{label, value}]) ─────────────────────────

function PairListEditor({
  items,
  onChange,
  essentials,
  essentialsName,
  labelPlaceholder,
  valuePlaceholder,
  examplesByLabel,
}: {
  items: ContentDetailRow[];
  onChange: (next: ContentDetailRow[]) => void;
  essentials?: ContentDetailRow[];
  essentialsName?: string;
  labelPlaceholder?: string;
  valuePlaceholder?: string;
  examplesByLabel?: Record<string, string>;
}) {
  if (items.length === 0) {
    return (
      <EmptyStateCTA
        text="Belum ada detail yang dimasukin."
        onUseTemplate={
          essentials && essentials.length > 0
            ? () => onChange(essentials.map((e) => ({ ...e })))
            : undefined
        }
        templateLabel={essentialsName ? `Pakai template ${essentialsName}` : "Pakai template"}
        scratchLabel="Mulai dari nol"
        onStartFromScratch={() => onChange([{ label: "", value: "" }])}
      />
    );
  }
  return (
    <div className="grid gap-2">
      {items.map((row, idx) => {
        const example = examplesByLabel?.[row.label];
        return (
          <div
            key={idx}
            className="grid grid-cols-[1fr_1.5fr_auto_auto] gap-2 items-start"
          >
            <input
              type="text"
              value={row.label}
              onChange={(e) =>
                onChange(
                  items.map((v, i) => (i === idx ? { ...v, label: e.target.value } : v)),
                )
              }
              placeholder={labelPlaceholder}
              className={INPUT_CLASS}
            />
            <input
              type="text"
              value={row.value}
              onChange={(e) =>
                onChange(
                  items.map((v, i) => (i === idx ? { ...v, value: e.target.value } : v)),
                )
              }
              placeholder={example ?? valuePlaceholder}
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
        );
      })}
      <button
        type="button"
        onClick={() => onChange([...items, { label: "", value: "" }])}
        className="self-start inline-flex items-center gap-1.5 px-3 py-2 text-[12px] font-bold rounded-lg text-pg-ink-secondary"
        style={{ border: "1.5px dashed var(--pg-border)" }}
      >
        <Icon name="plus" size={12} stroke={2.4} /> Tambah baris custom
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
  essentials,
  examplesByLabel,
}: {
  items: ContentBenefit[];
  onChange: (next: ContentBenefit[]) => void;
  essentials?: ContentBenefit[];
  examplesByLabel?: Record<string, string>;
}) {
  if (items.length === 0) {
    return (
      <EmptyStateCTA
        text="Belum ada benefit yang dimasukin."
        onUseTemplate={
          essentials && essentials.length > 0
            ? () => onChange(essentials.map((e) => ({ ...e })))
            : undefined
        }
        templateLabel="Pakai template Benefits standar"
        scratchLabel="Mulai dari nol"
        onStartFromScratch={() =>
          onChange([{ icon: "wallet", label: "", value: "" }])
        }
      />
    );
  }
  return (
    <div className="grid gap-2">
      {items.map((row, idx) => {
        const example = examplesByLabel?.[row.label];
        return (
          <div
            key={idx}
            className="grid grid-cols-[120px_1fr_1.5fr_auto_auto] gap-2 items-start"
          >
            <select
              value={row.icon}
              onChange={(e) =>
                onChange(
                  items.map((v, i) => (i === idx ? { ...v, icon: e.target.value } : v)),
                )
              }
              className={INPUT_CLASS}
              aria-label="Icon"
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
                onChange(
                  items.map((v, i) => (i === idx ? { ...v, label: e.target.value } : v)),
                )
              }
              placeholder="Gaji pokok"
              className={INPUT_CLASS}
            />
            <input
              type="text"
              value={row.value}
              onChange={(e) =>
                onChange(
                  items.map((v, i) => (i === idx ? { ...v, value: e.target.value } : v)),
                )
              }
              placeholder={example ?? "SAR 3.200 / bulan"}
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
        );
      })}
      <button
        type="button"
        onClick={() => onChange([...items, { icon: "wallet", label: "", value: "" }])}
        className="self-start inline-flex items-center gap-1.5 px-3 py-2 text-[12px] font-bold rounded-lg text-pg-ink-secondary"
        style={{ border: "1.5px dashed var(--pg-border)" }}
      >
        <Icon name="plus" size={12} stroke={2.4} /> Tambah benefit custom
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
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() =>
            onChange({
              amount: "",
              breakdown: [...ESSENTIALS_FEE_BREAKDOWN],
              note: "Gratis sampai kamu terima offering letter.",
            })
          }
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-[12.5px] font-bold text-white rounded-lg"
          style={{ background: "var(--pg-red-600)" }}
        >
          <Icon name="check" size={12} stroke={2.4} /> Aktifkan & pakai template
        </button>
        <button
          type="button"
          onClick={() => onChange({ amount: "", breakdown: [], note: "" })}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-[12.5px] font-bold text-pg-ink-secondary rounded-lg"
          style={{ border: "1px solid var(--pg-border)", background: "var(--pg-white)" }}
        >
          <Icon name="plus" size={12} stroke={2.4} /> Aktifkan tanpa template
        </button>
      </div>
    );
  }
  return (
    <div className="grid gap-3">
      <label className="block">
        <div className="text-[12px] font-bold text-pg-ink-tertiary mb-1">Jumlah biaya</div>
        <input
          type="text"
          value={fee.amount}
          onChange={(e) => onChange({ ...fee, amount: e.target.value })}
          placeholder="Rp 20.000.000"
          className={INPUT_CLASS}
        />
      </label>
      <div>
        <div className="text-[12px] font-bold text-pg-ink-tertiary mb-1">
          Komponen biaya
        </div>
        <StringListEditor
          items={fee.breakdown}
          onChange={(breakdown) => onChange({ ...fee, breakdown })}
          placeholder="Mis. MCU GAMCA"
          addLabel="Tambah komponen"
          essentials={ESSENTIALS_FEE_BREAKDOWN}
          essentialsName="komponen biaya standar"
          emptyStateText="Belum ada komponen biaya."
        />
      </div>
      <label className="block">
        <div className="text-[12px] font-bold text-pg-ink-tertiary mb-1">
          Catatan tambahan <span className="font-normal">(opsional)</span>
        </div>
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
        <legend className="text-[12px] font-bold text-pg-ink-secondary">
          PIC Perantau Global
        </legend>
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
