"use client";

import { useEffect, useRef, useState } from "react";

const FAQS = [
  {
    q: "Do you actually have ready candidates?",
    a: "Yes. Around 1,300 professionals are in our active pool, with 550+ ready for Saudi and GCC roles. We re-verify availability against your requirements before presenting anyone.",
  },
  {
    q: "How long does the process take?",
    a: "About two months from signed job order to arrival. That is the timeline of a fully legal cross-border placement, and it is why you can rely on it.",
  },
  {
    q: "Do you handle documents and visas?",
    a: "Yes, end to end. Contracts, permits, medical checks, and visa processing are managed by our team on both sides of the route.",
  },
  {
    q: "Are you a registered agent?",
    a: "Yes. We are an approved agent registered with Saudi MOFA and hold Indonesian P3MI license No. 1810240237512001, as part of Dayalima Group.",
  },
];

export function Faq() {
  const ref = useRef<HTMLElement>(null);
  const [open, setOpen] = useState(0);

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

  return (
    <section ref={ref} id="faq" style={{ background: "#F5F1E6", padding: "96px 0", scrollMarginTop: 74 }}>
      <div className="g-faq" style={{ maxWidth: 1240, margin: "0 auto", padding: "0 40px" }}>
        <div>
          <div className="anim ar" style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <span style={{ width: 7, height: 7, background: "#B28A48", transform: "rotate(45deg)", display: "block" }} />
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: ".18em", color: "#8A6D2E" }}>STRAIGHT ANSWERS</span>
          </div>
          <h2 className="anim aw" style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 500, fontSize: "clamp(26px,5vw,38px)", lineHeight: 1.1, color: "#20301F", animationDelay: ".12s" }}>What employers ask us first.</h2>
          <p className="anim ar" style={{ margin: "18px 0 0", fontSize: 14.5, lineHeight: 1.6, color: "#6E6752", animationDelay: ".24s", textWrap: "pretty" }}>Four honest answers before you even reach out. Anything else, our team is one message away.</p>
        </div>
        <div>
          {FAQS.map((f, i) => {
            const isOpen = open === i;
            return (
              <div key={f.q} className="anim ar faqrow" style={{ borderTop: i === 0 ? "1px solid #20301F" : "1px solid #DCD3BE", borderBottom: i === FAQS.length - 1 ? "1px solid #DCD3BE" : undefined, padding: i === 0 ? "22px 4px" : "20px 4px", animationDelay: `${i * 0.1}s` }}>
                <button
                  type="button"
                  className="faqbtn"
                  aria-expanded={isOpen}
                  aria-controls={`faq-body-${i}`}
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  style={{ all: "unset", boxSizing: "border-box", width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}
                >
                  <span style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 20, color: "#20301F" }}>{f.q}</span>
                  <span aria-hidden style={{ width: 22, height: 22, border: `1px solid ${isOpen ? "#B28A48" : "#C9BD9E"}`, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: isOpen ? "#B28A48" : "#8A857A", fontSize: isOpen ? 14 : 15, flex: "none" }}>{isOpen ? "−" : "+"}</span>
                </button>
                <div id={`faq-body-${i}`} style={{ maxHeight: isOpen ? 240 : 0, overflow: "hidden", transition: "max-height .3s ease, opacity .3s ease, margin .3s ease", opacity: isOpen ? 1 : 0, marginTop: isOpen ? 12 : 0 }}>
                  <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: "#4A4636", maxWidth: 640 }}>{f.a}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
