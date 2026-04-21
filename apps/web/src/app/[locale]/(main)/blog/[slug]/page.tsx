import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { generateMeta } from "@/lib/seo";
import { getContentBySlug, getAllContent } from "@/lib/mdx";
import { MDXRemote } from "next-mdx-remote/rsc";
import NextLink from "next/link";
import ShareButtons from "@/components/blog/ShareButtons";
import ReadingProgress from "@/components/blog/ReadingProgress";
import { mdxComponents } from "@/components/mdx";
import remarkGfm from "remark-gfm";
import { articleJsonLd, breadcrumbJsonLd } from "@/lib/jsonld";
import type { BlogPostFrontmatter } from "@/types/content";
import { Link } from "@/i18n/navigation";
import {
  Accent,
  DisplayHeadline,
  EditorialButton,
  Italic,
  MetaStrip,
  MonoLabel,
} from "@/components/editorial";

export async function generateStaticParams() {
  const params: { locale: string; slug: string }[] = [];
  const posts = getAllContent("blog", "id");
  for (const post of posts) {
    params.push({ locale: "id", slug: post.slug as string });
  }
  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const { frontmatter } = getContentBySlug("blog", locale, slug);
  const fm = frontmatter as BlogPostFrontmatter;

  return generateMeta({
    title: fm.title,
    description: fm.description,
    locale: locale as "id" | "en",
    path: `blog/${slug}`,
    type: "article",
    publishedTime: fm.date,
    authors: [fm.author],
  });
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (locale !== "id") notFound();
  setRequestLocale(locale);
  const { frontmatter, content, readingTime } = getContentBySlug("blog", locale, slug);
  const fm = frontmatter as BlogPostFrontmatter;

  const t = await getTranslations("blog.categories");
  const categoryLabel = fm.category ? t(fm.category) : null;

  const formattedDate = new Date(fm.date).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      <ReadingProgress />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            articleJsonLd({
              title: fm.title,
              description: fm.description,
              date: fm.date,
              author: fm.author,
              slug,
              locale,
              tags: fm.tags,
            })
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Beranda", url: `https://perantauglobal.com/${locale}` },
              { name: "Blog", url: `https://perantauglobal.com/${locale}/blog` },
              { name: fm.title, url: `https://perantauglobal.com/${locale}/blog/${slug}` },
            ])
          ),
        }}
      />

      {/* Editorial article header */}
      <section className="overflow-hidden border-b border-[var(--color-dtg-ink)] bg-[var(--color-dtg-cream)] text-[var(--color-dtg-ink)]">
        <MetaStrip
          left={
            <>
              <Link href="/" className="text-[var(--color-dtg-ink)] no-underline hover:text-[var(--color-dtg-red)]">§ Beranda</Link>
              <span className="mx-2 opacity-30">/</span>
              <Link href={{ pathname: "/blog" }} className="text-[var(--color-dtg-ink)] no-underline hover:text-[var(--color-dtg-red)]">Blog</Link>
            </>
          }
          right={<span className="text-[var(--color-dtg-red)]">● {readingTime.text}</span>}
          tone="cream"
          border="bottom"
        />
        <div className="mx-auto max-w-[960px] px-6 py-14 lg:px-10 lg:py-20 animate-[slideUp_0.6s_var(--ease-out-expo)]">
          <div className="flex flex-wrap items-center gap-2">
            <MonoLabel className="opacity-70">{formattedDate}</MonoLabel>
            {categoryLabel && (
              <span className="border border-[var(--color-dtg-ink)] bg-[var(--color-dtg-red)] px-2.5 py-0.5 font-[family-name:var(--font-mono)] text-[10px] font-bold uppercase tracking-[0.08em] text-white">
                {categoryLabel}
              </span>
            )}
            {fm.tags && fm.tags.map((tag) => (
              <span
                key={tag}
                className="border border-[var(--color-dtg-ink)] bg-white px-2.5 py-0.5 font-[family-name:var(--font-mono)] text-[10px] font-bold uppercase tracking-[0.08em]"
              >
                {tag}
              </span>
            ))}
          </div>
          <DisplayHeadline as="h1" size="hero" className="mt-6 max-w-[24ch]">
            {fm.title}
          </DisplayHeadline>
          <p className="mt-6 max-w-[58ch] text-[clamp(17px,1.8vw,21px)] leading-[1.5] opacity-80">
            {fm.description}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-6 border-t border-[color:rgba(26,26,26,0.25)] pt-5">
            <div>
              <MonoLabel className="opacity-60" size="xs">Penulis</MonoLabel>
              <p className="mt-1 font-[family-name:var(--font-display)] text-[15px] font-extrabold tracking-[-0.02em]">{fm.author}</p>
            </div>
            <span className="opacity-30">·</span>
            <MonoLabel className="opacity-70">{readingTime.text}</MonoLabel>
          </div>
        </div>
      </section>

      {/* MDX article body */}
      <section className="bg-white px-6 py-16 text-[var(--color-dtg-ink)] lg:px-10 lg:py-24">
        <div className="mx-auto max-w-[760px]">
          <article className="prose prose-lg max-w-none prose-headings:font-[family-name:var(--font-display)] prose-headings:tracking-[-0.03em] prose-headings:text-[var(--color-dtg-ink)] prose-h2:mt-14 prose-h2:text-[clamp(28px,3vw,40px)] prose-h2:font-extrabold prose-h2:border-t-2 prose-h2:border-[var(--color-dtg-ink)] prose-h2:pt-6 prose-h3:text-2xl prose-h3:font-extrabold prose-p:text-[18px] prose-p:leading-[1.75] prose-a:text-[var(--color-dtg-red)] prose-a:underline-offset-4 prose-strong:font-extrabold prose-li:text-[18px] prose-li:leading-[1.65] prose-blockquote:border-l-4 prose-blockquote:border-[var(--color-dtg-red)] prose-blockquote:bg-[var(--color-dtg-paper)] prose-blockquote:py-2 prose-blockquote:px-6 prose-blockquote:not-italic prose-blockquote:text-[19px] prose-blockquote:font-medium">
            <MDXRemote source={content} components={mdxComponents} options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }} />
          </article>

          {/* Share */}
          <div className="mt-14 border-t-2 border-[var(--color-dtg-ink)] pt-6">
            <MonoLabel className="mb-3 block opacity-60">Bagikan artikel ini</MonoLabel>
            <ShareButtons
              title={fm.title}
              url={`https://perantauglobal.com/${locale}/blog/${slug}`}
              whatsappLabel="Bagikan via WhatsApp"
              copyLabel="Salin Link"
              copiedLabel="Tersalin!"
            />
          </div>
        </div>
      </section>

      {/* Related posts */}
      <RelatedPostsEditorial locale={locale} currentSlug={slug} category={fm.category} />

      {/* CTA poster */}
      <section className="relative overflow-hidden bg-[var(--color-dtg-red)] text-white">
        <MetaStrip
          left="§ Next step"
          right={<span className="text-white">● Siap merantau? Lihat lowongan aktif</span>}
          tone="red"
          border="bottom"
          className="text-white"
        />
        <div className="mx-auto max-w-[1440px] px-6 py-14 lg:px-14 lg:py-20">
          <DisplayHeadline size="poster" className="max-w-[14ch]">
            Dari artikel,{" "}
            <Italic>ke</Italic> <Accent>aksi.</Accent>
          </DisplayHeadline>
          <p className="mt-6 max-w-[42ch] text-lg leading-[1.5] text-white/90">
            Baca artikel ini? Sekarang lihat lowongan aktif dan daftar kalau cocok.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <EditorialButton href="/" variant="ink" suffix="→">
              Semua lowongan aktif
            </EditorialButton>
            <EditorialButton href="https://wa.me/6285211415104" variant="cream" suffix="→" target="_blank" rel="noopener noreferrer">
              WhatsApp langsung
            </EditorialButton>
          </div>
        </div>
      </section>
    </>
  );
}

