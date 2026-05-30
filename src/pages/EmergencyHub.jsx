import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertTriangle, Activity, Zap, Droplet, Heart, Brain, Search,
  ChevronRight, Clock, Pill, ArrowLeft, CheckSquare, ListChecks, Wind
} from "lucide-react";
import VoiceDictation from "@/components/VoiceDictation";

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
    summary: "BP ≥95th+12 mmHg (<13y) or ≥140/90 (≥13y) with end-organ damage (encephalopathy, seizure, retinal changes)",
    icu_triggers: ["Seizures/altered consciousness with HTN", "Papilledema / retinal hemorrhage", "Acute pulmonary edema + HTN", "Acute LV dysfunction", "Suspected aortic dissection"],
    algorithm: [
      { step: "1", action: "Confirm BP in both arms, correct cuff size; repeat in 5 min", time: "0 min", color: "bg-slate-600" },
      { step: "2", action: "Rapid neurological assessment — GCS, pupils, fundoscopy (PRES?)", time: "2 min", color: "bg-red-600" },
      { step: "3", action: "Establish IV access. ECG, CXR, echo if available. Labs: CBC, creatinine, electrolytes, urine dipstick", time: "5 min", color: "bg-red-500" },
      { step: "4", action: "GOAL: Reduce MAP by ≤25% in first hour — this is the UPPER LIMIT of safe reduction, NOT a target to reach. Any faster reduction risks watershed ischaemia and stroke. Do NOT aim to hit 25% — aim for a controlled, gradual reduction.", time: "10 min", color: "bg-orange-600" },
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
      "MAP reduction ≤25% in first hour is an UPPER LIMIT, NOT a target — reducing MAP by exactly 25% can itself cause ischaemia. Reduce gradually and titrate to clinical response",
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
    id: "rpgn",
    title: "RPGN — Rapidly Progressive GN",
    icon: AlertTriangle,
    color: "bg-red-800",
    severity: "CRITICAL",
    summary: "Creatinine doubling within days + red cell casts = NEPHROLOGY EMERGENCY — do NOT wait for biopsy to start treatment",
    icu_triggers: ["Creatinine doubling within days to weeks", "Red cell casts on urine microscopy", "Oliguria or anuria", "Haemoptysis (pulmonary-renal syndrome)", "Rapidly rising serum creatinine despite fluids"],
    algorithm: [
      { step: "1", action: "NEPHROLOGY EMERGENCY — call nephrology NOW. Do NOT wait for biopsy before starting treatment", time: "0 min", color: "bg-red-700" },
      { step: "2", action: "Urine microscopy STAT — red cell casts confirm glomerular haematuria. Urine protein:creatinine ratio", time: "0 min", color: "bg-red-600" },
      { step: "3", action: "SAME DAY blood tests: ANCA (MPO + PR3), anti-GBM antibodies, ANA, anti-dsDNA, C3/C4, ASO, ASCA, hepatitis B&C, HIV. Do NOT delay for results", time: "0–30 min", color: "bg-red-600" },
      { step: "4", action: "IV Methylprednisolone pulse: 10–30 mg/kg/day (max 1g) for 3 days, then oral prednisolone 1–2 mg/kg/day", time: "1 h", color: "bg-orange-600" },
      { step: "5", action: "Organise URGENT renal biopsy — within 24h if possible. Crescentic GN on biopsy confirms RPGN", time: "24 h", color: "bg-amber-600" },
      { step: "6", action: "If ANCA-positive or anti-GBM positive: add cyclophosphamide IV 500–750 mg/m² monthly (pulsed) or PO 2 mg/kg/day", time: "24–48 h", color: "bg-yellow-700" },
      { step: "7", action: "Plasma exchange: INDICATED for anti-GBM disease OR ANCA-vasculitis with pulmonary haemorrhage or severe AKI requiring dialysis", time: "Urgent if indicated", color: "bg-blue-700" },
      { step: "8", action: "Renal replacement therapy if AKI severe (K >6.5, pH <7.1, fluid overload). Do NOT delay treatment for biopsy", time: "As needed", color: "bg-blue-600" },
    ],
    drugs: [
      { name: "Methylprednisolone IV pulse", dose: "10–30 mg/kg/day (max 1g/day)", route: "IV over 30–60 min", duration: "3 days, then oral prednisolone", purpose: "Immediate anti-inflammatory — do not delay" },
      { name: "Cyclophosphamide (pulsed)", dose: "500–750 mg/m² IV monthly OR 2 mg/kg/day PO", route: "IV / PO", duration: "3–6 months depending on response", purpose: "ANCA vasculitis, anti-GBM disease" },
      { name: "Rituximab", dose: "375 mg/m² weekly × 4 OR 2 × 1g", route: "IV infusion", duration: "Alternative to cyclophosphamide in ANCA-AAV", purpose: "ANCA-AAV — non-inferior to CYC, preferred if fertility concerns" },
      { name: "Prednisolone", dose: "1–2 mg/kg/day (max 60mg)", route: "PO", duration: "Taper over 6–12 months", purpose: "Maintenance immunosuppression after pulse" },
    ],
    monitoring: ["Creatinine daily while on pulse steroids", "Urine output hourly", "BP 4-hourly", "Blood glucose daily (steroid hyperglycaemia)", "ANCA titres at 3 and 6 months", "Urinalysis weekly"],
    pitfalls: [
      "NEVER delay steroids waiting for biopsy in RPGN — days matter, kidneys lost",
      "Anti-GBM disease: linear IgG on biopsy — requires PLASMA EXCHANGE daily × 14 days, NOT optional",
      "Check ANCA and anti-GBM on the SAME DAY — treatment differs: pauci-immune vs anti-GBM vs immune complex GN",
      "Plasmapheresis contraindicated with active haemorrhage — use FFP as replacement fluid if pulmonary haemorrhage"
    ]
  },
  {
    id: "antigbm",
    title: "Anti-GBM Disease / Goodpasture",
    icon: AlertTriangle,
    color: "bg-red-900",
    severity: "CRITICAL",
    summary: "Linear IgG on biopsy + haemoptysis = EMERGENCY. Plasma exchange DAILY × 14 days mandatory.",
    icu_triggers: ["Haemoptysis (any amount)", "Anti-GBM antibody positive", "Rapidly rising creatinine + haematuria", "Pulmonary-renal syndrome", "Bilateral pulmonary infiltrates on CXR"],
    algorithm: [
      { step: "1", action: "LIFE-THREATENING EMERGENCY — dual pulmonary and renal involvement. Admit ICU immediately if haemoptysis present", time: "0 min", color: "bg-red-700" },
      { step: "2", action: "Anti-GBM antibody STAT. Renal biopsy urgently — linear IgG on immunofluorescence confirms diagnosis", time: "0–2 h", color: "bg-red-600" },
      { step: "3", action: "IV Methylprednisolone 10–30 mg/kg (max 1g) × 3 days — do NOT wait for biopsy", time: "0–1 h", color: "bg-red-600" },
      { step: "4", action: "PLASMA EXCHANGE daily for 14 days (or until anti-GBM antibody undetectable). Volume: 4L per session in adults, 50 mL/kg in children. Replacement: 5% albumin; use FFP if pulmonary haemorrhage active (clotting factors preserved)", time: "Day 1", color: "bg-orange-700" },
      { step: "5", action: "Cyclophosphamide 2 mg/kg/day PO (reduce in renal failure). Continue until remission (3–6 months)", time: "Day 1", color: "bg-orange-600" },
      { step: "6", action: "Oral prednisolone 1 mg/kg/day after pulse, taper over 6–9 months", time: "Day 4", color: "bg-amber-600" },
      { step: "7", action: "Monitor anti-GBM titre every 2 weeks — aim for undetectable. Discontinue plasma exchange once negative", time: "Ongoing", color: "bg-yellow-600" },
      { step: "8", action: "Renal replacement therapy if needed — recovery less likely if >80% crescents on biopsy + dialysis-dependent at presentation", time: "As indicated", color: "bg-blue-700" },
    ],
    drugs: [
      { name: "Methylprednisolone IV", dose: "10–30 mg/kg (max 1g) × 3 days", route: "IV over 30–60 min", duration: "3 days pulse, then oral", purpose: "Suppress active inflammation urgently" },
      { name: "Cyclophosphamide", dose: "2 mg/kg/day PO (reduce by 25–50% if GFR <30)", route: "PO daily", duration: "3–6 months", purpose: "Suppress autoantibody production" },
      { name: "Plasma exchange fluid — Albumin 5%", dose: "50 mL/kg exchange volume per session", route: "Via central access", duration: "Daily × 14 days (or until anti-GBM negative)", purpose: "Remove circulating anti-GBM antibodies" },
      { name: "Fresh Frozen Plasma (FFP)", dose: "Replace last 2L of each session with FFP", route: "IV", duration: "While pulmonary haemorrhage active", purpose: "Preserve clotting factors during active haemoptysis" },
    ],
    monitoring: ["Anti-GBM antibody titre every 2 weeks", "Daily creatinine", "Daily urine haemoglobin / haematuria", "SpO2 continuous if pulmonary involvement", "Coagulation profile if on FFP replacement", "Urinalysis + protein:creatinine weekly"],
    pitfalls: [
      "Plasma exchange with ALBUMIN ONLY during active haemoptysis → coagulopathy and MORE bleeding — ALWAYS use FFP if haemoptysis",
      "Anti-GBM disease rarely responds to steroids alone — plasma exchange is NOT optional",
      "Goodpasture syndrome = pulmonary + renal; anti-GBM nephritis = renal only — both require same treatment",
      "Smoking cessation mandatory — smoking precipitates pulmonary haemorrhage in anti-GBM disease"
    ]
  },
  {
    id: "tma-ahus",
    title: "aHUS / TMA Emergency",
    icon: Droplet,
    color: "bg-rose-800",
    severity: "CRITICAL",
    summary: "TMA triad: MAHA + thrombocytopenia + AKI. DO NOT transfuse platelets. Anti-FH commonest cause in India.",
    icu_triggers: ["MAHA (fragmented RBCs / schistocytes on blood film)", "Thrombocytopenia + AKI", "Falling Hb + rising LDH + low haptoglobin", "Oliguria / anuria with TMA picture", "Neurological symptoms (seizure, confusion) with TMA"],
    algorithm: [
      { step: "1", action: "CONFIRM TMA: Blood film for schistocytes, LDH, haptoglobin, reticulocyte count, direct Coombs test (usually negative in TMA)", time: "0 min", color: "bg-red-700" },
      { step: "2", action: "SAME DAY investigations: ADAMTS13 activity (for TTP), ANCA, anti-GBM, stool STEC PCR (E.coli O157:H7, O26), complement screen (C3, C4, CH50, CFH, CFI, MCP), anti-CFH antibody", time: "0–1 h", color: "bg-red-600" },
      { step: "3", action: "DO NOT transfuse platelets unless <10,000/µL or life-threatening haemorrhage — platelet transfusion WORSENS TMA (fuels microthrombi)", time: "Immediate caution", color: "bg-red-600" },
      { step: "4", action: "Anti-CFH antibody: commonest cause of aHUS in India (ISPN 2025). If positive: PLASMA EXCHANGE 1.5× volume daily until antibody undetectable + prednisolone + mycophenolate/rituximab", time: "1 h", color: "bg-orange-700" },
      { step: "5", action: "If anti-CFH pending and severe TMA: START plasma exchange empirically (treats anti-CFH AND supplies CFH)", time: "2–4 h", color: "bg-orange-600" },
      { step: "6", action: "Eculizumab: if genetic aHUS confirmed (C3/CFH/CFI/MCP/CFB mutation) OR anti-CFH negative + severe TMA not responding to plasma exchange. Dose: 900mg weekly × 4, then 1200mg q2wk (adult dosing; weight-based in children)", time: "If indicated", color: "bg-amber-700" },
      { step: "7", action: "RRT if AKI severe — HD or CRRT. Avoid PD in acute TMA (abdominal microthrombi risk)", time: "As needed", color: "bg-blue-600" },
      { step: "8", action: "Monitor: platelet count, LDH, Hb, creatinine DAILY. TMA response = rising platelets + falling LDH", time: "Daily", color: "bg-blue-500" },
    ],
    drugs: [
      { name: "Plasma (FFP / Octaplas)", dose: "25–30 mL/kg/session infusion OR exchange at 1.5× plasma volume", route: "IV via central access", duration: "Daily until platelet count sustained >150,000 and LDH normalising", purpose: "Supplies functional CFH; removes anti-CFH antibody (during exchange)" },
      { name: "Eculizumab", dose: "Weight-based: <10kg: 300mg wk1, 300mg wk2, 300mg wk3, 300mg q3wk maintenance", route: "IV infusion over 35 min", duration: "Ongoing for genetic aHUS; 6–12 months for anti-CFH aHUS", purpose: "Terminal complement inhibition (C5 blocker) for genetic/refractory aHUS" },
      { name: "Prednisolone", dose: "1–2 mg/kg/day", route: "PO", duration: "Taper over 6–12 months", purpose: "Suppress anti-CFH antibody production" },
      { name: "Mycophenolate mofetil", dose: "600 mg/m²/dose BD", route: "PO", duration: "12–24 months for anti-CFH aHUS", purpose: "Prevent anti-CFH antibody relapse" },
    ],
    monitoring: ["Platelet count DAILY (target >150,000 = TMA response)", "LDH daily — falls before platelet rise", "Blood film for schistocytes every 48h", "Creatinine and urine output daily", "Anti-CFH titre every 2 weeks", "Monitor for meningococcal infection if on eculizumab (vaccinate before starting)"],
    pitfalls: [
      "NEVER transfuse platelets empirically in TMA — can trigger catastrophic clotting",
      "Anti-CFH is the COMMONEST cause of paediatric aHUS in India — always send anti-CFH on day 1",
      "STEC-HUS and aHUS look identical at presentation — STEC PCR stool is mandatory to differentiate (management differs completely)",
      "Eculizumab without meningococcal vaccination = high risk of fatal meningococcal sepsis — vaccinate urgently (or use prophylactic penicillin V if vaccine unavailable)"
    ]
  },
  {
    id: "stec-hus",
    title: "STEC-HUS (Bloody Diarrhoea)",
    icon: AlertTriangle,
    color: "bg-orange-800",
    severity: "CRITICAL",
    summary: "Bloody diarrhoea + TMA. NEVER give antibiotics (increases Shiga toxin). NEVER transfuse platelets. IV fluids EARLY.",
    icu_triggers: ["Bloody diarrhoea + falling Hb + thrombocytopenia", "Oliguria or anuria following diarrhoeal illness", "Creatinine rising acutely", "Neurological symptoms (seizure, encephalopathy) in HUS", "Platelet count <80,000 + schistocytes"],
    algorithm: [
      { step: "1", action: "CONFIRM: Blood film for schistocytes + LDH + haptoglobin + direct Coombs. Stool STEC PCR (O157:H7, O26, O111, O103) SAME DAY — mandatory", time: "0 min", color: "bg-red-600" },
      { step: "2", action: "IV FLUIDS EARLY — this is the single most evidence-based intervention in STEC-HUS. Start isotonic saline 10–20 mL/kg bolus then maintain generous hydration BEFORE oliguria develops", time: "0 min", color: "bg-red-600" },
      { step: "3", action: "DO NOT GIVE ANTIBIOTICS — antibiotics lyse STEC bacteria → massive Shiga toxin (Stx2) release → worsens HUS and increases neurological complications. ABSOLUTE contraindication", time: "Ongoing", color: "bg-red-700" },
      { step: "4", action: "DO NOT TRANSFUSE PLATELETS unless <10,000/µL or active life-threatening haemorrhage only — fuels microthrombi", time: "Ongoing", color: "bg-red-600" },
      { step: "5", action: "Monitor urine output hourly. If oliguric despite IV fluids: URGENT nephrology review. RRT (PD preferred in children) if: K >6.5, fluid overload, or anuric >24h", time: "Ongoing", color: "bg-orange-600" },
      { step: "6", action: "Neurological STEC-HUS (seizures, coma): IV methylprednisolone 10–30 mg/kg + consider eculizumab (off-label but supported by evidence in neurological HUS)", time: "If neuro involved", color: "bg-amber-700" },
      { step: "7", action: "Red cell transfusion if Hb <7 g/dL or symptomatic anaemia — transfuse SLOWLY (2.5–5 mL/kg/hr) to avoid fluid overload", time: "As needed", color: "bg-blue-600" },
      { step: "8", action: "Supportive care until TMA resolves: typically 1–3 weeks. Most children recover renal function. Long-term BP monitoring essential", time: "1–3 weeks", color: "bg-green-600" },
    ],
    drugs: [
      { name: "0.9% NaCl", dose: "10–20 mL/kg bolus; then generous maintenance (1.5× normal)", route: "IV", duration: "Until haemodynamically stable and adequate urine output", purpose: "Early volume resuscitation — reduces HUS severity" },
      { name: "Packed Red Cells", dose: "10 mL/kg over 3–4h if Hb <7 or symptomatic", route: "IV slow transfusion", duration: "PRN", purpose: "Correct anaemia — NOT for thrombocytopenia" },
      { name: "Eculizumab", dose: "Weight-based (see aHUS protocol)", route: "IV", duration: "Short course for neurological STEC-HUS", purpose: "Neurological STEC-HUS — off-label, evidence emerging (ECULIZE trial data)" },
    ],
    monitoring: ["Urine output hourly", "Platelet count + LDH daily", "Creatinine daily", "Blood glucose 4-hourly (pancreatic involvement can cause hyperglycaemia)", "BP 4-hourly", "Neurological status — any change = urgent review"],
    pitfalls: [
      "ANTIBIOTICS in STEC-HUS = CONTRAINDICATED — risk of fatal neurological HUS rises 17-fold",
      "Antibiotic-like drugs: avoid antimotility agents (loperamide) for same reason",
      "Platelet transfusion worsens microvascular thrombosis — only for active major haemorrhage with platelets <10,000",
      "STEC-HUS vs aHUS: STEC has bloody diarrhoea prodrome + positive stool PCR; aHUS has no diarrhoeal prodrome — management is opposite"
    ]
  },
  {
    id: "pres-status-epilepticus",
    title: "Status Epilepticus in PRES/Hypertensive Encephalopathy",
    icon: Brain,
    color: "bg-purple-800",
    severity: "CRITICAL",
    summary: "Seizure + severe HTN = PRES until proven otherwise. Treat BP AND seizures simultaneously. MRI shows posterior T2/FLAIR changes.",
    icu_triggers: ["Generalised seizure + severe HTN", "Altered consciousness + high BP", "Visual disturbance (cortical blindness) + HTN", "Seizure not responding to first-line anticonvulsant", "Posterior white matter changes on MRI (T2/FLAIR hyperintensity)"],
    algorithm: [
      { step: "1", action: "ABC. Secure airway. High-flow O2. IV access × 2. Check blood glucose IMMEDIATELY (hypoglycaemia mimics seizure)", time: "0 min", color: "bg-red-700" },
      { step: "2", action: "Levetiracetam IV LOAD: 20–40 mg/kg (max 3g) over 15 min — PREFERRED in PRES/hypertensive encephalopathy", time: "0 min", color: "bg-red-600" },
      { step: "3", action: "DO NOT USE SODIUM VALPROATE in hypertensive encephalopathy — hepatotoxicity risk and poor evidence in PRES seizures. Use levetiracetam or midazolam instead", time: "Important contraindication", color: "bg-red-600" },
      { step: "4", action: "IV Nicardipine 0.5–5 mcg/kg/min — PREFERRED antihypertensive in PRES. Goal: reduce MAP by ≤25% in first hour (upper limit, NOT a target — never reduce faster)", time: "0–10 min", color: "bg-orange-700" },
      { step: "5", action: "PRES resolves when BP is controlled — anticonvulsants are temporising. BP treatment is definitive treatment", time: "Ongoing", color: "bg-orange-600" },
      { step: "6", action: "Midazolam 0.1–0.2 mg/kg IV (or intranasal if no IV) for seizure still ongoing at 5 min", time: "5 min if still seizing", color: "bg-amber-600" },
      { step: "7", action: "Urgent MRI brain: posterior T2/FLAIR hyperintensity = PRES. DWI usually spared (vs ischaemic stroke where DWI positive)", time: "After stabilisation", color: "bg-yellow-600" },
      { step: "8", action: "Status epilepticus (seizure >30 min or 2 seizures without recovery): escalate to thiopentone infusion or general anaesthesia with ICU support", time: "30 min if refractory", color: "bg-blue-700" },
    ],
    drugs: [
      { name: "Levetiracetam IV", dose: "20–40 mg/kg (max 3000mg) LOAD over 15 min; then 20–30 mg/kg/day BD maintenance", route: "IV over 15 min", duration: "Continue until PRES resolves and BP controlled", purpose: "First-line anticonvulsant in PRES — no hepatotoxicity, no major interactions" },
      { name: "Nicardipine", dose: "0.5–5 mcg/kg/min, titrate", route: "IV infusion", duration: "Until BP controlled, then transition oral", purpose: "Antihypertensive of choice in PRES/hypertensive encephalopathy" },
      { name: "Midazolam", dose: "0.1–0.2 mg/kg IV (max 10mg) OR 0.2–0.3 mg/kg intranasal", route: "IV / intranasal", duration: "Acute seizure abort; may repeat once after 5 min", purpose: "Acute seizure termination" },
      { name: "Lorazepam", dose: "0.1 mg/kg IV (max 4mg)", route: "IV over 2 min", duration: "Single dose; can repeat once", purpose: "Alternative benzodiazepine for acute seizure" },
    ],
    monitoring: ["Continuous BP (arterial line preferred)", "Continuous EEG or regular neuro observations if treated status epilepticus", "Blood glucose every 30 min after levetiracetam loading", "Hourly urine output", "Repeat neurological exam every 30 min", "MRI within 12h of stabilisation"],
    pitfalls: [
      "MAP reduction >25% in first hour causes watershed ischaemia — PRES goal is CONTROLLED reduction (≤25% over 1 hour as upper limit, not a target to hit)",
      "Sodium valproate AVOID in hypertensive encephalopathy — risk of hepatotoxicity and no advantage over levetiracetam",
      "PRES on CT may look normal — MRI is essential (CT misses >30% of PRES)",
      "Seizures in PRES recur if BP not controlled — antiepileptic alone is insufficient"
    ]
  },
  {
    id: "aki-rrt-triggers",
    title: "AKI — RRT Triggers",
    icon: Activity,
    color: "bg-amber-700",
    severity: "URGENT",
    summary: "Fluid overload >10% body weight, K >6.5, pH <7.1, urea >200 with symptoms, or pulmonary oedema = RRT NOW",
    icu_triggers: ["Fluid overload >10% body weight", "K⁺ >6.5 mEq/L refractory to medical treatment", "pH <7.1 refractory", "Urea >200 mg/dL with symptoms (uraemic encephalopathy, pericarditis)", "Pulmonary oedema not responding to diuretics"],
    algorithm: [
      { step: "1", action: "Assess fluid overload: % FO = (fluid in – fluid out) / baseline weight × 100. >10% = mandatory RRT trigger", time: "0 min", color: "bg-orange-600" },
      { step: "2", action: "ECG if K >5.5 mEq/L. Immediate Calcium gluconate if peaked T waves / K >6.5 (see Hyperkalaemia protocol)", time: "0 min", color: "bg-red-600" },
      { step: "3", action: "ABG: if pH <7.1 refractory to bicarbonate, RRT indicated. NaHCO3 1–2 mEq/kg IV as bridge only — not definitive", time: "5 min", color: "bg-red-600" },
      { step: "4", action: "Preferred RRT modality in India: ACUTE PERITONEAL DIALYSIS (ISPN 2023) — widely available, no vascular access required, more haemodynamically stable. Preferred for infants and haemodynamically unstable patients", time: "Decision", color: "bg-orange-600" },
      { step: "5", action: "HD / CRRT: for haemodynamically stable patients with vascular access. CRRT preferred in multiorgan failure or haemodynamic instability", time: "If PD not available/feasible", color: "bg-amber-600" },
      { step: "6", action: "PD catheter insertion (Tenckhoff or acute rigid catheter): urgent surgical/nephrology procedure. Start with low volume dwells (5–10 mL/kg per dwell) and increase gradually", time: "Urgent", color: "bg-yellow-600" },
      { step: "7", action: "Nutritional support: continue enteral nutrition during RRT. RRT causes protein losses — increase protein intake to 2–3 g/kg/day", time: "Day 1 onwards", color: "bg-green-600" },
    ],
    drugs: [
      { name: "Calcium gluconate 10%", dose: "0.5–1 mL/kg (max 20mL) over 5–10 min", route: "IV", duration: "Immediate cardiac stabilisation if K >6.5 or ECG changes", purpose: "Cardiac membrane stabilisation (not K lowering)" },
      { name: "NaHCO3 8.4%", dose: "1–2 mEq/kg IV over 30–60 min", route: "IV", duration: "Bridge until RRT starts", purpose: "Temporary acidosis correction — not definitive treatment" },
      { name: "Furosemide", dose: "2–5 mg/kg IV — trial dose. If no urine in 2h = dialysis", route: "IV bolus", duration: "One or two doses only — avoid further delay to RRT", purpose: "Test renal tubular function before committing to RRT" },
    ],
    monitoring: ["Fluid balance HOURLY — % fluid overload calculation daily", "K⁺, creatinine, urea, phosphate, bicarb 6–12 hourly", "Continuous ECG if K >5.5", "BP and HR 1-hourly", "Weight twice daily (if possible — oedema confounds)"],
    pitfalls: [
      "Delay in RRT for fluid overload >15% significantly increases mortality in AKI — do not wait for K or acidosis to mandate RRT",
      "Low-dose dopamine does NOT protect kidneys — evidence discredited, avoid",
      "Furosemide resistance in severe AKI — 2 failed bolus doses = RRT without further delay",
      "Acute PD with peritonitis history: consider HD/CRRT as alternative"
    ]
  },
  {
    id: "pd-peritonitis",
    title: "PD Peritonitis",
    icon: AlertTriangle,
    color: "bg-amber-800",
    severity: "URGENT",
    summary: "Cloudy effluent + fever = PD PERITONITIS until proven otherwise. Start IP antibiotics IMMEDIATELY — do NOT wait for culture.",
    icu_triggers: ["Cloudy peritoneal effluent", "Abdominal pain + fever in PD patient", "Effluent cell count >100 cells/mm³ (>50% neutrophils)", "Blood in PD effluent + fever", "Haemodynamic instability in PD patient"],
    algorithm: [
      { step: "1", action: "CLOUDY EFFLUENT = PD PERITONITIS UNTIL PROVEN OTHERWISE. Drain effluent immediately and send for: cell count + differential, gram stain, culture and sensitivity", time: "0 min", color: "bg-orange-700" },
      { step: "2", action: "If effluent WBC >100/mm³ with >50% neutrophils = START ANTIBIOTICS WITHOUT WAITING FOR CULTURE RESULT", time: "0–30 min", color: "bg-orange-600" },
      { step: "3", action: "IP Vancomycin 30 mg/kg in one long dwell (max 2g per dwell) — covers gram-positive including Staph aureus and streptococcus", time: "Immediately", color: "bg-orange-500" },
      { step: "4", action: "IP Ceftazidime 15 mg/kg per dwell (max 1g per dwell) — covers gram-negative organisms. CAN be given in same bag as vancomycin", time: "Simultaneously", color: "bg-amber-600" },
      { step: "5", action: "Continue standard PD exchanges during treatment — no need to rest the peritoneum unless patient deteriorating. Repeat cultures at 72h", time: "Ongoing", color: "bg-yellow-600" },
      { step: "6", action: "Culture results at 48–72h: de-escalate antibiotics based on sensitivities. Gram-positive: continue vancomycin alone. Gram-negative: ceftazidime ± adjust based on sensitivity", time: "48–72 h", color: "bg-green-600" },
      { step: "7", action: "Catheter removal indicated: no response at 5 days, fungal peritonitis (ANY fungi = remove immediately), refractory/relapsing peritonitis, tunnel/exit site infection with same organism", time: "Day 5 if no response", color: "bg-red-600" },
    ],
    drugs: [
      { name: "Vancomycin IP", dose: "30 mg/kg per dwell (max 2000mg)", route: "Intraperitoneal (one long dwell ≥6h)", duration: "Continue until 2 weeks AFTER last positive culture; minimum 14–21 days for Staph aureus", purpose: "Gram-positive peritonitis cover (ISPD 2022)" },
      { name: "Ceftazidime IP", dose: "15 mg/kg per dwell (max 1000mg)", route: "Intraperitoneal", duration: "Minimum 14–21 days, adjust per culture", purpose: "Gram-negative peritonitis cover" },
      { name: "Fluconazole / Liposomal Amphotericin", dose: "Fluconazole 3–6 mg/kg/day PO if fungal", route: "PO / IV (IV for amphotericin)", duration: "REMOVE catheter FIRST, then 2 weeks antifungal", purpose: "Fungal peritonitis — catheter removal is mandatory" },
    ],
    monitoring: ["Daily effluent appearance (cloudy = not resolving)", "Effluent cell count at 72h (should be falling)", "Temperature twice daily", "Blood cultures if febrile + systemically unwell", "Blood CRP at day 3", "Drain adequacy — check for fibrin/clots blocking catheter"],
    pitfalls: [
      "WAITING for culture before starting antibiotics = preventable bowel adhesions and catheter loss — NEVER wait",
      "Fungal peritonitis: ANY fungal element on gram stain or culture = remove catheter SAME DAY, then antifungal",
      "Staph aureus peritonitis: treat for MINIMUM 3 weeks; high relapse rate if shorter course",
      "ISPD 2022: ceftazidime and vancomycin CAN be mixed in same bag — no incompatibility at standard doses"
    ]
  },
  {
    id: "transplant-creatinine-rise",
    title: "Post-Transplant Creatinine Rise (First 48h)",
    icon: Activity,
    color: "bg-teal-700",
    severity: "URGENT",
    summary: "Any creatinine rise in first 48h post-transplant: Doppler ultrasound IMMEDIATELY to exclude vascular thrombosis — surgical emergency.",
    icu_triggers: ["Creatinine not falling as expected post-transplant", "Any creatinine RISE in first 48–72h post-transplant", "Sudden oliguria or anuria post-transplant", "Graft pain or tenderness", "Haematuria + oliguria post-transplant"],
    algorithm: [
      { step: "1", action: "RENAL DOPPLER ULTRASOUND IMMEDIATELY — exclude vascular thrombosis. Renal artery or vein thrombosis = surgical emergency requiring return to theatre within 1–2 hours. Every minute of delay = graft loss", time: "0 min", color: "bg-teal-700" },
      { step: "2", action: "Simultaneously: Check tacrolimus trough level (target 8–12 ng/mL in first month — high = nephrotoxicity, low = rejection risk), urine output hourly trend, drain output", time: "0–30 min", color: "bg-teal-600" },
      { step: "3", action: "Doppler normal: assess for urological complications (urinoma, lymphocoele, obstruction). CT urogram or nuclear renogram if Doppler non-diagnostic", time: "After Doppler", color: "bg-orange-600" },
      { step: "4", action: "Tacrolimus nephrotoxicity: high trough (>15 ng/mL) + rising creatinine. Reduce dose, repeat level in 24h", time: "If high trough", color: "bg-amber-600" },
      { step: "5", action: "Delayed graft function (DGF): creatinine not falling despite Doppler normal, adequate tacrolimus. Maintain adequate hydration. Most DGF recovers within 2–6 weeks", time: "Days 1–14", color: "bg-yellow-600" },
      { step: "6", action: "Acute rejection suspected (biopsy-proven): NEVER treat rejection without biopsy. IV methylprednisolone 10 mg/kg × 3 days for acute cellular rejection. T cell depletors / rituximab for antibody-mediated rejection", time: "If rejection suspected", color: "bg-orange-700" },
      { step: "7", action: "Infection screen: CMV PCR, BK virus PCR, urine culture, blood culture, CXR. Immunosuppression reduction may be required for severe infection", time: "Day 3–7", color: "bg-blue-600" },
    ],
    drugs: [
      { name: "Tacrolimus", dose: "Target trough 8–12 ng/mL (month 1), 5–8 (months 2–6)", route: "PO BD", duration: "Lifelong, dose adjusted per TDM", purpose: "Calcineurin inhibitor — primary immunosuppression" },
      { name: "Methylprednisolone IV pulse", dose: "10 mg/kg/day (max 500–1000mg)", route: "IV over 30–60 min", duration: "3 days for acute rejection — biopsy-proven only", purpose: "Acute cellular rejection treatment" },
      { name: "Ganciclovir / Valganciclovir", dose: "5 mg/kg IV BD or 900mg PO BD (renal dose adjusted)", route: "IV / PO", duration: "3–6 months prophylaxis OR treatment", purpose: "CMV prophylaxis/treatment — especially donor+/recipient- combinations" },
    ],
    monitoring: ["Hourly urine output first 48h", "Tacrolimus trough on day 1, 3, 7 and weekly thereafter", "Daily creatinine, electrolytes", "Doppler at 24h and if any creatinine change", "CMV PCR weekly for 3 months", "BK virus PCR monthly for 6 months"],
    pitfalls: [
      "Renal artery/vein thrombosis: 1–2 hour window for surgical salvage — never delay Doppler for ANY reason",
      "NEVER treat rejection without biopsy — empirical rejection treatment risks infection, malignancy, unnecessary exposure",
      "BK nephropathy mimics rejection on creatinine — do NOT pulse steroids for BK nephropathy (worsens it catastrophically)",
      "Low tacrolimus trough (<5 ng/mL) = rejection risk; high trough (>15 ng/mL) = nephrotoxicity and infection risk"
    ]
  },
  {
    id: "asthma-exacerbation",
    title: "Acute Asthma Exacerbation",
    icon: Wind,
    color: "bg-sky-700",
    severity: "EMERGENCY",
    summary: "Acute bronchospasm — assess severity, give oxygen + bronchodilators, escalate if no response. Weight optional for dose calc.",
    icu_triggers: ["SpO2 <92% despite O2", "Silent chest on auscultation", "Pulsus paradoxus >20 mmHg", "Unable to speak in sentences", "Altered consciousness / exhaustion", "PaCO2 normal or rising (respiratory fatigue — near-fatal)"],
    algorithm: [
      { step: "1", action: "Assess severity: Mild (SpO2 >95%, speaks sentences, PEFR >70%), Moderate (SpO2 92–95%, speaks phrases, PEFR 40–70%), Severe (SpO2 <92%, speaks words, PEFR <40%), Life-threatening (silent chest, cyanosis, exhaustion)", time: "0 min", color: "bg-slate-600" },
      { step: "2", action: "High-flow O2 by mask — target SpO2 94–98% (children). If SpO2 <92%: non-rebreather mask 10–15 L/min", time: "0 min", color: "bg-sky-600" },
      { step: "3", action: "Salbutamol nebulization: 2.5 mg (<20 kg) or 5 mg (>20 kg). If no weight available: use age — <5y: 2.5 mg, >5y: 5 mg. Repeat every 20 min × 3 in first hour (continuous nebulization for severe)", time: "0–5 min", color: "bg-red-600" },
      { step: "4", action: "Ipratropium bromide nebulization: 250 mcg (<20 kg) or 500 mcg (>20 kg). Give with EVERY Salbutamol dose in FIRST HOUR ONLY. Shown to reduce hospitalization in severe exacerbations", time: "0–5 min", color: "bg-orange-600" },
      { step: "5", action: "Systemic steroids: Prednisolone PO 1–2 mg/kg (max 40mg) OR IV Hydrocortisone 4 mg/kg (max 200mg) if vomiting. Give within 1 hour — reduces admission. Continue 3–5 days", time: "5–10 min", color: "bg-amber-600" },
      { step: "6", action: "SEVERE/LIFE-THREATENING: IV Magnesium sulphate (MgSO4) 0.1–0.2 mL/kg of 50% MgSO4 (= 50–75 mg/kg) IV over 20 min. Max 2g. Strong evidence for severe exacerbations (RR reduction 32%)", time: "15–20 min if severe", color: "bg-purple-600" },
      { step: "7", action: "No response after 3 nebulizations: IV Salbutamol 5–10 mcg/kg bolus over 10 min, then infusion 0.1–5 mcg/kg/min. OR IV Aminophylline 5 mg/kg loading over 30 min (if not on theophylline), then 0.9 mg/kg/hr (neonates: 0.2 mg/kg/hr)", time: "30–60 min", color: "bg-red-700" },
      { step: "8", action: "HELIOX 70:30 (helium:oxygen): if refractory and available — reduces airway resistance. BiPAP/NIV as bridge to intubation. Intubation last resort (high risk in acute asthma)", time: "If refractory", color: "bg-blue-700" },
    ],
    drugs: [
      { name: "Salbutamol (Nebulized)", dose: "<20 kg: 2.5 mg | >20 kg: 5 mg (no weight: <5y→2.5mg, >5y→5mg)", route: "Nebulization q20 min ×3, then q1–4h", duration: "q20 min first hour, then assess", purpose: "First-line bronchodilator — beta-2 agonist" },
      { name: "Ipratropium Bromide (Nebulized)", dose: "<20 kg: 250 mcg | >20 kg: 500 mcg", route: "With salbutamol — first hour only", duration: "First 3 doses only (anticholinergic)", purpose: "Additive bronchodilation — reduces admission rate" },
      { name: "Prednisolone PO", dose: "1–2 mg/kg/day (max 40mg)", route: "PO (with food)", duration: "3–5 days, no taper needed for short courses", purpose: "Systemic anti-inflammatory — give within 1h of arrival" },
      { name: "Hydrocortisone IV", dose: "4 mg/kg/dose (max 200mg)", route: "IV over 5 min", duration: "q6h until able to take PO steroids", purpose: "If vomiting or unable to take PO" },
      { name: "Magnesium Sulphate IV", dose: "50 mg/kg (= 0.1–0.2 mL/kg of 50% MgSO4, max 2g)", route: "IV over 20 min", duration: "Single dose for severe/life-threatening", purpose: "Adjunct bronchodilation — significant evidence for severe cases" },
      { name: "Salbutamol IV (if no response)", dose: "5–10 mcg/kg bolus over 10 min, then 0.1–5 mcg/kg/min infusion", route: "IV via infusion pump", duration: "Titrate to response", purpose: "Refractory asthma not responding to nebulized therapy" },
    ],
    monitoring: ["SpO2 continuous (target 94–98%)", "RR and work of breathing every 15 min", "PEFR (if able to cooperate — >6y)", "Heart rate (tachycardia from salbutamol — normal side effect)", "Blood gas: if not improving or fatigue suspected", "Blood glucose (steroids can cause hyperglycemia)"],
    pitfalls: [
      "Normal or rising PaCO2 in severe asthma = DANGER — indicates respiratory muscle fatigue (usually CO2 falls in mild-moderate asthma due to hyperventilation)",
      "Sedation/opioids contraindicated — can suppress respiratory drive critically",
      "Ipratropium: FIRST HOUR ONLY — not proven beneficial after initial phase",
      "Aminophylline: risk of arrhythmias — ECG monitoring mandatory; do NOT give if already on theophylline without checking levels",
      "IV Salbutamol causes hypokalaemia — monitor potassium and supplement",
      "MgSO4 check: give slowly over 20 min — rapid infusion causes hypotension and flushing",
      "Weight-based dosing: use age-based estimates confidently if weight unavailable — do NOT delay treatment to obtain weight"
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
  const [showDictation, setShowDictation] = useState(false);

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
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-7 h-7 flex-shrink-0" />
              <div>
                <h1 className="text-lg font-bold">Emergency & ICU Hub</h1>
                <p className="text-red-100 text-xs mt-0.5">Hyperkalemia · HTN Emergency · RPGN · aHUS · STEC-HUS · Anti-GBM · PRES · TLS · Dialysis</p>
              </div>
            </div>
            <VoiceDictation compact onSoap={(soap) => console.log("SOAP:", soap)} />
          </div>
          {showDictation && (
            <div className="mt-3">
              <VoiceDictation onSoap={(soap) => { console.log("SOAP:", soap); setShowDictation(false); }} />
            </div>
          )}
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
                        <h3 className="font-bold text-lg text-slate-900 mb-2 flex items-center gap-2">
                          <Pill className="w-5 h-5 text-red-600" /> Emergency Drugs
                        </h3>
                        <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-4 text-xs text-amber-800">
                          <strong>⚖️ Weight-based dosing:</strong> If weight is unavailable, use age-based estimates or Broselow tape. Do NOT delay treatment to obtain weight. In emergencies, estimate: 1–12 months ≈ age(mo)+9 kg; 1–5y ≈ (age×2)+8 kg; 6–12y ≈ age×3 kg.
                        </div>
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