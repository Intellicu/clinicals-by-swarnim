/**
 * Acid-Base Hub Engine
 * Master: pH → classify → individual disorder engines
 */
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ChevronRight, Activity } from "lucide-react";
import { MetabolicAcidosisEngine } from "../pathways/DecisionEngines";

const InfoBox = ({ title, color = "blue", items, children }) => {
  const styles = { blue: "border-blue-300 bg-blue-50", green: "border-green-300 bg-green-50", amber: "border-amber-300 bg-amber-50", red: "border-red-300 bg-red-50", violet: "border-violet-300 bg-violet-50", slate: "border-slate-200 bg-slate-50", cyan: "border-cyan-300 bg-cyan-50" };
  const titleC = { blue: "text-blue-900", green: "text-green-900", amber: "text-amber-900", red: "text-red-900", violet: "text-violet-900", slate: "text-slate-800", cyan: "text-cyan-900" };
  return (
    <div className={`rounded-xl border-2 p-3 ${styles[color]}`}>
      <p className={`font-bold text-sm mb-2 ${titleC[color]}`}>{title}</p>
      {items && <ul className="space-y-1">{items.map((it, i) => <li key={i} className="text-xs text-slate-700 flex gap-2"><span className="text-blue-500 flex-shrink-0 mt-0.5">→</span><span>{it}</span></li>)}</ul>}
      {children}
    </div>
  );
};

