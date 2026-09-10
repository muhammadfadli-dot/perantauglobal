"use client";

import { useEffect, useState } from "react";

const INTRO_DURATION_MS = 2000;

export function PageIntroLoader() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setIsVisible(false);
      return;
    }

    const timer = window.setTimeout(() => setIsVisible(false), INTRO_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="dtg-page-intro-loader" role="status" aria-label="Loading">
      <div className="dtg-loader" aria-hidden="true" />
      <span className="dtg-visually-hidden">Loading</span>
    </div>
  );
}
