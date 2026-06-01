/**
 * Pediatric Renal Diet Generator Engine
 * Evidence-based dietary guidance for CKD, NS, Nephrocalcinosis, Renal Stones, and more.
 */
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Salad, ChevronRight, CheckCircle2, XCircle, AlertTriangle, Calculator, BookOpen, ArrowRight, ExternalLink } from "lucide-react";

const CONDITIONS = [
  { id: "ckd", label: "CKD (Stage 1–5)", color: "violet", desc: "Chronic Kidney Disease — nutrition goals by stage" },
  { id: "ns", label: "Nephrotic Syndrome", color: "blue", desc: "Edema management, protein nutrition, salt restriction" },
  { id: "stone_ca", label: "Calcium Oxalate Stones", color: "amber", desc: "Hypercalciuria / hyperoxaluria dietary management" },
  { id: "stone_uric", label: "Uric Acid Stones", color: "orange", desc: "Purine restriction, alkalinisation diet" },
  { id: "stone_cys", label: "Cystinuria", color: "rose", desc: "High fluid + alkaline diet for cystine stones" },
  { id: "nephrocalc", label: "Nephrocalcinosis", color: "teal", desc: "Hypercalciuria, dRTA, Bartter-associated NC diet" },
  { id: "dialysis_hd", label: "Haemodialysis", color: "indigo", desc: "K/P/fluid restriction for HD patients" },
  { id: "dialysis_pd", label: "Peritoneal Dialysis", color: "cyan", desc: "High-protein diet for PD patients" },
  { id: "transplant", label: "Post-Transplant", color: "green", desc: "Caloric balance, safe foods, drug interactions" },
  { id: "hyperox", label: "Primary Hyperoxaluria", color: "red", desc: "PH1/PH2 — ultra-low oxalate diet + high fluid" },
];

