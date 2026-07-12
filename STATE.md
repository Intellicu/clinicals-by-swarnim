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
- [ ] M4 Hindi/regional language in patient education
- [ ] M5 final verify + push

## Rules worth remembering
- Base44 deploys from `main`; every milestone must end `npm run build` clean
  before push.
- Never let a dose render without unit + basis; ranges stay ranges (PRD FR-1..4).
- All LLM calls already grounded centrally — new features must call through
  `@/api/client` (facade) and never import SDKs directly.
- Engines must be pure-frontend (offline requirement, PRD 4.2).
