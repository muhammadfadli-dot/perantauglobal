/* App screens — batch 2: Apply Step 4, Success, Profile, Explore, Sign-in flow */

// ─── STEP 4 — Pertanyaan tambahan (custom fields per posisi)
const ScreenApplyStep4 = () => (
  <Phone screenKey="apply-4">
    <ApplyHeader step={4} title="Pertanyaan tambahan"/>
    <section style={{ padding: "20px 20px 0" }}>
      <h1 className="pg-h2">Sedikit pertanyaan lagi.</h1>
      <p className="pg-body" style={{ marginTop: 8 }}>
        Ini membantu kami cocokkan kamu dengan employer yang tepat.
      </p>
    </section>

    {/* Q1 — Shift */}
    <section style={{ padding: "20px 20px 0" }}>
      <div style={{
        background: "var(--pg-white)", border: "1px solid var(--pg-ink-100)",
        borderRadius: "var(--pg-r-lg)", padding: "18px",
      }}>
        <div style={{ fontSize: 15, fontWeight: 700 }}>Kamu siap kerja shift malam?</div>
        <div className="pg-small" style={{ marginTop: 4 }}>
          Rumah sakit butuh perawat yang bisa rotasi shift pagi/malam.
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
          {[
            { label: "Ya, siap", sel: true },
            { label: "Tidak", sel: false },
            { label: "Negotiable", sel: false },
          ].map((o) => (
            <div key={o.label} style={{
              flex: 1, padding: "12px 10px", textAlign: "center",
              border: `1.5px solid ${o.sel ? "var(--pg-red-600)" : "var(--pg-ink-200)"}`,
              background: o.sel ? "var(--pg-red-600)" : "var(--pg-white)",
              color: o.sel ? "#fff" : "var(--pg-ink-700)",
              borderRadius: "var(--pg-r-md)", fontSize: 14, fontWeight: 700,
              minHeight: 48, display: "flex", alignItems: "center", justifyContent: "center",
            }}>{o.label}</div>
          ))}
        </div>
      </div>
    </section>

    {/* Q2 — Spesialisasi */}
    <section style={{ padding: "14px 20px 0" }}>
      <div style={{
        background: "var(--pg-white)", border: "1px solid var(--pg-ink-100)",
        borderRadius: "var(--pg-r-lg)", padding: "18px",
      }}>
        <div style={{ fontSize: 15, fontWeight: 700 }}>Spesialisasi perawatan apa yang kamu kuasai?</div>
        <div className="pg-small" style={{ marginTop: 4 }}>Pilih semua yang sesuai.</div>
        <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
          {[
            { l: "ICU", sel: true },
            { l: "IGD / emergency", sel: true },
            { l: "Rawat inap umum", sel: false },
            { l: "Bedah", sel: false },
            { l: "Anak", sel: false },
            { l: "Geriatri", sel: false },
          ].map((o) => (
            <div key={o.l} style={{
              padding: "10px 14px", minHeight: 40,
              display: "flex", alignItems: "center", gap: 6,
              border: `1.5px solid ${o.sel ? "var(--pg-red-600)" : "var(--pg-ink-200)"}`,
              background: o.sel ? "var(--pg-red-50)" : "var(--pg-white)",
              color: o.sel ? "var(--pg-red-700)" : "var(--pg-ink-700)",
              borderRadius: "var(--pg-r-pill)", fontSize: 14, fontWeight: 700,
            }}>
              {o.sel && <Icon name="check" size={14} stroke={3}/>}
              {o.l}
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Q3 — Kapan siap berangkat */}
    <section style={{ padding: "14px 20px 0" }}>
      <div style={{
        background: "var(--pg-white)", border: "1px solid var(--pg-ink-100)",
        borderRadius: "var(--pg-r-lg)", padding: "18px",
      }}>
        <div style={{ fontSize: 15, fontWeight: 700 }}>Kapan kamu siap berangkat?</div>
        <div className="pg-small" style={{ marginTop: 4 }}>Mempengaruhi batch yang kami tawarkan.</div>
        <div style={{ display: "grid", gap: 8, marginTop: 14 }}>
          {[
            { l: "Dalam 3 bulan", sel: false },
            { l: "3–6 bulan", sel: true },
            { l: "6–12 bulan", sel: false },
            { l: "Masih fleksibel", sel: false },
          ].map((o) => (
            <div key={o.l} style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "12px 14px", minHeight: 48,
              border: `1.5px solid ${o.sel ? "var(--pg-red-600)" : "var(--pg-ink-200)"}`,
              background: o.sel ? "var(--pg-red-50)" : "var(--pg-white)",
              borderRadius: "var(--pg-r-md)",
            }}>
              <div style={{
                width: 20, height: 20, borderRadius: 99,
                border: `2px solid ${o.sel ? "var(--pg-red-600)" : "var(--pg-ink-300)"}`,
                display: "grid", placeItems: "center",
              }}>
                {o.sel && <div style={{ width: 10, height: 10, borderRadius: 99, background: "var(--pg-red-600)" }}/>}
              </div>
              <div style={{ fontSize: 15, fontWeight: o.sel ? 700 : 500 }}>{o.l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>

    <div style={{ padding: "24px 20px 28px" }}>
      <button className="pg-btn pg-btn--primary pg-btn--block">Lanjutkan <Icon name="arrow_right" size={18}/></button>
    </div>
  </Phone>
);

// ─── SUCCESS — Lamaran terkirim
const ScreenApplySuccess = () => (
  <Phone screenKey="apply-success">
    <div style={{
      minHeight: "100%",
      display: "flex", flexDirection: "column",
      background: "var(--pg-paper)",
    }}>
      {/* top bar minimal */}
      <div style={{ padding: "14px 20px", display: "flex", justifyContent: "flex-end" }}>
        <button style={{
          width: 40, height: 40, borderRadius: 10, border: "1px solid var(--pg-ink-200)",
          background: "var(--pg-white)", display: "grid", placeItems: "center"
        }}><Icon name="x" size={20}/></button>
      </div>

      {/* Hero success */}
      <section style={{ padding: "12px 24px 0", textAlign: "center" }}>
        <div style={{ position: "relative", margin: "20px auto 0", width: 96, height: 96 }}>
          <div style={{
            position: "absolute", inset: -20, borderRadius: 99,
            background: "radial-gradient(circle, var(--pg-red-50), transparent 70%)",
          }}/>
          <div style={{
            position: "relative", width: 96, height: 96, borderRadius: 99,
            background: "var(--pg-red-600)", color: "#fff",
            display: "grid", placeItems: "center",
          }}>
            <Icon name="check" size={48} stroke={3}/>
          </div>
        </div>

        <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.02em", marginTop: 28, lineHeight: 1.1 }}>
          Lamaran kamu<br/>sudah terkirim.
        </h1>
        <p className="pg-body" style={{ marginTop: 12 }}>
          Tim recruiter kami akan review dalam <b style={{ color: "var(--pg-ink-900)" }}>3–5 hari kerja</b>. Kamu akan dapat update di email dan di aplikasi.
        </p>
      </section>

      {/* ID card */}
      <section style={{ padding: "28px 20px 0" }}>
        <div style={{
          background: "var(--pg-white)", border: "1px solid var(--pg-ink-100)",
          borderRadius: "var(--pg-r-lg)", padding: "18px",
          display: "flex", alignItems: "center", gap: 14,
        }}>
          <div style={{
            width: 44, height: 44, borderRadius: 10, background: "var(--pg-red-50)",
            color: "var(--pg-red-700)", display: "grid", placeItems: "center", flexShrink: 0,
          }}><Icon name="briefcase" size={22} stroke={2}/></div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="pg-small" style={{ fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--pg-ink-400)" }}>
              ID Lamaran
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, marginTop: 2, fontFamily: "'IBM Plex Mono', monospace" }}>
              PG-2026-04-2387
            </div>
          </div>
        </div>
      </section>

      {/* Next steps */}
      <section style={{ padding: "24px 20px 0" }}>
        <div className="pg-eyebrow">Langkah selanjutnya</div>
        <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
          {[
            { ic: "mail", t: "Cek email kamu", d: "Konfirmasi lamaran sudah kami kirim ke budi@gmail.com" },
            { ic: "clock", t: "Tunggu seleksi", d: "Rata-rata 3–5 hari kerja" },
            { ic: "bell", t: "Aktifkan notifikasi", d: "Biar kamu nggak kelewatan update" },
          ].map((s) => (
            <div key={s.t} style={{
              display: "flex", gap: 12, padding: "14px 16px",
              background: "var(--pg-white)", border: "1px solid var(--pg-ink-100)",
              borderRadius: "var(--pg-r-md)",
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: 10,
                background: "var(--pg-ink-50)", color: "var(--pg-ink-700)",
                display: "grid", placeItems: "center", flexShrink: 0,
              }}><Icon name={s.ic} size={16} stroke={2}/></div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{s.t}</div>
                <div className="pg-small" style={{ marginTop: 2, lineHeight: 1.4 }}>{s.d}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div style={{ flex: 1 }}/>

      {/* CTAs */}
      <div style={{ padding: "20px 20px 28px", display: "grid", gap: 10 }}>
        <button className="pg-btn pg-btn--primary pg-btn--block">Lihat status lamaran</button>
        <button className="pg-btn pg-btn--ghost pg-btn--block">Jelajah lowongan lain</button>
      </div>
    </div>
  </Phone>
);

// ─── PROFILE
const ScreenProfile = () => (
  <Phone screenKey="app-profile">
    <TopBarApp title="Profil" back/>

    {/* Header */}
    <section style={{ padding: "20px 20px 0" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{
          width: 68, height: 68, borderRadius: 99,
          background: "var(--pg-red-600)", color: "#fff",
          display: "grid", placeItems: "center",
          fontSize: 26, fontWeight: 800, letterSpacing: "-0.02em",
        }}>BS</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.01em" }}>Budi Santoso</div>
          <div className="pg-small" style={{ marginTop: 2 }}>Jakarta · 25 tahun · Laki-laki</div>
        </div>
      </div>

      {/* Completion */}
      <div style={{
        marginTop: 16, padding: "14px 16px",
        background: "var(--pg-red-50)", border: "1px solid var(--pg-red-100)",
        borderRadius: "var(--pg-r-md)",
        display: "flex", alignItems: "center", gap: 12,
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 700, color: "var(--pg-red-800)" }}>
            <span>Profil 60% lengkap</span>
            <span>3 dari 5</span>
          </div>
          <div style={{ height: 6, background: "var(--pg-red-100)", borderRadius: 99, marginTop: 8, overflow: "hidden" }}>
            <div style={{ width: "60%", height: "100%", background: "var(--pg-red-600)", borderRadius: 99 }}/>
          </div>
        </div>
      </div>
    </section>

    {/* Section — Data diri */}
    <section style={{ padding: "24px 20px 0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <div className="pg-eyebrow">Data diri</div>
        <div style={{ color: "var(--pg-red-600)", fontWeight: 700, fontSize: 13 }}>Edit</div>
      </div>
      <div style={{
        background: "var(--pg-white)", border: "1px solid var(--pg-ink-100)",
        borderRadius: "var(--pg-r-lg)", overflow: "hidden",
      }}>
        {[
          ["Tanggal lahir", "12 Mei 2001"],
          ["Gender", "Laki-laki"],
          ["Kota", "Jakarta"],
          ["Pendidikan", "D3 Keperawatan"],
        ].map(([k, v], i) => (
          <div key={k} style={{
            padding: "14px 18px", display: "flex", justifyContent: "space-between",
            borderTop: i ? "1px solid var(--pg-ink-100)" : 0,
          }}>
            <div className="pg-small">{k}</div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>{v}</div>
          </div>
        ))}
      </div>
    </section>

    {/* Section — Dokumen */}
    <section style={{ padding: "20px 20px 0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <div className="pg-eyebrow">Dokumen</div>
        <div style={{ fontSize: 13, color: "var(--pg-ink-500)", fontWeight: 600 }}>2 / 4</div>
      </div>
      <div style={{ display: "grid", gap: 8 }}>
        {[
          { ic: "id_card", t: "KTP", st: "ok" },
          { ic: "passport", t: "Passport", st: "warn" },
          { ic: "camera", t: "Foto formal", st: "miss" },
          { ic: "doc", t: "CV", st: "miss" },
        ].map((d) => (
          <div key={d.t} style={{
            background: "var(--pg-white)", border: "1px solid var(--pg-ink-100)",
            borderRadius: "var(--pg-r-md)", padding: "12px 14px",
            display: "flex", alignItems: "center", gap: 12,
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: d.st === "ok" ? "var(--pg-ok-bg)" : d.st === "warn" ? "var(--pg-warn-bg)" : "var(--pg-ink-50)",
              color: d.st === "ok" ? "var(--pg-ok)" : d.st === "warn" ? "var(--pg-warn)" : "var(--pg-ink-500)",
              display: "grid", placeItems: "center", flexShrink: 0,
            }}><Icon name={d.ic} size={18} stroke={2}/></div>
            <div style={{ flex: 1, fontSize: 14, fontWeight: 700 }}>{d.t}</div>
            {d.st === "ok" && <Badge variant="ok" icon="check">Verified</Badge>}
            {d.st === "warn" && <Badge variant="warn">Review</Badge>}
            {d.st === "miss" && <Badge variant="err">Belum ada</Badge>}
          </div>
        ))}
      </div>
    </section>

    {/* Section — Kualifikasi */}
    <section style={{ padding: "20px 20px 0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <div className="pg-eyebrow">Kualifikasi</div>
        <div style={{ color: "var(--pg-red-600)", fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", gap: 4 }}>
          <Icon name="plus" size={14} stroke={2.4}/> Tambah
        </div>
      </div>
      <div style={{
        background: "var(--pg-white)", border: "1px solid var(--pg-ink-100)",
        borderRadius: "var(--pg-r-lg)", overflow: "hidden",
      }}>
        {[
          ["Bahasa Inggris", "B1 · Intermediate"],
          ["STR", "Aktif · exp 2028"],
          ["JLPT", "Belum diisi"],
          ["SIM", "Belum diisi"],
        ].map(([k, v], i) => (
          <div key={k} style={{
            padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center",
            borderTop: i ? "1px solid var(--pg-ink-100)" : 0,
          }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700 }}>{k}</div>
              <div className="pg-small" style={{ marginTop: 2, color: v.includes("Belum") ? "var(--pg-ink-400)" : "var(--pg-ink-500)" }}>{v}</div>
            </div>
            <Icon name="chevron_right" size={18} color="var(--pg-ink-400)"/>
          </div>
        ))}
      </div>
    </section>

    {/* Pengalaman */}
    <section style={{ padding: "20px 20px 0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <div className="pg-eyebrow">Pengalaman kerja</div>
        <div style={{ color: "var(--pg-red-600)", fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", gap: 4 }}>
          <Icon name="plus" size={14} stroke={2.4}/> Tambah
        </div>
      </div>
      <div style={{
        background: "var(--pg-white)", border: "1px solid var(--pg-ink-100)",
        borderRadius: "var(--pg-r-lg)", padding: "16px 18px",
      }}>
        <div style={{ fontSize: 15, fontWeight: 700 }}>Perawat — RS Hermina Jakarta</div>
        <div className="pg-small" style={{ marginTop: 4 }}>Jan 2022 – Feb 2024 · 2 tahun 1 bulan</div>
        <div className="pg-small" style={{ marginTop: 8, lineHeight: 1.5, color: "var(--pg-ink-500)" }}>
          Perawat unit rawat inap dewasa, rotasi shift, fokus pasien pasca bedah.
        </div>
      </div>
    </section>

    <section style={{ padding: "20px" }}>
      <button className="pg-btn pg-btn--ghost pg-btn--block">Keluar dari akun</button>
    </section>

    <BottomNav active="profile"/>
  </Phone>
);

// ─── EXPLORE / JELAJAH
const ScreenExplore = () => (
  <Phone screenKey="app-explore">
    <TopBarApp title="Jelajah lowongan"/>

    {/* Tabs */}
    <section style={{ padding: "12px 20px 0" }}>
      <div style={{ display: "flex", background: "var(--pg-ink-100)", padding: 4, borderRadius: "var(--pg-r-pill)" }}>
        {[
          { l: "Lagi buka", c: 1, sel: true },
          { l: "Semua posisi", c: 13, sel: false },
        ].map((t) => (
          <div key={t.l} style={{
            flex: 1, padding: "10px 12px", textAlign: "center",
            background: t.sel ? "var(--pg-white)" : "transparent",
            borderRadius: "var(--pg-r-pill)",
            fontSize: 14, fontWeight: 700,
            color: t.sel ? "var(--pg-ink-900)" : "var(--pg-ink-500)",
            boxShadow: t.sel ? "0 1px 3px rgba(0,0,0,.08)" : "none",
          }}>{t.l} · {t.c}</div>
        ))}
      </div>
    </section>

    <section style={{ padding: "16px 20px 0" }}>
      <div className="pg-small" style={{ marginBottom: 10 }}>
        Diurutkan dari yang paling cocok untuk kamu.
      </div>
    </section>

    {/* Ranked list */}
    <section style={{ padding: "4px 20px 20px", display: "grid", gap: 14 }}>
      {/* Perfect match — open batch */}
      <div style={{
        background: "var(--pg-white)", border: "1.5px solid var(--pg-red-200)",
        borderRadius: "var(--pg-r-lg)", overflow: "hidden",
      }}>
        <div className="pg-redhero" style={{ padding: "16px", minHeight: 96, position: "relative" }}>
          <div style={{
            position: "absolute", top: 12, right: 12,
            padding: "4px 10px", background: "rgba(255,255,255,.16)",
            borderRadius: "var(--pg-r-pill)", fontSize: 11, fontWeight: 700, letterSpacing: "0.06em",
          }}>90% COCOK</div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", opacity: .85 }}>
            Saudi Arabia · Batch Juni 2026
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em", marginTop: 6 }}>Perawat</div>
        </div>
        <div style={{ padding: "14px 16px" }}>
          <div style={{ fontSize: 18, fontWeight: 800 }}>SAR 3.200<span style={{ fontSize: 13, color: "var(--pg-ink-500)", fontWeight: 500 }}> / bulan</span></div>
          <div style={{ marginTop: 10, display: "grid", gap: 6 }}>
            {[
              { t: "Semua syarat wajib kamu penuhi", ok: true },
              { t: "Pengalaman 1–3 tahun cocok", ok: true },
              { t: "Kamu siap berangkat 3–6 bulan", ok: true },
            ].map((f, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
                <Icon name="check" size={14} color="var(--pg-ok)" stroke={3}/>
                <span>{f.t}</span>
              </div>
            ))}
          </div>
          <button className="pg-btn pg-btn--primary pg-btn--block" style={{ marginTop: 14, minHeight: 44 }}>
            Lamar posisi ini
          </button>
        </div>
      </div>

      {/* Partial match */}
      <div style={{
        background: "var(--pg-white)", border: "1px solid var(--pg-ink-100)",
        borderRadius: "var(--pg-r-lg)", overflow: "hidden",
      }}>
        <div style={{ padding: "16px", display: "flex", gap: 14 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 12,
            background: "var(--pg-red-50)", color: "var(--pg-red-700)",
            display: "grid", placeItems: "center", flexShrink: 0,
          }}><Icon name="coffee" size={26} stroke={2}/></div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="pg-small" style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--pg-ink-400)" }}>
              Saudi Arabia
            </div>
            <div style={{ fontSize: 17, fontWeight: 800, marginTop: 2 }}>Barista</div>
            <div className="pg-small" style={{ marginTop: 2 }}>SAR 1.500 + makan SAR 300</div>
          </div>
          <Badge variant="mute">Antrian</Badge>
        </div>
        <div style={{ padding: "0 16px 14px" }}>
          <div style={{
            padding: "10px 12px", background: "var(--pg-warn-bg)",
            borderRadius: "var(--pg-r-md)", display: "flex", gap: 8, alignItems: "center",
          }}>
            <Icon name="warn" size={16} color="var(--pg-warn)"/>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#6a4100" }}>
              Perlu: sertifikat bahasa Inggris aktif
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--pg-ink-700)" }}>
              <span style={{ color: "var(--pg-warn)" }}>40%</span> · Lengkapi profil
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--pg-red-600)", fontWeight: 700, fontSize: 13 }}>
              Lihat <Icon name="chevron_right" size={14}/>
            </div>
          </div>
        </div>
      </div>

      {/* Low match */}
      <div style={{
        background: "var(--pg-white)", border: "1px solid var(--pg-ink-100)",
        borderRadius: "var(--pg-r-lg)", padding: "16px",
        display: "flex", gap: 14, alignItems: "center",
      }}>
        <div style={{
          width: 52, height: 52, borderRadius: 12,
          background: "var(--pg-ink-50)", color: "var(--pg-ink-500)",
          display: "grid", placeItems: "center", flexShrink: 0,
        }}><Icon name="truck" size={26} stroke={2}/></div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="pg-small" style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--pg-ink-400)" }}>
            Jepang
          </div>
          <div style={{ fontSize: 17, fontWeight: 800, marginTop: 2 }}>Truck Driver</div>
          <div className="pg-small" style={{ marginTop: 4 }}>Kurang 3 syarat utama</div>
        </div>
        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--pg-ink-400)" }}>15%</div>
      </div>
    </section>

    <BottomNav active="explore"/>
  </Phone>
);

// ─── SIGN IN (form bio)
const ScreenSignIn = () => (
  <Phone screenKey="signin">
    {/* Top red ribbon */}
    <div style={{
      background: "var(--pg-red-600)", color: "#fff",
      padding: "20px 24px 24px",
      display: "flex", alignItems: "center", gap: 10,
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: 8, background: "#fff",
        color: "var(--pg-red-600)", display: "grid", placeItems: "center",
        fontWeight: 800, fontSize: 16, letterSpacing: "-0.02em",
      }}>P</div>
      <div style={{ fontWeight: 800, fontSize: 17 }}>PerantauGlobal</div>
    </div>

    <section style={{ padding: "32px 24px 0" }}>
      <h1 className="pg-h1">Masuk atau<br/>daftar dulu.</h1>
      <p className="pg-body" style={{ marginTop: 10 }}>
        Kami kirim link ke emailmu — tinggal klik, tanpa password.
      </p>
    </section>

    <section style={{ padding: "28px 24px 0" }}>
      <label style={{ fontSize: 13, fontWeight: 700, color: "var(--pg-ink-500)", display: "block", marginBottom: 8 }}>
        Nama lengkap
      </label>
      <div style={{
        background: "var(--pg-white)", border: "1.5px solid var(--pg-ink-200)",
        borderRadius: "var(--pg-r-md)", padding: "14px 16px",
        fontSize: 16, color: "var(--pg-ink-900)", fontWeight: 600,
      }}>Budi Santoso</div>

      <label style={{ fontSize: 13, fontWeight: 700, color: "var(--pg-ink-500)", display: "block", marginTop: 16, marginBottom: 8 }}>
        Email
      </label>
      <div style={{
        background: "var(--pg-white)", border: "1.5px solid var(--pg-red-600)",
        borderRadius: "var(--pg-r-md)", padding: "14px 16px",
        fontSize: 16, color: "var(--pg-ink-900)", fontWeight: 600,
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <Icon name="mail" size={18} color="var(--pg-red-600)"/>
        <span>budi@gmail.com</span>
      </div>

      <label style={{ fontSize: 13, fontWeight: 700, color: "var(--pg-ink-500)", display: "block", marginTop: 16, marginBottom: 8 }}>
        Nomor HP <span style={{ color: "var(--pg-ink-400)", fontWeight: 500 }}>(opsional)</span>
      </label>
      <div style={{
        background: "var(--pg-white)", border: "1.5px solid var(--pg-ink-200)",
        borderRadius: "var(--pg-r-md)", padding: "14px 16px",
        fontSize: 16, color: "var(--pg-ink-400)", fontWeight: 500,
      }}>+62 ...</div>

      <div style={{
        marginTop: 14, padding: "12px 14px",
        background: "var(--pg-info-bg)", borderRadius: "var(--pg-r-md)",
        display: "flex", gap: 10, alignItems: "flex-start",
      }}>
        <Icon name="info" size={16} color="var(--pg-info)"/>
        <div style={{ fontSize: 12, lineHeight: 1.45, color: "var(--pg-info)" }}>
          Kami tidak akan pernah kirim spam atau bagikan data kamu ke pihak ketiga.
        </div>
      </div>
    </section>

    <div style={{ flex: 1 }}/>
    <div style={{ padding: "24px 24px 28px" }}>
      <button className="pg-btn pg-btn--primary pg-btn--block">
        Kirim link ke email <Icon name="arrow_right" size={18}/>
      </button>
      <div className="pg-small" style={{ textAlign: "center", marginTop: 12 }}>
        Sudah pernah daftar? Tetap masuk pakai link email.
      </div>
    </div>
  </Phone>
);

// ─── CHECK EMAIL
const ScreenCheckEmail = () => (
  <Phone screenKey="check-email">
    <div style={{ padding: "14px 20px", display: "flex", justifyContent: "flex-start" }}>
      <button style={{
        width: 40, height: 40, borderRadius: 10, border: "1px solid var(--pg-ink-200)",
        background: "var(--pg-white)", display: "grid", placeItems: "center"
      }}><Icon name="arrow_left" size={20}/></button>
    </div>

    <section style={{ padding: "20px 24px 0", textAlign: "center" }}>
      <div style={{ position: "relative", margin: "40px auto 0", width: 120, height: 120 }}>
        <div style={{
          position: "absolute", inset: 0, borderRadius: 99,
          background: "var(--pg-red-50)",
        }}/>
        <div style={{
          position: "absolute", inset: 18, borderRadius: 99,
          background: "var(--pg-red-100)",
        }}/>
        <div style={{
          position: "absolute", inset: 34, borderRadius: 99,
          background: "var(--pg-red-600)", color: "#fff",
          display: "grid", placeItems: "center",
        }}>
          <Icon name="mail" size={28} stroke={2.2}/>
        </div>
      </div>

      <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.02em", marginTop: 32, lineHeight: 1.1 }}>
        Cek email kamu.
      </h1>
      <p className="pg-body" style={{ marginTop: 12, maxWidth: 300, marginLeft: "auto", marginRight: "auto" }}>
        Kami kirim link masuk ke
      </p>
      <div style={{ fontSize: 17, fontWeight: 800, color: "var(--pg-red-600)", marginTop: 6 }}>
        budi@gmail.com
      </div>
      <p className="pg-body" style={{ marginTop: 16, maxWidth: 320, marginLeft: "auto", marginRight: "auto", fontSize: 14 }}>
        Link berlaku 15 menit. Tinggal klik tombol di email untuk masuk ke Talent Hub.
      </p>
    </section>

    <section style={{ padding: "28px 20px 0" }}>
      <div style={{
        background: "var(--pg-white)", border: "1px solid var(--pg-ink-100)",
        borderRadius: "var(--pg-r-lg)", padding: "16px 18px",
      }}>
        <div style={{ fontSize: 13, fontWeight: 700 }}>Belum ada email masuk?</div>
        <ul style={{ margin: "10px 0 0", paddingLeft: 18, fontSize: 13, color: "var(--pg-ink-500)", lineHeight: 1.6 }}>
          <li>Cek folder Spam atau Promosi</li>
          <li>Tunggu 1–2 menit, kadang sedikit delay</li>
          <li>Pastikan email kamu benar</li>
        </ul>
      </div>
    </section>

    <div style={{ flex: 1 }}/>
    <div style={{ padding: "24px 20px 28px", display: "grid", gap: 10 }}>
      <button className="pg-btn pg-btn--ghost pg-btn--block">Kirim ulang link</button>
      <button style={{ background: "transparent", border: 0, color: "var(--pg-ink-500)", fontSize: 14, fontWeight: 600, padding: 8 }}>
        Ganti email
      </button>
    </div>
  </Phone>
);

Object.assign(window, { ScreenApplyStep4, ScreenApplySuccess, ScreenProfile, ScreenExplore, ScreenSignIn, ScreenCheckEmail });
