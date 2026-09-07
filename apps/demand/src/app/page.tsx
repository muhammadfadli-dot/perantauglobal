import Link from "next/link";
import Image from "next/image";
import { CorporateFooter } from "@/components/corporate/CorporateFooter";
import { CorporateNav } from "@/components/corporate/CorporateNav";

const capabilities = [["01", "Clarify the workforce gap", "Turn an employer’s pressure point into a clear role, volume, and market brief."], ["02", "Build role-ready shortlists", "Use job-specific fit and readiness insight to support a more confident hiring decision."], ["03", "Support a stable start", "Coordinate a documented recruitment journey and stay connected through aftercare."]];

export default function HomePage() {
  return (
    <main className="corp">
      <CorporateNav />

      <section className="corp-hero" id="top">
        <div className="corp-hero-grid" aria-hidden="true"><i /><i /><i /><i /></div>
        <div className="corp-hero-copy"><p className="corp-kicker">FOR INTERNATIONAL EMPLOYERS · WORKFORCE SOLUTIONS FROM INDONESIA</p><h1>Build a workforce that performs <em>beyond the hire.</em></h1><p className="corp-lede">DTG turns hard-to-fill roles into a clearer workforce plan—connecting role definition, screened Indonesian talent, a documented recruitment route, and support after placement.</p><div className="corp-actions"><Link className="corp-button" href="/contact">Discuss Your Workforce Needs</Link><Link className="corp-text-link" href="/services">See how we solve workforce gaps <span>→</span></Link></div></div>
        <div className="corp-hero-statement"><Image className="corp-hero-visual" src="/images/global-workforce-hero.png" alt="Global professionals moving through an international workplace" fill priority sizes="(max-width: 800px) 100vw, 38vw" /><div className="corp-hero-statement-content"><div className="corp-diamond">◆</div><p>Business need.<br />Workforce fit.<br /><b>Operational confidence.</b></p><span>INDONESIA · CONNECTED TO THE WORLD</span></div></div>
      </section>

      <section className="corp-proof"><div><strong>01</strong><p>Clearer role and<br />volume brief</p><span>Define the need before the search begins.</span></div><div><strong>02</strong><p>Less sourcing<br />friction</p><span>Reach relevant talent with less noise.</span></div><div><strong>03</strong><p>Documented hiring<br />route</p><span>See the steps, evidence, and owners.</span></div><div><strong>04</strong><p>Support through the<br />first 90 days</p><span>Keep the first start connected.</span></div></section>

      <section className="corp-intro" id="about"><p className="corp-kicker">THE EMPLOYER PROBLEM</p><h2>When cross-border hiring slows the business, we make the route <em>workable.</em></h2><div className="corp-intro-bottom"><p>Demand can be clear while the route to capable people is not. DTG helps employers clarify the role, understand the market, and move forward with the right evidence for a responsible hiring decision.</p><Link href="/contact">Talk through a workforce need <span>↗</span></Link></div></section>

      <section className="corp-solution-visual"><div className="corp-solution-image"><Image src="/images/process-sky.jpg" alt="Workforce planning and collaboration" fill sizes="(max-width: 800px) 100vw, 46vw" /></div><div className="corp-solution-copy"><p className="corp-kicker">THE DTG SOLUTION</p><h2>From vacancy pressure to <em>workforce confidence.</em></h2><p>We connect the decisions that matter to an employer: what the role requires, where the right talent can be found, how readiness is evidenced, and what support is needed after placement.</p><div className="corp-solution-points"><div><b>01</b><span>Clarify the workforce gap</span></div><div><b>02</b><span>Match talent to the role</span></div><div><b>03</b><span>Support a stable start</span></div></div></div></section>

      <section className="corp-capabilities" id="services"><div className="corp-section-heading"><p className="corp-kicker">SOLUTIONS FOR EMPLOYERS</p><h2>Move from hiring need<br /><em>to business readiness.</em></h2></div><div className="corp-cap-list">{capabilities.map(([number, title, detail]) => <article key={number}><span>{number}</span><div><h3>{title}</h3><p>{detail}</p></div><b>↗</b></article>)}</div></section>

      <section className="corp-clients"><div className="corp-clients-heading"><p className="corp-kicker">THE BUSINESS IMPACT</p><h2>Evidence that helps you <em>move with confidence.</em></h2><p>Every conversation is anchored to a practical employer outcome: clearer roles, lower sourcing friction, a responsible route, and a stronger start for the people you hire.</p><div className="impact-rail"><span>NEED</span><i /> <span>FIT</span><i /> <span>START</span><i /> <span>CONTINUITY</span></div></div><div className="corp-logo-grid"><div><b>01</b><strong>Role clarity</strong><span>Align the brief.</span></div><div><b>02</b><strong>Talent fit</strong><span>Match the work.</span></div><div><b>03</b><strong>Readiness insight</strong><span>Know what is ready.</span></div><div><b>04</b><strong>Route visibility</strong><span>Track the pathway.</span></div><div><b>05</b><strong>Aftercare</strong><span>Support the start.</span></div><div><b>06</b><strong>Business continuity</strong><span>Protect momentum.</span></div></div></section>

      <section className="corp-regions" id="regions"><div className="corp-regions-title"><p className="corp-kicker">MARKET CONVERSATIONS</p><h2>Indonesia expertise.<br /><em>Market-aware delivery.</em></h2></div><div className="region-cards"><Link href="/saudi-gcc" className="region-card market-card-gcc"><p>01 · PRIORITY MARKET</p><h3>Saudi Arabia<br />&amp; GCC</h3><span>Discuss your workforce need <b>→</b></span></Link><Link href="/europe" className="region-card market-card-europe"><p>02 · BULGARIA-LED</p><h3>Europe</h3><span>Explore employer relevance <b>→</b></span></Link><Link href="/japan" className="region-card market-card-japan"><p>03 · STRATEGIC MARKET</p><h3>Japan</h3><span>Explore employer relevance <b>→</b></span></Link></div></section>

      <section className="corp-talent-bridge"><div><p className="corp-kicker">FOR CANDIDATES</p><h2>Your global career journey belongs with <em>Perantau Global.</em></h2><p>Job information, candidate preparation, applications, and candidate support are managed by Perantau Global.</p><Link href="/for-candidates">Explore the candidate route →</Link></div><div className="corp-bridge-cards"><span>Career information</span><span>Applications</span><span>Preparation</span><span>Stories</span><span>Candidate support</span></div></section>

      <section className="corp-principles"><p className="corp-kicker">HOW WE WORK</p><div><h2>Every opportunity should move people <em>forward.</em></h2><p>We believe recruitment should create value for employers, candidates, and the communities around them. That is why our approach is grounded in rigorous screening, open communication, and long-term care.</p></div><div className="corp-principle-tags"><span>Responsible</span><span>Evidence-led</span><span>Human-centered</span><span>Globally minded</span></div></section>

      <section className="corp-home-insights"><div className="corp-insights-intro"><p className="corp-kicker">ARTICLES</p><h2>Perspectives on people<br />and <em>global work.</em></h2><Link href="/articles">View all articles →</Link></div><div className="corp-home-insight-list"><article><span>01</span><p>Responsible recruitment starts long before the interview.</p><b>Read article <i>↗</i></b></article><article><span>02</span><p>What employers need from a cross-border talent partner.</p><b>Read article <i>↗</i></b></article><article><span>03</span><p>Designing a better first 90 days for international talent.</p><b>Read article <i>↗</i></b></article></div></section>

      <section className="corp-contact" id="contact"><p className="corp-kicker">EMPLOYER INQUIRY</p><h2>Build your next workforce<br /><em>with clarity.</em></h2><Link href="/contact" className="corp-button">Discuss Your Workforce Needs →</Link><p className="corp-contact-note">For employers, authorized demand-side intermediaries, and institutional conversations.</p></section>

      <CorporateFooter />
    </main>
  );
}
