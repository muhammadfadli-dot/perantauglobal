import type { ReactNode } from "react";
import Link from "next/link";
import { LogoMark } from "@/components/LogoMark";
import { Footer } from "@/components/sections/Footer";

/**
 * Chrome for the legal pages (/privacy, /terms).
 *
 * The site Nav is a scroll-spy header whose links are all same-page anchors
 * (#why, #sectors, ...), so it is dead weight on a standalone route. This is a
 * static header in the same lockup, a dark hero band lifted from the Contact
 * section, and a paper card in the Credentials treatment. No scroll-reveal
 * classes: legal copy must render even with scripting off.
 *
 * Prose typography lives in globals.css under `.legal` rather than inline, the
 * same way form controls do. Page-level layout stays inline, like every section.
 */

const HERO_TEXTURE =
  "radial-gradient(900px 440px at 50% -20%,rgba(178,138,72,.16),transparent 60%),repeating-linear-gradient(45deg,rgba(216,185,120,.04) 0,rgba(216,185,120,.04) 1px,transparent 1px,transparent 26px),repeating-linear-gradient(-45deg,rgba(216,185,120,.04) 0,rgba(216,185,120,.04) 1px,transparent 1px,transparent 26px)";

export function LegalShell({
  title,
  lede,
  effective,
  children,
}: {
  title: string;
  lede: string;
  effective: string;
  children: ReactNode;
}) {
  return (
    <>
      <header style={{ background: "#F5F1E6", borderBottom: "1px solid #DCD3BE" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto", padding: "20px clamp(16px,4vw,40px)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20 }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 13, textDecoration: "none" }}>
            <LogoMark size={34} />
            <span style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <span style={{ fontWeight: 700, fontSize: 13.5, letterSpacing: ".09em", color: "#20301F" }}>DAYA TALENTA GLOBAL</span>
              <span className="nav-sub" style={{ fontFamily: "var(--font-mono)", fontSize: 8.5, letterSpacing: ".22em", color: "#8A857A" }}>PART OF DAYALIMA GROUP</span>
            </span>
          </Link>
          <Link href="/#contact" className="navcta" style={{ background: "#A8452F", color: "#F3EEE1", textDecoration: "none", fontSize: 13.5, fontWeight: 700, padding: "11px 22px", borderRadius: 7, transition: "background .15s, transform .15s", whiteSpace: "nowrap" }}>
            Request Talent
          </Link>
        </div>
      </header>

      <main>
        <div style={{ background: "#20301F", backgroundImage: HERO_TEXTURE, padding: "72px clamp(16px,4vw,40px) 96px" }}>
          <div style={{ maxWidth: 860, margin: "0 auto" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 9, marginBottom: 16 }}>
              <span style={{ width: 7, height: 7, background: "#B28A48", transform: "rotate(45deg)", display: "block" }} />
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: ".18em", color: "#D8B978" }}>LEGAL</span>
            </div>
            <h1 style={{ margin: "0 0 16px", fontFamily: "var(--font-display)", fontWeight: 500, fontSize: "clamp(32px,4.4vw,50px)", lineHeight: 1.06, letterSpacing: "-.012em", color: "#F5F1E6" }}>
              {title}
            </h1>
            <p style={{ margin: "0 0 22px", fontSize: 15.5, lineHeight: 1.65, color: "#B9C4A6", maxWidth: 640, textWrap: "pretty" }}>{lede}</p>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: ".14em", color: "#8A9781" }}>
              EFFECTIVE {effective.toUpperCase()}
            </div>
          </div>
        </div>

        <div style={{ background: "#EDE7D9", padding: "0 clamp(16px,4vw,40px) 90px" }}>
          <div
            className="legal"
            style={{ background: "#F3EEE1", border: "1px solid #DCD3BE", borderRadius: 14, padding: "44px clamp(24px,5vw,52px)", maxWidth: 860, margin: "0 auto", marginTop: -56, boxShadow: "0 18px 50px rgba(32,48,31,.09)" }}
          >
            {children}
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}

/** One numbered clause. The gold mono numeral matches the stat treatment used across the site. */
export function LegalSection({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <section className="legal-sec">
      <h2>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: ".64em", fontWeight: 600, letterSpacing: ".06em", color: "#B28A48", marginRight: 11 }}>
          {String(n).padStart(2, "0")}
        </span>
        {title}
      </h2>
      {children}
    </section>
  );
}
