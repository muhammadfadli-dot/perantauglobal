"use client";

import { useTranslations } from "next-intl";
import {
  LowonganHero,
  LowonganTrustBar,
  LowonganRoleInfo,
  LowonganRequirements,
  LowonganProcess,
  LowonganBenefits,
  LowonganFAQ,
  LowonganForm,
  LowonganFinalCTA,
} from "@/components/lowongan";
import { Footer, MobileStickyCTA, Nav, type FooterColumn, type NavAnchor } from "@/components/editorial";

const NS = "lowongan.barista-saudi-arabia";

export default function BaristaSaudiContent() {
  const t = useTranslations(NS);
  const navAnchors = t.raw("editorial.nav.anchors") as NavAnchor[];
  const navCta = t("editorial.nav.ctaLabel");
  const footerColumns: FooterColumn[] = [
    { label: t("editorial.footer.lowonganLabel"), items: t.raw("editorial.footer.lowonganLinks") as string[] },
    { label: t("editorial.footer.kontakLabel"), items: t.raw("editorial.footer.kontakItems") as string[] },
  ];
  return (
    <>
      <Nav anchors={navAnchors} ctaLabel={navCta} ctaHref="#form" />
      <main>
        <LowonganHero namespace={NS} imageSrc="/images/lowongan/barista-saudi-arabia-hero.jpg" />
        <LowonganTrustBar namespace={NS} />
        <LowonganRoleInfo namespace={NS} />
        <LowonganBenefits namespace={NS} />
        <LowonganProcess namespace={NS} />
        <LowonganRequirements namespace={NS} />
        <LowonganFAQ namespace={NS} />
        <LowonganForm namespace={NS} apiEndpoint="/api/lowongan/barista-saudi-arabia"
 role="barista" country="saudi_arabia" />
        <LowonganFinalCTA namespace={NS} />
      </main>
      <Footer
        brand={{ title: "Perantau Global", body: t("editorial.footer.brandBody") }}
        columns={footerColumns}
        legal={{ left: t("editorial.footer.legalLeft"), right: t("editorial.footer.legalRight") }}
      />
      <div className="h-20 md:hidden" />
      <MobileStickyCTA
        metaLeft={t("editorial.mobileSticky.metaLeft")}
        metaRight={t("editorial.mobileSticky.metaRight")}
        ctaLabel={t("editorial.mobileSticky.ctaLabel")}
        formAnchor="#form"
        whatsappUrl="https://wa.me/6285211415104"
      />
    </>
  );
}
