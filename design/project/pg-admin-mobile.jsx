/* Perantau Global — Admin CRM · Mobile versions */

// Mobile admin shell — dark top bar + bottom tab + FAB
const AdminMShell = ({ active = "home", title, children, hideBottom = false }) => (
  <div style={{
    height: "100%", width: "100%",
    background: "var(--pg-paper)",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    display: "flex", flexDirection: "column",
    position: "relative", overflow: "hidden",
  }}>
    {/* Top bar */}
    <div style={{
      background: "var(--pg-ink-900)", color: "#fff",
      padding: "16px 18px 14px",
      display: "flex", alignItems: "center", gap: 12, flexShrink: 0,
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: 8,
        background: "var(--pg-red-600)", color: "#fff",
        display: "grid", placeItems: "center",
        fontWeight: 800, fontSize: 14, letterSpacing: "-0.02em",
      }}>P</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 10, color: "rgba(255,255,255,.55)", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }}>CRM · Recruiter</div>
        <div style={{ fontSize: 14, fontWeight: 700 }}>{title}</div>
      </div>
      <div style={{
        width: 34, height: 34, borderRadius: 99,
        background: "rgba(255,255,255,.12)", display: "grid", placeItems: "center",
      }}>
        <Icon name="bell" size={16} color="#fff"/>
      </div>
    </div>

    {/* Content */}
    <div style={{ flex: 1, overflowY: "auto", paddingBottom: hideBottom ? 0 : 72 }}>
      {children}
    </div>

    {/* Bottom tab */}
    {!hideBottom && (
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        background: "#fff", borderTop: "1px solid var(--pg-ink-100)",
        display: "flex", padding: "6px 0 10px",
      }}>
        {[
          { k: "home", l: "Beranda", ic: "home" },
          { k: "jo", l: "Job Orders", ic: "briefcase" },
          { k: "cand", l: "Kandidat", ic: "users" },
          { k: "doc", l: "Review", ic: "doc_check", badge: 7 },
          { k: "me", l: "Saya", ic: "user" },
        ].map((t) => (
          <div key={t.k} style={{
            flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2, padding: "8px 0",
            color: t.k === active ? "var(--pg-red-600)" : "var(--pg-ink-500)",
            position: "relative",
          }}>
            <div style={{ position: "relative" }}>
              <Icon name={t.ic} size={20} stroke={t.k === active ? 2.2 : 1.8}/>
              {t.badge && (
                <div style={{
                  position: "absolute", top: -4, right: -8,
                  minWidth: 16, height: 16, padding: "0 4px",
                  borderRadius: 99, background: "var(--pg-red-600)", color: "#fff",
                  fontSize: 10, fontWeight: 800,
                  display: "grid", placeItems: "center",
                }}>{t.badge}</div>
              )}
            </div>
            <div style={{ fontSize: 10, fontWeight: t.k === active ? 700 : 500 }}>{t.l}</div>
          </div>
        ))}
      </div>
    )}
  </div>
);

