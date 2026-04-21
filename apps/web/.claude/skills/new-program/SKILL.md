---
name: new-program
description: Create a new program landing page with form, API, Supabase table, and dashboard config. Use when there's a new job order / keberangkatan / program that needs a recruitment landing page.
argument-hint: [program name or PDF/doc with job details]
---

# Create New Program Landing Page

You are creating a complete recruitment program landing page for Perantau Global (PT Daya Talenta Global), an Indonesian P3MI that places workers overseas.

This skill handles the FULL pipeline: landing page + form + API + database + dashboard integration.

## Context

Current date: !`date +%Y-%m-%d`
Existing programs: !`ls src/app/\[locale\]/program/ 2>/dev/null`
Existing API routes: !`ls src/app/api/program/ 2>/dev/null`
Dashboard config: !`head -5 ~/Developer/dashboard.perantauglobal.com/src/config/programs.ts 2>/dev/null`

## Step 0: Gather Information

The user may provide:
- A PDF/document with job details (salary, requirements, qualifications)
- Verbal description of the program
- A job title and destination country

**Extract these key details** (ask if missing):

| Detail | Example | Required? |
|--------|---------|-----------|
| Job title | Truck Driver, Nurse, Caregiver | YES |
| Destination country | Jepang, Saudi Arabia, Taiwan | YES |
| Salary | ¥250,000/bulan | YES |
| Requirements | Education, age, experience, certifications | YES |
| Benefits | Insurance, visa, flight, training | YES |
| Departure cost | Rp18.500.000 | YES |
| Gender restriction | Laki-laki only, or all | If applicable |
| Max age | 44 tahun | If applicable |
| Language requirement | JLPT N4, IELTS 5.5 | If applicable |
| Contract duration | 5 tahun | YES |
| Visa type | Tokutei Ginou, work visa | If applicable |

## Step 1: Choose Identifiers

Pick a URL slug and code prefix:

- **URL slug**: kebab-case, descriptive (e.g., `truck-driver`, `caregiver-taiwan`, `food-service-japan`)
- **Code prefix**: 3-letter uppercase (e.g., TDP, CTP, FSJ) — used for component file naming
- **i18n namespace**: `program.[slug-as-camelCase]` or short code (e.g., `program.tdp`)

## Step 2: Create Supabase Table

Use the Supabase MCP tool to create the table:

```sql
CREATE TABLE [slug]_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  whatsapp text NOT NULL,
  email text NOT NULL,
  city text NOT NULL,
  -- Program-specific fields here --
  -- Always include these standard columns: --
  pipeline_stage text DEFAULT 'applied',
  po_notes text,
  reviewed_at timestamptz,
  reviewed_by text,
  created_at timestamptz NOT NULL DEFAULT now()
);
```

**Supabase project**: gt-tools (`piopuidmmzvewjeeezfv`)

**Standard columns** (ALWAYS include):
- `id`, `full_name`, `whatsapp`, `email`, `city`, `created_at` — base fields
- `pipeline_stage`, `po_notes`, `reviewed_at`, `reviewed_by` — dashboard pipeline tracking

**Program-specific columns**: Add based on the job requirements (e.g., `sim_type`, `japanese_level`, `age`, `education`, `has_certificate`).

## Step 3: Add API Route Entry

Open `src/app/api/program/[slug]/route.ts` and add a new entry to the `PROGRAMS` map:

```typescript
"your-slug": {
  table: "[slug]_registrations",
  required: ["fullName", "whatsapp", "email", "city", /* program-specific required fields */],
  validate: (b) => {
    // Optional: age validation, custom checks
    return null;
  },
  transform: (b) => ({
    full_name: b.fullName,
    whatsapp: b.whatsapp,
    email: b.email,
    city: b.city,
    // Map camelCase → snake_case for each field
  }),
},
```

**DO NOT create a separate route file.** All programs (except SPG) use the dynamic `[slug]` route.

## Step 4: Add i18n Keys

Add the program's i18n namespace to `src/messages/id.json` under the `"program"` key.

Follow the existing pattern — see `program.tdp` as reference. Include keys for:
- Hero: badge, headline, subheadline, cta, ctaSecondary, heroImageAlt
- Trust bar: 4 trust items
- Salary section: monthly/annual amounts with Rupiah conversion, comparison, departure cost
- Requirements: checklist items
- Benefits: 6 benefit cards (title + description each)
- Process: 4-5 step timeline (title + description each)
- Why [Country]: 4 selling point cards
- FAQ: 5-6 questions with answers
- Final CTA: title, subtitle
- Form: all field labels, options, success/error messages, trust note

**Salary conversion**: Always show the foreign currency amount AND the Rupiah equivalent. Use approximate exchange rate with disclaimer "kurs per [month] [year]".

## Step 5: Create Components

Create these component files in `src/components/program/`:

Use the **3-letter prefix** (e.g., TDP for Truck Driver Program):

