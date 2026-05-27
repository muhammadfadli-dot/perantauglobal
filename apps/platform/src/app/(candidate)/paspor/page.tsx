import Link from "next/link";
import { BottomNav } from "@/components/pg/AppChrome";
import { Icon, type IconName } from "@/components/pg/Icon";
import { BerandaTopBar, SectionHead } from "@/components/pg/candidate/BerandaShared";

export const dynamic = "force-static";

/**
 * Paspor Perantau Global tab — Airbnb-Journey portal v2 design.
 *
 * Mock content (no schema yet for paspor courses/lessons/progress —
 * see Phase 7 for `paspor_courses`/`paspor_lessons` tables). The page
 * looks live but every "Lanjut" / "Mulai" CTA opens WhatsApp waitlist
 * via the user's existing /paspor coming-soon flow.
 */

const MODULES: Array<{
  num: string;
  title: string;
  lessons: string;
  duration: string;
  progress: number; // 0-100
  state: "done" | "in_progress" | "locked";
}> = [
  {
    num: "01",
    title: "Pengantar kerja di Jepang",
    lessons: "5 pelajaran",
    duration: "45 mnt",
    progress: 100,
    state: "done",
  },
  {
    num: "02",
    title: "Bahasa kantor & sapaan",
    lessons: "6 pelajaran",
    duration: "1 jam",
    progress: 60,
    state: "in_progress",
  },
  {
    num: "03",
    title: "Etika & budaya tempat kerja",
    lessons: "4 pelajaran",
    duration: "40 mnt",
    progress: 0,
    state: "locked",
  },
  {
    num: "04",
    title: "Adaptasi hidup di Osaka",
    lessons: "5 pelajaran",
    duration: "1 jam 20 mnt",
    progress: 0,
    state: "locked",
  },
];

const OTHER_PASPOR: Array<{
  flag: string;
  name: string;
  sub: string;
  muted?: boolean;
  href: string;
}> = [
  { flag: "🇸🇦", name: "Arab Saudi", sub: "3 jam · 4 modul", href: "/sertifikasi/paspor-perantau-global-saudi-arabia" },
  { flag: "🇹🇼", name: "Taiwan", sub: "Segera", muted: true, href: "/paspor" },
  { flag: "🇮🇩", name: "Indonesia", sub: "Segera", muted: true, href: "/paspor" },
];

export default function PasporPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--pg-paper)" }}>
      <BerandaTopBar />
      <main className="flex-1 pb-8 pt-1">
        {/* Hero header */}
        <div className="px-5 pb-3.5">
          <h1
            className="font-extrabold tracking-[-0.025em] leading-[1.1] text-pg-ink-900 m-0 text-balance"
            style={{ fontSize: "clamp(22px, 6vw, 28px)" }}
          >
            Paspormu
          </h1>
          <p className="text-[13px] text-pg-ink-500 mt-1 m-0">
            Bekal siap kerja di luar negeri · sertifikat di akhir
          </p>
        </div>

        {/* Active Paspor hero — amber */}
        <div className="px-5">
          <PasporHero />
        </div>

        {/* Continue lesson */}
        <div className="px-5 pt-5">
          <SectionHead title="Lanjutkan dari kemarin" />
          <ContinueLessonCard />
        </div>

        {/* All modules */}
        <div className="px-5 pt-5">
          <SectionHead
            title="4 modul · ~5 jam"
            sub="1/4 selesai"
          />
          <div className="flex flex-col gap-2.5">
            {MODULES.map((m) => (
              <ModuleRow key={m.num} module={m} />
            ))}
          </div>
        </div>

        {/* Other countries */}
        <div className="pt-5">
          <div className="px-5 mb-2">
            <SectionHead
              title="Paspor lainnya"
              sub="Untuk negara berbeda"
            />
          </div>
          <div className="pl-5">
            <div className="flex gap-3 overflow-x-auto pb-1 pr-5 scrollbar-none" style={{ scrollbarWidth: "none" as const }}>
              {OTHER_PASPOR.map((p) => (
                <OtherPasporCard key={p.name} {...p} />
              ))}
            </div>
          </div>
        </div>

        {/* Mock data disclaimer */}
        <div className="px-5 pt-6">
          <div
            className="rounded-[12px] p-3.5 text-[12px] text-pg-ink-500 leading-snug"
            style={{
              background: "var(--pg-ink-50)",
              border: "1px dashed var(--pg-ink-200)",
            }}
          >
            <strong className="text-pg-ink-700">Demo konten.</strong> Modul + progress di
            atas masih placeholder — konten resmi disiapin tim Perantau Global. Hubungi
            via WhatsApp kalau kamu mau jadi early access.
          </div>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}

