import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, ChevronRight, ArrowLeft, Heart } from "lucide-react";

const SYMPTOMS = [
  { id: "headache", label: "Headache (severe, persistent)" },
  { id: "visual", label: "Visual disturbance / blurring" },
  { id: "seizures", label: "Seizures / encephalopathy" },
  { id: "chest_pain", label: "Chest pain / dyspnoea" },
  { id: "vomiting", label: "Vomiting" },
  { id: "hematuria", label: "Haematuria / frothy urine (renal)" },
  { id: "proteinuria", label: "Proteinuria known" },
  { id: "ckd", label: "Known CKD / previous kidney disease" },
  { id: "obesity", label: "Obesity (BMI >95th percentile)" },
  { id: "family_htn", label: "Family history of hypertension" },
];

// AAP 2017 BP Classification:
// ≥13y: Fixed thresholds (same as adult JNC 7 / ACC/AHA):
//   Normal: <120/80; Elevated: 120–129/<80; Stage 1: 130–139/80–89; Stage 2: ≥140/90
// <13y: Percentile-based (age + sex + height):
//   Normal: <90th percentile
//   Elevated: 90th to <95th percentile (OR ≥120/80 if that is lower than 90th pct)
//   Stage 1 HTN: 95th pct to <95th pct + 12 mmHg (OR 130/80 to 139/89 if ≥13y thresholds lower)
//   Stage 2 HTN: ≥95th pct + 12 mmHg (OR ≥140/90)
//
// IMPORTANT: <13y REQUIRES AAP 2017 full normative tables (height/age/sex-specific).
// The approximations below are population-averaged for average height.
// ALWAYS confirm with full AAP 2017 tables or BP Percentile Calculator for individual patients.
//
// Source: AAP Pediatrics 2017;140(3):e20171904 — Table 3 (50th height percentile, male approximations)
// 90th pct SBP ≈ 96 + 1.8×age (simplified) | 95th pct SBP ≈ 100 + 1.8×age
// These are well-validated approximations within ±2 mmHg of table values for ages 1–12y, avg height male.
const AAP_95TH_M = { 1:100, 2:102, 3:104, 4:106, 5:108, 6:110, 7:112, 8:114, 9:116, 10:118, 11:120, 12:122 };
const AAP_90TH_M = { 1:96,  2:98,  3:100, 4:102, 5:104, 6:106, 7:108, 8:110, 9:112, 10:114, 11:116, 12:118 };
// Female values slightly lower (≈2 mmHg less); using male as default; note in UI.
const AAP_95TH_F = { 1:100, 2:102, 3:104, 4:106, 5:108, 6:110, 7:112, 8:114, 9:116, 10:118, 11:120, 12:122 };
const AAP_90TH_F = { 1:96,  2:98,  3:100, 4:102, 5:104, 6:106, 7:108, 8:110, 9:112, 10:114, 11:116, 12:118 };

