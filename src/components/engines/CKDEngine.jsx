import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ChevronRight, Layers } from "lucide-react";

const STEPS = {
  START: "start",
  CLASSIFY: "classify",
  ETIOLOGY: "etiology",
  ETIOLOGY_GLOM: "etiology_glom",
  ETIOLOGY_CAKUT: "etiology_cakut",
  ETIOLOGY_TUBULAR: "etiology_tubular",
  ETIOLOGY_GENETIC: "etiology_genetic",
  TREATMENT: "treatment",
  MBD: "mbd",
  ANEMIA: "anemia",
  HTN: "htn_ckd",
  NUTRITION: "nutrition_ckd",
  MONITORING: "monitoring",
  PROGRESSION: "progression",
  ESRD_PREP: "esrd_prep",
};

const InfoBox = ({ title, color = "blue", items, children, referral }) => {
  const styles = { blue: "border-blue-300 bg-blue-50", green: "border-green-300 bg-green-50", amber: "border-amber-300 bg-amber-50", red: "border-red-300 bg-red-50", violet: "border-violet-300 bg-violet-50", slate: "border-slate-200 bg-slate-50", teal: "border-teal-300 bg-teal-50" };
  const titleC = { blue: "text-blue-900", green: "text-green-900", amber: "text-amber-900", red: "text-red-900", violet: "text-violet-900", slate: "text-slate-800", teal: "text-teal-900" };
  return (
    <div className={`rounded-xl border-2 p-3 ${styles[color]}`}>
      <p className={`font-bold text-sm mb-2 ${titleC[color]}`}>{title}</p>
      {items && <ul className="space-y-1">{items.map((it, i) => <li key={i} className="text-xs text-slate-700 flex gap-2"><span className="text-blue-500 flex-shrink-0 mt-0.5">→</span><span>{it}</span></li>)}</ul>}
      {children}
      {referral && <div className="mt-2 p-2 bg-violet-50 border border-violet-200 rounded-lg text-xs text-violet-800 font-medium">📋 {referral}</div>}
    </div>
  );
};

const Q = ({ question, note, options, onSelect }) => (
  <div className="space-y-2">
    <p className="font-semibold text-sm text-slate-800">{question}</p>
    {note && <p className="text-xs text-slate-500 italic">{note}</p>}
    {options.map(opt => (
      <button key={opt.label} onClick={() => onSelect(opt.next)}
        className="w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 border-slate-200 bg-white hover:border-blue-400 hover:bg-blue-50 transition-all text-left">
        <span className="text-sm font-medium text-slate-700">{opt.label}</span>
        <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0 ml-2" />
      </button>
    ))}
  </div>
);

