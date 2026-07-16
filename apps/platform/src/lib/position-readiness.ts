/**
 * Position publish-readiness - the admin-side "will this look right in public?"
 * computation (Fase 2.1). Distinct from CANDIDATE readiness (hard_pass /
 * application_readiness_view), which measures whether an APPLICANT clears the
 * gate. This measures whether the POSITION CONFIG is ready to go live.
 *
 * The screening predicate here mirrors the SQL function
 * public.position_has_effective_screening (0103, section-scoped in 0106)
 * exactly, so the admin panel, the per-field badge, and the DB activation
 * trigger can never disagree: a field "screens" iff it is in section
 * syarat_utama, is REQUIRED, is a choice type, and has >=1 option explicitly
 * marked qualifying:true.
 */

import type { PositionContent } from "./position-content";

/** Choice field types whose options can carry a qualifying flag. `select` is the
 * legacy alias the editor normalizes to `radio`. Free-text/number/file never screen. */
const CHOICE_TYPES = new Set(["radio", "multiselect", "select"]);

/**
 * The only section the public apply form renders (apps/web fetchAppliedFields).
 * Questions in `kualifikasi` are asked later, in the portal's "lengkapi" step,
 * and questions in `screening` later still - real questions, but they gate
 * nothing at the moment someone applies.
 */
const APPLY_SECTION = "syarat_utama";

export type ReadinessField = {
  field_type: string;
  importance: string | null;
  options: unknown;
  /** Which step asks this. Absent is treated as "not the apply form": a field
   * whose section we can't see must not be counted as gating the apply. */
  section?: string | null;
};

/** True when this single field actually filters applicants at APPLY time
 * (syarat_utama + required + choice + >=1 qualifying option). Mirrors the SQL. */
export function fieldScreens(f: ReadinessField): boolean {
  // Section first: this is the check that was missing, and its absence let a
  // qualifying question sitting in `kualifikasi` report as screening while the
  // apply form asked nothing at all (trainee-technicians-kuwait, 2026-07-16).
  if (f.section !== APPLY_SECTION) return false;
  if (f.importance !== "required") return false;
  if (!CHOICE_TYPES.has(f.field_type)) return false;
  if (!Array.isArray(f.options)) return false;
  return f.options.some(
    (o) =>
      o != null &&
      typeof o === "object" &&
      (o as { qualifying?: unknown }).qualifying === true,
  );
}

/** True when the position has at least one effectively-screening field. */
export function positionHasEffectiveScreening(fields: ReadinessField[]): boolean {
  return fields.some(fieldScreens);
}

export type ReadinessItem = {
  key: string;
  label: string;
  ok: boolean;
  /** Blocking = its absence makes the position invisible or non-screening in
   * public. Publish is allowed with non-blocking warnings, but blocking items
   * need an explicit confirm. */
  blocking: boolean;
  /** Short "what to do" shown when not ok. */
  hint?: string;
};

export type ReadinessInput = {
  content: PositionContent;
  fields: ReadinessField[];
  /** Open job orders with a still-valid deadline (deadline null or >= today). */
  hasValidOpenJobOrder: boolean;
};

function cardMetaComplete(c: PositionContent): boolean {
  const m = c.cardMeta;
  return (
    !!m &&
    !!m.salary?.trim() &&
    !!m.age?.trim() &&
    !!m.gender?.trim()
  );
}

/**
 * Full publish-readiness checklist. Order matters - most consequential first.
 * `blocking` items are the two states the audit flagged as actively harmful:
 * a card that gets skipped from the listing (cardMeta incomplete, finding A4)
 * and a position that screens nobody (finding C1).
 */
export function computePositionReadiness(input: ReadinessInput): ReadinessItem[] {
  const { content: c, fields } = input;
  const jd = c.jobDescription?.filter((s) => s.trim()).length ?? 0;
  const quals = c.qualifications?.filter((s) => s.trim()).length ?? 0;
  const proc = c.process?.filter((s) => s.trim()).length ?? 0;

  return [
    {
      key: "cardMeta",
      label: "Kartu lengkap (gaji + umur + gender)",
      ok: cardMetaComplete(c),
      blocking: true,
      hint: "Tanpa ini kartu tidak muncul di listing publik. Isi di tab Konten landing.",
    },
    {
      key: "screening",
      label: "Ada pertanyaan yang menyaring",
      ok: positionHasEffectiveScreening(fields),
      blocking: true,
      hint: "Butuh >=1 pertanyaan WAJIB tipe pilihan dengan opsi ditandai Lolos. Tanpa ini semua pelamar auto-lolos.",
    },
    {
      key: "hero",
      label: "Foto hero terpasang",
      ok: !!c.media?.heroUrl?.trim(),
      blocking: false,
      hint: "Upload foto di tab Media & SEO - tanpa foto hero LP tampil gelap polos.",
    },
    {
      key: "jobDescription",
      label: "Deskripsi kerja (>=3 poin)",
      ok: jd >= 3,
      blocking: false,
      hint: "Tambah minimal 3 poin tugas di tab Konten landing.",
    },
    {
      key: "qualifications",
      label: "Kualifikasi (>=2 poin)",
      ok: quals >= 2,
      blocking: false,
      hint: "Tambah minimal 2 syarat kualifikasi.",
    },
    {
      key: "fee",
      label: "Biaya / fee terisi",
      ok: !!c.fee?.amount?.trim(),
      blocking: false,
      hint: "Isi nominal biaya di tab Konten landing.",
    },
    {
      key: "process",
      label: "Tahapan proses terisi",
      ok: proc >= 1,
      blocking: false,
      hint: "Isi minimal 1 tahap proses.",
    },
    {
      key: "jobOrder",
      label: "Ada batch buka dengan deadline valid",
      ok: input.hasValidOpenJobOrder,
      blocking: false,
      hint: "Tanpa job order aktif, posisi tampil sebagai 'antrian'. Buat job order di tab Job orders kalau memang lagi buka.",
    },
    {
      key: "seo",
      label: "Meta title + description",
      ok: !!c.seo?.metaTitle?.trim() && !!c.seo?.metaDescription?.trim(),
      blocking: false,
      hint: "Isi di tab Media & SEO untuk hasil share/SEO yang rapi.",
    },
  ];
}

