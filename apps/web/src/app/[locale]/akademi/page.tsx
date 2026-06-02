import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { WhatsAppFab } from "@/components/pg/WhatsAppFab";
import { SertHero } from "@/components/pg/sertifikasi/SertHero";
import { LearningPortalExplainer } from "@/components/pg/sertifikasi/LearningPortalExplainer";
import { CertCatalog } from "@/components/pg/sertifikasi/CertCatalog";
import { KamuDapet } from "@/components/pg/sertifikasi/KamuDapet";
import { WhyHere } from "@/components/pg/sertifikasi/WhyHere";
import { PricingTransparency } from "@/components/pg/sertifikasi/PricingTransparency";
import { InlineXlink } from "@/components/pg/sertifikasi/InlineXlink";
import { SertFinalCTA } from "@/components/pg/sertifikasi/SertFinalCTA";

export const metadata: Metadata = {
  title: "Akademi Perantau — Paspor Perantau Global",
  description:
    "Akademi Perantau: psikotes yang diakui formal + pelatihan fundamental per negara tujuan (Saudi Arabia, Jepang). Bukan syarat dari kami — kredensial yang memang kamu butuhkan untuk berangkat.",
};

export const dynamic = "force-static";

export function generateStaticParams() {
  return [{ locale: "id" }];
}

export default async function AkademiPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (locale !== "id") notFound();
  setRequestLocale(locale);

  return (
    <>
      <main>
        <SertHero />
        <LearningPortalExplainer />
        <CertCatalog />
        <KamuDapet />
        <WhyHere />
        <PricingTransparency />
        <InlineXlink />
        <SertFinalCTA />
      </main>
      <WhatsAppFab />
    </>
  );
}
