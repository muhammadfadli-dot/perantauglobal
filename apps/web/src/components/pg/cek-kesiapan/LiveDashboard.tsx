"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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

const PERSONA_ACCENT: Record<Persona, string> = {
  siap: "#10b981", // emerald
  penjajak: "#f59e0b", // amber
  pemimpi: "#38bdf8", // sky
};

const EMPTY: Snapshot = {
  total: 0,
  persona: { pemimpi: 0, penjajak: 0, siap: 0 },
  sector: { hospitality: 0, healthcare: 0, unsure: 0 },
  recent: [],
};

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

  const snapRef = useRef(snap);
  snapRef.current = snap;

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
        recent: rows.slice(0, 14),
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
      <main className="grid min-h-screen place-items-center" style={{ background: "#0f0f0f", color: "#fff" }}>
        <p className="px-6 text-center text-lg opacity-80">
          Dashboard belum terkonfigurasi (env Supabase tidak ditemukan).
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen w-full" style={{ background: "#0f0f0f", color: "#f6efe0" }}>
      <div className="mx-auto max-w-6xl px-6 py-8 md:px-10 md:py-10">
        {/* header */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em]" style={{ color: "#d7262f" }}>
              Work. Travel. Repeat. · Live
            </p>
            <h1 className="mt-1 text-3xl font-extrabold md:text-5xl">Analisa Kesiapan Merantau</h1>
          </div>
          <div className="text-right">
            <div className="text-5xl font-extrabold leading-none md:text-7xl">{snap.total}</div>
            <div className="mt-1 flex items-center justify-end gap-2 text-xs uppercase tracking-widest opacity-70">
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ background: live ? "#10b981" : "#9ca3af" }}
              />
              {live ? "live" : "menyambung"} · total peserta
            </div>
          </div>
        </div>

        {/* persona columns */}
        <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-3">
          {PERSONAS.map((p) => {
            const count = snap.persona[p];
            const pct = snap.total ? Math.round((count / snap.total) * 100) : 0;
            const accent = PERSONA_ACCENT[p];
            return (
              <div
                key={p}
                className="rounded-2xl border p-6"
                style={{ borderColor: "#262626", background: "#161616" }}
              >
                <div className="flex items-baseline justify-between">
                  <span className="text-lg font-bold" style={{ color: accent }}>
                    {PERSONA_META[p].label}
                  </span>
                  <span className="text-sm opacity-60">{pct}%</span>
                </div>
                <div className="mt-2 text-6xl font-extrabold md:text-7xl">{count}</div>
                <div className="mt-4 h-2 w-full overflow-hidden rounded-full" style={{ background: "#2a2a2a" }}>
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${(count / maxPersona) * 100}%`, background: accent }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* sectors + recent */}
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="rounded-2xl border p-6" style={{ borderColor: "#262626", background: "#161616" }}>
            <p className="text-xs font-bold uppercase tracking-widest opacity-60">Sektor yang diminati</p>
            <div className="mt-4 space-y-3">
              {SECTORS.map((s) => {
                const count = snap.sector[s];
                const pct = snap.total ? Math.round((count / snap.total) * 100) : 0;
                return (
                  <div key={s}>
                    <div className="flex items-center justify-between text-sm">
                      <span>{SECTOR_META[s].label}</span>
                      <span className="opacity-60">
                        {count} · {pct}%
                      </span>
                    </div>
                    <div className="mt-1 h-2 w-full overflow-hidden rounded-full" style={{ background: "#2a2a2a" }}>
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, background: "#d7262f" }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border p-6" style={{ borderColor: "#262626", background: "#161616" }}>
            <p className="text-xs font-bold uppercase tracking-widest opacity-60">Baru gabung</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {snap.recent.length === 0 && (
                <span className="text-sm opacity-50">Menunggu peserta pertama...</span>
              )}
              {snap.recent.map((r) => (
                <span
                  key={r.id}
                  className="rounded-full px-3 py-1.5 text-sm font-medium"
                  style={{ background: "#222", color: PERSONA_ACCENT[r.persona] }}
                >
                  {r.name}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* join prompt */}
        <div className="mt-10 text-center">
          <p className="text-sm uppercase tracking-widest opacity-60">Ikut analisa sekarang</p>
          <p className="mt-1 text-2xl font-extrabold md:text-3xl">perantauglobal.com/cek-kesiapan</p>
        </div>
      </div>
    </main>
  );
}
