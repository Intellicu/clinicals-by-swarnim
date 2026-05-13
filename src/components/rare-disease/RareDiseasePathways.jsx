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
import { ChevronDown, ChevronUp, BookOpen, Pencil, Check, X, Plus, Trash2, RefreshCw, ExternalLink, Loader2 } from "lucide-react";

const DEFAULT_PATHWAYS = [
  {
    id: "ahus", name: "aHUS", full: "Atypical Haemolytic Uraemic Syndrome", gene: "CFH, CFI, CD46, C3, CFB, THBD, DGKE", color: "red",
    overview: "Complement-mediated TMA caused by dysregulation of alternative complement pathway. Not related to STEC. Life-threatening without eculizumab. Recurrence risk post-transplant is high without complement inhibition.",
    genetics: "Pathogenic mutations in ~60–70% of patients. CFH mutations most common (20–30%). Anti-CFH antibodies in ~10% (assoc. CFHR1/3 deletion). DGKE: infantile onset, steroid-responsive features.",
    red_flags: ["TMA + STEC-negative + ADAMTS13 normal", "Recurrent TMA after first episode", "Familial TMA", "Post-partum TMA", "TMA post-transplant", "TMA + low C3"],
    diagnostic: ["Blood film: schistocytes", "ADAMTS13 activity (exclude TTP)", "STEC cultures + PCR + Shiga toxin", "C3, C4, CH50, AP50", "Anti-CFH antibodies", "Complement genetic panel (CFH/I/B, CD46, C3, THBD, DGKE)", "Renal biopsy (TMA pattern on EM)", "sC5b-9 (terminal complement activation marker)"],
    monitoring: "LDH, Hb, platelets, creatinine before each eculizumab infusion. CH50/AP50 monthly. Anti-CFH titres 3-monthly (if positive). Urinalysis. Annual meningococcal antibody titres.",
    ckd: "Most patients have residual CKD after acute episode. Continue eculizumab maintenance even with normal renal function.",
    transplant: "HIGH recurrence risk for CFH, CFI, C3, CFB mutations. Pre-emptive eculizumab mandatory peri-transplant. CD46: good prognosis.",
    family_screening: "Screen all 1st-degree relatives for CFH/CFI/CD46/C3/CFB mutations. Anti-CFH antibodies in siblings.",
    references: ["KDIGO aHUS Controversies 2021", "Legendre CM NEJM 2013", "Caprioli J JASN 2006", "IJN 2025 Eculizumab India"],
    further_reading: [
      { title: "KDIGO aHUS Controversies Conference Report", url: "https://kdigo.org/conferences/ahus/", source: "KDIGO", year: "2021" },
      { title: "Eculizumab in aHUS — Phase 2 Trial", url: "https://www.nejm.org/doi/10.1056/NEJMoa1208981", source: "NEJM", year: "2013" },
      { title: "aHUS Foundation Clinical Resources", url: "https://www.ahus.org/clinical-resources", source: "aHUS Foundation", year: "2024" },
    ]
  },
  {
    id: "cystinosis", name: "Cystinosis", full: "Cystinosis (CTNS Mutation)", gene: "CTNS (17p13)", color: "amber",
    overview: "Autosomal recessive lysosomal storage disorder of cystine transport. Most common inherited cause of Fanconi syndrome in childhood. Without treatment, ESRD by age 10.",
    genetics: "AR, CTNS gene. Most common mutation: 57 kb deletion in European populations. Missense mutations in Indian/Asian populations.",
    red_flags: ["Failure to thrive + polyuria + photophobia in infancy", "Fanconi syndrome (glycosuria, phosphaturia, aminoaciduria)", "Corneal cystine crystals >1 year (slit lamp)", "Progressive renal failure in pre-teen without clear GN"],
    diagnostic: ["Leucocyte cystine levels", "Slit lamp examination (corneal crystals)", "Urine: glucose, amino acids, phosphate, protein, calcium", "TRP, FENa, FEK (Fanconi syndrome)", "Renal ultrasound (medullary NC)", "CTNS gene sequencing / deletion analysis", "Thyroid function"],
    monitoring: "Leucocyte cystine monthly (target <0.5 nmol/mg). Renal function monthly in childhood. Ophthalmology annual. Thyroid function annually. Swallow, pulmonary, muscle, neurological review.",
    ckd: "Cysteamine (oral) + cysteamine eye drops prolong renal function. Transplant corrects renal failure but continue cysteamine lifelong for extra-renal disease.",
    transplant: "Excellent outcomes. Donor kidney does NOT develop cystinosis. Continue cysteamine post-transplant.",
    family_screening: "AR inheritance. Carrier testing for parents and siblings. Prenatal diagnosis: CTNS sequencing from CVS.",
    references: ["Ariceta G et al. Ped Nephrol 2021", "Nesterova G. Paediatric Nephrology 2022", "CTNS Foundation Guidelines 2023"],
    further_reading: [
      { title: "Cystinosis — Ped Nephrol Review 2021", url: "https://link.springer.com/article/10.1007/s00467-020-04546-2", source: "Pediatric Nephrology", year: "2021" },
      { title: "Cystinosis Research Foundation", url: "https://www.cystinosis.org", source: "CRF", year: "2024" },
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
    references: ["EFACTS Registry 2020", "Germain D. Best Practice Res Clin Endocrinol 2021", "KDIGO Fabry guidance 2023"],
    further_reading: [
      { title: "Fabry Disease — Best Practice Review", url: "https://www.sciencedirect.com/science/article/pii/S1521690X21000208", source: "Best Practice & Research", year: "2021" },
      { title: "Fabry International Network", url: "https://fabry-network.org", source: "FIN", year: "2024" },
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
    id: "alport", name: "Alport Syndrome", full: "Alport Syndrome", gene: "COL4A5 (X-linked), COL4A3/COL4A4 (AR/AD)", color: "indigo",
    overview: "Hereditary nephritis due to mutations in type IV collagen genes. Affects GBM, lens, and cochlea. Leading genetic cause of ESRD with progressive haematuria + proteinuria from childhood.",
    genetics: "X-linked (80%): COL4A5. Males: progressive. AR (15%): COL4A3/COL4A4 — severe. AD (5%): mild, often diagnosed as thin basement membrane nephropathy.",
    red_flags: ["Persistent microscopic haematuria from childhood in male", "Family history of haematuria + CKD in maternal uncles", "Bilateral SNHL + renal disease", "Anterior lenticonus + haematuria", "Biopsy: thinning/lamellation of GBM on EM"],
    diagnostic: ["Renal biopsy: EM + IF (type IV collagen staining)", "Audiometry (SNHL — high frequency)", "Ophthalmology (lenticonus, macular flecks)", "COL4A3/A4/A5 gene sequencing", "Skin biopsy (type IV collagen staining)", "Urine ACR + renal function annually"],
    monitoring: "Urine ACR: annually. Once proteinuria >0.2 mg/mg — start RAS blockade. Audiometry every 2 years from age 5. Ophthalmology every 2–3 years.",
    ckd: "Start RAS blockade (ACEi) as soon as proteinuria appears. Slows progression by ~5–10 years in males.",
    transplant: "Excellent outcomes. ~3% risk of anti-GBM disease post-transplant. Screen for post-transplant anti-GBM antibodies.",
    family_screening: "X-linked: screen all first-degree female relatives. AR: siblings 25% risk. AD: 50% risk. Audiometry + urinalysis for all at-risk relatives.",
    references: ["KDIGO Alport Syndrome 2021 guideline", "Rheault MN Ped Nephrol 2020", "Gross O. Lancet 2020"],
    further_reading: [
      { title: "KDIGO Alport Syndrome 2021 Guidelines", url: "https://kdigo.org/guidelines/alport-syndrome/", source: "KDIGO", year: "2021" },
      { title: "Alport Syndrome Foundation", url: "https://www.alportsyndrome.org", source: "ASF", year: "2024" },
      { title: "Gross O et al. Lancet — ACEi slows progression", url: "https://www.thelancet.com/journals/lancet/article/PIIS0140-6736(19)32807-3/fulltext", source: "Lancet", year: "2020" },
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
    { title: "Diagnostic Algorithm", key: "diagnostic", isList: true },
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
        <TabsList className="inline-flex h-auto gap-1 bg-white border border-slate-200 rounded-xl p-1 min-w-full md:grid md:grid-cols-7">
          {DEFAULT_PATHWAYS.map(p => (
            <TabsTrigger key={p.id} value={p.id} className="px-2 py-2 text-xs rounded-lg whitespace-nowrap data-[state=active]:bg-violet-600 data-[state=active]:text-white">
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