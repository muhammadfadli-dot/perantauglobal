import { redirect } from "next/navigation";
import Link from "next/link";
import { createServerClient, requireCandidate } from "@/lib/supabase-server";
import { Icon } from "@/components/pg/Icon";
import ApplyWizard from "./ApplyWizard";
import { parseContent } from "@/lib/position-content";

export const dynamic = "force-dynamic";

type Position = {
  slug: string;
  name: string;
  country: string;
  description: string | null;
};

type FormField = {
  id: string;
  field_key: string;
  field_label: string;
  field_help: string | null;
  field_type: string;
  options: { value: string; label: string; qualifying?: boolean }[] | null;
  required: boolean;
  sort_order: number;
};

type JobOrder = {
  id: string;
  intake_label: string;
  slot_count: number;
  slot_filled: number;
  deadline: string | null;
};

export default async function ApplyNewPage({
  searchParams,
}: {
  searchParams: Promise<{ position?: string; job_order?: string }>;
}) {
  const { position: positionSlug, job_order: jobOrderId } = await searchParams;
  if (!positionSlug) redirect("/explore");

  const { candidateId } = await requireCandidate();
  const supabase = await createServerClient();

  const { data: candData } = await supabase
    .from("candidates")
    .select("id, profile_data")
    .eq("id", candidateId)
    .single();
  const candidate = (candData ?? { id: candidateId, profile_data: {} }) as {
    id: string;
    profile_data: unknown;
  };

  // Already applied?
  const { data: existing } = await supabase
    .from("applications")
    .select("id")
    .eq("candidate_id", candidateId)
    .eq("position_slug", positionSlug)
    .maybeSingle();
  if (existing) {
    redirect(`/applications/${(existing as { id: string }).id}`);
  }

  // Fetch position + apply-stage fields + active job_order if any.
  // Fields now read from position_application_fields (canonical post Fase 5).
  // Filter section='syarat_utama' = LP-stage questions for this portal apply
  // form. importance=required → required boolean for ApplyWizard props.
  const [{ data: positionData }, { data: fieldsData }, { data: jobOrderData }, { data: docsData }] = await Promise.all([
    // active=true is belt-and-braces: RLS (positions_anon_read_active) already
    // hides inactive rows from anon AND authenticated, and submitApplication
    // re-checks. Stating it here means the page no longer depends on an RLS
    // policy staying exactly as it is to avoid rendering a closed position -
    // mirrors the same defensive filter apps/web keeps in lookupPositionMapping.
    supabase.from("positions").select("slug, name, country, description, content").eq("slug", positionSlug).eq("active", true).maybeSingle(),
    supabase
      .from("position_application_fields")
      .select("id, field_key, field_label, field_help, field_type, options, importance, sort_order")
      .eq("position_slug", positionSlug)
      .eq("section", "syarat_utama")
      .order("sort_order"),
    jobOrderId
      ? supabase.from("job_orders").select("id, intake_label, slot_count, slot_filled, deadline").eq("id", jobOrderId).eq("status", "open").maybeSingle()
      : supabase.from("job_orders").select("id, intake_label, slot_count, slot_filled, deadline").eq("position_slug", positionSlug).eq("status", "open").order("created_at", { ascending: false }).limit(1).maybeSingle(),
    supabase.from("candidate_documents").select("doc_type, verified, rejected_at").eq("candidate_id", candidateId),
  ]);

  const position = positionData as Position | null;
  if (!position) redirect("/explore");

  // Decision content (salary, jobdesc, benefits, fee) the public site shows but
  // the portal used to hide — surfaced in the wizard's first step so the
  // logged-in experience isn't strictly poorer than the logged-out one.
  const content = parseContent(
    (positionData as { content?: unknown } | null)?.content as never,
  );
  const detail = {
    salary: content.cardMeta?.salary ?? null,
    salaryNote: content.cardMeta?.salaryNote ?? null,
    jobDescription: content.jobDescription ?? [],
    benefits: content.benefits ?? [],
    fee: content.fee ?? null,
  };

  const rawFields = (fieldsData ?? []) as Array<{
    id: string;
    field_key: string;
    field_label: string;
    field_help: string | null;
    field_type: string;
    options: { value: string; label: string; qualifying?: boolean }[] | null;
    importance: "required" | "optional";
    sort_order: number;
  }>;
  const fields: FormField[] = rawFields.map((f) => ({
    id: f.id,
    field_key: f.field_key,
    field_label: f.field_label,
    field_help: f.field_help,
    field_type: f.field_type,
    options: f.options,
    required: f.importance === "required",
    sort_order: f.sort_order,
  }));
  const jobOrder = (jobOrderData ?? null) as JobOrder | null;
  const docsRows = (docsData ?? []) as Array<{ doc_type: string; verified: boolean; rejected_at: string | null }>;

  // Fase 6B: positions.requirements + profile_data.credentials sunset. The
  // per-position eligibility pre-check no longer exists — each apply is
  // fresh, candidate fills syarat utama post-apply in /lengkapi. Pass
  // empty reqStatus/hardMissingCount=0 to keep ApplyWizard prop shape
  // stable; the wizard's syarat-utama step renders the same `fields` from
  // position_application_fields anyway.
  const reqStatus: never[] = [];
  const hardMissing: never[] = [];
  void candidate; // keep ref so the candidate fetch isn't dead

  // Document status
  const REQUIRED_DOC_TYPES = ["ktp", "passport"] as const;
  const docStatus = REQUIRED_DOC_TYPES.map((t) => {
    const latest = docsRows.find((d) => d.doc_type === t);
    if (!latest) return { type: t, status: "missing" as const };
    if (latest.verified) return { type: t, status: "verified" as const };
    if (latest.rejected_at) return { type: t, status: "rejected" as const };
    return { type: t, status: "pending" as const };
  });
  const docMissing = docStatus.filter((d) => d.status === "missing");

  return (
    <main className="min-h-screen pb-20">
      <div className="px-5 py-3.5 border-b border-pg-ink-100 sticky top-0 z-30 flex items-center gap-3" style={{ background: "var(--pg-paper)" }}>
        <Link
          href="/explore"
          className="w-10 h-10 rounded-[10px] border border-pg-ink-200 bg-pg-white grid place-items-center text-pg-ink-900 no-underline"
          aria-label="Kembali"
        >
          <Icon name="arrow_left" size={20} />
        </Link>
        <div className="flex-1">
          <div className="text-[12px] font-bold tracking-[0.08em] uppercase text-pg-ink-500">
            Lamar posisi
          </div>
          <div className="text-[15px] font-bold tracking-tight">{position.name}</div>
        </div>
      </div>

      <ApplyWizard
        position={position}
        detail={detail}
        jobOrder={jobOrder}
        reqStatus={reqStatus}
        hardMissingCount={hardMissing.length}
        docStatus={docStatus}
        docMissingCount={docMissing.length}
        fields={fields}
      />
    </main>
  );
}
