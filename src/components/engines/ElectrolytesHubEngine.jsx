/**
 * Electrolytes Hub Engine
 * Master entry → select disorder → dedicated sub-engine
 * Covers: Hyperkalemia, Hypokalemia, Hypernatremia, Hyponatremia,
 *         Hypercalcemia, Hypocalcemia, Metabolic Acidosis, Metabolic Alkalosis
 */
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ChevronRight, Zap } from "lucide-react";

const DISORDERS = [
  { id: "hyperkalemia", label: "Hyperkalaemia", desc: "K⁺ >5.5 mEq/L — ECG changes, cause, treatment", color: "bg-red-50 border-red-300 text-red-900", badge: "bg-red-600", scenario: "hyperkalemia-deep-engine" },
  { id: "hypokalemia", label: "Hypokalaemia", desc: "K⁺ <3.5 mEq/L — causes, correction, monitoring", color: "bg-orange-50 border-orange-300 text-orange-900", badge: "bg-orange-500", scenario: "hypokalemia-engine" },
  { id: "hypernatremia", label: "Hypernatraemia", desc: "Na⁺ >145 mEq/L — DI / dehydration / salt excess", color: "bg-amber-50 border-amber-300 text-amber-900", badge: "bg-amber-500", scenario: "hypernatremia-engine" },
  { id: "hyponatremia", label: "Hyponatraemia", desc: "Na⁺ <135 mEq/L — SIADH / hypovolaemic / correction", color: "bg-blue-50 border-blue-300 text-blue-900", badge: "bg-blue-600", scenario: "hyponatremia-engine" },
  { id: "hypercalcemia", label: "Hypercalcaemia", desc: "Ca²⁺ >2.7 mmol/L — PTH, malignancy, vitamin D", color: "bg-violet-50 border-violet-300 text-violet-900", badge: "bg-violet-600", scenario: "hypercalcemia-engine" },
  { id: "hypocalcemia", label: "Hypocalcaemia", desc: "Ca²⁺ <2.1 mmol/L — tetany, seizures, correction", color: "bg-teal-50 border-teal-300 text-teal-900", badge: "bg-teal-600", scenario: "hypocalcemia-engine" },
  { id: "met_acidosis", label: "Metabolic Acidosis", desc: "pH <7.35, HCO₃⁻ low — AG vs normal AG", color: "bg-rose-50 border-rose-300 text-rose-900", badge: "bg-rose-600", scenario: "metabolic-acidosis-engine" },
  { id: "met_alkalosis", label: "Metabolic Alkalosis", desc: "pH >7.45, HCO₃⁻ high — chloride-responsive vs resistant", color: "bg-green-50 border-green-300 text-green-900", badge: "bg-green-600", scenario: "metabolic-alkalosis-engine" },
];

// --- Inline sub-engines for new disorders ---

