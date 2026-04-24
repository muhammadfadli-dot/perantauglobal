---
version: alpha
name: Perantau Global v2
description: Simple, red-led utility system for PT Daya Talenta Global's P3MI platform — warm paper ground, modern radii, single DTG-red accent across web + platform.
colors:
  primary: "#d7262f"
  primary-hover: "#b91d24"
  primary-pressed: "#8f1319"
  primary-subtle: "#fff4f4"
  primary-soft: "#ffe3e3"
  on-primary: "#ffffff"
  ink: "#141414"
  ink-strong: "#2a2a2a"
  ink-muted: "#5a5a5a"
  ink-soft: "#7a7a7a"
  rule-strong: "#b3b3b3"
  rule: "#dedede"
  rule-soft: "#ededed"
  surface-subtle: "#f6f6f5"
  surface: "#fafaf8"
  surface-raised: "#ffffff"
  on-surface: "#141414"
  ok: "#0f8a4a"
  ok-bg: "#e6f4ec"
  warn: "#a66500"
  warn-bg: "#fbf0d9"
  err: "#b91d24"
  err-bg: "#fde5e7"
  info: "#1e5aa8"
  info-bg: "#e4edf8"
typography:
  display-hero:
    fontFamily: Plus Jakarta Sans
    fontSize: 64px
    fontWeight: 800
    lineHeight: 68px
    letterSpacing: -0.03em
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: 800
    lineHeight: 52px
    letterSpacing: -0.025em
  h1:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: 800
    lineHeight: 34px
    letterSpacing: -0.02em
  h2:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: 800
    lineHeight: 28px
    letterSpacing: -0.015em
  h3:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: 700
    lineHeight: 24px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: 400
    lineHeight: 28px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: 400
    lineHeight: 25px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: 400
    lineHeight: 21px
  label:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: 600
    lineHeight: 20px
  button:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: 600
    lineHeight: 20px
    letterSpacing: -0.01em
  button-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: 600
    lineHeight: 18px
  eyebrow:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: 700
    lineHeight: 16px
    letterSpacing: 0.12em
  badge:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: 700
    lineHeight: 16px
    letterSpacing: 0.04em
  mono-sm:
    fontFamily: IBM Plex Mono
    fontSize: 13px
    fontWeight: 400
    lineHeight: 20px
rounded:
  none: 0px
  sm: 8px
  md: 12px
  lg: 16px
  xl: 20px
  pill: 999px
spacing:
  sp-1: 4px
  sp-2: 8px
  sp-3: 12px
  sp-4: 16px
  sp-5: 20px
  sp-6: 24px
  sp-7: 32px
  sp-8: 40px
  sp-9: 56px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.md}"
    padding: 0 22px
    height: 52px
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
    textColor: "{colors.on-primary}"
  button-dark:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.md}"
    padding: 0 22px
    height: 52px
  button-ghost:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: 0 22px
    height: 52px
  button-small:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.md}"
    padding: 0 16px
    height: 40px
  card:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.ink-strong}"
    rounded: "{rounded.lg}"
    padding: 20px
  chip:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.ink-strong}"
    rounded: "{rounded.pill}"
    padding: 0 14px
    height: 36px
  chip-active:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.on-primary}"
  badge-ok:
    backgroundColor: "{colors.ok-bg}"
    textColor: "{colors.ok}"
    rounded: "{rounded.pill}"
    padding: 4px 10px
  badge-warn:
    backgroundColor: "{colors.warn-bg}"
    textColor: "{colors.warn}"
    rounded: "{rounded.pill}"
    padding: 4px 10px
  badge-err:
    backgroundColor: "{colors.err-bg}"
    textColor: "{colors.err}"
    rounded: "{rounded.pill}"
    padding: 4px 10px
  badge-info:
    backgroundColor: "{colors.info-bg}"
    textColor: "{colors.info}"
    rounded: "{rounded.pill}"
    padding: 4px 10px
  badge-mute:
    backgroundColor: "{colors.rule-soft}"
    textColor: "{colors.ink-muted}"
    rounded: "{rounded.pill}"
    padding: 4px 10px
  input:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: 12px 14px
