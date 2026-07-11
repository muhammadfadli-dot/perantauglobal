import { Reveal } from "@/components/Reveal";
import { Count } from "@/components/Count";

// Placeholder talent stories. Real photos + words from placed professionals
// (shared with their permission) will replace these; kept clearly labeled as a
// preview so nothing here reads as a verified testimonial yet.
const STORIES = [
  { initials: "AR", name: "Ardi R.", role: "Registered Nurse", place: "Riyadh", quote: "Everything was handled properly, and I arrived ready to work." },
  { initials: "SW", name: "Siti W.", role: "Spa Therapist", place: "Jeddah", quote: "Clear steps and real support. I always knew what came next." },
  { initials: "BP", name: "Bagus P.", role: "Barista", place: "Doha", quote: "Documents and visa were managed end to end. I just prepared." },
  { initials: "NH", name: "Nur H.", role: "Caregiver", place: "Dammam", quote: "A proper, legal process. My family felt at ease about it." },
  { initials: "DK", name: "Dedi K.", role: "Cook", place: "Riyadh", quote: "About two months, exactly as explained. No surprises." },
  { initials: "LM", name: "Lia M.", role: "Housekeeping", place: "Abu Dhabi", quote: "They stayed in touch even after I had arrived." },
];

export function TalentPoolCounter() {
  return (
    <Reveal id="pool" style={{ background: "#EDE7D9", padding: "96px 0", scrollMarginTop: 74 }}>
      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "0 40px", textAlign: "center" }}>
        <div className="anim ar" style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <span style={{ width: 7, height: 7, background: "#B28A48", transform: "rotate(45deg)", display: "block" }} />
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: ".18em", color: "#8A6D2E" }}>TALENT POOL · LIVE, ROUNDED</span>
        </div>
        <h2 className="anim aw" style={{ margin: "0 auto 8px", fontFamily: "var(--font-display)", fontWeight: 500, fontSize: "clamp(26px,5vw,38px)", lineHeight: 1.1, color: "#20301F", maxWidth: 560, animationDelay: ".1s" }}>The talent is real. And ready.</h2>
        <div className="anim ar" style={{ fontFamily: "var(--font-mono)", fontWeight: 600, fontSize: "clamp(56px,11vw,150px)", lineHeight: 1, letterSpacing: "-.04em", color: "#20301F", margin: "12px 0 6px", animationDelay: ".2s" }}>
          <Count target={1300} suffix="+" />
        </div>
        <div className="anim ar" style={{ fontSize: 16, fontWeight: 600, color: "#4A5A32", animationDelay: ".3s" }}>Indonesian professionals in our active talent pool</div>
        <div className="anim ar g-pool" style={{ marginTop: 44, borderTop: "1px solid #DCD3BE", maxWidth: 900, marginLeft: "auto", marginRight: "auto", animationDelay: ".4s" }}>
          <div style={{ padding: "26px 20px" }}><div style={{ fontFamily: "var(--font-mono)", fontSize: 34, fontWeight: 600, color: "#8A6D2E" }}><Count target={550} suffix="+" /></div><div style={{ fontSize: 12.5, color: "#6E6752", marginTop: 6 }}>Ready for Saudi &amp; GCC roles</div></div>
          <div style={{ padding: "26px 20px", borderLeft: "1px solid #DCD3BE" }}><div style={{ fontFamily: "var(--font-mono)", fontSize: 34, fontWeight: 600, color: "#8A6D2E" }}><Count target={380} suffix="+" /></div><div style={{ fontSize: 12.5, color: "#6E6752", marginTop: 6 }}>In the Japan pipeline</div></div>
          <div style={{ padding: "26px 20px", borderLeft: "1px solid #DCD3BE" }}><div style={{ fontFamily: "var(--font-mono)", fontSize: 34, fontWeight: 600, color: "#8A6D2E" }}>7</div><div style={{ fontSize: 12.5, color: "#6E6752", marginTop: 6 }}>Active placement markets</div></div>
        </div>
        <div className="anim ar" style={{ marginTop: 48, animationDelay: ".5s" }}>
          {/* full-bleed rotating stories. Placeholder cards for now; auto-scrolls,
              pauses on hover, and falls back to a scrollable row on reduced motion */}
          <div style={{ width: "100vw", marginLeft: "calc(50% - 50vw)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 9, marginBottom: 22 }}>
              <span style={{ width: 6, height: 6, background: "#B28A48", transform: "rotate(45deg)", display: "block" }} />
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, letterSpacing: ".2em", color: "#8A6D2E" }}>TALENT STORIES · PREVIEW</span>
            </div>
            <div className="tmarq">
              <div className="tmarq-track">
                {[...STORIES, ...STORIES].map((s, i) => (
                  <figure key={i} className="tcard" aria-hidden={i >= STORIES.length || undefined}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                      <span className="tavatar">{s.initials}</span>
                      <span style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                        <span style={{ fontSize: 14.5, fontWeight: 700, color: "#20301F" }}>{s.name}</span>
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: 9.5, letterSpacing: ".08em", color: "#8A6D2E" }}>{s.role.toUpperCase()} · {s.place.toUpperCase()}</span>
                      </span>
                    </div>
                    <blockquote style={{ margin: 0, fontSize: 13.5, lineHeight: 1.6, color: "#4A4636", fontStyle: "italic" }}>&ldquo;{s.quote}&rdquo;</blockquote>
                  </figure>
                ))}
              </div>
            </div>
            <p style={{ margin: "18px auto 0", fontSize: 11.5, lineHeight: 1.5, color: "#9A927E", maxWidth: 520, textAlign: "center", padding: "0 20px" }}>Placeholder previews. Real photos and words from placed talent, shared with their permission, are coming soon.</p>
          </div>
        </div>
        <div className="anim ar" style={{ margin: "40px auto 0", maxWidth: 620, background: "#20301F", borderRadius: 10, padding: "16px 22px", display: "flex", gap: 12, alignItems: "center", textAlign: "left", animationDelay: ".6s" }}>
          <svg width="20" height="20" fill="none" stroke="#D8B978" strokeWidth="1.7" style={{ display: "block", flex: "none" }}><circle cx="10" cy="10" r="8" /><path d="m6.5 10.5 2.4 2.4 4.6-5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          <p style={{ margin: 0, fontSize: 13, lineHeight: 1.55, color: "#B9C4A6" }}>Every inquiry is re-verified against your specific requirements before we present candidates. You see current availability, not a stale list.</p>
        </div>
      </div>
    </Reveal>
  );
}
