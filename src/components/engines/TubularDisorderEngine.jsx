/**
 * Tubular Disorder Engine — NDI, Dent Disease, Fanconi, Hypophosphatemic Rickets
 * Full branching decision engine
 */
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight, ArrowLeft, Droplet, AlertTriangle } from "lucide-react";

const MODULES = [
  { id: "polyuria", label: "Polyuria / Suspected NDI", desc: "Polyuria + hypernatraemia + dilute urine", color: "bg-blue-600" },
  { id: "dent", label: "Low-MW Proteinuria / Dent Disease", desc: "Tubular proteinuria + hypercalciuria + nephrocalcinosis", color: "bg-purple-600" },
  { id: "fanconi", label: "Fanconi Syndrome", desc: "Generalised proximal tubular dysfunction", color: "bg-teal-600" },
  { id: "rickets", label: "Hypophosphatemic Rickets", desc: "Low PO4 + normal PTH + renal phosphate wasting", color: "bg-amber-600" },
];

const InfoRow = ({ items, color = "text-slate-700" }) => (
  <ul className="space-y-1">
    {items.map((it, i) => <li key={i} className={`flex items-start gap-2 text-xs ${color}`}><span className="text-teal-500 font-bold flex-shrink-0 mt-0.5">→</span>{it}</li>)}
  </ul>
);

const Section = ({ heading, items, color = "border-teal-200" }) => (
  <Card className={`border ${color}`}>
    <CardContent className="p-3">
      <p className="font-bold text-sm text-teal-900 mb-2">{heading}</p>
      <InfoRow items={items} />
    </CardContent>
  </Card>
);

