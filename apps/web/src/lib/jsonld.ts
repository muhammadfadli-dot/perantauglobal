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

// ISO 3166-1 alpha-2 by the display label we store in positions.country.
// "Eropa Timur" is a region, not a country — BG (the current Europe roster's
// base) is a pragmatic default; refine per-position if we split it out.
const COUNTRY_ISO: Record<string, string> = {
  Jepang: "JP",
  "Saudi Arabia": "SA",
  Taiwan: "TW",
  Indonesia: "ID",
  Meksiko: "MX",
  Bulgaria: "BG",
  Kuwait: "KW",
  "Eropa Timur": "BG",
};

/**
 * Best-effort baseSalary. The authored strings mix conventions
 * ("SAR 3.200", "¥300,000/bulan", "¥180.000 – ¥240.000/bulan", "180 KWD/Month"),
 * so "." and "," are both thousands separators here. Returns null when the
 * currency isn't recognised — better to omit baseSalary than assert a wrong one.
 */
function parseSalary(
  raw: string,
): { currency: string; value?: number; min?: number; max?: number; unit: string } | null {
  let currency = "";
  if (/¥|JPY/i.test(raw)) currency = "JPY";
  else if (/\bSAR\b/i.test(raw)) currency = "SAR";
  else if (/\bKWD\b/i.test(raw)) currency = "KWD";
  else if (/\bMXN\b/i.test(raw)) currency = "MXN";
  else if (/\bRp\b|IDR/i.test(raw)) currency = "IDR";
  else return null;

  const nums = (raw.match(/\d[\d.,]*/g) ?? [])
    .map((s) => parseInt(s.replace(/[.,]/g, ""), 10))
    .filter((n) => Number.isFinite(n) && n > 0);
  if (!nums.length) return null;

  const unit = /jam|hour/i.test(raw) ? "HOUR" : "MONTH";
  if (nums.length === 1) return { currency, value: nums[0], unit };
  return { currency, min: Math.min(...nums), max: Math.max(...nums), unit };
}

/**
 * schema.org JobPosting for /lowongan/[slug] — makes the role eligible for
 * Google for Jobs. Returns null when there's no usable datePosted (an invalid
 * JobPosting is worse than none). Only fields we can assert truthfully are set.
 */
export function jobPostingJsonLd(params: {
  slug: string;
  title: string;
  countryLabel: string;
  city?: string | null;
  jobDescription?: string[];
  datePosted: string | null;
  validThrough?: string | null;
  employerName?: string | null;
  salary?: string | null;
}): Record<string, unknown> | null {
  if (!params.datePosted) return null;

  const descBullets = (params.jobDescription ?? []).filter(Boolean);
  const description =
    descBullets.length > 0
      ? `<p>Lowongan ${params.title} di ${params.countryLabel} lewat Perantau Global (P3MI resmi Kemnaker). Bebas biaya sebelum offering letter.</p><ul>${descBullets
          .map((b) => `<li>${b}</li>`)
          .join("")}</ul>`
      : `Lowongan ${params.title} di ${params.countryLabel} lewat Perantau Global — P3MI resmi Kemnaker, bebas biaya sebelum offering letter.`;

  const iso = COUNTRY_ISO[params.countryLabel];
  const sal = params.salary ? parseSalary(params.salary) : null;

  const baseSalary = sal
    ? {
        "@type": "MonetaryAmount",
        currency: sal.currency,
        value: {
          "@type": "QuantitativeValue",
          ...(sal.value != null
            ? { value: sal.value }
            : { minValue: sal.min, maxValue: sal.max }),
          unitText: sal.unit,
        },
      }
    : null;

  return {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: params.title,
    description,
    datePosted: params.datePosted,
    ...(params.validThrough ? { validThrough: params.validThrough } : {}),
    employmentType: "FULL_TIME",
    directApply: true,
    url: `${SITE_URL}/id/lowongan/${params.slug}`,
    identifier: {
      "@type": "PropertyValue",
      name: "PT Daya Talenta Global",
      value: params.slug,
    },
    hiringOrganization: {
      "@type": "Organization",
      name: "PT Daya Talenta Global",
      sameAs: SITE_URL,
      logo: `${SITE_URL}/images/logo.png`,
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        ...(params.city ? { addressLocality: params.city } : {}),
        addressCountry: iso ?? params.countryLabel,
      },
    },
    applicantLocationRequirements: {
      "@type": "Country",
      name: "Indonesia",
    },
    ...(baseSalary ? { baseSalary } : {}),
  };
}

/** schema.org ItemList for the /lowongan catalog. */
export function jobListItemListJsonLd(
  items: { slug: string; title: string }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE_URL}/id/lowongan/${item.slug}`,
      name: item.title,
    })),
  };
}
