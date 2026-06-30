import { createServerClient, requireCandidate } from "@/lib/supabase-server";
import { TopBarApp, BottomNav } from "@/components/pg/AppChrome";
import { Icon } from "@/components/pg/Icon";
import DocUploader, { type DocItem } from "../DocUploader";
import SupportingDocsUploader from "../SupportingDocsUploader";

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

  const [{ data: docsData }, { data: cvAsmtData }] = await Promise.all([
    supabase
      .from("candidate_documents")
      .select("doc_type, file_path, verified, rejected_at, rejected_reason, uploaded_at")
      .eq("candidate_id", candidateId)
      .order("uploaded_at", { ascending: false }),
    // Latest successful CV reading (migration 0071) — drives the nudge below.
    supabase
      .from("cv_assessments")
      .select("quality_score, quality, status")
      .eq("candidate_id", candidateId)
      .eq("status", "ok")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);
  const docsRows = (docsData ?? []) as Array<{
    doc_type: string;
    file_path: string;
    verified: boolean;
    rejected_at: string | null;
    rejected_reason: string | null;
  }>;
  const cvNudge = cvAsmtData as {
    quality_score: number | null;
    quality: { kekurangan?: string[] } | null;
  } | null;

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

  // Optional supporting credentials (feed the CV grader's multi-doc extraction).
  const CRED_DOC_TYPES = [
    "language_certificate", "professional_certificate", "education_certificate",
    "work_certificate", "str_certificate", "driving_license",
  ];
  const credCounts: Record<string, number> = {};
  for (const d of docsRows) {
    if (CRED_DOC_TYPES.includes(d.doc_type)) credCounts[d.doc_type] = (credCounts[d.doc_type] ?? 0) + 1;
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--pg-paper)" }}>
      <TopBarApp title="Dokumen" back backHref="/profile" />

      <main className="flex-1 pb-8 px-5 pt-4">
        <p className="text-[13px] text-pg-ink-tertiary mb-4 leading-snug">
          KTP wajib. Paspor, foto, & CV diminta saat tahap Cek Dokumen.
        </p>
        <CvNudge score={cvNudge?.quality_score ?? null} kekurangan={cvNudge?.quality?.kekurangan ?? []} />
        <DocUploader candidateId={candidate.id} initial={docItems} />

        <div className="mt-6 mb-2">
          <h2 className="text-[13px] font-extrabold tracking-[0.04em] uppercase text-pg-ink-secondary">
            Dokumen pendukung
          </h2>
          <p className="text-[12px] text-pg-ink-tertiary mt-1 leading-snug">
            Opsional. Punya sertifikat? Tambahin biar CV kamu makin kuat dinilai.
          </p>
        </div>
        <SupportingDocsUploader candidateId={candidate.id} counts={credCounts} />

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

/**
 * CV completeness nudge (migration 0071). Shows the candidate how complete their
 * uploaded CV looks (read automatically) + gentle suggestions. Only renders once
 * a CV has been graded.
 */
function CvNudge({ score, kekurangan }: { score: number | null; kekurangan: string[] }) {
  if (score === null) return null;
  const strong = score >= 85;
  const fg = strong ? "var(--pg-ok-soft-fg)" : "var(--pg-warn-soft-fg)";
  const bg = strong ? "var(--pg-ok-soft-bg)" : "var(--pg-warn-soft-bg)";
  return (
    <div className="mb-4 rounded-2xl p-4" style={{ background: bg }}>
      <div className="flex items-center gap-3">
        <div
          className="w-12 h-12 rounded-full grid place-items-center shrink-0 font-extrabold text-[15px] tabular-nums"
          style={{ background: "var(--pg-white)", color: fg }}
        >
          {score}%
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[14px] font-extrabold" style={{ color: fg }}>
            {strong ? "CV kamu sudah lengkap" : "CV kamu sudah kami baca"}
          </div>
          <div className="text-[12px] leading-snug" style={{ color: "var(--pg-ink-secondary)" }}>
            {strong
              ? "Bagus! CV kamu jelas dan siap dilihat perekrut."
              : "Yuk lengkapi CV kamu biar makin siap dilihat perekrut:"}
          </div>
        </div>
      </div>
      {!strong && kekurangan.length > 0 && (
        <ul className="mt-3 flex flex-col gap-1.5">
          {kekurangan.slice(0, 3).map((k, i) => (
            <li key={i} className="flex items-start gap-2 text-[12px]" style={{ color: "var(--pg-ink-secondary)" }}>
              <span className="mt-[6px] w-1.5 h-1.5 rounded-full shrink-0" style={{ background: fg }} />
              <span>{k}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
