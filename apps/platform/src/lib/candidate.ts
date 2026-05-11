// Shared candidate-display helpers used across the candidate portal.

/**
 * Format a stable member ID from candidate.id + created_at.
 * Format: PG-YYYY-XXXXX (year of join + first 5 hex chars of UUID).
 * Display-only — NOT a database key. For UI presentation and quick reference
 * during admin/candidate communication (e.g., "tolong cek lamaran PG-2026-A1B2C").
 */
export function formatMemberId(candidateId: string, createdAt: string): string {
  const year = new Date(createdAt).getFullYear();
  const id = candidateId.replace(/-/g, "").slice(0, 5).toUpperCase();
  return `PG-${year}-${id}`;
}

export const EDUCATION_LABEL: Record<string, string> = {
  sma: "SMA / SMK",
  smk: "SMK",
  d3: "D3 sederajat",
  s1: "S1 sederajat",
  s2: "S2 sederajat",
};

export const GENDER_LABEL: Record<string, string> = {
  male: "Pria",
  female: "Wanita",
};
