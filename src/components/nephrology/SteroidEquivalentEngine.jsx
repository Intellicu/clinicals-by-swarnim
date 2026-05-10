import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calculator, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";

const STEROIDS = {
  prednisolone:      { name: "Prednisolone",       equiv: 5,    half_life: "12–36h", mineralocorticoid: "Low", potency: 4, route: "PO", duration: "Intermediate" },
  methylprednisolone: { name: "Methylprednisolone",  equiv: 4,    half_life: "12–36h", mineralocorticoid: "Minimal", potency: 5, route: "PO/IV", duration: "Intermediate" },
  dexamethasone:     { name: "Dexamethasone",       equiv: 0.75, half_life: "36–72h", mineralocorticoid: "None", potency: 25, route: "PO/IV", duration: "Long" },
  hydrocortisone:    { name: "Hydrocortisone",      equiv: 20,   half_life: "8–12h",  mineralocorticoid: "High",  potency: 1,  route: "PO/IV/IM", duration: "Short" },
  deflazacort:       { name: "Deflazacort",         equiv: 6,    half_life: "12–36h", mineralocorticoid: "Low", potency: 3.3, route: "PO", duration: "Intermediate" },
  budesonide:        { name: "Budesonide (oral)",   equiv: 0.9,  half_life: "2–3h",   mineralocorticoid: "None", potency: 60, route: "PO (targeted)", duration: "Short" },
};

const STRESS_DOSE = [
  { scenario: "Minor stress (fever, mild illness)", dose: "2× usual daily dose", duration: "48–72h", iv_needed: "No — PO if tolerating" },
  { scenario: "Moderate stress (moderate illness, surgery <1h)", dose: "3× usual or hydrocortisone 50 mg/m²/day divided q6–8h", duration: "Until recovered", iv_needed: "Consider IV if vomiting" },
  { scenario: "Major stress (major surgery, ICU, severe illness)", dose: "Hydrocortisone 100 mg/m²/day IV divided q6–8h (max 200 mg/day)", duration: "72h or until stable", iv_needed: "Yes — IV" },
  { scenario: "Adrenal crisis (collapse, vomiting, cannot give PO)", dose: "Hydrocortisone 100 mg/m² IV bolus (max 200 mg) STAT", duration: "Then 100 mg/m²/day divided", iv_needed: "EMERGENCY — IV immediately" },
];

const PULSE_STEROID = [
  { indication: "RPGN / Crescentic GN", drug: "Methylprednisolone 30 mg/kg IV (max 1g) OD × 3 days", then: "Prednisolone 1 mg/kg/day PO" },
  { indication: "Anti-GBM / Vasculitis", drug: "Methylprednisolone 30 mg/kg IV (max 1g) OD × 3 days", then: "Prednisolone 1 mg/kg/day + CYC/RTX" },
  { indication: "Lupus nephritis (active)", drug: "Methylprednisolone 30 mg/kg IV (max 1g) OD × 3 days", then: "Prednisolone 0.5–1 mg/kg/day + MMF/CYC" },
  { indication: "Nephrotic relapse (severe/infrequent)", drug: "None routinely — PO prednisolone 2 mg/kg/day until remission", then: "Taper over 4–6 weeks" },
  { indication: "DRESS / severe drug reaction", drug: "Methylprednisolone 2 mg/kg/day IV or prednisolone 1 mg/kg/day PO", then: "Slow taper over weeks" },
  { indication: "Acute SLE flare", drug: "Methylprednisolone 30 mg/kg IV × 3", then: "Prednisolone 1 mg/kg + adjust maintenance IS" },
];

