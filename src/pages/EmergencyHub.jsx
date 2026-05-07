import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertTriangle, Activity, Zap, Droplet, Heart, Brain, Search,
  ChevronRight, Clock, Pill, ArrowLeft, CheckSquare, ListChecks
} from "lucide-react";

const PROTOCOLS = [
  {
    id: "hyperkalemia",
    title: "Hyperkalemia",
    icon: Zap,
    color: "bg-orange-600",
    severity: "CRITICAL",
    summary: "K⁺ >6.5 mEq/L with ECG changes = cardiac emergency",
    icu_triggers: ["K⁺ >6.5 mEq/L", "Peaked T waves / widened QRS", "Oliguria / AKI", "Muscle weakness, paralysis"],
    algorithm: [
      { step: "1", action: "12-lead ECG immediately — peaked T, prolonged PR, wide QRS, sine wave = emergency", time: "0 min", color: "bg-red-600" },
      { step: "2", action: "IV Calcium gluconate 0.5–1 mL/kg (max 20mL) 10% solution over 5–10 min — cardiac membrane stabilization (onset 1–3 min, duration 30–60 min)", time: "1–2 min", color: "bg-red-500" },
      { step: "3", action: "Insulin + Glucose: Insulin 0.1 u/kg IV + Dextrose 0.5g/kg (D25%) over 30 min — shifts K into cells (onset 15–30 min)", time: "5 min", color: "bg-orange-600" },
      { step: "4", action: "Salbutamol nebulization 2.5–5 mg — additional K shift (additive with insulin)", time: "10 min", color: "bg-amber-600" },
      { step: "5", action: "Sodium bicarbonate 1–2 mEq/kg IV over 30 min — if metabolic acidosis, promotes K shift", time: "15 min", color: "bg-yellow-600" },
      { step: "6", action: "Kayexalate (sodium polystyrene sulfonate) 1g/kg PO/PR — K removal (slow, GI route)", time: "30 min", color: "bg-green-600" },
      { step: "7", action: "Furosemide 1–2 mg/kg IV if adequate urine output — renal K excretion", time: "30 min", color: "bg-green-600" },
      { step: "8", action: "Dialysis: indications — K >7, ECG changes not resolving, AKI with oliguria, refractory hyperkalemia", time: "60+ min", color: "bg-blue-600" },
    ],
    drugs: [
      { name: "Calcium gluconate 10%", dose: "0.5–1 mL/kg (max 20mL)", route: "IV slow push", duration: "5–10 min", purpose: "Cardiac stabilization" },
      { name: "Regular Insulin", dose: "0.1 units/kg", route: "IV", duration: "Over 15–30 min", purpose: "K shift (+ glucose cover)" },
      { name: "Dextrose 25%", dose: "0.5 g/kg = 2 mL/kg", route: "IV", duration: "Over 30 min", purpose: "Prevent hypoglycemia with insulin" },
      { name: "Salbutamol", dose: "2.5–5 mg", route: "Nebulization", duration: "10 min", purpose: "K shift (onset 30 min)" },
      { name: "NaHCO3 8.4%", dose: "1–2 mEq/kg", route: "IV", duration: "Over 30 min", purpose: "K shift + acidosis correction" },
    ],
    monitoring: ["ECG continuous cardiac monitoring", "Blood glucose every 30 min (insulin risk)", "Repeat K⁺ at 1h, 2h, 4h", "Urine output hourly", "BP and HR continuously"],
    pitfalls: [
      "Do NOT give calcium in digitalis toxicity — paradoxical cardiac toxicity",
      "Insulin without glucose cover → severe hypoglycemia",
      "Kayexalate takes 4–6 hours — not for acute cardiac emergency",
      "Pseudohyperkalemia: hemolysis in sample, repeat with fresh non-haemolysed sample"
    ]
  },
  {
    id: "hypertensive-emergency",
    title: "Hypertensive Emergency",
    icon: Heart,
    color: "bg-red-700",
    severity: "EMERGENCY",
    summary: "BP >99th+5 mmHg with end-organ damage (encephalopathy, seizure, retinal changes)",
    icu_triggers: ["Seizures/altered consciousness with HTN", "Papilledema / retinal hemorrhage", "Acute pulmonary edema + HTN", "Acute LV dysfunction", "Suspected aortic dissection"],
    algorithm: [
      { step: "1", action: "Confirm BP in both arms, correct cuff size; repeat in 5 min", time: "0 min", color: "bg-slate-600" },
      { step: "2", action: "Rapid neurological assessment — GCS, pupils, fundoscopy (PRES?)", time: "2 min", color: "bg-red-600" },
      { step: "3", action: "Establish IV access. ECG, CXR, echo if available. Labs: CBC, creatinine, electrolytes, urine dipstick", time: "5 min", color: "bg-red-500" },
      { step: "4", action: "GOAL: Reduce MAP by max 25% in first hour only — rapid reduction causes watershed ischemia", time: "10 min", color: "bg-orange-600" },
      { step: "5", action: "IV Labetalol 0.2–1 mg/kg/dose (max 40mg) slow IV push over 2 min; or 0.25–3 mg/kg/hr infusion (contraindicated in asthma, heart block)", time: "10–15 min", color: "bg-orange-500" },
      { step: "6", action: "OR IV Nicardipine 0.5–5 mcg/kg/min (preferred in hypertensive encephalopathy, PRES, post-surgical)", time: "10–15 min", color: "bg-amber-600" },
      { step: "7", action: "Hypertensive encephalopathy/PRES: IV MgSO4 if seizures; anti-epileptics; urgent MRI brain", time: "20 min", color: "bg-yellow-600" },
      { step: "8", action: "Once BP controlled — transition to oral antihypertensives. Identify and treat cause", time: "2–6 hours", color: "bg-green-600" },
    ],
    drugs: [
      { name: "Labetalol", dose: "0.2–1 mg/kg/dose (max 40mg)", route: "IV bolus over 2 min OR infusion 0.25–3 mg/kg/hr", duration: "Titrate", purpose: "First-line in most HTN emergency" },
      { name: "Nicardipine", dose: "0.5–5 mcg/kg/min", route: "IV infusion", duration: "Continuous, titrate", purpose: "PRES, post-surgical, renal HTN" },
      { name: "Sodium Nitroprusside", dose: "0.3–10 mcg/kg/min", route: "IV infusion (light-protected)", duration: "Titrate — max 72h due to cyanide toxicity", purpose: "Refractory, hypertensive urgency" },
      { name: "Hydralazine", dose: "0.1–0.5 mg/kg (max 20mg)", route: "IV every 4–6h", duration: "PRN", purpose: "Renal causes, eclampsia" },
      { name: "Enalaprilat", dose: "5–10 mcg/kg/dose", route: "IV over 5 min", duration: "Every 6–8h", purpose: "Renal parenchymal, renin-mediated HTN" },
    ],
    monitoring: ["Continuous arterial BP monitoring (arterial line preferred)", "Hourly urine output", "Neurological checks every 30 min", "ECG monitoring", "Glucose every 2–4h"],
    pitfalls: [
      "NEVER reduce BP faster than 25% in first hour — risk of stroke, visual loss",
      "Nifedipine sublingual is CONTRAINDICATED — unpredictable drop, fatal strokes reported",
      "Labetalol contraindicated in asthma, severe bradycardia, 2nd/3rd degree heart block",
      "PRES: MRI > CT; DWI usually spared in PRES unlike ischemic stroke"
    ]
  },
  {
    id: "pulmonary-edema",
    title: "Pulmonary Edema / Fluid Overload",
    icon: Droplet,
    color: "bg-blue-700",
    severity: "EMERGENCY",
    summary: "Severe fluid overload with respiratory compromise in AKI/CKD/NS",
    icu_triggers: ["SpO2 <92% on room air", "RR >40/min (age-adjusted)", "Chest X-ray: bilateral alveolar opacities", "Unable to lie flat (orthopnea)", "Heart rate >160/min"],
    algorithm: [
      { step: "1", action: "Sit up, high-flow oxygen by mask — target SpO2 >95%", time: "0 min", color: "bg-red-600" },
      { step: "2", action: "IV Furosemide 2–4 mg/kg IV stat (double usual dose) — aggressive diuresis", time: "1–2 min", color: "bg-red-500" },
      { step: "3", action: "Restrict all IV fluids to maintenance minimum. Nasogastric drain if large residuals", time: "5 min", color: "bg-orange-600" },
      { step: "4", action: "Morphine 0.1 mg/kg IV (reduces preload, anxiolysis) — use cautiously", time: "10 min", color: "bg-amber-600" },
      { step: "5", action: "If BP adequate: GTN (glyceryl trinitrate) 0.5–5 mcg/kg/min IV — venodilation, reduce preload", time: "10 min", color: "bg-yellow-600" },
      { step: "6", action: "BiPAP/CPAP: if inadequate response to above, reduces work of breathing", time: "15 min", color: "bg-blue-600" },
      { step: "7", action: "Intubation if: respiratory failure, GCS <8, refractory hypoxia", time: "20+ min", color: "bg-blue-700" },
      { step: "8", action: "Emergency dialysis/ultrafiltration: if oliguria + refractory overload", time: "30+ min", color: "bg-purple-600" },
    ],
    drugs: [
      { name: "Furosemide", dose: "2–4 mg/kg IV (max 200mg)", route: "IV bolus stat", duration: "Can repeat in 4–6h or infusion 0.1–1 mg/kg/hr", purpose: "Diuresis — primary intervention" },
      { name: "GTN (Nitroglycerin)", dose: "0.5–5 mcg/kg/min", route: "IV infusion", duration: "Continuous, titrate to BP", purpose: "Preload reduction, vasodilation" },
      { name: "Morphine", dose: "0.05–0.1 mg/kg", route: "IV slow", duration: "PRN", purpose: "Anxiolysis, reduce respiratory drive/preload" },
      { name: "Dobutamine", dose: "2.5–20 mcg/kg/min", route: "IV infusion", duration: "Continuous if cardiogenic", purpose: "Cardiogenic pulmonary edema only" },
    ],
    monitoring: ["SpO2 continuous", "RR every 15 min", "Fluid balance (urine output hourly, restrict input)", "CXR in 2–4h", "ABG if BiPAP/intubated"],
    pitfalls: [
      "Furosemide failure in severe AKI (GFR <10) — early dialysis decision",
      "Do NOT give fluid bolus in cardiogenic edema — will worsen",
      "BiPAP is preferred over intubation if patient cooperative",
      "Hyponatremia can worsen with aggressive diuresis — monitor electrolytes"
    ]
  },
  {
    id: "metabolic-acidosis",
    title: "Severe Metabolic Acidosis",
    icon: Activity,
    color: "bg-purple-700",
    severity: "URGENT",
    summary: "pH <7.2 or HCO3 <10 mEq/L with clinical compromise",
    icu_triggers: ["pH <7.1", "HCO3 <8 mEq/L", "Compensatory hyperpnea (Kussmaul breathing)", "Hemodynamic instability", "Altered consciousness"],
    algorithm: [
      { step: "1", action: "ABG + electrolytes stat. Calculate AG = Na - (Cl + HCO3). Normal AG = 8–12", time: "0 min", color: "bg-red-600" },
      { step: "2", action: "If high AG: causes include Lactic acidosis (MUDPILES), Ketoacidosis, Uremia, Salicylates, Methanol, Ethylene glycol", time: "2 min", color: "bg-red-500" },
      { step: "3", action: "Treat underlying cause (DKA → insulin+glucose; sepsis → antibiotics; hyperphosphatemia → binders)", time: "5 min", color: "bg-orange-600" },
      { step: "4", action: "IV NaHCO3: indicated if pH <7.2 + hemodynamic instability. Dose: HCO3 deficit = 0.3 × wt × (desired–actual HCO3). Give half over 4–6h", time: "10 min", color: "bg-amber-600" },
      { step: "5", action: "Ensure adequate ventilation — CO2 clearance critical for pH compensation", time: "15 min", color: "bg-yellow-600" },
      { step: "6", action: "Dialysis if: uremic acidosis, methanol/ethylene glycol poisoning, refractory acidosis", time: "30+ min", color: "bg-blue-600" },
    ],
    drugs: [
      { name: "NaHCO3 7.5%", dose: "Deficit-based: 0.3 × wt × (24 - HCO3 actual)", route: "IV slow infusion", duration: "Give 50% over 4h, reassess", purpose: "Acid-base correction (pH <7.2 + compromise)" },
      { name: "Insulin + Dextrose", dose: "0.1 u/kg insulin + 0.5 g/kg D25%", route: "IV", duration: "For DKA/hyperglycemic acidosis", purpose: "DKA management" },
    ],
    monitoring: ["ABG every 2–4h", "Electrolytes: Na, K, Ca after bicarb (Ca drops)", "Blood glucose", "Urine output", "Respiratory rate — compensation"],
    pitfalls: [
      "Bicarbonate therapy increases CO2 — ensure adequate ventilation or will worsen intracellularly",
      "Bicarb causes hypokalemia and hypocalcemia — monitor K and Ca",
      "DKA: bicarb NOT recommended unless pH <6.9",
      "Normal AG acidosis: think renal tubular acidosis, diarrhea, dilutional"
    ]
  },
  {
    id: "dialysis-emergency",
    title: "Dialysis Emergencies",
    icon: AlertTriangle,
    color: "bg-rose-700",
    severity: "CRITICAL",
    summary: "Life-threatening complications during or related to dialysis",
    icu_triggers: ["Intradialytic hypotension <70 mmHg systolic", "Dialysis disequilibrium — seizures/coma", "Air embolism", "Catheter-related sepsis with hemodynamic instability", "Circuit clotting in CRRT"],
    algorithm: [
      { step: "1 — Hypotension", action: "Stop UF immediately. Position Trendelenburg. 10–20 mL/kg NS bolus. Check blood pump speed, access, disconnection", time: "0 min", color: "bg-red-600" },
      { step: "2 — Disequilibrium", action: "Reduce blood flow rate by 50%. Hypertonic saline 3% (3–5 mL/kg) or mannitol 0.5 g/kg IV. Anti-epileptics if seizures", time: "0 min", color: "bg-red-600" },
      { step: "3 — Air embolism", action: "STOP pump immediately. Trendelenburg + LEFT lateral decubitus (trap air in RV). 100% O2, call for emergency", time: "0 min", color: "bg-red-600" },
      { step: "4 — Membrane reaction", action: "Anaphylaxis protocol: stop dialysis, do NOT return blood. Epinephrine 0.01 mg/kg IM", time: "0 min", color: "bg-red-600" },
      { step: "5 — Catheter sepsis", action: "Blood cultures from catheter + peripheral. Empirical antibiotics (Vancomycin 15 mg/kg + Gentamicin or Piperacillin-tazobactam). Consider catheter removal if unstable", time: "5 min", color: "bg-orange-600" },
      { step: "6 — CRRT clotting", action: "If filter life <8h: review anticoagulation, increase citrate/heparin, reposition catheter, check access pressures", time: "15 min", color: "bg-amber-600" },
    ],
    drugs: [
      { name: "Mannitol 20%", dose: "0.5 g/kg (max 25g)", route: "IV over 30 min", duration: "For disequilibrium/cerebral edema", purpose: "Osmotherapy — raise plasma osmolality" },
      { name: "NaCl 3%", dose: "3–5 mL/kg over 30 min", route: "IV", duration: "For disequilibrium or hyponatremia-related seizures", purpose: "Rapid osmolality correction" },
      { name: "Epinephrine 1:1000", dose: "0.01 mg/kg (max 0.5mg) IM", route: "IM thigh", duration: "Repeat every 5–15 min", purpose: "Anaphylaxis to membrane/dialysate" },
      { name: "Vancomycin", dose: "15 mg/kg (max 2g)", route: "IV over 1h", duration: "Every 6–12h (TDM guided)", purpose: "Gram-positive catheter sepsis" },
    ],
    monitoring: ["BP every 15 min during session", "ECG if chest pain/arrhythmia", "Fluid balance every hour", "Temperature every 2h", "Access pressures (venous, arterial) throughout"],
    pitfalls: [
      "Disequilibrium syndrome: first HD in severe uremia — use short sessions, slow blood flow",
      "Do NOT return blood in air embolism — fatal air bolus to pulmonary circulation",
      "Catheter sepsis: Staph aureus bacteremia requires 4 weeks antibiotics even if catheter removed",
      "Hypotension on HD: assess dry weight, interdialytic weight gain, cardiac function"
    ]
  },
  {
    id: "sepsis-aki",
    title: "Sepsis-associated AKI",
    icon: Brain,
    color: "bg-red-600",
    severity: "CRITICAL",
    summary: "AKI in the context of sepsis/septic shock — Surviving Sepsis Bundle",
    icu_triggers: ["Lactate >2 mmol/L", "Persistent hypotension after 30 mL/kg fluid", "Urine output <0.5 mL/kg/h despite resuscitation", "AKI Stage 2–3", "Vasopressor requirement"],
    algorithm: [
      { step: "1 (0–1h)", action: "Blood cultures × 2 (before antibiotics). Lactate, ABG, FBC, CRP, procalcitonin, creatinine", time: "0 min", color: "bg-red-600" },
      { step: "2 (1h)", action: "Broad-spectrum IV antibiotics within 1 hour. Do NOT delay for cultures if unstable", time: "0–30 min", color: "bg-red-600" },
      { step: "3 (1–3h)", action: "IV fluid resuscitation: 10–20 mL/kg crystalloid boluses. Reassess after each bolus (JVP, cap refill, BP, HR, UO)", time: "30–60 min", color: "bg-orange-600" },
      { step: "4 (3–6h)", action: "If MAP <65 despite fluids → start norepinephrine. Reassess lactate at 2h. Target: MAP ≥65, UO >0.5 mL/kg/h", time: "1–3h", color: "bg-amber-600" },
      { step: "5", action: "Avoid nephrotoxins: NSAIDs, aminoglycosides, contrast, ACE-i during acute phase", time: "Ongoing", color: "bg-yellow-600" },
      { step: "6", action: "RRT indications: K >6.5, pH <7.1, refractory fluid overload, uremic complications", time: "6–24h", color: "bg-blue-600" },
    ],
    drugs: [
      { name: "Piperacillin-tazobactam", dose: "100 mg/kg/dose (pip) q6–8h (max 4.5g/dose)", route: "IV over 30 min", duration: "Per culture sensitivity", purpose: "Broad gram-negative + anaerobic cover" },
      { name: "Vancomycin", dose: "15–20 mg/kg/dose q6–8h", route: "IV over 1h", duration: "TDM guided (trough 15–20)", purpose: "MRSA / gram-positive cover" },
      { name: "Norepinephrine", dose: "0.1–2 mcg/kg/min", route: "IV infusion (central line)", duration: "Titrate to MAP ≥65", purpose: "Vasopressor for septic shock" },
      { name: "Dopamine (renal dose)", dose: "AVOID — not evidence-based for renal protection in sepsis", route: "N/A", duration: "N/A", purpose: "Discredited for renal protection" },
    ],
    monitoring: ["Continuous BP (arterial line if vasopressors)", "Lactate at 2h, 6h", "Urine output hourly", "Creatinine/electrolytes 6–12h", "Blood cultures results", "CXR daily if ventilated"],
    pitfalls: [
      "Low-dose dopamine does NOT protect kidneys in sepsis — evidence discredited (ANZICS trial)",
      "Overzealous fluid resuscitation → fluid overload, worse AKI, increased mortality",
      "Aminoglycosides: avoid or single dose only in sepsis with AKI",
      "AKI in sepsis: often multifactorial — consider hemodynamic, nephrotoxic, obstructive"
    ]
  },
  {
    id: "tls",
    title: "Tumor Lysis Syndrome",
    icon: Zap,
    color: "bg-yellow-700",
    severity: "URGENT",
    summary: "Rapid cell lysis → hyperkalemia, hyperuricemia, hyperphosphatemia, hypocalcemia, AKI",
    icu_triggers: ["K⁺ >6.0 mEq/L", "Uric acid >8 mg/dL", "Creatinine rising >1.5× baseline", "Oliguria / anuria", "Symptomatic hypocalcemia (tetany, seizures, QT prolongation)"],
    algorithm: [
      { step: "1 — Prevention", action: "In high-risk patients (Burkitt, ALL, high WBC): start allopurinol 12h before chemo. Aggressive IV hydration 3L/m²/day 24–48h pre-chemo", time: "Pre-treatment", color: "bg-green-600" },
      { step: "2", action: "Labs monitoring: K, phosphate, calcium, uric acid, creatinine q4–6h in high-risk", time: "Ongoing", color: "bg-blue-600" },
      { step: "3", action: "Hyperkalemia: see hyperkalemia protocol. Avoid calcium if phosphate >8 (metastatic calcification risk)", time: "0 min if K high", color: "bg-red-600" },
      { step: "4", action: "Hyperuricemia: Rasburicase 0.15–0.2 mg/kg IV once (NOT if G6PD deficiency). Contraindicated with allopurinol — stop first", time: "0 min if uric high", color: "bg-orange-600" },
      { step: "5", action: "Hyperphosphatemia: phosphate binders (calcium carbonate with meals), restrict dietary phosphate", time: "Ongoing", color: "bg-amber-600" },
      { step: "6", action: "Symptomatic hypocalcemia ONLY: calcium gluconate. Avoid if phosphate very high", time: "PRN", color: "bg-yellow-600" },
      { step: "7", action: "AKI + oliguria: aggressive hydration. If anuric → emergency dialysis (HD removes uric acid and phosphate better than PD)", time: "As needed", color: "bg-blue-600" },
    ],
    drugs: [
      { name: "Allopurinol", dose: "10 mg/kg/day in 3 divided doses (max 300mg/day)", route: "PO", duration: "Start 24–48h before chemo, continue 3–7 days", purpose: "Uric acid synthesis inhibition (prevention)" },
      { name: "Rasburicase (Uricase)", dose: "0.15–0.2 mg/kg once IV", route: "IV over 30 min", duration: "Single dose usually sufficient", purpose: "Rapid uric acid degradation (treatment)" },
      { name: "Calcium gluconate 10%", dose: "0.5–1 mL/kg (max 20mL)", route: "IV slow push", duration: "Only for SYMPTOMATIC hypocalcemia", purpose: "Symptomatic hypocalcemia" },
    ],
    monitoring: ["K, phosphate, calcium, uric acid, creatinine q4–6h", "Urine output hourly", "Cardiac monitoring if K >5.5", "ECG for QT prolongation (hypocalcemia)", "Fluid balance"],
    pitfalls: [
      "Rasburicase causes hemolysis in G6PD deficiency — always check or screen before giving",
      "Allopurinol and rasburicase MUST NOT be given simultaneously",
      "Calcium in high phosphate → metastatic calcification (avoid unless symptomatic tetany/seizures)",
      "Alkalinization of urine is now NOT recommended — may worsen xanthine and phosphate crystalluria"
    ]
  },
  {
    id: "hypernatremia",
    title: "Hypernatremic Dehydration",
    icon: Droplet,
    color: "bg-cyan-700",
    severity: "URGENT",
    summary: "Na >150 mEq/L — cerebral risk with rapid correction (cerebral edema) or rapid dehydration (venous thrombosis)",
    icu_triggers: ["Na >170 mEq/L", "Seizures with hypernatremia", "Altered consciousness / coma", "Neonatal hypernatremia", "Rapid Na rise >10 mEq/L in any 24h period"],
    algorithm: [
      { step: "1", action: "Confirm Na and assess severity. Calculate water deficit: 4 mL/kg × wt × (actual Na – 145)", time: "0 min", color: "bg-red-600" },
      { step: "2", action: "CRITICAL RULE: Correct Na at MAX 0.5 mEq/L/hr or 10–12 mEq/L per 24h. Never faster — cerebral edema risk", time: "Ongoing", color: "bg-red-600" },
      { step: "3", action: "Calculate total correction time: If Na = 160 → need to correct 15 mEq, at 0.5/hr = minimum 30h", time: "Before starting", color: "bg-orange-600" },
      { step: "4", action: "Mild (Na 150–159, awake, tolerating feeds): oral rehydration (breast milk or oral rehydration solution) preferred. Total fluid over 48h", time: "Gradual", color: "bg-yellow-600" },
      { step: "5", action: "Moderate-severe (Na ≥160, vomiting, lethargic): IV 0.45% NaCl (or 0.9% initially if shocked). Volume resuscitation first if hemodynamically unstable", time: "Urgent", color: "bg-orange-600" },
      { step: "6", action: "Severe (Na ≥170, neurologically compromised): IV 0.9% NaCl for hemodynamics, then switch to hypotonic once stable", time: "Emergency", color: "bg-red-600" },
      { step: "7", action: "Monitor Na every 4–6h. Adjust rate if correcting too fast or slow", time: "Ongoing", color: "bg-blue-600" },
      { step: "8", action: "Identify cause: inadequate feeds (breastfeeding failure), diabetes insipidus, increased losses (diarrhea, burns), sodium overload", time: "Parallel", color: "bg-green-600" },
    ],
    drugs: [
      { name: "0.9% NaCl (Normal Saline)", dose: "10 mL/kg bolus if shocked (repeat once)", route: "IV", duration: "For hemodynamic resuscitation ONLY", purpose: "Volume restoration when shocked" },
      { name: "0.45% NaCl + 5% Dextrose", dose: "Calculated fluid rate based on deficit + maintenance", route: "IV", duration: "Over 48–72h (total)", purpose: "Maintenance + deficit replacement for moderate hypernatremia" },
      { name: "DDAVP", dose: "0.1–0.4 mcg/kg intranasal", route: "Intranasal or IV", duration: "Per central DI management", purpose: "Central DI as cause of hypernatremia" },
    ],
    monitoring: ["Na every 4–6h (target rate ≤0.5 mEq/L/hr)", "Neurological status every 2h", "Urine output and specific gravity hourly", "Weight twice daily", "Blood glucose (if D5 in IV fluids)"],
    pitfalls: [
      "Rapid Na correction = cerebral edema — worse outcome than hypernatremia itself",
      "Hypotonic fluids alone for shocked hypernatremic child — restore volume first with NS",
      "Neonates: commonest cause is inadequate breastfeeding — check feeding history",
      "DI in hypernatremia: will not correct with IV fluids alone — need DDAVP"
    ]
  }
];

