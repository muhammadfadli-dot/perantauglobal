import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { getAllContent } from "@/lib/mdx";
import {
  Accent,
  AsymmetricSectionHeader,
  DisplayHeadline,
  Italic,
  MonoLabel,
} from "@/components/editorial";

const NS = "home.editorial";

type Headline = { lead: string; italic?: string; accent?: string };

export default function HomeBlogGrid() {
  const t = useTranslations(NS);
  const locale = useLocale();

  const tag = t("edisiIni.tag");
  const headline = t.raw("edisiIni.headline") as Headline;
  const body = t("edisiIni.body");
  const readMore = t("edisiIni.readMore");
  const viewAll = t("edisiIni.viewAll");

  const allPosts = getAllContent("blog", locale) as Array<Record<string, unknown>>;
  const posts = allPosts
    .sort((a, b) => new Date(b.date as string).getTime() - new Date(a.date as string).getTime())
    .slice(0, 3);

  if (posts.length === 0) return null;

  const dateFormat = (iso: string) =>
    new Date(iso).toLocaleDateString(locale === "id" ? "id-ID" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  return (
    <section id="edisi-ini" className="bg-[var(--color-dtg-paper)] px-6 py-20 lg:px-14 lg:py-24">
      <div className="mx-auto max-w-[1440px]">
        <AsymmetricSectionHeader
          number="05"
          label={tag}
          headline={
            <DisplayHeadline size="section">
              {headline.lead}{" "}
              {headline.italic && <Italic>{headline.italic}</Italic>}{" "}
              {headline.accent && <Accent>{headline.accent}</Accent>}
            </DisplayHeadline>
          }
          body={body}
          callout={
            <Link
              href={{ pathname: "/blog" }}
              className="mt-4 inline-flex items-center gap-2 font-[family-name:var(--font-mono)] text-xs font-bold uppercase tracking-[0.12em] text-[var(--color-dtg-ink)] underline-offset-4 hover:text-[var(--color-dtg-red)] hover:underline lg:mt-2"
            >
              {viewAll}
            </Link>
          }
        />

        <div className="mt-12 grid gap-px border border-[var(--color-dtg-ink)] bg-[var(--color-dtg-ink)] lg:grid-cols-[2fr_1fr]">
          {/* Lead article */}
          {posts[0] && (
            <Link
              href={{ pathname: "/blog/[slug]", params: { slug: posts[0].slug as string } }}
              className="group flex flex-col justify-between gap-6 bg-white p-8 no-underline transition-colors hover:bg-[var(--color-dtg-paper)] lg:p-14 lg:row-span-2"
            >
              <div className="flex flex-wrap items-center gap-3">
                <MonoLabel className="opacity-70">{dateFormat(posts[0].date as string)}</MonoLabel>
                {Array.isArray(posts[0].tags) && (posts[0].tags as string[]).slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className="border border-[var(--color-dtg-ink)] bg-[var(--color-dtg-cream)] px-2 py-0.5 font-[family-name:var(--font-mono)] text-[10px] font-bold uppercase tracking-[0.08em]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <h3 className="font-[family-name:var(--font-display)] text-[clamp(28px,3.5vw,52px)] font-extrabold leading-[1.05] tracking-[-0.03em] text-balance">
                {posts[0].title as string}
              </h3>
              <p className="max-w-[55ch] text-base leading-[1.55] opacity-75 line-clamp-4">
                {posts[0].description as string}
              </p>
              <span className="inline-flex items-center gap-2 font-[family-name:var(--font-mono)] text-xs font-bold uppercase tracking-[0.12em] text-[var(--color-dtg-red)] transition-transform group-hover:translate-x-1">
                {readMore}
              </span>
            </Link>
          )}

          {/* Stacked satellite articles */}
          {posts.slice(1).map((post) => (
            <Link
              key={post.slug as string}
              href={{ pathname: "/blog/[slug]", params: { slug: post.slug as string } }}
              className="group flex flex-col justify-between gap-4 bg-white p-6 no-underline transition-colors hover:bg-[var(--color-dtg-paper)] lg:p-8"
            >
              <MonoLabel className="opacity-70">{dateFormat(post.date as string)}</MonoLabel>
              <h3 className="font-[family-name:var(--font-display)] text-[20px] font-extrabold leading-[1.2] tracking-[-0.02em] text-balance">
                {post.title as string}
              </h3>
              <p className="line-clamp-2 text-sm leading-[1.5] opacity-70">
                {post.description as string}
              </p>
              <span className="inline-flex items-center gap-2 font-[family-name:var(--font-mono)] text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--color-dtg-red)] transition-transform group-hover:translate-x-1">
                {readMore}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
