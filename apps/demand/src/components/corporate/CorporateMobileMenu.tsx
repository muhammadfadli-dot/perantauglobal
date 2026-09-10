"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { waLink } from "@/lib/site-config";

const links = [
  ["About DTG", "/about"],
  ["Workforce solutions", "/services"],
  ["Employer resources", "/resources"],
  ["Markets", "/regions"],
  ["Articles", "/articles"],
  ["Contact", "/contact"],
  ["For candidates", "/for-candidates"],
] as const;

export function CorporateMobileMenu() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", closeOnEscape);
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="corp-mobile-nav">
      <button
        type="button"
        className="corp-menu-trigger"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls="corp-mobile-menu"
        onClick={() => setOpen((value) => !value)}
      >
        <span /><span /><span />
      </button>
      {open && (
        <>
          <button className="corp-menu-backdrop" aria-label="Close menu" onClick={() => setOpen(false)} />
          <div className="corp-mobile-menu" id="corp-mobile-menu">
            <div className="corp-mobile-menu-links">
              {links.map(([label, href], index) => (
                <Link href={href} onClick={() => setOpen(false)} key={href}>
                  <small>{String(index + 1).padStart(2, "0")}</small>
                  <span>{label}</span>
                  <b>→</b>
                </Link>
              ))}
            </div>
            <a
              className="corp-mobile-menu-cta"
              href={waLink("Hello DTG, I would like to discuss an employer workforce need.")}
              target="_blank"
              rel="noreferrer"
              onClick={() => setOpen(false)}
            >
              Discuss your needs <span>→</span>
            </a>
          </div>
        </>
      )}
    </div>
  );
}
