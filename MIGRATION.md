# CliniCals: Base44 → Supabase + Vercel Migration Runbook

**Objective:** remove all dependence on the Base44 platform (hosting, database,
auth, file storage, LLM proxy, server functions) with **zero feature loss and
zero visual change**. The app is a Vite/React SPA — the UI code does not change
in this migration; only the platform underneath it does.

**Target stack:** Supabase (Postgres + Auth + Storage + Edge Functions) + Vercel (hosting + CDN).

**Who this is for:** a software developer executing the migration. Every step
below is concrete: what to run, what you should see, and how to verify before
moving on. Steps marked ✅ are already built and committed to this repo.

---

## Architecture you are working with (read first)

```
UI (unchanged) ──imports──▶ src/api/client.js  (the ONLY platform entry point)
                                 │
                 ┌───────────────┴────────────────┐
        env vars UNSET                    env vars SET (VITE_SUPABASE_URL + ANON_KEY)
                 │                                │
        src/api/base44Client.js          src/api/supabaseClient.js
        (Base44 SDK — current prod)      (Supabase adapter — ✅ built)
                                                  │
                                    supabase/functions/* (edge functions — ✅ built)
```

Key invariants (do not break these):
1. **No file in `src/` imports `@base44/*` or `./base44Client` directly** except
   `src/api/base44Client.js` and one flagged bootstrap line in
   `src/lib/AuthContext.jsx`. Verify anytime:
   ```
   grep -rn '@base44/sdk\|base44Client' src --include=*.jsx --include=*.js | grep -v src/api/
   ```
2. **Backend selection is env-var-only.** Setting `VITE_SUPABASE_URL` +
   `VITE_SUPABASE_ANON_KEY` at build time flips the whole app to Supabase.
   Unsetting them flips it back. This is your rollback mechanism at every stage.
3. Cross-cutting layers (AI grounding, AI response cache, offline entity
   snapshots, the PWA service worker) are backend-agnostic. Don't reimplement
   them; they follow whichever backend is active.

Already built and committed (✅):
- Platform facade + full import rewiring (244 call sites)
- Supabase adapter: entities CRUD (Base44 sort/filter semantics), all 10 auth
  methods, integrations, `functions.invoke`
- Edge functions: `invoke-llm` (grounded Anthropic proxy), `extract-file`,
  `send-email` (Resend), `generate-image` (Gemini), `dailyClinicalSummary`
- Scripts: `export-base44-data.mjs`, `generate-supabase-schema.mjs`,
  `import-to-supabase.mjs`
- Backend-aware `AuthContext` (skips the Base44 bootstrap probe on Supabase)
- PWA + offline layers (carry over unchanged)

---

## STEP 0 — Prerequisites (½ day)

0.1 Accounts: Supabase account (Pro tier recommended for daily backups),
    Vercel account, Anthropic API key, Resend account + verified sending
    domain, Google AI Studio key (only if the infographic generator is wanted).

0.2 Install tooling locally:
```
npm install                    # repo deps (supabase-js already added)
npm install -g supabase        # Supabase CLI
npm install -g vercel          # Vercel CLI
```

0.3 Create the Supabase project (dashboard → New project, region `ap-south-1`
    Mumbai for Indian users). Note: **Project ref**, **anon key**,
    **service-role key** (Settings → API). Treat the service-role key like a
    root password — it bypasses RLS. It is used ONLY in the import script and
    edge functions, never in frontend env.

0.4 In the Base44 dashboard, inventory anything server-side that is NOT in this
    repo: workflows, scheduled automations, webhooks, email templates, and the
    **user list** (email + role for every account). Export/screenshot all of it.
    The repo only reveals one server function (`dailyClinicalSummary`) — anything
    else configured platform-side must be recreated by hand in Phase D.

---

## STEP A — Data export from Base44 (½ day)

A.1 Log into the live app in a browser. DevTools → Application → Local Storage
    → copy `base44_app_id` and `base44_token`.

A.2 Run the export (read-only; safe against production):
```
BASE44_APP_ID=<id> BASE44_TOKEN=<token> node scripts/export-base44-data.mjs
```
Expected output: one line per entity, e.g. `Exporting Drug… 412 records`,
ending with a total. Output lands in `migration-export/` (gitignored — it
contains PHI; **never commit it, never upload it anywhere unencrypted**).

A.3 Verify: open `migration-export/_manifest.json`. Every entity with an
    `error` needs investigating (usually an expired token — re-copy it). Spot
    check `Drug.json` and `Patient.json` against what the live app shows.

A.4 Repeat the export the day before final cutover so no records are missed.

## STEP B — Database schema + import (1–2 days)

B.1 Generate the starter schema:
```
node scripts/generate-supabase-schema.mjs
```
Produces `migration-export/schema.sql`: one table per entity, snake_case,
`id text primary key` (Base44 ids are preserved verbatim — this keeps
cross-references like `dose_rule.drug_id → drug.id` intact), RLS enabled on
every table (owner-scoped for the 23 patient/PHI entities; read-all +
admin-write for reference data).

