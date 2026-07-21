"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

const fmt = (n: number, suffix: string) => n.toLocaleString("en-US") + suffix;

/**
 * Count-up numeral. Renders the final value on the server (accessible + works
 * with no JS), then animates 0 -> target when scrolled into view. Respects
 * prefers-reduced-motion (shows the final value without animating).
 */
export function Count({
  target,
  suffix = "",
  className,
  style,
}: {
  target: number;
  suffix?: string;
  className?: string;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  // Seeded with `target`, deliberately not 0: the server and the first client
  // render must emit identical markup, so the animation may only ever begin on
  // a LATER render (from the IntersectionObserver callback below).
  const [val, setVal] = useState(target);

  // React's "adjust state when a prop changes" pattern, done during render
  // instead of inside the effect. It only exists for the case where `target`
  // changes after the count-up has already settled, which leaves `val` holding
  // the previous number; the reduced-motion path has nothing else that would
  // ever correct it. Doing it here rather than as a setState in the effect body
  // avoids the cascading extra render that react-hooks/set-state-in-effect
  // flags, and it is a no-op on first render (both start from the same prop),
  // so hydration is untouched.
  const [renderedTarget, setRenderedTarget] = useState(target);
  if (renderedTarget !== target) {
    setRenderedTarget(target);
    setVal(target);
  }

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Reduced motion: the final value is already what is on screen, so there is
    // no external system to subscribe to and no observer worth attaching.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    let started = false;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting && !started) {
            started = true;
            io.unobserve(el);
            const t0 = performance.now();
            const dur = 1500;
            const step = (t: number) => {
              const p = Math.min(1, (t - t0) / dur);
              const eased = 1 - Math.pow(1 - p, 3);
              setVal(Math.round(target * eased));
              if (p < 1) raf = requestAnimationFrame(step);
            };
            setVal(0);
            raf = requestAnimationFrame(step);
          }
        }
      },
      { threshold: 0.18 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [target]);

  return (
    <span ref={ref} className={className} style={style}>
      {fmt(val, suffix)}
    </span>
  );
}
