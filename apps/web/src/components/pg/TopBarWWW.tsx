"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Icon } from "./Icon";

const NAV_LINKS = [
  { label: "Cari Kerja", href: "/lowongan" },
  { label: "Cara Daftar", href: "/proses" },
  { label: "Tentang", href: "/tentang" },
  { label: "FAQ", href: "/faq" },
];

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://app.perantauglobal.com";

export function TopBarWWW() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <header
        className="sticky top-0 z-30 flex items-center justify-between px-5 md:px-8 py-4 border-b border-pg-ink-100"
        style={{
          background: "var(--pg-paper-blur)",
          backdropFilter: "saturate(140%) blur(8px)",
        }}
      >
        <Link href="/" className="flex items-center gap-2 no-underline text-pg-ink-900">
          <Image
            src="/images/logos/logo-icon.svg"
            alt="Perantau Global"
            width={28}
            height={28}
            className="flex-shrink-0"
            priority
          />
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
            className="inline-flex items-center justify-center min-h-[36px] md:min-h-[40px] px-2.5 sm:px-3.5 text-[13px] sm:text-sm font-semibold rounded-xl bg-pg-red-600 text-white hover:bg-pg-red-700 no-underline transition-colors whitespace-nowrap"
          >
            <span className="sm:hidden">Daftar</span>
            <span className="hidden sm:inline">Buka Perantau Global</span>
          </a>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="md:hidden w-9 h-9 sm:w-10 sm:h-10 rounded-[10px] border border-pg-ink-200 bg-pg-white grid place-items-center cursor-pointer flex-shrink-0"
            aria-label="Menu"
          >
            <Icon name={open ? "x" : "menu"} size={18} />
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
