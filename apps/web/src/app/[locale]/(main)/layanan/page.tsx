import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { generateMeta } from "@/lib/seo";
import { getAllContent } from "@/lib/mdx";
import LayananIndexContent from "@/components/layanan/LayananIndexContent";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isId = locale === "id";
  return generateMeta({
    title: isId ? "Layanan Kami" : "Services",
    description: isId
      ? "Layanan penempatan tenaga kerja Indonesia ke luar negeri oleh PT Daya Talenta Global."
      : "End-to-end Indonesian workforce recruitment services.",
    locale: locale as "id" | "en",
    path: isId ? "layanan" : "services",
  });
}

export default async function ServicesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (locale !== "id") notFound();
  setRequestLocale(locale);
  const services = getAllContent("services", locale);
  return <LayananIndexContent services={services} />;
}
