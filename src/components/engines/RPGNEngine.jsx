/**
 * RPGN / Crescentic GN Intelligence Engine
 * Full LEILA-style: Immunoprofile → Biopsy → Pattern → Disease-Specific Treatment
 */
import React, { useState } from "react";
import {
  EngineHeader, QuestionCard, MultiChoiceCard, PathwayTrail,
  DifferentialTable, InvestigationPanel, MonitoringPanel,
  GuidelineSource, ResultHeader, ReasoningPanel, TreatmentPanel, EmergencyBanner
} from "./EngineShell";
import { ArrowRight, AlertTriangle } from "lucide-react";

const INITIAL = { step: 0, answers: {}, trail: ["AKI + Haematuria + Proteinuria"] };

export default function RPGNEngine() {
  const [state, setState] = useState(INITIAL);
  const { step, answers, trail } = state;

  const ans = (key, val, label) => setState(s => ({
    step: s.step + 1, answers: { ...s.answers, [key]: val }, trail: [...s.trail, label]
  }));
  const reset = () => setState(INITIAL);

  // ── Step 0: Confirm RPGN criteria ─────────────────────────────────────────
  if (step === 0) return (
    <div className="space-y-3">
      <EngineHeader title="RPGN / Crescentic GN Engine" subtitle="Immunoprofile → Biopsy → Pattern → Treatment" color="red" onReset={reset} step={1} totalSteps={6} />
      <EmergencyBanner text="RPGN = Nephrology Emergency. eGFR may be irreversibly lost within days. Biopsy within 24–48h. Pulse steroids IMMEDIATELY." />
      <div className="bg-red-50 border border-red-200 rounded-xl p-3 space-y-1.5 text-xs">
        <p className="font-bold text-red-800">RPGN Diagnostic Criteria (ALL should be present):</p>
        {[
          "AKI: creatinine rise >50% in ≤3 months (or days)",
          "Active urine sediment: haematuria ± RBC casts ± proteinuria",
          "Biopsy: crescents in ≥50% glomeruli (crescentic GN)",
          "No other cause of rapid GFR loss (no pre-renal, no obstruction)"
        ].map((c, i) => <div key={i} className="flex items-start gap-1.5"><ArrowRight className="w-3 h-3 text-red-500 flex-shrink-0 mt-0.5" /><span className="text-red-900">{c}</span></div>)}
      </div>
      <QuestionCard
        question="Does the patient meet RPGN criteria? (AKI + haematuria/casts + rapid GFR decline)"
        onYes={() => ans("rpgn", true, "RPGN Criteria Met")}
        onNo={() => ans("rpgn", false, "RPGN Not Confirmed")}
        color="red"
      />
    </div>
  );

  if (step === 1 && answers.rpgn === false) return (
    <div className="space-y-3">
      <EngineHeader title="RPGN Engine" color="red" subtitle="Alternative AKI diagnosis" onReset={reset} />
      <ResultHeader diagnosis="RPGN criteria not met — consider AKI pathway, glomerulonephritis, or vasculitis without rapid decline" risk="yellow" />
      <InvestigationPanel mustOrder={["Renal biopsy if active sediment + proteinuria + unexplained AKI", "ANCA, ANA, anti-GBM, C3/C4 panel", "USG kidneys"]} />
    </div>
  );

  // ── Step 1: Immediate actions + bloods ─────────────────────────────────────
  if (step === 1) return (
    <div className="space-y-3">
      <EngineHeader title="RPGN Engine" color="red" subtitle="Step 2: Immunological Profile" onReset={reset} step={2} totalSteps={6} />
      <PathwayTrail steps={trail} />
      <div className="bg-red-50 border border-red-300 rounded-xl p-3 text-xs font-semibold text-red-800">
        ⚡ IMMEDIATE ACTIONS (before immunology results):
        <div className="font-normal text-red-700 mt-1 space-y-0.5">
          {["Pulse methylprednisolone 30 mg/kg (max 1g) IV × 3 doses over 3 days — START NOW",
            "RPGN panel STAT: ANCA (MPO/PR3), anti-GBM, ANA, C3, C4, anti-dsDNA",
            "Arrange urgent renal biopsy (24–48h) with LM + IF + EM",
            "Urine microscopy (RBC casts confirm glomerular origin)",
            "Nephrology ICU: fluid balance, creatinine every 12h",
            "AVOID nephrotoxins, NSAIDs, contrast"
          ].map((a, i) => <div key={i} className="flex items-start gap-1.5 mt-0.5"><span className="text-red-400 font-bold flex-shrink-0">→</span>{a}</div>)}
        </div>
      </div>
      <MultiChoiceCard
        question="What does the immunological serology show?"
        detail="This determines the PRIMARY treatment pathway"
        color="red"
        options={[
          { label: "ANCA positive (c-ANCA/PR3 or p-ANCA/MPO)", onSelect: () => ans("immuno", "anca", "ANCA Positive") },
          { label: "Anti-GBM antibody positive", onSelect: () => ans("immuno", "anti_gbm", "Anti-GBM Positive") },
          { label: "ANA/anti-dsDNA positive (low C3/C4)", onSelect: () => ans("immuno", "ana", "ANA/Lupus Pattern") },
          { label: "Low C3, C4 normal (C3 dominant — AP pathway)", onSelect: () => ans("immuno", "c3", "Low C3 — C3G Pattern") },
          { label: "All negative (pauci-immune without ANCA)", onSelect: () => ans("immuno", "pauci", "Triple Negative / Pauci-immune") },
          { label: "Results pending / not yet available", onSelect: () => ans("immuno", "pending", "Serology Pending") },
        ]}
      />
    </div>
  );

  // ── Pending → use biopsy IF ────────────────────────────────────────────────
  if (step === 2 && answers.immuno === "pending") return (
    <div className="space-y-3">
      <EngineHeader title="RPGN: Serology Pending" color="red" subtitle="Use biopsy IF pattern" onReset={reset} />
      <PathwayTrail steps={trail} />
      <EmergencyBanner text="Do NOT delay pulse steroids pending serology. Start methylprednisolone NOW." />
      <TreatmentPanel title="Algorithm while awaiting results" items={[
        "Continue pulse methylprednisolone 30 mg/kg × 3 days",
        "Urgent biopsy IF pattern determines treatment:",
        "→ LINEAR IgG: Anti-GBM disease → Add PLEX immediately",
        "→ GRANULAR Ig+C3: Immune-complex (Lupus/C3G/IgAN) → treat by serology",
        "→ PAUCI-IMMUNE (no deposits): ANCA vasculitis → RTX or CYC",
        "→ % Crescents: if >70% + anuric → PLEX regardless of pattern"
      ]} />
    </div>
  );

  // ── Step 2: Biopsy crescents ───────────────────────────────────────────────
  if (step === 2) return (
    <div className="space-y-3">
      <EngineHeader title="RPGN Engine" color="red" subtitle="Step 3: Biopsy / Crescent %" onReset={reset} step={3} totalSteps={6} />
      <PathwayTrail steps={trail} />
      <MultiChoiceCard
        question="What does renal biopsy show (% crescents)?"
        detail="% crescents is a major prognostic factor for renal survival"
        color="red"
        options={[
          { label: "<50% crescents (better prognosis)", onSelect: () => ans("crescents", "low", "<50% Crescents") },
          { label: "50–70% crescents", onSelect: () => ans("crescents", "moderate", "50–70% Crescents") },
          { label: ">70% crescents / global crescent involvement", onSelect: () => ans("crescents", "high", ">70% Crescents") },
          { label: "Biopsy not yet available — proceeding clinically", onSelect: () => ans("crescents", "na", "Biopsy Pending") },
        ]}
      />
    </div>
  );

  // ── ANCA pathway ────────────────────────────────────────────────────────────
  if (answers.immuno === "anca") return (
    <div className="space-y-3">
      <EngineHeader title="ANCA-Associated Vasculitis (RPGN)" color="red" subtitle="GPA · MPA · RTX vs CYC Decision" onReset={reset} />
      <PathwayTrail steps={[...trail, answers.crescents ? `${answers.crescents} Crescents` : "", "ANCA → AAV Treatment"]} />
      <ResultHeader diagnosis="ANCA-Associated Vasculitis (AAV) — Crescentic RPGN" risk="red" urgent />
      <DifferentialTable rows={[
        { dx: "GPA (Granulomatosis with Polyangiitis — c-ANCA/PR3)", pct: answers.anca_type === "canca" ? 85 : 40, label: "c-ANCA/PR3" },
        { dx: "MPA (Microscopic Polyangiitis — p-ANCA/MPO)", pct: answers.anca_type === "panca" ? 85 : 40, label: "p-ANCA/MPO" },
        { dx: "Double seropositive (ANCA + anti-GBM)", pct: 5, label: "Aggressive — PLEX urgently" },
      ]} />
      <TreatmentPanel title="AAV Induction (EULAR/ERA-EDTA 2022 · ACR/EULAR 2022)" items={[
        "Pulse methylprednisolone 500–1000mg (30 mg/kg max 1g) × 3 days — already started",
        "Then prednisolone 1 mg/kg/day (max 60 mg) tapering over 4–6 months",
        "RITUXIMAB 375 mg/m² × 4 weekly doses (preferred for PR3/GPA and ANCA relapse — RAVE trial) OR",
        "IV Cyclophosphamide (preferred for: severe DAH, MPO/MPA, CYC not contraindicated): 0.5–0.75 g/m² monthly × 6 pulses",
        answers.crescents === "high" ? "PLEX (plasma exchange): ≥70% crescents + anuric — 1.5× plasma volume × 7–10 sessions (PEXIVAS trial modified use)" : "",
        answers.crescents !== "low" ? "PLEX if: Cr >500 μmol/L, dialysis-dependent, or DAH (alveolar haemorrhage)" : "",
        "Mesna with CYC (bladder protection); PCP prophylaxis (cotrimoxazole DS 3×/week)",
      ].filter(Boolean)} />
      <TreatmentPanel title="AAV Maintenance (18–24 months)" items={[
        "Rituximab 500 mg every 6 months × 2 years (preferred — MAINRITSAN trial)",
        "OR Azathioprine 2 mg/kg/day if RTX not available",
        "Prednisolone tapering to 0–5 mg/day by 12 months",
        "ANCA + eGFR monitoring: recurrence defined as ANCA re-rise + clinical worsening"
      ]} />
      <InvestigationPanel
        mustOrder={["ANCA (MPO/PR3 ELISA + ANCA titer)", "Chest XR + HRCT (pulmonary involvement)", "ENT assessment (GPA: sinusitis, nasal saddle)", "Urinalysis + RBC casts"]}
        shouldOrder={["CXR for DAH (diffuse haemorrhage)", "PFTs + KCO (DAH: elevated KCO)", "HBsAg (RTX contraindicated if active HBV)"]}
        advanced={["Bone marrow (if CYC planned — neutrophil reserve)", "Anti-GBM Ab (ANCA/anti-GBM overlap)"]}
      />
      <MonitoringPanel items={[
        "ANCA titer monthly during induction",
        "eGFR + creatinine weekly initially, then monthly",
        "FBC weekly during CYC (hold if neutrophils <3)",
        "Annual HRCT chest",
        "Relapse surveillance: ANCA + symptoms + eGFR every 3 months for 5 years"
      ]} />
      <GuidelineSource text="EULAR/ERA-EDTA 2022 AAV Guidelines · RAVE trial (RTX vs CYC, Stone JH NEJM 2010) · MAINRITSAN trial · PEXIVAS trial 2020" />
    </div>
  );

  // ── Anti-GBM pathway ────────────────────────────────────────────────────────
  if (answers.immuno === "anti_gbm") return (
    <div className="space-y-3">
      <EngineHeader title="Anti-GBM Disease (Goodpasture)" color="red" subtitle="Linear IgG → Daily PLEX mandatory" onReset={reset} />
      <PathwayTrail steps={[...trail, "Anti-GBM Positive → Goodpasture Protocol"]} />
      <EmergencyBanner text="Anti-GBM disease: PLEX DAILY × 14 days. This is a medical emergency. Do not wait." />
      <ResultHeader diagnosis="Anti-GBM Disease (Goodpasture Syndrome)" risk="red" urgent />
      <ReasoningPanel reasons={[
        "Linear IgG deposition on biopsy IF confirms anti-GBM disease",
        "Anti-GBM antibodies directly attack type IV collagen (GBM + alveolar BM)",
        "Pulmonary involvement (haemorrhage) when smoking/toxin exposure damages alveolar BM",
        "Daily PLEX removes pathogenic anti-GBM antibodies from circulation",
        "CYC prevents new antibody production",
        "Prognosis depends on creatinine at presentation: if >500 μmol/L + dialysis-dependent → poor renal outcome"
      ]} />
      <TreatmentPanel title="Anti-GBM Protocol" items={[
        "PLEX: 1.5× plasma volume with 5% albumin daily × 14 days (or until anti-GBM Ab undetectable)",
        "When DAH present: use FFP for last 30–40 min of each PLEX session",
        "Pulse methylprednisolone 1g × 3 days → prednisolone 1 mg/kg/day tapering over 6 months",
        "IV Cyclophosphamide 2 mg/kg/day PO (adjust for AKI) OR IV CYC 0.5 g/m² monthly",
        "Duration: CYC × 3 months then switch to azathioprine for maintenance",
        "Monitor: anti-GBM antibody titre — aim undetectable by end of PLEX course",
        "TRANSPLANT: wait 6–12 months after anti-GBM Ab undetectable (recurrence in graft if Ab persists)"
      ]} />
      <InvestigationPanel
        mustOrder={["Anti-GBM antibody (ELISA) — serial every 2 weeks during treatment", "ANCA panel (10–40% double positive — overlap)", "HRCT chest + KCO (alveolar haemorrhage)", "CXR daily if DAH"]}
        shouldOrder={["Renal biopsy: linear IgG on IF (diagnostic)", "PFTs (pre-PLEX baseline + monitoring)", "Smoking cessation counselling (alveolar BM damage risk)"]}
      />
      <MonitoringPanel items={[
        "Anti-GBM Ab titer every 2 weeks (during PLEX), then monthly until undetectable",
        "eGFR + creatinine every 48h during acute phase",
        "Respiratory function + SpO2 daily (DAH monitoring)",
        "FBC weekly (CYC myelosuppression)"
      ]} />
      <GuidelineSource text="KDIGO 2021 GN guideline · Levy JB Annals Int Med 2001 · PLEX in Anti-GBM: Madore 1996 · Goodpasture's: Lockwood NEJM 1976" />
    </div>
  );

  // ── Lupus Nephritis RPGN ────────────────────────────────────────────────────
  if (answers.immuno === "ana") return (
    <div className="space-y-3">
      <EngineHeader title="Lupus Nephritis — Crescentic (Class IV)" color="red" subtitle="Immune-complex GN with crescents" onReset={reset} />
      <PathwayTrail steps={[...trail, "ANA/Lupus → Crescentic LN"]} />
      <ResultHeader diagnosis="Lupus Nephritis — Crescentic (ISN Class III/IV ± V)" risk="red" urgent />
      <TreatmentPanel title="Induction (ACR/EULAR 2019 + KDIGO 2021)" items={[
        "Pulse methylprednisolone 30 mg/kg (max 1g) × 3 days → prednisolone 1 mg/kg/day",
        "MMF 1200 mg/m²/day or CYC IV (severe crescentic with ≥50% glomeruli) + low-dose prednisolone",
        "Hydroxychloroquine 6.5 mg/kg/day (max 400 mg) — continue throughout",
        "PLEX if: rapidly progressive AKI + >50% crescents + thrombocytopenia — consider in catastrophic APS",
        "Voclosporin or belimumab (add-on IS if available)"
      ]} />
      <InvestigationPanel
        mustOrder={["ANA, anti-dsDNA, complement C3/C4/CH50", "APLA panel (anticardiolipin, anti-β2GPI, LAC)", "CBC, LFT, RFT", "Biopsy: ISN/RPS classification"]}
        shouldOrder={["Lupus anticoagulant (APS)", "Anti-Sm, anti-Ro/La, anti-RNP"]}
      />
      <MonitoringPanel items={[
        "Anti-dsDNA + C3/C4 every 3 months",
        "eGFR + UPCR monthly",
        "Ophthalmology annually (HCQ retinopathy)",
        "Annual DEXA (steroid osteoporosis)"
      ]} />
    </div>
  );

  // ── C3 Glomerulopathy / MPGN ────────────────────────────────────────────────
  if (answers.immuno === "c3") return (
    <div className="space-y-3">
      <EngineHeader title="C3 Glomerulopathy with RPGN" color="cyan" subtitle="Complement AP pathway — low C3 + crescents" onReset={reset} />
      <PathwayTrail steps={[...trail, "Low C3 → C3G/MPGN Pattern"]} />
      <ResultHeader diagnosis="C3 Glomerulopathy (C3GN / DDD / MPGN) with Crescentic Transformation" risk="red" urgent />
      <TreatmentPanel items={[
        "Pulse methylprednisolone × 3 days → prednisolone",
        "MMF 1200 mg/m²/day for active C3G with crescents + declining GFR",
        "Eculizumab: consider for: rapid progression, C3 NeF positive, CFH/C3 mutation-positive, refractory to MMF",
        "PLEX if anti-CFH Ab titre >150 units (removes complement-activating autoantibodies)",
        "Biopsy classification: C3G (C3-dominant IF) vs DDD (intramembranous deposits on EM)"
      ]} />
      <InvestigationPanel
        mustOrder={["C3, C4, CH50, AH50", "Anti-CFH Ab (ELISA)", "C3 nephritic factor (C3 NeF)", "Genetic panel: CFH, CFI, MCP/CD46, C3, CFB, CFHR1/3/5"]}
        shouldOrder={["Store serum pre-treatment", "Complement proteomics"]}
      />
    </div>
  );

  // ── Pauci-immune without ANCA ───────────────────────────────────────────────
  if (answers.immuno === "pauci") return (
    <div className="space-y-3">
      <EngineHeader title="Pauci-Immune RPGN (ANCA Negative)" color="red" subtitle="Rare — ANCA-negative vasculitis or missed serology" onReset={reset} />
      <PathwayTrail steps={[...trail, "Pauci-immune → ANCA-Negative AAV"]} />
      <ResultHeader diagnosis="Pauci-Immune Crescentic GN — ANCA-Negative" risk="red" urgent />
      <DifferentialTable rows={[
        { dx: "ANCA-negative vasculitis (GPA/MPA variant — 10–20% are ANCA-)", pct: 60, label: "Most Likely" },
        { dx: "Anti-GBM missed (low titre, early) — repeat test", pct: 20, label: "Repeat anti-GBM" },
        { dx: "Anti-GBM + ANCA double seropositive (seroconversion lag)", pct: 10, label: "Monitor closely" },
        { dx: "Drug-induced (hydralazine, propylthiouracil, minocycline)", pct: 10, label: "Medication review" },
      ]} />
      <TreatmentPanel items={[
        "Treat as ANCA-positive AAV pending repeat serology",
        "Pulse methylprednisolone → prednisolone + CYC or RTX",
        "Repeat anti-GBM and ANCA at 2 weeks (early disease may be negative initially)",
        "Biopsy IF: pauci-immune = no deposits — confirms vasculitic aetiology",
        "Drug history essential — stop offending drug if drug-induced ANCA"
      ]} />
    </div>
  );

  return (
    <div className="space-y-3">
      <EngineHeader title="RPGN Engine" color="red" subtitle="Assessment in progress" onReset={reset} />
      <PathwayTrail steps={trail} />
      <p className="text-sm text-slate-500 text-center py-4">Continue selecting answers to reach the treatment pathway.</p>
    </div>
  );
}