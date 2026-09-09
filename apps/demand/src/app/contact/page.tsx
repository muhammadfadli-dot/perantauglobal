import { CorporateFooter } from "@/components/corporate/CorporateFooter";
import { CorporateNav } from "@/components/corporate/CorporateNav";
import { CorporateCtaBanner } from "@/components/corporate/CorporateCtaBanner";
import { Contact } from "@/components/sections/Contact";
import { CONTACT } from "@/lib/site-config";

const faqs = [
  ["Who should contact DTG?", "International employers and authorised demand-side intermediaries seeking Indonesian workforce solutions. Candidates should use Perantau Global."],
  ["What should I prepare before contacting DTG?", "A country or market, role or sector, estimated volume, expected timing, and a contact person are enough to start."],
  ["Can I discuss a partnership?", "Yes. Recruitment, development, and institutional organisations can introduce their proposed collaboration through the Partnership page or the inquiry form."],
  ["Does DTG accept candidate applications here?", "No. Candidate opportunities, applications, and preparation are managed through Perantau Global."],
] as const;

export default function ContactPage() {
  return <main className="corp"><CorporateNav />
    <section className="corp-inner-hero"><p className="corp-kicker">CONTACT DTG</p><h1>Let&apos;s start with the <em>right conversation.</em></h1><p>Contact information, office location, and practical answers for employers, authorised intermediaries, and prospective partners.</p></section>
    <section className="corp-contact-info"><article><span>01</span><h2>Business Development</h2><p>For employer workforce needs and qualified discussions.</p><a href={`https://wa.me/${CONTACT.whatsappDigits}`} target="_blank" rel="noreferrer">WhatsApp Business<br /><b>{CONTACT.whatsappDisplay}</b></a></article><article><span>02</span><h2>Office location</h2><p>{CONTACT.office}</p><small>Visits are by appointment.</small></article><article><span>03</span><h2>Office hours</h2><p>Monday–Friday<br />09:00–17:00 WIB</p><small>Visits are by appointment.</small></article></section>
    <section className="corp-map-section"><div className="corp-map-placeholder"><div className="corp-map-dummy" aria-label="DTG office map preview"><span className="map-road map-road-one" /><span className="map-road map-road-two" /><span className="map-road map-road-three" /><span className="map-pin">◆</span><b className="map-label">DTG OFFICE</b><small className="map-location">Alamanda Tower · Cilandak</small><small className="map-note">Map preview</small></div></div><div><p className="corp-kicker">VISIT BY APPOINTMENT</p><h2>Find the DTG <em>office.</em></h2><p>Our office is at Alamanda Tower, Lantai 23, South Jakarta. Please contact the team before visiting.</p><a className="corp-button" href="https://www.google.com/maps/search/?api=1&query=Alamanda%20Tower%20Lantai%2023%20Jl.%20TB%20Simatupang%20No.%2022-26%20Jakarta%20Selatan" target="_blank" rel="noreferrer">Open in Google Maps →</a></div></section>
    <CorporateCtaBanner id="partnership" label="PARTNERSHIP ENQUIRY" title={<>Exploring a strategic or institutional <em>partnership?</em></>} description="Recruitment, development, training, and institutional organisations can introduce their collaboration proposal directly to DTG." href="#contact" cta="Contact DTG about a partnership" />
    <section className="corp-contact-faq"><div><p className="corp-kicker">FREQUENTLY ASKED QUESTIONS</p><h2>Before you <em>get in touch.</em></h2><p>Short answers to help direct your conversation to the right DTG team.</p></div><div>{faqs.map(([question, answer]) => <details key={question}><summary>{question}<span>+</span></summary><p>{answer}</p></details>)}</div></section>
    <section className="corp-contact-routing"><p><b>Employer inquiry</b> Discuss your workforce needs with DTG.</p><p><b>Partnership</b> Use the partnership banner above to start an introduction.</p><p><b>Candidate journey</b> <a href="https://www.perantauglobal.com/" target="_blank" rel="noreferrer">Visit Perantau Global ↗</a></p></section>
    <Contact /><CorporateFooter />
  </main>;
}
