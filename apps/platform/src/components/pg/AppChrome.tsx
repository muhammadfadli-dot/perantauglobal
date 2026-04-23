"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, type IconName } from "./Icon";

export function TopBarApp({
  title,
  back,
  bell,
  backHref,
}: {
  title: string;
  back?: boolean;
  bell?: boolean;
  backHref?: string;
}) {
  return (
    <header
      className="sticky top-0 z-30 flex items-center justify-between px-5 py-3 border-b border-pg-ink-100 min-h-[56px]"
      style={{ background: "var(--pg-paper)" }}
    >
      <div className="flex items-center gap-3">
        {back && (
          <Link
            href={backHref ?? "/dashboard"}
            className="w-10 h-10 rounded-[10px] border border-pg-ink-200 bg-pg-white grid place-items-center text-pg-ink-900 no-underline"
            aria-label="Kembali"
          >
            <Icon name="arrow_left" size={20} />
          </Link>
        )}
        <div className="font-extrabold text-[17px] tracking-tight">{title}</div>
      </div>
      {bell && (
        <button
          type="button"
          className="relative w-10 h-10 rounded-[10px] border border-pg-ink-200 bg-pg-white grid place-items-center"
          aria-label="Notifikasi"
        >
          <Icon name="bell" size={20} />
          <span
            className="absolute top-2 right-[9px] w-2 h-2 rounded-full"
            style={{ background: "var(--pg-red-600)", border: "2px solid var(--pg-white)" }}
          />
        </button>
      )}
    </header>
  );
}

const NAV_ITEMS: { key: string; label: string; icon: IconName; href: string }[] = [
  { key: "home", label: "Beranda", icon: "home", href: "/dashboard" },
  { key: "explore", label: "Jelajah", icon: "compass", href: "/explore" },
  { key: "apps", label: "Lamaran", icon: "briefcase", href: "/applications" },
  { key: "profile", label: "Profil", icon: "user", href: "/profile" },
];

export function BottomNav() {
  const pathname = usePathname();
  const activeKey =
    pathname?.startsWith("/profile") ? "profile" :
    pathname?.startsWith("/explore") ? "explore" :
    pathname?.startsWith("/applications") ? "apps" :
    "home";
  return (
    <nav
      className="sticky bottom-0 z-30 grid grid-cols-4 px-2 pt-2 pb-3.5 border-t border-pg-ink-100"
      style={{ background: "var(--pg-white)" }}
    >
      {NAV_ITEMS.map((it) => {
        const on = it.key === activeKey;
        return (
          <Link
            key={it.key}
            href={it.href}
            className={`flex flex-col items-center gap-1 py-2 px-1 no-underline text-[11px] font-bold tracking-wide ${
              on ? "text-pg-red-600" : "text-pg-ink-400"
            }`}
          >
            <Icon name={it.icon} size={22} stroke={on ? 2.2 : 1.8} />
            <span>{it.label}</span>
          </Link>
        );
      })}
    </nav>
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
