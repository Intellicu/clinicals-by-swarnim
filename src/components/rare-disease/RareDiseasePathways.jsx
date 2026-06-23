import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ChevronDown, ChevronUp, BookOpen, Pencil, Check, X, Plus, Trash2, RefreshCw, ExternalLink, Loader2, GitBranch } from "lucide-react";

// ── Diagnostic Algorithms ─────────────────────────────────────────────────
const PATHWAY_ALGORITHMS = {
  ahus: [
    { type: "start", text: "TMA presentation: Microangiopathic haemolytic anaemia (MAHA) + thrombocytopenia + AKI" },
    { type: "decision", text: "Step 1 — Exclude TTP: ADAMTS13 activity >10%? If <10% → TTP (FFP/eculizumab for TMA not indicated)" },
    { type: "action", text: "Step 2 — Exclude STEC-HUS: Stool culture + Shiga toxin PCR. STEC+ + diarrhoeal prodrome → STEC-HUS (supportive only)" },
    { type: "action", text: "Step 3 — Complement workup: C3↓ with C4 normal (alternative pathway). sC5b-9 elevated. Anti-CFH antibodies (ELISA)." },
    { type: "action", text: "Step 4 — Genetic panel: CFH, CFI, CD46, C3, CFB, THBD, DGKE + CFHR1/3 deletion (MLPA)" },
    { type: "decision", text: "Anti-CFH antibodies positive? → Plasma exchange daily (60–75 mL/kg FFP) + Rituximab/Cyclophosphamide + Steroids" },
    { type: "outcome", text: "STEC-negative + ADAMTS13 normal + Anti-CFH negative = aHUS → Eculizumab URGENTLY (within 24h if life-threatening). Meningococcal vaccination first if possible." },
  ],
  cystinosis: [
    { type: "start", text: "Infant 6–18 months: FTT + polyuria + photophobia + Fanconi syndrome features" },
    { type: "action", text: "Urine Fanconi panel: glycosuria (BG normal), aminoaciduria, phosphaturia, bicarbonaturia, K+ wasting" },
    { type: "action", text: "Slit-lamp exam: cystine crystals (pathognomonic from age 1 year). Renal USS: medullary nephrocalcinosis." },
    { type: "decision", text: "Leucocyte cystine level: >3.0 nmol/mg = diagnostic (normal <0.2). Genetic: CTNS sequencing + 57kb deletion (MLPA)" },
    { type: "action", text: "Organ workup: TFT (hypothyroidism), blood glucose (pancreatic), swallowing assessment (>10y), pulmonary function (>15y)" },
    { type: "outcome", text: "Start cysteamine immediately (10→50 mg/kg/day in 4 doses). Target leucocyte cystine <1.0 nmol/mg. Cysteamine eye drops. Electrolyte + phosphate + calcitriol replacement." },
  ],
  fabry: [
    { type: "start", text: "Young male: acral pain + angiokeratomas + corneal verticillata OR unexplained LVH/stroke/CKD" },
    { type: "action", text: "Enzyme assay: alpha-galactosidase A (plasma/leucocytes) — markedly low in males; may be normal in females" },
    { type: "decision", text: "If female or uncertain: GLA gene sequencing (mandatory — enzyme assay unreliable in heterozygous females)" },
    { type: "action", text: "Urine Gb3 + lyso-Gb3 (sensitive biomarkers, useful in females). Renal biopsy: Zebra bodies on EM." },
    { type: "action", text: "Organ staging: ECHO + cardiac MRI (LGE), brain MRI, ophthalmology, audiometry, eGFR + urine ACR, nerve conduction" },
    { type: "outcome", text: "Check migalastat amenability table. If amenable → Migalastat (oral). If not → ERT (agalsidase alfa/beta). ACEi/ARB for proteinuria. Pain: carbamazepine/gabapentin." },
  ],
  arpkd: [
    { type: "start", text: "Prenatal: enlarged echogenic kidneys ± oligohydramnios. Neonatal: Potter sequence, respiratory failure, hypertension" },
    { type: "action", text: "Renal USS: bilaterally enlarged kidneys with increased echogenicity, radially-arranged dilated collecting ducts. Liver USS: periportal fibrosis." },
    { type: "decision", text: "Genetic: PKHD1 sequencing (>800 mutations). Two truncating mutations → severe neonatal. Confirm to exclude ADPKD (different prognosis/treatment)" },
    { type: "action", text: "Liver assessment: LFT, GGT, portal vein Doppler. Oesophageal varices surveillance from age 2–3y. Assess splenomegaly." },
    { type: "outcome", text: "BP control: ACEi. Respiratory support if needed. ESRD → RRT. Combined liver-kidney transplant if ESRD + significant portal hypertension. Annual renal function, LFT, growth monitoring." },
  ],
  nphp: [
    { type: "start", text: "Adolescent: insidious polyuria + growth failure + progressive CKD. Small-normal echogenic kidneys (not large!)" },
    { type: "action", text: "Urine concentration test: dilute urine. Renal USS: ± corticomedullary cysts, increased echogenicity, small kidneys (unlike PKD)." },
    { type: "decision", text: "Extra-renal features? → Retinitis pigmentosa + NPHP = Senior-Løken. Cerebellar vermis hypoplasia (molar tooth MRI) = Joubert. Situs inversus + bronchiectasis = Bardet-Biedl." },
    { type: "action", text: "Brain MRI (molar tooth sign). Ophthalmology + ERG. Array CGH (NPHP1 deletion — 20%). NPHP gene panel or WES if array negative." },
    { type: "outcome", text: "No disease-modifying therapy. Salt + water supplementation (salt wasting). ESRD median age 13y. Excellent transplant outcomes — no recurrence." },
  ],
  ph1: [
    { type: "start", text: "CaOx kidney stones <5 years OR dense bilateral nephrocalcinosis OR unexplained paediatric CKD" },
    { type: "action", text: "24h urine oxalate >1 mmol/1.73m²/day (normal <0.5). Spot oxalate:Cr >0.1 mmol/mmol. Plasma oxalate if eGFR <30." },
    { type: "decision", text: "Urine glycolate elevated → PH1 (AGXT). Urine L-glycerate → PH2 (GRHPR). 2-oxoglutarate → PH3 (HOGA1). Genetic testing MANDATORY before treatment." },
    { type: "action", text: "Pyridoxine trial (PH1 G170R mutation): 5–10 mg/kg/day × 3 months. If 24h oxalate falls >30%: responder → continue." },
    { type: "outcome", text: "PH1 first-line: Lumasiran (siRNA, FDA 2020) — reduces oxalate >80%. High fluids + K+ citrate for all. If eGFR <30: intensive HD + liver transplant (curative). PH2/3: supportive only." },
  ],
  alport: [
    { type: "start", text: "Persistent microscopic haematuria in child (especially male) ± family history of haematuria/CKD" },
    { type: "action", text: "Audiometry (SNHL, bilateral high-frequency from age 8–10). Ophthalmology: anterior lenticonus (pathognomonic)." },
    { type: "decision", text: "Renal biopsy IF: proteinuria >0.5 g/day OR eGFR declining. LM + IF (type IV α3/α4/α5 chain) + EM (GBM lamellation = basket-weave)" },
    { type: "action", text: "Genetic: COL4A3+A4+A5 3-gene panel (NGS). Skin biopsy: type IV α5 chain absent in X-linked males. Family cascade: screen 1st-degree relatives." },
    { type: "decision", text: "ACR >30 mg/mmol or proteinuria? → START ACEi NOW (do not wait for hypertension or significant CKD)" },
    { type: "outcome", text: "ACEi (ramipril/enalapril) — delays ESRD 5–10 years. Titrate to maximum tolerated. Add ARB if insufficient. ESRD → transplant (excellent outcomes, rare risk of anti-GBM post-transplant)." },
  ],
};