// ─── Overview
const AdminMOverview = () => (
  <AdminMShell active="home" title="Beranda">
    <div style={{ padding: "18px 18px 14px" }}>
      <div className="pg-eyebrow">Selasa, 27 April</div>
      <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em", marginTop: 4 }}>Halo, Maya.</div>
      <div style={{ fontSize: 13, color: "var(--pg-ink-500)", marginTop: 2 }}>12 hal perlu kamu selesaikan hari ini.</div>
    </div>

    {/* Today callouts */}
    <div style={{ padding: "0 18px", display: "flex", flexDirection: "column", gap: 8 }}>
      {[
        { ic: "doc_check", t: "7 dokumen menunggu review", d: "tertua: 2 hari lalu", color: "var(--pg-warn)", bg: "var(--pg-warn-bg)" },
        { ic: "phone", t: "3 wawancara hari ini", d: "13:00 · 15:00 · 16:30", color: "var(--pg-red-600)", bg: "var(--pg-red-50)" },
        { ic: "sparkle_dot", t: "2 JO butuh lebih banyak kandidat", d: "RS Riyadh, Caregiver Taiwan", color: "var(--pg-ink-900)", bg: "var(--pg-ink-50)" },
      ].map((a, i) => (
        <div key={i} style={{
          background: a.bg, borderRadius: 12, padding: "14px 14px",
          display: "flex", alignItems: "center", gap: 12,
        }}>
          <div style={{
            width: 38, height: 38, borderRadius: 9, flexShrink: 0,
            background: a.color, color: "#fff",
            display: "grid", placeItems: "center",
          }}><Icon name={a.ic} size={18}/></div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--pg-ink-900)" }}>{a.t}</div>
            <div style={{ fontSize: 12, color: "var(--pg-ink-700)", marginTop: 2 }}>{a.d}</div>
          </div>
          <Icon name="chevron_right" size={16} color="var(--pg-ink-500)"/>
        </div>
      ))}
    </div>

    {/* KPIs */}
    <div style={{ padding: "24px 18px 10px" }}>
      <div className="pg-eyebrow">Minggu ini</div>
    </div>
    <div style={{ padding: "0 18px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
      {[
        { l: "Kandidat baru", v: "34", d: "+12% wk" },
        { l: "Terkirim ke employer", v: "18", d: "+4" },
        { l: "Lolos seleksi", v: "6", d: "67% rate" },
        { l: "Berangkat bulan ini", v: "9", d: "target 12" },
      ].map((k, i) => (
        <div key={i} style={{
          background: "#fff", border: "1px solid var(--pg-ink-100)",
          borderRadius: 12, padding: 14,
        }}>
          <div style={{ fontSize: 11, color: "var(--pg-ink-500)", fontWeight: 600 }}>{k.l}</div>
          <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.02em", marginTop: 4 }}>{k.v}</div>
          <div style={{ fontSize: 11, color: "var(--pg-ink-500)", marginTop: 2 }}>{k.d}</div>
        </div>
      ))}
    </div>

    {/* Active pipelines */}
    <div style={{ padding: "24px 18px 10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div>
        <div className="pg-eyebrow">Pipeline aktif</div>
        <div style={{ fontSize: 15, fontWeight: 700, marginTop: 4 }}>5 job order berjalan</div>
      </div>
      <div style={{ fontSize: 13, color: "var(--pg-red-600)", fontWeight: 700 }}>Lihat semua</div>
    </div>
    <div style={{ padding: "0 18px 20px", display: "flex", flexDirection: "column", gap: 8 }}>
      {[
        { r: "Perawat · RS Riyadh", c: 24, t: 30, stage: "Wawancara" },
        { r: "Caregiver · Taiwan", c: 18, t: 40, stage: "Screening" },
        { r: "Barista · Dammam", c: 12, t: 15, stage: "Dokumen" },
      ].map((p, i) => (
        <div key={i} style={{ background: "#fff", border: "1px solid var(--pg-ink-100)", borderRadius: 12, padding: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ fontSize: 14, fontWeight: 700, flex: 1, paddingRight: 8 }}>{p.r}</div>
            <Badge variant="warn">{p.stage}</Badge>
          </div>
          <div style={{ fontSize: 11, color: "var(--pg-ink-500)", marginTop: 8, display: "flex", justifyContent: "space-between" }}>
            <span>{p.c} / {p.t} kandidat</span>
            <span style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{Math.round(p.c / p.t * 100)}%</span>
          </div>
          <div style={{ height: 4, background: "var(--pg-ink-100)", borderRadius: 99, marginTop: 6 }}>
            <div style={{ width: `${p.c / p.t * 100}%`, height: "100%", background: "var(--pg-red-600)", borderRadius: 99 }}/>
          </div>
        </div>
      ))}
    </div>
  </AdminMShell>
);

// ─── Job Orders list
const AdminMJobOrders = () => (
  <AdminMShell active="jo" title="Job Orders">
    {/* Filter chips */}
    <div style={{ padding: "14px 18px 10px", display: "flex", gap: 6, overflowX: "auto" }}>
      {["Semua (5)", "Aktif (3)", "Dihold (1)", "Tutup (1)"].map((c, i) => (
        <div key={c} className={`pg-chip ${i === 0 ? "pg-chip--active" : ""}`} style={{ flexShrink: 0, fontSize: 12 }}>{c}</div>
      ))}
    </div>

    {/* Search */}
    <div style={{ padding: "0 18px 14px" }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "10px 14px", background: "#fff",
        border: "1px solid var(--pg-ink-100)", borderRadius: 10,
      }}>
        <Icon name="search" size={16} color="var(--pg-ink-500)"/>
        <div style={{ fontSize: 13, color: "var(--pg-ink-400)" }}>Cari posisi, employer, negara…</div>
      </div>
    </div>

    {/* JO list */}
    <div style={{ padding: "0 18px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
      {[
        { r: "Perawat IGD", e: "RS Riyadh Medical Center", c: "Saudi Arabia", s: "SAR 3.200", n: 30, filled: 24, deadline: "15 Mei", status: "Aktif" },
        { r: "Caregiver lansia", e: "HCM Taiwan Agency", c: "Taiwan", s: "TWD 23.000", n: 40, filled: 18, deadline: "30 Mei", status: "Aktif" },
        { r: "Barista", e: "Coffee Saudi Co.", c: "Saudi Arabia", s: "SAR 2.000", n: 15, filled: 12, deadline: "10 Mei", status: "Aktif" },
        { r: "Waitress", e: "Al-Hayat Restaurant", c: "Saudi Arabia", s: "SAR 1.800", n: 20, filled: 0, deadline: "—", status: "Dihold" },
        { r: "Kitchen staff", e: "Dubai Hotels Group", c: "UAE", s: "AED 2.500", n: 10, filled: 10, deadline: "Ditutup 15 Mar", status: "Tutup" },
      ].map((j, i) => (
        <div key={i} style={{ background: "#fff", border: "1px solid var(--pg-ink-100)", borderRadius: 12, padding: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--pg-ink-500)", letterSpacing: "0.04em" }}>{j.c}</div>
              <div style={{ fontSize: 16, fontWeight: 800, letterSpacing: "-0.015em", marginTop: 2 }}>{j.r}</div>
              <div style={{ fontSize: 12, color: "var(--pg-ink-500)", marginTop: 2 }}>{j.e}</div>
            </div>
            <Badge variant={j.status === "Aktif" ? "ok" : j.status === "Dihold" ? "warn" : "mute"}>{j.status}</Badge>
          </div>

          <div style={{ display: "flex", gap: 16, marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--pg-ink-100)", fontSize: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={{ color: "var(--pg-ink-500)" }}>Gaji</div>
              <div style={{ fontWeight: 700, marginTop: 2 }}>{j.s}</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ color: "var(--pg-ink-500)" }}>Progress</div>
              <div style={{ fontWeight: 700, marginTop: 2 }}>{j.filled}/{j.n}</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ color: "var(--pg-ink-500)" }}>Deadline</div>
              <div style={{ fontWeight: 700, marginTop: 2 }}>{j.deadline}</div>
            </div>
          </div>
        </div>
      ))}

      <button className="pg-btn pg-btn--ghost pg-btn--block" style={{ marginTop: 6 }}>
        <Icon name="plus" size={16}/> Buat job order baru
      </button>
    </div>

    {/* FAB */}
    <div style={{
      position: "absolute", bottom: 88, right: 18,
      width: 56, height: 56, borderRadius: 99,
      background: "var(--pg-red-600)", color: "#fff",
      display: "grid", placeItems: "center",
      boxShadow: "0 8px 24px rgba(215,38,47,.35)",
    }}>
      <Icon name="plus" size={24} stroke={2.6}/>
    </div>
  </AdminMShell>
);

// ─── Pipeline kanban (mobile — single stage, swipeable)
const AdminMKanban = () => {
  const stages = [
    { k: "apply", l: "Lamar", n: 42 },
    { k: "screen", l: "Screening", n: 18, active: true },
    { k: "interv", l: "Wawancara", n: 6 },
    { k: "doc", l: "Dokumen", n: 3 },
    { k: "ready", l: "Siap", n: 1 },
  ];
  return (
    <AdminMShell active="jo" title="Perawat · RS Riyadh">
      {/* Stage tabs — horizontal scrollable */}
      <div style={{
        borderBottom: "1px solid var(--pg-ink-100)",
        background: "#fff", padding: "8px 12px",
        display: "flex", gap: 4, overflowX: "auto",
      }}>
        {stages.map((s) => (
          <div key={s.k} style={{
            padding: "10px 14px", borderRadius: 8,
            background: s.active ? "var(--pg-ink-900)" : "transparent",
            color: s.active ? "#fff" : "var(--pg-ink-700)",
            fontSize: 12, fontWeight: 700,
            display: "flex", alignItems: "center", gap: 6, flexShrink: 0,
          }}>
            {s.l}
            <span style={{
              fontSize: 10, padding: "2px 6px", borderRadius: 99,
              background: s.active ? "rgba(255,255,255,.2)" : "var(--pg-ink-100)",
              color: s.active ? "#fff" : "var(--pg-ink-700)",
              fontFamily: "'IBM Plex Mono', monospace",
            }}>{s.n}</span>
          </div>
        ))}
      </div>

      {/* Stage header */}
      <div style={{ padding: "16px 18px 8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div className="pg-eyebrow">Tahap · Screening</div>
          <div style={{ fontSize: 17, fontWeight: 800, letterSpacing: "-0.015em", marginTop: 2 }}>18 kandidat</div>
        </div>
        <div style={{ fontSize: 12, color: "var(--pg-ink-500)", display: "flex", alignItems: "center", gap: 4 }}>
          <Icon name="sort" size={14}/> Match ↓
        </div>
      </div>

      {/* Cards */}
      <div style={{ padding: "4px 18px 20px", display: "flex", flexDirection: "column", gap: 8 }}>
        {[
          { n: "Budi Santoso", a: 32, x: "4 th IGD", m: 91, t: "Platinum" },
          { n: "Ayu Kartika", a: 28, x: "3 th umum", m: 84, t: "Gold" },
          { n: "Dewi Lestari", a: 35, x: "6 th rawat inap", m: 82, t: "Gold" },
          { n: "Rahmat Hidayat", a: 29, x: "2 th IGD", m: 78, t: "Silver" },
          { n: "Sari Indah", a: 31, x: "5 th bedah", m: 74, t: "Silver" },
          { n: "Fajar Pratama", a: 27, x: "1.5 th ICU", m: 68 },
        ].map((c, i) => (
          <div key={i} style={{ background: "#fff", border: "1px solid var(--pg-ink-100)", borderRadius: 12, padding: 12, display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 42, height: 42, borderRadius: 99,
              background: "var(--pg-ink-900)", color: "#fff",
              display: "grid", placeItems: "center",
              fontWeight: 700, fontSize: 14, flexShrink: 0,
            }}>{c.n.split(" ").map(x => x[0]).slice(0, 2).join("")}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: "-0.01em" }}>{c.n}</div>
                {c.t && <div style={{
                  fontSize: 9, fontWeight: 800, letterSpacing: "0.04em", textTransform: "uppercase",
                  padding: "2px 6px", borderRadius: 4,
                  background: c.t === "Platinum" ? "var(--pg-ink-900)" : c.t === "Gold" ? "#E8B84A" : "var(--pg-ink-300)",
                  color: c.t === "Silver" ? "var(--pg-ink-900)" : "#fff",
                }}>{c.t}</div>}
              </div>
              <div style={{ fontSize: 12, color: "var(--pg-ink-500)", marginTop: 2 }}>{c.a} th · {c.x}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: c.m > 80 ? "var(--pg-ok)" : c.m > 65 ? "var(--pg-warn)" : "var(--pg-ink-500)", fontFamily: "'IBM Plex Mono', monospace" }}>{c.m}</div>
              <div style={{ fontSize: 9, color: "var(--pg-ink-500)", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>match</div>
            </div>
          </div>
        ))}
      </div>
    </AdminMShell>
  );
};

// ─── Doc review (mobile — single doc viewer)
const AdminMDocReview = () => (
  <AdminMShell active="doc" title="Review dokumen" hideBottom>
    {/* Progress in queue */}
    <div style={{ padding: "14px 18px", background: "#fff", borderBottom: "1px solid var(--pg-ink-100)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12, color: "var(--pg-ink-500)", marginBottom: 6 }}>
        <span>Antrian review</span>
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: 700 }}>3 / 7</span>
      </div>
      <div style={{ height: 3, background: "var(--pg-ink-100)", borderRadius: 99 }}>
        <div style={{ width: "42%", height: "100%", background: "var(--pg-red-600)", borderRadius: 99 }}/>
      </div>
    </div>

    {/* Candidate summary */}
    <div style={{ padding: "16px 18px 14px", display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{
        width: 44, height: 44, borderRadius: 99,
        background: "var(--pg-ink-900)", color: "#fff",
        display: "grid", placeItems: "center",
        fontWeight: 700, fontSize: 15,
      }}>BS</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 15, fontWeight: 700 }}>Budi Santoso</div>
        <div style={{ fontSize: 12, color: "var(--pg-ink-500)" }}>Perawat · RS Riyadh · dilamar 12 Apr</div>
      </div>
    </div>

    {/* Doc preview */}
    <div style={{ padding: "0 18px" }}>
      <div className="pg-eyebrow">Dokumen · Ijazah D3</div>
      <div style={{
        marginTop: 10, padding: 22,
        background: "#fff", border: "1px solid var(--pg-ink-100)",
        borderRadius: 12, minHeight: 260,
        display: "flex", flexDirection: "column",
      }}>
        {/* Fake doc */}
        <div style={{ padding: 16, border: "1px solid var(--pg-ink-200)", borderRadius: 8, background: "#fafafa", flex: 1 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: "var(--pg-ink-500)", letterSpacing: "0.1em" }}>REPUBLIK INDONESIA</div>
            <div style={{ fontSize: 13, fontWeight: 700, marginTop: 4 }}>POLITEKNIK KESEHATAN BANDUNG</div>
            <div style={{ fontSize: 10, color: "var(--pg-ink-500)" }}>Nomor: 234/IJZ/PKB/2019</div>
          </div>
          <div style={{ borderTop: "1px solid var(--pg-ink-200)", margin: "12px 0" }}/>
          <div style={{ fontSize: 11, lineHeight: 1.7, color: "var(--pg-ink-700)" }}>
            Dengan ini menerangkan bahwa<br/>
            <b style={{ color: "var(--pg-ink-900)" }}>Budi Santoso</b><br/>
            Lahir 12 Maret 1992<br/>
            Lulus Diploma III Keperawatan<br/>
            Pada tanggal 18 Juli 2019
          </div>
        </div>

        <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
          <button className="pg-btn pg-btn--ghost" style={{ flex: 1, minHeight: 38, fontSize: 12 }}>
            <Icon name="zoom" size={14}/> Perbesar
          </button>
          <button className="pg-btn pg-btn--ghost" style={{ flex: 1, minHeight: 38, fontSize: 12 }}>
            <Icon name="download" size={14}/> Download
          </button>
        </div>
      </div>
    </div>

    {/* Auto-check */}
    <div style={{ padding: "18px 18px 0" }}>
      <div className="pg-eyebrow">Auto-check</div>
      <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
        {[
          ["Nama sesuai KTP", true],
          ["Tanggal lahir cocok", true],
          ["Institusi valid (cross-check MTKI)", true],
          ["Tanggal kelulusan logis", true],
        ].map(([l, ok]) => (
          <div key={l} style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "10px 12px", background: ok ? "var(--pg-ok-bg)" : "var(--pg-warn-bg)",
            borderRadius: 8, fontSize: 13,
          }}>
            <Icon name="check" size={14} color="var(--pg-ok)" stroke={3}/>
            <span style={{ color: "var(--pg-ink-700)", flex: 1 }}>{l}</span>
          </div>
        ))}
      </div>
    </div>

    {/* Action buttons — sticky */}
    <div style={{
      position: "sticky", bottom: 0, marginTop: 18,
      background: "#fff", borderTop: "1px solid var(--pg-ink-100)",
      padding: "14px 18px",
      display: "flex", gap: 10,
    }}>
      <button className="pg-btn pg-btn--ghost" style={{ flex: 1, minHeight: 46, fontSize: 14 }}>
        <Icon name="x" size={15} stroke={2.4}/> Tolak
      </button>
      <button className="pg-btn pg-btn--primary" style={{ flex: 2, minHeight: 46, fontSize: 14 }}>
        <Icon name="check" size={15} stroke={2.6}/> Setujui
      </button>
    </div>
  </AdminMShell>
);

