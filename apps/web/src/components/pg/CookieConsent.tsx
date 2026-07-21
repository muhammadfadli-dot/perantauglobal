"use client";

import { useState, useSyncExternalStore } from "react";
import {
  subscribeConsent,
  hasDecidedConsent,
  hasDecidedConsentServer,
  writeConsent,
} from "@/lib/consent-mode";

/**
 * Cookie consent banner (UU PDP 27/2022).
 *
 * Deliberate choices:
 * - "Terima" and "Tolak" are the SAME visual weight. A refusal that is harder to
 *   find than an acceptance is not freely given consent, which would put us back
 *   where we started.
 * - There is no X / dismiss. Closing without choosing is not a decision, and
 *   treating silence as acceptance is exactly the implied-consent pattern this
 *   work removed from the forms.
 * - Granular toggles are one tap away rather than buried, so someone can allow
 *   measurement without allowing ad personalisation.
 * - Renders only after mount. The saved choice lives in localStorage, which the
 *   server cannot see, so rendering during SSR would mismatch on hydration.
 *
 * Strictly necessary cookies (session, security) are not offered as a choice
 * because the site cannot function without them and they are not used for
 * tracking. That distinction is stated in the copy rather than implied.
 */
export function CookieConsent() {
  const decided = useSyncExternalStore(
    subscribeConsent,
    hasDecidedConsent,
    hasDecidedConsentServer,
  );
  const [showDetail, setShowDetail] = useState(false);
  const [analytics, setAnalytics] = useState(true);
  const [ads, setAds] = useState(true);

  if (decided) return null;

  // writeConsent notifies the store, which re-renders this straight to null.
  const decide = (a: boolean, d: boolean) => writeConsent(a, d);

  return (
    <div
      role="dialog"
      aria-label="Pilihan cookie"
      aria-live="polite"
      className="fixed inset-x-0 bottom-0 z-[100] p-3 sm:p-4"
    >
      <div className="mx-auto max-w-3xl rounded-2xl border border-pg-ink-200 bg-pg-white shadow-[0_10px_40px_rgba(0,0,0,0.18)] p-4 sm:p-5">
        <div className="text-[14px] font-bold text-pg-ink-900">
          Kami pakai cookie
        </div>
        <p className="mt-1.5 text-[13px] leading-relaxed text-pg-ink-600">
          Selain cookie yang memang dibutuhkan supaya situs jalan, kami ingin memakai
          cookie untuk mengukur kunjungan dan mengukur efektivitas iklan. Ini pilihan
          kamu, dan situs tetap berfungsi penuh kalau kamu menolak. Detailnya ada di{" "}
          <a
            href="/privacy"
            target="_blank"
            rel="noreferrer"
            className="font-bold text-pg-red-600 no-underline"
          >
            Kebijakan Privasi
          </a>
          .
        </p>

        {showDetail && (
          <div className="mt-3.5 grid gap-2.5 border-t border-pg-ink-100 pt-3.5">
            <ToggleRow
              checked
              disabled
              label="Diperlukan"
              hint="Menjaga sesi dan keamanan. Tidak bisa dimatikan karena situs butuh ini."
              onChange={() => {}}
            />
            <ToggleRow
              checked={analytics}
              label="Pengukuran kunjungan"
              hint="Google Analytics. Membantu kami tahu halaman mana yang berguna."
              onChange={setAnalytics}
            />
            <ToggleRow
              checked={ads}
              label="Pengukuran iklan"
              hint="Meta Pixel. Mengukur iklan mana yang membawa pelamar."
              onChange={setAds}
            />
          </div>
        )}

        <div className="mt-4 flex flex-col sm:flex-row gap-2">
          <button
            type="button"
            onClick={() => (showDetail ? decide(analytics, ads) : decide(true, true))}
            className="min-h-[46px] flex-1 rounded-xl bg-pg-red-600 px-4 text-[14px] font-bold text-white"
          >
            {showDetail ? "Simpan pilihan" : "Terima semua"}
          </button>
          <button
            type="button"
            onClick={() => decide(false, false)}
            className="min-h-[46px] flex-1 rounded-xl border-[1.5px] border-pg-ink-200 px-4 text-[14px] font-bold text-pg-ink-900"
          >
            Hanya yang diperlukan
          </button>
        </div>

        {!showDetail && (
          <button
            type="button"
            onClick={() => setShowDetail(true)}
            className="mt-2.5 w-full text-[12.5px] font-bold text-pg-ink-500 underline"
          >
            Atur sendiri
          </button>
        )}
      </div>
    </div>
  );
}

function ToggleRow({
  checked,
  disabled,
  label,
  hint,
  onChange,
}: {
  checked: boolean;
  disabled?: boolean;
  label: string;
  hint: string;
  onChange: (v: boolean) => void;
}) {
  return (
    <label
      className={`flex items-start gap-2.5 ${disabled ? "opacity-60" : "cursor-pointer"}`}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--pg-red-600)]"
      />
      <span className="min-w-0">
        <span className="block text-[13px] font-bold text-pg-ink-900">{label}</span>
        <span className="block text-[12px] leading-snug text-pg-ink-500">{hint}</span>
      </span>
    </label>
  );
}