const ADMIN_TIPS = {
  prednisolone: ["MORNING dosing (matches circadian cortisol — reduces HPA suppression)", "TAKE WITH FOOD (reduces GI irritation)", "Consistently same time daily", "Do NOT stop abruptly (>2 weeks) — taper"],
  methylprednisolone: ["IV pulse: give over 60 min (not rapid bolus — cardiac arrhythmia risk)", "Monitor BP + glucose during infusion", "Antiemetic pre-infusion (ondansetron)"],
  dexamethasone: ["Evening dosing disrupts sleep — prefer morning", "Longest duration — greatest HPA suppression risk", "No mineralocorticoid effect — not suitable for adrenal insufficiency replacement"],
  hydrocortisone: ["Adrenal replacement: 8–10 mg/m²/day in 3 divided doses (morning heaviest)", "Stress dose: 3–4× replacement dose", "IV for crisis: 100 mg/m² bolus"],
  deflazacort: ["Equivalent dose higher (1 mg deflazacort ≈ 0.75 mg prednisolone)", "Less growth suppression and osteoporosis — preferred in Duchenne MD", "Take with food"],
  budesonide: ["Targeted release (Nefecon): whole capsule — do NOT crush", "9 mg/day × 9 months for IgAN", "Very low systemic bioavailability (10%)"],
};