B.2 **Review the SQL by hand** (this is the step where mistakes are cheapest):
- Fix any type inferred too loosely (e.g. a numeric field sampled as text).
- Add indexes for hot queries: `drug(generic_name)`, `dose_rule(drug_id)`,
  `dose_rule(drug_name)`, `visit_record(patient_id, visit_date)`,
  `appointment(appointment_date)`, `lab_result(patient_id)`.
- Add FKs where confident (`dose_rule.drug_id references drug(id)`), as
  `not valid` initially so import order can't fail.
- Add a `daily_summary` table if not in the export
  (`summary_date date unique, clinical_pearl text, content text, topic text`)
  — the `dailyClinicalSummary` edge function writes to it.

B.3 Apply: paste into Supabase SQL editor (or `supabase db push` with the file
    as a migration). Verify in Table Editor: ~48 tables, RLS badge on each.

B.4 Import the data:
```
SUPABASE_URL=https://<ref>.supabase.co \
SUPABASE_SERVICE_ROLE_KEY=<service-role-key> \
node scripts/import-to-supabase.mjs
```
Reference tables import first automatically. The script upserts on `id`, so
re-running after fixing an error is safe. Expected: `Done: N entities
imported, 0 failed.` For each failure it prints the Postgres error — almost
always a missing column (add it, re-run).

B.5 Verify counts match the export manifest:
```sql
select 'drug' t, count(*) from drug
union all select 'dose_rule', count(*) from dose_rule
union all select 'patient', count(*) from patient;  -- etc.
```
And referential integrity: `select count(*) from dose_rule dr left join drug d
on d.id = dr.drug_id where dr.drug_id is not null and d.id is null;` → must be 0.

## STEP C — Auth (1–2 days)

