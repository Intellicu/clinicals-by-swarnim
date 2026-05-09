import React, { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity, AlertTriangle, CheckCircle, TrendingUp, Save } from "lucide-react";

// AAP 2017 BP classification (simplified operational logic)
// Returns { sbp_stage, dbp_stage, overall_stage, sbp_pct_approx, dbp_pct_approx }
function classifyBP(sbp, dbp, age, sex, height_cm) {
  if (!sbp || !dbp || !age) return null;
  const sbpN = Number(sbp); const dbpN = Number(dbp);
  const ageN = Number(age); 

  // Simplified thresholds by age group (AAP 2017 operational approximations)
  // These are approximate median ± percentile bands for pediatric classification
  const thresholds = {
    1:  { sbp50: 86,  sbp90: 98,  sbp95: 100, sbp95p12: 112, dbp50: 40,  dbp90: 52,  dbp95: 54,  dbp95p12: 66 },
    2:  { sbp50: 87,  sbp90: 100, sbp95: 102, sbp95p12: 114, dbp50: 43,  dbp90: 55,  dbp95: 57,  dbp95p12: 69 },
    3:  { sbp50: 88,  sbp90: 101, sbp95: 104, sbp95p12: 116, dbp50: 47,  dbp90: 59,  dbp95: 63,  dbp95p12: 75 },
    4:  { sbp50: 90,  sbp90: 102, sbp95: 106, sbp95p12: 118, dbp50: 50,  dbp90: 62,  dbp95: 66,  dbp95p12: 78 },
    5:  { sbp50: 91,  sbp90: 104, sbp95: 108, sbp95p12: 120, dbp50: 52,  dbp90: 64,  dbp95: 68,  dbp95p12: 80 },
    6:  { sbp50: 93,  sbp90: 105, sbp95: 109, sbp95p12: 121, dbp50: 53,  dbp90: 65,  dbp95: 70,  dbp95p12: 82 },
    7:  { sbp50: 94,  sbp90: 107, sbp95: 111, sbp95p12: 123, dbp50: 55,  dbp90: 67,  dbp95: 71,  dbp95p12: 83 },
    8:  { sbp50: 95,  sbp90: 108, sbp95: 112, sbp95p12: 124, dbp50: 56,  dbp90: 68,  dbp95: 72,  dbp95p12: 84 },
    9:  { sbp50: 96,  sbp90: 110, sbp95: 114, sbp95p12: 126, dbp50: 57,  dbp90: 69,  dbp95: 73,  dbp95p12: 85 },
    10: { sbp50: 97,  sbp90: 111, sbp95: 115, sbp95p12: 127, dbp50: 58,  dbp90: 70,  dbp95: 74,  dbp95p12: 86 },
    11: { sbp50: 99,  sbp90: 113, sbp95: 117, sbp95p12: 129, dbp50: 59,  dbp90: 72,  dbp95: 76,  dbp95p12: 88 },
    12: { sbp50: 101, sbp90: 115, sbp95: 119, sbp95p12: 131, dbp50: 61,  dbp90: 73,  dbp95: 77,  dbp95p12: 89 },
    13: { sbp50: 104, sbp90: 117, sbp95: 121, sbp95p12: 133, dbp50: 62,  dbp90: 74,  dbp95: 78,  dbp95p12: 90 },
    14: { sbp50: 106, sbp90: 120, sbp95: 124, sbp95p12: 136, dbp50: 63,  dbp90: 75,  dbp95: 80,  dbp95p12: 92 },
    15: { sbp50: 109, sbp90: 122, sbp95: 126, sbp95p12: 138, dbp50: 65,  dbp90: 76,  dbp95: 81,  dbp95p12: 93 },
    16: { sbp50: 111, sbp90: 125, sbp95: 129, sbp95p12: 141, dbp50: 66,  dbp90: 78,  dbp95: 82,  dbp95p12: 94 },
    17: { sbp50: 114, sbp90: 127, sbp95: 131, sbp95p12: 143, dbp50: 67,  dbp90: 78,  dbp95: 82,  dbp95p12: 94 },
  };

  const clamp = (n, min, max) => Math.min(Math.max(n, min), max);
  const t = thresholds[clamp(Math.round(ageN), 1, 17)] || thresholds[10];

  const classifySBP = (v) => {
    if (v < t.sbp90) return { stage: "Normal", color: "bg-green-100 text-green-800", pct: "<90th" };
    if (v < t.sbp95) return { stage: "Elevated", color: "bg-yellow-100 text-yellow-800", pct: "90-95th" };
    if (v < t.sbp95p12) return { stage: "Stage 1 HTN", color: "bg-orange-100 text-orange-800", pct: "95th-107th" };
    return { stage: "Stage 2 HTN", color: "bg-red-100 text-red-800", pct: ">107th" };
  };

  const classifyDBP = (v) => {
    if (v < t.dbp90) return { stage: "Normal", color: "bg-green-100 text-green-800", pct: "<90th" };
    if (v < t.dbp95) return { stage: "Elevated", color: "bg-yellow-100 text-yellow-800", pct: "90-95th" };
    if (v < t.dbp95p12) return { stage: "Stage 1 HTN", color: "bg-orange-100 text-orange-800", pct: "95th-107th" };
    return { stage: "Stage 2 HTN", color: "bg-red-100 text-red-800", pct: ">107th" };
  };

  const sbpResult = classifySBP(sbpN);
  const dbpResult = classifyDBP(dbpN);

  // Overall = higher of the two (AAP 2017 operational logic)
  const stages = ["Normal", "Elevated", "Stage 1 HTN", "Stage 2 HTN"];
  const overallIdx = Math.max(stages.indexOf(sbpResult.stage), stages.indexOf(dbpResult.stage));
  const overallStage = stages[overallIdx];

  return { sbpResult, dbpResult, overallStage, sbpN, dbpN };
}

