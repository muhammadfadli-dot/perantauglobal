// Single-sourced facts for the Daya Talenta Global demand site.
//
// English on-page. No em dash anywhere. "Dayalima" is one word.
// Narrative copy lives inline in each section component (ported verbatim from
// the locked design); only facts that repeat across sections live here, plus
// the WhatsApp deep link. Values marked PENDING must not be shown as final.

export const SITE = {
  domain: "dayatalentaglobal.com",
  legalName: "PT Daya Talenta Global",
  brandName: "Daya Talenta Global",
  tagline:
    "Helping global healthcare, hospitality, and wellness businesses access skilled Indonesian talent.",
  group: { name: "Dayalima Group", heritage: "26+ years" },
} as const;

export const CONTACT = {
  // WhatsApp Business line for the BD funnel. Digits only for wa.me.
  whatsappDigits: "6281999107455",
  whatsappDisplay: "+62 819 9910 7455",
  email: "info@dayatalentaglobal.com", // PENDING confirm - BD inbox
  office: "Kuningan business district, South Jakarta",
} as const;

export function waLink(
  message = "Hello Daya Talenta Global, we are interested in hiring Indonesian talent.",
): string {
  return `https://wa.me/${CONTACT.whatsappDigits}?text=${encodeURIComponent(message)}`;
}

export const CREDENTIALS = {
  p3miLicenseNo: "1810240237512001", // KNOWN
  // Saudi MOFA registration number PENDING from BD; shown as a masked placeholder.
  mofaApprovalDisplay: "•••• ••••",
  guaranteeMonths: 3,
} as const;
