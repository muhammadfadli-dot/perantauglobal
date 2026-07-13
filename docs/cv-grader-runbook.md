# CV Grader — Operations Runbook

Operational reference for the "CV di depan" apply-funnel grader (public LP →
preview fit → gate → submit → verify → full grade). Companion to the build
design in [`cv-grader-fase2-design.md`](./cv-grader-fase2-design.md). Written
2026-07-13 after the hygiene & hardening pass.

Project: Supabase `jeadtvxgxmqnsqwxjmhj`. Web: Vercel `perantauglobal-web`
(`apps/web`, auto-deploys on merge to `main`). Edge functions deploy manually
(MCP `deploy_edge_function` or `supabase functions deploy`).

---

## 1. Data lifecycle (what lives where, for how long)

| Stage | Where | Retention | Enforced by |
|-------|-------|-----------|-------------|
| CV staged anon (pre-account) | Storage `pending-cv`, path `pending/<pending_id>/cv.<ext>` | **48 h** if orphaned (dropout/bot) | daily hygiene fn → `list_orphan_pending_cv` |
| CV materialized (post-verify) | Storage `candidate-documents/<cid>/cv/…` | permanent | — |
| Apply staging PII | `pending_submissions` + `consents` | **30 days** if unconsumed (never verified) | daily hygiene fn → `purge_stale_pending_submissions(30)` |
| Preview telemetry | `cv_preview_events` | IP anonymized > 24 h; row deleted > 90 days | daily hygiene fn |
| Drop-off aggregate | `pending_purge_daily` | permanent (no PII) | written before purge |
| Full grade result | `cv_assessments` | permanent | — |

**Key invariant:** a `pending-cv` file that IS referenced by a
`candidate_documents` row is NOT purged at 48 h (the candidate verified late) —
it survives until `cv-materialize` moves it, or the 14-day dangling backstop
cleans it if the move never happened.

## 2. The daily hygiene function

