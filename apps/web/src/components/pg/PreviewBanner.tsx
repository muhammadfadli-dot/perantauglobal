/**
 * Sits on top of a draft preview so it can never be mistaken for the live page.
 *
 * The failure this guards against is subtle: an admin previews a draft, gets
 * distracted, and later reads that same URL as proof of what candidates see.
 * The banner (plus the noindex the page emits in preview) makes the distinction
 * impossible to miss and gives a one-click way out.
 */
export function PreviewBanner({ slug, active }: { slug: string; active: boolean }) {
  return (
    <div
      className="sticky top-0 z-50 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 px-4 py-2 text-center"
      style={{ background: "#141414", color: "#fff" }}
    >
      <span className="font-mono text-[11px] font-bold uppercase tracking-[0.12em]">
        Mode preview draft
      </span>
      <span className="text-[12.5px] opacity-80">
        Ini versi draft, bukan halaman publik.
        {!active && " Posisi ini juga belum aktif, jadi publik belum bisa lihat sama sekali."}
      </span>
      <a
        href={`/api/preview/disable?slug=${encodeURIComponent(slug)}`}
        className="text-[12.5px] font-bold underline underline-offset-2"
        style={{ color: "#fff" }}
      >
        Keluar dari preview
      </a>
    </div>
  );
}