// ─── Tier assignment (mobile)
const AdminMTier = () => (
  <AdminMShell active="cand" title="Assign tier" hideBottom>
    {/* Candidate card */}
    <div style={{ padding: "18px 18px 14px", background: "#fff", borderBottom: "1px solid var(--pg-ink-100)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{
          width: 56, height: 56, borderRadius: 99,
          background: "var(--pg-ink-900)", color: "#fff",
          display: "grid", placeItems: "center",
          fontSize: 18, fontWeight: 800,
        }}>BS</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 17, fontWeight: 800, letterSpacing: "-0.015em" }}>Budi Santoso</div>
          <div style={{ fontSize: 12, color: "var(--pg-ink-500)" }}>Perawat · 32 th · 4 th IGD</div>
          <div style={{ fontSize: 12, color: "var(--pg-ink-500)", marginTop: 2 }}>Bandung, Jawa Barat</div>
        </div>
      </div>

      {/* Scores */}
      <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
        {[
          ["Match", "91", "var(--pg-ok)"],
          ["Dokumen", "5/5", "var(--pg-ok)"],
          ["Wawancara", "—", "var(--pg-ink-500)"],
        ].map(([l, v, c]) => (
          <div key={l} style={{ padding: "10px 8px", background: "var(--pg-ink-50)", borderRadius: 8, textAlign: "center" }}>
            <div style={{ fontSize: 10, color: "var(--pg-ink-500)", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>{l}</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: c, fontFamily: "'IBM Plex Mono', monospace", marginTop: 2 }}>{v}</div>
          </div>
        ))}
      </div>
    </div>

    {/* Current tier */}
    <div style={{ padding: "18px 18px 10px" }}>
      <div className="pg-eyebrow">Tier saat ini</div>
      <div style={{ marginTop: 8, padding: "10px 14px", background: "#fff", border: "1px solid var(--pg-ink-100)", borderRadius: 10, display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 8, height: 8, borderRadius: 99, background: "#E8B84A" }}/>
        <div style={{ fontSize: 14, fontWeight: 700 }}>Gold</div>
        <div style={{ fontSize: 12, color: "var(--pg-ink-500)", marginLeft: "auto" }}>Ditetapkan sistem 2 hari lalu</div>
      </div>
    </div>

    {/* Tier options */}
    <div style={{ padding: "10px 18px 14px" }}>
      <div className="pg-eyebrow" style={{ marginBottom: 8 }}>Ubah menjadi</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {[
          { t: "Platinum", d: "Top 10%. Prioritas tertinggi.", c: "var(--pg-ink-900)", sel: true },
          { t: "Gold", d: "Top 30%. Kandidat kuat.", c: "#E8B84A" },
          { t: "Silver", d: "Middle tier. Perlu 1 tahap tambahan.", c: "var(--pg-ink-400)" },
          { t: "Bronze", d: "Entry level. Training diperlukan.", c: "#B87838" },
        ].map((t) => (
          <div key={t.t} style={{
            padding: "14px 14px",
            background: "#fff",
            border: t.sel ? "2px solid var(--pg-red-600)" : "1px solid var(--pg-ink-100)",
            borderRadius: 12,
            display: "flex", alignItems: "center", gap: 12,
          }}>
            <div style={{ width: 10, height: 10, borderRadius: 99, background: t.c, flexShrink: 0 }}/>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 700 }}>{t.t}</div>
              <div style={{ fontSize: 12, color: "var(--pg-ink-500)", marginTop: 2 }}>{t.d}</div>
            </div>
            <div style={{
              width: 22, height: 22, borderRadius: 99,
              border: `2px solid ${t.sel ? "var(--pg-red-600)" : "var(--pg-ink-200)"}`,
              background: t.sel ? "var(--pg-red-600)" : "#fff",
              display: "grid", placeItems: "center",
            }}>
              {t.sel && <Icon name="check" size={11} stroke={3.5} color="#fff"/>}
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Reason */}
    <div style={{ padding: "0 18px 18px" }}>
      <div className="pg-eyebrow" style={{ marginBottom: 8 }}>Alasan (opsional)</div>
      <div style={{
        padding: "12px 14px", background: "#fff",
        border: "1px solid var(--pg-ink-100)", borderRadius: 10,
        fontSize: 13, color: "var(--pg-ink-700)", minHeight: 72,
      }}>
        Spesialisasi IGD 4 tahun, dokumen lengkap, komunikasi Bahasa Inggris baik.
      </div>
    </div>

    {/* Sticky save */}
    <div style={{
      position: "sticky", bottom: 0,
      background: "#fff", borderTop: "1px solid var(--pg-ink-100)",
      padding: "14px 18px",
    }}>
      <button className="pg-btn pg-btn--primary pg-btn--block" style={{ minHeight: 48, fontSize: 14 }}>
        <Icon name="check" size={16} stroke={2.6}/> Simpan & pindah ke Wawancara
      </button>
    </div>
  </AdminMShell>
);

