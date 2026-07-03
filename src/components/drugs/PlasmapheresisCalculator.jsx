import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Droplets, Calculator, AlertTriangle, ClipboardList, Info, ChevronDown, ChevronUp } from "lucide-react";

// ─── Reference data from PDF (AJKD 2023 Core Curriculum Table) ───
const MRR_TABLE = [
  { ratio: 0.5, mrr: 39 },
  { ratio: 1.0, mrr: 63 },
  { ratio: 1.5, mrr: 78 },
  { ratio: 2.0, mrr: 86 },
  { ratio: 2.5, mrr: 92 },
  { ratio: 3.0, mrr: 95 },
];

// Pre-medication and procedure steps from SJMCH monitoring sheet + Daugirdas 5th ed
const PROCEDURE_STEPS = [
  {
    step: 1,
    title: "Pre-procedure Assessment",
    color: "bg-blue-50 border-blue-200",
    badge: "bg-blue-100 text-blue-800",
    items: [
      "Weigh patient (use ideal body weight for obese patients)",
      "Record pre-PLEX BP, HR, SpO₂, RR",
      "Check CBC, coagulation profile (PT, aPTT, fibrinogen), electrolytes, ionised Ca²⁺",
      "Confirm vascular access: CVC/HD line for membrane (MPS); peripheral antecubital vein for centrifugal",
      "Document 24-hr intake and output",
      "Select filter size: PSu 1S (paediatric <30 kg) or PSu 2S (≥30 kg or adult)",
    ]
  },
  {
    step: 2,
    title: "Pre-medication (each session)",
    color: "bg-amber-50 border-amber-200",
    badge: "bg-amber-100 text-amber-800",
    items: [
      "Inj. Avil (Pheniramine) — IV, antihistamine",
      "Inj. Hydrocortisone — IV (50–100 mg)",
      "PCM — if febrile or discomfort expected",
      "Inj. Calcium gluconate 10% — 10 mL per litre of replacement fluid (prophylactic for citrate; continuous or intermittent)",
    ]
  },
  {
    step: 3,
    title: "Machine Setup & Anticoagulation",
    color: "bg-purple-50 border-purple-200",
    badge: "bg-purple-100 text-purple-800",
    items: [
      "MPS (membrane): Heparin — 3,000–5,000 U IV bolus + ~1,000 U/hr infusion; adjust for low Hct (higher dose)",
      "Centrifugal: Citrate ACD-A — blood:anticoagulant ratio ≈ 10:1 to 14:1",
      "BFR (Qb): MPS → 100–150 mL/min; Centrifugal → 40–50 mL/min",
      "TMP: keep <500 mmHg (membrane) to avoid haemolysis",
      "Priming solution: 0.9% NaCl (document volume)",
      "Extracorporeal volume must be <15% of patient's total blood volume",
    ]
  },
  {
    step: 4,
    title: "Replacement Fluid Protocol",
    color: "bg-teal-50 border-teal-200",
    badge: "bg-teal-100 text-teal-800",
    items: [
      "Albumin (standard): Replace initial 20–30% of exchange volume with 0.9% NS, then 5% albumin for remainder",
      "If using 20% albumin → dilute with 0.9% NS only (NOT water — causes hyponatraemia/haemolysis)",
      "FFP (TTP-HUS, bleeding risk, fibrinogen <125 mg/dL, anti-FH aHUS): 60–75 mL/kg per session",
      "Add Inj. KCl to albumin if hypokalemia expected (albumin depletes K⁺ ~25%)",
      "Calcium gluconate 10mL/L of replacement fluid to counteract citrate chelation",
    ]
  },
  {
    step: 5,
    title: "Intradialytic Monitoring",
    color: "bg-green-50 border-green-200",
    badge: "bg-green-100 text-green-800",
    items: [
      "Record HR, BP, RR, SpO₂ every 30 minutes",
      "Monitor ionised Ca²⁺ — target 1.1–1.4 mmol/L",
      "Watch for hypocalcaemia: perioral/acral paraesthesia, twitching, carpopedal spasm, laryngospasm, QT prolongation on ECG",
      "Watch for hypotension, dyspnoea, allergic reactions",
      "Continuous cardiac monitoring if IJV access with citrate anticoagulation",
      "Record effluent colour and volume",
    ]
  },
  {
    step: 6,
    title: "Post-procedure",
    color: "bg-rose-50 border-rose-200",
    badge: "bg-rose-100 text-rose-800",
    items: [
      "Record post-PLEX weight, BP, HR",
      "Check electrolytes (Na, K, Ca²⁺), ionised Ca²⁺, coagulation if bleeding concern",
      "Note: fibrinogen falls 80%, PT/PTT factors fall 50–70% — recheck before next session",
      "Fibrinogen requires 48–72 hrs for full recovery; do NOT test coag within 8–12 hrs post-TPE",
      "If haemorrhage: give 2–4 units FFP at end of procedure",
      "Heparin lock CVC with 1000 U/mL heparin after completion",
      "Document effluent volume, complications, physician sign & HD tech countersign",
    ]
  }
];