function RelatedPostsEditorial({
  locale,
  currentSlug,
  category,
}: {
  locale: string;
  currentSlug: string;
  category?: string;
}) {
  const allPosts = getAllContent("blog", locale, category);
  const related = allPosts
    .filter((p) => (p.slug as string) !== currentSlug)
    .slice(0, 3);

  if (related.length === 0) return null;

  return (
    <section className="bg-[var(--color-dtg-cream)] px-6 py-20 text-[var(--color-dtg-ink)] lg:px-14 lg:py-24">
      <div className="mx-auto max-w-[1440px]">
        <div className="border-t-2 border-[var(--color-dtg-ink)] pt-6">
          <MonoLabel className="opacity-60" size="sm">
            § Artikel terkait
          </MonoLabel>
          <DisplayHeadline size="section" className="mt-4">
            Lebih banyak <Italic>bacaan</Italic>.
          </DisplayHeadline>
        </div>
        <div className="mt-12 grid gap-px border border-[var(--color-dtg-ink)] bg-[var(--color-dtg-ink)] md:grid-cols-3">
          {related.map((post) => {
            const p = post as Record<string, unknown>;
            return (
              <NextLink
                key={p.slug as string}
                href={`/${locale}/blog/${p.slug as string}`}
                className="group flex flex-col justify-between gap-4 bg-white p-7 no-underline text-[var(--color-dtg-ink)] transition-colors hover:bg-[var(--color-dtg-paper)] lg:p-8"
              >
                <div>
                  {typeof p.category === "string" && (
                    <span className="border border-[var(--color-dtg-ink)] bg-[var(--color-dtg-cream)] px-2 py-0.5 font-[family-name:var(--font-mono)] text-[10px] font-bold uppercase tracking-[0.08em]">
                      {p.category}
                    </span>
                  )}
                  <h3 className="mt-4 font-[family-name:var(--font-display)] text-[20px] font-extrabold leading-[1.2] tracking-[-0.02em]">
                    {p.title as string}
                  </h3>
                  <p className="mt-3 line-clamp-3 text-[14px] leading-[1.55] opacity-75">
                    {p.description as string}
                  </p>
                </div>
                <span className="inline-flex items-center gap-2 font-[family-name:var(--font-mono)] text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--color-dtg-red)] transition-transform group-hover:translate-x-1">
                  Baca selengkapnya →
                </span>
              </NextLink>
            );
          })}
        </div>
      </div>
    </section>
  );
}