C.1 Supabase dashboard → Authentication → Providers: enable Email (and Google
    if the app's OAuth login is used). URL Configuration → set Site URL to the
    production domain; add `http://localhost:5173` to redirect URLs for dev.

C.2 Recreate users from the Step 0.4 list. Options: dashboard invite (small
    lists) or the Admin API:
```js
// one-off node script with the service-role key
await sb.auth.admin.createUser({ email, email_confirm: true,
  app_metadata: { role: 'admin' /* or 'user' */ } });
```
`app_metadata.role` is what the RLS admin policies and `auth.me()` read.
**Passwords cannot be migrated** — after cutover, send everyone a
reset-password email (Supabase → Authentication → send recovery, or scripted
via `resetPasswordForEmail`).

C.3 Patient-scoped tables have an `owner_id uuid` column. Decide the ownership
    mapping: single-clinician app → backfill all rows to that user's new
    Supabase uid (`update patient set owner_id = '<uid>';` etc.). Multi-user →
    map from the exported `created_by` field to the corresponding new uid.

C.4 The frontend auth is already backend-aware (✅). Verify against a dev build:
```
VITE_SUPABASE_URL=... VITE_SUPABASE_ANON_KEY=... npm run dev
```
Test: login with a created user, refresh (session persists), logout, register,
forgot-password flow, and that an admin sees admin-only UI (Add Drug button on
Drugs & Dosing, Feedback Inbox).

## STEP D — Edge functions + storage (1 day)

D.1 Storage: dashboard → Storage → create bucket `uploads`, public. (The
    adapter uploads to `uploads/` and the generate-image function to
    `uploads/generated/`.)

D.2 Link and deploy the functions (all ✅ written in `supabase/functions/`):
```
supabase link --project-ref <ref>
supabase secrets set ANTHROPIC_API_KEY=sk-ant-... LLM_MODEL=claude-opus-4-8
supabase secrets set RESEND_API_KEY=re_... EMAIL_FROM="CliniCals <noreply@yourdomain>"
supabase secrets set GEMINI_API_KEY=...        # optional — infographics
supabase functions deploy invoke-llm
supabase functions deploy extract-file
supabase functions deploy send-email
supabase functions deploy generate-image
supabase functions deploy dailyClinicalSummary
```

D.3 Smoke test each from the CLI:
```
supabase functions invoke invoke-llm --body '{"prompt":"KDIGO AKI stage 2 definition?"}'
```
The reply must include a "Sources:" line (grounding is enforced server-side).

D.4 Schedule the daily summary (SQL editor):
```sql
select cron.schedule('daily-summary', '30 1 * * *', $$
  select net.http_post(
    url := 'https://<ref>.supabase.co/functions/v1/dailyClinicalSummary',
    headers := '{"Authorization": "Bearer <anon-key>"}'::jsonb,
    body := '{}'::jsonb);
$$);
```

D.5 Recreate anything found in Step 0.4 (other automations/webhooks) as
    additional edge functions + cron entries.

## STEP E — Parallel-run QA (3–5 days, the most important step)

E.1 Deploy a **staging** frontend on Vercel pointing at Supabase while
    production stays on Base44:
```
vercel link
vercel env add VITE_SUPABASE_URL      # staging + preview envs only
vercel env add VITE_SUPABASE_ANON_KEY
vercel deploy
```
Note: the build currently still includes `@base44/vite-plugin`; that is fine —
with the Supabase env vars set, no Base44 code path executes.

E.2 Full feature-parity pass on staging. Test matrix (tick every row on
    desktop + a low-end Android phone):

| Area | What to verify |
|---|---|
| Drugs & Dosing | formulary browse, search, monograph, indications picker calculates doses, Rx build/print/save template, eculizumab tab |
| Engines (all 42) | open each from Hub/pathways; they are pure frontend — a smoke-open is enough |
| Calculators | CKiD GFR, FENa/FEMg/FEUrea, BP percentiles, anthropometry, plasmapheresis — enter values, verify results render |
| Clinic | create patient, appointment, visit/encounter, prescription pad, labs, documents upload+view, billing |
| AI features | AI Assistant (follow-ups keep context, "Sources:" present), GlobalSearch Ask-AI, treatment generators, scribe, lab analyzer, differential |
| Research | projects CRUD, manuscript studio (AI generate + journal suggest), literature monitor |
| Auth | login/logout/register/reset, admin vs user visibility |
| Offline (PWA) | load app on WiFi → airplane mode → engines, formulary, calculators still work; previously asked AI answers replay |
| Daily summary | invoke the function, row appears in `daily_summary`, page renders it |

E.3 Fix-forward loop: schema mismatches surface here as Postgres errors in the
    browser console (column names/types). Fix in SQL, re-import that entity
    (`node scripts/import-to-supabase.mjs EntityName`), retest. The adapter's
    filter/sort semantics live in `src/api/supabaseClient.js` (`applyWhere` /
    `applySort`) — extend there if a feature uses an operator not yet mapped.

E.4 During the parallel window, treat **Base44 as source of truth**; any data
    created on staging is throwaway.

## STEP F — Cutover (½ day, do it on a quiet day)

F.1 Freeze changes on Base44 (announce to users).
F.2 Re-run STEP A export + STEP B.4 import (upsert refreshes everything).
F.3 Backfill `owner_id` for any new rows (C.3 statement).
F.4 Promote: add the two `VITE_SUPABASE_*` vars to the Vercel **production**
    environment; `vercel deploy --prod`; point the custom domain at Vercel.
F.5 Trigger password-reset emails to all users.
F.6 Watch Supabase logs (Database + Edge Functions) for the first hours.
**Rollback at any point:** remove the two env vars, redeploy → app is back on
Base44 (which still has all pre-freeze data).

## STEP G — Decommission Base44 (after 2–4 stable weeks)

G.1 Remove the dependency (one PR):
- Delete `src/api/base44Client.js`; in `src/api/client.js` drop the import and
  the ternary (Supabase becomes unconditional).
- Move the global grounding note: server-side enforcement in `invoke-llm`
  already covers it; keep `groundingRules.js` (the client cache still uses it).
- In `src/lib/AuthContext.jsx` delete the Base44 branch and the
  `createAxiosClient` import.
- Remove `base44` plugin from `vite.config.js`; remove `@base44/sdk` and
  `@base44/vite-plugin` from `package.json`; `npm install`.
- `grep -rn "base44" src/ vite.config.js package.json` — remaining hits should
  only be the compat-named `base44` export in client.js (optionally rename to
  `platform` in a follow-up mechanical PR).
G.2 `npm run build` must pass; run the STEP E matrix once more.
G.3 Export a final Base44 snapshot for archive, then cancel the subscription.

## Timeline & effort

| Step | Effort |
|---|---|
| 0 Prereqs | 0.5 d |
| A Export | 0.5 d |
| B Schema + import | 1–2 d |
| C Auth | 1–2 d |
| D Functions + storage | 1 d |
| E Parallel QA | 3–5 d |
| F Cutover | 0.5 d |
| G Decommission | 0.5 d |
| **Total** | **~2–3 weeks calendar** |

## Known risks & their handling

| Risk | Mitigation |
|---|---|
| Password hashes not portable | Planned reset-email campaign (F.5) |
| Hidden Base44 automations | Dashboard inventory in Step 0.4 before anything else |
| Schema inference wrong types | Hand review (B.2) + fix-forward loop (E.3); import is idempotent |
| Filter operators not mapped | Extend `applyWhere` in supabaseClient.js; Postgres errors point right at them |
| `functions.invoke` shape | Adapter already wraps replies as `{ data }` to match call sites |
| PHI leakage during migration | `migration-export/` gitignored; service key never in frontend; transfer exports only encrypted |
| Losing Base44's visual editor | Accepted: development becomes code-only after cutover |
