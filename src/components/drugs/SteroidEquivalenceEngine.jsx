import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, Calculator, RefreshCw, Info, ChevronDown, ChevronUp } from "lucide-react";

// ── Steroid equivalence table (anti-inflammatory potency relative to hydrocortisone) ──
const STEROIDS = {
  hydrocortisone:    { name: "Hydrocortisone",    equiv: 1,    mineralocorticoid: 1.0,  halflife_h: 8,   route: "PO/IV/IM" },
  prednisolone:      { name: "Prednisolone",       equiv: 4,    mineralocorticoid: 0.8,  halflife_h: 18,  route: "PO/IV" },
  prednisone:        { name: "Prednisone",         equiv: 4,    mineralocorticoid: 0.8,  halflife_h: 18,  route: "PO" },
  methylprednisolone:{ name: "Methylprednisolone", equiv: 5,    mineralocorticoid: 0.5,  halflife_h: 18,  route: "PO/IV" },
  dexamethasone:     { name: "Dexamethasone",      equiv: 25,   mineralocorticoid: 0.0,  halflife_h: 36,  route: "PO/IV/IM" },
  betamethasone:     { name: "Betamethasone",      equiv: 25,   mineralocorticoid: 0.0,  halflife_h: 36,  route: "PO/IV/IM" },
  budesonide:        { name: "Budesonide",         equiv: 10,   mineralocorticoid: 0.0,  halflife_h: 5,   route: "PO/inhaled" },
  fludrocortisone:   { name: "Fludrocortisone",    equiv: 10,   mineralocorticoid: 125,  halflife_h: 18,  route: "PO" },
};

const TAPER_PROTOCOLS = {
  short: {
    label: "Short Course (1–2 weeks) — Abrupt stop safe if <2 weeks",
    steps: (startMgEq) => [{ week: "Week 1", dose: startMgEq }, { week: "Week 2", dose: startMgEq * 0.5 }, { week: "Stop", dose: 0 }]
  },
  moderate: {
    label: "Moderate Course (2–8 weeks) — Taper 20–25% every 1–2 weeks",
    steps: (startMgEq) => {
      const steps = [];
      let d = startMgEq; let w = 1;
      while (d > 5) { steps.push({ week: `Week ${w}–${w + 1}`, dose: Math.round(d * 10) / 10 }); d *= 0.75; w += 2; }
      steps.push({ week: `Week ${w}`, dose: 5 });
      steps.push({ week: `Week ${w + 1}–${w + 2}`, dose: 2.5 });
      steps.push({ week: "Stop", dose: 0 });
      return steps;
    }
  },
  prolonged: {
    label: "Prolonged Course (>3 months) — Slow taper, HPA axis suppression risk",
    steps: (startMgEq) => {
      const steps = [];
      let d = startMgEq; let w = 1;
      while (d > 10) { steps.push({ week: `Weeks ${w}–${w + 3}`, dose: Math.round(d * 10) / 10 }); d *= 0.8; w += 4; }
      steps.push({ week: `Weeks ${w}–${w + 3}`, dose: 10 });
      steps.push({ week: `Weeks ${w + 4}–${w + 7}`, dose: 5 });
      steps.push({ week: `Weeks ${w + 8}–${w + 11}`, dose: 2.5 });
      steps.push({ week: "Stop", dose: 0 });
      return steps;
    }
  }
};

const PULSE_PROTOCOLS = [
  {
    name: "Nephrotic Syndrome / GN — Standard Pulse",
    drug: "Methylprednisolone IV",
    dose: "30 mg/kg/day (max 1000 mg)",
    duration: "3 consecutive days",
    infusion: "IV over 60 minutes",
    pre_post: "Monitor BP, glucose every 30 min during infusion; ECG if cardiac risk",
    evidence: "ISKDC 2023 — Steroid-resistant NS"
  },
  {
    name: "Lupus Nephritis Class III/IV",
    drug: "Methylprednisolone IV",
    dose: "500–1000 mg/day (30 mg/kg/day in children)",
    duration: "3 days induction, then monthly pulse × 6",
    infusion: "IV over 30–60 minutes",
    pre_post: "Hydration, BP monitoring. Do not give as bolus (bradycardia risk)",
    evidence: "ACR/EULAR 2019 Lupus Nephritis Guidelines"
  },
  {
    name: "Transplant Rejection — Acute",
    drug: "Methylprednisolone IV",
    dose: "10–15 mg/kg/day (max 1000 mg)",
    duration: "3–5 days",
    infusion: "IV over 30–60 minutes",
    pre_post: "TDM: tacrolimus levels post-pulse. Watch for hyperglycaemia.",
    evidence: "KDIGO Transplant Guidelines 2022"
  },
  {
    name: "Focal Segmental Glomerulosclerosis — Pulse",
    drug: "Methylprednisolone IV",
    dose: "30 mg/kg/day (max 1000 mg) alternate day × 3–6 doses",
    duration: "6 pulses over 2 weeks, then oral",
    infusion: "IV over 60 minutes",
    pre_post: "Follow with oral prednisolone 2 mg/kg alternate day",
    evidence: "IPNA 2021 Childhood NS Guideline"
  }
];