// ─── Create JO (mobile)
const AdminMJOCreate = () => (
  <AdminMShell active="jo" title="Buat job order" hideBottom>
    {/* Stepper */}
    <div style={{ padding: "14px 18px", background: "#fff", borderBottom: "1px solid var(--pg-ink-100)", display: "flex", gap: 6 }}>
      {["Dasar", "Syarat", "Pertanyaan", "Publish"].map((s, i) => (
        <div key={s} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <div style={{ height: 3, width: "100%", background: i <= 2 ? "var(--pg-red-600)" : "var(--pg-ink-100)", borderRadius: 99 }}/>
          <div style={{ fontSize: 11, color: i === 2 ? "var(--pg-red-600)" : i < 2 ? "var(--pg-ink-700)" : "var(--pg-ink-400)", fontWeight: i === 2 ? 700 : 500 }}>
            {s}
          </div>
        </div>
      ))}
    </div>

    <div style={{ padding: "20px 18px 10px" }}>
      <div className="pg-eyebrow">Langkah 3 dari 4</div>
      <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em", margin: "6px 0 6px" }}>
        Pertanyaan tambahan.
      </h2>
      <p style={{ fontSize: 13, color: "var(--pg-ink-500)", margin: 0 }}>
        Tambahkan pertanyaan spesifik untuk posisi ini. Skor bisa diset per opsi.
      </p>
    </div>

    {/* Question 1 */}
    <div style={{ padding: "14px 18px 10px" }}>
      <div style={{
        background: "#fff", border: "1px solid var(--pg-ink-100)",
        borderRadius: 12, padding: 14,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--pg-ink-500)" }}>PERTANYAAN 1 · Pilihan ganda</div>
          <div style={{ display: "flex", gap: 8 }}>
            <Icon name="edit" size={14} color="var(--pg-ink-500)"/>
            <Icon name="trash" size={14} color="var(--pg-ink-500)"/>
          </div>
        </div>
        <div style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.4 }}>
          Berapa lama pengalaman di IGD?
        </div>
        <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 6 }}>
          {[
            ["Belum pernah", 0],
            ["< 1 tahun", 5],
            ["1–3 tahun", 15],
            ["> 3 tahun", 25],
          ].map(([o, s]) => (
            <div key={o} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "10px 12px", background: "var(--pg-ink-50)",
              borderRadius: 8, fontSize: 13,
            }}>
              <span>{o}</span>
              <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: 700, color: s > 10 ? "var(--pg-ok)" : "var(--pg-ink-500)" }}>+{s} pts</span>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Question 2 */}
    <div style={{ padding: "0 18px 10px" }}>
      <div style={{
        background: "#fff", border: "1px solid var(--pg-ink-100)",
        borderRadius: 12, padding: 14,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--pg-ink-500)" }}>PERTANYAAN 2 · Yes / No</div>
          <div style={{ display: "flex", gap: 8 }}>
            <Icon name="edit" size={14} color="var(--pg-ink-500)"/>
            <Icon name="trash" size={14} color="var(--pg-ink-500)"/>
          </div>
        </div>
        <div style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.4 }}>
          Bersedia shift malam?
        </div>
        <div style={{ marginTop: 10, fontSize: 11, color: "var(--pg-red-600)", fontWeight: 700 }}>
          ⚠ Wajib · jawaban "tidak" auto-reject
        </div>
      </div>
    </div>

    {/* Add question */}
    <div style={{ padding: "0 18px 20px" }}>
      <button className="pg-btn pg-btn--ghost pg-btn--block" style={{ minHeight: 46 }}>
        <Icon name="plus" size={16}/> Tambah pertanyaan
      </button>
    </div>

    {/* Sticky nav */}
    <div style={{
      position: "sticky", bottom: 0,
      background: "#fff", borderTop: "1px solid var(--pg-ink-100)",
      padding: "12px 18px",
      display: "flex", gap: 8,
    }}>
      <button className="pg-btn pg-btn--ghost" style={{ flex: 1, minHeight: 46, fontSize: 14 }}>Kembali</button>
      <button className="pg-btn pg-btn--primary" style={{ flex: 2, minHeight: 46, fontSize: 14 }}>Lanjut ke Publish →</button>
    </div>
  </AdminMShell>
);

