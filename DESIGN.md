# Design System — Perantau Editorial

> **Canonical rulebook. Read before writing any new component, page, or blog post.**
> Every new work MUST follow this. If a pattern isn't listed here, check an existing editorial component for reference — don't invent.

**Status:** Active, authoritative. The legacy "Warm Professional" system (rounded cards, soft shadows, gradient heroes) is deprecated and removed from the codebase as of 2026-04-18.

---

## 1. Product Context

- Website for **PT Daya Talenta Global (Perantau Global)** — licensed P3MI (migrant worker placement agency) under Dayalima Group.
- **Audiences:** ID locale = job seekers (full site, Indonesian). EN locale = reserved for future employer pages, currently `notFound()` for ID-only routes.
- **Surface:** Marketing site + conversion landing pages (lowongan, programs, daftar).

## 2. Direction — "Perantau Editorial"

**Mood:** Magazine-style, ink + cream + DTG red, treated as an official-document aesthetic. Confident, specific, slightly typographic-flex. Trustworthy because it looks like a printed document, not a startup landing page.

**Visual references baked in:**
- Magazine front-cover hero composition (type block + photo + illustration collage).
- Stamped legal document ("Legal Dossier Card" pattern with filing strip + ruled paper + diagonal stamp + signatory).
- Boarding pass / passport motifs (SVG illustrations).
- Ticker bar scrolling credentials.
- Section numbering (`§ 01 — Section name`) throughout.

**Anti-patterns — never ship these:**
- ❌ Soft rounded cards with drop shadows
- ❌ `rounded-xl` / `rounded-lg` on layout containers (only `rounded-full` for pill badges)
- ❌ Centered hero with 3 icon-circle benefit cards
- ❌ Purple/blue/teal accents (only DTG Red is allowed)
- ❌ Decorative blobs, gradient meshes, floating SVG waves
- ❌ Gradient hero backgrounds (`from-red-dark via-red to-black`)
- ❌ Lucide icons inside pill badges as the dominant visual
- ❌ "Transform your career" generic stock copy
- ❌ Mixed font weights (always `font-extrabold` for display; `font-medium` reserved for italic emphasis)

---

## 3. Tokens

All tokens live in [`src/app/globals.css`](src/app/globals.css) and are accessed as `var(--color-dtg-*)` or `var(--font-*)`. Tailwind utility classes referencing them work via `@theme inline {}`.

### 3.1 Colors

| Token | Hex | CSS Variable | Use |
|---|---|---|---|
| DTG Red | `#C8102E` | `--color-dtg-red` | Sole accent. CTAs, headline accent words, dots on mono meta strips, interactive hover |
| DTG Red Dark | `#8B0000` | `--color-dtg-red-dark` | Red button hover state only |
| DTG Red Light | `#E8384F` | `--color-dtg-red-light` | Reserved |
| **DTG Ink** | `#0E0E10` | `--color-dtg-ink` | Primary dark — borders, display type, dark sections |
| **DTG Cream** | `#F5F0E8` | `--color-dtg-cream` | Primary alt background (warmer than paper) |
| **DTG Paper** | `#F9F6EF` | `--color-dtg-paper` | Lighter alt background, table rows, inset cards |
| DTG Black | `#1A1A1A` | `--color-dtg-black` | **Legacy — use `--color-dtg-ink` instead** |
| Gray 50/100/300/500/700/900 | … | `--color-dtg-gray-*` | Neutral text/borders for non-editorial contexts only (rare) |
| Success / Warning / Error / Info / WhatsApp | … | `--color-success` etc. | Semantic states (callout accents, form validation) |

**Three-color discipline:** every section is some combination of cream / ink / red. Pure white (`#fff`) only for high-contrast inner panels (inside cream sections). Paper for ruled-paper dossier cards.

### 3.2 Fonts

