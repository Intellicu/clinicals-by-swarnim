# CliniCals — Engineering Design & Architecture Document

**Companion to:** `docs/PRD.md`
**Audience:** engineers building, maintaining, or migrating the app
**Status:** Living document
**Last updated:** 2026-07

> Terminology note: this is the technical design / architecture document
> (sometimes abbreviated as the product's "design & architecture doc"). It
> translates the PRD's requirements into system design, and is the reference an
> engineer uses alongside `MIGRATION.md`.

---

## 1. System overview

CliniCals is a **client-heavy Single-Page Application**: a Vite + React 18 SPA
where most clinical logic (engines, calculators, dose math) is pure frontend
code with no backend round-trip. A Backend-as-a-Service provides persistence,
auth, file storage, and an LLM proxy. The app is delivered as an installable PWA
with an offline-first cache strategy.

```
┌──────────────────────────── Browser (PWA) ────────────────────────────┐
│  React SPA (Vite build)                                                │
│   • 129 pages, 40+ engines, calculators — pure client logic            │
│   • React Query for server state, Context for patient/auth state       │
│   • Service worker (precache) + offline entity snapshots               │
│                                                                        │
│   src/api/client.js  ◀── THE ONLY platform entry point ──▶            │
│        │                                                               │
│        ├─ base44Client.js   (current: Base44 SDK)                      │
│        └─ supabaseClient.js  (target: Supabase)                        │
└────────────────────────────────┬──────────────────────────────────────┘
                                  │ HTTPS
              ┌───────────────────┴────────────────────┐
      Base44 platform  ──migration──▶  Supabase + Vercel
      (DB/auth/LLM/fn)                 (Postgres+RLS / Auth / Storage /
                                        Edge Functions / CDN hosting)
```

---

## 2. Tech stack

| Layer | Technology |
|---|---|
| UI | React 18, Vite 6, Tailwind CSS, shadcn/ui, lucide-react, framer-motion |
| Routing | react-router-dom (routes in `src/App.jsx` + `src/pages.config.js`) |
| Server state | @tanstack/react-query |
| Client state | React Context (`PatientContext`, `AuthContext`) + localStorage |
| Markdown/AI render | react-markdown |
| PWA | vite-plugin-pwa (Workbox) |
| Backend (current) | Base44 (`@base44/sdk`, `@base44/vite-plugin`) |
| Backend (target) | Supabase (Postgres, Auth, Storage, Edge Functions/Deno) |
| Hosting (target) | Vercel |
| LLM | Anthropic Claude (via server-side proxy post-migration) |

---

## 3. Core architectural principles

### 3.1 Single platform facade
Every platform interaction flows through **`src/api/client.js`**. No other file
in `src/` imports `@base44/*` or a concrete backend client (verified by grep;
one flagged exception in `AuthContext.jsx` removed at decommission). This makes
the backend swap an env-var decision, not a code change:

```js
export const base44 = isSupabaseConfigured ? supabaseBackend : base44Backend;
```

The export keeps the name `base44` purely for call-site compatibility (244
sites); new code uses the named aliases `db / auth / ai / files / email /
serverFunctions`.

### 3.2 Choke-point cross-cutting layers
Because all access is funnelled, safety/cost features are applied once, centrally,
and cannot be bypassed by any feature:

- **AI grounding** (`src/lib/ai/groundingRules.js`): strict evidence rules
  prepended to every LLM prompt. On Base44 this is wrapped in `base44Client.js`;
  on Supabase it is enforced **server-side** inside the `invoke-llm` edge
  function (tamper-proof).
- **AI response cache + relevant-context selection** (`src/lib/ai/groundedLLM.js`):
  7-day localStorage cache keyed by prompt hash; guideline pre-selection to trim
  tokens. Backend-agnostic.
- **Offline entity snapshots** (`src/lib/offline/entitySnapshot.js`): wraps
  `list`/`filter` on reference entities (Drug, DoseRule, Guideline, AppRoute,
  SearchIndex) to serve a local snapshot when the network fails.

### 3.3 Offline-first
Two layers: (a) the service worker precaches the built SPA so the app shell and
all pure-frontend features (engines, calculators, formulary UI) load with no
network; (b) the entity-snapshot layer keeps reference data available for reads.
Patient data is deliberately **not** served stale.

### 3.4 Safety-by-construction in dose logic
Dosing is the highest-risk surface. Design rules enforced in code:
- Ranges parsed as ranges (dash normalization before regex).
- Per-day vs per-dose semantics explicit; frequency divides daily totals.
- Units read from data, never assumed mg.
- Multi-indication drugs cannot emit a single fallback dose.
- Every calculated dose carries a visible calculation trail.

---

## 4. Data model

48 entities (PascalCase in the SDK; snake_case tables post-migration). Two
classes:

- **Reference data** (shared, read-all / admin-write): `Drug`, `DoseRule`,
  `Guideline`, `SearchIndex`, `SearchSynonym`, `AppRoute`, `Specialty`,
  `BiopsyPattern`, `RareDiseaseContent`, `TeachingModule`, `TreatmentTemplate`,
  `MonitoringTemplate`, `LearningPath`.
- **Patient / user data** (PHI, owner-scoped RLS): `Patient`, `VisitRecord`,
  `ClinicalEncounter`, `LabResult`, `Measurement`, `GrowthRecord`,
  `Prescription`, `MedicalHistoryEntry`, `PatientDailyLog`, `PatientDocument`,
  `PatientEducationAssignment`, `FollowUpSchedule`, `MonitoringPlan`,
  `MonitoringAlert`, `NSRelapseEpisode`, `RRTMonitoringData`, `ReferralLetter`,
  `Billing`, `Appointment`, `Notification`, `NotificationPreference`,
  `UserPreferences`, `AnalysisResult`, plus research/ops entities.

Key relationship: `DoseRule.drug_id → Drug.id` (indication-first prescribing).
Migration preserves Base44 ids as `text` PKs so all references survive.

### 4.1 Entity API contract (must hold for any backend)
```
entity.list(sort, limit, skip)      // sort: "field" | "-field"
entity.filter(where, sort, limit)   // where: { field: val | {$gt,$gte,$lt,$lte,$ne,$in,$contains} }
entity.get(id)
entity.create(record) / bulkCreate(records)
entity.update(id, patch)
entity.delete(id)
```
The Supabase adapter (`src/api/supabaseClient.js`) implements exactly this,
translating sort strings and filter operators to PostgREST and mapping
PascalCase→snake_case.

---

## 5. Auth & authorization

- Methods used: `me, loginViaEmailPassword, loginWithProvider, logout, register,
  redirectToLogin, resendOtp, resetPassword, resetPasswordRequest, setToken`.
- Roles: `user` / `admin` (admin gates formulary editing, feedback inbox,
  pathway editing). Post-migration: `app_metadata.role` claim consumed by RLS
  and by `auth.me()`.
- `AuthContext` is backend-aware: on Supabase it relies on the persisted session
  and skips the Base44 "public settings" bootstrap probe.
- Authorization post-migration is enforced by Postgres **Row-Level Security**:
  owner-scoped policies on PHI tables; read-all/admin-write on reference tables.

---

## 6. Integrations (backend services)

| Capability | Base44 | Supabase target |
|---|---|---|
| LLM | `Core.InvokeLLM` | `invoke-llm` edge fn (Anthropic; grounding + key server-side; JSON schema → tool-use) |
| File upload | `Core.UploadFile` | Storage `uploads` bucket |
| File extraction | `Core.ExtractDataFromUploadedFile` | `extract-file` edge fn (Claude + document/image block) |
| Email | `Core.SendEmail` | `send-email` edge fn (Resend) |
| Image gen | `Core.GenerateImage` | `generate-image` edge fn (Gemini → Storage) |
| Server fn | `functions.invoke('dailyClinicalSummary')` | `dailyClinicalSummary` edge fn (+ pg_cron) |

All edge functions live in `supabase/functions/` and are already implemented.

---

## 7. AI subsystem design

```
feature ──▶ invokeGrounded()  ─┬─ cache hit ─▶ return cached (offline-capable)
 (or ai.invoke)                │
                               └─ miss ─▶ client.js ─▶ InvokeLLM
                                                        │
                          Base44: grounding wrapped client-side
                          Supabase: grounding enforced in invoke-llm edge fn
```

- **Grounding** (`GROUNDING_RULES`): guideline-only statements, mandatory
  source+year citation, explicit "Not established…" instead of gap-filling, ban
  on invented doses/numbers, Indian-context preference, "Sources:" footer.
- **Cost controls:** relevant-guideline selection (send ~5, not the whole
  library); 7-day response cache; most features are rule-based and never call
  an LLM.
- **Conversation:** all chat surfaces (AI Assistant page, floating assistant,
  DataChatbot, GlobalSearch Ask-AI) send recent turns and expose a follow-up
  input. Patient-specific chat is never cached across patients.

---

## 8. Frontend structure

```
src/
  api/          client.js (facade), base44Client.js, supabaseClient.js
  pages/        129 route components (App.jsx wires routes)
  components/
    engines/    40+ CIEE engines (pure logic)
    drugs/      formulary, dosing, indication pickers, eculizumab
    clinic/     patient/visit/prescription/labs workflow + AI generators
    research/   projects, manuscript studio, literature monitor
    hub/, nav/  navigation, quick access, global search
    ui/         shadcn primitives
  lib/
    ai/         groundingRules.js, groundedLLM.js
    offline/    entitySnapshot.js
    AuthContext.jsx, query-client, app-params
  Layout.jsx    shell (nav, offline banner, floating assistant)
```

State: React Query for all server reads/writes (cache, retries, invalidation);
Context for cross-cutting patient + auth state; localStorage for preferences,
recents, favorites, AI cache, offline snapshots.

---

## 9. PWA & offline design

- `vite-plugin-pwa` (autoUpdate) generates the service worker; precaches all
  build assets (JS/CSS/HTML/SVG/fonts) with a raised size cap for the large
  bundle; `navigateFallback` to `index.html` for SPA routing offline.
- Runtime NetworkFirst cache for API GETs (30-day fallback).
- Entity-snapshot layer covers SDK POST-style queries the SW cannot cache.
- Manifest: standalone display, teal theme, installable icons.

---

## 10. Build, environments, deployment

- Build: `npm run build` (Vite). Output `dist/` (service worker + manifest emitted).
- Env vars: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (unset → Base44).
  Edge-function secrets set via `supabase secrets set` (never in frontend env).
- Hosting target: Vercel (SPA + CDN). Base44 plugin remains harmless until
  decommission (no code path runs when Supabase env is set).
- Rollback: unset the two env vars and redeploy → back on Base44.

---

## 11. Known technical debt & planned work

| Item | Plan |
|---|---|
| Bundle ~8.8 MB single chunk | Route-level `React.lazy` code splitting (R3) |
| Duplicate engines (Hyperkalemia, TubularDisorder(s), Alport/HNF1B, HTN pairs) | De-duplicate/merge (R3) |
| CIEE coverage gaps | Add UTI/VUR, HUS/TMA, neonatal AKI, acute PD, poisoning (R3) |
| `GenerateImage` usage | Single call site (patient infographic); Gemini fn or drop (confirm in migration) |
| Empty `catch {}` blocks | Audited; add user-facing errors where they matter |
| i18n | Hindi/regional patient-education output (R3) |

---

## 12. Testing & QA strategy

- **Dosing correctness:** audited sample against source guidelines; the FR-1..FR-10
  acceptance table in the PRD is the regression checklist.
- **Offline:** airplane-mode pass over engines/formulary/calculators after first load.
- **AI grounding:** sampled responses must carry citations + "Sources:"; audited
  hallucination rate.
- **Migration parity:** the full feature matrix in `MIGRATION.md` Step E, run on
  desktop + low-end Android, on staging (Supabase) vs production (Base44).
- **Build gate:** `npm run build` must pass (exit 0) before any push.

---

## 13. Security & privacy

- PHI owner-scoped via RLS (post-migration); reference data read-all.
- Service-role key only in import scripts + edge functions, never frontend.
- LLM API key server-side only (post-migration edge function).
- Patient data excluded from the shared AI response cache.
- Migration exports contain PHI → gitignored, transferred only encrypted.

---

## 14. References
- `docs/PRD.md` — product requirements
- `MIGRATION.md` — step-by-step Base44 → Supabase/Vercel runbook
- `src/api/client.js` — the platform facade (start here to understand data flow)
- `supabase/functions/` — edge function implementations
