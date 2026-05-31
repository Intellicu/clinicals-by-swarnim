import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, ChevronRight, ArrowLeft, TestTube, Beaker, AlertCircle } from "lucide-react";

const SUB_MODULES = [
  { id: "fanconi", label: "Fanconi Syndrome Approach", desc: "Glucosuria + aminoaciduria + phosphaturia + bicarbonaturia", icon: "🔬" },
  { id: "hypophos_rickets", label: "Hypophosphatemic Rickets", desc: "XLH, ADHR, ARHR — FGF23-mediated phosphate wasting", icon: "🦴" },
  { id: "nephrogenic_di", label: "Nephrogenic SIADH / NDI", desc: "Urine concentration defects — water balance disorders", icon: "💧" },
];

const FANCONI_CAUSES = [
  "Cystinosis (most common in children — CTNS gene)",
  "Galactosemia",
  "Tyrosinemia type 1",
  "Wilson disease (hepatic copper → proximal tubule damage)",
  "Lowe syndrome (OCRL1 — oculocerebrorenal syndrome)",
  "Dent disease (CLCN5 — low molecular weight proteinuria)",
  "Mitochondrial cytopathies",
  "Iatrogenic: Tenofovir, cisplatin, valproate",
  "Multiple myeloma (adults)",
];

const FANCONI_WORKUP = [
  "Urine glucose (with normal blood glucose = glucosuria)",
  "Urine amino acids (qualitative — generalized aminoaciduria)",
  "Serum: PO4, Ca, K, HCO3, urate, glucose",
  "TRP = 1 − (urine PO4/serum PO4 × serum Cr/urine Cr) — Low <85% = phosphate wasting",
  "Urine pH: High/alkaline (bicarbonaturia)",
  "Urinalysis: Low molecular weight proteinuria (alpha-1 microglobulin, beta-2 microglobulin)",
  "Specific test for cystinosis: Leukocyte cystine level",
];

const HYPOPHOS_TYPES = [
  { name: "X-linked Hypophosphatemia (XLH)", gene: "PHEX (Xp22.1)", mechanism: "↑FGF23 → ↓Pi reabsorption + ↓1,25-VitD", treatment: "Burosumab (anti-FGF23 monoclonal Ab) — approved age ≥1y; or conventional: Pi supplements + calcitriol" },
  { name: "ADHR (Autosomal Dominant HR)", gene: "FGF23 gain-of-function", mechanism: "FGF23 not cleaved → persistent Pi wasting", treatment: "Pi supplements + calcitriol; Burosumab investigational" },
  { name: "Tumor-Induced Osteomalacia (TIO)", gene: "FGF23-secreting mesenchymal tumour", mechanism: "Acquired ↑FGF23", treatment: "Surgical excision of tumour; Burosumab bridge therapy" },
  { name: "ARHR type 1 (DMP1 mutation)", gene: "DMP1 (4q22)", mechanism: "↑FGF23 — mineralization defect", treatment: "Pi supplements + calcitriol + Burosumab (trials)" },
];

