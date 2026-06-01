import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link, useNavigate } from "react-router-dom";
import { Utensils, CheckCircle2, XCircle, AlertTriangle, ChevronRight, RotateCcw, ExternalLink, Calculator, BookOpen, Printer, FileText } from "lucide-react";

const SCENARIOS = [
  { id: "ckd", label: "CKD (Stage 1–5)", color: "violet", desc: "Protein · K · Phosphorus · Fluid restriction" },
  { id: "ckd-esrd", label: "CKD Stage 5 / Dialysis", color: "indigo", desc: "HD/PD-specific diet · Fluid + electrolyte limits" },
  { id: "nephrotic", label: "Nephrotic Syndrome", color: "blue", desc: "Low salt · High protein · Fluid · Calcium" },
  { id: "stone-calcium", label: "Calcium Oxalate Stones", color: "amber", desc: "Hydration · Oxalate · Citrate · Calcium" },
  { id: "stone-uric", label: "Uric Acid Stones", color: "orange", desc: "Purine restriction · Alkalinisation" },
  { id: "stone-cystine", label: "Cystinuria", color: "red", desc: "High fluid · Low methionine · Alkalinisation" },
  { id: "nephrocalcinosis", label: "Nephrocalcinosis / Hypercalciuria", color: "rose", desc: "Low oxalate · Low Na · Adequate Ca · Citrate" },
  { id: "hyperkalemia", label: "Hyperkalemia Management", color: "red", desc: "Low-K diet · Food list · Cooking tips" },
  { id: "hyperphosphatemia", label: "Hyperphosphatemia (CKD-MBD)", color: "purple", desc: "Phosphorus restriction · Binder timing" },
  { id: "bartter-gitelman", label: "Bartter / Gitelman Syndrome", color: "teal", desc: "High salt · Mg replacement · K supplementation" },
];

const COLOR = {
  violet: { hdr: "from-violet-700 to-purple-700", eat: "bg-green-50 border-green-300", avoid: "bg-red-50 border-red-300", caution: "bg-amber-50 border-amber-300", badge: "bg-violet-600" },
  indigo: { hdr: "from-indigo-700 to-blue-700", eat: "bg-green-50 border-green-300", avoid: "bg-red-50 border-red-300", caution: "bg-amber-50 border-amber-300", badge: "bg-indigo-600" },
  blue: { hdr: "from-blue-700 to-cyan-700", eat: "bg-green-50 border-green-300", avoid: "bg-red-50 border-red-300", caution: "bg-amber-50 border-amber-300", badge: "bg-blue-600" },
  amber: { hdr: "from-amber-600 to-orange-600", eat: "bg-green-50 border-green-300", avoid: "bg-red-50 border-red-300", caution: "bg-amber-50 border-amber-300", badge: "bg-amber-600" },
  orange: { hdr: "from-orange-600 to-red-600", eat: "bg-green-50 border-green-300", avoid: "bg-red-50 border-red-300", caution: "bg-amber-50 border-amber-300", badge: "bg-orange-600" },
  red: { hdr: "from-red-700 to-rose-700", eat: "bg-green-50 border-green-300", avoid: "bg-red-50 border-red-300", caution: "bg-amber-50 border-amber-300", badge: "bg-red-600" },
  rose: { hdr: "from-rose-700 to-pink-700", eat: "bg-green-50 border-green-300", avoid: "bg-red-50 border-red-300", caution: "bg-amber-50 border-amber-300", badge: "bg-rose-600" },
  purple: { hdr: "from-purple-700 to-violet-700", eat: "bg-green-50 border-green-300", avoid: "bg-red-50 border-red-300", caution: "bg-amber-50 border-amber-300", badge: "bg-purple-600" },
  teal: { hdr: "from-teal-700 to-cyan-700", eat: "bg-green-50 border-green-300", avoid: "bg-red-50 border-red-300", caution: "bg-amber-50 border-amber-300", badge: "bg-teal-600" },
};

