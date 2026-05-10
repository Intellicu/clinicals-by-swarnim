import React, { useState } from "react";
import ImmunologyLabPathways from "../components/immunology/ImmunologyLabPathways";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search, FlaskConical, Droplet, Activity, Brain, ChevronRight,
  AlertTriangle, BookOpen, Microscope, Calculator, ArrowRight,
  CheckCircle, Info, List, Stethoscope
} from "lucide-react";

const LAB_PATHWAYS = [
  {
    id: "water-deprivation",
    title: "Water Deprivation Test",
    icon: Droplet,
    color: "bg-blue-600",
    badge: "blue",
    category: "Endocrine",
    purpose: "Distinguish central DI vs nephrogenic DI vs primary polydipsia",
    indications: [
      "Confirmed polyuria (>40mL/kg/day or >2L/m²/day)",
      "Urine osmolality consistently <300 mOsm/kg",
      "Diabetes mellitus excluded (fasting glucose normal)",
      "Hypercalcemia and hypokalemia excluded"
    ],
    contraindications: [
      "Severe dehydration or hypernatremia (Na >145 mEq/L)",
      "Clinically unstable patient",
      "Suspected nephrogenic DI in neonate — proceed directly to DDAVP test"
    ],
    protocol: [
      "PREPARATION: Baseline weight, serum Na/osmolality, urine osmolality (first morning)",
      "Fluid restriction: Stop all fluids at start of test (usually 8am)",
      "MONITORING every 1–2 hours: Weight (stop if >5% loss), BP, HR, urine volume + osmolality, serum Na/osmolality",
      "ENDPOINT: Urine osmolality ≥700 mOsm/kg (normal), OR serum osmolality >295 mOsm/kg, OR weight loss >5%",
      "DDAVP PHASE: Give DDAVP 0.3 mcg/kg SC (or 10mcg intranasal); measure urine osmolality at 1h and 2h post-DDAVP"
    ],
    interpretation: [
      "Normal response: Urine osm rises to >700 mOsm/kg → Primary polydipsia or no DI",
      "Central DI: Urine osm stays <300 mOsm/kg → After DDAVP: rises >50% (typically >700)",
      "Nephrogenic DI: Urine osm stays <300 mOsm/kg → After DDAVP: minimal/no rise (<50%)",
      "Partial Central DI: Urine osm rises 10–50% after DDAVP",
      "Partial Nephrogenic DI: Partial rise after DDAVP but still <300 mOsm/kg"
    ],
    pitfalls: [
      "Prolonged polydipsia can downregulate AQP2 (secondary nephrogenic DI) — may confuse results",
      "Avoid overnight deprivation in young children — use shorter supervised test",
      "Stop test immediately if Na >150 or weight loss >5%",
      "False result if patient secretly drank water during test"
    ],
    pearls: [
      "Copeptin (AVP surrogate) after hypertonic saline is replacing water deprivation test in adults",
      "Urine osmolality after overnight fast >700 essentially rules out DI",
      "In neonates with nephrogenic DI: risk of severe hypernatremia — proceed cautiously"
    ]
  },
  {
    id: "acth-stimulation",
    title: "ACTH Stimulation Test",
    icon: Activity,
    color: "bg-orange-600",
    badge: "orange",
    category: "Endocrine",
    purpose: "Assess adrenocortical function; diagnose primary or secondary adrenal insufficiency",
    indications: [
      "Suspected adrenal insufficiency (fatigue, hypotension, hyponatremia, hyperpigmentation)",
      "Monitoring patients on long-term steroids (adrenal suppression)",
      "Post-steroid weaning — before complete withdrawal",
      "Unexplained hyponatremia or hypoglycemia"
    ],
    contraindications: [
      "Active systemic infection (defer unless urgent)",
      "Recent exogenous steroid use in last 12–24 hours (may mask result)"
    ],
    protocol: [
      "PREPARATION: Morning test (8–9am), fasting 4–6h; stop hydrocortisone 24h before if testing adrenal axis",
      "BASELINE: Take blood for cortisol, ACTH, electrolytes, glucose (T=0)",
      "DOSE: Synacthen (tetracosactide) 250mcg IV over 30 sec (or 1 mcg for low-dose test)",
      "SAMPLES: Blood cortisol at T=30 min and T=60 min",
      "LOW-DOSE test (1 mcg): More sensitive for partial secondary AI — samples at 20 and 30 min"
    ],
    interpretation: [
      "NORMAL RESPONSE: Cortisol peak >550 nmol/L (18–20 mcg/dL) at 30–60 min",
      "ABNORMAL: Peak cortisol <500 nmol/L suggests adrenal insufficiency",
      "Primary AI (Addison's): Low baseline cortisol, high ACTH, poor/flat response to Synacthen",
      "Secondary AI: Low baseline cortisol, low/normal ACTH, may have partial response to Synacthen (intact gland)",
      "Steroid suppression: Low baseline, normal response (gland intact but suppressed by exogenous steroids)"
    ],
    pitfalls: [
      "Cortisol binding globulin (CBG) variations: hypoalbuminemia → lower total cortisol (use free cortisol if available)",
      "Evening test: normal cortisol nadir differs — morning test preferred",
      "Cortisol assay variability between laboratories: use local reference ranges",
      "Synacthen can cause anaphylaxis (rare) — have resuscitation available"
    ],
    pearls: [
      "In pediatric nephrology: steroid-dependent NS often needs adrenal axis assessment before weaning",
      "Cushing syndrome: high baseline cortisol + failure to suppress on dexamethasone (different test)",
      "Metyrapone test / insulin tolerance test: gold standard for secondary AI but risky in children"
    ]
  },
  {
    id: "uds",
    title: "Urodynamic Study (UDS)",
    icon: Brain,
    color: "bg-purple-600",
    badge: "purple",
    category: "Urology",
    purpose: "Evaluate bladder filling, storage, and voiding function; guide neurogenic bladder and BBD management",
    indications: [
      "Neurogenic bladder (spina bifida, sacral agenesis, tethered cord)",
      "Non-responding BBD after 3–6 months urotherapy",
      "Posterior urethral valve — post-ablation assessment",
      "Unexplained hydronephrosis or recurrent UTI in structural anomalies",
      "Pre-operative bladder augmentation assessment"
    ],
    components: [
      "Uroflowmetry: non-invasive flow pattern (bell curve=normal; plateau=obstruction; staccato=dysfunctional)",
      "Post-void residual (PVR): >20mL or >10% bladder capacity = significant",
      "Filling cystometry: bladder compliance, sensation, capacity, detrusor pressures",
      "Detrusor leak point pressure (DLPP): >40 cmH2O = high risk to upper tracts",
      "Abdominal leak point pressure (ALPP): stress incontinence threshold",
      "Sphincter EMG: coordination with detrusor (dyssynergia pattern)",
      "Pressure-flow study: detrusor contractility + voiding efficiency"
    ],
    interpretation: [
      "NORMAL: Compliance >20 mL/cmH2O; capacity ≥(30 × age) + 30 mL; DLPP <40 cmH2O",
      "LOW COMPLIANCE (<20): High storage pressure → upper tract damage risk; needs anticholinergic or augmentation",
      "DETRUSOR OVERACTIVITY: Involuntary contractions >15 cmH2O during filling → OAB; anticholinergic",
      "DETRUSOR UNDERACTIVITY: Poor/absent contraction during voiding → CIC",
      "DETRUSOR-SPHINCTER DYSSYNERGIA: EMG burst during voiding → dysfunctional voiding / neurogenic",
      "POOR COMPLIANCE + HIGH DLPP: Urgent intervention — bladder augmentation, CIC, botox",
      "OUTLET OBSTRUCTION: High detrusor pressure + low flow rate (Schafer nomogram)"
    ],
    pitfalls: [
      "Catheter-related discomfort can cause false detrusor overactivity — allow settling time",
      "Filling rate: use physiological rate (body weight mL/min = BW/4)",
      "Anxiety and cold fluid → spurious detrusor contractions",
      "Poor cooperation in young children — consider videoUDS under sedation"
    ],
    pearls: [
      "DLPP >40 cmH2O = single most important value for renal protection in neurogenic bladder",
      "Staccato flow on uroflowmetry = pelvic floor overactivity during voiding",
      "Post-void residual >30% of capacity = incomplete bladder emptying",
      "Video-UDS (VCUG combined): gold standard for neurogenic bladder — see reflux + pressures together"
    ]
  },
  {
    id: "urine-osmolality",
    title: "Urine Osmolality Interpretation",
    icon: Droplet,
    color: "bg-cyan-600",
    badge: "cyan",
    category: "Electrolytes",
    purpose: "Assess renal concentrating/diluting ability; guide hyponatremia and polyuria workup",
    reference_ranges: [
      "Normal range: 50–1200 mOsm/kg (wide range reflecting concentrating capacity)",
      "First morning urine (normal): >600–800 mOsm/kg",
      "Maximum concentration (after dehydration): 800–1200 mOsm/kg",
      "Minimum dilution: 50–100 mOsm/kg (maximum water diuresis)"
    ],
    interpretation: [
      "ISOSTHENURIA (Uosm ~300 mOsm/kg): Fixed concentration = plasma osmolality; severe CKD, sickle cell",
      "INAPPROPRIATELY DILUTE (<100 mOsm/kg) + Hyponatremia → SIADH unlikely; Psychogenic polydipsia",
      "APPROPRIATELY DILUTE (<100) + euvolemia/hypervolemia → normal dilution response",
      "HIGH Uosm (>500) + Hyponatremia → SIADH (renal Na retention, ADH effect)",
      "HIGH Uosm + Polyuria → DI excluded; Primary polydipsia or osmotic diuresis",
      "LOW Uosm (<300) + Polyuria → Central DI or Nephrogenic DI",
      "LOW Uosm + Hypernatremia → DI (can't concentrate despite stimulus)"
    ],
    clinical_use: [
      "Hyponatremia workup: Uosm >100 mOsm/kg = impaired water excretion (SIADH, hypothyroidism, adrenal insufficiency)",
      "Hypernatremia + low Uosm (<300) → DI",
      "AKI: Low Uosm + high FENa → ATN; High Uosm + low FENa → pre-renal",
      "CKD: Isosthenuria (fixed at 300) = loss of concentrating/diluting ability"
    ],
    pearls: [
      "Always interpret with serum osmolality — calculate osmolal gap if discrepancy",
      "Uosm/Plasma osm ratio >1 in hyponatremia suggests SIADH",
      "Spot urine Na >30 mEq/L + Uosm >100 in hyponatremia = SIADH pattern",
      "Neonates have limited concentrating ability (max ~600 mOsm/kg in term infants)"
    ]
  },
  {
    id: "fena",
    title: "FENa Calculation & Interpretation",
    icon: Calculator,
    color: "bg-teal-600",
    badge: "teal",
    category: "AKI",
    purpose: "Differentiate pre-renal AKI from intrinsic (ATN) AKI by assessing tubular Na handling",
    formula: "FENa (%) = (Urine Na × Plasma Cr) / (Plasma Na × Urine Cr) × 100",
    interpretation: [
      "FENa <1%: Pre-renal AKI (tubules avidly reabsorbing Na = intact tubular function)",
      "FENa >2%: Intrinsic AKI / ATN (tubules damaged, unable to reabsorb Na)",
      "FENa 1–2%: Indeterminate — consider clinical context",
      "FENa <1% in established ATN: contrast nephropathy, myoglobinuria, hepatorenal syndrome, early obstruction",
      "FENa >2% in pre-renal: patients on diuretics (spuriously elevated)"
    ],
    limitations: [
      "Diuretics invalidate FENa — use FEUrea instead (less affected by diuretics)",
      "FEUrea formula: (Urine Urea × Plasma Cr) / (Plasma Urea × Urine Cr) × 100",
      "FEUrea <35% = pre-renal; >50% = ATN",
      "CKD: baseline FENa may be elevated due to reduced tubular reabsorption",
      "Contrast nephropathy: FENa <1% despite ATN (vasoconstriction + intact tubules)"
    ],
    other_fe: [
      "FEMg = (Urine Mg × Plasma Cr) / (0.7 × Plasma Mg × Urine Cr) × 100; >4% = renal Mg wasting",
      "FEUA = (Urine UA × Plasma Cr) / (Plasma UA × Urine Cr) × 100; <4% = pre-renal, SIADH; >12% = renal wasting",
      "FEPO4 = related to TRP (tubular reabsorption of phosphate); <85% = phosphate wasting",
      "TRP = 1 – (Urine PO4 × Plasma Cr / Plasma PO4 × Urine Cr); normal >85%"
    ],
    pearls: [
      "FEUrea is more reliable in patients on diuretics or with CKD",
      "Always take simultaneous urine AND blood samples for accurate FE calculations",
      "Random spot urine Na <20 mEq/L also suggests pre-renal state",
      "Hepatorenal syndrome: FENa <1% despite no true hypovolemia — splanchnic vasodilation"
    ]
  },
  {
    id: "acid-base",
    title: "Acid-Base Interpretation",
    icon: FlaskConical,
    color: "bg-red-600",
    badge: "red",
    category: "Electrolytes",
    purpose: "Systematic approach to ABG/electrolyte-based acid-base disorders in pediatric patients",
    stepwise: [
      "STEP 1 — pH: <7.35 = Acidosis; >7.45 = Alkalosis",
      "STEP 2 — Primary disturbance: PaCO2 ↑ → Respiratory acidosis; PaCO2 ↓ → Respiratory alkalosis; HCO3 ↓ → Metabolic acidosis; HCO3 ↑ → Metabolic alkalosis",
      "STEP 3 — Compensation (check if appropriate): Met Acidosis: Expected PaCO2 = 1.5 × HCO3 + 8 ± 2 (Winter's formula); Met Alkalosis: Expected PaCO2 = 0.7 × HCO3 + 21 ± 2; Resp Acidosis (acute): HCO3 rises 1 mEq/L per 10mmHg ↑PaCO2; Resp Alkalosis (acute): HCO3 falls 2 mEq/L per 10mmHg ↓PaCO2",
      "STEP 4 — Anion Gap (for metabolic acidosis): AG = Na − (Cl + HCO3); Normal AG = 8–12 mEq/L (without albumin correction)",
      "STEP 5 — If high AG: Albumin correction: Corrected AG = AG + 2.5 × (4 − measured albumin)",
      "STEP 6 — Delta-delta ratio (if high AG MA): ΔAG/ΔHCO3 = (AG − 12) / (24 − HCO3); <0.4 = pure NAGMA; 0.4–1 = mixed HAGMA + NAGMA; 1–2 = pure HAGMA; >2 = HAGMA + metabolic alkalosis"
    ],
    high_ag_causes: [
      "MUDPILES: Methanol, Uremia, DKA, Propylene glycol, Isoniazid/Iron, Lactic acidosis, Ethylene glycol, Salicylates",
      "In pediatric nephrology: Uremia (CKD), Lactic acidosis (sepsis, tissue hypoperfusion), DKA",
      "Organic acidemias in neonates/infants"
    ],
    normal_ag_causes: [
      "Renal tubular acidosis (RTA Type 1, 2, 4)",
      "Diarrhea (bicarbonate loss)",
      "Saline infusion (hyperchloremic metabolic acidosis)",
      "Early uremia, post-obstructive diuresis"
    ],
    rta_differentiation: [
      "Urine AG (UAG) = Urine Na + Urine K − Urine Cl; Negative UAG = diarrhea (normal NH4+ excretion); Positive UAG = RTA (impaired NH4+ excretion)",
      "Type 1 (Distal): Urine pH >5.5 despite acidosis, hypokalemia, nephrocalcinosis",
      "Type 2 (Proximal): Urine pH <5.5 (can acidify), HCO3 wasting, Fanconi features (glucose, AA, phosphate in urine)",
      "Type 4: Hyperkalemia + NAGMA, low aldosterone effect (hypoaldosteronism or aldosterone resistance)"
    ],
    pearls: [
      "In hypoalbuminemia: low AG may mask high AG acidosis — always correct",
      "Mixed disorders: pH may be near normal despite severe underlying abnormalities",
      "Lactic acidosis: most common HAGMA in ICU children — check lactate early",
      "UAG positive + Type 1 RTA: check for medullary sponge kidney, nephrocalcinosis"
    ]
  },
  {
    id: "urine-microscopy",
    title: "Urine Microscopy Interpretation",
    icon: Microscope,
    color: "bg-indigo-600",
    badge: "indigo",
    category: "Nephrology",
    purpose: "Characterize formed elements in urine to distinguish glomerular, tubular, and infectious causes",
    technique: [
      "Fresh urine (<2h from collection) — cells degrade quickly",
      "Centrifuge 10mL at 2000 rpm for 5 min",
      "Decant supernatant, resuspend pellet in 0.5mL",
      "Place drop on glass slide; examine under × 100 and × 400",
      "Phase-contrast microscopy preferred for cast identification"
    ],
    rbc: [
      "Normal: 0–2 RBCs/HPF",
      "Dysmorphic RBCs (acanthocytes, 'Mickey Mouse' ears): Glomerular bleeding → GN",
      "Isomorphic RBCs: Non-glomerular source (urolithiasis, UTI, tumor, trauma)",
      "Acanthocytes >5% of total RBCs: highly specific for GN",
      "Significant hematuria: >5 RBCs/HPF on 3 fresh specimens"
    ],
    casts: [
      "HYALINE CASTS: Normal in dehydration/exercise; Tamm-Horsfall protein alone; not pathological",
      "GRANULAR CASTS (muddy brown): ATN — coarse/fine granules from cellular debris",
      "RBC CASTS: Pathognomonic of glomerulonephritis (GN, vasculitis, SLE)",
      "WBC CASTS: Pyelonephritis, acute interstitial nephritis",
      "FATTY CASTS / Oval fat bodies: Nephrotic syndrome (lipiduria)",
      "WAXY/BROAD CASTS: Chronic kidney disease (advanced CKD, dilated tubules)",
      "EPITHELIAL CASTS: Acute tubular necrosis, heavy metal toxicity"
    ],
    wbc: [
      "Normal: 0–5 WBCs/HPF",
      ">5 WBCs/HPF (pyuria): UTI, interstitial nephritis, TB, appendicitis (sterile pyuria)",
      "Eosinophiluria (Hansel stain): Interstitial nephritis (drug-induced, allergic)",
      "Sterile pyuria: TB, interstitial nephritis, Kawasaki, NSAID nephropathy"
    ],
    crystals: [
      "Calcium oxalate (envelope/dumbbell): Normal / hyperoxaluria / ethylene glycol",
      "Triple phosphate (coffin lid): UTI with urease-producing organisms (Proteus, Klebsiella)",
      "Uric acid (rhomboid/needle): Gout, leukemia, tumor lysis",
      "Cystine (hexagonal): Pathognomonic of cystinuria",
      "Calcium phosphate (thin needles): RTA Type 1, hyperparathyroidism"
    ],
    pearls: [
      "RBC casts = glomerulonephritis until proven otherwise — never ignore",
      "Fresh urine critical: casts dissolve in alkaline or dilute urine",
      "Dysmorphic RBCs on phase contrast: best performed by experienced microscopist",
      "Cystine crystals in child with kidney stones → amino acid screen for cystinuria"
    ]
  }
];

