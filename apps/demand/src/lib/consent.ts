/**
 * Single source of truth for the employer-inquiry consent (UU PDP 27/2022).
 *
 * Deliberately worded for what this form ACTUALLY does today: it does not POST
 * anywhere and nothing is persisted by us. `submitForm` builds a prefilled
 * WhatsApp message and hands it to the visitor's own WhatsApp client, so the
 * only transfer is the one they choose to send. Promising storage-and-processing
 * here would misdescribe the flow in the other direction.
 *
 * The Privacy Policy this text points at is this site's own (/privacy), written
 * for the employer audience and describing the same WhatsApp handoff. The two
 * move together: changing the flow means changing both.
 *
 * When the inquiry is wired to the `employer_inquiries` table (the column
 * already exists in Supabase, migration 0008), this text MUST be rewritten to
 * cover storage + regional hosting, its version bumped, the consent logged
 * server-side the way the candidate-side forms do it, and /privacy sections 4
 * and 10 (what the form does, retention) corrected to match.
 */
export const INQUIRY_CONSENT_TEXT =
  "I agree that the details above may be sent to the Daya Talenta Global team via WhatsApp and used to respond to this inquiry, in line with our Privacy Policy and Indonesia's Personal Data Protection Law (UU 27/2022).";

export const INQUIRY_CONSENT_VERSION = "2026-07-21";

export const INQUIRY_CONSENT_REQUIRED_MSG = "Please agree before sending";

/**
 * This site's own policy (`src/app/privacy/page.tsx`), not the candidate-platform
 * one at perantauglobal.com/privacy: same controller entity, but that policy is
 * written for Indonesian jobseekers and describes a stored-and-processed flow
 * this employer form does not have.
 *
 * Relative on purpose. The form opens it with target="_blank" so an in-progress
 * inquiry is not lost, and a relative href keeps that working on preview
 * deployments as well as the production domain.
 */
export const PRIVACY_POLICY_URL = "/privacy";
