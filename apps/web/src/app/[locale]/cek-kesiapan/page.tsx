import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { CekKesiapanFlow } from "@/components/pg/cek-kesiapan/CekKesiapanFlow";

export const metadata: Metadata = {
  title: "Analisa Kesiapan Merantau — Perantau Global",
  description:
    "Cek kesiapanmu berkarier ke luar negeri dalam 7 pertanyaan singkat. Gratis, langsung dapat hasilnya.",
};

export const dynamic = "force-static";
export function generateStaticParams() {
  return [{ locale: "id" }];
}

export default async function CekKesiapanPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (locale !== "id") notFound();
  setRequestLocale(locale);
  return <CekKesiapanFlow />;
}
