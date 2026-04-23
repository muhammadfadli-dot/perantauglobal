/* Perantau Global — Desktop Candidate Portal (app/talent hub) */

// ─── Dashboard
const DeskDashboard = () => (
  <div style={{ width: "100%", minHeight: "100%", background: "var(--pg-paper)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
    <DeskTopBar active="dash" variant="app"/>

    {/* Hero greeting */}
    <section style={{ padding: "40px 48px 0" }}>
      <div className="pg-eyebrow">Selamat datang kembali</div>
      <h1 style={{ fontSize: 40, fontWeight: 800, letterSpacing: "-0.025em", margin: "8px 0 0" }}>
        Halo, Budi.
      </h1>
      <p style={{ fontSize: 16, color: "var(--pg-ink-500)", marginTop: 6 }}>
        Kamu punya 1 lamaran aktif dan profil sudah 85% lengkap.
      </p>
    </section>

    {/* 3-col grid */}
    <section style={{ padding: "32px 48px 48px", display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20 }}>
      {/* Main column */}
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {/* Active application */}
        <div style={{ background: "var(--pg-white)", border: "1px solid var(--pg-ink-100)", borderRadius: 16, padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "22px 26px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "1px solid var(--pg-ink-100)" }}>
            <div>
              <div className="pg-eyebrow">Lamaran aktif</div>
              <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.015em", marginTop: 6 }}>Perawat · RS Riyadh, Saudi Arabia</div>
              <div style={{ fontSize: 13, color: "var(--pg-ink-500)", marginTop: 4 }}>Dilamar 12 April 2026 · SAR 3.200/bulan</div>
            </div>
            <Badge variant="warn">Wawancara</Badge>
          </div>

          {/* Timeline horizontal */}
          <div style={{ padding: "24px 26px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", position: "relative" }}>
              {[
                { n: 1, t: "Lamaran", d: "Terkirim 12 Apr", done: true },
                { n: 2, t: "Wawancara", d: "Dijadwalkan 29 Apr, 10:00", active: true },
                { n: 3, t: "Medis & dokumen", d: "Menunggu wawancara" },
                { n: 4, t: "Berangkat", d: "Target Juni 2026" },
              ].map((s, i) => (
                <div key={s.n} style={{ position: "relative", paddingRight: i < 3 ? 12 : 0 }}>
                  {i < 3 && (
                    <div style={{
                      position: "absolute", top: 14, right: 4, left: "calc(50% + 16px)", height: 2,
                      background: s.done ? "var(--pg-red-600)" : "var(--pg-ink-100)",
                    }}/>
                  )}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                    <div style={{
                      width: 30, height: 30, borderRadius: 99,
                      background: s.done ? "var(--pg-red-600)" : s.active ? "var(--pg-red-600)" : "var(--pg-ink-100)",
                      color: (s.done || s.active) ? "#fff" : "var(--pg-ink-500)",
                      display: "grid", placeItems: "center",
                      fontSize: 12, fontWeight: 800,
                      boxShadow: s.active ? "0 0 0 4px var(--pg-red-100)" : undefined,
                      marginBottom: 10,
                    }}>{s.done ? <Icon name="check" size={14} stroke={3}/> : s.n}</div>
                    <div style={{ fontSize: 15, fontWeight: 700 }}>{s.t}</div>
                    <div style={{ fontSize: 12, color: "var(--pg-ink-500)", marginTop: 2 }}>{s.d}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Callout */}
            <div style={{
              marginTop: 22, padding: "14px 18px",
              background: "var(--pg-red-50)",
              border: "1px solid var(--pg-red-200)",
              borderRadius: 12,
              display: "flex", alignItems: "center", gap: 14,
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                background: "var(--pg-red-600)", color: "#fff",
                display: "grid", placeItems: "center",
              }}><Icon name="clock" size={17}/></div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700 }}>Wawancara 29 April, 10:00 WIB</div>
                <div style={{ fontSize: 12, color: "var(--pg-ink-700)", marginTop: 2 }}>Via Zoom · dengan HR RS Riyadh. Link dikirim 1 hari sebelumnya.</div>
              </div>
              <button className="pg-btn pg-btn--dark" style={{ minHeight: 38, padding: "0 14px", fontSize: 13 }}>Tambah ke kalender</button>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div>
              <div className="pg-eyebrow">Cocok untuk kamu</div>
              <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.015em", marginTop: 4 }}>3 posisi yang match profil kamu</div>
            </div>
            <div style={{ fontSize: 13, color: "var(--pg-red-600)", fontWeight: 700, cursor: "pointer" }}>Jelajah semua →</div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
            {[
              { r: "Perawat", c: "Singapura", s: "SGD 2.400", match: 90, ic: "stethoscope" },
              { r: "Caregiver", c: "Taiwan", s: "TWD 23.000", match: 72, ic: "heart" },
              { r: "Barista", c: "Saudi Arabia", s: "SAR 2.000", match: 42, ic: "coffee" },
            ].map((j, i) => (
              <div key={i} style={{ background: "var(--pg-white)", border: "1px solid var(--pg-ink-100)", borderRadius: 14, padding: 18 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: "var(--pg-red-50)", color: "var(--pg-red-600)", display: "grid", placeItems: "center" }}>
                    <Icon name={j.ic} size={18} stroke={1.8}/>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 11, color: "var(--pg-ink-500)", fontWeight: 600 }}>{j.c}</div>
                    <div style={{ fontSize: 15, fontWeight: 800, letterSpacing: "-0.01em" }}>{j.r}</div>
                  </div>
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, marginTop: 12 }}>{j.s}/bulan</div>
                <div style={{ marginTop: 10, paddingTop: 12, borderTop: "1px solid var(--pg-ink-100)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--pg-ink-500)", marginBottom: 4 }}>
                    <span>Match</span>
                    <span style={{ fontWeight: 700, color: j.match > 80 ? "var(--pg-ok)" : j.match > 60 ? "var(--pg-warn)" : "var(--pg-ink-500)" }}>{j.match}%</span>
                  </div>
                  <div style={{ height: 5, background: "var(--pg-ink-100)", borderRadius: 99 }}>
                    <div style={{ width: `${j.match}%`, height: "100%", background: j.match > 80 ? "var(--pg-ok)" : j.match > 60 ? "var(--pg-warn)" : "var(--pg-ink-400)", borderRadius: 99 }}/>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {/* Profile completeness */}
        <div style={{
          background: "linear-gradient(160deg, var(--pg-red-700), var(--pg-red-600))",
          color: "#fff", borderRadius: 16, padding: 22,
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", opacity: 0.85 }}>Profil kamu</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 6 }}>
            <div style={{ fontSize: 40, fontWeight: 800, letterSpacing: "-0.03em" }}>85<span style={{ fontSize: 20, opacity: 0.7 }}>%</span></div>
          </div>
          <div style={{ fontSize: 13, marginTop: 2, opacity: 0.85 }}>Tinggal 2 langkah lagi untuk profil sempurna.</div>

          <div style={{ height: 6, background: "rgba(255,255,255,.2)", borderRadius: 99, marginTop: 14 }}>
            <div style={{ width: "85%", height: "100%", background: "#fff", borderRadius: 99 }}/>
          </div>

          <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              ["Data diri", true],
              ["Dokumen wajib", true],
              ["Pengalaman kerja", true],
              ["Upload ijazah", false],
              ["Foto profil", false],
            ].map(([l, done]) => (
              <div key={l} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13 }}>
                <div style={{
                  width: 18, height: 18, borderRadius: 99,
                  background: done ? "rgba(255,255,255,.25)" : "transparent",
                  border: done ? 0 : "1.5px solid rgba(255,255,255,.4)",
                  display: "grid", placeItems: "center",
                }}>{done && <Icon name="check" size={10} stroke={3.5}/>}</div>
                <span style={{ opacity: done ? 1 : 0.8 }}>{l}</span>
              </div>
            ))}
          </div>

          <button style={{
            width: "100%", marginTop: 18, minHeight: 42,
            background: "#fff", color: "var(--pg-red-700)",
            border: 0, borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          }}>Lengkapi profil <Icon name="arrow_right" size={15} stroke={2.4}/></button>
        </div>

        {/* Quick actions */}
        <div style={{ background: "var(--pg-white)", border: "1px solid var(--pg-ink-100)", borderRadius: 16, padding: 18 }}>
          <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--pg-ink-400)" }}>Akses cepat</div>
          <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 2 }}>
            {[
              { ic: "briefcase", t: "Semua lamaran saya", c: "2" },
              { ic: "doc", t: "Dokumen saya", c: "5" },
              { ic: "user", t: "Profil & preferensi" },
              { ic: "mail", t: "Pesan dari recruiter", c: "3", dot: true },
            ].map((a, i) => (
              <div key={i} style={{ padding: "12px 10px", display: "flex", alignItems: "center", gap: 10, borderRadius: 8, cursor: "pointer" }}>
                <div style={{ width: 32, height: 32, borderRadius: 7, background: "var(--pg-ink-50)", color: "var(--pg-ink-700)", display: "grid", placeItems: "center" }}>
                  <Icon name={a.ic} size={16}/>
                </div>
                <div style={{ flex: 1, fontSize: 14, fontWeight: 600 }}>{a.t}</div>
                {a.c && (
                  <div style={{
                    padding: "2px 8px", fontSize: 11, fontWeight: 700,
                    background: a.dot ? "var(--pg-red-600)" : "var(--pg-ink-100)",
                    color: a.dot ? "#fff" : "var(--pg-ink-500)",
                    borderRadius: 99,
                  }}>{a.c}</div>
                )}
                <Icon name="chevron_right" size={14} color="var(--pg-ink-400)"/>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  </div>
);

// ─── Explore (desktop)
const DeskExplore = () => (
  <div style={{ width: "100%", minHeight: "100%", background: "var(--pg-paper)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
    <DeskTopBar active="explore" variant="app"/>

    <section style={{ padding: "40px 48px 0" }}>
      <div className="pg-eyebrow">Jelajah posisi</div>
      <h1 style={{ fontSize: 36, fontWeight: 800, letterSpacing: "-0.025em", margin: "8px 0 8px" }}>
        Diurutkan berdasarkan kecocokan kamu
      </h1>
      <p style={{ fontSize: 15, color: "var(--pg-ink-500)", margin: 0 }}>
        Profil kamu cocok dengan 3 posisi. Lamar yang paling menarik dulu.
      </p>
    </section>

    <section style={{ padding: "28px 48px 48px", display: "grid", gridTemplateColumns: "1fr", gap: 40 }}>
      {/* Tier A - Match tinggi */}
      {[
        {
          tier: "Match tinggi · 80%+",
          tierDesc: "Profil kamu memenuhi hampir semua syarat",
          color: "var(--pg-ok)", bg: "var(--pg-ok-bg)",
          jobs: [
            { r: "Perawat", c: "Singapura", s: "SGD 2.400/bulan", match: 90, why: "STR aktif · D3 Keperawatan · 4 th pengalaman", ic: "stethoscope" },
            { r: "Perawat", c: "Saudi Arabia", s: "SAR 3.200/bulan", match: 91, why: "Spesialisasi IGD · Bahasa Inggris B1", ic: "stethoscope", applied: true },
          ],
        },
        {
          tier: "Match sedang · 50–80%",
          tierDesc: "Bisa dilamar tapi beberapa syarat perlu dicek",
          color: "var(--pg-warn)", bg: "var(--pg-warn-bg)",
          jobs: [
            { r: "Caregiver", c: "Taiwan", s: "TWD 23.000/bulan", match: 72, why: "Training disediakan · butuh Bahasa Mandarin dasar", ic: "heart" },
          ],
        },
        {
          tier: "Match rendah · <50%",
          tierDesc: "Beberapa syarat utama belum terpenuhi",
          color: "var(--pg-ink-500)", bg: "var(--pg-ink-50)",
          jobs: [
            { r: "Barista", c: "Saudi Arabia", s: "SAR 2.000/bulan", match: 42, why: "Butuh pengalaman F&B · training bisa diikuti", ic: "coffee" },
            { r: "Waitress", c: "Saudi Arabia", s: "SAR 1.800/bulan", match: 38, why: "Posisi khusus perempuan · butuh pengalaman restoran", ic: "bowl" },
          ],
        },
      ].map((group, gi) => (
        <div key={group.tier}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <div style={{
              padding: "6px 14px", fontSize: 12, fontWeight: 800, letterSpacing: "0.04em", textTransform: "uppercase",
              background: group.bg, color: group.color, borderRadius: 99,
            }}>{group.tier}</div>
            <div style={{ fontSize: 13, color: "var(--pg-ink-500)" }}>{group.tierDesc}</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }}>
            {group.jobs.map((j, i) => (
              <div key={i} style={{
                background: "var(--pg-white)", border: "1px solid var(--pg-ink-100)",
                borderRadius: 14, padding: 22,
                display: "flex", flexDirection: "column", gap: 14,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ display: "flex", gap: 12 }}>
                    <div style={{
                      width: 48, height: 48, borderRadius: 12,
                      background: "var(--pg-red-50)", color: "var(--pg-red-600)",
                      display: "grid", placeItems: "center", flexShrink: 0,
                    }}><Icon name={j.ic} size={22} stroke={1.8}/></div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "var(--pg-ink-500)" }}>{j.c}</div>
                      <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.015em", marginTop: 2 }}>{j.r}</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "var(--pg-ink-700)", marginTop: 4 }}>{j.s}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 22, fontWeight: 800, color: group.color, fontFamily: "'IBM Plex Mono', monospace" }}>{j.match}%</div>
                    <div style={{ fontSize: 10, color: "var(--pg-ink-500)", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>match</div>
                  </div>
                </div>

                <div style={{
                  padding: "10px 12px", background: "var(--pg-ink-50)",
                  borderRadius: 8, fontSize: 13, color: "var(--pg-ink-700)",
                  display: "flex", alignItems: "center", gap: 8,
                }}>
                  <Icon name="sparkle" size={14} color={group.color}/> {j.why}
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  <button className={`pg-btn ${j.applied ? "pg-btn--ghost" : "pg-btn--primary"}`} style={{ flex: 1, minHeight: 42, fontSize: 14 }}>
                    {j.applied ? "Sudah dilamar ✓" : "Lamar sekarang"}
                  </button>
                  <button className="pg-btn pg-btn--ghost" style={{ minHeight: 42, padding: "0 14px", fontSize: 14 }}>Detail</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </section>
  </div>
);

// ─── Profile (desktop)
const DeskProfile = () => (
  <div style={{ width: "100%", minHeight: "100%", background: "var(--pg-paper)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
    <DeskTopBar active="profile" variant="app"/>

    <section style={{ padding: "40px 48px 48px", display: "grid", gridTemplateColumns: "280px 1fr", gap: 40 }}>
      {/* Side nav */}
      <aside style={{ position: "sticky", top: 100, alignSelf: "start" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 99,
            background: "var(--pg-ink-900)", color: "#fff",
            display: "grid", placeItems: "center",
            fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em",
          }}>BS</div>
          <div>
            <div style={{ fontSize: 17, fontWeight: 800, letterSpacing: "-0.01em" }}>Budi Santoso</div>
            <div style={{ fontSize: 12, color: "var(--pg-ink-500)" }}>ID: PG-KAND-8412</div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {[
            { k: "data", l: "Data diri", ic: "user", done: "100%" },
            { k: "doc", l: "Dokumen", ic: "doc", done: "4/5", pending: true, sel: true },
            { k: "qual", l: "Kualifikasi", ic: "sparkle", done: "100%" },
            { k: "work", l: "Pengalaman kerja", ic: "briefcase", done: "3 entry" },
            { k: "pref", l: "Preferensi", ic: "sparkle_dot", done: "Setup" },
            { k: "sec", l: "Keamanan akun", ic: "shield" },
          ].map((n) => (
            <div key={n.k} style={{
              padding: "12px 14px", display: "flex", alignItems: "center", gap: 12,
              borderRadius: 10,
              background: n.sel ? "var(--pg-red-50)" : "transparent",
              color: n.sel ? "var(--pg-red-700)" : "var(--pg-ink-700)",
              cursor: "pointer",
              position: "relative",
            }}>
              {n.sel && <div style={{ position: "absolute", left: -14, top: 10, bottom: 10, width: 3, background: "var(--pg-red-600)", borderRadius: 99 }}/>}
              <Icon name={n.ic} size={17} stroke={n.sel ? 2.2 : 1.8}/>
              <div style={{ flex: 1, fontSize: 14, fontWeight: n.sel ? 700 : 500 }}>{n.l}</div>
              {n.done && (
                <div style={{ fontSize: 11, fontWeight: 700, color: n.pending ? "var(--pg-warn)" : "var(--pg-ink-400)" }}>{n.done}</div>
              )}
            </div>
          ))}
        </div>
      </aside>

      {/* Main content */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 20 }}>
          <div>
            <div className="pg-eyebrow">Dokumen</div>
            <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-0.02em", margin: "6px 0 0" }}>Dokumen kamu</h1>
            <p style={{ fontSize: 14, color: "var(--pg-ink-500)", marginTop: 6 }}>
              4 dari 5 dokumen sudah terverifikasi. Upload ijazah untuk melengkapi profil.
            </p>
          </div>
          <button className="pg-btn pg-btn--primary" style={{ minHeight: 44, padding: "0 18px", fontSize: 14 }}>
            <Icon name="upload" size={16}/> Upload dokumen
          </button>
        </div>

        {/* Document grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }}>
          {[
            { n: "Passport", f: "passport.jpg", d: "27 Apr 2026", v: "ok", exp: "Berlaku s/d 15 Jan 2030" },
            { n: "KTP", f: "ktp.jpg", d: "27 Apr 2026", v: "ok" },
            { n: "STR (Surat Tanda Registrasi)", f: "str_2023.pdf", d: "27 Apr 2026", v: "ok", exp: "Berlaku s/d 2028" },
            { n: "Foto profil", f: "foto.jpg", d: "27 Apr 2026", v: "ok" },
            { n: "Ijazah D3 Keperawatan", f: "ijazah.pdf", d: "2 hari lalu", v: "pending" },
            { n: "Transkrip nilai", f: "—", v: "missing" },
          ].map((d, i) => (
            <div key={i} style={{
              background: d.v === "missing" ? "transparent" : "var(--pg-white)",
              border: d.v === "missing" ? "2px dashed var(--pg-ink-200)" : "1px solid var(--pg-ink-100)",
              borderRadius: 14, padding: 18,
            }}>
              {d.v === "missing" ? (
                <div style={{ textAlign: "center", padding: "14px 0" }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "var(--pg-ink-700)" }}>{d.n}</div>
                  <div style={{ fontSize: 12, color: "var(--pg-ink-500)", marginTop: 4 }}>Belum diupload · opsional</div>
                  <button className="pg-btn pg-btn--ghost" style={{ marginTop: 14, minHeight: 38, padding: "0 14px", fontSize: 13 }}>
                    <Icon name="upload" size={14}/> Upload
                  </button>
                </div>
              ) : (
                <>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 9,
                      background: "var(--pg-ink-900)", color: "#fff",
                      display: "grid", placeItems: "center",
                    }}><Icon name="doc" size={18}/></div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 15, fontWeight: 700 }}>{d.n}</div>
                      <div style={{ fontSize: 12, color: "var(--pg-ink-500)", fontFamily: "'IBM Plex Mono', monospace", marginTop: 2 }}>{d.f}</div>
                    </div>
                    {d.v === "ok" ? <Badge variant="ok" icon="check">Verified</Badge> : <Badge variant="warn">Review</Badge>}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 12, borderTop: "1px solid var(--pg-ink-100)" }}>
                    <div style={{ fontSize: 12, color: "var(--pg-ink-500)" }}>
                      Diupload {d.d}{d.exp && ` · ${d.exp}`}
                    </div>
                    <div style={{ display: "flex", gap: 4 }}>
                      <button style={{ width: 30, height: 30, borderRadius: 7, border: 0, background: "transparent", color: "var(--pg-ink-500)", cursor: "pointer", display: "grid", placeItems: "center" }}>
                        <Icon name="edit" size={14}/>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  </div>
);

// ─── Timeline (desktop) — single application detail with full timeline
const DeskTimeline = () => (
  <div style={{ width: "100%", minHeight: "100%", background: "var(--pg-paper)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
    <DeskTopBar active="apps" variant="app"/>

    {/* Breadcrumb + header */}
    <section style={{ padding: "32px 48px 0" }}>
      <div style={{ fontSize: 13, color: "var(--pg-ink-500)", marginBottom: 10 }}>
        <span style={{ color: "var(--pg-red-600)", fontWeight: 600 }}>Lamaran saya</span> / Perawat — RS Riyadh
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <h1 style={{ fontSize: 36, fontWeight: 800, letterSpacing: "-0.025em", margin: 0 }}>
            Perawat · Saudi Arabia
          </h1>
          <div style={{ fontSize: 15, color: "var(--pg-ink-500)", marginTop: 6 }}>
            RS Swasta Riyadh · SAR 3.200/bulan · dilamar 12 April 2026
          </div>
        </div>
        <Badge variant="warn">Tahap wawancara</Badge>
      </div>
    </section>

    <section style={{ padding: "32px 48px 48px", display: "grid", gridTemplateColumns: "1fr 340px", gap: 32 }}>
      {/* Timeline vertical */}
      <div style={{ background: "var(--pg-white)", border: "1px solid var(--pg-ink-100)", borderRadius: 16, padding: "32px 36px" }}>
        <div className="pg-eyebrow">Progress</div>
        <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.015em", margin: "6px 0 28px" }}>Tahap lamaran kamu</div>

        <div>
          {[
            { n: 1, t: "Lamaran terkirim", d: "12 April 2026, 14:32", done: true, logs: ["Dokumen lengkap terkirim", "Auto-review lolos · match score 91/100"] },
            { n: 2, t: "Wawancara dengan employer", d: "29 April 2026, 10:00 WIB", active: true, logs: ["Dijadwalkan oleh Rina P. (recruiter)", "Via Zoom · link dikirim 28 Apr", "Persiapan: baca employer brief di email"] },
            { n: 3, t: "Medical check-up & dokumen", d: "Target Mei 2026", logs: ["Akan dijadwalkan jika lolos wawancara", "Lokasi: RS Mitra Keluarga Jakarta"] },
            { n: 4, t: "Keberangkatan", d: "Target Juni–Juli 2026", logs: ["Tiket pesawat & akomodasi disediakan", "Pendampingan di bandara dan tiba di Riyadh"] },
          ].map((s, i) => (
            <div key={s.n} style={{ display: "grid", gridTemplateColumns: "40px 1fr", gap: 20, paddingBottom: i < 3 ? 24 : 0 }}>
              <div style={{ position: "relative" }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 99,
                  background: s.done ? "var(--pg-red-600)" : s.active ? "#fff" : "var(--pg-ink-50)",
                  border: s.active ? "3px solid var(--pg-red-600)" : "0",
                  color: s.done ? "#fff" : s.active ? "var(--pg-red-600)" : "var(--pg-ink-400)",
                  display: "grid", placeItems: "center",
                  fontWeight: 800, fontSize: 14,
                }}>{s.done ? <Icon name="check" size={16} stroke={3}/> : s.n}</div>
                {i < 3 && (
                  <div style={{
                    position: "absolute", left: 17, top: 40, bottom: -24, width: 2,
                    background: s.done ? "var(--pg-red-600)" : "var(--pg-ink-100)",
                  }}/>
                )}
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.01em", color: (s.done || s.active) ? "var(--pg-ink-900)" : "var(--pg-ink-400)" }}>{s.t}</div>
                  {s.active && <Badge variant="err">Sedang berjalan</Badge>}
                  {s.done && <Badge variant="ok" icon="check">Selesai</Badge>}
                </div>
                <div style={{ fontSize: 13, color: "var(--pg-ink-500)", marginTop: 3, fontFamily: "'IBM Plex Mono', monospace" }}>{s.d}</div>
                <div style={{ marginTop: 12, paddingLeft: 0, display: "flex", flexDirection: "column", gap: 6 }}>
                  {s.logs.map((log, j) => (
                    <div key={j} style={{ fontSize: 13, color: (s.done || s.active) ? "var(--pg-ink-700)" : "var(--pg-ink-400)", lineHeight: 1.5, display: "flex", gap: 8 }}>
                      <div style={{ width: 4, height: 4, borderRadius: 99, background: (s.done || s.active) ? "var(--pg-ink-500)" : "var(--pg-ink-300)", marginTop: 8, flexShrink: 0 }}/>
                      {log}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sidebar */}
      <aside style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Next step card */}
        <div style={{ background: "var(--pg-red-600)", color: "#fff", borderRadius: 14, padding: 22 }}>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", opacity: 0.85 }}>Berikutnya</div>
          <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.015em", marginTop: 6 }}>Wawancara · 29 April</div>
          <div style={{ fontSize: 13, marginTop: 4, opacity: 0.85 }}>10:00 WIB via Zoom. Link dikirim 28 April.</div>
          <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
            <button style={{
              flex: 1, height: 42, border: 0,
              background: "#fff", color: "var(--pg-red-700)",
              borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer",
            }}>Tambah ke kalender</button>
          </div>
        </div>

        {/* Recruiter contact */}
        <div style={{ background: "var(--pg-white)", border: "1px solid var(--pg-ink-100)", borderRadius: 14, padding: 18 }}>
          <div className="pg-eyebrow">Recruiter kamu</div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 10 }}>
            <div style={{ width: 44, height: 44, borderRadius: 99, background: "var(--pg-ink-900)", color: "#fff", display: "grid", placeItems: "center", fontWeight: 800 }}>RP</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700 }}>Rina Puspita</div>
              <div style={{ fontSize: 12, color: "var(--pg-ink-500)" }}>Talent recruiter · online</div>
            </div>
          </div>
          <button className="pg-btn pg-btn--dark pg-btn--block" style={{ marginTop: 14, minHeight: 42, fontSize: 13 }}>
            <Icon name="phone" size={14}/> Chat WhatsApp
          </button>
        </div>

        {/* Docs checklist */}
        <div style={{ background: "var(--pg-white)", border: "1px solid var(--pg-ink-100)", borderRadius: 14, padding: 18 }}>
          <div className="pg-eyebrow">Dokumen untuk tahap ini</div>
          <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              ["Passport aktif", true],
              ["KTP", true],
              ["STR", true],
              ["Ijazah (review)", false],
            ].map(([l, ok]) => (
              <div key={l} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13 }}>
                <div style={{
                  width: 18, height: 18, borderRadius: 99,
                  background: ok ? "var(--pg-ok)" : "var(--pg-warn)",
                  color: "#fff", display: "grid", placeItems: "center",
                }}>{ok ? <Icon name="check" size={10} stroke={3.5}/> : <Icon name="clock" size={10} stroke={2.5}/>}</div>
                <span style={{ color: "var(--pg-ink-700)" }}>{l}</span>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </section>
  </div>
);

Object.assign(window, { DeskDashboard, DeskExplore, DeskProfile, DeskTimeline });
