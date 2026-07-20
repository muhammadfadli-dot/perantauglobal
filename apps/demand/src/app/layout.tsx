import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Fraunces, IBM_Plex_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { SITE, CONTACT, CREDENTIALS } from "@/lib/site-config";

// Gate indexing until the public launch is signed off (see robots.ts).
const allowIndex = process.env.NEXT_PUBLIC_ALLOW_INDEX === "true";

// Body / UI
const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-plus-jakarta-sans",
  display: "swap",
});

// Display / headings - heritage serif (locked by the design system)
const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-fraunces",
  display: "swap",
});

// Eyebrows, labels, stat numerals
const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-ibm-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(`https://${SITE.domain}`),
  title: {
    default: `${SITE.brandName} - Registered Indonesian Talent Partner`,
    template: `%s - ${SITE.brandName}`,
  },
  description: SITE.tagline,
  openGraph: {
    type: "website",
    siteName: SITE.brandName,
    title: `${SITE.brandName} - Registered Indonesian Talent Partner`,
    description: SITE.tagline,
    url: `https://${SITE.domain}`,
    locale: "en_US",
  },
  robots: { index: allowIndex, follow: allowIndex },
};

// Organization markup so search and messaging previews resolve the legal entity,
// its group, and the BD line rather than guessing from page copy.
const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE.legalName,
  alternateName: SITE.brandName,
  url: `https://${SITE.domain}`,
  logo: `https://${SITE.domain}/images/dtg-logo.png`,
  description: SITE.tagline,
  parentOrganization: { "@type": "Organization", name: SITE.group.name },
  address: { "@type": "PostalAddress", addressLocality: "South Jakarta", addressCountry: "ID" },
  identifier: [
    { "@type": "PropertyValue", name: "P3MI License", value: CREDENTIALS.p3miLicenseNo },
    { "@type": "PropertyValue", name: "Saudi MOFA Registration", value: CREDENTIALS.mofaApprovalDisplay },
  ],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "sales",
    telephone: `+${CONTACT.whatsappDigits}`,
    availableLanguage: ["en", "id", "ar"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${plusJakarta.variable} ${fraunces.variable} ${ibmPlexMono.variable}`}
    >
      <body className="antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        {/* No-JS fallback: scroll-reveal animations hide content until seen, so
            reveal everything when scripting is unavailable. */}
        <noscript>
          <style dangerouslySetInnerHTML={{ __html: ".anim{opacity:1 !important}" }} />
        </noscript>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
