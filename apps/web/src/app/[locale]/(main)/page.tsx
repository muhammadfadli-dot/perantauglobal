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

  const positions = await fetchPositionsForCatalog();
  const totalPositions = positions.length;
  const openCount = positions.filter((p) => p.status === "open").length;
  const positionsByCountry: Record<string, number> = {};
  for (const p of positions) {
    positionsByCountry[p.country] = (positionsByCountry[p.country] || 0) + 1;
  }

  return (
    <>
      <main>
        <HomeHero
          totalPositions={totalPositions}
          openCount={openCount}
          positionsByCountry={positionsByCountry}
        />
        <WhatIs />
        <JobPortalDeep totalPositions={totalPositions} />
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