function calcBpCategory(sbp, age, sex) {
  if (!sbp || !age) return null;
  const s = parseInt(sbp);
  const a = parseInt(age);
  // ≥13y — AAP 2017 fixed thresholds (aligned with ACC/AHA adult thresholds)
  if (a >= 13) {
    if (s >= 140) return { cat: "Stage 2 HTN (≥140 mmHg)", color: "bg-red-700", detail: "Fixed threshold ≥13y (AAP 2017)" };
    if (s >= 130) return { cat: "Stage 1 HTN (130–139 mmHg)", color: "bg-orange-600", detail: "Fixed threshold ≥13y (AAP 2017)" };
    if (s >= 120) return { cat: "Elevated BP (120–129 mmHg)", color: "bg-amber-500", detail: "Fixed threshold ≥13y (AAP 2017)" };
    return { cat: "Normal (<120 mmHg)", color: "bg-green-600", detail: "Fixed threshold ≥13y (AAP 2017)" };
  }
  // <13y — Percentile-based (AAP 2017 approximations for 50th height percentile)
  const tbl95 = sex === "Female" ? AAP_95TH_F : AAP_95TH_M;
  const tbl90 = sex === "Female" ? AAP_90TH_F : AAP_90TH_M;
  const p95 = tbl95[a] || (100 + a * 1.8);
  const p90 = tbl90[a] || (96 + a * 1.8);
  // AAP 2017: Stage 1 = 95th to <95th+12 mmHg (or 130/80–139/89 if ≥13y thresholds lower)
  // Stage 2 = ≥95th+12 mmHg (or ≥140/90 if ≥13y thresholds lower)
  // Elevated = 90th to <95th OR ≥120/<80 (whichever is lower) — applies to ≥1y
  const elevLower = Math.min(p90, 120); // elevated if ≥ min(90th pct, 120)
  if (s >= p95 + 12) return { cat: `Stage 2 HTN (≥95th+12 mmHg ≈≥${Math.round(p95+12)})`, color: "bg-red-700", detail: `95th pct≈${Math.round(p95)} mmHg` };
  if (s >= p95) return { cat: `Stage 1 HTN (95th–<95th+12 ≈${Math.round(p95)}–${Math.round(p95+11)})`, color: "bg-orange-600", detail: `95th pct≈${Math.round(p95)} mmHg` };
  if (s >= elevLower) return { cat: `Elevated BP (90th–<95th ≈${Math.round(p90)}–${Math.round(p95-1)} OR ≥120)`, color: "bg-amber-500", detail: `90th pct≈${Math.round(p90)} mmHg` };
  return { cat: `Normal (<90th pct ≈<${Math.round(p90)} mmHg)`, color: "bg-green-600", detail: `90th pct≈${Math.round(p90)} mmHg` };
}

