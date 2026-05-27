"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, type IconName } from "./Icon";
import { LogoMark } from "./Logo";

/**
 * Top app bar — sticky, brand-anchored.
 *
 * Layout: 3-column grid (40px / 1fr / 40px) so the title stays optically
 * centered regardless of left/right content.
 *
 * Left slot:
 *   - When `back`: back button → backHref (default /dashboard)
 *   - Otherwise: small "PG" brand mark — identity anchor on root pages so the
 *     bar always reads as "Perantau Global / Global Talent Hub"
 *
 * Right slot: reserved for future actions. Notification bell was removed
 * because no notifications backend exists yet; we'll bring it back when
 * push is real.
 */
export function TopBarApp({
  title,
  back,
  backHref,
}: {
  title: string;
  back?: boolean;
  backHref?: string;
}) {
  return (
    <header
      className="sticky top-0 z-30 px-4"
      style={{
        background:
          "linear-gradient(180deg, #fffefa 0%, var(--pg-paper) 100%)",
        boxShadow:
          "0 1px 0 rgba(20,20,20,0.04), 0 4px 12px rgba(20,20,20,0.04)",
      }}
    >
      <div
        className="min-h-[60px] py-3"
        style={{
          display: "grid",
          gridTemplateColumns: "40px 1fr 40px",
          alignItems: "center",
          gap: 8,
        }}
      >
        <div className="flex items-center justify-start">
          {back ? (
            <Link
              href={backHref ?? "/dashboard"}
              className="w-10 h-10 rounded-[12px] grid place-items-center text-pg-ink-900 no-underline"
              style={{
                background: "var(--pg-white)",
                border: "1px solid var(--pg-border)",
                boxShadow: "0 1px 2px rgba(20,20,20,0.04)",
              }}
              aria-label="Kembali"
            >
              <Icon name="arrow_left" size={20} />
            </Link>
          ) : (
            <BrandMark />
          )}
        </div>
        <div
          className="text-center font-extrabold text-[16px] tracking-[-0.015em] truncate"
          style={{ color: "var(--pg-ink-primary)" }}
        >
          {title}
        </div>
        <div /> {/* right slot — reserved for future actions */}
      </div>
    </header>
  );
}

function BrandMark() {
  return (
    <Link
      href="/dashboard"
      className="w-10 h-10 rounded-[12px] grid place-items-center text-white no-underline"
      style={{
        background:
          "linear-gradient(135deg, var(--pg-red-600) 0%, var(--pg-red-700) 100%)",
        boxShadow:
          "0 2px 6px rgba(215,38,47,0.30), inset 0 1px 0 rgba(255,255,255,0.25)",
      }}
      aria-label="Perantau Global — beranda"
    >
      <LogoMark size={22} />
    </Link>
  );
}

/**
 * Bottom nav — Portal v2 design (Phase 5a).
 *
 * 4 tabs per design: Beranda · Lowongan · Paspor · Saya.
 *
 * Replaces the old "Jelajah / Lamaran / Profil" labels with the v2 names.
 * /applications route still exists but is reached from the Beranda hero
 * card (the active lamaran lives inline on home). The "apps" tab is gone.
 *
 * Active state: top-anchored 3px red bar (cleaner indicator than text-only
 * color) + red icon + red label.
 */
const NAV_ITEMS: { key: string; label: string; icon: IconName; href: string }[] = [
  { key: "home",   label: "Beranda",  icon: "home",     href: "/dashboard" },
  { key: "search", label: "Lowongan", icon: "search",   href: "/explore" },
  { key: "learn",  label: "Paspor",   icon: "passport", href: "/paspor" },
  { key: "me",     label: "Saya",     icon: "user",     href: "/profile" },
];

