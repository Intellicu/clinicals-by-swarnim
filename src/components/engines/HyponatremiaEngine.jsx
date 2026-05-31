/**
 * Hyponatremia Intelligence Engine
 * Full LEILA-style step-by-step: True hyponatremia → osmolality → volume → urine Na/Osm → diagnosis
 */
import React, { useState } from "react";
import {
  EngineHeader, QuestionCard, MultiChoiceCard, PathwayTrail,
  DifferentialTable, InvestigationPanel, MonitoringPanel,
  GuidelineSource, ResultHeader, ReasoningPanel, TreatmentPanel, EmergencyBanner
} from "./EngineShell";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, ArrowRight } from "lucide-react";

const INITIAL = { step: 0, answers: {}, trail: ["Hyponatremia Suspected"] };

export default function HyponatremiaEngine() {
  const [state, setState] = useState(INITIAL);
  const { step, answers, trail } = state;
  const [na, setNa] = useState(""); const [glucose, setGlucose] = useState("");
  const [uNa, setUNa] = useState(""); const [uOsm, setUOsm] = useState("");
  const [sOsm, setSOsm] = useState("");

  const ans = (key, val, label) => setState(s => ({
    step: s.step + 1, answers: { ...s.answers, [key]: val }, trail: [...s.trail, label]
  }));
  const reset = () => { setState(INITIAL); setNa(""); setGlucose(""); setUNa(""); setUOsm(""); setSOsm(""); };

  const naVal = parseFloat(na) || 0;
  const glucoseVal = parseFloat(glucose) || 0;
  const correctedNa = naVal + (1.6 * ((glucoseVal - 100) / 100)); // Katz correction
  const sOsmVal = parseFloat(sOsm) || 0;
  const uNaVal = parseFloat(uNa) || 0;
  const uOsmVal = parseFloat(uOsm) || 0;

  // ── Step 0: Confirm Na ────────────────────────────────────────────────────
  if (step === 0) return (
    <div className="space-y-3">
      <EngineHeader title="Hyponatremia Engine" subtitle="True hyponatremia → Osmolality → Volume → Diagnosis" color="cyan" onReset={reset} step={1} totalSteps={7} />
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs font-semibold text-slate-600">Serum Na (mEq/L)</label>
          <input type="number" value={na} onChange={e => setNa(e.target.value)} placeholder="e.g. 128"
            className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-cyan-400" />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-600">Serum Glucose (mg/dL)</label>
          <input type="number" value={glucose} onChange={e => setGlucose(e.target.value)} placeholder="e.g. 90"
            className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-cyan-400" />
        </div>
      </div>
      {naVal > 0 && naVal >= 135 && (
        <div className="rounded-xl border-2 border-green-400 bg-green-50 p-3 text-center">
          <p className="text-sm font-bold text-green-800">Na = {naVal} mEq/L — NORMONATRAEMIA. No hyponatremia.</p>
        </div>
      )}
      {naVal > 0 && naVal < 135 && glucoseVal > 150 && (
        <div className="rounded-xl border-2 border-amber-400 bg-amber-50 p-3">
          <p className="text-sm font-bold text-amber-800">Glucose {glucoseVal} mg/dL → Check for translocational hyponatremia</p>
          <p className="text-xs text-amber-700 mt-1">Corrected Na = {correctedNa.toFixed(1)} mEq/L (Katz formula: +1.6 per 100 mg/dL glucose rise above 100)</p>
          {correctedNa >= 135 && <p className="text-xs font-bold text-amber-800 mt-1">→ Corrected Na NORMAL — this is TRANSLOCATIONAL (pseudohyponatremia due to hyperglycaemia)</p>}
        </div>
      )}
      {naVal > 0 && naVal < 135 && (
        <button onClick={() => ans("na_low", true, `Na ${naVal} mEq/L — Confirmed Low`)}
          className="w-full py-2.5 rounded-xl bg-cyan-600 text-white text-sm font-bold hover:bg-cyan-700 transition-colors">
          Na &lt; 135 Confirmed → Proceed
        </button>
      )}
      <div className="bg-cyan-50 border border-cyan-200 rounded-xl p-3 text-xs text-cyan-800">
        <p className="font-bold mb-1">Severity Classification:</p>
        <p>Mild: 130–134 · Moderate: 125–129 · Severe: &lt;125 mEq/L</p>
        <p className="mt-1 font-bold text-red-700">Symptomatic (&lt;125 + seizures/altered consciousness) = EMERGENCY</p>
      </div>
    </div>
  );

  // ── Step 1: Symptoms ───────────────────────────────────────────────────────
  if (step === 1) return (
    <div className="space-y-3">
      <EngineHeader title="Hyponatremia Engine" color="cyan" subtitle="Symptom Assessment" onReset={reset} step={2} totalSteps={7} />
      <PathwayTrail steps={trail} />
      {naVal < 125 && <EmergencyBanner text={`Na ${naVal} mEq/L — SEVERE. Check for seizures, altered consciousness, respiratory depression.`} />}
      <MultiChoiceCard
        question="What are the patient's symptoms?"
        detail="Neurological symptoms → hypertonic saline urgently"
        color="cyan"
        options={[
          { label: "Seizures / coma / respiratory depression (SEVERE)", onSelect: () => ans("symptoms", "severe", "Symptomatic (Severe)") },
          { label: "Headache, vomiting, confusion, drowsiness (MODERATE)", onSelect: () => ans("symptoms", "moderate", "Symptomatic (Moderate)") },
          { label: "Nausea, fatigue, muscle cramps (MILD)", onSelect: () => ans("symptoms", "mild", "Mild Symptoms") },
          { label: "Asymptomatic (incidental finding)", onSelect: () => ans("symptoms", "none", "Asymptomatic") },
        ]}
      />
    </div>
  );

  // ── Emergency branch ───────────────────────────────────────────────────────
  if (step === 2 && answers.symptoms === "severe") return (
    <div className="space-y-3">
      <EngineHeader title="Hyponatremia — EMERGENCY" color="red" subtitle="Hypertonic Saline Protocol" onReset={reset} />
      <EmergencyBanner text="SYMPTOMATIC SEVERE HYPONATREMIA — Hypertonic saline IMMEDIATELY. Do not wait for osmolality results." />
      <PathwayTrail steps={[...trail, "Symptomatic → Hypertonic Saline NOW"]} />
      <ResultHeader diagnosis="Symptomatic Severe Hyponatremia — Emergency Treatment" risk="red" urgent />
      <TreatmentPanel title="Emergency 3% NaCl Protocol" items={[
        "3% NaCl: 2 mL/kg IV bolus over 10–20 minutes (max 100 mL)",
        "Repeat 2 mL/kg bolus every 10 min up to 3 doses if seizures continue",
        "Target: raise Na by 4–6 mEq/L in first hour to abort seizures (not more)",
        "Once seizures stop: switch to controlled correction (max 10 mEq/L/24h)",
        "ICU monitoring — continuous ECG, neurology assessment",
        "Avoid 0.9% NaCl (insufficient to raise Na)",
        "Calculate water deficit: TBW × (target Na / current Na − 1)"
      ]} />
      <div className="bg-red-50 border-2 border-red-400 rounded-xl p-3">
        <p className="text-xs font-bold text-red-800 mb-1">OSMOTIC DEMYELINATION SYNDROME (ODS) RISK:</p>
        <p className="text-xs text-red-700">Never correct Na &gt;10 mEq/L in 24h or &gt;18 mEq/L in 48h in CHRONIC hyponatremia. Acute (&lt;48h duration) can be corrected more rapidly.</p>
      </div>
      <MonitoringPanel items={["Na every 1–2h until stable, then every 4–6h", "Strict fluid balance", "Neuro checks every 30 min during correction", "Consider 5% dextrose or DDAVP if Na rises too fast"]} />
      <GuidelineSource text="ESPNIC 2021 Hyponatremia guidelines · Verbalis JG, AJKD 2013 · NICE guideline NG29" />
    </div>
  );

  // ── Step 2: Serum osmolality ───────────────────────────────────────────────
  if (step === 2) return (
    <div className="space-y-3">
      <EngineHeader title="Hyponatremia Engine" color="cyan" subtitle="Step 2: Serum Osmolality" onReset={reset} step={3} totalSteps={7} />
      <PathwayTrail steps={trail} />
      <div>
        <label className="text-xs font-semibold text-slate-600">Measured Serum Osmolality (mOsm/kg)</label>
        <input type="number" value={sOsm} onChange={e => setSOsm(e.target.value)} placeholder="Normal: 275–295"
          className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-cyan-400" />
      </div>
      {sOsmVal > 0 && (
        <div className={`rounded-xl border-2 p-3 ${sOsmVal < 275 ? "border-cyan-400 bg-cyan-50" : sOsmVal > 295 ? "border-amber-400 bg-amber-50" : "border-green-400 bg-green-50"}`}>
          <p className="text-sm font-bold">{sOsmVal < 275 ? "HYPOTONIC (true hyponatremia)" : sOsmVal > 295 ? "HYPERTONIC — hyperglycaemia or mannitol" : "ISOTONIC — pseudohyponatremia (lipids/protein)"}</p>
        </div>
      )}
      <div className="flex flex-col gap-2">
        <button onClick={() => ans("osm", "hypotonic", "Hypotonic (<275)")}
          className="w-full py-2.5 rounded-xl bg-cyan-600 text-white text-sm font-bold hover:bg-cyan-700">Hypotonic (&lt;275 mOsm/kg) — True hyponatremia</button>
        <button onClick={() => ans("osm", "isotonic", "Isotonic (275–295)")}
          className="w-full py-2.5 rounded-xl bg-slate-200 text-slate-700 text-sm font-bold hover:bg-slate-300">Isotonic (275–295) — Pseudohyponatremia</button>
        <button onClick={() => ans("osm", "hypertonic", "Hypertonic (>295)")}
          className="w-full py-2.5 rounded-xl bg-amber-500 text-white text-sm font-bold hover:bg-amber-600">Hypertonic (&gt;295) — Translocation (hyperglycaemia / mannitol)</button>
      </div>
    </div>
  );

  // ── Isotonic / Hypertonic branches ────────────────────────────────────────
  if (step === 3 && answers.osm === "isotonic") return (
    <div className="space-y-3">
      <EngineHeader title="Pseudohyponatremia" color="cyan" subtitle="Isotonic hyponatremia" onReset={reset} />
      <PathwayTrail steps={[...trail, "Isotonic → Pseudohyponatremia"]} />
      <ResultHeader diagnosis="Pseudohyponatremia (laboratory artefact)" risk="green" />
      <DifferentialTable rows={[
        { dx: "Severe hyperlipidaemia (triglycerides >1000 mg/dL)", pct: 60, label: "Most Common" },
        { dx: "Severe hyperproteinaemia (myeloma, macroglobulinaemia)", pct: 35, label: "Common" },
        { dx: "THAM or glycine (post-surgical irrigation)", pct: 5, label: "Rare" },
      ]} />
      <InvestigationPanel mustOrder={["Serum triglycerides", "Total protein + protein electrophoresis", "Repeat Na by ion-selective electrode (not photometry)"]} />
      <GuidelineSource text="No Na correction required — treat underlying lipid/protein disorder. Confirm using direct ion-selective electrode method." />
    </div>
  );

  if (step === 3 && answers.osm === "hypertonic") return (
    <div className="space-y-3">
      <EngineHeader title="Hypertonic/Translocational Hyponatremia" color="amber" subtitle="Hyperglycaemia / Mannitol" onReset={reset} />
      <PathwayTrail steps={[...trail, "Hypertonic → Translocational"]} />
      <ResultHeader diagnosis="Translocational Hyponatremia (Hyperglycaemia or Mannitol)" risk="orange" />
      <TreatmentPanel items={[
        "Treat underlying cause (hyperglycaemia → insulin + hydration for DKA)",
        "Calculated corrected Na: Na + 1.6 × [(glucose − 100) / 100] — if corrected Na normal, no additional Na therapy",
        "Mannitol-induced: allow mannitol to clear; monitor serum osmolality",
        "Na normalises as glucose returns to normal"
      ]} />
    </div>
  );

  // ── Step 3: Volume status (hypotonic confirmed) ───────────────────────────
  if (step === 3) return (
    <div className="space-y-3">
      <EngineHeader title="Hyponatremia Engine" color="cyan" subtitle="Step 3: Volume Status" onReset={reset} step={4} totalSteps={7} />
      <PathwayTrail steps={trail} />
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs space-y-1">
        <p className="font-bold text-slate-700">Clinical Assessment:</p>
        <p><span className="text-red-600 font-semibold">Hypovolaemic:</span> dry mucosa, tachycardia, low JVP, skin tenting, weight ↓</p>
        <p><span className="text-blue-600 font-semibold">Euvolaemic:</span> normal exam, no oedema, no signs of dehydration</p>
        <p><span className="text-cyan-600 font-semibold">Hypervolaemic:</span> oedema, ascites, raised JVP, S3 gallop, pulmonary crackles</p>
      </div>
      <MultiChoiceCard
        question="What is the patient's volume status?"
        color="cyan"
        options={[
          { label: "Hypovolaemic (dehydrated — dry, tachycardic)", onSelect: () => ans("volume", "hypo", "Hypovolaemic") },
          { label: "Euvolaemic (clinically normal — no oedema, no dehydration)", onSelect: () => ans("volume", "eu", "Euvolaemic") },
          { label: "Hypervolaemic (oedematous — puffy, ascites, effusion)", onSelect: () => ans("volume", "hyper", "Hypervolaemic") },
        ]}
      />
    </div>
  );

  // ── Step 4: Urine Na ───────────────────────────────────────────────────────
  if (step === 4) return (
    <div className="space-y-3">
      <EngineHeader title="Hyponatremia Engine" color="cyan" subtitle="Step 4: Urine Sodium" onReset={reset} step={5} totalSteps={7} />
      <PathwayTrail steps={trail} />
      <div>
        <label className="text-xs font-semibold text-slate-600">Urine Sodium (mEq/L)</label>
        <input type="number" value={uNa} onChange={e => setUNa(e.target.value)} placeholder="Normal: variable"
          className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-cyan-400" />
      </div>
      {uNaVal > 0 && (
        <div className={`rounded-xl border-2 p-2.5 text-xs font-semibold ${uNaVal < 20 ? "border-orange-300 bg-orange-50 text-orange-800" : "border-blue-300 bg-blue-50 text-blue-800"}`}>
          Urine Na {uNaVal} mEq/L — {uNaVal < 20 ? "LOW (<20): EXTRARENAL sodium loss" : "HIGH (≥20): Renal sodium loss or SIADH"}
        </div>
      )}
      <div className="flex flex-col gap-2">
        <button onClick={() => ans("uNa", "low", "Urine Na <20 (Extrarenal)")} className="w-full py-2.5 rounded-xl bg-orange-500 text-white text-sm font-bold hover:bg-orange-600">
          Urine Na &lt; 20 (Extrarenal loss: vomiting, diarrhoea, sweating)
        </button>
        <button onClick={() => ans("uNa", "high", "Urine Na ≥20 (Renal)")} className="w-full py-2.5 rounded-xl bg-cyan-600 text-white text-sm font-bold hover:bg-cyan-700">
          Urine Na ≥ 20 (Renal loss: diuretics, SIADH, CSW, renal salt wasting)
        </button>
      </div>
    </div>
  );

  // ── Step 5: Urine osmolality ───────────────────────────────────────────────
  if (step === 5) return (
    <div className="space-y-3">
      <EngineHeader title="Hyponatremia Engine" color="cyan" subtitle="Step 5: Urine Osmolality" onReset={reset} step={6} totalSteps={7} />
      <PathwayTrail steps={trail} />
      <div>
        <label className="text-xs font-semibold text-slate-600">Urine Osmolality (mOsm/kg)</label>
        <input type="number" value={uOsm} onChange={e => setUOsm(e.target.value)} placeholder="e.g. 350"
          className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-cyan-400" />
      </div>
      <div className="flex flex-col gap-2">
        <button onClick={() => ans("uOsm", "high", "Urine Osm >100 (ADH present)")} className="w-full py-2.5 rounded-xl bg-cyan-600 text-white text-sm font-bold hover:bg-cyan-700">
          Urine Osm &gt; 100 (concentrated — ADH activity present)
        </button>
        <button onClick={() => ans("uOsm", "low", "Urine Osm <100 (ADH suppressed)")} className="w-full py-2.5 rounded-xl bg-slate-200 text-slate-700 text-sm font-bold hover:bg-slate-300">
          Urine Osm &lt; 100 (maximally dilute — ADH suppressed)
        </button>
      </div>
    </div>
  );

  // ── Final diagnosis outputs ────────────────────────────────────────────────
  const { volume, uNa: uNaAns, uOsm: uOsmAns, symptoms } = answers;

  // HYPOVOLAEMIC + LOW URINE Na
  if (volume === "hypo" && uNaAns === "low") return (
    <div className="space-y-3">
      <EngineHeader title="Hyponatremia Result" color="orange" subtitle="Hypovolaemic + Extrarenal loss" onReset={reset} />
      <PathwayTrail steps={trail} />
      <ResultHeader diagnosis="Hypovolaemic Hyponatremia — Extrarenal Salt Loss" risk="orange" />
      <DifferentialTable rows={[
        { dx: "Diarrhoea / gastroenteritis", pct: 60, label: "Most Likely" },
        { dx: "Vomiting (urine Na may be high due to bicarb wasting)", pct: 25, label: "Likely" },
        { dx: "Skin losses (burns, sweating, CF)", pct: 10, label: "Possible" },
        { dx: "Third-spacing (peritonitis, pancreatitis)", pct: 5, label: "Consider" },
      ]} />
      <TreatmentPanel items={[
        "Volume resuscitation: 0.9% NaCl 10–20 mL/kg bolus if haemodynamically compromised",
        "After volume restoration, switch to maintenance fluid (0.45% NaCl or 0.9% NaCl based on Na trend)",
        "Oral rehydration if mild/moderate dehydration + tolerating oral intake",
        "Correct underlying GI losses — stool culture if diarrhoea persists",
        "Na correction max 10 mEq/L/24h once haemodynamically stable"
      ]} />
      <MonitoringPanel items={["Na every 4–6h during active correction", "Strict I&O + daily weight", "Urine output ≥1 mL/kg/h target"]} />
    </div>
  );

  // HYPOVOLAEMIC + HIGH URINE Na
  if (volume === "hypo" && uNaAns === "high") return (
    <div className="space-y-3">
      <EngineHeader title="Hyponatremia Result" color="orange" subtitle="Hypovolaemic + Renal salt loss" onReset={reset} />
      <PathwayTrail steps={trail} />
      <ResultHeader diagnosis="Hypovolaemic Hyponatremia — Renal Salt Loss" risk="orange" />
      <DifferentialTable rows={[
        { dx: "Diuretic excess (thiazide most common)", pct: 40, label: "Very Likely" },
        { dx: "Cerebral Salt Wasting (CSW) — post-SAH, meningitis", pct: 25, label: "Consider" },
        { dx: "Salt-losing nephropathy (CAKUT, dysplasia)", pct: 15, label: "Possible" },
        { dx: "Adrenal insufficiency (high ACTH, low cortisol)", pct: 15, label: "Check cortisol" },
        { dx: "Mineralocorticoid deficiency / hypoaldosteronism", pct: 5, label: "Rare" },
      ]} />
      <ReasoningPanel reasons={[
        "Renal salt loss: despite volume depletion (which should trigger Na conservation), kidney continues to waste Na",
        "CSW: distinguish from SIADH by volume status — CSW is hypovolaemic, SIADH is euvolaemic",
        "Adrenal insufficiency: check 9am cortisol + ACTH — can mimic SIADH"
      ]} />
      <InvestigationPanel
        mustOrder={["Urine Na + Cr (FENa)", "Serum K+ (hypoaldosteronism → hyperkalaemia)", "9am cortisol + ACTH", "Medication review (diuretics, SSRI)"]}
        shouldOrder={["Renin + aldosterone", "Thyroid function", "CT/MRI brain if CSW suspected"]}
      />
      <TreatmentPanel items={[
        "Volume replacement: 0.9% NaCl — this is what distinguishes CSW from SIADH (SIADH worsens with saline)",
        "STOP diuretic if diuretic-induced",
        "Adrenal insufficiency: hydrocortisone IV/IM + fludrocortisone",
        "CSW: 0.9% NaCl + fludrocortisone 0.1–0.2 mg/day"
      ]} />
    </div>
  );

  // HYPERVOLAEMIC
  if (volume === "hyper") return (
    <div className="space-y-3">
      <EngineHeader title="Hyponatremia Result" color="blue" subtitle="Hypervolaemic hyponatremia" onReset={reset} />
      <PathwayTrail steps={trail} />
      <ResultHeader diagnosis="Hypervolaemic Hyponatremia — Oedematous States" risk="orange" />
      <DifferentialTable rows={[
        { dx: "Nephrotic Syndrome", pct: 40, label: "Most Common (check UPCR)" },
        { dx: "Congestive Heart Failure", pct: 30, label: "Check BNP, Echo" },
        { dx: "Liver cirrhosis / portal hypertension", pct: 20, label: "Check LFT, USS" },
        { dx: "Protein-losing enteropathy", pct: 5, label: "Check alpha-1 antitrypsin stool" },
        { dx: "Severe malnutrition / kwashiorkor", pct: 5, label: "Albumin very low" },
      ]} />
      <InvestigationPanel
        mustOrder={["UPCR (nephrotic)", "Albumin", "LFT (cirrhosis)", "BNP/NT-proBNP (CHF)", "Echo"]}
        shouldOrder={["Urine Na (low in NS/CHF/cirrhosis — secondary hyperaldosteronism)", "Alpha-1 antitrypsin stool (PLE)"]}
      />
      <TreatmentPanel items={[
        "Fluid restriction (free water): 50–70% of maintenance",
        "Treat underlying condition (NS → albumin + steroids; CHF → diuretics + ACEi)",
        "Furosemide: only if euvolaemic or to reduce oedema after albumin in NS",
        "Na correction: slow — avoid rapid shifts in cirrhosis/severe hyponatraemia"
      ]} />
    </div>
  );

  // EUVOLAEMIC outcomes
  if (volume === "eu" && uOsmAns === "low") return (
    <div className="space-y-3">
      <EngineHeader title="Hyponatremia Result" color="blue" subtitle="Primary polydipsia" onReset={reset} />
      <PathwayTrail steps={trail} />
      <ResultHeader diagnosis="Primary Polydipsia / Psychogenic Polydipsia" risk="yellow" />
      <DifferentialTable rows={[
        { dx: "Psychogenic polydipsia", pct: 70, label: "Most Likely" },
        { dx: "Iatrogenic (excess IV dextrose/hypotonic fluids)", pct: 25, label: "Check fluid chart" },
        { dx: "Reset osmostat (low Na set-point)", pct: 5, label: "Rare" },
      ]} />
      <TreatmentPanel items={[
        "Fluid restriction to <800 mL/m²/day",
        "Psychiatric evaluation if psychogenic",
        "Stop/reduce hypotonic fluids if iatrogenic",
        "Na corrects spontaneously with fluid restriction"
      ]} />
    </div>
  );

  if (volume === "eu" && uOsmAns === "high") return (
    <div className="space-y-3">
      <EngineHeader title="Hyponatremia Result" color="cyan" subtitle="SIADH vs Cortisol/Thyroid" onReset={reset} step={7} totalSteps={7} />
      <PathwayTrail steps={[...trail, "Euvolaemic + Urine Osm >100 → SIADH / Endocrine"]} />
      <ResultHeader diagnosis="Euvolaemic Hyponatremia — SIADH or Endocrine" risk="orange" />
      <DifferentialTable rows={[
        { dx: "SIADH (inappropriate ADH secretion)", pct: 60, label: "Most Common" },
        { dx: "Hypothyroidism", pct: 15, label: "Check TSH" },
        { dx: "Adrenal Insufficiency", pct: 15, label: "Check cortisol" },
        { dx: "CSW (cerebral salt wasting — usually hypovolaemic)", pct: 5, label: "Review volume" },
        { dx: "Medications (SSRIs, carbamazepine, vincristine, NSAIDs)", pct: 5, label: "Review meds" },
      ]} />
      <ReasoningPanel reasons={[
        "SIADH criteria: hyponatremia + low serum osm + urine osm >100 + urine Na >20 + euvolaemic + normal thyroid + normal adrenal",
        "Hypothyroidism: even mild TSH elevation can impair free water excretion — always check TSH",
        "Adrenal insufficiency: cortisol deficiency → impairs free water clearance — cortisol-ACTH essential",
        "SIADH diagnosis requires exclusion of thyroid and adrenal disease first"
      ]} />
      <InvestigationPanel
        mustOrder={["TSH, free T4 (hypothyroidism)", "9am Cortisol + ACTH stimulation test (adrenal insufficiency)", "Urine Na + osmolality (SIADH confirmation)", "CXR (pulmonary cause SIADH — pneumonia, TB)"]}
        shouldOrder={["CT chest (ectopic ADH — SCLC in older patients)", "CNS imaging (meningitis, SAH, brain tumour)", "Full medication review (SSRIs, CBZ, PPI, etc.)"]}
        advanced={["Copeptin level (AVP surrogate)", "MRI brain/pituitary if central cause"]}
      />
      <TreatmentPanel title="SIADH Treatment" items={[
        "Fluid restriction: 50–70% of maintenance (mainstay of SIADH)",
        "Na correction max 10 mEq/L/24h (chronic SIADH — ODS risk)",
        "Demeclocycline (blocks renal ADH effect) — rarely used in children",
        "Tolvaptan (V2R antagonist) — age >18y, specialist only, NOT in liver disease",
        "3% NaCl only if symptomatic (seizures/coma) — see Emergency protocol",
        "Treat underlying cause: stop offending drug, treat infection/malignancy"
      ]} />
      <MonitoringPanel items={[
        "Na every 6h during active correction",
        "Daily weight + strict fluid balance",
        "Repeat urine Na + osmolality at 24h",
        "Recheck TSH, cortisol at 48–72h if initial Na correction inadequate"
      ]} />
      <GuidelineSource text="Verbalis JG AJKD 2013 · ESPNIC Hyponatraemia Protocol · IPNA tubular disorders 2021 · SIADH: Schwartz & Bartter, Am J Med 1957" />
    </div>
  );

  return (
    <div className="space-y-3">
      <EngineHeader title="Hyponatremia Engine" color="cyan" subtitle="Continue assessment" onReset={reset} />
      <PathwayTrail steps={trail} />
      <p className="text-sm text-slate-500 text-center py-4">Continue answering questions to reach a diagnosis.</p>
    </div>
  );
}