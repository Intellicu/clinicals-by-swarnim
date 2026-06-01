/**
 * Acid-Base Hub Engine
 * Master entry → classify disorder → sub-engine
 * Covers: Metabolic Acidosis, Metabolic Alkalosis, Respiratory Acidosis, Respiratory Alkalosis, Mixed
 */
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ChevronRight, FlaskConical } from "lucide-react";

const TYPES = [
  { id: "met_acidosis", label: "Metabolic Acidosis", desc: "↓ pH, ↓ HCO₃⁻ — AG vs normal AG, cause & treatment", color: "bg-red-50 border-red-300 text-red-900" },
  { id: "met_alkalosis", label: "Metabolic Alkalosis", desc: "↑ pH, ↑ HCO₃⁻ — Cl-responsive vs resistant", color: "bg-green-50 border-green-300 text-green-900" },
  { id: "resp_acidosis", label: "Respiratory Acidosis", desc: "↑ pCO₂ — hypoventilation, airway, NMD", color: "bg-orange-50 border-orange-300 text-orange-900" },
  { id: "resp_alkalosis", label: "Respiratory Alkalosis", desc: "↓ pCO₂ — hyperventilation, anxiety, salicylates", color: "bg-blue-50 border-blue-300 text-blue-900" },
  { id: "mixed", label: "Mixed Disorder Analyser", desc: "Step-by-step ABG interpretation with compensation check", color: "bg-violet-50 border-violet-300 text-violet-900" },
];

function Section({ title, color, items, children }) {
  const c = { red: "border-red-200 bg-red-50", green: "border-green-200 bg-green-50", blue: "border-blue-200 bg-blue-50", amber: "border-amber-200 bg-amber-50", orange: "border-orange-200 bg-orange-50", violet: "border-violet-200 bg-violet-50", slate: "border-slate-200 bg-slate-50" };
  const t = { red: "text-red-900", green: "text-green-900", blue: "text-blue-900", amber: "text-amber-900", orange: "text-orange-900", violet: "text-violet-900", slate: "text-slate-800" };
  return (
    <div className={`rounded-xl border-2 p-3 ${c[color]}`}>
      <p className={`font-bold text-sm mb-2 ${t[color]}`}>{title}</p>
      {items && items.map((it, i) => <div key={i} className="text-xs text-slate-700 flex gap-1.5 mb-1"><span className="text-slate-400 flex-shrink-0">→</span>{it}</div>)}
      {children}
    </div>
  );
}