const MetabolicAlkalosisEngine = () => {
  const [step, setStep] = useState(0);
  const [history, setHistory] = useState([]);
  const go = (s) => { setHistory(h => [...h, step]); setStep(s); };
  const back = () => { const p = history[history.length - 1]; if (p !== undefined) { setHistory(h => h.slice(0, -1)); setStep(p); } };
  const NavBtns = () => (
    <div className="flex gap-2 pt-2">
      {history.length > 0 && <Button variant="outline" size="sm" className="flex-1" onClick={back}><ArrowLeft className="w-3.5 h-3.5 mr-1" />Back</Button>}
    </div>
  );
  return (
    <div className="space-y-3">
      {step === 0 && <>
        <InfoBox title="Metabolic Alkalosis — Generation & Maintenance" color="green"
          items={["pH >7.45 + HCO₃ >26 mEq/L + PCO₂ rises by 0.7 per 1 mEq/L HCO₃ (compensation)", "Generation: H⁺ loss (vomiting/NG suction) OR HCO₃ gain (NaHCO₃, citrate/blood products) OR Cl⁻ depletion", "Maintenance: kidney must retain HCO₃ (ECF contraction, Cl⁻ deficiency, or hyperaldosteronism prevents excretion)", "KEY CLASSIFICATION: Chloride-responsive (Urine Cl <20 mEq/L) vs Chloride-resistant (Urine Cl >20 mEq/L)"]}
        />
        <button onClick={() => go(1)} className="w-full py-2.5 rounded-xl bg-green-600 text-white text-sm font-bold">Classify by Urine Chloride →</button>
      </>}
      {step === 1 && (
        <div className="space-y-2">
          <p className="text-sm font-semibold">Urine Chloride (mEq/L):</p>
          {[
            { label: "Urine Cl < 20 mEq/L — CHLORIDE-RESPONSIVE (volume depleted)", next: 2 },
            { label: "Urine Cl > 20 mEq/L — CHLORIDE-RESISTANT (aldosteronism / Bartter)", next: 3 },
          ].map(opt => (
            <button key={opt.label} onClick={() => go(opt.next)} className="w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 border-slate-200 bg-white hover:border-green-400 text-left text-sm">
              {opt.label} <ChevronRight className="w-4 h-4 text-slate-400 ml-2" />
            </button>
          ))}
          <NavBtns />
        </div>
      )}
      {step === 2 && (
        <div className="space-y-3">
          <InfoBox title="Chloride-Responsive Metabolic Alkalosis (Urine Cl <20)" color="green">
            <div className="mt-2 text-xs space-y-2">
              <div className="p-2 bg-green-50 rounded-lg">
                <p className="font-bold text-green-900">Causes</p>
                {["Vomiting / NG suction — H⁺ + Cl⁻ loss → secondary HCO₃ retention (most common cause in children)", "Diuretic therapy (loop or thiazide): Cl⁻ + Na⁺ loss → volume contraction → aldosterone-mediated HCO₃ retention", "Contraction alkalosis: water loss (loop diuretics) concentrates serum HCO₃ without changing total body HCO₃", "Post-hypercapnia (chronic respiratory acidosis corrected rapidly): 'carryover' metabolic alkalosis", "Congenital chloride diarrhoea (rare): watery diarrhoea + alkalosis (Cl loss in stool)"].map((c, i) => <p key={i} className="text-green-800">• {c}</p>)}
              </div>
              <div className="p-2 bg-blue-50 rounded-lg">
                <p className="font-bold text-blue-900">Treatment — Chloride Replacement</p>
                {["IV 0.9% NaCl (chloride is the key): corrects ECF contraction + allows renal HCO₃ excretion", "KCl supplementation: hypokalaemia perpetuates alkalosis; correct K⁺", "Stop NG suction; PPI/H2-blocker (reduces gastric acid regeneration)", "Acetazolamide 5 mg/kg/day: promotes renal HCO₃ excretion — useful if volume overloaded (can't give NS)", "Ammonium chloride (NH₄Cl): rare, acidifying agent; use in refractory cases only (avoid in liver failure)"].map((c, i) => <p key={i} className="text-blue-800">• {c}</p>)}
              </div>
            </div>
          </InfoBox>
          <NavBtns />
        </div>
      )}
      {step === 3 && (
        <div className="space-y-3">
          <InfoBox title="Chloride-Resistant Metabolic Alkalosis (Urine Cl >20)" color="amber">
            <div className="mt-2 text-xs space-y-2">
              <div className="p-2 bg-amber-50 rounded-lg">
                <p className="font-bold text-amber-900">Causes — Check BP</p>
                {["HIGH BP: Primary hyperaldosteronism (Conn), renovascular HTN, glucocorticoid remediable aldosteronism (GRA), Cushing's, Liddle syndrome", "NORMAL/LOW BP: Bartter syndrome (loop diuretic-like — SLC12A1, KCNJ1, CLCNKB, BSND, CASR), Gitelman syndrome (NCC — hypomagnesemia prominent)", "HIGH BP + LOW RENIN + LOW ALDOSTERONE: Liddle syndrome (gain-of-function ENaC) — treat with amiloride (NOT spironolactone)", "CURRENT DIURETIC USE: can mimic chloride-resistant pattern (urine Cl rises on diuretics)"].map((c, i) => <p key={i} className="text-amber-800">• {c}</p>)}
              </div>
              <div className="p-2 bg-blue-50 rounded-lg">
                <p className="font-bold text-blue-900">Treatment by Cause</p>
                {["Primary HPT (Conn): unilateral adenoma → adrenalectomy; bilateral hyperplasia → spironolactone 100–400 mg/day", "Bartter: indomethacin 1–2 mg/kg/day + KCl + Mg supplementation (COX-2 inhibitor reduces prostaglandin-mediated tubular changes)", "Gitelman: oral Mg (FIRST) + KCl + amiloride; spironolactone rarely needed", "Liddle: amiloride (epithelial Na channel blocker); low Na diet; NOT spironolactone", "GRA: dexamethasone suppresses ACTH → normalises aldosterone excess"].map((c, i) => <p key={i} className="text-blue-800">• {c}</p>)}
              </div>
            </div>
          </InfoBox>
          <NavBtns />
        </div>
      )}
    </div>
  );
};

