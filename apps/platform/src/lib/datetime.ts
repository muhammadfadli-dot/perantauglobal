// Shared Asia/Jakarta (WIB, UTC+7) date helpers for admin reporting.
//
// The platform deploys to sin1 with the Node process running in UTC. Bucketing
// metrics by the server's local (UTC) calendar day mis-attributes evening/midnight
// WIB activity to the wrong day — exactly when this migrant-worker audience engages.
// Always bucket day-level reporting via these helpers, never via Date.getDate().

const JAKARTA_DAY = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Jakarta",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** YYYY-MM-DD for the given instant, in Asia/Jakarta. en-CA formats as ISO date. */
export function jakartaDayKey(d: Date): string {
  return JAKARTA_DAY.format(d);
}

/** Day-of-month (1-31) in Asia/Jakarta — for compact axis labels. */
export function jakartaDayOfMonth(d: Date): number {
  return Number(jakartaDayKey(d).slice(8, 10));
}
