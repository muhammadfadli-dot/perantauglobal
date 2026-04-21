import { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import KaigoJepangContent from "@/components/lowongan/kaigo-jepang/KaigoJepangContent";

export const metadata: Metadata = {
  title:
    "Lowongan Caregiver (Kaigo) Jepang — Gaji ~Rp 19 Juta/Bulan | Perantau Global",
  description:
    "Lowongan kerja caregiver (kaigo) Indonesia ke Jepang via SSW. Gaji ¥190,000/bulan (~Rp 19 juta), jalur legal Tokutei Ginou. Daftar sekarang di Perantau Global.",
};

export const dynamic = "force-static";

export function generateStaticParams() {
  return [{ locale: "id" }];
}

export default async function KaigoJepangPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (locale !== "id") notFound();
  setRequestLocale(locale);

  return <KaigoJepangContent />;
}
