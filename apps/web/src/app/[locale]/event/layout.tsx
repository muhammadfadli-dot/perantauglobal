import Link from "next/link";
import Image from "next/image";

/**
 * Minimal chrome for event landing pages — logo + single CTA, NO global nav.
 * This is a focused, paid-traffic conversion surface: the only action is to
 * register. Deliberately not wrapped in the marketing TopBar/TrustStrip.
 */
export default function EventLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <header
        className="sticky top-0 z-30 flex items-center justify-between px-5 md:px-8 py-3.5 border-b border-pg-ink-100"
        style={{
          background: "var(--pg-paper-blur)",
          backdropFilter: "saturate(140%) blur(8px)",
        }}
      >
        <Link
          href="/"
          className="flex items-center gap-2 no-underline text-pg-ink-900"
        >
          <Image
            src="/images/logos/logo-icon.svg"
            alt="Perantau Global"
            width={26}
            height={26}
            className="flex-shrink-0"
            priority
          />
          <span className="font-extrabold tracking-tight text-base">
            Perantau<span className="text-pg-red-600">Global</span>
          </span>
        </Link>
        <a
          href="#daftar"
          className="inline-flex items-center justify-center min-h-[36px] md:min-h-[40px] px-3.5 sm:px-4 text-[13px] sm:text-sm font-semibold rounded-xl bg-pg-red-600 text-white hover:bg-pg-red-700 no-underline transition-colors whitespace-nowrap"
        >
          Daftar gratis
        </a>
      </header>

      {children}

      <footer className="px-5 md:px-8 py-8 border-t border-pg-ink-100 bg-pg-paper">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2 text-pg-ink-700">
            <Image
              src="/images/logos/logo-icon.svg"
              alt=""
              width={22}
              height={22}
            />
            <span className="font-bold text-sm">
              Perantau<span className="text-pg-red-600">Global</span>
            </span>
          </div>
          {/* Legal reachable from the LP itself: the registration form asks for
              PDP consent that references these two documents, so they can't only
              exist behind the global Footer this layout deliberately drops. */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <nav className="flex items-center justify-center gap-4">
              <Link
                href="/privacy"
                className="text-[12px] text-pg-ink-500 hover:text-pg-ink-700 no-underline"
              >
                Kebijakan Privasi
              </Link>
              <Link
                href="/terms"
                className="text-[12px] text-pg-ink-500 hover:text-pg-ink-700 no-underline"
              >
                Syarat &amp; Ketentuan
              </Link>
            </nav>
            <p className="text-[12px] text-pg-ink-500 font-mono">
              © 2026 PT Daya Talenta Global · dayalima.com
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