const ChoiceBtn = ({ label, sub, onClick }) => (
  <button onClick={onClick} className="w-full flex items-start justify-between px-4 py-3 rounded-xl border-2 border-slate-200 bg-white hover:border-teal-400 hover:bg-teal-50 transition-all text-left">
    <div>
      <p className="text-sm font-semibold text-slate-800">{label}</p>
      {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
    </div>
    <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
  </button>
);

// ── NDI Engine ────────────────────────────────────────────────────────────────
function NDIEngine({ onBack }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});

  const ans = (key, val) => { setAnswers(a => ({ ...a, [key]: val })); setStep(s => s + 1); };
  const back = () => {
    if (step === 0) { onBack(); return; }
    setStep(s => s - 1);
    setAnswers(a => { const copy = { ...a }; const keys = Object.keys(copy); delete copy[keys[keys.length - 1]]; return copy; });
  };

  if (step === 0) return (
    <div className="space-y-3">
      <p className="text-sm font-bold text-slate-800">Is serum osmolality elevated + urine osmolality low (&lt;300 mOsm/kg)?</p>
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs">
        <p className="font-semibold mb-1">Confirm polyuria pattern:</p>
        <p>• Polyuria: urine output &gt;4 mL/kg/h in infants, &gt;2 mL/kg/h in children</p>
        <p>• Dilute urine (Osm &lt;300), elevated serum Na/Osm = DI</p>
        <p>• Low serum Na + dilute urine = primary polydipsia</p>
      </div>
      <ChoiceBtn label="Yes — dilute urine + high serum Osm" sub="→ Diabetes insipidus pattern" onClick={() => ans("pattern", "di")} />
      <ChoiceBtn label="No — dilute urine + low/normal serum Osm" sub="→ Primary polydipsia (psychogenic/iatrogenic)" onClick={() => ans("pattern", "pp")} />
    </div>
  );

  if (step === 1 && answers.pattern === "pp") return (
    <div className="space-y-3">
      <Section heading="Primary Polydipsia" items={[
        "Psychogenic: excessive voluntary water intake, often adolescents with psychiatric history",
        "Iatrogenic: excess hypotonic IV fluids (common post-op)",
        "Treatment: Fluid restriction to 800 mL/m²/day; psychiatric evaluation if psychogenic",
        "Na corrects spontaneously with fluid restriction",
        "Reset osmostat (rare): chronic low serum Na set-point, no treatment needed",
      ]} />
      <Button variant="outline" size="sm" className="w-full" onClick={back}><ArrowLeft className="w-3.5 h-3.5 mr-1" />Back</Button>
    </div>
  );

  if (step === 1 && answers.pattern === "di") return (
    <div className="space-y-3">
      <p className="text-sm font-bold text-slate-800">DDAVP (desmopressin) test result:</p>
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs">
        <p className="font-semibold mb-1">Water deprivation test then DDAVP:</p>
        <p>• Deprived until urine Osm plateaus or &gt;5% body weight lost</p>
        <p>• Give DDAVP 20 mcg intranasal or 0.3 mcg/kg IV</p>
        <p>• Measure urine Osm at 1h and 2h after DDAVP</p>
      </div>
      <ChoiceBtn label="Urine Osm rises >50% after DDAVP" sub="→ Central DI (AVP-deficient)" onClick={() => ans("ddavp", "responsive")} />
      <ChoiceBtn label="Urine Osm rises <50% after DDAVP" sub="→ Nephrogenic DI (AVP-resistant)" onClick={() => ans("ddavp", "resistant")} />
    </div>
  );

  if (step === 2 && answers.ddavp === "responsive") return (
    <div className="space-y-3">
      <Section heading="Central DI — Management" items={[
        "AVP deficiency — brain/pituitary aetiology",
        "MRI pituitary: Absent posterior pituitary bright spot, stalk thickening",
        "Causes: Craniopharyngioma, Langerhans cell histiocytosis, trauma, surgery, idiopathic",
        "Treatment: Desmopressin (DDAVP) 0.05–0.2 mg PO BD; or intranasal 5–20 mcg",
        "Monitor: Serum Na daily initially; titrate DDAVP to urine output",
        "Hyponatraemia risk with DDAVP overdose — education essential",
      ]} />
      <Button variant="outline" size="sm" className="w-full" onClick={back}><ArrowLeft className="w-3.5 h-3.5 mr-1" />Back</Button>
    </div>
  );

  if (step === 2 && answers.ddavp === "resistant") return (
    <div className="space-y-3">
      <p className="text-sm font-bold text-slate-800">Age + sex of patient?</p>
      <ChoiceBtn label="Male infant / young child" sub="→ AVPR2 (X-linked) more likely — severe phenotype" onClick={() => ans("sex", "male")} />
      <ChoiceBtn label="Female or older child" sub="→ AQP2 (autosomal) or acquired causes" onClick={() => ans("sex", "female_other")} />
    </div>
  );

  if (step === 3) return (
    <div className="space-y-3">
      <div className="rounded-xl bg-blue-700 p-3 text-white">
        <p className="font-bold text-sm">Nephrogenic DI — {answers.sex === "male" ? "AVPR2 (X-linked)" : "AQP2 / Acquired"}</p>
      </div>
      <Section heading="Genetics" items={
        answers.sex === "male"
          ? ["AVPR2 (X-linked): Males severely affected; females carriers (variable penetrance)", "Send AVPR2 sequencing", "Renal USS: dilated collecting system (chronic NDI)"]
          : ["AQP2 (AR/AD): Both sexes; milder than AVPR2", "Acquired causes: Lithium, cisplatin, hypercalcaemia, hypokalaemia — check drug history + Ca + K", "Send AQP2 sequencing if no acquired cause found"]
      } />
      <Section heading="Treatment" items={[
        "Low-solute diet: low Na + low protein reduces obligatory urine output",
        "HCTZ 1–2 mg/kg/day PO (thiazide — paradoxical antidiuresis via proximal Na reabsorption)",
        "Amiloride 0.3 mg/kg/day (add to HCTZ — also reverses lithium NDI)",
        "Indomethacin 0.5–1 mg/kg/day (add if HCTZ/amiloride insufficient — reduces renal prostaglandins)",
        "Adequate free water: ad lib oral fluids or NG if polyuric infant — prevent hypernatraemia",
      ]} />
      <Section heading="Monitoring" items={[
        "Serum Na + Osm: weekly initially, then monthly when stable",
        "Urine Osm: baseline and on treatment",
        "Growth velocity every 6 months — chronic hypernatraemia impairs growth",
        "Renal USG annually: dilated collecting system, nephrocalcinosis",
        "BP 6-monthly: long-term Na handling effects",
      ]} />
      <Button variant="outline" size="sm" className="w-full" onClick={back}><ArrowLeft className="w-3.5 h-3.5 mr-1" />Back to NDI</Button>
    </div>
  );

  return null;
}

