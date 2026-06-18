"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";

/**
 * Email-verify / magic-link landing.
 *
 * apps/web calls `auth.signUp({ emailRedirectTo: .../auth/callback })`. GoTrue's
 * `/verify` endpoint returns the session as a URL **hash fragment**
 * (`#access_token=...&refresh_token=...`, implicit flow). A server route handler
 * can NEVER read that — browsers don't send the fragment to the server — so the
 * old route.ts always fell through to `?error=missing_code` and dumped the user
 * on the sign-in page without logging them in.
 *
 * This client page reads the fragment, establishes the cookie-based session via
 * the @supabase/ssr browser client, then hands off to a server route for the
 * post-confirm side effects (CompleteRegistration CAPI + CV materialize +
 * fbp/fbc cookies) before routing the user into the portal. Also handles the
 * `?code=` PKCE path for completeness.
 */
export default function AuthCallbackPage() {
  const router = useRouter();
  const ran = useRef(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    // Capture URL bits up front: supabaseBrowser()'s detectSessionInUrl may
    // consume + clear the hash asynchronously once the client initializes.
    const rawHash = window.location.hash.startsWith("#")
      ? window.location.hash.slice(1)
      : "";
    const params = new URLSearchParams(window.location.search);
    const errParam = params.get("error_description") || params.get("error");
    const code = params.get("code");
    const hashParams = new URLSearchParams(rawHash);
    const accessToken = hashParams.get("access_token");
    const refreshToken = hashParams.get("refresh_token");

    (async () => {
      const supabase = supabaseBrowser();

      // A surfaced auth error with no recoverable token → back to sign-in.
      if (errParam && !accessToken && !code) {
        router.replace(`/auth/sign-in?error=${encodeURIComponent(errParam)}`);
        return;
      }

      try {
        if (accessToken && refreshToken) {
          // Implicit flow (the actual signUp-confirm case).
          await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
        } else if (code) {
          // PKCE flow (kept for completeness; not the current signUp path).
          await supabase.auth.exchangeCodeForSession(code);
        }
      } catch {
        // fall through to the session check below
      }

      // Clean tokens out of the address bar regardless of outcome.
      window.history.replaceState(null, "", "/auth/callback");

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setFailed(true);
        setTimeout(() => router.replace("/auth/sign-in?error=verify_failed"), 1800);
        return;
      }

      // Fire post-confirm side effects server-side (session now lives in
      // cookies). Best-effort — never block the redirect on it.
      try {
        await fetch("/api/auth/post-confirm", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ fbp: params.get("fbp"), fbc: params.get("fbc") }),
        });
      } catch {
        // tracking is non-critical
      }

      // Root routes to /dashboard (candidate) or /admin by role.
      router.replace("/");
    })();
  }, [router]);

  return (
    <main className="flex min-h-[100dvh] flex-col items-center justify-center gap-4 px-6 text-center">
      {failed ? (
        <>
          <p className="text-[15px] font-semibold text-pg-ink-900">
            Verifikasi belum selesai
          </p>
          <p className="text-[13px] text-pg-ink-500">
            Sebentar, kami arahkan kamu ke halaman masuk...
          </p>
        </>
      ) : (
        <>
          <div
            className="h-8 w-8 animate-spin rounded-full border-2 border-pg-ink-200 border-t-pg-brand"
            aria-hidden
          />
          <p className="text-[15px] font-semibold text-pg-ink-900">
            Sebentar ya, lagi masuk ke akun kamu...
          </p>
          <p className="text-[13px] text-pg-ink-500">Jangan tutup halaman ini.</p>
        </>
      )}
    </main>
  );
}
