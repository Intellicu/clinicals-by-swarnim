import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ChevronDown, ChevronUp, AlertTriangle, Activity } from "lucide-react";

const SYMPTOM_PATHWAYS = [
  {
    id: "polyuria",
    symptom: "Polyuria + Growth Failure",
    icon: "💧",
    color: "cyan",
    urgency: "moderate",
    overview: "Polyuria with growth failure in a child should prompt systematic evaluation for tubular disorders, diabetes insipidus, and metabolic conditions.",
    ddx: [
      { diagnosis: "Nephrogenic Diabetes Insipidus (NDI)", genes: "AVPR2 (X-linked), AQP2 (AR)", clues: "Male infant, hypernatremia, dilute urine unresponsive to DDAVP, consanguinity" },
      { diagnosis: "Bartter Syndrome", genes: "SLC12A1, KCNJ1, CLCNKB, BSND, CASR", clues: "Polyhydramnios, premature birth, hypokalemia, metabolic alkalosis, salt wasting" },
      { diagnosis: "Cystinosis (Fanconi syndrome)", genes: "CTNS", clues: "FTT, polyuria, rickets, photophobia, corneal crystals at age >1 yr" },
      { diagnosis: "Distal RTA", genes: "ATP6V1B1, ATP6V0A4", clues: "Normal anion gap acidosis, hypokalemia, nephrocalcinosis, rickets" },
      { diagnosis: "Medullary sponge kidney / Thin GBM", genes: "FXYD2, others", clues: "Nephrocalcinosis, recurrent UTI, hypercalciuria" },
    ],
    workup: ["Serum electrolytes, calcium, phosphate, magnesium, uric acid", "Urine pH (fasting), urinary electrolytes, glucose, protein", "Urine amino acids screen (Fanconi: generalised aminoaciduria)", "Water deprivation test → if no response: DDAVP test", "Leucocyte cystine levels", "Renal ultrasound ± plain X-ray KUB", "Gene panel: NDI (AVPR2, AQP2) + Bartter + RTA genes"],
    pearls: "In infants: NDI presents with recurrent dehydration, hypernatremia, constitutional short stature. DDAVP test essential: measure urine osmolality before and 2 hours after intranasal DDAVP. No response (<50% rise) = nephrogenic DI."
  },
  {
    id: "stones",
    symptom: "Recurrent Kidney Stones",
    icon: "🪨",
    color: "amber",
    urgency: "high",
    overview: "Recurrent stones or first stone episode in a child <5 years warrants full metabolic workup for rare inherited stone diseases.",
    ddx: [
      { diagnosis: "Primary Hyperoxaluria Type 1 (AGXT)", genes: "AGXT", clues: "Age <5 years, multiple bilateral stones, nephrocalcinosis, oxalate deposits in retina/bone" },
      { diagnosis: "Primary Hyperoxaluria Type 2 (GRHPR)", genes: "GRHPR", clues: "Less severe than PH1, occasional NC, glyceric aciduria" },
      { diagnosis: "Cystinuria", genes: "SLC3A1, SLC7A9", clues: "Hexagonal crystals on uroscopy, radiolucent or faintly opaque stones, recurrent from early childhood" },
      { diagnosis: "Dent Disease", genes: "CLCN5 (Dent-1), OCRL (Dent-2/Lowe)", clues: "X-linked, hypercalciuria, low molecular weight proteinuria, NC, nephrolithiasis" },
      { diagnosis: "Bartter type V (CASR gain-of-function)", genes: "CASR", clues: "Hypokalemic alkalosis, hypercalciuria, nephrocalcinosis, short stature" },
    ],
    workup: ["24-hour urine: calcium, oxalate, citrate, uric acid, cystine, phosphate, creatinine", "Spot urine oxalate:creatinine (PH1)", "Spot urine cystine:creatinine (cystinuria)", "Plasma oxalate (if eGFR <30)", "Stone analysis (infrared spectroscopy/XRPD if available)", "Slit lamp exam (retinal oxalate deposits)", "Renal ultrasound + plain KUB", "Genetic testing: AGXT, GRHPR, HOGA1, SLC3A1, SLC7A9, CLCN5"],
    pearls: "PH1: urinary oxalate:creatinine >0.1 mmol/mmol is diagnostic. Start lumasiran (siRNA) if PH1 confirmed — reduces hepatic oxalate production. Cystinuria: goal urine cystine <250 mg/L — alkalinise urine pH >7.5, high fluid intake >3 L/m²/day."
  },
  {
    id: "infantile_ns",
    symptom: "Infantile Nephrotic Syndrome",
    icon: "👶",
    color: "purple",
    urgency: "critical",
    overview: "Nephrotic syndrome presenting in the first year of life. Genetic cause in virtually 100% of congenital NS (<3 months) and >80% of infantile NS (3–12 months). Never treat with steroids before genetic diagnosis.",
    ddx: [
      { diagnosis: "Finnish-type NS (NPHS1)", genes: "NPHS1 (Chr 19)", clues: "Finnish descent (or not), large placenta >25% birth weight, massive proteinuria from birth, DMS on biopsy" },
      { diagnosis: "Diffuse Mesangial Sclerosis (WT1/NPHS2)", genes: "WT1, NPHS2", clues: "Drash: male pseudohermaphroditism + NS + Wilms tumour risk; Frasier: XY female + progressive GN + gonadoblastoma" },
      { diagnosis: "Pierson Syndrome (LAMB2)", genes: "LAMB2", clues: "Microcoria (fixed miotic pupils), ocular anomalies, DMS/FSGS on biopsy" },
      { diagnosis: "Congenital infections", genes: "—", clues: "CMV, syphilis, toxoplasma, malaria — secondary NS" },
      { diagnosis: "COQ mutations", genes: "COQ2, COQ6, ADCK4", clues: "NS + neurological features + mitochondrial markers" },
    ],
    workup: ["IMMEDIATE: serum albumin, urine PCR, renal function", "TORCH serology + VDRL (congenital infection)", "Renal biopsy with EM (before genetic results)", "NPHS1, NPHS2, WT1, LAMB2 gene sequencing (priority panel)", "Karyotype (if ambiguous genitalia)", "Ophthalmology (Pierson: microcoria)", "Urinary amino acids and organic acids"],
    pearls: "Do NOT start steroids in infants <12 months with NS without genetic diagnosis. Finnish type: albumin infusions + ACE inhibitor + early transplant listing at 7–10 kg (bilateral nephrectomy first). WT1 mutations: Wilms tumour surveillance (renal ultrasound every 3 months until age 7)."
  },
  {
    id: "nephrocalcinosis_sx",
    symptom: "Nephrocalcinosis",
    icon: "🔬",
    color: "orange",
    urgency: "high",
    overview: "Nephrocalcinosis (calcium deposits in renal parenchyma) in children is almost always pathological and requires systematic metabolic workup.",
    ddx: [
      { diagnosis: "Primary Hyperoxaluria (PH1/2/3)", genes: "AGXT, GRHPR, HOGA1", clues: "Diffuse NC from infancy, escalating stone burden, progressive renal decline" },
      { diagnosis: "Distal RTA", genes: "ATP6V1B1, ATP6V0A4, SLC4A1", clues: "Normal anion gap acidosis, hypokalemia, medullary NC, deafness (ATP6V1B1)" },
      { diagnosis: "Dent Disease", genes: "CLCN5, OCRL", clues: "X-linked, hypercalciuria, LMWP, NC, no acidosis" },
      { diagnosis: "Familial hypomagnesemia with hypercalciuria (FHHNC)", genes: "CLDN16, CLDN19", clues: "Hypomagnesemia + hypercalciuria + NC + ocular coloboma (CLDN19)" },
      { diagnosis: "Primary hypoparathyroidism / activating CASR mutation", genes: "PTH, CASR", clues: "Hypocalcemia, hyperphosphatemia, low PTH, hypercalciuria" },
    ],
    workup: ["24-hour urine calcium, oxalate, citrate, magnesium, phosphate", "Serum calcium, phosphate, magnesium, PTH, vitamin D", "Urine pH (fasting), anion gap, TTKG (potassium)", "Plasma oxalate", "LMWP screening (alpha-1 microglobulin)", "Renal ultrasound (cortical vs medullary)", "Genetic panel: PH genes, dRTA genes, CLCN5, CLDN16/19"],
    pearls: "Cortical NC suggests oxalate deposits (PH1, CaOx). Medullary NC more common in dRTA, hypercalciuria, Dent. Degree of NC does not always correlate with renal function — monitor eGFR carefully."
  },
  {
    id: "cystic_kidneys_sx",
    symptom: "Cystic Kidneys",
    icon: "🫘",
    color: "teal",
    urgency: "moderate",
    overview: "Cystic renal disease in children encompasses a broad spectrum from benign to life-threatening. Key is differentiating by age of onset, cyst distribution, and extra-renal features.",
    ddx: [
      { diagnosis: "ARPKD (PKHD1)", genes: "PKHD1", clues: "Neonatal: enlarged echogenic kidneys, oligohydramnios. Older child: hypertension, liver fibrosis, portal HTN" },
      { diagnosis: "ADPKD (PKD1/PKD2)", genes: "PKD1, PKD2", clues: "Family history (dominant), cysts increase with age, hypertension, hepatic cysts" },
      { diagnosis: "Nephronophthisis (NPHP1-20)", genes: "NPHP1 (most common)", clues: "Small corticomedullary cysts, echogenic kidneys, polyuria, ESRD adolescence/young adult" },
      { diagnosis: "Bardet-Biedl Syndrome", genes: "BBS1-21", clues: "Obesity + retinitis pigmentosa + polydactyly + hypogonadism + renal cysts" },
      { diagnosis: "HNF1B mutations", genes: "HNF1B", clues: "Renal cysts + pancreatic hypoplasia + MODY5 diabetes + genitourinary anomalies" },
    ],
    workup: ["Detailed renal ultrasound (size, cortical vs medullary, echogenicity)", "LFT + liver imaging (congenital hepatic fibrosis)", "PKHD1 gene testing", "PKD1/PKD2 gene panel", "NPHP panel (microdeletion array for NPHP1)", "Brain MRI (Joubert: molar tooth)", "Ophthalmology (RP, coloboma)", "Audiology", "HNF1B sequencing"],
    pearls: "ARPKD neonatal form: Potter sequence (oligohydramnios → pulmonary hypoplasia). Ventilator support may be needed. Long-term prognosis depends on pulmonary function. NPHP: salt-wasting, polyuria — do not restrict fluids. ADPKD in children: treat hypertension aggressively."
  },
  {
    id: "hypokalemia",
    symptom: "Hypokalemia (Unexplained / Recurrent)",
    icon: "⚡",
    color: "yellow",
    urgency: "moderate",
    overview: "Persistent hypokalemia with metabolic alkalosis and normal/low blood pressure in a child should raise suspicion for hereditary tubulopathies.",
    ddx: [
      { diagnosis: "Bartter Syndrome (Types 1–5)", genes: "SLC12A1, KCNJ1, CLCNKB, BSND, CASR", clues: "Neonatal polyhydramnios, premature birth, severe salt wasting, Type 4 with deafness, normal BP" },
      { diagnosis: "Gitelman Syndrome", genes: "SLC12A3", clues: "Adolescent/adult, mild hypokalemia + hypomagnesemia, no polyuria, normal BP, chondrocalcinosis" },
      { diagnosis: "Distal RTA (Type 1)", genes: "ATP6V1B1, ATP6V0A4", clues: "Hypokalemia + normal anion gap acidosis (not alkalosis), NC, low urine ammonium" },
      { diagnosis: "Liddle Syndrome", genes: "SCNN1B, SCNN1G", clues: "Hypokalemia + hypertension + low renin + low aldosterone (opposite of Bartter)" },
    ],
    workup: ["Electrolytes: K+, Na+, Mg2+, Cl−, HCO3−", "Spot urine K:Cr (high = renal wasting)", "TTKG (trans-tubular potassium gradient)", "Renin and aldosterone levels", "Urine Ca:Cr (high in Bartter, normal in Gitelman)", "Urine Mg (hypomagnesuria in Gitelman)", "Gene panel: SLC12A1, KCNJ1, CLCNKB, BSND, CASR, SLC12A3"],
    pearls: "Gitelman vs Bartter key difference: Gitelman has hypomagnesemia + hypocalciuria; Bartter has normocalcemia/hypercalciuria. Bartter type 4 has SNHL (BSND mutation). Both need lifelong K+/Mg2+ supplementation."
  },
  {
    id: "tma",
    symptom: "Recurrent TMA",
    icon: "🔴",
    color: "red",
    urgency: "critical",
    overview: "Recurrent thrombotic microangiopathy should always prompt investigation for atypical HUS (complement dysregulation) after ruling out STEC-HUS and TTP.",
    ddx: [
      { diagnosis: "aHUS — CFH mutation", genes: "CFH", clues: "Most common mutation, recurrent TMA, low C3, incomplete complement regulation" },
      { diagnosis: "aHUS — CFI/CD46/C3/CFB/THBD", genes: "CFI, CD46, C3, CFB, THBD", clues: "Variable presentation, complement activation markers" },
      { diagnosis: "Anti-CFH antibodies", genes: "—", clues: "Young children, acute severe presentation, associated CFHR1/3 deletion, responds to immunosuppression" },
      { diagnosis: "DGKE mutations", genes: "DGKE", clues: "Infantile onset, hypertension, proteinuria, steroid-responsive, incomplete TMA" },
      { diagnosis: "Cobalamin disorders (MMA/cblC)", genes: "MMACHC", clues: "Neonatal TMA + methylmalonic acidemia + homocystinuria — do not miss!" },
    ],
    workup: ["Blood film: schistocytes", "ADAMTS13 activity (<10% = TTP)", "STEC cultures, Shiga toxin", "C3, C4, CH50, AP50", "Anti-CFH antibodies (ELISA)", "CFHR1-5 genetic copy number", "Complement genetic panel (CFH, CFI, CD46, C3, CFB, THBD, DGKE)", "Plasma amino acids + urine organic acids (cobalamin)", "Renal biopsy (TMA pattern)"],
    pearls: "Cobalamin C (cblC) is the most important treatable mimicker of aHUS in neonates — always screen plasma homocysteine and urine MMA. Treatment: hydroxocobalamin + betaine. Response to eculizumab in cblC is poor — critical to differentiate."
  },
];

