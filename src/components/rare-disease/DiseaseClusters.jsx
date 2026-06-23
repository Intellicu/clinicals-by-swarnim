import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dna, AlertTriangle, Activity, BookOpen, Users, ChevronDown, ChevronUp } from "lucide-react";

const CLUSTERS = [
  {
    id: "genetic_ns",
    name: "Genetic Nephrotic Syndrome",
    color: "purple",
    genes: "NPHS1 (nephrin), NPHS2 (podocin), WT1, LAMB2, COQ2/6/8, INF2, ADCK4",
    overview: "Monogenic nephrotic syndrome typically presents in infancy or early childhood, is steroid-resistant, and may be associated with extra-renal features. Accounts for ~30% of childhood SRNS.",
    red_flags: ["SRNS onset <1 year", "Finnish-type massive proteinuria at birth", "Male SRNS + ambiguous genitalia (Drash/Frasier)", "Family history of ESRD", "Biopsy showing diffuse mesangial sclerosis (DMS) or FSGS"],
    phenotype_clues: ["Nephrotic syndrome + male pseudohermaphroditism → WT1 mutations (Drash/Frasier)", "Neonatal NS (Finnish type) → NPHS1 (chromosome 19q13)", "NS + COQ enzyme deficiency features → COQ2/COQ6/ADCK4", "NS + deafness + eye changes → Pierson (LAMB2)"],
    diagnostic_workflow: ["Urine PCR, serum albumin, lipid profile", "Renal biopsy with EM and IF", "Complement, ANA, anti-PLA2R (rule out secondary)", "Targeted gene panel: NPHS1, NPHS2, WT1, LAMB2, INF2, COQ genes, ADCK4", "WES if panel negative", "Ophthalmology + audiology assessment"],
    genetics: "Autosomal recessive (NPHS1, NPHS2, LAMB2, COQ genes). X-linked (TCMN2). Autosomal dominant (INF2, TRPC6). De novo mutations in WT1 in Drash/Frasier syndrome.",
    monitoring: "Daily urine dipstick protein. Monthly serum albumin, cholesterol. Renal function 3-monthly. Nutritional assessment. Vitamin D, calcium. Growth monitoring.",
    transplant: "NPHS1: 25% FSGS recurrence risk post-transplant. NPHS2: low recurrence risk. WT1-FSGS: low recurrence. All require pre-transplant genetic diagnosis. Living related donors: screen for same mutation.",
    education: "Genetic counselling essential. Discuss recurrence risk (25% for AR, 50% for AD). Registry enrollment (RADAR, National rare disease registry).",
    references: ["IPNA Childhood NS Guidelines 2021", "Sadowski CE, NEJM 2015 — Genetic NS cohort", "ISPN Guidelines 2023"]
  },
  {
    id: "tubulopathy",
    name: "Tubulopathy",
    color: "amber",
    genes: "SLC3A1/SLC7A9 (cystinuria), CTNS (cystinosis), ATP6V1B1/ATP6V0A4 (dRTA), SLC12A1/KCNJ1 (Bartter), SLC12A3 (Gitelman), AVPR2/AQP2 (NDI), CLCN5/OCRL (Dent)",
    overview: "Hereditary tubulopathies affect proximal or distal tubular function, causing electrolyte and acid-base abnormalities, growth failure, and nephrocalcinosis/stones.",
    red_flags: ["Growth failure + polyuria + polydipsia", "Nephrocalcinosis in infant", "Hypokalemia + metabolic alkalosis (Bartter/Gitelman)", "Normal anion gap metabolic acidosis (RTA)", "Rickets + phosphaturia"],
    phenotype_clues: ["Fanconi syndrome + photophobia + failure to thrive → Cystinosis", "Severe hypovolemia + polyhydramnios → Bartter type 1/2", "Mild hypokalemia + hypomagnesemia + normal BP adult/adolescent → Gitelman", "Nephrocalcinosis + normal anion gap acidosis + hypokalemia → dRTA type 1/2"],
    diagnostic_workflow: ["Serum electrolytes, calcium, magnesium, phosphate, uric acid", "Urinary electrolytes, aminoaciduria screen, glucose, phosphate, TRP", "Urine pH (8 AM fasting)", "Urinary organic acids", "Cystine quantification if stones", "Leucocyte cystine levels (cystinosis)", "Slit lamp exam (cystinosis crystals at age >1 yr)", "Targeted gene panel"],
    genetics: "Mostly autosomal recessive. Dent disease X-linked (CLCN5). NDI: X-linked (AVPR2, 90%) or AR (AQP2).",
    monitoring: "Growth, height velocity. Electrolytes monthly during growth. Audiometry (Bartter type 4 — deafness). Renal ultrasound 6-monthly (stones/NC). Ophthalmology annually (cystinosis).",
    transplant: "Cystinosis: cysteamine halts renal decline but extra-renal deposits continue — lung, muscle, CNS. Transplant for ESRD. Recurrence: minimal for isolated tubular disorders.",
    education: "Written protocol for electrolyte emergencies (acute gastroenteritis — high decompensation risk in Bartter). Genetic counselling. School accommodation for polyuria.",
    references: ["ERKNet/ESPN Tubulopathy Guidelines 2021", "Ariceta et al. Ped Nephrol 2021 — Cystinosis review", "Bockenhauer D. Ped Nephrol 2022"]
  },
  {
    id: "ciliopathy",
    name: "Ciliopathy",
    color: "teal",
    genes: "PKHD1 (ARPKD), NPHP1-20 (nephronophthisis), AHI1, CC2D2A, BBS1-21 (Bardet-Biedl), TMEM67 (Joubert/MKS), OFD1",
    overview: "Ciliopathies are caused by dysfunction of primary cilia, affecting renal tubular cells causing fibrocystic renal disease with variable extra-renal manifestations (retina, CNS, liver, skeletal).",
    red_flags: ["Enlarged echogenic kidneys at birth → ARPKD", "Salt-wasting nephropathy + tubulointerstitial disease in adolescent → NPHP", "Molar tooth sign on MRI → Joubert syndrome", "Retinitis pigmentosa + obesity + polydactyly + renal → Bardet-Biedl"],
    phenotype_clues: ["Liver fibrosis + renal cysts → ARPKD or NPHP", "Retinitis pigmentosa + NPHP → Senior-Løken syndrome", "Polydactyly + obesity + hypogonadism + renal → BBS", "Congenital hepatic fibrosis + portal hypertension → ARPKD"],
    diagnostic_workflow: ["Renal ultrasound (cysts, echogenicity, size)", "LFT + liver imaging (hepatic fibrosis)", "Brain MRI (molar tooth, vermis hypoplasia)", "Ophthalmology — ERG, fundus photography", "Genetic panel (PKHD1 + NPHP panel + BBS panel)", "Echocardiogram (BBS — cardiac)", "Pulmonary function (BBS — obesity-related)"],
    genetics: "ARPKD: AR, PKHD1. NPHP: AR, most NPHP1 deletions (20%). BBS: AR. Joubert: AR, multiple genes.",
    monitoring: "Blood pressure (hypertension common). Renal function annually. LFT + portal pressure. Visual acuity + ERG. Growth monitoring. Neurodevelopment (Joubert).",
    transplant: "ARPKD: good outcomes. NPHP: good outcomes — may need bilateral nephrectomy if enlarged. BBS: significant obesity/metabolic comorbidity. Liver involvement may need combined liver-kidney transplant in ARPKD.",
    education: "Hepatic complications: varices, portal hypertension — GI gastroenterology co-management. Dietary support for BBS. Visual aids for RP. Cochlear implant assessment.",
    references: ["KDIGO PKD Guidelines 2015", "Hildebrandt F. Lancet 2009 — Ciliopathies review", "Bardet-Biedl Consortium guidelines 2023"]
  },
  {
    id: "complement_tma",
    name: "Complement / TMA",
    color: "red",
    genes: "CFH, CFI, CD46 (MCP), C3, CFB, THBD, DGKE, ADAMTS13",
    overview: "Thrombotic microangiopathy (TMA) caused by dysregulation of the complement alternative pathway (aHUS) or severe ADAMTS13 deficiency (TTP). Life-threatening without prompt diagnosis and complement inhibition.",
    red_flags: ["Microangiopathic haemolytic anaemia + thrombocytopenia + AKI", "Recurrent TMA after first episode", "Diarrhoea-negative TMA (STEC negative)", "Familial TMA", "TMA post-transplant"],
    phenotype_clues: ["TMA + low C3 + normal ADAMTS13 → aHUS (alternative pathway)", "TMA + ADAMTS13 <10% → TTP (consider PLASMIC score)", "TMA + DGKE mutation → infantile onset, steroid-sensitive", "Post-partum TMA → CFH/CFI/C3 mutations common"],
    diagnostic_workflow: ["Blood film: schistocytes", "ADAMTS13 activity (critical — result same day)", "C3, C4, CH50, AP50", "Anti-CFH antibodies", "STEC culture + PCR, Shiga toxin assay", "Complement genetic panel (CFH, CFI, CD46, C3, CFB, THBD)", "Renal biopsy (thrombotic microangiopathy pattern)"],
    genetics: "Pathogenic mutations found in 60–70% of aHUS: CFH (20–30%), CFI (4–10%), CD46 (5–15%), C3 (5–10%), CFB (1–4%), THBD (5%). Anti-CFH antibodies: 10% (associated with CFHR1-CFHR3 deletions).",
    monitoring: "LDH, platelets, Hb, creatinine: before each eculizumab infusion. C3/CH50 monthly. Anti-CFH antibodies annually (if initial positive). Complement genetics before transplant.",
    transplant: "HIGH recurrence risk for CFH, CFI, C3, CFB mutations without complement inhibition. Pre-emptive eculizumab mandatory for high-risk mutations. Combined liver-kidney transplant for CFH-mutated aHUS where eculizumab unavailable. CD46 mutations: good prognosis (cell-bound protein, replaced by donor organ).",
    education: "Patient emergency card mandatory. Fever = emergency. Meningococcal vaccination before eculizumab. Family screening for complement mutations.",
    references: ["KDIGO aHUS Controversies 2021", "Legendre CM NEJM 2013", "IJN 2025 — Eculizumab India guidance"]
  },
  {
    id: "metabolic_storage",
    name: "Metabolic / Storage",
    color: "violet",
    genes: "CTNS (cystinosis), GLA (Fabry), AGXT/GRHPR/HOGA1 (PH1/2/3), SLC22A12 (uromodulin), UMOD",
    overview: "Inborn errors of metabolism affecting the kidney through toxic metabolite accumulation, cellular storage, or enzyme deficiency leading to progressive nephropathy.",
    red_flags: ["Cystine crystals in cornea (slit lamp) in infant", "Recurrent calcium oxalate stones <5 years → PH", "Angiokeratomas + acral pain + renal disease in young male → Fabry", "End-stage renal disease + cardiomyopathy/stroke without clear cause in young adult → Fabry"],
    phenotype_clues: ["Photophobia + FTT + Fanconi syndrome in infant → Cystinosis", "Male + acral burning pain + corneal whorl (cornea verticillata) + cardiomyopathy → Fabry disease", "Nephrocalcinosis + recurrent oxalate stones from infancy → PH1 (AGXT mutation)"],
    diagnostic_workflow: ["Slit lamp eye exam (cystinosis: corneal cystine crystals; Fabry: verticillata)", "Leucocyte cystine levels (cystinosis)", "Alpha-galactosidase A activity (plasma/leucocytes — Fabry in males)", "GLA gene sequencing (females)", "Urinary oxalate, glycolate, glycerate (PH1/2/3)", "Plasma oxalate (if eGFR <30)", "Liver biopsy for AGXT enzyme assay (PH1)", "WES if diagnosis unclear"],
    genetics: "Cystinosis: AR, CTNS. Fabry: X-linked, GLA. PH1: AR, AGXT. PH2: AR, GRHPR. PH3: AR, HOGA1.",
    monitoring: "Cystinosis: leucocyte cystine monthly (target <0.5 nmol/mg protein). Fabry: eGFR, cardiac MRI, LGE, neurological annually. PH: oxalate, renal ultrasound (NC), ophthalmology (retinal oxalate deposits).",
    transplant: "Cystinosis: transplant for ESRD. Cysteamine does not protect transplanted kidney from original disease, but extra-renal deposits continue — treat systemically. Fabry: ERT peri-transplant. PH1: liver-kidney transplant (liver has AGXT enzyme — corrects metabolic defect). PH2/3: isolated kidney transplant possible.",
    education: "Cystinosis: eye drops (mercaptamine) for corneal crystals. Fabry: ERT infusion schedule, angiokeratoma skin management. PH: high fluid intake (>3 L/m²/day), urinary alkalinisation, oxalate-restricted diet.",
    references: ["EFACTS Fabry Registry", "OHF Primary Hyperoxaluria Guidelines 2023", "CTNS Cystinosis Foundation guidelines"]
  },
  {
    id: "syndromic_cakut",
    name: "Syndromic CAKUT",
    color: "blue",
    genes: "PAX2, HNF1B, EYA1, SIX1, SALL1 (Townes-Brocks), KAL1/FGFR1 (Kallmann), CHD7 (CHARGE), DYRK1A",
    overview: "Congenital anomalies of kidney and urinary tract (CAKUT) with associated extra-renal malformations. Accounts for the largest proportion of pediatric CKD/ESRD. Genetic cause found in ~20% of isolated CAKUT and higher in syndromic forms.",
    red_flags: ["Renal agenesis/hypoplasia + ear anomalies → Branchio-oto-renal syndrome", "Renal cysts + diabetes + MODY5 → HNF1B mutations", "Structural CHD + renal anomalies → CHARGE syndrome, DiGeorge", "Absent corpus callosum + CAKUT → PAX2 (renal coloboma)"],
    phenotype_clues: ["Renal + optic disc coloboma + vesicoureteric reflux → PAX2/renal coloboma", "Renal hypoplasia + MODY type 5 + pancreatic atrophy → HNF1B", "Preauricular pits + hearing loss + branchial cysts + renal anomalies → BOR (EYA1/SIX1)", "Unilateral renal agenesis + contralateral PUJ obstruction → common sporadic CAKUT"],
    diagnostic_workflow: ["Detailed fetal/neonatal renal ultrasound", "VCUG / MAG3 renogram (reflux assessment)", "Chromosomal microarray (SNP array)", "HNF1B deletion/sequencing", "PAX2 sequencing", "Ophthalmology (coloboma, optic nerve)", "Audiology + ENT (BOR syndrome)", "Echocardiogram if cardiac features"],
    genetics: "Mostly sporadic or autosomal dominant. Copy number variants (22q11, 1q21) in ~10%. HNF1B: AD, de novo in 50%.",
    monitoring: "BP monitoring (renovascular hypertension). Renal function every 6 months. UTI surveillance and prophylaxis. Growth monitoring. HNF1B: diabetes monitoring from age 10. Ophthalmology yearly (PAX2).",
    transplant: "ESRD outcomes: good. Pre-transplant: urological assessment (voiding dysfunction, residual bladder capacity). Bladder augmentation if needed before transplant.",
    education: "Antenatal diagnosis counselling. Urological surgery referral early. Bladder diary. UTI recognition. School support for renal disease management.",
    references: ["IPNA CAKUT guidelines 2021", "Vivante A, NEJM 2014 — CAKUT genetics", "ESPN CAKUT working group 2022"]
  },
];