| Family | CSS Variable | Use |
|---|---|---|
| Plus Jakarta Sans (800) | `--font-display` | All display headlines (H1–H3). Always `font-extrabold`, `tracking-[-0.03em]` to `-0.05em`. |
| Source Sans 3 (400/500/600/700) | `--font-sans` | Body, paragraphs, form inputs |
| **JetBrains Mono (400/500/700)** | **`--font-mono`** | Section tags (`§ 01`), uppercase data labels, ticker rows, button arrow suffixes, filing serials, tagbar content |
| Georgia (serif italic) | inline | Signatory line in `<LegalDossierCard>` only |

### 3.3 Display type scale

| Use | Size | Apply |
|---|---|---|
| Hero H1 | `clamp(48px, 8.5vw, 112px)` | `<DisplayHeadline size="hero">` |
| Section H2 | `clamp(40px, 7vw, 96px)` | `<DisplayHeadline size="section">` |
| Sidebar H2 | `clamp(36px, 5.5vw, 72px)` | `<DisplayHeadline size="sidebar">` |
| Poster H2 | `clamp(56px, 10vw, 144px)` | `<DisplayHeadline size="poster">` (Final CTA) |

All display: `font-extrabold`, `letter-spacing -0.04em` to `-0.05em`, `line-height 0.88`–`1.02`, `text-wrap: balance`.

### 3.4 Mono rules

- Always `font-bold uppercase tracking-[0.1em]` to `tracking-[0.18em]`.
- 9–13px range. Use `<MonoLabel>` primitive with `size="xs" | "sm" | "md"`.
- Use for: section tags, data field labels, ticker entries, filing serial numbers, button arrows (→ / ↓ / +), copyright strips, metadata.
- **Never for body copy. Never sentence case. Never below 9px.**

### 3.5 Signature emphasis pattern

Display headlines mix three voices in one line:
1. Body word(s) — solid ink, extrabold (default)
2. Optional **italic middle word** — `<Italic>` (font-medium italic)
3. Optional **red accent final word** — `<Accent>` (red extrabold)

Example:
```tsx
<DisplayHeadline size="hero">
  Paket lengkap, <Italic>tanpa potongan</Italic> <Accent>gelap.</Accent>
</DisplayHeadline>
```

## 4. Borders, Shadows, Radius — strict rules

| Rule | Allowed | Forbidden |
|---|---|---|
| Layout borders | `border border-[var(--color-dtg-ink)]` (1px) | Rounded layout containers |
| Grid separators | `gap-px border border-[var(--color-dtg-ink)] bg-[var(--color-dtg-ink)]` (negative-border trick) | Double borders, dividers in gray |
| Radius | `rounded-full` on pill badges (rare) | `rounded-md`, `rounded-lg`, `rounded-xl`, `rounded-2xl` on layout |
| Shadows | None on layout. Inset stamp shadow inside `<LegalDossierCard>` only | `shadow-[var(--shadow-sm)]` / `shadow-md` / `shadow-lg` on cards |
| Ring | `ring-offset-2` for `:focus-visible` only | `ring-1 ring-inset` on cards |

## 5. Section structure

Every section follows this skeleton:

```tsx
<section id="..." className="bg-{white|cream|ink|red} px-6 py-20 lg:px-14 lg:py-24">
  <div className="mx-auto max-w-[1440px]">
    <AsymmetricSectionHeader
      number="0X"
      label="..."
      headline={<DisplayHeadline size="section">...</DisplayHeadline>}
      body="..."
      callout={...optional}
    />
    {/* section body — magazine grid / dossier table / accordion / etc. */}
  </div>
</section>
```

### Section background rotation

Alternate: cream → white → cream → ink → cream → red (Final CTA). Never two same-colored sections in a row. Dark ink sections work great for dramatic moments (process timeline, program CTAs).

### Section padding

| Mobile | Desktop |
|---|---|
| `py-20 px-6` | `lg:py-24 lg:px-14` |

### Max width

`max-w-[1440px]` for full-bleed sections with `mx-auto`.

## 6. Editorial primitives — `src/components/editorial/`

Always prefer these over raw JSX.

