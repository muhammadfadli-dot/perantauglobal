import { redirect } from "next/navigation";

/**
 * Legacy /paspor → /akademi (migration 0060 / Akademi Perantau rebrand).
 *
 * "Paspor Perantau Global" is now one product inside Akademi Perantau, not the
 * tab itself. The old mock page (hardcoded modules) is replaced by the real
 * Akademi engine. Existing links (dashboard invite cards, deep links) land here
 * and forward on.
 */
export default function PasporRedirect() {
  redirect("/akademi");
}
