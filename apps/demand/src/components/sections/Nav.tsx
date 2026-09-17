"use client";

import { useEffect, useState } from "react";
import { LogoMark } from "@/components/LogoMark";
import { MobileMenu } from "@/components/MobileMenu";

type Market = "gcc" | "europe" | "japan";
type Locale = "en" | "id" | "ar" | "bg" | "ja";

const MARKET_LOCALES: Record<Market, { value: Locale; label: string }[]> = {
  gcc: [{ value: "en", label: "English" }, { value: "id", label: "Indonesia" }, { value: "ar", label: "العربية" }],
  europe: [{ value: "en", label: "English" }, { value: "id", label: "Indonesia" }, { value: "bg", label: "Български" }],
  japan: [{ value: "en", label: "English" }, { value: "id", label: "Indonesia" }, { value: "ja", label: "日本語" }],
};

const NAV_COPY: Record<Locale, { home: string; why: string; pool: string; sectors: string; process: string; credentials: string; request: string }> = {
  en: { home: "Home", why: "Why DTG", pool: "Talent Pool", sectors: "Sectors", process: "Process", credentials: "Credentials", request: "Request Talent" },
  id: { home: "Beranda", why: "Mengapa DTG", pool: "Talenta", sectors: "Sektor", process: "Proses", credentials: "Kredensial", request: "Diskusikan Kebutuhan" },
  ar: { home: "الرئيسية", why: "لماذا DTG", pool: "المواهب", sectors: "القطاعات", process: "العملية", credentials: "الاعتمادات", request: "اطلب المواهب" },
  bg: { home: "Начало", why: "Защо DTG", pool: "Таланти", sectors: "Сектори", process: "Процес", credentials: "Акредитации", request: "Заявете таланти" },
  ja: { home: "ホーム", why: "DTGについて", pool: "人材", sectors: "分野", process: "プロセス", credentials: "認定", request: "人材を相談する" },
};

export function Nav({ market = "gcc" }: { market?: Market }) {
  const [solid, setSolid] = useState(false);
  const [locale, setLocale] = useState<Locale>("en");
  const locales = MARKET_LOCALES[market];
  const copy = NAV_COPY[locale];

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const saved = window.localStorage.getItem(`dtg-market-language-${market}`) as Locale | null;
    if (saved && locales.some(({ value }) => value === saved)) setLocale(saved);
  }, [market, locales]);

  const chooseLocale = (value: Locale) => {
    setLocale(value);
    window.localStorage.setItem(`dtg-market-language-${market}`, value);
    document.documentElement.lang = value;
  };

  const linkColor = solid ? "#413E33" : "#E4E0CC";
  const brand1 = solid ? "#20301F" : "#F3EEE1";
  const brand2 = solid ? "#8A857A" : "#9FAE8E";

  return (
    <nav id="dtgnav" className={solid ? "solid" : ""}>
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "22px clamp(16px,4vw,40px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 24,
        }}
      >
        <a href="#top" style={{ display: "flex", alignItems: "center", gap: 13, textDecoration: "none" }}>
          <LogoMark size={34} />
          <span style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <span style={{ fontWeight: 700, fontSize: 13.5, letterSpacing: ".09em", color: brand1, transition: "color .3s ease" }}>
              DAYA TALENTA GLOBAL
            </span>
            <span className="nav-sub" style={{ fontFamily: "var(--font-mono)", fontSize: 8.5, letterSpacing: ".22em", color: brand2, transition: "color .3s ease" }}>
              PART OF DAYALIMA GROUP
            </span>
          </span>
        </a>
        <div className="navlinks" style={{ display: "flex", alignItems: "center", gap: 30 }}>
          {[
            { href: "/", label: copy.home },
            { href: "#why", label: copy.why },
            { href: "#pool", label: copy.pool },
            { href: "#sectors", label: copy.sectors },
            { href: "#process", label: copy.process },
            { href: "#credentials", label: copy.credentials },
          ].map((l) => (
            <a key={l.href} className="navlink" href={l.href} style={{ color: linkColor }}>
              {l.label}
            </a>
          ))}
        </div>
        <label style={{ display: "flex", alignItems: "center", border: `1px solid ${solid ? "rgba(65,62,51,.26)" : "rgba(243,238,225,.45)"}`, borderRadius: 7, padding: "0 9px", height: 40, color: linkColor }}>
          <select value={locale} onChange={(event) => chooseLocale(event.target.value as Locale)} aria-label="Select market language" style={{ appearance: "none", border: 0, outline: 0, background: "transparent", color: "inherit", font: "600 12px var(--font-sans)", cursor: "pointer", paddingRight: 4 }}>
            {locales.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
        <a
          href="#contact"
          className="navcta"
          style={{
            background: "#A8452F",
            color: "#F3EEE1",
            textDecoration: "none",
            fontSize: 13.5,
            fontWeight: 700,
            padding: "11px 22px",
            borderRadius: 7,
            transition: "background .15s, transform .15s",
            whiteSpace: "nowrap",
          }}
        >
          {copy.request}
        </a>
        <MobileMenu dark={solid} />
      </div>
    </nav>
  );
}
