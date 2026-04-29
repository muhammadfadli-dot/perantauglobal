import Link from "next/link";
import { createServerClient } from "@/lib/supabase-server";
import type { Json } from "@perantauglobal/db";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 50;

const ACTION_FILTERS: { key: string; label: string }[] = [
  { key: "all", label: "Semua aksi" },
  { key: "view_document", label: "Lihat dokumen" },
  { key: "verify_document", label: "Verifikasi dokumen" },
  { key: "reject_document", label: "Tolak dokumen" },
  { key: "update_application_stage", label: "Ubah stage" },
  { key: "update_application_notes", label: "Ubah notes" },
  { key: "toggle_reached_out", label: "Reached out" },
  { key: "assign_tier", label: "Assign tier" },
  { key: "clear_tier", label: "Clear tier" },
  { key: "invite_admin", label: "Invite admin" },
  { key: "remove_admin", label: "Remove admin" },
  { key: "update_inbox_status", label: "Inbox status" },
  { key: "update_inbox_notes", label: "Inbox notes" },
];

const RESOURCE_LABELS: Record<string, string> = {
  candidate_document: "Dokumen",
  application: "Lamaran",
  candidate: "Kandidat",
  admin_user: "Admin user",
  contact_submission: "Inbox",
};

const ACTION_LABELS: Record<string, string> = {
  view_document: "Lihat dokumen",
  verify_document: "Verifikasi dokumen",
  reject_document: "Tolak dokumen",
  update_application_stage: "Ubah stage",
  update_application_notes: "Ubah notes",
  toggle_reached_out: "Reached out",
  assign_tier: "Assign tier",
  clear_tier: "Clear tier",
  invite_admin: "Invite admin",
  remove_admin: "Remove admin",
  update_inbox_status: "Update inbox status",
  update_inbox_notes: "Update inbox notes",
};

const ACTION_TONE: Record<string, "info" | "ok" | "warn" | "err" | "mute"> = {
  view_document: "info",
  verify_document: "ok",
  reject_document: "err",
  update_application_stage: "info",
  update_application_notes: "mute",
  toggle_reached_out: "info",
  assign_tier: "ok",
  clear_tier: "mute",
  invite_admin: "ok",
  remove_admin: "err",
  update_inbox_status: "mute",
  update_inbox_notes: "mute",
};

const TONE_CLASS: Record<string, { bg: string; fg: string; label: string }> = {
  info: { bg: "var(--pg-info-bg)", fg: "var(--pg-info)", label: "" },
  ok: { bg: "var(--pg-ok-bg)", fg: "var(--pg-ok)", label: "" },
  warn: { bg: "var(--pg-warn-bg)", fg: "var(--pg-warn)", label: "" },
  err: { bg: "var(--pg-err-bg)", fg: "var(--pg-err)", label: "" },
  mute: { bg: "var(--pg-ink-50)", fg: "var(--pg-ink-700)", label: "" },
};

function fmtTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function metadataPreview(metadata: Json | null): string {
  if (metadata === null || typeof metadata !== "object" || Array.isArray(metadata)) return "";
  const entries = Object.entries(metadata as Record<string, Json | undefined>);
  if (entries.length === 0) return "";
  return entries
    .map(([k, v]) => `${k}=${typeof v === "string" ? v.slice(0, 40) : JSON.stringify(v).slice(0, 40)}`)
    .join(" · ");
}

type SearchParams = {
  action?: string;
  resource?: string;
  admin?: string;
  from?: string;
  to?: string;
  page?: string;
};