export default function CKDEngine() {
  const [step, setStep] = useState(STEPS.START);
  const [history, setHistory] = useState([]);

  const go = (next) => { setHistory(h => [...h, step]); setStep(next); };
  const back = () => { const prev = history[history.length - 1]; if (prev) { setHistory(h => h.slice(0, -1)); setStep(prev); } };
  const reset = () => { setStep(STEPS.START); setHistory([]); };
  const NavBtns = () => (
    <div className="flex gap-2 pt-2">
      {history.length > 0 && <Button variant="outline" size="sm" className="flex-1" onClick={back}><ArrowLeft className="w-3.5 h-3.5 mr-1" />Back</Button>}
      <Button variant="outline" size="sm" className="flex-1" onClick={reset}>Restart</Button>
    </div>
  );

  const renderStep = () => {
    switch (step) {
      case STEPS.START:
        return (
          <Q question="CKD Engine — select module:" onSelect={go} options={[
            { label: "Classify CKD — G staging + Albuminuria risk matrix", next: STEPS.CLASSIFY },
            { label: "Identify Etiology — Glomerular / CAKUT / Tubular / Genetic", next: STEPS.ETIOLOGY },
            { label: "Treatment Plan — RAAS, proteinuria, comorbidities", next: STEPS.TREATMENT },
            { label: "CKD-MBD — PTH, phosphate, calcium, Vit D", next: STEPS.MBD },
            { label: "Anaemia Management", next: STEPS.ANEMIA },
            { label: "Hypertension in CKD", next: STEPS.HTN },
            { label: "Nutrition & Growth", next: STEPS.NUTRITION },
            { label: "Monitoring Plan", next: STEPS.MONITORING },
            { label: "CKD Progression — risk factors + retardation", next: STEPS.PROGRESSION },
            { label: "ESRD Preparation — access, transplant, RRT mode", next: STEPS.ESRD_PREP },
          ]} />
        );

      case STEPS.CLASSIFY:
        return (
          <div className="space-y-3">
            <InfoBox title="CKD Classification — KDIGO 2012 + Paediatric Adaptation" color="blue">
              <div className="mt-2 space-y-2 text-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs border-collapse">
                    <thead><tr className="bg-blue-100"><th className="border border-blue-300 p-1.5 text-left">Stage</th><th className="border border-blue-300 p-1.5 text-left">eGFR (mL/min/1.73m²)</th><th className="border border-blue-300 p-1.5 text-left">Description</th></tr></thead>
                    <tbody>
                      {[["G1", "≥90", "Normal or high — with kidney damage markers"], ["G2", "60–89", "Mildly decreased"], ["G3a", "45–59", "Mildly to moderately decreased"], ["G3b", "30–44", "Moderately to severely decreased"], ["G4", "15–29", "Severely decreased — prepare for RRT"], ["G5", "<15 (or dialysis)", "Kidney failure / ESKD"]].map(([s, e, d], i) => (
                        <tr key={i} className="border-b"><td className="border border-blue-200 p-1.5 font-bold text-blue-900">{s}</td><td className="border border-blue-200 p-1.5">{e}</td><td className="border border-blue-200 p-1.5">{d}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="p-2 bg-blue-50 rounded-lg">
                  <p className="font-bold text-blue-900">eGFR Formulae in Children (KDIGO 2012 for paediatrics)</p>
                  <p className="text-blue-800">Bedside Schwartz: eGFR = 0.413 × height (cm) / SCr (mg/dL) [validated 1–16y]</p>
                  <p className="text-blue-800">CKiD 2-variable (Schwartz-Lyon): more accurate; requires cystatin C</p>
                  <p className="text-blue-800">Neonates: modified Schwartz; interpret with caution (maternal Cr confounds first week)</p>
                </div>
                <div className="p-2 bg-amber-50 rounded-lg">
                  <p className="font-bold text-amber-900">Albuminuria Classification (A stages)</p>
                  {[["A1", "<30 mg/g or <3 mg/mmol", "Normal to mildly increased"], ["A2", "30–300 mg/g", "Moderately increased (microalbuminuria)"], ["A3", ">300 mg/g or >30 mg/mmol", "Severely increased (macroalbuminuria / proteinuria)"]].map(([s, v, d], i) => <p key={i} className="text-amber-800"><strong>{s}:</strong> {v} — {d}</p>)}
                </div>
                <div className="p-2 bg-green-50 rounded-lg">
                  <p className="font-bold text-green-900">Monitoring Interval by Stage</p>
                  {[["G1 + A1", "Annual"], ["G2 + A2", "6-monthly"], ["G3a", "3–6 monthly"], ["G3b", "3 monthly"], ["G4–G5", "1–3 monthly"]].map(([s, i], j) => <p key={j} className="text-green-800">• {s}: {i}</p>)}
                </div>
              </div>
            </InfoBox>
            <NavBtns />
          </div>
        );

      case STEPS.ETIOLOGY:
        return (
          <Q question="What is the likely aetiology of CKD?" onSelect={go} options={[
            { label: "Glomerular Disease (GN, NS, vasculitis)", next: STEPS.ETIOLOGY_GLOM },
            { label: "CAKUT / Structural (VUR, PUV, reflux nephropathy, MCDK, HN)", next: STEPS.ETIOLOGY_CAKUT },
            { label: "Tubular / Metabolic (RTA, Fanconi, tubular nephritis)", next: STEPS.ETIOLOGY_TUBULAR },
            { label: "Hereditary / Genetic (Alport, ARPKD, NPHP, ADPKD, cystinosis)", next: STEPS.ETIOLOGY_GENETIC },
          ]} />
        );

      case STEPS.ETIOLOGY_GLOM:
        return (
          <div className="space-y-3">
            <InfoBox title="Glomerular Causes of CKD in Children" color="violet"
              items={[
                "FSGS (Focal Segmental Glomerulosclerosis) — steroid-resistant, genetic forms (NPHS2, WT1, TRPC6)",
                "IgA Nephropathy — MEST-C score; proteinuria + declining eGFR = aggressive Rx",
                "Lupus Nephritis Class III/IV — most common GN progressing to CKD in girls >10y",
                "Membranoproliferative GN / C3G — complement-mediated; high recurrence post-transplant",
                "Congenital Nephrotic Syndrome — Finnish type (NPHS1); early transplant",
                "ANCA vasculitis — GPA/MPA; RPGN → CKD if treatment delayed",
                "Post-infectious GN — PSGN usually reversible; epidemic post-MRSA/strep may cause persistent GN",
              ]}
            >
              <div className="mt-2 p-2 bg-violet-50 rounded-lg text-xs">
                <p className="font-bold text-violet-900">Key investigations:</p>
                {["Renal biopsy with IF, LM, EM (essential for classification)", "ANA, anti-dsDNA, ANCA, C3, C4, CH50, AH50", "PLA2R Ab (membranous — more relevant in adults)", "Genetic panel if SRNS or family history"].map((c, i) => <p key={i} className="text-violet-800">• {c}</p>)}
              </div>
            </InfoBox>
            <NavBtns />
          </div>
        );

      case STEPS.ETIOLOGY_CAKUT:
        return (
          <div className="space-y-3">
            <InfoBox title="CAKUT — Most Common Cause of CKD in Children (34–43%)" color="teal"
              items={[
                "Reflux nephropathy: VUR grades III–V → renal scarring on DMSA → progressive CKD",
                "Posterior urethral valves (PUV): valve bladder syndrome → bilateral obstruction → CKD",
                "Hydronephrosis / UPJ obstruction: delayed relief → irreversible tubular damage",
                "MCDK (Multicystic Dysplastic Kidney): contralateral VUR → scarring → CKD",
                "Solitary kidney: compensatory hypertrophy → glomerular hyperfiltration → proteinuria → CKD",
                "Horseshoe kidney: recurrent obstruction + stones → CKD",
                "Renal dysplasia: congenital underdevelopment; poor functional mass",
              ]}
            >
              <div className="mt-2 p-2 bg-teal-50 rounded-lg text-xs">
                <p className="font-bold text-teal-900">Management principles:</p>
                {["Correct obstruction early (pyeloplasty, valve ablation)", "Treat UTIs aggressively; chemoprophylaxis if VUR grade III+", "ACEi/ARB early for proteinuria (even if hypertensive)", "DMSA at 4–6 months post febrile UTI for scarring documentation", "Monitor eGFR 6-monthly + BP; transition care plan by CKD G3b"].map((c, i) => <p key={i} className="text-teal-800">• {c}</p>)}
              </div>
            </InfoBox>
            <NavBtns />
          </div>
        );

      case STEPS.ETIOLOGY_TUBULAR:
        return (
          <div className="space-y-3">
            <InfoBox title="Tubular & Metabolic Causes of CKD" color="amber"
              items={[
                "Fanconi syndrome: cystinosis (most common in children), Lowe syndrome, mitochondrial disease, drugs",
                "Distal RTA (type 1): nephrocalcinosis → progressive CKD if untreated; potassium citrate halts progression",
                "Primary hyperoxaluria type 1 (AGXT): oxalate deposits → CKD → ESRD by 2nd decade",
                "Nephronophthisis (NPHP): autosomal recessive tubulointerstitial disease; ESRD by 13y (juvenile form)",
                "Nephrotoxic AKI: aminoglycosides, contrast, cisplatin — cumulative tubular injury",
                "Interstitial nephritis: NSAIDs, PPI, antibiotics — often reversible if drug stopped early",
              ]}
            />
            <NavBtns />
          </div>
        );

      case STEPS.ETIOLOGY_GENETIC:
        return (
          <div className="space-y-3">
            <InfoBox title="Hereditary / Genetic Causes of CKD" color="violet"
              items={[
                "Alport syndrome: COL4A3/A4/A5 — hematuria → proteinuria → ESRD (males by 20–30y); ACEi from age 5",
                "ARPKD (PKHD1): hepatic fibrosis + CKD; portal HTN; ESRD variable (some by teens)",
                "ADPKD (PKD1/2): tolvaptan slows cyst growth in adults; surveillance USS; ESRD typically in adulthood",
                "Nephronophthisis (NPHP1 most common): ESRD by 13y (juvenile) or later; associated retinitis, cerebellar ataxia",
                "Bardet-Biedl syndrome: ciliopathy + obesity + polydactyly + retinal dystrophy + CKD",
                "HNF1B (17q12 deletion): cysts + hypomagnesaemia + MODY5 → CKD in teens",
                "Cystinosis: CTNS gene; Fanconi → CKD by 10y without cysteamine; continue cysteamine post-transplant",
                "FSGS genetic panel: NPHS2, WT1, LAMB2, PLCE1, INF2, COQ2/6/8B — affects IS choice",
              ]}
            >
              <div className="mt-2 p-2 bg-violet-50 rounded-lg text-xs">
                <p className="font-bold text-violet-900">When to refer for genetic testing:</p>
                {["CKD with family history of renal failure / deafness / ocular findings", "SRNS before CNI initiation", "Cystic kidney disease (any type)", "Tubulopathy with suspected metabolic cause", "Ciliopathy features (retinitis, cerebellar ataxia, polydactyly)"].map((c, i) => <p key={i} className="text-violet-800">• {c}</p>)}
              </div>
            </InfoBox>
            <NavBtns />
          </div>
        );

      case STEPS.TREATMENT:
        return (
          <div className="space-y-3">
            <InfoBox title="CKD Treatment — Core Principles" color="green">
              <div className="mt-2 space-y-2 text-xs">
                <div className="p-2 bg-green-50 rounded-lg">
                  <p className="font-bold text-green-900">RAAS Blockade (cornerstone)</p>
                  <p className="text-green-800">Indications: UPCR {">"}500 mg/g (any CKD stage); UPCR {">"}200 mg/g + declining eGFR</p>
                  <p className="text-green-800">Enalapril: 0.08–0.6 mg/kg/day OD–BD (max 0.6 mg/kg/day)</p>
                  <p className="text-green-800">Lisinopril: 0.07–0.6 mg/kg/day OD (max 40 mg/day)</p>
                  <p className="text-green-800">Losartan: 0.7–1.4 mg/kg/day OD (max 100 mg/day) — ARB if ACEi cough</p>
                  <p className="text-green-800">Monitor: K⁺ (risk hyperkalaemia), Cr (acceptable rise {"<"}30%), BP</p>
                </div>
                <div className="p-2 bg-blue-50 rounded-lg">
                  <p className="font-bold text-blue-900">BP Targets (KDIGO 2021)</p>
                  <p className="text-blue-800">CKD without proteinuria: {"<"}75th percentile (age/sex/height)</p>
                  <p className="text-blue-800">CKD with proteinuria (UPCR {">"}500 mg/g): {"<"}50th percentile</p>
                  <p className="text-blue-800">Adolescents ≥18y: {"<"}120/80 mmHg (SPRINT target; use cautiously in paediatrics)</p>
                </div>
                <div className="p-2 bg-amber-50 rounded-lg">
                  <p className="font-bold text-amber-900">Specific to Etiology</p>
                  {["Alport: ACEi as early as age 5 (microalbuminuria) — delays ESRD by 10–13 years", "Cystinosis: cysteamine bitartrate — start early, continue post-transplant", "PH1: lumasiran + B6 trial; combined liver-kidney transplant for ESRD", "ANCA vasculitis: RTX or CYC induction → azathioprine/MMF maintenance", "LN: MMF + hydroxychloroquine + low-dose prednisolone (maintenance)", "IgAN (progressive): sparsentan / SGLT2i (emerging evidence adults; paediatric trial data limited)", "FSGS genetic: IS NOT INDICATED (genetic FSGS non-immune) — RAAS + supportive only"].map((c, i) => <p key={i} className="text-amber-800">• {c}</p>)}
                </div>
                <div className="p-2 bg-violet-50 rounded-lg">
                  <p className="font-bold text-violet-900">SGLT2 Inhibitors (Paediatric use — emerging)</p>
                  <p className="text-violet-800">Dapagliflozin / Empagliflozin: approved adults CKD with DM/UPCR; under trial in adolescents</p>
                  <p className="text-violet-800">Mechanism: reduces intraglomerular pressure, anti-fibrotic, anti-inflammatory</p>
                  <p className="text-violet-800">Use only if eGFR ≥25 mL/min/1.73m² (efficacy diminishes below G4)</p>
                </div>
              </div>
            </InfoBox>
            <NavBtns />
          </div>
        );

      case STEPS.MBD:
        return (
          <div className="space-y-3">
            <InfoBox title="CKD-MBD — KDIGO Targets by Stage" color="amber">
              <div className="mt-2 space-y-2 text-xs">
                <div className="p-2 bg-amber-50 rounded-lg">
                  <p className="font-bold text-amber-900">PTH Targets (KDIGO 2017)</p>
                  {[["G3a–G3b", "Upper limit of normal (ULN) for assay"], ["G4", "2–9× ULN"], ["G5/G5D", "2–9× ULN (avoid over-suppression)"]].map(([s, t], i) => <p key={i} className="text-amber-800">• {s}: {t}</p>)}
                </div>
                <div className="p-2 bg-blue-50 rounded-lg">
                  <p className="font-bold text-blue-900">Active Vitamin D</p>
                  <p className="text-blue-800">Calcitriol: 0.01–0.05 µg/kg/day (max 0.25–0.5 µg OD) — for secondary hyperparathyroidism (CKD G3b+)</p>
                  <p className="text-blue-800">Alfacalcidol: 0.01–0.05 µg/kg/day (alternative)</p>
                  <p className="text-blue-800">Monitor: Ca and PO₄ before starting; check monthly initially</p>
                </div>
                <div className="p-2 bg-green-50 rounded-lg">
                  <p className="font-bold text-green-900">Phosphate Management</p>
                  <p className="text-green-800">Target: age-appropriate normal (children have higher normal PO₄)</p>
                  <p className="text-green-800">Low phosphate diet (dairy, nuts, processed food) — dietitian involvement</p>
                  <p className="text-green-800">Phosphate binders (if dietary restriction insufficient):</p>
                  {["Calcium carbonate: 50 mg/kg/day (CaCO₃) with meals; avoid if hypercalcaemia", "Sevelamer carbonate: 200–800 mg TDS with meals (prefer in CKD G4+ to avoid Ca load)", "Lanthanum carbonate: approved {'>'}6y; chewable; not absorbed", "Aluminium hydroxide: short-term only (toxicity risk); emergency use only"].map((c, i) => <p key={i} className="text-green-800 ml-2">→ {c}</p>)}
                </div>
                <div className="p-2 bg-slate-50 rounded-lg">
                  <p className="font-bold text-slate-800">Growth & Bone</p>
                  <p className="text-slate-700">Recombinant human growth hormone (rhGH): 0.045–0.05 mg/kg/day SC — for CKD growth failure (prepubertal, height SDS {"<"}-2)</p>
                  <p className="text-slate-700">Bone age X-ray (left hand/wrist): annually in CKD G3+</p>
                  <p className="text-slate-700">DEXA scan: CKD G3b+ on corticosteroids or growth failure</p>
                </div>
              </div>
            </InfoBox>
            <NavBtns />
          </div>
        );

      case STEPS.ANEMIA:
        return (
          <div className="space-y-3">
            <InfoBox title="CKD Anaemia Management (KDIGO 2012)" color="red"
              items={[
                "Screen from CKD G3 (Hb, reticulocytes, iron studies, ferritin)",
                "Target Hb: 10–12 g/dL (avoid >13 — thrombosis risk); adjust for symptoms",
                "Exclude non-renal causes: iron deficiency, haemolysis, B12/folate, infection (before ESA)",
              ]}
            >
              <div className="mt-2 space-y-1.5 text-xs">
                <div className="p-2 bg-red-50 rounded-lg">
                  <p className="font-bold text-red-900">Iron Replacement (first-line)</p>
                  <p className="text-red-800">Target: TSAT {">"}20%, ferritin {">"}100 ng/mL (pre-dialysis) / {">"}200 ng/mL (HD)</p>
                  <p className="text-red-800">IV iron preferred in HD patients (oral iron poorly tolerated + absorbed)</p>
                  <p className="text-red-800">Iron sucrose IV: 1 mg/kg/dose (max 200 mg/dose); 5–10 doses</p>
                  <p className="text-red-800">Ferric carboxymaltose: 15 mg/kg (max 1000 mg) single infusion</p>
                  <p className="text-red-800">Oral iron: ferrous sulfate 3–6 mg/kg/day elemental iron (CKD G1–3 non-dialysis)</p>
                </div>
                <div className="p-2 bg-orange-50 rounded-lg">
                  <p className="font-bold text-orange-900">ESA (Erythropoiesis-Stimulating Agents)</p>
                  <p className="text-orange-800">Start when Hb {"<"}10 g/dL (after optimising iron; if still anaemic)</p>
                  <p className="text-orange-800">Darbepoetin alfa: 0.45 µg/kg/week IV/SC (HD) or 0.75 µg/kg/2 weeks (non-dialysis)</p>
                  <p className="text-orange-800">Epoetin alfa: 50–300 U/kg/dose SC TDS/week</p>
                  <p className="text-orange-800">Adjust dose by 25% increments every 4 weeks to maintain Hb target</p>
                  <p className="text-orange-800">Hypertension monitoring: commonest ESA complication</p>
                </div>
              </div>
            </InfoBox>
            <NavBtns />
          </div>
        );

      case STEPS.HTN:
        return (
          <div className="space-y-3">
            <InfoBox title="Hypertension in CKD — Management" color="blue"
              items={[
                "BP targets: CKD + proteinuria → <50th percentile; CKD without proteinuria → <75th percentile",
                "ABPM preferred over office BP (avoid white coat effect; captures nocturnal dipping)",
                "First-line drug: ACEi or ARB (dual antiproteinuric + antihypertensive benefit)",
                "Add-on: CCB (amlodipine 0.05–0.3 mg/kg/day, max 10 mg) for persistent HTN",
                "Avoid: beta-blockers as monotherapy in CKD; thiazides in GFR <30 (less effective)",
                "Resistant HTN (≥3 drugs): spironolactone 1–3 mg/kg/day (monitor K+), minoxidil 0.1–1 mg/kg/day",
                "Dietary sodium restriction: 1–2 mEq/kg/day (crucial adjunct)",
              ]}
            />
            <NavBtns />
          </div>
        );

      case STEPS.NUTRITION:
        return (
          <div className="space-y-3">
            <InfoBox title="Nutrition & Growth in CKD" color="green"
              items={[
                "Target: normal height velocity for age; height SDS > -1.88 (3rd centile)",
                "Energy: 100–130% EAR (energy-adjusted for growth target); nasogastric tube/PEG feeding if needed",
                "Protein: Avoid restriction in children (growth priority); 1–1.5 g/kg/day for dialysis; high biological value protein",
                "Sodium: 1–2 mEq/kg/day (limit processed foods; polyuric CKD may need supplementation)",
                "Potassium: restrict if hyperkalaemia; supplement if polyuric tubular disease",
                "Phosphate: restrict dairy, nuts, processed foods; binder with meals if PO₄ elevated",
                "Volume/fluid: usually no restriction unless oliguric; increase if polyuric (salt-wasting tubular disease)",
                "Rickets/MBD: calcitriol + phosphate binders as above; monitor alkaline phosphatase",
              ]}
            />
            <div className="p-2 bg-green-50 border border-green-200 rounded-xl text-xs">
              <p className="font-bold text-green-900">Growth Hormone (KDIGO 2012)</p>
              <p className="text-green-800">rhGH 0.045–0.05 mg/kg/day SC: indicated if {"<"}-2 SDS height AND optimised nutrition/acidosis/MBD</p>
              <p className="text-green-800">Monitor: IGF-1, bone age, glucose, BP — continue until transplant or adult height</p>
            </div>
            <NavBtns />
          </div>
        );

      case STEPS.MONITORING:
        return (
          <div className="space-y-3">
            <InfoBox title="CKD Monitoring Plan by Stage" color="slate">
              <div className="mt-2 space-y-2 text-xs">
                <div className="p-2 bg-slate-50 rounded-lg">
                  <p className="font-bold text-slate-800">At Every Visit</p>
                  {["Anthropometry: height, weight, BMI, head circumference (<2y)", "BP (age/sex/height percentile + ABPM 6-monthly in G3+)", "Dipstick/UPCR + urine microscopy", "Review medications + adherence", "Growth chart update + height velocity"].map((c, i) => <p key={i} className="text-slate-700">• {c}</p>)}
                </div>
                <div className="p-2 bg-blue-50 rounded-lg">
                  <p className="font-bold text-blue-900">Laboratory Frequency (KDIGO — adapted for paediatrics)</p>
                  {[["eGFR + Cr", "1–3 monthly (G3+); 3–6 monthly (G1–2)"], ["UPCR", "Every visit"], ["Electrolytes, bicarbonate", "1–3 monthly (G3+)"], ["Calcium, phosphate, PTH", "3–6 monthly (G3b+)"], ["25-OH Vit D", "Annually"], ["Hb + iron studies", "3 monthly (G3+); 6 monthly (G1–2)"], ["Lipid profile", "Annually"], ["Albumin", "3–6 monthly"], ["Uric acid", "6 monthly"]].map(([t, f], i) => <p key={i} className="text-blue-800">• <strong>{t}</strong>: {f}</p>)}
                </div>
                <div className="p-2 bg-amber-50 rounded-lg">
                  <p className="font-bold text-amber-900">Imaging & Functional</p>
                  {["Renal USS: 6-monthly (G3b+)", "Echocardiogram: annually (G4+) — LVH, pericardial effusion", "DEXA scan: annually if on steroids or CKD G3b+", "Bone age X-ray: annually (prepubertal)", "Neurodevelopmental assessment: annually (young children)", "Ophthalmology: annually (Alport, cystinosis, genetic CKD)"].map((c, i) => <p key={i} className="text-amber-800">• {c}</p>)}
                </div>
              </div>
            </InfoBox>
            <NavBtns />
          </div>
        );

      case STEPS.PROGRESSION:
        return (
          <div className="space-y-3">
            <InfoBox title="CKD Progression — Risk Factors & Retardation" color="violet">
              <div className="mt-2 space-y-2 text-xs">
                <div className="p-2 bg-violet-50 rounded-lg">
                  <p className="font-bold text-violet-900">Progression Risk Factors</p>
                  {["Uncontrolled hypertension (strongest modifiable factor)", "Persistent proteinuria UPCR >500 mg/g", "Anaemia (Hb <10 g/dL)", "Metabolic acidosis (serum HCO₃ <22 mEq/L)", "Hyperphosphataemia / secondary HPT", "Recurrent UTIs / pyelonephritis", "Poor nutrition / growth failure", "Nephrotoxin exposure (NSAIDs, contrast, aminoglycosides)", "Inadequate dialysis (once on RRT)", "Non-adherence to medications"].map((c, i) => <p key={i} className="text-violet-800">• {c}</p>)}
                </div>
                <div className="p-2 bg-green-50 rounded-lg">
                  <p className="font-bold text-green-900">Retardation Strategies (Evidence-based)</p>
                  {["RAAS blockade: UPCR target <500 mg/g (or <200 mg/g if possible)", "Strict BP control: <50th percentile in CKD with proteinuria", "Treat acidosis: NaHCO₃ supplementation (target HCO₃ ≥22 mEq/L)", "Iron supplementation: optimise Hb 10–12 g/dL", "MBD control: PTH target range + Vit D", "Smoking avoidance + obesity prevention (adolescents)", "Low nephrotoxin exposure policy (avoid NSAIDs; contrast with hydration; aminoglycoside levels)", "SGLT2 inhibitors (emerging in adolescents with proteinuric CKD)"].map((c, i) => <p key={i} className="text-green-800">• {c}</p>)}
                </div>
              </div>
            </InfoBox>
            <NavBtns />
          </div>
        );

      case STEPS.ESRD_PREP:
        return (
          <div className="space-y-3">
            <InfoBox title="ESRD Preparation — CKD G4–G5 (eGFR <20–25)" color="red"
              items={[
                "Pre-emptive transplant: preferred (living donor) — referral when eGFR <20 mL/min/1.73m²",
                "Immunisation: complete MMR, Varicella, Hepatitis B, PCV, meningococcal BEFORE transplant (live vaccines contraindicated post-Tx)",
                "RRT modality choice: PD preferred <20 kg; discuss with family (PD first approach, home HD, CCPD)",
                "PD catheter insertion: ideally 4–6 weeks before RRT start (time for healing, leak prevention)",
                "AVF creation: ≥6 months before HD start; vessel mapping pre-insertion",
                "Psychosocial preparation: MDT approach (dietitian, psychologist, social worker, school liaison)",
                "Transition planning: adolescent CKD → adult nephrology services (start from age 14)",
              ]}
            >
              <div className="mt-2 p-2 bg-red-50 rounded-lg text-xs">
                <p className="font-bold text-red-900">Dialysis Start Triggers (KDIGO + expert consensus)</p>
                {["eGFR <10–15 mL/min/1.73m² with symptoms (uraemia, failure to thrive, growth failure)", "AEIOU criteria met (Acidosis, Electrolytes, Intoxication, Overload, Uraemia)", "Malnutrition refractory to conservative management", "Uncontrolled hypertension on maximal therapy"].map((c, i) => <p key={i} className="text-red-800">• {c}</p>)}
              </div>
            </InfoBox>
            <NavBtns />
          </div>
        );

      default:
        return <Button onClick={reset}>Restart</Button>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-gradient-to-r from-blue-700 to-teal-700 p-4 text-white">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5" />
          <div>
            <h3 className="font-bold text-sm">CKD Intelligence Engine</h3>
            <p className="text-xs text-blue-200">KDIGO CKD 2012 · KDIGO MBD 2017 · KDOQI Nutrition · KDIGO Anaemia 2012 · ISPN</p>
          </div>
        </div>
      </div>
      {history.length > 0 && <Badge variant="outline" className="text-xs">Step {history.length + 1}</Badge>}
      <Card><CardContent className="p-4">{renderStep()}</CardContent></Card>
      <div className="text-xs text-slate-400 text-center">KDIGO 2012–2024 · ISPN · KDOQI · KDIGO MBD 2017 · KDIGO Anaemia 2012</div>
    </div>
  );
}