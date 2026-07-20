"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

const NODES = [
  { n: "01", left: "10%", delay: ".3s" },
  { n: "02", left: "30%", delay: "1.6s" },
  { n: "03", left: "50%", delay: "2.9s" },
  { n: "04", left: "70%", delay: "4.2s" },
  { n: "05", left: "90%", delay: "5.5s" },
];

const STEPS = [
  { title: "Agreement", body: "We agree roles, requirements, and terms." },
  { title: "Sourcing", body: "We source and shortlist candidates against your criteria." },
  { title: "Documents & visa", body: "Permits, medicals, and visas, handled end to end." },
  { title: "Deployment", body: "Candidates arrive briefed and ready to start." },
  { title: "Support", body: "We stay involved through the guarantee period." },
];

export function Process() {
  const ref = useRef<HTMLElement>(null);

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

  const replay = () => {
    const el = ref.current;
    if (!el) return;
    el.classList.remove("seen");
    void el.offsetWidth; // force reflow so animations restart
    el.classList.add("seen");
  };

  return (
    <section ref={ref} id="process" style={{ position: "relative", overflow: "hidden", background: "#EDE7D9", padding: "96px 0", scrollMarginTop: 74 }}>
      {/* golden-hour Gulf sky, clearly visible. It fades in softly from the paper
          section above and settles back to paper behind the white journey card so
          the plane animation stays legible. A hard color break is avoided at both
          seams (feathered top; the section below fades in from paper). */}
      <div aria-hidden style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none" }}>
        <Image src="/images/process-sky.jpg" alt="" fill sizes="100vw" style={{ objectFit: "cover", objectPosition: "center 42%", opacity: 0.92 }} />
        {/* soft entry: dissolve the seam with the paper section above */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 130, background: "linear-gradient(180deg,#EDE7D9 0%,rgba(237,231,217,0) 100%)" }} />
        {/* legibility wash: light enough to keep the sky present, clears in the
            upper-mid band, then settles to paper by the journey card */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,rgba(237,231,217,.4) 0%,rgba(237,231,217,.12) 24%,rgba(237,231,217,.16) 46%,rgba(237,231,217,.52) 70%,#EDE7D9 90%)" }} />
      </div>
      <div style={{ position: "relative", zIndex: 1, maxWidth: 1240, margin: "0 auto", padding: "0 40px" }}>
        <div className="anim ar" style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <span style={{ width: 7, height: 7, background: "#B28A48", transform: "rotate(45deg)", display: "block" }} />
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: ".18em", color: "#8A6D2E" }}>HOW IT WORKS</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 48, flexWrap: "wrap", marginBottom: 20 }}>
          <h2 className="anim aw" style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 500, fontSize: "clamp(30px,6vw,44px)", lineHeight: 1.08, letterSpacing: "-.01em", color: "#20301F", maxWidth: 560, animationDelay: ".12s" }}>A clear process, managed for you.</h2>
          <p className="anim ar" style={{ margin: "0 0 6px", fontSize: 15.5, lineHeight: 1.6, color: "#6E6752", maxWidth: 380, animationDelay: ".22s", textWrap: "pretty" }}>Five steps from first agreement to arrival. Every detail is handled with your consultant along the way.</p>
        </div>
        <div className="anim ar" style={{ background: "#FBF8F0", border: "1px solid #DCD3BE", borderRadius: 14, padding: "26px 44px 34px", marginTop: 20, animationDelay: ".3s" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: ".16em", color: "#A39B87" }}>JAKARTA &nbsp;&rarr;&nbsp; THE GULF</span>
            <button type="button" className="replaybtn" onClick={replay}>
              <svg width="12" height="12" fill="none" stroke="#8A6D2E" strokeWidth="1.8" style={{ display: "block" }}><path d="M10.5 2.5v3h-3M1.5 9.5v-3h3" strokeLinecap="round" strokeLinejoin="round" /><path d="M9.6 5.5A4 4 0 0 0 2.6 4.8M2.4 6.5a4 4 0 0 0 7 .7" strokeLinecap="round" /></svg>
              Replay journey
            </button>
          </div>
          <div className="track">
            <div className="rail" />
            <div className="progress" />
            <div className="endcap" style={{ left: "10%", animationDelay: ".3s" }}><span style={{ fontSize: 12.5, fontWeight: 600, color: "#20301F", letterSpacing: ".06em" }}>CGK</span> <span style={{ fontSize: 9, letterSpacing: ".14em", color: "#A39B87" }}>JAKARTA</span></div>
            <div className="endcap" style={{ left: "90%", animationDelay: "5.5s" }}><span style={{ fontSize: 12.5, fontWeight: 600, color: "#20301F", letterSpacing: ".06em" }}>RUH</span> <span style={{ fontSize: 9, letterSpacing: ".14em", color: "#A39B87" }}>RIYADH</span></div>
            {NODES.map((node) => (
              <div key={node.n} className="node" style={{ left: node.left, animationDelay: node.delay }}>{node.n}</div>
            ))}
            <div className="plane">
              <svg width="30" height="30" viewBox="0 0 24 24" style={{ display: "block", filter: "drop-shadow(0 3px 5px rgba(32,48,31,.28))" }}>
                <path d="M21.8 3.1 3.4 10.2c-.7.27-.66 1.28.06 1.49l5.2 1.52 1.52 5.2c.2.72 1.22.76 1.49.06L21.9 3.1Z" fill="#C79A4B" />
                <path d="M21.8 3.1 9.8 13.2" fill="none" stroke="#20301F" strokeWidth="1" strokeLinecap="round" opacity=".55" />
              </svg>
            </div>
          </div>
          <div className="g-proc" style={{ marginTop: 8 }}>
            {STEPS.map((s) => (
              <div key={s.title} style={{ textAlign: "center", padding: "0 8px" }}>
                <div style={{ fontSize: 14.5, fontWeight: 700, color: "#20301F", marginBottom: 6 }}>{s.title}</div>
                <p style={{ margin: 0, fontSize: 12.5, lineHeight: 1.55, color: "#6E6752" }}>{s.body}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="anim ar g-2mo" style={{ marginTop: 24, background: "#20301F", backgroundImage: "repeating-linear-gradient(45deg,rgba(216,185,120,.045) 0,rgba(216,185,120,.045) 1px,transparent 1px,transparent 24px),repeating-linear-gradient(-45deg,rgba(216,185,120,.045) 0,rgba(216,185,120,.045) 1px,transparent 1px,transparent 24px)", borderRadius: 14, padding: "38px 44px", display: "grid", gridTemplateColumns: "auto 1fr", gap: 48, alignItems: "center", animationDelay: ".5s" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
            <span style={{ width: 52, height: 52, position: "relative", display: "block", flex: "none" }}>
              <span style={{ position: "absolute", inset: 0, border: "1.5px solid #B28A48", transform: "rotate(45deg)", display: "block" }} />
              <svg width="22" height="22" fill="none" stroke="#D8B978" strokeWidth="1.7" style={{ position: "absolute", left: 15, top: 15 }}><circle cx="9" cy="9" r="8" /><path d="M9 4.2V9l3.2 2" strokeLinecap="round" /></svg>
            </span>
            <div><div className="h2mo" style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: "clamp(30px,7vw,46px)", lineHeight: 1, color: "#F3EEE1", whiteSpace: "nowrap" }}>About 2 months</div><div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: ".16em", color: "#D8B978", marginTop: 10 }}>SIGNED JOB ORDER TO ARRIVAL</div></div>
          </div>
          <p style={{ margin: 0, fontSize: 15.5, lineHeight: 1.62, color: "#B9C4A6", maxWidth: 600, textWrap: "pretty" }}>That is what a fully legal cross-border placement takes. We are 100% legal, and that is exactly why you can trust the timeline. An agency promising a visa in days is skipping the steps that protect you. We do not skip any of them.</p>
        </div>
      </div>
    </section>
  );
}
