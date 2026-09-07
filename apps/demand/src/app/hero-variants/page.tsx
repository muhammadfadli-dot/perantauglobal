import Image from "next/image";
import Link from "next/link";

export default function HeroVariantsPage() {
  return (
    <main className="hero-variants-page">
      <div className="hero-variants-intro">
        <p className="corp-kicker">DTG HERO EXPLORATION</p>
        <h1>Two directions for the first employer conversation.</h1>
        <p>Compare the current DTG brand-led direction with a lighter, reference-inspired composition before selecting the homepage version.</p>
        <Link href="/">Back to homepage</Link>
      </div>

      <section className="hero-variant hero-variant-brand">
        <div className="hero-variant-label">OPTION 01 · DTG BRAND-LED</div>
        <div className="hero-variant-copy">
          <p className="corp-kicker">FOR INTERNATIONAL EMPLOYERS · WORKFORCE SOLUTIONS FROM INDONESIA</p>
          <h2>Build a workforce that performs <em>beyond the hire.</em></h2>
          <p>DTG connects role definition, screened Indonesian talent, a documented recruitment route, and support after placement.</p>
          <div className="corp-actions"><Link className="corp-button" href="/contact">Discuss Your Workforce Needs</Link><Link className="corp-text-link" href="/services">See how we solve workforce gaps</Link></div>
          <div className="corp-hero-trust"><span>Employer-first</span><span>Market-aware</span><span>Evidence-led</span></div>
        </div>
        <div className="hero-variant-image hero-variant-image-dark"><Image src="/images/global-workforce-hero.png" alt="International professionals in a global workplace" fill sizes="(max-width: 800px) 100vw, 46vw" /><div className="hero-variant-image-copy"><b>◆</b><p>Business need.<br />Workforce fit.<br /><strong>Operational confidence.</strong></p><small>INDONESIA · CONNECTED TO THE WORLD</small></div></div>
      </section>

      <section className="hero-variant hero-variant-reference">
        <div className="hero-variant-label">OPTION 02 · REFERENCE-INSPIRED</div>
        <div className="hero-variant-copy">
          <p className="corp-kicker">FOR EMPLOYERS BUILDING ACROSS BORDERS</p>
          <h2>Build a workforce that performs.<br /><em>Move with confidence.</em></h2>
          <p>From Indonesia to the world, DTG makes the route from workforce need to business readiness clearer.</p>
          <div className="corp-actions"><Link className="corp-button" href="/contact">Discuss Your Workforce Needs</Link><Link className="corp-text-link" href="/services">How DTG works</Link></div>
          <div className="corp-hero-trust"><span>Employer-first</span><span>Market-aware</span><span>Evidence-led</span></div>
        </div>
        <div className="hero-variant-image hero-variant-image-light"><Image src="/images/global-workforce-hero.png" alt="International professionals in a global workplace" fill sizes="(max-width: 800px) 100vw, 46vw" /><div className="hero-variant-floating-card"><small>MARKET ROUTE</small><strong>Indonesia → Global</strong><span>Employer conversation</span></div></div>
      </section>
    </main>
  );
}
