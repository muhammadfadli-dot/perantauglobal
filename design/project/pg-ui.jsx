/* Perantau Global — shared UI primitives (Phosphor-style inline SVG icons, badges, status pills) */

const Icon = ({ name, size = 20, stroke = 1.8, color = "currentColor" }) => {
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: stroke, strokeLinecap: "round", strokeLinejoin: "round" };
  const paths = {
    menu: <><path d="M4 7h16"/><path d="M4 12h16"/><path d="M4 17h16"/></>,
    arrow_right: <><path d="M5 12h14"/><path d="M13 6l6 6-6 6"/></>,
    arrow_left:  <><path d="M19 12H5"/><path d="M11 6l-6 6 6 6"/></>,
    chevron_right: <><path d="M9 6l6 6-6 6"/></>,
    chevron_down:  <><path d="M6 9l6 6 6-6"/></>,
    check: <><path d="M5 13l4 4L19 7"/></>,
    x: <><path d="M6 6l12 12"/><path d="M18 6l-12 12"/></>,
    mail: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M4 7l8 6 8-6"/></>,
    pin: <><path d="M12 22s7-6.5 7-12a7 7 0 10-14 0c0 5.5 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/></>,
    briefcase: <><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2"/><path d="M3 13h18"/></>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    wallet: <><rect x="3" y="6" width="18" height="14" rx="2"/><path d="M3 10h18"/><circle cx="17" cy="15" r="1.2"/></>,
    shield: <><path d="M12 3l8 3v6c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V6l8-3z"/></>,
    user: <><circle cx="12" cy="8" r="4"/><path d="M4 20c1.5-4 4.5-6 8-6s6.5 2 8 6"/></>,
    home: <><path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/></>,
    search: <><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></>,
    bell: <><path d="M6 8a6 6 0 1112 0c0 7 3 8 3 8H3s3-1 3-8z"/><path d="M10 20a2 2 0 004 0"/></>,
    upload: <><path d="M12 16V4"/><path d="M7 9l5-5 5 5"/><path d="M4 20h16"/></>,
    doc: <><path d="M7 3h8l4 4v14H7z"/><path d="M15 3v5h4"/></>,
    id_card: <><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="12" r="2.2"/><path d="M14 10h4M14 14h3"/></>,
    passport: <><rect x="4" y="3" width="16" height="18" rx="2"/><circle cx="12" cy="11" r="3"/><path d="M9 17h6"/></>,
    camera: <><rect x="3" y="7" width="18" height="13" rx="2"/><circle cx="12" cy="13" r="3.5"/><path d="M8 7l2-3h4l2 3"/></>,
    globe: <><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18"/></>,
    sparkle: <><path d="M12 3l2 5 5 2-5 2-2 5-2-5-5-2 5-2z"/></>,
    info: <><circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><circle cx="12" cy="8" r=".6" fill="currentColor"/></>,
    warn: <><path d="M12 3l10 18H2z"/><path d="M12 10v4"/><circle cx="12" cy="18" r=".6" fill="currentColor"/></>,
    phone_off: <><path d="M4 4l16 16"/><path d="M22 17c-1-.6-3-1.5-5-1.5-.6 0-1 .2-1.4.6l-2 2c-2-.8-4-2.8-4.8-4.8l2-2c.4-.4.6-.8.6-1.4 0-2-.9-4-1.5-5"/></>,
    stethoscope: <><path d="M6 3v6a4 4 0 008 0V3"/><path d="M6 3h2M12 3h2"/><path d="M14 13c0 4 3 6 5 6s3-2 3-4"/><circle cx="22" cy="15" r="1.5"/></>,
    coffee: <><path d="M5 8h13v6a4 4 0 01-4 4H9a4 4 0 01-4-4z"/><path d="M18 10h2a2 2 0 010 4h-2"/><path d="M8 3v2M12 3v2M16 3v2"/></>,
    truck: <><rect x="2" y="8" width="12" height="8" rx="1"/><path d="M14 10h4l3 3v3h-7"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></>,
    bowl: <><path d="M3 11h18a9 9 0 01-18 0z"/><path d="M8 7c0-1.5 1.5-2 2-2M13 7c0-1.5 1.5-2 2-2"/></>,
    heart: <><path d="M12 20s-8-5-8-11a5 5 0 018-4 5 5 0 018 4c0 6-8 11-8 11z"/></>,
    sparkle_dot: <><circle cx="12" cy="12" r="3"/></>,
    plus: <><path d="M12 5v14M5 12h14"/></>,
    compass: <><circle cx="12" cy="12" r="9"/><path d="M15 9l-2 6-6 2 2-6z"/></>,
    phone: <><path d="M5 4h3l2 5-2.5 1.5a12 12 0 006 6L15 14l5 2v3a2 2 0 01-2 2A15 15 0 013 6a2 2 0 012-2z"/></>,
    location: <><path d="M12 22s7-6.5 7-12a7 7 0 10-14 0c0 5.5 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/></>,
    trash: <><path d="M4 7h16"/><path d="M9 7V4h6v3"/><path d="M6 7l1 13h10l1-13"/></>,
    edit: <><path d="M14 4l6 6-11 11H3v-6z"/></>,
    grip: <><circle cx="9" cy="6" r="1"/><circle cx="15" cy="6" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="9" cy="18" r="1"/><circle cx="15" cy="18" r="1"/></>,
    filter: <><path d="M4 5h16"/><path d="M7 12h10"/><path d="M10 19h4"/></>,
    sort: <><path d="M6 8l4-4 4 4"/><path d="M10 4v16"/><path d="M18 16l-4 4-4-4"/></>,
    share: <><circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/><path d="M8 11l8-5M8 13l8 5"/></>,
    star: <><path d="M12 3l3 6 6.5 1-5 4.5 1.5 6.5-6-3.5-6 3.5L7 14.5 2 10l6.5-1z"/></>,
    users: <><circle cx="9" cy="8" r="3.5"/><path d="M3 20c1-3 3.5-5 6-5s5 2 6 5"/><circle cx="17" cy="8" r="3"/><path d="M21 19c-.5-2-2-3.5-4-4"/></>,
    doc_check: <><path d="M7 3h8l4 4v14H7z"/><path d="M15 3v5h4"/><path d="M10 14l2 2 4-4"/></>,
    zoom: <><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/><path d="M8 11h6M11 8v6"/></>,
    download: <><path d="M12 4v12"/><path d="M7 11l5 5 5-5"/><path d="M4 20h16"/></>,
  };
  return <svg {...common} aria-hidden="true">{paths[name] || null}</svg>;
};

