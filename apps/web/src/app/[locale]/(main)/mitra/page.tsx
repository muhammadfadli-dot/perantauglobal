import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { generateMeta } from "@/lib/seo";
import MitraContent from "@/components/mitra/MitraContent";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isId = locale === "id";
  return generateMeta({
    title: isId ? "Kemitraan" : "Partnership",
    description: isId
      ? "Bermitra dengan Perantau Global untuk mendapatkan tenaga kerja Indonesia yang terlatih dan berkualitas."
      : "Partner with Perantau Global to access trained and qualified Indonesian workers.",
    locale: locale as "id" | "en",
    path: isId ? "mitra" : "partners",
  });
}

export default async function PartnersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (locale !== "id") notFound();
  setRequestLocale(locale);
  return <MitraContent />;
}
