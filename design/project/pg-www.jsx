/* WWW screens: Home, Lowongan index, Lowongan detail */

const POSITIONS = [
  { slug: "perawat-saudi-arabia", role: "Perawat", country: "Saudi Arabia", salary: "SAR 3.200", salaryNote: "+ makan SAR 200", gender: "Wanita", age: "21–38", icon: "stethoscope", status: "open", batch: "Batch Juni 2026", slots: "0/12" },
  { slug: "barista-saudi-arabia", role: "Barista", country: "Saudi Arabia", salary: "SAR 1.500", salaryNote: "+ makan SAR 300", gender: "L/P", age: "21–30", icon: "coffee", status: "queue" },
  { slug: "waiter-saudi-arabia", role: "Waiter", country: "Saudi Arabia", salary: "SAR 1.500", salaryNote: "+ makan SAR 300", gender: "Laki-laki", age: "21–30", icon: "bowl", status: "queue" },
  { slug: "kaigo-jepang", role: "Caregiver Panti", country: "Jepang", salary: "¥190.000", salaryNote: "/bulan THP", gender: "Wanita", age: "18–35", icon: "heart", status: "queue" },
  { slug: "truck-driver-jepang", role: "Truck Driver", country: "Jepang", salary: "¥250.000", salaryNote: "/bulan", gender: "Laki-laki", age: "max 44", icon: "truck", status: "queue" },
  { slug: "caregiver-taiwan", role: "Caregiver", country: "Taiwan", salary: "NT$ 29.500", salaryNote: "/bulan", gender: "Wanita", age: "20–40", icon: "heart", status: "queue" },
];

// ───────── Position card (used on home + index)
const PositionCard = ({ p }) => (
  <div style={{
    background: "var(--pg-white)",
    borderRadius: "var(--pg-r-lg)",
    border: "1px solid var(--pg-ink-100)",
    overflow: "hidden",
  }}>
    {/* Red typographic header */}
    <div className="pg-redhero" style={{ padding: "16px 16px 14px", position: "relative", minHeight: 108 }}>
      <div style={{
        position: "absolute", top: 12, right: 12,
        width: 36, height: 36, borderRadius: 10,
        background: "rgba(255,255,255,.14)",
        display: "grid", placeItems: "center", color: "#fff"
      }}>
        <Icon name={p.icon} size={20} stroke={2} />
      </div>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", opacity: .85 }}>
        {p.country}
      </div>
      <div style={{ fontSize: 24, fontWeight: 800, lineHeight: 1.05, letterSpacing: "-0.02em", marginTop: 6 }}>
        {p.role}
      </div>
    </div>
    <div style={{ padding: 16 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
        <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.01em" }}>{p.salary}</div>
        <div className="pg-small">{p.salaryNote}</div>
      </div>
      <div style={{ display: "flex", gap: 10, marginTop: 10, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13, color: "var(--pg-ink-500)" }}>
          <Icon name="user" size={14} /> {p.gender}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13, color: "var(--pg-ink-500)" }}>
          <Icon name="clock" size={14} /> {p.age} th
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 14 }}>
        {p.status === "open"
          ? <Badge variant="ok"><StatusDot color="var(--pg-ok)"/> Lagi buka</Badge>
          : <Badge variant="mute"><StatusDot color="var(--pg-ink-300)"/> Daftar antrian</Badge>}
        <div style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--pg-red-600)", fontWeight: 700, fontSize: 14 }}>
          Detail <Icon name="chevron_right" size={16} />
        </div>
      </div>
    </div>
  </div>
);

