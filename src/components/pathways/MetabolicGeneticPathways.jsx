import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, ChevronDown, ChevronUp, ArrowRight, Dna, Info } from "lucide-react";

const CONDITIONS = {
  cystinosis: {
    title: "Cystinosis",
    tag: "Metabolic",
    color: "bg-violet-100 text-violet-800",
    guidance: "ISKDC · ERKNet · ISPN",
    overview: "Lysosomal storage disorder (CTNS gene) — most common metabolic cause of renal Fanconi syndrome in children. Nephropathic (infantile) form presents 6–12 months.",
    diagnosis: ["Leucocyte cystine >0.2 nmol/mg protein (diagnostic)", "Slit-lamp: corneal cystine crystals (pathognomonic)", "Renal biopsy: swollen tubular cells with cystine crystals", "Genetic testing: CTNS gene mutation", "India: available at AIIMS-New Delhi, CMC Vellore"],
    treatment: ["Cysteamine (mercaptamine) bitartrate — SPECIFIC TREATMENT — depletes lysosomal cystine", "Oral: 1.3 g/m²/day in 4 divided doses; extended-release: 1.3g/m²/day in 2 doses", "Target leucocyte cystine <1 nmol/mg protein (half-cystine)", "Electrolyte replacement: potassium citrate, phosphate, carnitine (Fanconi)", "Hypothyroidism (60%): L-thyroxine; growth hormone if growth failure", "India note: Cysteamine (Cystaran® eye drops, Procysbi®) — expensive, may need compassionate access via ERKNet/IPNA support"],
    monitoring: ["Leucocyte cystine every 3 months", "Renal function, electrolytes monthly", "Slit-lamp exam 6-monthly", "Thyroid function annually", "Swallowing assessment (dysphagia in older patients)"],
    pearls: ["Fanconi syndrome: glucosuria + aminoaciduria + phosphaturia + low urate + low K+ + low bicarb", "Never stop cysteamine — deterioration is rapid", "Corneal crystals visible without dilation — useful for diagnosis", "Extrarenal: muscle weakness, retinopathy, CNS, dysphagia in older patients"]
  },
  fabry: {
    title: "Fabry Disease",
    tag: "Metabolic",
    color: "bg-pink-100 text-pink-800",
    guidance: "ERKNet · ISPN · Fabry Registry",
    overview: "X-linked lysosomal storage (GLA gene, alpha-galactosidase A deficiency). Renal: proteinuria → FSGS-like → ESRD. Multisystem: pain crises, angiokeratomas, cardiac, stroke.",
    diagnosis: ["Alpha-galactosidase A enzyme activity: males <1% diagnostic; females may be normal (genetic testing mandatory)", "GLA gene sequencing — most reliable, especially females", "Urine Gb3 / lyso-Gb3 (lyso-Gb3 most sensitive — elevated in females)", "Renal biopsy: lamellar inclusions in podocytes (zebra bodies on EM)", "India: enzyme assay at NIMHANS, AIIMS; lyso-Gb3 at select labs"],
    treatment: ["Enzyme Replacement Therapy (ERT): agalsidase alfa 0.2 mg/kg IV q2w OR agalsidase beta 1 mg/kg IV q2w", "Migalastat (chaperone): for amenable mutations (>50% of pathogenic variants) — oral, approved in India", "Start ERT in males at diagnosis; females if symptomatic/end-organ damage", "Pain: gabapentin / carbamazepine / pregabalin for neuropathic pain", "ACEi/ARB: renoprotection once proteinuria detected", "India access: agalsidase beta — Fabrazyme® (Sanofi) — high cost; PMJAY may cover; patient assistance programs"],
    monitoring: ["Urine protein/UPCR 3-monthly", "eGFR 6-monthly", "Echocardiogram annually (LVH, cardiomyopathy)", "MRI brain (stroke screening)", "Lyso-Gb3 annually to assess ERT efficacy"],
    pearls: ["Fabry nephropathy: first sign often microalbuminuria in 2nd decade", "Female heterozygotes: 70% symptomatic — do NOT reassure as carrier", "Migalastat — check mutation amenability before prescribing (Fabry-database.org)", "Pain crises triggered by fever, exercise — often misdiagnosed as anxiety/arthritis in childhood"]
  },
  hyperoxaluria: {
    title: "Primary Hyperoxaluria (PH1/PH2/PH3)",
    tag: "Metabolic",
    color: "bg-orange-100 text-orange-800",
    guidance: "ERKNet · ISPN · OHF Guidelines 2023",
    overview: "Inherited overproduction of oxalate. PH1 (AGXT, 70%): most severe — oxalate nephropathy, nephrocalcinosis → ESRD in infancy/childhood. PH2 (GRHPR), PH3 (HOGA1): milder.",
    diagnosis: ["24h urine oxalate: >0.5 mmol/1.73m²/day (>45 mg/1.73m²/day) diagnostic", "Renal biopsy with von Kossa stain: calcium oxalate deposits (birefringent crystals on polarised light)", "Genetic panel: AGXT (PH1), GRHPR (PH2), HOGA1 (PH3) — at AIIMS, Medgenome", "Plasma oxalate >30 µmol/L suggests PH1 with systemic oxalosis", "Liver biopsy: alanine-glyoxylate aminotransferase (AGT) assay — gold standard for PH1"],
    treatment: ["Pyridoxine (B6) trial: 5–10 mg/kg/day for 3 months — 30% PH1 respond (AGXT mutations)", "High fluid intake: ≥3 L/m²/day — dilute urine oxalate", "Lumasiran (Oxlumo®): RNAi therapy — approved for PH1; reduces urinary oxalate by 65–80%", "Lumasiran dosing (paediatric): weight-based SC injection monthly × 3 then quarterly", "India note: Lumasiran available via compassionate use/named patient programme — ERKNet/Alnylam patient access", "ESRD: pre-emptive combined liver+kidney transplant (PH1) — restores AGXT enzyme"],
    monitoring: ["24h urine oxalate monthly (first 6 months on lumasiran), then 3-monthly", "eGFR: monthly if declining; 3-monthly if stable", "Renal USG: nephrocalcinosis progression 6-monthly", "Plasma oxalate if eGFR <45 (CKD3b+)"],
    pearls: ["Lumasiran — most significant advance in PH1 in decades; start early before significant CKD", "Do NOT start standard HD if ESRD — oxalate burden accumulates; CRRT + intensive HD (6x/week) needed", "Nephrocalcinosis in infant with nephrotic syndrome or Fanconi — always think PH", "Genetic testing in siblings/parents essential (autosomal recessive)"]
  },
  arpkd_adpkd: {
    title: "ARPKD / ADPKD",
    tag: "Genetic",
    color: "bg-blue-100 text-blue-800",
    guidance: "KDIGO 2015 · ERKNet · ISPN",
    overview: "ARPKD (PKHD1/DZIP1L): presents neonatal/infancy — bilateral enlarged kidneys, oligohydramnios, liver fibrosis. ADPKD (PKD1/PKD2): childhood/adult — bilateral cysts, HTN, family history.",
    diagnosis: ["ARPKD: USG — bilateral enlarged echogenic kidneys + hepatic fibrosis (periportal fibrosis on liver biopsy)", "ADPKD: USG — bilateral renal cysts; Ravine/Pei criteria by age and cyst count; family history (autosomal dominant)", "Genetic testing: PKHD1 panel (ARPKD), PKD1+PKD2+GANAB panel (ADPKD) — at Medgenome, AIIMS", "MRI kidney: total kidney volume (TKV) — prognostic in ADPKD", "ADPKD: rule out de novo mutations (30%) if no family history"],
    treatment: ["ARPKD: supportive — manage HTN (ACEi), CKD-MBD, portal hypertension", "ADPKD: Tolvaptan (vasopressin V2-receptor antagonist) — slows TKV growth — approved from 18y in India (consider off-label adolescents per ERKNet)", "ADPKD: ACEi/ARB for HTN + renoprotection; avoid caffeine, NSAIDs", "Both: plan RRT (transplant preferred) at CKD5", "ARPKD: liver transplant if portal hypertension dominates; combined liver-kidney if ESRD"],
    monitoring: ["USG kidneys annually (cyst size, TKV)", "BP every 3–6 months", "eGFR, UPCR 6-monthly", "Liver USG annually (ARPKD: varices, spleen size)", "ADPKD: MRI TKV measurement annually if on tolvaptan"],
    pearls: ["Tolvaptan: liver toxicity monitoring (LFT monthly × 18 months) — TEMPO/REPRISE trials", "ARPKD bilateral nephrectomy pre-transplant if massive kidneys prevent growth", "ADPKD: intracranial aneurysm screening (MRA) if family history of rupture", "India: genetic testing at Medgenome, Strand Life Sciences; tolvaptan available as Samsca® ~₹3000/tab"]
  },
  nephronophthisis: {
    title: "Nephronophthisis / Ciliopathies (BBS, Joubert)",
    tag: "Genetic",
    color: "bg-teal-100 text-teal-800",
    guidance: "ERKNet · ISPN · CilioPathy Alliance",
    overview: "Ciliopathies — defects in primary cilia. NPHP: commonest genetic cause of CKD in children/adolescents. Associated syndromes: Joubert (JBTS/CEP290), Bardet-Biedl (BBS genes), Senior-Løken (retina+kidney).",
    diagnosis: ["NPHP: renal USG — normal/small kidneys, loss of CMD, cysts at cortico-medullary junction", "Genetic panel: NPHP1-21 (most common: NPHP1 deletion — 20%), CEP290, BBS1-19, JBTS genes", "Joubert: MRI brain — 'Molar tooth sign' (cerebellar vermis hypoplasia + elongated superior cerebellar peduncles)", "BBS: obesity + polydactyly + retinal dystrophy + cognitive + renal cysts — clinical diagnosis confirmed genetically", "India: AIIMS genetic panel, Medgenome ciliopathy panel"],
    treatment: ["No disease-modifying therapy currently available for NPHP", "ACEi: renoprotection in proteinuric CKD; BP control", "RRT planning: median age ESRD in NPHP1 = 13 years; infantile NPHP = 1–3 years", "Joubert: ophthalmology (retinal dystrophy), physiotherapy (ataxia), speech therapy", "BBS: obesity management — multidisciplinary; setmelanotide (MC4R agonist) — obesity in BBS", "Renal transplant: excellent outcomes — ciliopathy does not recur in transplant"],
    monitoring: ["eGFR, UPCR every 3–6 months", "USG kidneys annually", "Retinal exam (ERG) annually — Senior-Løken, BBS, Joubert", "Developmental assessment 6-monthly (Joubert, BBS)"],
    pearls: ["NPHP is NOT polycystic — small/normal kidneys with cortico-medullary cysts", "Family screening: autosomal recessive — 25% sibling risk", "Joubert 'molar tooth sign' on MRI is pathognomonic", "BBS: retinitis pigmentosa may not appear until school age — always get ERG"]
  },
  genetic_nephrotic: {
    title: "Genetic Nephrotic Syndromes",
    tag: "Genetic",
    color: "bg-indigo-100 text-indigo-800",
    guidance: "ISPN 2023 · IPNA Guidelines · ERKNet",
    overview: "Monogenic NS: ~30% of SRNS, ~80% of congenital NS. Key genes: NPHS1 (nephrin), NPHS2 (podocin), WT1, LAMB2, CD2AP, TRPC6, INF2. India: NPHS2 and NPHS1 most common.",
    diagnosis: ["Genetic panel: NPHS1, NPHS2, WT1, LAMB2, PLCE1, CD2AP, TRPC6, INF2, COQ genes (at minimum)", "Indication: SRNS, congenital NS (<3 months), family history, extra-renal features (Denys-Drash, Frasier, Nail-patella)", "Renal biopsy: FSGS, MCD, or DMS (diffuse mesangial sclerosis — congenital NS)", "WT1 mutation: always exclude Wilms tumour; karyotype if DSD features", "India: whole exome sequencing at AIIMS, Medgenome, Strand (~₹15,000–25,000)"],
    treatment: ["Steroid-resistant + genetic cause: do NOT continue prolonged steroid courses", "NPHS2 mutations: calcineurin inhibitors (CNI) — poor response; consider MMF or supportive only", "COQ mutations (COQ2, PDSS2): oral CoQ10 supplementation — dramatic response in some", "WT1 mutations (Denys-Drash): prophylactic bilateral nephrectomy before gonadoblastoma", "Renal transplant: recurrence risk low (NPHS1, NPHS2) except PLCE1 (high recurrence risk)", "India note: genetic testing may avoid unnecessary IS exposure — cost-effective long-term"],
    monitoring: ["UPCR, albumin monthly", "eGFR 3-monthly", "Extrarenal: ophtho (LAMB2 — Pierson syndrome), cardiac (TRPC6), hearing", "Genetic counseling for family"],
    pearls: ["NPHS1 (congenital Finnish): massive proteinuria from birth, placenta >25% birth weight", "NPHS2 p.R138Q mutation — common in South Asian SRNS — check before CNI", "COQ nephropathy: hearing loss + mitochondrial features + SRNS — CoQ10 life-saving", "Genetic diagnosis changes management completely — biopsy alone insufficient in SRNS"]
  }
};

