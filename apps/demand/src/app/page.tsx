import Link from "next/link";
import Image from "next/image";
import { CorporateFooter } from "@/components/corporate/CorporateFooter";
import { CorporateNav } from "@/components/corporate/CorporateNav";
import { ManyFacesSectors } from "@/components/corporate/ManyFacesSectors";
import { articles } from "@/lib/articles";
import { waLink } from "@/lib/site-config";

export default function HomePage() {
  return (
    <main className="corp">
      <CorporateNav />

      <section className="corp-hero" id="top">
        <div className="corp-hero-grid" aria-hidden="true"><i /><i /><i /><i /></div>
        <div className="corp-hero-copy"><div className="corp-hero-primary"><h1>Grow Your Business With Indonesian Talent You Can <em className="corp-hero-highlight">Hire With Confidence</em></h1><p className="corp-lede">When service quality, capacity, or operational continuity is under pressure, DTG helps turn a workforce need into a clearer hiring route—from relevant talent and readiness evidence to documentation, mobility, and aftercare.</p><div className="corp-actions"><a className="corp-button" href={waLink("Hello DTG, I would like to discuss an employer workforce need.")} target="_blank" rel="noreferrer">Discuss your needs</a><Link className="corp-text-link" href="/services">See how DTG supports the hiring journey <span>→</span></Link></div></div></div>
        <div className="corp-hero-statement"><Image className="corp-hero-visual" src="/images/dtg-employer-readiness-hero-v2.png" alt="Indonesian healthcare, hospitality, technical, and logistics professionals reviewing a readiness plan" fill priority sizes="(max-width: 800px) 100vw, 54vw" /><div className="corp-hero-floating-card"><small>MARKET ROUTE</small><strong>Indonesia → Global</strong><span>Employer conversation</span></div></div>
      </section>

      <section className="corp-many-faces"><div className="corp-many-faces-visual"><Image src="/images/dtg-many-faces-group-v2.png" alt="A single group photograph illustrating Indonesian workers across healthcare, care, hospitality, technical, logistics, agriculture, and transport contexts" fill sizes="(max-width: 800px) 100vw, 46vw" /><span>MANY FACES OF INDONESIAN TALENT</span><small className="corp-image-note">Illustrative sector contexts only—not a candidate roster, placement claim, or testimonial.</small></div><div className="corp-many-faces-copy"><p className="corp-kicker">MANY FACES OF INDONESIAN TALENT</p><h2>Many faces. <em>Diverse potential</em> for growing businesses.</h2><p>Across relevant workforce sectors, Indonesian talent can bring different strengths to different business needs. DTG helps employers look beyond the CV by making relevant experience, demonstrated readiness and remaining gaps clearer before commitment.</p><ManyFacesSectors /><Link href="/markets" className="corp-solution-link">Explore relevant talent contexts →</Link></div></section>

      <section className="corp-clients"><div className="corp-clients-heading"><p className="corp-kicker">THE BUSINESS OUTCOME</p><h2>Clearer decisions that help you <em>stay focused on the business.</em></h2><p>DTG turns talent potential into an informed hiring decision.</p><div className="impact-rail"><span>NEED</span><i /> <span>FIT</span><i /> <span>READINESS</span><i /> <span>GROWTH</span></div></div><div className="corp-logo-grid"><div><b>01</b><strong>Role clarity</strong><span>Define the pressure.</span></div><div><b>02</b><strong>Relevant experience</strong><span>See the fit.</span></div><div><b>03</b><strong>Readiness insight</strong><span>Know the gaps.</span></div><div><b>04</b><strong>Controlled route</strong><span>Coordinate the journey.</span></div><div><b>05</b><strong>Aftercare</strong><span>Support the start.</span></div><div><b>06</b><strong>Business growth</strong><span>Strengthen momentum.</span></div></div></section>

      <section className="corp-regions" id="regions"><div className="corp-regions-title"><p className="corp-kicker">MARKET CONVERSATIONS</p><h2>One Indonesia talent partner.<br /><em>Three market conversations.</em></h2></div><div className="region-cards"><Link href="/saudi-gcc" className="region-card market-card-gcc"><h3>Saudi Arabia<br />&amp; GCC</h3><span>Learn more <b>→</b></span></Link><Link href="/europe" className="region-card market-card-europe"><h3>Europe</h3><span>Learn more <b>→</b></span></Link><Link href="/japan" className="region-card market-card-japan"><h3>Japan</h3><span>Learn more <b>→</b></span></Link></div></section>

      <section className="corp-home-insights"><div className="corp-insights-intro"><p className="corp-kicker">ARTICLES</p><h2>Perspectives on people<br />and <em>global work.</em></h2></div><div className="corp-home-insight-list">{articles.slice(0, 3).map((article, index) => <article key={article.slug}><Link className="corp-home-insight-image" href={`/articles/${article.slug}`} aria-label={`Read ${article.title}`}><Image src={article.cover} alt="" fill sizes="(max-width: 800px) 100vw, 31vw" /></Link><div className="corp-home-insight-body"><span>{String(index + 1).padStart(2, "0")}</span><small>{article.category}</small><p>{article.title}</p><b><Link href={`/articles/${article.slug}`}>Read article</Link></b></div></article>)}</div><Link className="corp-insights-cta" href="/articles">View all articles <span>→</span></Link></section>

      <section className="corp-contact" id="contact"><div className="corp-contact-decoration" aria-hidden="true"><span>ROLE FIT</span><i /><span>MARKET ROUTE</span><i /><span>AFTERCARE</span></div><p className="corp-kicker">EMPLOYER INQUIRY</p><h2>Ready To Build A Clearer<br /><em>Global Workforce Route?</em></h2><p className="corp-contact-intro">Start with the business need. DTG will help shape the right conversation around role fit, readiness, and a managed route forward.</p><a href={waLink("Hello DTG, I would like to discuss an employer workforce need.")} target="_blank" rel="noreferrer" className="corp-button">Discuss your needs <span>→</span></a></section>

      <CorporateFooter />
    </main>
  );
}

