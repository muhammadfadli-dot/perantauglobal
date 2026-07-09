"use client";

import { useEffect, useRef, type HTMLAttributes, type ReactNode } from "react";

/**
 * Scroll-reveal wrapper. Renders a <section> and adds the `.seen` class when it
 * scrolls into view (threshold 0.18, once), which gates the CSS entrance
 * animations (.aw/.af/.ar/...). Mirrors the design's IntersectionObserver.
 */
export function Reveal({
  children,
  className = "",
  ...rest
}: HTMLAttributes<HTMLElement> & { children: ReactNode }) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || el.classList.contains("seen")) return;
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
    <section ref={ref} className={className} {...rest}>
      {children}
    </section>
  );
}
