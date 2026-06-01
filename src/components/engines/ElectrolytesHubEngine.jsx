/**
 * Electrolytes Hub Engine
 * Master selector → individual electrolyte disorder engines
 * Covers: Hyperkalemia, Hypokalemia, Hypernatremia, Hyponatremia, Hypercalcemia, Hypocalcemia, Hypomagnesemia
 */
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ChevronRight, Zap } from "lucide-react";
import HyperkalemiaDeepEngine from "./HyperkalemiaDeepEngine";
import HyponatremiaEngine from "./HyponatremiaEngine";

const DISORDERS = [
  { id: "hyperkalemia", label: "Hyperkalemia", icon: "K⁺↑", desc: "K+ >5.5 mEq/L — ECG → severity → causes → Tx", color: "bg-red-50 border-red-300 text-red-900", badge: "bg-red-600", emergency: true },
  { id: "hypokalemia", label: "Hypokalemia", icon: "K⁺↓", desc: "K+ <3.5 mEq/L — causes → renal vs GI vs shift → Tx", color: "bg-amber-50 border-amber-300 text-amber-900", badge: "bg-amber-600" },
  { id: "hypernatremia", label: "Hypernatremia", icon: "Na⁺↑", desc: "Na+ >145 — water deficit → DI vs GI loss → correction", color: "bg-orange-50 border-orange-300 text-orange-900", badge: "bg-orange-600", emergency: true },
  { id: "hyponatremia", label: "Hyponatremia", icon: "Na⁺↓", desc: "Na+ <135 — osmolality → volume → SIADH/CSW/GI", color: "bg-cyan-50 border-cyan-300 text-cyan-900", badge: "bg-cyan-600", emergency: true },
  { id: "hypercalcemia", label: "Hypercalcemia", icon: "Ca²⁺↑", desc: "Ca >2.75 mmol/L — PTH-mediated vs malignancy vs others", color: "bg-yellow-50 border-yellow-300 text-yellow-900", badge: "bg-yellow-600" },
  { id: "hypocalcemia", label: "Hypocalcemia", icon: "Ca²⁺↓", desc: "Ca <2.1 mmol/L — neonatal → PTH → Vit D → Tx", color: "bg-blue-50 border-blue-300 text-blue-900", badge: "bg-blue-600", emergency: true },
  { id: "hypomagnesemia", label: "Hypomagnesemia", icon: "Mg²⁺↓", desc: "Mg <0.7 mmol/L — GI loss vs renal wasting → Tx", color: "bg-purple-50 border-purple-300 text-purple-900", badge: "bg-purple-600" },
  { id: "metabolic_alkalosis", label: "Metabolic Alkalosis", icon: "HCO₃⁺↑", desc: "HCO₃ >26 — generation vs maintenance → Cl-responsive vs resistant", color: "bg-green-50 border-green-300 text-green-900", badge: "bg-green-600" },
];

