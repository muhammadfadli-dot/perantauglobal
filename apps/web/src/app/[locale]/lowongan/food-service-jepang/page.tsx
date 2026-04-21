import { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import FoodServiceJepangContent from "@/components/lowongan/food-service-jepang/FoodServiceJepangContent";

export const metadata: Metadata = {
  title:
    "Lowongan Food Service Jepang — Gaji ~Rp 19.6 Juta/Bulan | Perantau Global",
  description:
    "Lowongan kerja food service Indonesia ke Jepang via SSW. Gaji ¥196,000/bulan (~Rp 19.6 juta), jalur legal Tokutei Ginou. Daftar sekarang di Perantau Global.",
};

export const dynamic = "force-static";

export function generateStaticParams() {
  return [{ locale: "id" }];
}

export default async function FoodServiceJepangPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (locale !== "id") notFound();
  setRequestLocale(locale);

  return <FoodServiceJepangContent />;
}
