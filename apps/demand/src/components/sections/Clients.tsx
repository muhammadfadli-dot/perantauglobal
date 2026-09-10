import Image from "next/image";
import { Reveal } from "@/components/Reveal";

// Client and partner logos supplied by BD (Aseel Faez, 14 Jul 2026) for display
// on this site. Curated from the source set: entries that were shop photos,
// letterheads, or too faint to read at logo size were left out.
const LOGOS = [
  { slug: "alkhorayef", name: "Alkhorayef Group", w: 257, h: 262 },
  { slug: "baskin-robbins", name: "Baskin Robbins", w: 299, h: 300 },
  { slug: "eai", name: "Education Aid International", w: 300, h: 287 },
  { slug: "bien-dental", name: "Bien Dental Clinic", w: 251, h: 251 },
  { slug: "idmi-coffee", name: "IDMI Coffee Roasting Co.", w: 261, h: 281 },
  { slug: "glary-gardens", name: "Glary Gardens", w: 266, h: 143 },
  { slug: "daily-transport", name: "Daily Transport", w: 257, h: 125 },
  { slug: "press-fresh", name: "Press and Fresh Laundry", w: 247, h: 87 },
  { slug: "pomu-no-ki", name: "Pomu no ki Japan", w: 300, h: 172 },
  { slug: "hokkaido-air-water", name: "Hokkaido Air Water Agri", w: 295, h: 133 },
];

export function Clients() {
  return (
    <Reveal
      id="clients"
      style={{ background: "#F5F1E6", borderTop: "1px solid #DCD3BE", padding: "74px 0 82px", scrollMarginTop: 74 }}
    >
      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "0 40px", textAlign: "center" }}>
        <div className="anim ar" style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <span style={{ width: 7, height: 7, background: "#B28A48", transform: "rotate(45deg)", display: "block" }} />
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: ".18em", color: "#8A6D2E" }}>REFERENCED ORGANISATIONS · [NEED APPROVAL]</span>
        </div>
        <h2 className="anim aw" style={{ margin: "0 auto 10px", fontFamily: "var(--font-display)", fontWeight: 500, fontSize: "clamp(26px,5vw,38px)", lineHeight: 1.1, color: "#20301F", maxWidth: 620, animationDelay: ".1s" }}>
          Organisations referenced for relationship review.
        </h2>
        <p className="anim ar" style={{ margin: "0 auto 40px", fontSize: 15, lineHeight: 1.6, color: "#6E6752", maxWidth: 520, animationDelay: ".2s", textWrap: "pretty" }}>
          Gakken and Danacita have been removed from this employer list. Remaining names and relationship categories require verification before publication.
        </p>
        <div className="anim ar g-clients" style={{ animationDelay: ".3s" }}>
          {LOGOS.map((l) => (
            <div key={l.slug} className="ctile">
              <Image
                src={`/images/clients/${l.slug}.png`}
                alt={l.name}
                width={l.w}
                height={l.h}
                style={{ width: "auto", height: "auto", maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
              />
            </div>
          ))}
        </div>
      </div>
    </Reveal>
  );
}
