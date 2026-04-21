import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { generateMeta } from "@/lib/seo";
import TentangContent from "@/components/tentang/TentangContent";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isId = locale === "id";
  return generateMeta({
    title: isId ? "Tentang Perantau Global" : "About Perantau Global",
    description: isId
      ? "Mengenal PT Daya Talenta Global, perusahaan P3MI resmi bagian dari Dayalima Group — grup HR Indonesia sejak 1998."
      : "Learn about PT Daya Talenta Global, a licensed P3MI company part of Dayalima Group — a leading Indonesian HR ecosystem since 1998.",
    locale: locale as "id" | "en",
    path: isId ? "tentang" : "about",
  });
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (locale !== "id") notFound();
  setRequestLocale(locale);

  return <TentangContent />;
}