export default function MetabolicGeneticPathways({ condition }) {
  const [section, setSection] = useState("overview");
  const data = CONDITIONS[condition];
  if (!data) return null;

  const sections = [
    { key: "overview", label: "Overview" },
    { key: "diagnosis", label: "Diagnosis" },
    { key: "treatment", label: "Treatment" },
    { key: "monitoring", label: "Monitoring" },
    { key: "pearls", label: "Clinical Pearls" },
  ];

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-gradient-to-r from-violet-700 to-indigo-700 p-5 text-white">
        <div className="flex items-center gap-3">
          <Dna className="w-7 h-7" />
          <div>
            <h2 className="text-xl font-bold">{data.title}</h2>
            <p className="text-violet-100 text-sm">{data.guidance}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5 mt-3">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${data.color}`}>{data.tag}</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {sections.map(s => (
          <button key={s.key} onClick={() => setSection(s.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${section === s.key ? "bg-violet-700 text-white" : "bg-white border border-slate-200 text-slate-600 hover:border-violet-300"}`}>
            {s.label}
          </button>
        ))}
      </div>

      <Card className="border-slate-200">
        <CardContent className="p-4 space-y-2">
          {section === "overview" && (
            <div className="bg-violet-50 border border-violet-200 rounded-lg p-4">
              <p className="text-sm text-violet-900 leading-relaxed">{data.overview}</p>
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

      <Card className="border-violet-200 bg-violet-50">
        <CardContent className="p-3">
          <div className="flex items-center gap-2 mb-1">
            <Info className="w-3.5 h-3.5 text-violet-600" />
            <p className="text-xs font-bold text-violet-700">India Access & Guidance</p>
          </div>
          <p className="text-xs text-violet-700">Genetic testing: AIIMS-New Delhi, CMC Vellore, Medgenome, Strand Life Sciences · ERKNet/ISPN guidance · Compassionate access programs available for rare therapies</p>
        </CardContent>
      </Card>
    </div>
  );
}