const DIET_DATA = {
  ckd: {
    title: "CKD Nutrition — Stage-Based",
    guideline: "KDOQI Pediatric Nutrition 2009 · ESPGHAN 2022",
    links: [
      { label: "CKD Engine", to: "/Hub", scenario: "ckd-engine" },
      { label: "CKD Staging Pathway", to: "/Hub", scenario: "ckd-staging" },
      { label: "Schwartz GFR Calculator", to: "/SchwartzGFR" },
      { label: "CKD MBD Pathway", to: "/Hub", scenario: "ckd-mbd" },
    ],
    stages: [
      {
        label: "CKD Stage 1–2 (eGFR >60)",
        eat: ["Normal protein (100% DRI for age)", "Normal potassium unless hyperkalemia", "Salt restriction only if HTN/edema", "Adequate calories for growth (100–110% EER)", "Phosphorus: normal unless MBD labs abnormal", "Calcium: maintain normal dietary intake", "Adequate Vitamin D (25-OH-D target 30–50 ng/mL)"],
        avoid: ["No specific restriction unless labs indicate", "Avoid excess processed foods (high P/Na)", "Limit sugary drinks in obese/diabetic CKD"],
        pearls: ["Monitor growth every 3 months", "Nutritional counselling from dietitian at diagnosis", "Ensure adequate breast/formula feeding in infants"],
        color: "green"
      },
      {
        label: "CKD Stage 3–4 (eGFR 15–60)",
        eat: ["Protein: 100% DRI (do NOT restrict protein in children — growth imperative)", "Calories: 100–120% EER (nasogastric feeding if growth failure)", "Phosphate binders with meals if P >5.5 mg/dL (calcium carbonate / sevelamer)", "Potassium restriction if K >5.5 mEq/L (see below)", "Sodium <2 g/day if HTN or fluid overload", "Iron supplementation if ferritin <100 µg/L", "Bicarbonate supplementation if HCO3 <22 mEq/L"],
        avoid: ["High-potassium foods if hyperkalemic: banana, orange, tomato, potato, dried fruit", "High-phosphorus: cola drinks, nuts, chocolate, processed cheese, dark meat", "Excess salt: crisps, pickles, canned soups", "Vitamin A supplements (accumulates in CKD)", "Herbal supplements (nephrotoxic risk)"],
        pearls: ["Potassium restriction: only if K consistently >5.5 — not routinely for all CKD", "Low-potassium milk substitutes available (Renastart, PKU preparations)", "Oral nutritional supplements (Nepro, Renilon) if inadequate oral intake"],
        color: "amber"
      },
      {
        label: "CKD Stage 5 / Pre-dialysis (eGFR <15)",
        eat: ["Protein: 100% DRI minimum — do NOT restrict", "High caloric density feeds if volume-restricted", "Phosphate binders mandatory with every meal/snack", "Sodium: <1.5 g/day", "Potassium target <5.5 mEq/L — dietary restriction + resonium if needed", "Active Vitamin D (calcitriol/alfacalcidol) for secondary hyperparathyroidism", "Erythropoiesis-stimulating agent (ESA) + iron — not dietary but affects appetite"],
        avoid: ["K-rich foods: ALL dried fruits, fruit juices, nuts, potatoes (unless boiled × 2)", "P-rich: cola, nuts, seeds, chocolate, processed meats, dark bread, dairy excess", "Salt substitutes (contain KCl — dangerous in CKD5)", "High-oxalate foods if concurrent nephrocalcinosis", "Large fluid volumes if anuric"],
        pearls: ["Nasogastric or PEG feeding in infants/toddlers with CKD5 for adequate growth", "Aim weight gain on growth chart centile appropriate for age", "Supplemental nasogastric feeds overnight + daytime oral feeds"],
        color: "red"
      }
    ]
  },
  ns: {
    title: "Nephrotic Syndrome Diet",
    guideline: "IPNA 2023 · KDIGO NS 2021",
    links: [
      { label: "NS Engine", to: "/Hub", scenario: "ns-engine" },
      { label: "NS Pathway", to: "/Hub", scenario: "childhood-nephrotic" },
      { label: "Severe Edema Pathway", to: "/Hub", scenario: "severe-edema-ns" },
    ],
    phases: [
      {
        label: "Active Relapse / Edema Phase",
        eat: ["Sodium restriction: <2 g/day (1–2 mEq/kg/day in infants)", "Normal protein: 100% DRI for age (do NOT restrict — urinary losses)", "Adequate calories for age (prevent catabolism)", "Fresh fruits (low-Na, moderate K if non-CKD)", "Rice, chapati, idli, dosa (low Na options)", "Home-cooked meals (controlled salt)", "Adequate fluid (no strict restriction unless severe edema/AKI)"],
        avoid: ["Added table salt — strictly", "Processed/packaged foods: bread, biscuits, chips, sauces", "Fast food, restaurant food (high hidden salt)", "Pickles, papad, canned vegetables", "High-Na cheese, butter", "Salty snacks during steroid treatment (worsen weight gain)"],
        pearls: ["Protein supplementation NOT required — focus on normal dietary protein", "Fluid intake: match urine output + insensible losses (400 mL/m²/day)", "Steroid-related weight gain: counsel on healthy eating during steroids"],
        color: "blue"
      },
      {
        label: "Remission Phase",
        eat: ["Normal balanced diet for age", "Normal sodium (2–3 g/day)", "High-protein foods: eggs, pulses, chicken (not restricted)", "Calcium-rich foods: dairy, fortified soy milk", "Vitamin D supplementation (steroids → bone loss)", "Regular meals with vegetables and whole grains"],
        avoid: ["Salty snacks habit formed during relapse", "Excessive caloric intake (steroid-induced obesity)", "Junk food, fried foods (cardiovascular risk in FRNS/SDNS)"],
        pearls: ["Monitor weight and height at each visit", "Dyslipidemia in NS — reduce saturated fats", "Bone health: Ca 500–1000 mg/day + Vit D3 400–1000 IU/day during steroid treatment"],
        color: "green"
      }
    ]
  },
  stone_ca: {
    title: "Calcium Oxalate Stone / Hypercalciuria Diet",
    guideline: "EAU 2022 · ASPN Urolithiasis 2020",
    links: [
      { label: "Stone Engine", to: "/Hub", scenario: "stone-engine" },
      { label: "Nephrocalcinosis Engine", to: "/Hub", scenario: "nephrocalcinosis-stone-engine" },
      { label: "Stone Risk Calculator", to: "/StoneRisk" },
    ],
    eat: ["HIGH fluid intake: >2 L/m²/day (key intervention — dilutes urine)", "Normal calcium: 700–1000 mg/day (do NOT restrict — reduces oxalate absorption)", "Dietary calcium with meals (binds oxalate in gut)", "Citrate-rich foods: lemon juice, oranges (urinary citrate inhibits crystallisation)", "High-fibre diet (phytate inhibits calcium crystal growth)", "Potassium citrate: if urinary citrate low (<320 mg/day)", "Adequate magnesium (inhibits calcium oxalate crystallisation)"],
    avoid: ["LOW-oxalate principle: spinach, beetroot, nuts, rhubarb, chocolate, cola, strawberry, okra (bhindi)", "Excess vitamin C supplements (converted to oxalate)", "High-dose vitamin D without monitoring", "Excess animal protein (raises urinary calcium, uric acid, reduces citrate)", "Excess sodium (increases urinary calcium excretion)", "Salt restriction <2 g/day (reduces calciuria significantly)"],
    pearls: ["Salt is the most modifiable dietary risk factor for hypercalciuria", "Normal calcium diet: restricting calcium WORSENS stone risk (more oxalate absorbed)", "Measure 24h urinary calcium, oxalate, citrate, pH after dietary changes", "Calcium:oxalate ratio in diet matters — balanced intake"],
    color: "amber"
  },
  stone_uric: {
    title: "Uric Acid Stone Diet",
    guideline: "EAU Urolithiasis 2022",
    links: [
      { label: "Stone Engine", to: "/Hub", scenario: "stone-engine" },
      { label: "Uric Acid Calculator", to: "/StoneRisk" },
    ],
    eat: ["HIGH fluid: >2 L/m²/day", "Urine alkalinisation: target urine pH 6.5–7.0", "Potassium citrate / bicarbonate supplementation", "High fluid with citrus (lemon water)", "Vegetable-based protein (less purine than animal)", "Low-purine vegetables: most vegetables safe"],
    avoid: ["HIGH-purine foods: organ meats (liver, kidney), sardines, anchovies, mussels, game meat", "Red meat excess", "Shellfish (prawns, crab)", "Fructose-sweetened drinks (increase uric acid)", "Alcohol (fermentation products increase uric acid — relevant in adolescents)"],
    pearls: ["Allopurinol: if hyperuricemia persists despite diet", "Urine pH is the most important factor — alkalinisation dissolves uric acid stones", "In Lesch-Nyhan or lymphoma: allopurinol mandatory"],
    color: "orange"
  },
  stone_cys: {
    title: "Cystinuria Diet",
    guideline: "EAU 2022 · Cystinuria Consensus 2019",
    links: [
      { label: "Stone Engine", to: "/Hub", scenario: "stone-engine" },
    ],
    eat: ["VERY HIGH fluid: >3 L/m²/day including night (nocturnal voiding important)", "Urine alkalinisation: pH >7.5 (potassium citrate / bicarbonate)", "Normal sodium (sodium restriction reduces cystine excretion)", "Normal protein with vegetable sources preferred", "Low methionine: limit animal protein (methionine is cystine precursor)"],
    avoid: ["Excess animal protein (methionine source: meat, eggs, fish, dairy)", "High sodium (increases cystinuria)", "Acid-forming foods in excess"],
    pearls: ["D-penicillamine or tiopronin: if high cystine excretion and stones recur despite diet", "Cystine solubility: 250 mg/L at pH 7.5 — key target", "Night-time fluid essential: highest stone-forming period is post-midnight"],
    color: "rose"
  },
  nephrocalc: {
    title: "Nephrocalcinosis Diet",
    guideline: "ASPN 2020 · EAU 2022",
    links: [
      { label: "Nephrocalcinosis Engine", to: "/Hub", scenario: "nephrocalcinosis-stone-engine" },
      { label: "Nephrocalcinosis Pathway", to: "/Hub", scenario: "nephrocalcinosis" },
      { label: "Tubular Engine", to: "/Hub", scenario: "tubular-engine" },
    ],
    eat: ["HIGH fluid: >2 L/m²/day", "Normal calcium intake (not restricted unless primary hyperparathyroidism)", "Citrate supplementation (oral KCitrate/NaCitrate) if urine citrate low — main therapy in dRTA", "Low-sodium diet (<2 g/day) — reduces calciuria", "Magnesium: adequate intake (inhibits crystallisation)", "Low-oxalate diet if hyperoxaluria component"],
    avoid: ["Excess salt (biggest dietary driver of hypercalciuria)", "Excess vitamin D/calcium supplements (except when prescribed for dRTA/hypoparathyroidism)", "Spinach, nuts, chocolate (high oxalate — if oxaluria present)", "Excess protein"],
    pearls: ["dRTA: alkali therapy (citrate/bicarbonate) is treatment — reverses nephrocalcinosis", "Bartter syndrome: replace electrolytes (K, Mg, Na); diet cannot correct primary tubular defect", "Furosemide-associated NC in ELBW: minimise furosemide exposure, ensure adequate Ca/P intake"],
    color: "teal"
  },
  dialysis_hd: {
    title: "Haemodialysis — Dietary Management",
    guideline: "KDOQI Nutrition in CKD 2020 · EDTNA/ERCA",
    links: [
      { label: "RRT Engine", to: "/Hub", scenario: "rrt-engine" },
      { label: "Haemodialysis Pathway", to: "/Hub", scenario: "hemodialysis" },
      { label: "KtV Calculator", to: "/KtVCalculator" },
    ],
    eat: ["HIGH protein: 1.0–1.2 g/kg/day (dialysis removes protein — must replace)", "High calories: 100–110% EER (prevent catabolism)", "Dialysis days: larger protein-rich meal after dialysis", "Fluid: 400–500 mL/day + urine output (strict — interdialytic weight gain <5%/day)", "Potassium: 40–70 mEq/day (2–3 g/day)", "Phosphorus: 800–1000 mg/day (or matched to protein with binders)", "Sodium: <2 g/day"],
    avoid: ["High-K: banana, tomato, potato, dried fruits, fruit juice, coconut water (nariyal pani)", "High-P: cola, nuts, seeds, dark bread, dairy excess, processed foods with phosphate additives", "Fluid: limit between dialysis sessions (congestive heart failure risk)", "Salt excess: thirst → excess fluid intake", "Potassium chloride salt substitutes"],
    pearls: ["IDWG (interdialytic weight gain) target: <5% of dry weight", "Boiling/leaching vegetables reduces potassium by 50–70%", "Intradialytic parenteral nutrition (IDPN) if severe malnutrition", "Oral nutritional supplements: Renastart, Nepro, Dialvit"],
    color: "indigo"
  },
  dialysis_pd: {
    title: "Peritoneal Dialysis — Dietary Management",
    guideline: "KDOQI 2020 · ISPD Nutrition 2022",
    links: [
      { label: "RRT Engine", to: "/Hub", scenario: "rrt-engine" },
      { label: "PD Pathway", to: "/Hub", scenario: "peritoneal-dialysis" },
    ],
    eat: ["HIGH protein: 1.2–1.5 g/kg/day (PD removes more protein than HD)", "Additional protein for peritonitis episodes (+0.5 g/kg/day)", "Calories: account for glucose absorbed from dialysate (4–8 kcal/kg/day) — reduce dietary carbs", "Potassium: usually LESS restricted than HD (PD removes more K)", "Fluid: more liberal than HD (PD provides continuous clearance)", "Phosphorus binders if P elevated"],
    avoid: ["Excess carbohydrates (dialysate glucose → obesity, dyslipidemia)", "High-P foods if P not controlled", "Saturated fats (dyslipidemia common in PD due to glucose load)"],
    pearls: ["Hypertriglyceridemia common in PD: reduce simple sugars, consider icodextrin (non-glucose dialysate)", "Protein supplementation often needed: protein-rich breakfast (eggs, dal, milk)", "Monitor serum albumin: target >3.5 g/dL"],
    color: "cyan"
  },
  transplant: {
    title: "Post-Transplant Nutrition",
    guideline: "KDIGO Transplant 2009 · ESPGHAN 2022",
    links: [
      { label: "Transplant Pathway", to: "/Hub", scenario: "kidney-transplant" },
      { label: "Transplant Rejection Pathway", to: "/Hub", scenario: "transplant-rejection" },
    ],
    eat: ["Balanced diet for age: normal protein once stable graft function", "Adequate calcium + Vitamin D (steroid-induced bone loss)", "Fresh fruits and vegetables (washed thoroughly)", "Pasteurised dairy only", "Well-cooked foods (immunosuppressed — food safety)", "High-fibre diet to prevent constipation (tacrolimus side effect)", "Potassium monitoring (tacrolimus → hyperkalemia)"],
    avoid: ["GRAPEFRUIT and grapefruit juice — inhibits CYP3A4 → increases CNI/mTOR levels dangerously", "Pomelo (similar to grapefruit)", "Star fruit (nephrotoxic + CYP interaction)", "Unpasteurised dairy, raw meat, raw eggs (Listeria, Salmonella risk)", "Excess potassium if tacrolimus-related hyperkalemia", "Excess phosphorus if post-transplant hypophosphatemia corrected"], 
    pearls: ["Grapefruit avoidance is ABSOLUTE — educate family clearly", "Weight gain post-transplant common (steroids + appetite normalisation): counsel early", "New-onset DM post-transplant (NODAT): reduce sugary foods, refer dietitian"],
    color: "green"
  },
  hyperox: {
    title: "Primary Hyperoxaluria Diet (PH1/PH2)",
    guideline: "OxalEurope 2022 · Lumasiran Labelling",
    links: [
      { label: "Hyperoxaluria Engine", to: "/Hub", scenario: "hyperoxaluria-engine" },
      { label: "Nephrocalcinosis Engine", to: "/Hub", scenario: "nephrocalcinosis-stone-engine" },
    ],
    eat: ["EXTREME fluid intake: >3–4 L/m²/day (24h, including night — set alarms)", "Very low-oxalate diet (critical): avoid all high-oxalate foods", "Normal calcium in diet (binds intestinal oxalate)", "Pyridoxine (Vitamin B6): PH1 — 5–10 mg/kg/day (reduces oxalate production in B6-responsive cases)", "Potassium citrate to alkalinise urine (reduces crystallisation)", "Lumasiran (RNA interference therapy) — reduces hepatic oxalate synthesis"],
    avoid: ["ALL high-oxalate: spinach (highest), rhubarb, beet, nuts, wheat bran, chocolate, black tea, cola", "Vitamin C supplements (converted to oxalate)", "Excess animal protein", "Vitamin D excess (increases intestinal oxalate absorption)"],
    pearls: ["In PH1: dietary oxalate restriction alone INSUFFICIENT — hepatic overproduction is primary defect", "Lumasiran dramatically reduces urinary oxalate — diet remains adjunct", "Transplant: combined liver-kidney in PH1 (corrects metabolic defect)", "Measure 24h urine oxalate every 3–6 months to monitor response"],
    color: "red"
  }
};

