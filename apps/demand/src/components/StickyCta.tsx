"use client";

import { useEffect, useState } from "react";
import { CONTACT, waLink } from "@/lib/site-config";

const link = waLink();

/**
 * Phone-only action bar. The page runs long on mobile, so once the hero CTAs
 * scroll away there is no way to act without scrolling back. Hides again over
 * the contact section, where the real form already gives both actions.
 */
export function StickyCta() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const contact = document.getElementById("contact");
    const onScroll = () => {
      const past = window.scrollY > window.innerHeight * 0.9;
      const atContact = contact ? contact.getBoundingClientRect().top < window.innerHeight * 0.9 : false;
      setShow(past && !atContact);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className={`stickycta${show ? " show" : ""}`} aria-hidden={!show}>
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`WhatsApp Business ${CONTACT.whatsappDisplay}`}
        tabIndex={show ? undefined : -1}
        style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "#4A5A32", color: "#F3EEE1", textDecoration: "none", fontSize: 14.5, fontWeight: 700, padding: 14, borderRadius: 9, minHeight: 48 }}
      >
        <svg width="17" height="17" fill="none" stroke="#F3EEE1" strokeWidth="1.7" style={{ display: "block" }}>
          <path d="M8.5 2.5a6 6 0 0 0-5.1 9.1L2.5 15l3.4-.9A6 6 0 1 0 8.5 2.5Z" strokeLinejoin="round" />
        </svg>
        WhatsApp
      </a>
      <a
        href="#contact"
        tabIndex={show ? undefined : -1}
        style={{ flex: 1.2, display: "flex", alignItems: "center", justifyContent: "center", background: "#A8452F", color: "#F3EEE1", textDecoration: "none", fontSize: 14.5, fontWeight: 700, padding: 14, borderRadius: 9, minHeight: 48 }}
      >
        Request Talent
      </a>
    </div>
  );
}
