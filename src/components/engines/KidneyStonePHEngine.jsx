import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, ChevronRight, ArrowLeft } from "lucide-react";

const STONE_FEATURES = [
  { id: "ca_oxalate", label: "Calcium oxalate stone (CT / analysis)", category: "stone_type" },
  { id: "ca_phosphate", label: "Calcium phosphate / apatite stone", category: "stone_type" },
  { id: "uric_acid", label: "Uric acid stone (radiolucent on X-ray)", category: "stone_type" },
  { id: "cystine", label: "Cystine stone (hexagonal crystals on urine)", category: "stone_type" },
  { id: "struvite", label: "Struvite / infection stone (staghorn)", category: "stone_type" },
  { id: "hypercalciuria", label: "Hypercalciuria (24h urine Ca >4 mg/kg/day)", category: "metabolic" },
  { id: "hyperoxaluria", label: "Hyperoxaluria (24h urine oxalate >0.5 mmol/1.73m²)", category: "metabolic" },
  { id: "hypocitraturia", label: "Hypocitraturia (low urine citrate)", category: "metabolic" },
  { id: "hyperuricosuria", label: "Hyperuricosuria", category: "metabolic" },
  { id: "low_urine_vol", label: "Low urine volume / oliguria", category: "metabolic" },
  { id: "nephrocalcinosis", label: "Nephrocalcinosis on USS", category: "imaging" },
  { id: "recurrent_stone", label: "Recurrent / bilateral stones", category: "imaging" },
  { id: "family_stone", label: "Family history of stones", category: "family" },
  { id: "rta_features", label: "RTA features (acidosis, hypokalaemia, urine pH >5.5)", category: "associated" },
  { id: "fanconi", label: "Fanconi syndrome features (glucosuria, aminoaciduria)", category: "associated" },
  { id: "early_renal_failure", label: "Progressive CKD / early renal failure", category: "associated" },
];

function getDiagnosis(ans) {
  if (ans.hyperoxaluria && ans.nephrocalcinosis && (ans.early_renal_failure || ans.recurrent_stone)) {
    return { dx: "Primary Hyperoxaluria (PH1/PH2/PH3)", gene: "AGXT (PH1), GRHPR (PH2), HOGA1 (PH3) — PH1 most severe", color: "bg-red-700", treatment: "Lumasiran (RNAi) for PH1. Pyridoxine trial (PH1 B6-responsive). Pre-emptive combined liver-kidney transplant for ESRD. Intensive hydration + crystallisation inhibitors." };
  }
  if (ans.cystine || (ans.recurrent_stone && ans.family_stone)) {
    return { dx: "Cystinuria (SLC3A1/SLC7A9)", gene: "SLC3A1, SLC7A9 — autosomal recessive cystinuria", color: "bg-amber-700", treatment: "Fluid ≥3L/m²/day, urinary alkalinisation (pH>7.0), D-penicillamine or tiopronin if persistent, ESWL / URS for stones" };
  }
  if (ans.fanconi || (ans.ca_phosphate && ans.rta_features)) {
    return { dx: "Dent Disease / APRT Deficiency / Fanconi", gene: "CLCN5 or OCRL (Dent); APRT; check cystinosis (CTNS)", color: "bg-orange-700", treatment: "Treat underlying cause. Thiazide for Dent. Monitor CKD progression." };
  }
  if (ans.rta_features && ans.nephrocalcinosis && ans.ca_phosphate) {
    return { dx: "Distal RTA (dRTA) with Nephrocalcinosis", gene: "ATP6V1B1, ATP6V0A4 — recessive dRTA with hearing loss; SLC4A1", color: "bg-orange-600", treatment: "Potassium citrate (1–3 mEq/kg/day), thiazide, hydration. Treat HTN and CKD." };
  }
  if (ans.hypercalciuria && ans.ca_oxalate) {
    return { dx: "Idiopathic Hypercalciuria / Calcium Oxalate Nephrolithiasis", gene: "Consider CaSR, VDR variants if severe familial. Panel if recurrent.", color: "bg-blue-600", treatment: "Fluid >2L/1.73m²/day, low Na/protein diet, thiazide (HCTZ 1–2 mg/kg/day), potassium citrate for hypocitraturia" };
  }
  if (ans.uric_acid) {
    return { dx: "Uric Acid Urolithiasis", gene: "Consider Lesch-Nyhan (HPRT1) if severe/early onset", color: "bg-slate-600", treatment: "Alkalinisation (urine pH >6.5), allopurinol, hydration, low purine diet" };
  }
  return { dx: "Metabolic stone disease — complete 24h urine workup required", gene: "Stone gene panel if: bilateral, recurrent, early onset, nephrocalcinosis", color: "bg-slate-500", treatment: "Hydration target urine volume >2L/1.73m²/day; 24h urine: Ca, oxalate, citrate, urate, cystine, Mg, PO4, creatinine, volume" };
}

