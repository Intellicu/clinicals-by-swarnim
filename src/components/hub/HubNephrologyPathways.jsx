import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Stethoscope, ChevronDown, ChevronUp, ArrowRight, ExternalLink } from "lucide-react";

const PATHWAYS = [
  {
    name: "AKI — Acute Kidney Injury",
    tag: "Emergency",
    color: "bg-red-100 text-red-800",
    keys: ["KDIGO staging 1–3 by SCr/UO", "Identify prerenal vs intrinsic vs postrenal", "Fluid challenge, stop nephrotoxins", "RRT indications: AEIOU criteria"],
    scenario: "aki-prifle"
  },
  {
    name: "CKD Staging & Management",
    tag: "Chronic",
    color: "bg-blue-100 text-blue-800",
    keys: ["KDIGO G1–G5 + A1–A3 albuminuria", "Schwartz/CKiD GFR estimation", "ACEi/ARB nephroprotection", "CKD-MBD: calcium, phosphate, PTH"],
    scenario: "ckd-staging"
  },
  {
    name: "Nephrotic Syndrome",
    tag: "Nephrotic",
    color: "bg-purple-100 text-purple-800",
    keys: ["ISKDC protocol: prednisolone 60 mg/m²", "Relapse: >3+ dipstick × 3 days", "Frequent relapse: MMF/Levamisole", "SRNS: CNI/Rituximab, genetic testing"],
    scenario: "childhood-nephrotic"
  },
  {
    name: "Hypertension in CKD",
    tag: "Hypertension",
    color: "bg-orange-100 text-orange-800",
    keys: ["2017 AAP BP classification", "Target <50th percentile in CKD", "ACEi/ARB first-line", "Ambulatory BP monitoring (ABPM)"],
    scenario: "htn-diagnosis"
  },
  {
    name: "Proteinuria Workup",
    tag: "Diagnostic",
    color: "bg-teal-100 text-teal-800",
    keys: ["UPCR: >0.2 mg/mg abnormal", "Orthostatic vs persistent", "Nephrotic range >3.5 g/day", "Biopsy indications: persistent, symptomatic"],
    scenario: "proteinuria-approach"
  },
  {
    name: "Haematuria Pathway",
    tag: "Diagnostic",
    color: "bg-rose-100 text-rose-800",
    keys: ["Glomerular vs non-glomerular RBCs", "Dysmorphic RBCs/RBC casts = glomerular", "IgAN: episodic macrohaematuria", "ASO, ANA, ANCA, complement panel"],
    scenario: "hematuria-approach"
  },
  {
    name: "Electrolytes — Hyponatraemia",
    tag: "Electrolyte",
    color: "bg-cyan-100 text-cyan-800",
    keys: ["Serum osmolality first", "Urine Na, urine osmolality", "SIADH vs hypovolaemic vs hypervolaemic", "Correction rate: ≤10 mEq/L/24h"],
    scenario: "hyponatremia"
  },
  {
    name: "Electrolytes — Hyperkalaemia",
    tag: "Emergency",
    color: "bg-red-100 text-red-800",
    keys: ["K+ >6: immediate ECG", "IV calcium gluconate for cardiac protection", "Insulin+dextrose, Salbutamol nebulisation", "Kayexalate/Patiromer: K+ binding"],
    scenario: "hyperkalemia"
  },
  {
    name: "Metabolic Acidosis / RTA",
    tag: "Tubular",
    color: "bg-amber-100 text-amber-800",
    keys: ["Anion gap vs non-AG acidosis", "Urine anion gap for dRTA vs GI loss", "Type 1 dRTA: nephrocalcinosis, stones", "Type 2 pRTA: Fanconi syndrome"],
    scenario: "metabolic-acidosis"
  },
  {
    name: "Renal Stone Disease",
    tag: "Urological",
    color: "bg-yellow-100 text-yellow-800",
    keys: ["24h urine: Ca, oxalate, citrate, urate", "Hypercalciuria: thiazide diuretics", "Hyperoxaluria: B6, hydration", "Cystinuria: D-penicillamine/tiopronin"],
    scenario: "renal-stone"
  },
  {
    name: "Renal Transplant — Basics",
    tag: "Transplant",
    color: "bg-green-100 text-green-800",
    keys: ["Tacrolimus + MMF + prednisolone standard", "Acute rejection: pulse methylprednisolone", "BK nephropathy: reduce IS", "Annual monitoring: eGFR, proteinuria, DSA"],
    scenario: "kidney-transplant"
  },
  {
    name: "Peritoneal Dialysis",
    tag: "Dialysis",
    color: "bg-indigo-100 text-indigo-800",
    keys: ["CAPD vs APD", "Peritonitis: cloudy effluent, WBC>100", "Empirical: vancomycin + ceftazidime IP", "Adequacy: weekly Kt/V ≥1.7"],
    scenario: "peritoneal-dialysis"
  },
];

const TAGS = ["All", "Emergency", "Chronic", "Nephrotic", "Hypertension", "Diagnostic", "Electrolyte", "Tubular", "Urological", "Transplant", "Dialysis"];

export default function HubNephrologyPathways() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("All");
  const [open, setOpen] = useState(null);

  const filtered = filter === "All" ? PATHWAYS : PATHWAYS.filter(p => p.tag === filter);

  const goToPathway = (scenario) => {
    navigate(`/ClinicalSupport?tab=pathways&scenario=${scenario}`);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-gradient-to-r from-blue-800 to-indigo-700 p-5 text-white">
        <div className="flex items-center gap-3">
          <Stethoscope className="w-7 h-7" />
          <div>
            <h2 className="text-xl font-bold">Nephrology Clinical Pathways</h2>
            <p className="text-blue-100 text-sm">KDIGO · ISPN · IPNA · AAP · ISKDC evidence-based protocols</p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {TAGS.map(t => (
          <button key={t} onClick={() => setFilter(t)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${filter === t ? "bg-blue-700 text-white border-blue-700" : "bg-white text-slate-600 border-slate-200 hover:border-blue-300"}`}>
            {t}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.map((pathway, i) => (
          <Card key={i} className="border-slate-200 shadow-sm">
            <CardContent className="p-0">
              <button className="w-full flex items-center justify-between p-3 text-left" onClick={() => setOpen(open === i ? null : i)}>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-sm text-slate-800">{pathway.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${pathway.color}`}>{pathway.tag}</span>
                </div>
                {open === i ? <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />}
              </button>
              {open === i && (
                <div className="px-3 pb-3 border-t border-slate-100 pt-2 space-y-1">
                  {pathway.keys.map((k, j) => (
                    <div key={j} className="flex items-start gap-2">
                      <ArrowRight className="w-3 h-3 text-blue-500 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-slate-700">{k}</p>
                    </div>
                  ))}
                  <Button size="sm" variant="outline"
                    className="mt-2 text-xs border-blue-200 text-blue-700 hover:bg-blue-50"
                    onClick={() => goToPathway(pathway.scenario)}>
                    <ExternalLink className="w-3 h-3 mr-1" /> Full Pathway
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-slate-200 bg-slate-50">
        <CardContent className="p-3">
          <p className="text-xs font-bold text-slate-500 mb-1">References</p>
          <p className="text-xs text-slate-600">KDIGO 2021–2024 · ISPN Guidelines · IPNA Clinical Practice Recommendations · AAP 2017 BP · ISKDC Protocol · IAP Consensus</p>
        </CardContent>
      </Card>
    </div>
  );
}