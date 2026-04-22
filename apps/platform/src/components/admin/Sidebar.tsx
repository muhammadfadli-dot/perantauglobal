import Link from "next/link";
import SignOutButton from "./SignOutButton";

const NAV = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/candidates", label: "Kandidat" },
  { href: "/admin/applications", label: "Lamaran" },
];

export default function AdminSidebar({ email }: { email: string | null }) {
  return (
    <aside className="hidden w-60 shrink-0 border-r border-[var(--color-dtg-ink)]/10 bg-white md:flex md:flex-col">
      <div className="border-b border-[var(--color-dtg-ink)]/10 px-5 py-5">
        <p className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.14em] opacity-50">
          Admin CRM
        </p>
        <p className="mt-1 font-[family-name:var(--font-display)] text-lg">
          Perantau Global
        </p>
      </div>

      <nav className="flex-1 px-3 py-4">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="block rounded px-3 py-2 text-sm hover:bg-[var(--color-dtg-cream)]"
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="border-t border-[var(--color-dtg-ink)]/10 px-5 py-4">
        <p className="truncate font-[family-name:var(--font-mono)] text-[11px] opacity-60">
          {email ?? "—"}
        </p>
        <SignOutButton />
      </div>
    </aside>
  );
}