export default function SteroidEquivalenceEngine() {
  const [fromDrug, setFromDrug] = useState("prednisolone");
  const [fromDose, setFromDose] = useState("");
  const [toDrug, setToDrug] = useState("methylprednisolone");
  const [taperProtocol, setTaperProtocol] = useState("moderate");
  const [showTaper, setShowTaper] = useState(false);
  const [showPulse, setShowPulse] = useState(false);

  const fromInfo = STEROIDS[fromDrug];
  const toInfo = STEROIDS[toDrug];

  // Convert: dose_from / equiv_from * equiv_to = equivalent dose in 'to' drug (hydrocortisone as common anchor)
  const converted = fromDose && fromInfo && toInfo
    ? ((parseFloat(fromDose) / fromInfo.equiv) * toInfo.equiv).toFixed(1)
    : null;

  const hydroEquiv = fromDose && fromInfo
    ? (parseFloat(fromDose) / fromInfo.equiv).toFixed(1)
    : null;

  const taperSteps = converted && showTaper
    ? TAPER_PROTOCOLS[taperProtocol]?.steps(parseFloat(fromDose))
    : null;

  const adrenalRisk = fromDose && parseFloat(fromDose) >= 15;

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="bg-gradient-to-r from-orange-500 to-amber-600 text-white border-0">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Calculator className="w-8 h-8" />
            <div>
              <h2 className="font-bold text-lg">Steroid Equivalence & Taper Engine</h2>
              <p className="text-orange-100 text-sm">Convert between corticosteroids · generate taper schedules · pulse dosing</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Equivalence Calculator */}
      <Card className="bg-white border border-slate-200 shadow-sm">
        <CardHeader className="bg-orange-50 border-b py-3 px-5">
          <CardTitle className="text-sm flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-orange-600" /> Steroid Conversion Calculator
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5 space-y-4">
          <div className="grid md:grid-cols-3 gap-4 items-end">
            <div>
              <Label className="text-xs font-semibold">From Drug</Label>
              <Select value={fromDrug} onValueChange={setFromDrug}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(STEROIDS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-semibold">Dose (mg)</Label>
              <Input
                value={fromDose}
                onChange={e => setFromDose(e.target.value)}
                placeholder="e.g. 40"
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs font-semibold">To Drug</Label>
              <Select value={toDrug} onValueChange={setToDrug}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(STEROIDS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {converted && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="col-span-2 bg-orange-50 border-2 border-orange-300 rounded-xl p-4 text-center">
                <p className="text-xs text-orange-600 uppercase font-bold mb-1">Equivalent Dose</p>
                <p className="text-3xl font-bold text-orange-900">{converted} mg</p>
                <p className="text-sm text-orange-700">{toInfo.name}</p>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
                <p className="text-xs text-slate-500 uppercase">Hydrocortisone Equiv</p>
                <p className="text-xl font-bold text-slate-700">{hydroEquiv} mg</p>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
                <p className="text-xs text-slate-500 uppercase">Half-life ({toInfo.name})</p>
                <p className="text-xl font-bold text-slate-700">{toInfo.halflife_h} h</p>
              </div>
            </div>
          )}

          {/* Equivalence reference table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100">
                  <th className="text-left px-3 py-2 font-semibold text-slate-600">Steroid</th>
                  <th className="text-center px-2 py-2 font-semibold text-slate-600">Equiv dose (mg)</th>
                  <th className="text-center px-2 py-2 font-semibold text-slate-600">Anti-inflam potency</th>
                  <th className="text-center px-2 py-2 font-semibold text-slate-600">Mineral corticoid</th>
                  <th className="text-center px-2 py-2 font-semibold text-slate-600">Half-life (h)</th>
                  <th className="text-center px-2 py-2 font-semibold text-slate-600">Route</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(STEROIDS).map(([k, s], i) => (
                  <tr key={k} className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                    <td className="px-3 py-1.5 font-medium text-slate-900">{s.name}</td>
                    <td className="px-2 py-1.5 text-center">{25 / s.equiv} mg ≈ 5 mg Pred</td>
                    <td className="px-2 py-1.5 text-center">{s.equiv}×</td>
                    <td className="px-2 py-1.5 text-center">{s.mineralocorticoid}×</td>
                    <td className="px-2 py-1.5 text-center">{s.halflife_h}</td>
                    <td className="px-2 py-1.5 text-center text-slate-500">{s.route}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Adrenal suppression warning */}
      {adrenalRisk && (
        <Alert className="bg-red-50 border-red-300 border-2">
          <AlertTriangle className="w-4 h-4 text-red-600" />
          <AlertDescription className="text-red-800 text-sm">
            <strong>Adrenal Suppression Risk:</strong> Doses ≥15 mg prednisolone-equivalent for &gt;4 weeks cause HPA axis suppression.
            Do NOT stop abruptly. Sick-day rules: double/triple dose during febrile illness. Adrenal crisis signs: vomiting, lethargy, hypotension, hypoglycaemia.
          </AlertDescription>
        </Alert>
      )}

      {/* Taper Generator */}
      <Card className="bg-white border border-slate-200 shadow-sm">
        <CardHeader className="bg-slate-50 border-b py-3 px-5">
          <button
            className="w-full flex items-center justify-between text-sm font-bold text-slate-700"
            onClick={() => setShowTaper(!showTaper)}
          >
            <span className="flex items-center gap-2">
              <Calculator className="w-4 h-4 text-orange-600" /> Taper Schedule Generator
            </span>
            {showTaper ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </CardHeader>
        {showTaper && (
          <CardContent className="p-5 space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-semibold">Starting Dose ({fromInfo?.name} mg)</Label>
                <Input value={fromDose} onChange={e => setFromDose(e.target.value)} placeholder="e.g. 40" className="mt-1" />
              </div>
              <div>
                <Label className="text-xs font-semibold">Taper Protocol</Label>
                <Select value={taperProtocol} onValueChange={setTaperProtocol}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(TAPER_PROTOCOLS).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{k.charAt(0).toUpperCase() + k.slice(1)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-500 mt-1">{TAPER_PROTOCOLS[taperProtocol]?.label}</p>
              </div>
            </div>

            {fromDose && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-orange-50">
                      <th className="text-left px-3 py-2 text-xs font-bold text-orange-700">Timeframe</th>
                      <th className="text-center px-3 py-2 text-xs font-bold text-orange-700">{fromInfo?.name} dose (mg)</th>
                      <th className="text-center px-3 py-2 text-xs font-bold text-orange-700">Equiv Hydrocortisone (mg)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {TAPER_PROTOCOLS[taperProtocol]?.steps(parseFloat(fromDose) || 0).map((step, i) => (
                      <tr key={i} className={step.dose === 0 ? "bg-green-50" : i % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                        <td className="px-3 py-2 text-slate-700">{step.week}</td>
                        <td className="px-3 py-2 text-center font-bold text-slate-900">
                          {step.dose === 0 ? <span className="text-green-600">STOP ✓</span> : `${step.dose} mg`}
                        </td>
                        <td className="px-3 py-2 text-center text-slate-500">
                          {step.dose === 0 ? "—" : `${(step.dose / fromInfo.equiv).toFixed(1)} mg`}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Pulse Steroid Protocols */}
      <Card className="bg-white border border-slate-200 shadow-sm">
        <CardHeader className="bg-slate-50 border-b py-3 px-5">
          <button
            className="w-full flex items-center justify-between text-sm font-bold text-slate-700"
            onClick={() => setShowPulse(!showPulse)}
          >
            <span className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600" /> Pulse Steroid Protocols
            </span>
            {showPulse ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </CardHeader>
        {showPulse && (
          <CardContent className="p-4 space-y-3">
            {PULSE_PROTOCOLS.map((p, i) => (
              <div key={i} className="border border-amber-200 bg-amber-50 rounded-lg p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h4 className="font-bold text-amber-900 text-sm">{p.name}</h4>
                  <Badge className="bg-amber-200 text-amber-800 text-xs whitespace-nowrap">{p.drug}</Badge>
                </div>
                <div className="grid md:grid-cols-2 gap-2 text-xs text-amber-800">
                  <div><strong>Dose:</strong> {p.dose}</div>
                  <div><strong>Duration:</strong> {p.duration}</div>
                  <div><strong>Infusion:</strong> {p.infusion}</div>
                  <div><strong>Monitoring:</strong> {p.pre_post}</div>
                </div>
                <p className="text-xs text-amber-600 mt-2 italic">Evidence: {p.evidence}</p>
              </div>
            ))}
            <Alert className="bg-red-50 border-red-200">
              <Info className="w-4 h-4 text-red-600" />
              <AlertDescription className="text-xs text-red-800">
                <strong>Pulse Steroid Safety:</strong> Never administer IV methylprednisolone as bolus — bradycardia risk.
                Infuse over minimum 30 minutes (preferably 60 min for doses ≥500 mg).
                Monitor BP and glucose every 30 minutes. Have resuscitation equipment available.
              </AlertDescription>
            </Alert>
          </CardContent>
        )}
      </Card>
    </div>
  );
}