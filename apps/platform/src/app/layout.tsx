import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Perantau Global — Portal",
  description: "Portal kandidat & admin Perantau Global.",
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
