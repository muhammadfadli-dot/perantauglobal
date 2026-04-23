import { redirect } from "next/navigation";
import Link from "next/link";
import { createServerClient, getSessionAndRole } from "@/lib/supabase-server";
import { Icon } from "@/components/pg/Icon";
import ApplyWizard from "./ApplyWizard";

export const dynamic = "force-dynamic";

type Position = {
  slug: string;
  name: string;
  country: string;
  description: string | null;
  requirements: Record<string, { type?: "hard" | "soft"; label?: string; allowed_values?: string[] }> | null;
};

type FormField = {
  id: string;
  field_key: string;
  field_label: string;
  field_help: string | null;
  field_type: string;
  options: { value: string; label: string }[] | null;
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

  const { session, role } = await getSessionAndRole();
  if (!session) redirect("/auth/sign-in");
  if (role === "admin") redirect("/admin");

  const supabase = await createServerClient();

  // Fetch candidate
  const { data: candData } = await supabase
    .from("candidates")
    .select("id, profile_data")
    .eq("auth_user_id", session.userId)
    .single();
  const candidate = candData as { id: string; profile_data: unknown } | null;
  if (!candidate) redirect("/");

  // Already applied?
  const { data: existing } = await supabase
    .from("applications")
    .select("id")
    .eq("candidate_id", candidate.id)
    .eq("position_slug", positionSlug)
    .maybeSingle();
  if (existing) {
    redirect(`/applications/${(existing as { id: string }).id}`);
  }

  // Fetch position + form fields + active job_order if any
  const [{ data: positionData }, { data: fieldsData }, { data: jobOrderData }, { data: docsData }] = await Promise.all([
    supabase.from("positions").select("slug, name, country, description, requirements").eq("slug", positionSlug).maybeSingle(),
    supabase.from("position_form_fields").select("id, field_key, field_label, field_help, field_type, options, required, sort_order").eq("position_slug", positionSlug).order("sort_order"),
    jobOrderId
      ? supabase.from("job_orders").select("id, intake_label, slot_count, slot_filled, deadline").eq("id", jobOrderId).eq("status", "open").maybeSingle()
      : supabase.from("job_orders").select("id, intake_label, slot_count, slot_filled, deadline").eq("position_slug", positionSlug).eq("status", "open").order("created_at", { ascending: false }).limit(1).maybeSingle(),
    supabase.from("candidate_documents").select("doc_type, verified, rejected_at").eq("candidate_id", candidate.id),
  ]);

  const position = positionData as Position | null;
  if (!position) redirect("/explore");

  const fields = (fieldsData ?? []) as FormField[];
  const jobOrder = (jobOrderData ?? null) as JobOrder | null;
  const docsRows = (docsData ?? []) as Array<{ doc_type: string; verified: boolean; rejected_at: string | null }>;

  // Compute requirements vs profile
  const profileData = (candidate.profile_data ?? {}) as Record<string, unknown>;
  const credentials = (profileData.credentials ?? {}) as Record<string, string>;
  const reqEntries = Object.entries(position.requirements ?? {});
  const reqStatus = reqEntries.map(([key, spec]) => {
    const value = credentials[key];
    let passed = false;
    if (value && (typeof value === "string" ? value.trim() !== "" : true)) {
      if (spec.allowed_values && spec.allowed_values.length > 0) {
        passed = spec.allowed_values.includes(value);
      } else {
        passed = true;
      }
    }
    return {
      key,
      label: spec.label ?? key,
      type: (spec.type ?? "hard") as "hard" | "soft",
      passed,
      currentValue: value ?? null,
      allowedValues: spec.allowed_values ?? null,
    };
  });

  const hardMissing = reqStatus.filter((r) => r.type === "hard" && !r.passed);

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
