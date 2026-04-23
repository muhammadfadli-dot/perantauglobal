/* App (candidate portal) screens: Dashboard, Apply flow steps, Timeline */

// ─── DASHBOARD
const ScreenDashboard = () => (
  <Phone screenKey="app-dashboard">
    <TopBarApp title="Beranda" />

    <section style={{ padding: "20px 20px 0" }}>
      <div style={{ fontSize: 15, color: "var(--pg-ink-500)" }}>Halo,</div>
      <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em", marginTop: 2 }}>Budi Santoso</div>
    </section>

    {/* Profil banner */}
    <section style={{ padding: "16px 20px 0" }}>
      <div style={{
        background: "var(--pg-red-600)", color: "#fff",
        borderRadius: "var(--pg-r-lg)", padding: "16px 18px",
        display: "flex", alignItems: "center", gap: 14, overflow: "hidden", position: "relative",
      }}>
        <div style={{ position: "relative", width: 52, height: 52, flexShrink: 0 }}>
          <svg width="52" height="52" viewBox="0 0 52 52">
            <circle cx="26" cy="26" r="22" fill="none" stroke="rgba(255,255,255,.2)" strokeWidth="5"/>
            <circle cx="26" cy="26" r="22" fill="none" stroke="#fff" strokeWidth="5"
              strokeDasharray={`${0.6 * 2 * Math.PI * 22} ${2 * Math.PI * 22}`} strokeLinecap="round"
              transform="rotate(-90 26 26)"/>
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", fontSize: 14, fontWeight: 800 }}>60%</div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 700 }}>Profil kamu 60% lengkap</div>
          <div style={{ fontSize: 13, opacity: .85, marginTop: 2 }}>Lengkapi passport & CV untuk lamar lebih cepat</div>
        </div>
        <Icon name="chevron_right" size={20}/>
      </div>
    </section>

    {/* Lamaran kamu */}
    <section style={{ padding: "24px 20px 8px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <h2 className="pg-h3">Lamaran kamu</h2>
        <div className="pg-small">2 aktif</div>
      </div>
      <div style={{ display: "grid", gap: 12 }}>
        {[
          { role: "Perawat", country: "Saudi Arabia", batch: "Batch Juni 2026", stage: "Sedang diseleksi", variant: "warn", date: "12 Apr 2026" },
          { role: "Caregiver", country: "Taiwan", batch: "Batch Mei 2026", stage: "Diterima", variant: "ok", date: "28 Mar 2026" },
        ].map((a) => (
          <div key={a.role} style={{
            background: "var(--pg-white)", border: "1px solid var(--pg-ink-100)",
            borderRadius: "var(--pg-r-lg)", padding: "16px 18px",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: 12 }}>
              <div>
                <div className="pg-small" style={{ fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--pg-ink-400)" }}>
                  {a.country}
                </div>
                <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.01em", marginTop: 2 }}>{a.role}</div>
                <div className="pg-small" style={{ marginTop: 2 }}>{a.batch}</div>
              </div>
              <Badge variant={a.variant}>{a.stage}</Badge>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--pg-ink-100)" }}>
              <div className="pg-small">Dilamar {a.date}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--pg-red-600)", fontWeight: 700, fontSize: 14 }}>
                Lihat detail <Icon name="chevron_right" size={16}/>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>

    {/* Rekomendasi */}
    <section style={{ padding: "24px 20px 28px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <h2 className="pg-h3">Cocok buat kamu</h2>
        <div style={{ color: "var(--pg-red-600)", fontWeight: 700, fontSize: 13 }}>Lihat semua</div>
      </div>
      <div style={{ display: "flex", gap: 12, overflowX: "auto", marginRight: -20, paddingRight: 20 }}>
        {[
          { role: "Barista", country: "Saudi Arabia", match: "85%", icon: "coffee" },
          { role: "Waitress", country: "Saudi Arabia", match: "78%", icon: "bowl" },
          { role: "SPG", country: "Indonesia", match: "72%", icon: "sparkle" },
        ].map((r) => (
          <div key={r.role} style={{
            minWidth: 200, background: "var(--pg-white)", border: "1px solid var(--pg-ink-100)",
            borderRadius: "var(--pg-r-lg)", overflow: "hidden", flexShrink: 0,
          }}>
            <div className="pg-redhero" style={{ padding: "14px 14px 12px", minHeight: 80 }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", opacity: .85 }}>
                {r.country}
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.02em", marginTop: 4 }}>{r.role}</div>
            </div>
            <div style={{ padding: "12px 14px" }}>
              <Badge variant="ok" icon="sparkle_dot">{r.match} cocok</Badge>
              <div style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--pg-red-600)", fontWeight: 700, fontSize: 13, marginTop: 10 }}>
                Lihat <Icon name="chevron_right" size={14}/>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>

    <BottomNav active="home"/>
  </Phone>
);

// ─── Progress header (for apply flow)
const ApplyHeader = ({ step, total = 5, title }) => (
  <div style={{ position: "sticky", top: 0, zIndex: 20, background: "var(--pg-paper)", borderBottom: "1px solid var(--pg-ink-100)" }}>
    <div style={{ display: "flex", alignItems: "center", padding: "14px 20px", gap: 12 }}>
      <button style={{
        width: 40, height: 40, borderRadius: 10, border: "1px solid var(--pg-ink-200)",
        background: "var(--pg-white)", display: "grid", placeItems: "center"
      }}><Icon name="arrow_left" size={20}/></button>
      <div style={{ flex: 1 }}>
        <div className="pg-small" style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
          Langkah {step} dari {total}
        </div>
        <div style={{ fontSize: 15, fontWeight: 700, marginTop: 2, letterSpacing: "-0.01em" }}>{title}</div>
      </div>
    </div>
    <div style={{ height: 4, background: "var(--pg-ink-100)", margin: "0 20px 12px", borderRadius: 99 }}>
      <div style={{
        height: "100%", width: `${(step / total) * 100}%`,
        background: "var(--pg-red-600)", borderRadius: 99, transition: "width .3s"
      }}/>
    </div>
  </div>
);

// ─── STEP 1 — Konfirmasi
const ScreenApplyStep1 = () => (
  <Phone screenKey="apply-1">
    <ApplyHeader step={1} title="Konfirmasi posisi"/>
    <section style={{ padding: "20px 20px 0" }}>
      <h1 className="pg-h2">Kamu mau lamar posisi ini?</h1>
      <p className="pg-body" style={{ marginTop: 8 }}>
        Kami akan bantu kamu siapkan lamaran dalam 5 langkah singkat. Kamu bisa berhenti kapan saja, progress tersimpan.
      </p>
    </section>

    <section style={{ padding: "20px 20px 0" }}>
      <div style={{
        background: "var(--pg-white)", border: "1px solid var(--pg-ink-100)",
        borderRadius: "var(--pg-r-lg)", overflow: "hidden",
      }}>
        <div className="pg-redhero" style={{ padding: "20px" }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", opacity: .85 }}>
            Saudi Arabia
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.02em", marginTop: 6 }}>Perawat.</div>
        </div>
        <div style={{ padding: "18px 20px" }}>
          {[
            ["Batch", "Juni 2026"],
            ["Slot", "0 / 12 terisi"],
            ["Deadline", "30 Juni 2026"],
            ["Kontrak", "2 tahun"],
            ["Gaji", "SAR 3.200/bulan"],
          ].map(([k, v], i) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderTop: i ? "1px solid var(--pg-ink-100)" : 0 }}>
              <div className="pg-small">{k}</div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{v}</div>
            </div>
          ))}
        </div>
      </div>
    </section>

    <section style={{ padding: "20px" }}>
      <div style={{
        display: "flex", gap: 12, alignItems: "flex-start",
        background: "var(--pg-info-bg)", padding: "14px 16px",
        borderRadius: "var(--pg-r-md)",
      }}>
        <Icon name="info" size={18} color="var(--pg-info)"/>
        <div style={{ fontSize: 13, lineHeight: 1.45, color: "var(--pg-info)" }}>
          Gratis sampai kamu menerima offering letter dari employer. Biaya Rp 20 juta baru muncul setelah diterima.
        </div>
      </div>
    </section>

    <div style={{ padding: "0 20px 24px", display: "flex", flexDirection: "column", gap: 10 }}>
      <button className="pg-btn pg-btn--primary pg-btn--block">Lanjutkan <Icon name="arrow_right" size={18}/></button>
      <button className="pg-btn pg-btn--ghost pg-btn--block">Batal</button>
    </div>
  </Phone>
);

// ─── STEP 2 — Cek requirement
const ScreenApplyStep2 = () => (
  <Phone screenKey="apply-2">
    <ApplyHeader step={2} title="Cek syarat"/>
    <section style={{ padding: "20px 20px 0" }}>
      <h1 className="pg-h2">Cocokkan data kamu.</h1>
      <p className="pg-body" style={{ marginTop: 8 }}>
        Kami bandingkan profil kamu dengan syarat posisi. Yang masih kurang, kita lengkapi sekarang.
      </p>
    </section>

    {/* Done requirements */}
    <section style={{ padding: "20px 20px 0" }}>
      <div className="pg-eyebrow" style={{ color: "var(--pg-ok)" }}>Sudah cocok</div>
      <div style={{ marginTop: 10 }}>
        {["D3 Keperawatan", "STR (Surat Tanda Registrasi) aktif"].map((t) => (
          <div key={t} style={{
            display: "flex", alignItems: "center", gap: 12, padding: "12px 14px",
            background: "var(--pg-ok-bg)", borderRadius: "var(--pg-r-md)", marginBottom: 8,
          }}>
            <div style={{
              width: 24, height: 24, borderRadius: 99, background: "var(--pg-ok)",
              color: "#fff", display: "grid", placeItems: "center"
            }}><Icon name="check" size={14} stroke={3}/></div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#134c2a" }}>{t}</div>
          </div>
        ))}
      </div>
    </section>

    {/* Missing — inline forms */}
    <section style={{ padding: "24px 20px 0" }}>
      <div className="pg-eyebrow" style={{ color: "var(--pg-red-600)" }}>Perlu dilengkapi</div>

      {/* Experience Q */}
      <div style={{
        marginTop: 10, background: "var(--pg-white)", border: "1.5px solid var(--pg-red-200)",
        borderRadius: "var(--pg-r-lg)", padding: "18px 18px 14px",
      }}>
        <div style={{ fontSize: 15, fontWeight: 700 }}>Berapa lama pengalaman kamu sebagai perawat?</div>
        <div className="pg-small" style={{ marginTop: 4 }}>Posisi ini minta minimal 1 tahun.</div>
        <div style={{ display: "grid", gap: 8, marginTop: 14 }}>
          {[
            { label: "Belum pernah", sel: false },
            { label: "Kurang dari 1 tahun", sel: false },
            { label: "1–3 tahun", sel: true },
            { label: "Lebih dari 3 tahun", sel: false },
          ].map((o) => (
            <div key={o.label} style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "12px 14px", minHeight: 48,
              border: `1.5px solid ${o.sel ? "var(--pg-red-600)" : "var(--pg-ink-200)"}`,
              background: o.sel ? "var(--pg-red-50)" : "var(--pg-white)",
              borderRadius: "var(--pg-r-md)", cursor: "pointer",
            }}>
              <div style={{
                width: 20, height: 20, borderRadius: 99,
                border: `2px solid ${o.sel ? "var(--pg-red-600)" : "var(--pg-ink-300)"}`,
                display: "grid", placeItems: "center",
              }}>
                {o.sel && <div style={{ width: 10, height: 10, borderRadius: 99, background: "var(--pg-red-600)" }}/>}
              </div>
              <div style={{ fontSize: 15, fontWeight: o.sel ? 700 : 500 }}>{o.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* English level */}
      <div style={{
        marginTop: 14, background: "var(--pg-white)", border: "1.5px solid var(--pg-red-200)",
        borderRadius: "var(--pg-r-lg)", padding: "18px",
      }}>
        <div style={{ fontSize: 15, fontWeight: 700 }}>Level bahasa Inggris kamu?</div>
        <div className="pg-small" style={{ marginTop: 4 }}>
          Saudi Arabia minta ini untuk visa kerja.
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
          {[
            { label: "Pemula", sel: false },
            { label: "B1", sel: true },
            { label: "B2 ke atas", sel: false },
          ].map((o) => (
            <div key={o.label} style={{
              padding: "10px 16px", minHeight: 44,
              display: "flex", alignItems: "center",
              border: `1.5px solid ${o.sel ? "var(--pg-red-600)" : "var(--pg-ink-200)"}`,
              background: o.sel ? "var(--pg-red-600)" : "var(--pg-white)",
              color: o.sel ? "#fff" : "var(--pg-ink-700)",
              borderRadius: "var(--pg-r-pill)", fontSize: 14, fontWeight: 700,
            }}>{o.label}</div>
          ))}
        </div>
      </div>
    </section>

    <div style={{ padding: "24px 20px 28px" }}>
      <button className="pg-btn pg-btn--primary pg-btn--block">Lanjutkan <Icon name="arrow_right" size={18}/></button>
    </div>
  </Phone>
);

// ─── STEP 3 — Dokumen
const ScreenApplyStep3 = () => (
  <Phone screenKey="apply-3">
    <ApplyHeader step={3} title="Dokumen wajib"/>
    <section style={{ padding: "20px 20px 0" }}>
      <h1 className="pg-h2">Siapkan dokumen.</h1>
      <p className="pg-body" style={{ marginTop: 8 }}>
        Foto atau scan yang jelas, max 5MB per file. Format: JPG, PNG, atau PDF.
      </p>
    </section>

    <section style={{ padding: "20px 20px 8px", display: "grid", gap: 12 }}>
      {[
        { icon: "id_card", t: "KTP", d: "Terverifikasi · diupload 5 Apr", status: "ok" },
        { icon: "passport", t: "Passport", d: "Menunggu verifikasi admin · 12 Apr", status: "warn" },
        { icon: "camera", t: "Foto formal", d: "Belum diupload", status: "miss" },
        { icon: "doc", t: "CV / Curriculum Vitae", d: "Belum diupload", status: "miss" },
      ].map((d) => (
        <div key={d.t} style={{
          background: "var(--pg-white)", border: "1px solid var(--pg-ink-100)",
          borderRadius: "var(--pg-r-lg)", padding: "14px 16px",
          display: "flex", alignItems: "center", gap: 14,
        }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: d.status === "ok" ? "var(--pg-ok-bg)" : d.status === "warn" ? "var(--pg-warn-bg)" : "var(--pg-ink-50)",
            color: d.status === "ok" ? "var(--pg-ok)" : d.status === "warn" ? "var(--pg-warn)" : "var(--pg-ink-500)",
            display: "grid", placeItems: "center", flexShrink: 0,
          }}>
            <Icon name={d.icon} size={22} stroke={2}/>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 700 }}>{d.t}</div>
            <div className="pg-small" style={{ marginTop: 2 }}>{d.d}</div>
          </div>
          {d.status === "ok" ? (
            <div style={{
              width: 28, height: 28, borderRadius: 99, background: "var(--pg-ok)",
              color: "#fff", display: "grid", placeItems: "center", flexShrink: 0,
            }}><Icon name="check" size={16} stroke={3}/></div>
          ) : d.status === "warn" ? (
            <Badge variant="warn">Review</Badge>
          ) : (
            <button style={{
              border: "1.5px solid var(--pg-red-600)", color: "var(--pg-red-600)",
              background: "transparent", fontWeight: 700, fontSize: 13,
              padding: "8px 14px", borderRadius: "var(--pg-r-pill)", display: "flex", alignItems: "center", gap: 4,
            }}><Icon name="upload" size={14}/> Upload</button>
          )}
        </div>
      ))}
    </section>

    <section style={{ padding: "16px 20px 0" }}>
      <div style={{
        padding: "14px 16px", background: "var(--pg-warn-bg)", borderRadius: "var(--pg-r-md)",
        display: "flex", gap: 10, alignItems: "flex-start",
      }}>
        <Icon name="warn" size={18} color="var(--pg-warn)"/>
        <div style={{ fontSize: 13, lineHeight: 1.45, color: "#6a4100" }}>
          2 dokumen masih kurang. Kamu bisa submit dulu dan upload nanti, tapi lamaran akan diproses setelah lengkap.
        </div>
      </div>
    </section>

    <div style={{ padding: "20px 20px 28px" }}>
      <button className="pg-btn pg-btn--primary pg-btn--block">Lanjutkan <Icon name="arrow_right" size={18}/></button>
    </div>
  </Phone>
);

// ─── STEP 5 — Review & submit
const ScreenApplyStep5 = () => (
  <Phone screenKey="apply-5">
    <ApplyHeader step={5} title="Periksa & kirim"/>

    <section style={{ padding: "20px 20px 0" }}>
      <h1 className="pg-h2">Periksa sebelum kirim.</h1>
      <p className="pg-body" style={{ marginTop: 8 }}>
        Pastikan semua benar. Setelah dikirim, tim kami akan review dalam 3–5 hari.
      </p>
    </section>

    <section style={{ padding: "20px 20px 0" }}>
      <div style={{
        background: "var(--pg-white)", border: "1px solid var(--pg-ink-100)",
        borderRadius: "var(--pg-r-lg)", padding: "18px",
      }}>
        <div className="pg-eyebrow">Posisi</div>
        <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.01em", marginTop: 4 }}>
          Perawat · Saudi Arabia
        </div>
        <div className="pg-small" style={{ marginTop: 2 }}>Batch Juni 2026 · SAR 3.200/bulan</div>
      </div>
    </section>

    <section style={{ padding: "16px 20px 0" }}>
      <div style={{
        background: "var(--pg-white)", border: "1px solid var(--pg-ink-100)",
        borderRadius: "var(--pg-r-lg)", overflow: "hidden",
      }}>
        <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--pg-ink-100)", fontSize: 13, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--pg-ink-400)" }}>
          Jawaban kamu
        </div>
        {[
          ["Pengalaman perawat", "1–3 tahun"],
          ["Bahasa Inggris", "B1"],
          ["STR aktif", "Ya"],
          ["Pendidikan", "D3 Keperawatan"],
        ].map(([k, v], i) => (
          <div key={k} style={{
            padding: "14px 18px", display: "flex", justifyContent: "space-between",
            borderTop: i ? "1px solid var(--pg-ink-100)" : 0,
          }}>
            <div className="pg-small">{k}</div>
            <div style={{ fontSize: 14, fontWeight: 700, textAlign: "right" }}>{v}</div>
          </div>
        ))}
      </div>
    </section>

    <section style={{ padding: "16px 20px 0" }}>
      <div style={{
        background: "var(--pg-white)", border: "1px solid var(--pg-ink-100)",
        borderRadius: "var(--pg-r-lg)", overflow: "hidden",
      }}>
        <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--pg-ink-100)", fontSize: 13, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--pg-ink-400)" }}>
          Dokumen
        </div>
        {[
          ["KTP", "ok"],
          ["Passport", "warn"],
          ["Foto formal", "miss"],
          ["CV", "miss"],
        ].map(([t, st], i) => (
          <div key={t} style={{
            padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center",
            borderTop: i ? "1px solid var(--pg-ink-100)" : 0,
          }}>
            <div style={{ fontSize: 14, fontWeight: 600 }}>{t}</div>
            {st === "ok" && <Badge variant="ok" icon="check">Verified</Badge>}
            {st === "warn" && <Badge variant="warn">Pending</Badge>}
            {st === "miss" && <Badge variant="err">Belum ada</Badge>}
          </div>
        ))}
      </div>
    </section>

    <section style={{ padding: "20px" }}>
      <label style={{ display: "flex", gap: 12, alignItems: "flex-start", cursor: "pointer" }}>
        <div style={{
          width: 22, height: 22, borderRadius: 6, background: "var(--pg-red-600)",
          display: "grid", placeItems: "center", flexShrink: 0, marginTop: 2,
        }}><Icon name="check" size={14} color="#fff" stroke={3}/></div>
        <div style={{ fontSize: 14, lineHeight: 1.5, color: "var(--pg-ink-700)" }}>
          Saya menyatakan semua data yang saya berikan benar dan saya setuju dengan <b style={{ color: "var(--pg-red-600)" }}>syarat & ketentuan</b> Perantau Global.
        </div>
      </label>
    </section>

    <div style={{ padding: "0 20px 28px" }}>
      <button className="pg-btn pg-btn--primary pg-btn--block">
        Kirim lamaran <Icon name="check" size={18} stroke={2.6}/>
      </button>
    </div>
  </Phone>
);