function PasporHero() {
  return (
    <div
      className="relative overflow-hidden rounded-[22px]"
      style={{
        background:
          "linear-gradient(135deg, #fffaef 0%, var(--pa-amber-100) 50%, #fbecc3 100%)",
        border: "1px solid var(--pa-amber-200)",
        boxShadow:
          "0 6px 18px rgba(201,138,20,0.15), 0 12px 36px rgba(201,138,20,0.08)",
      }}
    >
      <span
        aria-hidden
        className="absolute pointer-events-none"
        style={{
          top: -36,
          right: -36,
          width: 140,
          height: 140,
          background:
            "radial-gradient(circle, var(--pa-amber-500), transparent 70%)",
          opacity: 0.2,
        }}
      />
      <div className="relative p-5">
        <div className="flex items-center gap-3">
          <div
            className="w-[52px] h-[52px] rounded-[14px] grid place-items-center text-white shrink-0"
            style={{
              background:
                "linear-gradient(135deg, var(--pa-amber-500), var(--pa-amber-600))",
              boxShadow:
                "0 2px 6px rgba(201,138,20,0.4), inset 0 1px 0 rgba(255,255,255,0.3)",
            }}
          >
            <Icon name="passport" size={26} stroke={2} />
          </div>
          <div className="flex flex-col gap-1 flex-1 min-w-0">
            <span
              className="inline-flex items-center w-fit gap-1.5 px-2.5 py-1 rounded font-mono text-[9.5px] font-bold uppercase tracking-[0.06em]"
              style={{
                background: "var(--pa-amber-700)",
                color: "var(--pa-amber-50)",
              }}
            >
              <span
                aria-hidden
                className="w-1 h-1 rounded-full bg-white animate-pulse"
              />
              Sedang berjalan
            </span>
            <span
              className="font-extrabold tracking-[-0.02em] leading-tight"
              style={{
                fontSize: 20,
                color: "var(--pa-amber-700)",
              }}
            >
              Siap kerja di Jepang
            </span>
          </div>
        </div>

        {/* Progress */}
        <div className="mt-4">
          <div className="h-2 bg-pg-white/60 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: "40%",
                background:
                  "linear-gradient(90deg, var(--pa-amber-500), var(--pa-amber-600))",
              }}
            />
          </div>
          <div
            className="mt-1.5 flex items-center justify-between font-mono text-[11px] font-bold tracking-[0.02em]"
            style={{ color: "var(--pa-amber-700)" }}
          >
            <span>1 dari 4 modul</span>
            <span>~3 jam tersisa</span>
          </div>
        </div>

        {/* Sertifikat callout */}
        <div
          className="mt-4 px-3.5 py-2.5 rounded-[12px] flex items-center gap-2"
          style={{
            background: "rgba(255,255,255,0.65)",
          }}
        >
          <Icon
            name="sparkle"
            size={16}
            className=""
            style={{ color: "var(--pa-amber-700)" }}
          />
          <span className="text-[12px] text-pg-ink-700 leading-snug">
            Selesai semua → <strong>Sertifikat Paspor Jepang</strong>
          </span>
        </div>
      </div>
    </div>
  );
}

function ContinueLessonCard() {
  return (
    <Link
      href="/paspor"
      className="block rounded-[14px] overflow-hidden bg-pg-white no-underline text-pg-ink-900 transition-transform hover:-translate-y-0.5"
      style={{
        border: "1px solid var(--pg-ink-100)",
        boxShadow: "0 1px 2px rgba(20,16,12,0.04), 0 8px 24px rgba(20,16,12,0.06)",
      }}
    >
      {/* Photo tile top */}
      <div
        className="relative h-[100px] p-3.5 flex flex-col text-white"
        style={{
          background: "var(--pa-amber-700)",
          backgroundImage:
            "linear-gradient(135deg, rgba(110,73,6,0.35), rgba(110,73,6,0.65)), url(/images/countries/jepang.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] opacity-85">
          Modul 2 · Bahasa kantor
        </span>
        <span
          className="mt-auto font-extrabold tracking-[-0.015em] text-[16px]"
          style={{ textShadow: "0 1px 4px rgba(0,0,0,0.30)" }}
        >
          Sapaan &amp; perkenalan
        </span>
      </div>
      {/* Progress + CTA */}
      <div className="flex items-center gap-3 p-3 pl-3.5">
        <div className="flex flex-col gap-1.5 flex-1 min-w-0">
          <div className="h-1.5 bg-pg-ink-50 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: "60%",
                background:
                  "linear-gradient(90deg, var(--pa-amber-500), var(--pa-amber-600))",
              }}
            />
          </div>
          <span className="font-mono text-[10.5px] text-pg-ink-500 tracking-[0.02em]">
            Pelajaran 4 dari 6 · ~12 mnt
          </span>
        </div>
        <span
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-[10px] font-bold text-[12px] text-white shrink-0"
          style={{
            background:
              "linear-gradient(135deg, var(--pa-amber-500), var(--pa-amber-600))",
            boxShadow: "0 2px 6px rgba(201,138,20,0.30)",
          }}
        >
          Lanjut
          <Icon name="arrow_right" size={13} stroke={2.4} />
        </span>
      </div>
    </Link>
  );
}

