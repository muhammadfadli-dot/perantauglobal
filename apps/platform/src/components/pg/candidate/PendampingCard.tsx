import { Icon } from "@/components/pg/Icon";

/**
 * PendampingCard — message from the candidate's PIC/recruiter.
 *
 * Currently displays a placeholder canned message (no admin-message backend
 * yet — see Phase 7 for `pic_messages` table). Used in S3 (diproses) Beranda
 * state.
 */
export function PendampingCard({
  name = "Tim Perantau Global",
  initials = "PG",
  msg,
  time,
  whatsappHref,
}: {
  name?: string;
  initials?: string;
  msg: string;
  time?: string;
  whatsappHref?: string;
}) {
  return (
    <div
      className="rounded-[14px] p-3.5 bg-pg-white"
      style={{
        border: "1px solid var(--pg-ink-100)",
        boxShadow:
          "0 1px 2px rgba(20,16,12,0.04), 0 8px 24px rgba(20,16,12,0.06)",
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-10 h-10 rounded-full grid place-items-center text-white text-[13px] font-extrabold tracking-[-0.01em] shrink-0"
          style={{
            background:
              "linear-gradient(135deg, var(--pg-ink-700) 0%, var(--pg-ink-900) 100%)",
          }}
        >
          {initials}
        </div>
        <div className="flex flex-col gap-1 flex-1 min-w-0">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-[13.5px] font-extrabold tracking-[-0.01em] text-pg-ink-900">
              {name}
            </span>
            {time && (
              <span className="font-mono text-[10.5px] text-pg-ink-500 tracking-[0.02em] shrink-0">
                {time}
              </span>
            )}
          </div>
          <p
            className="text-[13px] text-pg-ink-700 leading-snug m-0"
            style={{ fontStyle: "italic" }}
          >
            &ldquo;{msg}&rdquo;
          </p>
          {whatsappHref && (
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 mt-2 px-3 py-2 rounded-[10px] font-bold text-[12px] no-underline self-start"
              style={{
                background: "var(--pg-ink-50)",
                color: "var(--pg-ink-900)",
              }}
            >
              <span
                aria-hidden
                className="inline-block w-2 h-2 rounded-full"
                style={{ background: "#25D366" }}
              />
              Chat WhatsApp
              <Icon name="arrow_right" size={12} stroke={2.4} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
