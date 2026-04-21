"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  Accent,
  DisplayHeadline,
  EditorialButton,
  Italic,
  MetaStrip,
  MonoLabel,
} from "@/components/editorial";

interface Props {
  posts: Array<Record<string, unknown>>;
  categories: string[];
}

export default function BlogIndexEditorial({ posts, categories }: Props) {
  const t = useTranslations("blog");
  const locale = useLocale();
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const filteredPosts =
    activeCategory === "all"
      ? posts
      : posts.filter((post) => post.category === activeCategory);

  const dateFormat = (iso: string) =>
    new Date(iso).toLocaleDateString(locale === "id" ? "id-ID" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const featured = filteredPosts[0];
  const rest = filteredPosts.slice(1);

  return (
    <>
      {/* Editorial hero */}
      <section className="overflow-hidden border-b border-[var(--color-dtg-ink)] bg-[var(--color-dtg-cream)] text-[var(--color-dtg-ink)]">
        <MetaStrip
          left="§ Blog · Pusat informasi PMI"
          right={<span className="text-[var(--color-dtg-red)]">● {posts.length} artikel tersedia</span>}
          tone="cream"
          border="bottom"
        />
        <div className="mx-auto max-w-[1440px] px-6 py-16 lg:px-14 lg:py-20 animate-[slideUp_0.6s_var(--ease-out-expo)]">
          <div className="flex items-center gap-3">
            <span className="block h-[2px] w-9 bg-[var(--color-dtg-red)]" />
            <MonoLabel className="text-[var(--color-dtg-red)] opacity-100" size="sm">
              Panduan jujur sebelum berangkat
            </MonoLabel>
          </div>
          <DisplayHeadline as="h1" size="hero" className="mt-6 max-w-[22ch]">
            Bacaan{" "}
            <Italic>wajib,</Italic>{" "}
            <Accent>sebelum merantau.</Accent>
          </DisplayHeadline>
          <p className="mt-8 max-w-[58ch] text-[clamp(16px,1.6vw,20px)] leading-[1.5] opacity-80">
            Artikel tentang budaya kerja, regulasi visa, dan realitas hidup sebagai PMI di negara tujuan. Ditulis tim kami dan alumni penempatan.
          </p>
        </div>
      </section>

      {/* Category filter strip */}
      <section className="border-b border-[var(--color-dtg-ink)] bg-white">
        <div className="mx-auto max-w-[1440px] px-6 py-4 lg:px-14">
          <div className="flex flex-wrap items-center gap-2">
            <MonoLabel className="mr-4 opacity-60" size="xs">
              Filter ·
            </MonoLabel>
            <CategoryChip
              label={t("categories.all") || "Semua"}
              active={activeCategory === "all"}
              onClick={() => setActiveCategory("all")}
            />
            {categories.map((cat) => (
              <CategoryChip
                key={cat}
                label={t(`categories.${cat}`)}
                active={activeCategory === cat}
                onClick={() => setActiveCategory(cat)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Editorial blog grid — featured + 3-col satellites */}
      <section className="bg-white px-6 py-20 text-[var(--color-dtg-ink)] lg:px-14 lg:py-24">
        <div className="mx-auto max-w-[1440px]">
          {filteredPosts.length > 0 ? (
            <>
              {featured && (
                <Link
                  href={{ pathname: "/blog/[slug]", params: { slug: featured.slug as string } }}
                  className="group grid gap-8 border-y-2 border-[var(--color-dtg-ink)] bg-[var(--color-dtg-paper)] px-6 py-12 no-underline text-[var(--color-dtg-ink)] transition-colors hover:bg-[var(--color-dtg-cream)] md:grid-cols-[1fr_1.4fr] md:items-end md:px-10 md:py-16 lg:gap-14 lg:px-14"
                >
                  <div>
                    <MonoLabel className="opacity-60" size="xs">Editor&rsquo;s pick</MonoLabel>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <MonoLabel className="opacity-70">{dateFormat(featured.date as string)}</MonoLabel>
                      {typeof featured.category === "string" && (
                        <span className="border border-[var(--color-dtg-ink)] bg-[var(--color-dtg-red)] px-2 py-0.5 font-[family-name:var(--font-mono)] text-[10px] font-bold uppercase tracking-[0.08em] text-white">
                          {t(`categories.${featured.category}`)}
                        </span>
                      )}
                      {Array.isArray(featured.tags) &&
                        (featured.tags as string[]).slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="border border-[var(--color-dtg-ink)] bg-[var(--color-dtg-cream)] px-2 py-0.5 font-[family-name:var(--font-mono)] text-[10px] font-bold uppercase tracking-[0.08em]"
                          >
                            {tag}
                          </span>
                        ))}
                    </div>
                  </div>
                  <div>
                    <h2 className="font-[family-name:var(--font-display)] text-[clamp(32px,4vw,56px)] font-extrabold leading-[1.05] tracking-[-0.03em] text-balance group-hover:text-[var(--color-dtg-red)]">
                      {featured.title as string}
                    </h2>
                    <p className="mt-4 max-w-[60ch] text-[16px] leading-[1.6] opacity-75">
                      {featured.description as string}
                    </p>
                    <span className="mt-6 inline-flex items-center gap-2 font-[family-name:var(--font-mono)] text-xs font-bold uppercase tracking-[0.12em] text-[var(--color-dtg-red)] transition-transform group-hover:translate-x-1">
                      {t("readMore")} →
                    </span>
                  </div>
                </Link>
              )}

              {rest.length > 0 && (
                <div className="mt-12 grid gap-px border border-[var(--color-dtg-ink)] bg-[var(--color-dtg-ink)] md:grid-cols-2 lg:grid-cols-3">
                  {rest.map((post) => (
                    <Link
                      key={post.slug as string}
                      href={{ pathname: "/blog/[slug]", params: { slug: post.slug as string } }}
                      className="group flex flex-col justify-between gap-4 bg-white p-7 no-underline text-[var(--color-dtg-ink)] transition-colors hover:bg-[var(--color-dtg-paper)] lg:p-8"
                    >
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <MonoLabel className="opacity-70">{dateFormat(post.date as string)}</MonoLabel>
                          {typeof post.category === "string" && (
                            <span className="border border-[var(--color-dtg-ink)] bg-[var(--color-dtg-cream)] px-2 py-0.5 font-[family-name:var(--font-mono)] text-[9px] font-bold uppercase tracking-[0.08em]">
                              {t(`categories.${post.category}`)}
                            </span>
                          )}
                        </div>
                        <h3 className="mt-4 font-[family-name:var(--font-display)] text-[20px] font-extrabold leading-[1.15] tracking-[-0.02em] text-balance">
                          {post.title as string}
                        </h3>
                        <p className="mt-3 line-clamp-3 text-[14px] leading-[1.55] opacity-75">
                          {post.description as string}
                        </p>
                      </div>
                      <span className="inline-flex items-center gap-2 font-[family-name:var(--font-mono)] text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--color-dtg-red)] transition-transform group-hover:translate-x-1">
                        {t("readMore")} →
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </>
          ) : (
            <p className="text-center text-[var(--color-dtg-ink)] opacity-60">
              {locale === "id" ? "Belum ada artikel di kategori ini." : "No articles in this category yet."}
            </p>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden bg-[var(--color-dtg-red)] text-white">
        <MetaStrip
          left="§ Next step"
          right={<span className="text-white">● Baru mau daftar? Langsung ke lowongan aktif</span>}
          tone="red"
          border="bottom"
          className="text-white"
        />
        <div className="mx-auto max-w-[1440px] px-6 py-14 lg:px-14 lg:py-20">
          <DisplayHeadline size="poster" className="max-w-[14ch]">
            Siap <Italic>praktik?</Italic>
          </DisplayHeadline>
          <p className="mt-6 max-w-[42ch] text-lg leading-[1.5] text-white/90">
            Lihat lowongan aktif bulan ini, atau chat tim via WhatsApp untuk konsultasi langsung.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <EditorialButton href="/" variant="ink" suffix="→">
              Semua lowongan aktif
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

function CategoryChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={
        "border px-3 py-1.5 font-[family-name:var(--font-mono)] text-[11px] font-bold uppercase tracking-[0.1em] transition-colors " +
        (active
          ? "border-[var(--color-dtg-ink)] bg-[var(--color-dtg-ink)] text-[var(--color-dtg-cream)]"
          : "border-[var(--color-dtg-ink)] bg-white text-[var(--color-dtg-ink)] hover:bg-[var(--color-dtg-cream)]")
      }
    >
      {label}
    </button>
  );
}
