import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calculator, ChevronDown, ChevronUp, AlertTriangle, CheckCircle, Info } from "lucide-react";

function AccordionSection({ title, color = "blue", children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  const colorMap = {
    blue: "bg-blue-600", teal: "bg-teal-600", indigo: "bg-indigo-600",
    purple: "bg-purple-600", emerald: "bg-emerald-600", orange: "bg-orange-600"
  };
  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden mb-3">
      <button
        onClick={() => setOpen(o => !o)}
        className={`w-full flex items-center justify-between px-4 py-3 ${colorMap[color]} text-white font-semibold text-sm`}
      >
        {title}
        {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      {open && <div className="p-4 bg-white">{children}</div>}
    </div>
  );
}

function ResultBox({ label, value, unit, interpretation, color = "blue" }) {
  const colorMap = {
    blue: "bg-blue-50 border-blue-200 text-blue-900",
    green: "bg-green-50 border-green-200 text-green-900",
    red: "bg-red-50 border-red-200 text-red-900",
    amber: "bg-amber-50 border-amber-200 text-amber-900",
  };
  return (
    <div className={`rounded-xl border-2 p-4 mt-3 ${colorMap[color]}`}>
      <div className="text-xs font-bold uppercase tracking-wider opacity-70 mb-1">{label}</div>
      <div className="text-2xl font-bold">{value} <span className="text-base font-normal">{unit}</span></div>
      {interpretation && <div className="text-sm mt-1 opacity-80">{interpretation}</div>}
    </div>
  );
}

// ── Bedside Schwartz GFR ──────────────────────────────────────────
function SchwartzGFR() {
  const [height, setHeight] = useState("");
  const [creatinine, setCr] = useState("");
  const [age, setAge] = useState("");
  const [result, setResult] = useState(null);

  const calculate = () => {
    const h = parseFloat(height), cr = parseFloat(creatinine), a = parseFloat(age);
    if (!h || !cr || !a) return;
    // Bedside Schwartz 2009: eGFR = 0.413 × (height in cm / SCr in mg/dL)
    const egfr = (0.413 * h) / cr;
    let stage = "", color = "green";
    if (egfr >= 90) { stage = "G1 — Normal or high (≥90)"; color = "green"; }
    else if (egfr >= 60) { stage = "G2 — Mildly decreased (60–89)"; color = "green"; }
    else if (egfr >= 45) { stage = "G3a — Mildly-moderately decreased (45–59)"; color = "amber"; }
    else if (egfr >= 30) { stage = "G3b — Moderately-severely decreased (30–44)"; color = "amber"; }
    else if (egfr >= 15) { stage = "G4 — Severely decreased (15–29)"; color = "red"; }
    else { stage = "G5 — Kidney failure (<15)"; color = "red"; }
    setResult({ egfr: egfr.toFixed(1), stage, color });
  };

  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-500">Formula: eGFR = 0.413 × (Height cm / SCr mg/dL) — Bedside Schwartz 2009</p>
      <div className="grid grid-cols-3 gap-3">
        <div><Label className="text-xs">Age (years)</Label><Input type="number" value={age} onChange={e => setAge(e.target.value)} placeholder="e.g. 8" className="mt-1" /></div>
        <div><Label className="text-xs">Height (cm)</Label><Input type="number" value={height} onChange={e => setHeight(e.target.value)} placeholder="e.g. 120" className="mt-1" /></div>
        <div><Label className="text-xs">SCr (mg/dL)</Label><Input type="number" value={creatinine} onChange={e => setCr(e.target.value)} placeholder="e.g. 0.8" className="mt-1" /></div>
      </div>
      <Button onClick={calculate} className="w-full bg-blue-600 hover:bg-blue-700">Calculate eGFR</Button>
      {result && <ResultBox label="eGFR (Bedside Schwartz)" value={result.egfr} unit="mL/min/1.73m²" interpretation={result.stage} color={result.color} />}
      <div className="text-xs text-slate-400 bg-slate-50 p-2 rounded">
        Adolescent note: Use CKiD U25 equation for age &gt;13 if both Cystatin C and creatinine available.
      </div>
    </div>
  );
}