function HypernatremiaEngine({ onBack }) {
  const [step, setStep] = useState(0);
  const [history, setHistory] = useState([]);
  const go = (s) => { setHistory(h => [...h, step]); setStep(s); };
  const back = () => { const p = history[history.length-1]; if (p !== undefined) { setHistory(h => h.slice(0,-1)); setStep(p); } else onBack(); };

  const Section = ({ title, color, items, children }) => {
    const c = { blue: "border-blue-200 bg-blue-50", amber: "border-amber-200 bg-amber-50", red: "border-red-200 bg-red-50", green: "border-green-200 bg-green-50", violet: "border-violet-200 bg-violet-50", slate: "border-slate-200 bg-slate-50" };
    const t = { blue: "text-blue-900", amber: "text-amber-900", red: "text-red-900", green: "text-green-900", violet: "text-violet-900", slate: "text-slate-800" };
    return (
      <div className={`rounded-xl border-2 p-3 ${c[color]}`}>
        <p className={`font-bold text-sm mb-2 ${t[color]}`}>{title}</p>
        {items && items.map((it, i) => <div key={i} className="text-xs text-slate-700 flex gap-1.5 mb-1"><span className="text-slate-400 flex-shrink-0">→</span>{it}</div>)}
        {children}
      </div>
    );
  };

  if (step === 0) return (
    <div className="space-y-3">
      <p className="font-semibold text-sm text-slate-800">Hypernatraemia Approach — What do you need?</p>
      {[
        { label: "Diagnosis & Classification (causes)", next: 1 },
        { label: "Clinical Assessment & Investigations", next: 2 },
        { label: "Treatment & Correction Protocol", next: 3 },
        { label: "Monitoring & Complications", next: 4 },
      ].map((o, i) => (
        <button key={i} onClick={() => go(o.next)} className="w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 border-slate-200 bg-white hover:border-amber-400 hover:bg-amber-50 transition-all text-left">
          <span className="text-sm font-medium text-slate-700">{o.label}</span>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>
      ))}
      <Button variant="outline" size="sm" className="w-full" onClick={onBack}><ArrowLeft className="w-3.5 h-3.5 mr-1" />Back to Electrolytes Hub</Button>
    </div>
  );

  if (step === 1) return (
    <div className="space-y-3">
      <Section title="Diagnosis: Hypernatraemia Classification" color="amber"
        items={["Na⁺ >145 mEq/L: Mild 145–149 | Moderate 150–159 | Severe ≥160 mEq/L", "STEP 1: Assess volume status (skin turgor, mucous membranes, weight, UO, CVP)", "STEP 2: Check urine osmolality + urine sodium"]} >
        <div className="mt-2 space-y-1.5">
          {[
            { t: "Hypovolaemic Hypernatraemia (most common in paediatrics)", items: ["Free water loss > sodium loss", "Causes: Diarrhoea/vomiting (GI losses), fever, skin losses (burns), inadequate breastfeeding in neonates", "Urine: high osmolality (>600 mOsm/kg), low Na (<20 mEq/L) = appropriate renal conservation", "Signs: dry mucous membranes, sunken fontanelle, decreased skin turgor, tachycardia"] },
            { t: "Euvolaemic Hypernatraemia", items: ["Pure water deficit without sodium loss", "Causes: Central DI (AVP deficiency — trauma, tumour, post-op), Nephrogenic DI, excessive insensible losses (prematurity, open incubator)", "Urine: inappropriately dilute (Osm <300 mOsm/kg in face of high plasma Osm) = DI", "↳ See Polyuria Engine for full DI classification"] },
            { t: "Hypervolaemic Hypernatraemia (less common)", items: ["Sodium excess with volume overload", "Causes: Hypertonic saline admin, excessive NaHCO₃, mineralocorticoid excess (Conn's syndrome, Cushing's), salt poisoning", "Urine: high Na (>20 mEq/L), high osmolality"] },
          ].map((s, i) => (
            <div key={i} className="p-2 bg-white rounded-lg border border-amber-100">
              <p className="text-xs font-bold text-amber-900">{s.t}</p>
              {s.items.map((it, j) => <p key={j} className="text-xs text-slate-700 mt-0.5">• {it}</p>)}
            </div>
          ))}
        </div>
      </Section>
      <Button variant="outline" size="sm" onClick={back}><ArrowLeft className="w-3.5 h-3.5 mr-1" />Back</Button>
    </div>
  );

  if (step === 2) return (
    <div className="space-y-3">
      <Section title="Clinical Assessment & Investigations" color="blue"
        items={["Clinical: weight loss (% = water deficit), signs of dehydration vs overload, neuro status (irritability, hypotonia, seizures in severe/rapid correction)", "CNS risk: cerebral oedema (rapid correction) vs cerebral shrinkage (chronic hypernatraemia)"]} >
        <div className="mt-2 space-y-1.5">
          <p className="text-xs font-bold text-slate-700">Investigations:</p>
          {["Serum: Na, K, Cr, urea, glucose, Ca, Mg, osmolality", "Urine: osmolality + Na + Cr (spot) — essential pair", "If DI suspected: plasma ADH (paired with plasma osmolality)", "DDAVP test: 1 µg SC/IV → urine Osm at 1 and 2h (see Polyuria Engine)", "Imaging: cranial MRI if central DI suspected (exclude hypothalamic/pituitary lesion)"].map((it, i) => (
            <p key={i} className="text-xs text-slate-700">• {it}</p>
          ))}
        </div>
      </Section>
      <Button variant="outline" size="sm" onClick={back}><ArrowLeft className="w-3.5 h-3.5 mr-1" />Back</Button>
    </div>
  );

  if (step === 3) return (
    <div className="space-y-3">
      <Section title="Treatment Protocol" color="red"
        items={["KEY PRINCIPLE: Correct Na⁺ SLOWLY — max 0.5 mEq/L/h (12 mEq/L in 24h) to prevent cerebral oedema"]} >
        <div className="mt-2 space-y-1.5">
          {[
            { t: "Step 1: Haemodynamic Resuscitation (if shocked)", items: ["NS 10–20 mL/kg bolus to restore perfusion (even in hypernatraemia — volume first)", "Then switch to hypotonic fluid for correction"] },
            { t: "Step 2: Calculate Water Deficit", items: ["Water deficit (L) = 0.6 × weight (kg) × [(current Na / target Na) − 1]", "Target Na: reduce by max 10–12 mEq/L per day (NOT per hour)", "Replace deficit over 48–72h (chronic hypernatraemia >48h: replace over ≥72h)"] },
            { t: "Step 3: Fluid Choice", items: ["Hypovolaemic: 0.45% saline or 0.9% saline (dextrose-saline) to replace deficit + maintenance", "Euvolaemic (DI — Central): DDAVP 0.1–0.4 µg intranasally or 0.05–0.2 µg SQ/IV BID; oral hypotonic fluids", "Euvolaemic (DI — Nephrogenic): low-solute diet + HCTZ 1–2 mg/kg/day + amiloride + indomethacin", "Hypervolaemic: D5W or 0.2% NaCl + furosemide 1–2 mg/kg IV (remove excess Na)", "Neonates: exclusively breastfed — supplemental expressed breast milk / formula; maternal lactation support"] },
          ].map((s, i) => (
            <div key={i} className="p-2 bg-white border border-red-100 rounded-lg">
              <p className="text-xs font-bold text-red-900">{s.t}</p>
              {s.items.map((it, j) => <p key={j} className="text-xs text-slate-700 mt-0.5">• {it}</p>)}
            </div>
          ))}
        </div>
      </Section>
      <Button variant="outline" size="sm" onClick={back}><ArrowLeft className="w-3.5 h-3.5 mr-1" />Back</Button>
    </div>
  );

  if (step === 4) return (
    <div className="space-y-3">
      <Section title="Monitoring & Complications" color="green"
        items={["Na⁺ every 2–4h during active correction", "Target: Na reduction ≤0.5 mEq/L/h and ≤12 mEq/L/24h", "Neurological assessment: hourly GCS during rapid correction phase", "Weight: every 6–8h (fluid balance)"]} >
        <div className="mt-2 space-y-1.5">
          {[
            { t: "Complication: Cerebral Oedema (too rapid correction)", items: ["Risk highest when Na corrected >12 mEq/L/24h", "Signs: headache, seizures, deteriorating GCS after initial improvement", "Treat: mannitol 0.5–1 g/kg IV + raise Na back slowly + restrict free water"] },
            { t: "Complication: Seizures from Hypernatraemia", items: ["Paradoxical cell shrinkage → idiogenic osmoles → seizure threshold reduced", "IV diazepam 0.3 mg/kg for acute seizure; correct Na correction rate (too fast)"] },
          ].map((s, i) => (
            <div key={i} className="p-2 bg-white border border-green-100 rounded-lg">
              <p className="text-xs font-bold text-green-900">{s.t}</p>
              {s.items.map((it, j) => <p key={j} className="text-xs text-slate-700 mt-0.5">• {it}</p>)}
            </div>
          ))}
        </div>
      </Section>
      <Button variant="outline" size="sm" onClick={back}><ArrowLeft className="w-3.5 h-3.5 mr-1" />Back</Button>
    </div>
  );
}

