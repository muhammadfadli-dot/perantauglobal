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

export interface ProgramContent {
  intro?: string;
  benefits?: string[];
  learning_outcomes?: string[];
  curriculum?: ProgramCurriculumItem[];
  flow?: ProgramFlowStep[];
  fee_note?: string;
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
 * Price label shown to candidates.
 *
 * A paid product with no price set renders as "Berbayar" on purpose: the fee
 * for the certification programs is set by the training partner and is only
 * communicated after screening, so the page must never invent a number.
 */
export function priceLabel(program: AcademyProgram): string {
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
