import { Source_Sans_3, Plus_Jakarta_Sans, IBM_Plex_Mono } from "next/font/google";
import { GoogleTagManager } from "@next/third-parties/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { organizationJsonLd } from "@/lib/jsonld";
import { CONSENT_DEFAULT_SNIPPET } from "@/lib/consent-mode";
import { CookieConsent } from "@/components/pg/CookieConsent";

const sourceSans = Source_Sans_3({ subsets: ["latin"], variable: "--font-source-sans" });
const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-plus-jakarta-sans",
});
const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-ibm-plex-mono",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <head>
        {/* MUST stay the first script in <head>. Google Consent Mode only binds
            if the default is set before the GTM container loads, and this raw
            inline tag runs during HTML parse while GTM is injected
            afterInteractive. Do not reorder, and do not convert to next/script. */}
        <script dangerouslySetInnerHTML={{ __html: CONSENT_DEFAULT_SNIPPET }} />
        <meta name="facebook-domain-verification" content="zx2p47avxqeti0ubzprw6diut6gte8" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd()),
          }}
        />
      </head>
      <GoogleTagManager gtmId="GTM-NK3TM7K7" />
      <body className={`${sourceSans.variable} ${plusJakarta.variable} ${ibmPlexMono.variable} font-sans antialiased`}>
        <NextIntlClientProvider messages={messages}>
          {children}
          <CookieConsent />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