function ModuleRow({
  module,
}: {
  module: {
    num: string;
    title: string;
    lessons: string;
    duration: string;
    progress: number;
    state: "done" | "in_progress" | "locked";
  };
}) {
  const done = module.state === "done";
  const inProgress = module.state === "in_progress";

  return (
    <Link
      href="/paspor"
      className="flex items-center gap-3 p-3.5 rounded-[14px] bg-pg-white no-underline text-pg-ink-900"
      style={{
        border: done
          ? "1px solid var(--pg-ok-bg)"
          : "1px solid var(--pg-ink-100)",
        background: done
          ? "linear-gradient(180deg, #fff 0%, var(--pg-ok-bg) 100%)"
          : "var(--pg-white)",
        boxShadow: "0 1px 2px rgba(20,16,12,0.04), 0 4px 12px rgba(20,16,12,0.04)",
      }}
    >
      <span
        className="w-11 h-11 rounded-[12px] grid place-items-center shrink-0 font-mono text-[14px] font-extrabold"
        style={{
          background: done
            ? "var(--pg-ok)"
            : inProgress
            ? "var(--pa-amber-500)"
            : "var(--pg-ink-50)",
          color: done || inProgress ? "#fff" : "var(--pg-ink-400)",
        }}
      >
        {done ? <Icon name="check" size={18} stroke={3} /> : module.num}
      </span>
      <div className="flex flex-col gap-0.5 flex-1 min-w-0">
        <span className="text-[14px] font-extrabold tracking-[-0.01em] truncate">
          {module.title}
        </span>
        <span className="text-[11px] text-pg-ink-500">
          {module.lessons} · {module.duration}
        </span>
        {inProgress && (
          <div className="mt-1.5 h-1 bg-pg-ink-50 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: `${module.progress}%`,
                background:
                  "linear-gradient(90deg, var(--pa-amber-500), var(--pa-amber-600))",
              }}
            />
          </div>
        )}
      </div>
      {done ? (
        <span
          className="inline-flex items-center px-2 py-0.5 rounded font-mono text-[9.5px] font-bold uppercase tracking-[0.06em]"
          style={{ background: "var(--pg-ok-bg)", color: "var(--pg-ok)" }}
        >
          Selesai
        </span>
      ) : (
        <Icon name="chevron_right" size={16} className="text-pg-ink-400" />
      )}
    </Link>
  );
}

function OtherPasporCard({
  flag,
  name,
  sub,
  muted,
  href,
}: {
  flag: string;
  name: string;
  sub: string;
  muted?: boolean;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="shrink-0 flex flex-col gap-2 rounded-[14px] p-3.5 bg-pg-white no-underline text-pg-ink-900 transition-transform hover:-translate-y-0.5"
      style={{
        minWidth: 150,
        border: "1px solid var(--pg-ink-100)",
        boxShadow: "0 1px 2px rgba(20,16,12,0.04), 0 4px 12px rgba(20,16,12,0.04)",
        opacity: muted ? 0.7 : 1,
      }}
    >
      <span aria-hidden className="text-[30px] leading-none">{flag}</span>
      <span className="text-[14px] font-extrabold tracking-[-0.01em] mt-2">
        Paspor {name}
      </span>
      <span
        className="font-mono text-[10px] font-bold tracking-[0.06em] uppercase"
        style={{ color: "var(--pa-amber-700)" }}
      >
        {sub}
      </span>
    </Link>
  );
}

// Suppress unused-import false-positive (IconName referenced in JSX expressions)
const _suppress: IconName | null = null;
void _suppress;