const RespiratoryAcidosisEngine = () => (
  <div className="space-y-3">
    <InfoBox title="Respiratory Acidosis — Approach" color="blue"
      items={["pH <7.35 + PaCO₂ >45 mmHg = Respiratory Acidosis (hypoventilation)", "Compensation: HCO₃ rises — Acute: +1 mEq/L per 10 mmHg PCO₂ rise; Chronic: +3.5 mEq/L per 10 mmHg", "If HCO₃ higher than expected → mixed metabolic alkalosis superimposed"]}
    >
      <div className="mt-2 text-xs space-y-2">
        <div className="p-2 bg-blue-50 rounded-lg">
          <p className="font-bold text-blue-900">Causes by Mechanism</p>
          {["CNS depression: opioids, benzodiazepines, TBI, stroke, encephalitis, CNS tumour", "Neuromuscular: Guillain-Barré, MG, botulism, SMA, high cervical SCI, ALS", "Upper airway: croup, epiglottitis, anaphylaxis, sleep apnoea (OSA/CSA), foreign body", "Lower airway/parenchymal: severe asthma, COPD (chronic), ARDS, pneumonia, pleural effusion", "Chest wall: kyphoscoliosis, flail chest, morbid obesity (OHS)"].map((c, i) => <p key={i} className="text-blue-800">• {c}</p>)}
        </div>
        <div className="p-2 bg-green-50 rounded-lg">
          <p className="font-bold text-green-900">Treatment Principles</p>
          {["TREAT THE CAUSE — address hypoventilation", "Airway/ventilatory support: BiPAP/CPAP (non-invasive) or intubation + mechanical ventilation", "Opioid reversal: naloxone 0.01 mg/kg IV/IM (if opioid-induced)", "Do NOT rapidly correct chronic respiratory acidosis (sudden PCO₂ fall → metabolic alkalosis → tetany, seizures)", "Target: PCO₂ towards patient's chronic baseline (not necessarily normal)"].map((c, i) => <p key={i} className="text-green-800">• {c}</p>)}
        </div>
      </div>
    </InfoBox>
  </div>
);

const RespiratoryAlkalosisEngine = () => (
  <div className="space-y-3">
    <InfoBox title="Respiratory Alkalosis — Approach" color="cyan"
      items={["pH >7.45 + PaCO₂ <35 mmHg = Respiratory Alkalosis (hyperventilation)", "Compensation: HCO₃ falls — Acute: -2 mEq/L per 10 mmHg PCO₂ fall; Chronic: -5 mEq/L per 10 mmHg", "If HCO₃ lower than expected → mixed metabolic acidosis superimposed"]}
    >
      <div className="mt-2 text-xs space-y-2">
        <div className="p-2 bg-cyan-50 rounded-lg">
          <p className="font-bold text-cyan-900">Causes</p>
          {["Hypoxia-driven: high altitude, severe anaemia, PE, interstitial lung disease, CHF (early)", "Anxiety / pain / panic attack: psychogenic hyperventilation", "CNS stimulation: meningitis, encephalitis, salicylate toxicity, stroke (early), hepatic encephalopathy", "Mechanical ventilation: excessive tidal volume or rate settings", "Pregnancy: normal mild respiratory alkalosis (progesterone stimulates ventilation)", "Sepsis (early): hyperventilation as response to acidosis + cytokines"].map((c, i) => <p key={i} className="text-cyan-800">• {c}</p>)}
        </div>
        <div className="p-2 bg-green-50 rounded-lg">
          <p className="font-bold text-green-900">Management</p>
          {["Treat underlying cause (hypoxia, anxiety, pain, infection)", "Psychogenic: breathing retraining; reassurance; paper bag breathing (controversial — risk of hypoxia)", "Mechanical ventilation: reduce rate or tidal volume", "Salicylate toxicity: ensure adequate HCO₃ to prevent salicylate crossing BBB; alkalise urine; dialysis if severe"].map((c, i) => <p key={i} className="text-green-800">• {c}</p>)}
        </div>
      </div>
    </InfoBox>
  </div>
);

const DISORDERS = [
  { id: "metabolic_acidosis", label: "Metabolic Acidosis", icon: "AG↑", desc: "pH↓ + HCO₃↓ — AG gap → causes → RTA → Tx", color: "bg-red-50 border-red-300 text-red-900", badge: "bg-red-600", emergency: true },
  { id: "metabolic_alkalosis", label: "Metabolic Alkalosis", icon: "HCO₃↑", desc: "pH↑ + HCO₃↑ — Cl-responsive vs resistant", color: "bg-green-50 border-green-300 text-green-900", badge: "bg-green-600" },
  { id: "respiratory_acidosis", label: "Respiratory Acidosis", icon: "PCO₂↑", desc: "pH↓ + PCO₂↑ — hypoventilation causes + Tx", color: "bg-blue-50 border-blue-300 text-blue-900", badge: "bg-blue-600", emergency: true },
  { id: "respiratory_alkalosis", label: "Respiratory Alkalosis", icon: "PCO₂↓", desc: "pH↑ + PCO₂↓ — hyperventilation causes + Tx", color: "bg-cyan-50 border-cyan-300 text-cyan-900", badge: "bg-cyan-600" },
];

