import { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import BaristaSaudiContent from "@/components/lowongan/barista-saudi-arabia/BaristaSaudiContent";

export const metadata: Metadata = {
  title:
    "Lowongan Barista Saudi Arabia — Gaji Rp 7.5-10 Juta/Bulan | Perantau Global",
  description:
    "Lowongan kerja barista Indonesia ke Saudi Arabia. Gaji Rp 7.5-10 juta/bulan, tanpa biaya penempatan, proses resmi P3MI. Daftar sekarang di Perantau Global.",
};

export const dynamic = "force-static";

export function generateStaticParams() {
  return [{ locale: "id" }];
}

export default async function BaristaSaudiArabiaPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (locale !== "id") notFound();
  setRequestLocale(locale);

  return <BaristaSaudiContent />;
}