// ───────── Homepage
const ScreenHome = () => (
  <Phone screenKey="home-www">
    <TopBarWWW />

    {/* HERO */}
    <section style={{ padding: "28px 20px 28px" }}>
      <div className="pg-eyebrow">Perantau Global · Sejak 1998</div>
      <h1 className="pg-h1" style={{ marginTop: 10, fontSize: 34, lineHeight: 1.1 }}>
        Kerja luar negeri<br/>yang <span style={{ color: "var(--pg-red-600)" }}>sah & terjamin.</span>
      </h1>
      <p className="pg-body" style={{ marginTop: 12, maxWidth: 320 }}>
        Lisensi resmi P3MI. Kami bantu kamu dari daftar sampai berangkat — bebas biaya sebelum terima offering letter.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 22 }}>
        <button className="pg-btn pg-btn--primary pg-btn--block">
          Lihat lowongan <Icon name="arrow_right" size={18}/>
        </button>
        <button className="pg-btn pg-btn--ghost pg-btn--block">
          Buka Talent Hub
        </button>
      </div>

      {/* Proof strip */}
      <div style={{
        marginTop: 22, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 0,
        background: "var(--pg-white)", border: "1px solid var(--pg-ink-100)",
        borderRadius: "var(--pg-r-lg)", overflow: "hidden",
      }}>
        {[
          { k: "28", l: "Tahun\npengalaman" },
          { k: "P3MI", l: "Lisensi\nresmi" },
          { k: "13", l: "Posisi\ntersedia" },
        ].map((s, i) => (
          <div key={i} style={{ padding: "14px 10px", textAlign: "center", borderLeft: i ? "1px solid var(--pg-ink-100)" : "0" }}>
            <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.02em", color: "var(--pg-red-600)" }}>{s.k}</div>
            <div className="pg-small" style={{ whiteSpace: "pre-line", lineHeight: 1.25 }}>{s.l}</div>
          </div>
        ))}
      </div>
    </section>

    {/* LOWONGAN AKTIF */}
    <section style={{ padding: "8px 20px 28px" }}>
      <div style={{ display: "flex", alignItems: "end", justifyContent: "space-between", marginBottom: 14 }}>
        <div>
          <div className="pg-eyebrow">Lowongan</div>
          <h2 className="pg-h2" style={{ marginTop: 4 }}>Lagi buka sekarang</h2>
        </div>
      </div>
      <div style={{ display: "grid", gap: 14 }}>
        <PositionCard p={POSITIONS[0]} />
        <PositionCard p={POSITIONS[1]} />
      </div>
      <button className="pg-btn pg-btn--ghost pg-btn--block" style={{ marginTop: 16 }}>
        Lihat semua 13 lowongan <Icon name="arrow_right" size={16}/>
      </button>
    </section>

    {/* CARA KERJA */}
    <section style={{ padding: "16px 20px 28px", background: "var(--pg-ink-900)", color: "#fff", margin: "16px 0" }}>
      <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--pg-red-500)" }}>
        Cara kerja
      </div>
      <h2 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em", marginTop: 6, marginBottom: 18 }}>
        4 langkah<br/>sampai berangkat.
      </h2>
      {[
        { n: "01", t: "Daftar", d: "Isi data singkat, kami kirim link lewat email." },
        { n: "02", t: "Lengkapi profil", d: "Upload KTP, passport, foto, dan CV — sekali saja." },
        { n: "03", t: "Apply lowongan", d: "Pilih posisi, jawab pertanyaan tambahan." },
        { n: "04", t: "Berangkat", d: "Rata-rata 4 bulan dari daftar sampai terbang." },
      ].map((s, i) => (
        <div key={i} style={{
          display: "grid", gridTemplateColumns: "44px 1fr", gap: 14,
          padding: "14px 0", borderTop: i ? "1px solid rgba(255,255,255,.08)" : "0",
        }}>
          <div style={{ fontSize: 13, fontFamily: "'IBM Plex Mono', monospace", color: "var(--pg-red-500)", fontWeight: 600 }}>{s.n}</div>
          <div>
            <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: "-0.01em" }}>{s.t}</div>
            <div style={{ fontSize: 14, color: "rgba(255,255,255,.68)", marginTop: 2, lineHeight: 1.45 }}>{s.d}</div>
          </div>
        </div>
      ))}
    </section>

    {/* TENTANG */}
    <section style={{ padding: "8px 20px 28px" }}>
      <div className="pg-eyebrow">Tentang kami</div>
      <h2 className="pg-h2" style={{ marginTop: 6 }}>DTG — 28 tahun bantu PMI Indonesia.</h2>
      <p className="pg-body" style={{ marginTop: 10 }}>
        Kami perusahaan penempatan PMI dengan lisensi resmi P3MI dari Kemnaker. Semua proses transparan, tercatat, dan sesuai regulasi.
      </p>
      <button className="pg-btn pg-btn--ghost" style={{ marginTop: 14, minHeight: 44, padding: "0 16px" }}>
        Pelajari lebih lanjut <Icon name="arrow_right" size={16}/>
      </button>
    </section>

    {/* FAQ */}
    <section style={{ padding: "8px 20px 28px" }}>
      <div className="pg-eyebrow">FAQ</div>
      <h2 className="pg-h2" style={{ marginTop: 6, marginBottom: 12 }}>Pertanyaan umum</h2>
      {[
        "Apakah benar-benar bebas biaya?",
        "Berapa lama proses dari daftar sampai berangkat?",
        "Posisi mana yang paling cocok untuk saya?",
        "Bagaimana jika saya belum punya passport?",
        "Apakah kontrak bisa diperpanjang?",
      ].map((q, i) => (
        <button key={i} style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          width: "100%", padding: "16px 0", border: 0,
          borderTop: i ? "1px solid var(--pg-ink-100)" : "0",
          background: "transparent", textAlign: "left", cursor: "pointer",
        }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: "var(--pg-ink-900)", paddingRight: 12 }}>{q}</span>
          <Icon name="chevron_down" size={18} color="var(--pg-ink-400)"/>
        </button>
      ))}
    </section>

    {/* FOOTER */}
    <section style={{ padding: "24px 20px 36px", background: "var(--pg-ink-900)", color: "#fff" }}>
      <div style={{ fontWeight: 800, fontSize: 18, letterSpacing: "-0.01em" }}>
        Perantau<span style={{ color: "var(--pg-red-500)" }}>Global</span>
      </div>
      <div style={{ fontSize: 13, color: "rgba(255,255,255,.6)", marginTop: 6 }}>
        Lisensi P3MI · Sejak 1998
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 18, fontSize: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Icon name="mail" size={16} color="rgba(255,255,255,.7)"/> halo@perantauglobal.id
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Icon name="pin" size={16} color="rgba(255,255,255,.7)"/> Jakarta, Indonesia
        </div>
      </div>
      <div style={{ marginTop: 24, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,.1)", fontSize: 12, color: "rgba(255,255,255,.5)" }}>
        © 2026 Dian Tama Gemilang. All rights reserved.
      </div>
    </section>
  </Phone>
);

