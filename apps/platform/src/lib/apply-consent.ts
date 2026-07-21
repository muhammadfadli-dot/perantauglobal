/**
 * Single source of truth for the in-portal job-application PDP consent
 * (UU 27/2022). Portal twin of apps/web `lib/apply-consent.ts` for the public
 * funnel - separate Next apps, so the constant is duplicated by design, never
 * imported across app boundaries.
 *
 * The text LOGGED to the `consents` table must be verbatim what the data
 * subject was SHOWN. Before 2026-07-21 it was not: ApplyWizard rendered a
 * terms-and-conditions statement while the server action logged an unrelated
 * hardcoded purpose_text ("Memproses lamaran kerja...", version "2026-04-23").
 * A ledger row that does not reproduce the shown wording is not evidence of
 * consent, so both the client checkbox (ApplyWizard) and the server action
 * (submitApplication) now import from here and can never drift.
 *
 * Policy links are rendered as a SEPARATE line below the checkbox label so
 * this string stays exactly reproducible as plain text.
 *
 * Cross-border storage is named explicitly: candidate PII lives in Supabase
 * ap-southeast-1 (Singapore), which UU PDP treats as a transfer the data
 * subject must be informed of. Mirrors academy-consent.ts style.
 * No server-only imports here - safe for the client bundle.
 */
export const APPLY_CONSENT_PURPOSE = "application_processing";

export const APPLY_CONSENT_TEXT =
  "Saya menyatakan semua data yang saya berikan benar dan saya setuju data pribadi saya diproses untuk lamaran ini (verifikasi, komunikasi, pencocokan lowongan, dan pembagian ke calon employer serta regulator), termasuk penyimpanan di server regional Singapura, sesuai Kebijakan Privasi dan UU PDP 27/2022.";

/**
 * Bumped from "2026-04-23" when the shown text and the logged text were
 * reconciled. Older rows keep their original version string on purpose - the
 * ledger records which wording a given candidate actually agreed to.
 */
export const APPLY_CONSENT_VERSION = "2026-07-21";
