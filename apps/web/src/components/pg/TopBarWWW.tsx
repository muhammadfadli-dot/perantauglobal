"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://app.perantauglobal.com";

/**
 * Perantau Global has exactly two things to offer a candidate: a job abroad,
 * and training to get ready for one. The header states that as a two-lane
 * switch rather than a flat link list, so the Akademi lane is as findable as
 * the jobs lane instead of living only on the homepage.
 *
 * Tentang / FAQ / Proses moved out of the header on purpose (they are all in
 * the footer). Each lane explains its own flow on its own page, so a
 * site-level "Cara Daftar" entry no longer describes a single process.
 */
const LANES = [
  {
    href: "/lowongan",
    label: "Cari Kerja",
    sub: "Lowongan luar negeri",
    dot: "var(--pg-red-600)",
    isNew: false,
  },
  {
    href: "/akademi",
    label: "Akademi",
    sub: "Pelatihan & kelas",
    dot: "var(--pa-amber-600)",
    isNew: true,
  },
] as const;

export function TopBarWWW() {
  const pathname = usePathname() ?? "";
  // Locale-prefixed routes ("/id/akademi") must match too, so test for the
  // segment rather than anchoring at the string start.
  const inLane = (href: string) => pathname === href || pathname.includes(`${href}/`) || pathname.endsWith(href);

  return (
    <header
      className="sticky top-0 z-30 border-b border-pg-ink-100"
      style={{
        background: "var(--pg-paper-blur)",
        backdropFilter: "saturate(140%) blur(8px)",
      }}
    >
      <div className="max-w-6xl mx-auto px-5 md:px-8 py-2.5 flex items-center justify-between gap-3.5 flex-wrap">
        <Link href="/" className="flex items-center gap-2 no-underline text-pg-ink-900">
          <Image
            src="/images/logos/logo-icon.svg"
            alt="Perantau Global"
            width={30}
            height={30}
            className="flex-shrink-0"
            priority
          />
          <div className="font-extrabold tracking-tight text-[17px]">
            Perantau<span className="text-pg-red-600">Global</span>
          </div>
        </Link>

        <nav
          aria-label="Bagian utama"
          className="flex gap-1 rounded-[14px] p-[5px] order-3 basis-full sm:order-none sm:basis-auto"
          style={{
            background: "var(--pg-switch-bg)",
            border: "1px solid var(--pg-switch-border)",
          }}
        >
          {LANES.map((lane) => {
            const active = inLane(lane.href);
            return (
              <Link
                key={lane.href}
                href={lane.href}
                aria-current={active ? "page" : undefined}
                className="flex flex-col gap-px px-3.5 py-[7px] rounded-[10px] no-underline flex-1 sm:flex-none min-w-0"
                style={
                  active
                    ? { background: "var(--pg-white)", boxShadow: "0 1px 3px rgba(20,20,20,0.09)" }
                    : undefined
                }
              >
                <span className="flex items-center gap-[7px] font-extrabold text-[14.5px] text-pg-ink-900">
                  <span
                    aria-hidden
                    className="w-[7px] h-[7px] rounded-full flex-none"
                    style={{ background: lane.dot }}
                  />
                  {lane.label}
                  {lane.isNew && (
                    <span
                      className="font-mono text-[8px] font-bold tracking-[0.05em]"
                      style={{ color: "var(--pa-amber-600)" }}
                    >
                      BARU
                    </span>
                  )}
                </span>
                {/* Desktop-only nicety. On a phone the switch already sits on
                    its own row, and keeping the sub-labels pushed the sticky
                    header to 159px, about a fifth of a 812px screen. */}
                <span className="hidden sm:block text-[11px] font-medium text-pg-ink-400 pl-[19px]">
                  {lane.sub}
                </span>
              </Link>
            );
          })}
        </nav>

        <a
          href={APP_URL}
          className="inline-flex items-center min-h-[42px] px-4 rounded-xl border-[1.5px] border-pg-ink-200 bg-pg-white text-pg-ink-900 font-bold text-[13.5px] no-underline hover:bg-pg-ink-50 transition-colors whitespace-nowrap"
        >
          Masuk
        </a>
      </div>
    </header>
  );
}
