/**
 * Write-path validation for position content + application fields (Fase 2.4c).
 *
 * Finding E3: content/draft_content and field options were written whole-blob
 * with no schema check - malformed data only surfaced at render time. These are
 * the server-side guards that reject malformed writes with a clear message
 * BEFORE they land in the DB.
 *
 * Deliberately hand-rolled (returning a nullable error string) rather than
 * pulling in zod: apps/platform has no other zod usage and already validates
 * this way elsewhere (parseContent, the discriminated-union action results), so
 * this matches the codebase grain and adds no dependency. The rules mirror the
 * shapes in position-content.ts + the ApplicationFieldInput union in actions.ts.
 */

const FIELD_TYPES = new Set([
  "select",
  "radio",
  "number",
  "text",
  "textarea",
  "file",
  "multiselect",
]);
const IMPORTANCES = new Set(["required", "optional"]);
const SECTIONS = new Set(["syarat_utama", "kualifikasi", "screening"]);
const STAGES = new Set(["applied", "screening", "document_check"]);

/**
 * Validate a positions.content / draft_content blob before write. Shallow but
 * catches the shapes that would break the public renderer or the readiness
 * computation (non-object root, list keys that aren't lists, malformed cardMeta).
 * Returns an error message, or null when valid.
 */
export function validateContentForWrite(content: unknown): string | null {
  if (content == null || typeof content !== "object" || Array.isArray(content)) {
    return "Konten tidak valid (harus berupa objek).";
  }
  const c = content as Record<string, unknown>;

  for (const k of ["jobDescription", "qualifications", "process"]) {
    if (c[k] !== undefined && !Array.isArray(c[k])) {
      return `Konten.${k} harus berupa list.`;
    }
  }
  for (const k of ["cardMeta", "fee", "media", "seo", "hero", "trustSignals"]) {
    const v = c[k];
    if (v !== undefined && (v === null || typeof v !== "object" || Array.isArray(v))) {
      return `Konten.${k} tidak valid (harus objek).`;
    }
  }
  return null;
}

type FieldInputLike = {
  field_type?: string;
  importance?: string;
  section?: string;
  collect_at_stage?: string;
  options?: unknown;
};

/**
 * Validate an ApplicationFieldInput (create or partial update) before write.
 * The options shape matters most: a malformed qualifying flag would silently
 * break the screening predicate (finding C1). Returns an error message, or null.
 */
export function validateFieldInput(input: FieldInputLike): string | null {
  if (input.field_type !== undefined && !FIELD_TYPES.has(input.field_type)) {
    return `Tipe field tidak dikenal: "${input.field_type}".`;
  }
  if (input.importance !== undefined && !IMPORTANCES.has(input.importance)) {
    return `Importance tidak valid: "${input.importance}".`;
  }
  if (input.section !== undefined && !SECTIONS.has(input.section)) {
    return `Section tidak valid: "${input.section}".`;
  }
  if (input.collect_at_stage !== undefined && !STAGES.has(input.collect_at_stage)) {
    return `Stage tidak valid: "${input.collect_at_stage}".`;
  }
  if (input.options !== undefined && input.options !== null) {
    if (!Array.isArray(input.options)) return "Options harus berupa list.";
    for (const o of input.options) {
      if (o == null || typeof o !== "object" || Array.isArray(o)) {
        return "Setiap option harus objek {value, label}.";
      }
      const oo = o as Record<string, unknown>;
      if (typeof oo.value !== "string" || typeof oo.label !== "string") {
        return "Setiap option butuh value + label berupa teks.";
      }
      if (oo.qualifying !== undefined && typeof oo.qualifying !== "boolean") {
        return "Field 'qualifying' pada option harus boolean.";
      }
    }
  }
  return null;
}
