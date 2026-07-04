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

## Phase 3 — Auth (~3 days)

Supabase Auth covers all 10 methods the app uses (email/password, OAuth
provider, logout, register, password reset request/confirm, OTP resend, token).
- Rewrite `src/lib/AuthContext.jsx` against `supabase.auth` and drop the
  `createAxiosClient` public-settings probe.
- Map the `role: 'admin'` concept to a Postgres column + a JWT claim (used by
  the RLS policies above).
- **Password hashes are not exportable from Base44** — users must reset. Plan a
  one-time "set your new password" email via Supabase's reset flow at cutover.

## Phase 4 — Integrations (~1 week)

Reimplement inside `src/api/client.js` (or a new `supabaseClient.js` it wraps):

| Base44 call | Replacement |
|---|---|
| `Core.InvokeLLM` | Supabase **Edge Function** proxying the Anthropic API. Move `GROUNDING_RULES` server-side so it can't be bypassed. `response_json_schema` → Claude tool-use. **Never put the API key in the frontend.** |
| `Core.UploadFile` | Supabase **Storage** `upload()` → returns public/signed URL |
| `Core.ExtractDataFromUploadedFile` | Edge function: Claude with the file attached |
| `Core.SendEmail` | Edge function → Resend or SES |
| `Core.GenerateImage` | Audit usage; likely droppable, else an image API from an edge function |
| `functions.invoke('dailyClinicalSummary')` | Rewrite as a scheduled Edge Function (pg_cron / Supabase schedule) |

Keep the AI response cache and offline snapshot layers exactly as-is — they sit
above the client and are backend-agnostic.

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
