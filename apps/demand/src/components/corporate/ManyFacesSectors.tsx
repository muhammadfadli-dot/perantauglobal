"use client";

import { useEffect, useState } from "react";

type Sector = {
  title: string;
  summary: string;
  detail: string;
  points: string[];
};

const sectors: Sector[] = [
  {
    title: "Healthcare & care",
    summary: "Service quality and continuity.",
    detail: "For organisations managing service quality and continuity in hospitals, clinics, care facilities, and senior-living contexts.",
    points: [
      "Role responsibilities and shift context",
      "Relevant care or clinical experience",
      "Readiness evidence and preparation gaps",
    ],
  },
  {
    title: "Hospitality & F&B",
    summary: "Capacity and guest experience.",
    detail: "For operators balancing guest experience, service consistency, and staffing capacity across hospitality and F&B settings.",
    points: [
      "Service and guest-experience context",
      "Relevant hospitality or F&B experience",
      "Readiness evidence and preparation gaps",
    ],
  },
  {
    title: "Technical & industrial",
    summary: "Safety and demonstrated skill.",
    detail: "For employers managing safety, output, maintenance, and operational continuity in technical or industrial contexts.",
    points: [
      "Role, safety, and operating context",
      "Relevant technical or industrial experience",
      "Readiness evidence and preparation gaps",
    ],
  },
];

export function ManyFacesSectors() {
  const [selectedSector, setSelectedSector] = useState<Sector | null>(null);

  useEffect(() => {
    if (!selectedSector) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedSector(null);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [selectedSector]);

  return (
    <>
      <div className="corp-many-faces-sectors">
        {sectors.map((sector) => (
          <button
            key={sector.title}
            type="button"
            aria-haspopup="dialog"
            onClick={() => setSelectedSector(sector)}
          >
            <strong>{sector.title}</strong>
            <span>{sector.summary}</span>
          </button>
        ))}
      </div>

      {selectedSector ? (
        <div
          className="corp-sector-dialog-backdrop"
          onMouseDown={() => setSelectedSector(null)}
        >
          <section
            className="corp-sector-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="sector-dialog-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button
              className="corp-sector-dialog-close"
              type="button"
              onClick={() => setSelectedSector(null)}
              aria-label="Close sector details"
            >
              ×
            </button>
            <p className="corp-kicker">SECTOR CONTEXT</p>
            <h3 id="sector-dialog-title">{selectedSector.title}</h3>
            <p>{selectedSector.detail}</p>
            <div className="corp-sector-dialog-points">
              <h4>What employers may explore</h4>
              <ul>
                {selectedSector.points.map((point) => <li key={point}>{point}</li>)}
              </ul>
            </div>
            <small>Illustrative sector context only—not a live talent pool, placement claim, or guarantee.</small>
          </section>
        </div>
      ) : null}
    </>
  );
}
