/**
 * Single source of truth for the direct sign-up PDP consent (UU 27/2022).
 *
 * This is the standalone account-creation path (someone lands on
 * /auth/sign-up directly), NOT the LP apply funnel - that one stages a
 * pending_submission and logs into the `consents` ledger server-side.
 *
 * Sign-up talks to Supabase Auth straight from the browser, so there is no API
 * route of ours to re-validate in. The consent is therefore recorded where this
 * flow actually persists things: `auth.users.raw_user_meta_data`, stamped with
 * the verbatim text, its version and the timestamp. That gives the same audit
 * property as a ledger row (we can prove what was agreed to, and when) without
 * inventing a second write path.
 *
 * Note the ledger row for this candidate still gets written later, when they
 * apply to a position - this consent covers account creation only.
 */
export const SIGNUP_CONSENT_PURPOSE = "account_processing";

export const SIGNUP_CONSENT_TEXT =
  "Saya setuju data pribadi saya diproses untuk pembuatan dan pengelolaan akun Perantau Global, termasuk penyimpanan di server regional Singapura, sesuai Kebijakan Privasi dan UU PDP 27/2022.";

export const SIGNUP_CONSENT_VERSION = "2026-07-21";

export const SIGNUP_CONSENT_REQUIRED_MSG =
  "Centang dulu persetujuan pemrosesan data untuk bisa daftar.";

/** Canonical apex origin. Matches SITE_URL in the web app - no /id prefix. */
export const WEB_POLICY_ORIGIN = "https://perantauglobal.com";