| # | File | Section | Template |
|---|------|---------|----------|
| 1 | `{PREFIX}Hero.tsx` | Hero with badge, headline, CTAs | Copy from `TDPHero.tsx` |
| 2 | `{PREFIX}TrustBar.tsx` | 4 trust indicators | Copy from `TDPTrustBar.tsx` |
| 3 | `{PREFIX}Salary.tsx` | Salary display + Rupiah conversion + comparison bars | Copy from `TDPSalary.tsx` |
| 4 | `{PREFIX}Requirements.tsx` | Checklist of qualifications | Copy from `TDPRequirements.tsx` |
| 5 | `{PREFIX}Benefits.tsx` | 6 benefit cards | Copy from `TDPBenefits.tsx` |
| 6 | `{PREFIX}Process.tsx` | 4-5 step process timeline | Copy from `TDPProcess.tsx` |
| 7 | `{PREFIX}Why{Country}.tsx` | 4 cards about destination country | Copy from `TDPWhyJapan.tsx` |
| 8 | `{PREFIX}FAQ.tsx` | 5-6 accordion FAQ items | Copy from `TDPFAQ.tsx` |
| 9 | `{PREFIX}FinalCTA.tsx` | Gradient CTA section | Copy from `TDPFinalCTA.tsx` |
| 10 | `{PREFIX}Form.tsx` | Registration form | Copy from `TDPForm.tsx` |

### Component Rules

- All components use `"use client"` directive
- All text from `useTranslations("program.[namespace]")`
- Icons from `lucide-react` — pick appropriate icons for the program
- Follow DESIGN.md for all styling decisions
- Form posts to `/api/program/[your-slug]`
- Form has success/error states with trust note
- Salary comparison: show the target country salary vs Indonesia equivalent job salary
- Use `id="registration-form"` on the form section (for scroll-to CTA)
- Use `id="requirements"` on the requirements section (for secondary CTA scroll)

### Form Component Specifics

- Standard fields always present: fullName, whatsapp, email, city
- Program-specific fields as select/number/text based on requirements
- Conditional fields (e.g., simIssuedYear only shown if simType != "none")
- Submit to `/api/program/[your-slug]`
- inputClass: `"w-full rounded-lg border-0 ring-1 ring-inset ring-gray-300 px-4 py-3 text-base transition-colors focus:ring-2 focus:ring-inset focus:ring-[var(--color-dtg-red)] focus:outline-none"`
- labelClass: `"mb-1.5 block text-sm font-medium text-gray-700"`

## Step 6: Create Page Route

Create `src/app/[locale]/program/[your-slug]/page.tsx`:

```typescript
import { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
// Import all 10 components

export const metadata: Metadata = {
  title: "...",
  description: "...",
};

export const dynamic = "force-static";

export function generateStaticParams() {
  return [{ locale: "id" }, { locale: "en" }];
}

export default async function ProgramPage({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Hero />
      <TrustBar />
      <Salary />
      <Requirements />
      <Benefits />
      <Process />
      <WhyCountry />
      <FAQ />
      <FinalCTA />
      <Form />
    </>
  );
}
```

The page uses the existing `src/app/[locale]/program/layout.tsx` (minimal header, logo only).

## Step 7: Update Dashboard Config

Open `~/Developer/dashboard.perantauglobal.com/src/config/programs.ts` and add a new config entry.

Follow the existing pattern. Key fields:
- slug, name, shortName, icon (from lucide-react)
- tableName (must match the Supabase table from Step 2)
- searchFields: `["full_name", "whatsapp", "email"]`
- listColumns: 4-5 columns for the table view
- detailSections: grouped fields for the detail page
- filterOptions: filterable dimensions (stage + program-specific)
- pipeline: define stages appropriate for this program type

**Common pipeline for keberangkatan programs:**
```typescript
pipeline: {
  stages: [
    { value: "applied", label: "Applied" },
    { value: "document_check", label: "Document Check" },
    { value: "language_training", label: "Language Training" },
    { value: "visa_process", label: "Visa Process" },
    { value: "departed", label: "Departed" },
    { value: "exit", label: "Exit" },
  ],
  defaultStage: "applied",
},
```

## Step 8: Verify

Run these checks in order:

1. **Website build**: `npm run build` in perantauglobal.com — must pass
2. **Dashboard build**: `cd ~/Developer/dashboard.perantauglobal.com && npm run build` — must pass
3. **Preview**: Open `/program/[your-slug]` in browser to verify layout
4. **Form test**: Submit a test entry and verify it appears in Supabase table

## Checklist Summary

Before marking as done, ensure ALL of these exist:

- [ ] Supabase table created with standard + program-specific columns
- [ ] API route entry added to `src/app/api/program/[slug]/route.ts` PROGRAMS map
- [ ] i18n keys added to `src/messages/id.json` under `program.[namespace]`
- [ ] 10 component files created in `src/components/program/`
- [ ] Page route created at `src/app/[locale]/program/[slug]/page.tsx`
- [ ] Dashboard config added to `~/Developer/dashboard.perantauglobal.com/src/config/programs.ts`
- [ ] Website build passes
- [ ] Dashboard build passes

## Important: Do NOT Modify Dependencies

Creating a program landing page should NEVER require changes to `package.json`. All components (Lucide icons, next-intl, etc.) are already available.

## Reference: Existing Program Files

| Program | Prefix | Slug | Components |
|---------|--------|------|------------|
| Truck Driver | TDP | truck-driver | TDPHero, TDPTrustBar, TDPSalary, etc. |
| Global Nurse | GNP | global-nurse | GNPHero, GNPForm, etc. |
| Global Talent Hub | GTH | global-talent-hub | GTHHero, GTHForm, etc. |
| SPG | SPG | spg | SPGSmartForm (multi-step, unique) |

Use TDP as the primary template — it's the most complete and recent.

Arguments: $ARGUMENTS
