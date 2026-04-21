import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { generateMeta } from "@/lib/seo";
import { getContentBySlug, getAllContent } from "@/lib/mdx";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import type { ServiceFrontmatter } from "@/types/content";
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
  const services = getAllContent("services", "id");
  for (const service of services) {
    params.push({ locale: "id", slug: service.slug as string });
  }
  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const { frontmatter } = getContentBySlug("services", locale, slug);
  const fm = frontmatter as ServiceFrontmatter;
  return generateMeta({
    title: fm.title,
    description: fm.description,
    locale: locale as "id" | "en",
    path: locale === "id" ? `layanan/${slug}` : `services/${slug}`,
  });
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (locale !== "id") notFound();
  setRequestLocale(locale);
  const { frontmatter, content } = getContentBySlug("services", locale, slug);
  const fm = frontmatter as ServiceFrontmatter;

  return (
    <>
      {/* Editorial hero */}
      <section className="overflow-hidden border-b border-[var(--color-dtg-ink)] bg-[var(--color-dtg-cream)] text-[var(--color-dtg-ink)]">
        <MetaStrip
          left={
            <>
              <Link href="/" className="text-[var(--color-dtg-ink)] no-underline hover:text-[var(--color-dtg-red)]">§ Beranda</Link>
              <span className="mx-2 opacity-30">/</span>
              <Link href={{ pathname: "/layanan" }} className="text-[var(--color-dtg-ink)] no-underline hover:text-[var(--color-dtg-red)]">Layanan</Link>
              <span className="mx-2 opacity-30">/</span>
              <span>{fm.title}</span>
            </>
          }
          right={<span className="text-[var(--color-dtg-red)]">● Layanan Perantau Global</span>}
          tone="cream"
          border="bottom"
        />
        <div className="mx-auto max-w-[1440px] px-6 py-16 lg:px-14 lg:py-20 animate-[slideUp_0.6s_var(--ease-out-expo)]">
          <MonoLabel className="text-[var(--color-dtg-red)] opacity-100" size="sm">
            Dosier layanan
          </MonoLabel>
          <DisplayHeadline as="h1" size="hero" className="mt-6 max-w-[22ch]">
            {fm.title}
          </DisplayHeadline>
          <p className="mt-8 max-w-[58ch] text-[clamp(16px,1.6vw,20px)] leading-[1.5] opacity-80">
            {fm.description}
          </p>
        </div>
      </section>

      {/* MDX Content */}
      <section className="bg-white px-6 py-20 text-[var(--color-dtg-ink)] lg:px-14 lg:py-24">
        <div className="mx-auto max-w-[760px]">
          <article className="prose prose-lg max-w-none prose-headings:font-[family-name:var(--font-display)] prose-headings:tracking-[-0.03em] prose-headings:text-[var(--color-dtg-ink)] prose-h2:mt-14 prose-h2:text-[clamp(28px,3vw,40px)] prose-h2:font-extrabold prose-h2:border-t-2 prose-h2:border-[var(--color-dtg-ink)] prose-h2:pt-6 prose-h3:text-2xl prose-h3:font-extrabold prose-p:text-[17px] prose-p:leading-[1.7] prose-a:text-[var(--color-dtg-red)] prose-a:underline-offset-4 prose-strong:font-extrabold prose-li:text-[17px] prose-li:leading-[1.6] prose-table:border prose-table:border-[var(--color-dtg-ink)] prose-th:bg-[var(--color-dtg-cream)] prose-th:text-left prose-th:font-[family-name:var(--font-mono)] prose-th:text-xs prose-th:uppercase prose-th:tracking-wider prose-th:border prose-th:border-[var(--color-dtg-ink)] prose-th:px-4 prose-th:py-3 prose-td:border prose-td:border-[color:rgba(26,26,26,0.15)] prose-td:px-4 prose-td:py-3 prose-blockquote:border-l-4 prose-blockquote:border-[var(--color-dtg-red)] prose-blockquote:bg-[var(--color-dtg-paper)] prose-blockquote:py-2 prose-blockquote:px-6 prose-blockquote:not-italic">
            <MDXRemote source={content} options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }} />
          </article>
        </div>
      </section>

      {/* CTA poster */}
      <section className="relative overflow-hidden bg-[var(--color-dtg-red)] text-white">
        <MetaStrip
          left="§ Next step"
          right={<span className="text-white">● Konsultasi gratis · respons 24 jam</span>}
          tone="red"
          border="bottom"
          className="text-white"
        />
        <div className="mx-auto max-w-[1440px] px-6 py-14 lg:px-14 lg:py-20">
          <DisplayHeadline size="poster" className="max-w-[18ch]">
            Siap{" "}
            <Italic>mulai</Italic> layanan ini?
          </DisplayHeadline>
          <p className="mt-6 max-w-[42ch] text-lg leading-[1.5] text-white/90">
            Chat tim kami sekarang untuk dapat gambaran detail + proposal.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <EditorialButton href="/kontak" variant="ink" suffix="→">
              Hubungi kami
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
