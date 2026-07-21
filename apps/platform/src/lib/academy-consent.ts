/**
 * Single source of truth for the Akademi enrollment PDP consent (UU 27/2022).
 *
 * The text LOGGED to the consents table must be verbatim what the data subject
 * was SHOWN. Both the client checkbox (EnrollPanel) and the server action
 * (enrollAction -> enroll_in_academy_program) import these, so they can never
 * drift. No server-only imports here - safe for the client bundle.
 *
 * Kept deliberately IN SYNC with apps/web/src/lib/academy-consent.ts. These are
 * two different Next apps so the constant cannot be shared by import, but they
 * describe the SAME processing of the SAME programme: one learner registering on
 * the public LP and another enrolling inside the portal must be told the same
 * thing. Divergent wording for identical processing is the kind of thing that is
 * hard to defend in an audit, so if you change one, change the other.
 *
 * Cross-border storage is named explicitly: learner PII lives in Supabase
 * ap-southeast-1 (Singapore), which UU PDP treats as a transfer requiring the
 * data subject to be informed.
 */
export const ACADEMY_CONSENT_TEXT =
  "Saya setuju data saya diproses untuk pendaftaran & penyelenggaraan kelas Akademi Perantau (verifikasi, komunikasi, materi, sertifikat), termasuk penyimpanan di server regional Singapura, sesuai Kebijakan Privasi dan UU PDP 27/2022.";

/**
 * Bumped from "2026-06-02" when the Singapore clause was added and the wording
 * was aligned with the web LP. Older rows keep their original version string on
 * purpose - the ledger records which wording a given learner agreed to.
 */
export const ACADEMY_CONSENT_VERSION = "2026-07-21";
