import { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import ProgramHero from "@/components/program/editorial/ProgramHero";
import ProgramTicker from "@/components/program/editorial/ProgramTicker";
import ProgramFinalCTA from "@/components/program/editorial/ProgramFinalCTA";

// Existing legacy middle sections — kept as-is, to be polished in follow-up
import SPGAbout from "@/components/program/SPGAbout";
import SPGTargetProfile from "@/components/program/SPGTargetProfile";
import SPGHowItWorks from "@/components/program/SPGHowItWorks";
import SPGCommission from "@/components/program/SPGCommission";
import SPGAreaCoverage from "@/components/program/SPGAreaCoverage";
import ProgramBenefits from "@/components/program/ProgramBenefits";
import SPGTestimonials from "@/components/program/SPGTestimonials";
import SPGFAQ from "@/components/program/SPGFAQ";
import SPGSmartForm from "@/components/program/SPGSmartForm";

export const metadata: Metadata = {
  title: "Sahabat Perantau Global — Partner Lapangan DTG, Komisi per Kunjungan LPK",
  description:
    "Jadi Sahabat Perantau Global (SPG) — partner lapangan yang mengunjungi dan mensurvei LPK di seluruh Jawa. Komisi Rp 50.000/survey, bonus milestone, dan bonus kemitraan.",
};

export const dynamic = "force-static";

export function generateStaticParams() {
  return [{ locale: "id" }];
}

const TICKER_ITEMS = [
  { icon: "★", text: "SIP No. KEP.1847/MEN/2019" },
  { icon: "✦", text: "PT Daya Talenta Global" },
  { icon: "◆", text: "Dayalima Group · est. 2008" },
  { icon: "●", text: "Program partner lapangan resmi" },
  { icon: "★", text: "Komisi dibayar bulanan via transfer" },
  { icon: "✦", text: "Jangkauan Jawa · 100+ LPK aktif" },
];

export default async function SPGPage({
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
        namespace="program.spg"
        imageSrc="/images/program/spg-hero.jpg"
        kicker="Program · Sahabat Perantau Global"
        lead="Partner lapangan,"
        italic="komisi"
        accent="per kunjungan."
        serial="No. SPG/24-0102"
        liveLabel="LIVE · Pendaftaran terbuka"
        ctaPrimaryHref="#form"
        ctaSecondaryHref="#about"
        stampLabel="SPG"
        ticketRoute="LPK → DTG"
        ticketLabel="JAWA · 100+ LPK"
        ticketGate="A1"
        ticketSeat="FIELD"
        metaBar={[
          { label: "KOMISI SURVEY", value: "Rp 50rb", sub: "/ LPK dikunjungi" },
          { label: "BONUS MILESTONE", value: "Rp 1 jt", sub: "setelah 25 survey" },
          { label: "BONUS PKS", value: "Rp 500rb", sub: "per LPK tanda tangan" },
          { label: "AREA", value: "Jawa", sub: "100+ LPK aktif" },
        ]}
      />
      <ProgramTicker items={TICKER_ITEMS} />

      {/* Existing sections preserved — polished in follow-up */}
      <div id="about"><SPGAbout /></div>
      <SPGTargetProfile />
      <SPGHowItWorks />
      <SPGCommission />
      <SPGAreaCoverage />
      <ProgramBenefits />
      <SPGTestimonials />
      <SPGFAQ />
      <div id="form"><SPGSmartForm /></div>

      <ProgramFinalCTA
        namespace="program.spg"
        scarcity="Pendaftaran terbuka · mulai dalam hitungan hari"
        headline={{ lead: "Mulai", italic: "jadi", trail: "partner." }}
        ctaPrimary="Daftar SPG sekarang"
        ctaPrimaryHref="#form"
        ctaSecondary="WhatsApp langsung"
        stampLabel="SPG"
        ticketRoute="LPK → DTG"
        ticketLabel="JAWA · 100+ LPK"
        ticketGate="A1"
        ticketSeat="FIELD"
      />
    </main>
  );
}
