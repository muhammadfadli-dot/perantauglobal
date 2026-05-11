import { createServerClient, requireCandidate } from "@/lib/supabase-server";
import { TopBarApp, BottomNav } from "@/components/pg/AppChrome";
import { Icon } from "@/components/pg/Icon";
import DocUploader, { type DocItem } from "../DocUploader";

export const dynamic = "force-dynamic";

export default async function DokumenPage() {
  const { candidateId } = await requireCandidate();
  const supabase = await createServerClient();

  const { data: candidateData } = await supabase
    .from("candidates")
    .select("id")
    .eq("id", candidateId)
    .single();
  const candidate = candidateData as { id: string } | null;
  if (!candidate) throw new Error(`Candidate ${candidateId} disappeared`);

  const { data: docsData } = await supabase
    .from("candidate_documents")
    .select("doc_type, file_path, verified, rejected_at, rejected_reason, uploaded_at")
    .eq("candidate_id", candidateId)
    .order("uploaded_at", { ascending: false });
  const docsRows = (docsData ?? []) as Array<{
    doc_type: string;
    file_path: string;
    verified: boolean;
    rejected_at: string | null;
    rejected_reason: string | null;
  }>;

  const REQUIRED_DOC_TYPES: DocItem["type"][] = ["ktp", "passport", "formal_photo", "cv"];
  const docItems: DocItem[] = REQUIRED_DOC_TYPES.map((t) => {
    const candidates =
      t === "formal_photo"
        ? docsRows.filter((d) => d.doc_type === "formal_photo" || d.doc_type === "photo")
        : docsRows.filter((d) => d.doc_type === t);
    const latest = candidates[0];
    if (!latest) return { type: t, status: "missing" };
    if (latest.verified) return { type: t, status: "verified", file_path: latest.file_path };
    if (latest.rejected_at)
      return {
        type: t,
        status: "rejected",
        file_path: latest.file_path,
        rejected_reason: latest.rejected_reason,
      };
    return { type: t, status: "pending", file_path: latest.file_path };
  });

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--pg-paper)" }}>
      <TopBarApp title="Dokumen" back backHref="/profile" />

      <main className="flex-1 pb-8 px-5 pt-4">
        <p className="text-[13px] text-pg-ink-tertiary mb-4 leading-snug">
          KTP wajib. Paspor, foto, & CV diminta saat tahap Cek Dokumen.
        </p>
        <DocUploader candidateId={candidate.id} initial={docItems} />
        <div
          className="mt-4 flex gap-2 items-start text-[12px] leading-snug"
          style={{ color: "var(--pg-ink-tertiary)" }}
        >
          <Icon name="info" size={13} className="shrink-0 mt-0.5" />
          <span>Format: JPG, PNG, HEIC, atau PDF. Maks 5MB. Pastikan foto jelas.</span>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