// ───────── Lowongan index
const ScreenLowongan = () => {
  const filters = ["Semua", "Saudi", "Jepang", "Taiwan", "Indonesia"];
  const activeFilter = 0;
  return (
    <Phone screenKey="lowongan-index">
      <TopBarWWW />
      <section style={{ padding: "24px 20px 12px" }}>
        <div className="pg-eyebrow">13 posisi</div>
        <h1 className="pg-h1" style={{ marginTop: 8 }}>Lowongan kerja.</h1>
        <p className="pg-body" style={{ marginTop: 8 }}>
          Pilih posisi yang cocok. Badge hijau = batch sedang dibuka.
        </p>
      </section>

      {/* Filter chips */}
      <div style={{
        display: "flex", gap: 8, overflowX: "auto", padding: "8px 20px 16px",
      }}>
        {filters.map((f, i) => (
          <div key={f} className={`pg-chip ${i === activeFilter ? "pg-chip--active" : ""}`}>{f}</div>
        ))}
      </div>

      {/* Results */}
      <section style={{ padding: "4px 20px 28px", display: "grid", gap: 14 }}>
        {POSITIONS.map((p) => <PositionCard key={p.slug} p={p} />)}
      </section>

      <section style={{ padding: "28px 20px", background: "var(--pg-ink-50)", borderTop: "1px solid var(--pg-ink-100)" }}>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, background: "var(--pg-red-100)",
            color: "var(--pg-red-700)", display: "grid", placeItems: "center", flexShrink: 0,
          }}>
            <Icon name="info" size={20}/>
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>Belum ada batch yang cocok?</div>
            <div className="pg-small" style={{ marginTop: 4 }}>
              Daftar antrian untuk posisi yang kamu minati. Kami kabari lewat email saat batch baru dibuka.
            </div>
          </div>
        </div>
      </section>
    </Phone>
  );
};

