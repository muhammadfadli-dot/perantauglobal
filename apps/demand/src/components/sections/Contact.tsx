"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { CONTACT, waLink } from "@/lib/site-config";
import {
  INQUIRY_CONSENT_TEXT,
  INQUIRY_CONSENT_REQUIRED_MSG,
  PRIVACY_POLICY_URL,
} from "@/lib/consent";

type Field =
  | "company" | "country" | "sector" | "roles" | "quantity" | "timeline"
  | "name" | "email" | "mapsLink" | "social" | "notes";
const EMPTY: Record<Field, string> = {
  company: "", country: "", sector: "", roles: "", quantity: "", timeline: "",
  name: "", email: "", mapsLink: "", social: "", notes: "",
};

const COUNTRIES = ["Saudi Arabia", "United Arab Emirates", "Kuwait", "Qatar", "Bahrain", "Oman", "Other"];
const SECTORS = ["Healthcare", "Hospitality", "Wellness", "Other"];
const QUANTITIES = [
  { value: "1-5", label: "1 to 5" },
  { value: "6-20", label: "6 to 20" },
  { value: "21-50", label: "21 to 50" },
  { value: "50+", label: "More than 50" },
];
// Placement runs about two months. Asking upfront surfaces a mismatch before
// BD spends a call on it, and tells them which inquiries to work first.
const TIMELINES = [
  { value: "asap", label: "As soon as possible" },
  { value: "1-3m", label: "Within 1 to 3 months" },
  { value: "3-6m", label: "Within 3 to 6 months" },
  { value: "planning", label: "Planning ahead, no fixed date" },
];

const link = waLink();

// The WhatsApp handoff carries the label BD reads, not the form's value token.
function timelineLabel(value: string): string {
  return TIMELINES.find((t) => t.value === value)?.label ?? value;
}