// ── FENa / FEUrea ─────────────────────────────────────────────────
function FECalculator() {
  const [uNa, setUNa] = useState(""); const [pNa, setPNa] = useState("");
  const [uCr, setUCr] = useState(""); const [pCr, setPCr] = useState("");
  const [uUrea, setUUrea] = useState(""); const [pUrea, setPUrea] = useState("");
  const [result, setResult] = useState(null);

  const calculate = () => {
    const fena = (parseFloat(uNa) && parseFloat(pCr) && parseFloat(pNa) && parseFloat(uCr))
      ? ((parseFloat(uNa) * parseFloat(pCr)) / (parseFloat(pNa) * parseFloat(uCr))) * 100 : null;
    const feurea = (parseFloat(uUrea) && parseFloat(pCr) && parseFloat(pUrea) && parseFloat(uCr))
      ? ((parseFloat(uUrea) * parseFloat(pCr)) / (parseFloat(pUrea) * parseFloat(uCr))) * 100 : null;
    setResult({ fena, feurea });
  };

  const interp = (val, type) => {
    if (type === "fena") {
      if (val < 1) return { text: "Pre-renal AKI (avid Na reabsorption)", color: "amber" };
      if (val > 2) return { text: "Intrinsic AKI / ATN (tubular damage)", color: "red" };
      return { text: "Indeterminate — consider clinical context", color: "blue" };
    } else {
      if (val < 35) return { text: "Pre-renal AKI", color: "amber" };
      if (val > 50) return { text: "Intrinsic AKI / ATN", color: "red" };
      return { text: "Indeterminate", color: "blue" };
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-500">FENa = (UNa × PCr) / (PNa × UCr) × 100 | FEUrea = (UUrea × PCr) / (PUrea × UCr) × 100</p>
      <div className="grid grid-cols-2 gap-3">
        <div><Label className="text-xs">Urine Na (mEq/L)</Label><Input type="number" value={uNa} onChange={e => setUNa(e.target.value)} className="mt-1" /></div>
        <div><Label className="text-xs">Plasma Na (mEq/L)</Label><Input type="number" value={pNa} onChange={e => setPNa(e.target.value)} className="mt-1" /></div>
        <div><Label className="text-xs">Urine Cr (mg/dL)</Label><Input type="number" value={uCr} onChange={e => setUCr(e.target.value)} className="mt-1" /></div>
        <div><Label className="text-xs">Plasma Cr (mg/dL)</Label><Input type="number" value={pCr} onChange={e => setPCr(e.target.value)} className="mt-1" /></div>
        <div><Label className="text-xs">Urine Urea (mg/dL)</Label><Input type="number" value={uUrea} onChange={e => setUUrea(e.target.value)} className="mt-1" /></div>
        <div><Label className="text-xs">Plasma Urea (mg/dL)</Label><Input type="number" value={pUrea} onChange={e => setPUrea(e.target.value)} className="mt-1" /></div>
      </div>
      <Button onClick={calculate} className="w-full bg-teal-600 hover:bg-teal-700">Calculate FENa & FEUrea</Button>
      {result && result.fena !== null && (() => { const i = interp(result.fena, "fena"); return <ResultBox label="FENa" value={result.fena.toFixed(2)} unit="%" interpretation={i.text} color={i.color} />; })()}
      {result && result.feurea !== null && (() => { const i = interp(result.feurea, "feurea"); return <ResultBox label="FEUrea (preferred on diuretics)" value={result.feurea.toFixed(1)} unit="%" interpretation={i.text} color={i.color} />; })()}
    </div>
  );
}

// ── BSA Calculator ────────────────────────────────────────────────
function BSACalculator() {
  const [weight, setWeight] = useState(""); const [height, setHeight] = useState("");
  const [result, setResult] = useState(null);
  const calculate = () => {
    const w = parseFloat(weight), h = parseFloat(height);
    if (!w || !h) return;
    const bsa = Math.sqrt((h * w) / 3600); // Mosteller
    setResult(bsa.toFixed(2));
  };
  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-500">Mosteller formula: BSA = √(Height(cm) × Weight(kg) / 3600)</p>
      <div className="grid grid-cols-2 gap-3">
        <div><Label className="text-xs">Weight (kg)</Label><Input type="number" value={weight} onChange={e => setWeight(e.target.value)} placeholder="e.g. 30" className="mt-1" /></div>
        <div><Label className="text-xs">Height (cm)</Label><Input type="number" value={height} onChange={e => setHeight(e.target.value)} placeholder="e.g. 130" className="mt-1" /></div>
      </div>
      <Button onClick={calculate} className="w-full bg-indigo-600 hover:bg-indigo-700">Calculate BSA</Button>
      {result && <ResultBox label="Body Surface Area" value={result} unit="m²" interpretation="Use for cyclophosphamide, biologics, transplant dosing" color="blue" />}
    </div>
  );
}