export function BottomNav() {
  const pathname = usePathname();
  const activeKey =
    pathname?.startsWith("/profile") ? "me" :
    pathname?.startsWith("/paspor") ? "learn" :
    pathname?.startsWith("/explore") ? "search" :
    // /applications/* still maps to Beranda since lamaran lives there post-v2
    "home";

  return (
    <>
      {/* Mobile: sticky bottom bar */}
      <nav
        className="md:hidden sticky bottom-0 z-30 grid grid-cols-4 px-2 pt-0 pb-4 border-t border-pg-ink-100"
        style={{ background: "var(--pg-white)" }}
        aria-label="Navigasi utama"
      >
        {NAV_ITEMS.map((it) => {
          const on = it.key === activeKey;
          return (
            <Link
              key={it.key}
              href={it.href}
              aria-current={on ? "page" : undefined}
              className={`relative flex flex-col items-center gap-1 pt-3 pb-1 px-1 no-underline text-[10.5px] font-bold tracking-[0.02em] transition-colors ${
                on ? "text-pg-red-600" : "text-pg-ink-400"
              }`}
            >
              <span
                aria-hidden
                className="absolute top-0 left-1/2 -translate-x-1/2 h-[3px] w-6 rounded-b-[4px] transition-opacity"
                style={{
                  background: "var(--pg-red-600)",
                  opacity: on ? 1 : 0,
                }}
              />
              <Icon name={it.icon} size={22} stroke={on ? 2.2 : 1.8} />
              <span>{it.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Desktop: fixed-left vertical sidebar (Phase 5h) */}
      <nav
        className="hidden md:flex fixed left-0 top-0 bottom-0 z-30 w-[240px] flex-col gap-1 px-4 py-6 border-r border-pg-ink-100"
        style={{ background: "var(--pg-white)" }}
        aria-label="Navigasi utama"
      >
        <Link
          href="/dashboard"
          className="flex items-center gap-2.5 mb-6 px-2 no-underline"
        >
          <span
            className="w-10 h-10 rounded-[12px] grid place-items-center text-white font-extrabold text-[13px] shrink-0"
            style={{
              background:
                "linear-gradient(135deg, var(--pg-red-600) 0%, var(--pg-red-700) 100%)",
              boxShadow:
                "0 2px 6px rgba(215,38,47,0.30), inset 0 1px 0 rgba(255,255,255,0.25)",
            }}
          >
            PG
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-[14px] font-extrabold tracking-[-0.015em] text-pg-ink-900">
              Perantau Global
            </span>
            <span className="font-mono text-[10px] text-pg-ink-500 tracking-[0.04em]">
              v2 · Portal
            </span>
          </span>
        </Link>

        {NAV_ITEMS.map((it) => {
          const on = it.key === activeKey;
          return (
            <Link
              key={it.key}
              href={it.href}
              aria-current={on ? "page" : undefined}
              className="flex items-center gap-3 px-3 py-2.5 rounded-[10px] no-underline text-[14px] font-bold transition-colors"
              style={
                on
                  ? {
                      background: "var(--pg-red-50)",
                      color: "var(--pg-red-700)",
                    }
                  : {
                      color: "var(--pg-ink-700)",
                    }
              }
            >
              <Icon name={it.icon} size={18} stroke={on ? 2.4 : 2} />
              {it.label}
              {on && (
                <span
                  aria-hidden
                  className="ml-auto w-1.5 h-1.5 rounded-full"
                  style={{ background: "var(--pg-red-600)" }}
                />
              )}
            </Link>
          );
        })}

        <div className="mt-auto pt-4 border-t border-pg-ink-100">
          <Link
            href="/profile"
            className="flex items-center gap-3 px-3 py-2.5 rounded-[10px] no-underline text-[12.5px] text-pg-ink-500"
          >
            <Icon name="info" size={16} />
            Bantuan
          </Link>
        </div>
      </nav>
    </>
  );
}

export function StickyCTA({
  label = "Lamar posisi ini",
  note = "Gratis sampai terima offering letter",
  href,
  onClick,
}: {
  label?: string;
  note?: string;
  href?: string;
  onClick?: () => void;
}) {
  const inner = (
    <>
      <button
        type="button"
        onClick={onClick}
        className="inline-flex items-center justify-center gap-2 w-full min-h-[52px] px-5 text-base font-semibold rounded-xl bg-pg-red-600 text-white hover:bg-pg-red-700"
      >
        {label} <Icon name="arrow_right" size={18} />
      </button>
      <div className="text-[12px] text-pg-ink-500 text-center mt-2">{note}</div>
    </>
  );
  return (
    <div
      className="sticky bottom-0 z-30 px-5 py-3.5 pb-5 border-t border-pg-ink-100"
      style={{ background: "rgba(255,255,255,.96)", backdropFilter: "blur(8px)" }}
    >
      {href ? (
        <Link
          href={href}
          className="inline-flex items-center justify-center gap-2 w-full min-h-[52px] px-5 text-base font-semibold rounded-xl bg-pg-red-600 text-white hover:bg-pg-red-700 no-underline"
        >
          {label} <Icon name="arrow_right" size={18} />
        </Link>
      ) : (
        inner
      )}
    </div>
  );
}

export function ApplyHeader({
  step,
  total = 5,
  title,
  backHref,
}: {
  step: number;
  total?: number;
  title: string;
  backHref?: string;
}) {
  return (
    <div
      className="sticky top-0 z-30 border-b border-pg-ink-100"
      style={{ background: "var(--pg-paper)" }}
    >
      <div className="flex items-center px-5 py-3 gap-3">
        <Link
          href={backHref ?? "/explore"}
          className="w-10 h-10 rounded-[10px] border border-pg-ink-200 bg-pg-white grid place-items-center text-pg-ink-900 no-underline"
          aria-label="Kembali"
        >
          <Icon name="arrow_left" size={20} />
        </Link>
        <div className="flex-1">
          <div className="text-[12px] font-bold tracking-[0.08em] uppercase text-pg-ink-500">
            Langkah {step} dari {total}
          </div>
          <div className="text-[15px] font-bold tracking-tight mt-0.5">{title}</div>
        </div>
      </div>
      <div className="h-1 bg-pg-ink-100 mx-5 mb-3 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${(step / total) * 100}%`, background: "var(--pg-red-600)" }}
        />
      </div>
    </div>
  );
}
