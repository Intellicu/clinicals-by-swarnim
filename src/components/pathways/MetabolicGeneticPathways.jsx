import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, ChevronDown, ChevronUp, ArrowRight, Dna, Info, CheckCircle2, Circle, Clipboard } from "lucide-react";

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

// Fabry Screening Checklist Tool
function FabryScreeningTool() {
  const features = [
    { id: "pain", label: "Neuropathic pain / acroparesthesia (hands & feet, worse with fever/exercise)", points: 2 },
    { id: "angiokeratoma", label: "Angiokeratomas (dark red papules on trunk/groin/umbilical area)", points: 3 },
    { id: "cornea", label: "Cornea verticillata on slit-lamp (whorl-like corneal opacities)", points: 3 },
    { id: "proteinuria", label: "Proteinuria / microalbuminuria unexplained (especially in young male)", points: 2 },
    { id: "lvh", label: "LVH / hypertrophic cardiomyopathy (unexplained in child/adolescent)", points: 2 },
    { id: "stroke", label: "Stroke or TIA in child/young adult without traditional risk factors", points: 3 },
    { id: "hearing", label: "Sensorineural hearing loss", points: 1 },
    { id: "family", label: "Family history of Fabry disease or unexplained ESRD + cardiac disease", points: 3 },
    { id: "gi", label: "Recurrent GI symptoms (abdominal pain, diarrhoea) in childhood", points: 1 },
    { id: "anhidrosis", label: "Hypohidrosis / anhidrosis (reduced sweating)", points: 2 },
  ];
  const [checked, setChecked] = useState({});
  const score = features.filter(f => checked[f.id]).reduce((s, f) => s + f.points, 0);
  const risk = score >= 6 ? "HIGH" : score >= 3 ? "MODERATE" : "LOW";
  const riskColor = risk === "HIGH" ? "text-red-700 bg-red-50 border-red-300" : risk === "MODERATE" ? "text-amber-700 bg-amber-50 border-amber-300" : "text-green-700 bg-green-50 border-green-300";

  return (
    <div className="space-y-3">
      <div className="bg-pink-50 border border-pink-200 rounded-xl p-3">
        <p className="text-xs font-bold text-pink-800 mb-1">Fabry Disease Screening Checklist</p>
        <p className="text-xs text-pink-700">Tick all features present. Score ≥6 = HIGH suspicion → enzyme assay + GLA sequencing urgently.</p>
      </div>
      <div className="space-y-1.5">
        {features.map(f => (
          <button key={f.id} onClick={() => setChecked(c => ({ ...c, [f.id]: !c[f.id] }))}
            className={`w-full flex items-center gap-2 p-2.5 rounded-lg border text-left transition-all ${checked[f.id] ? "bg-pink-50 border-pink-300" : "bg-white border-slate-200 hover:border-pink-200"}`}>
            {checked[f.id] ? <CheckCircle2 className="w-4 h-4 text-pink-600 flex-shrink-0" /> : <Circle className="w-4 h-4 text-slate-300 flex-shrink-0" />}
            <span className="text-xs text-slate-800 flex-1">{f.label}</span>
            <span className="text-xs font-bold text-pink-600 flex-shrink-0">+{f.points}</span>
          </button>
        ))}
      </div>
      <div className={`p-3 rounded-xl border-2 font-bold text-center ${riskColor}`}>
        Score: {score} — {risk} RISK
        {risk === "HIGH" && <p className="text-xs font-normal mt-1">→ Order alpha-Gal A enzyme assay (males) + GLA sequencing (all). Refer to metabolic team.</p>}
        {risk === "MODERATE" && <p className="text-xs font-normal mt-1">→ Discuss with metabolic nephrology. Consider enzyme assay + lyso-Gb3.</p>}
        {risk === "LOW" && <p className="text-xs font-normal mt-1">→ Low suspicion. Re-evaluate if new features develop.</p>}
      </div>
    </div>
  );
}