const COLOR_MAP = {
  purple: { badge: "bg-purple-100 text-purple-800", header: "bg-purple-50", border: "border-purple-200" },
  amber: { badge: "bg-amber-100 text-amber-800", header: "bg-amber-50", border: "border-amber-200" },
  teal: { badge: "bg-teal-100 text-teal-800", header: "bg-teal-50", border: "border-teal-200" },
  red: { badge: "bg-red-100 text-red-800", header: "bg-red-50", border: "border-red-200" },
  violet: { badge: "bg-violet-100 text-violet-800", header: "bg-violet-50", border: "border-violet-200" },
  blue: { badge: "bg-blue-100 text-blue-800", header: "bg-blue-50", border: "border-blue-200" },
};

function AccordionSection({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors text-left">
        <span className="font-semibold text-sm text-slate-800">{title}</span>
        {open ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
      </button>
      {open && <div className="p-4 bg-white">{children}</div>}
    </div>
  );
}

function ClusterDetail({ cluster }) {
  const c = COLOR_MAP[cluster.color];
  return (
    <div className="space-y-3">
      <div className={`rounded-lg border ${c.border} ${c.header} p-4`}>
        <p className="text-xs font-bold text-slate-600 uppercase mb-1">Key Genes</p>
        <p className="text-sm text-slate-800 font-mono">{cluster.genes}</p>
      </div>
      <AccordionSection title="Overview" defaultOpen>
        <p className="text-sm text-slate-700 leading-relaxed">{cluster.overview}</p>
      </AccordionSection>
      <AccordionSection title="🚩 Red Flags — When to Suspect">
        <ul className="space-y-1">{cluster.red_flags.map((r, i) => <li key={i} className="text-sm text-red-800 flex items-start gap-2"><span className="text-red-500 mt-0.5">▶</span>{r}</li>)}</ul>
      </AccordionSection>
      <AccordionSection title="Phenotype Clues & Pattern Recognition">
        <ul className="space-y-1">{cluster.phenotype_clues.map((r, i) => <li key={i} className="text-sm text-slate-700 flex items-start gap-2"><span className="text-violet-500 mt-0.5">◆</span>{r}</li>)}</ul>
      </AccordionSection>
      <AccordionSection title="Diagnostic Workflow">
        <ol className="space-y-1">{cluster.diagnostic_workflow.map((r, i) => <li key={i} className="text-sm text-slate-700 flex items-start gap-2"><span className="font-bold text-indigo-600 min-w-[20px]">{i + 1}.</span>{r}</li>)}</ol>
      </AccordionSection>
      <AccordionSection title="Genetics">
        <p className="text-sm text-slate-700 leading-relaxed">{cluster.genetics}</p>
      </AccordionSection>
      <AccordionSection title="Monitoring Protocol">
        <p className="text-sm text-slate-700 leading-relaxed">{cluster.monitoring}</p>
      </AccordionSection>
      <AccordionSection title="Transplant Implications">
        <p className="text-sm text-slate-700 leading-relaxed">{cluster.transplant}</p>
      </AccordionSection>
      <AccordionSection title="Patient & Family Education">
        <p className="text-sm text-slate-700 leading-relaxed">{cluster.education}</p>
      </AccordionSection>
      <AccordionSection title="Key References">
        <ul className="space-y-1">{cluster.references.map((r, i) => <li key={i} className="text-xs text-slate-500 flex items-start gap-2"><BookOpen className="w-3 h-3 flex-shrink-0 mt-0.5" />{r}</li>)}</ul>
      </AccordionSection>
    </div>
  );
}

export default function DiseaseClusters({ isAdmin }) {
  return (
    <div className="space-y-3">
      <Tabs defaultValue="genetic_ns">
        <div className="overflow-x-auto pb-1">
          <TabsList className="inline-flex h-auto gap-1 bg-white border border-slate-200 rounded-xl p-1 min-w-full overflow-x-auto">
            {CLUSTERS.map(c => (
              <TabsTrigger key={c.id} value={c.id} className="flex-shrink-0 px-3 py-2 text-xs rounded-lg whitespace-nowrap data-[state=active]:bg-violet-600 data-[state=active]:text-white">
                {c.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        {CLUSTERS.map(c => (
          <TabsContent key={c.id} value={c.id}>
            <Card className="bg-white border border-slate-200 shadow-sm">
              <CardHeader className={`${COLOR_MAP[c.color].header} border-b py-4 px-5`}>
                <CardTitle className="flex items-center gap-2">
                  <Dna className="w-5 h-5 text-violet-600" />
                  {c.name}
                  <Badge className={COLOR_MAP[c.color].badge}>Disease Cluster</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <ClusterDetail cluster={c} />
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}