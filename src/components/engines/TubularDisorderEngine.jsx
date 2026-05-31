import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight, ArrowLeft } from "lucide-react";

const SECTIONS = [
  { id: "fanconi", label: "Fanconi Syndrome Approach", color: "bg-teal-600" },
  { id: "hypophos_rickets", label: "Hypophosphatemic Rickets Approach", color: "bg-amber-600" },
  { id: "nephrogenic_siadh", label: "Nephrogenic SIADH / NDI Engine", color: "bg-blue-600" },
];

const CONTENT = {
  fanconi: {
    title: "Fanconi Syndrome Approach",
    sections: [
      { heading: "Definition & Recognition", items: ["Generalised proximal tubular dysfunction: glucosuria (normoglycaemia), aminoaciduria, phosphaturia, bicarbonaturia, uricosuria", "Clinical: polyuria, polydipsia, FTT, rickets, growth failure, muscle weakness", "Biochemistry: low serum PO4, HCO3, uric acid, K+; raised urine: glucose, amino acids, phosphate, bicarb"] },
      { heading: "Cause Algorithm", items: ["Cystinosis (most common in children): polyuria + FTT + corneal crystals → leukocyte cystine → CTNS sequencing", "Lowe syndrome (OCRL1): Fanconi + ocular (cataracts) + intellectual disability — X-linked males", "Dent disease (CLCN5): low-MW proteinuria + hypercalciuria + nephrocalcinosis — X-linked males", "Mitochondrial disease: multiorgan + lactic acidosis + Fanconi", "Galactosaemia, tyrosinaemia (type 1): Fanconi in neonates — FAH, GALT mutations", "Drug-induced: tenofovir, cisplatin, ifosfamide, heavy metals"] },
      { heading: "Investigations", items: ["Urine: glucose (Clinitest on fresh urine), amino acids (HPLC), phosphate TRP, FECa, uric acid", "Serum: Ca, PO4, uric acid, HCO3, K, Mg, albumin", "Leukocyte cystine (gold standard for cystinosis)", "Slit-lamp (cystine crystals)", "Genetic panel: CTNS, OCRL1, CLCN5, FAH, GALT, mitochondrial genes"] },
      { heading: "Treatment", items: ["Treat underlying cause first", "Phosphate supplementation: 1–3 g/day elemental PO4 in 4–6 divided doses", "Active vitamin D: calcitriol 0.025–0.05 μg/kg/day", "Potassium citrate for acidosis + hypokalaemia (1–3 mEq/kg/day)", "Free water: ad lib oral fluids or NG if polyuric infant", "Cystinosis: cysteamine bitartrate + eye drops (separate entry in metabolic engine)"] },
    ]
  },
  hypophos_rickets: {
    title: "Hypophosphatemic Rickets Approach",
    sections: [
      { heading: "Diagnosis & Classification", items: ["X-linked hypophosphataemia (XLH): PHEX mutation, most common, elevated FGF23", "Autosomal dominant (ADHR): FGF23 mutation, variable expression", "ARHR type 1 (DMP1), type 2 (ENPP1): autosomal recessive", "Tumour-induced osteomalacia (TIO): FGF23-secreting mesenchymal tumour", "Hereditary hypophosphataemic rickets with hypercalciuria (HHRH): SLC34A3, low FGF23"] },
      { heading: "Key Biochemistry Pattern", items: ["Low serum PO4 (renal PO4 wasting)", "TRP reduced (<85%) + TmP/GFR reduced", "Normal Ca, normal PTH", "Raised ALP, low/normal 25-OHD, low 1,25-OHD (in XLH)", "Elevated FGF23 (XLH, ADHR, ARHR) vs LOW FGF23 (HHRH)"] },
      { heading: "Investigations", items: ["TRP, TmP/GFR (phosphate reabsorption)", "FGF23 (intact or C-terminal)", "24h urine calcium (elevated in HHRH)", "X-rays: fraying, cupping, bowing, Looser zones", "PHEX sequencing (if XLH suspected), then FGF23, DMP1, ENPP1", "Renal USS (nephrocalcinosis)"] },
      { heading: "Treatment", items: ["XLH: Burosumab (anti-FGF23 antibody) 0.4 mg/kg SC q2w (age ≥1y) — first-line if available", "Conventional: neutral phosphate 40–60 mg/kg/day + calcitriol 20–30 ng/kg/day (risk: nephrocalcinosis)", "Monitor: PO4, ALP, renal USS (nephrocalcinosis), growth, PTH", "Orthopaedics: lower limb bracing, corrective osteotomy", "India access: burosumab via compassionate use; phosphate supplements widely available"] },
    ]
  },
  nephrogenic_siadh: {
    title: "Nephrogenic SIADH / NDI Engine",
    sections: [
      { heading: "Differentiating NDI vs SIADH vs Cerebral Salt Wasting", items: ["NDI (Nephrogenic Diabetes Insipidus): Polyuria + hypernatraemia + dilute urine. AVP resistance.", "Central DI: Polyuria + hypernatraemia + dilute urine. AVP deficiency. DDAVP responsive.", "SIADH: Hyponatraemia + concentrated urine (>100 mOsm/kg) + euvolaemia + urine Na >20", "Cerebral Salt Wasting (CSW): Hyponatraemia + concentrated urine + HYPOVOLAEMIA + urine Na >20 (in CNS disease)"] },
      { heading: "NDI Algorithm", items: ["Water deprivation test: urine Osm stays <300 after dehydration → DI confirmed", "DDAVP test: urine Osm increase <50% after DDAVP = Nephrogenic DI", "Genetics: AVPR2 (X-linked, males, severe) or AQP2 (AR, both sexes, milder)", "Serum Na often elevated; plasma AVP elevated", "Renal USS: dilated collecting system (chronic)", "NDI Treatment: Low-solute diet + HCTZ 1–2 mg/kg/day + amiloride 0.3 mg/kg/day + indomethacin 0.5–1 mg/kg/day"] },
      { heading: "SIADH Algorithm", items: ["Low serum Na (<135) + serum Osm <275 + urine Osm >100 + urine Na >20", "Euvolaemic: no oedema, no dehydration", "Causes: CNS (meningitis, SAH, tumour), pulmonary, drugs (carbamazepine, vincristine, cyclophosphamide), post-op", "Treatment: Fluid restriction (0.5–1L/day) for chronic. 3% NaCl ONLY if symptomatic (seizure/encephalopathy) — 2 mL/kg bolus. Max correction 10 mEq/L/24h.", "Nephrogenic SIADH (rare): AVPR2 gain-of-function — constitutive receptor activation → persistent SIADH"] },
    ]
  },
};

