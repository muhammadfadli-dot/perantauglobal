import Link from "next/link";
import { createServerClient } from "@/lib/supabase-server";
import { Icon } from "@/components/pg/Icon";

export const dynamic = "force-dynamic";

type EventRow = {
  slug: string;
  title: string;
  status: string;
  starts_at: string;
  timezone: string;
  platform: string;
};

const STATUS_TONE: Record<string, { bg: string; fg: string; label: string }> = {
  published: { bg: "var(--pg-ok-bg)", fg: "var(--pg-ok)", label: "Live" },
  draft: { bg: "var(--pg-ink-50)", fg: "var(--pg-ink-tertiary)", label: "Draft" },
  closed: { bg: "var(--pg-warn-bg)", fg: "var(--pg-warn)", label: "Ditutup" },
};

function fmtWhen(startsAt: string, tz: string) {
  const d = new Date(startsAt);
  const date = d.toLocaleDateString("id-ID", {
    timeZone: tz,
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const time = d.toLocaleTimeString("id-ID", {
    timeZone: tz,
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${date} · ${time} ${tz === "Asia/Jakarta" ? "WIB" : ""}`.trim();
}

export default async function AdminEventsPage() {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("events")
    .select("slug, title, status, starts_at, timezone, platform")
    .order("starts_at", { ascending: false });

  if (error) {
    return (
      <main className="p-10">
        <p className="text-sm text-pg-err">Query gagal: {error.message}</p>
        <p className="text-[13px] text-pg-ink-500 mt-2">
          Kalau ini “relation events does not exist”, migration 0055 belum di-apply.
        </p>
      </main>
    );
  }

  const events = (data ?? []) as EventRow[];

  const counts = await Promise.all(
    events.map((e) =>
      supabase
        .from("event_registrations")
        .select("*", { count: "exact", head: true })
        .eq("event_slug", e.slug),
    ),
  );
  const countBySlug = new Map<string, number>();
  events.forEach((e, i) => countBySlug.set(e.slug, counts[i]?.count ?? 0));

  return (
    <main className="p-6 lg:p-10 max-w-5xl">
      <div className="text-[12px] font-bold tracking-[0.12em] uppercase text-pg-red-600">
        Admin / Event
      </div>
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="max-w-2xl">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mt-1.5">
            Event &amp; pendaftar
          </h1>
          <p className="text-base text-pg-ink-700 mt-2 leading-relaxed">
            Pendaftar dari landing page event (sharing session / webinar). Lead-nya
            ke-track lengkap dengan sumber iklan — beda dari Google Form.
          </p>
        </div>
        <Link
          href="/admin/events/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[14px] font-bold text-white no-underline shrink-0"
          style={{ background: "var(--pg-red-600)" }}
        >
          <Icon name="plus" size={16} stroke={2.4} /> Buat event
        </Link>
      </div>

      <div className="mt-7 grid gap-3">
        {events.length === 0 ? (
          <div className="bg-pg-white border border-pg-ink-100 rounded-2xl p-8 text-center">
            <div className="text-base font-bold">Belum ada event</div>
            <div className="text-sm text-pg-ink-500 mt-1.5">
              Tambah baris di tabel <code className="font-mono text-[13px]">events</code> untuk
              bikin landing page baru di <code className="font-mono text-[13px]">/event/[slug]</code>.
            </div>
          </div>
        ) : (
          events.map((e) => {
            const tone = STATUS_TONE[e.status] ?? STATUS_TONE.draft!;
            return (
              <Link
                key={e.slug}
                href={`/admin/events/${e.slug}`}
                className="flex items-center gap-4 bg-pg-white border border-pg-ink-100 rounded-2xl p-5 no-underline hover:border-pg-ink-300 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5">
                    <span className="text-[16px] font-extrabold text-pg-ink-900 truncate">
                      {e.title}
                    </span>
                    <span
                      className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide shrink-0"
                      style={{ background: tone.bg, color: tone.fg }}
                    >
                      {tone.label}
                    </span>
                  </div>
                  <div className="text-[13px] text-pg-ink-500 mt-1 font-mono">
                    {fmtWhen(e.starts_at, e.timezone)} · {e.platform} · /event/{e.slug}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[22px] font-extrabold text-pg-ink-900 tabular-nums">
                    {countBySlug.get(e.slug) ?? 0}
                  </div>
                  <div className="text-[11px] font-mono uppercase tracking-wide text-pg-ink-400">
                    pendaftar
                  </div>
                </div>
                <Icon name="chevron_right" size={18} className="text-pg-ink-300 shrink-0" />
              </Link>
            );
          })
        )}
      </div>
    </main>
  );
}
