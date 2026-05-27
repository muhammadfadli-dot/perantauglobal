"use client";

import { useEffect, useState } from "react";
import { Icon, type IconName } from "@/components/pg/Icon";

/**
 * Tabbed wrapper for the Position Editor (Phase 6b).
 *
 * Renders a sticky tab bar at top of the editor and switches visibility
 * of sibling `<section data-tab="X">` blocks via CSS display. Tab state is
 * persisted in URL hash so deep-linking works (e.g. /admin/positions/X#form).
 *
 * Important: tabs use `display: none` for inactive sections, NOT unmount.
 * This preserves the underlying editors' (ContentEditor, ApplicationFields,
 * etc.) internal state when user switches tabs.
 *
 * Usage in admin page:
 *   <EditorTabsHeader counts={{ form: 6, jobs: 2 }} />
 *   <section data-tab="konten">...ContentEditor...</section>
 *   <section data-tab="form">...ApplicationFieldsEditor...</section>
 *   <section data-tab="settings">...PositionActiveToggle + meta + delete...</section>
 *   <section data-tab="jobs">...Job orders list...</section>
 */

type TabKey = "konten" | "form" | "settings" | "jobs";

const TABS: Array<{ key: TabKey; label: string; icon: IconName }> = [
  { key: "konten", label: "Konten landing", icon: "doc" },
  { key: "form", label: "Form lamaran", icon: "compass" },
  { key: "settings", label: "Settings", icon: "shield" },
  { key: "jobs", label: "Job orders", icon: "briefcase" },
];

const DEFAULT_TAB: TabKey = "konten";

function readHash(): TabKey {
  if (typeof window === "undefined") return DEFAULT_TAB;
  const h = window.location.hash.replace(/^#/, "");
  return TABS.some((t) => t.key === h) ? (h as TabKey) : DEFAULT_TAB;
}

export function EditorTabsHeader({
  counts,
}: {
  counts?: Partial<Record<TabKey, number>>;
}) {
  const [active, setActive] = useState<TabKey>(DEFAULT_TAB);

  // Initialize from URL hash on mount + listen for hash changes
  useEffect(() => {
    setActive(readHash());
    const onHash = () => setActive(readHash());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  // Apply data-active-tab to <html> so sibling [data-tab] sections can use
  // CSS attribute selectors to hide non-active tabs
  useEffect(() => {
    document.documentElement.dataset.editorTab = active;
    return () => {
      delete document.documentElement.dataset.editorTab;
    };
  }, [active]);

  const handleClick = (k: TabKey) => {
    setActive(k);
    if (window.location.hash !== `#${k}`) {
      history.replaceState(null, "", `#${k}`);
    }
    // Scroll to top of section
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  };

  return (
    <>
      <style>{`
        [data-editor-tab="konten"]   section[data-tab]:not([data-tab="konten"])   { display: none; }
        [data-editor-tab="form"]     section[data-tab]:not([data-tab="form"])     { display: none; }
        [data-editor-tab="settings"] section[data-tab]:not([data-tab="settings"]) { display: none; }
        [data-editor-tab="jobs"]     section[data-tab]:not([data-tab="jobs"])     { display: none; }
      `}</style>
      <nav
        className="sticky top-0 z-20 -mx-5 px-5 py-2 mb-4 border-b"
        style={{
          background: "rgba(255,255,255,0.96)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          borderColor: "var(--pg-ink-100)",
        }}
        aria-label="Bagian editor"
      >
        <div className="flex gap-1 overflow-x-auto scrollbar-none" style={{ scrollbarWidth: "none" as const }}>
          {TABS.map((t) => {
            const on = active === t.key;
            const count = counts?.[t.key];
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => handleClick(t.key)}
                aria-current={on ? "page" : undefined}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-[10px] font-bold text-[13px] tracking-[-0.005em] whitespace-nowrap transition-colors ${
                  on ? "" : "hover:bg-pg-ink-50"
                }`}
                style={
                  on
                    ? {
                        background: "var(--pg-ink-900)",
                        color: "#fff",
                      }
                    : {
                        color: "var(--pg-ink-700)",
                      }
                }
              >
                <Icon name={t.icon} size={14} stroke={on ? 2.4 : 2} />
                {t.label}
                {typeof count === "number" && count > 0 && (
                  <span
                    className="inline-flex items-center justify-center min-w-[20px] h-[18px] px-1.5 rounded-full font-mono text-[10px] font-bold tracking-[0.02em]"
                    style={
                      on
                        ? { background: "rgba(255,255,255,0.20)", color: "#fff" }
                        : { background: "var(--pg-ink-50)", color: "var(--pg-ink-700)" }
                    }
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