function DietSection({ title, items, color, icon: Icon }) {
  const colorMap = {
    eat: "bg-green-50 border-green-200",
    avoid: "bg-red-50 border-red-200",
    pearls: "bg-amber-50 border-amber-200",
  };
  const labelMap = { eat: "✅ What to Eat", avoid: "❌ What to Avoid", pearls: "💡 Clinical Pearls" };
  const textMap = { eat: "text-green-800", avoid: "text-red-800", pearls: "text-amber-800" };
  const type = title;
  return (
    <div className={`rounded-xl border-2 p-3 ${colorMap[type]}`}>
      <p className={`text-xs font-bold mb-2 ${textMap[type]}`}>{labelMap[type]}</p>
      <div className="space-y-1">
        {items.map((item, i) => (
          <div key={i} className={`flex items-start gap-1.5 text-xs ${textMap[type]}`}>
            <ArrowRight className="w-3 h-3 flex-shrink-0 mt-0.5" />
            <span>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function LinkedResources({ links }) {
  if (!links || links.length === 0) return null;
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
      <div className="flex items-center gap-1.5 mb-2">
        <BookOpen className="w-3.5 h-3.5 text-slate-500" />
        <span className="text-xs font-bold text-slate-700">Linked Engines, Pathways & Calculators</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {links.map((l, i) => (
          <Link key={i} to={l.to || "/Hub"}
            className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors">
            <ExternalLink className="w-3 h-3 text-blue-500" />
            {l.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function PediatricDietEngine() {
  const [selected, setSelected] = useState(null);
  const data = selected ? DIET_DATA[selected] : null;

  const colorBadge = {
    violet: "bg-violet-600", blue: "bg-blue-600", amber: "bg-amber-600",
    orange: "bg-orange-500", rose: "bg-rose-600", teal: "bg-teal-600",
    indigo: "bg-indigo-600", cyan: "bg-cyan-600", green: "bg-green-600", red: "bg-red-600"
  };
  const colorBorder = {
    violet: "border-violet-300 bg-violet-50", blue: "border-blue-300 bg-blue-50",
    amber: "border-amber-300 bg-amber-50", orange: "border-orange-300 bg-orange-50",
    rose: "border-rose-300 bg-rose-50", teal: "border-teal-300 bg-teal-50",
    indigo: "border-indigo-300 bg-indigo-50", cyan: "border-cyan-300 bg-cyan-50",
    green: "border-green-300 bg-green-50", red: "border-red-300 bg-red-50"
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="rounded-xl bg-gradient-to-r from-green-700 to-teal-600 p-4 text-white">
        <div className="flex items-center gap-2">
          <Salad className="w-5 h-5" />
          <div>
            <h3 className="font-bold text-sm">Pediatric Renal Diet Generator Engine</h3>
            <p className="text-xs text-green-200">KDOQI 2020 · IPNA 2023 · EAU 2022 · OxalEurope 2022</p>
          </div>
        </div>
      </div>

      {/* Condition selector */}
      {!selected && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-600">Select Clinical Scenario:</p>
          {CONDITIONS.map(c => (
            <button key={c.id} onClick={() => setSelected(c.id)}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 border-slate-200 bg-white hover:border-green-400 hover:bg-green-50 text-left transition-all">
              <div>
                <div className="flex items-center gap-2">
                  <Badge className={`text-xs ${colorBadge[c.color]}`}>{c.label}</Badge>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{c.desc}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
            </button>
          ))}
        </div>
      )}

      {/* Diet detail view */}
      {selected && data && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm text-slate-900">{data.title}</h4>
            <button onClick={() => setSelected(null)}
              className="text-xs text-blue-600 hover:underline px-3 py-1 rounded-lg border border-blue-200 bg-blue-50">
              ← Back
            </button>
          </div>
          <p className="text-xs text-slate-500 italic">{data.guideline}</p>

          {/* Linked resources */}
          <LinkedResources links={data.links} />

          {/* CKD: stage-based view */}
          {selected === "ckd" && data.stages && data.stages.map((stage, i) => (
            <div key={i} className={`rounded-xl border-2 p-3 space-y-2 ${colorBorder[stage.color] || "border-slate-200 bg-slate-50"}`}>
              <p className="text-xs font-bold text-slate-800">{stage.label}</p>
              <DietSection title="eat" items={stage.eat} />
              <DietSection title="avoid" items={stage.avoid} />
              <DietSection title="pearls" items={stage.pearls} />
            </div>
          ))}

          {/* NS: phase-based view */}
          {selected === "ns" && data.phases && data.phases.map((phase, i) => (
            <div key={i} className="rounded-xl border-2 border-slate-200 bg-slate-50 p-3 space-y-2">
              <p className="text-xs font-bold text-blue-800">{phase.label}</p>
              <DietSection title="eat" items={phase.eat} />
              <DietSection title="avoid" items={phase.avoid} />
              <DietSection title="pearls" items={phase.pearls} />
            </div>
          ))}

          {/* All others: flat eat/avoid/pearls */}
          {!["ckd", "ns"].includes(selected) && (
            <>
              {data.eat && <DietSection title="eat" items={data.eat} />}
              {data.avoid && <DietSection title="avoid" items={data.avoid} />}
              {data.pearls && <DietSection title="pearls" items={data.pearls} />}
            </>
          )}

          {/* Calculator link reminder */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs font-bold text-blue-800 mb-1">🔗 Related Calculators</p>
            <div className="flex flex-wrap gap-2">
              <Link to="/SchwartzGFR" className="text-xs text-blue-600 underline">Schwartz GFR</Link>
              <Link to="/StoneRisk" className="text-xs text-blue-600 underline">Stone Risk</Link>
              <Link to="/KtVCalculator" className="text-xs text-blue-600 underline">Kt/V</Link>
              <Link to="/SodiumCalculator" className="text-xs text-blue-600 underline">Sodium Calc</Link>
              <Link to="/PotassiumCalculator" className="text-xs text-blue-600 underline">Potassium Calc</Link>
              <Link to="/FEMgCalculator" className="text-xs text-blue-600 underline">FEMg</Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}