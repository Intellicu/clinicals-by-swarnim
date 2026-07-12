# CliniCals — Product Requirements Document (PRD)

**Product:** CliniCals by Swarnim — Pediatric Nephrology Clinical Companion
**Document owner:** Product
**Status:** Living document
**Last updated:** 2026-07

---

## 1. Overview

### 1.1 Problem
Pediatric nephrology is a specialty with complex, weight-and-BSA-based dosing,
fast-moving guidelines (KDIGO, IPNA, ISPN, IAP), and rare diseases that
generalists rarely see. In low-resource settings like India, a pediatrician,
resident, or nephrologist at the bedside often has no reliable, fast, offline
reference — leading to dosing errors, missed diagnoses, and inconsistent care.

### 1.2 Solution
CliniCals is a mobile-first, offline-capable clinical companion that puts
guideline-grounded decision support, a pediatric nephrology drug formulary with
automatic dose calculation, 40+ diagnostic/management "engines," calculators,
and an evidence-grounded AI assistant into one installable app (PWA).

### 1.3 Vision
The default bedside reference for pediatric kidney care in India and comparable
settings — trusted because every recommendation is traceable to a guideline,
usable because it works without a network, and safe because it refuses to guess.

---

## 2. Goals & non-goals

### 2.1 Goals
- G1: Correct, guideline-cited dosing for every drug in the formulary, with
  patient-specific calculation (weight, BSA, eGFR).
- G2: Full core functionality (engines, formulary, calculators, guidelines)
  **with zero connectivity** after first load.
- G3: AI answers that are strictly grounded in guidelines/verified sources —
  no hallucination — with follow-up conversation everywhere a chat exists.
- G4: Minimal LLM/token cost so the app is economically viable at scale in
  low-resource markets.
- G5: A clinic workflow (patients, visits, prescriptions, labs) usable by a
  solo practitioner or a small unit.
- G6: Platform independence — no lock-in to any single BaaS vendor.

### 2.2 Non-goals
- Not an EHR/HIS replacement or a billing/insurance system of record.
- Not a patient-facing self-diagnosis app (clinician tool; patients only
  receive generated education material via their clinician).
- Not a teleconsultation platform.

---

## 3. Target users & personas

| Persona | Context | Primary needs |
|---|---|---|
| **Pediatric resident** | Ward/OPD, learning, time-pressured | Fast dose lookup, staging/diagnostic engines, "am I missing something" checks |
| **General pediatrician** | District hospital / clinic, no nephrologist nearby | Recognition of red flags, when-to-refer, safe first-line management |
| **Pediatric nephrologist** | Tertiary centre or clinic | Rapid reference, rare-disease pathways, prescription building, patient tracking |
| **Clinic admin (same nephrologist)** | Managing the practice | Patients, appointments, formulary curation |

All personas share: intermittent connectivity, Android mid-range devices,
cost-sensitivity, and a need for **trustworthy** (not merely plausible) answers.

---

## 4. Product scope — feature areas

### 4.1 Drugs & Dosing (flagship)
- Pediatric nephrology formulary (browse by class, search, favorites, recents).
- Full colored monograph per drug (indications, dose, renal/dialysis
  adjustment, interactions, monitoring, cost/availability incl. Jan Aushadhi/PMJAY).
- **Indication-first prescribing:** the user picks the clinical indication; the
  app calculates the exact dose from weight/BSA, applies max caps, honors
  per-day vs per-dose semantics, and shows a full calculation trail.
- Multi-indication drugs (tacrolimus, cyclosporine, rituximab, MMF, eculizumab…)
  are blocked from single-dose fallback and routed through the indication picker.
- Dedicated Eculizumab (aHUS) module with weight-band dosing, dilution/prep,
  supplemental dosing for plasma exchange/FFP, vaccination and monitoring.
- Prescription builder: multi-drug Rx, interaction checking, printable output,
  saved templates.
- **Requirement:** no dose is ever shown without either a calculation basis or
  an explicit "select indication / see monograph" state. Ranges must display as
  ranges; units must never be assumed.

### 4.2 Clinical Intelligence Engines (CIEE) — 40+
Rule-based, step-through diagnostic/management engines (AKI, CKD, nephrotic,
RPGN, stones, tubular disorders, CAKUT, PUV, HTN, electrolytes/acid-base, rickets,
cystic kidney, Alport/HNF1B, oxaluria, cystinosis, Fabry, oncology, bladder/UDS,
febrile UTI, and more). **All pure frontend logic — must run fully offline.**

### 4.3 Calculators
CKiD/Schwartz eGFR, FENa/FEMg/FEUrea, BP percentiles (AAP 2017), anthropometry
(WHO z-scores), plasmapheresis, fluid, anion gap, and others. Must validate
input (no NaN/Infinity) and run offline.

### 4.4 Guidelines & pathways
Searchable guideline library and interactive clinical pathways, editable by
admins, viewable offline.

### 4.5 AI assistant (grounded)
- Surfaces: dedicated AI Assistant page, floating assistant, GlobalSearch
  "Ask AI," and embedded generators (treatment plan, scribe, differential,
  lab analyzer, patient education, manuscript studio).
