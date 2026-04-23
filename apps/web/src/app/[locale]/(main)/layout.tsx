import { getTranslations } from "next-intl/server";
import {
  Footer,
  MobileStickyCTA,
  Nav,
  type FooterColumn,
  type Masthead,
  type NavAnchor,
} from "@/components/editorial";

/**
 * Shared editorial chrome for all (main) pages.
 * Homepage renders its own chrome (with HomeMasthead) via its page.tsx and
 * overrides this layout's chrome by rendering before/outside the <main> wrapper.
 */
export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = await getTranslations("site.editorial");
  const masthead = t.raw("masthead") as Masthead;
  const anchors = t.raw("nav.anchors") as NavAnchor[];
  const columns: FooterColumn[] = [
    {
      label: t("footer.lowonganLabel"),
      items: t.raw("footer.lowonganLinks") as string[],
    },
    {
      label: t("footer.kontakLabel"),
      items: t.raw("footer.kontakItems") as string[],
    },
  ];

  return (
    <>
      <Nav
        anchors={anchors}
        ctaLabel={t("nav.ctaLabel")}
        ctaHref={t("nav.ctaHref")}
        masthead={masthead}
      />
      {children}
      <Footer
        brand={{ title: "Perantau Global", body: t("footer.brandBody") }}
        columns={columns}
        legal={{ left: t("footer.legalLeft"), right: t("footer.legalRight") }}
      />
      <div className="h-20 md:hidden" />
      <MobileStickyCTA
        metaLeft={t("mobileSticky.metaLeft")}
        metaRight={t("mobileSticky.metaRight")}
        ctaLabel={t("mobileSticky.ctaLabel")}
        formAnchor="/program/global-talent-hub"
        whatsappUrl="https://wa.me/6285211415104"
      />
    </>
  );
}