export function Contact() {
  const ref = useRef<HTMLElement>(null);
  const [form, setForm] = useState<Record<Field, string>>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [submitted, setSubmitted] = useState(false);
  // PDP UU 27/2022: affirmative consent, default UNCHECKED. Gates the handoff.
  const [agree, setAgree] = useState(false);
  const [consentError, setConsentError] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            el.classList.add("seen");
            io.unobserve(el);
          }
        }
      },
      { threshold: 0.18 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const onField = (name: Field, value: string) => {
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((e) => ({ ...e, [name]: undefined }));
  };

  const submitForm = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const errs: Partial<Record<Field, string>> = {};
    if (!form.company.trim()) errs.company = "Enter your company";
    if (!form.country) errs.country = "Select a country";
    if (!form.sector) errs.sector = "Select a sector";
    if (!form.name.trim()) errs.name = "Enter your name";
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) errs.email = "Enter a valid email";
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      const first = Object.keys(errs)[0];
      ref.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }
    // PDP: nothing leaves the page until the box is ticked.
    if (!agree) {
      setConsentError(true);
      ref.current?.querySelector<HTMLElement>('[name="consent"]')?.focus();
      return;
    }
    setConsentError(false);
    setErrors({});
    // Hand the inquiry to the confirmed BD WhatsApp channel with the details
    // prefilled, so no lead is silently dropped. (A server-side BD-inbox/CRM
    // endpoint can replace this later; see the project brief section 11.)
    const lines = [
      "Hello Daya Talenta Global, we would like to hire Indonesian talent.",
      "",
      `Company: ${form.company}`,
      `Country: ${form.country}`,
      `Sector: ${form.sector}`,
      form.roles.trim() ? `Roles needed: ${form.roles.trim()}` : "",
      form.quantity ? `Number of hires: ${form.quantity}` : "",
      form.timeline ? `Timeline: ${timelineLabel(form.timeline)}` : "",
      form.mapsLink.trim() ? `Location: ${form.mapsLink.trim()}` : "",
      form.social.trim() ? `Website or social: ${form.social.trim()}` : "",
      form.notes.trim() ? `Notes: ${form.notes.trim()}` : "",
      `Contact: ${form.name} (${form.email})`,
    ].filter(Boolean);
    window.open(waLink(lines.join("\n")), "_blank", "noopener,noreferrer");
    setSubmitted(true);
  };

  const reset = () => {
    setForm(EMPTY);
    setErrors({});
    setSubmitted(false);
    // A fresh inquiry needs a fresh tick - carrying the old one over would make
    // the consent apply to data the visitor has not entered yet.
    setAgree(false);
    setConsentError(false);
  };

  const cls = (k: Field) => `fld${errors[k] ? " ferr" : ""}`;

  return (
    <section ref={ref} id="contact" style={{ background: "#20301F", scrollMarginTop: 0 }}>
      <div style={{ background: "#20301F", backgroundImage: "radial-gradient(900px 440px at 50% -20%,rgba(178,138,72,.16),transparent 60%),repeating-linear-gradient(45deg,rgba(216,185,120,.04) 0,rgba(216,185,120,.04) 1px,transparent 1px,transparent 26px),repeating-linear-gradient(-45deg,rgba(216,185,120,.04) 0,rgba(216,185,120,.04) 1px,transparent 1px,transparent 26px)", padding: "90px 40px 120px", textAlign: "center" }}>
        <div className="anim ar" style={{ display: "inline-flex", alignItems: "center", gap: 9, marginBottom: 18, animationDelay: ".05s" }}>
          <span style={{ width: 7, height: 7, background: "#B28A48", transform: "rotate(45deg)", display: "block" }} />
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: ".18em", color: "#D8B978" }}>START THE CONVERSATION</span>
        </div>
        <h2 style={{ margin: "0 auto 16px", fontFamily: "var(--font-display)", fontWeight: 500, fontSize: "clamp(36px,4.4vw,52px)", lineHeight: 1.05, letterSpacing: "-.012em", color: "#F5F1E6", maxWidth: 600 }}>
          <span className="anim aw" style={{ display: "inline-block", animationDelay: ".14s" }}>Tell us who</span>{" "}
          <span className="anim aw" style={{ display: "inline-block", fontStyle: "italic", fontWeight: 400, color: "#E1C583", animationDelay: ".26s" }}>you need.</span>
        </h2>
        <p className="anim ar" style={{ margin: "0 auto 26px", fontSize: 15.5, lineHeight: 1.6, color: "#B9C4A6", maxWidth: 520, animationDelay: ".4s", textWrap: "pretty" }}>A Business Development consultant replies within one business day. No obligation, no mailing lists.</p>
        <a className="anim ar wa-btn" href={link} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "#4A5A32", color: "#F3EEE1", textDecoration: "none", fontSize: 14, fontWeight: 700, padding: "12px 24px", borderRadius: 8, transition: "background .15s, transform .15s", animationDelay: ".5s" }}>
          <svg width="18" height="18" fill="none" stroke="#F3EEE1" strokeWidth="1.7" style={{ display: "block" }}><path d="M9 2.5a6.3 6.3 0 0 0-5.4 9.6L2.7 15.5l3.5-.9A6.3 6.3 0 1 0 9 2.5Z" strokeLinejoin="round" /></svg>
          WhatsApp Business · {CONTACT.whatsappDisplay}
        </a>
      </div>

      <div style={{ padding: "0 40px 90px", marginTop: -84 }}>
        <div className="anim ar" style={{ background: "#F3EEE1", border: "1px solid #DCD3BE", borderRadius: 12, padding: "36px 40px", maxWidth: 820, margin: "0 auto", boxShadow: "0 22px 50px rgba(0,0,0,.28)", animationDelay: ".4s" }}>
          {!submitted ? (
            <form onSubmit={submitForm} noValidate>
              <div className="g-form">
                <div>
                  <label className="lbl" htmlFor="f-company">COMPANY *</label>
                  <input id="f-company" aria-label="Company" name="company" type="text" autoComplete="organization" placeholder="Your company" value={form.company} onChange={(e) => onField("company", e.target.value)} className={cls("company")} aria-invalid={!!errors.company} aria-describedby={errors.company ? "e-company" : undefined} />
                  {errors.company && <div id="e-company" role="alert" className="errmsg">{errors.company}</div>}
                </div>
                <div>
                  <label className="lbl" htmlFor="f-country">COUNTRY *</label>
                  <select id="f-country" aria-label="Country" name="country" autoComplete="country-name" value={form.country} onChange={(e) => onField("country", e.target.value)} className={`${cls("country")} sel`} aria-invalid={!!errors.country} aria-describedby={errors.country ? "e-country" : undefined}>
                    <option value="">Select</option>
                    {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  {errors.country && <div id="e-country" role="alert" className="errmsg">{errors.country}</div>}
                </div>
                <div>
                  <label className="lbl" htmlFor="f-sector">SECTOR *</label>
                  <select id="f-sector" aria-label="Sector" name="sector" value={form.sector} onChange={(e) => onField("sector", e.target.value)} className={`${cls("sector")} sel`} aria-invalid={!!errors.sector} aria-describedby={errors.sector ? "e-sector" : undefined}>
                    <option value="">Select</option>
                    {SECTORS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  {errors.sector && <div id="e-sector" role="alert" className="errmsg">{errors.sector}</div>}
                </div>
                <div>
                  <label className="lbl" htmlFor="f-roles">ROLES NEEDED</label>
                  <input id="f-roles" aria-label="Roles needed" name="roles" type="text" placeholder="e.g. registered nurses, baristas" value={form.roles} onChange={(e) => onField("roles", e.target.value)} className="fld" />
                </div>
                <div>
                  <label className="lbl" htmlFor="f-quantity">NUMBER OF HIRES</label>
                  <select id="f-quantity" aria-label="Number of hires" name="quantity" value={form.quantity} onChange={(e) => onField("quantity", e.target.value)} className="fld sel">
                    <option value="">Select</option>
                    {QUANTITIES.map((q) => <option key={q.value} value={q.value}>{q.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="lbl" htmlFor="f-timeline">WHEN DO YOU NEED THEM</label>
                  <select id="f-timeline" aria-label="When do you need them" name="timeline" value={form.timeline} onChange={(e) => onField("timeline", e.target.value)} className="fld sel">
                    <option value="">Select</option>
                    {TIMELINES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="lbl" htmlFor="f-name">YOUR NAME *</label>
                  <input id="f-name" aria-label="Your name" name="name" type="text" autoComplete="name" placeholder="Full name" value={form.name} onChange={(e) => onField("name", e.target.value)} className={cls("name")} aria-invalid={!!errors.name} aria-describedby={errors.name ? "e-name" : undefined} />
                  {errors.name && <div id="e-name" role="alert" className="errmsg">{errors.name}</div>}
                </div>
                <div>
                  <label className="lbl" htmlFor="f-email">WORK EMAIL *</label>
                  <input id="f-email" aria-label="Work email" name="email" type="email" autoComplete="email" placeholder="name@company.com" value={form.email} onChange={(e) => onField("email", e.target.value)} className={cls("email")} aria-invalid={!!errors.email} aria-describedby={errors.email ? "e-email" : undefined} />
                  {errors.email && <div id="e-email" role="alert" className="errmsg">{errors.email}</div>}
                </div>
              </div>

              {/* Optional block. These carry a stated reason: asking a Gulf
                  employer for their location and socials reads as intrusive
                  without one, and unexplained fields get skipped. */}
              <div style={{ marginTop: 26, paddingTop: 22, borderTop: "1px solid #DCD3BE", textAlign: "left" }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 600, letterSpacing: ".13em", color: "#8A857A", marginBottom: 5 }}>ABOUT YOUR COMPANY (OPTIONAL)</div>
                <p style={{ margin: "0 0 16px", fontSize: 12.5, lineHeight: 1.55, color: "#6E6752", maxWidth: 560 }}>
                  This helps us confirm who we are speaking with, so we can skip the verification questions and answer your requirement on the first reply.
                </p>
                <div className="g-form2">
                  <div>
                    <label className="lbl" htmlFor="f-maps">COMPANY LOCATION</label>
                    <input id="f-maps" aria-label="Company location" name="mapsLink" type="text" placeholder="Google Maps link or address" value={form.mapsLink} onChange={(e) => onField("mapsLink", e.target.value)} className="fld" />
                  </div>
                  <div>
                    <label className="lbl" htmlFor="f-social">WEBSITE OR SOCIAL MEDIA</label>
                    <input id="f-social" aria-label="Website or social media" name="social" type="text" placeholder="yourcompany.com or @yourcompany" value={form.social} onChange={(e) => onField("social", e.target.value)} className="fld" />
                  </div>
                </div>
                <div style={{ marginTop: 16 }}>
                  <label className="lbl" htmlFor="f-notes">ANYTHING ELSE WE SHOULD KNOW</label>
                  <textarea id="f-notes" aria-label="Anything else we should know" name="notes" rows={3} placeholder="Shift patterns, language needs, certifications, accommodation, or anything specific to the role" value={form.notes} onChange={(e) => onField("notes", e.target.value)} className="fld fld-ta" />
                </div>
              </div>

              {/* PDP UU 27/2022: affirmative consent, default unchecked. The
                  span text is the SoT string verbatim; the policy link sits on
                  its own line so that string stays reproducible as plain text. */}
              <div style={{ marginTop: 20 }}>
                <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    name="consent"
                    checked={agree}
                    onChange={(e) => {
                      setAgree(e.target.checked);
                      if (e.target.checked) setConsentError(false);
                    }}
                    aria-required
                    aria-invalid={consentError}
                    style={{ marginTop: 3, width: 15, height: 15, flex: "none", accentColor: "#A8452F" }}
                  />
                  <span className="consent-label" style={{ fontSize: 12.5, lineHeight: 1.55, color: "#6E6752" }}>
                    {INQUIRY_CONSENT_TEXT}
                  </span>
                </label>
                <p style={{ margin: "6px 0 0 25px", fontSize: 12.5, lineHeight: 1.55, color: "#9FB0A2" }}>
                  Read our{" "}
                  <a
                    href={PRIVACY_POLICY_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#A8452F", fontWeight: 700, textDecoration: "none" }}
                  >
                    Privacy Policy
                  </a>
                  .
                </p>
                {consentError && (
                  <p role="alert" style={{ margin: "6px 0 0 25px", fontSize: 12.5, fontWeight: 600, color: "#A8452F" }}>
                    {INQUIRY_CONSENT_REQUIRED_MSG}
                  </p>
                )}
              </div>

              <div style={{ display: "flex", gap: 16, alignItems: "center", marginTop: 22, flexWrap: "wrap" }}>
                <button type="submit" className="btn-terra" style={{ flex: "none", background: "#A8452F", color: "#F3EEE1", border: "none", cursor: "pointer", fontFamily: "var(--font-sans)", fontSize: 15, fontWeight: 700, padding: "15px 34px", borderRadius: 8, transition: "background .15s, transform .15s", boxShadow: "0 12px 26px rgba(168,69,47,.26)" }}>Send Inquiry</button>
                <span className="form-help" style={{ fontSize: 12, lineHeight: 1.5, color: "#6E6752", maxWidth: 240 }}>We open WhatsApp with your details so our BD team can reply within one business day.</span>
              </div>
            </form>
          ) : (
            <div style={{ textAlign: "center", padding: "22px 10px 14px" }}>
              <span className="as" style={{ width: 62, height: 62, position: "relative", display: "inline-block", marginBottom: 20 }}>
                <span style={{ position: "absolute", inset: 0, border: "1.6px solid #4A5A32", transform: "rotate(45deg)", display: "block" }} />
                <span style={{ position: "absolute", inset: 14, border: "1.6px solid #4A5A32", transform: "rotate(45deg)", display: "block" }} />
                <svg width="20" height="20" fill="none" stroke="#4A5A32" strokeWidth="2.4" style={{ position: "absolute", left: 21, top: 21 }}><path d="m3 10 4 4 8-9" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </span>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 28, color: "#20301F", marginBottom: 10 }}>Almost there. Send us your message.</div>
              <p style={{ margin: "0 auto 24px", fontSize: 14.5, lineHeight: 1.65, color: "#6E6752", maxWidth: 420 }}>We opened WhatsApp with your details prefilled. Send that message and our Business Development team will reply within one business day. If WhatsApp did not open, tap below.</p>
              <a href={link} target="_blank" rel="noopener noreferrer" className="wa-btn" style={{ display: "inline-flex", alignItems: "center", gap: 9, background: "#4A5A32", color: "#F3EEE1", textDecoration: "none", fontSize: 13.5, fontWeight: 700, padding: "11px 22px", borderRadius: 8, transition: "background .15s, transform .15s" }}>
                <svg width="17" height="17" fill="none" stroke="#F3EEE1" strokeWidth="1.7"><path d="M8.5 2.5a6 6 0 0 0-5.1 9.1L2.5 15l3.4-.9A6 6 0 1 0 8.5 2.5Z" strokeLinejoin="round" /></svg>
                Open WhatsApp
              </a>
              <div style={{ marginTop: 20 }}>
                <button type="button" onClick={reset} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-sans)", fontSize: 12.5, fontWeight: 600, color: "#6E6752", textDecoration: "underline", padding: 4 }}>Start another inquiry</button>
              </div>
            </div>
          )}
        </div>
        <p style={{ margin: "22px auto 0", fontSize: 12.5, lineHeight: 1.55, color: "#9FB0A2", maxWidth: 520, textAlign: "center" }}>Employer inquiries reach our Business Development team directly. Looking for work abroad? Applications are handled at Perantau Global, our candidate platform.</p>
      </div>
    </section>
  );
}