function PathwayAlgorithmDisplay({ pathwayId }) {
  const steps = PATHWAY_ALGORITHMS[pathwayId] || [];
  if (!steps.length) return null;

  const typeColors = {
    start: "bg-blue-700 text-white",
    decision: "bg-amber-500 text-white",
    action: "bg-slate-600 text-white",
    outcome: "bg-green-600 text-white",
  };
  const typeLabel = { start: "ASSESS", decision: "DECIDE", action: "STEP", outcome: "ACTION" };

  return (
    <div className="space-y-2 mt-3">
      <p className="text-xs font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1.5">
        <GitBranch className="w-3.5 h-3.5 text-indigo-500" /> Diagnostic &amp; Management Algorithm
      </p>
      {steps.map((s, i) => (
        <div key={i} className="flex items-start gap-2">
          <div className={`flex-shrink-0 text-xs font-bold px-2 py-1.5 rounded-lg min-w-[64px] text-center leading-tight ${typeColors[s.type] || "bg-slate-500 text-white"}`}>
            {i + 1}<br /><span className="text-[9px] opacity-80">{typeLabel[s.type]}</span>
          </div>
          <div className={`flex-1 rounded-lg px-3 py-2 text-xs leading-relaxed border ${s.type === "outcome" ? "bg-green-50 border-green-200 text-green-900 font-medium" : s.type === "decision" ? "bg-amber-50 border-amber-200 text-amber-900" : "bg-slate-50 border-slate-200 text-slate-800"}`}>
            {s.text}
          </div>
        </div>
      ))}
    </div>
  );
}

