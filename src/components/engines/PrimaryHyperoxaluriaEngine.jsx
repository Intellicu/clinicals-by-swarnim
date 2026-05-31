import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, ChevronRight, ArrowLeft, TestTube, AlertCircle } from "lucide-react";

const ENTRY_FEATURES = [
  { id: "stone_recurrent", label: "Recurrent calcium oxalate kidney stones (childhood onset)" },
  { id: "nephrocalcinosis", label: "Nephrocalcinosis on USG / plain X-ray" },
  { id: "ckd_unexplained", label: "CKD of unknown etiology with oxalate crystals" },
  { id: "urine_oxalate_high", label: "Urine oxalate >0.5 mmol/1.73m²/day" },
  { id: "family_hx_ph", label: "Family history of PH / early ESKD / stone disease" },
  { id: "oxalosis", label: "Oxalate crystals in multiple organs (oxalosis)" },
];

const PH_TYPES = [
  { type: "PH1", gene: "AGXT (2q37)", enzyme: "Alanine-Glyoxylate Aminotransferase (AGT)", features: "Most severe; >70% of PH; early ESKD; systemic oxalosis; pyridoxine-responsive in 30%", treatment: "Lumasiran (RNAi) — reduces hepatic oxalate production; Pyridoxine trial 5 mg/kg/day × 3 months; Liver-kidney transplant for ESKD", indianAccess: "Lumasiran: compassionate access via Alnylam / ERKNet-affiliated centres" },
  { type: "PH2", gene: "GRHPR (9p13)", enzyme: "Glyoxylate Reductase/Hydroxypyruvate Reductase", features: "Milder than PH1; ESKD rare but possible; urinary L-glycerate elevated", treatment: "Hydration, dietary oxalate restriction; No specific agent approved; Lumasiran trials ongoing", indianAccess: "No approved therapy yet; clinical trials" },
  { type: "PH3", gene: "HOGA1 (10q24)", enzyme: "4-Hydroxy-2-Oxoglutarate Aldolase", features: "Mildest form; usually resolves by adolescence; rarely causes ESKD", treatment: "Hydration + citrate supplements (potassium citrate); Dietary modifications", indianAccess: "Oral medications available" },
];

