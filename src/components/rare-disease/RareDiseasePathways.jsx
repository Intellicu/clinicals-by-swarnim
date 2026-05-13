import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronDown, ChevronUp, BookOpen, AlertTriangle } from "lucide-react";

const PATHWAYS = [
  {
    id: "ahus",
    name: "aHUS",
    full: "Atypical Haemolytic Uraemic Syndrome",
    gene: "CFH, CFI, CD46, C3, CFB, THBD, DGKE",
    color: "red",
    overview: "Complement-mediated TMA caused by dysregulation of alternative complement pathway. Not related to STEC. Life-threatening without eculizumab. Recurrence risk post-transplant is high without complement inhibition.",
    genetics: "Pathogenic mutations in ~60–70% of patients. CFH mutations most common (20–30%). Anti-CFH antibodies in ~10% (assoc. CFHR1/3 deletion). DGKE: infantile onset, steroid-responsive features. AR: DGKE. AD/de novo: CFH, CFI, C3, CFB.",
    red_flags: ["TMA + STEC-negative + ADAMTS13 normal", "Recurrent TMA after first episode", "Familial TMA", "Post-partum TMA", "TMA post-transplant", "TMA + low C3"],
    diagnostic: ["Blood film: schistocytes", "ADAMTS13 activity (exclude TTP)", "STEC cultures + PCR + Shiga toxin", "C3, C4, CH50, AP50", "Anti-CFH antibodies", "Complement genetic panel (CFH/I/B, CD46, C3, THBD, DGKE)", "Renal biopsy (TMA pattern on EM)", "sC5b-9 (terminal complement activation marker)"],
    monitoring: "LDH, Hb, platelets, creatinine before each eculizumab infusion. CH50/AP50 monthly. Anti-CFH titres 3-monthly (if positive). Urinalysis. Annual meningococcal antibody titres.",
    ckd: "Most patients have residual CKD after acute episode. Monitor eGFR, BP, proteinuria. Continue eculizumab maintenance even with normal renal function — complement-mediated injury continues without treatment.",
    transplant: "HIGH recurrence risk for CFH, CFI, C3, CFB mutations. Pre-emptive eculizumab mandatory peri-transplant. CD46: good prognosis (cell-bound, replaced by donor organ). Anti-CFH antibodies: treat with plasma exchange + immunosuppression + eculizumab. DGKE: good transplant outcome.",
    family_screening: "Screen all 1st-degree relatives for CFH/CFI/CD46/C3/CFB mutations. Anti-CFH antibodies in siblings. Genetic counselling for AR (DGKE) and AD (CFH/C3) inheritance.",
    references: ["KDIGO aHUS Controversies 2021", "Legendre CM NEJM 2013", "Caprioli J JASN 2006", "IJN 2025 Eculizumab India"]
  },
  {
    id: "cystinosis",
    name: "Cystinosis",
    full: "Cystinosis (CTNS Mutation)",
    gene: "CTNS (17p13)",
    color: "amber",
    overview: "Autosomal recessive lysosomal storage disorder of cystine transport. Nephropathic cystinosis is the most common inherited cause of Fanconi syndrome in childhood. Without treatment, ESRD by age 10. Cysteamine therapy slows progression.",
    genetics: "AR, CTNS gene. Most common mutation: 57 kb deletion in European populations (57% of alleles). Missense mutations in Indian/Asian populations. Genotype-phenotype correlation: non-nephropathic (ocular only) = mild mutations.",
    red_flags: ["Failure to thrive + polyuria + photophobia in infancy", "Fanconi syndrome (glycosuria, phosphaturia, aminoaciduria)", "Corneal cystine crystals >1 year (slit lamp)", "Progressive renal failure in pre-teen without clear GN"],
    diagnostic: ["Leucocyte cystine levels (normal <0.2 nmol/mg protein; diagnostic >1.0)", "Slit lamp examination (corneal crystals)", "Urine: glucose, amino acids, phosphate, protein, calcium", "TRP, FENa, FEK (Fanconi syndrome)", "Renal ultrasound (medullary NC)", "CTNS gene sequencing / deletion analysis", "Thyroid function (cystine deposits)", "Rectal mucosa biopsy (alternative to leucocyte measurement)"],
    monitoring: "Leucocyte cystine monthly (target <0.5 nmol/mg protein on cysteamine). Renal function, electrolytes monthly in childhood. Ophthalmology annual (corneal crystals + retinal changes). Thyroid function annually (hypothyroidism). Swallow assessment (dysphagia). Pulmonary function (older patients). Muscle weakness assessment. Neurological review.",
    ckd: "Progressive without treatment. Fanconi syndrome → rickets, growth failure → CKD stage 5 by ~10 years untreated. Cysteamine (oral) + cysteamine eye drops prolong renal function but do not reverse tubular damage. Transplant corrects renal failure but does NOT correct systemic cystine storage — continue cysteamine lifelong.",
    transplant: "Excellent transplant outcomes. Donor kidney does NOT develop cystinosis (no CTNS mutation). However: continue cysteamine post-transplant for extra-renal disease (eyes, thyroid, muscle, CNS). Cystinosis encephalopathy in adolescents/adults — white matter changes, swallowing difficulty.",
    family_screening: "AR inheritance. Carrier testing for parents and siblings. Prenatal diagnosis: CTNS sequencing from chorionic villus sample. Sibling newborn screening: leucocyte cystine at birth.",
    references: ["Ariceta G et al. Ped Nephrol 2021", "Nesterova G. Paediatric Nephrology 2022", "CTNS Foundation Guidelines 2023"]
  },
  {
    id: "fabry",
    name: "Fabry Disease",
    full: "Fabry Disease (Alpha-Galactosidase A Deficiency)",
    gene: "GLA (Xq22) — X-linked",
    color: "violet",
    overview: "X-linked lysosomal storage disorder of alpha-galactosidase A deficiency, causing Gb3 accumulation in endothelium, renal cells, cardiac myocytes, and neurons. Males: classic severe phenotype. Females: heterozygous but can have significant disease.",
    genetics: "X-linked, GLA gene (Xq22). >1000 mutations identified. Classic mutations: missense causing severe enzyme deficiency. Later-onset cardiac/renal variant mutations: residual enzyme activity. Females: random X-inactivation → variable severity.",
    red_flags: ["Young male + acral burning pain + angiokeratomas (umbilical/groin)", "Cornea verticillata (whorl opacity on slit lamp) in male/female", "Unexplained LVH in young adult without hypertension", "Stroke/TIA in young adult without risk factors", "Proteinuria/CKD in young adult male"],
    diagnostic: ["Alpha-galactosidase A enzyme activity (plasma/leucocytes) — males", "GLA gene sequencing (females: enzyme may be normal)", "Urine Gb3 and lyso-Gb3 levels", "Renal biopsy (EM: Zebra bodies/lamellated inclusions in podocytes)", "Echocardiogram + cardiac MRI (LGE)", "Ophthalmology (slit lamp: cornea verticillata)", "Brain MRI (white matter lesions, posterior fossa)", "Audiometry"],
    monitoring: "eGFR + urine protein annually. Urine Gb3/lyso-Gb3 (treatment response). Cardiac MRI + echo every 2 years. Holter monitoring (arrhythmia). Ophthalmology annually. Brain MRI every 2–3 years. Pain score assessment. QOL assessment.",
    ckd: "Progressive nephropathy in all males by 3rd–4th decade without ERT. Proteinuria is early marker. RAS blockade (ACEi/ARB) for proteinuria. ERT (agalsidase alfa or beta) slows renal decline. Migalastat (oral chaperone therapy): for amenable mutations — check database.",
    transplant: "Good transplant outcomes. ERT should be continued post-transplant. Cardiac disease may be the limiting comorbidity. Screen cardiac function carefully pre-transplant.",
    family_screening: "All sisters of affected males: GLA sequencing (X-linked — 50% carrier risk). Sons of affected males: not affected (Y chromosome). Daughters of affected males: obligate carriers. Screen extended family.",
    references: ["EFACTS Registry 2020", "Germain D. Best Practice Res Clin Endocrinol 2021", "KDIGO Fabry guidance 2023"]
  },
  {
    id: "arpkd",
    name: "ARPKD",
    full: "Autosomal Recessive Polycystic Kidney Disease",
    gene: "PKHD1 (6p21) — DZIP1L rare",
    color: "teal",
    overview: "The most common form of cystic renal disease in neonates and infants. Characterised by enlarged echogenic kidneys, dilated collecting ducts (not true cysts), and congenital hepatic fibrosis with portal hypertension.",
    genetics: "AR, PKHD1 gene. >800 mutations. Genotype-phenotype not strict. Two truncating mutations: severe neonatal. One missense: milder. DZIP1L: rare form without liver disease.",
    red_flags: ["Enlarged echogenic kidneys on prenatal/neonatal ultrasound", "Oligohydramnios + Potter sequence", "Neonatal respiratory failure (pulmonary hypoplasia)", "Hypertension in infant", "Hepatosplenomegaly + varices in child"],
    diagnostic: ["Renal ultrasound (enlarged kidneys, diffuse echogenicity, radially-arranged cysts)", "Liver ultrasound (increased echogenicity, periportal fibrosis)", "PKHD1 sequencing", "LFT, portal vein Doppler", "Renal function, electrolytes", "Echo (neonatal hypertension)", "Pulmonary function in neonatal period (ventilator support assessment)"],
    monitoring: "BP monitoring (hypertension common — needs treatment). Renal function 3-monthly in first years. LFT, portal vein flow, oesophageal varices from age 2–3 years. Urine concentration ability. Growth monitoring. Nutritional assessment.",
    ckd: "Variable — 50% have ESRD by age 20 years. Hypertension accelerates progression. ACEi recommended. Salt wasting — do not restrict sodium in infancy. Portal hypertension complications: varices, hypersplenism, hepatopulmonary syndrome.",
    transplant: "Combined liver-kidney transplant if ESRD + significant portal hypertension. Isolated kidney transplant if liver disease is manageable. Bilateral nephrectomy may be needed if kidneys too large. Good long-term outcomes.",
    family_screening: "AR: 25% risk per pregnancy. PKHD1 sequencing of both parents. Prenatal diagnosis: CVS + PKHD1 sequencing.",
    references: ["KDIGO PKD Guidelines 2015", "Sweeney WE. Ped Nephrol 2022", "ESPN ARPKD working group 2021"]
  },
  {
    id: "nphp",
    name: "Nephronophthisis",
    full: "Nephronophthisis (NPHP)",
    gene: "NPHP1 (most common), NPHP3–20, CEP290, TMEM67",
    color: "blue",
    overview: "Autosomal recessive cystic tubulointerstitial nephropathy. Leading genetic cause of ESRD in children and adolescents. Characterised by polyuria, salt wasting, and progressive CKD, often with extra-renal features (retina, CNS, liver, skeletal).",
    genetics: "AR. NPHP1: large homozygous deletion (most common — 20%). CEP290: associated with Joubert, Senior-Løken. TMEM67: Joubert + hepatic fibrosis. NPHP3/NPHP4: earlier ESRD.",
    red_flags: ["Polyuria + growth failure + progressive CKD in adolescent", "Small-normal sized kidneys with increased echogenicity (not enlarged)", "Retinitis pigmentosa + renal disease → Senior-Løken syndrome", "Molar tooth sign on brain MRI → Joubert (CEP290/CC2D2A)", "Situs inversus + bronchiectasis + NPHP → Bardet-Biedl"],
    diagnostic: ["Renal ultrasound (small/normal kidneys, echogenic, ± corticomedullary cysts)", "Urine concentration ability test", "Serum electrolytes, creatinine", "Brain MRI (molar tooth sign in Joubert)", "Ophthalmology — ERG (RP)", "Array CGH (NPHP1 deletion)", "NPHP gene panel / WES", "Liver biopsy if hepatic fibrosis suspected"],
    monitoring: "Renal function every 6 months. Blood pressure. Fluid and electrolyte balance (salt wasting). Visual acuity + ERG annually. Liver function. Neurodevelopmental assessment (Joubert).",
    ckd: "ESRD by median age 13 (NPHP1), 9 years (NPHP3), 20+ years (NPHP4). Salt wasting — ensure adequate sodium and fluid intake, especially during illness. Anaemia of CKD. Growth hormone assessment.",
    transplant: "Excellent transplant outcomes. NPHP does not recur in transplanted kidney. No specific peri-transplant precautions beyond standard. Pre-transplant: optimise nutrition, manage anaemia and growth.",
    family_screening: "AR inheritance: 25% risk per pregnancy. NPHP1 deletion analysis in siblings. NPHP gene panel for parents to guide prenatal diagnosis.",
    references: ["Hildebrandt F. NEJM 2010 — Nephronophthisis review", "Halbritter J. JASN 2013", "ESPN ciliopathy guidelines 2022"]
  },
  {
    id: "ph1",
    name: "PH1",
    full: "Primary Hyperoxaluria Type 1",
    gene: "AGXT (2q37) — peroxisomal AGT enzyme",
    color: "orange",
    overview: "Most common and severe primary hyperoxaluria. Deficiency of hepatic alanine:glyoxylate aminotransferase (AGT) leads to oxalate overproduction and systemic oxalosis. Without treatment: ESRD by adolescence/young adulthood with multi-organ oxalate deposits.",
    genetics: "AR, AGXT gene. G170R mutation: 30% of alleles in European (mistargeted mitochondrial AGT — responds to pyridoxine ~30%). I244T: common. Genotype predicts pyridoxine response.",
    red_flags: ["Calcium oxalate stones <5 years", "Nephrocalcinosis from infancy", "ESRD + oxalate deposits in bone, eye, heart, nerves", "Recurrent stones + retinal oxalate crystals", "Rapidly declining eGFR in teenager with stone disease"],
    diagnostic: ["24-h urine oxalate (>0.5 mmol/1.73m²/day diagnostic)", "Spot urine oxalate:creatinine (>0.1 mmol/mmol)", "Plasma oxalate (if eGFR <30: >30 μmol/L)", "Urine glycolate (elevated in PH1)", "AGXT sequencing ± deletion analysis", "Liver biopsy for AGT enzyme assay (PH1 vs PH2 vs PH3 differentiation)", "Ophthalmology (retinal oxalate crystals)", "Bone marrow / cardiac echo (systemic oxalosis if advanced)"],
    monitoring: "24-h urine oxalate + citrate 3-monthly. eGFR 3-monthly. Renal ultrasound (stone burden, NC) every 6 months. Plasma oxalate if eGFR <30. Ophthalmology annually. Echocardiogram (oxalate cardiomyopathy if advanced).",
    ckd: "High-dose pyridoxine 5–20 mg/kg/day (max 400 mg) if AGXT mutation predicts response. Lumasiran (siRNA — Oxlumo): first-line in all ages in PH1 — dramatically reduces urinary oxalate. Intensive dialysis (6×/week HD) pre-transplant if eGFR <30 to remove oxalate. Post-transplant: continue lumasiran.",
    transplant: "Liver-kidney transplant historically: corrects AGT deficiency (liver) + replaces damaged kidney. Lumasiran now enables isolated kidney transplant if oxalate production controlled. Pre-transplant plasma oxalate must be <15 μmol/L. Post-transplant: continue lumasiran. Dialysis between listing and transplant: intensive to reduce oxalate burden.",
    family_screening: "AR: 25% recurrence risk. Screen siblings with 24-h urine oxalate. AGXT sequencing. Prenatal diagnosis: AGXT from CVS.",
    references: ["OHF PH Guidelines 2023", "Garrelfs SF NEJM 2021 — ILLUMINATE-A (lumasiran)", "Hoppe B. Ped Nephrol 2022"]
  },
  {
    id: "alport",
    name: "Alport Syndrome",
    full: "Alport Syndrome",
    gene: "COL4A5 (X-linked), COL4A3/COL4A4 (AR/AD)",
    color: "indigo",
    overview: "Hereditary nephritis due to mutations in type IV collagen genes. Affects glomerular basement membrane, lens, and cochlea. Leading genetic cause of ESRD with progressive haematuria + proteinuria from childhood.",
    genetics: "X-linked (80%): COL4A5 (Xq22). Males: progressive. Females: variable. AR (15%): COL4A3/COL4A4 — severe like X-linked males. AD (5%): COL4A3/COL4A4 — mild, often diagnosed as thin basement membrane nephropathy.",
    red_flags: ["Persistent microscopic haematuria from childhood in male", "Family history of haematuria + CKD/ESRD in maternal uncles or grandfather", "Bilateral SNHL (high-frequency) + renal disease", "Anterior lenticonus (slit lamp: oil droplet appearance) + haematuria", "Biopsy: thinning/lamellation/splitting of GBM on EM"],
    diagnostic: ["Renal biopsy: light microscopy + EM (thinning, splitting, lamellation of GBM) + IF (type IV collagen staining: absent alpha-5 in X-linked males)", "Audiometry (SNHL — high frequency)", "Ophthalmology (lenticonus, macular flecks, posterior polymorphous corneal dystrophy)", "COL4A3/A4/A5 gene sequencing (NGS panel)", "Skin biopsy (type IV collagen staining — simpler than renal biopsy in males)", "Urine ACR + renal function annually from diagnosis"],
    monitoring: "Urine ACR: annually. Once proteinuria >0.2 mg/mg — start RAS blockade. Audiometry every 2 years (from age 5). Ophthalmology every 2–3 years. BP monthly. eGFR 6-monthly once CKD stage 3+.",
    ckd: "Start RAS blockade (ACEi) as soon as proteinuria appears (even micro). Slows progression by ~5–10 years in males. Consider cyclosporine if ACEi-resistant rapid progression. Goal: delay ESRD as long as possible.",
    transplant: "Excellent transplant outcomes. ~3% risk of anti-GBM disease post-transplant (when COL4A3/A4/A5-null patients receive normal GBM — formed against neo-antigen). Screen for post-transplant anti-GBM antibodies.",
    family_screening: "X-linked: screen all first-degree female relatives (obligate carriers in maternal line). All male relatives at risk. AR: siblings 25% risk. AD: autosomal, 50% risk. Audiometry + urinalysis for all at-risk relatives.",
    references: ["KDIGO Alport Syndrome 2021 guideline", "Rheault MN Ped Nephrol 2020", "Gross O. Lancet 2020"]
  },
];

