/**
 * Hyperkalemia Deep Intelligence Engine
 * Full LEILA-style: K+ value → ECG → Severity → Cause → Dose-calculated treatment → Dialysis trigger
 */
import React, { useState } from "react";
import {
  EngineHeader, QuestionCard, MultiChoiceCard, PathwayTrail,
  DifferentialTable, InvestigationPanel, MonitoringPanel,
  GuidelineSource, ResultHeader, ReasoningPanel, TreatmentPanel, EmergencyBanner
} from "./EngineShell";
import { ArrowRight, AlertTriangle, Calculator } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const INITIAL = { step: 0, answers: {}, trail: ["Hyperkalaemia Suspected"] };

export default function HyperkalemiaDeepEngine() {
  const [state, setState] = useState(INITIAL);
  const { step, answers, trail } = state;
  const [k, setK] = useState("");
  const [wt, setWt] = useState("");

  const ans = (key, val, label) => setState(s => ({
    step: s.step + 1, answers: { ...s.answers, [key]: val }, trail: [...s.trail, label]
  }));
  const reset = () => { setState(INITIAL); setK(""); setWt(""); };

  const kVal = parseFloat(k) || 0;
  const wtVal = parseFloat(wt) || 0;

  const severity = kVal > 7 ? "critical" : kVal > 6.5 ? "severe" : kVal > 6 ? "moderate" : kVal > 5.5 ? "mild" : kVal > 0 ? "normal" : null;
  const sevLabel = { critical: "CRITICAL (>7.0)", severe: "SEVERE (6.5–7.0)", moderate: "MODERATE (6.0–6.5)", mild: "MILD (5.5–6.0)", normal: "NORMAL" };
  const sevColor = { critical: "border-red-600 bg-red-100 text-red-900", severe: "border-red-400 bg-red-50 text-red-800", moderate: "border-orange-400 bg-orange-50 text-orange-800", mild: "border-yellow-400 bg-yellow-50 text-yellow-800", normal: "border-green-400 bg-green-50 text-green-800" };

  // Dose calculations
  const caGluconate = wtVal > 0 ? `${(wtVal * 0.5).toFixed(1)}–${(wtVal * 1.0).toFixed(1)} mL of 10%` : "0.5–1 mL/kg";
  const insulinDose = wtVal > 0 ? `${(wtVal * 0.1).toFixed(2)} units regular insulin` : "0.1 units/kg";
  const dexDose = wtVal > 0 ? `${(wtVal * 2).toFixed(0)} mL of 25% dextrose` : "2 mL/kg D25";
  const nabicDose = wtVal > 0 ? `${(wtVal * 1).toFixed(0)}–${(wtVal * 2).toFixed(0)} mEq NaHCO3` : "1–2 mEq/kg";
  const salbutamolDose = wtVal > 0 ? (wtVal < 25 ? "2.5 mg nebulised" : "5 mg nebulised") : "2.5–5 mg nebulised";

  // ── Step 0: K+ value + weight ──────────────────────────────────────────────
  if (step === 0) return (
    <div className="space-y-3">
      <EngineHeader title="Hyperkalaemia Emergency Engine" subtitle="K+ → ECG → Severity → Cause → Dose Calculator → Dialysis" color="red" onReset={reset} step={1} totalSteps={6} />
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs font-semibold text-slate-600">Serum K+ (mEq/L)</label>
          <input type="number" step="0.1" value={k} onChange={e => setK(e.target.value)} placeholder="e.g. 6.8"
            className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-red-400" />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-600">Weight (kg)</label>
          <input type="number" value={wt} onChange={e => setWt(e.target.value)} placeholder="e.g. 20"
            className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-red-400" />
        </div>
      </div>
      {severity && severity !== "normal" && (
        <div className={`rounded-xl border-2 p-3 text-center ${sevColor[severity]}`}>
          <p className="text-lg font-black">K+ = {kVal} mEq/L — {sevLabel[severity]}</p>
          {(severity === "critical" || severity === "severe") && (
            <p className="text-xs font-bold mt-1 text-red-700">⚡ PERFORM ECG IMMEDIATELY</p>
          )}
        </div>
      )}
      {kVal > 5.5 && (
        <button onClick={() => ans("k_confirmed", true, `K+ ${kVal} — ${sevLabel[severity] || "Elevated"}`)}
          className="w-full py-2.5 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700">
          Confirm Hyperkalaemia → Next Step
        </button>
      )}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs">
        <p className="font-bold text-amber-800 mb-1">⚠ Pseudo-hyperkalaemia checklist:</p>
        {["Haemolysed sample (repeat if sample haemolysed)", "Thrombocytosis >1000 × 10⁹/L (platelet lysis in clotted tube)", "Leukocytosis >100 × 10⁹/L", "Prolonged tourniquet / clenched fist — re-collect without tourniquet"].map((p, i) => (
          <div key={i} className="flex items-start gap-1.5"><ArrowRight className="w-3 h-3 text-amber-500 flex-shrink-0 mt-0.5" /><span className="text-amber-900">{p}</span></div>
        ))}
      </div>
    </div>
  );

  // ── Step 1: ECG ────────────────────────────────────────────────────────────
  if (step === 1) return (
    <div className="space-y-3">
      <EngineHeader title="Hyperkalaemia Engine" color="red" subtitle="Step 2: ECG Assessment" onReset={reset} step={2} totalSteps={6} />
      <PathwayTrail steps={trail} />
      {(severity === "critical" || severity === "severe") && (
        <EmergencyBanner text="SEVERE/CRITICAL hyperkalaemia — ECG MANDATORY before any other steps. Calcium gluconate IMMEDIATELY if ECG changes." />
      )}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs space-y-1">
        <p className="font-bold text-slate-700">ECG Evolution of Hyperkalaemia:</p>
        {["5.5–6.0: Peaked/tall T waves (first sign)", "6.0–6.5: Prolonged PR interval, widening QRS", "6.5–7.0: Flattening/absent P waves", ">7.0: Wide QRS, sine wave pattern, VF/VT risk"].map((e, i) => (
          <div key={i} className="flex items-start gap-1.5"><ArrowRight className="w-3 h-3 text-slate-500 flex-shrink-0 mt-0.5" /><span>{e}</span></div>
        ))}
      </div>
      <MultiChoiceCard
        question="What does the ECG show?"
        color="red"
        options={[
          { label: "No ECG changes (normal rhythm)", onSelect: () => ans("ecg", "normal", "ECG Normal") },
          { label: "Peaked T waves only", onSelect: () => ans("ecg", "peaked_t", "ECG: Peaked T waves") },
          { label: "Wide QRS / prolonged PR / absent P waves", onSelect: () => ans("ecg", "wide_qrs", "ECG: Wide QRS") },
          { label: "Sine wave pattern / bradycardia / VT/VF", onSelect: () => ans("ecg", "sine", "ECG: Sine wave / Arrest risk") },
          { label: "Not yet performed", onSelect: () => ans("ecg", "pending", "ECG Pending") },
        ]}
      />
    </div>
  );

  // ── Emergency: sine wave / VT ───────────────────────────────────────────────
  if (answers.ecg === "sine") return (
    <div className="space-y-3">
      <EngineHeader title="Hyperkalaemia EMERGENCY" color="red" subtitle="Cardiac arrest risk — Call resuscitation team" onReset={reset} />
      <EmergencyBanner text="SINE WAVE / VT/VF — CARDIAC ARREST IMMINENT. Call resuscitation team NOW. Calcium gluconate bolus immediately." />
      <PathwayTrail steps={[...trail, "Sine Wave → Cardiac Emergency"]} />
      <ResultHeader diagnosis="Life-threatening Hyperkalaemia — Cardiac Emergency Protocol" risk="red" urgent />
      <TreatmentPanel title="SIMULTANEOUS — All steps NOW" items={[
        `1. CALCIUM GLUCONATE 10%: ${caGluconate} IV over 3–5 min (NOT calcium chloride unless CVC) — CARDIAC MEMBRANE STABILISATION`,
        `2. INSULIN + DEXTROSE: ${insulinDose} + ${dexDose} IV over 15 min — SHIFTS K INTO CELLS`,
        `3. SALBUTAMOL: ${salbutamolDose} via nebuliser (lowers K by 0.5–1 mEq/L) — concurrent`,
        `4. SODIUM BICARBONATE: ${nabicDose} IV over 15 min IF pH <7.2 or acidosis`,
        "5. Continuous cardiac monitoring — defibrillator ready",
        "6. URGENT DIALYSIS: Seize central access now — these steps are bridges to dialysis",
        "7. ICU call IMMEDIATELY — this patient cannot be managed on ward"
      ]} />
      <div className="bg-red-50 border-2 border-red-400 rounded-xl p-3 text-xs">
        <p className="font-bold text-red-800">⚡ Ca gluconate effect: ONSET 1–3 min, DURATION 30–60 min — buy time for dialysis</p>
        <p className="text-red-700 mt-1">Do NOT give sodium bicarbonate with calcium (precipitates). Give in separate lines.</p>
      </div>
      <GuidelineSource text="Paediatric Advanced Life Support (PALS) · KDIGO AKI 2012 · Mahoney BA, Ann Emerg Med 2005" />
    </div>
  );

  // ── Step 2: Why hyperkalaemia? ──────────────────────────────────────────────
  if (step === 2) return (
    <div className="space-y-3">
      <EngineHeader title="Hyperkalaemia Engine" color="red" subtitle="Step 3: Find the Cause" onReset={reset} step={3} totalSteps={6} />
      <PathwayTrail steps={trail} />
      <MultiChoiceCard
        question="What is the most likely underlying cause?"
        detail="Identifying cause guides both acute treatment AND long-term management"
        color="red"
        options={[
          { label: "AKI / CKD (reduced renal K excretion)", onSelect: () => ans("cause", "renal", "AKI/CKD → Renal Retention") },
          { label: "Metabolic acidosis (transcellular shift)", onSelect: () => ans("cause", "acidosis", "Acidosis → Transcellular Shift") },
          { label: "Medications: ACEi / ARB / tacrolimus / spironolactone", onSelect: () => ans("cause", "drugs", "Drug-induced") },
          { label: "Tumour lysis / haemolysis / rhabdomyolysis (K release)", onSelect: () => ans("cause", "release", "Cellular K Release") },
          { label: "Adrenal insufficiency / hypoaldosteronism / Type 4 RTA", onSelect: () => ans("cause", "adrenal", "Adrenal / Mineralocorticoid Deficiency") },
          { label: "High dietary K in oliguric patient", onSelect: () => ans("cause", "dietary", "Dietary Excess + Poor Excretion") },
        ]}
      />
    </div>
  );

  // ── Step 3: Dialysis assessment ────────────────────────────────────────────
  if (step === 3) return (
    <div className="space-y-3">
      <EngineHeader title="Hyperkalaemia Engine" color="red" subtitle="Step 4: RRT Indication?" onReset={reset} step={4} totalSteps={6} />
      <PathwayTrail steps={trail} />
      <QuestionCard
        question="Does the patient have ANY of: oligoanuria, K >7 despite treatment, K+ rising despite all medical therapy?"
        detail="Any ONE = dialysis indicated"
        onYes={() => ans("dialysis_needed", true, "RRT Indicated")}
        onNo={() => ans("dialysis_needed", false, "Medical Management")}
        color="red"
      />
    </div>
  );

  // ── Dialysis pathway ───────────────────────────────────────────────────────
  if (answers.dialysis_needed === true) return (
    <div className="space-y-3">
      <EngineHeader title="Hyperkalaemia — Dialysis Required" color="red" subtitle="RRT modality selection" onReset={reset} />
      <EmergencyBanner text="DIALYSIS REQUIRED — Bridge with medical therapy while arranging access." />
      <PathwayTrail steps={[...trail, "RRT Indicated"]} />
      <ResultHeader diagnosis="Refractory Hyperkalaemia — Urgent Dialysis" risk="red" urgent />
      <TreatmentPanel title="Bridge therapy while arranging dialysis" items={[
        `Calcium gluconate 10%: ${caGluconate} IV over 5–10 min REPEAT every 30 min if ECG changes persist`,
        `Insulin-dextrose: ${insulinDose} + ${dexDose} IV — can repeat every 4–6h`,
        `Salbutamol: ${salbutamolDose} nebulised every 2–4h`,
        "Sodium polystyrene sulfonate (kayexalate) 1 g/kg PR — slow but removes K",
        "Furosemide 1–2 mg/kg IV if not anuric (promotes renal K excretion)",
        "Continuous cardiac monitoring — repeat K every 1–2h"
      ]} />
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs space-y-1">
        <p className="font-bold text-blue-800">RRT Modality Selection:</p>
        <p><span className="font-semibold">Haemodynamically stable + older child:</span> Haemodialysis (fastest K removal)</p>
        <p><span className="font-semibold">Haemodynamically unstable / ICU / infant:</span> CRRT (continuous renal replacement)</p>
        <p><span className="font-semibold">Infant &lt;10 kg (no HD access):</span> PD (peritoneal dialysis) — slower but accessible</p>
      </div>
      <GuidelineSource text="KDIGO AKI 2012 · PALS Hyperkalaemia Protocol · Mahoney BA Ann Emerg Med 2005" />
    </div>
  );

  // ── Medical management (no immediate dialysis) ─────────────────────────────
  if (answers.dialysis_needed === false) return (
    <div className="space-y-3">
      <EngineHeader title="Hyperkalaemia — Medical Management" color="orange" subtitle="Step-by-step treatment" onReset={reset} />
      <PathwayTrail steps={trail} />
      <ResultHeader diagnosis={`Hyperkalaemia (${sevLabel[severity] || ""}) — Medical Treatment Protocol`} risk={severity === "moderate" ? "orange" : "yellow"} />

      {(answers.ecg === "peaked_t" || answers.ecg === "wide_qrs" || severity === "severe" || severity === "critical") && (
        <Card className="border-red-300 bg-red-50">
          <CardContent className="p-3">
            <p className="text-xs font-bold text-red-800 mb-1.5">Step 1: MEMBRANE STABILISATION (ECG changes present)</p>
            <div className="flex items-start gap-1.5 text-xs text-red-900"><ArrowRight className="w-3 h-3 text-red-500 flex-shrink-0 mt-0.5" />
              <span><strong>Calcium gluconate 10%: {caGluconate}</strong> IV over 5–10 min slowly (cardiac monitor on). ONSET: 1–3 min. REPEAT at 30 min if ECG persists.</span>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-orange-300 bg-orange-50">
        <CardContent className="p-3">
          <p className="text-xs font-bold text-orange-800 mb-1.5">Step 2: SHIFT K+ INTO CELLS (15–30 min onset)</p>
          {[
            `Insulin-dextrose: ${insulinDose} + ${dexDose} IV over 30 min → Monitor glucose at 30 min and 60 min (hypoglycaemia risk)`,
            `Salbutamol (nebulised): ${salbutamolDose} — lowers K by 0.5–1.5 mEq/L. Safe, effective adjunct.`,
            answers.cause === "acidosis" ? `Sodium bicarbonate: ${nabicDose} IV over 30–60 min — only if pH <7.2 (less effective in normoacidaemic patients)` : ""
          ].filter(Boolean).map((item, i) => (
            <div key={i} className="flex items-start gap-1.5 text-xs text-orange-900 mb-1"><ArrowRight className="w-3 h-3 text-orange-500 flex-shrink-0 mt-0.5" /><span>{item}</span></div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-blue-200">
        <CardContent className="p-3">
          <p className="text-xs font-bold text-blue-800 mb-1.5">Step 3: REMOVE K+ FROM BODY (hours–days)</p>
          {[
            "Furosemide 1–2 mg/kg IV (if not anuric + volume adequate) → renal K excretion",
            "Sodium polystyrene sulfonate (resonium) 1 g/kg PO/PR — sorbitol-free preparation; onset 2–6h",
            "Patiromer (if available) — non-absorbed polymer, onset 7h, better tolerated than resonium",
            "K-restricted diet: avoid bananas, tomatoes, orange juice, dried fruit, chocolate",
            "STOP ACEi/ARB/potassium-sparing diuretics/tacrolimus dose review"
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-1.5 text-xs text-blue-900 mb-1"><ArrowRight className="w-3 h-3 text-blue-500 flex-shrink-0 mt-0.5" /><span>{item}</span></div>
          ))}
        </CardContent>
      </Card>

      <DifferentialTable rows={[
        { dx: "AKI-induced (most common paediatric cause)", pct: answers.cause === "renal" ? 90 : 30, label: answers.cause === "renal" ? "Confirmed" : "Common" },
        { dx: "Drug-induced (ACEi/ARB/tacrolimus/spironolactone)", pct: answers.cause === "drugs" ? 90 : 20, label: answers.cause === "drugs" ? "Confirmed" : "Review meds" },
        { dx: "Acidosis-mediated transcellular shift", pct: answers.cause === "acidosis" ? 90 : 15, label: answers.cause === "acidosis" ? "Confirmed" : "Check pH" },
        { dx: "Tumour lysis / cellular release", pct: answers.cause === "release" ? 90 : 10, label: answers.cause === "release" ? "Confirmed" : "Context" },
        { dx: "Adrenal / Type 4 RTA", pct: answers.cause === "adrenal" ? 90 : 5, label: answers.cause === "adrenal" ? "Confirmed" : "Less likely" },
      ]} />

      <MonitoringPanel items={[
        "Repeat K+ 1 hour after insulin-dextrose",
        "Glucose 30 min and 60 min post insulin (hypoglycaemia)",
        "ECG repeat after calcium administration and at 2h",
        "K+ every 4–6h until stable (K <5.5 × 2 consecutive readings)",
        "Review causative medications — nephrology input for CKD/transplant patients"
      ]} />

      <ReasoningPanel reasons={[
        "Calcium gluconate: does NOT lower K — it PROTECTS the myocardium from arrhythmia (raises excitation threshold)",
        "Insulin drives K into cells via Na/K ATPase — dextrose prevents hypoglycaemia (1:10 units/mL rule)",
        "Salbutamol acts via β2 receptors → activates Na/K ATPase → lowers K by 0.5–1.5 mEq/L",
        "Only step 3 (removal) actually lowers total body K — steps 1 and 2 are temporary bridges",
        "Furosemide only works if kidneys are functioning — useless in severe AKI/anuric patients"
      ]} />

      <GuidelineSource text="KDIGO AKI 2012 · Mahoney BA Ann Emerg Med 2005 · Paediatric Formulary 2024 · Elliott MJ, BMJ 2010" />
    </div>
  );

  return (
    <div className="space-y-3">
      <EngineHeader title="Hyperkalaemia Engine" color="red" subtitle="Continue assessment" onReset={reset} />
      <PathwayTrail steps={trail} />
      <p className="text-sm text-slate-500 text-center py-4">Continue answering to reach the treatment plan.</p>
    </div>
  );
}