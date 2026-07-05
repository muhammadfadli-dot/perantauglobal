"use client";

import { useEffect, useMemo, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createBrowserClient } from "@perantauglobal/db";
import {
  PERSONA_META,
  PERSONAS,
  SECTOR_META,
  SECTORS,
  type Persona,
  type Sector,
} from "@/lib/cek-kesiapan";

interface Row {
  id: string;
  name: string;
  persona: Persona;
  sector_interest: Sector | null;
  created_at: string;
}

interface Snapshot {
  total: number;
  persona: Record<Persona, number>;
  sector: Record<Sector, number>;
  recent: Row[];
}

// Happy + on-brand: Pemimpi = campus blue, Penjajak = gold, Siap = emerald.
const ACCENT: Record<Persona, string> = {
  pemimpi: "#1d5fd8",
  penjajak: "#e0a72b",
  siap: "#10b981",
};
const SOFT: Record<Persona, string> = {
  pemimpi: "#e9f1ff",
  penjajak: "#fdf4e0",
  siap: "#e6f9f0",
};
const PG_RED = "#d7262f";
const INK = "#1a1a1a";

const EMPTY: Snapshot = {
  total: 0,
  persona: { pemimpi: 0, penjajak: 0, siap: 0 },
  sector: { hospitality: 0, healthcare: 0, unsure: 0 },
  recent: [],
};

const CARD_SHADOW = "0 6px 24px rgba(20,20,20,0.07)";