// ───────── Lowongan detail
const ScreenDetail = () => (
  <Phone screenKey="lowongan-detail">
    {/* inline top bar over hero */}
    <div style={{ position: "sticky", top: 0, zIndex: 30, display: "flex", justifyContent: "space-between", padding: "14px 20px", background: "transparent" }}>
      <button style={{
        width: 40, height: 40, borderRadius: 99, border: 0,
        background: "rgba(255,255,255,.92)", display: "grid", placeItems: "center",
        boxShadow: "var(--pg-shadow-1)"
      }}><Icon name="arrow_left" size={20}/></button>
    </div>
    <div style={{ marginTop: -56 }}>
      <RedHero
        role="Perawat"
        country="Saudi Arabia"
        meta={[
          { icon: "wallet", label: "SAR 3.200/bulan" },
          { icon: "clock", label: "Kontrak 2 tahun" },
        ]}
      />
    </div>

    {/* Batch status */}
    <section style={{ padding: "18px 20px 0" }}>
      <div style={{
        background: "var(--pg-ok-bg)", border: "1px solid #c6e6d2",
        borderRadius: "var(--pg-r-lg)", padding: "14px 16px",
        display: "flex", alignItems: "center", gap: 12,
      }}>
        <StatusDot color="var(--pg-ok)"/>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: "var(--pg-ok)" }}>
            Batch Juni 2026 · lagi buka
          </div>
          <div className="pg-small" style={{ color: "#1a5f36", marginTop: 2 }}>
            0 / 12 terisi · deadline 30 Juni 2026
          </div>
        </div>
      </div>
    </section>

    {/* Detail posisi */}
    <section style={{ padding: "24px 20px 8px" }}>
      <h2 className="pg-h3">Detail posisi</h2>
      <div style={{ marginTop: 12, background: "var(--pg-white)", border: "1px solid var(--pg-ink-100)", borderRadius: "var(--pg-r-lg)" }}>
        {[
          ["Lokasi", "Saudi Arabia (multi-kota)"],
          ["Jam kerja", "8 jam · 6 hari/minggu"],
          ["Kontrak", "2 tahun"],
          ["Masa percobaan", "90 hari"],
        ].map(([k, v], i) => (
          <div key={k} style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "14px 16px",
            borderTop: i ? "1px solid var(--pg-ink-100)" : "0",
          }}>
            <div className="pg-small">{k}</div>
            <div style={{ fontWeight: 600, fontSize: 14, color: "var(--pg-ink-900)", textAlign: "right" }}>{v}</div>
          </div>
        ))}
      </div>
    </section>

    {/* Benefit */}
    <section style={{ padding: "20px 20px 8px" }}>
      <h2 className="pg-h3">Yang kamu dapat</h2>
      <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
        {[
          { ic: "wallet", t: "Gaji pokok", v: "SAR 3.200/bulan" },
          { ic: "bowl", t: "Uang makan", v: "SAR 200/bulan" },
          { ic: "shield", t: "Asuransi", v: "Disediakan" },
          { ic: "home", t: "Akomodasi", v: "Disediakan" },
          { ic: "truck", t: "Transportasi", v: "Disediakan" },
        ].map((b) => (
          <div key={b.t} style={{
            display: "flex", alignItems: "center", gap: 14,
            background: "var(--pg-white)", border: "1px solid var(--pg-ink-100)",
            borderRadius: "var(--pg-r-md)", padding: "12px 14px",
          }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10, background: "var(--pg-red-50)",
              color: "var(--pg-red-700)", display: "grid", placeItems: "center",
            }}><Icon name={b.ic} size={18} stroke={2}/></div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, color: "var(--pg-ink-500)" }}>{b.t}</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "var(--pg-ink-900)", marginTop: 1 }}>{b.v}</div>
            </div>
          </div>
        ))}
      </div>
    </section>

    {/* Kualifikasi */}
    <section style={{ padding: "20px 20px 8px" }}>
      <h2 className="pg-h3">Kualifikasi</h2>
      <div style={{ marginTop: 10 }}>
        {[
          "Wanita, 21–38 tahun",
          "Lulusan D3 Keperawatan",
          "STR (Surat Tanda Registrasi) aktif",
          "Minimal 1 tahun pengalaman sebagai perawat",
          "Bahasa Inggris level B1 ke atas",
        ].map((q, i) => (
          <div key={q} style={{ display: "flex", gap: 10, padding: "10px 0", borderTop: i ? "1px solid var(--pg-ink-100)" : 0 }}>
            <div style={{
              width: 22, height: 22, borderRadius: 99, background: "var(--pg-red-50)",
              color: "var(--pg-red-700)", display: "grid", placeItems: "center", flexShrink: 0, marginTop: 1,
            }}>
              <Icon name="check" size={14} stroke={2.6}/>
            </div>
            <div style={{ fontSize: 15, lineHeight: 1.45 }}>{q}</div>
          </div>
        ))}
      </div>
    </section>

    {/* Biaya */}
    <section style={{ padding: "20px 20px 8px" }}>
      <h2 className="pg-h3">Biaya keberangkatan</h2>
      <div style={{
        marginTop: 12, background: "var(--pg-white)", border: "1px solid var(--pg-ink-100)",
        borderRadius: "var(--pg-r-lg)", padding: "18px",
      }}>
        <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.02em" }}>Rp 20 juta</div>
        <div className="pg-small" style={{ marginTop: 4 }}>
          Termasuk: MCU GAMCA, Apostille, QVP, Enjaz, Psikotes, Dataflow, Mumaris
        </div>
        <div style={{
          marginTop: 14, padding: "12px 14px", background: "var(--pg-info-bg)",
          borderRadius: "var(--pg-r-md)", display: "flex", gap: 10, alignItems: "flex-start",
        }}>
          <Icon name="info" size={18} color="var(--pg-info)"/>
          <div style={{ fontSize: 13, color: "var(--pg-info)", lineHeight: 1.45 }}>
            <b>Gratis sampai kamu terima offering letter.</b> Biaya baru muncul setelah employer menerima kamu.
          </div>
        </div>
      </div>
    </section>

    {/* Proses */}
    <section style={{ padding: "20px 20px 28px" }}>
      <h2 className="pg-h3">Proses (±4 bulan)</h2>
      <div style={{ marginTop: 14 }}>
        {["Daftar", "Seleksi awal", "Wawancara", "Dokumen & medical", "Berangkat"].map((s, i) => (
          <div key={s} style={{ display: "grid", gridTemplateColumns: "28px 1fr", gap: 10, paddingBottom: i === 4 ? 0 : 16 }}>
            <div style={{ position: "relative" }}>
              <div style={{
                width: 24, height: 24, borderRadius: 99,
                background: "var(--pg-red-600)", color: "#fff",
                display: "grid", placeItems: "center",
                fontSize: 11, fontWeight: 800,
              }}>{i+1}</div>
              {i < 4 && <div style={{ position: "absolute", left: 11, top: 26, bottom: -16, width: 2, background: "var(--pg-ink-200)" }}/>}
            </div>
            <div style={{ fontSize: 15, fontWeight: 600, paddingTop: 2 }}>{s}</div>
          </div>
        ))}
      </div>
    </section>

    <StickyCTA />
  </Phone>
);

Object.assign(window, { ScreenHome, ScreenLowongan, ScreenDetail });
