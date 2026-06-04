/**
 * IDR money formatting — "Rp 500.000" (no decimals); null → "—".
 *
 * Lives in a server-safe module (NOT "use client") so BOTH the server-rendered
 * AgentDetailPage and the client CommissionLedger can import it. A Server
 * Component cannot CALL a function exported from a "use client" module — doing
 * so throws "Attempted to call formatIDR() from the server but it's on the
 * client." (which 500'd the agent detail page).
 */
export function formatIDR(amount: number | null): string {
  if (amount == null) return "—";
  return `Rp ${new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 0,
  }).format(amount)}`;
}
