/**
 * Single source of truth for the Perantau Global WhatsApp contact.
 *
 * Set NEXT_PUBLIC_WA_NUMBER (digits only, e.g. 6281234567890) in the env /
 * Vercel project. The fallback below is a NON-WORKING placeholder — every
 * WhatsApp link on the site is dead until the real number is configured.
 */

const FALLBACK = "6281200000000";

export const WA_NUMBER =
  process.env.NEXT_PUBLIC_WA_NUMBER?.replace(/\D/g, "") || FALLBACK;

/** True when a real number is configured (placeholder not in use). */
export const WA_CONFIGURED = Boolean(
  process.env.NEXT_PUBLIC_WA_NUMBER?.replace(/\D/g, ""),
);

const DEFAULT_MESSAGE =
  "Halo Perantau Global, saya mau tanya tentang lowongan kerja luar negeri.";

export function waLink(message: string = DEFAULT_MESSAGE): string {
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`;
}