const SEVERITY_COLORS = {
  CRITICAL: "bg-red-600",
  EMERGENCY: "bg-orange-600",
  URGENT: "bg-amber-600"
};

export default function EmergencyHub() {
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("algorithm");

  const protocol = selected ? PROTOCOLS.find(p => p.id === selected) : null;
  const filtered = PROTOCOLS.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.summary.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-slate-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 rounded-2xl bg-gradient-to-r from-red-700 via-red-600 to-orange-600 p-6 text-white shadow-2xl">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-9 h-9" />
            <div>
              <h1 className="text-3xl font-bold">Emergency & ICU Hub</h1>
              <p className="text-red-100 text-sm mt-0.5">Rapid-access protocols — Hyperkalemia · HTN Emergency · Pulmonary Edema · TLS · Dialysis Emergencies</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            {PROTOCOLS.map(p => (
              <button
                key={p.id}
                onClick={() => { setSelected(p.id); setActiveTab("algorithm"); }}
                className={`text-xs px-3 py-1 rounded-full border border-white/30 transition-all ${selected === p.id ? "bg-white text-red-700 font-bold" : "bg-white/20 hover:bg-white/30 text-white"}`}
              >
                {p.title}
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        {!protocol && (
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input className="pl-10 bg-white border-2" placeholder="Search protocols..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        )}

        {!protocol ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(p => {
              const Icon = p.icon;
              return (
                <Card
                  key={p.id}
                  onClick={() => { setSelected(p.id); setActiveTab("algorithm"); }}
                  className="cursor-pointer hover:shadow-xl transition-all duration-200 border-2 hover:border-red-400 group"
                >
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3 mb-3">
                      <div className={`w-12 h-12 ${p.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-md flex-shrink-0`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-slate-900 text-base">{p.title}</h3>
                          <Badge className={`text-xs text-white ${SEVERITY_COLORS[p.severity]}`}>{p.severity}</Badge>
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-2">{p.summary}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{p.algorithm.length} steps · {p.drugs.length} drugs · {p.icu_triggers.length} ICU triggers</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div>
            <Button variant="outline" onClick={() => setSelected(null)} className="mb-4 gap-2">
              <ArrowLeft className="w-4 h-4" /> Back to All Protocols
            </Button>

            <div className="grid lg:grid-cols-4 gap-6">
              {/* Sidebar */}
              <div className="lg:col-span-1">
                <Card className="sticky top-4">
                  <CardContent className="p-3">
                    <div className={`${protocol.color} rounded-xl p-4 text-white mb-3`}>
                      <Badge className="bg-white/30 text-white text-xs mb-2">{protocol.severity}</Badge>
                      <h2 className="font-bold text-xl">{protocol.title}</h2>
                      <p className="text-xs mt-1 opacity-90">{protocol.summary}</p>
                    </div>

                    <div className="space-y-1">
                      {[
                        { key: "algorithm", label: "Algorithm", icon: Activity },
                        { key: "drugs", label: "Emergency Drugs", icon: Pill },
                        { key: "triggers", label: "ICU Triggers", icon: AlertTriangle },
                        { key: "monitoring", label: "Monitoring", icon: ListChecks },
                        { key: "pitfalls", label: "Pitfalls", icon: CheckSquare },
                      ].map(tab => (
                        <button
                          key={tab.key}
                          onClick={() => setActiveTab(tab.key)}
                          className={`w-full text-left flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.key ? "bg-red-600 text-white" : "hover:bg-slate-100 text-slate-700"}`}
                        >
                          <tab.icon className="w-4 h-4 flex-shrink-0" />
                          {tab.label}
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Content */}
              <div className="lg:col-span-3">
                <Card>
                  <CardContent className="p-6">
                    {activeTab === "algorithm" && (
                      <div className="space-y-3">
                        <h3 className="font-bold text-lg text-slate-900 mb-4 flex items-center gap-2">
                          <Activity className="w-5 h-5 text-red-600" /> Step-by-Step Algorithm
                        </h3>
                        {protocol.algorithm.map((step, i) => (
                          <div key={i} className="flex gap-3">
                            <div className={`${step.color} text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5`}>
                              {i + 1}
                            </div>
                            <div className="flex-1 bg-slate-50 rounded-xl p-3 border border-slate-200">
                              <div className="flex items-center gap-2 mb-1">
                                <Clock className="w-3.5 h-3.5 text-slate-400" />
                                <span className="text-xs font-semibold text-slate-500">{step.time}</span>
                              </div>
                              <p className="text-sm text-slate-800">{step.action}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {activeTab === "drugs" && (
                      <div>
                        <h3 className="font-bold text-lg text-slate-900 mb-4 flex items-center gap-2">
                          <Pill className="w-5 h-5 text-red-600" /> Emergency Drugs
                        </h3>
                        <div className="space-y-3">
                          {protocol.drugs.map((drug, i) => (
                            <div key={i} className="bg-red-50 border border-red-200 rounded-xl p-4">
                              <div className="flex items-start justify-between mb-2">
                                <h4 className="font-bold text-red-900">{drug.name}</h4>
                                <Badge className="bg-red-100 text-red-700 text-xs">{drug.route}</Badge>
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-xs text-slate-700">
                                <div><span className="font-semibold">Dose:</span> {drug.dose}</div>
                                <div><span className="font-semibold">Duration:</span> {drug.duration}</div>
                              </div>
                              <p className="text-xs text-red-700 mt-2 font-medium">{drug.purpose}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {activeTab === "triggers" && (
                      <div>
                        <h3 className="font-bold text-lg text-slate-900 mb-4 flex items-center gap-2">
                          <AlertTriangle className="w-5 h-5 text-red-600" /> ICU Transfer Triggers
                        </h3>
                        <div className="space-y-2">
                          {protocol.icu_triggers.map((t, i) => (
                            <div key={i} className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                              <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
                              <span className="text-sm font-medium text-red-800">{t}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {activeTab === "monitoring" && (
                      <div>
                        <h3 className="font-bold text-lg text-slate-900 mb-4 flex items-center gap-2">
                          <ListChecks className="w-5 h-5 text-blue-600" /> Monitoring Checklist
                        </h3>
                        <div className="space-y-2">
                          {protocol.monitoring.map((m, i) => (
                            <div key={i} className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
                              <CheckSquare className="w-4 h-4 text-blue-600 flex-shrink-0" />
                              <span className="text-sm text-blue-800">{m}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {activeTab === "pitfalls" && (
                      <div>
                        <h3 className="font-bold text-lg text-slate-900 mb-4 flex items-center gap-2">
                          <CheckSquare className="w-5 h-5 text-amber-600" /> Common Pitfalls
                        </h3>
                        <div className="space-y-2">
                          {protocol.pitfalls.map((p, i) => (
                            <div key={i} className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
                              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                              <span className="text-sm text-amber-900">{p}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}