// Individual engine content for disorders not yet having a dedicated file
const HypokalemiaEngine = () => {
  const [step, setStep] = useState(0);
  const [k, setK] = useState(""); const [wt, setWt] = useState("");
  const [history, setHistory] = useState([]);
  const go = (s) => { setHistory(h => [...h, step]); setStep(s); };
  const back = () => { const p = history[history.length - 1]; if (p !== undefined) { setHistory(h => h.slice(0, -1)); setStep(p); } };

  const kVal = parseFloat(k) || 0;
  const wtVal = parseFloat(wt) || 0;
  const severity = kVal > 0 ? (kVal < 2.5 ? "severe" : kVal < 3.0 ? "moderate" : kVal < 3.5 ? "mild" : "normal") : null;
  const sevColors = { severe: "border-red-500 bg-red-50 text-red-900", moderate: "border-orange-400 bg-orange-50 text-orange-900", mild: "border-amber-400 bg-amber-50 text-amber-900", normal: "border-green-400 bg-green-50 text-green-900" };

  const ivKDose = wtVal > 0 ? `${(wtVal * 0.3).toFixed(1)} mEq (0.3 mEq/kg) IV over 1h — monitor ECG` : "0.3 mEq/kg IV over 1h";
  const oralKDose = wtVal > 0 ? `${(wtVal * 2).toFixed(0)}–${(wtVal * 4).toFixed(0)} mg KCl (2–4 mEq/kg/day) oral divided BD–TID` : "2–4 mEq/kg/day oral";

  return (
    <div className="space-y-3">
      {step === 0 && (
        <>
          <div className="grid grid-cols-2 gap-2">
            <div><label className="text-xs font-semibold text-slate-600">Serum K+ (mEq/L)</label>
              <input type="number" step="0.1" value={k} onChange={e => setK(e.target.value)} placeholder="e.g. 2.8" className="w-full mt-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-amber-400" /></div>
            <div><label className="text-xs font-semibold text-slate-600">Weight (kg)</label>
              <input type="number" value={wt} onChange={e => setWt(e.target.value)} placeholder="e.g. 20" className="w-full mt-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-amber-400" /></div>
          </div>
          {severity && severity !== "normal" && <div className={`rounded-xl border-2 p-3 ${sevColors[severity]}`}><p className="font-bold text-lg">K+ = {kVal} — {severity.toUpperCase()}</p>{severity === "severe" && <p className="text-xs font-bold mt-1">⚡ ECG MANDATORY — risk of paralysis, arrhythmia, respiratory failure</p>}</div>}
          {kVal > 0 && kVal < 3.5 && <button onClick={() => go(1)} className="w-full py-2.5 rounded-xl bg-amber-600 text-white text-sm font-bold">Confirm Hypokalemia → Find Cause</button>}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs">
            <p className="font-bold text-amber-800 mb-1">ECG changes in Hypokalemia:</p>
            {["2.5–3.5: Flattening of T waves; prominent U waves (after T wave)", "2.0–2.5: ST depression; biphasic T waves; wide QRS", "<2.0: Fusion of T and U waves; torsades de pointes risk; VT/VF"].map((p, i) => <p key={i} className="text-amber-900">• {p}</p>)}
          </div>
        </>
      )}
      {step === 1 && (
        <div className="space-y-2">
          <p className="text-sm font-semibold">What is the likely cause?</p>
          {[
            { label: "GI losses — vomiting, diarrhoea, ileostomy, laxative abuse", next: 2 },
            { label: "Renal wasting — diuretics, RTA, Bartter/Gitelman, Fanconi", next: 3 },
            { label: "Transcellular shift — insulin, alkalosis, β2-agonists, refeeding", next: 4 },
            { label: "Inadequate intake / poor nutrition", next: 5 },
          ].map(opt => (
            <button key={opt.label} onClick={() => go(opt.next)} className="w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 border-slate-200 bg-white hover:border-amber-400 text-left text-sm">
              {opt.label} <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0 ml-2" />
            </button>
          ))}
          <Button variant="outline" size="sm" className="w-full" onClick={back}><ArrowLeft className="w-3.5 h-3.5 mr-1" />Back</Button>
        </div>
      )}
      {[2, 3, 4, 5].includes(step) && (
        <div className="space-y-3">
          <div className="rounded-xl border-2 border-amber-200 bg-amber-50 p-3 text-xs space-y-2">
            <p className="font-bold text-amber-900">{["GI Loss Hypokalemia", "Renal Wasting Hypokalemia", "Transcellular Shift Hypokalemia", "Inadequate Intake"][step - 2]}</p>
            {step === 2 && [["Urine K <20 mEq/day or UK:UCr <1.5 — confirms extrarenal loss", "Correct underlying GI cause", "Oral KCl solution preferred: 2–4 mEq/kg/day in divided doses", "Monitor Mg (hypomagnesemia inhibits K repletion — check Mg first)", "Vomiting → also consider metabolic alkalosis (H⁺ loss)"]].map((arr) => arr.map((it, i) => <p key={i} className="text-amber-800">• {it}</p>))}
            {step === 3 && [["Urine K >20 mEq/day or UK:UCr >1.5 — renal wasting", "Diuretics: withhold if possible; add K-sparing (amiloride, spironolactone)", "dRTA (type 1 RTA): urine pH >5.5 + non-AG acidosis; potassium citrate", "Bartter: loop diuretic-like (Na-K-2Cl) → indomethacin + KCl + Mg", "Gitelman: thiazide-like (NaCl cotransporter) → Mg replacement first; amiloride + KCl", "Fanconi: generalised tubular wasting — treat underlying cause"]].map((arr) => arr.map((it, i) => <p key={i} className="text-amber-800">• {it}</p>))}
            {step === 4 && [["Identify and treat underlying trigger", "Insulin excess: reduce insulin; monitor K every 1–2h", "Alkalosis-induced: treat alkalosis; K will redistribute", "Refeeding: introduce nutrition gradually; supplement K (3–5 mEq/kg/day during refeeding)", "Usually transient — does NOT require IV K bolus unless symptomatic"]].map((arr) => arr.map((it, i) => <p key={i} className="text-amber-800">• {it}</p>))}
            {step === 5 && [["Check serum Mg (low Mg → refractory hypokalemia)", "Increase dietary K: bananas, oranges, avocado, lentils, potatoes", "Oral KCl supplement: 2–4 mEq/kg/day"]].map((arr) => arr.map((it, i) => <p key={i} className="text-amber-800">• {it}</p>))}
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs space-y-1">
            <p className="font-bold text-slate-700">Replacement Protocol (weight {wtVal || "?"} kg)</p>
            <p className="text-slate-700"><span className="font-semibold">Mild (3.0–3.5):</span> {oralKDose}</p>
            <p className="text-slate-700"><span className="font-semibold">Moderate (2.5–3.0):</span> IV + oral — {ivKDose}; max 0.5 mEq/kg/h via central line</p>
            <p className="text-red-700 font-semibold"><span className="font-bold">Severe (&lt;2.5):</span> IV ONLY — {ivKDose} with continuous cardiac monitoring; replace Mg simultaneously</p>
            <p className="text-slate-600">⚠ Never give K+ IV push. Max peripheral IV: 40 mEq/L; Central: 80–100 mEq/L. Rate ≤0.3 mEq/kg/h.</p>
          </div>
          <div className="rounded-xl border border-green-200 bg-green-50 p-3 text-xs">
            <p className="font-bold text-green-800 mb-1">Monitoring</p>
            {["Repeat K+ after 2–4h of IV replacement", "Check Mg (low Mg = refractory hypokalemia — replace Mg first)", "ECG at baseline and after replacement if K <2.5", "Urine K/Cr ratio to distinguish renal vs extrarenal cause"].map((m, i) => <p key={i} className="text-green-800">• {m}</p>)}
          </div>
          <Button variant="outline" size="sm" className="w-full" onClick={back}><ArrowLeft className="w-3.5 h-3.5 mr-1" />Back</Button>
        </div>
      )}
    </div>
  );
};

