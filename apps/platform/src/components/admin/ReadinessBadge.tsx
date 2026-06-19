import { Badge } from "@/components/pg/primitives";

type ReadinessShape = {
  hard_pass?: boolean;
  score_pct?: number;
  /** List RPC (list_applications_for_admin, migration 0082+): does the position
   *  define a real qualifying gate? Presence of this boolean = "list mode". */
  has_gate?: boolean;
  /** Candidate-detail view (ApplicationCard / ReadinessResultV3): full per-field
   *  breakdown. Presence of this object = "detail mode". */
  per_field?: Record<string, { importance?: string } | unknown>;
};

/**
 * Readiness = "does this candidate clear the position's hard qualifying gate?"
 *
 * Two callers, two payload shapes:
 *
 *  • Admin LIST (`list_applications_for_admin`) — ships `has_gate` + `hard_pass`.
 *    Renders a qualifying STATUS, no percentage (the old presence-% colored by
 *    qualifying read as nonsense — e.g. an amber "100%"):
 *      has_gate=false            → "—"           (no qualifying gate to pass)
 *      has_gate=true, hard_pass  → 🟢 Lolos syarat
 *      has_gate=true, !hard_pass → 🟡 Belum lolos
 *    Before migration 0082 the list always shipped per_field:{} and this badge
 *    used empty per_field as its "no requirements" guard → every row showed "—".
 *
 *  • Candidate DETAIL (ApplicationCard) — ships a populated `per_field`. Keeps the
 *    existing per-field % rendering; the card shows the granular "why" alongside.
 */
export function ReadinessBadge({ readiness }: { readiness: unknown }) {
  const r = (readiness ?? {}) as ReadinessShape;

  // ── List mode: explicit qualifying-gate flag from the RPC ──────────────────
  if (typeof r.has_gate === "boolean") {
    if (!r.has_gate) return <Badge variant="mute">—</Badge>;
    if (r.hard_pass) {
      return (
        <Badge variant="ok" icon="check">
          Lolos syarat
        </Badge>
      );
    }
    return <Badge variant="warn">Belum lolos</Badge>;
  }

  // ── Detail mode: per-field % (unchanged) ───────────────────────────────────
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