export default async function AuditLogPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const action = params.action ?? "all";
  const resource = params.resource ?? "";
  const admin = params.admin ?? "";
  const from = params.from ?? "";
  const to = params.to ?? "";
  const page = Math.max(1, Number(params.page) || 1);
  const offset = (page - 1) * PAGE_SIZE;

  const supabase = await createServerClient();

  // The admin_audit_log table is gated by RLS (admin-read-only), and is
  // populated only via the SECURITY DEFINER `log_admin_action()` function.
  let q = supabase
    .from("admin_audit_log")
    .select(
      "id, admin_user_id, admin_email, action, resource_type, resource_id, metadata, ip_address, user_agent, occurred_at",
      { count: "exact" },
    )
    .order("occurred_at", { ascending: false });

  if (action !== "all") q = q.eq("action", action);
  if (resource) q = q.eq("resource_type", resource);
  if (admin) q = q.ilike("admin_email", `%${admin}%`);
  if (from) q = q.gte("occurred_at", new Date(from).toISOString());
  if (to) q = q.lte("occurred_at", new Date(`${to}T23:59:59`).toISOString());

  const { data, error, count } = await q.range(offset, offset + PAGE_SIZE - 1);

  if (error) {
    return (
      <main className="p-10">
        <p className="text-sm text-pg-err">Query gagal: {error.message}</p>
        <p className="text-xs text-pg-ink-500 mt-2">
          Pastikan migration 0017 (admin_audit_log) sudah di-apply ke Supabase.
        </p>
      </main>
    );
  }

  const rows = data ?? [];
  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function buildHref(overrides: Partial<SearchParams>): string {
    const next: SearchParams = { action, resource, admin, from, to, ...overrides };
    const sp = new URLSearchParams();
    if (next.action && next.action !== "all") sp.set("action", next.action);
    if (next.resource) sp.set("resource", next.resource);
    if (next.admin) sp.set("admin", next.admin);
    if (next.from) sp.set("from", next.from);
    if (next.to) sp.set("to", next.to);
    if (next.page && Number(next.page) > 1) sp.set("page", String(next.page));
    const qs = sp.toString();
    return `/admin/audit-log${qs ? `?${qs}` : ""}`;
  }

  return (
    <main className="p-6 lg:p-10 max-w-7xl">
      <div className="text-[12px] font-bold tracking-[0.12em] uppercase text-pg-red-600">
        Admin / Audit Log
      </div>
      <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mt-1.5">
        Audit log aksi admin
      </h1>
      <p className="text-base text-pg-ink-700 mt-2 leading-relaxed max-w-3xl">
        Catatan setiap aksi admin terhadap data kandidat & dokumen. Disimpan untuk
        kepatuhan PDP UU 27/2022 (Pasal 35 — records of processing activities). Log
        bersifat append-only — tidak bisa diubah atau dihapus.
      </p>

      {/* Filter form */}
      <form
        method="get"
        className="mt-6 grid gap-3 md:grid-cols-[1fr_1fr_1fr_auto_auto] items-end bg-pg-white border border-pg-ink-100 rounded-2xl p-4"
      >
        <div>
          <label className="text-[12px] font-bold text-pg-ink-500 mb-1 block">Aksi</label>
          <select
            name="action"
            defaultValue={action}
            className="w-full bg-pg-white border border-pg-ink-200 rounded-lg px-3 py-2 text-sm font-semibold"
          >
            {ACTION_FILTERS.map((a) => (
              <option key={a.key} value={a.key}>
                {a.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-[12px] font-bold text-pg-ink-500 mb-1 block">
            Tipe resource
          </label>
          <select
            name="resource"
            defaultValue={resource}
            className="w-full bg-pg-white border border-pg-ink-200 rounded-lg px-3 py-2 text-sm font-semibold"
          >
            <option value="">Semua</option>
            {Object.entries(RESOURCE_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-[12px] font-bold text-pg-ink-500 mb-1 block">
            Admin (email contains)
          </label>
          <input
            name="admin"
            defaultValue={admin}
            placeholder="cth: martin"
            className="w-full bg-pg-white border border-pg-ink-200 rounded-lg px-3 py-2 text-sm font-semibold"
          />
        </div>
        <div className="flex gap-2">
          <div>
            <label className="text-[12px] font-bold text-pg-ink-500 mb-1 block">Dari</label>
            <input
              name="from"
              type="date"
              defaultValue={from}
              className="bg-pg-white border border-pg-ink-200 rounded-lg px-3 py-2 text-sm font-semibold"
            />
          </div>
          <div>
            <label className="text-[12px] font-bold text-pg-ink-500 mb-1 block">Sampai</label>
            <input
              name="to"
              type="date"
              defaultValue={to}
              className="bg-pg-white border border-pg-ink-200 rounded-lg px-3 py-2 text-sm font-semibold"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            className="h-[38px] px-4 text-sm font-semibold rounded-lg bg-pg-ink-900 text-white"
          >
            Filter
          </button>
          <Link
            href="/admin/audit-log"
            className="h-[38px] px-4 text-sm font-semibold rounded-lg bg-pg-ink-50 text-pg-ink-700 inline-flex items-center no-underline"
          >
            Reset
          </Link>
        </div>
      </form>

      {/* Result count */}
      <div className="mt-4 text-[13px] text-pg-ink-500">
        {total > 0 ? (
          <>
            <span className="font-semibold text-pg-ink-700">{total.toLocaleString("id-ID")}</span> entry
            cocok · halaman {page} / {totalPages}
          </>
        ) : (
          "Tidak ada entry yang cocok dengan filter."
        )}
      </div>

      {/* Table */}
      {rows.length > 0 && (
        <div className="mt-3 bg-pg-white border border-pg-ink-100 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-pg-ink-50 text-[11px] font-bold tracking-[0.06em] uppercase text-pg-ink-500">
                <tr>
                  <th className="px-4 py-3 text-left">Waktu (WIB)</th>
                  <th className="px-4 py-3 text-left">Admin</th>
                  <th className="px-4 py-3 text-left">Aksi</th>
                  <th className="px-4 py-3 text-left">Resource</th>
                  <th className="px-4 py-3 text-left">Detail</th>
                  <th className="px-4 py-3 text-left">IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pg-ink-100">
                {rows.map((r) => {
                  const tone = TONE_CLASS[ACTION_TONE[r.action] ?? "mute"]!;
                  return (
                    <tr key={r.id} className="hover:bg-pg-ink-50/50">
                      <td className="px-4 py-3 font-mono text-[12px] text-pg-ink-700 whitespace-nowrap">
                        {fmtTime(r.occurred_at)}
                      </td>
                      <td className="px-4 py-3 text-pg-ink-900 font-semibold whitespace-nowrap">
                        {r.admin_email}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="inline-flex items-center px-2 py-1 rounded text-[11px] font-bold"
                          style={{ background: tone.bg, color: tone.fg }}
                        >
                          {ACTION_LABELS[r.action] ?? r.action}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-pg-ink-700 whitespace-nowrap">
                        <span className="font-semibold">
                          {RESOURCE_LABELS[r.resource_type] ?? r.resource_type}
                        </span>
                        {r.resource_id ? (
                          <div className="font-mono text-[11px] text-pg-ink-400 truncate max-w-[280px]">
                            {r.resource_id}
                          </div>
                        ) : null}
                      </td>
                      <td className="px-4 py-3 text-[12px] text-pg-ink-500 max-w-[280px]">
                        <div className="font-mono truncate">
                          {metadataPreview(r.metadata)}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-[11px] text-pg-ink-500 whitespace-nowrap">
                        {/* INET serializes as a string from PostgREST. */}
                        {(r.ip_address as string | null) ?? "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <Link
            href={buildHref({ page: String(Math.max(1, page - 1)) })}
            className={`h-9 px-3 text-sm font-semibold rounded-lg inline-flex items-center no-underline ${
              page <= 1
                ? "bg-pg-ink-50 text-pg-ink-300 pointer-events-none"
                : "bg-pg-white text-pg-ink-700 border border-pg-ink-200"
            }`}
            aria-disabled={page <= 1}
          >
            ← Prev
          </Link>
          <span className="text-[13px] text-pg-ink-500">
            Halaman {page} / {totalPages}
          </span>
          <Link
            href={buildHref({ page: String(Math.min(totalPages, page + 1)) })}
            className={`h-9 px-3 text-sm font-semibold rounded-lg inline-flex items-center no-underline ${
              page >= totalPages
                ? "bg-pg-ink-50 text-pg-ink-300 pointer-events-none"
                : "bg-pg-white text-pg-ink-700 border border-pg-ink-200"
            }`}
            aria-disabled={page >= totalPages}
          >
            Next →
          </Link>
        </div>
      )}
    </main>
  );
}
