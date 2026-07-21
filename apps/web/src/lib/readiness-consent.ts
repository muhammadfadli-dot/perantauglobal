/**
 * Single source of truth for the readiness-quiz PDP consent (UU 27/2022).
 *
 * /cek-kesiapan persists a real personal data record: `readiness_responses`
 * stores the name the visitor typed plus their answers, score and persona. Until
 * 2026-07-21 it collected that with no consent surface at all.
 *
 * Note this flow does NOT write to the `consents` ledger. That table requires
 * either a candidate_id or a pending_id (CHECK constraint in migration 0001) and
 * a quiz taker has neither. The affirmative gate is therefore enforced at the
 * client AND the route: without an explicit true the row is never inserted, so
 * no record can exist without consent. Persisting the consent text alongside the
 * response needs a small column migration - tracked as follow-up, deliberately
 * not done inline here because it touches the production schema.
 *
 * No server-only imports here - safe for the client bundle.
 */
export const READINESS_CONSENT_PURPOSE = "readiness_check";

export const READINESS_CONSENT_TEXT =
  "Saya setuju nama dan jawaban saya disimpan untuk analisa kesiapan ini, termasuk penyimpanan di server regional Singapura, sesuai Kebijakan Privasi dan UU PDP 27/2022.";

export const READINESS_CONSENT_VERSION = "2026-07-21";

/** Error shown when the box is not ticked. Same wording client + server. */
export const READINESS_CONSENT_REQUIRED_MSG =
  "Centang dulu persetujuan penyimpanan data untuk mulai analisa.";
