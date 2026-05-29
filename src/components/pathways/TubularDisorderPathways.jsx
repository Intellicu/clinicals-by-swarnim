import React, { useState } from "react";
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";

import { ArrowRight, TestTube, Info } from "lucide-react";

const CONDITIONS = {
  distal_rta: {
    title: "Distal RTA (Type 1)",
    tag: "Tubular",
    color: "bg-amber-100 text-amber-800",
    guidance: "ERKNet/ESPN 2021",
    overview: "Failure to acidify urine in collecting duct (ATP6V1B1 / ATP6V0A4 / SLC4A1 mutations in genetic forms). pH >5.5 despite systemic acidosis. Nephrocalcinosis, stones, growth failure, hypokalemia.",
    diagnosis: ["Metabolic acidosis: non-anion gap (normal AG), low HCO3, low K+", "Urine pH >5.5 despite acidosis (first morning urine)", "Urine anion gap: positive (+) = distal RTA (vs negative in GI losses)", "Nephrocalcinosis on USG (medullary, bilateral) — pathognomonic", "Genetic testing: ATP6V1B1 (+ sensorineural deafness), ATP6V0A4, SLC4A1", "India: available at AIIMS, Medgenome"],
    treatment: ["Potassium citrate: 1–3 mEq/kg/day (corrects acidosis + citraturia → prevents stones)", "Sodium bicarbonate as alternative if citrate not tolerated", "Target serum HCO3 >22 mEq/L", "Thiazide diuretics: reduce hypercalciuria (if present)", "Correct hypokalemia before alkali therapy (alkali may worsen K+ acutely — give K-citrate not Na-bicarb)", "India: potassium citrate solution (Polycitra-K® / compound preparation at pharmacy)"],
    monitoring: ["Blood gas + electrolytes + creatinine monthly (initial), 3-monthly once stable", "24h urine calcium, citrate, oxalate 6-monthly", "USG kidneys 6-monthly (nephrocalcinosis progression)", "Audiometry annually (ATP6V1B1 — sensorineural deafness)"],
    pearls: ["Urine pH >5.5 in setting of acidosis = dRTA until proven otherwise", "Correct hypokalemia FIRST — alkali therapy without K+ can cause severe hypokalemic paralysis", "Nephrocalcinosis is the hallmark — always get renal USG", "Long-term: near-normal life expectancy with adequate alkali therapy"]
  },
  proximal_rta: {
    title: "Proximal RTA (Type 2) & Fanconi Syndrome",
    tag: "Tubular",
    color: "bg-amber-100 text-amber-800",
    guidance: "ERKNet · ISPN",
    overview: "Failure to reabsorb bicarbonate in proximal tubule (SLC4A4/CA2 mutations, or secondary to cystinosis, Lowe syndrome, Wilson, galactosemia, drugs). Fanconi syndrome = pan-tubular dysfunction.",
    diagnosis: ["Non-AG metabolic acidosis + urine pH <5.5 (can acidify maximally once HCO3 threshold exceeded)", "Bicarbonate wasting: FE-HCO3 >15% during IV bicarb infusion", "Fanconi pattern: glucosuria (normal blood glucose) + aminoaciduria + phosphaturia + uricosuria + low K+", "Low phosphate + rickets = phosphopenic rickets (X-linked or Fanconi)", "Cause workup: cystine levels (cystinosis), copper (Wilson), galactose-1-phosphate (galactosemia), OCRL gene (Lowe syndrome)"],
    treatment: ["High-dose alkali required: 5–15 mEq/kg/day (vs 1–3 in dRTA) — wasted bicarbonate", "Phosphate supplementation: 30–90 mg/kg/day in divided doses (for rickets)", "Calcitriol (active vitamin D): 20–60 ng/kg/day", "Potassium citrate for hypokalemia", "Treat underlying cause: cysteamine (cystinosis), D-penicillamine (Wilson)", "India: phosphate supplements (Neutra-Phos® imported/compounded), calcitriol widely available"],
    monitoring: ["Blood gas, electrolytes, phosphate weekly (initial), monthly (stable)", "X-ray wrists/knees: rickets resolution (3-monthly initially)", "Urinary calcium, phosphate, glucose, amino acids 3-monthly", "Growth monitoring at every visit"],
    pearls: ["Proximal RTA: urine pH can be <5.5 (can still acidify when plasma HCO3 drops below threshold)", "NEVER give potassium-depleting diuretics in RTA — worsens hypokalemia", "Rickets in proximal RTA = phosphopenic (not calcipenic) — treat with phosphate + calcitriol, NOT calcium supplements alone", "Lowe syndrome (OCRL): males only — cataracts + intellectual disability + Fanconi"]
  },
  bartter: {
    title: "Bartter Syndrome (Types 1–5)",
    tag: "Tubular",
    color: "bg-cyan-100 text-cyan-800",
    guidance: "ERKNet/ESPN Guidelines",
    overview: "Salt-losing tubulopathy — defects in thick ascending limb (TAL) sodium reabsorption. Types 1–5 by gene (NKCC2, ROMK, ClCKb, Barttin, CaSR). Presents: polyhydramnios/prematurity, polyuria, hypokalemic alkalosis, failure to thrive.",
    diagnosis: ["Hypokalemia + metabolic alkalosis + low/normal BP (distinguish from Gitelman: TAL vs DCT)", "High urine chloride (>20 mEq/L) + normal/high aldosterone + high renin — salt wasting despite normal BP", "Type differentiation by genetics: SLC12A1 (Type1), KCNJ1 (Type2), CLCNKB (Type3), BSND (Type4/deafness), CASR (Type5)", "Antenatal: polyhydramnios + elevated amniotic fluid chloride", "Prostaglandin E2 urine elevated (PGE2) — supports diagnosis and response to indomethacin"],
    treatment: ["Indomethacin: 0.5–3 mg/kg/day — reduces prostaglandin — cornerstone of treatment for Types 1–4", "Potassium supplementation: 1–5 mEq/kg/day (often high doses needed)", "Potassium-sparing diuretics: spironolactone 1–3 mg/kg/day or amiloride 0.1–0.3 mg/kg/day", "ACEi/ARB: may help hypokalemia via aldosterone blockade", "Type 5 (CASR gain-of-function): avoid indomethacin; cinacalcet (CaSR sensitiser)", "India: indomethacin 25mg tablets; high-dose KCl supplementation — monitor closely"],
    monitoring: ["Electrolytes (K+, Na+, Cl-, HCO3) weekly initially, monthly once stable", "Growth parameters at every visit", "Renal USG (nephrocalcinosis — especially Type 1/2 with hypercalciuria)", "Hearing (Type 4: sensorineural deafness)"],
    pearls: ["Always suspect Bartter in premature infant with severe electrolyte disorder + polyhydramnios", "Indomethacin most effective in Types 1 and 2 (neonatal Bartter) — dramatic response", "Type 3 (ClCKb): milder, may present later, often confused with Gitelman", "Nephrocalcinosis risk: Types 1+2 (hypercalciuria) — monitor USG"]
  },
  gitelman: {
    title: "Gitelman Syndrome",
    tag: "Tubular",
    color: "bg-teal-100 text-teal-800",
    guidance: "ERKNet/ESPN Guidelines 2022",
    overview: "Distal tubule salt wasting — SLC12A3 (NCCT/thiazide-sensitive co-transporter) mutation. Autosomal recessive. Hypokalemia + metabolic alkalosis + HYPOmagnesemia + HYPOcalciuria. Usually presents later (school age / adolescence).",
    diagnosis: ["Hypokalemia + metabolic alkalosis + hypomagnesemia + hypocalciuria", "Key distinction from Bartter: low urine calcium (Gitelman) vs high (Bartter Types 1/2)", "Urine chloride >20 mEq/L (distinguishes from laxative abuse or vomiting)", "Genetic testing: SLC12A3 — confirms diagnosis; biallelic mutations", "Thiazide test: IV thiazide challenge — blunted natriuretic response (confirms NCCT defect)"],
    treatment: ["Magnesium replacement: ESSENTIAL — MgCl2 or MgSO4 oral; IV if severe (<0.5 mmol/L or symptomatic)", "Oral magnesium: 10–20 mg elemental Mg/kg/day in divided doses (diarrhoea limits dose)", "Potassium supplementation: KCl oral 1–3 mEq/kg/day", "Potassium-sparing diuretics: amiloride preferred (K+Na+ co-retention) 0.1–0.3 mg/kg/day", "NSAIDs (indomethacin): less effective than in Bartter — use with caution", "India: magnesium oxide/chloride tablets, IV MgSO4 (widely available)"],
    monitoring: ["Electrolytes (K+, Mg2+) monthly", "ECG if K+ <2.5 (QTc prolongation risk with hypomagnesemia)", "Blood pressure (usually low/normal)", "Quality of life assessment — fatigue, cramps common"],
    pearls: ["Gitelman: low urine Ca — 'Goes with Gitelman'; Bartter: high urine Ca — 'Bad in Bartter'", "Hypomagnesemia drives hypokalemia — magnesium repletion is often the key to K+ correction", "QTc prolongation with combined hypo-K + hypo-Mg — monitor ECG", "Most patients lead normal lives — reassurance important; high salt diet may reduce symptoms"]
  },
  ndi: {
    title: "Nephrogenic Diabetes Insipidus (NDI)",
    tag: "Tubular",
    color: "bg-blue-100 text-blue-800",
    guidance: "ISPN · ERKNet",
    overview: "Resistance of collecting duct to ADH (vasopressin). Congenital: X-linked (AVPR2, 90%) or autosomal recessive (AQP2). Acquired: lithium, hypercalcemia, hypokalemia, obstruction.",
    diagnosis: ["Polyuria >2 L/m²/day + low urine osmolality (<300 mOsm/kg)", "Serum Na high-normal or hypernatremia (if inadequate free water)", "Water deprivation test: urine osmolality remains <300 despite dehydration", "DDAVP challenge: NO urine concentration (distinguishes from central DI which concentrates)", "Genetic testing: AVPR2 (X-linked males), AQP2 (AR) — at AIIMS, Medgenome"],
    treatment: ["Hydrochlorothiazide (HCTZ): 1–3 mg/kg/day — paradoxical antidiuresis via volume contraction", "Amiloride: 0.1–0.3 mg/kg/day — adds to HCTZ effect + prevents hypokalemia", "Indomethacin: 0.5–1.5 mg/kg/day — reduces urine volume by prostaglandin inhibition", "Triple therapy: HCTZ + amiloride + indomethacin — most effective for severe congenital NDI", "Free water: ensure adequate intake to prevent hypernatremia; nasogastric tube in neonates", "India: HCTZ tablets (widely available, inexpensive); amiloride available"],
    monitoring: ["Serum Na and osmolality weekly (neonates/infants), monthly (older children)", "Urine osmolality/volume monitoring at home (parents record volumes)", "Renal USG: hydronephrosis from bladder overdistension", "Growth monitoring — poor growth from calorie deficit (drinking instead of eating)"],
    pearls: ["Never use DDAVP in NDI — it does not work and causes volume overload", "Neonatal NDI: fever + irritability + hypernatremia — high mortality if missed", "HCTZ + amiloride: K+-sparing combination; add indomethacin for refractory cases", "Acquired NDI from lithium: amiloride specifically blocks lithium entry via ENaC — preferred"]
  }
};

