import { Badge } from "@/components/pg/primitives";

type ReadinessShape = {
  hard_pass?: boolean;
  score_pct?: number;
  per_field?: Record<string, unknown>;
};

/**
 * Triage indicator for the admin applications list.
 *
 * 🟢 hard_pass + score≥80 → ok (qualified, prioritize)
 * 🟢 hard_pass + score<80 → ok with score (qualified but soft gaps)
 * 🟡 !hard_pass + score≥50 → warn (some hard requirements missing)
 * 🔴 !hard_pass + score<50 → err (most/all hard requirements missing)
 * ⚪ no requirements    → mute "—"
 */
export function ReadinessBadge({ readiness }: { readiness: unknown }) {
  const r = (readiness ?? {}) as ReadinessShape;
  const hardPass = r.hard_pass ?? null;
  const score = typeof r.score_pct === "number" ? r.score_pct : null;
  const fieldCount = r.per_field ? Object.keys(r.per_field).length : 0;

  if (fieldCount === 0 || score === null) {
    return <Badge variant="mute">—</Badge>;
  }

  if (hardPass && score >= 80) {
    return <Badge variant="ok" icon="check">{score}%</Badge>;
  }
  if (hardPass) {
    return <Badge variant="ok">{score}%</Badge>;
  }
  if (score >= 50) {
    return <Badge variant="warn">{score}%</Badge>;
  }
  return <Badge variant="err">{score}%</Badge>;
}
