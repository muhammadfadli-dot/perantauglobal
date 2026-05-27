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
import { POSITIONS } from "@/lib/positions";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  await params;
  return generateMeta({
    title: "Perantau Global — Aplikasi Kerja Luar Negeri Resmi (P3MI)",
    description:
      "Perantau Global (PT Daya Talenta Global) — P3MI resmi Kemnaker, bagian dari DayaLima yang sudah jalan sejak 1998. Lowongan & sertifikasi siap kerja: bebas biaya sebelum offering letter, proses transparan, tanpa calo.",
    locale: "id",
  });
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const totalPositions = POSITIONS.length;
  const openCount = 1;
  const positionsByCountry: Record<string, number> = {};
  for (const p of POSITIONS) {
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
