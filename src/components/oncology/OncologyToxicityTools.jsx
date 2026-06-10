import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, Calculator, CheckCircle2, XCircle, Info } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

const DISCLAIMER = "⚠️ Decision-support only. Verify all doses against your institutional protocol and formulary. Not a substitute for clinical judgment.";

const GFR_BANDS = [
  { label: ">150 ml/min/1.73m²", min: 150, max: Infinity, dose: 560 },
  { label: "100–150 ml/min/1.73m²", min: 100, max: 150, dose: 500 },
  { label: "75–99 ml/min/1.73m²", min: 75, max: 100, dose: 370 },
  { label: "50–74 ml/min/1.73m²", min: 50, max: 75, dose: 290 },
  { label: "30–49 ml/min/1.73m²", min: 30, max: 50, dose: 200 },
  { label: "<30 ml/min/1.73m²", min: 0, max: 30, dose: null },
];

async function logTool(toolName, inputs, result) {
  try {
    await base44.entities.ToolLog.create({
      tool_name: toolName,
      tool_category: "Oncology",
      input_data: inputs,
      result_summary: result,
      logged_at: new Date().toISOString(),
    });
  } catch { /* non-fatal */ }
}

// ─── 1. Schwartz GFR ────────────────────────────────────────────────────────
export function SchwartzGFRCalc() {
  const [height, setHeight] = useState("");
  const [creatinine, setCreatinine] = useState("");
  const [age, setAge] = useState("");
  const [sex, setSex] = useState("male");
  const [result, setResult] = useState(null);

  const calculate = () => {
    const h = parseFloat(height), cr = parseFloat(creatinine), a = parseFloat(age);
    if (!h || !cr || !a) return toast.error("Fill all fields");
    let F;
    if (a < 1) F = 0.45;
    else if (sex === "female") F = 0.55;
    else if (a <= 16) F = 0.55;
    else F = 0.70;
    const gfr = (F * h) / cr;
    const r = { gfr: gfr.toFixed(1), F };
    setResult(r);
    logTool("Schwartz GFR", { height: h, creatinine: cr, age: a, sex }, `GFR = ${r.gfr} ml/min/1.73m²`);
  };

  return (
    <Card className="border-blue-200">
      <CardHeader className="bg-blue-50 border-b border-blue-100 py-3 px-4">
        <CardTitle className="text-sm font-bold text-blue-900 flex items-center gap-2">
          <Calculator className="w-4 h-4" /> Schwartz GFR Estimate
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">Height (cm)</Label>
            <Input value={height} onChange={e => setHeight(e.target.value)} type="number" placeholder="e.g. 120" className="mt-1 h-8 text-sm" />
          </div>
          <div>
            <Label className="text-xs">Serum Creatinine (mg/dL)</Label>
            <Input value={creatinine} onChange={e => setCreatinine(e.target.value)} type="number" placeholder="e.g. 0.6" className="mt-1 h-8 text-sm" />
          </div>
          <div>
            <Label className="text-xs">Age (years)</Label>
            <Input value={age} onChange={e => setAge(e.target.value)} type="number" placeholder="e.g. 8" className="mt-1 h-8 text-sm" />
          </div>
          <div>
            <Label className="text-xs">Sex</Label>
            <Select value={sex} onValueChange={setSex}>
              <SelectTrigger className="mt-1 h-8 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button onClick={calculate} size="sm" className="w-full bg-blue-600 hover:bg-blue-700">Calculate GFR</Button>
        {result && (
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
            <p className="text-lg font-bold text-blue-900">GFR = {result.gfr} ml/min/1.73m²</p>
            <p className="text-xs text-blue-700 mt-1">F constant used: {result.F} | Formula: F × height / creatinine</p>
          </div>
        )}
        <p className="text-xs text-amber-700 bg-amber-50 rounded p-2 border border-amber-200">{DISCLAIMER}</p>
      </CardContent>
    </Card>
  );
}