export default function SteroidEquivalentEngine() {
  const [fromSteroid, setFromSteroid] = useState("prednisolone");
  const [fromDose, setFromDose] = useState("");
  const [conversions, setConversions] = useState(null);
  const [showStress, setShowStress] = useState(false);
  const [showPulse, setShowPulse] = useState(false);
  const [showAdmin, setShowAdmin] = useState(null);

  const calculate = () => {
    if (!fromDose || isNaN(fromDose)) return;
    const dose = parseFloat(fromDose);
    const fromEquiv = STEROIDS[fromSteroid].equiv;
    const predEquiv = dose * (fromEquiv / STEROIDS.prednisolone.equiv);
    const results = Object.entries(STEROIDS).map(([key, s]) => ({
      key, name: s.name,
      dose: ((predEquiv * STEROIDS.prednisolone.equiv) / s.equiv).toFixed(2),
      route: s.route, half_life: s.half_life, potency: s.potency,
      mineralocorticoid: s.mineralocorticoid, duration: s.duration
    }));
    setConversions(results);
  };

  return (
    <div className="space-y-4">
      <Alert className="bg-amber-50 border-amber-200">
        <Calculator className="w-4 h-4 text-amber-600" />
        <AlertDescription className="text-xs text-amber-900">
          <strong>Steroid Conversion Centre:</strong> Equivalence calculator, pulse steroid guidance, stress-dose logic, adrenal suppression reminders. Clinical judgment required — these are reference equivalences only.
        </AlertDescription>
      </Alert>

      {/* Converter */}
      <Card className="bg-white border-2 border-amber-200">
        <CardContent className="p-4 space-y-3">
          <p className="font-bold text-sm text-slate-900 flex items-center gap-2"><Calculator className="w-4 h-4 text-amber-600" />Steroid Conversion Calculator</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">From Steroid</label>
              <select value={fromSteroid} onChange={e => { setFromSteroid(e.target.value); setConversions(null); }}
                className="w-full text-xs border-2 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-400">
                {Object.entries(STEROIDS).map(([k, s]) => <option key={k} value={k}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Dose (mg)</label>
              <input type="number" value={fromDose} onChange={e => { setFromDose(e.target.value); setConversions(null); }}
                placeholder="e.g. 40"
                className="w-full text-xs border-2 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-400" />
            </div>
          </div>
          <button onClick={calculate}
            className="w-full py-2 bg-amber-600 text-white text-xs font-bold rounded-xl hover:bg-amber-700 transition-colors">
            Calculate Equivalents
          </button>

          {conversions && (
            <div className="space-y-1.5">
              <p className="text-xs font-bold text-slate-700">Equivalent Doses:</p>
              {conversions.map(c => (
                <div key={c.key} className={`flex items-center justify-between p-2 rounded-lg border text-xs ${c.key === fromSteroid ? "bg-amber-100 border-amber-300" : "bg-white border-slate-200"}`}>
                  <div>
                    <span className="font-bold text-slate-900">{c.name}</span>
                    <div className="flex gap-1 mt-0.5">
                      <Badge className="text-xs bg-slate-100 text-slate-600 border-0">{c.route}</Badge>
                      <Badge className="text-xs bg-slate-100 text-slate-600 border-0">{c.duration}</Badge>
                    </div>
                  </div>
                  <span className="font-bold text-lg text-amber-700">{c.dose} mg</span>
                </div>
              ))}
              <Alert className="bg-red-50 border-red-200">
                <AlertTriangle className="w-3 h-3 text-red-600" />
                <AlertDescription className="text-xs text-red-800">These are approximate anti-inflammatory equivalences only. Mineralocorticoid activity, duration, and route differ significantly — use clinical judgment.</AlertDescription>
              </Alert>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Adrenal suppression reminder */}
      <Card className="bg-red-50 border-2 border-red-200">
        <CardContent className="p-3">
          <p className="font-bold text-sm text-red-900 mb-2 flex items-center gap-2"><AlertTriangle className="w-4 h-4" />Adrenal Suppression Reminders</p>
          <div className="space-y-1.5">
            {["HPA suppression risk: any steroid dose >physiological (>7.5 mg/day pred equivalent) for >2–3 weeks", 
              "Do NOT stop abruptly after >2–3 weeks — taper by 10–25% every 1–2 weeks",
              "SICK DAY RULES: stress-dose for ANY illness, surgery, or trauma if on steroids >3 months",
              "Medical alert bracelet: all patients on long-term steroids",
              "ACTH stimulation test: before complete withdrawal if on >6 months",
              "Deflazacort and inhaled steroids: also suppress HPA axis — check cumulative dose"].map((r, i) => (
              <div key={i} className="flex items-start gap-2 text-xs bg-white border border-red-200 rounded p-2">
                <AlertTriangle className="w-3 h-3 text-red-500 flex-shrink-0 mt-0.5" />{r}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Stress dose guide */}
      <button onClick={() => setShowStress(s => !s)}
        className="w-full flex items-center justify-between px-3 py-2.5 bg-white border-2 border-orange-200 rounded-xl text-xs font-semibold text-orange-700 hover:border-orange-400 transition-colors">
        <span>⚠️ Stress Dose Guidance (Sick Day Rules)</span>
        {showStress ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      {showStress && (
        <div className="space-y-2">
          {STRESS_DOSE.map((s, i) => (
            <div key={i} className={`p-3 rounded-xl border-2 text-xs ${i === 3 ? "bg-red-50 border-red-300" : "bg-orange-50 border-orange-200"}`}>
              <p className="font-bold text-slate-900 mb-1">{s.scenario}</p>
              <p className="text-slate-700">💊 <strong>Dose:</strong> {s.dose}</p>
              <p className="text-slate-700">⏱️ <strong>Duration:</strong> {s.duration}</p>
              <p className={`font-semibold ${i === 3 ? "text-red-700" : "text-orange-700"}`}>🏥 IV: {s.iv_needed}</p>
            </div>
          ))}
        </div>
      )}

      {/* Pulse steroid guide */}
      <button onClick={() => setShowPulse(p => !p)}
        className="w-full flex items-center justify-between px-3 py-2.5 bg-white border-2 border-blue-200 rounded-xl text-xs font-semibold text-blue-700 hover:border-blue-400 transition-colors">
        <span>💉 Pulse Steroid Guidance (Nephrology/Rheumatology)</span>
        {showPulse ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      {showPulse && (
        <div className="space-y-2">
          {PULSE_STEROID.map((p, i) => (
            <div key={i} className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs">
              <p className="font-bold text-blue-900 mb-1">{p.indication}</p>
              <p className="text-blue-800">💊 <strong>Pulse:</strong> {p.drug}</p>
              <p className="text-blue-700">→ <strong>Then:</strong> {p.then}</p>
            </div>
          ))}
        </div>
      )}

      {/* Admin tips */}
      <div>
        <p className="text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">Administration Tips</p>
        <div className="space-y-1.5">
          {Object.entries(ADMIN_TIPS).map(([key, tips]) => (
            <div key={key} className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <button onClick={() => setShowAdmin(showAdmin === key ? null : key)}
                className="w-full flex items-center justify-between px-3 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                <span>💊 {STEROIDS[key]?.name}</span>
                {showAdmin === key ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
              {showAdmin === key && (
                <div className="px-3 pb-3 space-y-1">
                  {tips.map((t, i) => <p key={i} className="text-xs text-slate-700">• {t}</p>)}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}