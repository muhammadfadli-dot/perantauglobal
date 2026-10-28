import { permanentRedirect } from "next/navigation";

// Preserve previously distributed GCC links while making English the canonical
// default under the new language-first URL structure.
export default function SaudiGccLegacyRoute() {
  permanentRedirect("/en/saudi-gcc");
}