const HypernatremiaEngine = () => {
  const [step, setStep] = useState(0);
  const [na, setNa] = useState(""); const [wt, setWt] = useState("");
  const [history, setHistory] = useState([]);
  const go = (s) => { setHistory(h => [...h, step]); setStep(s); };
  const back = () => { const p = history[history.length - 1]; if (p !== undefined) { setHistory(h => h.slice(0, -1)); setStep(p); } };
  const naVal = parseFloat(na) || 0; const wtVal = parseFloat(wt) || 0;
  const waterDeficit = (naVal > 145 && wtVal > 0) ? ((naVal / 145 - 1) * wtVal * 0.6).toFixed(1) : null;

  return (
    <div className="space-y-3">
      {step === 0 && (
        <>
          <div className="grid grid-cols-2 gap-2">
            <div><label className="text-xs font-semibold text-slate-600">Serum Na (mEq/L)</label>
              <input type="number" value={na} onChange={e => setNa(e.target.value)} placeholder="e.g. 152" className="w-full mt-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-orange-400" /></div>
            <div><label className="text-xs font-semibold text-slate-600">Weight (kg)</label>
              <input type="number" value={wt} onChange={e => setWt(e.target.value)} placeholder="e.g. 20" className="w-full mt-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-orange-400" /></div>
          </div>
          {naVal >= 145 && <div className={`rounded-xl border-2 p-3 ${naVal >= 160 ? "border-red-500 bg-red-50 text-red-900" : naVal >= 150 ? "border-orange-400 bg-orange-50 text-orange-900" : "border-amber-400 bg-amber-50 text-amber-900"}`}>
            <p className="font-bold">Na = {naVal} — {naVal >= 160 ? "SEVERE" : naVal >= 150 ? "MODERATE" : "MILD"} Hypernatremia</p>
            {waterDeficit && <p className="text-xs mt-1">Estimated water deficit: <strong>{waterDeficit} L</strong> (TBW formula: (Na/145 − 1) × 0.6 × weight)</p>}
            {naVal >= 160 && <p className="text-xs font-bold mt-1 text-red-700">⚡ SEVERE — rapid correction risks cerebral oedema; max 10–12 mEq/L/24h</p>}
          </div>}
          {naVal >= 145 && <button onClick={() => go(1)} className="w-full py-2.5 rounded-xl bg-orange-600 text-white text-sm font-bold">Classify Cause →</button>}
        </>
      )}
      {step === 1 && (
        <div className="space-y-2">
          <p className="text-sm font-semibold">Clinical classification of hypernatremia:</p>
          {[
            { label: "Hypovolaemic — signs of dehydration (tachycardia, dry mucosa, oliguria)", next: 2 },
            { label: "Hypervolaemic — iatrogenic (excess NaHCO₃, NaCl, mineralocorticoid excess)", next: 3 },
            { label: "Euvolaemic — Diabetes Insipidus (polyuria + dilute urine)", next: 4 },
          ].map(opt => (
            <button key={opt.label} onClick={() => go(opt.next)} className="w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 border-slate-200 bg-white hover:border-orange-400 text-left text-sm">
              {opt.label} <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0 ml-2" />
            </button>
          ))}
          <Button variant="outline" size="sm" className="w-full" onClick={back}><ArrowLeft className="w-3.5 h-3.5 mr-1" />Back</Button>
        </div>
      )}
      {[2, 3, 4].includes(step) && (
        <div className="space-y-3">
          {step === 2 && (
            <div className="space-y-2 text-xs">
              <div className="rounded-xl border-2 border-orange-200 bg-orange-50 p-3">
                <p className="font-bold text-orange-900">Hypovolaemic Hypernatremia — Water + sodium deficit (water loss exceeds Na)</p>
                {["Causes: gastroenteritis (GE most common in children), insensible losses (fever, tachypnoea, heat), osmotic diuresis (hyperglycaemia), burns", "Urine Na <20: extrarenal loss (GE, skin) | Urine Na >20: osmotic diuresis", "Neonatal: insufficient breastfeeding, hypernatraemic dehydration — common; may present Na >160"].map((c, i) => <p key={i} className="text-orange-800 mt-1">• {c}</p>)}
              </div>
              <div className="rounded-xl border border-blue-200 bg-blue-50 p-3">
                <p className="font-bold text-blue-900">Correction Protocol (ESPNIC / Paediatric Consensus)</p>
                {["Phase 1 (if shocked): 0.9% NaCl 10–20 mL/kg bolus (correct circulatory failure first)", "Phase 2 (correction): 0.45% NaCl (or 0.9% NaCl if Na >170) SLOWLY", `Total fluid needed = water deficit (${waterDeficit || "calculate"} L) + maintenance over 48h`, "MAX correction rate: 10 mEq/L per 24h (risk of cerebral oedema if too fast)", "Monitor Na every 4–6h during correction", "Oral/NG rehydration if conscious and tolerating: lower risk of over-rapid correction"].map((c, i) => <p key={i} className="text-blue-800">• {c}</p>)}
              </div>
            </div>
          )}
          {step === 3 && (
            <div className="rounded-xl border-2 border-orange-200 bg-orange-50 p-3 text-xs space-y-1">
              <p className="font-bold text-orange-900">Hypervolaemic Hypernatremia — Excess Sodium</p>
              {["Causes: excess NaHCO₃ (CPR, neonatal resuscitation), hypertonic saline overinfusion, hyperaldosteronism, Cushing's", "Treatment: furosemide (remove Na faster than water if renal function adequate)", "Dialysis if refractory or renal failure (hyperosmolar CRRT/HD)", "Identify and stop iatrogenic source"].map((c, i) => <p key={i} className="text-orange-800">• {c}</p>)}
            </div>
          )}
          {step === 4 && (
            <div className="rounded-xl border-2 border-amber-200 bg-amber-50 p-3 text-xs space-y-1">
              <p className="font-bold text-amber-900">Euvolaemic Hypernatremia — Diabetes Insipidus (DI)</p>
              {["Urine osmolality <300 mOsm/kg despite plasma hyperosmolality = DI", "Proceed to Polyuria Engine for DDAVP test (Central DI vs Nephrogenic DI)", "Central DI: DDAVP intranasal/SC/oral; monitor for hyponatraemia", "Nephrogenic DI: low-solute diet + HCTZ + amiloride + indomethacin", "Correct hypernatraemia: 0.45% NaCl or 5% dextrose (free water) at max 10 mEq/L/24h correction rate"].map((c, i) => <p key={i} className="text-amber-800">• {c}</p>)}
              <button onClick={() => {}} className="mt-2 text-blue-600 underline text-xs font-semibold">→ See Polyuria/DI Engine for full DDAVP protocol</button>
            </div>
          )}
          <Button variant="outline" size="sm" className="w-full" onClick={back}><ArrowLeft className="w-3.5 h-3.5 mr-1" />Back</Button>
        </div>
      )}
    </div>
  );
};