| Primitive | Use | Key props |
|---|---|---|
| `<Nav>` | Sticky cream navbar (used at layout level) | `anchors[]`, `ctaLabel`, `ctaHref`, `masthead?` |
| `<Footer>` | Dark ink footer | `brand`, `columns[]`, `legal` |
| `<Ticker>` | Full-bleed scrolling credentials marquee | `items: [{icon, text}]`, `tone?` |
| `<MobileStickyCTA>` | Mobile-only fixed bottom bar | `metaLeft`, `metaRight`, `ctaLabel`, `formAnchor`, `whatsappUrl` |
| `<SectionTag>` | `§ 0X — Label` mono caps + optional divider | `number`, `label`, `tone?`, `divider?` |
| `<MonoLabel>` | Inline mono uppercase label | `size?` (`xs`/`sm`/`md`) |
| `<MetaStrip>` | Top/bottom strip of section (mono, inline) | `left`, `right`, `tone`, `border` |
| `<EditorialButton>` | The canonical button. Hard edges, mono arrow suffix. | `variant` (`ink`/`cream`/`red`/`outline`), `suffix` (`→`/`↓`/`↑`/`×`/`+`/`null`), `fullWidth?`, `size?` |
| `<DisplayHeadline>` + `<Italic>` + `<Accent>` | Display headline composer | `size` (`hero`/`section`/`sidebar`/`poster`) |
| `<AsymmetricSectionHeader>` | Standard 2-col section header | `number`, `label`, `headline`, `body?`, `callout?` |
| `<LegalDossierCard>` | Stamped-document credentials card | `serial`, `status`, `badge`, `headline`, `body`, `credentials[]`, `signatory` |
| `<IllStamp>` / `<IllPlane>` / `<IllTicket>` / `<IllPassport>` / `<IllCompass>` / `<IllPin>` / `<IllHand>` | Flat SVG editorial illustrations | `size`, plus `label` / `routeCode` / `routeLabel` / `gate` / `seat` on relevant ones |

## 7. Forms

**All forms use these rules. Non-negotiable.**

```tsx
const input =
  "w-full border border-[var(--color-dtg-ink)] bg-white px-3.5 py-3 text-[15px] text-[var(--color-dtg-ink)] outline-none focus:border-[var(--color-dtg-red)]";
const label =
  "mb-1.5 block font-[family-name:var(--font-mono)] text-[11px] font-bold uppercase tracking-[0.1em] opacity-70";
```

**Required:**
- Hard 1px ink borders on inputs/selects/textareas
- Mono uppercase labels with red asterisk for required fields
- Sidebar layout (`lg:grid-cols-[340px_1fr]`) with `<SectionTag>` + `<DisplayHeadline size="sidebar">` + body copy + anti-scam notice in sidebar
- `<EditorialButton variant="ink" suffix="→" fullWidth>` for submit
- Success state: replace form with centered `<IllStamp size={180} label="RECEIVED" />` + `<DisplayHeadline size="sidebar">` + ref number in mono
- Anti-scam box: `border border-[var(--color-dtg-ink)] bg-white p-4 font-[family-name:var(--font-mono)] text-[13px]` with `⚠` prefix

**Radio / checkbox groups** — style as border-wrapped pills, not native:
```tsx
<label className="flex cursor-pointer items-center gap-2 border border-[var(--color-dtg-ink)] px-4 py-2 has-[input:checked]:bg-[var(--color-dtg-ink)] has-[input:checked]:text-[var(--color-dtg-cream)]">
  <input type="radio" name="..." value="..." className="sr-only" />
  Label
</label>
```

## 8. MDX / Blog content rules

Blog articles, destinasi details, and layanan details use `<MDXRemote>` with `remarkPlugins: [remarkGfm]`. The prose styling is editorial — all customizations live in `prose-*` classes on the `<article>` wrapper:

