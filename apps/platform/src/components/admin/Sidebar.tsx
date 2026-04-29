"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, type IconName } from "@/components/pg/Icon";
import SignOutButton from "../SignOutButton";

const NAV: { href: string; label: string; icon: IconName }[] = [
  { href: "/admin", label: "Overview", icon: "home" },
  { href: "/admin/job-orders", label: "Job Orders", icon: "briefcase" },
  { href: "/admin/positions", label: "Posisi", icon: "sparkle" },
  { href: "/admin/candidates", label: "Kandidat", icon: "users" },
  { href: "/admin/applications", label: "Lamaran", icon: "doc" },
  { href: "/admin/documents", label: "Review Dokumen", icon: "doc_check" },
  { href: "/admin/inbox", label: "Inbox", icon: "mail" },
  { href: "/admin/analytics", label: "Analytics", icon: "sparkle_dot" },
  { href: "/admin/team", label: "Tim", icon: "shield" },
  { href: "/admin/audit-log", label: "Audit Log", icon: "clock" },
];

export default function AdminSidebar({ email }: { email: string | null }) {
  const pathname = usePathname() ?? "";
  return (
    <aside
      className="hidden md:flex md:flex-col w-64 shrink-0 text-white"
      style={{ background: "var(--pg-ink-900)" }}
    >
      <div className="px-5 py-5 flex items-center gap-2.5 border-b border-white/10">
        <div
          className="w-8 h-8 rounded-lg grid place-items-center text-white font-extrabold text-sm tracking-tight"
          style={{ background: "var(--pg-red-600)" }}
        >
          P
        </div>
        <div>
          <div className="text-[10px] font-bold tracking-[0.14em] uppercase opacity-60">
            Admin CRM
          </div>
          <div className="font-extrabold text-base tracking-tight">PerantauGlobal</div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {NAV.map((item) => {
          const active =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold no-underline transition-colors ${
                active
                  ? "bg-pg-red-600 text-white"
                  : "text-white/80 hover:bg-white/10"
              }`}
            >
              <Icon name={item.icon} size={18} stroke={active ? 2.2 : 1.8} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 px-5 py-4">
        <div className="text-[11px] text-white/60 truncate font-mono">{email ?? "—"}</div>
        <div className="mt-2">
          <SignOutButton />
        </div>
      </div>
    </aside>
  );
}