// ── Dent Disease Engine ───────────────────────────────────────────────────────
function DentEngine({ onBack }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});

  const ans = (key, val) => { setAnswers(a => ({ ...a, [key]: val })); setStep(s => s + 1); };
  const back = () => {
    if (step === 0) { onBack(); return; }
    setStep(s => s - 1);
  };

  if (step === 0) return (
    <div className="space-y-3">
      <p className="text-sm font-bold text-slate-800">Is low-molecular-weight (LMW) proteinuria confirmed?</p>
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs">
        <p className="font-semibold mb-1">LMW proteinuria pattern:</p>
        <p>• Urine beta-2 microglobulin or alpha-1 microglobulin elevated</p>
        <p>• Tubular-type pattern on urine protein electrophoresis</p>
        <p>• UPCR may be moderately elevated but albumin is NOT the dominant fraction</p>
      </div>
      <ChoiceBtn label="Yes — LMW proteinuria confirmed" sub="→ Proceed to Dent disease evaluation" onClick={() => ans("lmw", "yes")} />
      <ChoiceBtn label="No — albumin-predominant proteinuria" sub="→ Glomerular proteinuria; see NS/GN engine" onClick={() => ans("lmw", "no")} />
    </div>
  );

  if (step === 1 && answers.lmw === "no") return (
    <div className="space-y-3">
      <Section heading="Glomerular Proteinuria" items={[
        "Albumin-predominant proteinuria → glomerular cause",
        "Use Nephrotic Syndrome Engine or Glomerulonephritis Engine",
        "LMW proteinuria test: beta-2 microglobulin >1 mg/L indicates tubular dysfunction",
      ]} />
      <Button variant="outline" size="sm" className="w-full" onClick={back}><ArrowLeft className="w-3.5 h-3.5 mr-1" />Back</Button>
    </div>
  );

  if (step === 1 && answers.lmw === "yes") return (
    <div className="space-y-3">
      <p className="text-sm font-bold text-slate-800">Is the patient male?</p>
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs">
        <p>Dent disease is X-linked (CLCN5 and OCRL1 mutations). Classic Dent disease predominantly affects males. Carrier females may have mild LMW proteinuria.</p>
      </div>
      <ChoiceBtn label="Male" sub="→ Dent disease likely — proceed" onClick={() => ans("sex", "male")} />
      <ChoiceBtn label="Female" sub="→ Consider carrier Dent-2 / Lowe syndrome" onClick={() => ans("sex", "female")} />
    </div>
  );

  if (step === 2 && answers.sex === "female") return (
    <div className="space-y-3">
      <Section heading="Female with LMW Proteinuria" items={[
        "Carrier Dent-1 (CLCN5): May have mild LMW proteinuria — confirm family history",
        "Dent-2/Lowe (OCRL1): Check for ocular (cataracts) + intellectual features",
        "Cystinosis (CTNS): Both sexes — corneal crystals, FTT, Fanconi syndrome",
        "Consider Fanconi syndrome if full Fanconi panel (glucose, amino acids, phosphate, bicarb) abnormal",
      ]} />
      <Button variant="outline" size="sm" className="w-full" onClick={back}><ArrowLeft className="w-3.5 h-3.5 mr-1" />Back</Button>
    </div>
  );

  if (step === 2 && answers.sex === "male") return (
    <div className="space-y-3">
      <p className="text-sm font-bold text-slate-800">Is hypercalciuria present (urine Ca/Cr &gt;0.25 mg/mg)?</p>
      <ChoiceBtn label="Yes — hypercalciuria confirmed" sub="→ Classic Dent disease pattern" onClick={() => ans("hypercalc", "yes")} />
      <ChoiceBtn label="No — normocalciuria" sub="→ Consider other tubular disorders" onClick={() => ans("hypercalc", "no")} />
    </div>
  );

  if (step === 3 && answers.hypercalc === "no") return (
    <div className="space-y-3">
      <Section heading="LMW Proteinuria + Male + Normocalciuria" items={[
        "Isolated LMW proteinuria without hypercalciuria: Less typical for Dent — still send CLCN5",
        "Consider: Aminoaciduria (Hartnup) · proximal RTA (type 2) if bicarbonaturia",
        "OCRL1 sequencing: Lowe syndrome variant — check eyes + cognition",
      ]} />
      <Button variant="outline" size="sm" className="w-full" onClick={back}><ArrowLeft className="w-3.5 h-3.5 mr-1" />Back</Button>
    </div>
  );

  if (step === 3 && answers.hypercalc === "yes") return (
    <div className="space-y-3">
      <p className="text-sm font-bold text-slate-800">Is nephrocalcinosis or nephrolithiasis present on renal USG?</p>
      <ChoiceBtn label="Yes — nephrocalcinosis / stones" sub="→ Dent-1 (CLCN5) — most likely" onClick={() => ans("nephrocal", "yes")} />
      <ChoiceBtn label="Not yet / early disease" sub="→ Dent still possible — check additional features" onClick={() => ans("nephrocal", "no")} />
    </div>
  );

  if (step === 4) return (
    <div className="space-y-3">
      <div className="rounded-xl bg-purple-700 p-3 text-white">
        <p className="font-bold text-sm">Dent Disease — {answers.nephrocal === "yes" ? "Confirmed Pattern" : "Likely"}</p>
        <p className="text-xs text-purple-200 mt-0.5">CLCN5 (Dent-1) or OCRL1 (Dent-2) X-linked tubular disorder</p>
      </div>
      <Section heading="Investigations" items={[
        "Urine: beta-2 microglobulin, alpha-1 microglobulin, Ca/Cr ratio, TRP, UPCR",
        "Serum: Ca, PO4, albumin, creatinine, eGFR",
        "Renal USG: medullary nephrocalcinosis, kidney size",
        "Genetic: CLCN5 sequencing (Dent-1); OCRL1 (Dent-2 — Lowe)",
        "Slit-lamp: cataracts (Lowe/Dent-2)",
      ]} />
      <Section heading="Management" items={[
        "High fluid intake: dilutes calcium concentration, reduces stone risk",
        "Thiazide diuretic (HCTZ 1–2 mg/kg/day): reduces urinary calcium",
        "Citrate supplementation if stones/nephrocalcinosis + low urine citrate",
        "ACEi/ARB: if UPCR >0.5 mg/mg (reduces proteinuria and slows progression)",
        "Avoid nephrotoxins: NSAIDs, aminoglycosides, IV contrast without NAC",
        "No curative treatment — manage complications",
      ]} />
      <Section heading="Monitoring & Prognosis" color="border-red-200" items={[
        "eGFR every 6 months — 30–80% reach ESKD by age 30–50",
        "Ca/Cr annually, renal USG annually for stone progression",
        "UPCR monthly initially, then quarterly",
        "Plan early transplant discussion — genetic counselling for family",
        "Carrier testing for maternal relatives",
      ]} />
      <Button variant="outline" size="sm" className="w-full" onClick={back}><ArrowLeft className="w-3.5 h-3.5 mr-1" />Back</Button>
    </div>
  );

  return null;
}