const ENGINE_MAP = {
  metabolic_acidosis: MetabolicAcidosisEngine,
  metabolic_alkalosis: MetabolicAlkalosisEngine,
  respiratory_acidosis: RespiratoryAcidosisEngine,
  respiratory_alkalosis: RespiratoryAlkalosisEngine,
};

export default function AcidBaseHubEngine() {
  const [selected, setSelected] = useState(null);
  const [ph, setPh] = useState(""); const [pco2, setPco2] = useState(""); const [hco3, setHco3] = useState("");

  const phVal = parseFloat(ph); const pco2Val = parseFloat(pco2); const hco3Val = parseFloat(hco3);

  const classify = () => {
    if (!phVal || !pco2Val) return null;
    const primary = phVal < 7.35 ? (pco2Val > 45 ? "respiratory_acidosis" : "metabolic_acidosis") : phVal > 7.45 ? (pco2Val < 35 ? "respiratory_alkalosis" : "metabolic_alkalosis") : null;
    return primary;
  };
  const primary = classify();

  if (selected) {
    const EngineComp = ENGINE_MAP[selected];
    const dis = DISORDERS.find(d => d.id === selected);
    return (
      <div className="space-y-4">
        <div className={`rounded-xl p-4 text-white ${dis?.badge || "bg-slate-700"}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold opacity-80 uppercase">Acid-Base Hub → {dis?.label}</p>
              <h3 className="font-bold text-base mt-0.5">{dis?.label} Engine</h3>
            </div>
            <button onClick={() => setSelected(null)} className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-full border border-white/20">← Back to Hub</button>
          </div>
        </div>
        {EngineComp && <EngineComp />}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-gradient-to-r from-red-700 to-orange-600 p-4 text-white">
        <div className="flex items-center gap-2 mb-1">
          <Activity className="w-5 h-5" />
          <h3 className="text-sm font-bold">Acid-Base Disorders Hub</h3>
          <Badge className="bg-white/20 text-white text-xs border-white/30">Classify → Individual Engine</Badge>
        </div>
        <p className="text-xs text-red-100">Enter ABG values to auto-classify, or select disorder directly below</p>
      </div>

      {/* ABG Classifier */}
      <Card className="border-slate-200">
        <CardContent className="p-4 space-y-3">
          <p className="text-sm font-bold text-slate-700">ABG Auto-Classifier</p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "pH", val: ph, set: setPh, ph: "7.40", min: 6.8, max: 7.8 },
              { label: "PaCO₂ (mmHg)", val: pco2, set: setPco2, ph: "40" },
              { label: "HCO₃ (mEq/L)", val: hco3, set: setHco3, ph: "24" },
            ].map(f => (
              <div key={f.label}>
                <label className="text-xs font-semibold text-slate-600">{f.label}</label>
                <input type="number" step="0.01" value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.ph}
                  className="w-full mt-1 px-2 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-red-400" />
              </div>
            ))}
          </div>
          {primary && (
            <div className="rounded-xl p-3 bg-red-50 border-2 border-red-300">
              <p className="text-xs text-slate-600">Primary disorder:</p>
              <p className="font-bold text-red-900 text-sm">{DISORDERS.find(d => d.id === primary)?.label}</p>
              {hco3Val > 0 && primary === "metabolic_acidosis" && pco2Val > 0 && (
                <p className="text-xs text-slate-600 mt-1">
                  Expected PCO₂ (Winter's): {(1.5 * hco3Val + 8).toFixed(1)} ± 2 mmHg
                  {Math.abs(pco2Val - (1.5 * hco3Val + 8)) > 4 ? " — MIXED DISORDER (respiratory component)" : " — Appropriate respiratory compensation"}
                </p>
              )}
              <button onClick={() => setSelected(primary)} className="mt-2 w-full py-2 bg-red-600 text-white text-xs font-bold rounded-lg">Open {DISORDERS.find(d => d.id === primary)?.label} Engine →</button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Manual Selector */}
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Or select directly:</p>
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
            <div className="flex items-center gap-1">
              {d.emergency && <Badge className="bg-red-600 text-white text-xs">Emergency</Badge>}
              <ChevronRight className="w-4 h-4 opacity-50" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}