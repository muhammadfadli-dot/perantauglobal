import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { Icon } from "@/components/pg/Icon";
import { Eyebrow, Section, SectionHeader } from "@/components/pg/primitives";
import { EventForm } from "@/components/pg/event/EventForm";
import {
  fetchEvent,
  fetchPublishedEventSlugs,
  formatEventWhen,
  type EventDetail,
} from "@/lib/events-db";

type RouteParams = { locale: string; slug: string };

export const revalidate = 60;

export async function generateStaticParams() {
  const slugs = await fetchPublishedEventSlugs();
  return slugs.map((slug) => ({ locale: "id", slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const { slug } = await params;
  const ev = await fetchEvent(slug);
  if (!ev) return { title: "Event tidak ditemukan" };
  const description =
    ev.content.intro?.slice(0, 155) ||
    ev.content.audience ||
    `Sharing session ${ev.title} bersama Perantau Global.`;
  const og = ev.content.poster || ev.coverImage;
  return {
    title: `${ev.title} — Sharing Session Perantau Global`,
    description,
    openGraph: {
      title: ev.title,
      description,
      ...(og ? { images: [{ url: og }] } : {}),
    },
  };
}

/** Cycle of accent colors for the campus-theme stacked title words. */
const CAMPUS_WORD_COLORS = [
  "var(--pg-blue-600)",
  "var(--pg-red-600)",
  "var(--pg-gold-700)",
];

/**
 * Split a campus title into colored words + a taped subtitle.
 * "Travel. Work. Repeat. : Dari Kampus ke Karier Global"
 *   → words ["Travel.", "Work.", "Repeat."], subtitle "Dari Kampus ke Karier Global"
 */
function splitCampusTitle(title: string): { words: string[]; subtitle: string | null } {
  const [head, ...rest] = title.split(":");
  const words = head.trim().split(/\s+/).filter(Boolean);
  const subtitle = rest.join(":").trim() || null;
  return { words, subtitle };
}

export default async function EventPage({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const { locale, slug } = await params;
  if (locale !== "id") notFound();
  setRequestLocale(locale);

  const ev = await fetchEvent(slug);
  if (!ev) notFound();

  const { content } = ev;
  const { dateLabel } = formatEventWhen(ev.startsAt, ev.timezone);

  // Time range (uses ends_at when present): "14.00–15.30 WIB".
  const tzAbbr = ev.timezone === "Asia/Jakarta" ? "WIB" : ev.timezone;
  const fmtTime = (iso: string) =>
    new Date(iso).toLocaleTimeString("id-ID", {
      timeZone: ev.timezone,
      hour: "2-digit",
      minute: "2-digit",
    });
  const startT = fmtTime(ev.startsAt);
  const endT = ev.endsAt ? fmtTime(ev.endsAt) : null;
  const timeRange = endT ? `${startT}–${endT} ${tzAbbr}` : `${startT} ${tzAbbr}`;

  const poster = content.poster || ev.coverImage;
  const speakers = content.speakers ?? [];
  const benefits = content.benefits ?? [];
  const partners = content.partners ?? [];
  const isCampus = content.theme === "campus";

  const meta = [
    { label: "Tanggal", value: dateLabel },
    { label: "Waktu", value: timeRange },
    { label: "Platform", value: ev.platform },
  ];

  return (
    <main>
      {/* ── Hero ───────────────────────────────────────────────── */}
      {isCampus ? (
        <CampusHero ev={ev} meta={meta} />
      ) : (
        <DefaultHero ev={ev} poster={poster} meta={meta} />
      )}

      {/* ── Co-brand partner strip ─────────────────────────────── */}
      {partners.length > 0 && (
        <div className="bg-pg-white border-b border-pg-ink-100">
          <div className="max-w-6xl mx-auto px-5 md:px-8 py-5 flex flex-col sm:flex-row sm:items-center gap-x-10 gap-y-4 flex-wrap">
            {partners.map((g) => (
              <div key={g.label} className="flex flex-col gap-1">
                <span className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-pg-ink-400">
                  {g.label}
                </span>
                <span className="text-[13.5px] font-bold text-pg-ink-700 leading-snug">
                  {g.items.join(" · ")}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Intro narrative ────────────────────────────────────── */}
      {content.intro && (
        <Section tone="paper" size="lg">
          <div className="max-w-3xl mx-auto text-center">
            <Eyebrow tone="red">Tentang sesi ini</Eyebrow>
            <p className="mt-4 text-[17px] md:text-[20px] font-medium leading-relaxed text-pg-ink-700">
              {content.intro}
            </p>
          </div>
        </Section>
      )}

      {/* ── Benefits ───────────────────────────────────────────── */}
      {benefits.length > 0 && (
        <Section tone="white" size="lg" border="top">
          <SectionHeader
            eyebrow="Yang kamu dapat"
            title={
              <>
                Pulang bawa <span className="text-pg-red-600">kejelasan.</span>
              </>
            }
          />
          <div className="mt-7 grid md:grid-cols-2 gap-3.5">
            {benefits.map((b, i) => (
              <div
                key={i}
                className="flex gap-3.5 items-start p-4 rounded-2xl bg-pg-white border border-pg-ink-100"
              >
                <span
                  className="w-8 h-8 rounded-full grid place-items-center shrink-0 mt-0.5"
                  style={{ background: "var(--pg-ok-bg)", color: "var(--pg-ok)" }}
                >
                  <Icon name="check" size={16} stroke={3} />
                </span>
                <span className="text-[15px] md:text-[16px] leading-relaxed text-pg-ink-700">
                  {b}
                </span>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* ── Speakers ───────────────────────────────────────────── */}
      {speakers.length > 0 && (
        <Section tone="paper" size="lg" border="top">
          <SectionHeader
            eyebrow="Pembicara"
            title={
              <>
                Belajar dari yang <span className="text-pg-red-600">sudah di sana.</span>
              </>
            }
            intro={content.speakersIntro}
          />
          <div className="mt-7 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {speakers.map((s, i) => {
              const primary = s.name ?? s.role ?? "Pembicara";
              return (
                <div
                  key={i}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-pg-white border border-pg-ink-100"
                  style={{ boxShadow: "var(--shadow-card)" }}
                >
                  <div className="w-16 h-16 rounded-full overflow-hidden shrink-0 bg-pg-ink-100 ring-2 ring-pg-red-100">
                    {s.photo ? (
                      <Image
                        src={s.photo}
                        alt={primary}
                        width={160}
                        height={160}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="w-full h-full grid place-items-center text-pg-ink-400">
                        <Icon name="user" size={26} />
                      </span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="text-[15px] font-extrabold text-pg-ink-900 leading-tight">
                      {primary}
                    </div>
                    {s.name && s.role && (
                      <div className="text-[13px] font-semibold text-pg-red-700 mt-0.5">
                        {s.role}
                      </div>
                    )}
                    {s.org && (
                      <div className="text-[12.5px] text-pg-ink-500 mt-0.5 leading-snug">
                        {s.org}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Section>
      )}

      {/* ── Daftar (form) ──────────────────────────────────────── */}
      <Section tone="white" size="lg" border="top">
        <div id="daftar" className="scroll-mt-24 grid md:grid-cols-[0.85fr_1.15fr] gap-8 md:gap-12 items-start">
          {/* Recap */}
          <div>
            <SectionHeader
              eyebrow="Daftar gratis"
              title={
                <>
                  Amankan <span className="text-pg-red-600">kursimu.</span>
                </>
              }
              intro="Isi data di samping. Link Zoom dikirim ke email & WhatsApp kamu sebelum acara."
            />
            <div className="mt-6 rounded-2xl bg-pg-ink-50 border border-pg-ink-100 divide-y divide-pg-ink-100">
              {[
                { label: "Tanggal", value: dateLabel },
                { label: "Waktu", value: timeRange },
                { label: "Platform", value: ev.platform },
                { label: "Biaya", value: "Gratis" },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between gap-4 px-4 py-3">
                  <span className="font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-pg-ink-500">
                    {row.label}
                  </span>
                  <span className="text-[14px] font-bold text-pg-ink-900 text-right">
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Form */}
          <div
            className="bg-pg-white border border-pg-ink-200 rounded-2xl p-5 md:p-7"
            style={{ boxShadow: "var(--pg-shadow-2)" }}
          >
            <EventForm
              eventSlug={ev.slug}
              eventTitle={ev.title}
              joinUrl={ev.joinUrl}
              professionLabel={content.form?.professionLabel}
              professionOptions={content.form?.professionOptions}
              interestLabel={content.form?.interestLabel}
              interestOptions={content.form?.interestOptions}
            />
          </div>
        </div>
      </Section>
    </main>
  );
}

/* ── Default hero (red) — unchanged look for non-campus events ── */
function DefaultHero({
  ev,
  poster,
  meta,
}: {
  ev: EventDetail;
  poster: string | null;
  meta: { label: string; value: string }[];
}) {
  const { content } = ev;
  return (
    <section className="relative overflow-hidden" style={{ background: "var(--pg-red-900)" }}>
      <div className="relative z-10 max-w-6xl mx-auto px-5 md:px-8 py-12 md:py-20 grid md:grid-cols-[1.1fr_0.9fr] gap-10 md:gap-12 items-center">
        <div className="flex flex-col items-start">
          <Eyebrow tone="gold" className="text-pg-gold-200">
            Sharing Session · Perantau Global
          </Eyebrow>
          <h1
            className="mt-4 text-[34px] md:text-[56px] font-extrabold tracking-[-0.03em] leading-[1.04]"
            style={{
              color: "var(--pg-cream)",
              textShadow: "0 1px 2px rgba(0,0,0,0.18), 0 2px 18px rgba(0,0,0,0.22)",
            }}
          >
            {ev.title}
          </h1>
          {content.tagline && (
            <p
              className="mt-4 max-w-lg text-[15px] md:text-[18px] font-medium italic leading-relaxed"
              style={{ color: "var(--pg-cream)", opacity: 0.92 }}
            >
              &ldquo;{content.tagline}&rdquo;
            </p>
          )}

          <div className="mt-7 grid grid-cols-1 sm:grid-cols-3 gap-2.5 w-full max-w-xl">
            {meta.map((m) => (
              <div
                key={m.label}
                className="rounded-xl px-3.5 py-2.5"
                style={{ background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.16)" }}
              >
                <div
                  className="font-mono text-[10px] font-bold uppercase tracking-[0.14em]"
                  style={{ color: "var(--pg-gold-200)" }}
                >
                  {m.label}
                </div>
                <div className="text-[13.5px] font-bold mt-0.5" style={{ color: "var(--pg-cream)" }}>
                  {m.value}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-7 flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <a
              href="#daftar"
              className="inline-flex items-center justify-center gap-2 min-h-[54px] px-7 rounded-2xl font-extrabold text-[16px] md:text-[17px] no-underline transition-transform active:scale-[0.985]"
              style={{ background: "var(--pg-cream)", color: "var(--pg-red-700)", boxShadow: "var(--shadow-cta-cream)" }}
            >
              Daftar gratis sekarang <Icon name="arrow_right" size={18} />
            </a>
            {content.audience && (
              <span className="text-[12.5px] font-semibold" style={{ color: "var(--pg-cream)", opacity: 0.9 }}>
                {content.audience}
              </span>
            )}
          </div>
        </div>

        {poster && (
          <div className="hidden md:block">
            <div
              className="rounded-2xl overflow-hidden mx-auto max-w-[360px]"
              style={{ boxShadow: "0 24px 60px rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.14)" }}
            >
              <Image
                src={poster}
                alt={ev.title}
                width={1200}
                height={1584}
                className="w-full h-auto"
                priority
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

/* ── Campus hero — playful flyer energy, scoped blue accent ───── */
function CampusHero({
  ev,
  meta,
}: {
  ev: EventDetail;
  meta: { label: string; value: string }[];
}) {
  const { content } = ev;
  const { words, subtitle } = splitCampusTitle(ev.title);
  const poster = content.poster || ev.coverImage;

  return (
    <section className="relative overflow-hidden" style={{ background: "var(--pg-cream)" }}>
      {/* Dotted paper motif (no image) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "radial-gradient(var(--pg-blue-200) 1.5px, transparent 1.6px), radial-gradient(var(--pg-red-200) 1.5px, transparent 1.6px)",
          backgroundSize: "28px 28px, 28px 28px",
          backgroundPosition: "0 0, 14px 14px",
        }}
      />
      {/* Color splashes */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -right-20 w-72 h-72 rounded-full blur-3xl opacity-30"
        style={{ background: "var(--pg-blue-600)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-28 -left-16 w-72 h-72 rounded-full blur-3xl opacity-20"
        style={{ background: "var(--pg-red-600)" }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-5 md:px-8 py-12 md:py-20 grid md:grid-cols-[1.15fr_0.85fr] gap-10 md:gap-12 items-center">
        {/* Left — title block */}
        <div className="flex flex-col items-start">
          <Eyebrow tone="gold">Sharing Session · Gratis · Online</Eyebrow>

          <h1 className="mt-4 font-extrabold tracking-[-0.04em] leading-[0.92] text-[44px] sm:text-[60px] md:text-[78px]">
            {words.map((w, i) => (
              <span
                key={i}
                className="block"
                style={{ color: CAMPUS_WORD_COLORS[i % CAMPUS_WORD_COLORS.length] }}
              >
                {w}
              </span>
            ))}
          </h1>

          {subtitle && (
            <div
              className="mt-5 inline-block -rotate-1 px-3.5 py-2 rounded-md font-extrabold text-[15px] md:text-[19px]"
              style={{ background: "var(--pg-gold-200)", color: "var(--pg-ink-900)" }}
            >
              {subtitle}
            </div>
          )}

          {content.tagline && (
            <p className="mt-4 max-w-md text-[14px] md:text-[16px] font-semibold text-pg-ink-500">
              {content.tagline}
            </p>
          )}

          <div className="mt-6 flex flex-wrap gap-2">
            {meta.map((m) => (
              <div
                key={m.label}
                className="rounded-xl bg-pg-white border border-pg-ink-200 px-3.5 py-2"
              >
                <div className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-pg-ink-400">
                  {m.label}
                </div>
                <div className="text-[13px] font-extrabold text-pg-ink-900 mt-0.5">
                  {m.value}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-7 flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <a
              href="#daftar"
              className="inline-flex items-center justify-center gap-2 min-h-[54px] px-7 rounded-2xl font-extrabold text-[16px] md:text-[17px] text-white no-underline transition-transform active:scale-[0.985]"
              style={{ background: "var(--pg-red-600)", boxShadow: "var(--pg-shadow-2)" }}
            >
              Daftar gratis sekarang <Icon name="arrow_right" size={18} />
            </a>
            {content.audience && (
              <span className="text-[12.5px] font-semibold text-pg-ink-500 max-w-[16rem]">
                {content.audience}
              </span>
            )}
          </div>
        </div>

        {/* Right — boarding-pass style schedule card, or poster if provided */}
        {poster ? (
          <div className="mx-auto max-w-[340px] w-full">
            <div
              className="rounded-2xl overflow-hidden"
              style={{ boxShadow: "var(--pg-shadow-2)", border: "1px solid var(--pg-ink-200)" }}
            >
              <Image
                src={poster}
                alt={ev.title}
                width={1200}
                height={1584}
                className="w-full h-auto"
                priority
              />
            </div>
          </div>
        ) : (
          <div className="mx-auto w-full max-w-[360px]">
            <div
              className="rounded-2xl bg-pg-white p-6 md:p-7"
              style={{ border: "2px solid var(--pg-ink-900)", boxShadow: "8px 8px 0 var(--pg-ink-900)" }}
            >
              <div className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-pg-ink-400">
                Catat tanggalnya
              </div>
              <div className="mt-4 space-y-4">
                {meta.map((m) => (
                  <div key={m.label} className="flex items-start gap-3">
                    <span
                      className="w-9 h-9 rounded-xl grid place-items-center shrink-0"
                      style={{ background: "var(--pg-blue-600)", color: "#fff" }}
                    >
                      <Icon
                        name={m.label === "Platform" ? "zoom" : m.label === "Waktu" ? "clock" : "compass"}
                        size={18}
                      />
                    </span>
                    <div>
                      <div className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-pg-ink-400">
                        {m.label}
                      </div>
                      <div className="text-[15px] font-extrabold text-pg-ink-900 leading-tight">
                        {m.value}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-5 border-t border-dashed border-pg-ink-200 flex items-center justify-between">
                <span className="text-[13px] font-bold text-pg-ink-500">Biaya</span>
                <span
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[13px] font-extrabold"
                  style={{ background: "var(--pg-ok-bg)", color: "var(--pg-ok)" }}
                >
                  <Icon name="check" size={14} stroke={3} /> Gratis
                </span>
              </div>
              <div
                className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-md font-extrabold text-[13px] -rotate-1"
                style={{ background: "var(--pg-blue-600)", color: "#fff" }}
              >
                <Icon name="globe" size={15} /> Let&apos;s Go Global!
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
