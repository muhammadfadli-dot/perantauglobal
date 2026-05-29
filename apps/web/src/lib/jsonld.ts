import { SITE_URL } from "./site";

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "PT Daya Talenta Global",
    alternateName: "Perantau Global",
    url: SITE_URL,
    logo: `${SITE_URL}/images/logo.png`,
    description:
      "P3MI resmi (Perusahaan Penempatan Pekerja Migran Indonesia) yang menyediakan layanan penempatan tenaga kerja Indonesia ke Jepang dan Timur Tengah.",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Jl. Panjang No.28 11B, Kedoya Selatan",
      addressLocality: "Jakarta Barat",
      addressRegion: "DKI Jakarta",
      postalCode: "11520",
      addressCountry: "ID",
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+62-811-1927-9000",
      contactType: "customer service",
      availableLanguage: ["Indonesian", "English"],
    },
    sameAs: [
      "https://www.instagram.com/perantauglobal",
      "https://www.tiktok.com/@perantauglobal",
      "https://www.linkedin.com/company/perantauglobal",
    ],
    parentOrganization: {
      "@type": "Organization",
      name: "DayaLima Group",
      url: "https://dayalima.com",
    },
  };
}

export function articleJsonLd({
  title,
  description,
  date,
  author,
  slug,
  locale,
  tags,
}: {
  title: string;
  description: string;
  date: string;
  author: string;
  slug: string;
  locale: string;
  tags?: string[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    datePublished: date,
    dateModified: date,
    author: {
      "@type": "Organization",
      name: author,
      url: SITE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: "PT Daya Talenta Global",
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/images/logo.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}${locale === "id" ? "" : `/${locale}`}/blog/${slug}`,
    },
    ...(tags && { keywords: tags.join(", ") }),
  };
}

export function faqJsonLd(items: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function localBusinessJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "PT Daya Talenta Global",
    alternateName: "Perantau Global",
    url: SITE_URL,
    logo: `${SITE_URL}/images/logo.png`,
    telephone: "+62-852-1141-5104",
    email: "info@dayatalentaglobal.id",
    address: {
      "@type": "PostalAddress",
      streetAddress:
        "Kantor Taman E3.3 Unit B3-3A, Kawasan Mega Kuningan, Setiabudi",
      addressLocality: "Jakarta Selatan",
      addressRegion: "DKI Jakarta",
      postalCode: "12950",
      addressCountry: "ID",
    },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "08:00",
      closes: "17:00",
    },
  };
}

export function breadcrumbJsonLd(
  items: { name: string; url: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
