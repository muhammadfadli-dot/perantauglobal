import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { generateMeta } from "@/lib/seo";
import { getAllContent } from "@/lib/mdx";
import DestinasiIndexContent from "@/components/destinasi/DestinasiIndexContent";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isId = locale === "id";
  return generateMeta({
    title: isId ? "Negara Tujuan Penempatan" : "Placement Destinations",
    description: isId
      ? "Jelajahi negara tujuan penempatan kerja: Jepang, Arab Saudi, UAE, Qatar, Kuwait."
      : "Explore placement destinations: Japan, Saudi Arabia, UAE, Qatar, Kuwait.",
    locale: locale as "id" | "en",
    path: isId ? "destinasi" : "destinations",
  });
}

export default async function DestinationsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (locale !== "id") notFound();
  setRequestLocale(locale);
  const destinations = getAllContent("destinations", locale);
  return <DestinasiIndexContent destinations={destinations} />;
}
