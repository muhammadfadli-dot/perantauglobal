"use client";

import { useEffect, useState } from "react";
import { LogoMark } from "@/components/LogoMark";
import { MobileMenu, type MobileMenuCopy } from "@/components/MobileMenu";

type Market = "gcc" | "europe" | "japan";
type Locale = "en" | "id" | "ar" | "bg" | "ja";

type MarketLocale = { value: Locale; label: string; flagSrc: string; country: string };

const MARKET_LOCALES: Record<Market, MarketLocale[]> = {
  gcc: [{ value: "en", label: "English", flagSrc: "/images/flag-us.svg", country: "United States" }, { value: "id", label: "Indonesia", flagSrc: "/images/flag-id.svg", country: "Indonesia" }, { value: "ar", label: "العربية", flagSrc: "/images/flag-sa.svg", country: "Saudi Arabia" }],
  europe: [{ value: "en", label: "English", flagSrc: "/images/flag-us.svg", country: "United States" }, { value: "id", label: "Indonesia", flagSrc: "/images/flag-id.svg", country: "Indonesia" }, { value: "bg", label: "Български", flagSrc: "/images/flag-bg.svg", country: "Bulgaria" }],
  japan: [{ value: "en", label: "English", flagSrc: "/images/flag-us.svg", country: "United States" }, { value: "id", label: "Indonesia", flagSrc: "/images/flag-id.svg", country: "Indonesia" }, { value: "ja", label: "日本語", flagSrc: "/images/flag-jp.svg", country: "Japan" }],
};

const NAV_COPY: Record<Locale, { home: string; why: string; pool: string; sectors: string; process: string; credentials: string; faq: string; request: string; menu: string; openMenu: string; closeMenu: string }> = {
  en: { home: "Home", why: "Why DTG", pool: "Talent Pool", sectors: "Sectors", process: "Process", credentials: "Credentials", faq: "FAQ", request: "Request Talent", menu: "MENU", openMenu: "Open menu", closeMenu: "Close menu" },
  id: { home: "Beranda", why: "Mengapa DTG", pool: "Talenta", sectors: "Sektor", process: "Proses", credentials: "Kredensial", faq: "Pertanyaan", request: "Diskusikan Kebutuhan", menu: "MENU", openMenu: "Buka menu", closeMenu: "Tutup menu" },
  ar: { home: "الرئيسية", why: "لماذا DTG", pool: "المواهب", sectors: "القطاعات", process: "العملية", credentials: "الاعتمادات", faq: "الأسئلة الشائعة", request: "اطلب المواهب", menu: "القائمة", openMenu: "فتح القائمة", closeMenu: "إغلاق القائمة" },
  bg: { home: "Начало", why: "Защо DTG", pool: "Таланти", sectors: "Сектори", process: "Процес", credentials: "Акредитации", faq: "Въпроси", request: "Заявете таланти", menu: "МЕНЮ", openMenu: "Отвори менюто", closeMenu: "Затвори менюто" },
  ja: { home: "ホーム", why: "DTGについて", pool: "人材", sectors: "分野", process: "プロセス", credentials: "認定", faq: "よくある質問", request: "人材を相談する", menu: "メニュー", openMenu: "メニューを開く", closeMenu: "メニューを閉じる" },
};

