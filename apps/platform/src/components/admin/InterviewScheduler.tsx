"use client";

import { useState, useTransition } from "react";
import { scheduleInterview } from "@/app/(admin)/admin/actions";
import { Icon } from "@/components/pg/Icon";

const PLATFORMS = [
  { value: "whatsapp", label: "WhatsApp" },
  { value: "zoom", label: "Zoom" },
  { value: "google_meet", label: "Google Meet" },
  { value: "phone", label: "Telepon" },
  { value: "in_person", label: "Tatap muka" },
];

const PLATFORM_LABEL = Object.fromEntries(PLATFORMS.map((p) => [p.value, p.label]));

export type ExistingInterview = {
  scheduled_at: string;
  platform: string;
  meeting_url: string | null;
} | null;

/**
 * Admin: schedule (or reschedule) an interview for one application.
 * The datetime-local is entered in WIB; we tag it +07:00 before sending so the
 * UTC server stores the right instant.
 */
export function InterviewScheduler({
  applicationId,
  candidateName,
  existing,
}: {
  applicationId: string;
  candidateName: string;
  existing: ExistingInterview;
}) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const [scheduledAt, setScheduledAt] = useState("");
  const [platform, setPlatform] = useState("whatsapp");
  const [meetingUrl, setMeetingUrl] = useState("");
  const [candidateNote, setCandidateNote] = useState("");

  function submit() {
    setError(null);
    if (!scheduledAt) {
      setError("Isi tanggal & jam dulu.");
      return;
    }
    start(async () => {
      const res = await scheduleInterview({
        applicationId,
        scheduledAt: `${scheduledAt}:00+07:00`, // WIB
        platform,
        meetingUrl: meetingUrl || undefined,
        candidateNote: candidateNote || undefined,
      });
      if (res.ok) {
        setSaved(true);
        setOpen(false);
      } else {
        setError(res.error);
      }
    });
  }

  const existingLabel = existing
    ? new Date(existing.scheduled_at).toLocaleString("id-ID", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Jakarta",
      })
    : null;

  return (
    <div
      className="rounded-xl p-3.5 flex flex-col gap-2.5"
      style={{ border: "1px solid var(--pg-border)", background: "var(--pg-white)" }}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[13px] font-bold text-pg-ink-primary">{candidateName}</span>
        {(existing || saved) && !open ? (
          <span
            className="text-[11px] font-semibold inline-flex items-center gap-1"
            style={{ color: "var(--pg-ok-soft-fg)" }}
          >
            <Icon name="check" size={12} />
            {saved && !existingLabel ? "Terjadwal" : `${existingLabel} WIB · ${PLATFORM_LABEL[existing!.platform] ?? existing!.platform}`}
          </span>
        ) : null}
      </div>

      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="self-start inline-flex items-center gap-1.5 text-[12px] font-bold text-pg-red-600"
        >
          <Icon name="clock" size={13} />
          {existing || saved ? "Ubah jadwal" : "Jadwalkan wawancara"}
        </button>
      ) : (
        <div className="flex flex-col gap-2">
          <label className="flex flex-col gap-1">
            <span className="text-[10px] font-bold uppercase tracking-wide text-pg-ink-tertiary">
              Tanggal & jam (WIB)
            </span>
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              className="rounded-lg px-2.5 py-2 text-[13px]"
              style={{ border: "1.5px solid var(--pg-border)" }}
            />
          </label>
          <div className="grid grid-cols-2 gap-2">
            <label className="flex flex-col gap-1">
              <span className="text-[10px] font-bold uppercase tracking-wide text-pg-ink-tertiary">
                Lewat
              </span>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="rounded-lg px-2.5 py-2 text-[13px]"
                style={{ border: "1.5px solid var(--pg-border)" }}
              >
                {PLATFORMS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-[10px] font-bold uppercase tracking-wide text-pg-ink-tertiary">
                Link (opsional)
              </span>
              <input
                type="url"
                value={meetingUrl}
                onChange={(e) => setMeetingUrl(e.target.value)}
                placeholder="https://…"
                className="rounded-lg px-2.5 py-2 text-[13px]"
                style={{ border: "1.5px solid var(--pg-border)" }}
              />
            </label>
          </div>
          <label className="flex flex-col gap-1">
            <span className="text-[10px] font-bold uppercase tracking-wide text-pg-ink-tertiary">
              Catatan buat kandidat (opsional)
            </span>
            <input
              type="text"
              value={candidateNote}
              onChange={(e) => setCandidateNote(e.target.value)}
              placeholder="mis. Siapin KTP & paspor asli"
              className="rounded-lg px-2.5 py-2 text-[13px]"
              style={{ border: "1.5px solid var(--pg-border)" }}
            />
          </label>
          {error && <p className="text-[12px] text-pg-err">{error}</p>}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={submit}
              disabled={pending}
              className="inline-flex items-center gap-1.5 min-h-[36px] px-3 rounded-lg text-[12px] font-bold text-white disabled:opacity-50"
              style={{ background: "var(--pg-red-600)" }}
            >
              {pending ? "Menyimpan…" : "Simpan jadwal"}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-[12px] font-semibold text-pg-ink-tertiary"
            >
              Batal
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
