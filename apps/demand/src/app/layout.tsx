import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Fraunces, IBM_Plex_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { SITE } from "@/lib/site-config";

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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${plusJakarta.variable} ${fraunces.variable} ${ibmPlexMono.variable}`}
    >
      <body className="antialiased">
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
