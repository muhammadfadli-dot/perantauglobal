import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { generateMeta } from "@/lib/seo";
import ProsesContent from "@/components/proses/ProsesContent";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isId = locale === "id";
  return generateMeta({
    title: isId ? "Proses Penempatan" : "Placement Process",
    description: isId
      ? "9 tahapan proses penempatan kerja ke luar negeri yang transparan bersama Perantau Global."
      : "9 transparent steps of overseas job placement process with Perantau Global.",
    locale: locale as "id" | "en",
    path: isId ? "proses" : "process",
  });
}

export default async function ProcessPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (locale !== "id") notFound();
  setRequestLocale(locale);

  return <ProsesContent />;
}
