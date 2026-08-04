import { supabaseV2 } from "@/lib/supabase-v2";

/**
 * Akademi Perantau catalog reads for the public site.
 *
 * Source of truth is `academy_programs` (RLS: anon sees `status='published'`
 * only), so adding or retiring a learning product is a data change, not a
 * deploy. Mirrors the pattern in positions-db.ts.
 */

export interface ProgramFlowStep {
  title: string;
  detail?: string;
}

export interface ProgramCurriculumItem {
  title: string;
  detail?: string;
}

export interface ProgramFeeLine {
  label: string;
  amount: string;
  note?: string;
}

export interface ProgramContent {
  intro?: string;
  benefits?: string[];
  learning_outcomes?: string[];
  curriculum?: ProgramCurriculumItem[];
  flow?: ProgramFlowStep[];
  fee_note?: string;
  /**
   * Rincian biaya baris per baris, ditampilkan di atas `fee_note`.
   *
   * Angkanya sengaja disimpan sebagai string sudah terformat, bukan integer:
   * satu-satunya sumbernya adalah daftar harga yang dikirim PIC, dan
   * memformat ulang dari angka mentah membuka celah pembulatan pada nilai
   * yang harus terbaca persis (Ifa 3 Agu 2026 sempat menulis Rp5.275.000
   * untuk 30% dari Rp17.585.000, yang tepatnya Rp5.275.500).
   */
  fee_breakdown?: ProgramFeeLine[];
  doc_checklist?: { label: string; note?: string }[];
}

export interface AcademyProgram {
  slug: string;
  title: string;
  subtitle: string | null;
  category: string;
  delivery_mode: string;
  facilitated_by: string;
  country: string | null;
  is_free: boolean;
  price: number | null;
  output_type: string;
  duration_label: string | null;
  cover_image: string | null;
  sort_order: number;
  content: ProgramContent;
}

const CATALOG_COLUMNS =
  "slug,title,subtitle,category,delivery_mode,facilitated_by,country,is_free,price,output_type,duration_label,cover_image,sort_order,content";

/**
 * Every published program, ordered for display. Certification products come
 * first (they are the transactional catalog), free classes after.
 */
export async function fetchPublishedPrograms(): Promise<AcademyProgram[]> {
  const { data, error } = await supabaseV2()
    .from("academy_programs")
    .select(CATALOG_COLUMNS)
    .eq("status", "published")
    .order("sort_order", { ascending: true });

  if (error || !data) return [];
  return data as unknown as AcademyProgram[];
}

/** Paid certification products (Sertifikat Perantau). */
export function certificationPrograms(all: AcademyProgram[]): AcademyProgram[] {
  return all.filter((p) => p.category === "sertifikasi");
}

/** Free, self-paced classes. */
export function freePrograms(all: AcademyProgram[]): AcademyProgram[] {
  return all.filter((p) => p.category !== "sertifikasi" && p.is_free);
}

/**
 * One shelf holding every program, alternating paid and free.
 *
 * Candidates do not shop by our internal taxonomy ("sertifikasi" vs
 * "masterclass"); they scan for something they can start today. Splitting the
 * catalog into a paid section and a free section buried the free classes below
 * the fold and made the page read as a price list. Interleaving keeps a
 * zero-cost entry point visible next to every paid one.
 *
 * Both groups keep their own sort_order, so editors still control ordering
 * within a lane; only the weave is automatic. Uneven group sizes are fine, the
 * longer group's remainder is appended.
 */
export function catalogPrograms(all: AcademyProgram[]): AcademyProgram[] {
  const paid = certificationPrograms(all);
  const free = freePrograms(all);
  const woven: AcademyProgram[] = [];
  for (let i = 0; i < Math.max(paid.length, free.length); i += 1) {
    if (paid[i]) woven.push(paid[i]);
    if (free[i]) woven.push(free[i]);
  }
  // Anything in neither lane (e.g. a paid in-app class) would otherwise vanish
  // from the catalog entirely, so append it rather than silently dropping it.
  const wovenSlugs = new Set(woven.map((p) => p.slug));
  return [...woven, ...all.filter((p) => !wovenSlugs.has(p.slug))];
}

/**
 * Price label shown to candidates.
 *
 * A paid product with no price set renders as "Berbayar" on purpose: the fee
 * for the certification programs is set by the training partner and is only
 * communicated after screening, so the page must never invent a number.
 */
export function priceLabel(program: Pick<AcademyProgram, "is_free" | "price">): string {
  if (program.is_free) return "Gratis";
  if (program.price) return `Rp${program.price.toLocaleString("id-ID")}`;
  return "Berbayar";
}

/**
 * True when the product is delivered off-platform (classroom training) rather
 * than as in-app lessons. These follow the register then screening then pay
 * flow, so their copy and CTAs differ from a normal class.
 */
export function isScreenedProgram(program: AcademyProgram): boolean {
  return !program.is_free && program.delivery_mode !== "in_app";
}

const COUNTRY_LABEL: Record<string, string> = {
  saudi_arabia: "Arab Saudi",
  taiwan: "Taiwan",
  japan: "Jepang",
  kuwait: "Kuwait",
  bulgaria: "Bulgaria",
  europe: "Eropa",
  mexico: "Meksiko",
  indonesia: "Indonesia",
};

export function countryLabel(country: string | null): string | null {
  if (!country) return null;
  return COUNTRY_LABEL[country] ?? null;
}
