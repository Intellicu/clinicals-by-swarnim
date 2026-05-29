import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Calculator, Droplets, Activity, Activity as ActivityIcon } from "lucide-react";

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

function EPVCalculator({ weight, setWeight, hematocrit, setHematocrit }) {
  const wt = parseFloat(weight);
  const hct = parseFloat(hematocrit) / 100;
  const epv = (wt && hct) ? ((0.065 * wt) * (1 - hct)).toFixed(2) : null;
  const vol1 = epv ? (parseFloat(epv) * 1.0).toFixed(0) : null;
  const vol1_5 = epv ? (parseFloat(epv) * 1.5).toFixed(0) : null;

  // Paediatric: 60–75 mL/kg for aHUS
  const pedsPEX = wt ? (wt * 65).toFixed(0) : null;

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
      <CardHeader className="py-3 px-4 border-b border-blue-100">
        <CardTitle className="text-sm flex items-center gap-2">
          <Calculator className="w-4 h-4 text-blue-600" /> Plasma Volume Calculator
          <Badge className="bg-blue-100 text-blue-700 text-xs">EPV = (0.065 × wt) × (1 − Hct)</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs font-semibold text-slate-600">Weight (kg)</Label>
            <Input value={weight} onChange={e => setWeight(e.target.value)} placeholder="20" className="mt-1 h-9 text-sm" />
          </div>
          <div>
            <Label className="text-xs font-semibold text-slate-600">Hematocrit (%)</Label>
            <Input value={hematocrit} onChange={e => setHematocrit(e.target.value)} placeholder="34" className="mt-1 h-9 text-sm" />
          </div>
        </div>

        {epv && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "EPV (Estimated Plasma Volume)", value: `${epv} L`, highlight: true },
              { label: "1× Exchange Volume", value: `${vol1} mL` },
              { label: "1.5× Exchange Volume", value: `${vol1_5} mL` },
              { label: "Paeds aHUS (65 mL/kg)", value: `${pedsPEX} mL` },
            ].map(({ label, value, highlight }) => (
              <div key={label} className={`rounded-xl p-3 text-center border ${highlight ? "bg-blue-100 border-blue-300" : "bg-white border-slate-200"}`}>
                <p className="text-xs text-slate-500 leading-tight mb-1">{label}</p>
                <p className={`font-bold ${highlight ? "text-blue-800 text-lg" : "text-slate-800"}`}>{value}</p>
              </div>
            ))}
          </div>
        )}

        <Alert className="bg-amber-50 border-amber-200">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
          <AlertDescription className="text-xs text-amber-800">
            <strong>Key principle:</strong> One plasma volume exchange removes ~65–70% of intravascular target substance. 
            1.4× EPV removes ~75%. Exchange &gt;1.5× EPV adds minimal extra clearance.
            Extracorporeal volume should be &lt;15% of total blood volume.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
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

  const sections = [
    { id: "calculator", label: "📐 EPV Calc" },
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

      {/* Section Nav */}
      <div className="flex gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
        {sections.map(s => (
          <button key={s.id} onClick={() => setActiveSection(s.id)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${activeSection === s.id ? "bg-teal-600 text-white border-teal-600" : "bg-white text-slate-600 border-slate-200 hover:border-teal-300"}`}>
            {s.label}
          </button>
        ))}
      </div>

      {activeSection === "calculator" && <EPVCalculator weight={weight} setWeight={setWeight} hematocrit={hematocrit} setHematocrit={setHematocrit} />}
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
              <table className="w-full text-xs border-collapse">
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