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
import type { FormFieldConfig } from "@/components/lowongan";
import { Footer, MobileStickyCTA, Nav, type FooterColumn, type NavAnchor } from "@/components/editorial";

const NS = "lowongan.kaigo-jepang";

const roleFields: FormFieldConfig[] = [
  { name: "jlpt_level", type: "select", required: true, options: ["n5", "n4", "n3", "n2", "no_cert"] },
  { name: "care_certification", type: "select", required: true, options: ["ssw_kaigo", "nursing_d3", "nursing_s1", "caregiver_training", "none"] },
  { name: "experience_years", type: "select", required: true, options: ["none", "less_than_1", "1-3", "3+"] },
];

export default function KaigoJepangContent() {
  const t = useTranslations(NS);
  const navAnchors = t.raw("editorial.nav.anchors") as NavAnchor[];
  const footerColumns: FooterColumn[] = [
    { label: t("editorial.footer.lowonganLabel"), items: t.raw("editorial.footer.lowonganLinks") as string[] },
    { label: t("editorial.footer.kontakLabel"), items: t.raw("editorial.footer.kontakItems") as string[] },
  ];
  return (
    <>
      <Nav anchors={navAnchors} ctaLabel={t("editorial.nav.ctaLabel")} ctaHref="#form" />
      <main>
        <LowonganHero namespace={NS} imageSrc="/images/lowongan/kaigo-jepang-hero.jpg" />
        <LowonganTrustBar namespace={NS} />
        <LowonganRoleInfo namespace={NS} />
        <LowonganBenefits namespace={NS} />
        <LowonganProcess namespace={NS} />
        <LowonganRequirements namespace={NS} />
        <LowonganFAQ namespace={NS} />
        <LowonganForm namespace={NS} apiEndpoint="/api/lowongan/kaigo-jepang" roleFields={roleFields} role="caregiver" country="japan" />
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