function HypercalcemiaEngine({ onBack }) {
  const [step, setStep] = useState(0);
  const [history, setHistory] = useState([]);
  const go = (s) => { setHistory(h => [...h, step]); setStep(s); };
  const back = () => { const p = history[history.length-1]; if (p !== undefined) { setHistory(h => h.slice(0,-1)); setStep(p); } else onBack(); };

  const Section = ({ title, color, items, children }) => {
    const c = { violet: "border-violet-200 bg-violet-50", blue: "border-blue-200 bg-blue-50", amber: "border-amber-200 bg-amber-50", red: "border-red-200 bg-red-50", green: "border-green-200 bg-green-50", slate: "border-slate-200 bg-slate-50" };
    const t = { violet: "text-violet-900", blue: "text-blue-900", amber: "text-amber-900", red: "text-red-900", green: "text-green-900", slate: "text-slate-800" };
    return (
      <div className={`rounded-xl border-2 p-3 ${c[color]}`}>
        <p className={`font-bold text-sm mb-2 ${t[color]}`}>{title}</p>
        {items && items.map((it, i) => <div key={i} className="text-xs text-slate-700 flex gap-1.5 mb-1"><span className="text-slate-400 flex-shrink-0">→</span>{it}</div>)}
        {children}
      </div>
    );
  };

  if (step === 0) return (
    <div className="space-y-3">
      <p className="font-semibold text-sm text-slate-800">Hypercalcaemia Approach</p>
      {[
        { label: "Diagnosis & Causes", next: 1 },
        { label: "Investigations & Classification", next: 2 },
        { label: "Treatment Protocol (mild / severe)", next: 3 },
        { label: "Monitoring & Long-term", next: 4 },
      ].map((o, i) => (
        <button key={i} onClick={() => go(o.next)} className="w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 border-slate-200 bg-white hover:border-violet-400 hover:bg-violet-50 transition-all text-left">
          <span className="text-sm font-medium text-slate-700">{o.label}</span>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>
      ))}
      <Button variant="outline" size="sm" className="w-full" onClick={onBack}><ArrowLeft className="w-3.5 h-3.5 mr-1" />Back to Electrolytes Hub</Button>
    </div>
  );

  if (step === 1) return (
    <div className="space-y-3">
      <Section title="Diagnosis: Hypercalcaemia Causes in Children" color="violet"
        items={["Total Ca >2.7 mmol/L (corrected for albumin) or ionised Ca >1.35 mmol/L", "Always correct for albumin: corrected Ca = measured Ca + 0.02 × (40 − albumin g/L)", "Severity: Mild 2.7–3.0 | Moderate 3.0–3.5 | Severe >3.5 mmol/L (hypercalcaemic crisis)"]} >
        <div className="mt-2 space-y-1">
          {[
            { t: "PTH-dependent (↑ or inappropriately normal PTH)", items: ["Primary hyperparathyroidism (adenoma/hyperplasia — MEN1/MEN2A)", "Familial Hypocalciuric Hypercalcaemia (FHH) — benign, autosomal dominant (CASR mutation)", "Neonatal severe hyperparathyroidism (NSHPT)"] },
            { t: "PTH-independent (↓ PTH — suppressed)", items: ["Vitamin D toxicity (excess supplementation — common in India)", "Granulomatous disease (TB, sarcoidosis — macrophage 1α-hydroxylase)", "Malignancy: PTHrP secretion (rare in children), bony metastases", "Immobilisation hypercalcaemia (long-term bed rest → bone resorption)", "Williams syndrome (CFC1 mutation — neonatal hypercalcaemia)", "Subcutaneous fat necrosis of newborn (1,25-OH₂ vitamin D production)", "Thyrotoxicosis, Addison's disease, thiazide diuretics"] },
          ].map((s, i) => (
            <div key={i} className="p-2 bg-white rounded-lg border border-violet-100">
              <p className="text-xs font-bold text-violet-900">{s.t}</p>
              {s.items.map((it, j) => <p key={j} className="text-xs text-slate-700 mt-0.5">• {it}</p>)}
            </div>
          ))}
        </div>
      </Section>
      <Button variant="outline" size="sm" onClick={back}><ArrowLeft className="w-3.5 h-3.5 mr-1" />Back</Button>
    </div>
  );

  if (step === 2) return (
    <div className="space-y-3">
      <Section title="Investigations" color="blue"
        items={["Serum: Ca (ionised + total), albumin, phosphate, Mg, alkaline phosphatase, creatinine", "PTH (intact, 1st line — CRITICAL for classification)", "Vitamin D: 25-OH-D + 1,25-(OH)₂-D (calcitriol)", "PTHrP if malignancy suspected", "Urine: 24h calcium + creatinine (or spot Ca:Cr ratio)", "24h urine Ca:Cr <0.01 → FHH (benign — no surgery needed)", "DEXA scan if prolonged hypercalcaemia", "Renal USS (nephrocalcinosis, stones)", "Genetic: CASR mutation for FHH; MEN1 gene for PHPT"]} />
      <Section title="Key Diagnostic Algorithm" color="slate">
        <div className="space-y-1 text-xs mt-1">
          <p className="font-bold text-slate-800">High Ca → check PTH:</p>
          <p className="text-slate-700">↑ PTH → Primary hyperparathyroidism or FHH (check urine Ca:Cr ratio)</p>
          <p className="text-slate-700">↓ PTH → PTH-independent: check 25-OH-D and 1,25-D, PTHrP, granulomas</p>
          <p className="text-slate-700">Normal PTH (inappropriately high) → also primary HPT or FHH</p>
        </div>
      </Section>
      <Button variant="outline" size="sm" onClick={back}><ArrowLeft className="w-3.5 h-3.5 mr-1" />Back</Button>
    </div>
  );

  if (step === 3) return (
    <div className="space-y-3">
      <Section title="Treatment" color="red">
        <div className="space-y-1.5 mt-1">
          {[
            { t: "All Symptomatic / Moderate-Severe Hypercalcaemia", items: ["IV hydration: 0.9% NaCl 10–20 mL/kg bolus then 1.5× maintenance to promote calciuresis", "Furosemide 1 mg/kg IV after adequate hydration (enhances Ca excretion)", "Avoid thiazides (impair Ca excretion)"] },
            { t: "Hypercalcaemic Crisis (Ca >3.5 or symptomatic: confusion, seizures, vomiting)", items: ["Aggressive IV NS: 3–4 L/m²/day + furosemide (monitor Na, K)", "Calcitonin (salmon): 4 IU/kg SC q12h — rapid onset (hours), tachyphylaxis at 48h", "Bisphosphonates: Pamidronate 0.5–1 mg/kg IV over 4h (max 60 mg) — for malignancy, granuloma, immobilisation", "Zoledronic acid: 0.025–0.05 mg/kg IV over 15 min (older children only)", "Hydrocortisone 2 mg/kg/day: for Vit D toxicity, granulomatous, sarcoidosis, lymphoma"] },
            { t: "Cause-specific", items: ["Vit D toxicity: STOP Vit D; glucocorticoids 1–2 mg/kg/day", "Primary HPT: parathyroidectomy (definitive); cincalcet if not operable", "FHH: NO treatment needed (urine Ca:Cr <0.01; benign)"] },
          ].map((s, i) => (
            <div key={i} className="p-2 bg-white border border-red-100 rounded-lg">
              <p className="text-xs font-bold text-red-900">{s.t}</p>
              {s.items.map((it, j) => <p key={j} className="text-xs text-slate-700 mt-0.5">• {it}</p>)}
            </div>
          ))}
        </div>
      </Section>
      <Button variant="outline" size="sm" onClick={back}><ArrowLeft className="w-3.5 h-3.5 mr-1" />Back</Button>
    </div>
  );

  if (step === 4) return (
    <div className="space-y-3">
      <Section title="Monitoring" color="green"
        items={["Serum Ca every 6–12h during acute treatment", "Renal USS: look for nephrocalcinosis/stones", "DEXA scan if chronic hypercalcaemia", "Ophthalmology: band keratopathy in severe/chronic", "Bone age + height velocity if prolonged", "Genetic counselling if CASR mutation / MEN1"]} />
      <Button variant="outline" size="sm" onClick={back}><ArrowLeft className="w-3.5 h-3.5 mr-1" />Back</Button>
    </div>
  );
}