const DEFAULT_PATHWAYS = [
  {
    id: "ahus", name: "aHUS", full: "Atypical Haemolytic Uraemic Syndrome", gene: "CFH, CFI, CD46, C3, CFB, THBD, DGKE", color: "red",
    overview: "Complement-mediated thrombotic microangiopathy (TMA) caused by uncontrolled activation of the alternative complement pathway. aHUS is distinct from STEC-HUS (diarrhoea-associated) and TTP (ADAMTS13 deficiency). It is life-threatening, often presenting with rapidly progressive AKI, MAHA, and thrombocytopenia. Without eculizumab, >50% progress to ESRD within the first year. Eculizumab (anti-C5 monoclonal antibody) has transformed outcomes dramatically.\n\nKey differentiating features from STEC-HUS: STEC-negative cultures/PCR, no prodromal bloody diarrhoea, ADAMTS13 normal, complement activation markers elevated (low C3, elevated sC5b-9). Anti-CFH antibodies define a treatable subset responding to immunosuppression + plasma exchange.",
    genetics: "Pathogenic mutations identified in ~60–70% of patients. CFH mutations are most common (20–30%) — associated with poorest renal outcomes. CFI mutations: 10–15%. CD46 (MCP): 10–15% — best prognosis, rarely ESRD. C3 and CFB: 5–10% each — gain-of-function variants causing hyperactivation. THBD: rare, ~5%. DGKE: infantile-onset TMA, responds partially to steroids, does NOT respond to eculizumab. Anti-CFH antibodies: ~10% — associated with CFHR1/3 homozygous deletion, treat with plasma exchange + rituximab/steroids.\n\n30–40% of cases: no mutation identified — clinical diagnosis valid, treat with eculizumab based on criteria.",
    red_flags: ["TMA + STEC-negative + ADAMTS13 normal (>10%)", "Recurrent TMA episode (after previous unexplained TMA)", "Familial TMA (relative with HUS/TMA)", "Post-partum TMA (delivery-triggered)", "TMA post-kidney transplant", "TMA + low C3 with normal C4 (alternative pathway)", "TMA with no preceding diarrhoeal illness", "Infantile TMA (consider DGKE, cblC)"],
    diagnostic: ["Blood film: schistocytes (>4% confirms MAHA)", "ADAMTS13 activity — exclude TTP (must be >10%)", "STEC cultures (HUS2 agar) + Shiga toxin PCR", "C3, C4, CH50, AP50 (complement activation)", "Anti-CFH IgG antibodies (ELISA)", "sC5b-9 — terminal complement complex", "Complement genetic panel: CFH, CFI, CD46, C3, CFB, THBD, DGKE (next-gen sequencing)", "Renal biopsy — TMA on LM (arteriolar fibrinoid necrosis) + EM (endothelial swelling, subendothelial widening)", "CFHR1/3 deletion analysis (copy number by MLPA)", "ANA, anti-dsDNA, APS antibodies (exclude secondary TMA)", "HIV, pregnancy test (secondary causes)"],
    monitoring: "Before each eculizumab infusion: LDH, Hb, platelets, creatinine, urine protein. CH50/AP50 monthly (target: undetectable on eculizumab). Anti-CFH titres 3-monthly if positive. Urinalysis + ACR every 3 months. Annual meningococcal antibody titres. Renal function every 3 months. Annual echo if hypertensive. Vaccination schedule for N. meningitidis ACWY + B, pneumococcus, Hib.",
    ckd: "Most patients have residual CKD after acute episode — degree depends on time to eculizumab and complement genotype. Continue eculizumab maintenance even with normal renal function — stopping risks relapse (especially CFH mutations). CD46 mutations: lowest recurrence risk, discontinuation may be considered. BP control: ACEi/ARB for proteinuria. Salt and fluid management. Erythropoiesis-stimulating agents if anaemia from CKD (not acute TMA).",
    transplant: "HIGH recurrence risk: CFH, CFI, C3, CFB, THBD mutations — >80% recurrence without prophylaxis. Pre-emptive eculizumab mandatory peri-transplant (give before reperfusion). Good prognosis: CD46 mutations — MCP expressed on donor kidney, recurrence rare. Anti-CFH antibody aHUS: immunosuppression pre-transplant to reduce antibody titre. Combined liver-kidney transplant: only if eculizumab unavailable (liver produces complement regulators). Deceased-donor preferred — living-donor risk to donor is low (carrier ≠ disease).",
    family_screening: "Screen all 1st-degree relatives: complement genetic panel (CFH/CFI/CD46/C3/CFB). Anti-CFH antibodies in siblings. At-risk relatives with mutations: counsel about triggers (pregnancy, infection, surgery, transplant) and prophylactic eculizumab planning. Asymptomatic mutation carriers: annual renal function + urinalysis + complement levels.",
    references: ["KDIGO aHUS Controversies 2021", "Legendre CM NEJM 2013", "Caprioli J JASN 2006", "Loirat C Ped Nephrol 2008", "Goodship THJ KI 2017", "IJN Eculizumab India 2025"],
    further_reading: [
      { title: "KDIGO aHUS Controversies Conference Report 2021", url: "https://kdigo.org/conferences/ahus/", source: "KDIGO", year: "2021" },
      { title: "Eculizumab in aHUS — Phase 2 Trial (Legendre, NEJM 2013)", url: "https://www.nejm.org/doi/10.1056/NEJMoa1208981", source: "NEJM", year: "2013" },
      { title: "aHUS Foundation Clinical Resources", url: "https://www.ahus.org/clinical-resources", source: "aHUS Foundation", year: "2024" },
      { title: "European aHUS guidelines — KI Reports 2020", url: "https://www.kireports.org/article/S2468-0249(20)30037-9/fulltext", source: "KI Reports", year: "2020" },
      { title: "Ravindran S et al — aHUS in India (CJASN 2023)", url: "https://cjasn.asnjournals.org/content/18/3/362", source: "CJASN", year: "2023" },
    ]
  },
  {
    id: "cystinosis", name: "Cystinosis", full: "Cystinosis (CTNS Mutation)", gene: "CTNS (17p13)", color: "amber",
    overview: "Autosomal recessive lysosomal storage disorder of cystine transport caused by mutations in CTNS gene. The most common inherited cause of Fanconi syndrome in childhood. Accumulation of cystine within lysosomes damages multiple organs. Without cysteamine treatment, ESRD develops by age 10. With treatment, renal function preserved until 3rd–4th decade.\n\nThree clinical forms: (1) Infantile nephropathic — most common, presents age 6–12 months with Fanconi syndrome, growth failure, photophobia. (2) Adolescent — intermediate, milder Fanconi, later ESRD. (3) Ocular non-nephropathic — corneal crystals only, no renal involvement. Extrarenal manifestations appear in adulthood: myopathy, dysphagia, encephalopathy, pancreatic insufficiency, pulmonary dysfunction, infertility.",
    genetics: "Autosomal recessive. CTNS gene (17p13). 57 kb deletion accounts for ~75% of European alleles — NOT present in Indian/Asian/African populations (use full sequencing). Over 100 other mutations described. Compound heterozygous common. No clear genotype-phenotype correlation except two truncating mutations → severe infantile form.",
    red_flags: ["Failure to thrive + polyuria + photophobia in infant (6–18 months)", "Fanconi syndrome: glycosuria with normoglycaemia, phosphaturia, aminoaciduria, bicarbonaturia", "Rickets in infant/child without clear vitamin D deficiency", "Corneal cystine crystals on slit lamp (after age 1 year)", "Progressive renal failure in pre-teen without clear GN", "Salt-wasting + dehydration episodes in young child", "Hypothyroidism + CKD in child"],
    diagnostic: ["Leucocyte cystine levels — diagnostic >3.0 nmol/mg (normal <0.2)", "Slit-lamp examination (pathognomonic corneal crystals from age 1)", "Urine: glucose, amino acids, phosphate, protein, bicarbonate (Fanconi panel)", "Tubular function: TRP, FENa, FEK, FEphosphate, FEbicarbonate", "Renal ultrasound (medullary nephrocalcinosis pattern)", "CTNS gene sequencing + 57kb deletion analysis (MLPA)", "Thyroid function (TSH, fT4)", "Blood glucose, HbA1c (late pancreatic involvement)", "Renal biopsy (cystine crystals in podocytes, EM) — rarely needed"],
    monitoring: "Leucocyte cystine monthly (target <0.5–1.0 nmol/mg on cysteamine). Renal function + electrolytes monthly in childhood. Ophthalmology + slit lamp 6-monthly (corneal crystal clearance on eye drops). Thyroid annually. Growth monitoring 3-monthly. Swallowing assessment annually from age 10. Pulmonary function from age 15. Muscle bulk + power annually (myopathy). Brain MRI every 3–5 years (cerebral atrophy in late disease). Bone density (DXA) every 2 years.",
    ckd: "Cysteamine bitartrate (Cystagon): 10–50 mg/kg/day in 4 divided doses — titrate to leucocyte cystine <1.0 nmol/mg. Delayed-release form (Procysbi): twice daily dosing — better compliance. Cysteamine eye drops: 0.55% (Cystadrops) or 0.1% for corneal crystal clearance. Electrolyte replacement: bicarbonate, phosphate, potassium, carnitine supplementation for Fanconi. Calcitriol + phosphate for rickets. ACEi for proteinuria. Cysteamine does NOT reverse established renal scarring — start early.",
    transplant: "Excellent transplant outcomes — donor kidney does NOT develop cystinosis (no CTNS mutation). Continue cysteamine post-transplant LIFELONG — prevents extrarenal progression (muscle, brain, eye, pancreas, lungs). Cysteamine eye drops must continue even post-transplant (corneal disease does not resolve with renal transplant). Monitor for post-transplant complications.",
    family_screening: "AR inheritance — 25% recurrence risk per pregnancy. Both parents are carriers. Carrier testing: CTNS sequencing for parents and siblings. Prenatal diagnosis: CTNS sequencing from CVS (chorionic villus sampling) at 10–12 weeks. Preimplantation genetic testing (PGT) available. Sibling leucocyte cystine levels if symptomatic.",
    references: ["Ariceta G et al. Ped Nephrol 2021", "Nesterova G. Ped Nephrol 2022", "Cystinosis Research Foundation Guidelines 2023", "Gahl WA NEJM 2002", "Emma F KI 2014"],
    further_reading: [
      { title: "Cystinosis — Comprehensive Review Ped Nephrol 2021", url: "https://link.springer.com/article/10.1007/s00467-020-04546-2", source: "Pediatric Nephrology", year: "2021" },
      { title: "Cystinosis Research Foundation", url: "https://www.cystinosis.org", source: "CRF", year: "2024" },
      { title: "Gahl WA — Cystinosis NEJM 2002 (landmark review)", url: "https://www.nejm.org/doi/10.1056/NEJMra020977", source: "NEJM", year: "2002" },
      { title: "ESPN Cystinosis Working Group Consensus 2018", url: "https://link.springer.com/article/10.1007/s00467-017-3819-8", source: "Pediatric Nephrology", year: "2018" },
    ]
  },
  {
    id: "fabry", name: "Fabry Disease", full: "Fabry Disease (Alpha-Galactosidase A Deficiency)", gene: "GLA (Xq22) — X-linked", color: "violet",
    overview: "X-linked lysosomal storage disorder. Gb3 accumulation in endothelium, renal cells, cardiac myocytes, and neurons. Males: classic severe phenotype. Females: heterozygous but can have significant disease.",
    genetics: "X-linked, GLA gene (Xq22). >1000 mutations. Classic: missense causing severe enzyme deficiency. Later-onset variants: residual enzyme activity.",
    red_flags: ["Young male + acral burning pain + angiokeratomas", "Cornea verticillata on slit lamp", "Unexplained LVH in young adult", "Stroke/TIA in young adult without risk factors", "Proteinuria/CKD in young adult male"],
    diagnostic: ["Alpha-galactosidase A enzyme activity (plasma/leucocytes)", "GLA gene sequencing", "Urine Gb3 and lyso-Gb3 levels", "Renal biopsy (EM: Zebra bodies)", "Echocardiogram + cardiac MRI (LGE)", "Ophthalmology (slit lamp: cornea verticillata)", "Brain MRI", "Audiometry"],
    monitoring: "eGFR + urine protein annually. Urine Gb3/lyso-Gb3. Cardiac MRI + echo every 2 years. Holter. Ophthalmology annually. Brain MRI every 2–3 years. Pain score.",
    ckd: "RAS blockade for proteinuria. ERT (agalsidase alfa or beta) slows renal decline. Migalastat (oral chaperone): for amenable mutations.",
    transplant: "Good outcomes. Continue ERT post-transplant. Screen cardiac function pre-transplant.",
    family_screening: "All sisters of affected males: GLA sequencing. Daughters of affected males: obligate carriers.",
    references: ["EFACTS Registry 2020", "Germain D. Best Practice Res Clin Endocrinol 2021", "KDIGO Fabry guidance 2023", "Ortiz A KI 2018"],
    further_reading: [
      { title: "Fabry Disease — Best Practice Review 2021", url: "https://www.sciencedirect.com/science/article/pii/S1521690X21000208", source: "Best Practice & Research", year: "2021" },
      { title: "Fabry International Network", url: "https://fabry-network.org", source: "FIN", year: "2024" },
      { title: "EFACTS Natural History Study — Eur J Neurol 2018", url: "https://onlinelibrary.wiley.com/doi/10.1111/ene.13551", source: "Eur J Neurol", year: "2018" },
      { title: "Ortiz A et al — Fabry Nephropathy KI 2018", url: "https://www.kidney-international.org/article/S0085-2538(18)30052-X/fulltext", source: "Kidney International", year: "2018" },
      { title: "Migalastat amenability database (FDA)", url: "https://www.galafoldamenabilitytable.com", source: "Amicus/FDA", year: "2024" },
    ]
  },
  {
    id: "arpkd", name: "ARPKD", full: "Autosomal Recessive Polycystic Kidney Disease", gene: "PKHD1 (6p21) — DZIP1L rare", color: "teal",
    overview: "Most common cystic renal disease in neonates and infants. Enlarged echogenic kidneys, dilated collecting ducts, and congenital hepatic fibrosis with portal hypertension.",
    genetics: "AR, PKHD1 gene. >800 mutations. Genotype-phenotype not strict. Two truncating mutations: severe neonatal. DZIP1L: rare form without liver disease.",
    red_flags: ["Enlarged echogenic kidneys on prenatal/neonatal ultrasound", "Oligohydramnios + Potter sequence", "Neonatal respiratory failure", "Hypertension in infant", "Hepatosplenomegaly + varices in child"],
    diagnostic: ["Renal ultrasound (enlarged kidneys, radially-arranged cysts)", "Liver ultrasound (periportal fibrosis)", "PKHD1 sequencing", "LFT, portal vein Doppler", "Renal function, electrolytes"],
    monitoring: "BP monitoring. Renal function 3-monthly. LFT, portal vein flow, oesophageal varices from age 2–3 years. Growth monitoring.",
    ckd: "Variable — 50% have ESRD by age 20 years. Hypertension accelerates progression. ACEi recommended. Do not restrict sodium in infancy.",
    transplant: "Combined liver-kidney transplant if ESRD + significant portal hypertension. Isolated kidney transplant if liver manageable.",
    family_screening: "AR: 25% risk per pregnancy. PKHD1 sequencing of both parents. Prenatal diagnosis: CVS + PKHD1 sequencing.",
    references: ["KDIGO PKD Guidelines 2015", "Sweeney WE. Ped Nephrol 2022", "ESPN ARPKD working group 2021"],
    further_reading: [
      { title: "ESPN/ERA ARPKD working group recommendations", url: "https://link.springer.com/article/10.1007/s00467-021-05078-1", source: "Pediatric Nephrology", year: "2021" },
      { title: "PKD Foundation", url: "https://pkdcure.org", source: "PKDF", year: "2024" },
    ]
  },
  {
    id: "nphp", name: "Nephronophthisis", full: "Nephronophthisis (NPHP)", gene: "NPHP1 (most common), NPHP3–20, CEP290, TMEM67", color: "blue",
    overview: "Autosomal recessive cystic tubulointerstitial nephropathy. Leading genetic cause of ESRD in children and adolescents. Polyuria, salt wasting, progressive CKD, often with extra-renal features.",
    genetics: "AR. NPHP1: large homozygous deletion (20%). CEP290: associated with Joubert, Senior-Løken. TMEM67: Joubert + hepatic fibrosis.",
    red_flags: ["Polyuria + growth failure + progressive CKD in adolescent", "Small-normal sized kidneys with increased echogenicity", "Retinitis pigmentosa + renal disease → Senior-Løken", "Molar tooth sign on brain MRI → Joubert", "Situs inversus + bronchiectasis + NPHP → Bardet-Biedl"],
    diagnostic: ["Renal ultrasound (small/normal kidneys, echogenic, ± corticomedullary cysts)", "Urine concentration ability test", "Brain MRI (molar tooth sign)", "Ophthalmology — ERG (RP)", "Array CGH (NPHP1 deletion)", "NPHP gene panel / WES"],
    monitoring: "Renal function every 6 months. Blood pressure. Visual acuity + ERG annually. Liver function. Neurodevelopmental assessment.",
    ckd: "ESRD by median age 13 (NPHP1), 9 years (NPHP3). Salt wasting — ensure adequate sodium and fluid intake.",
    transplant: "Excellent outcomes. NPHP does not recur in transplanted kidney.",
    family_screening: "AR: 25% risk. NPHP1 deletion analysis in siblings. NPHP gene panel for parents.",
    references: ["Hildebrandt F. NEJM 2010", "Halbritter J. JASN 2013", "ESPN ciliopathy guidelines 2022"],
    further_reading: [
      { title: "Nephronophthisis-related ciliopathies — NEJM 2010", url: "https://www.nejm.org/doi/10.1056/NEJMra0909090", source: "NEJM", year: "2010" },
      { title: "ESPN Rare Kidney Disease guidelines", url: "https://espn.online/clinical-trials-and-research/working-groups/rare-disease/", source: "ESPN", year: "2022" },
    ]
  },
  {
    id: "ph1", name: "PH1", full: "Primary Hyperoxaluria Type 1", gene: "AGXT (2q37) — peroxisomal AGT enzyme", color: "orange",
    overview: "Most common and severe primary hyperoxaluria. Deficiency of hepatic AGT leads to oxalate overproduction and systemic oxalosis. Without treatment: ESRD by adolescence.",
    genetics: "AR, AGXT gene. G170R mutation: 30% of alleles in European — responds to pyridoxine ~30%. I244T: common. Genotype predicts pyridoxine response.",
    red_flags: ["Calcium oxalate stones <5 years", "Nephrocalcinosis from infancy", "ESRD + oxalate deposits in bone, eye, heart, nerves", "Recurrent stones + retinal oxalate crystals"],
    diagnostic: ["24-h urine oxalate (>0.5 mmol/1.73m²/day diagnostic)", "Spot urine oxalate:creatinine (>0.1 mmol/mmol)", "Plasma oxalate (if eGFR <30: >30 μmol/L)", "Urine glycolate (elevated in PH1)", "AGXT sequencing", "Liver biopsy for AGT enzyme assay"],
    monitoring: "24-h urine oxalate 3-monthly. eGFR 3-monthly. Renal ultrasound every 6 months. Plasma oxalate if eGFR <30. Ophthalmology annually.",
    ckd: "Lumasiran (siRNA — Oxlumo): first-line in all ages in PH1. High-dose pyridoxine if AGXT mutation predicts response. Intensive dialysis pre-transplant if eGFR <30.",
    transplant: "Lumasiran now enables isolated kidney transplant if oxalate production controlled. Pre-transplant plasma oxalate must be <15 μmol/L.",
    family_screening: "AR: 25% recurrence risk. Screen siblings with 24-h urine oxalate. AGXT sequencing. Prenatal: AGXT from CVS.",
    references: ["OHF PH Guidelines 2023", "Garrelfs SF NEJM 2021 — ILLUMINATE-A", "Hoppe B. Ped Nephrol 2022"],
    further_reading: [
      { title: "Lumasiran in Primary Hyperoxaluria Type 1 — ILLUMINATE-A", url: "https://www.nejm.org/doi/10.1056/NEJMoa2021712", source: "NEJM", year: "2021" },
      { title: "OHF Clinical Guidelines", url: "https://www.ohf.org/medical-professionals/clinical-guidelines/", source: "OHF", year: "2023" },
    ]
  },
  {
    id: "bbs", name: "Bardet-Biedl", full: "Bardet-Biedl Syndrome (BBS)", gene: "BBS1 (most common), BBS10, BBS12, + 22 BBS genes", color: "teal",
    overview: "Autosomal recessive ciliopathy — multisystem disorder affecting multiple organs including kidney, eye, CNS, and endocrine system. Classic pentad: rod-cone dystrophy (night blindness), obesity, polydactyly, renal anomalies, intellectual disability. Variable expressivity even within families. One of the most common syndromic ciliopathies.",
    genetics: "Highly genetically heterogeneous — 24 BBS genes identified. BBS1 (M390R mutation): ~20% of cases in European populations. BBS10 and BBS12: common. All encode components of the BBSome protein complex (cilia formation/trafficking). Triallelic inheritance described. Phenotype does not predict genotype reliably — gene panel/WES essential.",
    red_flags: ["Night blindness or visual field loss in child — rod-cone dystrophy from age 6-10", "Post-axial polydactyly (extra digit on ulnar/fibular side) — may be subtle or surgically corrected", "Truncal obesity from early childhood", "Renal anomalies: horseshoe kidney, cysts, dysplasia, CKD", "Intellectual disability or learning difficulties", "Hypogonadism + obesity in adolescent male", "Anosmia (absent sense of smell)"],
    diagnostic: ["Ophthalmology: ERG (rod-cone dystrophy — abnormal early even before visual symptoms)", "Renal ultrasound: dysplasia, cysts, horseshoe kidney, collecting system anomalies", "BBS gene panel (24 genes) or whole exome sequencing", "Developmental assessment + IQ testing", "HbA1c, fasting glucose, lipids (metabolic syndrome)", "Audiometry (sensorineural hearing loss in some BBS)", "Cardiac echo (congenital heart disease in ~5%)", "Endocrinology: LH, FSH, testosterone (hypogonadism)"],
    monitoring: "Annual ophthalmology + ERG (vision aids when needed). Renal function every 6 months. BP monitoring. Annual metabolic screen (glucose, lipids, HbA1c). Growth and pubertal development. Annual neurodevelopmental review. Renal ultrasound every 12-24 months.",
    ckd: "Renal involvement in 50-80%: structural anomalies (calyceal cysts, renal tubular dysfunction) or CKD. Treat as per CKD stage. Hypertension: ACEi/ARB for proteinuria. No disease-modifying therapy for renal BBS. Obesity management: diet, exercise, structured programmes. GLP-1 agonists for obesity-related complications (emerging evidence).",
    transplant: "Renal transplant for ESRD: good outcomes. BBS does not recur in transplanted kidney. Pre-transplant cardiac evaluation essential. Obesity management important for post-transplant outcomes. Intellectual disability assessment for post-transplant adherence planning.",
    family_screening: "AR: 25% recurrence risk. BBS gene panel for parents and siblings. Significant interfamilial variability even with same mutation. Genetic counselling: variable expressivity — siblings may have mild or severe manifestations.",
    references: ["Forsythe E. Front Pediatr 2018", "Marion V. Orphanet J Rare Dis 2012", "BBS Foundation Guidelines 2023", "Marshall JD. Orphanet J 2023"],
    further_reading: [
      { title: "Bardet-Biedl Syndrome — Orphanet Reviews 2023", url: "https://www.ojrd.com/articles/10.1186/s13023-023-02624-2", source: "OJRD", year: "2023" },
      { title: "BBS Foundation", url: "https://www.bbsfoundation.org", source: "BBS Foundation", year: "2024" },
    ]
  },
  {
    id: "lowe", name: "Lowe Syndrome", full: "Lowe Syndrome (Oculocerebrorenal Syndrome)", gene: "OCRL (Xq26.1) — X-linked", color: "orange",
    overview: "X-linked multisystem disorder affecting eye, brain, and kidney (oculocerebrorenal syndrome — OCRL). Caused by deficiency of OCRL1 phosphatase enzyme involved in vesicular trafficking. Classic triad: congenital cataracts, intellectual disability/hypotonia, and renal Fanconi syndrome. Almost exclusively affects males; females are carriers with lens opacities.",
    genetics: "X-linked. OCRL gene (Xq26.1) — >200 mutations. No clear genotype-phenotype correlation. Females (carriers): punctate/subcapsular lens opacities (slit lamp) — most are unaffected. Rare affected females (Turner syndrome or skewed X-inactivation). De novo mutations in ~30%.",
    red_flags: ["Congenital cataracts in male neonate — bilateral", "Neonatal hypotonia (floppy baby) + cataracts", "Fanconi syndrome: aminoaciduria, phosphaturia, glucosuria with normoglycaemia, bicarbonaturia", "Rickets refractory to standard vitamin D therapy (hypophosphataemic rickets)", "Intellectual disability + behaviour problems (stereotypies, emotional dysregulation)", "Glaucoma developing after cataract surgery in infant", "Elevated creatinine kinase in infant (myopathic features)"],
    diagnostic: ["Ophthalmology: slit lamp (bilateral dense cataracts at birth), IOP (glaucoma)", "Urine Fanconi panel: aminoaciduria, phosphaturia, glucosuria, bicarbonaturia, uricosuria", "OCRL enzyme activity (leucocytes or fibroblasts) — markedly reduced", "OCRL gene sequencing", "Renal function: creatinine, electrolytes", "Phosphate, calcium, PTH, ALP (rickets assessment)", "Brain MRI: periventricular leukoencephalopathy, ventriculomegaly", "Developmental assessment: IQ, behaviour, autistic features"],
    monitoring: "Ophthalmology 3-6 monthly (cataract, glaucoma, aphakic glasses). Renal function quarterly. Electrolyte replacement adequacy: pH, phosphate, potassium monthly. ALP + X-ray hands/wrists 6-monthly (rickets). Developmental review annually. Behaviour assessment (stereotypies, aggression). Blood pressure monitoring.",
    ckd: "Renal Fanconi syndrome: replace all wasted solutes — bicarbonate (NaHCO3 1-4 mEq/kg/day), phosphate supplements (1-3 g/day), potassium supplementation, carnitine. Calcitriol 0.025-0.05 mcg/kg/day for rickets. Progress to CKD in majority by adulthood (40% by age 30). ACEi when proteinuria develops. No disease-modifying therapy available yet.",
    transplant: "Renal transplant for ESRD: possible and beneficial. OCRL enzyme defect persists in transplanted kidney but renal function restored. Extrarenal disease (cataracts, intellectual disability) continues post-transplant. Pre-transplant: intellectual capacity and adherence assessment essential.",
    family_screening: "X-linked: obligate carrier females (mothers of affected males). Slit lamp examination of female relatives (lens opacities in carriers). OCRL gene sequencing for definitive carrier status. Prenatal diagnosis: OCRL sequencing from CVS. Preimplantation genetic testing available.",
    references: ["Bockenhauer D. Ped Nephrol 2020", "Shrimpton AE. Am J Med Genet 2009", "Lowe Syndrome Association Guidelines 2023"],
    further_reading: [
      { title: "Lowe Syndrome — Comprehensive Review Ped Nephrol 2020", url: "https://link.springer.com/article/10.1007/s00467-019-04310-1", source: "Pediatric Nephrology", year: "2020" },
      { title: "Lowe Syndrome Association", url: "https://www.lowesyndrome.org", source: "LSA", year: "2024" },
    ]
  },
  {
    id: "alport", name: "Alport Syndrome", full: "Alport Syndrome", gene: "COL4A5 (X-linked), COL4A3/COL4A4 (AR/AD)", color: "indigo",
    overview: "Hereditary progressive nephritis caused by mutations in type IV collagen genes (COL4A3, COL4A4, COL4A5). Type IV collagen forms the structural scaffold of the glomerular basement membrane (GBM), cochlear basement membrane, and lens. Alport syndrome is the second most common genetic cause of ESRD in children after ARPKD.\n\nClinical spectrum: (1) Males with X-linked COL4A5 mutations — haematuria in infancy, proteinuria in childhood, ESRD typically by 3rd decade. (2) Females with X-linked (heterozygous) — haematuria common, CKD and ESRD risk 10–30% by age 40 due to X-inactivation. (3) AR Alport (COL4A3/A4 biallelic) — severe, similar to X-linked males. (4) AD Alport (monoallelic COL4A3/A4) — milder, often presenting as 'thin basement membrane nephropathy'.\n\nEarly ACEi intervention is the cornerstone of treatment — dramatically improves renal survival.",
    genetics: "X-linked (COL4A5): ~80% of cases. Males: severe progressive disease, ESRD by 25–30 years without ACEi. Females: variable, range from isolated haematuria to ESRD. AR (COL4A3/COL4A4): ~15%. Homozygous or compound heterozygous — severity = X-linked males. Parental consanguinity raises AR risk. AD (COL4A3/COL4A4 monoallelic): ~5%. Milder, often misclassified as TBMN (thin basement membrane nephropathy). ACEi still beneficial. Genotype-phenotype: truncating/splice-site COL4A5 > missense for severity. Exon 21-deletion: severe (juvenile ESRD). Multi-gene panels (COL4A3+A4+A5) essential — inheritance determines family cascade risk.",
    red_flags: ["Persistent microscopic haematuria from childhood in male (haematuria in 100% of X-linked males)", "Family history of haematuria + CKD/ESRD in maternal uncles (X-linked pedigree)", "Bilateral high-frequency sensorineural hearing loss + renal disease", "Anterior lenticonus on ophthalmology (pathognomonic)", "Biopsy: GBM thinning → lamellation → basket-weave (EM)", "Type IV collagen α5 chain absent on skin biopsy or IF", "Proteinuria onset in a child with known haematuria — signals progression"],
    diagnostic: ["Renal biopsy: LM (mild initially), IF (type IV α3/α4/α5 chain staining — mosaic in X-linked females), EM (GBM lamellation/basket-weave — pathognomonic)", "Audiometry (SNHL: high-frequency, bilateral, typically from age 8–10)", "Ophthalmology (anterior lenticonus — pathognomonic; macular dot-and-fleck retinopathy)", "COL4A3/A4/A5 gene sequencing (3-gene panel by NGS)", "Skin biopsy: type IV collagen α5 chain staining — absent in X-linked males; mosaic in females", "Urine ACR + microscopy annually from diagnosis", "eGFR trend (rate of decline predicts ESRD timing)"],
    monitoring: "Urine ACR every 6 months (start ACEi when ACR >30 mg/mmol even if normotensive). eGFR 6-monthly. BP monitoring at every visit. Audiometry every 2 years from age 5 — earlier if symptomatic. Ophthalmology every 2–3 years. Renal function: once CKD stage 3, monitor 3-monthly. Growth + BP percentiles in children. Genetic counselling — update family cascade as new at-risk members identified.",
    ckd: "RAS blockade (ACEi — ramipril or enalapril): START as soon as proteinuria detectable (ACR >30 mg/mmol). This is the single most impactful intervention — delays ESRD by 5–10 years in X-linked males. Do not wait for hypertension or significant CKD. Titrate dose to maximum tolerated. Add ARB if ACEi insufficient for proteinuria control. Avoid NSAIDs and nephrotoxins. Erythropoiesis-stimulating agents for CKD anaemia. Correction of metabolic acidosis.",
    transplant: "Excellent transplant outcomes. ~3% risk of de novo anti-GBM disease post-transplant (COL4A3-null patients form antibodies against donor GBM α3-chain — rare but severe). Screen for anti-GBM antibodies 6-monthly in first year post-transplant. No disease recurrence in donor kidney (unless donor also carries Alport). Genetic testing of donor (live donor) recommended to exclude Alport.",
    family_screening: "X-linked: screen all first-degree female relatives (obligate carriers if mother of affected male) — urinalysis + audiometry + COL4A5 sequencing. AR: siblings 25% risk, parents obligate carriers. AD: 50% risk to offspring. At-risk relatives: minimum = urinalysis for haematuria + audiometry (high-frequency hearing loss). Genetic testing offered to all confirmed at-risk individuals. Prenatal/preimplantation genetic testing available.",
    references: ["KDIGO Alport Syndrome 2021 guideline", "Rheault MN Ped Nephrol 2020", "Gross O. Lancet 2020", "Savige J KI 2022", "Kashtan CE Ped Nephrol 2018"],
    further_reading: [
      { title: "KDIGO Alport Syndrome Guidelines 2021", url: "https://kdigo.org/guidelines/alport-syndrome/", source: "KDIGO", year: "2021" },
      { title: "Alport Syndrome Foundation", url: "https://www.alportsyndrome.org", source: "ASF", year: "2024" },
      { title: "Gross O et al. Lancet — ACEi slows Alport progression", url: "https://www.thelancet.com/journals/lancet/article/PIIS0140-6736(19)32807-3/fulltext", source: "Lancet", year: "2020" },
      { title: "Savige J et al — Alport Syndrome KI 2022 — updated recommendations", url: "https://www.kidney-international.org/article/S0085-2538(22)00285-6/fulltext", source: "Kidney International", year: "2022" },
      { title: "Kashtan CE — Alport Syndrome in Children (Ped Nephrol)", url: "https://link.springer.com/article/10.1007/s00467-017-3790-4", source: "Pediatric Nephrology", year: "2018" },
    ]
  },
];