// ─── Timeline
const ScreenTimeline = () => (
  <Phone screenKey="app-timeline">
    <TopBarApp title="Status lamaran" back/>

    <section style={{ padding: "16px 20px 0" }}>
      <div className="pg-small" style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--pg-ink-400)" }}>
        Saudi Arabia · Batch Juni 2026
      </div>
      <h1 className="pg-h2" style={{ marginTop: 6 }}>Perawat</h1>
    </section>

    {/* 4-stage progress */}
    <section style={{ padding: "18px 20px 0" }}>
      <div style={{
        background: "var(--pg-white)", border: "1px solid var(--pg-ink-100)",
        borderRadius: "var(--pg-r-lg)", padding: "18px",
      }}>
        <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
          {[
            { on: true, done: true }, { on: true, done: false }, { on: false }, { on: false },
          ].map((s, i) => (
            <div key={i} style={{
              flex: 1, height: 6, borderRadius: 99,
              background: s.on ? (s.done ? "var(--pg-ok)" : "var(--pg-warn)") : "var(--pg-ink-100)",
            }}/>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 99, background: "var(--pg-warn-bg)",
            color: "var(--pg-warn)", display: "grid", placeItems: "center", flexShrink: 0,
          }}><Icon name="clock" size={20} stroke={2.2}/></div>
          <div>
            <div style={{ fontSize: 17, fontWeight: 800, letterSpacing: "-0.01em" }}>Sedang diseleksi</div>
            <div className="pg-small" style={{ marginTop: 2 }}>Biasanya selesai dalam 3–5 hari kerja</div>
          </div>
        </div>
      </div>
    </section>

    {/* Timeline */}
    <section style={{ padding: "24px 20px 8px" }}>
      <h2 className="pg-h3">Perjalanan lamaran</h2>
      <div style={{ marginTop: 14 }}>
        {[
          { date: "12 Apr 2026", t: "Lamaran diterima", d: "Lamaran kamu masuk ke sistem kami.", done: true },
          { date: "14 Apr 2026", t: "Mulai diseleksi", d: "Tim recruiter review profil & jawaban kamu.", done: true },
          { date: "18 Apr 2026", t: "Lolos seleksi awal", d: "Profil kamu cocok. Kami akan jadwalkan wawancara dalam 2–3 hari.", done: true, note: true },
          { date: "", t: "Wawancara", d: "Belum dijadwalkan.", done: false },
          { date: "", t: "Dokumen & medical", d: "", done: false },
          { date: "", t: "Diterima / offering letter", d: "", done: false },
        ].map((e, i, arr) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "28px 1fr", gap: 12, paddingBottom: i === arr.length - 1 ? 0 : 18, position: "relative" }}>
            <div style={{ position: "relative" }}>
              <div style={{
                width: 24, height: 24, borderRadius: 99,
                background: e.done ? "var(--pg-red-600)" : "var(--pg-white)",
                border: e.done ? "0" : "2px solid var(--pg-ink-200)",
                color: "#fff", display: "grid", placeItems: "center", marginTop: 4,
              }}>
                {e.done && <Icon name="check" size={14} stroke={3}/>}
              </div>
              {i < arr.length - 1 && <div style={{
                position: "absolute", left: 11, top: 30, bottom: -18, width: 2,
                background: e.done ? "var(--pg-red-600)" : "var(--pg-ink-100)",
              }}/>}
            </div>
            <div style={{ paddingTop: 2 }}>
              {e.date && <div className="pg-small" style={{ fontSize: 12, fontWeight: 700, color: "var(--pg-ink-400)" }}>{e.date}</div>}
              <div style={{ fontSize: 15, fontWeight: 700, color: e.done ? "var(--pg-ink-900)" : "var(--pg-ink-400)", marginTop: 2 }}>{e.t}</div>
              {e.d && <div className="pg-small" style={{ marginTop: 4, lineHeight: 1.45 }}>{e.d}</div>}
              {e.note && (
                <div style={{
                  marginTop: 10, padding: "12px 14px", background: "var(--pg-red-50)",
                  border: "1px solid var(--pg-red-100)", borderRadius: "var(--pg-r-md)",
                  fontSize: 13, lineHeight: 1.5, color: "var(--pg-red-800)",
                }}>
                  <div style={{ fontWeight: 700, marginBottom: 4 }}>Dari recruiter:</div>
                  "Profil kamu sudah kami review. Kami akan hubungi untuk jadwal wawancara minggu depan. Mohon siapkan ijazah asli."
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>

    <section style={{ padding: "20px 20px 28px" }}>
      <div style={{
        padding: "16px", background: "var(--pg-ink-50)", borderRadius: "var(--pg-r-md)",
        display: "flex", gap: 12, alignItems: "center",
      }}>
        <Icon name="mail" size={20} color="var(--pg-ink-500)"/>
        <div className="pg-small" style={{ flex: 1 }}>
          Ada pertanyaan? Email kami di <b style={{ color: "var(--pg-red-600)" }}>halo@perantauglobal.id</b>
        </div>
      </div>
    </section>

    <BottomNav active="apps"/>
  </Phone>
);

Object.assign(window, { ScreenDashboard, ScreenApplyStep1, ScreenApplyStep2, ScreenApplyStep3, ScreenApplyStep5, ScreenTimeline });
