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

const NS = "lowongan.truck-driver-jepang";

const roleFields: FormFieldConfig[] = [
  { name: "sim_type", type: "select", required: true, options: ["sim_a", "sim_b1", "sim_b2", "sim_internasional"] },
  { name: "driving_years", type: "select", required: true, options: ["1-2", "3-5", "5+"] },
  { name: "jlpt_level", type: "select", required: true, options: ["n5", "n4", "n3", "n2", "no_cert"] },
];

export default function TruckDriverJepangContent() {
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
        <LowonganHero namespace={NS} imageSrc="/images/lowongan/truck-driver-jepang-hero.jpg" />
        <LowonganTrustBar namespace={NS} />
        <LowonganRoleInfo namespace={NS} />
        <LowonganBenefits namespace={NS} />
        <LowonganProcess namespace={NS} />
        <LowonganRequirements namespace={NS} />
        <LowonganFAQ namespace={NS} />
        <LowonganForm
          namespace={NS}
          apiEndpoint="/api/lowongan/truck-driver-jepang"
          roleFields={roleFields}
          role="truck_driver"
          country="japan"
        />
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
