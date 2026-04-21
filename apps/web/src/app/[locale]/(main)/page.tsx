import { setRequestLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { generateMeta } from "@/lib/seo";
import { Ticker } from "@/components/editorial";
import HomeHero from "@/components/home/HomeHero";
import HomeLowonganGrid from "@/components/home/HomeLowonganGrid";
import HomeDestinasiAtlas from "@/components/home/HomeDestinasiAtlas";
import HomeTentangDossier from "@/components/home/HomeTentangDossier";
import HomeCeritaSpread from "@/components/home/HomeCeritaSpread";
import HomeBlogGrid from "@/components/home/HomeBlogGrid";
import HomeFinalCTA from "@/components/home/HomeFinalCTA";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isId = locale === "id";
  return generateMeta({
    title: isId
      ? "P3MI Resmi - Penempatan Kerja ke Jepang & Timur Tengah"
      : "Hire Indonesian Workers — Licensed P3MI Recruitment Agency",
    description: isId
      ? "PT Daya Talenta Global (Perantau Global) adalah P3MI resmi yang membantu tenaga kerja Indonesia berkarir di luar negeri. Tanpa biaya penempatan, proses legal & transparan."
      : "PT Daya Talenta Global (Perantau Global) is a government-licensed P3MI providing pre-screened, trained Indonesian workers for Japan, Saudi Arabia, UAE, Qatar & Kuwait.",
    locale: locale as "id" | "en",
  });
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Editorial homepage is ID-only for now; EN employer landing will be rebuilt later.
  if (locale !== "id") notFound();

  const t = await getTranslations("home.editorial");
  const ticker = t.raw("ticker") as { icon: string; text: string }[];

  return (
    <main>
      <HomeHero />
      <Ticker items={ticker} tone="ink" />
      <HomeLowonganGrid />
      <HomeDestinasiAtlas />
      <HomeTentangDossier />
      <HomeCeritaSpread />
      <HomeBlogGrid />
      <HomeFinalCTA />
    </main>
  );
}