function ABGClassifier({ onBack }) {
  const [vals, setVals] = useState({ pH: "", pco2: "", hco3: "", na: "", cl: "", alb: "" });
  const [result, setResult] = useState(null);

  const calc = () => {
    const pH = parseFloat(vals.pH), pco2 = parseFloat(vals.pco2), hco3 = parseFloat(vals.hco3);
    const na = parseFloat(vals.na), cl = parseFloat(vals.cl), alb = parseFloat(vals.alb);
    if (!pH || !pco2 || !hco3) return;

    let disorders = [];
    let primary = "";

    // Primary disorder
    if (pH < 7.35 && hco3 < 22) primary = "Metabolic Acidosis";
    else if (pH < 7.35 && pco2 > 45) primary = "Respiratory Acidosis";
    else if (pH > 7.45 && hco3 > 26) primary = "Metabolic Alkalosis";
    else if (pH > 7.45 && pco2 < 35) primary = "Respiratory Alkalosis";
    else if (pH >= 7.35 && pH <= 7.45) {
      if (hco3 < 22 && pco2 < 35) primary = "Compensated Metabolic Acidosis";
      else if (hco3 > 26 && pco2 > 45) primary = "Compensated Metabolic Alkalosis";
      else primary = "Normal ABG";
    }

    // Compensation check
    let compCheck = "";
    if (primary === "Metabolic Acidosis") {
      const expectedPCO2 = 1.5 * hco3 + 8;
      if (Math.abs(pco2 - expectedPCO2) > 2) compCheck = pco2 < expectedPCO2 - 2 ? "⚠ pCO₂ lower than expected → concurrent Respiratory Alkalosis" : "⚠ pCO₂ higher than expected → concurrent Respiratory Acidosis";
    }
    if (primary === "Metabolic Alkalosis") {
      const expectedPCO2 = 0.7 * hco3 + 21;
      if (Math.abs(pco2 - expectedPCO2) > 2) compCheck = pco2 > expectedPCO2 + 2 ? "⚠ pCO₂ higher than expected → concurrent Respiratory Acidosis" : "⚠ pCO₂ lower than expected → concurrent Respiratory Alkalosis";
    }

    // Anion gap
    let agLine = "";
    if (na && cl && hco3) {
      const ag = na - cl - hco3;
      const corrAlb = alb ? ag + 2.5 * (4 - alb) : ag;
      agLine = `Anion Gap: ${ag.toFixed(1)} mEq/L${alb ? ` (albumin-corrected: ${corrAlb.toFixed(1)})` : ""}`;
      if (primary.includes("Metabolic Acidosis")) {
        if (corrAlb > 12) disorders.push("High AG metabolic acidosis → MUDPILES: Methanol, Uraemia, DKA, Propylene glycol, INH/Isoniazid, Lactic acidosis, Ethylene glycol, Salicylates");
        else disorders.push("Normal AG metabolic acidosis → HARDUPS: Hyperalimentation, Addison's, RTA, Diarrhoea, Ureterosigmoidostomy, Pancreatic fistula, Saline infusion");
        if (na && cl && primary.includes("Metabolic Acidosis") && corrAlb > 12) {
          const deltaAG = corrAlb - 12;
          const expectedHCO3 = 24 + hco3 - 24;
          const ratio = deltaAG / (24 - hco3);
          if (ratio > 2) disorders.push("Delta-delta ratio >2 → concurrent Metabolic ALKALOSIS");
          else if (ratio < 1) disorders.push("Delta-delta ratio <1 → concurrent Normal-AG Metabolic Acidosis");
        }
      }
    }

    setResult({ primary, compCheck, agLine, disorders });
  };

  return (
    <div className="space-y-3">
      <p className="font-semibold text-sm text-slate-800">ABG Step-by-step Classifier</p>
      <div className="grid grid-cols-3 gap-2">
        {[["pH", "7.35–7.45"], ["pCO₂", "35–45 mmHg"], ["HCO₃⁻", "22–26 mEq/L"], ["Na⁺", "mEq/L"], ["Cl⁻", "mEq/L"], ["Albumin", "g/dL (opt)"]].map(([label, ph], i) => (
          <div key={i}>
            <label className="text-xs font-semibold text-slate-600 block mb-0.5">{label}</label>
            <input type="number" step="0.01" placeholder={ph}
              className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-violet-400"
              onChange={e => setVals(v => ({ ...v, [["pH","pco2","hco3","na","cl","alb"][i]]: e.target.value }))} />
          </div>
        ))}
      </div>
      <Button className="w-full bg-violet-600 hover:bg-violet-700 text-sm" onClick={calc}>Interpret ABG</Button>

      {result && (
        <div className="space-y-2">
          <div className="rounded-xl bg-slate-800 text-white p-3">
            <p className="font-bold text-sm">{result.primary}</p>
            {result.compCheck && <p className="text-xs text-amber-300 mt-1">{result.compCheck}</p>}
            {result.agLine && <p className="text-xs text-blue-200 mt-0.5">{result.agLine}</p>}
          </div>
          {result.disorders.map((d, i) => (
            <div key={i} className="rounded-xl border-2 border-violet-200 bg-violet-50 p-2 text-xs text-violet-900">→ {d}</div>
          ))}
        </div>
      )}
      <Button variant="outline" size="sm" onClick={onBack}><ArrowLeft className="w-3.5 h-3.5 mr-1" />Back</Button>
    </div>
  );
}