export default function PrimaryHyperoxaluriaEngine() {
  const [step, setStep] = useState(0);
  const [features, setFeatures] = useState({});
  const [phType, setPHType] = useState("");

  const toggle = (id) => setFeatures(f => ({ ...f, [id]: !f[id] }));
  const featureCount = Object.values(features).filter(Boolean).length;

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-gradient-to-r from-amber-700 to-orange-600 p-4 text-white">
        <div className="flex items-center gap-2 mb-1">
          <TestTube className="w-5 h-5" />
          <h3 className="text-sm font-bold">Primary Hyperoxaluria Engine</h3>
          <Badge className="bg-white/20 text-white text-xs border-white/30">PH1 · PH2 · PH3 + Lumasiran</Badge>
        </div>
        <p className="text-xs text-amber-100">Stone → Urine oxalate → Genetics → Treatment pathway</p>
      </div>

      {step === 0 && (
        <div className="space-y-3">
          <Alert className="bg-amber-50 border-amber-200"><AlertCircle className="w-4 h-4 text-amber-600" /><AlertDescription className="text-amber-800 text-xs">PH1 (AGXT): Most severe — must diagnose EARLY before ESKD. Lumasiran (siRNA) is now approved for PH1.</AlertDescription></Alert>
          <p className="text-sm font-semibold text-slate-700">Select ALL features present:</p>
          {ENTRY_FEATURES.map(q => (
            <button key={q.id} onClick={() => toggle(q.id)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg border transition-all text-left text-sm ${features[q.id] ? "bg-amber-50 border-amber-300 text-amber-800" : "bg-white border-slate-200 text-slate-700"}`}>
              {features[q.id] ? <CheckCircle2 className="w-4 h-4 text-amber-600 flex-shrink-0" /> : <Circle className="w-4 h-4 text-slate-300 flex-shrink-0" />}
              {q.label}
            </button>
          ))}
          {featureCount >= 2 && (
            <div className="rounded-xl bg-amber-100 border border-amber-300 p-2 text-xs font-semibold text-amber-900 text-center">
              {featureCount >= 3 ? "High suspicion for PH — proceed to genetic testing" : "Moderate suspicion — complete workup recommended"}
            </div>
          )}
          <Button className="w-full bg-amber-600 hover:bg-amber-700" onClick={() => setStep(1)}>Investigation Algorithm <ChevronRight className="w-4 h-4 ml-1" /></Button>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-3">
          <p className="text-sm font-semibold text-slate-800">Diagnostic Workup:</p>
          {[
            { title: "Must Order", color: "bg-red-50 border-red-200", items: ["24h urine: Oxalate (>0.5 mmol/1.73m²/day), citrate, glycolate, L-glycerate, cystine, urate", "Spot urine oxalate:creatinine ratio (>0.08 = elevated in children)", "eGFR (Schwartz), serum oxalate if eGFR <30", "Renal USG: Bilateral nephrocalcinosis + stones"] },
            { title: "Should Order", color: "bg-amber-50 border-amber-200", items: ["Stone analysis: Calcium oxalate monohydrate (whewellite) → PH1 typical", "Liver biopsy (if uncertain) — AGT staining for PH1", "Echo/ECG if ESKD: Cardiac oxalosis (conduction defects)", "Ophthalmology: Retinal oxalate deposits"] },
            { title: "Genetics (Definitive)", color: "bg-violet-50 border-violet-200", items: ["AGXT sequencing (PH1) — most urgent, most severe", "GRHPR (PH2) if PH1 negative", "HOGA1 (PH3) if both negative", "Prenatal diagnosis available for PH1 families"] },
          ].map((s, i) => (
            <div key={i} className={`rounded-xl border-2 p-3 ${s.color}`}>
              <p className="text-xs font-bold text-slate-800 mb-2">{s.title}</p>
              {s.items.map((item, j) => <div key={j} className="flex items-start gap-1.5 text-xs text-slate-700 mb-1"><ChevronRight className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-amber-500" />{item}</div>)}
            </div>
          ))}
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep(0)} className="flex-1"><ArrowLeft className="w-4 h-4 mr-1" />Back</Button>
            <Button className="flex-1 bg-amber-600 hover:bg-amber-700" onClick={() => setStep(2)}>Treatment by PH Type <ChevronRight className="w-4 h-4 ml-1" /></Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-3">
          <p className="text-sm font-semibold text-slate-700">Select PH type (from genetics):</p>
          <div className="grid grid-cols-3 gap-2">
            {PH_TYPES.map(p => (
              <button key={p.type} onClick={() => setPHType(p.type)}
                className={`p-3 rounded-xl border-2 text-sm font-bold transition-all ${phType === p.type ? "border-amber-500 bg-amber-50 text-amber-800" : "border-slate-200 bg-white text-slate-700"}`}>
                {p.type}
              </button>
            ))}
          </div>
          {phType && (() => {
            const ph = PH_TYPES.find(p => p.type === phType);
            return (
              <div className="space-y-2">
                <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-900">
                  <p className="font-bold">{ph.type}: {ph.gene}</p>
                  <p className="text-amber-700">Enzyme: {ph.enzyme}</p>
                  <p className="mt-1">{ph.features}</p>
                </div>
                <div className="rounded-xl bg-green-50 border border-green-200 p-3 text-xs text-green-900">
                  <p className="font-bold mb-1">Treatment</p><p>{ph.treatment}</p>
                </div>
                {ph.type === "PH1" && (
                  <div className="rounded-xl bg-blue-50 border border-blue-200 p-3 space-y-1 text-xs text-blue-900">
                    <p className="font-bold">General Measures (ALL PH types):</p>
                    {["High fluid intake: >3 L/1.73m²/day (urine dilution)", "Pyridoxine (PH1 only): 5–20 mg/kg/day × 3 months — 30% responsive (c.508G>A variant)", "Potassium citrate: Alkalinize urine (pH 6.5–7)", "Neutral phosphate: Reduces urinary calcium oxalate saturation", "Dietary: Moderate oxalate restriction (no rhubarb, spinach, nuts)"].map((m, j) => (
                      <div key={j} className="flex items-start gap-1.5"><ChevronRight className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-blue-500" />{m}</div>
                    ))}
                  </div>
                )}
              </div>
            );
          })()}
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep(1)} className="flex-1"><ArrowLeft className="w-4 h-4 mr-1" />Back</Button>
            <Button className="flex-1 bg-amber-600 hover:bg-amber-700" onClick={() => { setStep(0); setFeatures({}); setPHType(""); }}>New Case</Button>
          </div>
        </div>
      )}
    </div>
  );
}