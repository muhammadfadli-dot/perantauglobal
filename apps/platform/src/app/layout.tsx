import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import { GoogleTagManager } from "@next/third-parties/google";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-plus-jakarta-sans",
});
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  title: "Perantau Global — Portal",
  description: "Portal kandidat & admin Perantau Global.",
  robots: { index: false, follow: false },
};

// Same GTM container as apps/web so browser-side Meta Pixel fires here too.
// Pair this with cross-domain `_fbc` handoff in auth/callback to keep
// attribution intact from ad click → application milestones in portal.
const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID || "GTM-NK3TM7K7";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`${plusJakarta.variable} ${jetbrainsMono.variable}`}>
      <GoogleTagManager gtmId={GTM_ID} />
      <head>
        <meta name="facebook-domain-verification" content="zx2p47avxqeti0ubzprw6diut6gte8" />
      </head>
      <body>{children}</body>
    </html>
  );
}