export default function TubularDisordersEngine() {
  const [selected, setSelected] = useState(null);
  const [features, setFeatures] = useState({});

  const toggle = (id) => setFeatures(f => ({ ...f, [id]: !f[id] }));

  if (!selected) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl bg-gradient-to-r from-amber-700 to-yellow-600 p-4 text-white">
          <div className="flex items-center gap-2 mb-1">
            <TestTube className="w-5 h-5" />
            <h3 className="text-sm font-bold">Tubular Disorders Engine</h3>
            <Badge className="bg-white/20 text-white text-xs border-white/30">Fanconi · XLH · NDI</Badge>
          </div>
          <p className="text-xs text-amber-100">Select a tubular disorder module</p>
        </div>
        <div className="grid gap-2">
          {SUB_MODULES.map(m => (
            <button key={m.id} onClick={() => setSelected(m.id)}
              className="flex items-start gap-3 p-4 rounded-xl border-2 border-slate-200 bg-white hover:border-amber-300 hover:bg-amber-50 transition-all text-left">
              <span className="text-2xl flex-shrink-0">{m.icon}</span>
              <div className="flex-1">
                <p className="text-sm font-bold text-slate-800">{m.label}</p>
                <p className="text-xs text-slate-500">{m.desc}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0 mt-1" />
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (selected === "fanconi") {
    return (
      <div className="space-y-4">
        <div className="rounded-xl bg-gradient-to-r from-amber-700 to-yellow-600 p-4 text-white">
          <div className="flex items-center gap-2"><TestTube className="w-5 h-5" /><h3 className="text-sm font-bold">Fanconi Syndrome Approach</h3></div>
        </div>
        {[
          { title: "Diagnosis — Must have ≥3 of these features", color: "bg-amber-50 border-amber-200", items: FANCONI_WORKUP.slice(0, 6) },
          { title: "Causes (work backwards from phenotype)", color: "bg-blue-50 border-blue-200", items: FANCONI_CAUSES },
          { title: "Management Principles", color: "bg-green-50 border-green-200", items: [
            "Treat underlying cause (cystinosis → cysteamine; Wilson → penicillamine; TFN → stop drug)",
            "Phosphate supplementation: Joulie's solution or slow-release phosphate tablets",
            "Calcitriol (active Vit D): For rickets / hypocalcaemia (adjust based on urine Ca)",
            "Potassium citrate / sodium bicarbonate: For metabolic acidosis",
            "Monitor: Regular eGFR, electrolytes, phosphate, alkaline phosphatase, X-ray wrists",
          ]},
        ].map((s, i) => (
          <div key={i} className={`rounded-xl border-2 p-3 ${s.color}`}>
            <p className="text-xs font-bold text-slate-800 mb-2">{s.title}</p>
            {s.items.map((item, j) => <div key={j} className="flex items-start gap-1.5 text-xs text-slate-700 mb-1"><ChevronRight className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-amber-500" />{item}</div>)}
          </div>
        ))}
        <Button variant="outline" onClick={() => setSelected(null)} className="w-full"><ArrowLeft className="w-4 h-4 mr-2" />Back to Tubular Modules</Button>
      </div>
    );
  }

  if (selected === "hypophos_rickets") {
    return (
      <div className="space-y-4">
        <div className="rounded-xl bg-gradient-to-r from-amber-700 to-yellow-600 p-4 text-white">
          <div className="flex items-center gap-2"><Beaker className="w-5 h-5" /><h3 className="text-sm font-bold">Hypophosphatemic Rickets</h3></div>
        </div>
        <Alert className="bg-amber-50 border-amber-200"><AlertCircle className="w-4 h-4 text-amber-600" /><AlertDescription className="text-amber-800 text-xs">Key: Distinguish Vitamin D deficiency rickets (low VitD → low Ca → ↑PTH → low PO4) from FGF23-mediated (normal Ca, normal VitD, ↑FGF23, normal PTH). Different treatment!</AlertDescription></Alert>
        {HYPOPHOS_TYPES.map((t, i) => (
          <div key={i} className="rounded-xl border border-slate-200 bg-white p-3">
            <p className="text-sm font-bold text-slate-800">{t.name}</p>
            <p className="text-xs text-violet-700 font-medium">Gene: {t.gene}</p>
            <p className="text-xs text-slate-600">Mechanism: {t.mechanism}</p>
            <p className="text-xs text-green-700 mt-1 font-medium">Treatment: {t.treatment}</p>
          </div>
        ))}
        <div className="rounded-xl bg-blue-50 border border-blue-200 p-3 space-y-1 text-xs text-blue-900">
          <p className="font-bold">Monitoring:</p>
          {["Serum: PO4, Ca, alkaline phosphatase (ALP), PTH, creatinine every 3 months", "Urine: TRP, Ca:Cr ratio (avoid hypercalciuria from treatment)", "X-ray wrists / knees: Rachitic changes — improve within 3 months of treatment", "FGF23 level: Elevated in XLH; helps titrate burosumab dose"].map((m, j) => (
            <div key={j} className="flex items-start gap-1.5"><ChevronRight className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-blue-500" />{m}</div>
          ))}
        </div>
        <Button variant="outline" onClick={() => setSelected(null)} className="w-full"><ArrowLeft className="w-4 h-4 mr-2" />Back to Tubular Modules</Button>
      </div>
    );
  }

  if (selected === "nephrogenic_di") {
    return (
      <div className="space-y-4">
        <div className="rounded-xl bg-gradient-to-r from-cyan-700 to-blue-600 p-4 text-white">
          <div className="flex items-center gap-2"><TestTube className="w-5 h-5" /><h3 className="text-sm font-bold">Nephrogenic Diabetes Insipidus (NDI)</h3></div>
        </div>
        {[
          { title: "Algorithm: Polyuria → NDI Diagnosis", color: "bg-cyan-50 border-cyan-200", items: [
            "Step 1: Urine osmolality (spot) — If <300 mOsm/kg = DI likely (vs psychogenic polydipsia: >300)",
            "Step 2: Water deprivation test — Urine still dilute (<300) after 4–6h = DI confirmed",
            "Step 3: DDAVP (desmopressin) 10 µg intranasal — Urine osm rises >50% = CENTRAL DI; <10% = NDI",
            "Step 4: Copeptin assay (AVP surrogate): Low stimulated copeptin = central DI",
          ]},
          { title: "NDI Genetics & Causes", color: "bg-blue-50 border-blue-200", items: [
            "X-linked NDI: AVPR2 (V2 receptor) — severe; affects males; carrier females may have mild symptoms",
            "Autosomal NDI: AQP2 (aquaporin-2 channel) — AR or AD; both sexes affected",
            "Acquired NDI: Hypercalcemia, hypokalemia, lithium, CKD, post-obstructive uropathy",
          ]},
          { title: "Treatment", color: "bg-green-50 border-green-200", items: [
            "Hydration: Free water access 24h; NG feeding in infants (prevent dehydration + hypernatremia)",
            "Low-solute diet: Low protein + low sodium → reduces osmolar load → reduces polyuria",
            "Hydrochlorothiazide (HCTZ): 1–2 mg/kg/day — paradoxical antidiuresis (volume depletion → ↑proximal reabsorption)",
            "Amiloride: 0.3 mg/kg/day — add to HCTZ (blocks ENaC; prevents hypokalemia + enhances effect)",
            "Indomethacin: 2 mg/kg/day — prostaglandin inhibition → reduces collecting duct insensitivity",
            "Triple therapy (HCTZ + amiloride + indomethacin): Most effective; reduces urine output by 50–70%",
          ]},
          { title: "Monitoring", color: "bg-amber-50 border-amber-200", items: [
            "Urine output × daily in infants; weight 2x daily for dehydration",
            "Serum Na, K, creatinine: Weekly during dose titration",
            "Head circumference + neurodevelopment: Hypernatremia → cognitive impairment if early",
            "Renal USS: Hydroureteronephrosis (massive polyuria → non-obstructive dilation)",
          ]},
        ].map((s, i) => (
          <div key={i} className={`rounded-xl border-2 p-3 ${s.color}`}>
            <p className="text-xs font-bold text-slate-800 mb-2">{s.title}</p>
            {s.items.map((item, j) => <div key={j} className="flex items-start gap-1.5 text-xs text-slate-700 mb-1"><ChevronRight className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-cyan-600" />{item}</div>)}
          </div>
        ))}
        <Button variant="outline" onClick={() => setSelected(null)} className="w-full"><ArrowLeft className="w-4 h-4 mr-2" />Back to Tubular Modules</Button>
      </div>
    );
  }

  return null;
}