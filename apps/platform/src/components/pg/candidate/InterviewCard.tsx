import { Icon } from "@/components/pg/Icon";

/**
 * Candidate-facing scheduled-interview card (interview_scheduled).
 * Shown on the application detail page when the admin has scheduled a wawancara.
 * Plain, one-glance: big date/time (WIB), how, a join button, and the note the
 * admin left for the candidate.
 */

export type ScheduledInterview = {
  scheduled_at: string;
  platform: string;
  meeting_url: string | null;
  candidate_note: string | null;
  status: string;
};

const PLATFORM_LABEL: Record<string, string> = {
  whatsapp: "WhatsApp",
  zoom: "Zoom",
  google_meet: "Google Meet",
  phone: "Telepon",
  in_person: "Tatap muka",
};

export function InterviewCard({ interview }: { interview: ScheduledInterview }) {
  const when = new Date(interview.scheduled_at);
  const dateStr = when.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  });
  const timeStr = when.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  });
  const platform = PLATFORM_LABEL[interview.platform] ?? interview.platform;

  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-3.5 text-white"
      style={{ background: "var(--pg-ink-900, #1a1a1a)" }}
    >
      <div className="flex items-center gap-2">
        <Icon name="clock" size={16} />
        <span
          className="text-[10px] font-bold tracking-[0.12em] uppercase"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Wawancara dijadwalkan
        </span>
      </div>

      <div>
        <div className="text-[20px] font-extrabold leading-tight">{dateStr}</div>
        <div className="text-[15px] font-bold text-white/85 mt-0.5">
          Jam {timeStr} WIB · via {platform}
        </div>
      </div>

      {interview.candidate_note && (
        <p className="text-[13px] leading-relaxed text-white/80">{interview.candidate_note}</p>
      )}

      {interview.meeting_url && (
        <a
          href={interview.meeting_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-1.5 min-h-[46px] rounded-[12px] font-bold text-[14px] no-underline text-pg-ink-900 bg-pg-white"
        >
          Buka link wawancara
          <Icon name="arrow_right" size={16} stroke={2.4} />
        </a>
      )}

      <p className="text-[11px] text-white/60 leading-snug">
        Simpan jadwal ini. Kalau ada kendala, hubungi Pendamping kamu lewat WhatsApp.
      </p>
    </div>
  );
}
