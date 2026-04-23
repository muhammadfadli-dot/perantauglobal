import { Icon } from "./Icon";
import Link from "next/link";

const COLS = [
  {
    title: "Lowongan",
    items: [
      { label: "Semua lowongan", href: "/lowongan" },
      { label: "Talent Hub", href: "/talent-hub" },
    ],
  },
  {
    title: "Tentang",
    items: [
      { label: "Tentang DTG", href: "/tentang" },
      { label: "Tim", href: "/tim" },
      { label: "Layanan", href: "/layanan" },
    ],
  },
  {
    title: "Bantuan",
    items: [
      { label: "FAQ", href: "/faq" },
      { label: "Proses", href: "/proses" },
      { label: "Kontak", href: "/kontak" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-pg-ink-900 text-white px-5 md:px-8 py-8 md:py-12">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr] gap-8">
          <div>
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-lg grid place-items-center text-white font-extrabold text-sm tracking-tight"
                style={{ background: "var(--pg-red-600)" }}
              >
                P
              </div>
              <div className="font-extrabold text-lg tracking-tight">
                Perantau<span style={{ color: "var(--pg-red-500)" }}>Global</span>
              </div>
            </div>
            <div className="text-[13px] text-white/60 mt-2">Lisensi P3MI · Sejak 1998</div>
            <div className="flex flex-col gap-2 mt-4 text-[14px]">
              <a
                href="mailto:halo@perantauglobal.com"
                className="flex items-center gap-2 text-white/85 hover:text-white no-underline"
              >
                <Icon name="mail" size={16} />
                halo@perantauglobal.com
              </a>
              <div className="flex items-center gap-2 text-white/70">
                <Icon name="pin" size={16} />
                Jakarta, Indonesia
              </div>
            </div>
          </div>
          {COLS.map((col) => (
            <div key={col.title}>
              <div
                className="text-[12px] font-bold tracking-[0.12em] uppercase"
                style={{ color: "var(--pg-red-500)" }}
              >
                {col.title}
              </div>
              <ul className="mt-3 flex flex-col gap-2.5">
                {col.items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-sm text-white/85 hover:text-white no-underline"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 pt-5 border-t border-white/10 text-xs text-white/50 flex flex-col md:flex-row gap-2 justify-between">
          <div>© {new Date().getFullYear()} PT Daya Talenta Global. All rights reserved.</div>
          <div>Lisensi P3MI Kemnaker · Anggota Asosiasi P3MI</div>
        </div>
      </div>
    </footer>
  );
}
