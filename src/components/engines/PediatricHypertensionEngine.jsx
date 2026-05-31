import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, ChevronRight, ArrowLeft, Heart, AlertCircle, Activity } from "lucide-react";

const SYMPTOMS = [
  { id: "headache", label: "Headache (severe / morning)" },
  { id: "visual", label: "Visual symptoms / blurring" },
  { id: "seizure", label: "Seizures" },
  { id: "encephalopathy", label: "Altered consciousness / encephalopathy" },
  { id: "pulm_edema", label: "Pulmonary edema / respiratory distress" },
  { id: "hematuria", label: "Hematuria" },
  { id: "proteinuria", label: "Proteinuria / edema" },
  { id: "ckd_known", label: "Known CKD / chronic kidney disease" },
  { id: "obesity", label: "Obesity (BMI >95th percentile)" },
  { id: "family_htn", label: "Family history of hypertension" },
];

const CLASSIFICATIONS = [
  { label: "Normal (<13y)", cutoff: "<90th percentile for age/sex/height" },
  { label: "Elevated BP", cutoff: "90th–<95th percentile (or ≥120/80 in ≥13y)" },
  { label: "Stage 1 HTN", cutoff: "95th–<99th + 12 mmHg" },
  { label: "Stage 2 HTN", cutoff: "≥99th percentile + 12 mmHg" },
];

const SECONDARY_CAUSES = [
  { cause: "CKD / Reflux nephropathy", workup: "USG kidneys, eGFR, UPCR, DMSA" },
  { cause: "Renovascular (FMD / stenosis)", workup: "Renal artery Doppler, captopril scintigraphy, MRA, renin" },
  { cause: "Coarctation of aorta", workup: "4-limb BP, echo, CT angiography" },
  { cause: "Primary aldosteronism", workup: "Aldosterone, renin, aldosterone:renin ratio, adrenal CT" },
  { cause: "Pheochromocytoma", workup: "Plasma metanephrines (preferred), urine catecholamines" },
  { cause: "Cushing syndrome", workup: "24h urine cortisol, overnight dexamethasone suppression" },
  { cause: "Thyroid disease", workup: "TFTs (hyperthyroid → high BP, bradycardia in hypothyroid)" },
  { cause: "Obstructive sleep apnoea", workup: "Sleep study, CPAP trial" },
];

const DRUGS = [
  { drug: "Amlodipine (CCB)", dose: "0.06–0.3 mg/kg/day OD", indication: "1st line: HTN without CKD/proteinuria", notes: "Safe in all ages; peripheral edema (dose-related)" },
  { drug: "Ramipril / Enalapril (ACEi)", dose: "0.05–0.5 mg/kg/day OD–BD", indication: "CKD with proteinuria; renovascular (use cautiously)", notes: "Monitor K+, creatinine; avoid bilateral RAS; teratogenic" },
  { drug: "Losartan (ARB)", dose: "0.7–1.4 mg/kg/day OD", indication: "CKD + proteinuria, Alport, diabetic nephropathy", notes: "ESCAPE trial — gold standard in CKD" },
  { drug: "Labetalol IV", dose: "0.2–1 mg/kg/dose IV (max 40 mg/dose)", indication: "Hypertensive emergency", notes: "Alpha + beta blockade; avoid in asthma" },
  { drug: "Nicardipine IV", dose: "1–3 µg/kg/min infusion", indication: "Hypertensive emergency if labetalol unavailable", notes: "Titratable; titrate by 0.5 µg/kg/min q15min" },
  { drug: "Hydralazine IV", dose: "0.1–0.2 mg/kg/dose q4–6h", indication: "Hypertensive emergency (alternative)", notes: "May cause reflex tachycardia; add beta blocker" },
  { drug: "Furosemide", dose: "1–2 mg/kg/dose OD–BD", indication: "Volume-overload HTN (CKD, NS)", notes: "Avoid in dehydration; monitor electrolytes" },
  { drug: "Atenolol / Propranolol (BB)", dose: "1–2 mg/kg/day", indication: "Pheochromocytoma (after alpha block); white coat HTN", notes: "Avoid in asthma; mask hypoglycemia symptoms" },
];