---

> **Canonical rulebook.** Baca sebelum bikin komponen, page, atau blog post baru. This file IS the source of truth — not any older internal doc. Status: active (Apr 2026), replaces "Perantau Editorial" yang sudah di-sunset.
>
> Companion assets di [`design/`](design/) — bundle dari Claude Design:
> - [`design/project/tokens.css`](design/project/tokens.css) — authoritative v2 tokens (source of truth buat YAML frontmatter di file ini).
> - [`design/project/pg-ui.jsx`](design/project/pg-ui.jsx) — shared primitives (Icon, Badge, StatusDot, TopBar, BottomNav, StickyCTA, RedHero).
> - [`design/project/pg-{www,app,admin,…}.jsx`](design/project/) — rendered mobile + desktop screens.
> - [`design/project/Perantau Global - Mobile Redesign.html`](design/project/Perantau%20Global%20-%20Mobile%20Redesign.html) — browser-openable canvas preview.
> - [`design/chats/`](design/chats/) — design session transcript (intent history).
>
> Paper file "perantau global" = living brand guideline canvas yang mirror DESIGN.md sections visually.

## Overview

Perantau Global adalah platform rekrutmen resmi **PT Daya Talenta Global** (P3MI) di bawah Dayalima Group. Dua surface:

- **`apps/web`** — marketing + conversion landing pages (perantauglobal.com). Audience: calon PMI (locale ID), future employer portal (locale EN).
- **`apps/platform`** — candidate portal (mobile-first) + admin CRM (data-dense) di app.perantauglobal.com.

Satu design system melayani keduanya lewat namespace token `pg-*` yang tinggal di `apps/{web,platform}/src/app/globals.css`.

### Mood — "warm utility, red-led"

Warm off-white paper sebagai ground, Plus Jakarta Sans sebagai one-font-to-rule, modern radii (12–16px) yang lebih kalem dari trend 2010s tapi tidak hard-edge brutalist. Merah DTG `#d7262f` muncul sebagai satu-satunya aksen — CTA, focus ring, accent word di headline. Tidak ada gradient hero, tidak ada glassmorphism, tidak ada editorial legal-dossier decor.

Prinsip:
- **One red per screen.** Kalau ada dua CTA setara, salah satu harus turun ke `button-ghost` atau `button-dark`.
- **Paper is ground, white is raised.** `#fafaf8` untuk body background; `#ffffff` untuk card / surface yang diangkat.
- **Weight > color for hierarchy.** Heading pakai 700–800, body 400. Warna merah tidak dipakai untuk "menonjolkan" — itu jobnya weight contrast.
- **Rounded modern.** `rounded-xl` buttons (12px), `rounded-2xl` cards (16px), `rounded-full` badges. Jangan mix radii pada peer components.

### What got deprecated

Sebelumnya repo punya sistem **"Perantau Editorial"** — section numbering (`§ 01`), `<LegalDossierCard>`, 1px hard ink borders di mana-mana, mixed fonts (Plus Jakarta + Source Sans 3 + JetBrains + Georgia). Semua primitives `src/components/editorial/` sudah dihapus. Kalau ketemu referensinya di old branch/blog, rewrite pakai komponen di `src/components/pg/`.

Legacy CSS aliases (`--color-dtg-red`, `--color-dtg-cream`, `--color-dtg-gray-*`) masih ada di `globals.css` untuk page yang belum dimigrasi — **don't introduce new usage**. Pakai `pg-*` tokens.

## Colors

Palette diturunkan dari adegan sederhana: **warm paper + ink + a single red ribbon**. Satu aksen, grounded neutrals, status-pair untuk semantics.

### Brand — Red

One accent. Dipakai hemat.

- **`pg-red-600` `#d7262f`** — primary. CTA fill, link utama, focus ring outline, accent word di hero headline.
- **`pg-red-700` `#b91d24`** — hover state pada CTA primary.
- **`pg-red-800` `#8f1319`** — pressed / mouse-down state.
- **`pg-red-500` `#e23b3b`** — highlight (rare); avoid unless you genuinely need a lighter accent.
- **`pg-red-200` `#ffc9c9`** — soft background untuk red callouts.
- **`pg-red-100` `#ffe3e3`** — subtle alert surface.
- **`pg-red-50` `#fff4f4`** — faintest wash, use sparingly.