const COLOR_MAP = {
  red: { badge: "bg-red-100 text-red-800", header: "bg-red-50 border-red-200" },
  amber: { badge: "bg-amber-100 text-amber-800", header: "bg-amber-50 border-amber-200" },
  violet: { badge: "bg-violet-100 text-violet-800", header: "bg-violet-50 border-violet-200" },
  teal: { badge: "bg-teal-100 text-teal-800", header: "bg-teal-50 border-teal-200" },
  blue: { badge: "bg-blue-100 text-blue-800", header: "bg-blue-50 border-blue-200" },
  orange: { badge: "bg-orange-100 text-orange-800", header: "bg-orange-50 border-orange-200" },
  indigo: { badge: "bg-indigo-100 text-indigo-800", header: "bg-indigo-50 border-indigo-200" },
};

function EditableSection({ title, value, fieldKey, onSave, isList }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  const handleSave = () => { onSave(fieldKey, draft); setEditing(false); };
  const handleCancel = () => { setDraft(value); setEditing(false); };

  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 text-left">
        <span className="font-semibold text-sm text-slate-800">{title}</span>
        {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>
      {open && (
        <div className="p-4 bg-white">
          {!editing ? (
            <div className="relative group">
              {isList ? (
                <ul className="space-y-1">
                  {(Array.isArray(value) ? value : []).map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                      <span className="text-indigo-400 font-bold min-w-[20px]">{i + 1}.</span>{item}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-700 leading-relaxed">{value}</p>
              )}
              <button
                onClick={() => { setDraft(isList ? (value || []).join("\n") : value); setEditing(true); }}
                className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 p-1.5 bg-blue-50 rounded hover:bg-blue-100 text-blue-600 transition-opacity"
              >
                <Pencil className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <Textarea
                value={draft}
                onChange={e => setDraft(e.target.value)}
                className="text-sm min-h-[100px] resize-y"
                placeholder={isList ? "One item per line…" : "Enter content…"}
                autoFocus
              />
              {isList && <p className="text-xs text-slate-400">Enter one item per line</p>}
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSave} className="h-7 text-xs bg-green-600 hover:bg-green-700 text-white">
                  <Check className="w-3 h-3 mr-1" />Save
                </Button>
                <Button size="sm" variant="outline" onClick={handleCancel} className="h-7 text-xs">
                  <X className="w-3 h-3 mr-1" />Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function FurtherReadingSection({ links, onSave, isAdmin }) {
  const [open, setOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({ title: "", url: "", source: "", year: "" });

  const handleAdd = () => {
    if (!draft.title || !draft.url) return;
    onSave("further_reading", [...(links || []), draft]);
    setDraft({ title: "", url: "", source: "", year: "" });
    setAdding(false);
  };

  const handleDelete = (idx) => {
    onSave("further_reading", (links || []).filter((_, i) => i !== idx));
  };

  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 text-left">
        <span className="font-semibold text-sm text-slate-800 flex items-center gap-2"><BookOpen className="w-3.5 h-3.5 text-indigo-500" />Further Reading & References</span>
        {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>
      {open && (
        <div className="p-4 bg-white space-y-2">
          {(links || []).map((link, i) => (
            <div key={i} className="flex items-start gap-2 bg-indigo-50 border border-indigo-100 rounded-lg p-3 group">
              <BookOpen className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <a href={link.url} target="_blank" rel="noopener noreferrer"
                  className="text-sm font-medium text-indigo-800 hover:text-indigo-600 flex items-center gap-1">
                  {link.title}<ExternalLink className="w-3 h-3 flex-shrink-0" />
                </a>
                <p className="text-xs text-slate-500 mt-0.5">{link.source}{link.year ? ` · ${link.year}` : ""}</p>
              </div>
              {isAdmin && (
                <button onClick={() => handleDelete(i)} className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-100 text-red-500 transition-opacity flex-shrink-0">
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
          {links?.length === 0 && <p className="text-xs text-slate-400">No further reading links yet.</p>}
          {isAdmin && !adding && (
            <Button size="sm" variant="outline" onClick={() => setAdding(true)} className="text-xs h-7 border-indigo-300 text-indigo-700">
              <Plus className="w-3 h-3 mr-1" />Add Link
            </Button>
          )}
          {adding && (
            <div className="bg-slate-50 rounded-lg p-3 space-y-2 border border-slate-200">
              <div className="grid grid-cols-2 gap-2">
                <div><Label className="text-xs">Title*</Label><Input value={draft.title} onChange={e => setDraft(d => ({ ...d, title: e.target.value }))} className="text-xs h-7" /></div>
                <div><Label className="text-xs">URL*</Label><Input value={draft.url} onChange={e => setDraft(d => ({ ...d, url: e.target.value }))} className="text-xs h-7" placeholder="https://…" /></div>
                <div><Label className="text-xs">Source</Label><Input value={draft.source} onChange={e => setDraft(d => ({ ...d, source: e.target.value }))} className="text-xs h-7" /></div>
                <div><Label className="text-xs">Year</Label><Input value={draft.year} onChange={e => setDraft(d => ({ ...d, year: e.target.value }))} className="text-xs h-7" /></div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleAdd} className="h-7 text-xs bg-green-600 hover:bg-green-700 text-white"><Check className="w-3 h-3 mr-1" />Add</Button>
                <Button size="sm" variant="outline" onClick={() => setAdding(false)} className="h-7 text-xs"><X className="w-3 h-3 mr-1" />Cancel</Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function PathwayDetail({ pathway, dbRecord, isAdmin, onSave }) {
  const c = COLOR_MAP[pathway.color] || COLOR_MAP.violet;

  // Merge DB overrides with defaults
  const data = dbRecord ? { ...pathway, ...(dbRecord.data || {}), further_reading: dbRecord.further_reading || pathway.further_reading } : pathway;

  const saveField = async (field, val) => {
    if (!isAdmin) return;
    const newData = { ...data, [field]: val };
    if (dbRecord) {
      await base44.entities.RareDiseaseContent.update(dbRecord.id, {
        data: newData,
        further_reading: newData.further_reading,
      });
    } else {
      await base44.entities.RareDiseaseContent.create({
        content_type: "pathway",
        section_id: pathway.id,
        title: pathway.full,
        data: newData,
        further_reading: newData.further_reading,
        is_active: true,
      });
    }
    onSave();
  };

  const sections = [
    { title: "Overview", key: "overview", isList: false },
    { title: "Genetics", key: "genetics", isList: false },
    { title: "🚩 Red Flags", key: "red_flags", isList: true },
    { title: "Diagnostic Checklist", key: "diagnostic", isList: true },
    { title: "Monitoring Protocol", key: "monitoring", isList: false },
    { title: "CKD Progression & Treatment", key: "ckd", isList: false },
    { title: "Transplant Considerations", key: "transplant", isList: false },
    { title: "Family Screening", key: "family_screening", isList: false },
  ];

  return (
    <div className="space-y-3">
      <div className={`rounded-lg border p-3 ${c.header}`}>
        <span className="text-xs font-bold text-slate-500 uppercase">Genes: </span>
        <code className="text-xs font-mono">{data.gene}</code>
      </div>

      {/* Algorithm always shown at top */}
      <PathwayAlgorithmDisplay pathwayId={pathway.id} />

      {sections.map(s => (
        isAdmin ? (
          <EditableSection key={s.key} title={s.title} value={data[s.key]} fieldKey={s.key} isList={s.isList} onSave={saveField} />
        ) : (
          <div key={s.key} className="border border-slate-200 rounded-lg overflow-hidden">
            <ReadOnlySection title={s.title} value={data[s.key]} isList={s.isList} />
          </div>
        )
      ))}
      <FurtherReadingSection links={data.further_reading} onSave={saveField} isAdmin={isAdmin} />
    </div>
  );
}

function ReadOnlySection({ title, value, isList }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 text-left">
        <span className="font-semibold text-sm text-slate-800">{title}</span>
        {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>
      {open && (
        <div className="p-4 bg-white">
          {isList ? (
            <ul className="space-y-1">
              {(Array.isArray(value) ? value : []).map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                  <span className="text-indigo-400 font-bold min-w-[20px]">{i + 1}.</span>{item}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-700 leading-relaxed">{value}</p>
          )}
        </div>
      )}
    </>
  );
}

function SyncButton({ pathwayId, pathwayName, onSynced }) {
  const [syncing, setSyncing] = useState(false);

  const doSync = async () => {
    setSyncing(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Provide a concise, up-to-date clinical summary for ${pathwayName} in pediatric nephrology. Include: recent treatment advances (post 2022), any new guidelines, and 3-5 recommended further reading URLs from major journals or guidelines organisations. Return as JSON with fields: recent_update (string), new_links (array of {title, url, source, year}).`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            recent_update: { type: "string" },
            new_links: { type: "array", items: { type: "object", properties: { title: { type: "string" }, url: { type: "string" }, source: { type: "string" }, year: { type: "string" } } } }
          }
        }
      });
      onSynced(res);
    } catch (e) { /* silent */ }
    setSyncing(false);
  };

  return (
    <Button size="sm" variant="outline" onClick={doSync} disabled={syncing} className="text-xs h-7 border-violet-300 text-violet-700">
      {syncing ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <RefreshCw className="w-3 h-3 mr-1" />}
      {syncing ? "Syncing…" : "Auto-Sync"}
    </Button>
  );
}

export default function RareDiseasePathways({ isAdmin }) {
  const qc = useQueryClient();
  const [syncResult, setSyncResult] = useState({});

  const { data: dbRecords = [] } = useQuery({
    queryKey: ["rdcontent", "pathway"],
    queryFn: () => base44.entities.RareDiseaseContent.filter({ content_type: "pathway" }, "-updated_date", 50),
  });

  const getDbRecord = (id) => dbRecords.find(r => r.section_id === id);

  const handleSyncResult = async (pathwayId, result) => {
    if (!result) return;
    const pathway = DEFAULT_PATHWAYS.find(p => p.id === pathwayId);
    const existing = getDbRecord(pathwayId);
    const note = result.recent_update ? `\n\n[Auto-synced ${new Date().toLocaleDateString()}]: ${result.recent_update}` : "";
    const existingLinks = existing?.further_reading || pathway?.further_reading || [];
    const newLinks = (result.new_links || []).filter(l => l.url && !existingLinks.find(e => e.url === l.url));
    const merged = [...existingLinks, ...newLinks];

    const payload = {
      content_type: "pathway",
      section_id: pathwayId,
      title: pathway?.full || pathwayId,
      data: { ...(existing?.data || pathway || {}), sync_note: note },
      further_reading: merged,
      last_synced: new Date().toISOString(),
      is_active: true,
    };
    if (existing) await base44.entities.RareDiseaseContent.update(existing.id, payload);
    else await base44.entities.RareDiseaseContent.create(payload);
    qc.invalidateQueries({ queryKey: ["rdcontent", "pathway"] });
    setSyncResult(prev => ({ ...prev, [pathwayId]: `Synced — ${newLinks.length} new link(s) added` }));
  };

  return (
    <Tabs defaultValue="ahus">
      <div className="overflow-x-auto pb-1 mb-3">
        <TabsList className="inline-flex h-auto gap-1 bg-white border border-slate-200 rounded-xl p-1 min-w-full overflow-x-auto">
          {DEFAULT_PATHWAYS.map(p => (
            <TabsTrigger key={p.id} value={p.id} className="flex-shrink-0 px-2 py-2 text-xs rounded-lg whitespace-nowrap data-[state=active]:bg-violet-600 data-[state=active]:text-white">
              {p.name}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
      {DEFAULT_PATHWAYS.map(p => {
        const dbRecord = getDbRecord(p.id);
        const c = COLOR_MAP[p.color] || COLOR_MAP.violet;
        return (
          <TabsContent key={p.id} value={p.id}>
            <Card className="bg-white border border-slate-200 shadow-sm">
              <CardHeader className={`border-b py-4 px-5 ${c.header}`}>
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <CardTitle className="flex items-center gap-2 flex-wrap">
                    <span className="text-base">{p.full}</span>
                    <Badge className={c.badge}>Rare Disease Pathway</Badge>
                    {dbRecord?.last_synced && (
                      <Badge className="bg-green-100 text-green-700 text-xs">Synced {new Date(dbRecord.last_synced).toLocaleDateString()}</Badge>
                    )}
                  </CardTitle>
                  {isAdmin && (
                    <SyncButton pathwayId={p.id} pathwayName={p.full} onSynced={(res) => handleSyncResult(p.id, res)} />
                  )}
                </div>
                {syncResult[p.id] && (
                  <p className="text-xs text-green-700 mt-1 flex items-center gap-1"><Check className="w-3 h-3" />{syncResult[p.id]}</p>
                )}
              </CardHeader>
              <CardContent className="p-4">
                <PathwayDetail
                  pathway={p}
                  dbRecord={dbRecord}
                  isAdmin={isAdmin}
                  onSave={() => qc.invalidateQueries({ queryKey: ["rdcontent", "pathway"] })}
                />
              </CardContent>
            </Card>
          </TabsContent>
        );
      })}
    </Tabs>
  );
}