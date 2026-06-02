/**
 * Single source of truth for the Akademi enrollment PDP consent (UU 27/2022).
 *
 * The text LOGGED to the consents table must be verbatim what the data subject
 * was SHOWN. Both the client checkbox (EnrollPanel) and the server action
 * (enrollAction → enroll_in_academy_program) import these, so they can never
 * drift. No server-only imports here — safe for the client bundle.
 */
export const ACADEMY_CONSENT_TEXT =
  "Saya setuju data saya diproses untuk pendaftaran & penyelenggaraan kelas Akademi Perantau (verifikasi, komunikasi, materi, sertifikat).";

export const ACADEMY_CONSENT_VERSION = "2026-06-02";