export default function KidneyStonePHEngine() {
  const [mode, setMode] = useState(""); // "stone" | "ph"
  const [answers, setAnswers] = useState({});
  const [showResult, setShowResult] = useState(false);

  const toggleAns = (id) => setAnswers(prev => ({ ...prev, [id]: !prev[id] }));
  const result = getDiagnosis(answers);
  const reset = () => { setMode(""); setAnswers({}); setShowResult(false); };

  if (!mode) return (
    <div className="space-y-4">
      <div className="rounded-xl bg-gradient-to-r from-yellow-700 to-amber-700 p-4 text-white">
        <h3 className="font-bold text-sm">Kidney Stone & Primary Hyperoxaluria Engines</h3>
        <p className="text-xs text-yellow-200">Comprehensive metabolic stone workup · Pediatric special diagnoses</p>
      </div>
      <div className="grid grid-cols-1 gap-3">
        <button onClick={() => setMode("stone")} className="bg-gradient-to-r from-amber-600 to-yellow-600 text-white rounded-xl px-4 py-4 text-left shadow">
          <p className="font-bold text-sm">Comprehensive Kidney Stone Engine</p>
          <p className="text-xs text-amber-100 mt-0.5">Stone type → Urine chemistry → Metabolic eval → Genetics → Treatment</p>
        </button>
        <button onClick={() => { setMode("stone"); setAnswers({ hyperoxaluria: true, nephrocalcinosis: true }); }} className="bg-gradient-to-r from-red-700 to-rose-700 text-white rounded-xl px-4 py-4 text-left shadow">
          <p className="font-bold text-sm">Primary Hyperoxaluria Engine (PH1/PH2/PH3)</p>
          <p className="text-xs text-red-100 mt-0.5">Pre-selected for hyperoxaluria pathway</p>
        </button>
      </div>
    </div>
  );

  if (showResult) {
    const posFeatures = STONE_FEATURES.filter(f => answers[f.id]);
    return (
      <div className="space-y-4">
        <div className="rounded-xl bg-gradient-to-r from-amber-700 to-yellow-700 p-4 text-white">
          <h3 className="font-bold text-sm">Kidney Stone Engine — Results</h3>
        </div>
        <Card className={`text-white border-0`} style={{ background: result.color.replace("bg-", "#") }}>
          <CardContent className="p-4">
            <p className="text-xs font-bold opacity-80 mb-1">Most Likely Diagnosis</p>
            <p className="text-lg font-black">{result.dx}</p>
          </CardContent>
        </Card>

        {/* Pathway */}
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <p className="font-bold text-sm mb-2">Pathway Followed</p>
            <div className="space-y-1 text-xs text-slate-700">
              {posFeatures.map((f, i) => <div key={i} className="flex gap-2"><span className="text-amber-500">→</span>{f.label}</div>)}
              <div className="flex gap-2 font-bold text-amber-800"><span>→</span>{result.dx}</div>
            </div>
          </CardContent>
        </Card>

        {/* Investigations */}
        <Card className="border-blue-200">
          <CardContent className="p-4">
            <p className="font-bold text-sm text-blue-900 mb-2">Investigations</p>
            <div className="space-y-2">
              {[
                { label: "Must Order", items: ["24h urine: Ca, oxalate, citrate, urate, cystine, volume, creatinine", "Spot urine Ca:Cr, oxalate:Cr (children <5y)", "Serum: Ca, PO4, uric acid, CO2/HCO3, cystatin C/creatinine", "Stone analysis (if retrieved)"], color: "bg-red-50 border-red-200" },
                { label: "Should Order", items: ["Renal USS (nephrocalcinosis? stone burden?)", "Plain KUB X-ray (radiopaque vs radiolucent)", "Urine pH, amino acids, glucose (Fanconi screen)", "PTH if hypercalcaemia"], color: "bg-amber-50 border-amber-200" },
                { label: "Advanced / Genetics", items: [result.gene, "Urine cystine (cyanide-nitroprusside test)", "Plasma oxalate (PH1 specific)", "AGXT mutation before liver transplant (PH1)", "Liver biopsy AGT enzyme (PH1 definitive)"], color: "bg-blue-50 border-blue-200" },
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
            <p className="font-bold text-sm text-green-900 mb-2">Treatment Plan</p>
            <p className="text-xs text-slate-700">{result.treatment}</p>
            <div className="mt-3 space-y-1.5 text-xs text-slate-700">
              <div className="bg-white rounded p-2 border border-green-100 font-bold text-blue-800">Universal: Fluid target — urine volume ≥2L/1.73m²/day. Dilute urine is the strongest prevention.</div>
              <div className="bg-white rounded p-2 border border-green-100">Low sodium diet (reduces urinary Ca)</div>
              <div className="bg-white rounded p-2 border border-green-100">Normal calcium diet (low Ca diet increases oxalate absorption)</div>
            </div>
          </CardContent>
        </Card>

        {/* Follow-up */}
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <p className="font-bold text-sm mb-2">Follow-Up Plan</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[{ t: "3-monthly", c: ["Urine culture", "Spot oxalate:Cr", "Symptom review"] },
                { t: "6-monthly", c: ["Renal USS", "24h urine metabolics", "BP + eGFR"] },
                { t: "Annual", c: ["Stone recurrence USS", "Dietary review", "Growth monitoring"] }].map((f, i) => (
                <div key={i} className="bg-slate-50 rounded-lg p-2 border border-slate-200">
                  <p className="font-bold text-slate-700 mb-1">{f.t}</p>
                  {f.c.map((c, j) => <div key={j} className="text-slate-600">· {c}</div>)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Button onClick={reset} variant="outline" size="sm" className="w-full"><ArrowLeft className="w-4 h-4 mr-2" /> Start Again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-gradient-to-r from-amber-700 to-yellow-700 p-4 text-white">
        <h3 className="font-bold text-sm">Comprehensive Kidney Stone Engine</h3>
        <p className="text-xs text-amber-200">Select all applicable features</p>
      </div>
      {["stone_type", "metabolic", "imaging", "associated", "family"].map(cat => {
        const qs = STONE_FEATURES.filter(f => f.category === cat);
        const labels = { stone_type: "Stone Type", metabolic: "Metabolic Features", imaging: "Imaging Findings", associated: "Associated Features", family: "Family History" };
        return (
          <Card key={cat}>
            <CardContent className="p-4 space-y-2">
              <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">{labels[cat]}</p>
              {qs.map(q => (
                <button key={q.id} onClick={() => toggleAns(q.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl border-2 text-left transition-all ${answers[q.id] ? "border-amber-400 bg-amber-50" : "border-slate-200 hover:border-slate-300"}`}>
                  {answers[q.id] ? <CheckCircle2 className="w-4 h-4 text-amber-600 flex-shrink-0" /> : <Circle className="w-4 h-4 text-slate-300 flex-shrink-0" />}
                  <span className="text-xs text-slate-700">{q.label}</span>
                </button>
              ))}
            </CardContent>
          </Card>
        );
      })}
      <div className="flex gap-2">
        <Button variant="outline" size="sm" className="flex-1" onClick={reset}><ArrowLeft className="w-4 h-4 mr-1" /> Back</Button>
        <Button size="sm" className="flex-1 bg-amber-600 hover:bg-amber-700" onClick={() => setShowResult(true)}>Analyse Stone Profile <ChevronRight className="w-4 h-4 ml-1" /></Button>
      </div>
    </div>
  );
}