- **Every** response is grounded (guideline-only, cite source+year, refuse to
  invent, "Sources:" line). Grounding is enforced centrally so no surface can
  bypass it.
- **Every** chat surface supports follow-up questions with remembered context.
- Responses cached (7-day) to cut cost and replay offline.

### 4.6 Clinic workflow
Patients, appointments, visits/encounters, digital prescription pad, lab
results, documents, growth tracking, monitoring plans/alerts, billing.

### 4.7 Research & education
Research projects, manuscript studio, literature monitor, teaching modules,
learning paths, student progress.

### 4.8 Platform capabilities
- Installable PWA, offline shell + offline reference data.
- Auth (email/password + OAuth), roles (user/admin).
- Global search across drugs, guidelines, pathways, tools.

---

## 5. Functional requirements (selected, testable)

| ID | Requirement | Acceptance |
|---|---|---|
| FR-1 | Dose calculation parses en-dash ranges | "0.5–2 mg/kg/day" shows a range, not a flat 2 |
| FR-2 | Per-day rules divided by frequency | 2 mg/kg/day BD → per-dose = 1 mg/kg equivalent, daily total shown |
| FR-3 | Units never assumed mg | mcg/kg rule displays and prescribes in mcg |
| FR-4 | Multi-indication drugs blocked from fallback dose | Dose tab shows redirect to Indications |
| FR-5 | Renal flag not raised on "no adjustment needed" text | Prednisolone shows no false renal warning |
| FR-6 | AI answers grounded & cited | Response contains guideline citations + "Sources:" line |
| FR-7 | AI chat follow-ups keep context | 2nd question referencing 1st is answered correctly |
| FR-8 | Engines/formulary/calculators work offline | Airplane-mode test passes after first load |
| FR-9 | Corrupt localStorage never white-screens app | Malformed patient data self-heals |
| FR-10 | Calculators reject invalid input | Zero/negative/NaN → validation message, not NaN/Infinity |

(Full defect history and their fixes are in the repo commit log; the code-review
findings list is the canonical QA backlog.)

---

## 6. Non-functional requirements

- **NFR-1 Offline-first:** all non-AI features functional with zero network
  after first load (PWA precache + offline entity snapshots).
- **NFR-2 Performance:** usable on mid-range Android over 3G; target first-load
  reduction via route-level code splitting (current bundle ~8.8 MB — see design doc).
- **NFR-3 Safety:** no ungrounded clinical output; every dose traceable.
- **NFR-4 Cost:** LLM calls minimized (relevant-context selection + response
  cache); most features never call an LLM.
- **NFR-5 Privacy:** PHI stays scoped to its owner (RLS post-migration); patient
  data never cached in the shared AI cache.
- **NFR-6 Portability:** all platform access behind one facade; no vendor lock-in.
- **NFR-7 Accessibility & i18n:** mobile-first responsive; roadmap for
  Hindi/regional-language patient-education output.

---

## 7. Success metrics

| Metric | Target |
|---|---|
| Dose-calculation correctness (audited sample) | 100% match to guideline |
| Offline feature availability | 100% of engines/calculators/formulary |
| AI answers with valid citations | ≥ 95% (audited) |
| AI hallucination rate (audited) | ~0% material errors |
| Median LLM cost / active user / month | Minimized; majority of sessions = 0 LLM calls |
| First-contentful-paint on 3G mid-range Android | < 4 s after PWA install |
| Weekly active clinicians | Growth target set at launch |

---

## 8. Release roadmap

- **R1 (done):** Core formulary + dosing correctness fixes, 40+ engines,
  calculators, grounded AI with follow-ups + cache, PWA offline, tab/UX fixes.
- **R2 (in progress):** Base44 → Supabase/Vercel migration (see MIGRATION.md) —
  no user-visible change, removes vendor lock-in.
- **R3 (planned):** route-level code splitting; Hindi/regional patient education;
  Jan Aushadhi cost surfacing everywhere; CIEE coverage gaps (UTI/VUR, HUS/TMA,
  neonatal AKI, acute PD prescription, poisoning); engine de-duplication;
  printable one-pager per engine output for referrals.
- **R4 (future):** multi-clinic/tenant, analytics dashboard, richer teaching.

---

## 9. Risks & assumptions

| Risk | Mitigation |
|---|---|
| Clinical inaccuracy erodes trust | Grounding + citation enforced centrally; dosing audited; refuse-to-guess |
| Connectivity gaps in target market | Offline-first PWA + local reference snapshots |
| LLM cost at scale | Context minimization + cache; keep features rule-based where possible |
| Vendor lock-in (Base44) | Facade + migration to Supabase/Vercel |
| Regulatory positioning | Positioned as clinician reference/decision-support with disclaimers, not autonomous diagnosis |

**Assumptions:** users are licensed clinicians; the app supports (never
replaces) clinical judgment; guideline content is curated/reviewed by qualified
pediatric nephrologists before publication.