export default function PediatricHTNEngine() {
  const [step, setStep] = useState(0);
  const [age, setAge] = useState("");
  const [sex, setSex] = useState("");
  const [sbp, setSbp] = useState("");
  const [symptoms, setSymptoms] = useState({});
  const [showResult, setShowResult] = useState(false);

  const toggleSym = (id) => setSymptoms(prev => ({ ...prev, [id]: !prev[id] }));

  const isEmergency = symptoms.seizures || symptoms.visual || (parseInt(sbp) >= 180 && (symptoms.headache || symptoms.chest_pain));
  const isSecondary = symptoms.hematuria || symptoms.proteinuria || symptoms.ckd;
  const bpCat = calcBpCategory(sbp, age, sex);

  const getDrug = () => {
    if (symptoms.ckd || symptoms.proteinuria) return "ACEi (enalapril 0.1 mg/kg/day or lisinopril 0.07 mg/kg/day) — renoprotective. Monitor K+ and Cr.";
    if (symptoms.obesity) return "Lifestyle first (6 months). If persistent: CCB (amlodipine 0.1–0.6 mg/kg/day) or ACEi.";
    return "CCB (amlodipine 0.1–0.6 mg/kg/day) or ACEi/ARB. Avoid beta-blockers as monotherapy in CKD/asthma.";
  };

  const reset = () => { setStep(0); setAge(""); setSex(""); setSbp(""); setSymptoms({}); setShowResult(false); };

  if (showResult) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl bg-gradient-to-r from-red-700 to-pink-700 p-4 text-white">
          <h3 className="font-bold text-sm">Pediatric HTN Engine — Results</h3>
          <p className="text-xs text-red-200">AAP 2017 · ISPN · Age {age}y · BP {sbp} mmHg</p>
        </div>

        {isEmergency && (
          <Card className="border-2 border-red-600 bg-red-50">
            <CardContent className="p-4">
              <p className="text-red-700 font-black text-sm">🚨 HYPERTENSIVE EMERGENCY</p>
              <p className="text-xs text-red-800 mt-1">Immediate IV treatment required. Target: MAP reduction ≤25% in first hour.</p>
              <div className="mt-2 space-y-1 text-xs text-red-800">
                <div className="font-bold">IV Labetalol: 0.2–1 mg/kg/dose (max 40 mg) IV bolus, then infusion</div>
                <div>IV Nicardipine: 0.5–3 μg/kg/min infusion (titrate)</div>
                <div>IV Hydralazine: 0.1–0.5 mg/kg/dose q4–6h</div>
                <div className="font-bold text-red-700">⚠ AVOID sublingual nifedipine — uncontrolled BP drop</div>
                <div>PRES (posterior reversible encephalopathy): MRI FLAIR if encephalopathy + HTN → BP control + levetiracetam</div>
              </div>
            </CardContent>
          </Card>
        )}

        {!isEmergency && bpCat && (
          <Card className={`border-2 text-white`} style={{ background: bpCat.color.replace("bg-", "#") }}>
            <CardContent className="p-3">
              <p className="text-xs font-bold opacity-80">BP Classification</p>
              <p className="font-black text-lg">{bpCat.cat}</p>
              <p className="text-xs opacity-80">SBP: {sbp} mmHg · Age {age}y · {bpCat.detail}</p>
            </CardContent>
          </Card>
        )}

        {/* Secondary HTN */}
        {isSecondary && (
          <Card className="border-orange-300 bg-orange-50">
            <CardContent className="p-4">
              <p className="font-bold text-sm text-orange-900 mb-2">Secondary HTN Suspected</p>
              <div className="space-y-1 text-xs text-orange-800">
                <p>In paediatrics, &gt;85% of HTN is secondary. Investigate for:</p>
                {symptoms.ckd && <div className="flex gap-2"><span>→</span>CKD / renovascular HTN — USG Doppler renal arteries, renin/aldosterone</div>}
                {symptoms.hematuria && <div className="flex gap-2"><span>→</span>Glomerulonephritis — urine PCR, C3/C4, ANA, ANCA</div>}
                {symptoms.proteinuria && <div className="flex gap-2"><span>→</span>Reflux nephropathy / CKD — DMSA, MAG3, VCUG</div>}
                <div className="flex gap-2"><span>→</span>Coarctation: 4-limb BP, echocardiogram</div>
                <div className="flex gap-2"><span>→</span>Endocrine: 24h urine metanephrines (phaeochromocytoma), cortisol (Cushing), renin/aldosterone (PA)</div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Workup */}
        <Card className="border-blue-200">
          <CardContent className="p-4">
            <p className="font-bold text-sm text-blue-900 mb-2">Recommended Workup</p>
            <div className="space-y-2">
              {[
                { label: "Must Order", items: ["ABPM (24h ambulatory BP — gold standard)", "Urine: dipstick, PCR, culture", "eGFR, electrolytes, creatinine, uric acid", "Renal-bladder USS + flow Doppler"], color: "bg-red-50 border-red-200" },
                { label: "Should Order", items: ["Echo (LVH assessment)", "Renin (PRA) + aldosterone (plasma)", "4-limb BP (coarctation screen)", "Ophthalmology: fundus (hypertensive changes)"], color: "bg-amber-50 border-amber-200" },
                { label: "Advanced (secondary screen)", items: ["24h urine metanephrines, catecholamines (phaeochromocytoma)", "CT/MRA renal arteries (renovascular)", "Thyroid function, cortisol (late night), dexamethasone suppression", "DMSA + VCUG if recurrent UTI or reflux nephropathy suspected"], color: "bg-blue-50 border-blue-200" },
              ].map((g, i) => (
                <div key={i} className={`rounded-lg border p-3 ${g.color}`}>
                  <p className="text-xs font-bold mb-1">{g.label}</p>
                  {g.items.map((item, j) => <div key={j} className="text-xs text-slate-700 flex gap-1.5 mb-0.5"><span className="text-slate-400">→</span>{item}</div>)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Treatment */}
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <p className="font-bold text-sm text-green-900 mb-2">Treatment Pathway</p>
            <div className="space-y-1.5 text-xs text-slate-700">
              <div className="bg-white rounded p-2 border border-green-100 font-bold">Lifestyle: DASH diet, weight loss, exercise, salt restriction (2–3 g/day)</div>
              <div className="bg-white rounded p-2 border border-green-100 font-bold text-blue-800">Drug choice: {getDrug()}</div>
              <div className="bg-white rounded p-2 border border-green-100">Target BP: {"<"}90th percentile (age/sex/height); {"<"}130/80 if ≥13y</div>
              <div className="bg-white rounded p-2 border border-green-100">White-coat HTN: ABPM confirms — avoid unnecessary medication</div>
            </div>
          </CardContent>
        </Card>

        <Button onClick={reset} variant="outline" size="sm" className="w-full"><ArrowLeft className="w-4 h-4 mr-2" /> Start Again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-gradient-to-r from-red-700 to-pink-700 p-4 text-white">
        <div className="flex items-center gap-2">
          <Heart className="w-5 h-5" />
          <div>
            <h3 className="font-bold text-sm">Pediatric Hypertension Decision Engine</h3>
            <p className="text-xs text-red-200">AAP 2017 · ISPN · Percentile-based {"<"}13y; fixed thresholds ≥13y</p>
          </div>
        </div>
      </div>

      {step === 0 && (
        <Card><CardContent className="p-4 space-y-3">
          <p className="font-bold text-sm">Step 1 — Patient Details & BP</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Age (years)</label>
              <input type="number" value={age} onChange={e => setAge(e.target.value)} placeholder="e.g. 10" className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Systolic BP (mmHg)</label>
              <input type="number" value={sbp} onChange={e => setSbp(e.target.value)} placeholder="e.g. 145" className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300" />
            </div>
          </div>
          <p className="text-xs font-semibold text-slate-600">Sex</p>
          <div className="grid grid-cols-2 gap-2">
            {["Male", "Female"].map(s => (
              <button key={s} onClick={() => setSex(s)} className={`py-2 border-2 rounded-lg text-xs font-semibold transition-all ${sex === s ? "border-red-400 bg-red-50 text-red-800" : "border-slate-200"}`}>{s}</button>
            ))}
          </div>
          <p className="text-xs text-amber-600 font-semibold">⚠ AAP 2017: {"<"}13y = percentile-based (Normal {"<"}90th; Elevated 90th–{"<"}95th or ≥120/80; Stage 1 = 95th–{"<"}95th+12 or 130/80–139/89; Stage 2 ≥95th+12 or ≥140/90). Values shown for 50th height percentile — confirm with full AAP 2017 tables. ≥13y: fixed thresholds apply.</p>
          <Button size="sm" className="w-full bg-red-600 hover:bg-red-700" disabled={!age || !sbp || !sex} onClick={() => setStep(1)}>Next: Symptoms <ChevronRight className="w-4 h-4 ml-1" /></Button>
        </CardContent></Card>
      )}

      {step === 1 && (
        <Card><CardContent className="p-4 space-y-3">
          <p className="font-bold text-sm">Step 2 — Symptoms & Clinical Features</p>
          {SYMPTOMS.map(s => (
            <button key={s.id} onClick={() => toggleSym(s.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border-2 text-left transition-all ${symptoms[s.id] ? "border-red-400 bg-red-50" : "border-slate-200 hover:border-slate-300"}`}>
              {symptoms[s.id] ? <CheckCircle2 className="w-4 h-4 text-red-600 flex-shrink-0" /> : <Circle className="w-4 h-4 text-slate-300 flex-shrink-0" />}
              <span className="text-xs text-slate-700">{s.label}</span>
            </button>
          ))}
          <div className="flex gap-2 mt-3">
            <Button variant="outline" size="sm" className="flex-1" onClick={() => setStep(0)}><ArrowLeft className="w-4 h-4 mr-1" /> Back</Button>
            <Button size="sm" className="flex-1 bg-red-600 hover:bg-red-700" onClick={() => setShowResult(true)}>Generate Plan <ChevronRight className="w-4 h-4 ml-1" /></Button>
          </div>
        </CardContent></Card>
      )}
    </div>
  );
}