const COMPLICATION_STRATEGIES = [
  { comp: "Low ionised Ca²⁺", mgmt: "Prophylactic 10% calcium gluconate 10 mL/L replacement fluid" },
  { comp: "Haemorrhage", mgmt: "2–4 units FFP at end of procedure" },
  { comp: "Thrombocytopenia", mgmt: "Consider membrane plasma separation (not centrifugal)" },
  { comp: "Post-apheresis infection", mgmt: "IVIG 100–400 mg/kg infusion" },
  { comp: "Hypokalaemia", mgmt: "K⁺ 4 mM in replacement solution; add KCl to albumin" },
  { comp: "FFP/Albumin sensitivity", mgmt: "Hydrocortisone IV + Diphenhydramine IV + H₂ antagonist pre-med; measure anti-IgA titres" },
  { comp: "Hypotension", mgmt: "Slow rate, 0.9% NS bolus 10 mL/kg; hold ACEi 24–48 hrs before session" },
  { comp: "Alkalosis", mgmt: "Limit citrate rate, reduce FFP citrate load" },
];

function StepCard({ step }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`rounded-xl border-2 ${step.color} overflow-hidden`}>
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-black/5 transition-colors">
        <div className="flex items-center gap-3">
          <span className={`w-7 h-7 rounded-full ${step.badge} text-sm font-bold flex items-center justify-center flex-shrink-0`}>
            {step.step}
          </span>
          <p className="text-sm font-bold text-slate-800">{step.title}</p>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />}
      </button>
      {open && (
        <div className="px-4 pb-4 space-y-1">
          {step.items.map((item, i) => (
            <div key={i} className="flex gap-2.5">
              <span className="text-slate-400 font-bold text-xs mt-0.5 flex-shrink-0">→</span>
              <p className="text-xs text-slate-700 leading-relaxed">{item}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function PlasmapheresisCalculator() {
  const [weight, setWeight] = useState("");
  const [hematocrit, setHematocrit] = useState("34");
  const [exchangeRatio, setExchangeRatio] = useState("1.0");
  const [replacementFluid, setReplacementFluid] = useState("albumin");
  const [bfr, setBfr] = useState("100");
  const [activeTab, setActiveTab] = useState("calculator");

  // ─── Core Calculations (from PDF formulas) ───
  const calc = useMemo(() => {
    const wt = parseFloat(weight);
    const hctRaw = parseFloat(hematocrit);
    const ratio = parseFloat(exchangeRatio);
    const qb = parseFloat(bfr);

    if (!wt || wt <= 0 || isNaN(hctRaw) || isNaN(ratio)) return null;
    // Hct must be a percentage in a sane physiological range (1–65%); reject fractions/≥100
    if (hctRaw < 1 || hctRaw >= 66) return { invalid: "Enter haematocrit as a percentage between 1 and 65 (e.g. 30 for 30%)." };
    const hct = hctRaw / 100;

    // EPV = 0.065 × BW × (1 − Hct) [Daugirdas 5th ed]
    const epv_L = 0.065 * wt * (1 - hct);
    const epv_mL = epv_L * 1000;

    // Exchange volume for selected ratio
    const ve_mL = epv_mL * ratio;

    // MRR = (1 − e^(−Ve/Vp)) × 100
    const mrr = (1 - Math.exp(-ratio)) * 100;

    // Thumb rule EPV (35 mL/kg normal Hct, 40 mL/kg low Hct)
    const thumbEPV = hct < 0.35 ? wt * 40 : wt * 35;

    // Total blood volume ≈ EPV / (1 − Hct)
    const tbv_mL = epv_mL / (1 - hct);

    // Extracorporeal volume limit: <15% TBV
    const ecv_limit = tbv_mL * 0.15;

    // Paediatric FFP dose (60–75 mL/kg per Bagga/ISPN)
    const ffp_min = wt * 60;
    const ffp_max = wt * 75;

    // Session duration estimate: at BFR 100 mL/min → plasma removal 30–50 mL/min
    // Use 40 mL/min as mean plasma filtration rate
    const plasmafiltration_rate = qb ? Math.min(qb * 0.4, 50) : 40; // 40% of Qb, max 50
    const duration_min = ve_mL / plasmafiltration_rate;
    const duration_hr = Math.floor(duration_min / 60);
    const duration_rem = Math.round(duration_min % 60);

    // Albumin replacement volumes (20–30% NS first, rest albumin)
    const saline_vol = ve_mL * 0.25; // 25% of exchange with NS
    const albumin_vol = ve_mL * 0.75; // remaining 75% with 5% albumin

    // FFP units (1 unit = ~200–250 mL) for FFP replacement
    const ffp_units_min = Math.ceil(ve_mL / 250);
    const ffp_units_max = Math.ceil(ve_mL / 200);

    // Calcium gluconate: 10 mL of 10% per litre of replacement fluid
    const ca_mL = (ve_mL / 1000) * 10;

    return {
      epv_mL: epv_mL.toFixed(0),
      epv_L: epv_L.toFixed(2),
      thumbEPV: thumbEPV.toFixed(0),
      ve_mL: ve_mL.toFixed(0),
      mrr: mrr.toFixed(1),
      tbv_mL: tbv_mL.toFixed(0),
      ecv_limit: ecv_limit.toFixed(0),
      ffp_min: ffp_min.toFixed(0),
      ffp_max: ffp_max.toFixed(0),
      duration_hr,
      duration_rem,
      saline_vol: saline_vol.toFixed(0),
      albumin_vol: albumin_vol.toFixed(0),
      ffp_units_min,
      ffp_units_max,
      ca_mL: ca_mL.toFixed(1),
    };
  }, [weight, hematocrit, exchangeRatio, bfr]);

  const tabs = [
    { id: "calculator", label: "📐 Calculator" },
    { id: "steps", label: "📋 Procedure Steps" },
    { id: "complications", label: "⚠️ Complications" },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-700 to-cyan-700 rounded-2xl p-5 text-white shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <Droplets className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Plasmapheresis Dosing Calculator</h1>
            <p className="text-teal-100 text-sm mt-0.5">
              EPV · Volume Replacement · MRR · Session Duration
            </p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              <Badge className="bg-white/20 text-xs border-0">Daugirdas 5th Ed</Badge>
              <Badge className="bg-white/20 text-xs border-0">AJKD Core Curriculum 2023</Badge>
              <Badge className="bg-white/20 text-xs border-0">SJMCH Protocol</Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Nav */}
      <div className="flex gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-semibold border transition-all ${activeTab === t.id ? "bg-teal-600 text-white border-teal-600 shadow" : "bg-white text-slate-600 border-slate-200 hover:border-teal-300"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── CALCULATOR TAB ── */}
      {activeTab === "calculator" && (
        <div className="space-y-4">
          {/* Inputs */}
          <Card className="border-2 border-teal-200 bg-teal-50/40">
            <CardHeader className="py-3 px-4 border-b border-teal-100">
              <CardTitle className="text-sm flex items-center gap-2 text-teal-900">
                <Calculator className="w-4 h-4" /> Patient Parameters
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 grid grid-cols-2 md:grid-cols-3 gap-3">
              <div>
                <Label className="text-xs font-semibold text-slate-600">Weight (kg)</Label>
                <Input value={weight} onChange={e => setWeight(e.target.value)}
                  placeholder="e.g. 30" className="mt-1 h-9 text-sm" />
                <p className="text-xs text-slate-400 mt-0.5">Ideal body weight if obese</p>
              </div>
              <div>
                <Label className="text-xs font-semibold text-slate-600">Haematocrit (%)</Label>
                <Input value={hematocrit} onChange={e => setHematocrit(e.target.value)}
                  placeholder="e.g. 34" className="mt-1 h-9 text-sm" />
                <p className="text-xs text-slate-400 mt-0.5">Use 34% if low Hct (anaemia)</p>
              </div>
              <div>
                <Label className="text-xs font-semibold text-slate-600">Exchange Ratio (Ve/Vp)</Label>
                <Select value={exchangeRatio} onValueChange={setExchangeRatio}>
                  <SelectTrigger className="mt-1 h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0.5">0.5× EPV — 39% MRR</SelectItem>
                    <SelectItem value="1.0">1.0× EPV — 63% MRR (standard)</SelectItem>
                    <SelectItem value="1.5">1.5× EPV — 78% MRR (aHUS/TTP)</SelectItem>
                    <SelectItem value="2.0">2.0× EPV — 86% MRR</SelectItem>
                    <SelectItem value="2.5">2.5× EPV — 92% MRR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs font-semibold text-slate-600">Blood Flow Rate (mL/min)</Label>
                <Select value={bfr} onValueChange={setBfr}>
                  <SelectTrigger className="mt-1 h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="50">50 mL/min (centrifugal, peripheral)</SelectItem>
                    <SelectItem value="100">100 mL/min (MPS, ideal)</SelectItem>
                    <SelectItem value="150">150 mL/min (MPS, adult)</SelectItem>
                    <SelectItem value="200">200 mL/min (MPS PSu 2S)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs font-semibold text-slate-600">Replacement Fluid</Label>
                <Select value={replacementFluid} onValueChange={setReplacementFluid}>
                  <SelectTrigger className="mt-1 h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="albumin">5% Albumin (standard)</SelectItem>
                    <SelectItem value="ffp">Fresh Frozen Plasma (TTP/aHUS)</SelectItem>
                    <SelectItem value="mixed">Mixed (Albumin + FFP)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          {calc?.invalid ? (
            <Alert className="bg-amber-50 border-amber-300">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <AlertDescription className="text-amber-800 text-sm">{calc.invalid}</AlertDescription>
            </Alert>
          ) : calc ? (
            <div className="space-y-3">
              {/* Core volumes */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: "Estimated Plasma Volume", value: `${calc.epv_mL} mL`, sub: `${calc.epv_L} L`, highlight: true },
                  { label: "Total Exchange Volume", value: `${calc.ve_mL} mL`, sub: `${exchangeRatio}× EPV`, highlight: true },
                  { label: "Macromolecule Reduction", value: `${calc.mrr}%`, sub: "MRR (1−e^−Ve/Vp)×100", highlight: false },
                  { label: "Estimated Duration", value: `${calc.duration_hr}h ${calc.duration_rem}m`, sub: `Qb ${bfr} mL/min`, highlight: false },
                ].map(({ label, value, sub, highlight }) => (
                  <div key={label} className={`rounded-xl border-2 p-3 text-center ${highlight ? "bg-teal-50 border-teal-300" : "bg-white border-slate-200"}`}>
                    <p className="text-xs text-slate-500 leading-tight mb-1">{label}</p>
                    <p className={`font-bold text-lg ${highlight ? "text-teal-800" : "text-slate-800"}`}>{value}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
                  </div>
                ))}
              </div>

              {/* Safety check */}
              <div className="rounded-xl border-2 border-amber-200 bg-amber-50 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <p className="text-xs font-bold text-amber-800">Safety Checks (Paediatric)</p>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-500">Total Blood Volume:</span>
                    <span className="font-bold text-slate-800 ml-1">{calc.tbv_mL} mL</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Max Extracorporeal Vol (15% TBV):</span>
                    <span className="font-bold text-red-700 ml-1">&lt; {calc.ecv_limit} mL</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Thumb-rule EPV check:</span>
                    <span className="font-bold text-slate-800 ml-1">{calc.thumbEPV} mL</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Filter: </span>
                    <span className="font-bold text-indigo-700 ml-1">{parseFloat(weight) < 30 ? "PSu 1S (0.3 m²)" : "PSu 2S (0.6 m²)"}</span>
                  </div>
                </div>
              </div>

              {/* Fluid prescription */}
              <Card className="border border-slate-200">
                <CardHeader className="py-3 px-4 border-b bg-slate-50">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <ClipboardList className="w-4 h-4 text-indigo-600" /> Fluid Prescription
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  {(replacementFluid === "albumin" || replacementFluid === "mixed") && (
                    <div className="rounded-lg border border-green-200 bg-green-50 p-3 space-y-1">
                      <p className="text-xs font-bold text-green-800">5% Albumin Protocol (Daugirdas)</p>
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        <div className="bg-white rounded p-2 text-center border border-green-100">
                          <p className="text-xs text-slate-500">Phase 1: 0.9% NaCl (initial 25%)</p>
                          <p className="text-base font-bold text-slate-800">{calc.saline_vol} mL</p>
                        </div>
                        <div className="bg-white rounded p-2 text-center border border-green-100">
                          <p className="text-xs text-slate-500">Phase 2: 5% Albumin (75%)</p>
                          <p className="text-base font-bold text-slate-800">{calc.albumin_vol} mL</p>
                        </div>
                      </div>
                      <p className="text-xs text-green-700">⚠️ Prepare 5% albumin from 20% albumin using 0.9% NS only (NOT water)</p>
                    </div>
                  )}

                  {(replacementFluid === "ffp" || replacementFluid === "mixed") && (
                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 space-y-1">
                      <p className="text-xs font-bold text-blue-800">FFP Protocol (aHUS/TTP — Bagga/ISPN)</p>
                      <div className="grid grid-cols-3 gap-2 mt-1">
                        <div className="bg-white rounded p-2 text-center border border-blue-100">
                          <p className="text-xs text-slate-500">60 mL/kg dose</p>
                          <p className="text-base font-bold text-slate-800">{calc.ffp_min} mL</p>
                        </div>
                        <div className="bg-white rounded p-2 text-center border border-blue-100">
                          <p className="text-xs text-slate-500">75 mL/kg dose</p>
                          <p className="text-base font-bold text-slate-800">{calc.ffp_max} mL</p>
                        </div>
                        <div className="bg-white rounded p-2 text-center border border-blue-100">
                          <p className="text-xs text-slate-500">Units FFP needed</p>
                          <p className="text-base font-bold text-slate-800">{calc.ffp_units_min}–{calc.ffp_units_max} U</p>
                        </div>
                      </div>
                      <p className="text-xs text-blue-700">ABO compatibility mandatory. FFP has 14% citrate — include in total citrate calculation.</p>
                    </div>
                  )}

                  {/* Calcium gluconate */}
                  <div className="rounded-lg border border-orange-200 bg-orange-50 p-3">
                    <p className="text-xs font-bold text-orange-800">Calcium Gluconate 10% (prophylactic)</p>
                    <div className="flex items-center gap-4 mt-1">
                      <div className="bg-white rounded p-2 text-center border border-orange-100 min-w-[80px]">
                        <p className="text-xs text-slate-500">Total dose</p>
                        <p className="text-base font-bold text-slate-800">{calc.ca_mL} mL</p>
                      </div>
                      <p className="text-xs text-orange-700">10 mL of 10% per litre of replacement fluid. Add to infusion or give intermittently. Target ionised Ca²⁺: 1.1–1.4 mmol/L</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* MRR reference table */}
              <Card className="border border-slate-200">
                <CardHeader className="py-3 px-4 border-b bg-slate-50">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Info className="w-4 h-4 text-slate-500" /> MRR Reference (AJKD 2023, Table — 70 kg patient Hct 45%)
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 overflow-x-auto">
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100">
                        <th className="px-3 py-2 text-left font-bold">Ve/Vp Ratio</th>
                        <th className="px-3 py-2 text-center font-bold">Volume Exchanged (mL) *</th>
                        <th className="px-3 py-2 text-center font-bold">MRR (%)</th>
                        <th className="px-3 py-2 text-center font-bold">For This Patient (mL)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {MRR_TABLE.map((row, i) => (
                        <tr key={i} className={`${String(row.ratio) === exchangeRatio ? "bg-teal-100 font-bold border-y-2 border-teal-300" : i % 2 === 0 ? "bg-white" : "bg-slate-50"}`}>
                          <td className="px-3 py-2">{row.ratio}×</td>
                          <td className="px-3 py-2 text-center">{(2800 * row.ratio).toLocaleString()}</td>
                          <td className="px-3 py-2 text-center">
                            <Badge className={`text-xs ${row.mrr >= 75 ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-700"}`}>{row.mrr}%</Badge>
                          </td>
                          <td className="px-3 py-2 text-center text-teal-700">
                            {calc ? (parseFloat(calc.epv_mL) * row.ratio).toFixed(0) : "—"} mL
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p className="text-xs text-slate-400 px-3 py-2">* Reference column assumes EPV 2,800 mL (70 kg, Hct 45%). Right column uses your patient's EPV.</p>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="rounded-xl border-2 border-dashed border-teal-200 p-10 text-center">
              <Droplets className="w-12 h-12 text-teal-200 mx-auto mb-3" />
              <p className="text-slate-400 text-sm">Enter patient weight and haematocrit to calculate</p>
              <p className="text-slate-300 text-xs mt-1">Formula: EPV = 0.065 × Weight × (1 − Hct)</p>
            </div>
          )}
        </div>
      )}

      {/* ── PROCEDURE STEPS TAB ── */}
      {activeTab === "steps" && (
        <div className="space-y-3">
          <Alert className="bg-indigo-50 border-indigo-200">
            <ClipboardList className="w-4 h-4 text-indigo-600" />
            <AlertDescription className="text-xs text-indigo-800">
              Based on SJMCH Plasma Exchange Monitoring Sheet (Dept. of Paediatric Nephrology) · Daugirdas Handbook of Dialysis 5th Ed
            </AlertDescription>
          </Alert>
          {PROCEDURE_STEPS.map(step => <StepCard key={step.step} step={step} />)}
        </div>
      )}

      {/* ── COMPLICATIONS TAB ── */}
      {activeTab === "complications" && (
        <div className="space-y-3">
          <Alert className="bg-red-50 border-red-200">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <AlertDescription className="text-xs text-red-800">
              Complication prevention strategies — Daugirdas 5th Ed + AJKD Core Curriculum 2023
            </AlertDescription>
          </Alert>

          <Card className="border border-slate-200">
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="text-left px-3 py-2.5 font-bold w-1/3">Complication</th>
                    <th className="text-left px-3 py-2.5 font-bold">Prevention / Management</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPLICATION_STRATEGIES.map((r, i) => (
                    <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                      <td className="px-3 py-2.5 font-semibold text-red-800">{r.comp}</td>
                      <td className="px-3 py-2.5 text-slate-700">{r.mgmt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* Coag changes */}
          <Card className="border border-amber-200 bg-amber-50">
            <CardHeader className="py-3 px-4 border-b border-amber-100">
              <CardTitle className="text-sm text-amber-900">Coagulation Factor Changes Post-TPE (Albumin replacement)</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                {[
                  { name: "Fibrinogen", fall: "↓ 80%", rebound: "48–72 h recovery" },
                  { name: "PT/Clotting factors", fall: "↓ 50–70%", rebound: "Biphasic: 4h + 24h" },
                  { name: "aPTT", fall: "↑ 100%", rebound: "~24 h" },
                  { name: "Immunoglobulins", fall: "↓ 60%", rebound: "~44% at 48 h" },
                  { name: "Platelets", fall: "↓ 25–30%", rebound: "75–100% at 48 h" },
                  { name: "Antithrombin III", fall: "↓ 70%", rebound: "100% at 48 h" },
                ].map(({ name, fall, rebound }) => (
                  <div key={name} className="bg-white rounded-lg border border-amber-100 p-2.5">
                    <p className="font-bold text-slate-800">{name}</p>
                    <p className="text-red-600 font-semibold">{fall}</p>
                    <p className="text-slate-400 text-xs">{rebound}</p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-amber-700 mt-3">
                ⚠️ <strong>Do NOT check coagulation tests within 8–12 hours post-TPE</strong> — results will be misleadingly abnormal. 
                Wait 48–72 hrs to recheck fibrinogen level.
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Alert className="bg-slate-50 border-slate-200">
        <Info className="w-4 h-4 text-slate-500" />
        <AlertDescription className="text-xs text-slate-600">
          <strong>References:</strong> Daugirdas JT. Handbook of Dialysis 5th Ed | Cervantes CE et al. AJKD 81(4):475–492, 2023 | CJASN 15(9):1364–1370, 2020 | SJMCH Paediatric Nephrology PLEX Monitoring Sheet. For educational use only — verify all values clinically.
        </AlertDescription>
      </Alert>
    </div>
  );
}