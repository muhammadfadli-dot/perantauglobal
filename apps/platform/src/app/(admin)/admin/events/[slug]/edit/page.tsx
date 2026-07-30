import Link from "next/link";
import { notFound } from "next/navigation";
import { createServerClient } from "@/lib/supabase-server";
import { Icon } from "@/components/pg/Icon";
import EventForm, { type EventInitial } from "../../new/EventForm";

export const dynamic = "force-dynamic";

type EventRow = {
  slug: string;
  title: string;
  kind: string;
  status: "draft" | "published" | "closed";
  starts_at: string;
  timezone: string;
  platform: string;
  join_url: string | null;
  cover_image: string | null;
  capacity: number | null;
  content: {
    tagline?: string | null;
    intro?: string | null;
    benefits?: string[];
  } | null;
};

// UTC timestamp → "YYYY-MM-DDTHH:mm" wall-clock in the given zone, for <input type=datetime-local>.
function toLocalInput(iso: string, tz: string): string {
  // sv-SE renders "YYYY-MM-DD HH:mm:ss"; swap the space for T and trim to minutes.
  const s = new Date(iso).toLocaleString("sv-SE", { timeZone: tz });
  return s.replace(" ", "T").slice(0, 16);
}

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createServerClient();

  const { data } = await supabase
    .from("events")
    .select(
      "slug, title, kind, status, starts_at, timezone, platform, join_url, cover_image, capacity, content",
    )
    .eq("slug", slug)
    .maybeSingle();

  const ev = data as EventRow | null;
  if (!ev) return notFound();

  const initial: EventInitial = {
    slug: ev.slug,
    title: ev.title,
    kind: ev.kind,
    status: ev.status,
    starts_at_local: toLocalInput(ev.starts_at, ev.timezone),
    timezone: ev.timezone,
    platform: ev.platform,
    join_url: ev.join_url,
    cover_image: ev.cover_image,
    capacity: ev.capacity,
    tagline: ev.content?.tagline ?? null,
    intro: ev.content?.intro ?? null,
    benefits: ev.content?.benefits ?? [],
  };

  return (
    <main className="p-6 lg:p-10 max-w-3xl">
      <Link
        href={`/admin/events/${slug}`}
        className="inline-flex items-center gap-1 text-[12px] font-bold tracking-wide uppercase text-pg-ink-500 hover:text-pg-red-600 no-underline"
      >
        <Icon name="arrow_left" size={14} /> Kembali ke event
      </Link>

      <div className="mt-6">
        <div className="text-[12px] font-bold tracking-[0.12em] uppercase text-pg-red-600">
          Edit event
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mt-1.5">
          {ev.title}
        </h1>
        <p className="text-base text-pg-ink-700 mt-2 leading-relaxed">
          Ubah jadwal, link join, atau konten. Status <code className="font-mono text-[13px]">published</code> = tayang di www.
        </p>
      </div>

      <div className="mt-6">
        <EventForm mode="edit" initial={initial} />
      </div>
    </main>
  );
}