const Badge = ({ variant = "mute", children, icon }) => (
  <span className={`pg-badge pg-badge--${variant}`}>
    {icon && <Icon name={icon} size={12} stroke={2.2} />}
    {children}
  </span>
);

const StatusDot = ({ color = "var(--pg-ok)" }) => (
  <span className="pg-dot" style={{ background: color }} />
);

// Phone shell — a simple mobile-only viewport. We'll wrap these in iOS frames in the canvas.
const Phone = ({ children, screenKey, scrollTop = 0 }) => {
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (ref.current) ref.current.scrollTop = scrollTop;
  }, [scrollTop, screenKey]);
  return <div ref={ref} className="pg-screen" data-screen={screenKey}>{children}</div>;
};

// Simple top app bar (www / app variants)
const TopBarWWW = ({ showDaftar = true }) => (
  <div style={{
    position: "sticky", top: 0, zIndex: 20,
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "14px 20px",
    background: "rgba(250,250,248,.92)",
    backdropFilter: "saturate(140%) blur(8px)",
    borderBottom: "1px solid var(--pg-ink-100)",
  }}>
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{
        width: 28, height: 28, borderRadius: 8,
        background: "var(--pg-red-600)", color: "#fff",
        display: "grid", placeItems: "center",
        fontWeight: 800, fontSize: 14, letterSpacing: "-0.02em",
      }}>P</div>
      <div style={{ fontWeight: 800, letterSpacing: "-0.015em", fontSize: 16 }}>
        Perantau<span style={{ color: "var(--pg-red-600)" }}>Global</span>
      </div>
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      {showDaftar && (
        <button className="pg-btn pg-btn--primary" style={{ minHeight: 40, padding: "0 14px", fontSize: 14 }}>
          Buka Talent Hub
        </button>
      )}
      <button style={{
        width: 40, height: 40, borderRadius: 10, border: "1px solid var(--pg-ink-200)",
        background: "var(--pg-white)", display: "grid", placeItems: "center", cursor: "pointer"
      }}><Icon name="menu" size={20} /></button>
    </div>
  </div>
);

