import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, ChevronRight, AlertCircle, Droplet } from "lucide-react";

const FEATURES = [
  { id: "polyuria", label: "Polyuria / polydipsia (from infancy)" },
  { id: "ftt", label: "Failure to thrive / growth failure" },
  { id: "fanconi", label: "Fanconi syndrome (glucosuria, aminoaciduria, phosphaturia, bicarbonaturia)" },
  { id: "rickets", label: "Rickets / hypophosphatemia" },
  { id: "corneal_crystals", label: "Corneal crystals on slit-lamp (cystine deposits)" },
  { id: "photophobia", label: "Photophobia" },
  { id: "hypothyroidism", label: "Hypothyroidism" },
  { id: "muscle_weakness", label: "Muscle weakness / myopathy (late)" },
];

export default function CystinosisEngine() {
  const [features, setFeatures] = useState({});
  const [stage, setStage] = useState(0);

  const toggle = (id) => setFeatures(f => ({ ...f, [id]: !f[id] }));
  const count = Object.values(features).filter(Boolean).length;

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-gradient-to-r from-blue-700 to-indigo-700 p-4 text-white">
        <div className="flex items-center gap-2 mb-1">
          <Droplet className="w-5 h-5" />
          <h3 className="text-sm font-bold">Cystinosis Intelligence Engine</h3>
          <Badge className="bg-white/20 text-white text-xs border-white/30">CTNS gene · Cysteamine</Badge>
        </div>
        <p className="text-xs text-blue-100">Polyuria → Fanconi → Corneal crystals → Diagnosis → Cysteamine therapy</p>
      </div>

      {stage === 0 && (
        <div className="space-y-3">
          <Alert className="bg-blue-50 border-blue-200"><AlertCircle className="w-4 h-4 text-blue-600" /><AlertDescription className="text-blue-800 text-xs">Cystinosis: Most common cause of Fanconi syndrome in children. Presentation typically age 6–12 months with polyuria + failure to thrive. Lysosomal cystine accumulation → multisystem damage.</AlertDescription></Alert>
          <p className="text-sm font-semibold text-slate-700">Select ALL features present:</p>
          {FEATURES.map(q => (
            <button key={q.id} onClick={() => toggle(q.id)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg border transition-all text-left text-sm ${features[q.id] ? "bg-blue-50 border-blue-300 text-blue-800" : "bg-white border-slate-200 text-slate-700"}`}>
              {features[q.id] ? <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" /> : <Circle className="w-4 h-4 text-slate-300 flex-shrink-0" />}
              {q.label}
            </button>
          ))}
          <Button className="w-full bg-blue-600 hover:bg-blue-700" disabled={count < 1} onClick={() => setStage(1)}>Diagnostic Pathway <ChevronRight className="w-4 h-4 ml-1" /></Button>
        </div>
      )}

      {stage === 1 && (
        <div className="space-y-3">
          {[
            { title: "Confirmatory Tests", color: "bg-red-50 border-red-200", items: [
              "Leukocyte cystine level: >2.0 nmol ½ cystine/mg protein = diagnostic (normal <0.2)",
              "CTNS gene sequencing (57-kb deletion in European patients — most common)",
              "Slit-lamp: Corneal crystals (pathognomonic, present >18 months)",
              "Urinary phosphate reabsorption (TRP): Low (<85%) in Fanconi syndrome",
            ]},
            { title: "Fanconi Syndrome Workup", color: "bg-amber-50 border-amber-200", items: [
              "Glucosuria with normal blood glucose",
              "Aminoaciduria (generalized)",
              "Low urine pH with alkaline urine (bicarbonaturia)",
              "Hypophosphatemia + low tubular phosphate reabsorption",
              "Low potassium, low urate",
              "Serum: eGFR, Ca, PO4, K, HCO3, alkaline phosphatase",
            ]},
            { title: "Cysteamine (Cystagon) Therapy", color: "bg-green-50 border-green-200", items: [
              "Oral cysteamine bitartrate (Cystagon): Start at 1/4 dose, titrate to 1.3 g/m²/day ÷ 4 doses",
              "Target leukocyte cystine <1.0 nmol ½ cystine/mg protein (check every 3–6 months)",
              "Cysteamine eye drops: Phosphocysteamine 0.5% hourly for corneal crystals",
              "MUST start before significant renal damage — delays ESKD by 10–15 years",
              "India access: Cysteamine available via compassionate use (Mylan/Recordati); contact ERKNet",
            ]},
            { title: "Supportive Management", color: "bg-blue-50 border-blue-200", items: [
              "Phosphate supplementation: Potassium/sodium phosphate oral (Fanconi-related hypophosphatemia)",
              "Vitamin D (calcitriol): Active vitamin D for rickets",
              "Bicarbonate/citrate: For metabolic acidosis from Fanconi",
              "Indomethacin: Reduces polyuria (COX inhibitor mechanism)",
              "Growth hormone: If growth failure despite treatment",
              "Thyroid: Monitor TFTs annually; thyroxine if hypothyroid",
            ]},
            { title: "Multisystem Monitoring Protocol", color: "bg-violet-50 border-violet-200", items: [
              "eGFR every 3 months; Leukocyte cystine every 3–6 months",
              "Annual: Slit-lamp (corneal), swallowing assessment (swallowing myopathy in teens)",
              "Annual: TFTs, brain MRI (cerebral atrophy/calcification in adulthood)",
              "Transplant: DOES NOT cure cystinosis — continue cysteamine post-transplant for extrarenal disease",
            ]},
          ].map((s, i) => (
            <div key={i} className={`rounded-xl border-2 p-3 ${s.color}`}>
              <p className="text-xs font-bold text-slate-800 mb-2">{s.title}</p>
              {s.items.map((item, j) => <div key={j} className="flex items-start gap-1.5 text-xs text-slate-700 mb-1"><ChevronRight className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-blue-500" />{item}</div>)}
            </div>
          ))}
          <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={() => { setStage(0); setFeatures({}); }}>New Case</Button>
        </div>
      )}
    </div>
  );
}