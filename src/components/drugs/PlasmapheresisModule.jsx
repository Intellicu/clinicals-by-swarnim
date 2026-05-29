import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { AlertTriangle, Calculator, Droplets, Activity } from "lucide-react";

// Based on AJKD 2023 Core Curriculum + ASFA 8th Edition 2019

const INDICATIONS = [
  { disease: "TTP (TMA, TTP)", category: "I", grade: "1A", freq: "Daily", fluid: "Frozen plasma", duration: "Until platelets >150×10³/μL + LDH normal ×2-3 days" },
  { disease: "Anti-GBM Disease (Goodpasture)", category: "I", grade: "1B/1C", freq: "Daily", fluid: "Albumin (FFP if DAH)", duration: "10–20 days until organ injury resolves" },
  { disease: "aHUS — Anti-FH antibody", category: "I", grade: "2C", freq: "Daily until remission, taper 4–6w", fluid: "Frozen plasma 60–75 mL/kg", duration: "5–7 sessions, then taper per clinical response" },
  { disease: "CAPS (Catastrophic APS)", category: "I", grade: "2C", freq: "Daily/alternate days", fluid: "Frozen plasma/albumin", duration: "3–5 sessions minimum" },
  { disease: "Guillain-Barré Syndrome", category: "I", grade: "1A", freq: "Daily/alternate", fluid: "Albumin", duration: "5 sessions" },
  { disease: "FSGS post-transplant recurrence", category: "I", grade: "1B", freq: "Daily × 3, then 6 in 2 weeks", fluid: "Albumin", duration: "Per response" },
  { disease: "AAV (ANCA vasculitis) — DAH", category: "I", grade: "1C", freq: "Daily/alternate", fluid: "Albumin (FFP if DAH)", duration: "7 sessions over 14 days" },
  { disease: "Hyperviscosity (IgM)", category: "I", grade: "1B", freq: "As needed", fluid: "Albumin/saline", duration: "Until viscosity normalised" },
  { disease: "Myasthenia gravis (acute)", category: "I", grade: "1B", freq: "Alternate days", fluid: "Albumin", duration: "5–6 sessions" },
  { disease: "Myeloma cast nephropathy", category: "II", grade: "2B", freq: "Alternate days", fluid: "Albumin", duration: "5–6 sessions" },
  { disease: "SLE — severe (class IV LN)", category: "II", grade: "2C", freq: "Daily/alternate", fluid: "Albumin", duration: "3–6 sessions" },
];

const REPLACEMENT_FLUIDS = [
  { fluid: "5% Albumin (most common)", when: "Anti-GBM, AAV, GBS, FSGS, most standard indications", pros: "No transfusion reactions, no coagulopathy risk, long shelf life", cons: "Removes clotting factors (recover 48h), expensive" },
  { fluid: "Fresh Frozen Plasma (FFP)", when: "TTP (essential — provides ADAMTS13), anti-FH aHUS, CAPS, DAH", pros: "Replaces ADAMTS13, restores coagulation factors", cons: "Transfusion reactions, citrate toxicity, infection risk" },
  { fluid: "80:20 Albumin:Saline", when: "Hyperviscosity only", pros: "Cost-saving", cons: "Higher hypotension risk" },
];

const ANTICOAGULATION_DATA = [
  { agent: "Citrate (ACD-A)", method: "Centrifugation", dose: "Whole blood:anticoagulant 10:1–14:1", monitor: "Ionised Ca²⁺, symptoms of hypocalcaemia", note: "Regional effect, short t½ 30–60 min; preferred" },
  { agent: "Heparin", method: "Membrane filtration", dose: "3,000–5,000 U bolus + 1,000 U/hr", monitor: "aPTT, platelets (HIT)", note: "Almost entirely cleared during TPE; hold ACEi 24–48h with membrane" },
  { agent: "ACD-A + Heparin (paediatric)", method: "Both", dose: "500 mL ACD-A + 10,000 U heparin; ratio ≥26:1", monitor: "Ionised Ca²⁺, platelet count", note: "For small blood volumes; minimises citrate load" },
];