export default function TubularDisorderEngine() {
  const [selected, setSelected] = useState(null);
  const content = selected ? CONTENT[selected] : null;

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-gradient-to-r from-teal-800 to-emerald-700 p-4 text-white">
        <h3 className="font-bold text-sm">Tubular Disorder Intelligence Engine</h3>
        <p className="text-xs text-teal-200 mt-0.5">Fanconi · Hypophosphatemic Rickets · NDI / SIADH</p>
      </div>

      {!selected && (
        <div className="space-y-2">
          {SECTIONS.map(s => (
            <button key={s.id} onClick={() => setSelected(s.id)}
              className={`w-full flex items-center gap-3 px-4 py-4 rounded-xl text-white text-left shadow-sm ${s.color} hover:opacity-90 active:scale-95 transition-all`}>
              <ChevronRight className="w-4 h-4 flex-shrink-0" />
              <span className="font-semibold text-sm">{s.label}</span>
            </button>
          ))}
        </div>
      )}

      {selected && content && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-slate-900">{content.title}</h3>
            <Button variant="outline" size="sm" onClick={() => setSelected(null)}>
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
          </div>
          {content.sections.map((sec, i) => (
            <Card key={i} className="border-teal-200">
              <CardContent className="p-4">
                <p className="font-bold text-sm text-teal-900 mb-2">{sec.heading}</p>
                {sec.items.map((item, j) => (
                  <div key={j} className="flex items-start gap-2 text-xs text-slate-700 mb-1.5">
                    <span className="text-teal-500 font-bold flex-shrink-0 mt-0.5">→</span>
                    {item}
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
          <Button variant="outline" size="sm" className="w-full" onClick={() => setSelected(null)}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Tubular Menu
          </Button>
        </div>
      )}
    </div>
  );
}