import { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import ProgramHero from "@/components/program/editorial/ProgramHero";
import ProgramTicker from "@/components/program/editorial/ProgramTicker";
import ProgramFinalCTA from "@/components/program/editorial/ProgramFinalCTA";

// Existing legacy middle sections — kept, to polish in follow-up
import GTHProblemSolution from "@/components/program/GTHProblemSolution";
import GTHComponents from "@/components/program/GTHComponents";
import GTHJourney from "@/components/program/GTHJourney";
import GTHBenefits from "@/components/program/GTHBenefits";
import GTHForm from "@/components/program/GTHForm";
import GTHFAQ from "@/components/program/GTHFAQ";

export const metadata: Metadata = {
  title: "Global Talent Hub — Siap Kerja di Luar Negeri dengan Sertifikat GTR",
  description:
    "Program persiapan kerja luar negeri dari Dayalima Group. Assessment, modul belajar, try-out, dan sertifikat Global Talent Ready (GTR). Gratis untuk semua kandidat.",
};

export const dynamic = "force-static";

export function generateStaticParams() {
  return [{ locale: "id" }];
}

const TICKER_ITEMS = [
  { icon: "★", text: "SIP No. KEP.1847/MEN/2019" },
  { icon: "✦", text: "PT Daya Talenta Global" },
  { icon: "◆", text: "Dayalima Group · est. 2008" },
  { icon: "●", text: "100% gratis · tanpa biaya kandidat" },
  { icon: "★", text: "Sertifikat Global Talent Ready (GTR)" },
  { icon: "✦", text: "Assessment · modul · try-out · matching" },
];

export default async function GlobalTalentHubPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (locale !== "id") notFound();
  setRequestLocale(locale);

  return (
    <main>
      <ProgramHero
        namespace="program.gth"
        imageSrc="/images/program/global-talent-hub-hero.jpg"
        kicker="Program · Global Talent Hub"
        lead="Siap kerja"
        italic="di luar"
        accent="negeri."
        serial="No. GTH/24-0412"
        liveLabel="LIVE · 100% gratis"
        ctaPrimaryHref="#form"
        ctaSecondaryHref="#problem"
        stampLabel="GTR"
        ticketRoute="SKILL → GLOBAL"
        ticketLabel="ASSESSMENT · MODUL · TRY-OUT"
        ticketGate="C1"
        ticketSeat="READY"
        metaBar={[
          { label: "BIAYA", value: "Rp 0", sub: "100% gratis" },
          { label: "DURASI", value: "6–8 minggu", sub: "Online + offline" },
          { label: "SERTIFIKAT", value: "GTR", sub: "Global Talent Ready" },
          { label: "MATCHING", value: "50+ negara", sub: "Partner internasional" },
        ]}
      />
      <ProgramTicker items={TICKER_ITEMS} />

      {/* Existing sections preserved — polished in follow-up */}
      <div id="problem"><GTHProblemSolution /></div>
      <GTHComponents />
      <GTHJourney />
      <GTHBenefits />
      <div id="form"><GTHForm /></div>
      <GTHFAQ />

      <ProgramFinalCTA
        namespace="program.gth"
        scarcity="Gratis · sertifikat GTR · matching internasional"
        headline={{ lead: "Jadi", italic: "Global Talent", trail: "Ready." }}
        ctaPrimary="Daftar GTH sekarang"
        ctaPrimaryHref="#form"
        ctaSecondary="WhatsApp langsung"
        stampLabel="GTR"
        ticketRoute="SKILL → GLOBAL"
        ticketLabel="ASSESSMENT · MODUL · TRY-OUT"
        ticketGate="C1"
        ticketSeat="READY"
      />
    </main>
  );
}
