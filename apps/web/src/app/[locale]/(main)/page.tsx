import { setRequestLocale } from "next-intl/server";
import { generateMeta } from "@/lib/seo";
import { WhatsAppFab } from "@/components/pg/WhatsAppFab";
import { HomeHero } from "@/components/pg/home/HomeHero";
import { WhatIs } from "@/components/pg/home/WhatIs";
import { JobPortalDeep } from "@/components/pg/home/JobPortalDeep";
import { LearningPortalDeep } from "@/components/pg/home/LearningPortalDeep";
import { Testimoni } from "@/components/pg/home/Testimoni";
import { Lineage } from "@/components/pg/home/Lineage";
import { HomeFAQ } from "@/components/pg/home/HomeFAQ";
import { FinalCTAv2 } from "@/components/pg/home/FinalCTAv2";
import { fetchPositionsForCatalog } from "@/lib/positions-db";
import { getCountries } from "@/lib/countries";
import { buildHomePreviewRows, buildHomeCountryChips } from "@/lib/homePreview";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  await params;
  return generateMeta({
    title: "Perantau Global — Aplikasi Kerja Luar Negeri Resmi (P3MI)",
    description:
      "Perantau Global (PT Daya Talenta Global) — P3MI resmi Kemnaker, bagian dari Dayalima yang sudah jalan sejak 1998. Lowongan & sertifikasi siap kerja: bebas biaya sebelum offering letter, proses transparan, tanpa calo.",
    locale: "id",
  });
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  // getCountries() is React-cached and fetchPositionsForCatalog already warms it
  // in this same request, so the registry read below costs nothing extra.
  const [positions, registry] = await Promise.all([
    fetchPositionsForCatalog(),
    getCountries(),
  ]);
  const totalPositions = positions.length;
  const openCount = positions.filter((p) => p.status === "open").length;
  const positionsByCountry: Record<string, number> = {};
  for (const p of positions) {
    positionsByCountry[p.country] = (positionsByCountry[p.country] || 0) + 1;
  }
  // "negara tujuan" = countries a candidate can actually land a job in today,
  // i.e. countries with a rendering position - not every registered country.
  const countryCount = Object.keys(positionsByCountry).length;
  const countryNames = Object.keys(positionsByCountry);
  const previewRows = buildHomePreviewRows(positions, registry, 4);
  const countryChips = buildHomeCountryChips(positions, registry, 3);

  return (
    <>
      <main>
        <HomeHero
          totalPositions={totalPositions}
          openCount={openCount}
          positionsByCountry={positionsByCountry}
        />
        <WhatIs
          totalPositions={totalPositions}
          openCount={openCount}
          countryCount={countryCount}
          countryNames={countryNames}
          rows={previewRows.slice(0, 3)}
        />
        <JobPortalDeep
          totalPositions={totalPositions}
          rows={previewRows}
          countryChips={countryChips}
        />
        <LearningPortalDeep />
        <Testimoni />
        <Lineage />
        <HomeFAQ />
        <FinalCTAv2 />
      </main>
      <WhatsAppFab />
    </>
  );
}
