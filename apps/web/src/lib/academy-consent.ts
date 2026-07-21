/**
 * Single source of truth for the Akademi WEB-registration PDP consent
 * (UU 27/2022).
 *
 * A separate module from apps/platform/src/lib/academy-consent.ts because these
 * are two different Next apps (no cross-app imports), covering two moments of
 * consent: the public LP registration (this file, anon + account creation) vs.
 * in-app enrollment by an already-registered candidate (platform, EnrollPanel
 * -> enroll_in_academy_program). The two files are kept IN SYNC on purpose -
 * same programme, same processing, so both must disclose the same thing. If you
 * change one, change the other.
 *
 * Before 2026-07-21 the LP checkbox showed one string and the route logged a
 * DIFFERENT one ("Memproses pendaftaran kelas Akademi Perantau...") with
 * `granted: true` hardcoded, so the ledger did not evidence what the data
 * subject actually agreed to. Text below is the shown wording plus the
 * cross-border storage disclosure and the policy reference; both client and
 * /api/akademi/[slug] import from here so they can never drift.
 *
 * Cross-border storage is named explicitly: registrant PII lives in Supabase
 * ap-southeast-1 (Singapore), which UU PDP treats as a transfer requiring the
 * data subject to be informed. Policy links are rendered as a SEPARATE line
 * below the label so this string stays exactly reproducible as plain text.
 * No server-only imports here - safe for the client bundle.
 */
export const ACADEMY_CONSENT_PURPOSE = "academy_processing";

export const ACADEMY_CONSENT_TEXT =
  "Saya setuju data saya diproses untuk pendaftaran & penyelenggaraan kelas Akademi Perantau (verifikasi, komunikasi, materi, sertifikat), termasuk penyimpanan di server regional Singapura, sesuai Kebijakan Privasi dan UU PDP 27/2022.";

/**
 * Bumped from "2026-06-02" when shown-text and logged-text were unified and the
 * Singapore clause was added. Older rows keep their original version string on
 * purpose - the ledger records which wording a given registrant agreed to.
 */
export const ACADEMY_CONSENT_VERSION = "2026-07-21";

/** Error shown when the box is not ticked. Same wording client + server. */
export const ACADEMY_CONSENT_REQUIRED_MSG =
  "Centang dulu persetujuan pemrosesan data untuk bisa lanjut daftar kelas.";
