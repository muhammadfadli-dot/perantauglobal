import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    template: "%s | Perantau Global",
    default: "Perantau Global — Your Best Gateway to Global Career Opportunities",
  },
  description: "PT Daya Talenta Global (Perantau Global) — P3MI terpercaya untuk penempatan tenaga kerja Indonesia ke luar negeri.",
  icons: {
    icon: "/icon.svg",
  },
  openGraph: {
    images: [{ url: "/og-default.jpg", width: 1200, height: 630 }],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <Analytics />
    </>
  );
}
