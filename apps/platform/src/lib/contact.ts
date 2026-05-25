/**
 * Single source of truth for the Perantau Global WhatsApp contact.
 *
 * Default = the live Perantau Global recruiter line (+62 852-1141-5104).
 * Override per-environment via NEXT_PUBLIC_WA_NUMBER (digits only,
 * e.g. 6281234567890) if you need a different number on preview/staging.
 *
 * Mirrored from apps/web/src/lib/contact.ts — keep the two in sync.
 */

const DEFAULT_NUMBER = "6285211415104";

export const WA_NUMBER =
  process.env.NEXT_PUBLIC_WA_NUMBER?.replace(/\D/g, "") || DEFAULT_NUMBER;

const DEFAULT_MESSAGE =
  "Halo Perantau Global, saya mau tanya tentang lamaran saya.";

export function waLink(message: string = DEFAULT_MESSAGE): string {
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`;
}
