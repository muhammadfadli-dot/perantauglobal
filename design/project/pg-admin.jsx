/* Admin CRM screens — desktop web, red-dominant DTG */

const AdminShell = ({ active = "job-orders", children }) => {
  const nav = [
    { k: "overview", l: "Overview", ic: "home" },
    { k: "job-orders", l: "Job Orders", ic: "briefcase" },
    { k: "positions", l: "Posisi", ic: "sparkle" },
    { k: "candidates", l: "Kandidat", ic: "user" },
    { k: "applications", l: "Lamaran", ic: "doc" },
    { k: "inbox", l: "Inbox", ic: "mail" },
    { k: "analytics", l: "Analytics", ic: "sparkle_dot" },
    { k: "team", l: "Tim", ic: "shield" },
  ];
  return (
    <div style={{
      display: "grid", gridTemplateColumns: "232px 1fr",
      width: "100%", height: "100%", background: "var(--pg-paper)",
      fontFamily: "'Plus Jakarta Sans', sans-serif", color: "var(--pg-ink-900)",
      overflow: "hidden",
    }}>
      {/* Sidebar */}
      <aside style={{
        background: "var(--pg-ink-900)", color: "#fff",
        display: "flex", flexDirection: "column", padding: "20px 14px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 10px 20px" }}>
          <div style={{
            width: 30, height: 30, borderRadius: 8, background: "var(--pg-red-600)",
            display: "grid", placeItems: "center", fontWeight: 800, fontSize: 15,
          }}>P</div>
          <div style={{ fontWeight: 800, fontSize: 15, letterSpacing: "-0.01em" }}>
            Perantau<span style={{ color: "var(--pg-red-500)" }}>Global</span>
            <div style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,.5)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Admin CRM</div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {nav.map((n) => {
            const on = n.k === active;
            return (
              <div key={n.k} style={{
                display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
                borderRadius: 10,
                background: on ? "rgba(255,255,255,.08)" : "transparent",
                color: on ? "#fff" : "rgba(255,255,255,.6)",
                fontSize: 14, fontWeight: on ? 700 : 500, cursor: "pointer",
                position: "relative",
              }}>
                {on && <div style={{ position: "absolute", left: -14, top: 8, bottom: 8, width: 3, background: "var(--pg-red-500)", borderRadius: 99 }}/>}
                <Icon name={n.ic} size={17} stroke={on ? 2.2 : 1.8}/>
                {n.l}
              </div>
            );
          })}
        </div>
        <div style={{ flex: 1 }}/>
        <div style={{
          padding: "12px", borderRadius: 12, background: "rgba(255,255,255,.05)",
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <div style={{
            width: 34, height: 34, borderRadius: 99, background: "var(--pg-red-600)",
            display: "grid", placeItems: "center", fontWeight: 800, fontSize: 13,
          }}>PA</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700 }}>Panji A.</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,.5)" }}>Super admin</div>
          </div>
        </div>
      </aside>

      <main style={{ overflow: "auto" }}>
        {children}
      </main>
    </div>
  );
};

const AdminTopBar = ({ title, subtitle, primary, secondary }) => (
  <div style={{
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "20px 32px", borderBottom: "1px solid var(--pg-ink-100)",
    background: "var(--pg-white)",
  }}>
    <div>
      <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.02em" }}>{title}</div>
      {subtitle && <div style={{ fontSize: 13, color: "var(--pg-ink-500)", marginTop: 2 }}>{subtitle}</div>}
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      {secondary && <button className="pg-btn pg-btn--ghost" style={{ minHeight: 40, padding: "0 14px", fontSize: 14 }}>{secondary}</button>}
      {primary && <button className="pg-btn pg-btn--primary" style={{ minHeight: 40, padding: "0 16px", fontSize: 14 }}>
        <Icon name="plus" size={16} stroke={2.4}/> {primary}
      </button>}
    </div>
  </div>
);

