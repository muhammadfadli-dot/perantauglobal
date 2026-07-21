import type { Metadata } from "next";
import Link from "next/link";
import { LegalShell, LegalSection } from "@/components/legal/LegalShell";
import { CONTACT, CREDENTIALS, SITE, waLink } from "@/lib/site-config";
import { INQUIRY_CONSENT_TEXT, INQUIRY_CONSENT_VERSION } from "@/lib/consent";

/**
 * Demand-side privacy policy, written for the employer audience and grounded in
 * what this app actually does, not in what a recruitment site usually does:
 *
 *  - the inquiry form does not POST anywhere (Contact.tsx `submitForm` opens a
 *    prefilled wa.me link), so there is no server-side store to describe here;
 *  - nothing in this app reads or writes Supabase today (talent-pool.ts returns
 *    a hardcoded snapshot, supabase.ts is unused-but-ready), so the database is
 *    described as the candidate platform's, not this site's;
 *  - the only script loaded is Vercel Web Analytics (layout.tsx). GTM / GA /
 *    Meta are whitelisted in the CSP but not loaded, so they are not claimed.
 *
 * Any of those three changing means this page changes in the same commit.
 */

const EFFECTIVE = "21 July 2026";
const MAIL = "halo@perantauglobal.com";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How PT Daya Talenta Global collects, uses, and protects personal data on dayatalentaglobal.com, the employer inquiry site, under Indonesia Law No. 27 of 2022 on Personal Data Protection.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <LegalShell
      title="Privacy Policy"
      lede="This site is how employers reach Daya Talenta Global. This page sets out exactly what we collect when you do, where it goes, how long we keep it, and what you can ask us to do with it, under Indonesia Law No. 27 of 2022 on Personal Data Protection."
      effective={EFFECTIVE}
    >
      <p className="legal-lead">
        Applies to {SITE.domain}. Last updated {EFFECTIVE}.
      </p>

      <LegalSection n={1} title="Who we are">
        <p>
          {SITE.legalName} (<strong>{SITE.brandName}</strong>, &ldquo;we&rdquo;, &ldquo;us&rdquo;) is the data
          controller for this website. We are registered in Jakarta, Indonesia, licensed by the Ministry of
          Manpower (Kemnaker) as a P3MI under Licence No. {CREDENTIALS.p3miLicenseNo}, registered with Saudi
          MOFA as an approved agent, and part of {SITE.group.name}.
        </p>
        <p>
          Questions about your data go to <a href={`mailto:${MAIL}`}>{MAIL}</a> or WhatsApp{" "}
          <a href={waLink()} target="_blank" rel="noopener noreferrer">{CONTACT.whatsappDisplay}</a>.
        </p>
      </LegalSection>

      <LegalSection n={2} title="What this policy covers">
        <p>
          This policy covers {SITE.domain}, our demand-side website for employers, and the inquiry it hands to
          our Business Development team.
        </p>
        <p>
          It does <strong>not</strong> cover the Perantau Global candidate platform, where Indonesian
          jobseekers register, apply for roles, and upload documents. That platform has its own privacy
          policy written for candidates: same controller entity, a different audience and different
          processing. If you are looking for work abroad rather than hiring, that is the policy that applies
          to you.
        </p>
      </LegalSection>

      <LegalSection n={3} title="What we collect">
        <p>
          Everything we collect on this site comes from you directly, through one form, and it is
          business-contact information rather than consumer data:
        </p>
        <ul>
          <li>
            <strong>Your requirement</strong>: company name, country, sector, the roles you need, number of
            hires, and your hiring timeline.
          </li>
          <li>
            <strong>Your contact details</strong> as the person making the inquiry: full name and work email.
          </li>
          <li>
            <strong>Optional company context</strong>: company location or map link, website or social media
            handle, and any notes you choose to add.
          </li>
          <li>
            <strong>Your consent</strong>: the tick box you must select before the form will do anything, and
            the version of the wording shown to you.
          </li>
        </ul>
        <p>
          We do not ask for identity documents, payment details, or any special-category data on this site.
          There is no account, no login, and no password.
        </p>
      </LegalSection>

      <LegalSection n={4} title="How the inquiry form works, and where your details go">
        <p>This is the part worth reading closely, because it is unusual:</p>
        <ul>
          <li>
            When you submit the form, <strong>nothing is posted to a server of ours</strong>. The page checks
            your entries, then opens WhatsApp on your own device with a message already written out from what
            you typed.
          </li>
          <li>
            Nothing leaves your device until you press send inside WhatsApp. If you close WhatsApp without
            sending, we never receive the inquiry, and no copy is kept, by us or in your browser.
          </li>
          <li>
            If you do send it, the message reaches the Daya Talenta Global WhatsApp Business line. Our
            Business Development team then reads it, replies, and may record the inquiry in our internal
            systems so it can be followed up.
          </li>
        </ul>
        <p>
          Because the form transmits nothing to us, we hold no server-side log of your consent. The wording
          you agree to before the handoff, version {INQUIRY_CONSENT_VERSION}, reads in full:
        </p>
        <p className="legal-quote">{INQUIRY_CONSENT_TEXT}</p>
      </LegalSection>

      <LegalSection n={5} title="Why we process it, and our legal basis">
        <p>We use what you send us to:</p>
        <ul>
          <li>Answer your inquiry and prepare a shortlist against the roles you described.</li>
          <li>Confirm we are speaking with a genuine employer before any candidate information is discussed.</li>
          <li>
            Prepare a job order, contract, and the regulatory filings a legal placement requires, if the
            conversation proceeds that far.
          </li>
          <li>Keep an internal record of employer demand so we can plan recruitment.</li>
        </ul>
        <p>Our legal basis under Article 20 of Law 27/2022 is:</p>
        <ul>
          <li>
            <strong>Consent</strong>, given through the tick box, which is never pre-selected and which you
            can withdraw at any time.
          </li>
          <li>
            <strong>Contract and pre-contractual steps</strong>, since you are asking us to prepare for a
            possible placement agreement.
          </li>
          <li>
            <strong>Legal obligation</strong>, for reporting to Kemnaker, BP2MI, and destination-country
            authorities once a placement proceeds.
          </li>
          <li>
            <strong>Legitimate interest</strong>, in verifying employers and preventing misuse of our
            recruitment channels.
          </li>
        </ul>
      </LegalSection>

      <LegalSection n={6} title="Who else is involved">
        <ul>
          <li>
            <strong>WhatsApp (Meta Platforms)</strong> carries your inquiry. The message passes through and is
            processed by WhatsApp under its own terms and privacy policy, on infrastructure we do not control.
            If you would rather not use WhatsApp, do not submit the form; email us instead.
          </li>
          <li>
            <strong>Vercel</strong> hosts this website and serves it from its Singapore region. It handles
            standard request data such as IP address, browser type, and the page requested, in server logs,
            and provides the aggregate analytics described in section 7.
          </li>
          <li>
            <strong>Supabase</strong> hosts the Perantau Global candidate database in Singapore. As section 8
            explains, this website does not read from or write to it.
          </li>
        </ul>
        <p>
          We do not sell your data, we do not share it with advertising networks, and we do not add your email
          to a marketing list.
        </p>
      </LegalSection>

      <LegalSection n={7} title="Cookies, analytics, and server logs">
        <ul>
          <li>
            <strong>This site sets no cookies of its own.</strong> There is nothing to log in to and nothing
            to remember between visits.
          </li>
          <li>
            <strong>Vercel Web Analytics</strong> runs on every page. It counts page views and referrers in
            aggregate, and does not use cookies to do it.
          </li>
          <li>
            <strong>Fonts are served from this site itself</strong>, not from a third-party font network, so
            no font provider sees your visit.
          </li>
          <li>
            <strong>No Google Analytics, Google Tag Manager, or Meta Pixel is loaded on this site today.</strong>{" "}
            If we add one, this page and the consent wording on the form will be updated before it goes live.
          </li>
          <li>
            <strong>Server request logs</strong> are kept by our hosting provider for a short period, for
            security and reliability.
          </li>
        </ul>
      </LegalSection>

      <LegalSection n={8} title="Candidate data and the talent pool figures">
        <p>
          This site advertises a pool of Indonesian professionals. Those candidate records are not held here:
        </p>
        <ul>
          <li>
            Candidate profiles, documents, and applications live in the Perantau Global platform, on a
            Supabase database hosted in the <strong>ap-southeast-1 (Singapore)</strong> region.
          </li>
          <li>
            The figures shown on this site, such as the pool total and the regional splits, are rounded-down
            snapshots audited on 4 July 2026 and published as fixed numbers. This website does not query the
            candidate database when a page loads.
          </li>
          <li>
            Candidate details are shared with an employer only after screening, only to the extent the role
            requires, and on the basis of the consent that candidate gave under the Perantau Global privacy
            policy.
          </li>
        </ul>
      </LegalSection>

      <LegalSection n={9} title="Cross-border transfers">
        <p>
          We are a cross-border placement business, so data does leave Indonesia. Articles 56 and 57 of Law
          27/2022 require us to say where:
        </p>
        <ul>
          <li>Your inquiry travels through WhatsApp and Meta infrastructure located outside Indonesia.</li>
          <li>This website is hosted and served from Singapore.</li>
          <li>The Perantau Global candidate database is hosted in Singapore.</li>
          <li>
            Where a placement proceeds, candidate data is shared with the employer and the competent
            authorities in the destination country, for example Saudi Arabia, the United Arab Emirates,
            Kuwait, Qatar, Bahrain, or Oman.
          </li>
        </ul>
        <p>
          We make these transfers only where the receiving party maintains a level of protection equivalent to
          Indonesian law, or on the basis of your consent or the contract we are performing.
        </p>
      </LegalSection>

      <LegalSection n={10} title="How long we keep data">
        <ul>
          <li>
            <strong>Inquiry conversations and lead records</strong>: while the opportunity is live, and up to
            24 months after our last contact with you, unless you ask us to delete them sooner.
          </li>
          <li>
            <strong>Placement records</strong>, once a job order is signed: for as long as our obligations as
            a licensed P3MI require, which is at least 5 years after the placement contract ends.
          </li>
          <li>
            <strong>Server request logs</strong>: for the short operational period our hosting provider keeps
            them.
          </li>
          <li>
            <strong>Analytics</strong>: aggregate counts only, with no record tied to you.
          </li>
        </ul>
      </LegalSection>

      <LegalSection n={11} title="Your rights under Law 27/2022">
        <p>As a data subject you have the right to:</p>
        <ul>
          <li><strong>Access</strong> the personal data we hold about you.</li>
          <li><strong>Correct</strong> data that is inaccurate or out of date.</li>
          <li><strong>Delete</strong> your data, where no legal obligation requires us to keep it.</li>
          <li>
            <strong>Withdraw your consent</strong> at any time. Withdrawing it means we stop pursuing the
            inquiry.
          </li>
          <li><strong>Restrict or object to</strong> how we process it.</li>
          <li><strong>Receive a copy</strong> in a commonly used format, and have it transferred.</li>
          <li>
            <strong>Complain</strong> to the Indonesian personal data protection supervisory authority.
          </li>
        </ul>
        <p>
          To exercise any of these, email <a href={`mailto:${MAIL}`}>{MAIL}</a> with the subject{" "}
          <strong>Data Subject Request</strong>. We reply within 14 working days. We may first ask you to
          confirm your identity, so that we never disclose data to the wrong person.
        </p>
      </LegalSection>

      <LegalSection n={12} title="Security">
        <p>
          Traffic to this site is encrypted in transit with HTTPS, and every response carries standard browser
          security headers. Because the site keeps no database of its own and stores nothing in your browser,
          there is no store of inquiries here to breach. Once your message reaches us, access is limited to
          the Business Development staff who need it.
        </p>
        <p>
          Two things worth stating plainly: a WhatsApp message is only as private as the device and account
          you send it from, and no system is ever completely secure. If a personal data breach happens on our
          side, we will notify you and the supervisory authority within 3 x 24 hours, as Article 46 requires.
        </p>
      </LegalSection>

      <LegalSection n={13} title="Changes and contact">
        <p>
          We may update this policy. Material changes appear here with a new effective date at the top of the
          page, and where a change affects the inquiry form, the consent wording is re-versioned at the same
          time. Earlier versions are available on request.
        </p>
        <ul>
          <li>Email: <a href={`mailto:${MAIL}`}>{MAIL}</a></li>
          <li>
            WhatsApp:{" "}
            <a href={waLink()} target="_blank" rel="noopener noreferrer">{CONTACT.whatsappDisplay}</a>
          </li>
          <li>Address: {SITE.legalName}, {CONTACT.office}, Indonesia</li>
        </ul>
      </LegalSection>

      <p className="legal-foot">
        For the rules that apply to using this website, see our <Link href="/terms">Terms of Use</Link>.
      </p>
    </LegalShell>
  );
}
