"use client";

import { useEffect, useState } from "react";

const NAV_LINKS = [
  { href: "#why", label: "Why DTG" },
  { href: "#pool", label: "Talent Pool" },
  { href: "#sectors", label: "Sectors" },
  { href: "#process", label: "Process" },
  { href: "#credentials", label: "Credentials" },
];

export function Nav() {
  const [solid, setSolid] = useState(false);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const linkColor = solid ? "#413E33" : "#E4E0CC";
  const brand1 = solid ? "#20301F" : "#F3EEE1";
  const brand2 = solid ? "#8A857A" : "#9FAE8E";

  return (
    <nav id="dtgnav" className={solid ? "solid" : ""}>
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "22px clamp(16px,4vw,40px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 24,
        }}
      >
        <a href="#top" style={{ display: "flex", alignItems: "center", gap: 13, textDecoration: "none" }}>
          <span style={{ position: "relative", width: 34, height: 34, display: "block", flex: "none" }}>
            <span style={{ position: "absolute", inset: 0, border: "1.5px solid #B28A48", transform: "rotate(45deg)", display: "block" }} />
            <span style={{ position: "absolute", inset: 11, background: "#B28A48", transform: "rotate(45deg)", display: "block" }} />
          </span>
          <span style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <span style={{ fontWeight: 700, fontSize: 13.5, letterSpacing: ".09em", color: brand1, transition: "color .3s ease" }}>
              DAYA TALENTA GLOBAL
            </span>
            <span className="nav-sub" style={{ fontFamily: "var(--font-mono)", fontSize: 8.5, letterSpacing: ".22em", color: brand2, transition: "color .3s ease" }}>
              PART OF DAYALIMA GROUP
            </span>
          </span>
        </a>
        <div className="navlinks" style={{ display: "flex", alignItems: "center", gap: 30 }}>
          {NAV_LINKS.map((l) => (
            <a key={l.href} className="navlink" href={l.href} style={{ color: linkColor }}>
              {l.label}
            </a>
          ))}
        </div>
        <a
          href="#contact"
          className="navcta"
          style={{
            background: "#A8452F",
            color: "#F3EEE1",
            textDecoration: "none",
            fontSize: 13.5,
            fontWeight: 700,
            padding: "11px 22px",
            borderRadius: 7,
            transition: "background .15s, transform .15s",
            whiteSpace: "nowrap",
          }}
        >
          Request Talent
        </a>
      </div>
    </nav>
  );
}
