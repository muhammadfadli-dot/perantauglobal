import Image from "next/image";
import { Reveal } from "@/components/Reveal";

const ARROW = (
  <svg width="16" height="16" fill="none" stroke="#A8452F" strokeWidth="1.8">
    <path d="M2.5 8h10.5M9.5 4.5 13 8l-3.5 3.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const SECTORS = [
  {
    num: "01",
    title: "Healthcare",
    subtitle: "For hospitals, clinics, and care facilities.",
    img: "/images/sector-healthcare.jpg",
    alt: "Indonesian nurse reviewing a patient chart in a modern hospital ward",
    roles: ["Registered nurses", "Caregivers and orderlies", "Allied health professionals"],
    cta: "Request healthcare talent",
    medallion: (
      <svg width="26" height="26" fill="none" stroke="#D8B978" strokeWidth="1.6">
        <rect x="5" y="5" width="16" height="16" rx="3" />
        <path d="M13 9v8M9 13h8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    num: "02",
    title: "Hospitality",
    subtitle: "For hotels, restaurants, and coffee chains.",
    img: "/images/sector-hospitality.jpg",
    alt: "Indonesian barista preparing pour-over coffee in an upscale hotel cafe",
    roles: ["Baristas and F&B service", "Housekeeping teams", "Cooks and kitchen staff"],
    cta: "Request hospitality talent",
    medallion: (
      <svg width="26" height="26" fill="none" stroke="#D8B978" strokeWidth="1.5">
        <path d="M6 10h10v5a5 5 0 0 1-10 0Z" />
        <path d="M16 11h1.6a2.4 2.4 0 0 1 0 4.8H15.5" />
        <path d="M5 22h12" strokeLinecap="round" />
        <path d="M9 4.5v2.2M13 4.2v2.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    num: "03",
    title: "Wellness",
    subtitle: "For resorts, spas, and wellness centers.",
    img: "/images/sector-wellness.jpg",
    alt: "Indonesian wellness therapist preparing a serene spa treatment room",
    roles: ["Spa and massage therapists", "Salon professionals", "Fitness and wellness staff"],
    cta: "Request wellness talent",
    medallion: (
      <svg width="26" height="26" fill="none" stroke="#D8B978" strokeWidth="1.5">
        <path d="M21 5c-8 0-13 4.5-13 11 0 2.7 1.8 4.8 4.8 4.8C19 20.8 21 13 21 5Z" strokeLinejoin="round" />
        <path d="M6 21C8.5 16 12 11 17 7" strokeLinecap="round" />
      </svg>
    ),
  },
];

const MARKET_SECTORS = {
  gcc: SECTORS,
  europe: [
    { ...SECTORS[0], title: "Healthcare & care", subtitle: "For hospitals, care providers, and senior-living partners.", roles: ["Registered nurses", "Care assistants", "Allied health professionals"], cta: "Discuss healthcare talent" },
    { ...SECTORS[1], title: "Hospitality", subtitle: "For hotels, restaurants, and guest-experience operators.", roles: ["F&B service", "Housekeeping", "Culinary professionals"], cta: "Discuss hospitality talent" },
    { ...SECTORS[2], title: "Technical services", subtitle: "For manufacturing, facilities, and operations-led organisations.", roles: ["Technicians", "Maintenance teams", "Skilled operators"], cta: "Discuss technical talent" },
  ],
  japan: [
    { ...SECTORS[0], title: "Manufacturing", subtitle: "For production and skilled operational workforce conversations.", roles: ["Skilled production", "Technical operators", "Quality support"], cta: "Discuss manufacturing talent" },
    { ...SECTORS[1], title: "Caregiving", subtitle: "For care providers assessing a role-specific workforce need.", roles: ["Caregiving roles", "Care support", "Readiness-led selection"], cta: "Discuss caregiving talent" },
    { ...SECTORS[2], title: "Service & logistics", subtitle: "For food service, automotive maintenance, and logistics operations.", roles: ["Food service", "Automotive maintenance", "Logistics operations"], cta: "Discuss this workforce need" },
  ],
} as const;

export function Sectors({ market = "gcc" }: { market?: keyof typeof MARKET_SECTORS }) {
  const sectors = MARKET_SECTORS[market];
  return (
    <Reveal id="sectors" style={{ background: "#F5F1E6", padding: "96px 0", scrollMarginTop: 74 }}>
      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "0 40px" }}>
        <div className="anim ar" style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <span style={{ width: 7, height: 7, background: "#B28A48", transform: "rotate(45deg)", display: "block" }} />
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: ".18em", color: "#8A6D2E" }}>SECTORS</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 48, flexWrap: "wrap", marginBottom: 20 }}>
          <h2 className="anim aw" style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 500, fontSize: "clamp(30px,6vw,44px)", lineHeight: 1.08, letterSpacing: "-.01em", color: "#20301F", maxWidth: 560, animationDelay: ".12s" }}>Three sectors. Deep benches.</h2>
          <p className="anim ar" style={{ margin: "0 0 6px", fontSize: 15.5, lineHeight: 1.6, color: "#6E6752", maxWidth: 400, animationDelay: ".22s", textWrap: "pretty" }}>Focused pools mean faster shortlists and better fits. Tell us the roles, we bring the people.</p>
        </div>
        <svg className="anim adraw" width="200" height="8" style={{ display: "block", margin: "0 0 46px", overflow: "visible" }}>
          <line x1="0" y1="4" x2="200" y2="4" stroke="#B28A48" strokeWidth="1.4" strokeDasharray="200" strokeDashoffset="200" />
        </svg>
        <div className="g-3">
          {sectors.map((s, i) => (
            <div key={s.title} className="anim ar card" style={{ animationDelay: `${0.3 + i * 0.1}s` }}>
              <div className="imgslot">
                <div className="imgclip">
                  <div className="imgfill">
                    <Image src={s.img} alt={s.alt} fill sizes="(max-width:920px) 100vw, 400px" style={{ objectFit: "cover" }} />
                  </div>
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,rgba(20,32,20,.15),rgba(20,32,20,.55))" }} />
                  <span style={{ position: "absolute", top: 15, right: 18, fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: ".2em", color: "#F0E6C8", zIndex: 3 }}>{s.num}</span>
                </div>
                <span className="medallion">{s.medallion}</span>
              </div>
              <div style={{ padding: "42px 28px 30px", display: "flex", flexDirection: "column", flex: 1 }}>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 25, color: "#20301F" }}>{s.title}</div>
                <div style={{ fontSize: 13, color: "#6E6752", margin: "5px 0 22px" }}>{s.subtitle}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 28 }}>
                  {s.roles.map((role) => (
                    <div key={role} style={{ display: "flex", gap: 12, alignItems: "center" }}>
                      <span style={{ width: 5, height: 5, background: "#B28A48", transform: "rotate(45deg)", flex: "none" }} />
                      <span style={{ fontSize: 14.5, color: "#413E33" }}>{role}</span>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: "auto", paddingTop: 22, borderTop: "1px solid #E8E0CE" }}>
                  <a href="#contact" className="cta" style={{ fontSize: 14, fontWeight: 700, color: "#A8452F", textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}>{s.cta} {ARROW}</a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Reveal>
  );
}