function RespAcidosisEngine({ onBack }) {
  const [step, setStep] = useState(0);
  const [history, setHistory] = useState([]);
  const go = (s) => { setHistory(h => [...h, step]); setStep(s); };
  const back = () => { const p = history[history.length-1]; if (p !== undefined) { setHistory(h => h.slice(0,-1)); setStep(p); } else onBack(); };

  if (step === 0) return (
    <div className="space-y-3">
      <p className="font-semibold text-sm">Respiratory Acidosis</p>
      {[{label:"Diagnosis & Causes", next:1},{label:"Treatment",next:2}].map((o,i) => (
        <button key={i} onClick={() => go(o.next)} className="w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 border-slate-200 bg-white hover:border-orange-400 transition-all text-left">
          <span className="text-sm font-medium text-slate-700">{o.label}</span>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>
      ))}
      <Button variant="outline" size="sm" onClick={onBack}><ArrowLeft className="w-3.5 h-3.5 mr-1" />Back</Button>
    </div>
  );

  if (step === 1) return (
    <div className="space-y-3">
      <Section title="Respiratory Acidosis: Causes" color="orange"
        items={["↑ pCO₂ >45 mmHg + ↓ pH: hypoventilation → CO₂ retention", "Compensation: HCO₃⁻ rises 1 mEq/L per 10 mmHg rise in pCO₂ (acute); 3.5 mEq/L per 10 mmHg (chronic)"]} >
        <div className="mt-2 space-y-1">
          {[
            { t: "Airway / Lung Disease", items: ["Severe pneumonia, ARDS, bronchiolitis, asthma status", "Pulmonary oedema, pleural effusion, pneumothorax"] },
            { t: "CNS / Neuromuscular", items: ["Encephalitis, raised ICP (Cushing's triad), drug sedation/overdose", "Guillain-Barré, myasthenia gravis, spinal cord injury, Duchenne MD"] },
            { t: "Mechanical", items: ["Hypoventilation post-anaesthesia", "Upper airway obstruction: croup, epiglottitis, foreign body"] },
          ].map((s, i) => (
            <div key={i} className="p-2 bg-white rounded-lg border border-orange-100">
              <p className="text-xs font-bold text-orange-900">{s.t}</p>
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
      <Section title="Treatment" color="red"
        items={["TREAT THE CAUSE — ventilatory support is the cornerstone", "NIV (BiPAP): for neuromuscular disease, COPD-like (rare in paediatrics), post-extubation", "Intubation + mechanical ventilation if: RR >60 or agonal, GCS <8, rising pCO₂ with fatigue", "Secretion clearance: chest physio, suctioning, nebulised saline", "Avoid NaHCO₃ (worsens CO₂ — produces more CO₂ from carbonic acid)", "Treat pneumonia with antibiotics; bronchospasm with salbutamol"]} />
      <Button variant="outline" size="sm" onClick={back}><ArrowLeft className="w-3.5 h-3.5 mr-1" />Back</Button>
    </div>
  );
}

function RespAlkalosisEngine({ onBack }) {
  return (
    <div className="space-y-3">
      <Section title="Respiratory Alkalosis" color="blue"
        items={["↓ pCO₂ <35 mmHg + ↑ pH: hyperventilation → CO₂ blown off", "Compensation: HCO₃⁻ falls 2 mEq/L per 10 mmHg fall in pCO₂ (acute); 5 mEq/L (chronic)"]} >
        <div className="mt-2 space-y-1">
          {[
            { t: "Causes", items: ["Anxiety / pain / psychogenic hyperventilation", "Fever, sepsis (early respiratory alkalosis)", "Salicylate toxicity (early: alkalosis; late: mixed acidosis)", "Hepatic encephalopathy, raised ICP (central hyperventilation)", "Mechanical ventilation (over-ventilation)", "Severe anaemia, CHD with cyanosis"] },
            { t: "Treatment", items: ["Treat the underlying cause", "Psychogenic: reassurance, rebreathing technique (paper bag — limited evidence), diazepam if severe anxiety", "Check serum Ca: acute hypocapnia → ionised Ca↓ → tetany risk (treat with calcium gluconate)", "Reduce tidal volume/rate if ventilated"] },
          ].map((s, i) => (
            <div key={i} className="p-2 bg-white rounded-lg border border-blue-100">
              <p className="text-xs font-bold text-blue-900">{s.t}</p>
              {s.items.map((it, j) => <p key={j} className="text-xs text-slate-700 mt-0.5">• {it}</p>)}
            </div>
          ))}
        </div>
      </Section>
      <Button variant="outline" size="sm" onClick={onBack}><ArrowLeft className="w-3.5 h-3.5 mr-1" />Back</Button>
    </div>
  );
}

export default function AcidBaseHubEngine({ onBack }) {
  const [selected, setSelected] = useState(null);

  if (selected === "mixed") return (
    <div className="space-y-4">
      <div className="rounded-xl bg-gradient-to-r from-violet-700 to-purple-600 p-3 text-white">
        <h3 className="font-bold text-sm">ABG Step-by-step Classifier</h3>
        <p className="text-xs text-violet-100">Interpret pH → Primary → Compensation → AG → Mixed</p>
      </div>
      <Card><CardContent className="p-4"><ABGClassifier onBack={() => setSelected(null)} /></CardContent></Card>
    </div>
  );

  if (selected === "resp_acidosis") return (
    <div className="space-y-4">
      <div className="rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 p-3 text-white">
        <h3 className="font-bold text-sm">Respiratory Acidosis Engine</h3>
        <p className="text-xs text-orange-100">pCO₂ ↑ — Airway / CNS / NMD causes → Treatment</p>
      </div>
      <Card><CardContent className="p-4"><RespAcidosisEngine onBack={() => setSelected(null)} /></CardContent></Card>
    </div>
  );

  if (selected === "resp_alkalosis") return (
    <div className="space-y-4">
      <div className="rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 p-3 text-white">
        <h3 className="font-bold text-sm">Respiratory Alkalosis Engine</h3>
        <p className="text-xs text-blue-100">pCO₂ ↓ — Causes → Treatment</p>
      </div>
      <Card><CardContent className="p-4"><RespAlkalosisEngine onBack={() => setSelected(null)} /></CardContent></Card>
    </div>
  );

  if (selected) {
    return (
      <div className="p-4 text-center text-slate-500 text-sm">
        Routing to: {selected}
        <Button variant="outline" size="sm" className="mt-2 block mx-auto" onClick={() => setSelected(null)}><ArrowLeft className="w-3.5 h-3.5 mr-1" />Back</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-gradient-to-r from-violet-700 to-indigo-600 p-4 text-white">
        <div className="flex items-center gap-2 mb-1">
          <FlaskConical className="w-5 h-5" />
          <h3 className="text-sm font-bold">Acid-Base Disorders Hub</h3>
          <Badge className="bg-white/20 text-white text-xs border-white/30">5 Engines</Badge>
        </div>
        <p className="text-xs text-violet-100">Classify disorder first → then select → Diagnosis + Management · KDIGO · Rome Conventions</p>
      </div>

      <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-900">
        <p className="font-bold mb-1">🔬 Not sure of the disorder? Use the Mixed Analyser first</p>
        <p>Enter your ABG values → step-by-step classification with compensation check, anion gap, and delta-delta ratio</p>
      </div>

      <div className="space-y-2">
        {TYPES.map(d => (
          <button key={d.id} onClick={() => setSelected(d.id)}
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
      <div className="text-xs text-slate-400 text-center">KDIGO · Rome Conventions · IPNA · Paediatric Critical Care</div>
    </div>
  );
}