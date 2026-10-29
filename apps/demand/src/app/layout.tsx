import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Fraunces, IBM_Plex_Mono, Montserrat } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import Script from "next/script";
import "./globals.css";
import { SITE, CONTACT, CREDENTIALS } from "@/lib/site-config";

// Gate indexing until the public launch is signed off (see robots.ts).
const allowIndex = process.env.NEXT_PUBLIC_ALLOW_INDEX === "true";
const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;
const validGtmId = GTM_ID && /^GTM-[A-Z0-9]+$/.test(GTM_ID) ? GTM_ID : undefined;

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

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(`https://${SITE.domain}`),
  title: {
    default: `${SITE.brandName} - Registered Indonesian Talent Partner`,
    template: `%s - ${SITE.brandName}`,
  },
  description: "Employer-first workforce solutions connecting international employers with Indonesian talent, readiness evidence, documented mobility, and aftercare.",
  icons: {
    icon: [{ url: "/images/icon-dtg.webp", type: "image/webp" }],
  },
  openGraph: {
    type: "website",
    siteName: SITE.brandName,
    title: `${SITE.brandName} - Registered Indonesian Talent Partner`,
    description: "Employer-first workforce solutions connecting international employers with Indonesian talent, readiness evidence, documented mobility, and aftercare.",
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
  address: { "@type": "PostalAddress", streetAddress: "Alamanda Tower Lantai 23, Jl. TB Simatupang No. 22-26 (Kav. 23-24), RT.1/RW.1, Cilandak Barat", addressLocality: "Jakarta Selatan", addressRegion: "DKI Jakarta", postalCode: "12430", addressCountry: "ID" },
  identifier: [
    { "@type": "PropertyValue", name: "P3MI License", value: CREDENTIALS.p3miLicenseNo },
    { "@type": "PropertyValue", name: "Saudi MOFA Registration", value: CREDENTIALS.mofaApprovalDisplay },
  ],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "sales",
    telephone: `+${CONTACT.whatsappDigits}`,
    availableLanguage: ["en", "id"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${plusJakarta.variable} ${fraunces.variable} ${ibmPlexMono.variable} ${montserrat.variable}`}
    >
      <body className="antialiased">
        {validGtmId ? (
          <>
            <Script
              id="google-tag-manager"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!=='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${validGtmId}');`,
              }}
            />
            <noscript>
              <iframe
                src={`https://www.googletagmanager.com/ns.html?id=${validGtmId}`}
                height="0"
                width="0"
                style={{ display: "none", visibility: "hidden" }}
                title="Google Tag Manager"
              />
            </noscript>
          </>
        ) : null}
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