export default function PediatricHypertensionEngine() {
  const [step, setStep] = useState(0);
  const [symptoms, setSymptoms] = useState({});
  const [bpClass, setBPClass] = useState("");
  const [ageGroup, setAgeGroup] = useState("");

  const toggle = (id) => setSymptoms(s => ({ ...s, [id]: !s[id] }));
  const isEmergency = symptoms.seizure || symptoms.encephalopathy || symptoms.pulm_edema;
  const isUrgency = !isEmergency && (symptoms.headache || symptoms.visual) && bpClass === "Stage 2 HTN";

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-gradient-to-r from-red-700 to-pink-600 p-4 text-white">
        <div className="flex items-center gap-2 mb-1">
          <Heart className="w-5 h-5" />
          <h3 className="text-sm font-bold">Pediatric Hypertension Decision Engine</h3>
          <Badge className="bg-white/20 text-white text-xs border-white/30">AAP 2017</Badge>
        </div>
        <p className="text-xs text-red-100">BP classification → Symptoms → Secondary causes → Drug selection</p>
      </div>

      {step === 0 && (
        <div className="space-y-3">
          <Alert className="bg-red-50 border-red-200"><AlertCircle className="w-4 h-4 text-red-600" /><AlertDescription className="text-red-800 text-xs">Confirm BP with appropriate cuff size (cuff bladder should cover 80–100% arm circumference). Seated, rested × 5 min. Take in BOTH arms; use higher reading. Repeat in subsequent visits before diagnosing HTN.</AlertDescription></Alert>
          <p className="text-sm font-semibold text-slate-700">Select symptoms present:</p>
          {SYMPTOMS.map(q => (
            <button key={q.id} onClick={() => toggle(q.id)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg border transition-all text-left text-sm ${symptoms[q.id] ? "bg-red-50 border-red-300 text-red-800" : "bg-white border-slate-200 text-slate-700"}`}>
              {symptoms[q.id] ? <CheckCircle2 className="w-4 h-4 text-red-600 flex-shrink-0" /> : <Circle className="w-4 h-4 text-slate-300 flex-shrink-0" />}
              {q.label}
            </button>
          ))}
          {isEmergency && (
            <div className="rounded-xl bg-red-600 p-3 text-white">
              <p className="font-bold text-sm">⚠️ HYPERTENSIVE EMERGENCY — Act now</p>
              <p className="text-xs mt-1">IV antihypertensives STAT. MAP reduction ≤25% in first hour. ICU admission.</p>
            </div>
          )}
          <Button className="w-full bg-red-600 hover:bg-red-700" onClick={() => setStep(1)}>BP Classification <ChevronRight className="w-4 h-4 ml-1" /></Button>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-3">
          <p className="text-sm font-semibold text-slate-700">BP Classification (AAP 2017):</p>
          <p className="text-xs text-slate-500">For age &lt;13y: Use sex/age/height percentile tables. For ≥13y: Use adult thresholds.</p>
          {CLASSIFICATIONS.map(c => (
            <button key={c.label} onClick={() => setBPClass(c.label)}
              className={`w-full flex items-start gap-3 px-3 py-2.5 rounded-xl border-2 transition-all text-left ${bpClass === c.label ? "border-red-400 bg-red-50" : "border-slate-200 bg-white hover:border-slate-300"}`}>
              <div>
                <p className={`text-sm font-bold ${bpClass === c.label ? "text-red-800" : "text-slate-800"}`}>{c.label}</p>
                <p className="text-xs text-slate-500">{c.cutoff}</p>
              </div>
            </button>
          ))}
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep(0)} className="flex-1"><ArrowLeft className="w-4 h-4 mr-1" />Back</Button>
            <Button className="flex-1 bg-red-600 hover:bg-red-700" disabled={!bpClass} onClick={() => setStep(2)}>Secondary Workup <ChevronRight className="w-4 h-4 ml-1" /></Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-3">
          <p className="text-sm font-semibold text-slate-700">Secondary Hypertension — Causes & Workup:</p>
          <p className="text-xs text-slate-500">In children, 85% of sustained HTN is secondary. Consider age: Neonates → RAS/coarctation; Infants → RAS/CKD; School age → CKD/renovascular; Adolescents → Essential + secondary</p>
          {SECONDARY_CAUSES.map((c, i) => (
            <div key={i} className="rounded-xl border border-slate-200 bg-white p-3">
              <p className="text-sm font-bold text-slate-800">{c.cause}</p>
              <p className="text-xs text-slate-600 mt-1">→ {c.workup}</p>
            </div>
          ))}
          <div className="rounded-xl bg-blue-50 border border-blue-200 p-3 space-y-1 text-xs text-blue-900">
            <p className="font-bold">Standard Workup (all children with confirmed HTN):</p>
            {["Urine: Urinalysis, UPCR, sodium, osmolality", "Blood: eGFR, electrolytes, Ca, glucose, cholesterol, HbA1c", "USG kidneys + bladder (renal size, echogenicity, Doppler)", "Echo (LVH — end-organ damage)", "ABPM (ambulatory BP monitoring) — white coat vs sustained HTN"].map((w, j) => (
              <div key={j} className="flex items-start gap-1.5"><ChevronRight className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-blue-500" />{w}</div>
            ))}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep(1)} className="flex-1"><ArrowLeft className="w-4 h-4 mr-1" />Back</Button>
            <Button className="flex-1 bg-red-600 hover:bg-red-700" onClick={() => setStep(3)}>Drug Selection <ChevronRight className="w-4 h-4 ml-1" /></Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-3">
          <p className="text-sm font-semibold text-slate-700">Drug Selection Guide (by indication):</p>
          <div className="rounded-xl bg-amber-50 border border-amber-200 p-2 text-xs text-amber-900 space-y-0.5">
            <p className="font-bold">Non-pharmacological: ALWAYS first in Elevated BP / Stage 1 without symptoms</p>
            <p>Weight reduction, DASH diet, salt restriction (Na &lt;2g/day), regular exercise, sleep hygiene</p>
          </div>
          {DRUGS.map((d, i) => (
            <div key={i} className="rounded-xl border border-slate-200 bg-white p-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-800">{d.drug}</p>
                  <p className="text-xs text-blue-700 font-medium">{d.indication}</p>
                </div>
                <Badge variant="outline" className="text-xs flex-shrink-0 ml-2">{d.dose}</Badge>
              </div>
              <p className="text-xs text-slate-500 mt-1">{d.notes}</p>
            </div>
          ))}
          {isEmergency && (
            <div className="rounded-xl bg-red-50 border-2 border-red-400 p-3 space-y-1 text-xs text-red-900">
              <p className="font-bold">Hypertensive Emergency Protocol:</p>
              {["IV Labetalol 0.2–1 mg/kg/dose — preferred (alpha + beta)", "OR Nicardipine infusion 1–3 µg/kg/min (if labetalol unavailable)", "Goal: Reduce MAP by ≤25% in first hour — faster = risk of ischaemia/PRES", "PRES: MRI FLAIR + levetiracetam for seizures", "ICU: Continuous BP monitoring (arterial line if possible)", "Identify and treat underlying cause (CKD flare, RAS, pheochromocytoma)"].map((m, j) => (
                <div key={j} className="flex items-start gap-1.5"><ChevronRight className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-red-600" />{m}</div>
              ))}
            </div>
          )}
          <Button className="w-full bg-red-600 hover:bg-red-700" onClick={() => { setStep(0); setSymptoms({}); setBPClass(""); }}>New Patient</Button>
        </div>
      )}
    </div>
  );
}