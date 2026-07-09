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
  const [val, setVal] = useState(target);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVal(target);
      return;
    }
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