const DIET_DATA = {
  ckd: {
    title: "CKD Diet (Stage 1–5)",
    intro: "Diet in CKD must be individualised by stage. Early CKD: mild restriction. Stage 4–5: stricter limits. Always involve a renal dietitian.",
    targets: [
      { label: "Protein", value: "0.8–1.0 g/kg/day (Stage 1–3) · 0.6–0.8 g/kg/day (Stage 4–5, non-dialysis)" },
      { label: "Potassium", value: "Restrict if serum K >5.0 mEq/L: <2–3 g/day" },
      { label: "Phosphorus", value: "<800–1000 mg/day (Stage 3+)" },
      { label: "Sodium", value: "<2 g/day (with HTN or oedema)" },
      { label: "Fluid", value: "Unrestricted early; restrict in Stage 5 / oliguria" },
      { label: "Energy", value: "30–35 kcal/kg/day (ensure adequate growth in children)" },
      { label: "Calcium", value: "800–1000 mg/day (avoid excess supplementation)" },
    ],
    eat: [
      "Rice, pasta, white bread (low protein, low K, low P)",
      "Cauliflower, cabbage, green beans, leeks (low-K vegetables)",
      "Apple, grapes, blueberries, cranberries (low-K fruits)",
      "Egg white (high-quality protein, low phosphorus)",
      "Chicken, fish (lean protein — moderate portions)",
      "Unsalted butter/oil (energy-dense, low K/P)",
      "Homemade food — better control over salt/K/P",
      "Boiled and drained vegetables (reduces K by 30–50%)",
    ],
    avoid: [
      "Bananas, oranges, tomatoes, potatoes (HIGH potassium)",
      "Nuts, seeds, legumes, lentils (HIGH K + HIGH P + HIGH protein)",
      "Processed meats, sausages, canned foods (HIGH sodium + phosphate additives)",
      "Cola drinks, dark sodas (HIGH phosphate additives)",
      "Dairy excess — milk, cheese, yoghurt (HIGH phosphorus)",
      "Whole wheat / brown rice / bran (HIGH phosphorus)",
      "Salt substitutes containing potassium chloride (HIGH K — DANGEROUS)",
      "Fast food, restaurant meals (uncontrolled Na/P/K)",
    ],
    caution: [
      "Phosphate additives in processed food are fully absorbed (unlike natural phosphate ~50% absorbed) — read labels",
      "Cooking method matters: boil vegetables in large water, discard water — leaches K",
      "Protein restriction <0.6 g/kg NOT recommended in growing children — monitor growth velocity",
      "Vitamin D and B-complex supplementation often needed due to dietary restrictions",
    ],
    links: [
      { label: "CKD Staging Engine", to: "/ClinicalSupport?scenario=ckd-engine" },
      { label: "CKD-MBD Pathway", to: "/ClinicalSupport?scenario=ckd-mbd" },
      { label: "CKD Progression Engine", to: "/ClinicalSupport?scenario=ckd-progression-engine" },
      { label: "Phosphorus Calculator", to: "/CalculatorsHub" },
      { label: "CKD Guidelines Library", to: "/GuidelinesLibrary" },
    ],
  },

  "ckd-esrd": {
    title: "CKD Stage 5 / Dialysis Diet",
    intro: "On dialysis, protein needs INCREASE (losses in dialysate). HD and PD have different requirements. Fluid and electrolyte management critical.",
    targets: [
      { label: "Protein (HD)", value: "1.2–1.4 g/kg/day" },
      { label: "Protein (PD)", value: "1.2–1.5 g/kg/day (peritoneal losses higher)" },
      { label: "Potassium (HD)", value: "2–3 g/day; higher caution between sessions" },
      { label: "Potassium (PD)", value: "3–4 g/day (continuous removal — less restriction)" },
      { label: "Phosphorus", value: "<800 mg/day; take binders WITH meals" },
      { label: "Fluid (HD)", value: "Limit to 500–750 mL/day + urine output" },
      { label: "Fluid (PD)", value: "More flexible if ultrafiltration adequate" },
      { label: "Sodium", value: "<2 g/day (drives fluid retention + thirst)" },
    ],
    eat: [
      "Egg white, chicken breast, fish (high-quality protein for HD losses)",
      "Rice, white pasta (energy without excess K/P)",
      "Low-K fruits: apple, grapes, strawberries (small portions)",
      "Low-K vegetables: cabbage, cauliflower, green beans (boiled/drained)",
      "Unsalted crackers/bread for energy",
      "Homemade meals — full control of K/P/Na content",
    ],
    avoid: [
      "High-K foods between HD sessions: banana, orange, tomato, potato (DANGEROUS hyperkalaemia risk)",
      "Dark cola, chocolate milk, processed cheese (phosphate additives — despite dialysis, P accumulates)",
      "Nuts, seeds, legumes (HIGH K + HIGH P simultaneously)",
      "Fluid excess: soups, ice cream, gelatin, liquid medications volume",
      "Salt and salty foods (worsens thirst + interdialytic weight gain)",
      "Raw/untreated water during outages (infection risk with CVC/fistula)",
    ],
    caution: [
      "PD patients absorb glucose from dialysate (~400–800 kcal/day) — account for total energy intake; risk of obesity/dyslipidaemia",
      "Monitor for PEW (Protein-Energy Wasting): check albumin, pre-albumin, nPCR monthly",
      "Intradialytic parenteral nutrition (IDPN) for severe PEW on HD",
      "Children on dialysis: supplement water-soluble vitamins (B1, B6, B12, C, folate) — dialysed off",
    ],
    links: [
      { label: "RRT Engine", to: "/ClinicalSupport?scenario=rrt-engine" },
      { label: "Peritoneal Dialysis Pathway", to: "/ClinicalSupport?scenario=peritoneal-dialysis" },
      { label: "Hemodialysis Pathway", to: "/ClinicalSupport?scenario=hemodialysis" },
      { label: "CKD-MBD Pathway", to: "/ClinicalSupport?scenario=ckd-mbd" },
    ],
  },

  nephrotic: {
    title: "Nephrotic Syndrome Diet",
    intro: "NS diet focuses on oedema control (low Na), preventing protein depletion (adequate protein), and managing hyperlipidaemia. Avoid excess fluid.",
    targets: [
      { label: "Sodium", value: "<1–2 g/day during active disease (oedema control)" },
      { label: "Protein", value: "RDA for age (do NOT restrict; avoid excess beyond 1.5 g/kg/day)" },
      { label: "Fat", value: "Low saturated fat (<7% total kcal) — NS causes hypercholesterolaemia" },
      { label: "Fluid", value: "Restrict only if severe oedema or hyponatraemia (guided by symptoms)" },
      { label: "Calcium", value: "Adequate (steroid therapy → bone loss → supplement)" },
      { label: "Energy", value: "Adequate for growth — do NOT calorie restrict" },
    ],
    eat: [
      "Lean chicken, fish, egg white (adequate protein without excess saturated fat)",
      "Fresh vegetables (avoid adding salt in cooking)",
      "Fresh fruits (no added salt/sugar)",
      "Low-fat dairy or dairy alternatives fortified with calcium",
      "Oats, wholegrain (soluble fibre → reduces cholesterol)",
      "Olive oil, nuts in moderation (unsaturated fats)",
      "Homemade food without added salt",
      "Water and fresh juices (no flavoured salty drinks)",
    ],
    avoid: [
      "Added salt: table salt, soy sauce, stock cubes, pickles, papadums",
      "Processed/canned food: soups, sausages, ready meals (HIGH hidden sodium)",
      "Fried food: chips, fried chicken, samosas (HIGH saturated fat → worsens hyperlipidaemia)",
      "Butter, ghee, coconut oil excess (saturated fat)",
      "High-sugar drinks: cola, fruit juices with added sugar (dyslipidaemia)",
      "Salty snacks: crisps, namkeen, biscuits",
    ],
    caution: [
      "Steroid use → increased appetite; counsel against overeating and junk food",
      "Steroid use → calcium loss → ensure 1000–1200 mg/day calcium + Vit D",
      "Do NOT restrict protein below RDA — urinary protein losses already cause protein depletion",
      "During remission: normal diet but continue low-Na habits to minimise relapse triggers",
      "Hyperlipidaemia often resolves with remission; if persistent, add dietary fat modification",
    ],
    links: [
      { label: "NS Engine", to: "/ClinicalSupport?scenario=ns-engine" },
      { label: "Nephrotic Pathway (Childhood)", to: "/ClinicalSupport?scenario=childhood-nephrotic" },
      { label: "Steroid-Resistant NS Pathway", to: "/ClinicalSupport?scenario=steroid-resistant-ns" },
      { label: "Severe Oedema Pathway", to: "/ClinicalSupport?scenario=severe-edema-ns" },
      { label: "Guidelines Library", to: "/GuidelinesLibrary" },
    ],
  },

  "stone-calcium": {
    title: "Calcium Oxalate Stone Diet",
    intro: "Calcium oxalate stones are most common. Key: HIGH fluid, NORMAL calcium (not restricted), LOW oxalate, LOW sodium, adequate citrate.",
    targets: [
      { label: "Fluid intake", value: ">2 L/m²/day (urine output >1 mL/kg/hr); target pale urine" },
      { label: "Calcium", value: "NORMAL intake (800–1200 mg/day) — low-Ca diet INCREASES oxalate absorption" },
      { label: "Oxalate", value: "Restrict high-oxalate foods (<100 mg oxalate/day)" },
      { label: "Sodium", value: "<2 g/day (low Na reduces urinary Ca excretion)" },
      { label: "Animal protein", value: "Moderate (1 g/kg/day) — excess → hypercalciuria + hypocitraturia" },
      { label: "Citrate", value: "Increase: citrus fruits, lemon juice (alkalinises + chelates Ca)" },
    ],
    eat: [
      "Water — the single most important intervention (≥2 L/m²/day)",
      "Lemon juice / citrus fruits (potassium citrate → urinary citrate → inhibits stone formation)",
      "Milk, yoghurt with meals (calcium binds dietary oxalate in gut → reduces oxalate absorption)",
      "White rice, pasta, bread (low oxalate)",
      "Chicken, fish (moderate protein)",
      "Bananas, apples, melons (low oxalate fruits)",
      "Cabbage, broccoli, cauliflower (low oxalate vegetables)",
    ],
    avoid: [
      "Spinach (VERY HIGH oxalate — 750 mg/100g — the single biggest source)",
      "Nuts: peanuts, almonds, cashews (HIGH oxalate)",
      "Beets, rhubarb, sweet potato (HIGH oxalate)",
      "Chocolate, cocoa powder (HIGH oxalate)",
      "Tea (black/green — HIGH oxalate); limit to 1–2 cups/day",
      "Excess vitamin C supplements >250 mg/day (converted to oxalate)",
      "High-salt food (increases urinary calcium excretion)",
      "Excess animal protein (increases urinary uric acid → calcium oxalate nucleation)",
    ],
    caution: [
      "Do NOT restrict calcium — this is a common dangerous misconception; dietary Ca binds gut oxalate",
      "Calcium supplements BETWEEN meals (not with meals) can increase urinary Ca — take with food to bind oxalate",
      "Potassium citrate supplementation (1–2 mEq/kg/day) if hypocitraturia confirmed on 24h urine",
      "Always check 24h urine: Ca, oxalate, citrate, uric acid, Na, Cr before recommending specific restriction",
    ],
    links: [
      { label: "Stone Engine", to: "/ClinicalSupport?scenario=stone-engine" },
      { label: "Nephrocalcinosis Engine", to: "/ClinicalSupport?scenario=nephrocalcinosis-stone-engine" },
      { label: "Stone Risk Calculator", to: "/StoneRisk" },
      { label: "Renal Stone Pathway", to: "/ClinicalSupport?scenario=renal-stone" },
    ],
  },

  "stone-uric": {
    title: "Uric Acid Stone Diet",
    intro: "Uric acid stones: acidic urine (pH <5.5) + hyperuricosuria. Diet: alkalinise urine, reduce purine load, high hydration.",
    targets: [
      { label: "Fluid", value: ">2 L/m²/day — dilutes urine, prevents supersaturation" },
      { label: "Urine pH target", value: "6.0–6.5 with potassium citrate / sodium bicarbonate" },
      { label: "Purines", value: "Restrict high-purine foods" },
      { label: "Animal protein", value: "<1 g/kg/day (acidifies urine + increases uric acid)" },
      { label: "Fructose", value: "Restrict (increases uric acid production)" },
    ],
    eat: [
      "Water, water, water (dilution is the single most effective intervention)",
      "Lemon water / potassium-rich citrus (alkalinises urine)",
      "Vegetables (most are alkaline-forming and low purine)",
      "Dairy products (alkalinising, low purine)",
      "Eggs (low purine)",
      "White rice, pasta, bread (low purine)",
      "Cherries (reduces uric acid levels — anti-inflammatory)",
    ],
    avoid: [
      "Organ meats: liver, kidney, brain (VERY HIGH purine → highest uric acid load)",
      "Red meat: beef, lamb, pork excess (HIGH purine)",
      "Seafood: sardines, anchovies, mackerel, shellfish (HIGH purine)",
      "Meat-based gravies and stocks (concentrated purines)",
      "Fructose-sweetened drinks: cola, fruit punch, sweetened juices (fructose → uric acid)",
      "Beer and alcohol (fermented — HIGH purine + acidifies urine)",
    ],
    caution: [
      "Potassium citrate 1–3 mEq/kg/day to alkalinise urine — target pH 6.0–6.5 (not >7 — risk of Ca-phosphate stones)",
      "Allopurinol if hyperuricosuria persists despite diet",
      "Check 24h urine uric acid, volume, pH to guide therapy",
    ],
    links: [
      { label: "Stone Engine", to: "/ClinicalSupport?scenario=stone-engine" },
      { label: "Stone Risk Calculator", to: "/StoneRisk" },
      { label: "Nephrocalcinosis Engine", to: "/ClinicalSupport?scenario=nephrocalcinosis-stone-engine" },
    ],
  },

  "stone-cystine": {
    title: "Cystinuria Diet",
    intro: "Cystine stones: high cystine excretion from genetic transport defect. Key: extreme hydration, urinary alkalinisation, low-methionine diet.",
    targets: [
      { label: "Fluid", value: ">3 L/m²/day — MUST maintain >3 mL/kg/hr urine output; wake at night to drink" },
      { label: "Urine pH", value: ">7.0 (potassium citrate / sodium bicarbonate — cystine solubility increases dramatically above pH 7)" },
      { label: "Methionine", value: "Reduce high-methionine foods (cystine precursor)" },
      { label: "Sodium", value: "<2 g/day (low Na reduces cystine excretion)" },
    ],
    eat: [
      "Water: massive volumes — set alarms at night to drink (>3 L/m²/day non-negotiable)",
      "Fruits and vegetables (low methionine, alkalinising)",
      "Bread, rice, pasta (low methionine, good energy source)",
      "Low-fat dairy in moderate amounts",
      "Lemon juice mixed in water (potassium citrate source)",
    ],
    avoid: [
      "Red meat, chicken, fish excess (HIGH methionine — the precursor to cystine)",
      "Eggs (HIGH methionine)",
      "Soy protein, soy milk (HIGH methionine)",
      "Nuts (HIGH methionine + relatively low water content)",
      "Salt excess (directly increases cystine excretion)",
    ],
    caution: [
      "Drug therapy essential alongside diet: D-penicillamine or tiopronin — chelate cystine to more soluble compounds",
      "This is a lifelong condition — involve family in meal planning from early childhood",
      "Overnight hydration crucial: cystine precipitates in concentrated overnight urine",
      "Sodium bicarbonate or potassium citrate solution to keep urine pH >7 at all times",
    ],
    links: [
      { label: "Stone Engine", to: "/ClinicalSupport?scenario=stone-engine" },
      { label: "Cystinosis Engine", to: "/ClinicalSupport?scenario=cystinosis-engine" },
      { label: "Stone Risk Calculator", to: "/StoneRisk" },
    ],
  },

  nephrocalcinosis: {
    title: "Nephrocalcinosis / Hypercalciuria Diet",
    intro: "Deposited calcium in renal parenchyma. Most common cause: hypercalciuria. Identify cause first (dRTA, Bartter, hyperparathyroidism, excess Vit D). Diet is adjunct.",
    targets: [
      { label: "Fluid", value: ">2 L/m²/day" },
      { label: "Sodium", value: "<2 g/day (sodium → urinary Ca excretion: every 100 mEq Na → 1 mEq Ca lost)" },
      { label: "Calcium", value: "NORMAL intake (800–1000 mg/day) — never restrict; binds gut oxalate" },
      { label: "Oxalate", value: "Restrict high-oxalate foods if concurrent calcium oxalate stones" },
      { label: "Animal protein", value: "Moderate (excess → hypercalciuria)" },
      { label: "Citrate", value: "Increase dietary citrate (lemon, citrus)" },
    ],
    eat: [
      "High fluid intake (dilutes urinary calcium)",
      "Low-sodium diet: freshly cooked food, no added salt (most critical intervention)",
      "Normal dairy for calcium — do not restrict (binds oxalate in gut)",
      "Citrus fruits, lemon water (urinary citrate → chelates calcium → less stone/NC)",
      "Vegetables and wholegrains (fibre, alkalinising)",
    ],
    avoid: [
      "Excess vitamin D supplements without monitoring Ca levels (causes hypercalcaemia → hypercalciuria)",
      "Very high-oxalate foods if hypercalciuria + oxaluria coexist: spinach, nuts, chocolate",
      "Salt: table salt, canned food, fast food (directly increases urinary Ca)",
      "Very high animal protein diet",
      "Calcium supplements away from meals (less beneficial for binding oxalate; increases urinary Ca)",
    ],
    caution: [
      "Thiazide diuretics (hydrochlorothiazide/chlorothiazide) reduce urinary Ca — dietary adjunct, not replacement",
      "Potassium citrate for hypocitraturia or if urine pH acidic",
      "Check parathyroid status, 25-OH Vit D, and urine Ca:Cr ratio before dietary advice",
      "dRTA: bicarbonate replacement required (diet alone insufficient)",
    ],
    links: [
      { label: "Nephrocalcinosis Engine", to: "/ClinicalSupport?scenario=nephrocalcinosis-stone-engine" },
      { label: "Hyperoxaluria Engine", to: "/ClinicalSupport?scenario=hyperoxaluria-engine" },
      { label: "Stone Risk Calculator", to: "/StoneRisk" },
      { label: "RTA Pathway", to: "/ClinicalSupport?scenario=rta-diagnosis" },
      { label: "Tubular Disorders Engine", to: "/ClinicalSupport?scenario=tubular-engine" },
    ],
  },

  hyperkalemia: {
    title: "Hyperkalemia: Low-Potassium Diet",
    intro: "Critical in CKD, RTA, Addison, ACEi/ARB use. Target serum K <5.5 mEq/L. Dietary K reduction must be combined with treating the underlying cause.",
    targets: [
      { label: "Daily K target", value: "<2 g/day (severe) · 2–3 g/day (moderate restriction)" },
      { label: "Cooking method", value: "Boil vegetables in large volume water, discard water (reduces K by 30–50%)" },
    ],
    eat: [
      "White rice, pasta, white bread (very low K — staple in low-K diet)",
      "Egg white, chicken breast (moderate protein, low K)",
      "Low-K vegetables: cabbage, cauliflower, leeks, green beans, cucumber, lettuce",
      "Low-K fruits: apple, grapes, strawberries, blueberries, watermelon (small portion)",
      "Cooked vegetables (boiled, drained — leaches K significantly)",
      "White sugar, honey (energy without K)",
      "Refined cereals, cornflakes (low K)",
    ],
    avoid: [
      "Bananas, oranges, kiwi, tomatoes, dried fruits (VERY HIGH K)",
      "Potatoes, sweet potato, yam, beets (HIGH K — unless boiled twice with water change)",
      "Nuts, seeds: almonds, peanuts, sunflower seeds (VERY HIGH K)",
      "Legumes: lentils, rajma, chickpeas, soya (HIGH K + HIGH P)",
      "Chocolate, cocoa, coffee (HIGH K)",
      "Coconut water (marketed as healthy — DANGEROUS in kidney disease: HIGH K)",
      "Salt substitutes (KCl-based — IMMEDIATELY dangerous in renal disease)",
      "Fruit juices, smoothies (concentrated K from multiple fruits)",
    ],
    caution: [
      "Double cooking: boil vegetables, discard water, boil again — removes up to 50% K",
      "Canned vegetables (drained and rinsed) have lower K than fresh",
      "Portion size matters even for low-K foods: large portions of low-K food can add up",
      "Hyperkalemia emergency: calcium gluconate → insulin-dextrose → dialysis (see Hyperkalemia Engine)",
    ],
    links: [
      { label: "Hyperkalemia Emergency Engine", to: "/ClinicalSupport?scenario=hyperkalemia-deep-engine" },
      { label: "Electrolytes Hub", to: "/ClinicalSupport?scenario=electrolytes-hub" },
      { label: "Potassium Calculator", to: "/PotassiumCalculator" },
      { label: "CKD Engine", to: "/ClinicalSupport?scenario=ckd-engine" },
    ],
  },

  hyperphosphatemia: {
    title: "Hyperphosphatemia Diet (CKD-MBD)",
    intro: "Phosphorus accumulates in CKD → secondary hyperparathyroidism → renal osteodystrophy. Diet + phosphate binders together are key.",
    targets: [
      { label: "Phosphorus", value: "<800 mg/day in CKD 3+; <1000 mg/day early CKD" },
      { label: "Calcium binders", value: "Take WITH meals (calcium carbonate/acetate)" },
      { label: "Non-Ca binders", value: "Sevelamer / lanthanum — use with calcium binders if Ca high" },
    ],
    eat: [
      "Egg white (high protein, very low phosphorus)",
      "White rice, pasta, white bread (low phosphorus carbs)",
      "Fresh chicken/fish (natural phosphorus ~50% absorbed — prefer over processed)",
      "Fresh vegetables (natural P, lower absorption)",
      "Fresh fruits (low P)",
      "Unsalted butter, oils (virtually no phosphorus)",
    ],
    avoid: [
      "Processed meats: sausages, bacon, deli meats (phosphate additives — 100% absorbed!)",
      "Dark colas: Pepsi, Coca Cola (phosphoric acid — 100% absorbed)",
      "Dairy excess: milk, cheese, yoghurt (HIGH P per serving)",
      "Nuts, seeds, legumes (HIGH P + HIGH K)",
      "Whole grains, bran, brown rice (HIGH P — mostly phytate form but still restrict in CKD)",
      "Fast food, processed packaged food (phosphate preservatives)",
      "Chocolate, cocoa (HIGH P)",
    ],
    caution: [
      "Phosphate ADDITIVES (inorganic) are 100% bioavailable — more dangerous than natural food phosphorus",
      "Learn to read food labels: look for 'phosphate', 'phosphoric acid', 'E338-E341' in ingredients",
      "Binder timing is critical: take WITH the first bite of meals — not before or after",
      "Phosphate restriction alone is insufficient in advanced CKD — binders are essential",
    ],
    links: [
      { label: "CKD-MBD Pathway", to: "/ClinicalSupport?scenario=ckd-mbd" },
      { label: "CKD Engine", to: "/ClinicalSupport?scenario=ckd-engine" },
      { label: "CKD Anaemia-MBD Pathway", to: "/ClinicalSupport?scenario=ckd-anemia-mbd" },
    ],
  },

  "bartter-gitelman": {
    title: "Bartter / Gitelman Syndrome Diet",
    intro: "Salt-wasting conditions with hypokalaemia. Paradox: these patients need HIGH salt and potassium supplementation, not restriction. Gitelman: also needs magnesium.",
    targets: [
      { label: "Sodium", value: "HIGH — liberal salt intake; no restriction; extra salt supplementation often needed" },
      { label: "Potassium", value: "HIGH — oral KCl 2–4 mEq/kg/day; dietary K should be maximised" },
      { label: "Magnesium (Gitelman)", value: "Supplement MgO or MgCl2 — dietary Mg enrichment important" },
      { label: "Fluid", value: "Liberal (polyuria common — match output)" },
    ],
    eat: [
      "Salty foods (salt snacks, salted nuts — unlike CKD, these are encouraged)",
      "Bananas, oranges, tomatoes, potatoes (HIGH K — excellent choices for these patients)",
      "Avocado, coconut water (HIGH K)",
      "Nuts and seeds (HIGH K + Mg)",
      "Green leafy vegetables: spinach, broccoli (HIGH K + Mg)",
      "Legumes: lentils, beans (HIGH K + Mg)",
      "Dairy, meat, whole grains (Mg-rich foods for Gitelman)",
      "ORS / electrolyte drinks (salt + K replacement)",
    ],
    avoid: [
      "Diuretics (furosemide, thiazide) — worsen potassium losses",
      "Alcohol (worsens Mg depletion especially in Gitelman)",
      "High caffeine (mild diuretic effect → worsens losses)",
    ],
    caution: [
      "These patients are the OPPOSITE of typical renal diet patients — HIGH K and HIGH Na foods are therapeutic",
      "Gitelman requires lifelong Mg supplementation — dietary Mg alone insufficient",
      "Oral KCl supplements are essential — dietary K alone rarely enough to normalise serum K",
      "Indomethacin (Bartter) reduces prostaglandin-driven salt wasting — take with food to protect stomach",
      "Monitor serum K, Mg, and bicarbonate levels every 3–6 months",
    ],
    links: [
      { label: "Tubular Disorders Engine", to: "/ClinicalSupport?scenario=tubular-engine" },
      { label: "Hypokalemia Engine", to: "/ClinicalSupport?scenario=hypokalemia-engine" },
      { label: "Electrolytes Hub", to: "/ClinicalSupport?scenario=electrolytes-hub" },
      { label: "RTA Pathway", to: "/ClinicalSupport?scenario=rta-diagnosis" },
    ],
  },
};

