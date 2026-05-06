// ─── Clinical Pathway Templates ──────────────────────────────────────────────
// Each template has: label, drugs (with dosing details), monitoring, supportive

export const PATHWAY_TEMPLATES = {
  ns_first_episode: {
    label: "Nephrotic Syndrome — First Episode (ISKDC)",
    confidence_keywords: ["first episode", "new onset", "ssns", "edema", "proteinuria", "albumin low", "nephrotic"],
    drugs: [
      { name: "Prednisolone", dose_mgkg: 2, max_dose_mg: 60, frequency: "OD (morning)", route: "PO", duration: "4 weeks then taper", monitoring: "Weight daily, BP weekly, urine protein daily, blood glucose weekly", category: "first_line" },
      { name: "Furosemide", dose_mgkg: 1, max_dose_mg: 40, frequency: "OD–BID", route: "PO", duration: "Till edema resolves", monitoring: "Electrolytes weekly, urine output", category: "supportive", conditional: "Use only if severe edema" },
      { name: "Enalapril", dose_mgkg: 0.1, max_dose_mg: 10, frequency: "OD", route: "PO", duration: "During remission if persistent proteinuria", monitoring: "BP, potassium, creatinine", category: "supportive", conditional: "Optional antiproteinuric" },
    ],
    monitoring: ["Urine protein daily (dipstick)", "Weight daily", "BP weekly", "Serum albumin at 4 weeks", "Blood glucose weekly (steroids)", "Electrolytes if on diuretic"],
    supportive: ["Low-salt diet (no added salt)", "2-3 g/day salt restriction", "Avoid NSAIDs", "Normal protein diet (1.5-2 g/kg/day)", "Prophylactic cotrimoxazole 2.5mg/kg alternate days"],
    avoid: ["NSAIDs", "Live vaccines while on steroids (>2mg/kg/day for >2 weeks)"],
    follow_up: "Weekly until remission, then monthly × 3 months",
    reference: "ISKDC 1978; IPNA 2023 Guidelines",
  },

  ns_relapse_frns: {
    label: "Nephrotic Syndrome — FRNS/SDNS Relapse",
    confidence_keywords: ["relapse", "frns", "sdns", "frequent relapse", "steroid dependent", "second relapse"],
    drugs: [
      { name: "Prednisolone", dose_mgkg: 2, max_dose_mg: 60, frequency: "OD (morning)", route: "PO", duration: "Until 3 days after remission, then taper to 0.5mg/kg alternate days", monitoring: "Weight daily, BP weekly, urine protein daily", category: "first_line" },
      { name: "Levamisole", dose_mgkg: 2.5, max_dose_mg: 150, frequency: "Alternate days", route: "PO", duration: "12-24 months", monitoring: "CBC monthly (agranulocytosis), LFT 3-monthly", category: "steroid_sparing" },
      { name: "Mycophenolate Mofetil", dose_mgm2: 600, max_dose_mg: 1000, frequency: "BID", route: "PO", duration: "12-24 months", monitoring: "CBC monthly, LFT 3-monthly", category: "steroid_sparing", bsa_based: true },
      { name: "Tacrolimus", dose_mgkg: 0.1, max_dose_mg: 5, frequency: "BID", route: "PO", duration: "12-24 months", monitoring: "Trough levels (5-7 ng/mL), creatinine monthly, BP", category: "steroid_sparing", tdm: true },
    ],
    monitoring: ["Urine protein daily", "BP weekly", "Tacrolimus trough (if used)", "CBC monthly (levamisole)", "Steroid toxicity monitoring"],
    supportive: ["Low-salt diet", "Calcium + Vitamin D supplementation (if on steroids)", "Varicella vaccine before immunosuppression (if not immune)", "Sun protection (steroid skin effects)"],
    avoid: ["NSAIDs", "Dual steroid-sparing agents without specialist review"],
    follow_up: "2-weekly during relapse, then monthly in remission",
    reference: "IPNA 2023; KDIGO 2021",
  },

  ns_srns: {
    label: "Nephrotic Syndrome — SRNS (Steroid Resistant)",
    confidence_keywords: ["srns", "steroid resistant", "no remission", "failed steroids", "resistant"],
    drugs: [
      { name: "Tacrolimus", dose_mgkg: 0.1, max_dose_mg: 0, frequency: "BID (12-hourly)", route: "PO", duration: "12-24 months", monitoring: "Trough 5-7 ng/mL (SRNS), creatinine monthly, BP, glucose", category: "first_line", tdm: true },
      { name: "Cyclosporine", dose_mgkg: 5, max_dose_mg: 0, frequency: "BID (12-hourly)", route: "PO", duration: "12-24 months", monitoring: "C0 80-120 OR C2 600-800 ng/mL, creatinine, BP, gingival hyperplasia", category: "first_line_alt", tdm: true },
      { name: "Mycophenolate Mofetil", dose_mgm2: 600, max_dose_mg: 1000, frequency: "BID", route: "PO", duration: "With CNI", monitoring: "CBC monthly", category: "combination", bsa_based: true },
      { name: "Prednisolone", dose_mgkg: 0.5, max_dose_mg: 40, frequency: "Alternate days", route: "PO", duration: "Continue during CNI induction", monitoring: "Steroid side effects", category: "adjunct" },
      { name: "Rituximab", dose_mgm2: 375, max_dose_mg: 500, frequency: "Weekly × 2 OR single dose", route: "IV infusion", duration: "2 doses", monitoring: "CD19/CD20 counts, Ig levels, CBC, infusion reactions", category: "biologic", bsa_based: true },
      { name: "Enalapril", dose_mgkg: 0.1, max_dose_mg: 10, frequency: "OD", route: "PO", duration: "Ongoing — antiproteinuric", monitoring: "BP, K+, creatinine", category: "supportive" },
    ],
    monitoring: ["CNI drug levels monthly", "eGFR every 3 months", "Urine protein weekly", "BP daily", "Electrolytes monthly", "Biopsy if partial/no response at 12 months"],
    supportive: ["Low-salt low-potassium diet", "Genetic testing (NPHS1, NPHS2, WT1, TRPC6)", "Biopsy before CNI (document focal segmental vs MCD)", "PCP prophylaxis (cotrimoxazole 2.5mg/kg alternate days)"],
    avoid: ["NSAIDs", "Nephrotoxins", "Further steroids alone without CNI"],
    follow_up: "Monthly × 12 months, then 3-monthly",
    reference: "IPNA 2023; KDIGO 2021",
  },

  aki: {
    label: "Acute Kidney Injury — Management",
    confidence_keywords: ["aki", "acute kidney", "oliguria", "anuria", "creatinine rising", "decreased urine", "fluid overload"],
    drugs: [
      { name: "Furosemide", dose_mgkg: 1, max_dose_mg: 80, frequency: "Q6-8H", route: "IV/PO", duration: "Till adequate urine output", monitoring: "Urine output hourly, electrolytes daily", category: "first_line" },
      { name: "Amlodipine", dose_mgkg: 0.1, max_dose_mg: 10, frequency: "OD", route: "PO", duration: "Till BP normalises", monitoring: "BP 4-hourly", category: "antihypertensive" },
      { name: "Calcium Gluconate 10%", dose_mgkg: 0.5, max_dose_mg: 30, frequency: "Over 5-10 minutes IV (cardiac monitoring)", route: "IV", duration: "Single dose for hyperkalemia", monitoring: "ECG, serum K+", category: "emergency", conditional: "K+ >6.5 or ECG changes" },
      { name: "Sodium Bicarbonate", dose_mgkg: 1, max_dose_mg: 50, frequency: "Over 30-60 min IV", route: "IV", duration: "For metabolic acidosis HCO3 <15", monitoring: "Blood gas, serum K+, calcium", category: "emergency", conditional: "pH <7.2 or HCO3 <15" },
    ],
    monitoring: ["Serum creatinine + BUN + electrolytes daily", "Urine output hourly", "Fluid balance daily", "BP 4-hourly", "ECG if K+ >6", "Urine microscopy", "Renal USS within 24h"],
    supportive: ["Strict fluid restriction (insensible loss + urine output)", "Restrict K+, phosphate, sodium in diet", "Avoid all nephrotoxins", "Nutritional support (2-3 g/kg protein during catabolism)", "Dialysis if: fluid overload >10%, K+ >7, pH <7.1, symptomatic uraemia"],
    avoid: ["NSAIDs", "Contrast agents", "ACE inhibitors in acute phase", "Aminoglycosides", "Nephrotoxins"],
    follow_up: "Daily inpatient review; discharge when creatinine stabilising + adequate urine output",
    reference: "KDIGO AKI 2024; PALS Guidelines",
  },

  ckd: {
    label: "Chronic Kidney Disease — Management Protocol",
    confidence_keywords: ["ckd", "chronic kidney", "egfr low", "stage 3", "stage 4", "stage 5", "proteinuria chronic"],
    drugs: [
      { name: "Enalapril", dose_mgkg: 0.1, max_dose_mg: 40, frequency: "OD", route: "PO", duration: "Long-term renoprotection", monitoring: "BP, K+, creatinine at 1-2 weeks then 3-monthly", category: "renoprotective" },
      { name: "Furosemide", dose_mgkg: 1, max_dose_mg: 80, frequency: "OD–BID", route: "PO", duration: "Ongoing if fluid overload/HTN", monitoring: "Electrolytes monthly", category: "antihypertensive" },
      { name: "Calcitriol", dose_mgkg: 0.01, max_dose_mg: 0.25, frequency: "OD", route: "PO", duration: "CKD G3b+ with secondary HPT", monitoring: "PTH, calcium, phosphate monthly", category: "bone_mineral" },
      { name: "Sodium Bicarbonate", dose_mgkg: 1, max_dose_mg: 1000, frequency: "TID", route: "PO", duration: "While HCO3 <22 mmol/L", monitoring: "Serum HCO3 monthly", category: "metabolic" },
      { name: "Calcium Carbonate", dose_mgkg: 50, max_dose_mg: 3000, frequency: "TID with meals", route: "PO", duration: "Phosphate binder", monitoring: "Serum phosphate monthly, calcium", category: "phosphate_binder" },
      { name: "Amlodipine", dose_mgkg: 0.1, max_dose_mg: 10, frequency: "OD", route: "PO", duration: "BP target <75th percentile", monitoring: "BP at each visit", category: "antihypertensive" },
    ],
    monitoring: ["eGFR every 3 months", "Urine ACR every 3 months", "BP at every visit (target <75th centile for age/height)", "CBC every 6 months (anaemia)", "PTH + Ca + PO4 + ALP (bone mineral)", "Electrolytes monthly", "Growth velocity 6-monthly"],
    supportive: ["Renal diet: low K+/PO4/Na+ as indicated by labs", "Protein 1.5-2 g/kg/day (normal or slightly restricted)", "Erythropoietin if Hb <10 g/dL despite iron repletion", "Vaccinations: Pneumococcal, Influenza, Hepatitis B", "Avoid nephrotoxins, NSAIDs, contrast without preparation"],
    avoid: ["NSAIDs", "Contrast without pre-hydration", "Nephrotoxic antibiotics without dose adjustment", "High potassium/phosphate diet"],
    follow_up: "Monthly for CKD G4-5, 3-monthly for G3",
    reference: "KDIGO CKD 2022; IPNA 2022",
  },

  htn_emergency: {
    label: "Hypertensive Emergency — Pediatric",
    confidence_keywords: ["hypertensive emergency", "hypertension emergency", "severe bp", "headache vision", "bp very high", "seizure bp"],
    drugs: [
      { name: "Labetalol", dose_mgkg: 0.2, max_dose_mg: 40, frequency: "IV bolus over 2-5 min; repeat Q10min if needed", route: "IV", duration: "Until BP controlled, then oral", monitoring: "BP every 5-10 min, ECG, respiratory rate", category: "emergency_iv" },
      { name: "Nifedipine (IR)", dose_mgkg: 0.25, max_dose_mg: 10, frequency: "Sublingual/PO — once; may repeat Q20min × 2", route: "SL/PO", duration: "Single/acute use", monitoring: "BP every 15 min for 1 hour", category: "emergency_po" },
      { name: "Sodium Nitroprusside", dose_mgkg: 0.5, max_dose_mg: 8, frequency: "Continuous IV infusion (mcg/kg/min — titrate)", route: "IV infusion", duration: "ICU only; max 48-72h", monitoring: "Arterial BP monitoring, thiocyanate levels", category: "icu", conditional: "ICU only, refractory HTN" },
      { name: "Amlodipine", dose_mgkg: 0.1, max_dose_mg: 10, frequency: "OD", route: "PO", duration: "Long-term after emergency control", monitoring: "BP at each visit", category: "maintenance" },
    ],
    monitoring: ["BP every 5-10 min during emergency", "Neurological status hourly", "Urine output hourly", "Fundoscopy for papilloedema", "Creatinine, electrolytes stat", "Echo if sustained severe HTN", "Renal Doppler (RAS)"],
    supportive: ["Reduce BP by no more than 25% in first 8 hours (risk of ischaemia)", "Monitor for BP overshoot", "Identify and treat cause (renal, adrenal, coarctation)", "Fluid balance"],
    avoid: ["Rapid reduction >25% in first hour", "Sublingual nifedipine in neonates"],
    follow_up: "ICU monitoring initially; cardiology/nephrology review",
    reference: "AAP HTN Guidelines 2017; KDIGO",
  },

  uti_febrile: {
    label: "Febrile UTI / Pyelonephritis",
    confidence_keywords: ["uti", "pyelonephritis", "febrile uti", "urinary infection", "dysuria fever", "pyuria"],
    drugs: [
      { name: "Ceftriaxone", dose_mgkg: 75, max_dose_mg: 2000, frequency: "OD IV", route: "IV", duration: "2-3 days IV then step down to oral", monitoring: "Temperature, CRP, urine culture response", category: "iv_initial" },
      { name: "Cefixime", dose_mgkg: 8, max_dose_mg: 400, frequency: "BID PO", route: "PO", duration: "5-7 days (step-down from IV)", monitoring: "Symptom resolution, follow-up culture", category: "oral_stepdown" },
      { name: "Cotrimoxazole (prophylaxis)", dose_mgkg: 2, max_dose_mg: 200, frequency: "OD at bedtime", route: "PO", duration: "Prophylaxis for VUR or recurrent UTI", monitoring: "Annual urine culture, renal USS", category: "prophylaxis", conditional: "VUR Grade 3+ or recurrent UTI" },
      { name: "Nitrofurantoin (prophylaxis)", dose_mgkg: 1, max_dose_mg: 50, frequency: "OD at bedtime", route: "PO", duration: "Prophylaxis (avoid if eGFR <45)", monitoring: "Annual renal function, urine culture", category: "prophylaxis_alt", conditional: "Alternative to cotrimoxazole if >3 months" },
    ],
    monitoring: ["Urine culture at 48h and end of treatment", "Renal ultrasound within 6 weeks (first UTI)", "DMSA scan 4-6 months post-febrile UTI", "VCUG if VUR suspected"],
    supportive: ["Adequate hydration (increase fluids)", "Regular bladder emptying", "Treat constipation aggressively", "Perianal hygiene counselling"],
    avoid: ["Delay in treatment >6h (risk of renal scarring)", "Aminoglycosides without monitoring in renal impairment"],
    follow_up: "Urine culture at 72h and 1 month; imaging follow-up",
    reference: "ISPN UTI Guidelines 2023; AAP 2011 (revised 2021)",
  },

  dialysis_hd: {
    label: "Hemodialysis — Drug Dosing Protocol",
    confidence_keywords: ["hemodialysis", "hd patient", "on dialysis", "esrd hd"],
    drugs: [
      { name: "Amlodipine", dose_mgkg: 0.1, max_dose_mg: 10, frequency: "OD", route: "PO", duration: "Ongoing", monitoring: "BP pre/post dialysis", category: "antihypertensive" },
      { name: "Calcium Carbonate", dose_mgkg: 50, max_dose_mg: 3000, frequency: "TID with meals", route: "PO", duration: "Phosphate binder — ongoing", monitoring: "PO4 monthly, Ca monthly", category: "phosphate_binder" },
      { name: "Calcitriol", dose_mgkg: 0.01, max_dose_mg: 0.5, frequency: "TID weekly (IV on HD days)", route: "IV/PO", duration: "Secondary HPT management", monitoring: "PTH monthly, Ca+PO4 monthly", category: "bone" },
      { name: "Erythropoietin (EPO)", dose_mgkg: 50, max_dose_mg: 10000, frequency: "3× per week (on HD days)", route: "SC/IV", duration: "Target Hb 10-12 g/dL", monitoring: "Hb fortnightly, ferritin, iron", category: "anaemia", note: "Units/kg, not mg/kg" },
    ],
    monitoring: ["HD adequacy (Kt/V >1.2)", "Pre/post HD BP", "Monthly: Ca, PO4, PTH, albumin, CBC, Hb", "Dry weight (fluid assessment)", "AVF/access site monthly"],
    supportive: ["Renal diet: low K+, low PO4, fluid restriction (500-700 mL/day + urine output)", "Protein 1.1 g/kg/day (higher if catabolic)", "Iron supplementation IV or PO"],
    avoid: ["Renally-cleared drugs without dose adjustment", "NSAIDs", "Nephrotoxins"],
    follow_up: "Monthly nephrology clinic; dietitian 3-monthly",
    reference: "KDOQI 2019; ISPD; KDIGO CKD-MBD 2017",
  },

  transplant: {
    label: "Kidney Transplant — Immunosuppression",
    confidence_keywords: ["transplant", "post transplant", "kidney transplant", "tacrolimus maintenance"],
    drugs: [
      { name: "Tacrolimus", dose_mgkg: 0.1, max_dose_mg: 10, frequency: "BID (Q12H)", route: "PO", duration: "Lifelong; taper target level over time", monitoring: "Trough: 8-12 ng/mL (month 1-3), 6-8 (month 4-12), 4-6 (>1 year)", category: "primary", tdm: true },
      { name: "Mycophenolate Mofetil", dose_mgm2: 600, max_dose_mg: 1000, frequency: "BID", route: "PO", duration: "Lifelong", monitoring: "CBC monthly, GI side effects", category: "combination", bsa_based: true },
      { name: "Prednisolone", dose_mgkg: 0.3, max_dose_mg: 20, frequency: "OD (morning)", route: "PO", duration: "Taper to 5mg/day by 6 months", monitoring: "BP, glucose, steroid toxicity", category: "adjunct" },
      { name: "Cotrimoxazole", dose_mgkg: 2.5, max_dose_mg: 400, frequency: "OD alternate days", route: "PO", duration: "First 6-12 months (PCP prophylaxis)", monitoring: "Monthly CBC (bone marrow suppression)", category: "prophylaxis" },
    ],
    monitoring: ["eGFR weekly × 4 weeks, then monthly", "Tacrolimus trough at each visit", "CBC monthly", "LFT monthly", "CMV, EBV, BK virus PCR monthly × 3 months", "BP at each visit", "Urine protein/creatinine monthly", "Glucose weekly (calcineurin inhibitor/steroid)"],
    supportive: ["Avoid sun exposure (skin malignancy risk)", "Avoid live vaccines post-transplant", "No NSAIDs ever", "Annual flu vaccine (inactivated)", "Pneumococcal, hepatitis B pre-transplant"],
    avoid: ["NSAIDs", "Nephrotoxins", "Live vaccines", "Grapefruit (CNI metabolism)"],
    follow_up: "Weekly × 1 month, fortnightly × 2 months, then monthly",
    reference: "KDIGO Transplant 2022; IPNA",
  },

  electrolyte_hyperkalemia: {
    label: "Hyperkalemia — Emergency Management",
    confidence_keywords: ["hyperkalemia", "high potassium", "k+ high", "peaked t waves", "ecg changes"],
    drugs: [
      { name: "Calcium Gluconate 10%", dose_mgkg: 0.5, max_dose_mg: 30, frequency: "IV over 5-10 min (cardiac monitoring)", route: "IV", duration: "Single dose; repeat once if ECG persists", monitoring: "ECG continuous, BP", category: "cardiac_stabilize", note: "1 mL/kg of 10% solution (NOT calcium chloride peripherally)" },
      { name: "Sodium Bicarbonate 8.4%", dose_mgkg: 1, max_dose_mg: 50, frequency: "IV over 10-15 min", route: "IV", duration: "Single/repeat dose", monitoring: "Blood gas, K+, Ca++", category: "shift" },
      { name: "Insulin Regular + Dextrose", dose_mgkg: 0.1, max_dose_mg: 10, frequency: "IV over 30 min (with 0.5g/kg dextrose)", route: "IV", duration: "Single dose; effect 30-60 min", monitoring: "Glucose 30-min intervals, K+", category: "shift", note: "Units/kg for insulin" },
      { name: "Salbutamol (Nebulised)", dose_mgkg: 0.15, max_dose_mg: 10, frequency: "Nebulisation over 10 min", route: "Inhaled", duration: "Single dose; can repeat", monitoring: "K+, HR, tremor", category: "shift" },
      { name: "Furosemide", dose_mgkg: 1, max_dose_mg: 80, frequency: "IV once", route: "IV", duration: "Renal K+ elimination (if urine output present)", monitoring: "Urine output, K+", category: "excretion" },
    ],
    monitoring: ["ECG immediately and continuously", "Serum K+ hourly", "Blood gas", "Urine output", "Calcium if hypocalcemia suspected"],
    supportive: ["Strict K+ restriction in diet", "Stop K+ supplements", "Stop ACEi/ARBs temporarily", "Dietary education"],
    avoid: ["Succinylcholine (raises K+)", "K+-containing IV fluids"],
    follow_up: "Repeated electrolytes Q2H until K+ <5.5; daily thereafter",
    reference: "KDIGO AKI 2024; PALS",
  },
};

// ─── Map keywords to pathway keys ────────────────────────────────────────────
export function matchPathway(symptoms = "", diagnosis = "", labs = "") {
  const combined = (symptoms + " " + diagnosis + " " + labs).toLowerCase();
  let best = null;
  let bestScore = 0;
  Object.entries(PATHWAY_TEMPLATES).forEach(([key, template]) => {
    const score = template.confidence_keywords.filter(kw => combined.includes(kw)).length;
    if (score > bestScore) { bestScore = score; best = key; }
  });
  return best && bestScore > 0 ? { key: best, confidence: Math.min(bestScore * 20, 95) } : null;
}