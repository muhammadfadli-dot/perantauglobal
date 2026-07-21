"use client";

import { useEffect, useRef, useState } from "react";

const LINKS = [
  { href: "#why", label: "Why DTG" },
  { href: "#pool", label: "Talent Pool" },
  { href: "#sectors", label: "Sectors" },
  { href: "#process", label: "Process" },
  { href: "#credentials", label: "Credentials" },
  { href: "#faq", label: "FAQ" },
];

/**
 * Phone navigation. The desktop nav links are hidden below 920px, so without
 * this the only way to reach a section on a phone is to scroll the whole page.
 * Button and close target are both 44px so they clear the tap-target minimum.
 */
export function MobileMenu({ dark }: { dark: boolean }) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Lock the page behind the overlay, and let Escape close it.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    panelRef.current?.querySelector<HTMLElement>("a,button")?.focus();
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const barColor = dark ? "#20301F" : "#F3EEE1";

  return (
    <>
      <button
        type="button"
        className="navburger"
        aria-label="Open menu"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        style={{
          width: 44,
          height: 44,
          marginRight: -10,
          background: "none",
          border: "none",
          cursor: "pointer",
          display: "none",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 5,
        }}
      >
        {[0, 1, 2].map((i) => (
          <span key={i} style={{ width: 22, height: 1.6, background: barColor, display: "block", transition: "background .3s ease" }} />
        ))}
      </button>

      <div
        className={`mmenu${open ? " open" : ""}`}
        aria-hidden={!open}
        onClick={(e) => {
          if (e.target === e.currentTarget) setOpen(false);
        }}
      >
        <div ref={panelRef} className="mmenu-panel" role="dialog" aria-modal="true" aria-label="Menu">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 30 }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, letterSpacing: ".2em", color: "#8A6D2E" }}>MENU</span>
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
              style={{ width: 44, height: 44, marginRight: -10, background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" style={{ display: "block" }}>
                <path d="M4 4l12 12M16 4L4 16" stroke="#20301F" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <nav style={{ display: "flex", flexDirection: "column" }}>
            {LINKS.map((l) => (
              <a key={l.href} href={l.href} className="mmenu-link" onClick={() => setOpen(false)}>
                <span className="mmenu-dia" />
                <span>{l.label}</span>
              </a>
            ))}
          </nav>

          <a href="#contact" className="mmenu-cta" onClick={() => setOpen(false)}>
            Request Talent
          </a>
        </div>
      </div>
    </>
  );
}
