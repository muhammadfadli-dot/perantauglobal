import type { Metadata } from "next";
import Link from "next/link";
import { LegalShell, LegalSection } from "@/components/legal/LegalShell";
import { CONTACT, CREDENTIALS, SITE, waLink } from "@/lib/site-config";

/**
 * Demand-side terms of use. Deliberately proportionate: this is an inquiry site,
 * not a contract surface. The operative document for any actual placement is the
 * signed job order and placement agreement, and every clause here defers to it
 * rather than trying to pre-empt it.
 *
 * Claims are kept to what the site itself already states on the page (rounded
 * pool figures, preview talent stories, permissioned client logos), so the terms
 * cannot drift out of step with the marketing copy.
 */

const EFFECTIVE = "21 July 2026";
const MAIL = "halo@perantauglobal.com";

export const metadata: Metadata = {
  title: "Terms of Use",
  description:
    "Terms of use for dayatalentaglobal.com, the employer inquiry site of PT Daya Talenta Global, a licensed Indonesian P3MI and part of Dayalima Group.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <LegalShell
      title="Terms of Use"
      lede="Plain terms for the employers who use this site. Nothing here replaces the placement agreement you sign with us. It simply sets out how this website may be used, and what it does and does not promise."
      effective={EFFECTIVE}
    >
      <p className="legal-lead">
        Applies to {SITE.domain}. Last updated {EFFECTIVE}.
      </p>

      <LegalSection n={1} title="Who these terms are with">
        <p>
          This website is operated by <strong>{SITE.legalName}</strong>, a company registered in Jakarta,
          Indonesia, licensed by the Ministry of Manpower (Kemnaker) as a P3MI under Licence No.{" "}
          {CREDENTIALS.p3miLicenseNo}, registered with Saudi MOFA as an approved agent, and part of{" "}
          {SITE.group.name}.
        </p>
        <p>By using this site you accept these terms. If you do not accept them, please do not use the site.</p>
      </LegalSection>

      <LegalSection n={2} title="Who this site is for">
        <p>
          This site is for businesses that want to hire Indonesian professionals, and for the people acting on
          their behalf. By sending an inquiry you confirm that you are at least 18 years old and authorised to
          make it for the organisation you name.
        </p>
        <p>
          If you are an individual looking for work abroad, this is not the right site. Applications are
          handled on our candidate platform, Perantau Global.
        </p>
      </LegalSection>

      <LegalSection n={3} title="What this site is, and what it is not">
        <p>
          This site is informational. It describes what we do and lets you start a conversation with our
          Business Development team.
        </p>
        <ul>
          <li>
            Nothing on this site is a binding offer, a quotation, or a guarantee that any particular candidate
            is available.
          </li>
          <li>Sending an inquiry does not create a contract. It opens a conversation.</li>
          <li>
            Any placement is governed by a separate signed job order and placement agreement. Where anything
            on this site differs from that agreement, <strong>the agreement prevails</strong>.
          </li>
          <li>
            We may decline an inquiry, or ask you to verify your business, before we discuss candidates.
          </li>
        </ul>
      </LegalSection>

      <LegalSection n={4} title="Inquiries and how we respond">
        <p>
          The inquiry form opens WhatsApp on your own device with your details already written out. It does
          not submit anything to us until you send that message yourself. What happens to your data after that
          is set out in our <Link href="/privacy">Privacy Policy</Link>.
        </p>
        <p>
          We aim to reply within one business day. That is a service commitment, not a contractual deadline.
        </p>
      </LegalSection>

      <LegalSection n={5} title="Accuracy of the information here">
        <p>We publish in good faith and keep this site current. Three things are worth stating plainly:</p>
        <ul>
          <li>
            <strong>Talent pool figures are rounded snapshots</strong>, rounded down so they never overstate,
            with the audit date shown on the page. Availability is re-verified against your specific
            requirement before anyone is presented to you.
          </li>
          <li>
            <strong>Talent stories currently shown on the site are labelled previews</strong>, not verified
            testimonials. They will be replaced with the words of placed professionals once those individuals
            have given permission to publish them.
          </li>
          <li>
            <strong>Client logos are shown with the permission</strong> of the businesses concerned, and
            remain their property.
          </li>
        </ul>
        <p>
          Placement timelines, including the roughly two-month figure we quote, are typical rather than
          guaranteed, because visa and regulatory steps sit with authorities in two countries.
        </p>
      </LegalSection>

      <LegalSection n={6} title="The placement guarantee">
        <p>
          The {CREDENTIALS.guaranteeMonths}-month guarantee described on this site is real. Its exact scope,
          conditions, and remedy are set out in the placement agreement you sign, and that document is the
          operative version. The summary here is a summary.
        </p>
      </LegalSection>

      <LegalSection n={7} title="Acceptable use">
        <p>You agree not to:</p>
        <ul>
          <li>
            Use this site or our inquiry channel to recruit outside legal channels, or for any purpose that
            would breach Indonesian manpower law or the law of your own country.
          </li>
          <li>
            Submit false information, or make an inquiry on behalf of a business you are not authorised to
            represent.
          </li>
          <li>
            Scrape, harvest, or systematically extract content from this site, or use automated means to send
            inquiries.
          </li>
          <li>Attempt to gain unauthorised access to the site, or interfere with its operation or security.</li>
        </ul>
      </LegalSection>

      <LegalSection n={8} title="Intellectual property">
        <p>
          The text, design, imagery, marks, and logos on this site belong to {SITE.legalName} or to{" "}
          {SITE.group.name}, except for third-party client logos, which belong to their owners and are used
          with permission. You may read, print, and share these pages in order to evaluate our services. Any
          other use needs our written consent.
        </p>
      </LegalSection>

      <LegalSection n={9} title="Third-party services">
        <p>
          This site links to WhatsApp, operated by Meta Platforms, and to our candidate platform Perantau
          Global. WhatsApp is governed by its own terms and privacy policy, which we do not control. We are
          not responsible for the content or the availability of third-party services we link to.
        </p>
      </LegalSection>

      <LegalSection n={10} title="Our regulatory status">
        <p>
          We place workers abroad only through legal channels, under our P3MI licence and the approvals
          required in each destination country. Nothing on this site should be read as an invitation to
          arrange a placement outside those channels, and we will not arrange one.
        </p>
      </LegalSection>

      <LegalSection n={11} title="Availability and disclaimers">
        <p>
          The site is provided as it is. We do not warrant that it will be uninterrupted, error free, or free
          of inaccuracies, and we may change, suspend, or withdraw any part of it at any time without notice.
        </p>
      </LegalSection>

      <LegalSection n={12} title="Liability">
        <p>
          So far as Indonesian law allows, we are not liable for indirect or consequential loss, or for lost
          profit, arising from your use of this site or from reliance on what is published here. Our
          obligations in relation to an actual placement are the ones set out in the signed placement
          agreement, and nothing on this page limits them.
        </p>
        <p>
          Nothing in these terms excludes liability that cannot lawfully be excluded, including liability for
          fraud, or for death or personal injury caused by negligence.
        </p>
      </LegalSection>

      <LegalSection n={13} title="Governing law, changes, and contact">
        <p>
          These terms are governed by the laws of the Republic of Indonesia, and the courts of Jakarta have
          jurisdiction over any dispute arising from them.
        </p>
        <p>
          We may update these terms. The effective date at the top of this page changes when we do, and
          continued use of the site after that date means you accept the update.
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
        For how we handle personal data, see our <Link href="/privacy">Privacy Policy</Link>.
      </p>
    </LegalShell>
  );
}
