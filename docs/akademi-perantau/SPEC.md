# Akademi Perantau — Foundation Spec

> Status: **foundation build in progress** (branch `feat/akademi-perantau-foundation`).
> This doc is the source of truth for the learning-platform foundation. Product
> content (Masterclass Financial etc.) is intentionally deferred — we are building
> the **codebase fundamental** to receive course registrations + deliver in-app
> guided learning, not the specific course content.

## 1. Vision (locked with Panji, 2026-06-02)

**Akademi Perantau** = the umbrella learning brand inside Perantau Global,
**"facilitated by Daya Skill"** (DayaLima's vocational brand). It replaces the
"Sertifikasi" / "Learning Portal" / "Paspor" labels everywhere:

- apps/web: `/sertifikasi` → `/akademi`
- apps/platform: bottom-nav tab "Paspor" → "Akademi"; `/paspor` → `/akademi`
- **Paspor Perantau Global** becomes *one product inside* Akademi, not the brand.

### Products live inside Akademi, each with 3 possible delivery modes
- `in_app` — guided learning (Duolingo-style): reading materials + quiz with a
  scoring rubric, all in-app. **This is what we ship first.** (Video deferred.)
- `webinar` — live scheduled session.
- `offline` — tatap muka / LPK third-party (e.g. cohort 3 Jan). CRM-tracked.
- `external` — deep test hosted elsewhere; candidate registers in Akademi, gets a
  link (email), result tracked back. CRM-tracked.

The **first product to deploy** is **Masterclass Financial** (`in_app`), but its
content + pricing is discussed *after* the foundation is solid. Foundation seeds a
placeholder program only.

## 2. Core principles
- **Every program has a defined OUTPUT** (`output_type`: certificate / psikotes
  result / completion / none) + issuer + delivery channel. "Where do I get my
  credential" is explicit in data.
- **Account required.** Registering for a program = creating (or logging into) a
  Perantau Global account, in one seamless flow, with PDP consent. No anonymous
  enrollments (unlike `event_registrations`, which stays a separate anon top-funnel
  surface).
- **One `candidates` identity, many intents.** A person reaching PG via job-apply,
  academy-register, or direct sign-up converges to one candidate row.
- **Cert integrity.** Quiz answer keys never reach the client. Grading is
  server-side via `SECURITY DEFINER` RPCs. Candidates cannot self-write scores or
  flip enrollment status.

## 3. Unified registration journey

```
Entry point            intent     pending_submissions     trigger materializes
──────────────────────────────────────────────────────────────────────────────
/lowongan/[slug]    →  job     →  position_slug set    →  applications
/akademi/[slug]     →  academy →  program_slug set     →  academy_enrollments
(logged-in)         →  —       →  (no pending)         →  direct enroll (RLS insert)
```

Reuses the existing magic-link / password-verify materialization
(`handle_new_auth_user`). New: a `pending_submissions.intent` discriminator routes
the trigger to `applications` (job) vs `academy_enrollments` (academy). Existing
account → magic-link logs in and enrollment attaches to the same candidate (no
duplicate). Per-program intake questions live in `program_registration_fields`
(the learning-specific "jalur tersendiri", modeled on `position_application_fields`).

## 4. Schema (migration 0060)

| Table | Role |
|---|---|
| `academy_programs` (slug PK) | catalog: title, category, `delivery_mode`, pricing, `output_*`, schedule, `content` JSONB, `pass_threshold`, status |
| `program_registration_fields` | per-program intake questions (reuses `form_field_type` enum) |
| `academy_modules` | ordered units within a program (in_app) |
| `academy_lessons` | leaf content: `reading` \| `quiz` (video later). Quiz `content` holds prompts+options only — **no answer keys** |
| `academy_lesson_keys` (lesson_id PK) | **admin-only** quiz answer keys + explanations + weights |
| `academy_enrollments` (candidate × program) | registration + status + progress_pct + score + cert + external/offline CRM fields |
| `academy_lesson_progress` (enrollment × lesson) | per-lesson completion + quiz score |

Plus `pending_submissions` gets `intent` + nullable `position_slug` + `program_slug`.

### RLS
- `academy_programs` / `modules` / `lessons` / `registration_fields`: read when
  program published OR admin; admin all. (No secrets in these tables.)
- `academy_lesson_keys`: **admin only** (both read + write).
- `academy_enrollments`: candidate self-**read** only; **no candidate insert/update**
  — logged-in enroll goes through `enroll_in_academy_program()` (consent atomic +
  publish-gated), and all progress mutation via RPC. Admin all. (Closes the
  self-insert spoof of `certificate_url`/`external_status`.)
- `academy_lesson_progress`: candidate self-read; reading completion + quiz scores
  written only via `SECURITY DEFINER` RPCs. Admin all.

### RPCs (SECURITY DEFINER, owner-run; default PUBLIC grant revoked)
- `enroll_in_academy_program(p_program_slug, p_answers, p_consent_text,
  p_consent_version)` — logged-in enroll: inserts enrollment + PDP consent
  atomically, publish-gated, NULL-candidate denied. Consent logged once.
- `complete_academy_reading(p_enrollment_id, p_lesson_id)` — marks a reading lesson
  done (ownership-checked, NULL candidate denied), recomputes enrollment progress.
- `grade_academy_quiz(p_enrollment_id, p_lesson_id, p_answers jsonb)` — reads
  answer keys, computes weighted score vs per-lesson (or program) `pass_threshold`,
  writes lesson_progress, recomputes enrollment, returns `{score, lesson_passed,
  pass_threshold, per_question}` **without** leaking correct keys.
- `_recompute_academy_enrollment(p_enrollment_id)` — internal: progress_pct from
  completed lessons / total; pass = **all quizzes individually pass**; cert stamped
  only for `output_type` certificate/completion and **cleared when no longer earned**.

### Foundation scope notes (conscious deferrals)
- Enrollment `score` = unweighted average of quiz scores (display only); pass/fail
  is per-lesson. Weighted/last-quiz scoring deferred.
- `webinar`/`offline` = single-session (`program.starts_at`) + free-text
  `enrollment.external_status` attendance. Multi-session cohorts deferred.
- Programs are **archived** (`status='closed'`), not hard-deleted — `program_slug`
  is `ON DELETE RESTRICT` on enrollments + pending_submissions.
- **Lesson sequential unlock is cosmetic** (a UI guide), not server-enforced — the
  RPCs check ownership + program-belonging but not order, so a direct lesson URL
  can be opened out of sequence. Acceptable for foundation; add an order gate in
  the RPCs if strict gating is ever required.
- **Existing-account web registration gap (known):** if someone with an already-
  confirmed PG account submits the public `/akademi/[slug]` register form, the
  trigger can't materialize the enrollment (no `email_confirmed_at` flip). They're
  told to log in and enroll in-app (`enroll_in_academy_program`). When the web
  register *form* is built (rebrand phase), it should route the `409 email_exists`
  response → login → `/akademi/[slug]` to finish enrolling.

## 5. Build phases (this foundation)
1. **Schema** — migration 0060 + regenerate types. *(file only; NOT applied to prod
   until Panji approves)*
2. **Account journey** — academy register form → pending(intent=academy) →
   verify → enroll; logged-in direct enroll. Consent logged.
3. **Candidate engine** — `/akademi` catalog → program detail → register → guided
   learning (module list → reading → quiz → score → result). Replaces mock `/paspor`.
4. **Admin CMS** — `/admin/academy`: CRUD program + modules + lessons (incl. quiz
   author w/ answer keys) + registration fields; enrollment list per program.
5. **apps/web rebrand** — `/sertifikasi` → `/akademi` (routes/nav/components/home).
6. **Seed** — one placeholder `in_app` program to prove the journey E2E.

## 6. Hard boundaries during autonomous build
- Work on branch `feat/akademi-perantau-foundation` only.
- **Do NOT** apply migrations to prod or deploy. Present migration files + green
  build; Panji gives the go for apply + deploy.
- Verification each loop: typecheck + lint + build (both apps) + adversarial review
  (RLS / journey edge cases / cert integrity). Live E2E happens post-apply.

## 7. Superseded
- Draft `0040_paspor_courses_draft.sql` is **removed** — replaced by this model.
- Drafts `0041` (interview) / `0042` (pre-departure) are unrelated and left as-is.
