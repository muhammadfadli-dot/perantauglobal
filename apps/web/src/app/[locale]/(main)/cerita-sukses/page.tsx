import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { generateMeta } from "@/lib/seo";
import CeritaSuksesContent from "@/components/cerita-sukses/CeritaSuksesContent";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isId = locale === "id";
  return generateMeta({
    title: isId ? "Cerita Sukses" : "Success Stories",
    description: isId
      ? "Kisah nyata para pekerja Indonesia yang berhasil meraih karir global bersama Perantau Global."
      : "Real stories of Indonesian workers who achieved global careers with Perantau Global.",
    locale: locale as "id" | "en",
    path: isId ? "cerita-sukses" : "success-stories",
  });
}

export default async function SuccessStoriesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (locale !== "id") notFound();
  setRequestLocale(locale);
  return <CeritaSuksesContent />;
}
