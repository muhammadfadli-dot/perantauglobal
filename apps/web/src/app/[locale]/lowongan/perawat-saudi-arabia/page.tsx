import { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import PerawatSaudiContent from "@/components/lowongan/perawat-saudi-arabia/PerawatSaudiContent";

export const metadata: Metadata = {
  title:
    "Lowongan Perawat Saudi Arabia — Gaji Rp 12-18 Juta/Bulan | Perantau Global",
  description:
    "Lowongan kerja perawat Indonesia ke Saudi Arabia. Gaji Rp 12-18 juta/bulan, tanpa biaya penempatan, proses resmi P3MI. Daftar sekarang di Perantau Global.",
};

export const dynamic = "force-static";

export function generateStaticParams() {
  return [{ locale: "id" }];
}

export default async function PerawatSaudiArabiaPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (locale !== "id") notFound();
  setRequestLocale(locale);

  return <PerawatSaudiContent />;
}