function MetabolicAlkalosisEngine({ onBack }) {
  const [step, setStep] = useState(0);
  const [history, setHistory] = useState([]);
  const go = (s) => { setHistory(h => [...h, step]); setStep(s); };
  const back = () => { const p = history[history.length-1]; if (p !== undefined) { setHistory(h => h.slice(0,-1)); setStep(p); } else onBack(); };

  const Section = ({ title, color, items, children }) => {
    const c = { green: "border-green-200 bg-green-50", blue: "border-blue-200 bg-blue-50", amber: "border-amber-200 bg-amber-50", red: "border-red-200 bg-red-50", violet: "border-violet-200 bg-violet-50" };
    const t = { green: "text-green-900", blue: "text-blue-900", amber: "text-amber-900", red: "text-red-900", violet: "text-violet-900" };
    return (
      <div className={`rounded-xl border-2 p-3 ${c[color]}`}>
        <p className={`font-bold text-sm mb-2 ${t[color]}`}>{title}</p>
        {items && items.map((it, i) => <div key={i} className="text-xs text-slate-700 flex gap-1.5 mb-1"><span className="text-slate-400 flex-shrink-0">→</span>{it}</div>)}
        {children}
      </div>
    );
  };

  if (step === 0) return (
    <div className="space-y-3">
      <p className="font-semibold text-sm text-slate-800">Metabolic Alkalosis Approach</p>
      {[
        { label: "Diagnosis & Classification", next: 1 },
        { label: "Causes & Pathophysiology", next: 2 },
        { label: "Treatment", next: 3 },
      ].map((o, i) => (
        <button key={i} onClick={() => go(o.next)} className="w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 border-slate-200 bg-white hover:border-green-400 hover:bg-green-50 transition-all text-left">
          <span className="text-sm font-medium text-slate-700">{o.label}</span>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>
      ))}
      <Button variant="outline" size="sm" className="w-full" onClick={onBack}><ArrowLeft className="w-3.5 h-3.5 mr-1" />Back to Electrolytes Hub</Button>
    </div>
  );

  if (step === 1) return (
    <div className="space-y-3">
      <Section title="Diagnosis: Metabolic Alkalosis" color="green"
        items={["pH >7.45 + HCO₃⁻ >26 mEq/L + pCO₂ normal or ↑ (compensatory)", "Confirm: Arterial/venous blood gas; calculate expected compensation: pCO₂ = 40 + 0.7 × (HCO₃⁻ − 24) ± 5", "KEY STEP: Check urine Cl⁻ (spot) — this is the CARDINAL test"]} >
        <div className="mt-2 space-y-1">
          <div className="p-2 bg-white border border-green-100 rounded-lg">
            <p className="text-xs font-bold text-green-900">Urine Cl⁻ Classification</p>
            <p className="text-xs text-slate-700 mt-0.5"><strong>Urine Cl⁻ &lt;20 mEq/L (Chloride-Responsive)</strong> → NaCl/HCl deficient; responds to saline: Vomiting, NG suctioning, diuretic rebound, post-hypercapnia</p>
            <p className="text-xs text-slate-700 mt-0.5"><strong>Urine Cl⁻ &gt;20 mEq/L (Chloride-Resistant)</strong> → Mineralocorticoid excess or K⁺ depletion: Bartter/Gitelman, Conn's, Cushing's, current diuretic use, Liddle syndrome</p>
          </div>
        </div>
      </Section>
      <Button variant="outline" size="sm" onClick={back}><ArrowLeft className="w-3.5 h-3.5 mr-1" />Back</Button>
    </div>
  );

  if (step === 2) return (
    <div className="space-y-3">
      <Section title="Causes in Children" color="blue">
        <div className="space-y-1.5 mt-1">
          {[
            { t: "Chloride-Responsive (Urine Cl <20)", items: ["Vomiting / NG suction — HCl loss → paradoxical aciduria", "Diuretic rebound (loop diuretics: furosemide) — Cl loss + volume contraction", "Post-hypercapnic alkalosis (ventilated patient: PCO₂ rapidly normalised but HCO₃ still high)", "Congenital chloride-losing diarrhoea"] },
            { t: "Chloride-Resistant (Urine Cl >20)", items: ["Bartter syndrome: Loop of Henle defect — hypoK, metabolic alkalosis, normal BP, nephrocalcinosis", "Gitelman syndrome: Distal tubule defect — hypoK, hypoMg, metabolic alkalosis; milder", "Primary hyperaldosteronism (Conn's): ↑ aldosterone, hypertension, hypoK, alkalosis", "Cushing's syndrome: ↑ cortisol → mineralocorticoid effect", "Liddle syndrome: ENaC gain-of-function → hypertension, suppressed renin/aldo", "Severe K⁺ depletion (any cause) → HCO₃ reabsorption increased"] },
          ].map((s, i) => (
            <div key={i} className="p-2 bg-white rounded-lg border border-blue-100">
              <p className="text-xs font-bold text-blue-900">{s.t}</p>
              {s.items.map((it, j) => <p key={j} className="text-xs text-slate-700 mt-0.5">• {it}</p>)}
            </div>
          ))}
        </div>
      </Section>
      <Button variant="outline" size="sm" onClick={back}><ArrowLeft className="w-3.5 h-3.5 mr-1" />Back</Button>
    </div>
  );

  if (step === 3) return (
    <div className="space-y-3">
      <Section title="Treatment" color="amber">
        <div className="space-y-1.5 mt-1">
          {[
            { t: "Chloride-Responsive", items: ["0.9% NaCl IV (replace Cl and volume) — cornerstone; 10–20 mL/kg bolus if dehydrated, then maintenance", "KCl supplementation (PO or IV) — correct hypoK (coexists frequently)", "Stop diuretics if possible; treat underlying cause (vomiting → ondansetron, stop NG losses)"] },
            { t: "Chloride-Resistant — Bartter/Gitelman", items: ["Indomethacin 2–3 mg/kg/day (Bartter type 1–3 — prostaglandin dependent)", "KCl + Mg supplementation (especially Gitelman)", "Spironolactone (aldosterone antagonism — adjunct)", "Amiloride for Liddle syndrome (ENaC blocker)"] },
            { t: "Severe Alkalosis (pH >7.7)", items: ["Acetazolamide 5 mg/kg/day (carbonic anhydrase inhibitor → bicarbonaturia)", "IV HCl 0.1 M (central line only — ICU setting, life-threatening alkalosis)", "Arginine HCl (older paediatric data — rarely used)"] },
          ].map((s, i) => (
            <div key={i} className="p-2 bg-white border border-amber-100 rounded-lg">
              <p className="text-xs font-bold text-amber-900">{s.t}</p>
              {s.items.map((it, j) => <p key={j} className="text-xs text-slate-700 mt-0.5">• {it}</p>)}
            </div>
          ))}
        </div>
      </Section>
      <Button variant="outline" size="sm" onClick={back}><ArrowLeft className="w-3.5 h-3.5 mr-1" />Back</Button>
    </div>
  );
}

