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

const NS = "lowongan.perawat-saudi-arabia";

const roleFields: FormFieldConfig[] = [
  { name: "str_active", type: "select", required: true, options: ["yes", "no", "inProgress"] },
  { name: "experience_years", type: "select", required: true, options: ["1-2", "3-5", "5+"] },
  { name: "english_level", type: "select", required: true, options: ["basic", "intermediate", "fluent"] },
];

export default function PerawatSaudiContent() {
  const t = useTranslations(NS);

  const navAnchors = t.raw("editorial.nav.anchors") as NavAnchor[];
  const navCta = t("editorial.nav.ctaLabel");
  const footerBrand = t("editorial.footer.brandBody");
  const lowonganLabel = t("editorial.footer.lowonganLabel");
  const lowonganLinks = t.raw("editorial.footer.lowonganLinks") as string[];
  const kontakLabel = t("editorial.footer.kontakLabel");
  const kontakItems = t.raw("editorial.footer.kontakItems") as string[];
  const legalLeft = t("editorial.footer.legalLeft");
  const legalRight = t("editorial.footer.legalRight");

  const stickyMetaLeft = t("editorial.mobileSticky.metaLeft");
  const stickyMetaRight = t("editorial.mobileSticky.metaRight");
  const stickyCta = t("editorial.mobileSticky.ctaLabel");

  const footerColumns: FooterColumn[] = [
    { label: lowonganLabel, items: lowonganLinks },
    { label: kontakLabel, items: kontakItems },
  ];

  return (
    <>
      <Nav anchors={navAnchors} ctaLabel={navCta} ctaHref="#form" />

      <main>
        <LowonganHero namespace={NS} imageSrc="/images/lowongan/perawat-saudi-arabia-hero.jpg" />
        <LowonganTrustBar namespace={NS} />
        <LowonganRoleInfo namespace={NS} />
        <LowonganBenefits namespace={NS} />
        <LowonganProcess namespace={NS} />
        <LowonganRequirements namespace={NS} />
        <LowonganFAQ namespace={NS} />
        <LowonganForm
          namespace={NS}
          apiEndpoint="/api/lowongan/perawat-saudi-arabia"
          roleFields={roleFields}
          role="nurse"
          country="saudi_arabia"
        />
        <LowonganFinalCTA namespace={NS} />
      </main>

      <Footer
        brand={{ title: "Perantau Global", body: footerBrand }}
        columns={footerColumns}
        legal={{ left: legalLeft, right: legalRight }}
      />

      {/* Spacer so footer content isn't hidden behind sticky CTA on mobile */}
      <div className="h-20 md:hidden" />

      <MobileStickyCTA
        metaLeft={stickyMetaLeft}
        metaRight={stickyMetaRight}
        ctaLabel={stickyCta}
        formAnchor="#form"
        whatsappUrl="https://wa.me/6285211415104"
      />
    </>
  );
}