// ─── 1. Overview
const AdminOverview = () => (
  <AdminShell active="overview">
    <AdminTopBar title="Overview" subtitle="Senin, 27 April 2026" secondary="Export laporan"/>
    <div style={{ padding: "24px 32px" }}>
      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
        {[
          { l: "Kandidat aktif", v: "342", d: "+28 minggu ini", up: true },
          { l: "Lamaran masuk", v: "87", d: "12 butuh review", up: null, warn: true },
          { l: "Dokumen pending", v: "23", d: "verifikasi tertunda", up: null, warn: true },
          { l: "Job order buka", v: "1", d: "Perawat · Batch Juni", up: null },
        ].map((s) => (
          <div key={s.l} style={{
            background: "var(--pg-white)", border: "1px solid var(--pg-ink-100)",
            borderRadius: 14, padding: "18px 20px",
          }}>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--pg-ink-400)" }}>
              {s.l}
            </div>
            <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-0.02em", marginTop: 6 }}>{s.v}</div>
            <div style={{ fontSize: 12, color: s.warn ? "var(--pg-warn)" : "var(--pg-ink-500)", marginTop: 4, fontWeight: 600 }}>
              {s.d}
            </div>
          </div>
        ))}
      </div>

      {/* Funnel + Activity */}
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16, marginTop: 20 }}>
        {/* Funnel */}
        <div style={{ background: "var(--pg-white)", border: "1px solid var(--pg-ink-100)", borderRadius: 14, padding: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: "-0.01em" }}>Funnel 30 hari</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 18 }}>
            {[
              { l: "Kunjungi www", v: 4820, w: "100%" },
              { l: "Daftar / magic link", v: 612, w: "62%" },
              { l: "Profil lengkap", v: 284, w: "42%" },
              { l: "Lamar posisi", v: 127, w: "26%" },
              { l: "Wawancara", v: 38, w: "10%" },
              { l: "Diterima", v: 6, w: "3%" },
            ].map((f, i) => (
              <div key={f.l} style={{ display: "grid", gridTemplateColumns: "160px 1fr 60px", alignItems: "center", gap: 12 }}>
                <div style={{ fontSize: 13, color: "var(--pg-ink-700)", fontWeight: 600 }}>{f.l}</div>
                <div style={{ height: 26, background: "var(--pg-ink-50)", borderRadius: 6, overflow: "hidden", position: "relative" }}>
                  <div style={{
                    height: "100%", width: f.w,
                    background: `linear-gradient(90deg, var(--pg-red-600), var(--pg-red-500))`,
                    borderRadius: 6,
                  }}/>
                  <div style={{ position: "absolute", left: 10, top: 0, bottom: 0, display: "flex", alignItems: "center", color: "#fff", fontSize: 12, fontWeight: 700 }}>
                    {f.l === "Kunjungi www" || f.l === "Daftar / magic link" ? f.w : ""}
                  </div>
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, textAlign: "right", fontFamily: "'IBM Plex Mono', monospace" }}>{f.v.toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Activity */}
        <div style={{ background: "var(--pg-white)", border: "1px solid var(--pg-ink-100)", borderRadius: 14, padding: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: "-0.01em" }}>Aktivitas terakhir</div>
          <div style={{ display: "flex", flexDirection: "column", marginTop: 12 }}>
            {[
              { ic: "doc", t: "Dewi S. upload passport", at: "2 mnt lalu", c: "var(--pg-info)" },
              { ic: "briefcase", t: "Budi S. lamar Perawat S.Arabia", at: "14 mnt", c: "var(--pg-red-600)" },
              { ic: "check", t: "Siti A. stage → wawancara", at: "1 jam", c: "var(--pg-ok)" },
              { ic: "mail", t: "Kontak baru — Ahmad (Surabaya)", at: "3 jam", c: "var(--pg-ink-700)" },
              { ic: "user", t: "Rahma daftar via magic link", at: "5 jam", c: "var(--pg-ink-700)" },
            ].map((a, i) => (
              <div key={i} style={{ display: "flex", gap: 12, padding: "10px 0", borderTop: i ? "1px solid var(--pg-ink-100)" : 0 }}>
                <div style={{
                  width: 30, height: 30, borderRadius: 8, background: "var(--pg-ink-50)",
                  color: a.c, display: "grid", placeItems: "center", flexShrink: 0,
                }}><Icon name={a.ic} size={15} stroke={2}/></div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{a.t}</div>
                  <div style={{ fontSize: 11, color: "var(--pg-ink-400)", marginTop: 2 }}>{a.at}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </AdminShell>
);

// ─── 2. Job orders list
const AdminJobOrders = () => (
  <AdminShell active="job-orders">
    <AdminTopBar title="Job Orders" subtitle="Instance konkret dari posisi — employer + slot + batch" primary="Job order baru"/>

    {/* Filter toolbar */}
    <div style={{ padding: "16px 32px 0", display: "flex", gap: 8, alignItems: "center" }}>
      <div style={{ display: "flex", gap: 6 }}>
        {["Semua · 4", "Buka · 1", "Tutup · 2", "Draft · 1"].map((t, i) => (
          <div key={t} className={`pg-chip ${i === 1 ? "pg-chip--active" : ""}`} style={{ height: 34, fontSize: 13 }}>{t}</div>
        ))}
      </div>
      <div style={{ flex: 1 }}/>
      <div style={{
        display: "flex", alignItems: "center", gap: 8, padding: "0 14px",
        height: 36, borderRadius: 99, border: "1.5px solid var(--pg-ink-200)",
        background: "var(--pg-white)", minWidth: 240, color: "var(--pg-ink-400)",
      }}>
        <Icon name="search" size={16}/>
        <span style={{ fontSize: 13 }}>Cari employer / posisi…</span>
      </div>
    </div>

    <div style={{ padding: "16px 32px" }}>
      <div style={{
        background: "var(--pg-white)", border: "1px solid var(--pg-ink-100)",
        borderRadius: 14, overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{
          display: "grid", gridTemplateColumns: "2fr 1.6fr 1fr 1.2fr 1fr 120px",
          padding: "14px 20px", fontSize: 12, fontWeight: 700, letterSpacing: "0.08em",
          textTransform: "uppercase", color: "var(--pg-ink-400)",
          borderBottom: "1px solid var(--pg-ink-100)", background: "var(--pg-ink-50)",
        }}>
          <div>Posisi · Employer</div>
          <div>Intake</div>
          <div>Slot</div>
          <div>Deadline</div>
          <div>Status</div>
          <div>Aksi</div>
        </div>
        {[
          { role: "Perawat", country: "Saudi Arabia", emp: "RS di Riyadh", batch: "Batch Juni 2026", fill: 3, total: 12, dl: "30 Jun 2026", st: "open" },
          { role: "Barista", country: "Saudi Arabia", emp: "Cafe Chain SA", batch: "Batch Okt 2025", fill: 8, total: 8, dl: "15 Sep 2025", st: "filled" },
          { role: "Caregiver", country: "Taiwan", emp: "HHA Kaohsiung", batch: "Batch Mei 2026", fill: 4, total: 6, dl: "20 Apr 2026", st: "closed" },
          { role: "Waitress", country: "Saudi Arabia", emp: "Restoran Madinah", batch: "TBD", fill: 0, total: 0, dl: "—", st: "draft" },
        ].map((r, i) => {
          const stMap = {
            open: { v: "ok", l: "Lagi buka" },
            filled: { v: "mute", l: "Terisi penuh" },
            closed: { v: "mute", l: "Ditutup" },
            draft: { v: "warn", l: "Draft" },
          }[r.st];
          return (
            <div key={i} style={{
              display: "grid", gridTemplateColumns: "2fr 1.6fr 1fr 1.2fr 1fr 120px",
              alignItems: "center", padding: "16px 20px",
              borderTop: i ? "1px solid var(--pg-ink-100)" : 0,
            }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{r.role} · {r.country}</div>
                <div style={{ fontSize: 12, color: "var(--pg-ink-500)", marginTop: 2 }}>{r.emp}</div>
              </div>
              <div style={{ fontSize: 13, color: "var(--pg-ink-700)" }}>{r.batch}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, fontWeight: 700 }}>
                  {r.fill}/{r.total || "—"}
                </div>
                {r.total > 0 && (
                  <div style={{ width: 50, height: 6, background: "var(--pg-ink-100)", borderRadius: 99 }}>
                    <div style={{ width: `${(r.fill / r.total) * 100}%`, height: "100%", background: r.fill === r.total ? "var(--pg-ink-400)" : "var(--pg-red-600)", borderRadius: 99 }}/>
                  </div>
                )}
              </div>
              <div style={{ fontSize: 13, color: "var(--pg-ink-700)" }}>{r.dl}</div>
              <div><Badge variant={stMap.v}>{stMap.l}</Badge></div>
              <div style={{ color: "var(--pg-red-600)", fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", gap: 4 }}>
                Buka <Icon name="chevron_right" size={14}/>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  </AdminShell>
);

// ─── 3. Job order detail + Kanban pipeline
const AdminKanban = () => {
  const stages = [
    { k: "applied", l: "Applied", c: 8, color: "var(--pg-ink-500)" },
    { k: "screening", l: "Screening", c: 5, color: "var(--pg-ink-700)" },
    { k: "interview", l: "Wawancara", c: 3, color: "var(--pg-warn)" },
    { k: "medical", l: "Medical & docs", c: 2, color: "var(--pg-info)" },
    { k: "offer", l: "Offer sent", c: 1, color: "var(--pg-red-600)" },
    { k: "placed", l: "Placed", c: 0, color: "var(--pg-ok)" },
  ];
  const cards = {
    applied: [
      { n: "Ahmad Fauzi", t: "B", score: 78, age: "2 hari" },
      { n: "Dewi Sartika", t: "A", score: 92, age: "2 hari" },
      { n: "Rini Oktaviani", t: "B", score: 74, age: "3 hari" },
    ],
    screening: [
      { n: "Siti Aminah", t: "A", score: 95, age: "5 hari", flag: true },
      { n: "Nuraini P.", t: "B", score: 81, age: "6 hari" },
    ],
    interview: [
      { n: "Budi Santoso", t: "A", score: 91, age: "8 hari", flag: true },
      { n: "Rahma Wati", t: "B", score: 78, age: "10 hari" },
    ],
    medical: [
      { n: "Lilis Suryani", t: "A", score: 88, age: "12 hari" },
    ],
    offer: [
      { n: "Maya Anggraini", t: "A", score: 94, age: "18 hari" },
    ],
    placed: [],
  };
  return (
    <AdminShell active="job-orders">
      {/* Breadcrumb + header */}
      <div style={{ padding: "16px 32px 0", background: "var(--pg-white)", borderBottom: "1px solid var(--pg-ink-100)" }}>
        <div style={{ fontSize: 12, color: "var(--pg-ink-500)" }}>
          <span style={{ color: "var(--pg-red-600)", fontWeight: 600 }}>Job Orders</span> · Perawat · Saudi Arabia · Batch Juni 2026
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: 8, paddingBottom: 14 }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em", display: "flex", alignItems: "center", gap: 10 }}>
              Perawat · RS di Riyadh
              <Badge variant="ok">Lagi buka</Badge>
            </div>
            <div style={{ fontSize: 13, color: "var(--pg-ink-500)", marginTop: 4 }}>
              SAR 3.200/bulan · 12 slot · deadline 30 Juni 2026
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="pg-btn pg-btn--ghost" style={{ minHeight: 38, padding: "0 14px", fontSize: 13 }}>Export CSV</button>
            <button className="pg-btn pg-btn--ghost" style={{ minHeight: 38, padding: "0 14px", fontSize: 13 }}>Edit job order</button>
            <button className="pg-btn pg-btn--dark" style={{ minHeight: 38, padding: "0 14px", fontSize: 13 }}>Tutup batch</button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 24 }}>
          {["Pipeline (19)", "Applicants", "Tiering", "Settings"].map((t, i) => (
            <div key={t} style={{
              padding: "10px 0", fontSize: 13, fontWeight: 700,
              color: i === 0 ? "var(--pg-red-600)" : "var(--pg-ink-500)",
              borderBottom: i === 0 ? "2px solid var(--pg-red-600)" : "2px solid transparent",
              cursor: "pointer",
            }}>{t}</div>
          ))}
        </div>
      </div>

      {/* Kanban */}
      <div style={{ padding: "20px 20px", overflowX: "auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${stages.length}, 260px)`, gap: 12 }}>
          {stages.map((s) => (
            <div key={s.k} style={{
              background: "var(--pg-ink-50)", borderRadius: 12, padding: 10,
              display: "flex", flexDirection: "column", gap: 8, minHeight: 480,
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 6px 8px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 99, background: s.color }}/>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{s.l}</div>
                </div>
                <div style={{
                  fontSize: 11, fontWeight: 700, color: "var(--pg-ink-500)",
                  padding: "2px 8px", background: "var(--pg-white)", borderRadius: 99,
                }}>{s.c}</div>
              </div>
              {(cards[s.k] || []).map((c, i) => {
                const tierC = { A: "var(--pg-ok)", B: "var(--pg-warn)", C: "var(--pg-ink-500)", D: "var(--pg-ink-400)" }[c.t];
                return (
                  <div key={i} style={{
                    background: "var(--pg-white)", borderRadius: 10, padding: "12px 14px",
                    border: "1px solid var(--pg-ink-100)",
                    boxShadow: "0 1px 2px rgba(0,0,0,.04)",
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: 8 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, lineHeight: 1.3 }}>{c.n}</div>
                      <div style={{
                        width: 22, height: 22, borderRadius: 6,
                        background: tierC, color: "#fff",
                        display: "grid", placeItems: "center",
                        fontSize: 12, fontWeight: 800, flexShrink: 0,
                      }}>{c.t}</div>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
                      <div style={{ fontSize: 11, color: "var(--pg-ink-500)" }}>{c.age}</div>
                      <div style={{ fontSize: 11, fontWeight: 700, fontFamily: "'IBM Plex Mono', monospace", color: "var(--pg-ink-700)" }}>
                        {c.score}
                      </div>
                    </div>
                    {c.flag && (
                      <div style={{
                        marginTop: 8, padding: "4px 8px", fontSize: 10, fontWeight: 700,
                        background: "var(--pg-red-50)", color: "var(--pg-red-700)",
                        borderRadius: 6, display: "inline-flex", alignItems: "center", gap: 4,
                      }}><Icon name="warn" size={10} stroke={2.4}/> Dokumen kurang</div>
                    )}
                  </div>
                );
              })}
              <div style={{
                padding: "10px 12px", fontSize: 12, fontWeight: 700, color: "var(--pg-ink-400)",
                textAlign: "center", border: "1.5px dashed var(--pg-ink-200)", borderRadius: 10,
                marginTop: 4,
              }}>+ drag dari kolom lain</div>
            </div>
          ))}
        </div>
      </div>
    </AdminShell>
  );
};

// ─── 4. Document review queue
const AdminDocReview = () => (
  <AdminShell active="candidates">
    <AdminTopBar title="Dokumen · Review queue" subtitle="23 dokumen menunggu verifikasi"/>

    <div style={{ padding: "20px 32px", display: "grid", gridTemplateColumns: "380px 1fr", gap: 20, height: "calc(100% - 72px)" }}>
      {/* Queue list */}
      <div style={{ background: "var(--pg-white)", border: "1px solid var(--pg-ink-100)", borderRadius: 14, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--pg-ink-100)", display: "flex", gap: 6 }}>
          {["Semua · 23", "Passport · 9", "KTP · 4", "CV · 6", "Foto · 4"].map((t, i) => (
            <div key={t} className={`pg-chip ${i === 1 ? "pg-chip--active" : ""}`} style={{ height: 30, fontSize: 12, padding: "0 10px" }}>{t}</div>
          ))}
        </div>
        <div style={{ overflow: "auto" }}>
          {[
            { n: "Dewi Sartika", t: "Passport", time: "2 mnt lalu", sel: true },
            { n: "Ahmad Fauzi", t: "Passport", time: "14 mnt lalu" },
            { n: "Rini Oktaviani", t: "Passport", time: "1 jam lalu" },
            { n: "Siti Aminah", t: "Passport", time: "3 jam lalu" },
            { n: "Budi Santoso", t: "Passport", time: "5 jam lalu" },
            { n: "Maya Anggraini", t: "Passport", time: "8 jam lalu" },
            { n: "Rahma Wati", t: "Passport", time: "1 hari lalu" },
          ].map((q, i) => (
            <div key={i} style={{
              padding: "12px 16px", borderTop: i ? "1px solid var(--pg-ink-100)" : 0,
              display: "flex", alignItems: "center", gap: 12,
              background: q.sel ? "var(--pg-red-50)" : "transparent",
              borderLeft: q.sel ? "3px solid var(--pg-red-600)" : "3px solid transparent",
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 99,
                background: "var(--pg-ink-900)", color: "#fff",
                display: "grid", placeItems: "center",
                fontSize: 12, fontWeight: 700,
              }}>{q.n.split(" ").map(x => x[0]).slice(0,2).join("")}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{q.n}</div>
                <div style={{ fontSize: 11, color: "var(--pg-ink-500)" }}>{q.t} · {q.time}</div>
              </div>
              <Badge variant="warn">Review</Badge>
            </div>
          ))}
        </div>
      </div>

      {/* Detail / viewer */}
      <div style={{ background: "var(--pg-white)", border: "1px solid var(--pg-ink-100)", borderRadius: 14, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--pg-ink-100)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, letterSpacing: "-0.01em" }}>Dewi Sartika · Passport</div>
            <div style={{ fontSize: 12, color: "var(--pg-ink-500)", marginTop: 2 }}>
              Diupload 27 Apr 2026, 09:14 · passport.jpg · 3.2 MB
            </div>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <button className="pg-btn pg-btn--ghost" style={{ minHeight: 36, padding: "0 12px", fontSize: 13 }}>Skip</button>
            <button className="pg-btn pg-btn--ghost" style={{ minHeight: 36, padding: "0 12px", fontSize: 13 }}>Lihat profil →</button>
          </div>
        </div>

        <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1.3fr 1fr", overflow: "hidden" }}>
          {/* Preview */}
          <div style={{ background: "var(--pg-ink-50)", padding: 20, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{
              width: "100%", maxWidth: 420, aspectRatio: "1.6 / 1",
              background: "#fff", borderRadius: 12,
              boxShadow: "0 8px 24px rgba(0,0,0,.1)",
              padding: 20,
              display: "grid", gridTemplateColumns: "80px 1fr", gap: 14, alignItems: "start",
            }}>
              <div style={{
                aspectRatio: "3/4", background: "var(--pg-ink-100)",
                border: "1px solid var(--pg-ink-200)", borderRadius: 4,
                display: "grid", placeItems: "center",
                fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, color: "var(--pg-ink-400)",
              }}>PHOTO</div>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, lineHeight: 1.6, color: "var(--pg-ink-700)" }}>
                <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 4 }}>REPUBLIK INDONESIA</div>
                <div>Type: P</div>
                <div>Country: IDN</div>
                <div>Passport No: A1234567</div>
                <div>Name: DEWI SARTIKA</div>
                <div>Nationality: INDONESIAN</div>
                <div>DoB: 12 MAY 1999</div>
                <div>Date of Issue: 15 JAN 2025</div>
                <div>Date of Expiry: 15 JAN 2030</div>
              </div>
            </div>
          </div>

          {/* Side panel */}
          <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <div className="pg-eyebrow">Checklist verifikasi</div>
              <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
                {[
                  { t: "Nomor passport terlihat jelas", ok: true },
                  { t: "Nama match dengan profil", ok: true },
                  { t: "Tanggal lahir match KTP", ok: true },
                  { t: "Expired min 18 bulan ke depan", ok: true },
                  { t: "Foto passport bukan scan KTP", ok: true },
                ].map((c, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", fontSize: 13 }}>
                    <div style={{
                      width: 18, height: 18, borderRadius: 99,
                      background: c.ok ? "var(--pg-ok)" : "var(--pg-ink-100)", color: "#fff",
                      display: "grid", placeItems: "center",
                    }}><Icon name="check" size={11} stroke={3}/></div>
                    <span>{c.t}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ height: 1, background: "var(--pg-ink-100)" }}/>

            <div>
              <div className="pg-eyebrow">Catatan (opsional)</div>
              <div style={{
                marginTop: 8, padding: "10px 12px", minHeight: 70,
                border: "1.5px solid var(--pg-ink-200)", borderRadius: 10,
                fontSize: 13, color: "var(--pg-ink-400)",
              }}>Tambah catatan untuk kandidat…</div>
            </div>

            <div style={{ flex: 1 }}/>

            <div style={{ display: "flex", gap: 8 }}>
              <button style={{
                flex: 1, height: 44, border: "1.5px solid var(--pg-err)",
                background: "transparent", color: "var(--pg-err)",
                borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              }}><Icon name="x" size={16} stroke={2.4}/> Tolak</button>
              <button style={{
                flex: 2, height: 44, border: 0,
                background: "var(--pg-ok)", color: "#fff",
                borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              }}><Icon name="check" size={16} stroke={2.6}/> Verifikasi & lanjut</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AdminShell>
);

// ─── 5. Tier assignment
const AdminTier = () => (
  <AdminShell active="applications">
    <AdminTopBar title="Budi Santoso — Perawat · Saudi Arabia" subtitle="Lamaran PG-2026-04-2387 · dilamar 12 Apr"/>

    <div style={{ padding: "20px 32px", display: "grid", gridTemplateColumns: "1fr 420px", gap: 20 }}>
      {/* Left — profile summary */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Auto-score */}
        <div style={{ background: "var(--pg-white)", border: "1px solid var(--pg-ink-100)", borderRadius: 14, padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div className="pg-eyebrow">Auto-score (sistem)</div>
              <div style={{ fontSize: 14, color: "var(--pg-ink-500)", marginTop: 4 }}>Dihitung dari bobot custom field posisi.</div>
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
              <div style={{ fontSize: 44, fontWeight: 800, letterSpacing: "-0.03em", color: "var(--pg-red-600)" }}>91</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "var(--pg-ink-500)" }}>/100</div>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginTop: 18 }}>
            {[
              { l: "Pendidikan", v: 20, max: 20 },
              { l: "STR", v: 15, max: 15 },
              { l: "Pengalaman", v: 18, max: 25 },
              { l: "Bahasa", v: 12, max: 20 },
              { l: "Spesialisasi", v: 14, max: 10 },
              { l: "Shift siap", v: 8, max: 5 },
              { l: "Siap brangkat", v: 4, max: 5 },
            ].map((f) => (
              <div key={f.l} style={{
                padding: "10px 12px", background: "var(--pg-ink-50)", borderRadius: 10,
              }}>
                <div style={{ fontSize: 11, color: "var(--pg-ink-500)", fontWeight: 600 }}>{f.l}</div>
                <div style={{ fontSize: 14, fontWeight: 800, marginTop: 2 }}>{f.v} <span style={{ color: "var(--pg-ink-400)", fontWeight: 500, fontSize: 11 }}>/ {f.max}</span></div>
              </div>
            ))}
          </div>
        </div>

        {/* Answers */}
        <div style={{ background: "var(--pg-white)", border: "1px solid var(--pg-ink-100)", borderRadius: 14, overflow: "hidden" }}>
          <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--pg-ink-100)", fontSize: 14, fontWeight: 700 }}>
            Jawaban kandidat
          </div>
          {[
            ["Pengalaman perawat", "1–3 tahun", "ok"],
            ["Bahasa Inggris", "B1", "ok"],
            ["STR aktif", "Ya · exp 2028", "ok"],
            ["Shift malam", "Siap", "ok"],
            ["Spesialisasi", "ICU, IGD", "bonus"],
            ["Siap berangkat", "3–6 bulan", "ok"],
          ].map(([k, v, st], i) => (
            <div key={k} style={{
              padding: "12px 20px", display: "grid", gridTemplateColumns: "1fr 1.4fr 80px",
              alignItems: "center", gap: 12,
              borderTop: i ? "1px solid var(--pg-ink-100)" : 0,
            }}>
              <div style={{ fontSize: 13, color: "var(--pg-ink-500)" }}>{k}</div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{v}</div>
              {st === "bonus"
                ? <Badge variant="info">+ bonus</Badge>
                : <Badge variant="ok" icon="check">Match</Badge>}
            </div>
          ))}
        </div>
      </div>

      {/* Right — tier picker */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ background: "var(--pg-white)", border: "1px solid var(--pg-ink-100)", borderRadius: 14, padding: 20 }}>
          <div className="pg-eyebrow">Assign tier</div>
          <div style={{ fontSize: 13, color: "var(--pg-ink-500)", marginTop: 4 }}>
            Sistem sarankan <b style={{ color: "var(--pg-ink-900)" }}>Tier A</b>. Kamu bisa override.
          </div>

          <div style={{ display: "grid", gap: 8, marginTop: 16 }}>
            {[
              { t: "A", l: "Top candidate", d: "Prioritas tinggi, semua syarat + bonus", c: "var(--pg-ok)", sel: true },
              { t: "B", l: "Qualified", d: "Semua syarat wajib terpenuhi", c: "var(--pg-warn)" },
              { t: "C", l: "Borderline", d: "Ada 1–2 syarat lemah", c: "var(--pg-ink-500)" },
              { t: "D", l: "Below bar", d: "Banyak syarat tidak match", c: "var(--pg-ink-400)" },
              { t: "X", l: "Rejected", d: "Tidak diproses lanjut", c: "var(--pg-err)" },
            ].map((o) => (
              <div key={o.t} style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "14px 16px",
                border: `2px solid ${o.sel ? o.c : "var(--pg-ink-100)"}`,
                background: o.sel ? "var(--pg-red-50)" : "var(--pg-white)",
                borderRadius: 12, cursor: "pointer",
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 8,
                  background: o.c, color: "#fff",
                  display: "grid", placeItems: "center",
                  fontSize: 18, fontWeight: 800,
                }}>{o.t}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{o.l}</div>
                  <div style={{ fontSize: 12, color: "var(--pg-ink-500)" }}>{o.d}</div>
                </div>
                {o.sel && <Icon name="check" size={18} color={o.c} stroke={3}/>}
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: "var(--pg-white)", border: "1px solid var(--pg-ink-100)", borderRadius: 14, padding: 20 }}>
          <div className="pg-eyebrow">Catatan tier (internal)</div>
          <div style={{
            marginTop: 10, padding: 12, minHeight: 80,
            border: "1.5px solid var(--pg-ink-200)", borderRadius: 10,
            fontSize: 13, color: "var(--pg-ink-700)",
          }}>
            Pengalaman ICU + IGD bagus untuk RS Riyadh yang specifically minta acute care. Prioritaskan untuk jadwal wawancara minggu ini.
          </div>

          <button className="pg-btn pg-btn--primary pg-btn--block" style={{ marginTop: 14 }}>
            <Icon name="check" size={16} stroke={2.6}/> Simpan tier & pindah ke Wawancara
          </button>
        </div>
      </div>
    </div>
  </AdminShell>
);

Object.assign(window, { AdminOverview, AdminJobOrders, AdminKanban, AdminDocReview, AdminTier });
