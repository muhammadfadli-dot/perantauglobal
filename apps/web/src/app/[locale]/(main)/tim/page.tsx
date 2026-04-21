import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { generateMeta } from "@/lib/seo";
import TimContent from "@/components/tim/TimContent";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isId = locale === "id";
  return generateMeta({
    title: isId ? "Tim Kami" : "Our Team",
    description: isId
      ? "Kenali tim profesional Perantau Global yang berdedikasi membantu Anda meraih karir global."
      : "Meet the professional team at Perantau Global.",
    locale: locale as "id" | "en",
    path: isId ? "tim" : "team",
  });
}

export default async function TeamPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (locale !== "id") notFound();
  setRequestLocale(locale);
  return <TimContent />;
}
