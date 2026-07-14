"use client";

import { useRef, useState } from "react";
import { Icon } from "@/components/pg/Icon";
import {
  saveDraftMediaSeo,
  uploadPositionMedia,
  type MediaSlot,
} from "../../app/(admin)/admin/positions/actions";
import type { PositionContent, ContentMedia, ContentSeo } from "@/lib/position-content";

/**
 * Web origin used only to PREVIEW the legacy static hero (apps/web/public/
 * images/lowongan/<slug>.jpg) inside the admin app, which doesn't serve those
 * files itself. The effective hero on the public page is heroUrl ?? this path,
 * so showing it here makes the currently-live photo visible even before the
 * admin uploads a replacement. Broken/missing files fall back to a placeholder.
 */
const WEB_ORIGIN = "https://perantauglobal.com";

/**
 * Media & SEO tab — 5th tab in the position editor.
 *
 * Media: upload straight from the machine to the public `position-media` bucket
 * (via the `uploadPositionMedia` server action) OR paste an external URL. Both
 * write positions.draft_content.media; the "foto yang tampil sekarang" preview
 * resolves the same way the public page does (heroUrl ?? static file) so the
 * old engineer-commits-a-file path stays visible until replaced.
 *
 * SEO: meta title/description via `saveDraftMediaSeo`. The Konten tab's
 * `saveDraft` preserves media/seo, so the two tabs own disjoint keys and their
 * independent auto-saves can't clobber each other regardless of save order.
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
  const [uploadingSlot, setUploadingSlot] = useState<MediaSlot | null>(null);

  function markSaved() {
    setSavedAt(new Date());
    window.dispatchEvent(
      new CustomEvent("pg-editor-state", {
        detail: { dirty: false, saving: false, savedAt: new Date().toISOString() },
      }),
    );
  }

  async function persist(nextMedia: ContentMedia, nextSeo: ContentSeo) {
    setSaving(true);
    setError(null);
    try {
      // Strip empty strings to undefined so DB doesn't store dead keys.
      const cleanMedia: ContentMedia = {};
      if (nextMedia.heroUrl?.trim()) cleanMedia.heroUrl = nextMedia.heroUrl.trim();
      if (nextMedia.employerLogoUrl?.trim())
        cleanMedia.employerLogoUrl = nextMedia.employerLogoUrl.trim();
      if (nextMedia.ogImageUrl?.trim()) cleanMedia.ogImageUrl = nextMedia.ogImageUrl.trim();

      const cleanSeo: ContentSeo = {};
      if (nextSeo.metaTitle?.trim()) cleanSeo.metaTitle = nextSeo.metaTitle.trim();
      if (nextSeo.metaDescription?.trim())
        cleanSeo.metaDescription = nextSeo.metaDescription.trim();

      await saveDraftMediaSeo(
        slug,
        Object.keys(cleanMedia).length > 0 ? cleanMedia : undefined,
        Object.keys(cleanSeo).length > 0 ? cleanSeo : undefined,
      );
      markSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  }

  const SLOT_KEY: Record<MediaSlot, keyof ContentMedia> = {
    hero: "heroUrl",
    logo: "employerLogoUrl",
    og: "ogImageUrl",
  };

  /**
   * Upload a file for a slot. The server action already merged the resulting
   * URL into the draft; we just reflect it in local state so the URL field +
   * preview update without a reload.
   */
  async function handleUpload(slot: MediaSlot, file: File) {
    setError(null);
    setUploadingSlot(slot);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await uploadPositionMedia(slug, slot, fd);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setMedia((m) => ({ ...m, [SLOT_KEY[slot]]: res.url }));
      markSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload gagal");
    } finally {
      setUploadingSlot(null);
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

  // Effective hero shown in the preview = admin-authored heroUrl, else the
  // legacy static asset the public page currently falls back to.
  const effectiveHero =
    media.heroUrl?.trim() || `${WEB_ORIGIN}/images/lowongan/${slug}.jpg`;
  const heroIsStatic = !media.heroUrl?.trim();

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
          resmi — jangan stock. Upload langsung dari komputer atau tempel URL
          hosting eksternal; foto tayang di web &lt; 60 detik setelah Publish
          tanpa perlu deploy.
        </p>
      </div>

      {/* Hero photo — with live preview */}
      <section
        className="bg-pg-white rounded-2xl p-5"
        style={{ border: "1px solid var(--pg-border)" }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="text-[14px] font-extrabold">Hero photo</div>
          {saving && (
            <span className="font-mono text-[10.5px] text-pg-info">Menyimpan…</span>
          )}
        </div>

        {/* Preview of the photo the public page shows right now */}
        <div
          className="relative w-full overflow-hidden rounded-xl mb-3 bg-pg-ink-50"
          style={{ aspectRatio: "21 / 9", border: "1px solid var(--pg-border-soft)" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- arbitrary bucket/external URL in admin, not a build asset */}
          <img
            key={effectiveHero}
            src={effectiveHero}
            alt="Preview hero"
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
              const ph = e.currentTarget.nextElementSibling as HTMLElement | null;
              if (ph) ph.style.display = "flex";
            }}
          />
          <div
            className="absolute inset-0 hidden items-center justify-center flex-col gap-1 text-center px-4"
            style={{ color: "var(--pg-ink-tertiary)" }}
          >
            <Icon name="globe" size={20} stroke={1.8} />
            <span className="text-[12px] font-semibold">Belum ada foto</span>
            <span className="text-[11px]">Upload hero photo supaya halaman tidak gelap.</span>
          </div>
          <span
            className="absolute top-2 left-2 px-2 py-1 rounded-md text-[10px] font-bold tracking-wide uppercase font-mono"
            style={{
              background: heroIsStatic ? "var(--pg-warn-soft-bg)" : "var(--pg-ok-soft-bg)",
              color: heroIsStatic ? "var(--pg-warn-soft-fg)" : "var(--pg-ok-soft-fg)",
            }}
          >
            {heroIsStatic ? "Foto bawaan (file)" : "Foto ter-upload"}
          </span>
        </div>

        <UploadableUrlRow
          hint="Full-bleed di header lowongan · ratio 2400×1080 (21:9)"
          value={media.heroUrl ?? ""}
          uploading={uploadingSlot === "hero"}
          onUpload={(f) => handleUpload("hero", f)}
          onChange={(v) => setMedia({ ...media, heroUrl: v })}
          onBlur={() => updateMedia({ heroUrl: media.heroUrl })}
          placeholder="https://res.cloudinary.com/.../hero.jpg"
        />
      </section>

      {/* Logo + OG */}
      <section
        className="bg-pg-white rounded-2xl p-5"
        style={{ border: "1px solid var(--pg-border)" }}
      >
        <div className="text-[14px] font-extrabold mb-3">Logo &amp; sharing</div>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-[13px] font-extrabold">Logo employer</span>
              <span className="text-[11px]" style={{ color: "var(--pg-ink-tertiary)" }}>
                Square SVG/PNG, tampil di trust signals &amp; footer
              </span>
            </div>
            <UploadableUrlRow
              value={media.employerLogoUrl ?? ""}
              uploading={uploadingSlot === "logo"}
              onUpload={(f) => handleUpload("logo", f)}
              onChange={(v) => setMedia({ ...media, employerLogoUrl: v })}
              onBlur={() => updateMedia({ employerLogoUrl: media.employerLogoUrl })}
              placeholder="https://employer.com/logo.png"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-[13px] font-extrabold">OG image</span>
              <span className="text-[11px]" style={{ color: "var(--pg-ink-tertiary)" }}>
                Sharing preview · 1200×630. Kosong = pakai hero photo otomatis.
              </span>
            </div>
            <UploadableUrlRow
              value={media.ogImageUrl ?? ""}
              uploading={uploadingSlot === "og"}
              onUpload={(f) => handleUpload("og", f)}
              onChange={(v) => setMedia({ ...media, ogImageUrl: v })}
              onBlur={() => updateMedia({ ogImageUrl: media.ogImageUrl })}
              placeholder="https://res.cloudinary.com/.../og.jpg"
            />
          </div>
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

// ─── Sub: URL row with upload button ───────────────────────────────────

function UploadableUrlRow({
  hint,
  value,
  uploading,
  onUpload,
  onChange,
  onBlur,
  placeholder,
}: {
  hint?: string;
  value: string;
  uploading: boolean;
  onUpload: (file: File) => void;
  onChange: (v: string) => void;
  onBlur: () => void;
  placeholder: string;
}) {
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col gap-1.5 min-w-0">
      {hint && (
        <span className="text-[11px]" style={{ color: "var(--pg-ink-tertiary)" }}>
          {hint}
        </span>
      )}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12.5px] font-bold whitespace-nowrap shrink-0 disabled:opacity-60"
          style={{ background: "var(--pg-ink-900)", color: "#fff" }}
        >
          {uploading ? (
            <>
              <span className="w-3 h-3 rounded-full border-2 border-white/40 border-t-white animate-spin" />
              Mengunggah…
            </>
          ) : (
            <>
              <Icon name="arrow_right" size={13} stroke={2.4} /> Upload foto
            </>
          )}
        </button>
        <span className="text-[11px]" style={{ color: "var(--pg-ink-quaternary)" }}>
          atau
        </span>
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          className="rounded-lg px-3 py-2 text-[13px] outline-none w-full min-w-0"
          style={{
            border: "1px solid var(--pg-border)",
            background: "var(--pg-paper)",
            fontFamily: "var(--font-mono)",
          }}
        />
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onUpload(f);
          e.target.value = ""; // allow re-selecting the same file
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
  );
}