const BADGE_COLORS = {
  blue: "bg-blue-100 text-blue-700",
  orange: "bg-orange-100 text-orange-700",
  purple: "bg-purple-100 text-purple-700",
  cyan: "bg-cyan-100 text-cyan-700",
  teal: "bg-teal-100 text-teal-700",
  red: "bg-red-100 text-red-700",
  indigo: "bg-indigo-100 text-indigo-700",
};

const CATEGORY_COLORS = {
  Endocrine: "bg-orange-100 text-orange-700",
  Urology: "bg-purple-100 text-purple-700",
  Electrolytes: "bg-cyan-100 text-cyan-700",
  AKI: "bg-red-100 text-red-700",
  Nephrology: "bg-indigo-100 text-indigo-700",
};

export default function LabPathways() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [activeCategory, setActiveCategory] = useState("All");
  const [mainTab, setMainTab] = useState("lab");

  const categories = ["All", ...new Set(LAB_PATHWAYS.map(p => p.category))];
  const filtered = LAB_PATHWAYS.filter(p => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) || p.purpose.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === "All" || p.category === activeCategory;
    return matchSearch && matchCat;
  });

  const pathway = selected ? LAB_PATHWAYS.find(p => p.id === selected) : null;

  const renderSection = (title, items, colorClass = "text-slate-700", bgClass = "bg-slate-50", borderClass = "border-slate-200", iconEl = null) => {
    if (!items || items.length === 0) return null;
    return (
      <div className="mb-5">
        <h4 className={`font-bold text-sm uppercase tracking-wider mb-2 ${colorClass.replace("text-", "text-").replace("-700", "-800")}`}>{title}</h4>
        <ul className={`${bgClass} border ${borderClass} rounded-xl divide-y divide-slate-100 overflow-hidden`}>
          {items.map((item, i) => (
            <li key={i} className="flex items-start gap-2 px-4 py-2.5">
              {iconEl ? React.cloneElement(iconEl, { className: "w-3.5 h-3.5 mt-0.5 flex-shrink-0" }) : <ChevronRight className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-slate-400" />}
              <span className={`text-sm ${colorClass}`}>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-amber-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 rounded-2xl bg-gradient-to-r from-amber-700 via-orange-600 to-red-700 p-6 text-white shadow-xl">
          <div className="flex items-center gap-3 mb-2">
            <FlaskConical className="w-8 h-8" />
            <div>
              <h1 className="text-3xl font-bold">Lab Pathways</h1>
              <p className="text-amber-100 text-sm">Detailed protocols and interpretation guides for advanced clinical investigations</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`text-xs px-3 py-1 rounded-full border border-white/30 transition-all ${activeCategory === cat ? "bg-white text-amber-800 font-bold" : "bg-white/20 hover:bg-white/30 text-white"}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Main tab switcher */}
        <div className="flex gap-2 mb-4">
          {[{ id: "lab", label: "🔬 Lab Protocols" }, { id: "immunology", label: "🧫 Immunology Tests" }].map(t => (
            <button key={t.id} onClick={() => setMainTab(t.id)}
              className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all ${mainTab === t.id ? "bg-white text-amber-800 font-bold shadow" : "bg-white/20 hover:bg-white/30 text-white"}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            className="pl-10 bg-white border-2 border-slate-200 h-11"
            placeholder="Search lab pathways..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {mainTab === "immunology" ? (
          <ImmunologyLabPathways />
        ) : (
        <>
        {!pathway ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(p => {
              const Icon = p.icon;
              return (
                <Card
                  key={p.id}
                  className="cursor-pointer hover:shadow-xl transition-all duration-200 border-2 hover:border-amber-400 group"
                  onClick={() => setSelected(p.id)}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3 mb-3">
                      <div className={`w-11 h-11 ${p.color} rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform shadow-md`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                          <h3 className="font-bold text-slate-900 text-base">{p.title}</h3>
                          <Badge className={`text-xs ${CATEGORY_COLORS[p.category] || "bg-slate-100 text-slate-600"}`}>{p.category}</Badge>
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-2">{p.purpose}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-amber-700 font-medium mt-2">
                      <ArrowRight className="w-3 h-3" />
                      View protocol
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div>
            <Button variant="outline" onClick={() => setSelected(null)} className="mb-4 gap-2">
              <ChevronRight className="w-4 h-4 rotate-180" />
              Back to Lab Pathways
            </Button>

            <div className={`rounded-2xl p-5 text-white mb-6 shadow-lg ${pathway.color}`}>
              <div className="flex items-center gap-3">
                {React.createElement(pathway.icon, { className: "w-8 h-8" })}
                <div>
                  <h2 className="text-2xl font-bold">{pathway.title}</h2>
                  <p className="text-sm opacity-90 mt-0.5">{pathway.purpose}</p>
                </div>
                <Badge className={`ml-auto text-xs ${CATEGORY_COLORS[pathway.category] || "bg-white/20 text-white"} bg-white/20 text-white border-white/30`}>
                  {pathway.category}
                </Badge>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              {pathway.indications && renderSection("Indications", pathway.indications, "text-green-700", "bg-green-50", "border-green-200", <CheckCircle className="text-green-600" />)}
              {pathway.contraindications && renderSection("Contraindications", pathway.contraindications, "text-red-700", "bg-red-50", "border-red-200", <AlertTriangle className="text-red-600" />)}
              {pathway.protocol && renderSection("Protocol / Steps", pathway.protocol, "text-blue-700", "bg-blue-50", "border-blue-200")}
              {pathway.components && renderSection("Components", pathway.components, "text-purple-700", "bg-purple-50", "border-purple-200")}
              {pathway.formula && (
                <div className="mb-5 md:col-span-2">
                  <h4 className="font-bold text-sm uppercase tracking-wider mb-2 text-teal-800">Formula</h4>
                  <div className="bg-teal-50 border border-teal-200 rounded-xl px-5 py-4 font-mono text-teal-900 font-bold text-base">
                    {pathway.formula}
                  </div>
                </div>
              )}
              {pathway.reference_ranges && renderSection("Reference Ranges", pathway.reference_ranges, "text-blue-700", "bg-blue-50", "border-blue-200")}
              {pathway.stepwise && renderSection("Stepwise Approach", pathway.stepwise, "text-slate-700", "bg-slate-50", "border-slate-200")}
              {pathway.interpretation && renderSection("Interpretation", pathway.interpretation, "text-indigo-700", "bg-indigo-50", "border-indigo-200")}
              {pathway.high_ag_causes && renderSection("High AG Causes", pathway.high_ag_causes, "text-red-700", "bg-red-50", "border-red-200")}
              {pathway.normal_ag_causes && renderSection("Normal AG Causes", pathway.normal_ag_causes, "text-orange-700", "bg-orange-50", "border-orange-200")}
              {pathway.rta_differentiation && renderSection("RTA Differentiation", pathway.rta_differentiation, "text-violet-700", "bg-violet-50", "border-violet-200")}
              {pathway.clinical_use && renderSection("Clinical Use", pathway.clinical_use, "text-slate-700", "bg-slate-50", "border-slate-200")}
              {pathway.other_fe && renderSection("Other FE Calculations", pathway.other_fe, "text-teal-700", "bg-teal-50", "border-teal-200")}
              {pathway.limitations && renderSection("Limitations / Caveats", pathway.limitations, "text-amber-700", "bg-amber-50", "border-amber-200")}
              {pathway.technique && renderSection("Technique", pathway.technique, "text-slate-700", "bg-slate-50", "border-slate-200")}
              {pathway.rbc && renderSection("RBC Interpretation", pathway.rbc, "text-red-700", "bg-red-50", "border-red-200")}
              {pathway.casts && renderSection("Urinary Casts", pathway.casts, "text-indigo-700", "bg-indigo-50", "border-indigo-200")}
              {pathway.wbc && renderSection("WBC / Pyuria", pathway.wbc, "text-yellow-700", "bg-yellow-50", "border-yellow-200")}
              {pathway.crystals && renderSection("Crystals", pathway.crystals, "text-cyan-700", "bg-cyan-50", "border-cyan-200")}
              {pathway.pitfalls && renderSection("Pitfalls", pathway.pitfalls, "text-amber-700", "bg-amber-50", "border-amber-200", <AlertTriangle className="text-amber-600" />)}
              {pathway.pearls && renderSection("Clinical Pearls", pathway.pearls, "text-emerald-700", "bg-emerald-50", "border-emerald-200", <BookOpen className="text-emerald-600" />)}
            </div>
          </div>
        )}
        </>
        )}
      </div>
    </div>
  );
}