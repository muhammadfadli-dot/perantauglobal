/**
 * Single source of truth for the employer-inquiry consent (UU PDP 27/2022).
 *
 * Worded for what the form ACTUALLY does since v2026-08-04: `submitForm` opens
 * the prefilled WhatsApp handoff AND POSTs to /api/inquiry, which stores the
 * lead in the `employer_inquiries` table (Supabase, Singapore region). The
 * text therefore covers both transfers: our storage-and-processing, and the
 * WhatsApp message the visitor chooses to send. The consent version + grant
 * timestamp are recorded on the stored row (additional_requirements block);
 * the verbatim text for each version lives in this file's git history.
 *
 * The Privacy Policy this text points at is this site's own (/privacy), written
 * for the employer audience and describing the same stored-then-WhatsApp flow.
 * The two move together: changing the flow means changing both in one commit.
 */
export const INQUIRY_CONSENT_TEXT =
  "I agree that Daya Talenta Global may store the details above and process them to respond to this inquiry, including sending them to our team via WhatsApp and contacting me by email or WhatsApp, in line with our Privacy Policy and Indonesia's Personal Data Protection Law (UU 27/2022).";

export const INQUIRY_CONSENT_VERSION = "2026-08-04";

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