const HypercalcemiaEngine = () => {
  const [step, setStep] = useState(0);
  const [ca, setCa] = useState("");
  const [history, setHistory] = useState([]);
  const go = (s) => { setHistory(h => [...h, step]); setStep(s); };
  const back = () => { const p = history[history.length - 1]; if (p !== undefined) { setHistory(h => h.slice(0, -1)); setStep(p); } };
  const caVal = parseFloat(ca) || 0;
  const severity = caVal >= 3.5 ? "severe" : caVal >= 3.0 ? "moderate" : caVal > 2.75 ? "mild" : null;

  return (
    <div className="space-y-3">
      {step === 0 && (
        <>
          <div><label className="text-xs font-semibold text-slate-600">Corrected Serum Calcium (mmol/L) — [or ionised Ca if available]</label>
            <input type="number" step="0.01" value={ca} onChange={e => setCa(e.target.value)} placeholder="Normal: 2.2–2.6" className="w-full mt-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-yellow-400" />
            <p className="text-xs text-slate-500 mt-1">Corrected Ca = Measured Ca + 0.02 × (40 − albumin g/L)</p></div>
          {severity && <div className={`rounded-xl border-2 p-3 ${severity === "severe" ? "border-red-500 bg-red-50 text-red-900" : severity === "moderate" ? "border-orange-400 bg-orange-50 text-orange-900" : "border-amber-400 bg-amber-50 text-amber-900"}`}>
            <p className="font-bold">Ca = {caVal} mmol/L — {severity.toUpperCase()} Hypercalcemia</p>
            {severity === "severe" && <p className="text-xs font-bold mt-1">⚡ SEVERE — hypercalcaemic crisis; IV fluids + furosemide + bisphosphonate URGENTLY</p>}
          </div>}
          {caVal > 2.75 && <button onClick={() => go(1)} className="w-full py-2.5 rounded-xl bg-yellow-600 text-white text-sm font-bold">Classify Cause →</button>}
        </>
      )}
      {step === 1 && (
        <div className="space-y-2">
          <p className="text-sm font-semibold">PTH level result:</p>
          {[
            { label: "PTH elevated or inappropriately normal — Primary/Tertiary Hyperparathyroidism", next: 2 },
            { label: "PTH suppressed — PTH-independent hypercalcemia (malignancy / Vit D / granuloma)", next: 3 },
            { label: "Neonatal hypercalcemia — suspected (PTH/PTHrP related)", next: 4 },
          ].map(opt => (
            <button key={opt.label} onClick={() => go(opt.next)} className="w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 border-slate-200 bg-white hover:border-yellow-400 text-left text-sm">
              {opt.label} <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0 ml-2" />
            </button>
          ))}
          <Button variant="outline" size="sm" className="w-full" onClick={back}><ArrowLeft className="w-3.5 h-3.5 mr-1" />Back</Button>
        </div>
      )}
      {[2, 3, 4].includes(step) && (
        <div className="space-y-2 text-xs">
          {step === 2 && <div className="rounded-xl border-2 border-yellow-200 bg-yellow-50 p-3 space-y-1">
            <p className="font-bold text-yellow-900">PTH-dependent Hypercalcemia</p>
            {["Primary HPT: adenoma (sporadic most common); MEN1/2A if familial — PTH adenoma; parathyroid hyperplasia", "Neonatal severe HPT: CaSR gene mutation (homozygous) — life-threatening; total parathyroidectomy", "Familial Hypocalciuric Hypercalcemia (FHH): CaSR heterozygous loss-of-function → mild asymptomatic Ca↑; urine Ca:Cr <0.01; NO treatment needed (benign)", "Tertiary HPT: in CKD — autonomous PTH secretion", "Investigations: 24h urine Ca, PTH, USS neck ± Sestamibi scan, MEN screening", "Treatment: Surgical parathyroidectomy (primary/tertiary). Cinacalcet (calcimimetic) as bridge."].map((c, i) => <p key={i} className="text-yellow-800">• {c}</p>)}
          </div>}
          {step === 3 && <div className="rounded-xl border-2 border-orange-200 bg-orange-50 p-3 space-y-1">
            <p className="font-bold text-orange-900">PTH-Independent Hypercalcemia</p>
            {["Vitamin D toxicity: excess supplementation; check 25-OH-Vit D level; stop Vit D; glucocorticoids 1–2 mg/kg/day", "Granulomatous disease: sarcoidosis, TB, fungal — 1-alpha hydroxylase in macrophages → calcitriol↑; check ACE level, CXR/CT", "Malignancy: PTHrP secretion (rare in children); check PTHrP if Ca>3.0 + PTH suppressed", "Williams syndrome: idiopathic infantile hypercalcaemia (CYP24A1 or GPC3) — low Ca diet, avoid Vit D", "Immobilisation: bone resorption → Ca↑ (paralysed patient, recovery from illness)", "Acute: IV saline hydration (3–4 L/m²/day); furosemide 1 mg/kg IV q6h once hydrated; pamidronate 0.5–1 mg/kg IV over 4h (severe); glucocorticoids (Vit D/granuloma)"].map((c, i) => <p key={i} className="text-orange-800">• {c}</p>)}
          </div>}
          {step === 4 && <div className="rounded-xl border-2 border-amber-200 bg-amber-50 p-3 space-y-1">
            <p className="font-bold text-amber-900">Neonatal Hypercalcemia</p>
            {["Maternal hypoparathyroidism (transient neonatal HPT)", "Neonatal severe HPT (CaSR hom mutation) — urgent parathyroidectomy", "Williams syndrome — FISH/CMA for 7q11.23 deletion; restrict Vit D", "Subcutaneous fat necrosis — after perinatal asphyxia; Vit D mediated; may be delayed 2–6 weeks; prednisolone + hydration", "Treatment: IV hydration; furosemide; prednisolone 2 mg/kg/day (Vit D mediated); pamidronate (severe)"].map((c, i) => <p key={i} className="text-amber-800">• {c}</p>)}
          </div>}
          <Button variant="outline" size="sm" className="w-full" onClick={back}><ArrowLeft className="w-3.5 h-3.5 mr-1" />Back</Button>
        </div>
      )}
    </div>
  );
};

