import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { generateMeta } from "@/lib/seo";
import { faqJsonLd } from "@/lib/jsonld";
import FaqContent from "@/components/faq/FaqContent";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isId = locale === "id";
  return generateMeta({
    title: isId ? "FAQ - Pertanyaan Umum" : "FAQ - Frequently Asked Questions",
    description: isId
      ? "Jawaban untuk pertanyaan umum seputar bekerja di luar negeri bersama Perantau Global."
      : "Answers to frequently asked questions about working abroad with Perantau Global.",
    locale: locale as "id" | "en",
    path: "faq",
  });
}

const CATEGORIES = ["general", "cost", "requirements", "process", "abroad"] as const;
const CATEGORY_QUESTIONS: Record<string, string[]> = {
  general: ["q1", "q2", "q3"],
  cost: ["q1", "q2"],
  requirements: ["q1", "q2", "q3"],
  process: ["q1", "q2", "q3"],
  abroad: ["q1", "q2", "q3"],
};

export default async function FAQPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (locale !== "id") notFound();
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "faq" });
  const allFaqItems: { question: string; answer: string }[] = [];
  for (const cat of CATEGORIES) {
    for (const qKey of CATEGORY_QUESTIONS[cat]) {
      allFaqItems.push({
        question: t(`categories.${cat}.items.${qKey}.question`),
        answer: t(`categories.${cat}.items.${qKey}.answer`),
      });
    }
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(allFaqItems)) }}
      />
      <FaqContent />
    </>
  );
}
