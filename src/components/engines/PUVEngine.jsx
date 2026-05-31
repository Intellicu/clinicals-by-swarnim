import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, ChevronRight, ArrowLeft, Activity, AlertCircle } from "lucide-react";

const PRENATAL_Q = [
  { id: "keyhole", label: "Keyhole sign on prenatal USS (dilated posterior urethra)" },
  { id: "oligohydramnios", label: "Oligohydramnios" },
  { id: "bilateral_hdn", label: "Bilateral hydroureteronephrosis" },
  { id: "thickened_bladder", label: "Thickened bladder wall" },
];
const POSTNATAL_Q = [
  { id: "weak_stream", label: "Weak urinary stream / dribbling" },
  { id: "palpable_bladder", label: "Palpable / distended bladder" },
  { id: "aki", label: "AKI / elevated creatinine at birth" },
  { id: "uti_postnatal", label: "Urinary tract infection in first year" },
  { id: "uftt", label: "Failure to thrive / poor feeding" },
];
const MCU_FINDINGS = [
  { id: "valve_seen", label: "Posterior urethral valve visible on MCU / cystoscopy" },
  { id: "bladder_changes", label: "Bladder trabeculation / diverticula on MCU" },
  { id: "vur_mcu", label: "VUR (especially bilateral) on MCU" },
  { id: "dilated_urethra", label: "Dilated posterior urethra on MCU" },
];

function calcRisk(answers) {
  const count = Object.values(answers).filter(Boolean).length;
  const criticalFeatures = answers.keyhole || answers.oligohydramnios || answers.weak_stream || answers.valve_seen;
  if (criticalFeatures || count >= 4) return "High";
  if (count >= 2) return "Intermediate";
  return "Low";
}

