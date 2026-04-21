import { Suspense } from "react";
import { setRequestLocale } from "next-intl/server";
import CallbackClient from "./CallbackClient";

export const dynamic = "force-dynamic";

export default async function AuthCallbackPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main className="min-h-screen bg-[var(--color-dtg-cream)] text-[var(--color-dtg-ink)]">
      <Suspense fallback={<Pending />}>
        <CallbackClient />
      </Suspense>
    </main>
  );
}

function Pending() {
  return (
    <div className="mx-auto max-w-[560px] px-6 py-24">
      <p className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.12em] opacity-60">
        Memverifikasi tautan…
      </p>
    </div>
  );
}