const HypocalcemiaEngine = () => {
  const [step, setStep] = useState(0);
  const [ca, setCa] = useState(""); const [wt, setWt] = useState("");
  const [history, setHistory] = useState([]);
  const go = (s) => { setHistory(h => [...h, step]); setStep(s); };
  const back = () => { const p = history[history.length - 1]; if (p !== undefined) { setHistory(h => h.slice(0, -1)); setStep(p); } };
  const caVal = parseFloat(ca) || 0; const wtVal = parseFloat(wt) || 0;
  const caGluc = wtVal > 0 ? `${(wtVal * 0.5).toFixed(1)} mL 10% Ca-gluconate (0.5 mL/kg) IV over 10 min` : "0.5 mL/kg 10% Ca-gluconate IV over 10 min";

  return (
    <div className="space-y-3">
      {step === 0 && (
        <>
          <div className="grid grid-cols-2 gap-2">
            <div><label className="text-xs font-semibold text-slate-600">Corrected Serum Ca (mmol/L)</label>
              <input type="number" step="0.01" value={ca} onChange={e => setCa(e.target.value)} placeholder="Normal 2.2–2.6" className="w-full mt-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-blue-400" /></div>
            <div><label className="text-xs font-semibold text-slate-600">Weight (kg)</label>
              <input type="number" value={wt} onChange={e => setWt(e.target.value)} placeholder="e.g. 12" className="w-full mt-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-blue-400" /></div>
          </div>
          {caVal > 0 && caVal < 2.1 && <div className={`rounded-xl border-2 p-3 ${caVal < 1.75 ? "border-red-500 bg-red-50 text-red-900" : "border-blue-400 bg-blue-50 text-blue-900"}`}>
            <p className="font-bold">Ca = {caVal} mmol/L — {caVal < 1.75 ? "SEVERE — seizure/tetany risk" : "Mild–Moderate"} Hypocalcemia</p>
            {caVal < 1.75 && <p className="text-xs font-bold mt-1">⚡ EMERGENCY: IV Calcium-gluconate NOW</p>}
            <p className="text-xs mt-1">Emergency dose: {caGluc} — on ECG monitor (bradycardia risk)</p>
          </div>}
          {caVal > 0 && caVal < 2.1 && <button onClick={() => go(1)} className="w-full py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold">Find Cause →</button>}
        </>
      )}
      {step === 1 && (
        <div className="space-y-2">
          <p className="text-sm font-semibold">Age group / clinical context:</p>
          {[
            { label: "Neonatal (<28 days) — early (&lt;72h) or late (>72h)", next: 2 },
            { label: "PTH low or absent — Hypoparathyroidism", next: 3 },
            { label: "Vitamin D deficiency / Rickets", next: 4 },
            { label: "CKD-related hypocalcemia (low calcitriol)", next: 5 },
            { label: "Other: Pancreatitis, Hyperphosphataemia, Chelation", next: 6 },
          ].map(opt => (
            <button key={opt.label} onClick={() => go(opt.next)} className="w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 border-slate-200 bg-white hover:border-blue-400 text-left text-sm">
              {opt.label} <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0 ml-2" />
            </button>
          ))}
          <Button variant="outline" size="sm" className="w-full" onClick={back}><ArrowLeft className="w-3.5 h-3.5 mr-1" />Back</Button>
        </div>
      )}
      {[2, 3, 4, 5, 6].includes(step) && (
        <div className="space-y-2 text-xs">
          <div className="rounded-xl border-2 border-blue-200 bg-blue-50 p-3 space-y-1">
            {step === 2 && <><p className="font-bold text-blue-900">Neonatal Hypocalcemia</p>
              {["Early (<72h): Prematurity, IDM (maternal diabetes), asphyxia, hypomagnesemia, DiGeorge", "Late (>72h): Cow's milk feeding (high PO₄), Vit D deficiency, maternal HPT, DiGeorge", "DiGeorge (22q11.2 del): check FISH/CMA; cardiac malformations + PTH absent; Calcitriol + Ca", "IDM: resolves within days; IV Ca-gluconate + Mg if hypomagnesemic", "Treatment: Oral Ca carbonate 50–100 mg/kg/day Ca; IV if symptomatic (as above)"].map((c, i) => <p key={i} className="text-blue-800">• {c}</p>)}</>}
            {step === 3 && <><p className="font-bold text-blue-900">Hypoparathyroidism</p>
              {["Causes: post-thyroid/parathyroid surgery, autoimmune, DiGeorge (22q11.2), CHARGE, Kenny-Caffey", "Autoimmune HPT: check APS1 (AIRE gene) — candidiasis + adrenal insufficiency + HPT", "Investigations: PTH (very low), serum Ca, Mg, PO₄, 25-OH-Vit D, 1,25-OH-Vit D, urine Ca", "Treatment: Calcitriol (1,25-OH-VitD3) 15–20 ng/kg/day (DO NOT use plain VitD — need 1-alpha hydroxylation which requires PTH)", "Calcium supplements: Ca carbonate 50 mg/kg/day elemental Ca", "Aim: serum Ca low-normal (2.0–2.1) to avoid hypercalciuria (no PTH-mediated tubular reabsorption)", "Recombinant PTH (rhPTH 1–84): approved for chronic HPT in adults; trials in children"].map((c, i) => <p key={i} className="text-blue-800">• {c}</p>)}</>}
            {step === 4 && <><p className="font-bold text-blue-900">Vitamin D Deficiency / Rickets</p>
              {["Nutritional VitD deficiency (most common): 25-OH-VitD <20 nmol/L", "X-linked Hypophosphataemia (XLH): PHEX mutation; phosphate wasting; calcitriol + phosphate + burosumab", "Vit D Dependent Rickets type 1 (CYP27B1): low calcitriol → 1-alpha hydroxylase deficiency; treat with calcitriol", "Vit D Dependent Rickets type 2 (VDR mutation): calcitriol resistant; high-dose calcium infusions", "Nutritional: Cholecalciferol 60,000 IU/week × 6 weeks (stoss therapy) then maintenance 1000–2000 IU/day", "Recheck 25-OH-VitD at 6–8 weeks"].map((c, i) => <p key={i} className="text-blue-800">• {c}</p>)}</>}
            {step === 5 && <><p className="font-bold text-blue-900">CKD-Related Hypocalcemia</p>
              {["Reduced 1-alpha hydroxylation of Vit D → low calcitriol", "Rising PTH compensates (secondary HPT) — Ca may be low-normal", "Treatment: Calcitriol 0.01–0.05 µg/kg/day (max 0.25–0.5 µg/day); phosphate binders", "Target Ca: low-normal; avoid hypercalcaemia (calcification risk)", "Monitor PTH, Ca, PO₄, ALP every 3 months (G4–G5 CKD)"].map((c, i) => <p key={i} className="text-blue-800">• {c}</p>)}</>}
            {step === 6 && <><p className="font-bold text-blue-900">Other Causes</p>
              {["Pancreatitis: Ca saponification in peripancreatic fat; IV Ca-gluconate; monitor", "Hyperphosphataemia (AKI, tumour lysis): Ca-PO₄ precipitation; restrict PO₄; IV Ca cautiously (risk of calcification)", "EDTA/citrate chelation (massive transfusion): ionised Ca ↓; replace ionised Ca", "Hypomagnesemia: Mg deficiency → PTH resistance; MUST correct Mg first — give MgSO₄ IV"].map((c, i) => <p key={i} className="text-blue-800">• {c}</p>)}</>}
          </div>
          <Button variant="outline" size="sm" className="w-full" onClick={back}><ArrowLeft className="w-3.5 h-3.5 mr-1" />Back</Button>
        </div>
      )}
    </div>
  );
};

