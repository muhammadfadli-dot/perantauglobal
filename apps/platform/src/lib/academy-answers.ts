import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Screening answers are stored in `academy_enrollments.answers` as raw option
 * values ("sma_smk", "21_30"), not as the text the candidate actually saw. The
 * human wording lives in `program_registration_fields` (field_label + options),
 * which is the same table the public registration form renders from.
 *
 * Showing "pendidikan: sma_smk" to a PIC who has to judge 42 applicants is
 * technically the data and practically useless, so both the admin table and the
 * CSV export decode through here. One source, so they cannot drift.
 */

export type FieldMeta = {
  key: string;
  label: string;
  sort: number;
  /** option value -> label; empty for free-text fields. */
  options: Map<string, string>;
};

type FieldRow = {
  program_slug: string;
  field_key: string;
  field_label: string | null;
  sort_order: number | null;
  options: { value?: string; label?: string }[] | null;
};

/** Field metadata per program slug, for every program passed in. */
export async function loadFieldMeta(
  supabase: SupabaseClient,
  programSlugs: string[],
): Promise<Map<string, Map<string, FieldMeta>>> {
  const byProgram = new Map<string, Map<string, FieldMeta>>();
  const slugs = [...new Set(programSlugs.filter(Boolean))];
  if (slugs.length === 0) return byProgram;

  const { data } = await supabase
    .from("program_registration_fields")
    .select("program_slug, field_key, field_label, sort_order, options")
    .in("program_slug", slugs);

  for (const r of (data ?? []) as FieldRow[]) {
    let fields = byProgram.get(r.program_slug);
    if (!fields) {
      fields = new Map<string, FieldMeta>();
      byProgram.set(r.program_slug, fields);
    }
    const options = new Map<string, string>();
    for (const o of r.options ?? []) {
      if (o?.value != null && o?.label != null) options.set(String(o.value), String(o.label));
    }
    fields.set(r.field_key, {
      key: r.field_key,
      label: r.field_label?.trim() || r.field_key,
      sort: r.sort_order ?? 999,
      options,
    });
  }
  return byProgram;
}

/** Raw JSON answer value to display text. Handles scalar, array, and object. */
export function answerText(v: unknown, options?: Map<string, string>): string {
  if (v == null || v === "") return "";
  if (Array.isArray(v)) return v.map((x) => answerText(x, options)).filter(Boolean).join(", ");
  if (typeof v === "object") return JSON.stringify(v);
  if (typeof v === "boolean") return v ? "Ya" : "Tidak";
  const s = String(v);
  // Fall back to the raw value when a stored answer predates an option being
  // renamed or removed, so an old answer still shows something truthful.
  return options?.get(s) ?? s;
}

export type DecodedAnswer = { key: string; label: string; value: string };

/**
 * Decode one enrollment's answers into ordered, human-readable pairs, following
 * the order the questions appear in the form. Keys with no metadata still come
 * through (tail of the list) rather than being silently dropped.
 */
export function decodeAnswers(
  answers: Record<string, unknown> | null,
  fields: Map<string, FieldMeta> | undefined,
): DecodedAnswer[] {
  if (!answers) return [];
  const out: DecodedAnswer[] = [];
  for (const [key, raw] of Object.entries(answers)) {
    const meta = fields?.get(key);
    const value = answerText(raw, meta?.options);
    if (value === "") continue;
    out.push({ key, label: meta?.label ?? key.replace(/_/g, " "), value });
  }
  const order = (k: string) => fields?.get(k)?.sort ?? 999;
  return out.sort((a, b) => order(a.key) - order(b.key) || a.key.localeCompare(b.key));
}
