/**
 * Single source of truth for the job-application PDP consent (UU 27/2022).
 *
 * UU PDP Pasal 20 requires consent that is explicit and informed, so this text
 * is bound to an affirmative checkbox (default UNCHECKED) in ApplyForm and is
 * re-validated server-side in /api/lowongan/[slug]. Before 2026-07-21 the public
 * LP had no checkbox at all - only passive copy under the submit button, with
 * the server logging `granted: true` unconditionally. That is implied consent,
 * not affirmative consent, and it is the higher-volume funnel.
 *
 * The text LOGGED to the `consents` table must be verbatim what the data subject
 * was SHOWN, so both the client and the route import from here and can never
 * drift. Policy links are rendered as a SEPARATE line below the label so this
 * string stays exactly reproducible as plain text.
 *
 * Cross-border storage is named explicitly: candidate PII lives in Supabase
 * ap-southeast-1 (Singapore), which UU PDP treats as a transfer requiring the
 * data subject to be informed. Mirrors cv-consent.ts / academy-consent.ts.
 * No server-only imports here - safe for the client bundle.
 */
export const APPLY_CONSENT_PURPOSE = "application_processing";

export const APPLY_CONSENT_TEXT =
  "Saya setuju data pribadi saya diproses untuk lamaran ini (verifikasi, komunikasi, pencocokan lowongan, dan pembagian ke calon employer serta regulator), termasuk penyimpanan di server regional Singapura, sesuai Kebijakan Privasi dan UU PDP 27/2022.";

/**
 * Bumped from "2026-04-23" when the affirmative checkbox landed. Older rows keep
 * their original version string on purpose - the ledger records which wording a
 * given candidate actually agreed to.
 */
export const APPLY_CONSENT_VERSION = "2026-07-21";

/** Error shown when the box is not ticked. Same wording client + server. */
export const APPLY_CONSENT_REQUIRED_MSG =
  "Centang dulu persetujuan pemrosesan data untuk bisa lanjut daftar.";
