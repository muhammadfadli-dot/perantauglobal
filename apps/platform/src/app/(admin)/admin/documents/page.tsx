import Link from "next/link";
import { createServerClient } from "@/lib/supabase-server";
import { Badge } from "@/components/pg/primitives";
import { Icon } from "@/components/pg/Icon";
import { docTypeLabel, docTypeIcon } from "@/lib/doc-types";
import DocActions from "./DocActions";

export const dynamic = "force-dynamic";

type DocRow = {
  id: string;
  candidate_id: string;
  // String, not a fixed union: candidate_documents.doc_type carries the 8 extended
  // types from migration 0021 (formal_photo, str_certificate, …) beyond the originals.
  doc_type: string;
  display_name: string | null;
  expires_at: string | null;
  file_path: string;
  file_size: number | null;
  mime_type: string | null;
  verified: boolean;
  verified_at: string | null;
  rejected_at: string | null;
  rejected_reason: string | null;
  uploaded_at: string;
  candidates: { full_name: string; email: string | null; city: string | null } | null;
};

// Days until a document expires — negative if already expired.
function daysUntil(iso: string | null): number | null {
  if (!iso) return null;
  return Math.ceil((new Date(iso).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

const PAGE_SIZE = 40;

export default async function DocumentReviewPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string; page?: string }>;
}) {
  const { filter, page: pageParam } = await searchParams;
  const filterValue = filter ?? "pending";
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);
  const supabase = await createServerClient();

  let query = supabase
    .from("candidate_documents")
    .select(
      "id, candidate_id, doc_type, display_name, expires_at, file_path, file_size, mime_type, verified, verified_at, rejected_at, rejected_reason, uploaded_at, candidates (full_name, email, city)"
    )
    .order("uploaded_at", { ascending: false })
    // Page the list so the queue doesn't render hundreds of joined cards (601
    // pending today) and doesn't silently drop rows past the 1000-row cap.
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

  if (filterValue === "pending") {
    query = query.eq("verified", false).is("rejected_at", null);
  } else if (filterValue === "verified") {
    query = query.eq("verified", true);
  } else if (filterValue === "rejected") {
    query = query.not("rejected_at", "is", null);
  }

  const { data, error } = await query;
  if (error) {
    return (
      <main className="p-10">
        <p className="text-sm text-pg-err">Query gagal: {error.message}</p>
      </main>
    );
  }
  const rows = (data ?? []) as unknown as DocRow[];

  const [{ count: pendingCount }, { count: verifiedCount }, { count: rejectedCount }] =
    await Promise.all([
      supabase.from("candidate_documents").select("*", { count: "exact", head: true }).eq("verified", false).is("rejected_at", null),
      supabase.from("candidate_documents").select("*", { count: "exact", head: true }).eq("verified", true),
      supabase.from("candidate_documents").select("*", { count: "exact", head: true }).not("rejected_at", "is", null),
    ]);

  const totalForFilter =
    filterValue === "verified"
      ? verifiedCount ?? 0
      : filterValue === "rejected"
        ? rejectedCount ?? 0
        : pendingCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalForFilter / PAGE_SIZE));
  const pageHref = (p: number) =>
    `/admin/documents?filter=${filterValue}&page=${p}`;

  return (
    <main className="p-6 lg:p-10 max-w-6xl">
      <div className="text-[12px] font-bold tracking-[0.12em] uppercase text-pg-red-600">
        Admin / Review Dokumen
      </div>
      <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mt-1.5">
        Review dokumen kandidat
      </h1>
      <p className="text-base text-pg-ink-700 mt-2 leading-relaxed max-w-2xl">
        Verifikasi KTP, passport, foto, CV, dan dokumen lain yang di-upload kandidat. Tolak dgn
        alasan jelas kalau perlu re-upload.
      </p>

      <div className="mt-6 flex gap-2 flex-wrap">
        {[
          { key: "pending", label: "Pending review", count: pendingCount ?? 0 },
          { key: "verified", label: "Sudah verified", count: verifiedCount ?? 0 },
          { key: "rejected", label: "Ditolak", count: rejectedCount ?? 0 },
        ].map((c) => {
          const active = filterValue === c.key;
          return (
            <Link
              key={c.key}
              href={`/admin/documents?filter=${c.key}`}
              className={`inline-flex items-center gap-2 h-9 px-3.5 text-sm font-semibold rounded-full no-underline border-[1.5px] transition-colors ${
                active
                  ? "bg-pg-ink-900 text-white border-pg-ink-900"
                  : "bg-pg-white text-pg-ink-700 border-pg-ink-200 hover:border-pg-ink-300"
              }`}
            >
              {c.label}
              <span className={`text-[11px] tabular-nums ${active ? "text-white/70" : "text-pg-ink-400"}`}>
                {c.count}
              </span>
            </Link>
          );
        })}
      </div>

      <div className="mt-6 grid gap-3">
        {rows.length === 0 ? (
          <div className="bg-pg-white border border-pg-ink-100 rounded-2xl p-6 text-center text-sm text-pg-ink-500">
            Tidak ada dokumen di filter ini.
          </div>
        ) : (
          rows.map((d) => (
            <div
              key={d.id}
              className="bg-pg-white border border-pg-ink-100 rounded-2xl p-4 md:p-5"
            >
              <div className="flex items-start gap-4">
                <div
                  className="w-12 h-12 rounded-xl grid place-items-center shrink-0"
                  style={{
                    background: d.verified
                      ? "var(--pg-ok-bg)"
                      : d.rejected_at
                        ? "var(--pg-err-bg)"
                        : "var(--pg-warn-bg)",
                    color: d.verified
                      ? "var(--pg-ok)"
                      : d.rejected_at
                        ? "var(--pg-err)"
                        : "var(--pg-warn)",
                  }}
                >
                  <Icon name={docTypeIcon(d.doc_type)} size={22} stroke={2} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <div className="text-base font-extrabold">
                      {d.display_name ?? docTypeLabel(d.doc_type)}
                    </div>
                    {d.verified ? (
                      <Badge variant="ok" icon="check">Verified</Badge>
                    ) : d.rejected_at ? (
                      <Badge variant="err">Ditolak</Badge>
                    ) : (
                      <Badge variant="warn">Pending</Badge>
                    )}
                    {(() => {
                      const days = daysUntil(d.expires_at);
                      if (days == null) return null;
                      if (days < 0)
                        return <Badge variant="err" icon="warn">Kadaluarsa</Badge>;
                      if (days <= 60)
                        return (
                          <Badge variant="warn" icon="warn">
                            Kadaluarsa {days} hari lagi
                          </Badge>
                        );
                      return null;
                    })()}
                  </div>
                  <div className="text-[13px] text-pg-ink-500 mt-0.5">
                    <Link
                      href={`/admin/candidates/${d.candidate_id}`}
                      className="font-bold text-pg-ink-700 hover:text-pg-red-600 no-underline"
                    >
                      {d.candidates?.full_name ?? "—"}
                    </Link>
                    {" · "}
                    {d.candidates?.city ?? "—"} · {d.candidates?.email ?? "—"}
                  </div>
                  <div className="text-[12px] text-pg-ink-500 mt-1 font-mono">
                    {d.mime_type ?? "?"} · {d.file_size ? `${Math.round(d.file_size / 1024)}KB` : "?"} · upload {new Date(d.uploaded_at).toLocaleDateString("id-ID")}
                  </div>
                  {d.rejected_reason && (
                    <div
                      className="mt-2 px-3 py-2 rounded-lg text-[12px]"
                      style={{ background: "var(--pg-err-bg)", color: "var(--pg-err)" }}
                    >
                      <b>Alasan tolak:</b> {d.rejected_reason}
                    </div>
                  )}
                </div>
                <DocActions
                  id={d.id}
                  filePath={d.file_path}
                  verified={d.verified}
                  rejected={Boolean(d.rejected_at)}
                />
              </div>
            </div>
          ))
        )}
      </div>

      {totalForFilter > PAGE_SIZE && (
        <div className="mt-6 flex items-center justify-between gap-3">
          <span className="text-[13px] text-pg-ink-500 font-mono">
            Hal {page} / {totalPages} · {totalForFilter} dokumen
          </span>
          <div className="flex items-center gap-2">
            {page > 1 ? (
              <Link
                href={pageHref(page - 1)}
                className="inline-flex items-center gap-1 min-h-[40px] px-4 rounded-xl text-[13px] font-bold text-pg-ink-900 no-underline"
                style={{ background: "var(--pg-white)", border: "1px solid var(--pg-ink-200)" }}
              >
                <Icon name="arrow_left" size={14} /> Sebelumnya
              </Link>
            ) : (
              <span className="inline-flex items-center min-h-[40px] px-4 rounded-xl text-[13px] font-bold text-pg-ink-300" style={{ border: "1px solid var(--pg-ink-100)" }}>
                Sebelumnya
              </span>
            )}
            {page < totalPages ? (
              <Link
                href={pageHref(page + 1)}
                className="inline-flex items-center gap-1 min-h-[40px] px-4 rounded-xl text-[13px] font-bold text-white no-underline"
                style={{ background: "var(--pg-red-600)" }}
              >
                Berikutnya <Icon name="arrow_right" size={14} />
              </Link>
            ) : (
              <span className="inline-flex items-center min-h-[40px] px-4 rounded-xl text-[13px] font-bold text-pg-ink-300" style={{ border: "1px solid var(--pg-ink-100)" }}>
                Berikutnya
              </span>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
