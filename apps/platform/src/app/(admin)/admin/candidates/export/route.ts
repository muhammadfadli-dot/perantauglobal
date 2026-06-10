import { NextResponse } from "next/server";
import { createServerClient, getSessionAndRole } from "@/lib/supabase-server";
import { logAdminAction } from "@/lib/audit-log";

export const dynamic = "force-dynamic";

type Row = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  city: string | null;
  created_at: string;
};

function csvCell(v: unknown): string {
  const s = v == null ? "" : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/**
 * Real CSV export for the candidate database. The "Export CSV" button on
 * /admin/candidates previously linked here but the route did not exist (404).
 * Paginates so it stays correct past the 1000-row PostgREST cap.
 */
export async function GET() {
  const { session, role } = await getSessionAndRole();
  if (!session || role !== "admin") {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const supabase = await createServerClient();
  const PAGE = 1000;
  const all: Row[] = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await supabase
      .from("candidates")
      .select("id, full_name, email, phone, city, created_at")
      .order("created_at", { ascending: false })
      .range(from, from + PAGE - 1);
    if (error) return new NextResponse(error.message, { status: 500 });
    const batch = (data ?? []) as Row[];
    all.push(...batch);
    if (batch.length < PAGE) break;
  }

  await logAdminAction("export_candidates_csv", "candidate", "all", {
    row_count: all.length,
  });

  const header = ["id", "nama", "email", "phone", "kota", "terdaftar"];
  const lines = [
    header.join(","),
    ...all.map((r) =>
      [r.id, r.full_name, r.email, r.phone, r.city, r.created_at]
        .map(csvCell)
        .join(","),
    ),
  ];
  // Prepend a UTF-8 BOM so Excel opens accented names correctly.
  const csv = "﻿" + lines.join("\r\n");

  const stamp = new Date().toISOString().slice(0, 10);
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="kandidat-perantau-global-${stamp}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
