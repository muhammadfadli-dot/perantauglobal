"use client";

import { Icon } from "@/components/pg/Icon";

export type ExportRow = Record<string, string | number | boolean | null>;

function toCsv(rows: ExportRow[]): string {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]!);
  const escape = (v: string | number | boolean | null) => {
    const s = v == null ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [
    headers.join(","),
    ...rows.map((r) => headers.map((h) => escape(r[h] ?? "")).join(",")),
  ];
  return lines.join("\n");
}

export default function ExportRegistrationsButton({
  rows,
  filename,
}: {
  rows: ExportRow[];
  filename: string;
}) {
  function handleExport() {
    const csv = toCsv(rows);
    const blob = new Blob([`﻿${csv}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={rows.length === 0}
      className="inline-flex items-center gap-2 h-10 px-4 text-sm font-semibold rounded-xl border-[1.5px] border-pg-ink-200 bg-pg-white text-pg-ink-900 hover:border-pg-ink-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      <Icon name="download" size={16} />
      Export CSV
    </button>
  );
}
