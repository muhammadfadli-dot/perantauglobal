import { Icon } from "./Icon";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://app.perantauglobal.com";

export function ExistingUserShortcut({ positionSlug }: { positionSlug: string }) {
  return (
    <a
      href={`${APP_URL}/applications/new?position=${positionSlug}`}
      className="block bg-pg-ink-50 border border-pg-ink-100 rounded-2xl p-4 no-underline text-pg-ink-900 hover:border-pg-ink-200"
    >
      <div className="flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-[10px] grid place-items-center shrink-0"
          style={{ background: "var(--pg-ink-100)", color: "var(--pg-ink-700)" }}
        >
          <Icon name="user" size={18} stroke={2} />
        </div>
        <div className="flex-1">
          <div className="text-sm font-bold">Sudah punya akun?</div>
          <div className="text-[12px] text-pg-ink-500 mt-0.5">
            Langsung apply via Talent Hub — skip form bio.
          </div>
        </div>
        <Icon name="arrow_right" size={18} className="text-pg-ink-400" />
      </div>
    </a>
  );
}