export default function ElectrolytesHubEngine({ onBack }) {
  const [selected, setSelected] = useState(null);

  if (selected === "hypernatremia-engine") return (
    <div className="space-y-4">
      <div className="rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 p-3 text-white">
        <h3 className="font-bold text-sm">Hypernatraemia Engine</h3>
        <p className="text-xs text-amber-100">Diagnosis → Classification → Treatment → Monitoring · KDIGO 2012 · ESPGHAN</p>
      </div>
      <Card><CardContent className="p-4"><HypernatremiaEngine onBack={() => setSelected(null)} /></CardContent></Card>
    </div>
  );

  if (selected === "hypercalcemia-engine") return (
    <div className="space-y-4">
      <div className="rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 p-3 text-white">
        <h3 className="font-bold text-sm">Hypercalcaemia Engine</h3>
        <p className="text-xs text-violet-100">PTH-dependent vs independent → Investigations → Treatment · ESPN · ESPE</p>
      </div>
      <Card><CardContent className="p-4"><HypercalcemiaEngine onBack={() => setSelected(null)} /></CardContent></Card>
    </div>
  );

  if (selected === "metabolic-alkalosis-engine") return (
    <div className="space-y-4">
      <div className="rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 p-3 text-white">
        <h3 className="font-bold text-sm">Metabolic Alkalosis Engine</h3>
        <p className="text-xs text-green-100">Urine Cl⁻ classification → Causes → Treatment · IPNA · KDIGO</p>
      </div>
      <Card><CardContent className="p-4"><MetabolicAlkalosisEngine onBack={() => setSelected(null)} /></CardContent></Card>
    </div>
  );

  // For existing engines, parent should route to their scenario
  if (selected) {
    return (
      <div className="p-4 text-center text-slate-500">
        <p className="text-sm">Routing to engine: {selected}</p>
        <Button variant="outline" size="sm" className="mt-2" onClick={() => setSelected(null)}><ArrowLeft className="w-3.5 h-3.5 mr-1" />Back</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-gradient-to-r from-blue-700 to-cyan-600 p-4 text-white">
        <div className="flex items-center gap-2 mb-1">
          <Zap className="w-5 h-5" />
          <h3 className="text-sm font-bold">Electrolytes & Acid-Base Hub</h3>
          <Badge className="bg-white/20 text-white text-xs border-white/30">{DISORDERS.length} Engines</Badge>
        </div>
        <p className="text-xs text-blue-100">Select a disorder → Diagnosis → Management · KDIGO · IPNA · KDOQI</p>
      </div>

      <div className="space-y-2">
        {DISORDERS.map(d => (
          <button key={d.id} onClick={() => setSelected(d.scenario)}
            className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl border-2 transition-all text-left ${d.color} hover:shadow-sm`}>
            <div>
              <p className="font-semibold text-sm">{d.label}</p>
              <p className="text-xs opacity-75 mt-0.5">{d.desc}</p>
            </div>
            <ChevronRight className="w-4 h-4 flex-shrink-0 ml-2 opacity-60" />
          </button>
        ))}
      </div>

      {onBack && (
        <button onClick={onBack} className="w-full py-2.5 text-xs font-semibold text-slate-500 border border-slate-200 rounded-xl hover:bg-slate-50 flex items-center justify-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Engines
        </button>
      )}

      <div className="text-xs text-slate-400 text-center">KDIGO · IPNA · ESPN · ESPGHAN · Paediatric Nephrology Consensus</div>
    </div>
  );
}