```tsx
<article className="prose prose-lg max-w-none
  prose-headings:font-[family-name:var(--font-display)] prose-headings:tracking-[-0.03em] prose-headings:text-[var(--color-dtg-ink)]
  prose-h2:mt-14 prose-h2:text-[clamp(28px,3vw,40px)] prose-h2:font-extrabold prose-h2:border-t-2 prose-h2:border-[var(--color-dtg-ink)] prose-h2:pt-6
  prose-h3:text-2xl prose-h3:font-extrabold
  prose-p:text-[18px] prose-p:leading-[1.75]
  prose-a:text-[var(--color-dtg-red)] prose-a:underline-offset-4
  prose-strong:font-extrabold
  prose-li:text-[18px] prose-li:leading-[1.65]
  prose-blockquote:border-l-4 prose-blockquote:border-[var(--color-dtg-red)] prose-blockquote:bg-[var(--color-dtg-paper)] prose-blockquote:py-2 prose-blockquote:px-6 prose-blockquote:not-italic">
  <MDXRemote source={content} components={mdxComponents} options={{...}} />
</article>
```

### MDX components (in `src/components/mdx/`)

| Component | When to use | Look |
|---|---|---|
| `<Callout type="info|warning|success|tip" title="...">` | Highlight a note, warning, tip, or confirmed fact | Ruled-paper card with colored left-border bar + mono `§ INFO/PERHATIAN/etc` header |
| `<StatGrid>` + `<Stat value label icon?>` | 4-cell stats row | Hard-edged magazine grid with large display numbers |
| `<Steps>` + `<Step number title icon? children?>` | Numbered process within an article | Dossier-style rows with red step number + body |
| `<Highlight label?>` | Pull-out info block with tables/lists | 2-border card with optional mono header + ink-bordered tables inside |
| `<ComparisonTable>` wrapping `<table>` | Side-by-side data comparison | Ink-header bordered table with cream row hover |
| `<CTABox title description buttonText href? variant="primary|whatsapp">` | Mid-article CTA | Red or green poster with ink button |

**Blog frontmatter** expects: `title`, `description`, `date`, `author`, `category`, `tags[]`. Frontmatter category maps to `blog.categories.{key}` translation.

**Writing editorial blog copy:**
- First H2 gets the article's main point — it's the first reading anchor
- Use `**bold**` for data points (numbers, names), not for emphasis in general
- Use `>` blockquote for pull quotes (they render editorial)
- Tables should use `<ComparisonTable>` wrapper when comparing; plain markdown tables otherwise inside `<Highlight>`
- Mid-article CTA with `<CTABox>` once — don't overdo

## 9. Page chrome — what layout provides

`src/app/[locale]/(main)/layout.tsx` + `src/app/[locale]/lowongan/layout.tsx` + `src/app/[locale]/program/layout.tsx` all render:
1. `<Nav masthead>` at top (sticky, cream)
2. `{children}`
3. `<Footer>` at bottom (ink, 3-col)
4. `<MobileStickyCTA>` (fixed bottom, mobile-only)

Homepage composes its own `<main>` inside the `(main)` group — don't render chrome again inside pages.

Pages that are ID-only guard with:
```tsx
if (locale !== "id") notFound();
```

## 10. Photography & Illustrations

- **Hero photos:** portrait format, `16:9` landscape on desktop. Existing: `/public/images/{home-hero, lowongan/{role}-hero, program/{slug}-hero}.jpg`. Generated via fal-ai FLUX.
- **Editorial illustrations:** use SVG primitives (`<IllStamp>`, `<IllPlane>`, etc.) — flat, DTG red + cream + ink only, no realism.
- **Boarding pass (`<IllTicket>`) parameters:** always pass destination-specific `routeCode`, `routeLabel`, `gate`, `seat`. Default is Jakarta → Riyadh.
- **Stamps (`<IllStamp>`):** `label` prop should be uppercase single word (`RESMI`, `APPROVED`, `SSW`, `EDITION`, `LEGAL`, `APPLY`).

## 11. Animation

- `slideUp` on hero entry. Existing in globals.css.
- `@keyframes ticker` for scrolling marquee (45s linear infinite).
- FAQ accordion: `grid-template-rows: 0fr → 1fr` transition (not max-height).
- All animations no-op under `prefers-reduced-motion: reduce`.

