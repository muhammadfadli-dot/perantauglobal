import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { generateMeta } from "@/lib/seo";
import { getAllContent, getCategories } from "@/lib/mdx";
import BlogIndexEditorial from "@/components/blog/BlogIndexEditorial";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isId = locale === "id";
  return generateMeta({
    title: isId ? "Pusat Informasi PMI" : "Employer Resource Center",
    description: isId
      ? "Panduan lengkap untuk calon Pekerja Migran Indonesia — tips, informasi gaji, persyaratan, dan persiapan kerja di luar negeri."
      : "Guide to hiring Indonesian workers.",
    locale: locale as "id" | "en",
    path: "blog",
  });
}

export default async function BlogPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (locale !== "id") notFound();
  setRequestLocale(locale);
  const posts = getAllContent("blog", locale).sort(
    (a, b) =>
      new Date((b as Record<string, unknown>).date as string).getTime() -
      new Date((a as Record<string, unknown>).date as string).getTime()
  );
  const categories = getCategories("blog", locale);

  return <BlogIndexEditorial posts={posts} categories={categories} />;
}