`cv-purge-orphans` (misnamed — it's the single daily maintenance entrypoint) is
triggered by GitHub Action [`cv-purge-orphans-cron.yml`](../.github/workflows/cv-purge-orphans-cron.yml)
at **02:17 WIB** (pg_cron is not installed on this project). Fail-closed on the
`PURGE_CRON_SECRET` header. Each step is independent + best-effort; it returns a
JSON report:

```json
{"ok":true,"purged_orphan_files":N,"dangling_cleaned":N,
 "purged_pendings":N,"purged_consents":N,
 "preview_ip_anonymized":N,"preview_events_deleted":N,"errors":[]}
```

Steps: (1) purge orphan `pending-cv` files > 48 h (unreferenced), (2) dangling
backstop — referenced-but-> 14 days files + their metadata, (3) retention —
`pending_submissions` unconsumed > 30 days + consents, (4) telemetry hygiene.

**Manual run:** GitHub → Actions → "cv-purge-orphans" → Run workflow. The report
prints in the run log. `errors: []` = healthy.

## 3. Anti-abuse layers (defense in depth)

| Layer | Where | Policy |
|-------|-------|--------|
| Honeypot | apply form hidden field | filled = silent 200, no write |
| Turnstile (managed) | preview + submit | preview **fail-closed** on bad/missing token; submit **fail-open** (log only) |
| Rate limit — submit | `check_apply_rate_limit` (0079) | 5/email + 15/IP per 10 min, fail-open |
| Rate limit — preview | `check_cv_preview_rate_limit` (0095) | 8/IP per 10 min + 5/pending per 24 h, fail-open |
| Bucket caps | `pending-cv` | 5 MB + MIME whitelist, anon INSERT-only, blind write-only |

Turnstile keys live on Vercel **Production only** (`NEXT_PUBLIC_TURNSTILE_SITE_KEY`
public + `TURNSTILE_SECRET_KEY` server-only). Widget hostname allowlist
(Cloudflare dashboard): `www.perantauglobal.com`. Unset secret = feature off
(verify is a no-op), so preview/dev skip it cleanly.

**Gotcha:** after any DDL that changes an RPC signature, PostgREST may serve a
stale schema cache — run `NOTIFY pgrst, 'reload schema';` or the route's rpc call
404s and fail-opens silently. Also: browser background work after the response
must use `waitUntil()` (Vercel freezes the lambda on response flush).

## 4. Threshold tuning (the gate)

The submit gate lives in `apps/web/src/components/pg/ApplyForm.tsx` —
`const CV_FIT_THRESHOLD = 45` ("lumayan cocok"). Bands: ≥70 green, ≥45 yellow,
below red. Fail-open: a null score (unreadable / LLM error) never blocks submit.

**Rule: do not change the threshold until ≥ 100 `scored` events accumulate.**
Then review weekly. Target block rate ~10–25%. If > 40% blocked, lower it; if
< 5%, consider raising. Distribution query:

```sql
-- fit distribution + under-gate share, last 30 days
SELECT width_bucket(fit_score, 0, 100, 10) AS decile,
       count(*) AS n,
       count(*) FILTER (WHERE fit_score < 45) AS under_gate
FROM cv_preview_events
WHERE outcome = 'scored' AND created_at > now() - interval '30 days'
GROUP BY 1 ORDER BY 1;
```

`GTM-NK3TM7K7` receives funnel events (`cv_upload_success`,
`cv_preview_result` with `band`, `cv_gate_blocked`, `apply_submit_success`).
Configure the GA4 tags in the GTM dashboard to see the funnel.

## 5. Cost

Per preview ≈ 2 LLM calls (extract gemini-flash-lite + fit gemini-flash) ≈
**$0.003 (~Rp 50)**. Projected ~$10–15/month at relaunch scale. Set a budget
alert in Vercel → AI Gateway. Turnstile + the per-pending cap keep bot burn near
zero.

## 6. Inspection queries (run anytime via Supabase SQL)

```sql
-- Health snapshot
SELECT jsonb_build_object(
  'pending_cv_objects', (SELECT count(*) FROM storage.objects WHERE bucket_id='pending-cv'),
  'pending_cv_gt48h',   (SELECT count(*) FROM storage.objects WHERE bucket_id='pending-cv' AND created_at < now()-interval '48 hours'),
  'dangling_docs',      (SELECT count(*) FROM candidate_documents cd WHERE cd.file_path LIKE 'pending/%'
                          AND NOT EXISTS (SELECT 1 FROM storage.objects o WHERE o.bucket_id='pending-cv' AND o.name=cd.file_path)),
  'unconsumed_gt30d',   (SELECT count(*) FROM pending_submissions WHERE consumed_at IS NULL AND created_at < now()-interval '30 days'),
  'orphan_consents',    (SELECT count(*) FROM consents WHERE pending_id IS NULL AND candidate_id IS NULL)
);

-- Preview telemetry, last 7 days
SELECT outcome, count(*), round(avg(fit_score),1) AS avg_fit,
       count(*) FILTER (WHERE fit_score < 45) AS under_gate
FROM cv_preview_events WHERE created_at > now() - interval '7 days' GROUP BY outcome;
```

Healthy = dangling_docs 0, orphan_consents 0, unconsumed_gt30d small (grows
daily, reset by the cron), errors [] in the cron report.

## 7. Migrations map (this pass)

| # | What |
|---|------|
| 0094 | `cv_preview_events` + `check_cv_preview_rate_limit` (per-IP) |
| 0095 | purge excludes referenced files; telemetry columns; rate-limit v2 (per-IP + per-pending, returns event id); `record_cv_preview_outcome` |
| 0096 | `pending_purge_daily` + `purge_stale_pending_submissions`; `stamp_pending_cv_fit` |
| 0097 | `list_stale_referenced_pending_cv` (dangling backstop) |

Do **not** edit `grade-cv` (verify_jwt must stay true) or the
`handle_new_auth_user` signup trigger without the verbatim-replace + one-block
pattern (see 0078/0088/0090).