const MetabolicAlkalosisEngine = () => {
  const [step, setStep] = useState(0);
  const [history, setHistory] = useState([]);
  const go = (s) => { setHistory(h => [...h, step]); setStep(s); };
  const back = () => { const p = history[history.length - 1]; if (p !== undefined) { setHistory(h => h.slice(0, -1)); setStep(p); } };
  return (
    <div className="space-y-3">
      {step === 0 && <>
        <div className="rounded-xl bg-green-50 border border-green-200 p-3 text-xs space-y-1">
          <p className="font-bold text-green-900">Metabolic Alkalosis — Definition & Generation</p>
          {["pH >7.45 + HCO₃ >26 mEq/L + PaCO₂ rises 0.7 mmHg per 1 mEq/L HCO₃ rise (compensation)", "Generation: H⁺ loss (vomiting, NG suction) OR HCO₃ gain (NaHCO₃ excess) OR Cl⁻ depletion", "Maintenance: kidney retains HCO₃ — due to ECF contraction, Cl⁻ deficiency, or hyperaldosteronism", "Key: distinguish CHLORIDE-RESPONSIVE vs CHLORIDE-RESISTANT"].map((c, i) => <p key={i} className="text-green-800">• {c}</p>)}
        </div>
        <button onClick={() => go(1)} className="w-full py-2.5 rounded-xl bg-green-600 text-white text-sm font-bold">Classify: Cl-Responsive vs Cl-Resistant →</button>
      </>}
      {step === 1 && <div className="space-y-2">
        <p className="text-sm font-semibold">Urine Chloride (mEq/L):</p>
        {[
          { label: "Urine Cl < 20 — CHLORIDE-RESPONSIVE (volume depleted)", next: 2 },
          { label: "Urine Cl > 20 — CHLORIDE-RESISTANT (primary aldosteronism / Bartter)", next: 3 },
        ].map(opt => <button key={opt.label} onClick={() => go(opt.next)} className="w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 border-slate-200 bg-white hover:border-green-400 text-left text-sm">{opt.label} <ChevronRight className="w-4 h-4 text-slate-400 ml-2" /></button>)}
        <Button variant="outline" size="sm" className="w-full" onClick={back}><ArrowLeft className="w-3.5 h-3.5 mr-1" />Back</Button>
      </div>}
      {step === 2 && <div className="space-y-2 text-xs">
        <div className="rounded-xl border-2 border-green-200 bg-green-50 p-3 space-y-1">
          <p className="font-bold text-green-900">Chloride-Responsive Metabolic Alkalosis (Urine Cl &lt;20)</p>
          {["Causes: Vomiting / NG suction (H⁺ + Cl⁻ loss → secondary HCO₃ retention), Diuretic-induced (loop/thiazide — Cl loss), Post-hypercapnia (chronic respiratory acidosis corrected — 'contraction alkalosis'), Congenital chloride diarrhoea (rare)", "Treatment: IV 0.9% NaCl (Cl replacement = key!); KCl supplementation", "Stop NG drainage losses; antiemetics; H2-blockers/PPI (reduce gastric acid generation)", "Correct K+ (hypokalaemia perpetuates alkalosis — K leaves cells, H enters → intracellular acidosis → renal H excretion continues)", "In CHF/cirrhosis: acetazolamide 5 mg/kg/day (promotes HCO₃ excretion) — use cautiously"].map((c, i) => <p key={i} className="text-green-800">• {c}</p>)}
        </div>
        <Button variant="outline" size="sm" className="w-full" onClick={back}><ArrowLeft className="w-3.5 h-3.5 mr-1" />Back</Button>
      </div>}
      {step === 3 && <div className="space-y-2 text-xs">
        <div className="rounded-xl border-2 border-amber-200 bg-amber-50 p-3 space-y-1">
          <p className="font-bold text-amber-900">Chloride-Resistant Metabolic Alkalosis (Urine Cl &gt;20)</p>
          {["Causes: Primary hyperaldosteronism (Conn's — aldosterone-secreting adenoma); Bilateral adrenal hyperplasia; Bartter syndrome (loop diuretic-like); Gitelman syndrome (thiazide-like); Liddle syndrome (gain-of-function ENaC)", "Check: Renin + Aldosterone ratio; plasma aldosterone >15 ng/dL + suppressed renin = primary hyperaldosteronism", "Bartter: hypokalaemia + normal/low BP + polyuria + no hypertension; mutation SLC12A1, KCNJ1, CLCNKB, BSND, CASR", "Gitelman: milder, hypomagnesemia prominent, NCC (thiazide-sensitive transporter) mutation", "Liddle: hypertension + low renin + low aldosterone; ENaC — treat with amiloride", "Primary HPT treatment: unilateral adrenalectomy (adenoma) or spironolactone (medical Rx hyperplasia)", "Bartter: indomethacin + KCl + Mg; Gitelman: MgSO₄ + KCl + amiloride"].map((c, i) => <p key={i} className="text-amber-800">• {c}</p>)}
        </div>
        <Button variant="outline" size="sm" className="w-full" onClick={back}><ArrowLeft className="w-3.5 h-3.5 mr-1" />Back</Button>
      </div>}
    </div>
  );
};