### Neutrals — Ink scale

Full 8-step scale. Scene: graphite pencil lines on plaster.

- **`pg-ink-900` `#141414`** — body text default, heading color.
- **`pg-ink-700` `#2a2a2a`** — sub-heading, emphasized body.
- **`pg-ink-500` `#5a5a5a`** — metadata, secondary text, icon muted. WCAG AA pada surface paper.
- **`pg-ink-400` `#7a7a7a`** — hint, placeholder. Use sparingly.
- **`pg-ink-300` `#b3b3b3`** — strong divider, disabled text.
- **`pg-ink-200` `#dedede`** — standard divider, input border, chip border (1.5px).
- **`pg-ink-100` `#ededed`** — card border (1px), subtle separator.
- **`pg-ink-50` `#f6f6f5`** — subtle surface, input track, hover background.

### Surfaces

- **`pg-paper` `#fafaf8`** — global page background. Warm off-white paper tint.
- **`pg-white` `#ffffff`** — card, modal, any raised surface.
- **`pg-ink-50` `#f6f6f5`** — sunken / inset surface (tag pills, chip hover).

### Status

Bg × on pairs — semua lolos WCAG AA. Pakai di badges, inline callouts, form feedback.

- **Ok**: `#0f8a4a` on `#e6f4ec` — success, verified, completed.
- **Warn**: `#a66500` on `#fbf0d9` — attention needed, pending review.
- **Err**: `#b91d24` on `#fde5e7` — error, blocked, rejected. (Reuses brand red family on purpose.)
- **Info**: `#1e5aa8` on `#e4edf8` — informational, neutral context.

## Typography

Satu keluarga untuk semua: **Plus Jakarta Sans** (weights 400/500/600/700/800). Untuk data monospace (IDs, codes, timestamps, serial numbers): **IBM Plex Mono** 400 (repo globals.css loads JetBrains Mono sebagai primary dengan IBM Plex Mono fallback — keduanya valid).

### Scale — mobile-first

App interface adalah mobile-first. Scale kecil-kecilan tapi tegas.

- **pg-h1 28/34 extrabold (800)** — screen heading utama.
- **pg-h2 22/28 extrabold (800)** — section heading dalam screen.
- **pg-h3 18/24 bold (700)** — card heading, group label.
- **body-lg 18/28 regular (400)** — hero copy, emphasized paragraphs.
- **body-md 16/25 regular (400)** — default body. **Min 16px di mobile — jangan turunkan.**
- **body-sm 14/21 regular (400)** — meta, caption.
- **label 14/20 semibold (600)** — form labels.
- **button 16/20 semibold (600)** primary; **button-sm 14/18 semibold (600)**.
- **eyebrow 12 bold uppercase tracking `0.12em`** — di atas heading, default color `pg-red-600`.
- **badge 12 bold uppercase tracking `0.04em`** — status pills.
- **display-hero 64/68 extrabold** untuk marketing hero desktop. Tracking `-0.03em`.
- **display-lg 48/52 extrabold** untuk marketing section heading desktop.

### Color rules

- **Heading**: `pg-ink-900` (`#141414`). Solid, full-contrast.
- **Body default**: `pg-ink-700` (`#2a2a2a`) — bukan ink-900. Sedikit lebih soft, lebih mudah dibaca di paragraf panjang.
- **Meta/caption**: `pg-ink-500` (`#5a5a5a`).
- **Hint/placeholder**: `pg-ink-400` (`#7a7a7a`).
- Accent word di heading: `pg-red-600`.

### Rules

- Font weight carries hierarchy — bukan color.
- `.prose p` dan `article p` di-cap `max-width: 65ch` secara global.
- Global CSS set `letter-spacing: -0.02em` dan `text-wrap: balance` pada h1–h4; jangan override.
- Mono hanya untuk data literal (uuid, serial, timestamp, ref number). Tidak pernah untuk body copy atau labels.
- Heading extrabold/bold (700–800), body regular (400). Medium (500)/semibold (600) khusus buttons, labels, eyebrows. Light (300) tidak dipakai.

