# Build State — CliniCals (PRD execution log)

## Baseline (M1) — verified
- `npm run build` passes (exit 0). PWA service worker + manifest emitted.
- PRD R1 scope: DONE (formulary + dosing correctness, 40+ engines, calculators,
  grounded AI with follow-ups + cache, PWA offline, clinic/research modules).
- PRD R2 scope: CODE DONE (Supabase adapter, edge functions, migration scripts,
  runbook) — awaits live Supabase project to execute.
- Bundle: **9.16 MB single JS chunk** — NFR-2 violation, target of M2.
- Engine wiring pattern learned: component in `src/components/engines/`,
  dispatch line in `PathwayRenderer.jsx` (`if (id === "x-engine") return <X/>`),
  discovery card in `HubNephrologyPathways.jsx` PATHWAYS array.

## Milestones
- [x] M1 baseline + STATE.md
- [x] M2 route-level code splitting (NFR-2) — 9.16MB → 0.99MB main chunk (89%↓), 262 lazy chunks, build clean, SW intact
- [x] M3 CIEE gap engines — HUSTMAEngine, NeonatalAKIEngine, AcutePDPrescriptionEngine built (pure-frontend, guideline-cited), wired into PathwayRenderer dispatch + HubNephrologyPathways cards + GlobalSearch. Build clean.
- [x] M4 Hindi/regional patient education — generator already supported 6 languages (English/Hindi/Tamil/Telugu/Bengali/Marathi) but was orphaned; mounted it as an 'AI Generator' tab in PatientEducationHub and made diagnosis a self-contained input when used standalone. Build clean.
- [x] M5 final verify + push

## Rules worth remembering
- Base44 deploys from `main`; every milestone must end `npm run build` clean
  before push.
- Never let a dose render without unit + basis; ranges stay ranges (PRD FR-1..4).
- All LLM calls already grounded centrally — new features must call through
  `@/api/client` (facade) and never import SDKs directly.
- Engines must be pure-frontend (offline requirement, PRD 4.2).

## Findings
- PatientEducationGenerator was fully built (multilingual, audio, infographic) but never mounted — a recurring pattern in this codebase (orphaned components). Worth an audit sweep for other unmounted features.
- R3 remaining (not done this run, lower priority): engine de-duplication (Hyperkalemia/TubularDisorder(s)/Alport-HNF1B/HTN pairs), UTI/VUR + poisoning engines, printable one-pager per engine, Jan Aushadhi cost surfacing everywhere.
