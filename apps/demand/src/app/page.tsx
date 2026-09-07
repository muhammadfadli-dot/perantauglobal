import Link from "next/link";
import Image from "next/image";
import { CorporateFooter } from "@/components/corporate/CorporateFooter";
import { CorporateNav } from "@/components/corporate/CorporateNav";
import { articles } from "@/lib/articles";

const capabilities = [["01", "Clarify the workforce gap", "Turn an employer’s pressure point into a clear role, volume, and market brief."], ["02", "Build role-ready shortlists", "Use job-specific fit and readiness insight to support a more confident hiring decision."], ["03", "Support a stable start", "Coordinate a documented recruitment journey and stay connected through aftercare."]];

export default function HomePage() {
  return (
    <main className="corp">
      <CorporateNav />

      <section className="corp-hero" id="top">
        <div className="corp-hero-grid" aria-hidden="true"><i /><i /><i /><i /></div>
        <div className="corp-hero-copy"><p className="corp-kicker">FOR INTERNATIONAL EMPLOYERS · WORKFORCE SOLUTIONS FROM INDONESIA</p><h1>Build a workforce that performs <em>beyond the hire.</em></h1><p className="corp-lede">DTG turns hard-to-fill roles into a clearer workforce plan—connecting role definition, screened Indonesian talent, a documented recruitment route, and support after placement.</p><div className="corp-actions"><Link className="corp-button" href="/contact">Discuss Your Workforce Needs</Link><Link className="corp-text-link" href="/services">See how we solve workforce gaps <span>→</span></Link></div><div className="corp-hero-trust" aria-label="DTG approach"><span>Employer-first</span><span>Market-aware</span><span>Evidence-led</span></div></div>
        <div className="corp-hero-statement"><Image className="corp-hero-visual" src="/images/global-workforce-hero.png" alt="Global professionals moving through an international workplace" fill priority sizes="(max-width: 800px) 100vw, 38vw" /><div className="corp-hero-statement-content"><div className="corp-diamond">◆</div><p>Business need.<br />Workforce fit.<br /><b>Operational confidence.</b></p><span>INDONESIA · CONNECTED TO THE WORLD</span></div></div>
      </section>

      <section className="corp-solution-visual" id="services"><div className="corp-solution-image"><Image src="/images/process-sky.jpg" alt="Workforce planning and collaboration" fill sizes="(max-width: 800px) 100vw, 46vw" /></div><div className="corp-solution-copy"><p className="corp-kicker">THE EMPLOYER PROBLEM → THE DTG SOLUTION</p><h2>Move from hiring need to <em>business readiness.</em></h2><p>Demand can be clear while the route to capable people is not. DTG connects role definition, market-aware sourcing, readiness evidence, and aftercare into one practical workforce plan.</p><div className="corp-solution-points">{capabilities.map(([number, title, detail]) => <div key={number}><b>{number}</b><span><strong>{title}</strong><small>{detail}</small></span></div>)}</div><Link href="/contact" className="corp-solution-link">Talk through a workforce need</Link></div></section>

      <section className="corp-clients"><div className="corp-clients-heading"><p className="corp-kicker">WHAT EMPLOYERS GAIN</p><h2>Business outcomes that help you <em>move with confidence.</em></h2><p>Every engagement is anchored to practical outcomes: clearer roles, better talent fit, a visible hiring route, and a stronger start for the people you hire.</p><div className="impact-rail"><span>NEED</span><i /> <span>FIT</span><i /> <span>START</span><i /> <span>CONTINUITY</span></div></div><div className="corp-logo-grid"><div><b>01</b><strong>Role clarity</strong><span>Align the brief.</span></div><div><b>02</b><strong>Talent fit</strong><span>Match the work.</span></div><div><b>03</b><strong>Less sourcing friction</strong><span>Reduce noise.</span></div><div><b>04</b><strong>Route visibility</strong><span>Track the pathway.</span></div><div><b>05</b><strong>Aftercare</strong><span>Support the start.</span></div><div><b>06</b><strong>Business continuity</strong><span>Protect momentum.</span></div></div></section>

      <section className="corp-regions" id="regions"><div className="corp-regions-title"><p className="corp-kicker">MARKET CONVERSATIONS</p><h2>Indonesia expertise.<br /><em>Market-aware delivery.</em></h2></div><div className="region-cards"><Link href="/saudi-gcc" className="region-card market-card-gcc"><h3>Saudi Arabia<br />&amp; GCC</h3><span>Discuss your workforce need <b>→</b></span></Link><Link href="/europe" className="region-card market-card-europe"><h3>Europe</h3><span>Explore employer relevance <b>→</b></span></Link><Link href="/japan" className="region-card market-card-japan"><h3>Japan</h3><span>Explore employer relevance <b>→</b></span></Link></div></section>

      <section className="corp-talent-bridge"><div className="corp-talent-copy"><p className="corp-kicker">FOR CANDIDATES</p><h2>Your global career journey belongs with <em>Perantau Global.</em></h2><p>Job information, candidate preparation, applications, and candidate support are managed by Perantau Global.</p><Link href="/for-candidates">Explore the candidate route →</Link></div><div className="corp-talent-visual-stack"><div className="corp-candidate-visual"><Image src="/images/global-workforce-hero.png" alt="Indonesian and international professionals moving toward global careers" fill sizes="(max-width: 800px) 100vw, 42vw" /><span>FROM INDONESIA · TO THE WORLD</span></div><div className="corp-bridge-cards"><span>Career information</span><span>Applications</span><span>Preparation</span><span>Stories</span><span>Candidate support</span></div></div></section>

      <section className="corp-home-insights"><div className="corp-insights-intro"><p className="corp-kicker">ARTICLES</p><h2>Perspectives on people<br />and <em>global work.</em></h2><Link href="/articles">View all articles</Link></div><div className="corp-home-insight-list">{articles.slice(0, 3).map((article, index) => <article key={article.slug}><Link className="corp-home-insight-image" href={`/articles/${article.slug}`} aria-label={`Read ${article.title}`}><Image src={article.cover} alt="" fill sizes="(max-width: 800px) 100vw, 31vw" /></Link><div className="corp-home-insight-body"><span>{String(index + 1).padStart(2, "0")}</span><small>{article.category}</small><p>{article.title}</p><b><Link href={`/articles/${article.slug}`}>Read article</Link></b></div></article>)}</div></section>

      <section className="corp-contact" id="contact"><div className="corp-contact-decoration" aria-hidden="true"><span>ROLE FIT</span><i /><span>MARKET ROUTE</span><i /><span>AFTERCARE</span></div><p className="corp-kicker">EMPLOYER INQUIRY</p><h2>Build your next workforce<br /><em>with clarity.</em></h2><Link href="/contact" className="corp-button">Discuss Your Workforce Needs <span>→</span></Link><p className="corp-contact-note">For employers, authorized demand-side intermediaries, and institutional conversations.</p></section>

      <CorporateFooter />
    </main>
  );
}