export default function PUVEngine() {
  const [step, setStep] = useState(0);
  const [preAnswers, setPreAnswers] = useState({});
  const [postAnswers, setPostAnswers] = useState({});
  const [mcuAnswers, setMCUAnswers] = useState({});
  const [nadir, setNadir] = useState("");

  const allAnswers = { ...preAnswers, ...postAnswers, ...mcuAnswers };
  const risk = calcRisk(allAnswers);

  const toggle = (setter) => (id) => setter(a => ({ ...a, [id]: !a[id] }));

  const RISK_COLORS = { High: "bg-red-600 text-white", Intermediate: "bg-amber-500 text-white", Low: "bg-green-500 text-white" };

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-gradient-to-r from-red-700 to-orange-600 p-4 text-white">
        <div className="flex items-center gap-2 mb-1">
          <Activity className="w-5 h-5" />
          <h3 className="text-sm font-bold">Posterior Urethral Valves (PUV) Engine</h3>
          <Badge className="bg-white/20 text-white text-xs border-white/30">Male infants only</Badge>
        </div>
        <p className="text-xs text-red-100">Prenatal → Postnatal → MCU → Long-term CKD risk stratification</p>
      </div>

      {step === 0 && (
        <div className="space-y-3">
          <Alert className="bg-amber-50 border-amber-200"><AlertCircle className="w-4 h-4 text-amber-600" /><AlertDescription className="text-amber-800 text-xs">PUV = Most common cause of severe obstructive uropathy in males. Bilateral hydronephrosis + thickened bladder + keyhole sign = PUV until proven otherwise.</AlertDescription></Alert>
          <p className="text-sm font-semibold text-slate-700">Prenatal features present? (select all)</p>
          {PRENATAL_Q.map(q => (
            <button key={q.id} onClick={() => toggle(setPreAnswers)(q.id)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg border transition-all text-left text-sm ${preAnswers[q.id] ? "bg-red-50 border-red-300 text-red-800" : "bg-white border-slate-200 text-slate-700"}`}>
              {preAnswers[q.id] ? <CheckCircle2 className="w-4 h-4 text-red-600 flex-shrink-0" /> : <Circle className="w-4 h-4 text-slate-300 flex-shrink-0" />}
              {q.label}
            </button>
          ))}
          <Button className="w-full bg-red-600 hover:bg-red-700" onClick={() => setStep(1)}>Next: Postnatal <ChevronRight className="w-4 h-4 ml-1" /></Button>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-3">
          <p className="text-sm font-semibold text-slate-700">Postnatal features? (select all)</p>
          {POSTNATAL_Q.map(q => (
            <button key={q.id} onClick={() => toggle(setPostAnswers)(q.id)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg border transition-all text-left text-sm ${postAnswers[q.id] ? "bg-red-50 border-red-300 text-red-800" : "bg-white border-slate-200 text-slate-700"}`}>
              {postAnswers[q.id] ? <CheckCircle2 className="w-4 h-4 text-red-600 flex-shrink-0" /> : <Circle className="w-4 h-4 text-slate-300 flex-shrink-0" />}
              {q.label}
            </button>
          ))}
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep(0)} className="flex-1"><ArrowLeft className="w-4 h-4 mr-1" />Back</Button>
            <Button className="flex-1 bg-red-600 hover:bg-red-700" onClick={() => setStep(2)}>MCU Findings <ChevronRight className="w-4 h-4 ml-1" /></Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-3">
          <p className="text-sm font-semibold text-slate-700">MCU / Cystoscopy findings? (select all)</p>
          {MCU_FINDINGS.map(q => (
            <button key={q.id} onClick={() => toggle(setMCUAnswers)(q.id)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg border transition-all text-left text-sm ${mcuAnswers[q.id] ? "bg-red-50 border-red-300 text-red-800" : "bg-white border-slate-200 text-slate-700"}`}>
              {mcuAnswers[q.id] ? <CheckCircle2 className="w-4 h-4 text-red-600 flex-shrink-0" /> : <Circle className="w-4 h-4 text-slate-300 flex-shrink-0" />}
              {q.label}
            </button>
          ))}
          <p className="text-xs font-semibold text-slate-700">Creatinine nadir (lowest value post-ablation):</p>
          <div className="grid grid-cols-3 gap-2">
            {["<1 mg/dL (Good)", "1–1.5 mg/dL", ">1.5 mg/dL (Poor)"].map((v) => (
              <button key={v} onClick={() => setNadir(v)}
                className={`p-2 rounded-xl border-2 text-xs font-medium transition-all ${nadir === v ? "border-red-400 bg-red-50 text-red-800" : "border-slate-200 bg-white text-slate-700"}`}>
                {v}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep(1)} className="flex-1"><ArrowLeft className="w-4 h-4 mr-1" />Back</Button>
            <Button className="flex-1 bg-red-600 hover:bg-red-700" onClick={() => setStep(3)}>ESKD Risk <ChevronRight className="w-4 h-4 ml-1" /></Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-3">
          <div className={`rounded-xl p-4 text-center ${RISK_COLORS[risk]}`}>
            <p className="text-base font-bold">ESKD Risk: {risk}</p>
          </div>
          {[
            { title: "Immediate Management", color: "bg-red-50 border-red-200", items: ["Bladder catheterisation (8Fr feeding tube) urgently if PUV suspected", "Treat AKI: IV fluids cautiously, monitor UO, correct electrolytes", "Ablation of valves (transurethral cystoscopy) — gold standard once stabilised", "Treat UTI: Gentamicin empirically in septic infant"] },
            { title: "Long-term CKD Risk Factors", color: "bg-amber-50 border-amber-200", items: ["Creatinine nadir >1 mg/dL → 50% ESKD by 30 years", "Proteinuria at 2 years → poor predictor of renal survival", "Bladder dysfunction: KEY driver of ongoing renal injury — urodynamics essential", "Bilateral VUR post-ablation → DMSA for scarring"] },
            { title: "Bladder Dysfunction Management", color: "bg-blue-50 border-blue-200", items: ["Valve bladder syndrome: Overactivity → underactivity (myogenic failure)", "CIC if elevated PVR or underactive detrusor", "Anticholinergics if overactivity confirmed on UDS", "Annual urodynamics until stable"] },
            { title: "Monitoring Protocol", color: "bg-green-50 border-green-200", items: ["eGFR every 3 months for 2 years, then every 6 months", "UPCR annually", "USG kidneys + bladder every 6 months", "Annual DMSA for scarring", "Dialysis/transplant planning when eGFR <20"] },
          ].map((s, i) => (
            <div key={i} className={`rounded-xl border-2 p-3 ${s.color}`}>
              <p className="text-xs font-bold text-slate-800 mb-2">{s.title}</p>
              {s.items.map((item, j) => <div key={j} className="flex items-start gap-1.5 text-xs text-slate-700 mb-1"><ChevronRight className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-red-500" />{item}</div>)}
            </div>
          ))}
          <Button className="w-full bg-red-600 hover:bg-red-700" onClick={() => { setStep(0); setPreAnswers({}); setPostAnswers({}); setMCUAnswers({}); setNadir(""); }}>New Case</Button>
        </div>
      )}
    </div>
  );
}