import Link from "next/link";
import { notFound } from "next/navigation";
import { createServerClient } from "@/lib/supabase-server";
import { Icon } from "@/components/pg/Icon";
import ExportRegistrationsButton, {
  type ExportRow,
} from "./ExportRegistrationsButton";

export const dynamic = "force-dynamic";

type EventRow = {
  slug: string;
  title: string;
  status: string;
  starts_at: string;
  timezone: string;
  platform: string;
};

type RegRow = {
  id: string;
  full_name: string;
  whatsapp: string;
  email: string;
  city: string | null;
  profession: string | null;
  interest: string | null;
  consent_marketing: boolean;
  utm_source: string | null;
  utm_campaign: string | null;
  utm_medium: string | null;
  fbc: string | null;
  created_at: string;
};

function fmtDateTime(iso: string, tz = "Asia/Jakarta") {
  return new Date(iso).toLocaleString("id-ID", {
    timeZone: tz,
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function AdminEventDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createServerClient();

  const { data: event } = await supabase
    .from("events")
    .select("slug, title, status, starts_at, timezone, platform")
    .eq("slug", slug)
    .maybeSingle();

  if (!event) notFound();
  const ev = event as EventRow;

  const { data, error } = await supabase
    .from("event_registrations")
    .select(
      "id, full_name, whatsapp, email, city, profession, interest, consent_marketing, utm_source, utm_campaign, utm_medium, fbc, created_at",
    )
    .eq("event_slug", slug)
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <main className="p-10">
        <p className="text-sm text-pg-err">Query gagal: {error.message}</p>
      </main>
    );
  }

  const rows = (data ?? []) as RegRow[];
  const fromAds = rows.filter((r) => r.utm_source || r.fbc).length;
  const optedIn = rows.filter((r) => r.consent_marketing).length;

  const exportRows: ExportRow[] = rows.map((r) => ({
    nama: r.full_name,
    whatsapp: r.whatsapp,
    email: r.email,
    profesi: r.profession ?? "",
    kota: r.city ?? "",
    minat: r.interest ?? "",
    consent_marketing: r.consent_marketing ? "ya" : "tidak",
    utm_source: r.utm_source ?? "",
    utm_medium: r.utm_medium ?? "",
    utm_campaign: r.utm_campaign ?? "",
    dari_iklan: r.utm_source || r.fbc ? "ya" : "tidak",
    tgl_daftar: fmtDateTime(r.created_at, ev.timezone),
  }));

  return (
    <main className="p-6 lg:p-10 max-w-6xl">
      <Link
        href="/admin/events"
        className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-pg-ink-500 hover:text-pg-ink-900 no-underline"
      >
        <Icon name="arrow_left" size={15} /> Semua event
      </Link>

      <div className="flex items-start justify-between gap-4 mt-3 flex-wrap">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            {ev.title}
          </h1>
          <div className="text-[13px] text-pg-ink-500 mt-1 font-mono">
            {fmtDateTime(ev.starts_at, ev.timezone)} {ev.timezone === "Asia/Jakarta" ? "WIB" : ""} ·{" "}
            {ev.platform} · /event/{ev.slug}
          </div>
        </div>
        <ExportRegistrationsButton
          rows={exportRows}
          filename={`pendaftar-${ev.slug}.csv`}
        />
      </div>

      {/* KPI strip */}
      <div className="mt-6 grid grid-cols-3 gap-3 max-w-xl">
        {[
          { label: "Total pendaftar", value: rows.length },
          { label: "Dari iklan", value: fromAds },
          { label: "Opt-in follow-up", value: optedIn },
        ].map((k) => (
          <div key={k.label} className="bg-pg-white border border-pg-ink-100 rounded-2xl p-4">
            <div className="text-[22px] font-extrabold text-pg-ink-900 tabular-nums">
              {k.value}
            </div>
            <div className="text-[11px] font-mono uppercase tracking-wide text-pg-ink-400 mt-0.5">
              {k.label}
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="mt-6 bg-pg-white border border-pg-ink-100 rounded-2xl overflow-hidden">
        {rows.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-base font-bold">Belum ada pendaftar</div>
            <div className="text-sm text-pg-ink-500 mt-1.5">
              Pendaftar dari <code className="font-mono text-[13px]">/event/{ev.slug}</code> muncul di sini.
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px] border-collapse">
              <thead>
                <tr className="text-left text-pg-ink-500 border-b border-pg-ink-100">
                  <th className="font-semibold px-4 py-3">Nama</th>
                  <th className="font-semibold px-4 py-3">WhatsApp</th>
                  <th className="font-semibold px-4 py-3">Email</th>
                  <th className="font-semibold px-4 py-3">Profesi</th>
                  <th className="font-semibold px-4 py-3">Kota</th>
                  <th className="font-semibold px-4 py-3">Minat</th>
                  <th className="font-semibold px-4 py-3">Sumber</th>
                  <th className="font-semibold px-4 py-3 whitespace-nowrap">Tgl daftar</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-b border-pg-ink-50 last:border-0 align-top">
                    <td className="px-4 py-3 font-semibold text-pg-ink-900">
                      {r.full_name}
                      {r.consent_marketing && (
                        <span
                          className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase"
                          style={{ background: "var(--pg-ok-bg)", color: "var(--pg-ok)" }}
                        >
                          opt-in
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono text-pg-ink-700 whitespace-nowrap">{r.whatsapp}</td>
                    <td className="px-4 py-3 text-pg-ink-700">{r.email}</td>
                    <td className="px-4 py-3 text-pg-ink-700">{r.profession ?? "—"}</td>
                    <td className="px-4 py-3 text-pg-ink-700">{r.city ?? "—"}</td>
                    <td className="px-4 py-3 text-pg-ink-700">{r.interest ?? "—"}</td>
                    <td className="px-4 py-3 text-pg-ink-500 font-mono text-[12px]">
                      {r.utm_source ? r.utm_source : r.fbc ? "fb" : "organic"}
                    </td>
                    <td className="px-4 py-3 text-pg-ink-500 whitespace-nowrap">
                      {fmtDateTime(r.created_at, ev.timezone)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