## 12. Checklist — when shipping a new page or component

Before merging, verify:

**Tokens & type**
- [ ] No `rounded-xl`/`rounded-lg`/`rounded-2xl` on layout
- [ ] No `shadow-*` on cards
- [ ] No `ring-1 ring-inset` on containers
- [ ] All labels use `<MonoLabel>` or equivalent mono classes
- [ ] Display headlines use `<DisplayHeadline>` (no raw `<h1>` with custom size)
- [ ] Italic emphasis uses `<Italic>`; red accent uses `<Accent>` — not raw `<span className="italic">`

**Structure**
- [ ] Section has `<AsymmetricSectionHeader>` OR a dossier/sidebar composition
- [ ] Section number (`§ 0X`) follows page's sequence (01, 02, 03, …)
- [ ] Section backgrounds alternate (cream / white / ink / red)
- [ ] Final CTA of page is a red poster with meta strips + illustrations

**Forms**
- [ ] Inputs use hard ink borders + mono labels
- [ ] Submit uses `<EditorialButton variant="ink" suffix="→" fullWidth>`
- [ ] Success state uses `<IllStamp label="RECEIVED">` pattern
- [ ] Anti-scam notice is present in sidebar for lead-gen forms

**Chrome**
- [ ] Page lives inside `(main)`, `lowongan`, or `program` group → chrome auto-provided
- [ ] EN-locale guard (`if (locale !== "id") notFound();`) if ID-only
- [ ] `generateStaticParams()` returns `[{locale: "id"}]` for ID-only routes

**MDX (if applicable)**
- [ ] Article wrapper has the canonical editorial `prose-*` classes
- [ ] MDX components (Callout/StatGrid/Steps/Highlight/ComparisonTable/CTABox) are used instead of raw JSX where semantics match
- [ ] Frontmatter includes category + tags; category maps to `blog.categories.{key}` i18n

**Verify**
- [ ] `npm run build` passes
- [ ] `npm run lint` passes (no new errors; pre-existing warnings OK)
- [ ] Browser check at 390px + 1440px
- [ ] No platform-specific `package.json` additions (per CLAUDE.md)

## 13. Where to find references

- **Canonical lowongan (fully built & validated):** `/id/lowongan/perawat-saudi-arabia`
- **Canonical homepage:** `/id`
- **Dev primitives catalog:** `/id/design-system`
- **Canonical blog article:** `/id/blog/biaya-kerja-jepang-2026` (or first available)
- **Legal dossier reference:** inside `/id/tentang` (§ 01) and `/id/lowongan/perawat-saudi-arabia` (§ 01)
- **Form reference:** `/id/daftar` (3-step wizard), `/id/lowongan/perawat-saudi-arabia#form` (single form), `/id/program/spg#form` (scoring wizard)

## 14. Legacy cleanup history

As of 2026-04-18 merge, the following were removed:
- `src/components/sections/*` (HeroSection, StatsBar, TrustBar, ProblemSolution, ServicesOverview, WhyChooseUs, DestinationHighlights, Testimonials, LatestPosts, CTASection, BlogHero, PageHero, EmployerHero, ContactForm, EmployerInquiryForm)
- `src/components/program/TDP*` (10 truck-driver-specific components)
- `src/components/program/{ProgramHero,SPGTrustBar,GTHHero,GTHTrustBar,GTHFinalCTA,SPGFinalCTA,SPGForm}.tsx`
- `src/components/layout/{Navbar,Footer,MobileCTA,FloatingWhatsApp}.tsx` → entire dir removed
- `src/components/ui/{Button,Accordion,Breadcrumb,AnimateOnScroll,Badge,Card,StatsCounter}.tsx` → entire dir removed
- `src/components/blog/{BlogGrid,CategoryFilter}.tsx`

If you encounter references to any of these in old commits, replace with editorial primitives from `src/components/editorial/`.
