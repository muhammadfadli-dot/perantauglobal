import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { LiveDashboard } from "@/components/pg/cek-kesiapan/LiveDashboard";
import { SESSION_KEY } from "@/lib/cek-kesiapan";

export const metadata: Metadata = {
  title: "Live — Analisa Kesiapan Merantau",
  robots: { index: false, follow: false },
};

// Needs the Supabase env at request time, and must never be cached.
export const dynamic = "force-dynamic";

export default async function CekKesiapanLivePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ s?: string }>;
}) {
  const { locale } = await params;
  if (locale !== "id") notFound();
  setRequestLocale(locale);

  // Optional ?s= overrides the session so the presenter can run a fresh board
  // (and so a smoke test stays isolated from the real event session).
  const sp = await searchParams;
  const sessionKey =
    typeof sp.s === "string" && sp.s.trim() ? sp.s.trim().slice(0, 64) : SESSION_KEY;

  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL_V2 || process.env.SUPABASE_URL_V2 || "";
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_V2 ||
    process.env.SUPABASE_ANON_KEY_V2 ||
    "";

  return <LiveDashboard url={url} anonKey={anonKey} sessionKey={sessionKey} />;
}
