/**
 * Single source of truth for the event-funnel PDP consents (UU 27/2022).
 *
 * Three separate legal bases live here, deliberately NOT merged:
 *
 *   1. event_registration_processing (REQUIRED) - processing needed to run the
 *      registration itself + the follow-up comms the registrant asked for
 *      (reminder, Zoom link, materi). Bound to an affirmative checkbox (default
 *      UNCHECKED) in EventForm and re-validated in /api/event/[slug].
 *   2. event_marketing (OPTIONAL) - being contacted about job opportunities.
 *      Pre-existing checkbox; the wording is unchanged, it just moved here so
 *      the audit trail can log verbatim what was shown.
 *   3. event_account_processing (REQUIRED for the account upsell) - creating a
 *      talent-pool account from the success screen. Bound to its own checkbox in
 *      EventAccountUpsell, re-validated in /api/event/[slug]/account.
 *
 * Before 2026-07-21 the event LP had NO data-processing consent at all (only an
 * optional marketing box), and the account bridge logged a consent string the
 * user had never been shown, with `granted: true` hardcoded. Both are implied
 * consent, not affirmative consent.
 *
 * The text LOGGED must be verbatim what the data subject was SHOWN, so client
 * and route import from here and can never drift. Policy links are rendered as a
 * SEPARATE line below each label so these strings stay exactly reproducible as
 * plain text.
 *
 * Cross-border storage is named explicitly: registrant PII lives in Supabase
 * ap-southeast-1 (Singapore), which UU PDP treats as a transfer requiring the
 * data subject to be informed. Mirrors apply-consent.ts / academy-consent.ts.
 * No server-only imports here - safe for the client bundle.
 */
export const EVENT_CONSENT_PURPOSE = "event_registration_processing";

export const EVENT_CONSENT_TEXT =
  "Saya setuju data pribadi saya diproses untuk pendaftaran acara ini dan komunikasi tindak lanjutnya (verifikasi, pengingat, link Zoom, dan materi acara) lewat email dan WhatsApp, termasuk penyimpanan di server regional Singapura, sesuai Kebijakan Privasi dan UU PDP 27/2022.";

export const EVENT_CONSENT_VERSION = "2026-07-21";

/** Error shown when the box is not ticked. Same wording client + server. */
export const EVENT_CONSENT_REQUIRED_MSG =
  "Centang dulu persetujuan pemrosesan data untuk bisa daftar acara ini.";

/**
 * Optional marketing opt-in - a SEPARATE legal basis from the required
 * processing consent above, so it stays its own checkbox and its own record.
 * Wording is byte-identical to what the LP has shown since the form shipped;
 * the version string is new only because this text was never logged before
 * (registrations stored a bare `consent_marketing` boolean with no text).
 */
export const EVENT_MARKETING_PURPOSE = "event_marketing";

export const EVENT_MARKETING_TEXT =
  "Saya bersedia dihubungi Perantau Global soal peluang kerja ke luar negeri.";

export const EVENT_MARKETING_VERSION = "2026-07-21";

/**
 * Account-bridge consent (event success screen -> talent-pool account). Heavier
 * processing than the registration itself: it creates an auth user + candidate
 * record that outlives the event, so it gets its own affirmative checkbox rather
 * than riding on the registration consent.
 */
export const EVENT_ACCOUNT_CONSENT_PURPOSE = "event_account_processing";

export const EVENT_ACCOUNT_CONSENT_TEXT =
  "Saya setuju membuat akun talent pool Perantau Global dan data pribadi saya diproses untuk itu (verifikasi akun, pencocokan lowongan, serta komunikasi lewat email dan WhatsApp soal peluang kerja dan program), termasuk penyimpanan di server regional Singapura, sesuai Kebijakan Privasi dan UU PDP 27/2022.";

/**
 * Bumped from "2026-06-16" when the affirmative checkbox landed. Older rows keep
 * their original version string on purpose - the ledger records which wording a
 * given registrant actually agreed to (for pre-bump rows: none, which is exactly
 * what the version pin makes auditable).
 */
export const EVENT_ACCOUNT_CONSENT_VERSION = "2026-07-21";

/** Error shown when the account-bridge box is not ticked. Client + server. */
export const EVENT_ACCOUNT_CONSENT_REQUIRED_MSG =
  "Centang dulu persetujuan pemrosesan data untuk bisa buat akun.";
