"use client";

import { useState, useTransition } from "react";
import { Icon } from "@/components/pg/Icon";
import { updatePositionMeta } from "../actions";

/**
 * Standalone publish toggle for a position. Lifted out of PositionMetaEditor
 * because the old pill-button looked like a status badge instead of an
 * interactive control. Now it's a switch with explicit copy on both sides
 * so admin sees the consequence before flipping it.
 *
 * Effects when off (active=false):
 *   - Excluded from apps/web /lowongan (fetchPositionsForCatalog filters
 *     WHERE active=true) so the public catalog hides it
 *   - Excluded from detail-page generateStaticParams (DB union) — direct
 *     URL still resolves via the static fallback for legacy slugs, but
 *     the page won't list it
 *   - Existing applications, job orders, and candidate data are untouched
 *
 * Use this as the toggle for "should this position publish to the public
 * site right now?" — not for archival/delete. For delete use the Danger
 * zone at the bottom of the editor page.
 */
export default function PositionActiveToggle({
  slug,
  initialActive,
}: {
  slug: string;
  initialActive: boolean;
}) {
  const [active, setActive] = useState(initialActive);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function flip() {
    setError(null);
    const next = !active;
    setActive(next); // optimistic
    start(async () => {
      try {
        const res = await updatePositionMeta(slug, { active: next });
        if (!res.ok) {
          setActive(!next); // revert — guard refused (returned, survives prod)
          setError(res.error);
        }
      } catch (err) {
        setActive(!next); // revert
        setError(err instanceof Error ? err.message : "Gagal mengubah status");
      }
    });
  }

  return (
    <div
      className="bg-pg-white rounded-2xl p-5"
      style={{ border: "1px solid var(--pg-border)" }}
    >
      <div className="flex items-start gap-4">
        {/* Switch rail */}
        <button
          type="button"
          role="switch"
          aria-checked={active}
          onClick={flip}
          disabled={pending}
          className={`relative shrink-0 inline-flex h-7 w-12 items-center rounded-full transition-colors disabled:opacity-60 ${
            active ? "bg-pg-ok" : "bg-pg-ink-300"
          }`}
          style={{ outline: "none" }}
        >
          <span className="sr-only">
            {active ? "Nonaktifkan posisi" : "Aktifkan posisi"}
          </span>
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-pg-white shadow-sm transition-transform ${
              active ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>

        {/* Copy + meta */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="text-[15px] font-extrabold text-pg-ink-primary">
              {active ? "Tampil di /lowongan" : "Disembunyikan"}
            </div>
            <span
              className={`inline-flex items-center gap-1 px-2 h-5 rounded-full text-[10px] font-bold tracking-[0.08em] uppercase ${
                active
                  ? "bg-pg-ok-bg text-pg-ok"
                  : "bg-pg-ink-100 text-pg-ink-tertiary"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  active ? "bg-pg-ok" : "bg-pg-ink-400"
                }`}
              />
              {active ? "Live" : "Hidden"}
            </span>
            {pending && (
              <span className="text-[11px] text-pg-ink-tertiary font-mono">
                Menyimpan…
              </span>
            )}
          </div>

          <p className="text-[13px] text-pg-ink-secondary leading-relaxed mt-1">
            {active ? (
              <>
                Posisi muncul di perantauglobal.com/lowongan dan terima lamaran
                baru. Tap switch untuk sembunyiin sementara.
              </>
            ) : (
              <>
                Posisi nggak muncul di perantauglobal.com/lowongan dan tolak
                lamaran baru. Data lamaran existing tetap aman. Tap switch
                untuk balikin live.
              </>
            )}
          </p>

          {active && (
            <a
              href={`https://perantauglobal.com/lowongan/${slug}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 mt-2 text-[12px] font-semibold text-pg-red-600 no-underline hover:underline"
            >
              Lihat halaman publik
              <Icon name="arrow_right" size={12} />
            </a>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-3 text-[12px] text-pg-err flex items-center gap-1">
          <Icon name="warn" size={12} /> {error}
        </div>
      )}
    </div>
  );
}