// aHUS Plasma Exchange / Eculizumab Protocol Tool
function AHUSPlexGuide() {
  const [weight, setWeight] = useState("");
  const [step, setStep] = useState(0);
  const wt = parseFloat(weight) || null;

  const eculizumabDose = wt ? (
    wt < 5 ? { ind: "600 mg", maint: "300 mg Q3W", induction: "1 dose" } :
    wt < 10 ? { ind: "600 mg", maint: "300 mg Q3W", induction: "1 dose" } :
    wt < 20 ? { ind: "600 mg", maint: "600 mg Q2W", induction: "1 dose" } :
    wt < 30 ? { ind: "900 mg", maint: "600 mg Q2W", induction: "1 dose" } :
    wt < 40 ? { ind: "900 mg", maint: "900 mg Q2W", induction: "1 dose" } :
    { ind: "900 mg", maint: "1200 mg Q2W", induction: "4 doses" }
  ) : null;

  const plex = [
    "Volume: 1–1.5× plasma volume (40–50 mL/kg); replacement: FFP 10–15 mL/kg",
    "Daily PLEX × 5 days (induction), then every 48h × 2 weeks, then 3× weekly",
    "Bridge to eculizumab: continue PLEX until eculizumab levels therapeutic",
    "Central access: large-bore CVC or Permcath (quinton catheter) required",
    "Monitor: platelets, LDH, haptoglobin, creatinine after each session",
    "Stop PLEX only when eculizumab initiated and platelet/LDH normalising",
  ];

  const checklist = [
    "Meningococcal vaccine (MenACWY + MenB) BEFORE eculizumab — or penicillin prophylaxis if urgent",
    "Genetic panel: CFH, CFI, CD46/MCP, C3, CFB, THBD, CFHR1/3 (aHUS panel)",
    "ADAMTS13 activity >10% (excludes TTP)",
    "Stool/rectal swab for Shiga-toxin STEC (excludes D+HUS)",
    "Anti-CFH antibodies (especially children — CFH autoantibody-mediated aHUS)",
    "Baseline: C3, C4, CH50, AH50, factor H level",
    "Eculizumab compassionate access form (Alexion) if not available commercially",
  ];

  return (
    <div className="space-y-3">
      <div className="bg-red-50 border border-red-200 rounded-xl p-3">
        <p className="text-xs font-bold text-red-800 mb-1">aHUS — PLEX & Eculizumab Protocol</p>
        <p className="text-xs text-red-700">Complement-mediated TMA. Do NOT delay eculizumab. PLEX is a bridge — not definitive treatment.</p>
      </div>

      <div className="flex gap-1.5">
        {["Pre-Treatment Checklist", "PLEX Protocol", "Eculizumab Dosing"].map((t, i) => (
          <button key={i} onClick={() => setStep(i)}
            className={`flex-1 text-xs py-2 px-1 rounded-lg font-medium border transition-all ${step === i ? "bg-red-700 text-white border-red-700" : "bg-white border-slate-200 text-slate-600"}`}>
            {t}
          </button>
        ))}
      </div>

      {step === 0 && (
        <div className="space-y-1.5">
          {checklist.map((item, i) => (
            <div key={i} className="flex items-start gap-2 p-2.5 bg-white border border-slate-200 rounded-lg">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-slate-800">{item}</p>
            </div>
          ))}
        </div>
      )}

      {step === 1 && (
        <div className="space-y-1.5">
          {plex.map((item, i) => (
            <div key={i} className="flex items-start gap-2 p-2.5 bg-blue-50 border border-blue-200 rounded-lg">
              <ArrowRight className="w-3 h-3 text-blue-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-slate-800">{item}</p>
            </div>
          ))}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5">
            <p className="text-xs text-amber-800"><strong>Note:</strong> PLEX removes anti-CFH antibodies and depletes complement — temporary. Eculizumab blocks terminal complement permanently.</p>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-3">
          <div className="bg-white border-2 border-slate-200 rounded-xl p-3">
            <p className="text-xs font-semibold text-slate-600 mb-1">Patient Weight (kg)</p>
            <input type="number" inputMode="decimal" value={weight} onChange={e => setWeight(e.target.value)}
              placeholder="Enter weight" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold focus:outline-none focus:border-red-400" />
          </div>
          {eculizumabDose ? (
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-3 text-center">
                <p className="text-xs text-slate-500">Induction Dose</p>
                <p className="text-lg font-black text-red-800">{eculizumabDose.ind}</p>
                <p className="text-xs text-slate-500">{eculizumabDose.induction} × weekly</p>
              </div>
              <div className="bg-green-50 border-2 border-green-200 rounded-xl p-3 text-center">
                <p className="text-xs text-slate-500">Maintenance</p>
                <p className="text-base font-black text-green-800">{eculizumabDose.maint}</p>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400 text-center">Enter weight for dose calculation</p>
          )}
          <div className="space-y-1.5">
            {["900 mg IV over 35 min (undiluted); 600 mg over 21 min",
              "Premedicate: antihistamine + paracetamol 30 min before",
              "Monitor: infusion reactions, BP, HR during and 1h after",
              "Duration: indefinite in genetic aHUS; consider discontinuation in anti-CFH Ab–mediated aHUS after Ab clearance",
              "India: compassionate use via Alexion/AstraZeneca or PMJAY (selected centres: AIIMS, PGIMER, CMC, Medanta)"
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2 p-2.5 bg-green-50 border border-green-200 rounded-lg">
                <ArrowRight className="w-3 h-3 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-slate-800">{item}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function MetabolicGeneticPathways({ condition }) {
  const [section, setSection] = useState("overview");
  const data = CONDITIONS[condition];
  if (!data) return null;

  const hasTool = condition === "fabry" || condition === "arpkd_adpkd";

  const sections = [
    { key: "overview", label: "Overview" },
    { key: "diagnosis", label: "Diagnosis" },
    { key: "treatment", label: "Treatment" },
    { key: "monitoring", label: "Monitoring" },
    { key: "pearls", label: "Clinical Pearls" },
    ...(condition === "fabry" ? [{ key: "screening_tool", label: "🔍 Screening Tool" }] : []),
    ...(condition === "arpkd_adpkd" ? [{ key: "ahus_tool", label: "💊 aHUS Protocol" }] : []),
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
          {section === "screening_tool" && <FabryScreeningTool />}
          {section === "ahus_tool" && <AHUSPlexGuide />}
          {section !== "overview" && section !== "screening_tool" && section !== "ahus_tool" && data[section]?.map((item, i) => (
            <div key={i} className={`flex items-start gap-2 p-3 rounded-lg ${
              item.startsWith("  ") ? "ml-4 bg-slate-50 border border-slate-100" :
              section === "pearls" ? "bg-amber-50 border border-amber-200" :
              section === "treatment" ? "bg-green-50 border border-green-200" :
              section === "diagnosis" ? "bg-blue-50 border border-blue-200" :
              "bg-slate-50 border border-slate-200"}`}>
              <ArrowRight className={`w-3 h-3 flex-shrink-0 mt-0.5 ${section === "pearls" ? "text-amber-600" : section === "treatment" ? "text-green-600" : "text-blue-500"}`} />
              <p className="text-xs text-slate-800 leading-relaxed">{item.trim()}</p>
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