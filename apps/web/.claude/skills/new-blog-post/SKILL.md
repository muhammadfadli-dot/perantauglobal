---
name: new-blog-post
description: Create a new blog post for the DTG website. Use when the user wants to add a new article/blog post, provides content or a topic to write about.
argument-hint: [topic or path to content file]
---

# Create New Blog Post

You are creating a blog post for the DTG website (PT Daya Talenta Global / Perantau Global), an Indonesian P3MI recruitment agency for overseas workers.

## Context

Current date: !`date +%Y-%m-%d`
Existing blog posts: !`ls content/blog/id/ 2>/dev/null`

## Step 1: Understand the Input

The user may provide:
- A topic/title to write about
- A markdown file with raw content
- A URL to reference

If given a topic, research and write high-quality content. If given existing content, adapt it to our format.

## Step 2: Create the MDX Files

Create **both** Indonesian (id) and English (en) versions:

- `content/blog/id/{slug}.mdx`
- `content/blog/en/{slug}.mdx`

### Frontmatter Format

```yaml
---
title: "Judul Artikel yang Menarik"
description: "Deskripsi singkat 1-2 kalimat untuk SEO dan preview."
date: "YYYY-MM-DD"
author: "Perantau Global"
image: "/images/blog/{slug}.jpg"
tags: ["tag1", "tag2", "tag3"]
locale: "id"  # or "en"
---
```

### Slug Convention
- ID: use Indonesian kebab-case (e.g., `perawat-indonesia-di-arab-saudi`)
- EN: use English kebab-case (e.g., `indonesian-nurses-in-saudi-arabia`)

## Step 3: Use MDX Components

Enhance the content with these custom components (imported automatically via `mdxComponents`):

### Callout — Info boxes with icons
```mdx
<Callout type="tip" title="Title Here">
Content with **markdown** support.
</Callout>
```
Types: `tip` (red/brand), `info` (blue), `warning` (amber), `success` (green)

### StatGrid + Stat — Key numbers display
```mdx
<StatGrid>
  <Stat value="16" label="Sektor Industri" icon="🏭" />
  <Stat value="¥330K" label="Gaji Tertinggi" icon="💴" />
</StatGrid>
```

### Highlight — Emphasized section with label
```mdx
<Highlight label="Section Label">

Paragraph content here. Supports **bold** and lists.

- Item one
- Item two

</Highlight>
```

### Steps + Step — Visual timeline
```mdx
<Steps>
  <Step number={1} title="Step Title" icon="📋">
    Description of this step.
  </Step>
  <Step number={2} title="Next Step" icon="🔍">
    Description of next step.
  </Step>
</Steps>
```

### CTABox — Call to action
```mdx
<CTABox
  title="Ready to Start?"
  description="Optional description text."
  buttonText="Hubungi Kami via WhatsApp"
  variant="whatsapp"
/>
```
Variants: `primary` (red/black gradient), `whatsapp` (green)

### Tables — Use plain markdown
```mdx
| Header 1 | Header 2 | Header 3 |
|----------|----------|----------|
| Cell 1   | Cell 2   | Cell 3   |
```

**IMPORTANT:** Tables must be plain markdown, NOT wrapped in JSX components. MDX does not parse markdown inside JSX tags. Tables are styled automatically via the prose class.

## Step 4: Content Quality Guidelines

- **SEO-focused**: Title should contain target keywords
- **Data-driven**: Include salary tables, statistics, real numbers
- **Actionable**: Include step-by-step processes, requirements lists
- **Credible**: Reference real programs (Tokutei Ginou, Saudi Vision 2030, etc.)
- **Brand-aligned**: Always mention Perantau Global as the official P3MI channel
- **End with CTA**: Use `<CTABox>` component at the end of every post
- **Reading length**: Target 1,500-2,500 words per post

## Step 5: Recommended Structure

1. Opening `<Callout type="tip">` — hook/key takeaway
2. Introduction paragraph
3. `<StatGrid>` — key numbers at a glance
4. Main content sections with `##` headings
5. Tables for salary/comparison data (plain markdown)
6. `<Steps>` for processes
7. `<Highlight>` for cultural tips or important info
8. Tips/advice section
9. `<CTABox>` — closing CTA

## Step 6: Verify

After creating the files, run `npm run build` to verify:
- MDX parses without errors
- Both locale versions generate successfully
- Tables render as proper HTML

## Important: Do NOT Modify Dependencies

Creating blog posts should **never** require changes to `package.json` or `package-lock.json`. All MDX components are already available.

**Never add platform-specific packages** like `@parcel/watcher-linux-arm64-glibc`, `@swc/core-darwin-arm64`, etc. as direct dependencies. These break Vercel builds (Linux x64) when committed from a Mac ARM machine. If `npm install` runs for any reason during blog post creation:
- Check `git diff package.json` before committing
- Revert any unintended dependency changes
- Only commit the new `.mdx` files

Arguments: $ARGUMENTS
