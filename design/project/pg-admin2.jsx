/* Admin CRM — more screens:
   · Job Order creation wizard (4 steps)
   · Candidate detail (single pane)
*/

// ─── JO Wizard — multi step
const AdminJOWizardShell = ({ step, children, title }) => {
  const steps = [
    { k: 1, l: "Posisi & employer" },
    { k: 2, l: "Slot & timeline" },
    { k: 3, l: "Pertanyaan + scoring" },
    { k: 4, l: "Tiering rules" },
    { k: 5, l: "Preview & publish" },
  ];
  return (
    <AdminShell active="job-orders">
      <div style={{ padding: "16px 32px 0", background: "var(--pg-white)", borderBottom: "1px solid var(--pg-ink-100)" }}>
        <div style={{ fontSize: 12, color: "var(--pg-ink-500)" }}>
          <span style={{ color: "var(--pg-red-600)", fontWeight: 600 }}>Job Orders</span> · Buat baru
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: 8, paddingBottom: 16 }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em" }}>{title}</div>
            <div style={{ fontSize: 13, color: "var(--pg-ink-500)", marginTop: 4 }}>
              Step {step} dari 5 · semua field bisa diedit nanti
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="pg-btn pg-btn--ghost" style={{ minHeight: 38, padding: "0 14px", fontSize: 13 }}>Simpan sebagai draft</button>
            <button className="pg-btn pg-btn--ghost" style={{ minHeight: 38, padding: "0 14px", fontSize: 13 }}>Batal</button>
          </div>
        </div>

        {/* Stepper */}
        <div style={{ display: "flex", gap: 2, paddingBottom: 0 }}>
          {steps.map((s) => {
            const done = s.k < step;
            const on = s.k === step;
            return (
              <div key={s.k} style={{ flex: 1, paddingBottom: 14 }}>
                <div style={{
                  height: 3, background: done || on ? "var(--pg-red-600)" : "var(--pg-ink-100)",
                  borderRadius: 99, marginBottom: 8,
                }}/>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: 99,
                    background: done ? "var(--pg-red-600)" : on ? "var(--pg-red-600)" : "var(--pg-ink-100)",
                    color: done || on ? "#fff" : "var(--pg-ink-500)",
                    display: "grid", placeItems: "center",
                    fontSize: 11, fontWeight: 800,
                  }}>{done ? <Icon name="check" size={11} stroke={3}/> : s.k}</div>
                  <div style={{ fontSize: 12, fontWeight: on ? 700 : 500, color: on ? "var(--pg-ink-900)" : "var(--pg-ink-500)" }}>{s.l}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ padding: "24px 32px 100px" }}>
        {children}
      </div>

      {/* Footer nav */}
      <div style={{
        position: "sticky", bottom: 0, background: "var(--pg-white)",
        borderTop: "1px solid var(--pg-ink-100)",
        padding: "14px 32px", display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <button className="pg-btn pg-btn--ghost" style={{ minHeight: 42, padding: "0 16px", fontSize: 14 }}>← Kembali</button>
        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ fontSize: 12, color: "var(--pg-ink-500)", alignSelf: "center", marginRight: 6 }}>Auto-saved 2 menit lalu</div>
          <button className="pg-btn pg-btn--primary" style={{ minHeight: 42, padding: "0 18px", fontSize: 14 }}>
            {step === 5 ? "Publish job order" : "Lanjut"} <Icon name="arrow_right" size={16} stroke={2.4}/>
          </button>
        </div>
      </div>
    </AdminShell>
  );
};

const FieldRow = ({ label, hint, children }) => (
  <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 24, padding: "18px 0", borderBottom: "1px solid var(--pg-ink-100)" }}>
    <div>
      <div style={{ fontSize: 13, fontWeight: 700 }}>{label}</div>
      {hint && <div style={{ fontSize: 12, color: "var(--pg-ink-500)", marginTop: 4, lineHeight: 1.5 }}>{hint}</div>}
    </div>
    <div>{children}</div>
  </div>
);

const TxtInput = ({ value, placeholder, width = "100%", mono }) => (
  <div style={{
    height: 42, border: "1.5px solid var(--pg-ink-200)", borderRadius: 10,
    padding: "0 14px", display: "flex", alignItems: "center",
    background: "var(--pg-white)", width,
    fontSize: 14, fontFamily: mono ? "'IBM Plex Mono', monospace" : undefined,
    color: value ? "var(--pg-ink-900)" : "var(--pg-ink-400)",
  }}>{value || placeholder}</div>
);

