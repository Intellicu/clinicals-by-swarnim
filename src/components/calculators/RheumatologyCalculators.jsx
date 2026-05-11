import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ChevronDown, ChevronUp, Info } from "lucide-react";

function AccordionSection({ title, color = "purple", children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  const colorMap = { purple: "bg-purple-600", rose: "bg-rose-600", indigo: "bg-indigo-600", teal: "bg-teal-600", orange: "bg-orange-600" };
  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden mb-3">
      <button onClick={() => setOpen(o => !o)} className={`w-full flex items-center justify-between px-4 py-3 ${colorMap[color]} text-white font-semibold text-sm`}>
        {title}{open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      {open && <div className="p-4 bg-white">{children}</div>}
    </div>
  );
}

function ScoreResult({ score, max, label, bands }) {
  const pct = max ? (score / max) * 100 : 0;
  const band = bands?.find(b => score >= b.min && score <= b.max);
  return (
    <div className="mt-4 p-4 rounded-xl bg-slate-50 border-2 border-slate-200">
      <div className="flex items-center justify-between mb-2">
        <span className="font-bold text-slate-900">{label}</span>
        <span className="text-3xl font-bold text-slate-900">{score}{max ? `/${max}` : ""}</span>
      </div>
      {max && <div className="w-full bg-slate-200 rounded-full h-2 mb-2"><div className="h-2 rounded-full bg-blue-500 transition-all" style={{ width: `${pct}%` }} /></div>}
      {band && <Badge className={`${band.color} text-white`}>{band.label}</Badge>}
    </div>
  );
}

// ── JADAS-27 ──────────────────────────────────────────────────────
const JADAS_JOINTS = [
  "Right Wrist","Left Wrist","Right MCP1","Right MCP2","Right MCP3","Right MCP4","Right MCP5",
  "Left MCP1","Left MCP2","Left MCP3","Left MCP4","Left MCP5",
  "Right PIP1","Right PIP2","Right PIP3","Right PIP4","Right PIP5",
  "Left PIP1","Left PIP2","Left PIP3","Left PIP4","Left PIP5",
  "Right Knee","Left Knee","Right Ankle","Left Ankle","Right Elbow"
];

function JADASCalculator() {
  const [activeJoints, setActiveJoints] = useState({});
  const [physicianVAS, setPhysicianVAS] = useState("");
  const [parentVAS, setParentVAS] = useState("");
  const [esr, setEsr] = useState("");
  const [result, setResult] = useState(null);

  const toggleJoint = (j) => setActiveJoints(prev => ({ ...prev, [j]: !prev[j] }));
  const jointCount = Object.values(activeJoints).filter(Boolean).length;

  const calculate = () => {
    const pv = parseFloat(physicianVAS) || 0;
    const pav = parseFloat(parentVAS) || 0;
    const esrNorm = Math.min(((parseFloat(esr) - 20) / 10), 10);
    const score = jointCount + pv + pav + Math.max(0, esrNorm);
    setResult(score.toFixed(1));
  };

  const bands = [
    { min: 0, max: 1, label: "Inactive Disease", color: "bg-green-500" },
    { min: 1.1, max: 3.8, label: "Low Disease Activity", color: "bg-blue-500" },
    { min: 3.9, max: 8.5, label: "Moderate Disease Activity", color: "bg-amber-500" },
    { min: 8.6, max: 99, label: "High Disease Activity", color: "bg-red-500" },
  ];

  return (
    <div className="space-y-4">
      <p className="text-xs text-slate-500">JADAS-27: 27 joints + Physician VAS (0–10) + Parent/Patient VAS (0–10) + ESR normalized</p>
      <div className="bg-slate-50 rounded-xl p-3">
        <p className="text-xs font-bold text-slate-700 mb-2">Active Joints ({jointCount} selected):</p>
        <div className="grid grid-cols-3 gap-1 max-h-48 overflow-y-auto">
          {JADAS_JOINTS.map(j => (
            <div key={j} className="flex items-center gap-1">
              <Checkbox id={j} checked={!!activeJoints[j]} onCheckedChange={() => toggleJoint(j)} />
              <Label htmlFor={j} className="text-xs cursor-pointer">{j}</Label>
            </div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div><Label className="text-xs">Physician VAS (0–10)</Label><Input type="number" min={0} max={10} value={physicianVAS} onChange={e => setPhysicianVAS(e.target.value)} className="mt-1" /></div>
        <div><Label className="text-xs">Parent/Patient VAS (0–10)</Label><Input type="number" min={0} max={10} value={parentVAS} onChange={e => setParentVAS(e.target.value)} className="mt-1" /></div>
        <div><Label className="text-xs">ESR (mm/hr)</Label><Input type="number" value={esr} onChange={e => setEsr(e.target.value)} className="mt-1" /></div>
      </div>
      <Button onClick={calculate} className="w-full bg-purple-600 hover:bg-purple-700">Calculate JADAS-27</Button>
      {result && <ScoreResult score={parseFloat(result)} label="JADAS-27 Score" bands={bands} />}
    </div>
  );
}

// ── SLEDAI-2K ─────────────────────────────────────────────────────
const SLEDAI_ITEMS = [
  { name: "Seizure", score: 8, desc: "Recent, excluding metabolic, infective, drug causes" },
  { name: "Psychosis", score: 8, desc: "Altered ability to function in normal activity" },
  { name: "Organic brain syndrome", score: 8, desc: "Altered mental function with impaired memory/orientation" },
  { name: "Visual disturbance", score: 8, desc: "Lupus retinal changes" },
  { name: "Cranial nerve disorder", score: 8, desc: "New motor/sensory neuropathy" },
  { name: "Lupus headache", score: 8, desc: "Severe, persistent, not responding to narcotics" },
  { name: "CVA", score: 8, desc: "New stroke — not arteriosclerosis" },
  { name: "Vasculitis", score: 8, desc: "Ulceration, gangrene, infarction, histology" },
  { name: "Arthritis", score: 4, desc: "≥2 joints with pain and signs of inflammation" },
  { name: "Myositis", score: 4, desc: "Proximal muscle aching/weakness + elevated CK" },
  { name: "Urinary casts", score: 4, desc: "Heme-granular or RBC casts" },
  { name: "Hematuria", score: 4, desc: ">5 RBC/HPF, exclude stone/infection" },
  { name: "Proteinuria", score: 4, desc: ">0.5g/24h, new onset or increase" },
  { name: "Pyuria", score: 4, desc: ">5 WBC/HPF, exclude infection" },
  { name: "New rash", score: 2, desc: "New or recurrent inflammatory rash" },
  { name: "Alopecia", score: 2, desc: "New or recurrent abnormal hair loss" },
  { name: "Mucosal ulcers", score: 2, desc: "Oral/nasal, new or recurrent" },
  { name: "Pleuritis", score: 2, desc: "Pleuritic chest pain with rub/effusion" },
  { name: "Pericarditis", score: 2, desc: "Pericardial pain with rub/ECG/effusion" },
  { name: "Low complement", score: 2, desc: "Decreased CH50/C3/C4 below normal" },
  { name: "Increased DNA binding", score: 2, desc: "Increased anti-dsDNA above normal" },
  { name: "Fever", score: 1, desc: ">38°C — exclude infectious causes" },
  { name: "Thrombocytopenia", score: 1, desc: "<100,000/mm³" },
  { name: "Leukopenia", score: 1, desc: "<3,000/mm³ — exclude drug causes" },
];

function SLEDAICalculator() {
  const [checked, setChecked] = useState({});
  const toggle = (name) => setChecked(prev => ({ ...prev, [name]: !prev[name] }));
  const score = SLEDAI_ITEMS.filter(i => checked[i.name]).reduce((s, i) => s + i.score, 0);

  const bands = [
    { min: 0, max: 0, label: "No Activity", color: "bg-green-500" },
    { min: 1, max: 5, label: "Mild Activity", color: "bg-blue-500" },
    { min: 6, max: 10, label: "Moderate Activity", color: "bg-amber-500" },
    { min: 11, max: 19, label: "High Activity", color: "bg-orange-500" },
    { min: 20, max: 99, label: "Very High Activity", color: "bg-red-500" },
  ];

  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-500">Check ALL features present in the past 10 days</p>
      <div className="space-y-1 max-h-72 overflow-y-auto pr-1">
        {SLEDAI_ITEMS.map(item => (
          <div key={item.name} className={`flex items-start gap-2 p-2 rounded-lg ${checked[item.name] ? "bg-rose-50 border border-rose-200" : "bg-slate-50"}`}>
            <Checkbox id={`sledai-${item.name}`} checked={!!checked[item.name]} onCheckedChange={() => toggle(item.name)} className="mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Label htmlFor={`sledai-${item.name}`} className="text-sm font-semibold cursor-pointer">{item.name}</Label>
                <Badge className="bg-slate-600 text-white text-xs">{item.score} pts</Badge>
              </div>
              <p className="text-xs text-slate-500">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
      <ScoreResult score={score} label="SLEDAI-2K Score" bands={bands} />
    </div>
  );
}

// ── MAS Criteria ──────────────────────────────────────────────────
const MAS_CRITERIA = [
  { name: "Fever ≥38.5°C", cat: "Clinical" },
  { name: "Splenomegaly", cat: "Clinical" },
  { name: "Ferritin >684 ng/mL", cat: "Lab" },
  { name: "Platelet ≤181×10⁹/L", cat: "Lab" },
  { name: "AST >48 U/L", cat: "Lab" },
  { name: "Triglycerides >156 mg/dL", cat: "Lab" },
  { name: "Fibrinogen ≤360 mg/dL", cat: "Lab" },
];

function MASCriteria() {
  const [checked, setChecked] = useState({});
  const toggle = (name) => setChecked(prev => ({ ...prev, [name]: !prev[name] }));
  const count = Object.values(checked).filter(Boolean).length;
  const met = count >= 5;

  return (
    <div className="space-y-3">
      <Alert className="bg-amber-50 border-amber-200">
        <AlertDescription className="text-amber-800 text-xs">
          2016 Classification Criteria for MAS complicating sJIA (Ravelli et al): requires ≥5 criteria in febrile patient
        </AlertDescription>
      </Alert>
      <div className="space-y-2">
        {MAS_CRITERIA.map(c => (
          <div key={c.name} className={`flex items-center gap-2 p-2 rounded-lg ${checked[c.name] ? "bg-orange-50 border border-orange-200" : "bg-slate-50"}`}>
            <Checkbox id={c.name} checked={!!checked[c.name]} onCheckedChange={() => toggle(c.name)} />
            <Label htmlFor={c.name} className="text-sm cursor-pointer flex-1">{c.name}</Label>
            <Badge className={c.cat === "Lab" ? "bg-indigo-100 text-indigo-700" : "bg-pink-100 text-pink-700"}>{c.cat}</Badge>
          </div>
        ))}
      </div>
      <div className={`p-4 rounded-xl border-2 mt-2 ${met ? "bg-red-50 border-red-300" : "bg-green-50 border-green-300"}`}>
        <div className="font-bold text-lg">{count}/7 criteria met</div>
        <div className={`font-semibold mt-1 ${met ? "text-red-700" : "text-green-700"}`}>
          {met ? "⚠️ MAS Classification CRITERIA MET — urgent evaluation" : "Criteria not yet met"}
        </div>
        {met && <p className="text-xs text-red-600 mt-1">Check: ferritin trend, triglycerides, bone marrow (if doubt). Consider cyclosporine + high-dose steroids.</p>}
      </div>
    </div>
  );
}

export default function RheumatologyCalculators() {
  return (
    <div className="space-y-2">
      <Alert className="bg-purple-50 border-purple-200 mb-4">
        <Info className="w-4 h-4 text-purple-600" />
        <AlertDescription className="text-purple-800 text-sm">
          Validated scoring tools for pediatric rheumatology — use alongside clinical assessment, not as standalone criteria.
        </AlertDescription>
      </Alert>

      <AccordionSection title="🦴 JADAS-27 (JIA Disease Activity)" color="purple" defaultOpen>
        <JADASCalculator />
      </AccordionSection>

      <AccordionSection title="🔴 SLEDAI-2K (Lupus Activity)" color="rose">
        <SLEDAICalculator />
      </AccordionSection>

      <AccordionSection title="🔥 MAS Classification Criteria (2016)" color="orange">
        <MASCriteria />
      </AccordionSection>
    </div>
  );
}