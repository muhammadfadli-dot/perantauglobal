import { NextResponse } from "next/server";
import { createServerClient, getSessionAndRole } from "@/lib/supabase-server";
import { logAdminAction } from "@/lib/audit-log";
import { loadFieldMeta, answerText } from "@/lib/academy-answers";

export const dynamic = "force-dynamic";

type Row = {
  id: string;
  program_slug: string;
  payment_status: string;
  payment_amount: number | null;
  status: string;
  enrolled_at: string;
  answers: Record<string, unknown> | null;
  candidate_id: string;
  candidates: { full_name: string | null; email: string | null; phone: string | null } | null;
  academy_programs: { title: string; price: number | null } | null;
};

function csvCell(v: unknown): string {
  let s = v == null ? "" : String(v);
  // Excel reads a leading =, +, - or @ as a formula, and a leading 0 as a
  // number with the zero dropped. Both wreck the WhatsApp column, which is the
  // whole point of this export: of 42 Barista registrants, 33 numbers start
  // with "+" and 9 with "0", so every single one would arrive unusable. A
  // leading tab inside a quoted cell forces text and stays invisible in Excel,
  // Sheets and LibreOffice. It also closes CSV formula injection, since a name
  // typed as "=cmd|..." can otherwise execute on open.
  if (/^[=+\-@0]/.test(s)) s = "\t" + s;
  return /[",\n\r\t]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/**
 * Phone numbers are forced to text by column, not by whichever character they
 * happen to start with. The guard above misses a number stored as
 * "81235587089", which Excel would still round into scientific notation.
 */
function csvPhone(v: unknown): string {
  const s = v == null ? "" : String(v);
  if (s === "") return "";
  return `"\t${s.replace(/"/g, '""')}"`;
}

/** Jakarta wall-clock, so the column is readable instead of a raw ISO stamp. */
function tanggalWib(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const p = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
  return p.replace("T", " ");
}

/**
 * CSV export of Akademi enrollments, including the screening answers and
 * whether a CV was uploaded.
 *
 * Why this exists: the enrollment list showed payment state only, so the
 * screening answers that PIC collects candidates on were unreachable outside
 * the database (reported by Ifa, 5 Aug, 42 Barista registrants).
 *
 * The answer keys differ per program (Barista asks usia / pengalaman_barista /
 * pendidikan / domisili / dana_talang), so the columns are derived from the
 * rows actually exported rather than hardcoded. A program that adds a question
 * later shows up without a code change.
 *
 * CSV, not .xlsx: Excel opens this directly (UTF-8 BOM, CRLF) and it adds no
 * dependency. If real .xlsx formatting is ever needed, that is a separate call.
 *
 * PDP: pulling every registrant's name, contact and answers at once is a larger
 * PII egress than opening one document, so it is audit-logged before the rows
 * leave, mirroring the candidate export.
 */
export async function GET(request: Request) {
  const { session, role } = await getSessionAndRole();
  if (!session || role !== "admin") {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const url = new URL(request.url);
  const program = url.searchParams.get("program");
  const bayar = url.searchParams.get("bayar");

  const supabase = await createServerClient();
  const PAGE = 1000;
  const all: Row[] = [];
  for (let from = 0; ; from += PAGE) {
    let q = supabase
      .from("academy_enrollments")
      .select(
        "id, program_slug, payment_status, payment_amount, status, enrolled_at, answers, candidate_id, candidates(full_name, email, phone), academy_programs(title, price)",
      )
      .order("enrolled_at", { ascending: false })
      .range(from, from + PAGE - 1);
    if (program) q = q.eq("program_slug", program);
    if (bayar) q = q.eq("payment_status", bayar);

    const { data, error } = await q;
    if (error) return new NextResponse(error.message, { status: 500 });
    const batch = (data ?? []) as unknown as Row[];
    all.push(...batch);
    if (batch.length < PAGE) break;
  }

  // Which registrants have a CV. Chunked because `in` has a URL length limit.
  const cvOwners = new Set<string>();
  const ids = [...new Set(all.map((r) => r.candidate_id).filter(Boolean))];
  for (let i = 0; i < ids.length; i += 200) {
    const { data, error } = await supabase
      .from("candidate_documents")
      .select("candidate_id")
      .eq("doc_type", "cv")
      .in("candidate_id", ids.slice(i, i + 200));
    if (error) return new NextResponse(error.message, { status: 500 });
    for (const d of data ?? []) cvOwners.add((d as { candidate_id: string }).candidate_id);
  }

  await logAdminAction("export_enrollments_csv", "academy_enrollment", program ?? "all", {
    row_count: all.length,
    program: program ?? null,
    payment_filter: bayar ?? null,
  });

  // Question wording + option labels, same source the form renders from, so the
  // CSV carries "SMA atau SMK" rather than "sma_smk".
  const fieldMeta = await loadFieldMeta(supabase, all.map((r) => r.program_slug));

  // Two programs can define the same field_key with different wording. Scanning
  // in Map order would make the winning label depend on row order, so slugs are
  // sorted first: same export, same header, every time. Exporting one program
  // (?program=) removes the ambiguity entirely.
  const slugsTerurut = [...fieldMeta.keys()].sort();
  const metaOf = (k: string) => {
    for (const slug of slugsTerurut) {
      const m = fieldMeta.get(slug)?.get(k);
      if (m) return m;
    }
    return undefined;
  };

  // Answer columns come from the data, so a new screening question needs no
  // code change here. Ordered by the question order in the form where known,
  // then alphabetically, so column order is stable between exports.
  const answerKeys = [
    ...new Set(all.flatMap((r) => (r.answers ? Object.keys(r.answers) : []))),
  ].sort(
    (a, b) => (metaOf(a)?.sort ?? 999) - (metaOf(b)?.sort ?? 999) || a.localeCompare(b),
  );

  const headerLabel = (k: string) => metaOf(k)?.label ?? k.replace(/_/g, " ");

  const header = [
    "nama",
    "whatsapp",
    "email",
    "program",
    "status_bayar",
    "nominal",
    "status_pendaftaran",
    "tanggal_daftar",
    "punya_cv",
    ...answerKeys.map((k) => headerLabel(k)),
  ];

  const lines = [
    // Header lewat csvCell juga: field_label datang dari DB, dan satu koma di
    // situ akan menggeser seluruh kolom tanpa suara.
    header.map(csvCell).join(","),
    ...all.map((r) =>
      [
        csvCell(r.candidates?.full_name),
        // Kolom telepon punya aturan sendiri, lihat csvPhone.
        csvPhone(r.candidates?.phone),
        csvCell(r.candidates?.email),
        csvCell(r.academy_programs?.title ?? r.program_slug),
        csvCell(r.payment_status),
        // Fallback ke harga program, sama seperti yang ditampilkan halaman
        // admin, supaya berkas dan layar tidak beda isi.
        csvCell(r.payment_amount ?? r.academy_programs?.price ?? null),
        csvCell(r.status),
        csvCell(tanggalWib(r.enrolled_at)),
        csvCell(cvOwners.has(r.candidate_id) ? "ya" : "tidak"),
        ...answerKeys.map((k) =>
          csvCell(answerText(r.answers?.[k], fieldMeta.get(r.program_slug)?.get(k)?.options)),
        ),
      ].join(","),
    ),
  ];
  // UTF-8 BOM so Excel reads accented names correctly on double-click.
  const csv = "﻿" + lines.join("\r\n");

  const stamp = new Date().toISOString().slice(0, 10);
  const namaFile = `pendaftar-akademi${program ? `-${program}` : ""}-${stamp}.csv`;
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${namaFile}"`,
      "Cache-Control": "no-store",
    },
  });
}