## Layout

### Containers
- **Marketing page** (apps/web): `max-w-[1200px]` content, `max-w-[1440px]` full-bleed section wrapper.
- **Candidate portal** (apps/platform mobile-first): `max-w-[640px]` column, optimized 390–768px viewport.
- **Admin CRM** (apps/platform admin): `max-w-[1440px]` with sidebar 240px + main.

### Spacing scale

9 steps, mobile-first generous: `sp-1 4 · sp-2 8 · sp-3 12 · sp-4 16 · sp-5 20 · sp-6 24 · sp-7 32 · sp-8 40 · sp-9 56`.

- **Section hero breathing**: `sp-8–sp-9` (40–56px) vertical on mobile; lebih longgar di desktop.
- **Major sections**: `sp-7` (32px) between.
- **Card padding**: `sp-5` (20px) default — matches `Card` primitive's `p-5`.
- **Button height**: 52px default, 40px small. Tap target minimum 44px tetep dijaga.
- **Form field gap**: `sp-4` (16px). Label ke input: `sp-1` (4px).

## Elevation & Depth

Shadows ada tapi dipakai hemat — kita bukan Material, tapi juga bukan brutalist.

- **`pg-shadow-1`** — `0 1px 2px rgba(20,20,20,.06), 0 0 0 1px rgba(20,20,20,.04)` — dropdown triggers, resting chips.
- **`pg-shadow-2`** — `0 4px 16px rgba(20,20,20,.08), 0 0 0 1px rgba(20,20,20,.04)` — sticky headers, elevated cards on hover, modals.

(Legacy `shadow-lg` tersedia di globals.css — `0 8px 24px rgba(20,20,20,.10) …` — untuk popover / command palette yang butuh separation lebih.)

Most cards use flat `border border-pg-ink-100` instead of shadow — cleaner at density. Don't stack both.

Never: colored drop shadow, glassmorphism blur, neon glow, gradient meshes.

## Shapes

Modern radii, 5 steps: `sm 8 · md 12 · lg 16 · xl 20 · pill 999`.

- **md (12px)** — buttons, inputs (`--pg-r-md` / `rounded-xl` in Tailwind).
- **lg (16px)** — cards, modals, panels (`--pg-r-lg` / `rounded-2xl`).
- **xl (20px)** — hero surfaces, large feature cards.
- **sm (8px)** — small UI chips, icon wrappers, tag pills (`rounded-lg`).
- **pill (999px)** — chips, badges, status dots.
- **No radius (0)** — tables, dividers, full-bleed bands.

Border widths:
- **1px** — card default border (`border-pg-ink-100`).
- **1.5px** — interactive UI elements that need extra presence (chips, ghost button border, radio/checkbox wrappers).
- **2px** — focus ring (global `:focus-visible` = `outline: 2px solid var(--pg-red-600)` + `outline-offset: 2px`).

## Components

Canonical primitives live at `apps/web/src/components/pg/*` and `apps/platform/src/components/pg/*`. Prefer these over raw markup.

### Button (`<Button>`, `<ButtonLink>`)

Variants `primary | dark | ghost`, with `block?`, `small?`.

- **primary**: `bg-pg-red-600 text-white`, hover `bg-pg-red-700`. Default action per screen — max one.
- **dark**: `bg-pg-ink-900 text-white`, hover `bg-black`. Strong alternative action; use when primary is elsewhere and this one needs emphasis without using red.
- **ghost**: transparent, `text-pg-ink-900`, `border-[1.5px] border-pg-ink-200`, hover `bg-pg-ink-50`. Low-emphasis alternative.

Geometry: `rounded-xl`, `min-h-[52px]` default / `40px` small, `px-[22px]` / `px-4` small, `font-semibold`. `active:scale-[0.985]` microfeedback via Tailwind.

### Card (`<Card>`)

