import { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import TruckDriverJepangContent from "@/components/lowongan/truck-driver-jepang/TruckDriverJepangContent";

export const metadata: Metadata = {
  title:
    "Lowongan Truck Driver Jepang — Gaji ¥250.000/Bulan (Tokutei Ginou) | Perantau Global",
  description:
    "Lowongan sopir truk Indonesia ke Jepang via visa Tokutei Ginou. Gaji ¥250.000/bulan (~Rp 26 juta), 4-5x lipat rata-rata ID. Daftar sekarang di Perantau Global.",
};

export const dynamic = "force-static";

export function generateStaticParams() {
  return [{ locale: "id" }];
}

export default async function TruckDriverJepangPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (locale !== "id") notFound();
  setRequestLocale(locale);

  return <TruckDriverJepangContent />;
}