export default function QuickVitalsCapture({ patient, initialVitals = {}, onSave, compact = false }) {
  const [vitals, setVitals] = useState({
    weight: initialVitals.weight || "",
    height: initialVitals.height || "",
    bp_systolic: initialVitals.bp_systolic || "",
    bp_diastolic: initialVitals.bp_diastolic || "",
    heart_rate: initialVitals.heart_rate || "",
    temperature: initialVitals.temperature || "",
    spo2: initialVitals.spo2 || "",
    urine_dipstick: initialVitals.urine_dipstick || "",
    edema: initialVitals.edema || "",
  });

  const bpClass = useMemo(() =>
    classifyBP(vitals.bp_systolic, vitals.bp_diastolic, patient?.age_years, patient?.gender, vitals.height),
    [vitals.bp_systolic, vitals.bp_diastolic, patient?.age_years, patient?.gender, vitals.height]
  );

  const set = (k, v) => setVitals(p => ({ ...p, [k]: v }));

  const bmi = vitals.weight && vitals.height
    ? (Number(vitals.weight) / Math.pow(Number(vitals.height) / 100, 2)).toFixed(1)
    : null;

  if (compact) {
    return (
      <div className="space-y-2">
        <div className="grid grid-cols-3 gap-2">
          {[
            { k: "weight", label: "Wt (kg)", type: "number" },
            { k: "height", label: "Ht (cm)", type: "number" },
            { k: "heart_rate", label: "HR", type: "number" },
          ].map(f => (
            <div key={f.k}>
              <label className="text-xs text-slate-500 block mb-0.5">{f.label}</label>
              <Input type={f.type} value={vitals[f.k]} onChange={e => set(f.k, e.target.value)}
                className="h-8 text-sm" placeholder="—" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="text-xs text-slate-500 block mb-0.5">SBP</label>
            <Input type="number" value={vitals.bp_systolic} onChange={e => set("bp_systolic", e.target.value)}
              className={`h-8 text-sm ${bpClass && bpClass.overallStage !== "Normal" ? "border-orange-400" : ""}`} placeholder="SBP" />
          </div>
          <div>
            <label className="text-xs text-slate-500 block mb-0.5">DBP</label>
            <Input type="number" value={vitals.bp_diastolic} onChange={e => set("bp_diastolic", e.target.value)}
              className="h-8 text-sm" placeholder="DBP" />
          </div>
          <div className="flex items-end pb-0.5">
            {bpClass && (
              <Badge className={`text-xs border-0 w-full justify-center ${bpClass.sbpResult.color}`}>
                {bpClass.overallStage}
              </Badge>
            )}
          </div>
        </div>
        {onSave && (
          <Button onClick={() => onSave(vitals)} size="sm" className="w-full h-8 text-xs bg-green-600 hover:bg-green-700">
            <Save className="w-3 h-3 mr-1" />Save Vitals
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Anthropometry */}
      <div>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Anthropometry</p>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-slate-500 block mb-1">Weight (kg)</label>
            <Input type="number" value={vitals.weight} onChange={e => set("weight", e.target.value)} placeholder="kg" />
          </div>
          <div>
            <label className="text-xs text-slate-500 block mb-1">Height (cm)</label>
            <Input type="number" value={vitals.height} onChange={e => set("height", e.target.value)} placeholder="cm" />
          </div>
          <div>
            <label className="text-xs text-slate-500 block mb-1">BMI</label>
            <div className="h-9 flex items-center px-3 border border-slate-200 rounded-md bg-slate-50 text-sm font-semibold text-slate-700">
              {bmi || "—"}
            </div>
          </div>
        </div>
      </div>

      {/* BP with AAP staging */}
      <div>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Blood Pressure — AAP 2017</p>
        <div className="grid grid-cols-2 gap-3 mb-2">
          <div>
            <label className="text-xs text-slate-500 block mb-1">Systolic</label>
            <Input type="number" value={vitals.bp_systolic} onChange={e => set("bp_systolic", e.target.value)}
              className={bpClass && bpClass.overallStage !== "Normal" ? "border-orange-400 ring-1 ring-orange-300" : ""}
              placeholder="SBP mmHg" />
          </div>
          <div>
            <label className="text-xs text-slate-500 block mb-1">Diastolic</label>
            <Input type="number" value={vitals.bp_diastolic} onChange={e => set("bp_diastolic", e.target.value)} placeholder="DBP mmHg" />
          </div>
        </div>
        {bpClass && (
          <div className={`rounded-xl border px-3 py-2 space-y-1.5 ${bpClass.overallStage === "Normal" ? "bg-green-50 border-green-200" : bpClass.overallStage === "Elevated" ? "bg-yellow-50 border-yellow-200" : "bg-red-50 border-red-200"}`}>
            <div className="flex items-center gap-2">
              {bpClass.overallStage === "Normal" ? <CheckCircle className="w-4 h-4 text-green-600" /> : <AlertTriangle className="w-4 h-4 text-red-600" />}
              <span className="font-bold text-sm">Overall: {bpClass.overallStage}</span>
              <span className="text-xs text-slate-500 ml-auto">AAP 2017 · age {patient?.age_years}y</span>
            </div>
            <div className="flex gap-3 text-xs">
              <Badge className={`border-0 ${bpClass.sbpResult.color}`}>SBP {bpClass.sbpResult.stage} ({bpClass.sbpResult.pct})</Badge>
              <Badge className={`border-0 ${bpClass.dbpResult.color}`}>DBP {bpClass.dbpResult.stage} ({bpClass.dbpResult.pct})</Badge>
            </div>
            {bpClass.overallStage === "Stage 2 HTN" && (
              <p className="text-xs text-red-700 font-semibold flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />Stage 2: Confirm on 3 separate occasions. Consider antihypertensive.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Other vitals */}
      <div>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Other Vitals</p>
        <div className="grid grid-cols-3 gap-3">
          {[
            { k: "heart_rate", label: "HR (bpm)" },
            { k: "temperature", label: "Temp (°F)" },
            { k: "spo2", label: "SpO₂ (%)" },
          ].map(f => (
            <div key={f.k}>
              <label className="text-xs text-slate-500 block mb-1">{f.label}</label>
              <Input type="number" value={vitals[f.k]} onChange={e => set(f.k, e.target.value)} placeholder="—" />
            </div>
          ))}
        </div>
      </div>

      {/* Urine dipstick + edema */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-slate-500 block mb-1">Urine Dipstick</label>
          <select value={vitals.urine_dipstick} onChange={e => set("urine_dipstick", e.target.value)}
            className="w-full h-9 border border-slate-200 rounded-md px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300">
            <option value="">Select</option>
            {["Negative", "Trace", "1+", "2+", "3+", "4+"].map(v => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-slate-500 block mb-1">Edema</label>
          <select value={vitals.edema} onChange={e => set("edema", e.target.value)}
            className="w-full h-9 border border-slate-200 rounded-md px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300">
            <option value="">None</option>
            {["Periorbital Only", "Mild", "Moderate", "Severe", "Anasarca"].map(v => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Urine dipstick alert for NS */}
      {["3+", "4+"].includes(vitals.urine_dipstick) && (
        <div className="flex items-center gap-2 text-xs font-semibold text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
          <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
          Protein {vitals.urine_dipstick} — if consistent × 3 days, consider NS relapse (ISPN 2023)
        </div>
      )}

      {onSave && (
        <Button onClick={() => onSave(vitals)} className="w-full bg-green-600 hover:bg-green-700">
          <Save className="w-4 h-4 mr-2" />Save Vitals
        </Button>
      )}
    </div>
  );
}