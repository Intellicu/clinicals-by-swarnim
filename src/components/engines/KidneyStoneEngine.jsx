import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, ChevronRight, ArrowLeft, TestTube, Beaker, AlertCircle } from "lucide-react";

const STONE_TYPES = [
  { id: "ca_oxalate", label: "Calcium Oxalate (most common, 70–80%)", dx: "ca_oxalate" },
  { id: "ca_phosphate", label: "Calcium Phosphate (brushite / hydroxyapatite)", dx: "ca_phosphate" },
  { id: "uric_acid", label: "Uric Acid (radiolucent on plain X-ray)", dx: "uric_acid" },
  { id: "cystine", label: "Cystine (hexagonal crystals on urine microscopy)", dx: "cystine" },
  { id: "struvite", label: "Struvite / Magnesium ammonium phosphate (infection stones)", dx: "struvite" },
  { id: "unknown", label: "Unknown / Not yet analysed", dx: "unknown" },
];

const STONE_PROTOCOLS = {
  ca_oxalate: {
    title: "Calcium Oxalate Stone Protocol",
    color: "bg-amber-50 border-amber-300",
    causes: ["Hypercalciuria (most common)", "Hyperoxaluria (dietary/enteric/primary)", "Hypocitraturia", "Low urine volume"],
    workup: ["24h urine: Ca, oxalate, citrate, urate, volume, pH", "Serum: Ca, PTH, vitamin D, urate, creatinine", "Urine Ca:Cr ratio (spot)", "Exclude PH1 if urine oxalate very high: AGXT testing"],
    treatment: ["Hydration: >2 L/1.73m²/day (urine sp.gr <1.010)", "Low sodium diet (<2g/day NaCl reduces Ca excretion)", "Thiazide (hydrochlorothiazide) 1 mg/kg/day for hypercalciuria", "Potassium citrate 1–2 mEq/kg/day for hypocitraturia", "Avoid high-oxalate foods: spinach, rhubarb, nuts, chocolate", "DO NOT restrict dietary calcium (worsens oxaluria)"],
    genetics: "If recurrent / severe / childhood onset: AGXT (PH1), SLC26A1, CLDN16, CLDN19",
  },
  ca_phosphate: {
    title: "Calcium Phosphate Stone Protocol",
    color: "bg-blue-50 border-blue-300",
    causes: ["dRTA (urine pH persistently alkaline >6.0)", "Hyperparathyroidism", "Immobilization hypercalcaemia", "Renal tubular acidosis"],
    workup: ["Urine pH (first morning void) — >6.5 suggests dRTA", "UAG (urinary anion gap) — positive = dRTA", "Serum HCO3, K, Ca, PTH, vitamin D", "24h urine: Ca, citrate, oxalate, pH, volume"],
    treatment: ["Potassium citrate — alkalinizes urine → inhibits calcium phosphate crystallisation", "Treat underlying RTA with alkali supplements", "Avoid thiazides (worsen alkalinisation)", "Orthophosphate if absorptive hypercalciuria"],
    genetics: "dRTA genes: ATP6V1B1 (deafness), ATP6V0A4; Carbonic anhydrase II",
  },
  uric_acid: {
    title: "Uric Acid Stone Protocol",
    color: "bg-rose-50 border-rose-300",
    causes: ["Low urine pH (<5.5) — most important", "Hyperuricosuria", "Low urine volume", "Metabolic syndrome, Lesch-Nyhan, HPRT deficiency"],
    workup: ["Urine pH (pH <5.5 = risk factor)", "24h urine: Urate, volume, pH", "Serum: Urate, creatinine", "HPRT enzyme assay if male + severe gout + neurological symptoms (Lesch-Nyhan)"],
    treatment: ["Potassium citrate / sodium bicarbonate: Alkalinize urine to pH 6.5–7 → dissolves UA stones", "Increase fluid intake", "Allopurinol 5 mg/kg/day if hyperuricosuria", "Chemolysis: UA stones can dissolve with urine alkalinisation (unlike CaOx)"],
    genetics: "HPRT1 (Lesch-Nyhan), PRPS1, SLC2A9 (HUA), ABCG2",
  },
  cystine: {
    title: "Cystinuria Engine",
    color: "bg-violet-50 border-violet-300",
    causes: ["Cystinuria: SLC3A1 or SLC7A9 mutations", "Defective cystine reabsorption in proximal tubule", "Autosomal recessive (both sexes); Type AA, AB, BB"],
    workup: ["Spot urine cystine:creatinine ratio (>250 µmol/mmol = significant)", "24h urine cystine (>250 mg/day = stone-forming threshold)", "Urine microscopy: Hexagonal cystine crystals", "Urine cyanide-nitroprusside test (screening)", "SLC3A1 / SLC7A9 gene panel"],
    treatment: ["High fluid intake: >3 L/1.73m²/day (24h urine volume >3L)", "Alkalinize urine to pH 7.0–7.5: Potassium citrate 3–5 mEq/kg/day (cystine solubility increases above pH 7.0)", "Tiopronin (alpha-MPG): 15 mg/kg/day ÷ 3 doses — chelates cystine; first choice over D-penicillamine", "D-Penicillamine: 30 mg/kg/day — effective but more side effects", "Captopril: Mild effect — use if above not tolerated"],
    genetics: "SLC3A1 (2p21) — Type A; SLC7A9 (19q13) — Type B/AB",
  },
  struvite: {
    title: "Struvite / Infection Stone Protocol",
    color: "bg-green-50 border-green-300",
    causes: ["Urease-producing organisms: Proteus, Klebsiella, Pseudomonas, Staphylococcus", "Urinary tract infection + alkaline urine = stone growth", "Often associated with structural anomalies (neurogenic bladder, VUR, PUV)"],
    workup: ["Urine culture + sensitivity", "USG / CT: Staghorn calculi typical", "Urine pH: Persistently >7 = urease-producing organism", "Structural: Check for VUR, PUV, neurogenic bladder"],
    treatment: ["Treat infection: Culture-directed antibiotics × 6 weeks", "Acetohydroxamic acid (AHA) — urease inhibitor (rarely used in children)", "Surgical removal: PCNL or ESWL for large stones", "Long-term: Prevent UTI recurrence; treat structural anomaly"],
    genetics: "No primary genetic cause; secondary to structural/neurogenic conditions",
  },
  unknown: {
    title: "Unknown Stone — General Metabolic Workup",
    color: "bg-slate-50 border-slate-300",
    causes: ["Stone not analysed or mixed composition", "Radiolucent on plain film → uric acid / cystine"],
    workup: ["Send stone for compositional analysis (if recovered)", "24h urine: Ca, oxalate, citrate, urate, cystine, PO4, Na, volume, pH", "Serum: Ca, PO4, urate, HCO3, creatinine, PTH", "Urinalysis: pH, crystals (hexagonal = cystine; envelope/dumbbell = CaOx)"],
    treatment: ["High fluid intake as universal measure", "Await stone analysis before specific treatment", "Potassium citrate empirically if urine pH <5.5"],
    genetics: "AGXT (PH1), SLC3A1/SLC7A9 (cystinuria), CLDN16 (FHHNC), ATP6V1B1 (dRTA)",
  },
};

