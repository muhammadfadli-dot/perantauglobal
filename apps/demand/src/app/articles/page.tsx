import Image from "next/image";
import Link from "next/link";
import { CorporateFooter } from "@/components/corporate/CorporateFooter";
import { CorporateNav } from "@/components/corporate/CorporateNav";
import { articles } from "@/lib/articles";

export default function ArticlesPage() {
  return (
    <main className="corp">
      <CorporateNav />
      <section className="dtg-articles-hero">
        <p className="dtg-breadcrumb"><Link href="/">Home</Link><span>/</span> Articles</p>
        <h1>Articles</h1>
        <p>Perspektif praktis tentang kesiapan talenta, pasar kerja, dan rekrutmen global yang bertanggung jawab.</p>
      </section>
      <section className="dtg-articles-content">
        <nav className="dtg-article-tabs" aria-label="Article categories">
          <span className="is-active">All articles <b>({articles.length})</b></span>
          <span>Market insights</span>
          <span>Employer perspective</span>
          <span>Talent readiness</span>
        </nav>
        <div className="dtg-article-grid">
          {articles.map((article) => (
            <article className="dtg-article-card" key={article.slug}>
              <Link className="dtg-article-image" href={`/articles/${article.slug}`} aria-label={`Read ${article.title}`}>
                <Image src={article.cover} alt="" fill sizes="(max-width: 760px) 100vw, 33vw" />
              </Link>
              <p className="dtg-article-category">{article.category}</p>
              <p className="dtg-article-date">{article.date}</p>
              <h2><Link href={`/articles/${article.slug}`}>{article.title}</Link></h2>
              <p className="dtg-article-excerpt">{article.excerpt}</p>
              <Link className="dtg-read-more" href={`/articles/${article.slug}`}>Read more <span>↗</span></Link>
            </article>
          ))}
        </div>
      </section>
      <CorporateFooter />
    </main>
  );
}