function EPVCalculator({ weight, setWeight, hematocrit, setHematocrit, targetPV, setTargetPV, fluidChoice, setFluidChoice }) {
  const wt = parseFloat(weight);
  const hctRaw = parseFloat(hematocrit);
  const hct = hctRaw / 100;
  const target = parseFloat(targetPV) || 1.0;

  // Kaplan formula: EPV (L) = 0.07 × weight(kg) × (1 − Hct)
  const epv_L = (wt && hct) ? 0.07 * wt * (1 - hct) : null;
  const epv_mL = epv_L ? epv_L * 1000 : null;
  const exchVol_mL = epv_mL ? epv_mL * target : null;

  // Total blood volume: ~75 mL/kg child, 70 mL/kg adult
  const tbv_mL = wt ? wt * 75 : null;
  // Typical extracorporeal circuit volume ~100–250 mL
  const circuitVol = 150; // mL, typical paeds circuit
  const circuitPct = tbv_mL ? ((circuitVol / tbv_mL) * 100).toFixed(1) : null;
  const needsBloodPrime = tbv_mL ? circuitVol > tbv_mL * 0.15 : false;

  // Removal efficiency: 1-e^(-n) where n = PV exchanges
  const removalPct = target ? ((1 - Math.exp(-target)) * 100).toFixed(0) : null;

  const fluidLabel = fluidChoice === "ffp" ? "Fresh Frozen Plasma (FFP)" : fluidChoice === "mix" ? "80% Albumin + 20% FFP" : "5% Albumin";

  return (
    <div className="space-y-4">
      {/* Inputs */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
        <CardHeader className="py-3 px-4 border-b border-blue-100">
          <CardTitle className="text-sm flex items-center gap-2">
            <Calculator className="w-4 h-4 text-blue-600" /> EPV Calculator (Kaplan Formula)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-semibold text-slate-600">Weight (kg)</Label>
              <Input value={weight} onChange={e => setWeight(e.target.value)} placeholder="e.g. 25" className="mt-1 h-11" />
            </div>
            <div>
              <Label className="text-xs font-semibold text-slate-600">Haematocrit (%)</Label>
              <Input value={hematocrit} onChange={e => setHematocrit(e.target.value)} placeholder="e.g. 34" className="mt-1 h-11" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-semibold text-slate-600">Target plasma volumes</Label>
              <select
                value={targetPV}
                onChange={e => setTargetPV(e.target.value)}
                className="mt-1 w-full h-11 border border-slate-200 rounded-md px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                <option value="1.0">1.0× PV (standard)</option>
                <option value="1.25">1.25× PV</option>
                <option value="1.5">1.5× PV (aHUS/intensive)</option>
              </select>
            </div>
            <div>
              <Label className="text-xs font-semibold text-slate-600">Replacement fluid</Label>
              <select
                value={fluidChoice}
                onChange={e => setFluidChoice(e.target.value)}
                className="mt-1 w-full h-11 border border-slate-200 rounded-md px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                <option value="albumin">5% Albumin (default)</option>
                <option value="ffp">FFP (TTP / anti-FH aHUS / bleeding)</option>
                <option value="mix">80:20 Albumin:FFP (mix)</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Worked steps */}
      {epv_L && (
        <div className="space-y-3">
          {/* Step 1 */}
          <div className="rounded-xl border-l-4 border-blue-500 bg-white border border-slate-200 p-4">
            <p className="text-xs font-bold text-blue-700 uppercase tracking-wide mb-1">Step 1 — Estimated Plasma Volume (EPV)</p>
            <p className="text-xs text-slate-500 mb-2 font-mono">EPV = 0.07 × weight × (1 − Hct)</p>
            <p className="text-base font-mono font-bold text-slate-800">
              = 0.07 × {wt} × (1 − {(hct).toFixed(2)}) = <span className="text-blue-700">{epv_L.toFixed(2)} L ({epv_mL.toFixed(0)} mL)</span>
            </p>
            <p className="text-xs text-slate-500 mt-2">
              <strong>Why 0.07?</strong> Plasma volume is ~7% of body weight on average (Kaplan, Blood Purif 2012). Haematocrit correction accounts for the fraction occupied by red cells — only plasma is exchanged.
            </p>
          </div>

          {/* Step 2 */}
          <div className="rounded-xl border-l-4 border-indigo-500 bg-white border border-slate-200 p-4">
            <p className="text-xs font-bold text-indigo-700 uppercase tracking-wide mb-1">Step 2 — Exchange Volume</p>
            <p className="text-xs text-slate-500 mb-2 font-mono">Exchange = EPV × target ({target}×)</p>
            <p className="text-base font-mono font-bold text-slate-800">
              = {epv_mL.toFixed(0)} mL × {target} = <span className="text-indigo-700">{exchVol_mL.toFixed(0)} mL</span>
            </p>
            <p className="text-xs text-slate-500 mt-2">
              <strong>Why 1–1.5×?</strong> Intravascular removal follows first-order kinetics: 1.0× PV removes ~63%, 1.25× removes ~71%, 1.5× removes ~78% of the target macromolecule. Beyond 1.5× adds little extra clearance with increased complications.
            </p>
            <div className="mt-2 flex gap-2 flex-wrap">
              {[["1.0×", 63], ["1.25×", 71], ["1.5×", 78]].map(([lbl, pct]) => (
                <div key={lbl} className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${parseFloat(lbl) === target ? "bg-indigo-100 border-indigo-300 text-indigo-800" : "bg-slate-50 border-slate-200 text-slate-600"}`}>
                  {lbl} → ~{pct}% removal
                </div>
              ))}
            </div>
          </div>

          {/* Step 3 — Circuit safety check */}
          <div className={`rounded-xl border-l-4 ${needsBloodPrime ? "border-red-500 bg-red-50" : "border-green-500 bg-green-50"} border border-slate-200 p-4`}>
            <p className={`text-xs font-bold uppercase tracking-wide mb-1 ${needsBloodPrime ? "text-red-700" : "text-green-700"}`}>Step 3 — Extracorporeal Volume Safety Check</p>
            <p className="text-xs text-slate-500 mb-2 font-mono">TBV = 75 mL/kg × {wt} kg = {tbv_mL.toFixed(0)} mL | Circuit ≈ {circuitVol} mL ({circuitPct}% of TBV)</p>
            {needsBloodPrime ? (
              <>
                <p className="text-sm font-bold text-red-700">⚠️ Circuit volume &gt;15% TBV — blood prime required</p>
                <p className="text-xs text-red-800 mt-1">
                  Prime the circuit with O-negative pRBC or 5% albumin before connecting. Without priming, acute haemodynamic instability (hypotension, shock) can occur in this child. Discuss with perfusionist/apheresis nurse.
                </p>
              </>
            ) : (
              <>
                <p className="text-sm font-bold text-green-700">✓ Circuit volume &lt;15% TBV — safe to proceed without blood prime</p>
                <p className="text-xs text-green-800 mt-1">Standard priming with saline acceptable. Monitor closely at circuit connection for vasovagal response.</p>
              </>
            )}
          </div>

          {/* Step 4 — Replacement fluid */}
          <div className="rounded-xl border-l-4 border-teal-500 bg-white border border-slate-200 p-4">
            <p className="text-xs font-bold text-teal-700 uppercase tracking-wide mb-1">Step 4 — Replacement Fluid</p>
            <p className="text-sm font-bold text-slate-800">Selected: <span className="text-teal-700">{fluidLabel}</span></p>
            <p className="text-xs text-slate-500 mt-1">Volume to prepare: <strong>{exchVol_mL.toFixed(0)} mL</strong></p>
            {fluidChoice === "albumin" && (
              <div className="mt-2 text-xs text-slate-600 space-y-1">
                <p>✅ <strong>Why albumin (default)?</strong> No transfusion reactions, no infection risk, maintains oncotic pressure, long shelf life. Removes clotting factors — check coagulation 8–12h post-session.</p>
                <p>⚠️ <strong>Citrate / calcium:</strong> Monitor ionised Ca²⁺ every 30 min. Give prophylactic IV calcium gluconate (50 mg/kg or 0.5 mL/kg 10% solution) if symptomatic paraesthesia/cramping.</p>
              </div>
            )}
            {fluidChoice === "ffp" && (
              <div className="mt-2 text-xs text-slate-600 space-y-1">
                <p>✅ <strong>Why FFP?</strong> TTP requires ADAMTS13 replacement (only in FFP). Anti-FH aHUS benefits from complement regulatory factors in FFP. Essential if there is active bleeding or depletion coagulopathy.</p>
                <p>⚠️ Pre-medicate with diphenhydramine + hydrocortisone (transfusion reaction risk). Citrate load is higher — calcium monitoring every 20–30 min; hypocalcaemia more common.</p>
              </div>
            )}
            {fluidChoice === "mix" && (
              <div className="mt-2 text-xs text-slate-600 space-y-1">
                <p>Prepare: <strong>{(exchVol_mL * 0.8).toFixed(0)} mL 5% albumin</strong> + <strong>{(exchVol_mL * 0.2).toFixed(0)} mL FFP</strong></p>
                <p>Balances oncotic pressure maintenance with partial coagulation factor replacement. Used when some FFP benefit is needed but full FFP volume is impractical.</p>
              </div>
            )}
          </div>

          {/* Summary box */}
          <div className="rounded-xl bg-slate-800 text-white p-4 grid grid-cols-2 gap-3">
            <div className="text-center">
              <p className="text-xs text-slate-400">Plasma Volume (EPV)</p>
              <p className="text-xl font-bold text-blue-300">{epv_mL.toFixed(0)} mL</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-slate-400">Exchange Volume ({target}× PV)</p>
              <p className="text-xl font-bold text-indigo-300">{exchVol_mL.toFixed(0)} mL</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-slate-400">Expected Removal</p>
              <p className="text-xl font-bold text-green-300">~{removalPct}%</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-slate-400">Blood Prime Needed?</p>
              <p className={`text-xl font-bold ${needsBloodPrime ? "text-red-300" : "text-green-300"}`}>{needsBloodPrime ? "YES" : "No"}</p>
            </div>
          </div>
        </div>
      )}

      {!epv_L && (
        <div className="rounded-xl bg-slate-50 border border-dashed border-slate-300 p-6 text-center text-sm text-slate-400">
          Enter weight and haematocrit above to see worked calculation steps
        </div>
      )}
    </div>
  );
}

function IndicationsTable() {
  const catColors = { I: "bg-green-100 text-green-800 border-green-200", II: "bg-yellow-100 text-yellow-800 border-yellow-200", III: "bg-slate-100 text-slate-700 border-slate-200" };
  return (
    <Card className="bg-white border border-slate-200 shadow-sm">
      <CardHeader className="bg-slate-50 border-b py-3 px-4">
        <CardTitle className="text-sm flex items-center gap-2">
          <Activity className="w-4 h-4 text-indigo-600" /> ASFA Category I/II Indications (ASFA 2019)
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-slate-100">
              <th className="text-left px-3 py-2 font-bold">Disease</th>
              <th className="text-center px-2 py-2 font-bold">Cat</th>
              <th className="text-center px-2 py-2 font-bold">Grade</th>
              <th className="text-left px-2 py-2 font-bold">Frequency</th>
              <th className="text-left px-2 py-2 font-bold">Replacement Fluid</th>
              <th className="text-left px-2 py-2 font-bold">Duration</th>
            </tr>
          </thead>
          <tbody>
            {INDICATIONS.map((row, i) => (
              <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                <td className="px-3 py-2 font-semibold text-slate-900">{row.disease}</td>
                <td className="px-2 py-2 text-center"><Badge className={`text-xs border ${catColors[row.category] || catColors.III}`}>{row.category}</Badge></td>
                <td className="px-2 py-2 text-center text-slate-600">{row.grade}</td>
                <td className="px-2 py-2 text-slate-700">{row.freq}</td>
                <td className="px-2 py-2 text-indigo-700">{row.fluid}</td>
                <td className="px-2 py-2 text-slate-600">{row.duration}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}


function ComplicationsTable() {
  const complications = [
    { comp: "Hypocalcaemia (citrate)", freq: "9–19.6%", mechanism: "Citrate chelates Ca²⁺", mgmt: "IV calcium gluconate continuous or intermittent; monitor ionised Ca²⁺" },
    { comp: "Hypotension", freq: "0.4–15%", mechanism: "Volume imbalance, vasovagal, bradykinin", mgmt: "Slow rate, volume replacement; hold ACEi 24–48h before" },
    { comp: "Coagulopathy (albumin replacement)", freq: "0.06% bleeding", mechanism: "Removal of clotting factors (50–70% reduction)", mgmt: "FFP if bleeding; do not check coag tests for 8–12h post-TPE" },
    { comp: "Anaphylaxis (FFP)", freq: "0.02–0.07%", mechanism: "IgA deficiency + donor IgA; prekallikrein activator", mgmt: "Pre-treat: diphenhydramine + hydrocortisone; have epinephrine ready" },
    { comp: "Hypomagnesaemia", freq: "Common", mechanism: "Citrate chelation or FFP-induced", mgmt: "IV Mg sulphate if symptomatic; monitor electrolytes" },
    { comp: "Hypokalaemia", freq: "With albumin", mechanism: "~25% reduction in K⁺", mgmt: "Add KCl to albumin bottle or oral K+ supplementation" },
    { comp: "Access-related", freq: "CVC: 0.11–0.36%", mechanism: "Thrombosis, infection, pneumothorax", mgmt: "Strict aseptic technique; heparin locks 1000 U/mL; US guidance" },
  ];
  return (
    <Card className="bg-white border border-slate-200">
      <CardHeader className="bg-slate-50 border-b py-3 px-4">
        <CardTitle className="text-sm flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-600" /> Complications & Management
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-slate-100">
              <th className="text-left px-3 py-2 font-bold">Complication</th>
              <th className="text-center px-2 py-2 font-bold">Frequency</th>
              <th className="text-left px-2 py-2 font-bold">Mechanism</th>
              <th className="text-left px-2 py-2 font-bold">Management</th>
            </tr>
          </thead>
          <tbody>
            {complications.map((row, i) => (
              <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                <td className="px-3 py-2 font-semibold text-red-800">{row.comp}</td>
                <td className="px-2 py-2 text-center text-slate-600">{row.freq}</td>
                <td className="px-2 py-2 text-slate-700">{row.mechanism}</td>
                <td className="px-2 py-2 text-green-800">{row.mgmt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}

export default function PlasmapheresisModule() {
  const [activeSection, setActiveSection] = useState("calculator");
  const [weight, setWeight] = useState("");
  const [hematocrit, setHematocrit] = useState("34");
  const [targetPV, setTargetPV] = useState("1.0");
  const [fluidChoice, setFluidChoice] = useState("albumin");

  const sections = [
    { id: "calculator", label: "📐 EPV Calc" },
    { id: "ahus", label: "🔴 aHUS PLEX" },
    { id: "indications", label: "📋 Indications" },
    { id: "ispn", label: "🧒 ISPN Paeds" },
    { id: "fluids", label: "💉 Fluids" },
    { id: "anticoag", label: "🔬 Anticoag" },
    { id: "complications", label: "⚠️ Complications" },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="bg-gradient-to-r from-teal-600 to-cyan-700 text-white border-0">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Droplets className="w-9 h-9 opacity-90" />
            <div>
              <h2 className="font-bold text-lg">Plasmapheresis / TPE Module</h2>
              <p className="text-teal-100 text-sm">Therapeutic Plasma Exchange — ASFA 2019 · AJKD Core Curriculum 2023</p>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap mt-3">
            <Badge className="bg-white/20 text-xs">EPV Calculator</Badge>
            <Badge className="bg-white/20 text-xs">ASFA Category I/II Indications</Badge>
            <Badge className="bg-white/20 text-xs">Replacement Fluid Guide</Badge>
            <Badge className="bg-white/20 text-xs">Anticoagulation</Badge>
            <Badge className="bg-white/20 text-xs">Complications</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Section Nav — scrollable, never pushes page width */}
      <div className="w-full overflow-x-auto" style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}>
        <div className="flex gap-1.5 pb-1 min-w-max px-0.5">
          {sections.map(s => (
            <button key={s.id} onClick={() => setActiveSection(s.id)}
              className={`flex-shrink-0 px-3 py-2 rounded-full text-xs font-semibold border transition-all min-h-[40px] ${activeSection === s.id ? "bg-teal-600 text-white border-teal-600" : "bg-white text-slate-600 border-slate-200 hover:border-teal-300"}`}>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {activeSection === "calculator" && <EPVCalculator weight={weight} setWeight={setWeight} hematocrit={hematocrit} setHematocrit={setHematocrit} targetPV={targetPV} setTargetPV={setTargetPV} fluidChoice={fluidChoice} setFluidChoice={setFluidChoice} />}
      {activeSection === "ahus" && (
        <div className="space-y-4">
          {/* Banner */}
          <Card className="bg-gradient-to-r from-red-600 to-rose-700 text-white border-0">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-8 h-8 opacity-90 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-base">aHUS PLEX Protocol</h3>
                  <p className="text-red-100 text-xs mt-0.5">ISPN / AIIMS 2025 Consensus — Anti-Factor H Antibody aHUS (Indian phenotype)</p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {["Start within 24h", "Anti-FH Ab titre before first PLEX", "1.5× PV initially", "Daily × 5–7 then taper"].map(t => (
                      <span key={t} className="bg-white/20 text-xs px-2 py-0.5 rounded-full font-medium">{t}</span>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Urgency */}
          <Alert className="bg-red-50 border-red-200">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <AlertDescription className="text-xs text-red-800">
              <strong>Time-critical:</strong> Initiate PLEX empirically within 24h of presentation — do NOT wait for complement genetics or anti-FH titre results. Send anti-FH antibody titre and complement C3/C4/CH50 <em>before the first session</em> but do not delay.
            </AlertDescription>
          </Alert>

          {/* Step-by-step protocol */}
          <Card className="bg-white border border-slate-200">
            <CardHeader className="bg-slate-50 border-b py-3 px-4">
              <CardTitle className="text-sm">Step-by-Step Protocol (ISPN/AIIMS 2025)</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {[
                {
                  step: "1", title: "Confirmation & Emergency Labs", color: "border-red-400",
                  items: ["CBC, blood film (schistocytes), LDH, haptoglobin, DAT (direct Coombs)", "Serum creatinine, electrolytes, LFT", "Anti-FH antibody titre (ELISA/ALBIA) — send BEFORE first PLEX session", "C3, C4, CH50, factor H level", "Complement genetics panel (MLPA + Sanger) — non-urgent, can follow"]
                },
                {
                  step: "2", title: "PLEX Prescription", color: "border-orange-400",
                  items: ["Volume: 1.5× EPV per session (empirical intensive start)", "Replacement fluid: Fresh Frozen Plasma (FFP) — 60–75 mL/kg", "Frequency: Daily for first 5–7 sessions", "Access: Femoral or internal jugular CVC (double-lumen)", "Pre-medicate: IV hydrocortisone 2 mg/kg + diphenhydramine 1 mg/kg (FFP reaction prophylaxis)"]
                },
                {
                  step: "3", title: "Monitoring During PLEX", color: "border-amber-400",
                  items: ["Ionised Ca²⁺ every 30 min — citrate from FFP causes hypocalcaemia", "BP, HR, SpO2 every 15 min", "Watch for: chills, urticaria, hypotension, perioral tingling (citrate)", "IV calcium gluconate (0.5 mL/kg 10% solution) if ionised Ca < 1.0 mmol/L or symptomatic"]
                },
                {
                  step: "4", title: "Taper & Maintenance", color: "border-blue-400",
                  items: ["After 5–7 daily sessions: assess LDH, platelet trend, creatinine", "If improving: alternate-day PLEX for 2 weeks, then twice-weekly for 4–6 weeks", "Taper guided by anti-FH Ab titre (target < 1:32) + platelet normalisation", "Continue until Ab titre negative for ≥2 consecutive checks or eculizumab initiated"]
                },
                {
                  step: "5", title: "Immunosuppression (Antibody-Positive Disease)", color: "border-violet-400",
                  items: ["Start prednisolone 2 mg/kg/day (max 60 mg) at diagnosis — reduces Ab production", "If incomplete response or high titre: add mycophenolate mofetil (MMF) 600 mg/m²/day", "Rituximab 375 mg/m² × 2–4 doses for refractory antibody-positive aHUS", "Monitor Ig levels (hypogammaglobulinaemia risk with rituximab); withhold if IgG < 4 g/L"]
                },
                {
                  step: "6", title: "Eculizumab — When to Prioritise", color: "border-green-400",
                  items: ["Preferred if: genetic complement mutation (non-antibody type), unavailability of PLEX facilities, PLEX-refractory disease", "Bridge therapy: if eculizumab unavailable, FFP infusion 10–20 mL/kg every 48h supplements complement factors", "Vaccination against meningococcus, pneumococcus, H. influenzae mandatory ≥2 weeks before eculizumab start (or use prophylactic penicillin if urgent)", "Transition: can switch from PLEX to eculizumab after Ab titre negative if preferred"]
                },
              ].map(({ step, title, color, items }) => (
                <div key={step} className={`border-l-4 ${color} bg-slate-50 rounded-r-xl p-3`}>
                  <p className="text-xs font-bold text-slate-800 mb-1.5">Step {step}: {title}</p>
                  <ul className="space-y-1">
                    {items.map((item, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-xs text-slate-700">
                        <span className="text-slate-400 mt-0.5 flex-shrink-0">•</span>{item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Endpoint / Stop criteria */}
          <Card className="bg-white border border-slate-200">
            <CardHeader className="bg-slate-50 border-b py-3 px-4">
              <CardTitle className="text-sm">Endpoints & Discontinuation Criteria</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { label: "Haematological remission", val: "Platelets >150×10³/μL for ≥2 days + LDH normalising" },
                  { label: "Renal endpoint", val: "Creatinine improving or stable; no new oliguria" },
                  { label: "Antibody endpoint", val: "Anti-FH Ab titre <1:32 on ≥2 consecutive checks" },
                  { label: "Stop PLEX", val: "All 3 above + eculizumab initiated, OR no response after 10–14 sessions" },
                ].map((e, i) => (
                  <div key={i} className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                    <p className="text-xs font-bold text-slate-700">{e.label}</p>
                    <p className="text-xs text-slate-600 mt-0.5">{e.val}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* FFP infusion fallback */}
          <Alert className="bg-blue-50 border-blue-200">
            <Activity className="w-4 h-4 text-blue-600" />
            <AlertDescription className="text-xs text-blue-800">
              <strong>FFP Infusion Fallback (PLEX unavailable):</strong> FFP 10–20 mL/kg every 24–48h supplies complement regulatory factors. Less effective than PLEX (no pathological Ab removal) but can maintain partial disease control. Monitor for volume overload; use diuretics if needed.
            </AlertDescription>
          </Alert>

          <Alert className="bg-slate-50 border-slate-200">
            <AlertTriangle className="w-3.5 h-3.5 text-slate-500" />
            <AlertDescription className="text-xs text-slate-600">
              <strong>References:</strong> ISPN/AIIMS aHUS Working Group 2025 | Sinha A et al. Indian J Pediatr 2024 | Bagga A et al. ISPN Consensus 2022 | Fremeaux-Bacchi V et al. JASN 2021 | KDIGO aHUS Controversies Conference 2017. For educational use only.
            </AlertDescription>
          </Alert>
        </div>
      )}

      {activeSection === "indications" && <IndicationsTable />}

      {activeSection === "ispn" && (
        <Card className="bg-white border border-slate-200">
          <CardHeader className="bg-gradient-to-r from-teal-50 to-cyan-50 border-b py-3 px-4">
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="w-4 h-4 text-teal-700" /> ISPN / Paediatric TPE Guidance
              <Badge className="bg-teal-600 text-white text-xs ml-auto">ISPN 2019 + Bagga et al.</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">

            <Alert className="bg-teal-50 border-teal-200">
              <AlertTriangle className="w-3.5 h-3.5 text-teal-700" />
              <AlertDescription className="text-xs text-teal-800">
                <strong>Paediatric TPE differs from adults</strong> — blood volumes are small; extracorporeal volume must remain &lt;15% total blood volume. Circuit priming with albumin or blood may be necessary in children &lt;20 kg.
              </AlertDescription>
            </Alert>

            <div className="rounded-xl border border-slate-200 overflow-hidden">
              <div className="bg-teal-700 px-4 py-2 text-white text-xs font-bold">Key Paediatric Indications (ISPN 2019 Consensus)</div>
              <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse" style={{ minWidth: 480 }}>
                <thead><tr className="bg-slate-100">
                  <th className="text-left px-3 py-2 font-bold">Indication</th>
                  <th className="text-center px-2 py-2 font-bold">Evidence</th>
                  <th className="text-left px-2 py-2 font-bold">ISPN Recommendation</th>
                </tr></thead>
                <tbody>
                  {[
                    { ind: "Anti-FH aHUS", ev: "Strong", rec: "First-line TPE daily until remission; bridge while anti-FH Ab titre falls; continue eculizumab if available" },
                    { ind: "Post-transplant FSGS recurrence", ev: "Strong", rec: "Intensive TPE (daily ×3–5, then alternate day); aim for proteinuria remission; can be continued as maintenance" },
                    { ind: "Acute Guillain-Barré Syndrome", ev: "Moderate", rec: "IVIG preferred if available; TPE equivalent efficacy (5 sessions); not combined with IVIG" },
                    { ind: "SLE Nephritis — severe / refractory", ev: "Moderate", rec: "Adjunct to immunosuppression for severe class IV-V; 6–8 sessions over 2–4 weeks" },
                    { ind: "TTP / ADAMTS13-deficient TMA", ev: "Strong", rec: "Daily TPE with FFP as replacement (ADAMTS13 source); continue until remission ≥2 days" },
                    { ind: "Anti-GBM disease (Goodpasture)", ev: "Strong", rec: "Daily TPE with albumin (FFP if DAH) × 14 days or until anti-GBM Ab undetectable" },
                    { ind: "Steroid-resistant Nephrotic Syndrome (research)", ev: "Weak", rec: "Not routinely recommended; limited evidence; may benefit a subset with circulating permeability factor" },
                  ].map((r, i) => (
                    <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                      <td className="px-3 py-2 font-semibold text-slate-900">{r.ind}</td>
                      <td className="px-2 py-2 text-center"><Badge className={r.ev === "Strong" ? "bg-green-100 text-green-800 border-green-200" : r.ev === "Moderate" ? "bg-yellow-100 text-yellow-800" : "bg-slate-100 text-slate-700"} variant="outline">{r.ev}</Badge></td>
                      <td className="px-2 py-2 text-slate-700 text-xs">{r.rec}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
                <p className="text-xs font-bold text-amber-800 mb-2">Paediatric Technical Considerations</p>
                <ul className="space-y-1">
                  {[
                    "Extracorporeal volume: must be <15% of total blood volume",
                    "Circuit priming: required if child <15–20 kg (use 5% albumin or O-neg pRBC)",
                    "Volume exchanged: 1–1.5× estimated plasma volume per session",
                    "Plasma volume (paeds): 40 mL/kg (neonate) → 45 mL/kg (infant) → 50 mL/kg (child)",
                    "Calcium monitoring: 30–60 min; give IV calcium gluconate q30–60 min prophylactically",
                    "Temperature: use warmer for replacement fluid; children prone to hypothermia",
                    "Access: femoral or IJV CVC for most children; AVF uncommon in paeds",
                  ].map((pt, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-xs text-amber-900">
                      <span className="text-amber-500 mt-0.5">•</span>{pt}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl border border-blue-200 bg-blue-50 p-3">
                <p className="text-xs font-bold text-blue-800 mb-2">Monitoring Protocol (ISPN)</p>
                <ul className="space-y-1">
                  {[
                    "Pre-procedure: CBC, PT/INR, APTT, ionised calcium, UEC, serum albumin",
                    "During: BP, HR, SpO2 every 15 min; ionised Ca²⁺ every 30–60 min",
                    "Post-procedure: repeat CBC, coagulation, electrolytes",
                    "Disease-specific: anti-FH Ab titres, ADAMTS13 activity, anti-GBM Ab serially",
                    "Albumin level: maintain >20 g/L; supplement if low post-TPE",
                    "Immunoglobulins: fall after TPE; delay IVIG to 24–48h post-session",
                    "Drug levels: antimicrobials, immunosuppressants removed by TPE — re-dose after",
                  ].map((pt, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-xs text-blue-900">
                      <span className="text-blue-500 mt-0.5">•</span>{pt}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs font-bold text-slate-700 mb-2">Endpoints for Discontinuation</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { cond: "aHUS / anti-FH", stop: "Anti-FH Ab titre <1:32 + platelet recovery + renal stabilisation" },
                  { cond: "TTP", stop: "Platelets >150×10³ for ≥2 consecutive days + LDH normal" },
                  { cond: "Anti-GBM", stop: "Anti-GBM Ab undetectable + renal function stable" },
                  { cond: "FSGS post-Tx", stop: "Proteinuria in remission or no response after 2–3 weeks" },
                ].map((e, i) => (
                  <div key={i} className="bg-white rounded-lg p-2 border border-slate-200">
                    <p className="text-xs font-bold text-slate-800">{e.cond}</p>
                    <p className="text-xs text-slate-600 mt-0.5">{e.stop}</p>
                  </div>
                ))}
              </div>
            </div>

            <Alert className="bg-blue-50 border-blue-200">
              <AlertTriangle className="w-3.5 h-3.5 text-blue-700" />
              <AlertDescription className="text-xs text-blue-800">
                <strong>References:</strong> Bagga A et al. Indian Pediatrics 2019 | ISPN Apheresis Working Group 2019 | Arbeiter K. Pediatr Nephrol 2020 | Padmanabhan A et al. ASFA 8th Ed 2019 | Schwartz J et al. J Clin Apher 2023.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {activeSection === "fluids" && (
        <Card className="bg-white border border-slate-200">
          <CardHeader className="bg-slate-50 border-b py-3 px-4">
            <CardTitle className="text-sm">💉 Replacement Fluid Selection</CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {REPLACEMENT_FLUIDS.map((f, i) => (
              <div key={i} className="rounded-lg border border-slate-200 overflow-hidden">
                <div className="bg-slate-100 px-3 py-2">
                  <p className="text-xs font-bold text-slate-800">{f.fluid}</p>
                  <p className="text-xs text-indigo-700 mt-0.5"><strong>Use when:</strong> {f.when}</p>
                </div>
                <div className="px-3 py-2 grid grid-cols-2 gap-2">
                  <div><p className="text-xs text-green-700"><strong>✅ Pros:</strong> {f.pros}</p></div>
                  <div><p className="text-xs text-red-700"><strong>❌ Cons:</strong> {f.cons}</p></div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {activeSection === "anticoag" && (
        <Card className="bg-white border border-slate-200">
          <CardHeader className="bg-slate-50 border-b py-3 px-4">
            <CardTitle className="text-sm">🔬 Anticoagulation in TPE</CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100">
                  <th className="text-left px-3 py-2 font-bold">Agent</th>
                  <th className="text-left px-2 py-2 font-bold">Modality</th>
                  <th className="text-left px-2 py-2 font-bold">Dose</th>
                  <th className="text-left px-2 py-2 font-bold">Monitor</th>
                  <th className="text-left px-2 py-2 font-bold">Notes</th>
                </tr>
              </thead>
              <tbody>
                {ANTICOAGULATION_DATA.map((r, i) => (
                  <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                    <td className="px-3 py-2 font-bold text-teal-800">{r.agent}</td>
                    <td className="px-2 py-2 text-slate-700">{r.method}</td>
                    <td className="px-2 py-2 text-blue-800">{r.dose}</td>
                    <td className="px-2 py-2 text-amber-800">{r.monitor}</td>
                    <td className="px-2 py-2 text-slate-600">{r.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {activeSection === "complications" && <ComplicationsTable />}

      <Alert className="bg-blue-50 border-blue-200">
        <AlertTriangle className="w-4 h-4 text-blue-600" />
        <AlertDescription className="text-xs text-blue-800">
          <strong>References:</strong> Padmanabhan A et al. ASFA 8th Special Issue, J Clin Apher 2019 | Cervantes CE et al. AJKD Core Curriculum 81(4):475-492, 2023 | Szczepiorkowski ZM & Winters JL. Transfusion 2019 | Schwartz J et al. J Clin Apher 2023. For educational use only. Verify doses and protocols with current institutional guidelines.
        </AlertDescription>
      </Alert>
    </div>
  );
}