export default function KidneyStoneEngine() {
  const [step, setStep] = useState(0);
  const [stoneType, setStoneType] = useState("");

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-gradient-to-r from-yellow-700 to-amber-600 p-4 text-white">
        <div className="flex items-center gap-2 mb-1">
          <Beaker className="w-5 h-5" />
          <h3 className="text-sm font-bold">Kidney Stone Intelligence Engine</h3>
          <Badge className="bg-white/20 text-white text-xs border-white/30">Pediatric · Metabolic · Genetic</Badge>
        </div>
        <p className="text-xs text-amber-100">Stone type → Urine chemistry → Metabolic evaluation → Genetics → Treatment</p>
      </div>

      {step === 0 && (
        <div className="space-y-3">
          <Alert className="bg-amber-50 border-amber-200">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <AlertDescription className="text-amber-800 text-xs">
              ALWAYS send stone for analysis. Pediatric nephrolithiasis often has monogenic cause. Recurrence rate 50% in children without preventive therapy.
            </AlertDescription>
          </Alert>
          <p className="text-sm font-semibold text-slate-700">Stone type (from analysis or clinical context):</p>
          {STONE_TYPES.map(s => (
            <button key={s.id} onClick={() => setStoneType(s.dx)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg border transition-all text-left text-sm ${stoneType === s.dx ? "bg-amber-50 border-amber-400 text-amber-800" : "bg-white border-slate-200 text-slate-700"}`}>
              {stoneType === s.dx ? <CheckCircle2 className="w-4 h-4 text-amber-600 flex-shrink-0" /> : <Circle className="w-4 h-4 text-slate-300 flex-shrink-0" />}
              {s.label}
            </button>
          ))}
          <div className="rounded-xl bg-violet-50 border border-violet-200 p-3 text-xs text-violet-900">
            <p className="font-bold mb-1">Special Pediatric Diagnoses to Always Exclude:</p>
            {["Cystinuria (SLC3A1/SLC7A9) — recurrent stones from childhood", "Primary Hyperoxaluria (AGXT/GRHPR/HOGA1) — high oxalate", "APRT Deficiency (APRT gene) — 2,8-dihydroxyadenine stones (radiolucent)", "Dent Disease (CLCN5) — LMW proteinuria + hypercalciuria + stones", "dRTA (ATP6V1B1/ATP6V0A4) — alkaline urine + nephrocalcinosis"].map((i, j) => (
              <div key={j} className="flex items-start gap-1.5 mb-0.5"><ChevronRight className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-violet-500" />{i}</div>
            ))}
          </div>
          <Button className="w-full bg-amber-600 hover:bg-amber-700" disabled={!stoneType} onClick={() => setStep(1)}>View Protocol <ChevronRight className="w-4 h-4 ml-1" /></Button>
        </div>
      )}

      {step === 1 && stoneType && (() => {
        const p = STONE_PROTOCOLS[stoneType];
        return (
          <div className="space-y-3">
            <div className={`rounded-xl border-2 p-3 ${p.color}`}>
              <p className="text-sm font-bold text-slate-900">{p.title}</p>
            </div>
            {[
              { title: "Common Causes", items: p.causes, color: "bg-amber-50 border-amber-200" },
              { title: "Workup", items: p.workup, color: "bg-blue-50 border-blue-200" },
              { title: "Treatment", items: p.treatment, color: "bg-green-50 border-green-200" },
            ].map((s, i) => (
              <div key={i} className={`rounded-xl border-2 p-3 ${s.color}`}>
                <p className="text-xs font-bold text-slate-800 mb-2">{s.title}</p>
                {s.items.map((item, j) => <div key={j} className="flex items-start gap-1.5 text-xs text-slate-700 mb-1"><ChevronRight className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-amber-500" />{item}</div>)}
              </div>
            ))}
            <div className="rounded-xl bg-violet-50 border border-violet-200 p-3 text-xs text-violet-900">
              <p className="font-bold mb-1">Genetic Testing Triggers</p>
              <p>{p.genetics}</p>
            </div>
            <Button variant="outline" onClick={() => { setStep(0); setStoneType(""); }} className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" /> New Case
            </Button>
          </div>
        );
      })()}
    </div>
  );
}