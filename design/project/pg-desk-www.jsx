/* Perantau Global — Desktop WWW (public website) */

// Desktop header — wider, with nav links
const DeskTopBar = ({ active = "home", variant = "www" }) => {
  const links = variant === "www"
    ? [
        { k: "home", l: "Beranda", href: "#" },
        { k: "lowongan", l: "Lowongan", href: "#" },
        { k: "tentang", l: "Tentang kami" },
        { k: "proses", l: "Proses" },
        { k: "cerita", l: "Cerita PMI" },
      ]
    : [
        { k: "dash", l: "Beranda" },
        { k: "explore", l: "Jelajah" },
        { k: "apps", l: "Lamaran saya" },
        { k: "profile", l: "Profil" },
      ];
  return (
    <div style={{
      position: "sticky", top: 0, zIndex: 30,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "16px 48px", minHeight: 72,
      background: "rgba(250,250,248,.94)",
      backdropFilter: "saturate(140%) blur(10px)",
      borderBottom: "1px solid var(--pg-ink-100)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 40 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: "var(--pg-red-600)", color: "#fff",
            display: "grid", placeItems: "center",
            fontWeight: 800, fontSize: 15, letterSpacing: "-0.02em",
          }}>P</div>
          <div style={{ fontWeight: 800, letterSpacing: "-0.015em", fontSize: 18 }}>
            Perantau<span style={{ color: "var(--pg-red-600)" }}>Global</span>
          </div>
        </div>
        <nav style={{ display: "flex", gap: 28 }}>
          {links.map((l) => (
            <div key={l.k} style={{
              fontSize: 14, fontWeight: 600, cursor: "pointer",
              color: l.k === active ? "var(--pg-ink-900)" : "var(--pg-ink-500)",
              position: "relative",
              padding: "8px 0",
            }}>
              {l.l}
              {l.k === active && (
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 2, background: "var(--pg-red-600)", borderRadius: 99 }}/>
              )}
            </div>
          ))}
        </nav>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {variant === "www" ? (
          <>
            <button className="pg-btn pg-btn--ghost" style={{ minHeight: 42, padding: "0 16px", fontSize: 14 }}>Masuk</button>
            <button className="pg-btn pg-btn--primary" style={{ minHeight: 42, padding: "0 18px", fontSize: 14 }}>Buka Talent Hub</button>
          </>
        ) : (
          <>
            <button style={{
              position: "relative",
              width: 42, height: 42, borderRadius: 10, border: "1px solid var(--pg-ink-200)",
              background: "var(--pg-white)", display: "grid", placeItems: "center", cursor: "pointer"
            }}>
              <Icon name="bell" size={18} />
              <span style={{
                position: "absolute", top: 9, right: 10, width: 7, height: 7, borderRadius: 99,
                background: "var(--pg-red-600)", border: "2px solid var(--pg-white)"
              }}/>
            </button>
            <div style={{
              display: "flex", alignItems: "center", gap: 8, padding: "4px 10px 4px 4px",
              background: "var(--pg-white)", border: "1px solid var(--pg-ink-200)", borderRadius: 99,
            }}>
              <div style={{
                width: 34, height: 34, borderRadius: 99, background: "var(--pg-red-600)",
                color: "#fff", display: "grid", placeItems: "center", fontSize: 13, fontWeight: 800,
              }}>BS</div>
              <div style={{ fontSize: 13, fontWeight: 700 }}>Budi</div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// Desktop footer
const DeskFooter = () => (
  <footer style={{
    background: "var(--pg-ink-900)", color: "#fff",
    padding: "64px 48px 36px", marginTop: 80,
  }}>
    <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr 1fr 1fr", gap: 40 }}>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: "var(--pg-red-600)", color: "#fff",
            display: "grid", placeItems: "center",
            fontWeight: 800, fontSize: 15,
          }}>P</div>
          <div style={{ fontWeight: 800, fontSize: 18 }}>
            Perantau<span style={{ color: "var(--pg-red-500)" }}>Global</span>
          </div>
        </div>
        <div style={{ fontSize: 13, lineHeight: 1.6, color: "rgba(255,255,255,.6)", maxWidth: 280 }}>
          Platform penempatan kerja luar negeri yang jelas, dipandu, dan aman. Berizin resmi dari BP2MI.
        </div>
        <div style={{ fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", color: "rgba(255,255,255,.4)", marginTop: 16 }}>
          SIP3MI No. 12345/2024 · P3MI terakreditasi
        </div>
      </div>
      {[
        { h: "Jelajahi", l: ["Lowongan", "Negara tujuan", "Jenis pekerjaan", "Proses pelamaran"] },
        { h: "Tentang", l: ["Tim kami", "Legalitas", "Testimoni", "Blog"] },
        { h: "Bantuan", l: ["FAQ", "Hubungi kami", "Kebijakan privasi", "Syarat layanan"] },
        { h: "Kontak", l: ["Jakarta · 021 5555 1234", "WhatsApp · 0812 3456 7890", "hello@perantauglobal.id"] },
      ].map((c) => (
        <div key={c.h}>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,.5)", marginBottom: 14 }}>{c.h}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {c.l.map((x) => (
              <div key={x} style={{ fontSize: 13, color: "rgba(255,255,255,.85)" }}>{x}</div>
            ))}
          </div>
        </div>
      ))}
    </div>
    <div style={{ height: 1, background: "rgba(255,255,255,.1)", margin: "40px 0 20px" }}/>
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "rgba(255,255,255,.5)" }}>
      <div>© 2026 PT Perantau Global Indonesia</div>
      <div>Jakarta · Semarang · Surabaya</div>
    </div>
  </footer>
);

