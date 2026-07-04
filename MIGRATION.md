# Base44 → Self-Hosted Migration Plan

Goal: remove the dependency on the Base44 platform (hosting, SDK, entities,
auth, LLM/file integrations) while keeping every feature working. Target stack:
**Supabase** (Postgres + Auth + Storage + Edge Functions) + **Vercel** (hosting).

The app already routes ALL platform access through a single facade,
`src/api/client.js`. Swapping backends means reimplementing that one module —
no feature code changes.

---

## Phase 1 — Abstraction layer ✅ DONE

- `src/api/client.js` is the sole platform entry point. Every `src/` file imports
  `base44` (or the `db`/`auth`/`ai`/`files`/`email`/`serverFunctions` aliases)
  from here. Nothing imports `@base44/sdk` or `./base44Client` directly except:
  - `src/api/base44Client.js` — the Base44 implementation (to be replaced)
  - `src/lib/AuthContext.jsx` — one raw `createAxiosClient` bootstrap probe to
    `/api/apps/public`; this is Base44-specific and gets rewritten in Phase 3.
- Global cross-cutting layers already live at the choke point: AI grounding
  (`src/lib/ai/groundingRules.js`), response caching + offline entity snapshots
  (`src/lib/offline/entitySnapshot.js`).

**To verify isolation at any time:**
```
grep -rn '@base44/sdk\|base44Client' src --include=*.jsx --include=*.js | grep -v src/api/
```
Should return only the AuthContext bootstrap line.

## Phase 2 — Data export & schema (~2 days)

1. Export every entity (read-only, never writes to Base44):
   ```
   BASE44_APP_ID=<id> BASE44_TOKEN=<token> node scripts/export-base44-data.mjs
   ```
   Get the id/token from browser DevTools → Local Storage (`base44_app_id`,
   `base44_token`). Output: `migration-export/<Entity>.json` + `_manifest.json`.
   **This directory is gitignored — it contains PHI. Never commit it.**

2. Generate a starter Postgres schema from the exported shapes:
   ```
   node scripts/generate-supabase-schema.mjs
   ```
   Produces `migration-export/schema.sql` with a table per entity, inferred
   column types, and RLS policies (owner-scoped for patient data, read-all/
   write-admin for reference data). **Review it** — inference is a starting
   point; add foreign keys, indexes, and tighten types by hand.

3. Apply the schema in Supabase (SQL editor or `supabase db push`), then bulk
   import the JSON (a `\copy`/insert script per table, or the Supabase JS admin
   client). Do reference tables first (Drug, DoseRule, Guideline, SearchIndex,
   AppRoute), then patient tables.

## Phase 3 — Auth ✅ CODE READY (adapter written; AuthContext rewrite pending)

Supabase Auth covers all 10 methods the app uses. `src/api/supabaseClient.js`
implements the full `auth.*` surface against `supabase.auth`.

Still to do at cutover:
- Rewrite `src/lib/AuthContext.jsx` against the facade's `auth` (drop the
  `createAxiosClient` public-settings probe — it's the last Base44-specific line).
- Map `role: 'admin'` to a JWT claim / `app_metadata.role` (RLS policies use it).
- **Password hashes are not exportable from Base44** — users must reset. Plan a
  one-time "set your new password" email via Supabase's reset flow at cutover.

## Phase 4 — Integrations ✅ CODE READY (deploy pending)

`src/api/supabaseClient.js` implements the full entity + integration surface.
Edge functions are in `supabase/functions/`:

| Base44 call | Replacement | Status |
|---|---|---|
| `Core.InvokeLLM` | `supabase/functions/invoke-llm` — Anthropic proxy, grounding enforced server-side, JSON schema → tool-use | ✅ written |
| `Core.UploadFile` | Supabase Storage `uploads` bucket (in adapter) | ✅ written |
| `Core.ExtractDataFromUploadedFile` | `supabase/functions/extract-file` — Claude with the file attached | ✅ written |
| `Core.SendEmail` | `supabase/functions/send-email` — Resend | ✅ written |
| `Core.GenerateImage` | adapter → `generate-image` edge fn | stub — audit usage first, likely droppable |
| `functions.invoke('dailyClinicalSummary')` | `supabase/functions/dailyClinicalSummary` — grounded, idempotent, cron-able | ✅ written |

The AI response cache and offline snapshot layers are backend-agnostic and are
applied to whichever backend is active (see `src/api/client.js`).

### How the backend switch works

`src/api/client.js` selects Supabase automatically when `VITE_SUPABASE_URL` and
`VITE_SUPABASE_ANON_KEY` are set (see `.env.example`); otherwise it stays on
Base44. **No code change flips it — just env vars.** You can even run a preview
build with Supabase env while production stays on Base44.

### Deploy checklist (when the Supabase project exists)

```
# 1. Link the project
supabase link --project-ref <ref>

# 2. Apply schema (after reviewing migration-export/schema.sql)
supabase db push   # or paste schema.sql into the SQL editor

# 3. Create the storage bucket the adapter expects
#    (Supabase dashboard → Storage → new bucket named "uploads", public)

# 4. Set edge-function secrets
supabase secrets set ANTHROPIC_API_KEY=sk-ant-... LLM_MODEL=claude-opus-4-8
supabase secrets set RESEND_API_KEY=re_... EMAIL_FROM="CliniCals <noreply@domain>"

# 5. Deploy functions
supabase functions deploy invoke-llm
supabase functions deploy extract-file
supabase functions deploy send-email
supabase functions deploy dailyClinicalSummary

# 6. (optional) schedule the daily summary
#    In SQL editor: select cron.schedule('daily-summary','0 1 * * *',
#      $$ select net.http_post('<project>/functions/v1/dailyClinicalSummary','{}') $$);

# 7. Flip the frontend: set VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY and redeploy
```

## Phase 5 — Hosting cutover (~2 days)

- Remove `@base44/vite-plugin` from `vite.config.js` (keep `VitePWA` and
  `react`). Remove `@base44/sdk` from `package.json` once `base44Client.js` is
  deleted.
- Deploy to Vercel, point the domain, set Supabase env vars.
- The PWA (service worker, manifest, offline snapshots) carries over unchanged.
- Run Base44 and Supabase in **parallel for 2–4 weeks** with Supabase as source
  of truth before decommissioning Base44.

## Order & risk

1 ✅ → 2 → (3 ‖ 4) → 5. Realistic total ~3–4 weeks.

Risks to watch:
- Password reset is unavoidable (hashes not portable).
- You lose Base44's visual-edit / app-builder UI — development becomes
  code-only from cutover.
- Check the Base44 dashboard for automations beyond `dailyClinicalSummary`
  (workflows, scheduled tasks, webhooks) that aren't visible in this repo.
