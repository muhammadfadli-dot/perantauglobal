import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { generateMeta } from "@/lib/seo";
import { localBusinessJsonLd } from "@/lib/jsonld";
import KontakContent from "@/components/kontak/KontakContent";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isId = locale === "id";
  return generateMeta({
    title: isId ? "Hubungi Kami" : "Contact Us",
    description: isId
      ? "Hubungi PT Daya Talenta Global untuk konsultasi penempatan kerja di luar negeri."
      : "Contact PT Daya Talenta Global for overseas placement consultation.",
    locale: locale as "id" | "en",
    path: isId ? "kontak" : "contact",
  });
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (locale !== "id") notFound();
  setRequestLocale(locale);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd()) }}
      />
      <KontakContent />
    </>
  );
}