export type AdsReadinessInput = {
  content: PositionContent;
  fields: ReadinessField[];
  /** positions.active - an ad pointing at an inactive position 404s. */
  active: boolean;
};

/**
 * "Siap diiklankan?" (Fase 3.2) - the handoff check before paid traffic points
 * at this URL.
 *
 * The audit called for a separate "wizard siap iklan". A wizard would restate
 * what the checklist above already says, so this is a second lens on the same
 * facts instead: publish-readiness asks "will this look right to someone who
 * finds it", ads-readiness asks "will a paid click survive". The overlap
 * (screening, hero) is deliberate - same fact, harsher consequence, which is
 * why items that are mere warnings above are blocking here.
 */
export function computeAdsReadiness(input: AdsReadinessInput): ReadinessItem[] {
  const { content: c, fields, active } = input;
  return [
    {
      key: "adsActive",
      label: "Posisi aktif (LP kebuka publik)",
      ok: active,
      blocking: true,
      hint: "Iklan ke posisi nonaktif = tiap klik berbayar mendarat di 404. Aktifkan dulu.",
    },
    {
      key: "adsScreening",
      label: "Pelamar tersaring",
      ok: positionHasEffectiveScreening(fields),
      blocking: true,
      hint: "Tanpa penyaring, semua klik iklan masuk sebagai lead 'lolos' dan BD yang sortir manual.",
    },
    {
      key: "adsHero",
      label: "Foto hero terpasang",
      ok: !!c.media?.heroUrl?.trim(),
      blocking: true,
      hint: "LP gelap polos bikin bounce - mahal kalau trafiknya berbayar. Upload di tab Media & SEO.",
    },
    {
      key: "adsOg",
      label: "Gambar share (OG) ada",
      ok: !!(c.media?.ogImageUrl?.trim() || c.media?.heroUrl?.trim()),
      blocking: false,
      hint: "Dipakai waktu link dibagikan. Kosong = share tampil tanpa gambar. Hero otomatis dipakai kalau OG kosong.",
    },
    {
      key: "adsSeo",
      label: "Meta title + description",
      ok: !!c.seo?.metaTitle?.trim() && !!c.seo?.metaDescription?.trim(),
      blocking: false,
      hint: "Judul/deskripsi share yang rapi menaikkan CTR.",
    },
  ];
}

/**
 * The landing URL to paste into the Meta ad, with this account's ACTUAL
 * attribution convention baked in.
 *
 * `{{site_source_name}}` and `{{campaign.id}}` are Meta macros - Meta expands
 * them per impression, they are not placeholders to fill in by hand. This
 * mirrors what is already live: candidates.utm_source holds ig/fb/th/an
 * (placements) and utm_campaign holds numeric Meta campaign ids, across 535
 * attributed candidates. A hand-rolled "utm_source=meta&utm_medium=paid_social"
 * would have looked tidier and silently broken every existing report - and
 * utm_medium has no column at all, so it would be dropped on arrival.
 */
export function adsUrlFor(slug: string): string {
  return `https://perantauglobal.com/lowongan/${slug}?utm_source={{site_source_name}}&utm_campaign={{campaign.id}}`;
}

/** Blocking items that are NOT satisfied - drives the publish confirm gate. */
export function unmetBlockers(items: ReadinessItem[]): ReadinessItem[] {
  return items.filter((i) => i.blocking && !i.ok);
}

export type ReadinessSummary = {
  total: number;
  ok: number;
  blockersUnmet: number;
};

export function summarizeReadiness(items: ReadinessItem[]): ReadinessSummary {
  return {
    total: items.length,
    ok: items.filter((i) => i.ok).length,
    blockersUnmet: unmetBlockers(items).length,
  };
}
