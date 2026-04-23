"use client";

import Link from "next/link";
import { useState } from "react";
import { Icon } from "./Icon";

const NAV_LINKS = [
  { label: "Lowongan", href: "/lowongan" },
  { label: "Talent Hub", href: "/talent-hub" },
  { label: "Tentang", href: "/tentang" },
  { label: "FAQ", href: "/faq" },
];

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://app.perantauglobal.com";

export function TopBarWWW() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <header
        className="sticky top-0 z-30 flex items-center justify-between px-5 md:px-8 py-3.5 border-b border-pg-ink-100"
        style={{
          background: "rgba(250,250,248,.92)",
          backdropFilter: "saturate(140%) blur(8px)",
        }}
      >
        <Link href="/" className="flex items-center gap-2.5 no-underline text-pg-ink-900">
          <div
            className="w-7 h-7 rounded-lg grid place-items-center text-white font-extrabold text-sm tracking-tight"
            style={{ background: "var(--pg-red-600)" }}
          >
            P
          </div>
          <div className="font-extrabold tracking-tight text-base">
            Perantau<span className="text-pg-red-600">Global</span>
          </div>
        </Link>
        <nav className="hidden md:flex items-center gap-7">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm font-semibold text-pg-ink-700 hover:text-pg-red-600 no-underline"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <a
            href={APP_URL}
            className="inline-flex items-center justify-center min-h-[40px] px-3.5 text-sm font-semibold rounded-xl bg-pg-red-600 text-white hover:bg-pg-red-700 no-underline transition-colors"
          >
            Buka Talent Hub
          </a>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="md:hidden w-10 h-10 rounded-[10px] border border-pg-ink-200 bg-pg-white grid place-items-center cursor-pointer"
            aria-label="Menu"
          >
            <Icon name={open ? "x" : "menu"} size={20} />
          </button>
        </div>
      </header>
      {open && (
        <div className="md:hidden border-b border-pg-ink-100 bg-pg-white px-5 py-3 flex flex-col gap-1">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block px-3 py-3 text-base font-semibold text-pg-ink-900 hover:bg-pg-ink-50 rounded-lg no-underline"
            >
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