const AdminJOCreate = () => (
  <AdminJOWizardShell step={3} title="Perawat · Saudi Arabia — Batch Juni 2026">
    {/* Tab row */}
    <div style={{ display: "flex", gap: 20, marginBottom: 20, borderBottom: "1px solid var(--pg-ink-100)" }}>
      {["Pertanyaan wajib (8)", "Pertanyaan custom (4)", "Scoring weights"].map((t, i) => (
        <div key={t} style={{
          padding: "10px 0", fontSize: 13, fontWeight: 700,
          color: i === 1 ? "var(--pg-red-600)" : "var(--pg-ink-500)",
          borderBottom: i === 1 ? "2px solid var(--pg-red-600)" : "2px solid transparent",
          cursor: "pointer", marginBottom: -1,
        }}>{t}</div>
      ))}
    </div>

    <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 24 }}>
      {/* Left column — questions list */}
      <div>
        <div style={{ fontSize: 13, color: "var(--pg-ink-500)", marginBottom: 12 }}>
          Pertanyaan ini muncul di <b style={{ color: "var(--pg-ink-900)" }}>Step 4 apply flow</b>. Semua jawaban masuk ke auto-score & bisa digunakan di tiering rules.
        </div>

        {/* Question cards */}
        {[
          {
            t: "Pengalaman sebagai perawat",
            type: "Dropdown", opts: ["Belum ada", "<1 tahun", "1–3 tahun", "3–5 tahun", "5+ tahun"],
            weight: 25, req: true,
          },
          {
            t: "Level Bahasa Inggris",
            type: "Dropdown", opts: ["A1 (dasar)", "A2 (pemula)", "B1 (menengah)", "B2 (mahir)"],
            weight: 20, req: true,
          },
          {
            t: "Spesialisasi yang dikuasai (pilih max 3)",
            type: "Multi-select", opts: ["ICU", "IGD", "Ruang Operasi", "NICU", "Hemodialisa", "Anak"],
            weight: 10, req: false, bonus: true,
          },
          {
            t: "Siap shift malam?",
            type: "Yes/No", opts: ["Ya", "Tidak"],
            weight: 5, req: true,
          },
        ].map((q, i) => (
          <div key={i} style={{
            background: "var(--pg-white)", border: "1px solid var(--pg-ink-100)",
            borderRadius: 12, padding: "16px 18px", marginBottom: 10,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <div style={{
                    width: 20, height: 20, borderRadius: 5, background: "var(--pg-ink-50)",
                    color: "var(--pg-ink-500)", display: "grid", placeItems: "center",
                  }}><Icon name="grip" size={12}/></div>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--pg-ink-500)" }}>
                    Q{i + 1} · {q.type}
                  </div>
                  {q.req && <Badge variant="err">Wajib</Badge>}
                  {q.bonus && <Badge variant="info">Bonus</Badge>}
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>{q.t}</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {q.opts.map((o) => (
                    <div key={o} style={{
                      padding: "4px 10px", fontSize: 12, fontWeight: 600,
                      background: "var(--pg-ink-50)", color: "var(--pg-ink-700)",
                      borderRadius: 6,
                    }}>{o}</div>
                  ))}
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
                <div style={{
                  padding: "4px 10px", fontSize: 12, fontWeight: 800,
                  background: "var(--pg-red-50)", color: "var(--pg-red-700)",
                  borderRadius: 6, fontFamily: "'IBM Plex Mono', monospace",
                }}>{q.weight} pt</div>
                <div style={{ display: "flex", gap: 4 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 6, display: "grid", placeItems: "center", color: "var(--pg-ink-500)", cursor: "pointer" }}><Icon name="edit" size={13}/></div>
                  <div style={{ width: 28, height: 28, borderRadius: 6, display: "grid", placeItems: "center", color: "var(--pg-err)", cursor: "pointer" }}><Icon name="trash" size={13}/></div>
                </div>
              </div>
            </div>
          </div>
        ))}

        <div style={{
          padding: "18px", border: "1.5px dashed var(--pg-ink-200)", borderRadius: 12,
          textAlign: "center", color: "var(--pg-red-600)", fontSize: 14, fontWeight: 700,
          cursor: "pointer", background: "var(--pg-white)",
        }}>+ Tambah pertanyaan custom</div>
      </div>

      {/* Right column — library */}
      <aside>
        <div style={{ background: "var(--pg-white)", border: "1px solid var(--pg-ink-100)", borderRadius: 12, padding: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--pg-ink-400)" }}>Library pertanyaan</div>
          <div style={{ fontSize: 12, color: "var(--pg-ink-500)", marginTop: 6, lineHeight: 1.5 }}>
            Reusable dari posisi lain. Klik untuk tambahkan ke JO ini.
          </div>

          <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 6 }}>
            {[
              { t: "Tinggi & berat badan", u: "dipakai 8 JO" },
              { t: "Kendala bepergian jauh", u: "dipakai 6 JO" },
              { t: "Vaksinasi COVID lengkap?", u: "dipakai 5 JO" },
              { t: "Pengalaman perawatan lansia", u: "dipakai 4 JO" },
              { t: "Golongan darah", u: "dipakai 3 JO" },
            ].map((l, i) => (
              <div key={i} style={{
                padding: "10px 12px", borderRadius: 8,
                background: "var(--pg-ink-50)",
                display: "flex", justifyContent: "space-between", alignItems: "center",
                cursor: "pointer",
              }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{l.t}</div>
                  <div style={{ fontSize: 11, color: "var(--pg-ink-400)", marginTop: 2 }}>{l.u}</div>
                </div>
                <Icon name="plus" size={14} color="var(--pg-red-600)" stroke={2.4}/>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: "var(--pg-white)", border: "1px solid var(--pg-ink-100)", borderRadius: 12, padding: 16, marginTop: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--pg-ink-400)" }}>Total bobot</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginTop: 8 }}>
            <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-0.02em" }}>60</div>
            <div style={{ fontSize: 14, color: "var(--pg-ink-500)" }}>/ 100 pt (custom)</div>
          </div>
          <div style={{ height: 6, background: "var(--pg-ink-100)", borderRadius: 99, marginTop: 8 }}>
            <div style={{ width: "60%", height: "100%", background: "var(--pg-red-600)", borderRadius: 99 }}/>
          </div>
          <div style={{ fontSize: 12, color: "var(--pg-ink-500)", marginTop: 10, lineHeight: 1.5 }}>
            40 pt tersisa untuk field wajib (pendidikan, STR, dsb). Target total: 100 pt.
          </div>
        </div>
      </aside>
    </div>
  </AdminJOWizardShell>
);

// ─── Candidate detail — single pane
const AdminCandidateDetail = () => {
  const tabs = ["Profil", "Lamaran (3)", "Dokumen (5)", "Timeline", "Catatan (2)"];
  return (
    <AdminShell active="candidates">
      <div style={{ padding: "18px 32px 0", background: "var(--pg-white)", borderBottom: "1px solid var(--pg-ink-100)" }}>
        {/* Breadcrumb */}
        <div style={{ fontSize: 12, color: "var(--pg-ink-500)", marginBottom: 16 }}>
          <span style={{ color: "var(--pg-red-600)", fontWeight: 600 }}>Kandidat</span>
          <span style={{ margin: "0 6px", color: "var(--pg-ink-300)" }}>/</span>
          <span>Budi Santoso</span>
        </div>

        {/* Header: identity + actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, paddingBottom: 16 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 99,
            background: "var(--pg-ink-900)", color: "#fff",
            display: "grid", placeItems: "center",
            fontSize: 18, fontWeight: 800, letterSpacing: "-0.02em", flexShrink: 0,
          }}>BS</div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.02em" }}>Budi Santoso</div>
              <div style={{
                padding: "2px 8px", fontSize: 10, fontWeight: 800, letterSpacing: "0.06em",
                background: "var(--pg-ok)", color: "#fff", borderRadius: 4,
              }}>TIER A</div>
            </div>
            <div style={{ fontSize: 13, color: "var(--pg-ink-500)", marginTop: 3 }}>
              28 th · Semarang · terdaftar 10 Mar 2026 · aktif 2 jam lalu
            </div>
          </div>

          <div style={{ display: "flex", gap: 6 }}>
            <button className="pg-btn pg-btn--ghost" style={{ minHeight: 36, padding: "0 12px", fontSize: 13 }}>
              <Icon name="mail" size={14}/> Email
            </button>
            <button className="pg-btn pg-btn--ghost" style={{ minHeight: 36, padding: "0 12px", fontSize: 13 }}>Edit</button>
            <button className="pg-btn pg-btn--dark" style={{ minHeight: 36, padding: "0 12px", fontSize: 13 }}>Nominasikan ke JO</button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 24 }}>
          {tabs.map((t, i) => (
            <div key={t} style={{
              padding: "10px 0", fontSize: 13, fontWeight: 700,
              color: i === 0 ? "var(--pg-red-600)" : "var(--pg-ink-500)",
              borderBottom: i === 0 ? "2px solid var(--pg-red-600)" : "2px solid transparent",
              cursor: "pointer",
            }}>{t}</div>
          ))}
        </div>
      </div>

      {/* Body — 3 cols */}
      <div style={{ padding: "20px 32px", display: "grid", gridTemplateColumns: "1.3fr 1fr 340px", gap: 16 }}>
        {/* Left col — profile data */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* About */}
          <div style={{ background: "var(--pg-white)", border: "1px solid var(--pg-ink-100)", borderRadius: 14, padding: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 700 }}>Data diri</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 20px", marginTop: 14 }}>
              {[
                ["Nama lengkap", "Budi Santoso"],
                ["Tempat & tgl lahir", "Magelang, 15 Juli 1997"],
                ["Jenis kelamin", "Laki-laki"],
                ["Status pernikahan", "Menikah"],
                ["NIK", "3374•••••••••0015", "mono"],
                ["No. Passport", "A7842919 · exp 2029", "mono"],
              ].map(([k, v, f], i) => (
                <div key={i}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--pg-ink-400)" }}>{k}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, marginTop: 3, fontFamily: f === "mono" ? "'IBM Plex Mono', monospace" : undefined }}>{v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Qualifications */}
          <div style={{ background: "var(--pg-white)", border: "1px solid var(--pg-ink-100)", borderRadius: 14, padding: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 700 }}>Kualifikasi</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 20px", marginTop: 14 }}>
              {[
                ["Pendidikan tertinggi", "D3 Keperawatan"],
                ["Institusi", "Poltekkes Semarang"],
                ["Tahun lulus", "2019"],
                ["STR", "Aktif · exp 2028"],
                ["Bahasa Inggris", "B1 · percaya diri"],
                ["Sertifikasi lain", "BLS, BTCLS"],
              ].map(([k, v], i) => (
                <div key={i}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--pg-ink-400)" }}>{k}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, marginTop: 3 }}>{v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Work experience */}
          <div style={{ background: "var(--pg-white)", border: "1px solid var(--pg-ink-100)", borderRadius: 14, padding: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 700 }}>Pengalaman kerja</div>
            <div style={{ marginTop: 14 }}>
              {[
                { pos: "Perawat IGD", org: "RSUD Kota Semarang", date: "2022 — sekarang", dur: "4 tahun" },
                { pos: "Perawat ruang rawat inap", org: "RS Elisabeth Semarang", date: "2020 — 2022", dur: "2 tahun" },
                { pos: "Internship", org: "RSUD Tugurejo", date: "2019 — 2020", dur: "1 tahun" },
              ].map((w, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "10px 1fr", gap: 14, paddingBottom: i < 2 ? 14 : 0 }}>
                  <div style={{ position: "relative" }}>
                    <div style={{ width: 10, height: 10, borderRadius: 99, background: "var(--pg-red-600)", marginTop: 5 }}/>
                    {i < 2 && <div style={{ position: "absolute", left: 4, top: 16, bottom: -14, width: 2, background: "var(--pg-ink-100)" }}/>}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>{w.pos}</div>
                    <div style={{ fontSize: 13, color: "var(--pg-ink-700)" }}>{w.org}</div>
                    <div style={{ fontSize: 12, color: "var(--pg-ink-400)", marginTop: 2 }}>{w.date} · {w.dur}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mid col — applications + docs */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Applications */}
          <div style={{ background: "var(--pg-white)", border: "1px solid var(--pg-ink-100)", borderRadius: 14, padding: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: 14, fontWeight: 700 }}>Lamaran aktif</div>
              <div style={{ fontSize: 12, color: "var(--pg-red-600)", fontWeight: 700, cursor: "pointer" }}>Lihat semua →</div>
            </div>
            <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { r: "Perawat", c: "S. Arabia", st: "Wawancara", tier: "A", score: 91, d: "12 Apr" },
                { r: "Caregiver", c: "Taiwan", st: "Applied", tier: "B", score: 78, d: "8 Mar" },
                { r: "Perawat", c: "Singapura", st: "Rejected", tier: "C", score: 62, d: "20 Feb" },
              ].map((a, i) => {
                const stCol = { Wawancara: "warn", Applied: "info", Rejected: "mute" }[a.st];
                return (
                  <div key={i} style={{ padding: "12px 14px", background: "var(--pg-ink-50)", borderRadius: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700 }}>{a.r} · {a.c}</div>
                        <div style={{ fontSize: 11, color: "var(--pg-ink-500)", marginTop: 2 }}>Dilamar {a.d}</div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <div style={{
                          width: 22, height: 22, borderRadius: 5, color: "#fff",
                          background: { A: "var(--pg-ok)", B: "var(--pg-warn)", C: "var(--pg-ink-500)" }[a.tier],
                          display: "grid", placeItems: "center", fontSize: 11, fontWeight: 800,
                        }}>{a.tier}</div>
                        <div style={{ fontSize: 13, fontWeight: 700, fontFamily: "'IBM Plex Mono', monospace" }}>{a.score}</div>
                      </div>
                    </div>
                    <div style={{ marginTop: 8 }}><Badge variant={stCol}>{a.st}</Badge></div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Documents */}
          <div style={{ background: "var(--pg-white)", border: "1px solid var(--pg-ink-100)", borderRadius: 14, padding: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 700 }}>Dokumen</div>
            <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 6 }}>
              {[
                { n: "Passport", f: "passport.jpg", v: "ok", d: "27 Apr" },
                { n: "KTP", f: "ktp.jpg", v: "ok", d: "27 Apr" },
                { n: "STR", f: "str_2023.pdf", v: "ok", d: "27 Apr" },
                { n: "Ijazah D3", f: "ijazah.pdf", v: "pending", d: "2 hari lalu" },
                { n: "Foto profil", f: "foto.jpg", v: "ok", d: "27 Apr" },
              ].map((d, i) => (
                <div key={i} style={{ padding: "10px 12px", display: "flex", alignItems: "center", gap: 10, borderRadius: 8, background: d.v === "pending" ? "var(--pg-red-50)" : "transparent" }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 7,
                    background: "var(--pg-ink-900)", color: "#fff",
                    display: "grid", placeItems: "center",
                  }}><Icon name="doc" size={14}/></div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{d.n}</div>
                    <div style={{ fontSize: 11, color: "var(--pg-ink-500)", fontFamily: "'IBM Plex Mono', monospace" }}>{d.f}</div>
                  </div>
                  {d.v === "ok"
                    ? <Badge variant="ok" icon="check">Verified</Badge>
                    : <Badge variant="warn">Review</Badge>}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right col — score + activity */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Score card */}
          <div style={{
            background: "linear-gradient(145deg, var(--pg-red-700), var(--pg-red-600))",
            color: "#fff", borderRadius: 14, padding: 20,
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", opacity: 0.8 }}>Readiness score</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 6 }}>
              <div style={{ fontSize: 44, fontWeight: 800, letterSpacing: "-0.03em" }}>85</div>
              <div style={{ fontSize: 16, fontWeight: 700, opacity: 0.7 }}>/100</div>
            </div>
            <div style={{ fontSize: 13, marginTop: 4, opacity: 0.85 }}>Profil & dokumen hampir lengkap.</div>

            <div style={{ height: 1, background: "rgba(255,255,255,.2)", margin: "14px 0" }}/>

            {[
              ["Profil terisi", "100%"],
              ["Dokumen verified", "4/5"],
              ["Wawancara selesai", "0/1"],
            ].map(([k, v], i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", fontSize: 13 }}>
                <div style={{ opacity: 0.8 }}>{k}</div>
                <div style={{ fontWeight: 700 }}>{v}</div>
              </div>
            ))}
          </div>

          {/* Timeline */}
          <div style={{ background: "var(--pg-white)", border: "1px solid var(--pg-ink-100)", borderRadius: 14, padding: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 700 }}>Aktivitas</div>
            <div style={{ marginTop: 12 }}>
              {[
                { ic: "check", c: "var(--pg-ok)", t: "Tier A di-assign", u: "Panji A.", at: "Hari ini" },
                { ic: "doc", c: "var(--pg-info)", t: "Upload ijazah", u: "Budi S.", at: "Kemarin" },
                { ic: "briefcase", c: "var(--pg-red-600)", t: "Lamar Perawat S.Arabia", u: "Budi S.", at: "12 Apr" },
                { ic: "mail", c: "var(--pg-ink-500)", t: "Dikirim email welcome", u: "Sistem", at: "10 Mar" },
                { ic: "user", c: "var(--pg-ink-500)", t: "Daftar via Instagram ad", u: "—", at: "10 Mar" },
              ].map((e, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "26px 1fr", gap: 10, paddingBottom: i < 4 ? 14 : 0 }}>
                  <div style={{
                    width: 26, height: 26, borderRadius: 7, background: "var(--pg-ink-50)",
                    color: e.c, display: "grid", placeItems: "center",
                  }}><Icon name={e.ic} size={13} stroke={2}/></div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{e.t}</div>
                    <div style={{ fontSize: 11, color: "var(--pg-ink-400)", marginTop: 1 }}>{e.u} · {e.at}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
};

Object.assign(window, { AdminJOCreate, AdminCandidateDetail });
