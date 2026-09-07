import Image from "next/image";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { CorporateFooter } from "@/components/corporate/CorporateFooter";
import { CorporateNav } from "@/components/corporate/CorporateNav";
import { articles, getArticle } from "@/lib/articles";

export function generateStaticParams() { return articles.map(({ slug }) => ({ slug })); }
export function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> { return params.then(({ slug }) => { const article = getArticle(slug); return article ? { title: article.title, description: article.excerpt } : {}; }); }

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const article = getArticle((await params).slug);
  if (!article) notFound();
  const related = articles.filter((item) => item.slug !== article.slug).slice(0, 2);

  return (
    <main className="corp">
      <CorporateNav />
      <section className="dtg-post-hero">
        <div className="dtg-post-hero-copy">
          <p className="dtg-breadcrumb"><Link href="/">Home</Link><span>/</span><Link href="/articles">Articles</Link><span>/</span> {article.category}</p>
          <h1>{article.title}</h1>
        </div>
        <div className="dtg-post-hero-image"><Image src={article.cover} alt="" fill priority sizes="(max-width: 800px) 100vw, 52vw" /></div>
      </section>
      <section className="dtg-post-layout">
        <article className="dtg-post-content">
          <h2>{article.title}</h2>
          <p className="dtg-post-meta"><span>Daya Talenta Global Team</span><span>{article.date}</span><span>{article.category}</span><span>{article.readTime}</span></p>
          <p className="dtg-post-intro">{article.excerpt}</p>
          <div className="dtg-post-body">{article.body.map((block) => <section key={block.heading ?? block.text}>{block.heading && <h3>{block.heading}</h3>}<p>{block.text}</p></section>)}</div>
          <section className="dtg-post-faq"><h3>Hal yang perlu diingat</h3><p>Setiap peluang kerja memiliki kebutuhan dan tahapan yang berbeda. Pastikan Anda selalu membaca informasi peran secara menyeluruh dan menanyakan proses kepada tim kami bila membutuhkan kejelasan.</p></section>
          <p className="dtg-post-tags">Tags: {article.category}, peluang kerja global, Daya Talenta Global</p>
        </article>
        <aside className="dtg-post-sidebar">
          <div className="dtg-related"><p><b>Related articles</b><Link href="/articles">View all →</Link></p>{related.map((item) => <Link className="dtg-related-item" href={`/articles/${item.slug}`} key={item.slug}><Image src={item.cover} alt="" width={76} height={58} /><span><b>{item.title}</b><small>{item.date}</small></span></Link>)}</div>
          <div className="dtg-sidebar-cta"><p>Looking for international opportunities?</p><span>Candidate information, opportunities, and applications are managed by Perantau Global.</span><a href="https://www.perantauglobal.com/" target="_blank" rel="noreferrer">Explore Perantau Global</a></div>
        </aside>
      </section>
      <CorporateFooter />
    </main>
  );
}
