import Link from "next/link";
import { Icon } from "@/components/pg/Icon";
import EventForm from "./EventForm";

export const dynamic = "force-dynamic";

export default function NewEventPage() {
  return (
    <main className="p-6 lg:p-10 max-w-3xl">
      <Link
        href="/admin/events"
        className="inline-flex items-center gap-1 text-[12px] font-bold tracking-wide uppercase text-pg-ink-500 hover:text-pg-red-600 no-underline"
      >
        <Icon name="arrow_left" size={14} /> Event
      </Link>

      <div className="mt-6">
        <div className="text-[12px] font-bold tracking-[0.12em] uppercase text-pg-red-600">
          Buat event
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mt-1.5">
          Event baru.
        </h1>
        <p className="text-base text-pg-ink-700 mt-2 leading-relaxed">
          Setelah disimpan dengan status <code className="font-mono text-[13px]">published</code>,
          landing page-nya live di www <code className="font-mono text-[13px]">/event/[slug]</code> dan
          orang bisa mulai daftar. Lead-nya ke-track lengkap dengan sumber iklan.
        </p>
      </div>

      <div className="mt-6">
        <EventForm />
      </div>
    </main>
  );
}