// ── Fanconi Engine ────────────────────────────────────────────────────────────
function FanconiEngine({ onBack }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});

  const ans = (key, val) => { setAnswers(a => ({ ...a, [key]: val })); setStep(s => s + 1); };
  const back = () => {
    if (step === 0) { onBack(); return; }
    setStep(s => s - 1);
  };

  if (step === 0) return (
    <div className="space-y-3">
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs space-y-1">
        <p className="font-semibold">Fanconi syndrome = ALL of these:</p>
        <p>• Glucosuria with NORMAL blood glucose</p>
        <p>• Aminoaciduria (HPLC urine amino acids elevated)</p>
        <p>• Phosphaturia (TRP &lt;85%, TmP/GFR reduced)</p>
        <p>• Bicarbonaturia (metabolic acidosis + urine pH elevated)</p>
      </div>
      <p className="text-sm font-bold text-slate-800">Age at onset:</p>
      <ChoiceBtn label="< 2 years (infant / early childhood)" sub="→ Cystinosis, galactosaemia, tyrosinaemia most likely" onClick={() => ans("age", "young")} />
      <ChoiceBtn label="Older child / school age" sub="→ Cystinosis, Lowe, Dent, mitochondrial, drugs" onClick={() => ans("age", "older")} />
    </div>
  );

  if (step === 1) return (
    <div className="space-y-3">
      <p className="text-sm font-bold text-slate-800">Key extrarenal features present?</p>
      <ChoiceBtn label="Photophobia + FTT + corneal crystals" sub="→ Cystinosis (most common cause)" onClick={() => ans("feature", "cystinosis")} />
      <ChoiceBtn label="Cataracts + hypotonia + intellectual disability (male)" sub="→ Lowe syndrome (OCRL1)" onClick={() => ans("feature", "lowe")} />
      <ChoiceBtn label="Lactic acidosis + multiorgan involvement" sub="→ Mitochondrial disease" onClick={() => ans("feature", "mito")} />
      <ChoiceBtn label="Neonatal liver disease + FTT" sub="→ Galactosaemia (GALT) or Tyrosinaemia type 1 (FAH)" onClick={() => ans("feature", "metabolic")} />
      <ChoiceBtn label="Drug history (tenofovir, cisplatin, ifosfamide)" sub="→ Drug-induced Fanconi" onClick={() => ans("feature", "drug")} />
      <ChoiceBtn label="No clear extrarenal features" sub="→ Further investigations needed" onClick={() => ans("feature", "unclear")} />
    </div>
  );

  const causeSections = {
    cystinosis: {
      title: "Cystinosis (CTNS mutation)",
      items: [
        "Most common cause of hereditary Fanconi syndrome in children",
        "Investigations: Leukocyte cystine (gold standard) + slit-lamp (crystals) + CTNS sequencing",
        "Treatment: Cysteamine bitartrate (Procysbi/Cystagon) — reduces cystine accumulation",
        "Cysteamine eye drops: for corneal crystals",
        "Supportive Fanconi: phosphate + calcitriol + K citrate + fluids",
        "Late complications: renal failure by 10–12y without treatment; hypothyroidism, myopathy",
      ]
    },
    lowe: {
      title: "Lowe Syndrome / Oculo-Cerebro-Renal (OCRL1)",
      items: [
        "X-linked; OCRL1 mutation; males affected",
        "Cataracts at birth (may need surgery), glaucoma",
        "Intellectual disability + hypotonia",
        "Renal Fanconi syndrome: early onset, progressive CKD",
        "Investigations: Ophthalmology + OCRL1 sequencing",
        "Treatment: Supportive Fanconi (phosphate, calcitriol, K citrate); no specific therapy",
      ]
    },
    mito: {
      title: "Mitochondrial Disease",
      items: [
        "Fanconi + lactic acidosis + multiorgan: liver, muscle, nervous system",
        "Investigations: Plasma lactate, acylcarnitine profile, muscle biopsy (ETC complex activity)",
        "Mitochondrial genome + nuclear gene panel (POLG, TWNK, etc.)",
        "Treatment: Supportive; riboflavin + CoQ10 supplementation (limited evidence)",
        "Genetic counselling: maternal inheritance for mtDNA mutations",
      ]
    },
    metabolic: {
      title: "Galactosaemia / Tyrosinaemia Type 1",
      items: [
        "Galactosaemia (GALT): neonatal liver disease + Fanconi → galactose-free diet (lifelong)",
        "Tyrosinaemia type 1 (FAH): hepatomegaly + Fanconi + coagulopathy → NTBC (nitisinone) + low tyr/phe diet",
        "Newborn screen may detect both — confirm with enzyme/genetic testing",
        "Liver transplant: curative for Ty-1 if NTBC fails; galactosaemia does not benefit",
      ]
    },
    drug: {
      title: "Drug-Induced Fanconi",
      items: [
        "Tenofovir (antiretrovirals): most common adult cause; also paediatric HIV treatment",
        "Cisplatin/ifosfamide: chemotherapy-induced proximal tubular injury",
        "Heavy metals: lead, mercury poisoning",
        "Treatment: Withdraw causative drug — Fanconi often partially reversible",
        "Monitor TRP, glucose, amino acids after withdrawal",
      ]
    },
    unclear: {
      title: "Investigations to Find Cause",
      items: [
        "Leukocyte cystine (cystinosis screen)",
        "Slit-lamp examination",
        "Urine organic acids + plasma amino acids (metabolic screen)",
        "Plasma lactate, CK (mitochondrial)",
        "Drug history review",
        "Genetic panel: CTNS, OCRL1, CLCN5, FAH, GALT + mitochondrial genes",
      ]
    },
  };

  if (step === 2) {
    const c = causeSections[answers.feature];
    return (
      <div className="space-y-3">
        <div className="rounded-xl bg-teal-700 p-3 text-white">
          <p className="font-bold text-sm">{c.title}</p>
        </div>
        <Section heading="Investigations & Management" items={c.items} />
        <Section heading="Supportive Fanconi Treatment (All Causes)" items={[
          "Phosphate supplementation: 1–3 g/day elemental PO4 in 4–6 divided doses",
          "Calcitriol (active Vit D): 0.025–0.05 µg/kg/day (promotes PO4 absorption, prevents rickets)",
          "Potassium citrate: 1–3 mEq/kg/day (corrects acidosis + hypokalaemia)",
          "Free water: ad lib oral fluids or NG feeds if polyuric infant",
        ]} />
        <Button variant="outline" size="sm" className="w-full" onClick={back}><ArrowLeft className="w-3.5 h-3.5 mr-1" />Back</Button>
      </div>
    );
  }

  return null;
}

