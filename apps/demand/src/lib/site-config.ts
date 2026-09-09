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
  // WhatsApp Business line for the BD GCC funnel. Digits only for wa.me.
  // No email here on purpose: info@dayatalentaglobal.com has no live inbox yet,
  // and a dead channel costs more trust than a missing one.
  whatsappDigits: "6285211415104",
  whatsappDisplay: "+62 852 1141 5104",
  office: "Alamanda Tower Lantai 23, Jl. TB Simatupang No. 22-26 (Kav. 23-24), RT.1/RW.1, Cilandak Barat, Kecamatan Cilandak, Kota Jakarta Selatan, DKI Jakarta 12430",
} as const;

export function waLink(
  message = "Hello Daya Talenta Global, we are interested in hiring Indonesian talent.",
): string {
  return `https://wa.me/${CONTACT.whatsappDigits}?text=${encodeURIComponent(message)}`;
}

export const CREDENTIALS = {
  p3miLicenseNo: "1810240237512001", // KNOWN
  mofaApprovalDisplay: "321",
  guaranteeMonths: 3,
} as const;