export function Nav({ market = "gcc", initialLocale = "en" }: { market?: Market; initialLocale?: Locale }) {
  const [solid, setSolid] = useState(false);
  const [locale, setLocale] = useState<Locale>(initialLocale);
  const [languageOpen, setLanguageOpen] = useState(false);
  const locales = MARKET_LOCALES[market];
  const copy = NAV_COPY[locale];
  const activeLocale = locales.find(({ value }) => value === locale) ?? locales[0];
  const showPool = !(market === "gcc" && initialLocale !== "en");
  const sectionLinks = [
    { href: "#why", label: copy.why },
    ...(showPool ? [{ href: "#pool", label: copy.pool }] : []),
    { href: "#sectors", label: copy.sectors },
    { href: "#process", label: copy.process },
    { href: "#credentials", label: copy.credentials },
  ];
  const mobileCopy: MobileMenuCopy = {
    menu: copy.menu,
    openMenu: copy.openMenu,
    closeMenu: copy.closeMenu,
    request: copy.request,
    links: [...sectionLinks, { href: "#faq", label: copy.faq }],
  };

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (initialLocale !== "en") {
      setLocale(initialLocale);
      document.documentElement.lang = initialLocale;
      document.documentElement.dir = initialLocale === "ar" ? "rtl" : "ltr";
      return;
    }
    const translatedLocale = new URLSearchParams(window.location.search).get("_x_tr_tl") as Locale | null;
    if (translatedLocale && locales.some(({ value }) => value === translatedLocale)) {
      setLocale(translatedLocale);
      document.documentElement.lang = translatedLocale;
      document.documentElement.dir = translatedLocale === "ar" ? "rtl" : "ltr";
      return;
    }
    const saved = window.localStorage.getItem(`dtg-market-language-${market}`) as Locale | null;
    if (saved && locales.some(({ value }) => value === saved)) {
      setLocale(saved);
      document.documentElement.lang = saved;
      document.documentElement.dir = saved === "ar" ? "rtl" : "ltr";
    }
  }, [initialLocale, market, locales]);

  const chooseLocale = (value: Locale) => {
    setLocale(value);
    setLanguageOpen(false);
    window.localStorage.setItem(`dtg-market-language-${market}`, value);
    document.documentElement.lang = value;
    document.documentElement.dir = value === "ar" ? "rtl" : "ltr";
    if (market === "gcc" && value === "id") {
      window.location.assign("/id/saudi-gcc");
      return;
    }
    if (market === "gcc" && value === "ar") {
      window.location.assign("/ar/saudi-gcc");
      return;
    }
    if (market === "gcc" && value === "en") {
      window.location.assign("/en/saudi-gcc");
      return;
    }
    if (value === "en") {
      window.location.assign(`https://www.dayatalentaglobal.com${window.location.pathname}`);
      return;
    }
    const params = new URLSearchParams({ _x_tr_sl: "en", _x_tr_tl: value, _x_tr_hl: value, _x_tr_pto: "wapp" });
    window.location.assign(`https://www-dayatalentaglobal-com.translate.goog${window.location.pathname}?${params.toString()}`);
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
          {[{ href: "/", label: copy.home }, ...sectionLinks].map((l) => (
            <a key={l.href} className="navlink" href={l.href} style={{ color: linkColor }}>
              {l.label}
            </a>
          ))}
        </div>
        <div className="market-language">
          <button
            type="button"
            className="market-language-trigger"
            aria-label={`Select language, currently ${activeLocale.label}`}
            aria-expanded={languageOpen}
            aria-haspopup="listbox"
            onClick={() => setLanguageOpen((open) => !open)}
            style={{ color: linkColor, borderColor: solid ? "rgba(65,62,51,.26)" : "rgba(243,238,225,.45)" }}
          >
            <span className="market-language-flag" aria-hidden><img src={activeLocale.flagSrc} alt="" /></span>
            <span className="market-language-label">{activeLocale.label}</span>
            <svg aria-hidden width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="m4 6 4 4 4-4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
          {languageOpen && <div className="market-language-menu" role="listbox" aria-label="Choose market language">
            <span className="market-language-menu-label">MARKET LANGUAGE</span>
            {locales.map((item) => (
              <button key={item.value} type="button" role="option" aria-selected={locale === item.value} onClick={() => chooseLocale(item.value)}>
                <span className="market-language-flag" aria-hidden><img src={item.flagSrc} alt="" /></span>
                <span><b>{item.label}</b><small>{item.country}</small></span>
                {locale === item.value && <span className="market-language-check" aria-hidden>✓</span>}
              </button>
            ))}
          </div>}
        </div>
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
        <MobileMenu dark={solid} copy={mobileCopy} />
      </div>
    </nav>
  );
}