`bg-pg-white border border-pg-ink-100 rounded-2xl p-5`. Optional `noPadding` to wrap media. Elevate with `shadow-sm` only when you actually need separation from siblings.

### Chip (`<Chip>`)

`h-9 px-3.5 rounded-full border-[1.5px] text-sm font-semibold`. Default state: white surface + `pg-ink-700` text + `pg-ink-200` border. Active state: `bg-pg-ink-900 text-white border-pg-ink-900` (swap in `active={true}`). Use for filters, tag selection, category toggles.

### Badge (`<Badge>`)

`px-2.5 py-1 rounded-full text-[12px] font-bold uppercase tracking-wide`. Variants `ok | warn | err | info | mute`, each with pre-paired bg/text tokens. Optional icon prop renders 12px ahead of the label.

### StatusDot (`<StatusDot>`)

`w-2 h-2 rounded-full`, fill from `pg-ok | pg-warn | pg-err | pg-ink-300`. Inline indicator only — pair with label.

### Eyebrow (`<Eyebrow>`)

`text-[12px] font-bold uppercase tracking-[0.12em]`, tone `red | ink | ok`. Section prefix above a display heading ("LOWONGAN AKTIF" · "PROSES" · "FAQ").

### Input (form field)

`bg-pg-white border border-pg-ink-200 rounded-xl px-3.5 py-3 text-[15px] text-pg-ink-900`. Focus: border swaps to `pg-red-600` + global focus ring kicks in. Required marker = red asterisk after label. Labels use `label` token (14 semibold).

### RedHero (`<RedHero>`)

Marketing hero block — full-bleed red surface with display headline. Use at top of marketing landings (not within app shell). White text on `pg-red-600`. Only one per page.

## Do's and Don'ts

### Do

- Use `pg-*` tokens. If a page still uses `dtg-*` or `--color-success`, that's a migration target — schedule a cleanup when you touch it.
- **One primary red CTA per screen.** Secondary and tertiary actions go to `dark` or `ghost`.
- Default to `bg-pg-paper` for page ground, elevate to `pg-white` only when visual separation helps.
- Let whitespace breathe — 48–96px vertical on heroes and major section breaks.
- Mono (`--font-mono`) for IDs, serial numbers, timestamps, code — signals "system" and earns trust.
- Keep font weight as the primary hierarchy tool. Reach for color (red) last.

### Don't

- Don't introduce second accent colors (no purple, teal, lime). If you need semantic states, use `ok/warn/err/info` tokens — not new hues.
- Don't use red for decorative fill, illustration, or "to make it pop". Red = action or danger, nothing else.
- Don't mix radii on peer components (button harus `rounded-xl` everywhere; card `rounded-2xl`).
- Don't stack `border` + `shadow-*` on the same card — pick one depth cue.
- Don't use body text below 14px outside of mono labels/badges. Audience utama kita membaca di mobile — keep it legible.
- Don't import from deprecated paths (`src/components/editorial/*`, `src/components/ui/*`, `src/components/sections/*`) — they don't exist in v2.
- Don't revive the "Perantau Editorial" aesthetic (section numbering, LegalDossierCard, hard 1px ink borders everywhere, mixed fonts) — it's sunset.
- Don't add fonts. Plus Jakarta Sans + JetBrains Mono is the whole type system.

### Migration notes

When rewriting a legacy page:
1. Replace `bg-dtg-cream` → `bg-pg-paper`. `bg-dtg-ink` → `bg-pg-ink-900`. `text-dtg-red` → `text-pg-red-600`.
2. Replace `rounded-none` / hard-edge containers → `rounded-2xl` cards, `rounded-xl` buttons.
3. Drop `<SectionTag number="01" …>` + `<DisplayHeadline>` — use plain `<h2>` with an optional `<Eyebrow>` on top.
4. Remove any `<LegalDossierCard>`, `<Ticker>`, `<AsymmetricSectionHeader>`, `<EditorialButton>` references — substitute with `<Card>`, `<Badge>`, `<Button variant="primary|dark|ghost">`.
5. Delete inline `font-[family-name:var(--font-display)]` / Source Sans / Georgia references — let the global `font-sans` (= Plus Jakarta) handle it.
