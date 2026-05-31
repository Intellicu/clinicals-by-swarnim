/**
 * Hyperkalemia Emergency Engine — Full LEILA-style
 * K+ → ECG → Severity → Cause → Dose Calculators → Dialysis Decision
 */
import React, { useState } from "react";
import {
  EngineHeader, QuestionCard, MultiChoiceCard, PathwayTrail,
  DifferentialTable, InvestigationPanel, MonitoringPanel,
  GuidelineSource, ResultHeader, ReasoningPanel, TreatmentPanel, EmergencyBanner
} from "./EngineShell";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, ArrowRight, Calculator } from "lucide-react";

const INITIAL = { step: 0, answers: {}, trail: ["K+ Elevated"] };

function DoseCalc({ weight }) {
  const wt = parseFloat(weight) || 0;
  if (!wt) return null;
  const caGluc = (wt * 0.5).toFixed(1); // 0.5 mL/kg of 10% calcium gluconate
  const caGlucMax = Math.min(wt * 0.5, 20).toFixed(1);
  const insulin = (wt * 0.1).toFixed(2); // 0.1 U/kg regular insulin
  const dextrose = (wt * 2).toFixed(0); // 2 mL/kg of D25
  const bicarb = (wt * 1).toFixed(0); // 1–2 mEq/kg NaHCO3
  const salb = wt < 25 ? "2.5 mg" : "5 mg";
  const furos = (wt * 1.5).toFixed(0); // 1–2 mg/kg

  return (
    <div className="bg-orange-50 border-2 border-orange-300 rounded-xl p-3 space-y-2">
      <div className="flex items-center gap-1.5">
        <Calculator className="w-3.5 h-3.5 text-orange-700" />
        <p className="text-xs font-bold text-orange-800">Weight-Based Dose Calculator ({wt} kg)</p>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        {[
          ["Ca Gluconate 10%", `${caGlucMax} mL IV over 5–10 min`, "Membrane stabilisation"],
          ["Insulin (Regular)", `${insulin} U IV`, "Shift K+ into cells"],
          ["Dextrose 25%", `${dextrose} mL IV with insulin`, "With insulin bolus"],
          ["NaHCO₃ 8.4%", `${bicarb} mEq IV over 30 min`, "If acidotic (pH <7.2)"],
          ["Salbutamol neb.", `${salb} nebulised`, "Shift K+ (onset 30 min)"],
          ["Furosemide", `${furos} mg IV`, "Remove K+ (if UO present)"],
        ].map(([drug, dose, note], i) => (
          <div key={i} className="bg-white rounded-lg p-2 border border-orange-200">
            <p className="font-bold text-orange-900">{drug}</p>
            <p className="text-orange-800 font-semibold">{dose}</p>
            <p className="text-orange-600 italic">{note}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function HyperkalemiaEngine() {
  const [state, setState] = useState(INITIAL);
  const { step, answers, trail } = state;
  const [k, setK] = useState(""); const [weight, setWeight] = useState("");

  const ans = (key, val, label) => setState(s => ({
    step: s.step + 1, answers: { ...s.answers, [key]: val }, trail: [...s.trail, label]
  }));
  const reset = () => { setState(INITIAL); setK(""); setWeight(""); };

  const kVal = parseFloat(k) || 0;
  const severity = kVal > 7 ? "critical" : kVal > 6.5 ? "severe" : kVal > 6 ? "moderate" : kVal > 5.5 ? "mild" : "normal";
  const severityColors = {
    critical: "border-red-600 bg-red-50 text-red-900",
    severe:   "border-red-400 bg-red-50 text-red-800",
    moderate: "border-orange-400 bg-orange-50 text-orange-800",
    mild:     "border-amber-400 bg-amber-50 text-amber-800",
    normal:   "border-green-400 bg-green-50 text-green-800"
  };

  if (step === 0) return (
    <div className="space-y-3">
      <EngineHeader title="Hyperkalemia Emergency Engine" subtitle="K+ → ECG → Severity → Dose Calculators → Dialysis" color="red" onReset={reset} step={1} totalSteps={6} />
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs font-semibold text-slate-600">Serum K+ (mEq/L)</label>
          <input type="number" step="0.1" value={k} onChange={e => setK(e.target.value)} placeholder="e.g. 6.8"
            className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-red-400" />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-600">Patient weight (kg)</label>
          <input type="number" value={weight} onChange={e => setWeight(e.target.value)} placeholder="e.g. 20"
            className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-red-400" />
        </div>
      </div>
      {kVal > 0 && (
        <div className={`rounded-xl border-2 p-3 text-center font-bold ${severityColors[severity]}`}>
          K+ = {kVal} mEq/L — {severity.toUpperCase()} HYPERKALEMIA
          {severity === "critical" && <p className="text-xs font-normal mt-1">⚡ CALL FOR HELP. ECG NOW. Ca gluconate IMMEDIATELY.</p>}
        </div>
      )}
      {kVal > 5.5 && (
        <button onClick={() => ans("k_confirmed", true, `K+ ${kVal} mEq/L — ${severity}`)}
          className="w-full py-2.5 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700">
          Proceed with Hyperkalemia Protocol →
        </button>
      )}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs">
        <p className="font-bold text-amber-800 mb-1">Always exclude: pseudohyperkalaemia</p>
        <p className="text-amber-700">Haemolysis (traumatic venepuncture) · Thrombocytosis · Leucocytosis · Delayed processing</p>
        <p className="text-amber-700 mt-0.5">Repeat K+ from free-flowing sample if suspected — platelet-poor plasma K+</p>
      </div>
    </div>
  );

  if (step === 1) return (
    <div className="space-y-3">
      <EngineHeader title="Hyperkalemia Engine" color="red" subtitle="Step 2: ECG Assessment" onReset={reset} step={2} totalSteps={6} />
      <PathwayTrail steps={trail} />
      {(severity === "critical" || severity === "severe") && <EmergencyBanner text="SEVERE/CRITICAL: Ca gluconate NOW while ECG is being set up. Do not wait for ECG if K+ >7." />}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs space-y-1">
        <p className="font-bold text-slate-700">Progressive ECG changes with rising K+:</p>
        {[
          "K 5.5–6.0: Peaked narrow T waves (earliest sign — tall, symmetrical)",
          "K 6.0–6.5: PR prolongation, QRS widening begins",
          "K 6.5–7.0: Wide QRS, flat P waves, LBBB/RBBB pattern",
          "K >7.0: Sine wave pattern (QRS merges with T) — imminent VF/arrest"
        ].map((e, i) => <div key={i} className="flex items-start gap-1.5"><ArrowRight className="w-3 h-3 text-slate-400 flex-shrink-0 mt-0.5" /><span>{e}</span></div>)}
      </div>
      <MultiChoiceCard
        question="What do the ECG findings show?"
        color="red"
        options={[
          { label: "Normal ECG (no changes)", onSelect: () => ans("ecg", "normal", "ECG Normal") },
          { label: "Peaked T waves only", onSelect: () => ans("ecg", "peaked_t", "Peaked T waves") },
          { label: "Wide QRS / PR prolongation / flat P waves", onSelect: () => ans("ecg", "wide_qrs", "Wide QRS") },
          { label: "Sine wave / VF / VT / cardiac arrest", onSelect: () => ans("ecg", "arrest", "Sine wave / Arrest") },
        ]}
      />
    </div>
  );

  if (step === 2 && answers.ecg === "arrest") return (
    <div className="space-y-3">
      <EngineHeader title="CARDIAC ARREST — K+-Induced" color="red" subtitle="CODE BLUE" onReset={reset} />
      <EmergencyBanner text="CARDIAC ARREST. Follow PALS/ALS algorithm. Calcium + DIALYSIS immediately after ROSC." />
      <PathwayTrail steps={[...trail, "Sine wave / VF → ARREST PROTOCOL"]} />
      <TreatmentPanel title="During CPR" items={[
        "10% Ca gluconate 0.5–1 mL/kg IV PUSH (max 20 mL) — immediately",
        "NaHCO3 1–2 mEq/kg IV push — alkalise to shift K+",
        "D25 2 mL/kg + Insulin 0.1 U/kg IV — even during arrest",
        "Standard PALS/ALS: adrenaline, shock if VF/pVT",
        "Call nephrology + intensivist: EMERGENT DIALYSIS after ROSC"
      ]} />
    </div>
  );

  if (step === 2) return (
    <div className="space-y-3">
      <EngineHeader title="Hyperkalemia Engine" color="red" subtitle="Step 3: Find the Cause" onReset={reset} step={3} totalSteps={6} />
      <PathwayTrail steps={trail} />
      <MultiChoiceCard
        question="What is the most likely cause of hyperkalemia?"
        detail="Identifying the cause guides removal strategy and prevents recurrence"
        color="red"
        options={[
          { label: "AKI / CKD (reduced renal K+ excretion)", onSelect: () => ans("cause", "aki_ckd", "AKI/CKD") },
          { label: "Medications: ACEi/ARB, tacrolimus, trimethoprim, NSAID", onSelect: () => ans("cause", "drugs", "Drug-induced") },
          { label: "Metabolic acidosis (transcellular shift)", onSelect: () => ans("cause", "acidosis", "Acidosis") },
          { label: "Tumour lysis / rhabdomyolysis (K+ release)", onSelect: () => ans("cause", "tls", "TLS / Rhabdomyolysis") },
          { label: "Adrenal insufficiency / hypoaldosteronism", onSelect: () => ans("cause", "adrenal", "Adrenal / Hypoaldosteronism") },
          { label: "Haemolysis / pseudohyperkalaemia (check repeat)", onSelect: () => ans("cause", "pseudo", "Pseudohyperkalaemia") },
        ]}
      />
    </div>
  );

  // ── Final output with full treatment ──────────────────────────────────────
  const getUrgency = () => {
    if (answers.ecg === "wide_qrs" || severity === "critical") return "red";
    if (answers.ecg === "peaked_t" || severity === "severe") return "orange";
    if (severity === "moderate") return "orange";
    return "yellow";
  };

  const needsCalcium = answers.ecg !== "normal" || severity === "critical" || severity === "severe";
  const needsDialysis = severity === "critical" || answers.cause === "aki_ckd" || (severity === "severe" && answers.ecg !== "normal");

  if (step >= 3 && answers.cause) return (
    <div className="space-y-3">
      <EngineHeader title="Hyperkalemia Treatment Protocol" color="red" subtitle="3-Step: Stabilise → Shift → Remove" onReset={reset} />
      <PathwayTrail steps={trail} />
      <ResultHeader
        diagnosis={`Hyperkalemia — K+ ${kVal} mEq/L (${severity.toUpperCase()}) + ${answers.ecg === "normal" ? "Normal ECG" : "ECG changes: " + answers.ecg} + ${answers.cause}`}
        risk={getUrgency()}
        urgent={needsCalcium}
      />

      {weight && <DoseCalc weight={weight} />}

      {needsCalcium && (
        <TreatmentPanel title="STEP 1: Membrane Stabilisation (IMMEDIATE — onset 1–3 min)" items={[
          `10% Calcium gluconate ${parseFloat(weight) ? `${Math.min(parseFloat(weight) * 0.5, 20).toFixed(1)} mL` : "0.5–1 mL/kg (max 20 mL)"} IV slowly over 5–10 min with ECG monitoring`,
          "REPEAT if ECG not improving after 5 min — max 3 doses",
          "Duration of effect: 30–60 min only — must immediately proceed to SHIFT + REMOVE",
          "Do NOT give calcium chloride into peripheral veins (tissue necrosis risk)"
        ]} />
      )}

      <TreatmentPanel title="STEP 2: K+ Shift Into Cells (onset 15–30 min)" items={[
        `Insulin-dextrose: Regular insulin ${parseFloat(weight) ? `${(parseFloat(weight) * 0.1).toFixed(2)} U` : "0.1 U/kg"} + D25 ${parseFloat(weight) ? `${(parseFloat(weight) * 2).toFixed(0)} mL` : "2 mL/kg"} IV over 30 min`,
        `Salbutamol nebulisation: ${parseFloat(weight) > 25 ? "5 mg" : "2.5 mg"} — reduces K+ by 0.5–1 mEq/L over 30–90 min`,
        answers.cause === "acidosis" ? `NaHCO3 ${parseFloat(weight) ? `${(parseFloat(weight) * 1).toFixed(0)} mEq` : "1–2 mEq/kg"} IV over 30 min (ONLY if pH <7.2)` : "NaHCO3: only if pH <7.2 (limited effect at normal pH)",
        "Monitor blood glucose every 30 min (insulin → hypoglycaemia risk)"
      ]} />

      <TreatmentPanel title="STEP 3: K+ Removal From Body (sustained effect)" items={[
        answers.cause === "drugs" ? "STOP causative drug (ACEi/ARB/tacrolimus) — check drug chart" : "",
        "Sodium polystyrene sulfonate (Kayexalate) 1 g/kg PO/PR — slow onset 1–6h",
        "OR Patiromer 8.4 g sachet (preferred: no sorbitol, better tolerated)",
        `Furosemide ${parseFloat(weight) ? `${(parseFloat(weight) * 1.5).toFixed(0)} mg` : "1–2 mg/kg"} IV — ONLY if urine output adequate (>1 mL/kg/h)`,
        answers.cause === "tls" ? "Rasburicase for TLS: 0.2 mg/kg IV (reduces uric acid which worsens AKI)" : "",
        answers.cause === "adrenal" ? "Fludrocortisone 0.1–0.2 mg/day + hydrocortisone for adrenal insufficiency" : "",
      ].filter(Boolean)} />

      {needsDialysis && (
        <div className="bg-red-50 border-2 border-red-400 rounded-xl p-3">
          <p className="text-xs font-bold text-red-800 mb-1.5">⚡ DIALYSIS INDICATED</p>
          {[
            "K+ >7 mEq/L OR K+ >6.5 with ECG changes AND not responding to above",
            "Anuric/oliguric AKI with no capacity for renal K+ excretion",
            severity === "critical" ? "CRITICAL — set up dialysis NOW while medical treatment given" : "",
            "Modality: HD if hemodynamically stable and >20 kg; CRRT or PD if smaller/unstable"
          ].filter(Boolean).map((r, i) => <div key={i} className="flex items-start gap-1.5 text-xs text-red-900"><ArrowRight className="w-3 h-3 text-red-400 flex-shrink-0 mt-0.5" />{r}</div>)}
        </div>
      )}

      <DifferentialTable rows={[
        answers.cause === "aki_ckd" ? { dx: "Impaired renal K+ excretion (AKI/CKD)", pct: 90, label: "Confirmed" } : { dx: "AKI/CKD", pct: 20, label: "Possible" },
        answers.cause === "drugs" ? { dx: "Drug-induced (ACEi/ARB/tacrolimus/TMP)", pct: 85, label: "Confirmed" } : { dx: "Drug-induced", pct: 20, label: "Review meds" },
        answers.cause === "acidosis" ? { dx: "Transcellular shift (metabolic acidosis)", pct: 80, label: "Confirmed" } : { dx: "Acidosis-driven shift", pct: 15, label: "Check pH" },
        { dx: "Pseudohyperkalaemia (repeat if suspected)", pct: 5, label: "Exclude" },
      ].sort((a, b) => b.pct - a.pct)} />

      <InvestigationPanel
        mustOrder={["Repeat K+ 1h after treatment", "ECG continuous monitoring", "Creatinine + BUN + eGFR", "Blood gas (pH, HCO3)"]}
        shouldOrder={["Urine K+ + creatinine (TTKG if CKD)", "Aldosterone + renin (if recurrent)", "Medication review"]}
        advanced={["Genetic panel if: recurrent + young + no AKI (pseudohypoaldosteronism type II, Gordon syndrome)"]}
      />
      <MonitoringPanel items={[
        "K+ every 1–2h during acute treatment",
        "ECG continuous until K+ <5.5",
        "Blood glucose every 30 min (insulin-dextrose)",
        "Target K+ <5.5 mEq/L before stopping calcium",
        "24h K+ once stable, then daily until cause corrected"
      ]} />
      <GuidelineSource text="KDIGO AKI 2012 · UK Renal Association Hyperkalemia 2020 · Masilamani K Lancet 2013 · Patiromer: Bakris Hyperkalemia trial" />
    </div>
  );

  return (
    <div className="space-y-3">
      <EngineHeader title="Hyperkalemia Engine" color="red" subtitle="Assessment in progress" onReset={reset} />
      <PathwayTrail steps={trail} />
      <p className="text-sm text-slate-500 text-center py-4">Continue answering questions to reach the treatment protocol.</p>
    </div>
  );
}