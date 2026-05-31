/**
 * Nephrotic Syndrome Intelligence Engine
 * Full LEILA-style: First episode → relapse → FRNS → SDNS → SRNS → Congenital
 */
import React, { useState } from "react";
import {
  EngineHeader, QuestionCard, MultiChoiceCard, PathwayTrail,
  DifferentialTable, InvestigationPanel, MonitoringPanel,
  GuidelineSource, RiskBadge, ResultHeader, ReasoningPanel, TreatmentPanel, EmergencyBanner
} from "./EngineShell";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, ArrowRight, CheckCircle2 } from "lucide-react";

const INITIAL = { step: 0, answers: {}, trail: ["Edema / Proteinuria Query"] };

export default function NephroticSyndromeEngine() {
  const [state, setState] = useState(INITIAL);
  const { step, answers, trail } = state;

  const ans = (key, val, label) => setState(s => ({
    step: s.step + 1,
    answers: { ...s.answers, [key]: val },
    trail: [...s.trail, label]
  }));
  const reset = () => setState(INITIAL);

  // ── Step 0: Confirm nephrotic syndrome ────────────────────────────────────
  if (step === 0) return (
    <div className="space-y-3">
      <EngineHeader title="Nephrotic Syndrome Engine" subtitle="First Episode · Relapse · FRNS · SDNS · SRNS · Congenital" color="violet" onReset={reset} step={1} totalSteps={8} />
      <div className="bg-violet-50 border border-violet-200 rounded-xl p-3 space-y-1">
        <p className="text-xs font-bold text-violet-800">Diagnostic Criteria (must satisfy all 3):</p>
        {["Proteinuria: UPCR ≥2 mg/mg or dipstick ≥3+", "Hypoalbuminaemia: serum albumin <2.5 g/dL", "Oedema: periorbital / dependent / anasarca"].map((c, i) => (
          <div key={i} className="flex items-start gap-1.5 text-xs text-violet-900"><ArrowRight className="w-3 h-3 text-violet-500 flex-shrink-0 mt-0.5" />{c}</div>
        ))}
      </div>
      <QuestionCard
        question="Are the nephrotic syndrome criteria fulfilled?"
        detail="UPCR ≥2 mg/mg + albumin <2.5 g/dL + oedema"
        onYes={() => ans("ns_confirmed", true, "NS Confirmed")}
        onNo={() => ans("ns_confirmed", false, "NS Not Confirmed")}
        color="violet"
      />
    </div>
  );

  if (step === 1 && answers.ns_confirmed === false) return (
    <div className="space-y-3">
      <EngineHeader title="Nephrotic Syndrome Engine" color="violet" subtitle="Exit" onReset={reset} />
      <ResultHeader diagnosis="NS criteria NOT met — consider alternative diagnosis" risk="yellow" />
      <InvestigationPanel
        mustOrder={["Repeat UPCR (first-morning sample)", "Serum albumin, total protein", "Urine dipstick × 3 days"]}
        shouldOrder={["Renal function, electrolytes", "Complement C3/C4 (if haematuria)", "ANA, anti-dsDNA if systemic features"]}
      />
      <GuidelineSource text="Consider: orthostatic proteinuria, nephritic syndrome, non-renal causes of oedema (cardiac, hepatic)." />
    </div>
  );

  // ── Step 1: Age ────────────────────────────────────────────────────────────
  if (step === 1) return (
    <div className="space-y-3">
      <EngineHeader title="Nephrotic Syndrome Engine" color="violet" subtitle="Age Classification" onReset={reset} step={2} totalSteps={8} />
      <PathwayTrail steps={trail} />
      <MultiChoiceCard
        question="What is the patient's age at onset?"
        detail="Age determines likelihood of genetic/congenital NS and biopsy thresholds"
        color="violet"
        options={[
          { label: "< 3 months (congenital NS)", onSelect: () => ans("age_group", "congenital", "Age <3 months") },
          { label: "3–12 months (infantile NS)", onSelect: () => ans("age_group", "infantile", "Age 3–12 months") },
          { label: "1–8 years (typical SSNS age)", onSelect: () => ans("age_group", "typical", "Age 1–8 yrs") },
          { label: "> 8 years (atypical age)", onSelect: () => ans("age_group", "older", "Age >8 yrs") },
        ]}
      />
    </div>
  );

  // ── Congenital NS branch ───────────────────────────────────────────────────
  if (step === 2 && answers.age_group === "congenital") return (
    <div className="space-y-3">
      <EngineHeader title="Congenital NS Engine" color="red" subtitle="Onset <3 months — Always genetic" onReset={reset} />
      <EmergencyBanner text="Congenital NS: massive proteinuria from birth. ALWAYS genetic — immediate workup required." />
      <PathwayTrail steps={[...trail, "Congenital NS → Genetic Emergency"]} />
      <ResultHeader diagnosis="Congenital Nephrotic Syndrome" risk="red" urgent />
      <DifferentialTable rows={[
        { dx: "Finnish-type NS (NPHS1/nephrin)", pct: 80, label: "Most Common" },
        { dx: "Podocin mutation (NPHS2)", pct: 10, label: "Likely" },
        { dx: "WT1 mutation (Denys-Drash)", pct: 5, label: "Consider" },
        { dx: "LAMB2 mutation (Pierson syndrome)", pct: 3, label: "Rare" },
        { dx: "PLCε1 / PLCE1", pct: 2, label: "Rare" },
      ]} />
      <InvestigationPanel
        mustOrder={["Full genetic panel: NPHS1, NPHS2, WT1, LAMB2, PLCE1 (WES)", "Renal biopsy (DMS: diffuse mesangial sclerosis is classic)", "Karyotype (WT1: Denys-Drash — Wilms tumour risk)", "Ophthalmology (LAMB2: Pierson — microcoria)"]}
        shouldOrder={["AFP (elevated in Finnish-type)", "Renal USG", "Parental genetic testing"]}
        advanced={["Whole exome sequencing if panel negative", "Pathology EM"]}
      />
      <TreatmentPanel title="Management" items={[
        "NO steroids — glucocorticoid-resistant by definition",
        "IV albumin + furosemide for oedema control",
        "High-calorie nasogastric feeding (massive protein losses)",
        "ACEi/ARB to reduce proteinuria",
        "Bilateral nephrectomy + dialysis → kidney transplant (only cure for Finnish-type)",
        "WT1 mutations: bilateral prophylactic nephrectomy (Wilms tumour risk >90%)",
        "Nephrectomy timing: when ESKD symptoms, not before"
      ]} />
      <MonitoringPanel items={[
        "Daily weight, urine dipstick",
        "Weekly electrolytes, albumin, creatinine",
        "Monthly renal function",
        "6-monthly USG for Wilms (WT1 mutations) — until nephrectomy",
        "Genetics multidisciplinary team review"
      ]} />
      <GuidelineSource text="IPNA 2021 · KDIGO 2012 · ERKNet Congenital NS Pathway · Finnish-type: Patrakka J, JASN 2000" />
    </div>
  );

  // ── Step 2 (for typical/infantile/older): Atypical features? ──────────────
  if (step === 2) return (
    <div className="space-y-3">
      <EngineHeader title="Nephrotic Syndrome Engine" color="violet" subtitle="Atypical Feature Screening" onReset={reset} step={3} totalSteps={8} />
      <PathwayTrail steps={trail} />
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
        <p className="text-xs font-bold text-amber-800 mb-1.5">Atypical features (any ONE = biopsy/genetic workup):</p>
        {["Haematuria (persistent, especially macroscopic)", "Hypertension (>95th percentile for age)", "Low complement C3/C4", "Acute kidney injury at presentation", "Family history of NS or CKD", "Extra-renal features (hearing loss, ocular, syndromic)"].map((f, i) => (
          <div key={i} className="flex items-start gap-1.5 text-xs text-amber-900"><ArrowRight className="w-3 h-3 text-amber-500 flex-shrink-0 mt-0.5" />{f}</div>
        ))}
      </div>
      <QuestionCard
        question="Are any atypical features present?"
        onYes={() => ans("atypical", true, "Atypical Features Present")}
        onNo={() => ans("atypical", false, "No Atypical Features")}
        color="violet"
      />
    </div>
  );

  // ── Step 3: First episode or relapse? ─────────────────────────────────────
  if (step === 3 && answers.atypical === false) return (
    <div className="space-y-3">
      <EngineHeader title="Nephrotic Syndrome Engine" color="violet" subtitle="Episode Classification" onReset={reset} step={4} totalSteps={8} />
      <PathwayTrail steps={trail} />
      <MultiChoiceCard
        question="Is this the first episode or a relapse?"
        color="violet"
        options={[
          { label: "First episode", onSelect: () => ans("episode", "first", "First Episode") },
          { label: "Relapse (dipstick ≥3+ × 3 days after remission)", onSelect: () => ans("episode", "relapse", "Relapse") },
        ]}
      />
    </div>
  );

  // ── First episode → ISKDC protocol ────────────────────────────────────────
  if (step === 4 && answers.episode === "first") return (
    <div className="space-y-3">
      <EngineHeader title="First Episode SSNS" color="violet" subtitle="ISKDC Protocol" onReset={reset} />
      <PathwayTrail steps={[...trail, "First Episode → ISKDC Prednisolone"]} />
      <ResultHeader diagnosis="First Episode Nephrotic Syndrome (presumed SSNS)" risk="yellow" />
      <DifferentialTable rows={[
        { dx: "Steroid-Sensitive NS (SSNS / MCD)", pct: 85, label: "Very Likely" },
        { dx: "FSGS (focal segmental glomerulosclerosis)", pct: 10, label: "Possible" },
        { dx: "Secondary NS (SLE, HBV, Henoch-Schönlein)", pct: 3, label: "Unlikely (check ANA)" },
        { dx: "MN (membranous nephropathy)", pct: 2, label: "Rare in children" },
      ]} />
      <TreatmentPanel title="ISKDC / IPNA First Episode Protocol" items={[
        "Prednisolone 60 mg/m²/day (max 60 mg/day) × 4–6 weeks",
        "Then 40 mg/m² on alternate days × 4–6 weeks, then taper",
        "Target: UPCR <0.2 mg/mg or dipstick trace/nil × 3 consecutive days = remission",
        "Salt restriction: <1–2 g/day NaCl during oedema",
        "Fluid restriction if severe hyponatraemia (Na <125)",
        "IV albumin 0.5–1 g/kg only if symptomatic hypovolaemia or severe oedema",
        "Spironolactone / furosemide for persistent oedema (albumin >2 g/dL before diuretics)",
        "Penicillin V prophylaxis while oedematous",
        "Review all vaccinations — live vaccines before starting IS"
      ]} />
      <InvestigationPanel
        mustOrder={["UPCR first-morning urine", "Serum albumin, creatinine, electrolytes", "FBC, lipids (total cholesterol)", "Urine dipstick daily"]}
        shouldOrder={["ANA (if atypical features)", "Complement C3/C4", "Urine microscopy", "USG kidneys"]}
        advanced={["Hepatitis B surface Ag + anti-HCV (before any IS)", "Varicella IgG (vaccination if negative, avoid if oedematous)"]}
      />
      <MonitoringPanel items={[
        "Daily home dipstick — record in diary",
        "Weekly weight + BP + dipstick",
        "Repeat albumin + creatinine at 4 weeks",
        "Assess for remission at 4 weeks (→ step down steroids)",
        "If no remission at 4 weeks: proceed to SRNS evaluation",
        "Follow-up 2 weeks after steroid taper complete"
      ]} />
      <GuidelineSource text="ISKDC 1981 (updated IPNA 2021) · Prednisolone dose per IPNA Clinical Practice Recommendations for NS · AAP 2009 UTI guidance adapted" />
    </div>
  );

  // ── Relapse → classify relapse pattern ────────────────────────────────────
  if (step === 4 && answers.episode === "relapse") return (
    <div className="space-y-3">
      <EngineHeader title="Relapse Classification" color="violet" subtitle="Frequent Relapser / Steroid Dependent / Steroid Resistant" onReset={reset} step={5} totalSteps={8} />
      <PathwayTrail steps={trail} />
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs space-y-1">
        <p className="font-bold text-blue-800">Definitions:</p>
        <p><span className="font-semibold">Relapse:</span> dipstick ≥3+ × 3 days after confirmed remission</p>
        <p><span className="font-semibold">Frequent Relapse (FRNS):</span> ≥2 relapses in 6 months OR ≥4 in 12 months</p>
        <p><span className="font-semibold">Steroid Dependent (SDNS):</span> relapse during steroid taper OR within 14 days of stopping</p>
        <p><span className="font-semibold">Steroid Resistant (SRNS):</span> no remission after 4 weeks full-dose prednisolone</p>
      </div>
      <MultiChoiceCard
        question="Which relapse pattern best describes this patient?"
        color="violet"
        options={[
          { label: "Infrequent relapse (<2 in 6 months)", onSelect: () => ans("relapse_type", "infrequent", "Infrequent Relapse") },
          { label: "Frequent relapser (FRNS: ≥2/6m or ≥4/12m)", onSelect: () => ans("relapse_type", "frns", "FRNS") },
          { label: "Steroid dependent (relapse on taper/within 14d off)", onSelect: () => ans("relapse_type", "sdns", "SDNS") },
          { label: "No remission after 4 weeks steroids (SRNS)", onSelect: () => ans("relapse_type", "srns", "SRNS") },
        ]}
      />
    </div>
  );

  // ── Infrequent relapse ─────────────────────────────────────────────────────
  if (answers.relapse_type === "infrequent") return (
    <div className="space-y-3">
      <EngineHeader title="Infrequent Relapse" color="violet" subtitle="Standard steroid course" onReset={reset} />
      <PathwayTrail steps={[...trail, "Infrequent Relapse → Steroid Course"]} />
      <ResultHeader diagnosis="Infrequent Relapse NS" risk="yellow" />
      <TreatmentPanel items={[
        "Prednisolone 60 mg/m²/day (max 60 mg) until 3 consecutive dipstick negative",
        "Then 40 mg/m² alternate days × 4 weeks, taper over 4 weeks",
        "Do NOT start IS (MMF/Levamisole) for infrequent relapse",
        "Identify relapse trigger (URTI, infections, vaccinations, medication non-compliance)",
        "Document steroid course number — track cumulative steroid exposure"
      ]} />
      <MonitoringPanel items={["Daily dipstick during relapse", "Weekly weight + BP", "Reassess at 4 weeks — if no remission → consider SRNS pathway"]} />
    </div>
  );

  // ── FRNS ──────────────────────────────────────────────────────────────────
  if (answers.relapse_type === "frns") return (
    <div className="space-y-3">
      <EngineHeader title="Frequent Relapsing NS (FRNS)" color="violet" subtitle="Steroid-sparing therapy" onReset={reset} />
      <PathwayTrail steps={[...trail, "FRNS → IS Decision"]} />
      <ResultHeader diagnosis="Frequent Relapsing NS — Steroid-Sparing IS Required" risk="orange" />
      <TreatmentPanel title="IS Protocol (choose 1–2 agents)" items={[
        "1st line: Levamisole 2.5 mg/kg alternate days × 12–24 months (reduce relapse rate, low toxicity)",
        "OR: MMF (mycophenolate mofetil) 1200 mg/m²/day in 2 doses × 12–24 months",
        "2nd line (if above fail): Cyclosporine 4–5 mg/kg/day in 2 doses (trough 80–120 ng/mL)",
        "OR: Rituximab 375 mg/m² IV × 1–2 doses (anti-CD20 — highly effective for FRNS/SDNS)",
        "Continue prednisolone: smallest dose maintaining remission (ideally <0.5 mg/kg/48h)",
        "STOP if in sustained remission × 12–24 months on IS"
      ]} />
      <InvestigationPanel
        mustOrder={["FBC (levamisole — agranulocytosis risk, check 3-monthly)", "LFT, RFT before and during MMF/CsA", "Hepatitis B, C, VZV, EBV serology before Rituximab"]}
        shouldOrder={["Renal biopsy if: atypical features, CsA >12 months, declining GFR"]}
        advanced={["Genetic panel if: syndromic features, SRNS episodes, onset <5 yrs"]}
      />
      <MonitoringPanel items={[
        "Daily dipstick",
        "3-monthly: FBC, creatinine, albumin, BP",
        "Annual: growth, BMI, BP, urine dipstick",
        "Varicella prophylaxis if VZV-naive on IS",
        "Killed vaccines annually (influenza, pneumococcus) — NO live vaccines on IS"
      ]} />
      <GuidelineSource text="IPNA 2021 Clinical Practice Recommendations for FRNS/SDNS · KDIGO 2012" />
    </div>
  );

  // ── SDNS ──────────────────────────────────────────────────────────────────
  if (answers.relapse_type === "sdns") return (
    <div className="space-y-3">
      <EngineHeader title="Steroid Dependent NS (SDNS)" color="violet" subtitle="Rituximab / CNI / MMF" onReset={reset} />
      <PathwayTrail steps={[...trail, "SDNS → IS Decision"]} />
      <ResultHeader diagnosis="Steroid Dependent NS — Steroid-Sparing IS Mandatory" risk="orange" />
      <TreatmentPanel title="SDNS Protocol" items={[
        "Rituximab 375 mg/m² IV × 2–4 doses (4-weekly) — preferred for SDNS (PRISM trial evidence)",
        "Pre-Rituximab: VZV/HBV/pneumococcal vaccine. Check IgG levels.",
        "Tacrolimus 0.1 mg/kg/day (trough 5–8 ng/mL) if RTX not available/fails",
        "OR: Cyclosporine 4–5 mg/kg/day (trough 80–120 ng/mL) — risk of nephrotoxicity long-term",
        "MMF as adjunct or maintenance after RTX",
        "Prednisolone: aim to wean to zero during sustained RTX remission",
        "Monitor B-cell reconstitution (CD19+ >1%) — re-dose RTX before relapse"
      ]} />
      <InvestigationPanel
        mustOrder={["CD19+ B cell count (flow cytometry — guide RTX re-dosing)", "IgG levels before and after RTX", "VZV/EBV/CMV/HBV serology before RTX"]}
        shouldOrder={["Renal biopsy if any atypical features or CsA >1 yr"]}
        advanced={["Genetic panel (NPHS2, WT1, PLCE1) if: syndromic, onset <5yr, recurrent severe relapses"]}
      />
      <MonitoringPanel items={[
        "B-cell CD19+ monthly after RTX (reconstitution ~6 months)",
        "IgG every 3 months (RTX → hypogammaglobulinaemia risk)",
        "IVIG if IgG <400 mg/dL + recurrent infections",
        "Annual renal function + eGFR",
        "Annual pubertal assessment (steroid toxicity)"
      ]} />
      <GuidelineSource text="IPNA 2021 · PRISM trial (RTX for SDNS): Iijima K, NEJM 2014 · KDIGO 2012 NS chapter" />
    </div>
  );

  // ── SRNS ──────────────────────────────────────────────────────────────────
  if (answers.relapse_type === "srns" || (step === 3 && answers.atypical === true)) {
    const isSRNS = answers.relapse_type === "srns";
    return (
      <div className="space-y-3">
        <EngineHeader title="SRNS / Atypical NS Engine" color="red" subtitle="Genetic → Biopsy → CNI Decision" onReset={reset} />
        <EmergencyBanner text="SRNS: Renal biopsy + genetic panel MANDATORY before starting CNI therapy." />
        <PathwayTrail steps={[...trail, isSRNS ? "SRNS" : "Atypical NS", "Biopsy + Genetics Required"]} />
        <ResultHeader diagnosis={isSRNS ? "Steroid-Resistant NS (SRNS)" : "Atypical NS — Biopsy Required"} risk="red" urgent />
        <DifferentialTable rows={[
          { dx: "FSGS (focal segmental glomerulosclerosis)", pct: 50, label: "Most Common" },
          { dx: "MCD (minimal change disease, steroid-resistant subset)", pct: 20, label: "Possible" },
          { dx: "DMS (diffuse mesangial sclerosis — genetic)", pct: 10, label: "Consider if <1yr" },
          { dx: "Genetic NS (NPHS1/2, WT1, PLCE1, COQ mutations)", pct: 15, label: "Test all SRNS" },
          { dx: "Lupus nephritis class V", pct: 3, label: "If ANA +" },
          { dx: "Membranous nephropathy", pct: 2, label: "Rare in children" },
        ]} />
        <InvestigationPanel
          mustOrder={[
            "Genetic panel: NPHS1, NPHS2, PLCE1, WT1, LAMB2, CD2AP, TRPC6, INF2",
            "COQ2, COQ6, COQ8B (mitochondrial) — if extra-renal features or neonatal",
            "Renal biopsy: LM + IF + EM — classify FSGS variant (Columbia classification)",
            "ANA, anti-dsDNA, C3, C4, anti-GBM (secondary NS exclusion)",
            "HBsAg, anti-HCV, HIV serology",
            "Ophthalmology (WT1 → DDS + Wilms; LAMB2 → Pierson + microcoria)"
          ]}
          shouldOrder={["24h urine protein / UPCR daily", "Tacrolimus trough BEFORE CNI start", "USG kidneys"]}
          advanced={["WES (whole exome) if targeted panel negative + onset <5yr", "Lyso-Gb3 if Fabry suspected"]}
        />
        <TreatmentPanel title="SRNS Protocol (KDIGO 2012 + IPNA 2021)" items={[
          "Await genetic results AND biopsy before starting CNI",
          "IF genetic cause confirmed (NPHS1, NPHS2 homozygous): NO CNI — aim for transplant",
          "IF MCD or FSGS without genetic cause: Tacrolimus 0.1–0.2 mg/kg/day (trough 5–10 ng/mL)",
          "Tacrolimus + low-dose prednisolone × 6 months — assess response (CR/PR at 6 months)",
          "CR (complete remission): continue tacrolimus 1–2 years, slow taper",
          "PR (>50% reduction): maintain + add ACEi/ARB",
          "No response at 6 months: Rituximab OR CYC IV × 6 pulses (FSGS variant)",
          "ACEi + ARB: all SRNS (reduce proteinuria, renoprotective) — monitor K+ + creatinine"
        ]} />
        <ReasoningPanel reasons={[
          "SRNS = no remission after 4 weeks of full-dose prednisolone",
          "CNI cannot be started without biopsy (cannot give tacrolimus to non-proliferative FSGS blindly)",
          "Genetic cause present in ~30% SRNS → CNI ineffective in genetic SRNS (podocin mutations)",
          "FSGS has 5 variants (Columbia): tip lesion has better prognosis; collapsing FSGS worst"
        ]} />
        <MonitoringPanel items={[
          "Tacrolimus trough every 2 weeks initially, then monthly",
          "eGFR + creatinine monthly (CNI nephrotoxicity)",
          "Annual renal biopsy if on CsA >2 years (nephrotoxicity surveillance)",
          "UPCR monthly — target CR or PR",
          "Growth, BP, lipids every 3 months",
          "Transplant evaluation if ESKD trajectory"
        ]} />
        <GuidelineSource text="KDIGO 2012 · IPNA 2021 SRNS Recommendations · FSGS Columbia Classification (D'Agati 2004) · ESCAPE trial (ACEi in CKD)" />
      </div>
    );
  }

  return null;
}