// ── Tubular Calculators ───────────────────────────────────────────
function TubularCalculators() {
  const [uK, setUK] = useState(""); const [pK, setPK] = useState(""); const [uOsm, setUOsm] = useState(""); const [pOsm, setPOsm] = useState("");
  const [uNaT, setUNaT] = useState(""); const [uKT, setUKT] = useState(""); const [uClT, setUClT] = useState("");
  const [uCaT, setUCaT] = useState(""); const [uCrT, setUCrT] = useState("");
  const [hco3, setHco3] = useState(""); const [weight, setWeight] = useState("");
  const [results, setResults] = useState(null);

  const calculate = () => {
    const r = {};
    if (uK && pK && uOsm && pOsm) {
      r.ttkg = ((parseFloat(uK) / parseFloat(pK)) / (parseFloat(uOsm) / parseFloat(pOsm))).toFixed(2);
    }
    if (uNaT && uKT && uClT) {
      r.uag = (parseFloat(uNaT) + parseFloat(uKT) - parseFloat(uClT)).toFixed(1);
    }
    if (uCaT && uCrT) {
      r.cacr = (parseFloat(uCaT) / parseFloat(uCrT)).toFixed(2);
    }
    if (hco3 && weight) {
      // Bicarbonate deficit = 0.3 × weight × (24 - measured HCO3)
      r.bicarb = (0.3 * parseFloat(weight) * (24 - parseFloat(hco3))).toFixed(1);
    }
    setResults(r);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2 text-xs font-bold text-slate-600 uppercase tracking-wider">TTKG (Hypo/Hyperkalemia workup)</div>
        <div><Label className="text-xs">Urine K (mEq/L)</Label><Input type="number" value={uK} onChange={e => setUK(e.target.value)} className="mt-1" /></div>
        <div><Label className="text-xs">Plasma K (mEq/L)</Label><Input type="number" value={pK} onChange={e => setPK(e.target.value)} className="mt-1" /></div>
        <div><Label className="text-xs">Urine Osmolality</Label><Input type="number" value={uOsm} onChange={e => setUOsm(e.target.value)} className="mt-1" /></div>
        <div><Label className="text-xs">Plasma Osmolality</Label><Input type="number" value={pOsm} onChange={e => setPOsm(e.target.value)} className="mt-1" /></div>

        <div className="col-span-2 text-xs font-bold text-slate-600 uppercase tracking-wider mt-2">Urine Anion Gap (RTA workup)</div>
        <div><Label className="text-xs">Urine Na (mEq/L)</Label><Input type="number" value={uNaT} onChange={e => setUNaT(e.target.value)} className="mt-1" /></div>
        <div><Label className="text-xs">Urine K (mEq/L)</Label><Input type="number" value={uKT} onChange={e => setUKT(e.target.value)} className="mt-1" /></div>
        <div className="col-span-2"><Label className="text-xs">Urine Cl (mEq/L)</Label><Input type="number" value={uClT} onChange={e => setUClT(e.target.value)} className="mt-1" /></div>

        <div className="col-span-2 text-xs font-bold text-slate-600 uppercase tracking-wider mt-2">Calcium/Creatinine Ratio</div>
        <div><Label className="text-xs">Urine Ca (mg/dL)</Label><Input type="number" value={uCaT} onChange={e => setUCaT(e.target.value)} className="mt-1" /></div>
        <div><Label className="text-xs">Urine Cr (mg/dL)</Label><Input type="number" value={uCrT} onChange={e => setUCrT(e.target.value)} className="mt-1" /></div>

        <div className="col-span-2 text-xs font-bold text-slate-600 uppercase tracking-wider mt-2">Bicarbonate Deficit</div>
        <div><Label className="text-xs">Measured HCO3 (mEq/L)</Label><Input type="number" value={hco3} onChange={e => setHco3(e.target.value)} className="mt-1" /></div>
        <div><Label className="text-xs">Weight (kg)</Label><Input type="number" value={weight} onChange={e => setWeight(e.target.value)} className="mt-1" /></div>
      </div>
      <Button onClick={calculate} className="w-full bg-purple-600 hover:bg-purple-700">Calculate All</Button>
      {results && (
        <div className="space-y-2">
          {results.ttkg && <ResultBox label="TTKG" value={results.ttkg} unit="" interpretation={parseFloat(results.ttkg) < 2 ? "Low — Extrarenal K+ loss (diarrhea, inadequate intake)" : parseFloat(results.ttkg) > 7 ? "High — Renal K+ wasting (hyperaldosteronism, Bartter)" : "Normal range 3–7"} color="blue" />}
          {results.uag && <ResultBox label="Urine Anion Gap (UAG)" value={results.uag} unit="mEq/L" interpretation={parseFloat(results.uag) < 0 ? "Negative UAG → Diarrhea or GI HCO3 loss (normal NH4+ excretion)" : "Positive UAG → Impaired NH4+ excretion → RTA"} color={parseFloat(results.uag) < 0 ? "green" : "amber"} />}
          {results.cacr && <ResultBox label="Ca/Cr Ratio" value={results.cacr} unit="mg/mg" interpretation={parseFloat(results.cacr) > 0.2 ? "Hypercalciuria (>0.2 mg/mg) — stone risk, nephrocalcinosis" : "Normal (<0.2 mg/mg)"} color={parseFloat(results.cacr) > 0.2 ? "red" : "green"} />}
          {results.bicarb && <ResultBox label="Bicarbonate Deficit" value={results.bicarb} unit="mmol" interpretation="Replace 50% in first 4–6h; recheck blood gas. Formula: 0.3 × weight × (24 − HCO3)" color="amber" />}
        </div>
      )}
    </div>
  );
}

