import { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import WaiterSaudiContent from "@/components/lowongan/waiter-saudi-arabia/WaiterSaudiContent";

export const metadata: Metadata = {
  title:
    "Lowongan Waiter Saudi Arabia — Gaji Rp 6-9 Juta/Bulan | Perantau Global",
  description:
    "Lowongan kerja waiter Indonesia ke Saudi Arabia. Gaji Rp 6-9 juta/bulan, tanpa biaya penempatan, proses resmi P3MI. Daftar sekarang di Perantau Global.",
};

export const dynamic = "force-static";

export function generateStaticParams() {
  return [{ locale: "id" }];
}

export default async function WaiterSaudiArabiaPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (locale !== "id") notFound();
  setRequestLocale(locale);

  return <WaiterSaudiContent />;
}