const HypomagnesemiaEngine = () => {
  const [step, setStep] = useState(0);
  const [mg, setMg] = useState(""); const [wt, setWt] = useState("");
  const [history, setHistory] = useState([]);
  const go = (s) => { setHistory(h => [...h, step]); setStep(s); };
  const back = () => { const p = history[history.length - 1]; if (p !== undefined) { setHistory(h => h.slice(0, -1)); setStep(p); } };
  const mgVal = parseFloat(mg) || 0; const wtVal = parseFloat(wt) || 0;
  const severity = mgVal > 0 ? (mgVal < 0.4 ? "severe" : mgVal < 0.6 ? "moderate" : mgVal < 0.7 ? "mild" : "normal") : null;
  const sevColors = { severe: "border-red-500 bg-red-50 text-red-900", moderate: "border-orange-400 bg-orange-50 text-orange-900", mild: "border-amber-400 bg-amber-50 text-amber-900", normal: "border-green-400 bg-green-50 text-green-900" };

  return (
    <div className="space-y-3">
      {step === 0 && (
        <>
          <div className="grid grid-cols-2 gap-2">
            <div><label className="text-xs font-semibold text-slate-600">Serum Mg (mmol/L)</label>
              <input type="number" step="0.01" value={mg} onChange={e => setMg(e.target.value)} placeholder="Normal 0.7–1.0" className="w-full mt-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-purple-400" /></div>
            <div><label className="text-xs font-semibold text-slate-600">Weight (kg)</label>
              <input type="number" value={wt} onChange={e => setWt(e.target.value)} placeholder="e.g. 20" className="w-full mt-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-purple-400" /></div>
          </div>
          {severity && severity !== "normal" && <div className={`rounded-xl border-2 p-3 ${sevColors[severity]}`}>
            <p className="font-bold">Mg = {mgVal} mmol/L — {severity.toUpperCase()} Hypomagnesaemia</p>
            {severity === "severe" && <p className="text-xs font-bold mt-1">⚡ SEVERE — risk of refractory hypoK+, hypoCa, ventricular arrhythmia, seizures</p>}
          </div>}
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 text-xs">
            <p className="font-bold text-purple-800 mb-1">Why Mg matters clinically:</p>
            {["Hypomagnesaemia → refractory hypokalaemia (Mg required for K renal retention) — always check Mg in refractory hypoK!", "Hypomagnesaemia → hypocalcaemia (PTH resistance + ↓ PTH secretion at low Mg)", "ECG: prolonged QTc, torsades de pointes, VT — high risk with concurrent hypoK"].map((c, i) => <p key={i} className="text-purple-800">• {c}</p>)}
          </div>
          {mgVal > 0 && mgVal < 0.7 && <button onClick={() => go(1)} className="w-full py-2.5 rounded-xl bg-purple-600 text-white text-sm font-bold">Find Cause →</button>}
        </>
      )}
      {step === 1 && (
        <div className="space-y-2">
          <p className="text-sm font-semibold">Likely cause of hypomagnesaemia:</p>
          {[
            { label: "GI losses — diarrhoea, malabsorption, PPI use, NG suction, short bowel", next: 2 },
            { label: "Renal wasting — diuretics, aminoglycosides, cisplatin, calcineurin inhibitors", next: 3 },
            { label: "Genetic renal Mg wasting — FHHNC (CLDN16/19), Gitelman, Bartter, EAST", next: 4 },
            { label: "Inadequate intake / TPN without Mg / alcoholism (older child)", next: 5 },
          ].map(opt => (
            <button key={opt.label} onClick={() => go(opt.next)} className="w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 border-slate-200 bg-white hover:border-purple-400 text-left text-sm">
              {opt.label} <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0 ml-2" />
            </button>
          ))}
          <Button variant="outline" size="sm" className="w-full" onClick={back}><ArrowLeft className="w-3.5 h-3.5 mr-1" />Back</Button>
        </div>
      )}
      {[2, 3, 4, 5].includes(step) && (
        <div className="space-y-3">
          <div className="rounded-xl border-2 border-purple-200 bg-purple-50 p-3 text-xs space-y-1">
            <p className="font-bold text-purple-900">{["GI Loss", "Drug/Renal Wasting", "Genetic Renal Mg Wasting", "Inadequate Intake"][step - 2]}</p>
            {step === 2 && ["Urine Mg <0.5 mmol/day (FEMg <2%) confirms GI loss", "Diarrhoea, malabsorption (Crohn's, celiac, short bowel)", "PPIs: reduce intestinal Mg absorption — check Mg in ALL patients on long-term PPIs", "Treatment: oral Mg oxide/citrate/glycinate 10–20 mg/kg/day elemental Mg in divided doses", "IV if severe: MgSO₄ 25–50 mg/kg (max 2g) over 15–60 min; follow with infusion"].map((c, i) => <p key={i} className="text-purple-800">• {c}</p>)}
            {step === 3 && ["Urine Mg >0.5 mmol/day (FEMg >4%) despite low serum = renal wasting", "Diuretics (loop/thiazide) — most common drug cause", "Aminoglycosides (gentamicin, tobramycin) — tubular injury", "Cisplatin — permanent tubular damage (weeks to months after therapy)", "Calcineurin inhibitors (tacrolimus, ciclosporin) — renal Mg wasting in transplant", "Amphotericin B — tubular damage", "Treatment: correct the offending drug if possible; IV then oral Mg supplementation; amiloride helps preserve Mg in diuretic-induced wasting"].map((c, i) => <p key={i} className="text-purple-800">• {c}</p>)}
            {step === 4 && ["FHHNC (Familial Hypomagnesaemia with Hypercalciuria and Nephrocalcinosis): CLDN16 (claudin-16) or CLDN19 (claudin-19) mutation; loss of paracellular Mg reabsorption in thick ascending limb; nephrocalcinosis → progressive CKD; ± ocular defects (CLDN19)", "Gitelman syndrome (SLC12A3): hypoMg is KEY feature; thiazide-like; treat with MgSO₄ + amiloride", "Bartter syndrome: variable; some subtypes with Mg wasting (BSND mutation)", "EAST/SeSAME syndrome (KCNJ10 — Kir4.1): Epilepsy + Ataxia + Sensorineural deafness + Tubulopathy (Gitelman-like)", "TRPM6 mutation: isolated recessive hypoMg with secondary hypoCa; treat with high-dose Mg supplementation", "Genetic testing: targeted panel (CLDN16/19, SLC12A3, TRPM6, KCNJ10)"].map((c, i) => <p key={i} className="text-purple-800">• {c}</p>)}
            {step === 5 && ["Ensure Mg in TPN/parenteral nutrition (2–3 mmol/kg/day infants; 0.4–0.5 mmol/kg/day older)", "Refeeding syndrome: Mg redistribution into cells — supplement prophylactically during refeeding", "Oral: Mg glycinate or citrate preferred (better absorbed than oxide)", "Dose: 10–20 mg/kg/day elemental Mg in 2–3 divided doses (oral); titrate to normal serum Mg"].map((c, i) => <p key={i} className="text-purple-800">• {c}</p>)}
          </div>
          <div className="rounded-xl border border-green-200 bg-green-50 p-3 text-xs">
            <p className="font-bold text-green-800 mb-1">Replacement Protocol (weight {wtVal || "?"} kg)</p>
            {["Mild–Moderate (0.5–0.7 mmol/L): Oral Mg glycinate/citrate 10–20 mg/kg/day elemental Mg", `Severe (<0.5): IV MgSO₄ — ${wtVal > 0 ? `${(wtVal * 50).toFixed(0)} mg` : "50 mg/kg"} (max 2g) over 30–60 min on ECG monitor; then infusion`, "ALWAYS check and replace K⁺ simultaneously (refractory hypoK will not correct until Mg replaced)", "Monitor serum Mg every 6–12h during IV replacement"].map((c, i) => <p key={i} className="text-green-800">• {c}</p>)}
          </div>
          <Button variant="outline" size="sm" className="w-full" onClick={back}><ArrowLeft className="w-3.5 h-3.5 mr-1" />Back</Button>
        </div>
      )}
    </div>
  );
};

