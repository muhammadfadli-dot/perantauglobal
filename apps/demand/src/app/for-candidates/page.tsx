import { CorporateFooter } from "@/components/corporate/CorporateFooter";
import { CorporateNav } from "@/components/corporate/CorporateNav";

export default function ForCandidatesPage() {
  return <main className="corp"><CorporateNav />
    <section className="corp-talent-hero"><p className="corp-kicker">FOR CANDIDATES</p><h1>Your international career journey starts with <em>Perantau Global.</em></h1><p>Daya Talenta Global works with international employers. Job opportunities, applications, candidate preparation, and candidate support are managed through Perantau Global.</p><a className="corp-button" href="https://www.perantauglobal.com/" target="_blank" rel="noreferrer">Explore Perantau Global →</a><span>You will be directed to Perantau Global in a new tab.</span></section>
    <section className="corp-talent-intro"><div><p className="corp-kicker">THE RIGHT ROUTE</p><h2>One clear path for <em>candidates.</em></h2></div><div><article><span>01</span><div><h3>Find information</h3><p>Learn about opportunities, countries, and the preparation required for an international career.</p></div></article><article><span>02</span><div><h3>Start your application</h3><p>Applications and candidate profile completion are handled on Perantau Global, not on DTG.</p></div></article><article><span>03</span><div><h3>Prepare responsibly</h3><p>Use the candidate platform for guidance on lawful, transparent, and safer preparation.</p></div></article></div></section>
    <section className="corp-callout"><p className="corp-kicker">ARE YOU AN EMPLOYER?</p><h2>Looking to hire Indonesian talent?</h2><p>DTG is the right route for employers and authorised demand-side intermediaries with a workforce requirement.</p><a className="corp-button" href="/contact">Discuss Your Workforce Needs →</a></section>
    <CorporateFooter />
  </main>;
}