const TopBarApp = ({ title, back = false, bell = true }) => (
  <div style={{
    position: "sticky", top: 0, zIndex: 20,
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "14px 20px",
    background: "var(--pg-paper)",
    borderBottom: "1px solid var(--pg-ink-100)",
    minHeight: 56,
  }}>
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      {back && (
        <button style={{
          width: 40, height: 40, borderRadius: 10, border: "1px solid var(--pg-ink-200)",
          background: "var(--pg-white)", display: "grid", placeItems: "center", cursor: "pointer"
        }}><Icon name="arrow_left" size={20} /></button>
      )}
      <div style={{ fontWeight: 800, fontSize: 17, letterSpacing: "-0.01em" }}>{title}</div>
    </div>
    {bell && (
      <button style={{
        position: "relative",
        width: 40, height: 40, borderRadius: 10, border: "1px solid var(--pg-ink-200)",
        background: "var(--pg-white)", display: "grid", placeItems: "center", cursor: "pointer"
      }}>
        <Icon name="bell" size={20} />
        <span style={{
          position: "absolute", top: 8, right: 9, width: 8, height: 8, borderRadius: 99,
          background: "var(--pg-red-600)", border: "2px solid var(--pg-white)"
        }}/>
      </button>
    )}
  </div>
);

const BottomNav = ({ active = "home" }) => {
  const items = [
    { key: "home", label: "Beranda", icon: "home" },
    { key: "explore", label: "Jelajah", icon: "compass" },
    { key: "apps", label: "Lamaran", icon: "briefcase" },
    { key: "profile", label: "Profil", icon: "user" },
  ];
  return (
    <div style={{
      position: "sticky", bottom: 0, zIndex: 20,
      background: "var(--pg-white)",
      borderTop: "1px solid var(--pg-ink-100)",
      display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
      padding: "8px 8px 14px",
    }}>
      {items.map((it) => {
        const on = it.key === active;
        return (
          <button key={it.key} style={{
            background: "transparent", border: 0, cursor: "pointer",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
            padding: "8px 4px",
            color: on ? "var(--pg-red-600)" : "var(--pg-ink-400)",
            fontSize: 11, fontWeight: 700, letterSpacing: "0.01em",
          }}>
            <Icon name={it.icon} size={22} stroke={on ? 2.2 : 1.8} />
            <span>{it.label}</span>
          </button>
        );
      })}
    </div>
  );
};

const StickyCTA = ({ label = "Lamar posisi ini", note = "Gratis sampai terima offering letter" }) => (
  <div style={{
    position: "sticky", bottom: 0, zIndex: 20,
    background: "rgba(255,255,255,.96)",
    backdropFilter: "blur(8px)",
    borderTop: "1px solid var(--pg-ink-100)",
    padding: "14px 20px 20px",
  }}>
    <button className="pg-btn pg-btn--primary pg-btn--block">
      {label} <Icon name="arrow_right" size={18} />
    </button>
    <div className="pg-small" style={{ textAlign: "center", marginTop: 8 }}>{note}</div>
  </div>
);

const Placeholder = ({ label, height = 180 }) => (
  <div className="pg-placeholder" style={{ height, padding: 16 }}>
    [ {label} ]
  </div>
);

// Red hero block — typographic position header (replaces photos per user pref)
const RedHero = ({ role, country, meta }) => (
  <div className="pg-redhero" style={{
    padding: "32px 20px 28px",
    minHeight: 200,
    display: "flex", flexDirection: "column", justifyContent: "flex-end",
    position: "relative",
  }}>
    <div style={{
      position: "absolute", inset: 0,
      backgroundImage:
        "repeating-linear-gradient(90deg, rgba(255,255,255,.06) 0 1px, transparent 1px 100px)",
      pointerEvents: "none",
    }}/>
    <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", opacity: .85 }}>
      {country}
    </div>
    <div style={{
      fontSize: 38, fontWeight: 800, lineHeight: 1.02, letterSpacing: "-0.03em",
      marginTop: 8, textWrap: "balance",
    }}>
      {role}.
    </div>
    {meta && (
      <div style={{ display: "flex", gap: 14, marginTop: 18, flexWrap: "wrap" }}>
        {meta.map((m, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, opacity: .95 }}>
            <Icon name={m.icon} size={14} stroke={2} />
            {m.label}
          </div>
        ))}
      </div>
    )}
  </div>
);

Object.assign(window, { Icon, Badge, StatusDot, Phone, TopBarWWW, TopBarApp, BottomNav, StickyCTA, Placeholder, RedHero });
