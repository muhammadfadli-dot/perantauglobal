"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, type IconName } from "@/components/pg/Icon";
import SignOutButton from "../SignOutButton";

type NavItem = {
  href: string;
  label: string;
  icon: IconName;
  count?: number;
  pill?: { label: string; tone: "ok" | "warn" | "info" | "mute" };
};

type NavSection = { title: string; items: NavItem[] };

export type SidebarCounts = {
  positions?: number;
  jobOrdersOpen?: number;
  candidates?: number;
  applications?: number;
  pendingDocs?: number;
  inboxNew?: number;
};

export default function AdminSidebar({
  email,
  fullName,
  role,
  counts,
}: {
  email: string | null;
  fullName?: string | null;
  role?: string | null;
  counts?: SidebarCounts;
}) {
  const pathname = usePathname() ?? "";

  const dashboardItem: NavItem = { href: "/admin", label: "Dashboard", icon: "home" };

  const operasi: NavSection = {
    title: "Operasi",
    items: [
      // Lamaran first — primary daily triage surface
      { href: "/admin/applications", label: "Lamaran", icon: "compass", count: counts?.applications },
      { href: "/admin/positions", label: "Catalog posisi", icon: "doc", count: counts?.positions },
      {
        href: "/admin/job-orders",
        label: "Job orders",
        icon: "briefcase",
        pill: counts?.jobOrdersOpen
          ? { label: `${counts.jobOrdersOpen} OPEN`, tone: "ok" }
          : undefined,
      },
      { href: "/admin/candidates", label: "Kandidat", icon: "users", count: counts?.candidates },
      {
        href: "/admin/documents",
        label: "Review dokumen",
        icon: "doc_check",
        pill: counts?.pendingDocs
          ? { label: `${counts.pendingDocs} PENDING`, tone: "warn" }
          : undefined,
      },
      {
        href: "/admin/inbox",
        label: "Inbox",
        icon: "mail",
        pill: counts?.inboxNew
          ? { label: `${counts.inboxNew} BARU`, tone: "warn" }
          : undefined,
      },
      { href: "/admin/events", label: "Event", icon: "bell" },
      { href: "/admin/analytics", label: "Analytics", icon: "sparkle_dot" },
    ],
  };

  const sistem: NavSection = {
    title: "Sistem",
    items: [
      { href: "/admin/audit-log", label: "Audit log", icon: "shield" },
      { href: "/admin/team", label: "Tim admin", icon: "user" },
    ],
  };

  const initials = (fullName || email || "AD")
    .split(/\s+|@/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <aside
      className="hidden md:flex md:flex-col w-[260px] shrink-0 h-screen sticky top-0"
      style={{ background: "var(--pg-white)", borderRight: "1px solid var(--pg-border)" }}
    >
      {/* Brand */}
      <div className="px-5 pt-6 pb-4" style={{ borderBottom: "1px solid var(--pg-border)" }}>
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg grid place-items-center text-white font-extrabold"
            style={{ background: "var(--pg-red-600)", fontSize: "16px" }}
          >
            P
          </div>
          <div className="font-extrabold text-[15px] tracking-[-0.01em] text-pg-ink-900">
            Perantau Global
          </div>
        </div>
        <div
          className="pl-[42px] mt-0.5 text-[10px] font-semibold tracking-[0.12em] uppercase"
          style={{ color: "var(--pg-red-600)", fontFamily: "var(--font-mono)" }}
        >
          Admin Console
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5 overflow-y-auto">
        <SidebarLink item={dashboardItem} pathname={pathname} exact />

        <SectionHeader title={operasi.title} />
        {operasi.items.map((it) => (
          <SidebarLink key={it.href} item={it} pathname={pathname} />
        ))}

        <SectionHeader title={sistem.title} />
        {sistem.items.map((it) => (
          <SidebarLink key={it.href} item={it} pathname={pathname} />
        ))}
      </nav>

      {/* User card */}
      <div
        className="flex items-center gap-2.5 px-4 py-3.5"
        style={{ borderTop: "1px solid var(--pg-border)" }}
      >
        <div
          className="w-8 h-8 rounded-full grid place-items-center text-white font-bold shrink-0"
          style={{ background: "var(--pg-ink-900)", fontSize: "12px" }}
        >
          {initials}
        </div>
        <div className="flex-1 min-w-0 flex flex-col gap-0.5">
          <div className="text-[13px] font-bold leading-tight text-pg-ink-900 truncate">
            {fullName || "Admin"}
          </div>
          <div
            className="text-[11px] leading-tight truncate"
            style={{ color: "var(--pg-ink-tertiary)" }}
          >
            {role || email || "—"}
          </div>
        </div>
        <div className="shrink-0">
          <SignOutButton variant="iconOnly" />
        </div>
      </div>
    </aside>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div
      className="px-3 pb-2 pt-4 text-[10px] font-semibold tracking-[0.12em] uppercase"
      style={{ color: "var(--pg-ink-quaternary)", fontFamily: "var(--font-mono)" }}
    >
      {title}
    </div>
  );
}

function SidebarLink({
  item,
  pathname,
  exact,
}: {
  item: NavItem;
  pathname: string;
  exact?: boolean;
}) {
  const active = exact ? pathname === item.href : pathname.startsWith(item.href);
  return (
    <Link
      href={item.href}
      className="flex items-center gap-2.5 rounded-[10px] px-3 py-2.5 text-[13px] no-underline transition-colors"
      style={{
        background: active ? "var(--pg-red-50)" : "transparent",
        color: active ? "var(--pg-red-600)" : "var(--pg-ink-secondary)",
        fontWeight: active ? 700 : 600,
      }}
    >
      <span
        className="shrink-0"
        style={{ color: active ? "var(--pg-red-600)" : "var(--pg-ink-tertiary)" }}
      >
        <Icon name={item.icon} size={16} stroke={active ? 2.2 : 2} />
      </span>
      <span className="flex-1 leading-[16px]">{item.label}</span>
      {item.pill ? (
        <PillBadge label={item.pill.label} tone={item.pill.tone} />
      ) : item.count != null ? (
        <span
          className="text-[11px] font-semibold leading-[14px]"
          style={{ color: "var(--pg-ink-tertiary)", fontFamily: "var(--font-mono)" }}
        >
          {item.count}
        </span>
      ) : null}
    </Link>
  );
}

function PillBadge({
  label,
  tone,
}: {
  label: string;
  tone: "ok" | "warn" | "info" | "mute";
}) {
  const colors: Record<string, { bg: string; fg: string }> = {
    ok: { bg: "var(--pg-ok-soft-bg)", fg: "var(--pg-ok-soft-fg)" },
    warn: { bg: "var(--pg-warn-soft-bg)", fg: "var(--pg-warn-soft-fg)" },
    info: { bg: "var(--pg-info-bg)", fg: "var(--pg-info)" },
    mute: { bg: "var(--pg-ink-50)", fg: "var(--pg-ink-tertiary)" },
  };
  const c = colors[tone] ?? colors.mute;
  return (
    <span
      className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold leading-[12px]"
      style={{ background: c?.bg, color: c?.fg, fontFamily: "var(--font-mono)" }}
    >
      {label}
    </span>
  );
}