export function LiveDashboard({
  url,
  anonKey,
  sessionKey,
}: {
  url: string;
  anonKey: string;
  sessionKey: string;
}) {
  const [snap, setSnap] = useState<Snapshot>(EMPTY);
  const [live, setLive] = useState(false);
  const configured = Boolean(url && anonKey);

  const client = useMemo<SupabaseClient | null>(() => {
    if (!configured) return null;
    return createBrowserClient(url, anonKey) as unknown as SupabaseClient;
  }, [url, anonKey, configured]);

  useEffect(() => {
    if (!client) return;
    let mounted = true;
    let reloadTimer: ReturnType<typeof setTimeout> | null = null;

    const load = async () => {
      const { data, error } = await client
        .from("readiness_responses")
        .select("id,name,persona,sector_interest,created_at")
        .eq("session_key", sessionKey)
        .order("created_at", { ascending: false })
        .limit(500);
      if (!mounted || error || !data) return;
      const rows = data as Row[];
      const next: Snapshot = {
        total: rows.length,
        persona: { pemimpi: 0, penjajak: 0, siap: 0 },
        sector: { hospitality: 0, healthcare: 0, unsure: 0 },
        recent: rows.slice(0, 16),
      };
      for (const r of rows) {
        if (r.persona in next.persona) next.persona[r.persona] += 1;
        if (r.sector_interest && r.sector_interest in next.sector) {
          next.sector[r.sector_interest] += 1;
        }
      }
      setSnap(next);
    };

    const scheduleLoad = () => {
      if (reloadTimer) clearTimeout(reloadTimer);
      reloadTimer = setTimeout(load, 250);
    };

    void load();

    const channel = client
      .channel(`readiness-${sessionKey}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "readiness_responses",
          filter: `session_key=eq.${sessionKey}`,
        },
        () => scheduleLoad(),
      )
      .subscribe((status) => {
        if (mounted) setLive(status === "SUBSCRIBED");
      });

    // Polling fallback: keeps the board correct even if the socket drops.
    const poll = setInterval(load, 5000);

    return () => {
      mounted = false;
      if (reloadTimer) clearTimeout(reloadTimer);
      clearInterval(poll);
      void client.removeChannel(channel);
    };
  }, [client, sessionKey]);

  const maxPersona = Math.max(1, ...PERSONAS.map((p) => snap.persona[p]));

  if (!configured) {
    return (
      <main className="grid min-h-screen place-items-center" style={{ background: "#f6efe0", color: INK }}>
        <p className="px-6 text-center text-lg opacity-80">
          Dashboard belum terkonfigurasi (env Supabase tidak ditemukan).
        </p>
      </main>
    );
  }

  return (
    <main
      className="min-h-screen w-full"
      style={{ background: "linear-gradient(180deg,#ffffff 0%,#fbf5e9 100%)", color: INK }}
    >
      <div className="mx-auto max-w-6xl px-6 py-8 md:px-10 md:py-12">
        {/* header */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-xs font-bold uppercase tracking-[0.18em]" style={{ color: PG_RED }}>
              Work · Travel · Repeat — Live
            </p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight md:text-5xl" style={{ color: INK }}>
              Analisa Kesiapan Merantau
            </h1>
          </div>
          <div
            className="rounded-3xl px-6 py-3 text-right"
            style={{ background: "#fff", boxShadow: CARD_SHADOW }}
          >
            <div className="text-5xl font-extrabold leading-none md:text-6xl" style={{ color: PG_RED }}>
              {snap.total}
            </div>
            <div className="mt-1 flex items-center justify-end gap-2 text-xs font-semibold uppercase tracking-widest" style={{ color: "#8a8a8a" }}>
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ background: live ? "#10b981" : "#c9c9c9" }}
              />
              {live ? "live" : "menyambung"} · peserta
            </div>
          </div>
        </div>

        {/* persona columns */}
        <div className="mt-9 grid grid-cols-1 gap-5 md:grid-cols-3">
          {PERSONAS.map((p) => {
            const count = snap.persona[p];
            const pct = snap.total ? Math.round((count / snap.total) * 100) : 0;
            const accent = ACCENT[p];
            return (
              <div
                key={p}
                className="overflow-hidden rounded-3xl"
                style={{ background: "#fff", boxShadow: CARD_SHADOW }}
              >
                <div style={{ height: 6, background: accent }} />
                <div className="p-6">
                  <div className="flex items-baseline justify-between">
                    <span className="text-lg font-extrabold" style={{ color: accent }}>
                      {PERSONA_META[p].label}
                    </span>
                    <span className="text-sm font-semibold" style={{ color: "#9a9a9a" }}>
                      {pct}%
                    </span>
                  </div>
                  <div className="mt-1 text-6xl font-extrabold md:text-7xl" style={{ color: INK }}>
                    {count}
                  </div>
                  <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full" style={{ background: SOFT[p] }}>
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${(count / maxPersona) * 100}%`, background: accent }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* sectors + recent */}
        <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="rounded-3xl p-6" style={{ background: "#fff", boxShadow: CARD_SHADOW }}>
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "#9a9a9a" }}>
              Sektor yang diminati
            </p>
            <div className="mt-4 space-y-3">
              {SECTORS.map((s, i) => {
                const count = snap.sector[s];
                const pct = snap.total ? Math.round((count / snap.total) * 100) : 0;
                const barColor = [PG_RED, "#1d5fd8", "#e0a72b"][i];
                return (
                  <div key={s}>
                    <div className="flex items-center justify-between text-sm font-medium">
                      <span style={{ color: INK }}>{SECTOR_META[s].label}</span>
                      <span style={{ color: "#9a9a9a" }}>
                        {count} · {pct}%
                      </span>
                    </div>
                    <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full" style={{ background: "#f1ece1" }}>
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, background: barColor }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-3xl p-6" style={{ background: "#fff", boxShadow: CARD_SHADOW }}>
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "#9a9a9a" }}>
              Baru gabung
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {snap.recent.length === 0 && (
                <span className="text-sm" style={{ color: "#b0b0b0" }}>
                  Menunggu peserta pertama...
                </span>
              )}
              {snap.recent.map((r) => (
                <span
                  key={r.id}
                  className="rounded-full px-3 py-1.5 text-sm font-semibold"
                  style={{ background: SOFT[r.persona], color: ACCENT[r.persona] }}
                >
                  {r.name}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* join prompt */}
        <div
          className="mt-8 rounded-3xl px-6 py-6 text-center"
          style={{ background: "#fff", boxShadow: CARD_SHADOW }}
        >
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "#9a9a9a" }}>
            Ikut analisa sekarang
          </p>
          <p className="mt-1 text-2xl font-extrabold md:text-3xl" style={{ color: PG_RED }}>
            perantauglobal.com/cek-kesiapan
          </p>
        </div>
      </div>
    </main>
  );
}