// ─── 2. Carboplatin Dose Calculator ─────────────────────────────────────────
export function CarboplatinDoseCalc() {
  const [gfr, setGfr] = useState("");
  const [weight, setWeight] = useState("");
  const [result, setResult] = useState(null);

  const calculate = () => {
    const g = parseFloat(gfr), w = parseFloat(weight);
    if (!g || !w) return toast.error("Enter GFR and weight");
    if (g < 30) {
      setResult({ hold: true, gfr: g });
      logTool("Carboplatin Dose Calculator", { gfr: g, weight: w }, "HOLD — GFR < 30");
      return;
    }
    const newell = 4 * (g + 0.36 * w);
    const band = GFR_BANDS.find(b => g >= b.min && g < b.max) || GFR_BANDS[GFR_BANDS.length - 1];
    const r = { newell: newell.toFixed(0), band, gfr: g };
    setResult(r);
    logTool("Carboplatin Dose Calculator", { gfr: g, weight: w }, `Newell = ${r.newell} mg | Band = ${band.label}`);
  };

  return (
    <Card className="border-purple-200">
      <CardHeader className="bg-purple-50 border-b border-purple-100 py-3 px-4">
        <CardTitle className="text-sm font-bold text-purple-900 flex items-center gap-2">
          <Calculator className="w-4 h-4" /> Carboplatin GFR-Based Dose (Newell)
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">GFR (ml/min/1.73m²)</Label>
            <Input value={gfr} onChange={e => setGfr(e.target.value)} type="number" placeholder="from Schwartz" className="mt-1 h-8 text-sm" />
          </div>
          <div>
            <Label className="text-xs">Weight (kg)</Label>
            <Input value={weight} onChange={e => setWeight(e.target.value)} type="number" placeholder="e.g. 25" className="mt-1 h-8 text-sm" />
          </div>
        </div>
        <Button onClick={calculate} size="sm" className="w-full bg-purple-600 hover:bg-purple-700">Calculate Dose</Button>

        {result && result.hold && (
          <div className="bg-red-50 rounded-lg p-3 border-2 border-red-400">
            <p className="font-bold text-red-800 flex items-center gap-2"><XCircle className="w-4 h-4" /> HOLD CARBOPLATIN</p>
            <p className="text-sm text-red-700 mt-1">GFR {result.gfr} ml/min/1.73m² is &lt;30. Do not administer carboplatin.</p>
          </div>
        )}
        {result && !result.hold && (
          <div className="space-y-2">
            <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
              <p className="text-lg font-bold text-purple-900">Newell dose: {result.newell} mg</p>
              <p className="text-xs text-purple-700 mt-1">4 × (GFR + 0.36 × weight_kg)</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
              <p className="text-xs font-semibold text-slate-700 mb-2">GFR Band Table (SIOP protocol nominal mg/m²):</p>
              <div className="space-y-1">
                {GFR_BANDS.map((b, i) => (
                  <div key={i} className={`flex justify-between text-xs px-2 py-1 rounded ${b.min <= result.gfr && result.gfr < b.max ? "bg-purple-100 font-bold border border-purple-300" : ""}`}>
                    <span>{b.label}</span>
                    <span>{b.dose ? `${b.dose} mg/m²` : <span className="text-red-600 font-bold">HOLD</span>}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        <p className="text-xs text-amber-700 bg-amber-50 rounded p-2 border border-amber-200">{DISCLAIMER}</p>
      </CardContent>
    </Card>
  );
}

// ─── 3. Cumulative Anthracycline Tracker ────────────────────────────────────
export function AnthracyclineTracker() {
  const [doses, setDoses] = useState([{ drug: "Doxorubicin", dose: "", bsa: "" }]);
  const [result, setResult] = useState(null);

  // Doxorubicin equivalent multipliers
  const MULTIPLIERS = { Doxorubicin: 1, Daunorubicin: 0.5, Epirubicin: 0.57, Idarubicin: 3, Mitoxantrone: 4 };

  const calculate = () => {
    let total = 0;
    for (const d of doses) {
      const mg = parseFloat(d.dose), bsa = parseFloat(d.bsa);
      if (mg && bsa) {
        const equiv = (mg / bsa) * (MULTIPLIERS[d.drug] || 1);
        total += equiv;
      }
    }
    const r = { total: total.toFixed(1) };
    setResult(r);
    logTool("Anthracycline Tracker", { doses }, `Total doxorubicin equivalent = ${r.total} mg/m²`);
  };

  const addDose = () => setDoses(prev => [...prev, { drug: "Doxorubicin", dose: "", bsa: "" }]);
  const updateDose = (i, field, val) => setDoses(prev => prev.map((d, idx) => idx === i ? { ...d, [field]: val } : d));

  return (
    <Card className="border-rose-200">
      <CardHeader className="bg-rose-50 border-b border-rose-100 py-3 px-4">
        <CardTitle className="text-sm font-bold text-rose-900 flex items-center gap-2">
          <Calculator className="w-4 h-4" /> Cumulative Anthracycline Dose Tracker
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-3">
        <p className="text-xs text-slate-600">Enter each agent administered. Doses converted to doxorubicin equivalents (mg/m²).</p>
        {doses.map((d, i) => (
          <div key={i} className="grid grid-cols-3 gap-2">
            <Select value={d.drug} onValueChange={v => updateDose(i, "drug", v)}>
              <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.keys(MULTIPLIERS).map(k => <SelectItem key={k} value={k}>{k}</SelectItem>)}
              </SelectContent>
            </Select>
            <Input value={d.dose} onChange={e => updateDose(i, "dose", e.target.value)} type="number" placeholder="Total mg given" className="h-8 text-xs" />
            <Input value={d.bsa} onChange={e => updateDose(i, "bsa", e.target.value)} type="number" placeholder="BSA (m²)" className="h-8 text-xs" />
          </div>
        ))}
        <div className="flex gap-2">
          <Button onClick={addDose} size="sm" variant="outline" className="flex-1 text-xs">+ Add agent</Button>
          <Button onClick={calculate} size="sm" className="flex-1 bg-rose-600 hover:bg-rose-700 text-xs">Calculate</Button>
        </div>
        {result && (
          <div className={`rounded-lg p-3 border-2 ${parseFloat(result.total) >= 300 ? "bg-red-50 border-red-400" : parseFloat(result.total) >= 250 ? "bg-amber-50 border-amber-400" : "bg-green-50 border-green-300"}`}>
            <p className="font-bold text-slate-900">Total: {result.total} mg/m² doxorubicin equivalent</p>
            {parseFloat(result.total) >= 300 && <p className="text-xs text-red-700 mt-1 font-semibold">⚠️ ≥300 mg/m² — high cardiotoxicity risk. Verify protocol allowance.</p>}
            {parseFloat(result.total) >= 250 && parseFloat(result.total) < 300 && <p className="text-xs text-amber-700 mt-1">⚠️ Approaching 300 mg/m² cap. Monitor cardiac function.</p>}
          </div>
        )}
        <p className="text-xs text-amber-700 bg-amber-50 rounded p-2 border border-amber-200">{DISCLAIMER}</p>
      </CardContent>
    </Card>
  );
}

// ─── 4. Haematological Recovery Gate ────────────────────────────────────────
export function HaemRecoveryGate() {
  const [anc, setAnc] = useState("");
  const [platelets, setPlatelets] = useState("");
  const [threshold, setThreshold] = useState("75");
  const [result, setResult] = useState(null);

  const check = () => {
    const a = parseFloat(anc), p = parseFloat(platelets), t = parseFloat(threshold);
    const ancOk = a >= 1.0;
    const platOk = p >= t;
    const ok = ancOk && platOk;
    setResult({ ok, ancOk, platOk, anc: a, platelets: p, threshold: t });
    logTool("Haem Recovery Gate", { anc: a, platelets: p, threshold: t }, ok ? "GO" : "HOLD");
  };

  return (
    <Card className="border-green-200">
      <CardHeader className="bg-green-50 border-b border-green-100 py-3 px-4">
        <CardTitle className="text-sm font-bold text-green-900 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> Haematological Recovery Gate
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">ANC (×10⁹/L)</Label>
            <Input value={anc} onChange={e => setAnc(e.target.value)} type="number" placeholder="e.g. 1.2" className="mt-1 h-8 text-sm" />
          </div>
          <div>
            <Label className="text-xs">Platelets (×10⁹/L)</Label>
            <Input value={platelets} onChange={e => setPlatelets(e.target.value)} type="number" placeholder="e.g. 80" className="mt-1 h-8 text-sm" />
          </div>
        </div>
        <div>
          <Label className="text-xs">Platelet threshold (per protocol)</Label>
          <Select value={threshold} onValueChange={setThreshold}>
            <SelectTrigger className="mt-1 h-8 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="75">≥75 ×10⁹/L (SIOP default)</SelectItem>
              <SelectItem value="100">≥100 ×10⁹/L (some protocols)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={check} size="sm" className="w-full bg-green-600 hover:bg-green-700">Check Recovery</Button>
        {result && (
          <div className={`rounded-lg p-3 border-2 ${result.ok ? "bg-green-50 border-green-400" : "bg-red-50 border-red-400"}`}>
            <p className={`font-bold text-lg ${result.ok ? "text-green-800" : "text-red-800"}`}>
              {result.ok ? "✓ GO — Criteria met" : "✗ HOLD — Not ready"}
            </p>
            <div className="mt-2 space-y-1 text-sm">
              <p className={result.ancOk ? "text-green-700" : "text-red-700"}>
                {result.ancOk ? "✓" : "✗"} ANC {result.anc} ×10⁹/L (need ≥1.0)
              </p>
              <p className={result.platOk ? "text-green-700" : "text-red-700"}>
                {result.platOk ? "✓" : "✗"} Platelets {result.platelets} ×10⁹/L (need ≥{result.threshold})
              </p>
            </div>
          </div>
        )}
        <p className="text-xs text-amber-700 bg-amber-50 rounded p-2 border border-amber-200">{DISCLAIMER}</p>
      </CardContent>
    </Card>
  );
}

// ─── 5. SIOP-Boston Ototoxicity Reference ───────────────────────────────────
export function SIOPBostonReference() {
  const GRADES = [
    { grade: "0", def: "No change from baseline", action: "Continue" },
    { grade: "1", def: "Threshold shift 20–40 dB at ≥8 kHz in at least one ear", action: "Audiometric monitoring — may continue per protocol" },
    { grade: "2", def: "Threshold shift 20–40 dB at ≥4 kHz or >40 dB at ≥8 kHz", action: "Discuss dose modification with oncology team" },
    { grade: "3", def: "Threshold shift >40 dB at ≥2 kHz in at least one ear", action: "Strongly consider stopping platinum agent; consult" },
    { grade: "4", def: "Profound bilateral hearing loss (>40 dB HL in speech frequencies 500–2000 Hz)", action: "Discontinue platinum; hearing rehabilitation referral" },
  ];

  return (
    <Card className="border-indigo-200">
      <CardHeader className="bg-indigo-50 border-b border-indigo-100 py-3 px-4">
        <CardTitle className="text-sm font-bold text-indigo-900 flex items-center gap-2">
          <Info className="w-4 h-4" /> SIOP-Boston Ototoxicity Scale (Reference)
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <p className="text-xs text-slate-600 mb-3">Audiometry required before each cisplatin/carboplatin course. Grade using pure-tone audiometry.</p>
        <div className="space-y-2">
          {GRADES.map(g => (
            <div key={g.grade} className={`flex gap-3 p-2 rounded-lg text-xs border ${
              g.grade === "0" ? "bg-green-50 border-green-200" :
              g.grade === "1" ? "bg-yellow-50 border-yellow-200" :
              g.grade === "2" ? "bg-amber-50 border-amber-200" :
              "bg-red-50 border-red-200"}`}>
              <Badge className={`flex-shrink-0 h-5 w-5 flex items-center justify-center text-xs font-bold ${
                g.grade === "0" ? "bg-green-600" :
                g.grade === "1" ? "bg-yellow-500" :
                g.grade === "2" ? "bg-amber-500" :
                "bg-red-600"}`}>{g.grade}</Badge>
              <div className="flex-1">
                <p className="font-semibold text-slate-800">{g.def}</p>
                <p className="text-slate-600 mt-0.5">→ {g.action}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-amber-700 bg-amber-50 rounded p-2 border border-amber-200 mt-3">{DISCLAIMER}</p>
      </CardContent>
    </Card>
  );
}