// ── Rickets Engine (static reference) ────────────────────────────────────────
function RicketsRef({ onBack }) {
  return (
    <div className="space-y-3">
      <Section heading="Hypophosphatemic Rickets — Classification" items={[
        "X-linked hypophosphataemia (XLH): PHEX mutation; elevated FGF23 — most common",
        "ADHR: FGF23 mutation, variable expression",
        "ARHR type 1 (DMP1), type 2 (ENPP1): autosomal recessive",
        "Tumour-induced osteomalacia (TIO): FGF23-secreting mesenchymal tumour",
        "HHRH (SLC34A3): low FGF23 — low Ca (hypercalciuria), high 1,25-OHD",
      ]} />
      <Section heading="Key Biochemistry Pattern" items={[
        "Low serum PO4 (renal PO4 wasting)",
        "TRP reduced (<85%) + TmP/GFR reduced",
        "Normal Ca, normal PTH",
        "Raised ALP, elevated FGF23 (XLH, ADHR, ARHR) vs LOW FGF23 (HHRH)",
        "Low/normal 25-OHD; low 1,25-OHD in XLH",
      ]} />
      <Section heading="Investigations" items={[
        "TRP + TmP/GFR calculation",
        "FGF23 (intact or C-terminal assay)",
        "24h urine calcium (elevated in HHRH)",
        "X-rays: fraying, cupping, bowing of long bones, Looser zones",
        "PHEX sequencing (XLH); FGF23, DMP1, ENPP1 if PHEX negative",
        "Renal USG (nephrocalcinosis — more common with phosphate + calcitriol treatment)",
      ]} />
      <Section heading="Treatment" items={[
        "XLH first-line: Burosumab (anti-FGF23 antibody) 0.4 mg/kg SC q2w (age ≥1y) — if available",
        "Conventional: Neutral phosphate 40–60 mg/kg/day + calcitriol 20–30 ng/kg/day",
        "Monitor: PO4, ALP, renal USG (nephrocalcinosis), PTH, growth velocity",
        "Orthopaedics: lower limb bracing, corrective osteotomy for severe bowing",
        "India: burosumab via compassionate use; phosphate supplements widely available",
      ]} />
      <Button variant="outline" size="sm" className="w-full" onClick={onBack}><ArrowLeft className="w-3.5 h-3.5 mr-1" />Back to Tubular Menu</Button>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function TubularDisorderEngine() {
  const [selected, setSelected] = useState(null);

  if (!selected) return (
    <div className="space-y-4">
      <div className="rounded-xl bg-gradient-to-r from-teal-800 to-emerald-700 p-4 text-white">
        <div className="flex items-center gap-2 mb-1">
          <Droplet className="w-5 h-5" />
          <h3 className="font-bold text-sm">Tubular Disorder Engine</h3>
        </div>
        <p className="text-xs text-teal-200">Select a module to begin structured assessment</p>
      </div>
      <div className="space-y-2">
        {MODULES.map(m => (
          <button key={m.id} onClick={() => setSelected(m.id)}
            className={`w-full flex items-center gap-3 px-4 py-4 rounded-xl text-white text-left shadow-sm ${m.color} hover:opacity-90 active:scale-95 transition-all`}>
            <ChevronRight className="w-4 h-4 flex-shrink-0" />
            <div>
              <p className="font-semibold text-sm">{m.label}</p>
              <p className="text-xs opacity-80 mt-0.5">{m.desc}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  const headerBg = {
    polyuria: "from-blue-800 to-blue-600",
    dent: "from-purple-800 to-purple-600",
    fanconi: "from-teal-800 to-emerald-700",
    rickets: "from-amber-700 to-amber-500",
  };

  return (
    <div className="space-y-4">
      <div className={`rounded-xl bg-gradient-to-r ${headerBg[selected]} p-4 text-white`}>
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm">{MODULES.find(m => m.id === selected)?.label}</h3>
          <button onClick={() => setSelected(null)} className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full border border-white/20">← Menu</button>
        </div>
      </div>
      {selected === "polyuria" && <NDIEngine onBack={() => setSelected(null)} />}
      {selected === "dent" && <DentEngine onBack={() => setSelected(null)} />}
      {selected === "fanconi" && <FanconiEngine onBack={() => setSelected(null)} />}
      {selected === "rickets" && <RicketsRef onBack={() => setSelected(null)} />}
    </div>
  );
}