function DietSection({ title, icon, items, colorClass }) {
  const Icon = icon;
  return (
    <div className={`rounded-xl border-2 p-3 ${colorClass}`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4 flex-shrink-0" />
        <p className="text-xs font-bold">{title}</p>
      </div>
      <div className="space-y-1">
        {items.map((item, i) => (
          <div key={i} className="flex items-start gap-1.5 text-xs text-slate-800">
            <span className="flex-shrink-0 mt-0.5">•</span>
            <span>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function RenalDietEngine() {
  const [selected, setSelected] = useState(null);

  const scenario = selected ? SCENARIOS.find(s => s.id === selected) : null;
  const data = selected ? DIET_DATA[selected] : null;
  const c = scenario ? COLOR[scenario.color] : null;

  if (selected && data) {
    return (
      <div className="space-y-4">
        {/* Header */}
        <div className={`rounded-xl bg-gradient-to-r ${c.hdr} p-4 text-white`}>
          <div className="flex items-center gap-2">
            <Utensils className="w-5 h-5" />
            <div>
              <h3 className="font-bold text-sm">{data.title}</h3>
              <p className="text-xs opacity-80">Pediatric Renal Nutrition Engine · Evidence-Based</p>
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg p-3">{data.intro}</p>

        {/* Targets */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
          <p className="text-xs font-bold text-blue-900 mb-2">Nutritional Targets</p>
          <div className="space-y-1">
            {data.targets.map((t, i) => (
              <div key={i} className="flex items-start gap-2 text-xs">
                <span className="font-semibold text-blue-800 w-28 flex-shrink-0">{t.label}:</span>
                <span className="text-slate-700">{t.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Eat / Avoid / Caution */}
        <DietSection title="✅ ENCOURAGE / Eat More" icon={CheckCircle2} items={data.eat} colorClass="bg-green-50 border-green-300 text-green-900" />
        <DietSection title="🚫 AVOID / Restrict" icon={XCircle} items={data.avoid} colorClass="bg-red-50 border-red-300 text-red-900" />
        <DietSection title="⚠️ CAUTION / Clinical Pearls" icon={AlertTriangle} items={data.caution} colorClass="bg-amber-50 border-amber-300 text-amber-900" />

        {/* Links */}
        {data.links?.length > 0 && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
            <div className="flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-slate-500" />
              <p className="text-xs font-bold text-slate-700">Related Engines, Pathways & Calculators</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {data.links.map((lnk, i) => (
                <Link key={i} to={lnk.to}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:border-slate-400 hover:bg-slate-50 transition-colors">
                  {lnk.label} <ExternalLink className="w-3 h-3 text-slate-400" />
                </Link>
              ))}
              <Link to="/GuidelinesLibrary" className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:border-slate-400 transition-colors">
                <BookOpen className="w-3 h-3" /> Guidelines Library
              </Link>
              <Link to="/NutritionHub" className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:border-slate-400 transition-colors">
                <Utensils className="w-3 h-3" /> Nutrition Hub
              </Link>
            </div>
          </div>
        )}

        {/* Diet Chart Generator link */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold text-emerald-900">Build a Full Patient Diet Chart</p>
            <p className="text-xs text-emerald-700 mt-0.5">Use the Diet Chart Generator to create a customised meal plan for your patient</p>
          </div>
          <Link to="/DietChartGenerator" className="flex-shrink-0 px-3 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 flex items-center gap-1">
            <FileText className="w-3.5 h-3.5" /> Diet Chart →
          </Link>
        </div>

        {/* PDF Export button */}
        <button
          onClick={() => {
            const content = `
RENAL NUTRITION PLAN — ${data.title}
Generated: ${new Date().toLocaleDateString('en-IN')}

INTRODUCTION:
${data.intro}

NUTRITIONAL TARGETS:
${data.targets.map(t => `• ${t.label}: ${t.value}`).join('\n')}

ENCOURAGE / EAT MORE:
${data.eat.map(i => `✓ ${i}`).join('\n')}

AVOID / RESTRICT:
${data.avoid.map(i => `✗ ${i}`).join('\n')}

CLINICAL PEARLS & CAUTIONS:
${data.caution.map(i => `⚠ ${i}`).join('\n')}

---
Always involve a renal dietitian for individual meal planning.
CliniCals Hub by Swarnim | Evidence-Based Pediatric Nephrology
            `.trim();
            const printWindow = window.open('', '_blank');
            printWindow.document.write(`
              <html><head><title>${data.title} — Diet Plan</title>
              <style>
                body { font-family: Arial, sans-serif; max-width: 700px; margin: 30px auto; color: #1e293b; line-height: 1.6; }
                h1 { color: #065f46; border-bottom: 2px solid #065f46; padding-bottom: 8px; }
                h2 { color: #1e3a5f; margin-top: 20px; font-size: 15px; }
                .green { color: #15803d; } .red { color: #dc2626; } .amber { color: #d97706; }
                ul { padding-left: 20px; } li { margin-bottom: 4px; font-size: 13px; }
                .footer { margin-top: 30px; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 8px; }
                .targets { background: #eff6ff; padding: 12px; border-radius: 8px; }
                .target-row { display: flex; gap: 10px; font-size: 13px; margin-bottom: 4px; }
                .target-label { font-weight: bold; min-width: 140px; }
              </style></head><body>
              <h1>🍽️ ${data.title}</h1>
              <p style="font-size:13px;color:#475569">${data.intro}</p>
              <h2>📊 Nutritional Targets</h2>
              <div class="targets">${data.targets.map(t => `<div class="target-row"><span class="target-label">${t.label}:</span><span>${t.value}</span></div>`).join('')}</div>
              <h2 class="green">✅ Encourage / Eat More</h2>
              <ul class="green">${data.eat.map(i => `<li>${i}</li>`).join('')}</ul>
              <h2 class="red">🚫 Avoid / Restrict</h2>
              <ul class="red">${data.avoid.map(i => `<li>${i}</li>`).join('')}</ul>
              <h2 class="amber">⚠️ Cautions & Clinical Pearls</h2>
              <ul class="amber">${data.caution.map(i => `<li>${i}</li>`).join('')}</ul>
              <div class="footer">Always involve a renal dietitian for individual meal planning. CliniCals Hub by Swarnim — Pediatric Clinical Intelligence.</div>
              </body></html>
            `);
            printWindow.document.close();
            printWindow.focus();
            printWindow.print();
          }}
          className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors">
          <Printer className="w-3.5 h-3.5" /> Export as PDF / Print for Patient
        </button>

        <button onClick={() => setSelected(null)}
          className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-semibold text-slate-500 border border-slate-200 rounded-xl hover:bg-slate-50">
          <RotateCcw className="w-3.5 h-3.5" /> Choose Another Scenario
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-gradient-to-r from-emerald-700 to-teal-700 p-4 text-white">
        <div className="flex items-center gap-2">
          <Utensils className="w-5 h-5" />
          <div>
            <h3 className="font-bold text-sm">Renal Diet Generator Engine</h3>
            <p className="text-xs text-emerald-200">Pediatric · Disease-Specific · Evidence-Based Nutrition Plans</p>
          </div>
        </div>
      </div>
      <p className="text-xs text-slate-600">Select the clinical scenario to get a disease-specific diet plan including foods to eat, foods to avoid, nutritional targets, and links to relevant clinical engines and guidelines.</p>
      <div className="space-y-2">
        {SCENARIOS.map(s => (
          <button key={s.id} onClick={() => setSelected(s.id)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 border-slate-200 bg-white hover:border-emerald-400 hover:bg-emerald-50 text-left transition-all">
            <div>
              <p className="font-semibold text-sm text-slate-900">{s.label}</p>
              <p className="text-xs text-slate-500 mt-0.5">{s.desc}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
          </button>
        ))}
      </div>
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
        <p className="text-xs text-amber-800"><strong>Note:</strong> Always involve a renal dietitian for individual meal planning. These are evidence-based general guidelines. Nutritional requirements vary by age, weight, dialysis modality, and disease activity.</p>
      </div>
    </div>
  );
}