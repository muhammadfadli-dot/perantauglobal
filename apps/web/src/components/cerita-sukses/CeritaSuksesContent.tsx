import { useTranslations } from "next-intl";
import {
  Accent,
  DisplayHeadline,
  EditorialButton,
  Italic,
  MetaStrip,
  MonoLabel,
  SectionTag,
} from "@/components/editorial";

const STORY_KEYS = ["story1", "story2", "story3", "story4"] as const;

export default function CeritaSuksesContent() {
  const t = useTranslations("successStories");

  return (
    <>
      {/* Editorial hero */}
      <section className="overflow-hidden border-b border-[var(--color-dtg-ink)] bg-[var(--color-dtg-cream)] text-[var(--color-dtg-ink)]">
        <MetaStrip
          left="§ Cerita sukses · dari lapangan"
          right={<span className="text-[var(--color-dtg-red)]">● 3,400+ alumni · 50+ negara</span>}
          tone="cream"
          border="bottom"
        />
        <div className="mx-auto max-w-[1440px] px-6 py-16 lg:px-14 lg:py-20 animate-[slideUp_0.6s_var(--ease-out-expo)]">
          <div className="flex items-center gap-3">
            <span className="block h-[2px] w-9 bg-[var(--color-dtg-red)]" />
            <MonoLabel className="text-[var(--color-dtg-red)] opacity-100" size="sm">
              Suara Perantau Global
            </MonoLabel>
          </div>
          <DisplayHeadline as="h1" size="hero" className="mt-6 max-w-[22ch]">
            Bukan iklan,{" "}
            <Italic>cerita</Italic>{" "}
            <Accent>mereka sendiri.</Accent>
          </DisplayHeadline>
          <p className="mt-8 max-w-[58ch] text-[clamp(16px,1.6vw,20px)] leading-[1.5] opacity-80">
            {t("subtitle")}
          </p>
        </div>
      </section>

      {/* Magazine spread — 4 stories, alternating layout */}
      <div className="bg-[var(--color-dtg-paper)]">
        {STORY_KEYS.map((key, i) => {
          const name = t(`stories.${key}.name`);
          const position = t(`stories.${key}.position`);
          const destination = t(`stories.${key}.destination`);
          const duration = t(`stories.${key}.duration`);
          const quote = t(`stories.${key}.quote`);
          const highlight = t(`stories.${key}.highlight`);
          const sectionNumber = String(i + 1).padStart(2, "0");
          const isEven = i % 2 === 0;

          return (
            <section
              key={key}
              className={
                "px-6 py-16 text-[var(--color-dtg-ink)] lg:px-14 lg:py-24 " +
                (i % 2 === 0 ? "bg-white" : "bg-[var(--color-dtg-cream)]")
              }
            >
              <div className="mx-auto max-w-[1440px]">
                <SectionTag number={sectionNumber} label={`${destination} · ${duration}`} />

                <div
                  className={
                    "mt-10 grid gap-12 lg:grid-cols-[1fr_auto] lg:gap-16 " +
                    (isEven ? "" : "lg:grid-cols-[auto_1fr]")
                  }
                >
                  {/* Pull-quote */}
                  <figure
                    className={
                      "border-y-2 border-[var(--color-dtg-ink)] px-8 py-10 lg:px-14 lg:py-12 " +
                      (i % 2 === 0 ? "bg-[var(--color-dtg-paper)]" : "bg-white") +
                      (isEven ? "" : " lg:order-2")
                    }
                  >
                    <MonoLabel className="block opacity-60">Cerita {sectionNumber}</MonoLabel>
                    <blockquote className="mt-6 font-[family-name:var(--font-display)] text-[clamp(24px,3vw,44px)] font-extrabold leading-[1.15] tracking-[-0.03em] text-balance">
                      <span className="text-[var(--color-dtg-red)]">“</span>
                      {quote}
                      <span className="text-[var(--color-dtg-red)]">”</span>
                    </blockquote>
                    <figcaption className="mt-8 flex flex-wrap items-end justify-between gap-4 border-t border-[var(--color-dtg-ink)] pt-5">
                      <div>
                        <p className="font-[family-name:var(--font-display)] text-xl font-extrabold tracking-[-0.02em]">
                          {name}
                        </p>
                        <MonoLabel className="mt-1 block opacity-70">
                          {position} · {destination}
                        </MonoLabel>
                      </div>
                      <MonoLabel className="opacity-60">{duration}</MonoLabel>
                    </figcaption>
                  </figure>

                  {/* Highlight card */}
                  <aside
                    className={
                      "flex min-w-[280px] flex-col justify-between gap-6 border border-[var(--color-dtg-ink)] bg-white p-8 lg:min-w-[320px] lg:p-10 " +
                      (isEven ? "" : " lg:order-1")
                    }
                  >
                    <div>
                      <MonoLabel className="block opacity-60" size="xs">
                        Highlight
                      </MonoLabel>
                      <p className="mt-3 font-[family-name:var(--font-display)] text-[22px] font-extrabold leading-[1.2] tracking-[-0.02em]">
                        {highlight}
                      </p>
                    </div>
                    <div className="border-t border-[color:rgba(26,26,26,0.15)] pt-4">
                      <p className="font-[family-name:var(--font-mono)] text-[10px] font-bold uppercase tracking-[0.12em] opacity-60">
                        Posisi
                      </p>
                      <p className="mt-1.5 font-[family-name:var(--font-display)] text-lg font-extrabold tracking-[-0.02em]">
                        {position}
                      </p>
                    </div>
                    <div>
                      <p className="font-[family-name:var(--font-mono)] text-[10px] font-bold uppercase tracking-[0.12em] opacity-60">
                        Lokasi
                      </p>
                      <p className="mt-1.5 font-[family-name:var(--font-display)] text-lg font-extrabold tracking-[-0.02em]">
                        {destination}
                      </p>
                    </div>
                  </aside>
                </div>
              </div>
            </section>
          );
        })}
      </div>

      {/* CTA poster */}
      <section className="relative overflow-hidden bg-[var(--color-dtg-red)] text-white">
        <MetaStrip
          left="§ Next step"
          right={<span className="text-white">● Ceritamu bisa jadi cerita berikutnya</span>}
          tone="red"
          border="bottom"
          className="text-white"
        />
        <div className="mx-auto max-w-[1440px] px-6 py-14 lg:px-14 lg:py-20">
          <DisplayHeadline size="poster" className="max-w-[14ch]">
            {t("cta.title")}
          </DisplayHeadline>
          <p className="mt-6 max-w-[42ch] text-lg leading-[1.5] text-white/90">{t("cta.subtitle")}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <EditorialButton href="/daftar" variant="ink" suffix="→">
              Daftar sekarang
            </EditorialButton>
            <EditorialButton href="https://wa.me/6285211415104" variant="cream" suffix="→" target="_blank" rel="noopener noreferrer">
              WhatsApp langsung
            </EditorialButton>
          </div>
        </div>
      </section>
    </>
  );
}