const URGENCY_COLOR = { critical: "bg-red-100 text-red-800", high: "bg-orange-100 text-orange-800", moderate: "bg-amber-100 text-amber-800" };

function PathwayCard({ pathway }) {
  const [open, setOpen] = useState(false);
  return (
    <Card className="bg-white border border-slate-200 shadow-sm overflow-hidden">
      <button className="w-full flex items-center gap-3 p-4 hover:bg-slate-50 transition-colors text-left" onClick={() => setOpen(!open)}>
        <span className="text-2xl">{pathway.icon}</span>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-slate-900">{pathway.symptom}</span>
            <Badge className={`text-xs ${URGENCY_COLOR[pathway.urgency]}`}>{pathway.urgency}</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{pathway.overview}</p>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />}
      </button>
      {open && (
        <div className="border-t border-slate-100 p-4 space-y-4">
          <p className="text-sm text-slate-700 leading-relaxed">{pathway.overview}</p>

          {/* DDx table */}
          <div>
            <p className="text-xs font-bold text-slate-600 uppercase mb-2">Differential Diagnoses</p>
            <div className="space-y-2">
              {pathway.ddx.map((d, i) => (
                <div key={i} className="rounded-lg border border-violet-200 bg-violet-50 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-sm text-violet-900">{d.diagnosis}</p>
                    <code className="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded font-mono">{d.genes}</code>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">{d.clues}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Workup */}
          <div>
            <p className="text-xs font-bold text-slate-600 uppercase mb-2">Diagnostic Workup</p>
            <ol className="space-y-1">
              {pathway.workup.map((w, i) => (
                <li key={i} className="text-xs text-slate-700 flex items-start gap-2">
                  <span className="font-bold text-violet-500 min-w-[16px]">{i + 1}.</span>{w}
                </li>
              ))}
            </ol>
          </div>

          {/* Pearls */}
          <Alert className="bg-green-50 border-green-200">
            <AlertDescription className="text-xs text-green-800 leading-relaxed">
              <strong>💡 Clinical Pearls:</strong> {pathway.pearls}
            </AlertDescription>
          </Alert>
        </div>
      )}
    </Card>
  );
}

export default function SymptomBasedApproach({ isAdmin }) {
  return (
    <div className="space-y-3">
      <Alert className="bg-violet-50 border-violet-200">
        <Activity className="w-4 h-4 text-violet-600" />
        <AlertDescription className="text-violet-800 text-xs">
          <strong>Symptom-Based Rare Disease Pathways:</strong> Each pathway provides differential diagnoses, gene targets, diagnostic workup sequence, and clinical pearls for rare diseases presenting with that symptom.
        </AlertDescription>
      </Alert>
      {SYMPTOM_PATHWAYS.map(p => <PathwayCard key={p.id} pathway={p} />)}
    </div>
  );
}