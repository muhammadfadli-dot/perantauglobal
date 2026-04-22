import type { Metadata } from "next";
import ConfirmClient from "./ConfirmClient";

export const metadata: Metadata = {
  title: "Memverifikasi — Perantau Global",
  robots: { index: false, follow: false },
};

/**
 * Cross-subdomain magic-link landing page.
 *
 * Flow:
 * - User submits form on www.perantauglobal.com → signInWithOtp (implicit)
 * - Supabase emails link with `redirectTo=https://app.perantauglobal.com/auth/confirm`
 * - User clicks → lands here with tokens in URL hash fragment:
 *     #access_token=...&refresh_token=...&type=magiclink&expires_in=...
 * - ConfirmClient parses hash → setSession(cookies) → redirect to /dashboard
 *
 * This is separate from /auth/callback which handles PKCE `?code=` exchange
 * for native platform sign-in (via /auth/sign-in).
 */
export default function ConfirmPage() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-[560px] flex-col justify-center px-6 py-16">
      <ConfirmClient />
    </main>
  );
}