// ─── Home (desktop)
const DeskHome = () => (
  <div style={{ width: "100%", minHeight: "100%", background: "var(--pg-paper)", fontFamily: "'Plus Jakarta Sans', sans-serif", color: "var(--pg-ink-900)" }}>
    <DeskTopBar active="home"/>

    {/* Hero */}
    <section style={{ padding: "64px 48px 48px", display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 64, alignItems: "center" }}>
      <div>
        <div className="pg-eyebrow" style={{ color: "var(--pg-red-600)" }}>Berlayar dengan aman</div>
        <h1 style={{ fontSize: 64, lineHeight: 1.02, fontWeight: 800, letterSpacing: "-0.035em", margin: "14px 0 20px", textWrap: "balance" }}>
          Kerja di luar negeri,<br/>
          <span style={{ color: "var(--pg-red-600)" }}>tanpa calo</span> tanpa bingung.
        </h1>
        <p style={{ fontSize: 18, lineHeight: 1.55, color: "var(--pg-ink-500)", maxWidth: 540, margin: 0 }}>
          Perantau Global membantu kamu dari lamaran sampai berangkat. Semua proses resmi, jelas, dan dipandu tim kami. Gratis sampai terima surat kerja.
        </p>
        <div style={{ display: "flex", gap: 12, marginTop: 28 }}>
          <button className="pg-btn pg-btn--primary" style={{ minHeight: 54, padding: "0 24px", fontSize: 16 }}>
            Lihat lowongan terbuka <Icon name="arrow_right" size={18}/>
          </button>
          <button className="pg-btn pg-btn--ghost" style={{ minHeight: 54, padding: "0 22px", fontSize: 16 }}>
            Pelajari prosesnya
          </button>
        </div>
        <div style={{ display: "flex", gap: 32, marginTop: 36 }}>
          {[
            ["1.200+", "PMI ditempatkan"],
            ["8 tahun", "Pengalaman"],
            ["5 negara", "Tujuan resmi"],
          ].map(([v, l]) => (
            <div key={l}>
              <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.02em" }}>{v}</div>
              <div style={{ fontSize: 13, color: "var(--pg-ink-500)" }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
      {/* Hero image block */}
      <div style={{ position: "relative", aspectRatio: "4/5", borderRadius: 20, overflow: "hidden" }}>
        <div className="pg-placeholder" style={{ position: "absolute", inset: 0, fontSize: 13 }}>
          FOTO · Perawat Indonesia<br/>di RS Riyadh
        </div>
        {/* Badge overlay */}
        <div style={{
          position: "absolute", bottom: 20, left: 20, right: 20,
          background: "rgba(20,20,20,.85)", color: "#fff",
          padding: "14px 18px", borderRadius: 14,
          backdropFilter: "blur(8px)",
          display: "flex", alignItems: "center", gap: 12,
        }}>
          <div style={{ width: 40, height: 40, borderRadius: 99, background: "var(--pg-red-600)", flexShrink: 0, display: "grid", placeItems: "center", fontWeight: 800 }}>S</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>Siti, 27 — Perawat di Riyadh</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,.7)", marginTop: 2 }}>"Berangkat Agustus 2024, sudah kirim uang rutin ke Magelang"</div>
          </div>
        </div>
      </div>
    </section>

    {/* Trust bar */}
    <section style={{ padding: "20px 48px", borderTop: "1px solid var(--pg-ink-100)", borderBottom: "1px solid var(--pg-ink-100)", background: "var(--pg-white)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 32, flexWrap: "wrap" }}>
        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--pg-ink-400)" }}>Berizin & terakreditasi</div>
        {["BP2MI", "KEMNAKER", "SIP3MI 12345/2024", "LSP P1", "ISO 9001:2015"].map((t) => (
          <div key={t} style={{
            fontSize: 12, fontWeight: 700, color: "var(--pg-ink-700)",
            padding: "6px 12px", border: "1.5px solid var(--pg-ink-200)", borderRadius: 6,
            fontFamily: "'IBM Plex Mono', monospace",
          }}>{t}</div>
        ))}
      </div>
    </section>

    {/* Featured positions */}
    <section style={{ padding: "72px 48px 48px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 32 }}>
        <div>
          <div className="pg-eyebrow">Lowongan terbuka sekarang</div>
          <h2 style={{ fontSize: 36, fontWeight: 800, letterSpacing: "-0.02em", margin: "8px 0 0" }}>
            4 posisi · 3 negara
          </h2>
        </div>
        <button className="pg-btn pg-btn--ghost" style={{ minHeight: 44, padding: "0 16px", fontSize: 14 }}>
          Semua lowongan <Icon name="arrow_right" size={16}/>
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
        {[
          { r: "Perawat", c: "Saudi Arabia", s: "SAR 3.200/bulan", slot: "12 slot · closing 30 Jun", icon: "stethoscope", hot: true },
          { r: "Barista", c: "Saudi Arabia", s: "SAR 2.000/bulan", slot: "8 slot · batch Okt 2025", icon: "coffee" },
          { r: "Caregiver", c: "Taiwan", s: "TWD 23.000/bulan", slot: "6 slot · batch Mei 2026", icon: "heart" },
        ].map((p, i) => (
          <div key={i} className="pg-redhero" style={{
            padding: 24, borderRadius: 16,
            background: i === 0 ? "var(--pg-red-600)" : "var(--pg-white)",
            color: i === 0 ? "#fff" : "var(--pg-ink-900)",
            border: i === 0 ? 0 : "1px solid var(--pg-ink-100)",
            display: "flex", flexDirection: "column", gap: 16, minHeight: 280,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div style={{
                width: 48, height: 48, borderRadius: 12,
                background: i === 0 ? "rgba(255,255,255,.18)" : "var(--pg-red-50)",
                color: i === 0 ? "#fff" : "var(--pg-red-600)",
                display: "grid", placeItems: "center",
              }}><Icon name={p.icon} size={22} stroke={1.8}/></div>
              {p.hot && <div style={{ padding: "4px 10px", fontSize: 11, fontWeight: 800, background: "#fff", color: "var(--pg-red-600)", borderRadius: 99, alignSelf: "flex-start" }}>HOT</div>}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, opacity: i === 0 ? 0.8 : 1, color: i === 0 ? "#fff" : "var(--pg-ink-500)" }}>{p.c}</div>
              <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em", marginTop: 4 }}>{p.r}</div>
              <div style={{ fontSize: 15, fontWeight: 700, marginTop: 12 }}>{p.s}</div>
              <div style={{ fontSize: 12, opacity: 0.8, marginTop: 4 }}>{p.slot}</div>
            </div>
            <div style={{
              display: "flex", alignItems: "center", gap: 6, fontSize: 14, fontWeight: 700,
              color: i === 0 ? "#fff" : "var(--pg-red-600)",
            }}>
              Lihat detail <Icon name="arrow_right" size={16} stroke={2.4}/>
            </div>
          </div>
        ))}
      </div>
    </section>

    {/* Process section */}
    <section style={{ padding: "72px 48px", background: "var(--pg-white)", borderTop: "1px solid var(--pg-ink-100)", borderBottom: "1px solid var(--pg-ink-100)" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: 80, alignItems: "start" }}>
        <div>
          <div className="pg-eyebrow">4 langkah, jelas</div>
          <h2 style={{ fontSize: 36, fontWeight: 800, letterSpacing: "-0.02em", margin: "10px 0 16px", textWrap: "balance" }}>
            Dari lamar sampai berangkat, kamu dipandu.
          </h2>
          <p style={{ fontSize: 16, color: "var(--pg-ink-500)", lineHeight: 1.6, margin: 0 }}>
            Kami tidak mengambil biaya apapun sampai kamu menerima surat kerja resmi. Semua dokumen, pelatihan, dan tes medis dibantu tim kami.
          </p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {[
            { n: "01", t: "Daftar & lamar", d: "Buat profil, pilih posisi yang sesuai, kirim lamaran online. 15 menit." },
            { n: "02", t: "Wawancara & seleksi", d: "Tim kami bantu wawancara dengan employer. Kalau cocok, lanjut medis." },
            { n: "03", t: "Dokumen & pelatihan", d: "Kami urus passport, visa, dan pelatihan pra-keberangkatan wajib." },
            { n: "04", t: "Berangkat & kerja", d: "Antar sampai bandara, dampingi 2 tahun kontrak, support remitansi." },
          ].map((s, i) => (
            <div key={s.n} style={{ display: "grid", gridTemplateColumns: "80px 1fr", gap: 20, padding: "20px 0", borderTop: i ? "1px solid var(--pg-ink-100)" : 0 }}>
              <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-0.04em", color: "var(--pg-red-600)", fontFamily: "'IBM Plex Mono', monospace" }}>{s.n}</div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.015em" }}>{s.t}</div>
                <div style={{ fontSize: 15, color: "var(--pg-ink-500)", marginTop: 4, lineHeight: 1.55 }}>{s.d}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Stories */}
    <section style={{ padding: "72px 48px 48px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 32 }}>
        <div>
          <div className="pg-eyebrow">Cerita mereka</div>
          <h2 style={{ fontSize: 36, fontWeight: 800, letterSpacing: "-0.02em", margin: "8px 0 0" }}>PMI yang sudah berangkat.</h2>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
        {[
          { n: "Siti Aminah", p: "Perawat · RS Riyadh", q: "Sebelumnya kerja di RSUD, gaji pas-pasan. Sekarang bisa kirim 8 juta/bulan ke Magelang.", y: "Berangkat Agustus 2024" },
          { n: "Maya Anggraini", p: "Barista · Jeddah", q: "Proses gak ribet, semua dokumen dibantu. Training Bahasa Inggris bener-bener kepake.", y: "Berangkat Januari 2025" },
          { n: "Lilis Suryani", p: "Caregiver · Taipei", q: "Deg-degan di awal, tapi tim Perantau Global kontak rutin dua minggu sekali selama adaptasi.", y: "Berangkat Oktober 2024" },
        ].map((s, i) => (
          <div key={i} style={{ background: "var(--pg-white)", border: "1px solid var(--pg-ink-100)", borderRadius: 16, padding: 24 }}>
            <div style={{ aspectRatio: "4/3", marginLeft: -24, marginRight: -24, marginTop: -24, marginBottom: 20, overflow: "hidden", borderTopLeftRadius: 16, borderTopRightRadius: 16 }}>
              <div className="pg-placeholder" style={{ height: "100%", borderRadius: 0 }}>FOTO · {s.n}</div>
            </div>
            <div style={{ fontSize: 18, lineHeight: 1.5, letterSpacing: "-0.005em", marginBottom: 20 }}>"{s.q}"</div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", borderTop: "1px solid var(--pg-ink-100)", paddingTop: 14 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{s.n}</div>
                <div style={{ fontSize: 12, color: "var(--pg-ink-500)", marginTop: 2 }}>{s.p}</div>
              </div>
              <div style={{ fontSize: 11, color: "var(--pg-ink-400)", fontFamily: "'IBM Plex Mono', monospace" }}>{s.y}</div>
            </div>
          </div>
        ))}
      </div>
    </section>

    {/* CTA final */}
    <section style={{ padding: "60px 48px" }}>
      <div style={{
        background: "var(--pg-ink-900)", color: "#fff",
        borderRadius: 24, padding: "60px 56px",
        display: "flex", justifyContent: "space-between", alignItems: "center", gap: 40,
      }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--pg-red-500)", marginBottom: 10 }}>Siap mulai?</div>
          <div style={{ fontSize: 42, fontWeight: 800, letterSpacing: "-0.025em", textWrap: "balance", maxWidth: 640 }}>
            Daftar dalam 2 menit. Lihat posisi yang cocok, kami bantu sisanya.
          </div>
        </div>
        <button className="pg-btn pg-btn--primary" style={{ minHeight: 56, padding: "0 28px", fontSize: 16, flexShrink: 0 }}>
          Buka Talent Hub <Icon name="arrow_right" size={18}/>
        </button>
      </div>
    </section>

    <DeskFooter/>
  </div>
);

// ─── Lowongan index (desktop)
const DeskLowongan = () => {
  const jobs = [
    { r: "Perawat", c: "Saudi Arabia", s: "SAR 3.200/bulan", exp: "1+ th", dl: "30 Jun 2026", slots: "12 slot", ic: "stethoscope", hot: true },
    { r: "Barista", c: "Saudi Arabia", s: "SAR 2.000/bulan", exp: "6+ bln", dl: "15 Sep 2025", slots: "8 slot", ic: "coffee" },
    { r: "Caregiver", c: "Taiwan", s: "TWD 23.000/bulan", exp: "Training disediakan", dl: "20 Apr 2026", slots: "6 slot", ic: "heart" },
    { r: "Waitress", c: "Saudi Arabia", s: "SAR 1.800/bulan", exp: "Fresh grad OK", dl: "TBD", slots: "Segera buka", ic: "bowl", soon: true },
    { r: "Perawat", c: "Singapura", s: "SGD 2.400/bulan", exp: "2+ th · STR aktif", dl: "Ditutup 20 Apr", slots: "Ditutup", ic: "stethoscope", closed: true },
    { r: "Cleaner", c: "Saudi Arabia", s: "SAR 1.500/bulan", exp: "Fresh", dl: "Ditutup 15 Mar", slots: "Ditutup", ic: "truck", closed: true },
  ];
  return (
    <div style={{ width: "100%", minHeight: "100%", background: "var(--pg-paper)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <DeskTopBar active="lowongan"/>

      {/* Page header */}
      <section style={{ padding: "48px 48px 24px" }}>
        <div className="pg-eyebrow">Semua lowongan</div>
        <h1 style={{ fontSize: 48, fontWeight: 800, letterSpacing: "-0.03em", margin: "10px 0 0" }}>
          Temukan pekerjaan yang cocok buat kamu
        </h1>
        <p style={{ fontSize: 16, color: "var(--pg-ink-500)", marginTop: 10, maxWidth: 620 }}>
          6 posisi di 3 negara · update real-time · semua proses dibimbing tim kami
        </p>
      </section>

      {/* Filters + results */}
      <section style={{ padding: "24px 48px 48px", display: "grid", gridTemplateColumns: "260px 1fr", gap: 32 }}>
        {/* Filters sidebar */}
        <aside style={{ position: "sticky", top: 100, alignSelf: "start" }}>
          <div style={{ background: "var(--pg-white)", border: "1px solid var(--pg-ink-100)", borderRadius: 14, padding: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--pg-ink-400)", marginBottom: 14 }}>Filter</div>

            {[
              { l: "Negara", opts: [["Saudi Arabia", 4, true], ["Taiwan", 1], ["Singapura", 1], ["Hong Kong", 0]] },
              { l: "Jenis pekerjaan", opts: [["Kesehatan", 2], ["F&B", 2], ["Rumah tangga", 2]] },
              { l: "Status", opts: [["Lagi buka", 3, true], ["Segera buka", 1], ["Ditutup", 2]] },
            ].map((g, i) => (
              <div key={g.l} style={{ marginTop: i ? 20 : 0, paddingTop: i ? 16 : 0, borderTop: i ? "1px solid var(--pg-ink-100)" : 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>{g.l}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {g.opts.map(([l, c, sel]) => (
                    <label key={l} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "var(--pg-ink-700)", cursor: "pointer" }}>
                      <div style={{
                        width: 18, height: 18, borderRadius: 5,
                        border: `2px solid ${sel ? "var(--pg-red-600)" : "var(--pg-ink-200)"}`,
                        background: sel ? "var(--pg-red-600)" : "transparent",
                        display: "grid", placeItems: "center",
                      }}>
                        {sel && <Icon name="check" size={10} color="#fff" stroke={3.5}/>}
                      </div>
                      <span style={{ flex: 1 }}>{l}</span>
                      <span style={{ fontSize: 11, color: "var(--pg-ink-400)", fontFamily: "'IBM Plex Mono', monospace" }}>({c})</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}

            <button className="pg-btn pg-btn--ghost pg-btn--block" style={{ marginTop: 20, minHeight: 40, fontSize: 13 }}>Reset filter</button>
          </div>
        </aside>

        {/* Job list */}
        <div>
          {/* Results header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={{ fontSize: 14, color: "var(--pg-ink-500)" }}>
              Menampilkan <b style={{ color: "var(--pg-ink-900)" }}>6 hasil</b> · 4 buka, 2 tutup
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
              <span style={{ color: "var(--pg-ink-500)" }}>Urutkan:</span>
              <div style={{
                padding: "6px 12px", border: "1.5px solid var(--pg-ink-200)", borderRadius: 8,
                fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 6, cursor: "pointer",
              }}>
                Terbaru <Icon name="chevron_down" size={14}/>
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {jobs.map((j, i) => (
              <div key={i} style={{
                background: j.closed ? "var(--pg-ink-50)" : "var(--pg-white)",
                border: "1px solid var(--pg-ink-100)",
                borderRadius: 14, padding: 22,
                opacity: j.closed ? 0.7 : 1,
                display: "flex", flexDirection: "column", gap: 14,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ display: "flex", gap: 12 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 10,
                      background: "var(--pg-red-50)", color: "var(--pg-red-600)",
                      display: "grid", placeItems: "center", flexShrink: 0,
                    }}><Icon name={j.ic} size={20} stroke={1.8}/></div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "var(--pg-ink-500)" }}>{j.c}</div>
                      <div style={{ fontSize: 19, fontWeight: 800, letterSpacing: "-0.015em", marginTop: 2 }}>{j.r}</div>
                    </div>
                  </div>
                  {j.hot && <Badge variant="err">Hot</Badge>}
                  {j.soon && <Badge variant="info">Segera</Badge>}
                  {j.closed && <Badge variant="mute">Ditutup</Badge>}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 14px", fontSize: 13 }}>
                  <div>
                    <div style={{ fontSize: 11, color: "var(--pg-ink-400)", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>Gaji</div>
                    <div style={{ fontWeight: 700, marginTop: 2 }}>{j.s}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: "var(--pg-ink-400)", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>Pengalaman</div>
                    <div style={{ fontWeight: 700, marginTop: 2 }}>{j.exp}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: "var(--pg-ink-400)", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>Slot</div>
                    <div style={{ fontWeight: 700, marginTop: 2 }}>{j.slots}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: "var(--pg-ink-400)", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>Deadline</div>
                    <div style={{ fontWeight: 700, marginTop: 2 }}>{j.dl}</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 10, paddingTop: 6 }}>
                  <button className={`pg-btn ${j.closed ? "pg-btn--ghost" : "pg-btn--primary"}`} style={{ flex: 1, minHeight: 42, fontSize: 14 }} disabled={j.closed}>
                    {j.closed ? "Daftar tunggu" : "Lamar sekarang"}
                  </button>
                  <button className="pg-btn pg-btn--ghost" style={{ minHeight: 42, padding: "0 14px", fontSize: 14 }}>Detail</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <DeskFooter/>
    </div>
  );
};

// ─── Detail posisi (desktop)
const DeskDetail = () => (
  <div style={{ width: "100%", minHeight: "100%", background: "var(--pg-paper)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
    <DeskTopBar active="lowongan"/>

    {/* Breadcrumb */}
    <div style={{ padding: "20px 48px 0", fontSize: 13, color: "var(--pg-ink-500)" }}>
      <span style={{ color: "var(--pg-red-600)", fontWeight: 600 }}>Lowongan</span> / Saudi Arabia / <span style={{ color: "var(--pg-ink-900)", fontWeight: 600 }}>Perawat</span>
    </div>

    <section style={{ padding: "20px 48px 48px", display: "grid", gridTemplateColumns: "1fr 380px", gap: 48 }}>
      {/* Main */}
      <div>
        {/* Hero card */}
        <div className="pg-redhero" style={{ background: "var(--pg-red-600)", color: "#fff", borderRadius: 20, padding: 36, display: "flex", alignItems: "center", gap: 28 }}>
          <div style={{
            width: 80, height: 80, borderRadius: 18,
            background: "rgba(255,255,255,.18)", color: "#fff",
            display: "grid", placeItems: "center",
          }}><Icon name="stethoscope" size={40} stroke={1.6}/></div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, opacity: 0.85 }}>Saudi Arabia · Riyadh</div>
            <div style={{ fontSize: 42, fontWeight: 800, letterSpacing: "-0.025em", marginTop: 4, lineHeight: 1.05 }}>Perawat — RS Swasta</div>
            <div style={{ display: "flex", gap: 20, marginTop: 14, flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14 }}><Icon name="wallet" size={16}/> SAR 3.200/bulan · ≈ Rp 13.5jt</div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14 }}><Icon name="clock" size={16}/> Kontrak 2 tahun</div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14 }}><Icon name="user" size={16}/> 12 slot</div>
            </div>
          </div>
        </div>

        {/* Section headings */}
        <div style={{ marginTop: 40 }}>
          <div className="pg-eyebrow">Ringkasan</div>
          <h2 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.02em", margin: "10px 0 14px" }}>Yang akan kamu kerjakan</h2>
          <p style={{ fontSize: 16, lineHeight: 1.65, color: "var(--pg-ink-700)", margin: 0 }}>
            Kamu akan bekerja sebagai perawat di salah satu rumah sakit swasta terbesar di Riyadh, area pelayanan pasien dewasa (medical ward) atau ICU tergantung penempatan. Shift 8 jam, 6 hari/minggu dengan 1 hari libur. Semua pelatihan pra-keberangkatan disediakan termasuk bahasa Arab medis dasar.
          </p>
        </div>

        <div style={{ marginTop: 40, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
          <div>
            <div className="pg-eyebrow">Syarat wajib</div>
            <h3 style={{ fontSize: 20, fontWeight: 800, margin: "8px 0 14px" }}>Untuk melamar</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {["D3/S1 Keperawatan", "STR aktif minimal 1 tahun lagi", "Pengalaman min. 1 tahun di RS", "Usia 22–38 tahun", "Bahasa Inggris dasar (minimal A2)", "Siap kontrak 2 tahun"].map((s) => (
                <div key={s} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 20, height: 20, borderRadius: 99, background: "var(--pg-ok-bg)", color: "var(--pg-ok)", display: "grid", placeItems: "center", flexShrink: 0 }}>
                    <Icon name="check" size={12} stroke={3}/>
                  </div>
                  <span style={{ fontSize: 15, color: "var(--pg-ink-700)" }}>{s}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="pg-eyebrow">Yang kamu dapat</div>
            <h3 style={{ fontSize: 20, fontWeight: 800, margin: "8px 0 14px" }}>Benefit & fasilitas</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {["Gaji SAR 3.200/bulan", "Tunjangan makan & transport", "Asuransi kesehatan lengkap", "Tiket pulang tahunan", "Akomodasi disediakan RS", "Cuti tahunan 30 hari"].map((s) => (
                <div key={s} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 20, height: 20, borderRadius: 99, background: "var(--pg-red-50)", color: "var(--pg-red-600)", display: "grid", placeItems: "center", flexShrink: 0 }}>
                    <Icon name="plus" size={12} stroke={3}/>
                  </div>
                  <span style={{ fontSize: 15, color: "var(--pg-ink-700)" }}>{s}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Process */}
        <div style={{ marginTop: 48 }}>
          <div className="pg-eyebrow">Proses pelamaran</div>
          <h3 style={{ fontSize: 20, fontWeight: 800, margin: "8px 0 18px" }}>4 tahap · ~6–8 minggu</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 0, position: "relative" }}>
            {[
              { n: 1, t: "Lamaran", d: "15 menit online" },
              { n: 2, t: "Wawancara", d: "1–2 minggu" },
              { n: 3, t: "Medis & dokumen", d: "3–4 minggu" },
              { n: 4, t: "Berangkat", d: "1 minggu" },
            ].map((s, i) => (
              <div key={s.n} style={{ position: "relative", paddingRight: i < 3 ? 16 : 0 }}>
                {i < 3 && <div style={{ position: "absolute", top: 16, right: 8, left: "50%", height: 2, background: "var(--pg-ink-100)" }}/>}
                <div style={{
                  width: 32, height: 32, borderRadius: 99,
                  background: "var(--pg-ink-900)", color: "#fff",
                  display: "grid", placeItems: "center",
                  fontWeight: 800, fontSize: 13, position: "relative", zIndex: 1,
                }}>{s.n}</div>
                <div style={{ fontSize: 15, fontWeight: 700, marginTop: 10 }}>{s.t}</div>
                <div style={{ fontSize: 12, color: "var(--pg-ink-500)", marginTop: 2 }}>{s.d}</div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div style={{ marginTop: 48 }}>
          <div className="pg-eyebrow">Sering ditanya</div>
          <h3 style={{ fontSize: 20, fontWeight: 800, margin: "8px 0 14px" }}>FAQ</h3>
          {[
            "Apakah ada biaya pendaftaran?",
            "Bagaimana kalau STR saya hampir expired?",
            "Cuti bisa pulang ke Indonesia?",
            "Kalau gak lolos wawancara bagaimana?",
          ].map((q, i) => (
            <div key={i} style={{ padding: "16px 20px", background: "var(--pg-white)", border: "1px solid var(--pg-ink-100)", borderRadius: 12, marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: 15, fontWeight: 700 }}>{q}</div>
              <Icon name="chevron_down" size={18} color="var(--pg-ink-400)"/>
            </div>
          ))}
        </div>
      </div>

      {/* Sticky apply rail */}
      <aside>
        <div style={{ position: "sticky", top: 100 }}>
          <div style={{ background: "var(--pg-white)", border: "1px solid var(--pg-ink-100)", borderRadius: 16, padding: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--pg-ink-500)" }}>Mulai lamar</div>
            <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.02em", marginTop: 4 }}>SAR 3.200</div>
            <div style={{ fontSize: 13, color: "var(--pg-ink-500)", marginTop: 2 }}>per bulan · ≈ Rp 13.500.000</div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 20, padding: "16px 0", borderTop: "1px solid var(--pg-ink-100)", borderBottom: "1px solid var(--pg-ink-100)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                <span style={{ color: "var(--pg-ink-500)" }}>Slot tersisa</span>
                <span style={{ fontWeight: 700 }}>9 dari 12</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                <span style={{ color: "var(--pg-ink-500)" }}>Deadline</span>
                <span style={{ fontWeight: 700 }}>30 Juni 2026</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                <span style={{ color: "var(--pg-ink-500)" }}>Berangkat</span>
                <span style={{ fontWeight: 700 }}>Batch Juni–Juli 2026</span>
              </div>
            </div>

            <button className="pg-btn pg-btn--primary pg-btn--block" style={{ marginTop: 16 }}>
              Lamar sekarang <Icon name="arrow_right" size={18}/>
            </button>
            <button className="pg-btn pg-btn--ghost pg-btn--block" style={{ marginTop: 8, minHeight: 46, fontSize: 14 }}>
              <Icon name="share" size={16}/> Bagikan ke WhatsApp
            </button>

            <div style={{ fontSize: 12, color: "var(--pg-ink-500)", textAlign: "center", marginTop: 12, lineHeight: 1.5 }}>
              Gratis sampai kamu terima surat kerja resmi
            </div>
          </div>

          <div style={{ background: "var(--pg-white)", border: "1px solid var(--pg-ink-100)", borderRadius: 16, padding: 20, marginTop: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--pg-ink-400)" }}>Butuh bantuan?</div>
            <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{
                width: 42, height: 42, borderRadius: 99, background: "var(--pg-ink-900)", color: "#fff",
                display: "grid", placeItems: "center", fontSize: 13, fontWeight: 800,
              }}>RP</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700 }}>Rina P.</div>
                <div style={{ fontSize: 12, color: "var(--pg-ink-500)" }}>Talent recruiter</div>
              </div>
            </div>
            <button className="pg-btn pg-btn--ghost pg-btn--block" style={{ marginTop: 14, minHeight: 42, fontSize: 13 }}>
              <Icon name="phone" size={15}/> Chat WhatsApp
            </button>
          </div>
        </div>
      </aside>
    </section>

    <DeskFooter/>
  </div>
);

Object.assign(window, { DeskHome, DeskLowongan, DeskDetail, DeskTopBar, DeskFooter });
