/**
 * Shared vocabulary for the employer inquiry form.
 *
 * One module because two sides read it: Contact.tsx renders the selects and
 * builds the WhatsApp message, /api/inquiry maps the submitted values onto
 * `employer_inquiries` columns. Duplicating the option lists is how the stored
 * row and the WhatsApp brief drift apart.
 */

export const COUNTRIES = [
  "Saudi Arabia",
  "United Arab Emirates",
  "Kuwait",
  "Qatar",
  "Bahrain",
  "Oman",
  "Japan",
  "Bulgaria",
  "Other Europe",
  "Other market",
] as const;

export const SECTORS = ["Healthcare", "Hospitality & F&B", "Industrial & Automotive Maintenance", "Manufacturing & Skilled Production", "Caregiving", "Logistics", "Other"] as const;

export const QUANTITIES = [
  { value: "1-5", label: "1 to 5" },
  { value: "6-20", label: "6 to 20" },
  { value: "21-50", label: "21 to 50" },
  { value: "50+", label: "More than 50" },
] as const;

// Placement runs about two months. Asking upfront surfaces a mismatch before
// BD spends a call on it, and tells them which inquiries to work first.
export const TIMELINES = [
  { value: "asap", label: "As soon as possible" },
  { value: "1-3m", label: "Within 1 to 3 months" },
  { value: "3-6m", label: "Within 3 to 6 months" },
  { value: "planning", label: "Planning ahead, no fixed date" },
] as const;

// Both the WhatsApp handoff and the stored row carry the label BD reads, not
// the form's value token.
export function timelineLabel(value: string): string {
  return TIMELINES.find((t) => t.value === value)?.label ?? value;
}

export function quantityLabel(value: string): string {
  return QUANTITIES.find((q) => q.value === value)?.label ?? value;
}

/**
 * What Contact.tsx POSTs to /api/inquiry. Everything optional at the type
 * level: the route re-validates required fields server-side, so a hand-rolled
 * POST can't skip past the browser checks.
 */
export interface InquiryPayload {
  company?: string;
  country?: string;
  sector?: string;
  roles?: string;
  quantity?: string;
  timeline?: string;
  name?: string;
  email?: string;
  mapsLink?: string;
  social?: string;
  notes?: string;
  /** Affirmative PDP consent tick. Must be exactly `true` to store anything. */
  consent?: boolean;
  /** Honeypot — humans never fill this. Named after the hidden input. */
  website?: string;
}
