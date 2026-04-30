"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  REQUIREMENT_LIBRARY,
  REQUIREMENT_LIBRARY_BY_CATEGORY,
  type RequirementCategory,
  type RequirementTemplate,
} from "@perantauglobal/db/schemas/requirements/library";
import { Icon } from "@/components/pg/Icon";
import { createPosition, type CustomFieldDraft } from "./actions";

type Country = "saudi_arabia" | "japan" | "taiwan" | "indonesia" | "any";

const COUNTRY_OPTIONS: { value: Country; label: string; flag: string }[] = [
  { value: "saudi_arabia", label: "Arab Saudi", flag: "SA" },
  { value: "japan", label: "Jepang", flag: "JP" },
  { value: "taiwan", label: "Taiwan", flag: "TW" },
  { value: "indonesia", label: "Indonesia", flag: "ID" },
  { value: "any", label: "Lainnya / Generik", flag: "GL" },
];

const ROLE_OPTIONS = [
  "Caregiver",
  "Perawat",
  "Barista",
  "Waiter",
  "Truck Driver",
  "Spa Therapist",
  "Pengolahan Makanan",
  "Laundry",
  "Chef Bakery",
  "SPG / SPB",
  "Lainnya",
];

type RequirementSelection = RequirementTemplate & {
  importance_override?: "hard" | "soft";
  evidence_override?: "document" | "self_declared" | "either";
};