export default function TubularDisorderPathways({ condition }) {
  const [section, setSection] = useState("overview");
  const data = CONDITIONS[condition];
  if (!data) return null;

  const sections = [
    { key: "overview", label: "Overview" },
    { key: "diagnosis", label: "Diagnosis" },
    { key: "treatment", label: "Treatment" },
    { key: "monitoring", label: "Monitoring" },
    { key: "pearls", label: "Pearls" },
  ];

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-gradient-to-r from-amber-700 to-orange-700 p-5 text-white">
        <div className="flex items-center gap-3">
          <TestTube className="w-7 h-7" />
          <div>
            <h2 className="text-xl font-bold">{data.title}</h2>
            <p className="text-amber-100 text-sm">{data.guidance}</p>
          </div>
        </div>
        <span className={`mt-2 inline-block text-xs px-2 py-0.5 rounded-full font-medium ${data.color}`}>{data.tag}</span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {sections.map(s => (
          <button key={s.key} onClick={() => setSection(s.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${section === s.key ? "bg-amber-700 text-white" : "bg-white border border-slate-200 text-slate-600 hover:border-amber-300"}`}>
            {s.label}
          </button>
        ))}
      </div>

      <Card className="border-slate-200">
        <CardContent className="p-4 space-y-2">
          {section === "overview" && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-sm text-amber-900 leading-relaxed">{data.overview}</p>
            </div>
          )}
          {section !== "overview" && data[section]?.map((item, i) => (
            <div key={i} className={`flex items-start gap-2 p-3 rounded-lg ${section === "pearls" ? "bg-amber-50 border border-amber-200" : section === "treatment" ? "bg-green-50 border border-green-200" : section === "diagnosis" ? "bg-blue-50 border border-blue-200" : "bg-slate-50 border border-slate-200"}`}>
              <ArrowRight className={`w-3 h-3 flex-shrink-0 mt-0.5 ${section === "pearls" ? "text-amber-600" : section === "treatment" ? "text-green-600" : "text-blue-500"}`} />
              <p className="text-xs text-slate-800 leading-relaxed">{item}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}