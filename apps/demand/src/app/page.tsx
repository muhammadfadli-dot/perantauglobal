import Link from "next/link";
import Image from "next/image";
import { CorporateFooter } from "@/components/corporate/CorporateFooter";
import { CorporateNav } from "@/components/corporate/CorporateNav";
import { CorporateCtaBanner } from "@/components/corporate/CorporateCtaBanner";
import { articles } from "@/lib/articles";
import { waLink } from "@/lib/site-config";

const capabilities = [["01", "Clarify the workforce gap", "Turn an employer’s pressure point into a clear role, volume, and market brief."], ["02", "Build role-ready shortlists", "Use job-specific fit and readiness insight to support a more confident hiring decision."], ["03", "Support a stable start", "Coordinate a documented recruitment journey and stay connected through aftercare."]];

export default function HomePage() {
  return (
    <main className="corp">
      <CorporateNav />

      <section className="corp-hero" id="top">
        <div className="corp-hero-grid" aria-hidden="true"><i /><i /><i /><i /></div>
        <div className="corp-hero-copy"><div className="corp-hero-primary"><h1>Grow your business with Indonesian talent you can hire <em>with confidence.</em></h1><p className="corp-lede">When service quality, capacity, or operational continuity is under pressure, DTG helps turn a workforce need into a clearer hiring route—from relevant talent and readiness evidence to documentation, mobility, and aftercare.</p><div className="corp-actions"><a className="corp-button" href={waLink("Hello DTG, I would like to discuss an employer workforce need.")} target="_blank" rel="noreferrer">Discuss Your Workforce Needs</a><Link className="corp-text-link" href="/services">See how DTG supports the hiring journey <span>→</span></Link></div></div><div className="corp-hero-trust" aria-label="DTG approach"><span>Employer-first</span><span>Market-aware</span><span>Evidence-led</span></div></div>
        <div className="corp-hero-statement"><Image className="corp-hero-visual" src="/images/dtg-employer-readiness-hero-v2.png" alt="Indonesian healthcare, hospitality, technical, and logistics professionals reviewing a readiness plan" fill priority sizes="(max-width: 800px) 100vw, 54vw" /><div className="corp-hero-floating-card"><small>MARKET ROUTE</small><strong>Indonesia → Global</strong><span>Employer conversation</span></div></div>
      </section>

      <section className="corp-solution-visual" id="services"><div className="corp-solution-copy"><p className="corp-kicker">THE EMPLOYER CHALLENGE → THE DTG RESPONSE</p><h2>Turn workforce pressure into <em>business confidence.</em></h2><p>Business ambition can be slowed by pressure on service, capacity, growth, or operational continuity. DTG connects role definition, market-aware sourcing, readiness evidence, documentation, mobility, and aftercare into one controlled hiring journey.</p><div className="corp-solution-points">{capabilities.map(([number, title, detail]) => <div key={number}><b>{number}</b><span><strong>{title}</strong><small>{detail}</small></span></div>)}</div><Link href="/contact" className="corp-solution-link">Talk through a workforce need →</Link></div></section>

      <section className="corp-many-faces"><div className="corp-many-faces-visual"><Image src="/images/dtg-many-faces-group-v2.png" alt="A single group photograph illustrating Indonesian workers across healthcare, care, hospitality, technical, logistics, agriculture, and transport contexts" fill sizes="(max-width: 800px) 100vw, 46vw" /><span>MANY FACES OF INDONESIAN TALENT</span><small className="corp-image-note">Illustrative sector contexts only—not a candidate roster, placement claim, or testimonial.</small></div><div className="corp-many-faces-copy"><p className="corp-kicker">MANY FACES OF INDONESIAN TALENT</p><h2>Many faces. <em>Diverse potential</em> for growing businesses.</h2><p>Across relevant workforce sectors, Indonesian talent can bring different strengths to different business needs. DTG helps employers look beyond the CV by making relevant experience, demonstrated readiness and remaining gaps clearer before commitment.</p><div className="corp-readiness-points"><span>Relevant experience</span><span>Demonstrated readiness</span><span>Remaining gaps</span></div><div className="corp-many-faces-sectors"><article><strong>Healthcare &amp; care</strong><span>Service quality and continuity.</span></article><article><strong>Hospitality &amp; F&amp;B</strong><span>Capacity and guest experience.</span></article><article><strong>Technical &amp; industrial</strong><span>Safety and demonstrated skill.</span></article></div><Link href="/markets" className="corp-solution-link">Explore relevant talent contexts →</Link></div></section>

      <section className="corp-clients"><div className="corp-clients-heading"><p className="corp-kicker">THE BUSINESS OUTCOME</p><h2>Clearer decisions that help you <em>stay focused on the business.</em></h2><p>DTG turns talent potential into an informed hiring decision, with a visible route from workforce need to fit, readiness, a controlled start, and continuity.</p><div className="impact-rail"><span>NEED</span><i /> <span>FIT</span><i /> <span>READINESS</span><i /> <span>CONTINUITY</span></div></div><div className="corp-logo-grid"><div><b>01</b><strong>Role clarity</strong><span>Define the pressure.</span></div><div><b>02</b><strong>Relevant experience</strong><span>See the fit.</span></div><div><b>03</b><strong>Readiness insight</strong><span>Know the gaps.</span></div><div><b>04</b><strong>Controlled route</strong><span>Coordinate the journey.</span></div><div><b>05</b><strong>Aftercare</strong><span>Support the start.</span></div><div><b>06</b><strong>Business continuity</strong><span>Protect momentum.</span></div></div></section>

      <section className="corp-regions" id="regions"><div className="corp-regions-title"><p className="corp-kicker">MARKET CONVERSATIONS</p><h2>Indonesia expertise.<br /><em>Market-aware delivery.</em></h2></div><div className="region-cards"><Link href="/saudi-gcc" className="region-card market-card-gcc"><h3>Saudi Arabia<br />&amp; GCC</h3><span>Discuss your workforce need <b>→</b></span></Link><Link href="/europe" className="region-card market-card-europe"><h3>Europe</h3><span>Explore employer relevance <b>→</b></span></Link><Link href="/japan" className="region-card market-card-japan"><h3>Japan</h3><span>Explore employer relevance <b>→</b></span></Link></div></section>

      <CorporateCtaBanner
        label="FOR CANDIDATES"
        title={<>Your global career journey belongs with <em>Perantau Global.</em></>}
        description="Candidate information and applications are managed through Perantau Global."
        href="/for-candidates"
        cta="Explore Perantau Global"
        signals={["INDONESIA", "PERANTAU GLOBAL", "GLOBAL CAREERS"]}
      />

      <section className="corp-home-insights"><div className="corp-insights-intro"><p className="corp-kicker">ARTICLES</p><h2>Perspectives on people<br />and <em>global work.</em></h2><Link href="/articles">View all articles</Link></div><div className="corp-home-insight-list">{articles.slice(0, 3).map((article, index) => <article key={article.slug}><Link className="corp-home-insight-image" href={`/articles/${article.slug}`} aria-label={`Read ${article.title}`}><Image src={article.cover} alt="" fill sizes="(max-width: 800px) 100vw, 31vw" /></Link><div className="corp-home-insight-body"><span>{String(index + 1).padStart(2, "0")}</span><small>{article.category}</small><p>{article.title}</p><b><Link href={`/articles/${article.slug}`}>Read article</Link></b></div></article>)}</div></section>

      <section className="corp-contact" id="contact"><div className="corp-contact-decoration" aria-hidden="true"><span>ROLE FIT</span><i /><span>MARKET ROUTE</span><i /><span>AFTERCARE</span></div><p className="corp-kicker">EMPLOYER INQUIRY</p><h2>Grow with confidence.<br /><em>Keep focus on the business.</em></h2><a href={waLink("Hello DTG, I would like to discuss an employer workforce need.")} target="_blank" rel="noreferrer" className="corp-button">Discuss Your Workforce Needs <span>→</span></a><p className="corp-contact-note">WhatsApp-first for employer conversations. Tell us where capacity, service quality, or continuity is under pressure.</p></section>

      <CorporateFooter />
    </main>
  );
}