const ENGINE_MAP = {
  hyperkalemia: HyperkalemiaDeepEngine,
  hyponatremia: HyponatremiaEngine,
  hypokalemia: HypokalemiaEngine,
  hypernatremia: HypernatremiaEngine,
  hypercalcemia: HypercalcemiaEngine,
  hypocalcemia: HypocalcemiaEngine,
  hypomagnesemia: HypomagnesemiaEngine,
  metabolic_alkalosis: MetabolicAlkalosisEngine,
};

export default function ElectrolytesHubEngine() {
  const [selected, setSelected] = useState(null);

  if (selected) {
    const EngineComp = ENGINE_MAP[selected];
    const dis = DISORDERS.find(d => d.id === selected);
    return (
      <div className="space-y-4">
        <div className={`rounded-xl p-4 text-white ${dis?.badge || "bg-slate-700"}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold opacity-80 uppercase tracking-wide">Electrolytes Hub → {dis?.label}</p>
              <h3 className="font-bold text-base mt-0.5">{dis?.label} Engine</h3>
            </div>
            <button onClick={() => setSelected(null)} className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-full border border-white/20">← All Disorders</button>
          </div>
        </div>
        {EngineComp && <EngineComp />}
        <div className="text-xs text-slate-400 text-center">KDIGO · ISPN · Paediatric Nephrology Consensus</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-gradient-to-r from-purple-700 to-indigo-700 p-4 text-white">
        <div className="flex items-center gap-2 mb-1">
          <Zap className="w-5 h-5" />
          <h3 className="text-sm font-bold">Electrolyte Disorders Hub</h3>
          <Badge className="bg-white/20 text-white text-xs border-white/30">{DISORDERS.length} disorders</Badge>
        </div>
        <p className="text-xs text-purple-100">Select an electrolyte disorder — Diagnosis + Management engine</p>
      </div>
      <div className="space-y-2">
        {DISORDERS.map(d => (
          <button key={d.id} onClick={() => setSelected(d.id)}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all text-left ${d.color}`}>
            <div className="flex items-center gap-3">
              <span className={`w-10 h-10 rounded-xl ${d.badge} text-white flex items-center justify-center text-xs font-bold flex-shrink-0`}>{d.icon}</span>
              <div>
                <p className="font-bold text-sm">{d.label}</p>
                <p className="text-xs opacity-75 mt-0.5">{d.desc}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              {d.emergency && <Badge className="bg-red-600 text-white text-xs">Emergency</Badge>}
              <ChevronRight className="w-4 h-4 opacity-50" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}