// ── BP Calculators ────────────────────────────────────────────────
function BPCalculator() {
  const [systolic, setSystolic] = useState(""); const [diastolic, setDiastolic] = useState("");
  const [age, setAge] = useState(""); const [height, setHeight] = useState("");
  const [result, setResult] = useState(null);

  const calculate = () => {
    const s = parseFloat(systolic), d = parseFloat(diastolic), a = parseFloat(age);
    if (!s || !d || !a) return;
    const map = ((s + (2 * d)) / 3).toFixed(1);
    // Approximate AAP 2017 staging
    let stage = "", color = "green";
    if (s < 90 + a) { stage = "Normal BP"; color = "green"; }
    else if (s < 95 + a + 12) { stage = "Elevated BP (90th–95th %ile)"; color = "amber"; }
    else if (s < 99 + a + 12) { stage = "Stage 1 HTN (≥95th %ile)"; color = "orange"; }
    else { stage = "Stage 2 HTN (≥99th %ile + 12 mmHg)"; color = "red"; }
    setResult({ map, stage, color });
  };

  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-500">MAP = (SBP + 2×DBP) / 3 | BP staging per AAP 2017 (simplified)</p>
      <div className="grid grid-cols-2 gap-3">
        <div><Label className="text-xs">Age (years)</Label><Input type="number" value={age} onChange={e => setAge(e.target.value)} className="mt-1" /></div>
        <div><Label className="text-xs">Height (cm)</Label><Input type="number" value={height} onChange={e => setHeight(e.target.value)} className="mt-1" /></div>
        <div><Label className="text-xs">Systolic BP (mmHg)</Label><Input type="number" value={systolic} onChange={e => setSystolic(e.target.value)} className="mt-1" /></div>
        <div><Label className="text-xs">Diastolic BP (mmHg)</Label><Input type="number" value={diastolic} onChange={e => setDiastolic(e.target.value)} className="mt-1" /></div>
      </div>
      <Button onClick={calculate} className="w-full bg-emerald-600 hover:bg-emerald-700">Classify BP</Button>
      {result && (
        <>
          <ResultBox label="Mean Arterial Pressure (MAP)" value={result.map} unit="mmHg" color="blue" />
          <ResultBox label="BP Stage (AAP 2017)" value={result.stage} unit="" color={result.color} interpretation="Use full percentile tables for definitive staging. Consider 3 separate readings." />
        </>
      )}
    </div>
  );
}

export default function NephrologyCalculators() {
  return (
    <div className="space-y-2">
      <Alert className="bg-blue-50 border-blue-200 mb-4">
        <Calculator className="w-4 h-4 text-blue-600" />
        <AlertDescription className="text-blue-800 text-sm">
          Pediatric nephrology calculators — always verify results against clinical context and local reference ranges.
        </AlertDescription>
      </Alert>

      <AccordionSection title="🧪 Bedside Schwartz GFR" color="blue" defaultOpen>
        <SchwartzGFR />
      </AccordionSection>

      <AccordionSection title="⚗️ FENa / FEUrea Calculator" color="teal">
        <FECalculator />
      </AccordionSection>

      <AccordionSection title="📐 BSA Calculator (Mosteller)" color="indigo">
        <BSACalculator />
      </AccordionSection>

      <AccordionSection title="🔬 Tubular Calculators (TTKG, UAG, Ca/Cr, HCO3)" color="purple">
        <TubularCalculators />
      </AccordionSection>

      <AccordionSection title="❤️ Blood Pressure Classification (AAP 2017)" color="emerald">
        <BPCalculator />
      </AccordionSection>
    </div>
  );
}