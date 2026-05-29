"use client";

import { useState } from "react";
import { Icon } from "@/components/pg/Icon";
import { saveDraftMediaSeo } from "../../app/(admin)/admin/positions/actions";
import type { PositionContent, ContentMedia, ContentSeo } from "@/lib/position-content";

/**
 * Media & SEO tab — 5th tab in the position editor.
 *
 * Writes ONLY positions.draft_content.media (image URLs) + .seo (meta tags) via
 * the dedicated `saveDraftMediaSeo` action, which merges them into the current
 * draft server-side. The Konten tab's `saveDraft` symmetrically preserves media/seo,
 * so the two tabs own disjoint keys and their independent auto-saves can't clobber
 * each other regardless of save order (fixes the prior one-directional event-bus bug).
 *
 * Trade-off: text URLs only for MVP. File upload to Supabase Storage is
 * deferred until storage RLS + bucket setup lands (separate phase).
 */
export default function MediaSeoTab({
  slug,
  initialContent,
}: {
  slug: string;
  initialContent: PositionContent;
}) {
  const [media, setMedia] = useState<ContentMedia>(initialContent.media ?? {});
  const [seo, setSeo] = useState<ContentSeo>(initialContent.seo ?? {});
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function persist(nextMedia: ContentMedia, nextSeo: ContentSeo) {
    setSaving(true);
    setError(null);
    try {
      // Strip empty strings to undefined so DB doesn't store dead keys.
      const cleanMedia: ContentMedia = {};
      if (nextMedia.heroUrl?.trim()) cleanMedia.heroUrl = nextMedia.heroUrl.trim();
      if (nextMedia.employerLogoUrl?.trim())
        cleanMedia.employerLogoUrl = nextMedia.employerLogoUrl.trim();
      if (nextMedia.ogImageUrl?.trim())
        cleanMedia.ogImageUrl = nextMedia.ogImageUrl.trim();

      const cleanSeo: ContentSeo = {};
      if (nextSeo.metaTitle?.trim()) cleanSeo.metaTitle = nextSeo.metaTitle.trim();
      if (nextSeo.metaDescription?.trim())
        cleanSeo.metaDescription = nextSeo.metaDescription.trim();

      // Send only media/seo; the action merges them into the current draft server-side,
      // preserving the Konten tab's fields. No client-side content mirroring needed.
      await saveDraftMediaSeo(
        slug,
        Object.keys(cleanMedia).length > 0 ? cleanMedia : undefined,
        Object.keys(cleanSeo).length > 0 ? cleanSeo : undefined,
      );
      setSavedAt(new Date());
      window.dispatchEvent(
        new CustomEvent("pg-editor-state", {
          detail: { dirty: false, saving: false, savedAt: new Date().toISOString() },
        }),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  }

  function updateMedia(patch: Partial<ContentMedia>) {
    const next = { ...media, ...patch };
    setMedia(next);
    void persist(next, seo);
  }
  function updateSeo(patch: Partial<ContentSeo>) {
    const next = { ...seo, ...patch };
    setSeo(next);
    void persist(media, next);
  }

  return (
    <div className="grid gap-5 max-w-3xl">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <div
          className="text-[11px] font-bold tracking-[0.12em] uppercase font-mono"
          style={{ color: "var(--pg-red-600)" }}
        >
          Aset visual
        </div>
        <h2 className="text-[22px] font-extrabold tracking-[-0.02em] leading-[26px]">
          Media &amp; SEO
        </h2>
        <p className="text-[13.5px] text-pg-ink-tertiary leading-[20px]">
          Foto, logo, OG image, dan meta tags untuk Google / sharing. Pakai foto
          resmi — jangan stock. Untuk MVP isi URL hosting (Cloudinary,
          employer-provided). Upload langsung dari komputer datang di phase
          berikutnya.
        </p>
      </div>

      {/* Media URLs */}
      <section
        className="bg-pg-white rounded-2xl p-5"
        style={{ border: "1px solid var(--pg-border)" }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="text-[14px] font-extrabold">Aset gambar</div>
          {saving && (
            <span className="font-mono text-[10.5px] text-pg-info">Menyimpan…</span>
          )}
        </div>

        <div className="flex flex-col gap-3.5">
          <MediaUrlRow
            icon="globe"
            label="Hero photo"
            hint="Full-bleed di header lowongan · ratio 2400×1080 (21:9)"
            value={media.heroUrl ?? ""}
            onChange={(v) => setMedia({ ...media, heroUrl: v })}
            onBlur={() => updateMedia({ heroUrl: media.heroUrl })}
            placeholder="https://res.cloudinary.com/.../hero.jpg"
          />
          <MediaUrlRow
            icon="shield"
            label="Logo employer"
            hint="Square SVG/PNG, tampil di trust signals & footer"
            value={media.employerLogoUrl ?? ""}
            onChange={(v) => setMedia({ ...media, employerLogoUrl: v })}
            onBlur={() => updateMedia({ employerLogoUrl: media.employerLogoUrl })}
            placeholder="https://employer.com/logo.svg"
          />
          <MediaUrlRow
            icon="arrow_right"
            label="OG image"
            hint="Sharing preview · 1200×630 (1.91:1). Kosong = pakai hero photo otomatis."
            value={media.ogImageUrl ?? ""}
            onChange={(v) => setMedia({ ...media, ogImageUrl: v })}
            onBlur={() => updateMedia({ ogImageUrl: media.ogImageUrl })}
            placeholder="https://res.cloudinary.com/.../og.jpg"
          />
        </div>
      </section>

      {/* SEO meta */}
      <section
        className="bg-pg-white rounded-2xl p-5"
        style={{ border: "1px solid var(--pg-border)" }}
      >
        <div className="text-[14px] font-extrabold mb-1">SEO meta tags</div>
        <p className="text-[12.5px] text-pg-ink-tertiary leading-[18px] mb-4">
          Untuk Google search results &amp; WhatsApp / FB sharing. Auto-generate
          dari konten kalau kosong, tapi diisi manual hasilnya lebih bagus.
        </p>

        <div className="flex flex-col gap-3.5">
          <div className="flex flex-col gap-1.5">
            <label
              className="text-[11px] font-bold tracking-[0.06em] uppercase font-mono"
              style={{ color: "var(--pg-ink-secondary)" }}
            >
              Meta title{" "}
              <span
                className="font-normal lowercase tracking-normal"
                style={{ color: "var(--pg-ink-tertiary)" }}
              >
                (≤ 60 char rekomendasi)
              </span>
            </label>
            <input
              type="text"
              value={seo.metaTitle ?? ""}
              onChange={(e) => setSeo({ ...seo, metaTitle: e.target.value })}
              onBlur={() => updateSeo({ metaTitle: seo.metaTitle })}
              placeholder="Lowongan Kerja … — Perantau Global"
              maxLength={80}
              className="rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-colors"
              style={{
                border: "1px solid var(--pg-border)",
                background: "var(--pg-paper)",
              }}
            />
            <div
              className="text-[10.5px] tabular-nums"
              style={{
                color:
                  (seo.metaTitle?.length ?? 0) > 60
                    ? "var(--pg-warn-soft-fg)"
                    : "var(--pg-ink-quaternary)",
                fontFamily: "var(--font-mono)",
              }}
            >
              {seo.metaTitle?.length ?? 0} / 60 karakter
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              className="text-[11px] font-bold tracking-[0.06em] uppercase font-mono"
              style={{ color: "var(--pg-ink-secondary)" }}
            >
              Meta description{" "}
              <span
                className="font-normal lowercase tracking-normal"
                style={{ color: "var(--pg-ink-tertiary)" }}
              >
                (≤ 160 char rekomendasi)
              </span>
            </label>
            <textarea
              value={seo.metaDescription ?? ""}
              onChange={(e) => setSeo({ ...seo, metaDescription: e.target.value })}
              onBlur={() => updateSeo({ metaDescription: seo.metaDescription })}
              placeholder="Resmi P3MI · Gaji jelas di depan · Tiket & visa ditanggung · Bebas calo."
              maxLength={200}
              rows={3}
              className="rounded-lg px-3.5 py-2.5 text-[14px] outline-none transition-colors resize-y"
              style={{
                border: "1px solid var(--pg-border)",
                background: "var(--pg-paper)",
                fontFamily: "var(--font-sans)",
              }}
            />
            <div
              className="text-[10.5px] tabular-nums"
              style={{
                color:
                  (seo.metaDescription?.length ?? 0) > 160
                    ? "var(--pg-warn-soft-fg)"
                    : "var(--pg-ink-quaternary)",
                fontFamily: "var(--font-mono)",
              }}
            >
              {seo.metaDescription?.length ?? 0} / 160 karakter
            </div>
          </div>
        </div>
      </section>

      {/* Status footer */}
      <div
        className="text-[11.5px] flex items-center gap-2 px-1"
        style={{ color: "var(--pg-ink-tertiary)" }}
      >
        {error ? (
          <>
            <Icon name="warn" size={12} stroke={2.4} />
            <span style={{ color: "var(--pg-warn-soft-fg)" }}>{error}</span>
          </>
        ) : savedAt ? (
          <>
            <Icon name="check" size={12} stroke={2.4} />
            Tersimpan {savedAt.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
          </>
        ) : (
          <>
            <Icon name="info" size={12} stroke={2.4} />
            Perubahan auto-save saat field di-blur (klik di luar). Belum publish ke
            live sampai kamu klik &quot;Publish ke live&quot; di bar bawah.
          </>
        )}
      </div>
    </div>
  );
}

// ─── Sub: media URL row ────────────────────────────────────────────────

function MediaUrlRow({
  icon,
  label,
  hint,
  value,
  onChange,
  onBlur,
  placeholder,
}: {
  icon: Parameters<typeof Icon>[0]["name"];
  label: string;
  hint: string;
  value: string;
  onChange: (v: string) => void;
  onBlur: () => void;
  placeholder: string;
}) {
  return (
    <div
      className="grid grid-cols-[28px_minmax(0,1fr)] gap-3 items-start py-2 border-b last:border-b-0"
      style={{ borderColor: "var(--pg-border-soft)" }}
    >
      <span
        className="grid place-items-center w-7 h-7 rounded-lg"
        style={{ background: "var(--pg-ink-50)", color: "var(--pg-ink-700)" }}
      >
        <Icon name={icon} size={13} stroke={2.2} />
      </span>
      <div className="flex flex-col gap-1.5 min-w-0">
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="text-[13px] font-extrabold">{label}</span>
          <span
            className="text-[11px]"
            style={{ color: "var(--pg-ink-tertiary)" }}
          >
            {hint}
          </span>
        </div>
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          className="rounded-lg px-3 py-2 text-[13px] outline-none w-full"
          style={{
            border: "1px solid var(--pg-border)",
            background: "var(--pg-paper)",
            fontFamily: "var(--font-mono)",
          }}
        />
        {value && (
          <a
            href={value}
            target="_blank"
            rel="noreferrer"
            className="text-[11px] font-semibold no-underline self-start inline-flex items-center gap-1"
            style={{ color: "var(--pg-red-600)" }}
          >
            <Icon name="arrow_right" size={10} stroke={2.4} />
            Buka URL
          </a>
        )}
      </div>
    </div>
  );
}
