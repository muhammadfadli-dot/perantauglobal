// Per-lamaran journey state for the candidate dashboard.
//
// Each application has its own 3-step journey:
//   1 Terkirim       — application row exists in talent pool (job_order_id IS NULL)
//   2 Diproses       — application has been promoted into a job_order
//                      (job_order_id IS NOT NULL) and not yet at a terminal stage
//   3 Hasil          — terminal: pipeline_stage tells us "diterima" vs "ditolak"
//
// "Berangkat" (post-acceptance departure prep) is intentionally NOT a candidate-facing
// stage — the candidate isn't going to keep refreshing the dashboard to verify they
// boarded a plane. Departure logistics are an admin-side concern.
//
// `needsDocs` is a parallel signal that overrides the stage label when true: the
// candidate has unfilled hard requirements blocking the application from progressing,
// regardless of where it sits in the pipeline.

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@perantauglobal/db";

export type LamaranStage = "terkirim" | "diproses" | "hasil_diterima" | "hasil_ditolak";

export type LamaranJourney = {
  applicationId: string;
  positionSlug: string;
  positionName: string;
  country: string;
  appliedAt: string;
  stage: LamaranStage;
  needsDocs: boolean;
};

export type DashboardData = {
  lamaran: LamaranJourney[];
  identityFilledCount: number;
  identityTotalCount: number;
  candidateFullName: string;
};

const ACCEPTED_STAGES = new Set([
  "selected",
  "training",
  "deployed",
  "active",
]);
const REJECTED_STAGES = new Set(["rejected", "exit"]);

const IDENTITY_TOTAL = 5; // phone, city, birth_date, gender, education

function deriveStage(pipelineStage: string, jobOrderId: string | null): LamaranStage {
  if (ACCEPTED_STAGES.has(pipelineStage)) return "hasil_diterima";
  if (REJECTED_STAGES.has(pipelineStage)) return "hasil_ditolak";
  if (jobOrderId !== null) return "diproses";
  return "terkirim";
}

export async function getDashboardData(
  candidateId: string,
  client: SupabaseClient<Database>,
): Promise<DashboardData> {
  const [{ data: candData }, { data: appsData }, { data: readinessData }] = await Promise.all([
    client
      .from("candidates")
      .select("full_name, phone, city, birth_date, gender, education")
      .eq("id", candidateId)
      .single(),
    client
      .from("applications")
      .select(
        "id, position_slug, pipeline_stage, job_order_id, created_at, positions (name, country)",
      )
      .eq("candidate_id", candidateId)
      .order("created_at", { ascending: false }),
    client
      .from("application_readiness_view")
      .select("application_id, hard_pass")
      .eq("candidate_id", candidateId),
  ]);

  const cand = candData as
    | {
        full_name: string;
        phone: string | null;
        city: string | null;
        birth_date: string | null;
        gender: string | null;
        education: string | null;
      }
    | null;
  const apps = (appsData ?? []) as unknown as Array<{
    id: string;
    position_slug: string;
    pipeline_stage: string;
    job_order_id: string | null;
    created_at: string;
    positions: { name: string; country: string } | null;
  }>;
  const readiness = (readinessData ?? []) as Array<{
    application_id: string | null;
    hard_pass: boolean | null;
  }>;
  const readinessByApp = new Map(readiness.map((r) => [r.application_id, r]));

  const identityFields = [
    cand?.phone,
    cand?.city,
    cand?.birth_date,
    cand?.gender,
    cand?.education,
  ];
  const identityFilledCount = identityFields.filter(Boolean).length;

  const lamaran: LamaranJourney[] = apps
    .filter((a) => a.positions !== null)
    .map((a) => ({
      applicationId: a.id,
      positionSlug: a.position_slug,
      positionName: a.positions!.name,
      country: a.positions!.country,
      appliedAt: a.created_at,
      stage: deriveStage(a.pipeline_stage, a.job_order_id),
      needsDocs: readinessByApp.get(a.id)?.hard_pass === false,
    }));

  return {
    lamaran,
    identityFilledCount,
    identityTotalCount: IDENTITY_TOTAL,
    candidateFullName: cand?.full_name ?? "",
  };
}

// Sort lamaran by urgency for default tab selection: needs_docs first, then
// diproses (most active), then terkirim, then results last.
const STAGE_PRIORITY: Record<LamaranStage, number> = {
  terkirim: 2,
  diproses: 1,
  hasil_diterima: 3,
  hasil_ditolak: 4,
};

export function sortLamaranByUrgency(lamaran: LamaranJourney[]): LamaranJourney[] {
  return [...lamaran].sort((a, b) => {
    if (a.needsDocs !== b.needsDocs) return a.needsDocs ? -1 : 1;
    const stageDiff = STAGE_PRIORITY[a.stage] - STAGE_PRIORITY[b.stage];
    if (stageDiff !== 0) return stageDiff;
    return new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime();
  });
}

/**
 * Beranda hero state machine — drives which BerandaSn component renders.
 *
 * Per portal-v2 design (Airbnb Journey):
 *  - S1: candidate signed up, no application yet → country picker hero
 *  - S2: has application, needs docs / lengkapi (most common) → journey hero + tasks
 *  - S3: has application, docs complete, waiting for review → journey hero + Paspor primary + Pendamping
 *  - S4: interview scheduled (deferred — needs interview_scheduled schema)
 *  - S5: pre-departure (deferred — needs pre_departure_checklist schema)
 *  - hasil-diterima: terminal accepted (interim, until S5 schema lands)
 *  - hasil-ditolak: terminal rejected
 */
export type BerandaState =
  | "S1"
  | "S2"
  | "S3"
  | "hasil-diterima"
  | "hasil-ditolak";

export function deriveBerandaState(
  primary: LamaranJourney | undefined,
): BerandaState {
  if (!primary) return "S1";
  if (primary.stage === "hasil_diterima") return "hasil-diterima";
  if (primary.stage === "hasil_ditolak") return "hasil-ditolak";
  // terkirim / diproses with needsDocs → S2 (action required)
  if (primary.needsDocs) return "S2";
  // diproses w/o needs docs → S3 (waiting for review)
  if (primary.stage === "diproses") return "S3";
  // terkirim (talent pool) — show S2 style since user still has work to do
  // (lengkapi profile / wait for review)
  return "S2";
}

// Server-side time-of-day greeting (Asia/Jakarta).
export function getTimeOfDayGreeting(): string {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Jakarta",
    hour: "numeric",
    hour12: false,
  });
  const hour = parseInt(formatter.format(new Date()), 10);
  if (hour < 4) return "Selamat malam";
  if (hour < 11) return "Selamat pagi";
  if (hour < 15) return "Selamat siang";
  if (hour < 19) return "Selamat sore";
  return "Selamat malam";
}