type WizardState = {
  step: 1 | 2 | 3 | 4;
  name: string;
  slug: string;
  slugTouched: boolean;
  country: Country | "";
  role: string;
  description: string;
  selectedKeys: string[];
  overrides: Record<string, Partial<RequirementSelection>>;
  customFields: CustomFieldDraft[];
};

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function PositionWizard() {
  const router = useRouter();
  const [state, setState] = React.useState<WizardState>({
    step: 1,
    name: "",
    slug: "",
    slugTouched: false,
    country: "",
    role: "",
    description: "",
    selectedKeys: [],
    overrides: {},
    customFields: [],
  });
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Auto-derive slug from name + country
  React.useEffect(() => {
    if (state.slugTouched) return;
    if (!state.name) return;
    const base = slugify(state.name);
    const suffix = state.country && state.country !== "any" ? `-${state.country.replace("_", "-")}` : "";
    setState((s) => ({ ...s, slug: base + suffix }));
  }, [state.name, state.country, state.slugTouched]);

  function setField<K extends keyof WizardState>(key: K, value: WizardState[K]) {
    setState((s) => ({ ...s, [key]: value }));
  }

  function toggleRequirement(key: string) {
    setState((s) => ({
      ...s,
      selectedKeys: s.selectedKeys.includes(key)
        ? s.selectedKeys.filter((k) => k !== key)
        : [...s.selectedKeys, key],
    }));
  }

  function updateOverride(key: string, patch: Partial<RequirementSelection>) {
    setState((s) => ({
      ...s,
      overrides: { ...s.overrides, [key]: { ...s.overrides[key], ...patch } },
    }));
  }

  const selectedRequirements = state.selectedKeys
    .map((k) => REQUIREMENT_LIBRARY.find((r) => r.key === k))
    .filter(Boolean) as RequirementTemplate[];

  const canProceedStep1 =
    state.name.trim().length >= 2 && SLUG_RE.test(state.slug) && state.country;
  const canProceedStep2 = selectedRequirements.length > 0;

  async function handleSubmit() {
    setError(null);
    setSubmitting(true);
    try {
      const requirements: Record<string, unknown> = {};
      for (const r of selectedRequirements) {
        const o = state.overrides[r.key] ?? {};
        requirements[r.key] = {
          label: r.label,
          category: r.category,
          importance: o.importance_override ?? r.importance,
          evidence_mode: o.evidence_override ?? r.evidence_mode,
          ...(r.allowed_values ? { allowed_values: r.allowed_values } : {}),
          ...(r.value_labels ? { value_labels: r.value_labels } : {}),
          ...(r.document_type ? { document_type: r.document_type } : {}),
          ...(r.document_filter ? { document_filter: r.document_filter } : {}),
          ...(r.collect_at_stage ? { collect_at_stage: r.collect_at_stage } : {}),
          ...(r.description ? { description: r.description } : {}),
        };
      }
      const result = await createPosition({
        name: state.name,
        slug: state.slug,
        country: state.country as string,
        description: state.description,
        requirements,
        custom_fields: state.customFields,
      });
      router.push(`/admin/positions/${result.slug}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal simpan");
      setSubmitting(false);
    }
  }

  return (
    <main className="px-8 py-7 flex flex-col gap-7">
      <Stepper step={state.step} />

      {state.step === 1 && (
        <Step1
          state={state}
          setField={setField}
          onSlugTouched={() => setField("slugTouched", true)}
        />
      )}
      {state.step === 2 && (
        <Step2
          state={state}
          selectedRequirements={selectedRequirements}
          onToggle={toggleRequirement}
          onOverride={updateOverride}
        />
      )}
      {state.step === 3 && (
        <Step3
          fields={state.customFields}
          onChange={(fields) => setField("customFields", fields)}
        />
      )}
      {state.step === 4 && (
        <Step4
          state={state}
          requirements={selectedRequirements}
          customFields={state.customFields}
        />
      )}

      {/* Footer */}
      <div
        className="sticky bottom-0 -mx-8 px-8 py-4 flex items-center justify-between bg-pg-white"
        style={{ borderTop: "1px solid var(--pg-border)" }}
      >
        <div
          className="text-[12px] font-semibold flex items-center gap-2"
          style={{ color: "var(--pg-ink-tertiary)" }}
        >
          <Icon name="check" size={14} stroke={2} className="text-pg-ok-soft-fg" />
          {state.step === 4
            ? "Semua field tervalidasi · siap publish"
            : `Step ${state.step} dari 4`}
          {error && (
            <span className="text-pg-red-600 ml-3">{error}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {state.step > 1 && (
            <button
              type="button"
              onClick={() => setField("step", (state.step - 1) as WizardState["step"])}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-bold text-pg-ink-secondary"
              style={{ border: "1px solid var(--pg-border)" }}
            >
              <Icon name="arrow_left" size={14} /> Kembali
            </button>
          )}
          {state.step === 1 && (
            <button
              type="button"
              disabled={!canProceedStep1}
              onClick={() => setField("step", 2)}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-[13px] font-bold text-white disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: "var(--pg-red-600)" }}
            >
              Lanjut: Requirements <Icon name="arrow_right" size={14} />
            </button>
          )}
          {state.step === 2 && (
            <button
              type="button"
              disabled={!canProceedStep2}
              onClick={() => setField("step", 3)}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-[13px] font-bold text-white disabled:opacity-50"
              style={{ background: "var(--pg-red-600)" }}
            >
              Lanjut: Custom Q <Icon name="arrow_right" size={14} />
            </button>
          )}
          {state.step === 3 && (
            <button
              type="button"
              onClick={() => setField("step", 4)}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-[13px] font-bold text-white"
              style={{ background: "var(--pg-red-600)" }}
            >
              Lanjut: Preview <Icon name="arrow_right" size={14} />
            </button>
          )}
          {state.step === 4 && (
            <button
              type="button"
              disabled={submitting}
              onClick={handleSubmit}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-[13px] font-bold text-white disabled:opacity-50"
              style={{ background: "var(--pg-red-600)" }}
            >
              <Icon name="check" size={14} stroke={2.4} />
              {submitting ? "Saving…" : "Publish posisi"}
            </button>
          )}
        </div>
      </div>
    </main>
  );
}

function Stepper({ step }: { step: number }) {
  const steps = [
    { n: 1, label: "Info dasar" },
    { n: 2, label: "Requirements" },
    { n: 3, label: "Custom Q" },
    { n: 4, label: "Preview" },
  ];
  return (
    <div className="flex items-center gap-3">
      {steps.map((s, i) => {
        const done = step > s.n;
        const active = step === s.n;
        return (
          <React.Fragment key={s.n}>
            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-full grid place-items-center text-[12px] font-bold"
                style={{
                  background: done
                    ? "var(--pg-ok-soft-bg)"
                    : active
                    ? "var(--pg-red-600)"
                    : "var(--pg-ink-50)",
                  color: done
                    ? "var(--pg-ok-soft-fg)"
                    : active
                    ? "white"
                    : "var(--pg-ink-tertiary)",
                }}
              >
                {done ? <Icon name="check" size={13} stroke={2.6} /> : s.n}
              </div>
              <div className="flex flex-col">
                <span
                  className="text-[10px] font-semibold tracking-[0.1em] uppercase leading-[12px]"
                  style={{
                    color: active ? "var(--pg-red-600)" : "var(--pg-ink-tertiary)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  Step {s.n}
                </span>
                <span
                  className="text-[13px] font-bold leading-[16px]"
                  style={{
                    color: active || done ? "var(--pg-ink-primary)" : "var(--pg-ink-tertiary)",
                  }}
                >
                  {s.label}
                </span>
              </div>
            </div>
            {i < steps.length - 1 && (
              <div
                className="flex-1 h-0.5 rounded-full"
                style={{
                  background: done ? "var(--pg-ok-soft-fg)" : "var(--pg-border)",
                }}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ─── STEP 1 ────────────────────────────────────────────────
function Step1({
  state,
  setField,
  onSlugTouched,
}: {
  state: WizardState;
  setField: <K extends keyof WizardState>(key: K, value: WizardState[K]) => void;
  onSlugTouched: () => void;
}) {
  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <div>
        <Eyebrow>Step 1 dari 4</Eyebrow>
        <h2 className="text-[28px] font-extrabold tracking-[-0.02em] mt-1">Info dasar posisi</h2>
        <p className="text-[14px] text-pg-ink-tertiary mt-1">
          Mulai dengan nama posisi & negara. Detail persyaratan diisi di langkah berikutnya.
        </p>
      </div>
      <div
        className="bg-pg-white rounded-2xl p-6 flex flex-col gap-5"
        style={{ border: "1px solid var(--pg-border)" }}
      >
        <FieldRow label="Nama posisi" required>
          <input
            type="text"
            value={state.name}
            onChange={(e) => setField("name", e.target.value)}
            placeholder="Mis. Pengasuh Lansia"
            className="w-full px-4 py-3 rounded-lg text-[14px] outline-none focus:border-pg-red-600"
            style={{ border: "1.5px solid var(--pg-border)" }}
          />
          <Hint>Nama yang akan dilihat candidate di marketplace.</Hint>
        </FieldRow>

        <FieldRow label="Slug URL" badge="auto">
          <div
            className="flex items-center rounded-lg overflow-hidden"
            style={{ border: "1px solid var(--pg-border)" }}
          >
            <span
              className="px-3 py-3 text-[13px] font-semibold"
              style={{ color: "var(--pg-ink-tertiary)", fontFamily: "var(--font-mono)", background: "var(--pg-paper)" }}
            >
              /lowongan/
            </span>
            <input
              type="text"
              value={state.slug}
              onChange={(e) => {
                onSlugTouched();
                setField("slug", e.target.value);
              }}
              placeholder="pengasuh-lansia-taiwan"
              className="flex-1 px-3 py-3 text-[13px] outline-none"
              style={{ fontFamily: "var(--font-mono)" }}
            />
          </div>
        </FieldRow>

        <div className="grid md:grid-cols-2 gap-5">
          <FieldRow label="Negara" required>
            <select
              value={state.country}
              onChange={(e) => setField("country", e.target.value as Country)}
              className="w-full px-4 py-3 rounded-lg text-[14px] outline-none bg-pg-white"
              style={{ border: "1.5px solid var(--pg-border)" }}
            >
              <option value="">Pilih negara…</option>
              {COUNTRY_OPTIONS.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </FieldRow>
          <FieldRow label="Role" required>
            <select
              value={state.role}
              onChange={(e) => setField("role", e.target.value)}
              className="w-full px-4 py-3 rounded-lg text-[14px] outline-none bg-pg-white"
              style={{ border: "1.5px solid var(--pg-border)" }}
            >
              <option value="">Pilih role…</option>
              {ROLE_OPTIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </FieldRow>
        </div>

        <FieldRow
          label="Deskripsi posisi"
          badge="optional"
          rightHint={`${state.description.length} / 500`}
        >
          <textarea
            value={state.description}
            onChange={(e) =>
              setField("description", e.target.value.slice(0, 500))
            }
            rows={4}
            placeholder="Lowongan caregiver Indonesia untuk merawat lansia di rumah keluarga Taiwan…"
            className="w-full px-4 py-3 rounded-lg text-[14px] outline-none resize-none"
            style={{ border: "1.5px solid var(--pg-border)" }}
          />
          <Hint>Tampil di marketing site /lowongan/[slug]. Bisa pakai markdown dasar.</Hint>
        </FieldRow>
      </div>
    </div>
  );
}

// ─── STEP 2 ────────────────────────────────────────────────
function Step2({
  state,
  selectedRequirements,
  onToggle,
  onOverride,
}: {
  state: WizardState;
  selectedRequirements: RequirementTemplate[];
  onToggle: (key: string) => void;
  onOverride: (key: string, patch: Partial<RequirementSelection>) => void;
}) {
  const [search, setSearch] = React.useState("");
  const [openCategory, setOpenCategory] = React.useState<RequirementCategory | "all">(
    "all"
  );

  const categories: { key: RequirementCategory; label: string; icon: Parameters<typeof Icon>[0]["name"] }[] = [
    { key: "personal", label: "Personal", icon: "user" },
    { key: "certification", label: "Sertifikasi", icon: "doc_check" },
    { key: "language", label: "Bahasa", icon: "globe" },
    { key: "experience", label: "Pengalaman", icon: "briefcase" },
  ];

  const filteredLibrary = REQUIREMENT_LIBRARY.filter((r) => {
    if (openCategory !== "all" && r.category !== openCategory) return false;
    if (search && !r.label.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const wajibCount = selectedRequirements.filter((r) => {
    const o = state.overrides[r.key]?.importance_override;
    return (o ?? r.importance) === "hard";
  }).length;
  const bonusCount = selectedRequirements.length - wajibCount;

  return (
    <div className="grid lg:grid-cols-3 gap-5">
      {/* LIBRARY column */}
      <div
        className="bg-pg-white rounded-2xl p-5 flex flex-col gap-3 self-start"
        style={{ border: "1px solid var(--pg-border)" }}
      >
        <div className="flex items-center justify-between">
          <Eyebrow tone="ink">Library</Eyebrow>
          <span
            className="text-[10px] font-semibold"
            style={{ color: "var(--pg-ink-tertiary)", fontFamily: "var(--font-mono)" }}
          >
            {REQUIREMENT_LIBRARY.length} items
          </span>
        </div>
        <h3 className="text-[18px] font-extrabold tracking-[-0.01em]">Pilih dari catalog</h3>
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-lg"
          style={{ border: "1px solid var(--pg-border)" }}
        >
          <Icon name="search" size={13} className="text-pg-ink-quaternary" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari requirement…"
            className="flex-1 text-[13px] outline-none bg-transparent"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setOpenCategory("all")}
            className="px-2.5 py-1 rounded-md text-[11px] font-bold"
            style={{
              background: openCategory === "all" ? "var(--pg-ink-primary)" : "var(--pg-ink-50)",
              color: openCategory === "all" ? "white" : "var(--pg-ink-secondary)",
            }}
          >
            Semua
          </button>
          {categories.map((c) => (
            <button
              key={c.key}
              type="button"
              onClick={() => setOpenCategory(c.key)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold"
              style={{
                background: openCategory === c.key ? "var(--pg-ink-primary)" : "var(--pg-ink-50)",
                color: openCategory === c.key ? "white" : "var(--pg-ink-secondary)",
              }}
            >
              <Icon name={c.icon} size={11} stroke={2} />
              {c.label}
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-0.5 max-h-[600px] overflow-y-auto">
          {filteredLibrary.length === 0 && (
            <div className="text-[12px] text-pg-ink-tertiary py-6 text-center">
              Tidak ada hasil.
            </div>
          )}
          {filteredLibrary.map((r) => {
            const selected = state.selectedKeys.includes(r.key);
            return (
              <label
                key={r.key}
                className="flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer hover:bg-pg-paper"
                style={{
                  background: selected ? "var(--pg-red-soft-bg)" : "transparent",
                }}
              >
                <input
                  type="checkbox"
                  checked={selected}
                  onChange={() => onToggle(r.key)}
                  className="shrink-0 accent-pg-red-600"
                />
                <span
                  className="flex-1 text-[12.5px] font-semibold leading-tight"
                  style={{ color: selected ? "var(--pg-red-700)" : "var(--pg-ink-secondary)" }}
                >
                  {r.label}
                </span>
                {r.importance === "hard" && (
                  <span
                    className="text-[9px] font-bold tracking-[0.06em] uppercase"
                    style={{
                      color: "var(--pg-red-600)",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    Wajib
                  </span>
                )}
              </label>
            );
          })}
        </div>
      </div>

      {/* SELECTED column */}
      <div
        className="bg-pg-white rounded-2xl p-5 flex flex-col gap-3 self-start"
        style={{ border: "1px solid var(--pg-border)" }}
      >
        <div className="flex items-center justify-between">
          <Eyebrow tone="ink">
            Selected · {selectedRequirements.length} requirements
          </Eyebrow>
          <div className="flex items-center gap-1.5">
            <span
              className="px-2 py-0.5 rounded-md text-[10px] font-bold"
              style={{
                background: "var(--pg-red-soft-bg)",
                color: "var(--pg-red-600)",
                fontFamily: "var(--font-mono)",
              }}
            >
              {wajibCount} WAJIB
            </span>
            <span
              className="px-2 py-0.5 rounded-md text-[10px] font-bold"
              style={{
                background: "var(--pg-ink-50)",
                color: "var(--pg-ink-tertiary)",
                fontFamily: "var(--font-mono)",
              }}
            >
              {bonusCount} BONUS
            </span>
          </div>
        </div>
        <h3 className="text-[18px] font-extrabold tracking-[-0.01em]">
          Persyaratan posisi ini
        </h3>
        <div className="flex flex-col gap-2.5">
          {selectedRequirements.length === 0 && (
            <div className="text-[13px] text-pg-ink-tertiary py-6 text-center">
              Pilih requirement dari library di kiri.
            </div>
          )}
          {selectedRequirements.map((r) => {
            const o = state.overrides[r.key] ?? {};
            const importance = o.importance_override ?? r.importance;
            const evidence = o.evidence_override ?? r.evidence_mode;
            return (
              <div
                key={r.key}
                className="rounded-xl p-3.5 flex flex-col gap-2"
                style={{ border: "1px solid var(--pg-border)" }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-[14px] font-bold leading-tight text-pg-ink-primary">
                      {r.label}
                    </div>
                    <div
                      className="text-[11px] mt-0.5 leading-tight"
                      style={{
                        color: "var(--pg-ink-tertiary)",
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      {r.key}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onToggle(r.key)}
                    className="text-pg-ink-quaternary hover:text-pg-red-600"
                    aria-label="Hapus"
                  >
                    <Icon name="trash" size={14} />
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <ToggleChip
                    active={importance === "hard"}
                    onClick={() => onOverride(r.key, { importance_override: "hard" })}
                  >
                    Wajib
                  </ToggleChip>
                  <ToggleChip
                    active={importance === "soft"}
                    onClick={() => onOverride(r.key, { importance_override: "soft" })}
                  >
                    Bonus
                  </ToggleChip>
                  <span
                    className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase"
                    style={{
                      background: "var(--pg-ink-50)",
                      color: "var(--pg-ink-tertiary)",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    {evidence === "either" ? "Cert / Self" : evidence === "document" ? "Cert" : "Self-decl"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* PREVIEW column */}
      <div
        className="bg-pg-ink-primary text-white rounded-2xl p-5 flex flex-col gap-3 self-start"
        style={{ background: "var(--pg-ink-primary)" }}
      >
        <div className="flex items-center justify-between">
          <Eyebrow tone="ink">Live preview</Eyebrow>
          <span
            className="text-[10px] font-semibold opacity-60"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            390
          </span>
        </div>
        <h3 className="text-[18px] font-extrabold tracking-[-0.01em] text-white">
          Candidate POV
        </h3>
        <div
          className="rounded-xl p-4 flex flex-col gap-3"
          style={{ background: "rgba(255,255,255,0.06)" }}
        >
          <div
            className="text-[10px] font-semibold tracking-[0.1em] uppercase opacity-70"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Sekarang · Lamaran
          </div>
          <div className="text-[18px] font-extrabold">
            {state.name || "[Nama posisi]"}
          </div>
          {selectedRequirements
            .filter((r) => {
              const o = state.overrides[r.key]?.importance_override ?? r.importance;
              return o === "hard";
            })
            .map((r) => (
              <div
                key={r.key}
                className="rounded-lg p-2.5 text-[13px] flex items-center gap-2"
                style={{ background: "rgba(255,255,255,0.08)" }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ background: "var(--pg-red-500)" }}
                />
                <span className="flex-1">{r.label}</span>
              </div>
            ))}
          {selectedRequirements.length === 0 && (
            <div className="text-[13px] opacity-60 italic">
              Belum ada requirements
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── STEP 3 ────────────────────────────────────────────────
function Step3({
  fields,
  onChange,
}: {
  fields: CustomFieldDraft[];
  onChange: (fields: CustomFieldDraft[]) => void;
}) {
  function add() {
    onChange([
      ...fields,
      {
        field_key: `q_${fields.length + 1}`,
        field_label: "",
        field_type: "textarea",
        required: false,
        tier_weight: 0,
        collect_at_stage: "screening",
      },
    ]);
  }
  function update(idx: number, patch: Partial<CustomFieldDraft>) {
    onChange(fields.map((f, i) => (i === idx ? { ...f, ...patch } : f)));
  }
  function remove(idx: number) {
    onChange(fields.filter((_, i) => i !== idx));
  }

  return (
    <div className="flex flex-col gap-5 max-w-4xl">
      <div>
        <Eyebrow>Step 3 dari 4 · Opsional</Eyebrow>
        <h2 className="text-[28px] font-extrabold tracking-[-0.02em] mt-1">
          Pertanyaan custom
        </h2>
        <p className="text-[14px] text-pg-ink-tertiary mt-1">
          Pertanyaan tambahan untuk candidate. Tentuin kapan ditanya (apply / screening / interview) & bobot untuk auto-scoring tier A/B/C/D.
        </p>
      </div>

      {fields.map((f, idx) => (
        <div
          key={idx}
          className="bg-pg-white rounded-2xl p-5 flex flex-col gap-3"
          style={{ border: "1px solid var(--pg-border)" }}
        >
          <div className="flex items-start gap-3">
            <div className="flex-1 grid md:grid-cols-2 gap-3">
              <input
                value={f.field_label}
                onChange={(e) => update(idx, { field_label: e.target.value })}
                placeholder="Pertanyaan…"
                className="px-3 py-2 text-[14px] font-bold rounded-lg outline-none"
                style={{ border: "1.5px solid var(--pg-border)" }}
              />
              <input
                value={f.field_key}
                onChange={(e) => update(idx, { field_key: e.target.value })}
                placeholder="field_key"
                className="px-3 py-2 text-[12px] rounded-lg outline-none"
                style={{ border: "1px solid var(--pg-border)", fontFamily: "var(--font-mono)" }}
              />
            </div>
            <button
              type="button"
              onClick={() => remove(idx)}
              className="text-pg-ink-quaternary hover:text-pg-red-600"
              aria-label="Hapus"
            >
              <Icon name="trash" size={16} />
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={f.field_type}
              onChange={(e) =>
                update(idx, {
                  field_type: e.target.value as CustomFieldDraft["field_type"],
                })
              }
              className="px-2.5 py-1.5 text-[12px] font-bold rounded-md outline-none"
              style={{ border: "1px solid var(--pg-border)" }}
            >
              <option value="textarea">Text panjang</option>
              <option value="text">Text pendek</option>
              <option value="number">Angka</option>
              <option value="radio">Radio</option>
              <option value="select">Dropdown</option>
              <option value="multiselect">Multi-select</option>
              <option value="file">File upload</option>
            </select>
            <select
              value={f.collect_at_stage}
              onChange={(e) =>
                update(idx, {
                  collect_at_stage: e.target.value as CustomFieldDraft["collect_at_stage"],
                })
              }
              className="px-2.5 py-1.5 text-[12px] font-bold rounded-md outline-none"
              style={{ border: "1px solid var(--pg-border)" }}
            >
              <option value="applied">@APPLIED (saat lamar)</option>
              <option value="screening">@SCREENING</option>
              <option value="document_check">@DOC CHECK</option>
            </select>
            <label className="inline-flex items-center gap-1.5 text-[12px] font-bold text-pg-ink-secondary px-2.5 py-1.5">
              <input
                type="checkbox"
                checked={f.required ?? false}
                onChange={(e) => update(idx, { required: e.target.checked })}
                className="accent-pg-red-600"
              />
              Wajib (hard-pass)
            </label>
            <label className="inline-flex items-center gap-1.5 text-[12px] font-bold text-pg-ink-secondary px-2.5 py-1.5">
              Bobot
              <input
                type="number"
                min={0}
                max={10}
                value={f.tier_weight ?? 0}
                onChange={(e) =>
                  update(idx, { tier_weight: Number(e.target.value) || 0 })
                }
                className="w-12 px-1.5 py-0.5 text-[12px] rounded outline-none text-center"
                style={{ border: "1px solid var(--pg-border)" }}
              />
            </label>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={add}
        className="px-4 py-3 rounded-2xl text-[13px] font-bold flex items-center justify-center gap-2 text-pg-ink-secondary border-dashed"
        style={{ border: "2px dashed var(--pg-border)" }}
      >
        <Icon name="plus" size={14} stroke={2.4} />
        Tambah pertanyaan custom
      </button>

      <div
        className="rounded-xl px-4 py-3 flex items-start gap-3"
        style={{ background: "var(--pg-warn-soft-bg)" }}
      >
        <span className="shrink-0 mt-0.5" style={{ color: "var(--pg-warn-soft-fg)" }}>
          <Icon name="info" size={16} />
        </span>
        <div
          className="text-[12px] leading-tight"
          style={{ color: "var(--pg-warn-soft-fg)" }}
        >
          Tip: Pertanyaan dengan bobot &gt; 0 ngitung ke tier scoring kandidat (A/B/C/D). Hard-pass questions di-collect at apply biar nyaring duluan.
        </div>
      </div>
    </div>
  );
}

// ─── STEP 4 ────────────────────────────────────────────────
function Step4({
  state,
  requirements,
  customFields,
}: {
  state: WizardState;
  requirements: RequirementTemplate[];
  customFields: CustomFieldDraft[];
}) {
  const wajib = requirements.filter((r) => {
    const o = state.overrides[r.key]?.importance_override ?? r.importance;
    return o === "hard";
  });
  const bonus = requirements.filter((r) => {
    const o = state.overrides[r.key]?.importance_override ?? r.importance;
    return o === "soft";
  });
  const country = COUNTRY_OPTIONS.find((c) => c.value === state.country);

  return (
    <div className="grid lg:grid-cols-2 gap-5">
      {/* Marketing site preview */}
      <div
        className="bg-pg-white rounded-2xl flex flex-col"
        style={{ border: "1px solid var(--pg-border)" }}
      >
        <div
          className="px-5 py-3 flex items-center justify-between"
          style={{ borderBottom: "1px solid var(--pg-border)" }}
        >
          <div>
            <Eyebrow tone="ink">Preview marketing site</Eyebrow>
            <div
              className="text-[13px] font-semibold mt-0.5"
              style={{ color: "var(--pg-ink-tertiary)", fontFamily: "var(--font-mono)" }}
            >
              perantauglobal.com/lowongan/{state.slug || "[slug]"}
            </div>
          </div>
          <span
            className="text-[10px] font-bold tracking-[0.1em] uppercase px-2 py-0.5 rounded"
            style={{ background: "var(--pg-ink-50)", color: "var(--pg-ink-tertiary)", fontFamily: "var(--font-mono)" }}
          >
            Desktop
          </span>
        </div>
        <div className="px-7 py-7 flex flex-col gap-4">
          <div
            className="text-[11px] font-semibold tracking-[0.12em] uppercase"
            style={{ color: "var(--pg-ink-tertiary)", fontFamily: "var(--font-mono)" }}
          >
            {country?.label ?? "—"} · {state.role || "—"}
          </div>
          <h2 className="text-[28px] font-extrabold tracking-[-0.025em]">
            {state.name || "[Nama posisi]"}
          </h2>
          {state.description && (
            <p className="text-[14px] text-pg-ink-tertiary leading-relaxed">
              {state.description}
            </p>
          )}
          {requirements.length > 0 && (
            <div
              className="rounded-xl p-4"
              style={{ background: "var(--pg-red-soft-bg)" }}
            >
              <div
                className="text-[10px] font-bold tracking-[0.12em] uppercase mb-2"
                style={{ color: "var(--pg-red-600)", fontFamily: "var(--font-mono)" }}
              >
                Persyaratan utama
              </div>
              <ul className="flex flex-col gap-1">
                {wajib.map((r) => (
                  <li key={r.key} className="flex items-start gap-2 text-[13px]">
                    <span
                      className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
                      style={{ background: "var(--pg-red-600)" }}
                    />
                    <span>
                      {r.label} <span className="text-pg-ink-tertiary text-[12px]">(wajib)</span>
                    </span>
                  </li>
                ))}
                {bonus.length > 0 && (
                  <li className="flex items-start gap-2 text-[13px] text-pg-ink-tertiary">
                    <span
                      className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
                      style={{ background: "var(--pg-ink-quaternary)" }}
                    />
                    <span>{bonus.map((r) => r.label).join(" · ")} (bonus)</span>
                  </li>
                )}
              </ul>
            </div>
          )}
          <div
            className="rounded-xl py-3 text-center text-white font-bold"
            style={{ background: "var(--pg-red-600)" }}
          >
            Lamar Sekarang →
          </div>
        </div>
      </div>

      {/* Apply flow preview */}
      <div
        className="rounded-2xl flex flex-col"
        style={{ background: "var(--pg-ink-primary)", color: "white" }}
      >
        <div
          className="px-5 py-3 flex items-center justify-between"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}
        >
          <div>
            <Eyebrow tone="ink-on-dark">Preview apply flow</Eyebrow>
            <div className="text-[13px] font-semibold mt-0.5 opacity-70">Mobile · 390</div>
          </div>
        </div>
        <div className="px-5 py-6 flex flex-col gap-3">
          <div
            className="text-[11px] font-semibold tracking-[0.12em] uppercase opacity-70"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Sekarang · {wajib.length} hal wajib
          </div>
          <h3 className="text-[24px] font-extrabold tracking-[-0.02em]">Lamaran</h3>
          {wajib.map((r) => (
            <div
              key={r.key}
              className="rounded-xl p-3 flex items-start gap-2"
              style={{ background: "rgba(255,255,255,0.08)" }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full mt-2 shrink-0"
                style={{ background: "var(--pg-red-500)" }}
              />
              <div className="min-w-0">
                <div className="text-[13px] font-bold">{r.label}</div>
                <div
                  className="text-[10px] mt-0.5 uppercase opacity-70 tracking-[0.08em]"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {r.evidence_mode === "document"
                    ? "Cert · Wajib · Document"
                    : r.evidence_mode === "self_declared"
                    ? "Cert · Wajib · Self-decl"
                    : "Cert · Wajib · Either"}
                </div>
              </div>
            </div>
          ))}
          {customFields
            .filter((f) => f.collect_at_stage === "applied")
            .map((f, i) => (
              <div
                key={i}
                className="rounded-xl p-3"
                style={{ background: "rgba(255,255,255,0.08)" }}
              >
                <div className="text-[13px] font-bold">{f.field_label}</div>
                <div
                  className="text-[10px] mt-0.5 uppercase opacity-70"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  Hard-pass Q
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

// ─── shared ───
function Eyebrow({
  children,
  tone = "red",
}: {
  children: React.ReactNode;
  tone?: "red" | "ink" | "ink-on-dark";
}) {
  const color =
    tone === "red"
      ? "var(--pg-red-600)"
      : tone === "ink-on-dark"
      ? "rgba(255,255,255,0.7)"
      : "var(--pg-ink-tertiary)";
  return (
    <div
      className="text-[10px] font-semibold tracking-[0.12em] leading-[12px] uppercase"
      style={{ color, fontFamily: "var(--font-mono)" }}
    >
      {children}
    </div>
  );
}

function FieldRow({
  label,
  required,
  badge,
  rightHint,
  children,
}: {
  label: string;
  required?: boolean;
  badge?: string;
  rightHint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-bold text-pg-ink-primary">{label}</span>
          {required && (
            <span
              className="text-[9px] font-bold tracking-[0.1em] uppercase"
              style={{ color: "var(--pg-red-600)", fontFamily: "var(--font-mono)" }}
            >
              Wajib
            </span>
          )}
          {badge && (
            <span
              className="text-[9px] font-bold tracking-[0.1em] uppercase"
              style={{ color: "var(--pg-ink-tertiary)", fontFamily: "var(--font-mono)" }}
            >
              {badge}
            </span>
          )}
        </div>
        {rightHint && (
          <span
            className="text-[11px] font-semibold"
            style={{ color: "var(--pg-ink-tertiary)", fontFamily: "var(--font-mono)" }}
          >
            {rightHint}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

function Hint({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[12px] mt-0.5" style={{ color: "var(--pg-ink-tertiary)" }}>
      {children}
    </div>
  );
}

function ToggleChip({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase"
      style={{
        background: active ? "var(--pg-red-600)" : "var(--pg-ink-50)",
        color: active ? "white" : "var(--pg-ink-tertiary)",
        fontFamily: "var(--font-mono)",
      }}
    >
      {children}
    </button>
  );
}
