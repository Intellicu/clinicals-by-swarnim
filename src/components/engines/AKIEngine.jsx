/**
 * AKI Diagnostic Intelligence Engine
 * Full LEILA-style: Staging → Pre/Intrinsic/Post-renal → Cause → RRT Decision
 */
import React, { useState } from "react";
import {
  EngineHeader, QuestionCard, MultiChoiceCard, PathwayTrail,
  DifferentialTable, InvestigationPanel, MonitoringPanel,
  GuidelineSource, ResultHeader, ReasoningPanel, TreatmentPanel, EmergencyBanner
} from "./EngineShell";
import { ArrowRight, AlertTriangle, Calculator } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const INITIAL = { step: 0, answers: {}, trail: ["AKI Suspected"] };

export default function AKIEngine() {
  const [state, setState] = useState(INITIAL);
  const { step, answers, trail } = state;
  const [crBase, setCrBase] = useState(""); const [crNow, setCrNow] = useState("");
  const [uoRate, setUoRate] = useState(""); const [weight, setWeight] = useState("");

  const ans = (key, val, label) => setState(s => ({
    step: s.step + 1, answers: { ...s.answers, [key]: val }, trail: [...s.trail, label]
  }));
  const reset = () => { setState(INITIAL); setCrBase(""); setCrNow(""); setUoRate(""); setWeight(""); };

  const crBaseVal = parseFloat(crBase) || 0;
  const crNowVal = parseFloat(crNow) || 0;
  const crRatio = crBaseVal > 0 ? crNowVal / crBaseVal : 0;
  const uoVal = parseFloat(uoRate) || 0;

  const getKDIGOStage = () => {
    if (crRatio >= 3 || crNowVal >= 353.6 || uoVal < 0.3) return { stage: 3, label: "KDIGO Stage 3", color: "red", risk: "red" };
    if (crRatio >= 2 || (uoVal < 0.5 && uoVal >= 0.3)) return { stage: 2, label: "KDIGO Stage 2", color: "orange", risk: "orange" };
    if (crRatio >= 1.5 || (crNowVal - crBaseVal) >= 26.5 || uoVal < 0.5) return { stage: 1, label: "KDIGO Stage 1", color: "yellow", risk: "yellow" };
    return null;
  };
  const kdigo = getKDIGOStage();

  // pRIFLE for pediatrics
  const getPRIFLE = () => {
    if (!crBaseVal || !crNowVal) return null;
    const rise = crNowVal / crBaseVal;
    if (rise >= 3 || uoVal < 0.3) return "Failure (F)";
    if (rise >= 2 || uoVal < 0.5) return "Injury (I)";
    if (rise >= 1.5) return "Risk (R)";
    return null;
  };
  const prifile = getPRIFLE();

  // ── Step 0: Staging ────────────────────────────────────────────────────────
  if (step === 0) return (
    <div className="space-y-3">
      <EngineHeader title="AKI Diagnostic Engine" subtitle="Staging → Pre/Intrinsic/Post-renal → Cause → RRT Decision" color="red" onReset={reset} step={1} totalSteps={6} />
      <div className="grid grid-cols-2 gap-2">
        {[["Baseline Creatinine (µmol/L)", crBase, setCrBase], ["Current Creatinine (µmol/L)", crNow, setCrNow],
          ["Urine Output (mL/kg/h)", uoRate, setUoRate], ["Weight (kg)", weight, setWeight]].map(([label, val, setter]) => (
          <div key={label}>
            <label className="text-xs font-semibold text-slate-600">{label}</label>
            <input type="number" value={val} onChange={e => setter(e.target.value)} placeholder={label.split("(")[0]}
              className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-red-400" />
          </div>
        ))}
      </div>
      {kdigo && (
        <div className={`rounded-xl border-2 p-3 ${kdigo.stage === 3 ? "border-red-500 bg-red-50" : kdigo.stage === 2 ? "border-orange-400 bg-orange-50" : "border-yellow-400 bg-yellow-50"}`}>
          <p className={`text-sm font-black ${kdigo.stage === 3 ? "text-red-800" : kdigo.stage === 2 ? "text-orange-800" : "text-yellow-800"}`}>
            ⚡ {kdigo.label} {prifile && `· pRIFLE: ${prifile}`}
          </p>
          <p className="text-xs mt-1 opacity-80">Cr ratio: {crRatio.toFixed(2)}× baseline{uoVal ? ` · UO: ${uoVal} mL/kg/h` : ""}</p>
          {kdigo.stage === 3 && <p className="text-xs font-bold text-red-700 mt-1">⚡ Consider urgent RRT evaluation — AEIOU criteria below</p>}
        </div>
      )}
      <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs">
        <p className="font-bold text-red-800 mb-1">RRT Triggers (AEIOU — any ONE = consider urgent dialysis):</p>
        {["A — Acidosis: pH <7.1 or HCO3 <10 despite bicarbonate therapy",
          "E — Electrolytes: K >6.5 or refractory hyperkalaemia",
          "I — Intoxication: dialysable toxin (methanol, lithium, salicylates)",
          "O — Overload: fluid overload >10% body weight, pulmonary oedema",
          "U — Uraemia: BUN >100 mg/dL, encephalopathy, pericarditis, bleeding"
        ].map((a, i) => <div key={i} className="flex items-start gap-1.5"><ArrowRight className="w-3 h-3 text-red-500 flex-shrink-0 mt-0.5" /><span className="text-red-900">{a}</span></div>)}
      </div>
      <button onClick={() => ans("staged", true, kdigo ? kdigo.label : "AKI Confirmed")}
        className="w-full py-2.5 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700 transition-colors">
        AKI Confirmed → Find the Cause
      </button>
    </div>
  );

  // ── Step 1: Pre / Intrinsic / Post-renal ──────────────────────────────────
  if (step === 1) return (
    <div className="space-y-3">
      <EngineHeader title="AKI Engine" color="red" subtitle="Step 2: Classification" onReset={reset} step={2} totalSteps={6} />
      <PathwayTrail steps={trail} />
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs space-y-1">
        <p className="font-bold text-slate-700">Clinical Clues:</p>
        <p><span className="text-orange-600 font-semibold">Pre-renal:</span> dehydration, vomiting, poor intake, burns, sepsis, haemorrhage, cardiac failure, hepatorenal</p>
        <p><span className="text-red-600 font-semibold">Intrinsic:</span> glomerulonephritis, ATN, AIN (drugs), TMA/HUS, vasculitis, myoglobinuria</p>
        <p><span className="text-blue-600 font-semibold">Post-renal:</span> urinary tract obstruction (PUV, stone, tumour, clot, ureterocele)</p>
      </div>
      <MultiChoiceCard
        question="What is the most likely AKI category based on clinical assessment?"
        color="red"
        options={[
          { label: "Pre-renal (hypovolaemia / hypoperfusion / cardiac)", onSelect: () => ans("category", "prerenal", "Pre-renal AKI") },
          { label: "Intrinsic renal (GN, ATN, AIN, HUS, vasculitis)", onSelect: () => ans("category", "intrinsic", "Intrinsic AKI") },
          { label: "Post-renal (obstruction)", onSelect: () => ans("category", "postrenal", "Post-renal AKI") },
          { label: "Uncertain — need to exclude categories", onSelect: () => ans("category", "unclear", "Uncertain — Workup Needed") },
        ]}
      />
    </div>
  );

  // ── Pre-renal ──────────────────────────────────────────────────────────────
  if (answers.category === "prerenal") return (
    <div className="space-y-3">
      <EngineHeader title="Pre-renal AKI" color="orange" subtitle="Hypovolaemia / Hypoperfusion" onReset={reset} />
      <PathwayTrail steps={[...trail, "Pre-renal → Fluid Challenge"]} />
      <ResultHeader diagnosis="Pre-renal AKI — Volume Depletion / Hypoperfusion" risk="orange" />
      <DifferentialTable rows={[
        { dx: "Dehydration / Gastroenteritis losses", pct: 50, label: "Most Common" },
        { dx: "Sepsis-induced hypoperfusion", pct: 20, label: "Common" },
        { dx: "Cardiac failure (low output)", pct: 10, label: "Check echo" },
        { dx: "Hepatorenal syndrome", pct: 5, label: "If liver disease" },
        { dx: "Burns / haemorrhage / DKA", pct: 10, label: "Context-dependent" },
        { dx: "NSAIDs / ACEi-induced", pct: 5, label: "Medication review" },
      ]} />
      <TreatmentPanel title="Pre-renal AKI Management" items={[
        "IV fluid challenge: 10–20 mL/kg 0.9% NaCl over 30–60 min (assess response)",
        "If no response after 2 boluses → reassess — intrinsic AKI?",
        "Target UO ≥1 mL/kg/h after resuscitation",
        "STOP NSAIDs, ACEi/ARB, nephrotoxins immediately",
        "Treat underlying cause: sepsis → antibiotics; DKA → insulin + fluids",
        "If UO does not improve after adequate resuscitation → escalate to ICU / nephrology",
        "Furosemide NOT indicated for pre-renal AKI (worsens hypovolaemia)"
      ]} />
      <InvestigationPanel
        mustOrder={["FE-Na <1% (pre-renal) vs >2% (intrinsic): Na / Cr urine and serum", "Urinalysis: granular casts (ATN), RBC casts (GN)", "Serum electrolytes, bicarbonate, BUN/Cr ratio (>20:1 pre-renal)", "Renal USG (rule out obstruction)"]}
        shouldOrder={["BNP / NT-proBNP (cardiac AKI)", "Blood cultures if sepsis"]}
      />
      <MonitoringPanel items={["Hourly urine output", "Creatinine every 12–24h during recovery", "Daily weight + strict I&O", "Reassess if no UO response after 2 fluid boluses → intrinsic workup"]} />
      <GuidelineSource text="KDIGO AKI 2012 · PRISM III pediatric critical care · pRIFLE criteria: Akcan-Arikan A, KI 2007" />
    </div>
  );

  // ── Post-renal ─────────────────────────────────────────────────────────────
  if (answers.category === "postrenal") return (
    <div className="space-y-3">
      <EngineHeader title="Post-renal AKI (Obstruction)" color="blue" subtitle="Urgent decompression" onReset={reset} />
      <PathwayTrail steps={[...trail, "Post-renal → Obstruction Protocol"]} />
      <ResultHeader diagnosis="Post-renal AKI — Urinary Tract Obstruction" risk="orange" urgent />
      <DifferentialTable rows={[
        { dx: "Posterior Urethral Valves (PUV) — boys", pct: 40, label: "Most Common (infants/boys)" },
        { dx: "Renal calculus / bilateral stones", pct: 20, label: "Consider" },
        { dx: "Pelvic tumour / extrinsic compression", pct: 15, label: "Older children" },
        { dx: "Ureterocele / ectopic ureter", pct: 10, label: "Female infants" },
        { dx: "Blood clot (post-biopsy / trauma)", pct: 5, label: "History-dependent" },
        { dx: "Neurogenic bladder (no urethral obstruction)", pct: 10, label: "Spina bifida / PUV" },
      ]} />
      <TreatmentPanel items={[
        "Urgent renal USG: hydronephrosis / dilated ureters / distended bladder → IMMEDIATE decompression",
        "Urethral catheterisation: if bladder outlet obstruction (PUV, clot) — expect post-obstruction diuresis",
        "Urology referral SAME DAY",
        "Monitor post-obstructive diuresis: replace 50–80% of urine output with 0.45% NaCl (prevent haemodynamic collapse)",
        "If bilateral upper tract obstruction: percutaneous nephrostomy",
        "Treat underlying cause: stone → ESWL/ureteroscopy; PUV → valve ablation"
      ]} />
      <InvestigationPanel
        mustOrder={["Urgent renal + bladder USG (dilated pelvicalyceal system)", "Urinalysis + culture (secondary UTI with obstruction = emergency)", "Creatinine every 12h", "Bladder scan / catheter UO measurement"]}
        shouldOrder={["MCU (PUV)", "CT KUB (stone — older children)", "MAG3 scan (function after decompression)"]}
      />
      <GuidelineSource text="EAU Paediatric Urology Guidelines 2023 · PUV: ESPUASG recommendations" />
    </div>
  );

  // ── Intrinsic: sub-cause ───────────────────────────────────────────────────
  if (answers.category === "intrinsic" || answers.category === "unclear") return (
    <div className="space-y-3">
      <EngineHeader title="Intrinsic AKI" color="red" subtitle="Step 3: Sub-classification" onReset={reset} step={3} totalSteps={6} />
      <PathwayTrail steps={trail} />
      <MultiChoiceCard
        question="What does clinical + urinalysis picture suggest?"
        detail="Urinalysis is the KEY discriminating test for intrinsic AKI"
        color="red"
        options={[
          { label: "Active sediment: RBC casts / proteinuria / haematuria (GN, vasculitis)", onSelect: () => ans("intrinsic_type", "gn", "Active Sediment → GN") },
          { label: "Granular/muddy brown casts (ATN — ischaemic or toxic)", onSelect: () => ans("intrinsic_type", "atn", "Granular Casts → ATN") },
          { label: "TMA triad: MAHA + thrombocytopenia + AKI (HUS/TTP)", onSelect: () => ans("intrinsic_type", "tma", "TMA Pattern → HUS/TTP") },
          { label: "Drug exposure + eosinophiluria / white cell casts (AIN)", onSelect: () => ans("intrinsic_type", "ain", "Drug History → AIN") },
          { label: "Myoglobinuria (brown urine, trauma, seizures, rhabdo)", onSelect: () => ans("intrinsic_type", "rhabdo", "Myoglobinuria → Rhabdo") },
        ]}
      />
    </div>
  );

  // ── Intrinsic sub-results ──────────────────────────────────────────────────
  if (answers.intrinsic_type === "gn") return (
    <div className="space-y-3">
      <EngineHeader title="Intrinsic AKI — GN / Vasculitis" color="red" subtitle="Active sediment → RPGN workup" onReset={reset} />
      <PathwayTrail steps={[...trail, "Active Sediment → GN/Vasculitis"]} />
      <EmergencyBanner text="RBC casts + AKI = RPGN until proven otherwise. Urgent biopsy + ANCA/anti-GBM/ANA/C3 NOW." />
      <ResultHeader diagnosis="Glomerulonephritis / Crescentic GN — RPGN Protocol" risk="red" urgent />
      <DifferentialTable rows={[
        { dx: "RPGN (any cause) — crescentic GN", pct: 40, label: "Must exclude" },
        { dx: "PSGN (post-strep, low C3, 1–3 wks post-URTI)", pct: 25, label: "Most Common GN-AKI" },
        { dx: "Lupus Nephritis (Class III/IV)", pct: 15, label: "If ANA +" },
        { dx: "ANCA vasculitis (GPA/MPA)", pct: 10, label: "If ANCA +" },
        { dx: "Anti-GBM disease", pct: 5, label: "If anti-GBM +" },
        { dx: "IgA Nephropathy", pct: 5, label: "Post-URTI haematuria" },
      ]} />
      <InvestigationPanel
        mustOrder={["ANCA (MPO/PR3), anti-GBM, ANA/anti-dsDNA STAT", "C3, C4, CH50", "Urine microscopy (RBC casts)", "URGENT renal biopsy (24–48h)"]}
        shouldOrder={["ASO titre + anti-DNase B (PSGN)", "Urine protein:creatinine ratio", "CXR (pulmonary haemorrhage in AAV)"]}
      />
      <TreatmentPanel items={[
        "IMMEDIATE: pulse methylprednisolone 30 mg/kg (max 1g) × 3 days — do not wait for biopsy",
        "If ANCA/anti-GBM pending: treat empirically for RPGN",
        "See RPGN Engine for full disease-specific treatment"
      ]} />
    </div>
  );

  if (answers.intrinsic_type === "atn") return (
    <div className="space-y-3">
      <EngineHeader title="Acute Tubular Necrosis (ATN)" color="orange" subtitle="Ischaemic or nephrotoxic" onReset={reset} />
      <PathwayTrail steps={[...trail, "Granular Casts → ATN"]} />
      <ResultHeader diagnosis="Acute Tubular Necrosis (ATN)" risk="orange" />
      <DifferentialTable rows={[
        { dx: "Ischaemic ATN (sepsis, hypotension, cardiac surgery)", pct: 50, label: "Most Common" },
        { dx: "Aminoglycoside nephrotoxicity", pct: 20, label: "Medication review" },
        { dx: "Contrast nephropathy", pct: 10, label: "Recent imaging?" },
        { dx: "Haemoglobinuria / myoglobinuria-induced ATN", pct: 10, label: "Pigment nephropathy" },
        { dx: "NSAID / vancomycin / cisplatin ATN", pct: 10, label: "Drug review" },
      ]} />
      <TreatmentPanel items={[
        "STOP all nephrotoxins immediately (aminoglycosides, NSAIDs, contrast, vancomycin trough monitoring)",
        "Haemodynamic optimisation: MAP target, vasopressors if septic shock",
        "Fluid balance: avoid overload — daily weight, strict I&O",
        "Furosemide: NOT proven to prevent ATN or reduce dialysis need — avoid unless fluid overloaded",
        "Nutrition: adequate calories to prevent catabolism",
        "Dialysis if AEIOU criteria met",
        "Most ATN recovers in 1–3 weeks if cause removed"
      ]} />
      <MonitoringPanel items={["Creatinine daily", "Aminoglycoside levels (if continuing — trough <2, peak 8–10)", "Daily strict I&O", "Weekly electrolytes"]} />
    </div>
  );

  if (answers.intrinsic_type === "tma") return (
    <div className="space-y-3">
      <EngineHeader title="TMA — HUS / TTP" color="red" subtitle="Use TMA Decision Engine" onReset={reset} />
      <EmergencyBanner text="TMA triad confirmed. Proceed to TMA/HUS Decision Engine for full workup." />
      <ResultHeader diagnosis="Thrombotic Microangiopathy (TMA) — HUS / TTP / aHUS" risk="red" urgent />
      <TreatmentPanel items={[
        "ADAMTS13 level STAT (if <10% → TTP → urgent PEX)",
        "Shiga-toxin stool culture / PCR (if prodromal diarrhoea → STEC-HUS → supportive only, NO antibiotics)",
        "Complement panel: C3, C4, CFH, anti-CFH Ab (aHUS pathway)",
        "Do NOT delay eculizumab in aHUS pending genetics",
        "See HUS/TMA Engine for full decision pathway"
      ]} />
    </div>
  );

  if (answers.intrinsic_type === "ain") return (
    <div className="space-y-3">
      <EngineHeader title="Acute Interstitial Nephritis (AIN)" color="amber" subtitle="Drug-induced or immune-mediated" onReset={reset} />
      <PathwayTrail steps={[...trail, "Drug History → AIN"]} />
      <ResultHeader diagnosis="Acute Interstitial Nephritis (AIN)" risk="orange" />
      <DifferentialTable rows={[
        { dx: "Drug-induced AIN (NSAIDs, PPIs, antibiotics — especially cephalosporins)", pct: 70, label: "Most Common" },
        { dx: "Immune-mediated (TINU syndrome — uveitis + AIN)", pct: 15, label: "Check eyes" },
        { dx: "Infection-related (pyelonephritis, EBV, CMV, leptospirosis)", pct: 10, label: "Serology" },
        { dx: "Sarcoidosis", pct: 5, label: "Rare in children" },
      ]} />
      <TreatmentPanel items={[
        "STOP offending drug immediately",
        "Supportive care: fluid balance, electrolytes",
        "If no recovery after 1–2 weeks or severe: prednisolone 1 mg/kg/day × 4–6 weeks (evidence mixed but commonly used)",
        "TINU: ophthalmology review; steroid response usually good",
        "Biopsy if diagnosis uncertain or progressive despite drug withdrawal",
        "Most drug-induced AIN recovers over 2–6 weeks if offending drug stopped early"
      ]} />
      <InvestigationPanel
        mustOrder={["Full drug history (started/changed in last 3 months)", "Urinalysis: eosinophiluria (Wright stain), white cell casts", "Renal biopsy (inflammatory interstitial infiltrate + eosinophils)"]}
        shouldOrder={["Slit-lamp (TINU uveitis)", "EBV/CMV/leptospira serology", "ACE level (sarcoidosis)"]}
      />
    </div>
  );

  if (answers.intrinsic_type === "rhabdo") return (
    <div className="space-y-3">
      <EngineHeader title="Rhabdomyolysis-induced AKI" color="orange" subtitle="Pigment nephropathy — aggressive hydration" onReset={reset} />
      <PathwayTrail steps={[...trail, "Myoglobinuria → Rhabdomyolysis"]} />
      <ResultHeader diagnosis="Rhabdomyolysis-induced AKI" risk="orange" />
      <TreatmentPanel items={[
        "IV 0.9% NaCl: high-volume hydration to achieve UO >3 mL/kg/h (flush myoglobin)",
        "Monitor CK every 6–12h — target CK declining trend before reducing fluids",
        "Urinary alkalinisation (NaHCO3 to urine pH >6.5): controversial but often used",
        "STOP statins / causative drugs",
        "Treat cause: seizures → anticonvulsant; crush injury → decompression; hyperthermia → cool",
        "Dialysis if AKI refractory with AEIOU criteria",
        "Hyperkalaemia is common early — see Hyperkalemia Engine"
      ]} />
      <InvestigationPanel
        mustOrder={["CK (creatine kinase — >10× ULN = significant rhabdo)", "Urine myoglobin (brown/tea-coloured urine, dip ++ blood, no RBCs on microscopy)", "Electrolytes (hyperK, hypoCa, hyperphosphat)", "LDH, uric acid"]}
        shouldOrder={["Cause workup: CK isoforms, thyroid, viral (influenza, EBV)", "Compartment pressure if crush injury"]}
      />
      <GuidelineSource text="KDIGO AKI 2012 · Rhabdomyolysis management: Bosch X, Annals Int Med 2009" />
    </div>
  );

  return (
    <div className="space-y-3">
      <EngineHeader title="AKI Engine" color="red" subtitle="Continue assessment" onReset={reset} />
      <PathwayTrail steps={trail} />
      <p className="text-sm text-slate-500 text-center py-4">Continue selecting answers to narrow the diagnosis.</p>
    </div>
  );
}