import type { Metadata } from "next";
import { Nav } from "@/components/sections/Nav";
import { Hero } from "@/components/sections/Hero";
import { ValueProps } from "@/components/sections/ValueProps";
import { Sectors } from "@/components/sections/Sectors";
import { Process } from "@/components/sections/Process";
import { Guarantee } from "@/components/sections/Guarantee";
import { Credentials } from "@/components/sections/Credentials";
import { Faq } from "@/components/sections/Faq";
import { MarketContact } from "@/components/sections/MarketContact";
import { Footer } from "@/components/sections/Footer";
import { StickyCta } from "@/components/StickyCta";
import { SITE } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Hire Indonesian Talent for Saudi Arabia & GCC",
  description: "Employer-first workforce solutions for Saudi Arabia and GCC, connecting businesses with Indonesian talent through a documented recruitment route and written post-joining protection.",
  alternates: {
    canonical: "/en/saudi-gcc",
    languages: { en: "/en/saudi-gcc", id: "/id/saudi-gcc", ar: "/ar/saudi-gcc" },
  },
  openGraph: {
    title: "Hire Indonesian Talent for Saudi Arabia & GCC | DTG",
    description: "A clear recruitment route for Saudi and GCC employers hiring Indonesian talent.",
    url: "/en/saudi-gcc",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hire Indonesian Talent for Saudi Arabia & GCC | DTG",
    description: "A clear recruitment route for Saudi and GCC employers hiring Indonesian talent.",
  },
};

const englishFaqs = [
  ["How do we begin a Saudi Arabia workforce requirement?", "Start with the occupation, sector, number of roles, intended start date, and current visa-slot status. DTG then confirms the next discussion and relevant requirements."],
  ["How is candidate readiness assessed?", "Relevant experience, skills, language, and readiness are reviewed against the agreed employer brief before a profile is presented."],
  ["What happens after a candidate joins?", "Written six-month protection and the applicable support process are set out in the placement agreement."],
  ["Are you a registered agent?", "DTG is an approved agent registered with Saudi MOFA and holds Indonesian P3MI license No. 1810240237512001, as part of Dayalima Group."],
];

const englishSeoJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Service",
      name: "Indonesian Talent Recruitment for Saudi Arabia & GCC",
      description: "Employer-first workforce solutions for Saudi Arabia and GCC, connecting employers with Indonesian talent through a documented recruitment route and written post-joining protection.",
      url: `https://${SITE.domain}/en/saudi-gcc`,
      serviceType: "International workforce recruitment for employers",
      areaServed: [{ "@type": "Country", name: "Saudi Arabia" }, { "@type": "Place", name: "Gulf Cooperation Council" }],
      availableLanguage: ["en", "id", "ar"],
      provider: { "@type": "Organization", name: SITE.legalName, url: `https://${SITE.domain}` },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `https://${SITE.domain}/` },
        { "@type": "ListItem", position: 2, name: "Saudi Arabia & GCC", item: `https://${SITE.domain}/en/saudi-gcc` },
      ],
    },
    {
      "@type": "FAQPage",
      mainEntity: englishFaqs.map(([question, answer]) => ({ "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer } })),
    },
  ],
};

export default function SaudiGccPage() {
  return <div className="gcc-page"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(englishSeoJsonLd) }} /><Nav market="gcc" /><main><Hero /><ValueProps /><Sectors /><Process /><Guarantee /><Credentials /><Faq /><MarketContact /></main><Footer market="gcc" /><StickyCta /></div>;
}
