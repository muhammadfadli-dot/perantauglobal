/**
 * REQUIREMENT_VOCABULARY — canonical allowed_values + value_labels per
 * requirement key, derived from REQUIREMENT_LIBRARY plus a few legacy aliases.
 *
 * Used as a render-time fallback: if a position's requirements JSONB defines
 * a key without `allowed_values` (common for legacy seeds in migration 0011
 * that pre-date v3), readiness layer pulls the canonical options from here so
 * the candidate UI always renders selectable choices instead of a free-text
 * input.
 *
 * Add new entries to REQUIREMENT_LIBRARY first; the vocabulary picks them up
 * automatically. Use ALIAS_MAP only for legacy key renames we can't migrate
 * yet (touching positions.requirements at scale needs a careful data step).
 */

import { REQUIREMENT_LIBRARY } from "./library";

export type RequirementVocabularyEntry = {
  allowed_values: string[];
  value_labels: Record<string, string>;
};

const fromLibrary: Record<string, RequirementVocabularyEntry> = Object.fromEntries(
  REQUIREMENT_LIBRARY.filter((r) => r.allowed_values && r.allowed_values.length > 0).map(
    (r) => [
      r.key,
      {
        allowed_values: [...r.allowed_values!],
        value_labels: { ...(r.value_labels ?? {}) },
      },
    ],
  ),
);

// Legacy key aliases: positions seeded before v3 use these keys; map each to
// the modern library entry whose vocabulary they should reuse.
const ALIAS_MAP: Record<string, string> = {
  english_level: "english_self",
  experience_type: "experience_years",
  exp_nursing: "experience_years",
};

// Reverse lookup: canonical key → all legacy aliases that share its concept.
// Used by `resolveCredentialValue` so a candidate who filled the question
// under either key still reads correctly when the page asks via the other.
const REVERSE_ALIASES: Record<string, string[]> = Object.entries(ALIAS_MAP).reduce<
  Record<string, string[]>
>((acc, [alias, canonical]) => {
  if (!acc[canonical]) acc[canonical] = [];
  acc[canonical]!.push(alias);
  return acc;
}, {});

/**
 * Read a credential value tolerant of legacy/canonical key drift. Tries the
 * requested key first, then any aliases of the same concept. Returns the
 * first non-empty value, or undefined.
 */
export function resolveCredentialValue(
  credentials: Record<string, unknown>,
  key: string,
): string | undefined {
  const tryKeys = [key];
  // If key is canonical, also check its legacy aliases.
  if (REVERSE_ALIASES[key]) tryKeys.push(...REVERSE_ALIASES[key]);
  // If key is a legacy alias, also check its canonical and sibling aliases.
  const canonical = ALIAS_MAP[key];
  if (canonical) {
    tryKeys.push(canonical);
    if (REVERSE_ALIASES[canonical]) tryKeys.push(...REVERSE_ALIASES[canonical]);
  }
  for (const k of tryKeys) {
    const v = credentials[k];
    if (typeof v === "string" && v.trim() !== "") return v;
  }
  return undefined;
}

const fromAliases: Record<string, RequirementVocabularyEntry> = Object.fromEntries(
  Object.entries(ALIAS_MAP)
    .filter(([, target]) => fromLibrary[target] !== undefined)
    .map(([alias, target]) => [alias, fromLibrary[target]!]),
);

export const REQUIREMENT_VOCABULARY: Record<string, RequirementVocabularyEntry> = {
  ...fromLibrary,
  ...fromAliases,
};

export function getRequirementVocabulary(
  key: string,
): RequirementVocabularyEntry | undefined {
  return REQUIREMENT_VOCABULARY[key];
}
