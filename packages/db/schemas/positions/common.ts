import { z } from "zod";

/**
 * Shared candidate fields collected by every lowongan / program form.
 * Maps 1:1 to `candidates` table columns.
 */
export const sharedCandidateSchema = z.object({
  full_name: z.string().min(1, "Nama wajib diisi").max(200),
  email: z.string().email("Email tidak valid").max(254),
  whatsapp: z.string().min(8, "Nomor WhatsApp terlalu pendek").max(20),
  city: z.string().min(1, "Kota wajib diisi").max(100),
  birth_date: z.string().max(20).optional().nullable(),
  gender: z.enum(["male", "female"]).optional().nullable(),
  education: z.enum(["sma", "d3", "s1", "s2"]),
});

export type SharedCandidate = z.infer<typeof sharedCandidateSchema>;

/**
 * Tracking metadata attached to pending_submissions.
 */
export const trackingSchema = z.object({
  source_url: z.string().max(500).optional().nullable(),
  utm_source: z.string().max(120).optional().nullable(),
  utm_campaign: z.string().max(120).optional().nullable(),
  referrer_url: z.string().max(500).optional().nullable(),
});

export type Tracking = z.infer<typeof trackingSchema>;

/**
 * Requirement spec v2 (migration 0005+).
 * `hard` requirements must be satisfied for candidate to apply (blocks UI).
 * `soft` requirements improve match % but don't block.
 * `allowed_values` narrows the accepted set for hard constraints.
 */
export interface RequirementSpec {
  type: "hard" | "soft";
  label: string;
  allowed_values?: readonly string[];
}

export type PositionRequirements = Record<string, RequirementSpec>;

/**
 * Position metadata — defines position identity + requirements for readiness
 * computation. Matches `positions` table (slug, role, country, name,
 * requirements, scoring).
 */
export interface PositionMeta {
  slug: string;
  role: string;
  country: string;
  name: string;
  description?: string;
  /**
   * Matches `positions.requirements` JSONB. Used by `compute_readiness`
   * SQL function to compare against `candidates.profile_data.credentials`.
   */
  requirements: PositionRequirements;
  scoring?: Record<string, unknown>;
}

/**
 * Position definition = runtime registry entry + Zod schemas.
 */
export interface PositionDef<TRoleData extends z.ZodTypeAny> {
  meta: PositionMeta;
  /** Position-specific fields stored in `candidates.profile_data`. */
  roleDataSchema: TRoleData;
  /** Full submission payload = shared + tracking + role_data. */
  submissionSchema: z.ZodObject<{
    full_name: typeof sharedCandidateSchema.shape.full_name;
    email: typeof sharedCandidateSchema.shape.email;
    whatsapp: typeof sharedCandidateSchema.shape.whatsapp;
    city: typeof sharedCandidateSchema.shape.city;
    birth_date: typeof sharedCandidateSchema.shape.birth_date;
    gender: typeof sharedCandidateSchema.shape.gender;
    education: typeof sharedCandidateSchema.shape.education;
    role_data: TRoleData;
  }>;
}

/**
 * Build a position definition by composing sharedCandidateSchema with a
 * position-specific roleData schema.
 */
export function definePosition<TRoleData extends z.ZodTypeAny>(
  meta: PositionMeta,
  roleDataSchema: TRoleData,
): PositionDef<TRoleData> {
  const submissionSchema = sharedCandidateSchema.extend({
    role_data: roleDataSchema,
  });
  return { meta, roleDataSchema, submissionSchema };
}
