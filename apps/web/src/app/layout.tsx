import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://perantauglobal.com"),
  title: {
    template: "%s | Perantau Global",
    default: "Perantau Global — Your Best Gateway to Global Career Opportunities",
  },
  description: "PT Daya Talenta Global (Perantau Global) — P3MI terpercaya untuk penempatan tenaga kerja Indonesia ke luar negeri.",
  icons: {
    icon: "/icon.svg",
  },
  openGraph: {
    images: [{ url: "/images/og-default.svg", width: 1200, height: 630 }],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