// ─── Candidate detail (mobile)
const AdminMCandidateDetail = () => (
  <AdminMShell active="cand" title="Kandidat" hideBottom>
    {/* Header */}
    <div style={{ padding: "18px 18px 14px", background: "#fff", borderBottom: "1px solid var(--pg-ink-100)" }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
        <div style={{
          width: 60, height: 60, borderRadius: 99,
          background: "var(--pg-ink-900)", color: "#fff",
          display: "grid", placeItems: "center",
          fontSize: 20, fontWeight: 800,
          flexShrink: 0,
        }}>BS</div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.015em" }}>Budi Santoso</div>
            <div style={{
              fontSize: 9, fontWeight: 800, letterSpacing: "0.04em", textTransform: "uppercase",
              padding: "2px 6px", borderRadius: 4,
              background: "#E8B84A", color: "#fff",
            }}>Gold</div>
          </div>
          <div style={{ fontSize: 12, color: "var(--pg-ink-500)", marginTop: 2 }}>Perawat · 32 th · Bandung</div>
          <div style={{ fontSize: 11, color: "var(--pg-ink-400)", marginTop: 2, fontFamily: "'IBM Plex Mono', monospace" }}>PG-KAND-8412</div>
        </div>
      </div>

      {/* Active app */}
      <div style={{
        marginTop: 14, padding: "10px 12px",
        background: "var(--pg-red-50)", border: "1px solid var(--pg-red-200)",
        borderRadius: 10,
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <div style={{ width: 6, height: 6, borderRadius: 99, background: "var(--pg-red-600)" }}/>
        <div style={{ flex: 1, fontSize: 12 }}>
          <b>Perawat · RS Riyadh</b> · tahap wawancara
        </div>
        <Icon name="chevron_right" size={14} color="var(--pg-red-600)"/>
      </div>
    </div>

    {/* Tabs */}
    <div style={{
      background: "#fff", padding: "4px 18px 0",
      borderBottom: "1px solid var(--pg-ink-100)",
      display: "flex", gap: 18,
    }}>
      {["Ringkasan", "Dokumen", "Notes", "Log"].map((t, i) => (
        <div key={t} style={{
          padding: "12px 0",
          fontSize: 13, fontWeight: i === 0 ? 700 : 500,
          color: i === 0 ? "var(--pg-ink-900)" : "var(--pg-ink-500)",
          borderBottom: i === 0 ? "2px solid var(--pg-red-600)" : "2px solid transparent",
        }}>{t}</div>
      ))}
    </div>

    {/* Scores bar */}
    <div style={{ padding: "18px 18px 10px" }}>
      <div className="pg-eyebrow">Skor</div>
      <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {[
          ["Match score", "91/100", "var(--pg-ok)"],
          ["Jawaban pertanyaan", "85/100", "var(--pg-ok)"],
          ["Dokumen", "5/5", "var(--pg-ok)"],
          ["Wawancara", "—", "var(--pg-ink-500)"],
        ].map(([l, v, c]) => (
          <div key={l} style={{ padding: "12px 12px", background: "#fff", border: "1px solid var(--pg-ink-100)", borderRadius: 10 }}>
            <div style={{ fontSize: 11, color: "var(--pg-ink-500)", fontWeight: 600 }}>{l}</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: c, fontFamily: "'IBM Plex Mono', monospace", marginTop: 2 }}>{v}</div>
          </div>
        ))}
      </div>
    </div>

    {/* Profile */}
    <div style={{ padding: "14px 18px 10px" }}>
      <div className="pg-eyebrow">Profil</div>
      <div style={{
        marginTop: 10, background: "#fff",
        border: "1px solid var(--pg-ink-100)", borderRadius: 12,
        padding: 14,
      }}>
        {[
          ["Pendidikan", "D3 Keperawatan · Poltekkes Bandung 2019"],
          ["Pengalaman", "4 th · RS Hasan Sadikin (IGD)"],
          ["Sertifikasi", "STR aktif · BLS 2024"],
          ["Bahasa", "Inggris B1 · Arab dasar"],
          ["Kontak", "+62 812-3456-7890"],
        ].map(([l, v]) => (
          <div key={l} style={{
            display: "flex", justifyContent: "space-between", padding: "8px 0",
            borderBottom: "1px solid var(--pg-ink-100)",
            fontSize: 13,
          }}>
            <span style={{ color: "var(--pg-ink-500)" }}>{l}</span>
            <span style={{ fontWeight: 600, textAlign: "right", flex: 1, marginLeft: 12 }}>{v}</span>
          </div>
        ))}
      </div>
    </div>

    {/* Actions sticky */}
    <div style={{
      position: "sticky", bottom: 0,
      background: "#fff", borderTop: "1px solid var(--pg-ink-100)",
      padding: "12px 18px",
      display: "flex", gap: 8,
    }}>
      <button className="pg-btn pg-btn--ghost" style={{ flex: 1, minHeight: 46, fontSize: 13 }}>
        <Icon name="phone" size={15}/> WA
      </button>
      <button className="pg-btn pg-btn--dark" style={{ flex: 2, minHeight: 46, fontSize: 13 }}>
        <Icon name="arrow_right" size={15}/> Pindah tahap
      </button>
    </div>
  </AdminMShell>
);

Object.assign(window, {
  AdminMOverview, AdminMJobOrders, AdminMKanban,
  AdminMDocReview, AdminMTier, AdminMJOCreate, AdminMCandidateDetail,
});
