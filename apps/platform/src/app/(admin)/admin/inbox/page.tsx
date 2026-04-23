import Link from "next/link";
import { createServerClient } from "@/lib/supabase-server";
import InboxItem from "./InboxItem";

export const dynamic = "force-dynamic";

type InboxRow = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  status: string;
  notes: string | null;
  created_at: string;
};

export default async function InboxPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const { filter } = await searchParams;
  const filterValue = filter ?? "new";
  const supabase = await createServerClient();

  let query = supabase
    .from("contact_submissions")
    .select("id, name, email, phone, subject, message, status, notes, created_at")
    .order("created_at", { ascending: false });

  if (filterValue !== "all") {
    query = query.eq("status", filterValue);
  }

  const { data, error } = await query;
  if (error) {
    return <main className="p-10"><p className="text-sm text-pg-err">Query gagal: {error.message}</p></main>;
  }
  const rows = (data ?? []) as InboxRow[];

  const [{ count: newCount }, { count: progressCount }, { count: doneCount }] = await Promise.all([
    supabase.from("contact_submissions").select("*", { count: "exact", head: true }).eq("status", "new"),
    supabase.from("contact_submissions").select("*", { count: "exact", head: true }).eq("status", "in_progress"),
    supabase.from("contact_submissions").select("*", { count: "exact", head: true }).eq("status", "done"),
  ]);

  return (
    <main className="p-6 lg:p-10 max-w-6xl">
      <div className="text-[12px] font-bold tracking-[0.12em] uppercase text-pg-red-600">
        Admin / Inbox
      </div>
      <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mt-1.5">
        Pesan dari kontak form
      </h1>
      <p className="text-base text-pg-ink-700 mt-2 leading-relaxed max-w-2xl">
        Pesan yang masuk via <code className="font-mono text-[13px]">/kontak</code> di www. Balas
        manual via email kandidat — kita catat statusnya di sini.
      </p>

      <div className="mt-6 flex gap-2 flex-wrap">
        {[
          { key: "new", label: "Baru", count: newCount ?? 0, variant: "warn" as const },
          { key: "in_progress", label: "Sedang ditangani", count: progressCount ?? 0, variant: "info" as const },
          { key: "done", label: "Selesai", count: doneCount ?? 0, variant: "ok" as const },
          { key: "all", label: "Semua", count: (newCount ?? 0) + (progressCount ?? 0) + (doneCount ?? 0), variant: "mute" as const },
        ].map((c) => {
          const active = filterValue === c.key;
          return (
            <Link
              key={c.key}
              href={`/admin/inbox?filter=${c.key}`}
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
          <div className="bg-pg-white border border-pg-ink-100 rounded-2xl p-8 text-center">
            <div className="text-base font-bold">Tidak ada pesan</div>
            <div className="text-sm text-pg-ink-500 mt-1.5">Inbox kosong di filter ini.</div>
          </div>
        ) : (
          rows.map((r) => (
            <InboxItem
              key={r.id}
              item={{
                id: r.id,
                name: r.name,
                email: r.email,
                phone: r.phone,
                subject: r.subject,
                message: r.message,
                status: (r.status as "new" | "in_progress" | "done") ?? "new",
                notes: r.notes,
                created_at: r.created_at,
              }}
            />
          ))
        )}
      </div>
    </main>
  );
}

