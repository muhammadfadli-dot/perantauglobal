"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

type Status =
  | { kind: "pending" }
  | { kind: "success" }
  | { kind: "error"; message: string };

export default function ConfirmClient() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>({ kind: "pending" });

  useEffect(() => {
    (async () => {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (!url || !key) {
        setStatus({ kind: "error", message: "Konfigurasi auth tidak lengkap." });
        return;
      }

      const hash = window.location.hash.startsWith("#")
        ? window.location.hash.slice(1)
        : "";
      const params = new URLSearchParams(hash);

      const errorDesc = params.get("error_description") || params.get("error");
      if (errorDesc) {
        setStatus({ kind: "error", message: decodeURIComponent(errorDesc) });
        return;
      }

      const accessToken = params.get("access_token");
      const refreshToken = params.get("refresh_token");

      if (!accessToken || !refreshToken) {
        setStatus({
          kind: "error",
          message:
            "Tautan verifikasi tidak valid atau sudah kedaluwarsa. Silakan daftar ulang.",
        });
        return;
      }

      const supabase = createBrowserClient(url, key);
      const { error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      if (error) {
        setStatus({ kind: "error", message: error.message });
        return;
      }

      // Strip hash from URL history before redirect so tokens don't linger
      window.history.replaceState(null, "", window.location.pathname);
      setStatus({ kind: "success" });
      router.replace("/dashboard");
    })();
  }, [router]);

  if (status.kind === "pending") {
    return (
      <div className="border border-[var(--color-dtg-ink)] bg-white p-6">
        <p className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.12em] opacity-60">
          Verifikasi
        </p>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-2xl leading-[1.15]">
          Menghubungkan kamu ke portal...
        </h1>
        <p className="mt-3 text-sm leading-[1.5] opacity-70">
          Sebentar ya, kita sedang memverifikasi tautan dari email kamu.
        </p>
      </div>
    );
  }

  if (status.kind === "success") {
    return (
      <div className="border border-[var(--color-dtg-ink)] bg-white p-6">
        <p className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.12em] opacity-60">
          Berhasil
        </p>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-2xl leading-[1.15]">
          Kamu sudah masuk.
        </h1>
        <p className="mt-3 text-sm leading-[1.5] opacity-70">
          Mengalihkan ke dashboard...
        </p>
      </div>
    );
  }

  return (
    <div className="border border-[var(--color-dtg-ink)] bg-white p-6">
      <p className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.12em] opacity-60">
        Gagal
      </p>
      <h1 className="mt-3 font-[family-name:var(--font-display)] text-2xl leading-[1.15]">
        Verifikasi gagal.
      </h1>
      <p className="mt-3 text-sm leading-[1.5] opacity-70">{status.message}</p>
      <a
        href="/auth/sign-in"
        className="mt-4 inline-block border border-[var(--color-dtg-ink)] px-4 py-2 text-sm hover:bg-[var(--color-dtg-ink)] hover:text-white"
      >
        Kirim tautan baru
      </a>
    </div>
  );
}