const COLOR_MAP = {
  red: { badge: "bg-red-100 text-red-800", header: "bg-red-50 border-red-200", tab: "text-red-700" },
  amber: { badge: "bg-amber-100 text-amber-800", header: "bg-amber-50 border-amber-200", tab: "text-amber-700" },
  violet: { badge: "bg-violet-100 text-violet-800", header: "bg-violet-50 border-violet-200", tab: "text-violet-700" },
  teal: { badge: "bg-teal-100 text-teal-800", header: "bg-teal-50 border-teal-200", tab: "text-teal-700" },
  blue: { badge: "bg-blue-100 text-blue-800", header: "bg-blue-50 border-blue-200", tab: "text-blue-700" },
  orange: { badge: "bg-orange-100 text-orange-800", header: "bg-orange-50 border-orange-200", tab: "text-orange-700" },
  indigo: { badge: "bg-indigo-100 text-indigo-800", header: "bg-indigo-50 border-indigo-200", tab: "text-indigo-700" },
};

function Section({ title, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 text-left">
        <span className="font-semibold text-sm text-slate-800">{title}</span>
        {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>
      {open && <div className="p-4 bg-white text-sm text-slate-700 leading-relaxed">{children}</div>}
    </div>
  );
}

function PathwayDetail({ p }) {
  const c = COLOR_MAP[p.color];
  return (
    <div className="space-y-3">
      <div className={`rounded-lg border p-3 ${c.header}`}>
        <span className="text-xs font-bold text-slate-500 uppercase">Genes: </span>
        <code className="text-xs font-mono">{p.gene}</code>
      </div>
      <Section title="Overview"><p>{p.overview}</p></Section>
      <Section title="Genetics"><p>{p.genetics}</p></Section>
      <Section title="🚩 Red Flags">
        <ul className="space-y-1">{p.red_flags.map((r, i) => <li key={i} className="flex items-start gap-2 text-red-800"><span className="text-red-400">▶</span>{r}</li>)}</ul>
      </Section>
      <Section title="Diagnostic Algorithm">
        <ol className="space-y-1">{p.diagnostic.map((d, i) => <li key={i} className="flex items-start gap-2"><span className="font-bold text-indigo-600 min-w-[20px]">{i + 1}.</span>{d}</li>)}</ol>
      </Section>
      <Section title="Monitoring Protocol"><p>{p.monitoring}</p></Section>
      <Section title="CKD Progression & Treatment"><p>{p.ckd}</p></Section>
      <Section title="Transplant Considerations"><p>{p.transplant}</p></Section>
      <Section title="Family Screening"><p>{p.family_screening}</p></Section>
      <Section title="References">
        <ul className="space-y-1">{p.references.map((r, i) => <li key={i} className="flex items-start gap-2 text-xs text-slate-500"><BookOpen className="w-3 h-3 flex-shrink-0 mt-0.5" />{r}</li>)}</ul>
      </Section>
    </div>
  );
}

export default function RareDiseasePathways({ isAdmin }) {
  return (
    <Tabs defaultValue="ahus">
      <div className="overflow-x-auto pb-1 mb-3">
        <TabsList className="inline-flex h-auto gap-1 bg-white border border-slate-200 rounded-xl p-1 min-w-full md:grid md:grid-cols-7">
          {PATHWAYS.map(p => (
            <TabsTrigger key={p.id} value={p.id} className="px-2 py-2 text-xs rounded-lg whitespace-nowrap data-[state=active]:bg-violet-600 data-[state=active]:text-white">
              {p.name}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
      {PATHWAYS.map(p => (
        <TabsContent key={p.id} value={p.id}>
          <Card className="bg-white border border-slate-200 shadow-sm">
            <CardHeader className={`border-b py-4 px-5 ${COLOR_MAP[p.color].header}`}>
              <CardTitle className="flex items-center gap-2 flex-wrap">
                <span className="text-base">{p.full}</span>
                <Badge className={COLOR_MAP[p.color].badge}>Rare Disease Pathway</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4"><PathwayDetail p={p} /></CardContent>
          </Card>
        </TabsContent>
      ))}
    </Tabs>
  );
}