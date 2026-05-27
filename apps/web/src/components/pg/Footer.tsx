import { Icon } from "./Icon";
import Link from "next/link";
import Image from "next/image";
import { waLink } from "@/lib/contact";

const COLS = [
  {
    title: "Produk",
    items: [
      { label: "Lowongan", href: "/lowongan" },
      { label: "Sertifikasi", href: "/sertifikasi" },
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
  {
    title: "Legal",
    items: [
      { label: "Kebijakan Privasi", href: "/privacy" },
      { label: "Syarat & Ketentuan", href: "/terms" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-pg-ink-900 text-white px-5 md:px-8 py-8 md:py-12">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-8">
          <div>
            <div className="flex items-center gap-2.5">
              <Image
                src="/images/logos/logo-icon.svg"
                alt="Perantau Global"
                width={32}
                height={32}
                className="flex-shrink-0"
              />
              <div className="font-extrabold text-lg tracking-tight">
                Perantau<span style={{ color: "var(--pg-red-500)" }}>Global</span>
              </div>
            </div>
            <div className="text-[13px] text-white/60 mt-2">
              Izin P3MI Kemnaker · No. 1810240237512001
            </div>
            <div className="flex flex-col gap-2 mt-4 text-[14px]">
              <a
                href={waLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-white/85 hover:text-white no-underline"
              >
                <span
                  aria-hidden
                  className="inline-block w-2.5 h-2.5 rounded-full"
                  style={{ background: "var(--pg-wa-green)" }}
                />
                Tanya via WhatsApp
              </a>
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
          <div>© {new Date().getFullYear()} PT Daya Talenta Global · Bagian dari DayaLima (sejak 1998)</div>
          <div>Anggota Asosiasi P3MI</div>
        </div>
      </div>
    </footer>
  );
}
