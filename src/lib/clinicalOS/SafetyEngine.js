/**
 * NEPHROLOGY SAFETY ENGINE
 * Drug interaction alerts, nephrotoxicity warnings, electrolyte risks,
 * dialysis-specific alerts, immunosuppression monitoring
 */

// ── Interaction Database ──────────────────────────────────────────────────
const DRUG_INTERACTIONS = [
  {
    id: "tac-vori",
    drugs: ["tacrolimus", "voriconazole"],
    severity: "CRITICAL",
    type: "pharmacokinetic",
    mechanism: "Voriconazole inhibits CYP3A4 → tacrolimus levels increase 3–5×",
    effect: "Tacrolimus toxicity: nephrotoxicity, neurotoxicity, glucose intolerance",
    action: "Reduce tacrolimus dose by 50–75%; monitor trough daily until stable",
    alternative: "Fluconazole (moderate interaction); anidulafungin/micafungin (no interaction)",
  },
  {
    id: "tac-ery",
    drugs: ["tacrolimus", "erythromycin"],
    severity: "MAJOR",
    type: "pharmacokinetic",
    mechanism: "Erythromycin inhibits CYP3A4",
    effect: "Tacrolimus levels rise significantly",
    action: "Monitor trough closely; prefer alternative antibiotic (azithromycin has lower interaction)",
  },
  {
    id: "ace-k",
    drugs: ["ace_inhibitor", "high_potassium"],
    severity: "MAJOR",
    type: "pharmacodynamic",
    mechanism: "ACE-I reduces aldosterone → reduced K+ excretion",
    effect: "Hyperkalaemia risk especially in CKD or concurrent K+-sparing diuretics",
    action: "Check K+ 1–2 weeks after ACE-I start; hold if K+ >6.0 mmol/L",
    trigger_condition: "serum_potassium > 5.5",
  },
  {
    id: "ace-arb-combo",
    drugs: ["ace_inhibitor", "arb"],
    severity: "MAJOR",
    type: "pharmacodynamic",
    mechanism: "Dual RAS blockade",
    effect: "Increased hyperkalaemia, AKI, and hypotension (ALTITUDE/ONTARGET trials)",
    action: "Do NOT combine ACE-I + ARB except in specific NS proteinuria management under close supervision",
    exception: "Dual RAS block acceptable for proteinuria control in NS under specialist supervision",
  },
  {
    id: "nsaid-aki",
    drugs: ["nsaid", "acute_kidney_injury"],
    severity: "CRITICAL",
    type: "pharmacodynamic",
    mechanism: "NSAIDs block prostaglandin-mediated afferent arteriolar dilation → reduced GFR",
    effect: "Precipitates or worsens AKI; contraindicated in all stages",
    action: "Absolute contraindication in AKI; use paracetamol instead",
  },
  {
    id: "amino-loop",
    drugs: ["aminoglycoside", "furosemide"],
    severity: "MAJOR",
    type: "additive",
    mechanism: "Both nephrotoxic and ototoxic",
    effect: "Increased nephrotoxicity and ototoxicity",
    action: "If unavoidable: once-daily aminoglycoside dosing; monitor trough + creatinine daily",
  },
  {
    id: "rtx-live-vax",
    drugs: ["rituximab", "live_vaccine"],
    severity: "CRITICAL",
    type: "immunological",
    mechanism: "Rituximab causes B-cell depletion → inadequate vaccine response + risk of vaccine-strain disease",
    effect: "Live vaccine infection; immune failure",
    action: "No live vaccines within 6 months of rituximab. Give live vaccines ≥4 weeks BEFORE rituximab.",
  },
  {
    id: "tac-nsaid",
    drugs: ["tacrolimus", "nsaid"],
    severity: "MAJOR",
    type: "additive",
    mechanism: "Both nephrotoxic",
    effect: "Additive nephrotoxicity; AKI risk",
    action: "Avoid NSAIDs in patients on tacrolimus; use paracetamol",
  },
  {
    id: "cyclo-fertility",
    drugs: ["cyclophosphamide", "reproductive_age"],
    severity: "MAJOR",
    type: "toxicity",
    mechanism: "Cyclophosphamide alkylates gonadal stem cells",
    effect: "Gonadal toxicity; infertility; lifetime cumulative dose limit 168 mg/kg",
    action: "One course only; lifetime limit 168 mg/kg; consider leuprolide for gonadal protection in adolescents",
  },
];

// ── Nephrotoxicity Alerts ───────────────────────────────────────────────────
const NEPHROTOXINS = [
  { drug: "NSAIDs", risk: "CRITICAL", category: "COX inhibitor", note: "Contraindicated in AKI/CKD G3+" },
  { drug: "Aminoglycosides", risk: "HIGH", category: "antibiotic", note: "Once-daily dosing; trough <1; duration ≤5 days" },
  { drug: "Amphotericin B deoxycholate", risk: "HIGH", category: "antifungal", note: "Use liposomal formulation in CKD; daily Cr/electrolytes" },
  { drug: "Calcineurin inhibitors (tacrolimus/CsA)", risk: "HIGH", category: "immunosuppressant", note: "Trough-guided; Cr rise >30% = dose reduce" },
  { drug: "Radiocontrast", risk: "HIGH", category: "imaging", note: "Hydrate 1 mL/kg/h × 6h before+after; use iso-osmolar; avoid in eGFR <30" },
  { drug: "Methotrexate (high dose)", risk: "HIGH", category: "chemotherapy", note: "Leucovorin rescue; aggressive hydration; urine alkalinisation" },
  { drug: "Vancomycin", risk: "MODERATE", category: "antibiotic", note: "AUC/MIC-guided (target 400–600); avoid trough >15" },
  { drug: "Cisplatin", risk: "HIGH", category: "chemotherapy", note: "Pre/post hydration mandatory; monitor Cr + Mg daily" },
  { drug: "Lithium", risk: "MODERATE", category: "psychiatric", note: "Avoid in CKD; monitor serum levels + Cr every 6 months" },
  { drug: "Trimethoprim", risk: "LOW", category: "antibiotic", note: "Blocks tubular Cr secretion — raises Cr without true GFR reduction; K+ sparing effect" },
];

// ── Electrolyte Risk Matrix ─────────────────────────────────────────────────
const ELECTROLYTE_RULES = [
  { condition: "serum_potassium > 6.5", severity: "CRITICAL", alert: "Hyperkalaemia critical — ECG + calcium gluconate STAT" },
  { condition: "serum_potassium > 5.5 && drug includes ace", severity: "MAJOR", alert: "High K+ with ACE-I — hold ACE-I, check K+ trend" },
  { condition: "serum_sodium < 125", severity: "CRITICAL", alert: "Severe hyponatraemia — risk of seizures; restrict fluids; check correction rate" },
  { condition: "serum_sodium > 155", severity: "MAJOR", alert: "Hypernatraemia — free water deficit; correct slowly (max 0.5 mmol/L/h)" },
  { condition: "serum_calcium < 1.8", severity: "MAJOR", alert: "Severe hypocalcaemia — seizure risk; IV calcium gluconate" },
  { condition: "serum_phosphate > 2.5", severity: "MODERATE", alert: "Hyperphosphataemia — increase phosphate binder dose; dietary restriction" },
  { condition: "hco3 < 15", severity: "MAJOR", alert: "Severe metabolic acidosis — sodium bicarbonate; consider RRT if pH <7.1" },
];

// ── Immunosuppression Monitoring Rules ─────────────────────────────────────
const IMMUNOSUPPRESSION_MONITORING = {
  tacrolimus: {
    monitoring_labs: ["tacrolimus_trough", "creatinine", "potassium", "glucose", "blood_pressure", "LFT"],
    frequency: "Weekly × 4 weeks, then monthly",
    critical_alerts: [
      { condition: "trough > 15", alert: "Tacrolimus toxicity — nephrotoxicity / neurotoxicity risk; reduce dose" },
      { condition: "trough < 3", alert: "Tacrolimus sub-therapeutic — rejection risk; increase dose" },
      { condition: "creatinine_rise > 30%", alert: "Cr rising >30% — tacrolimus nephrotoxicity vs rejection; check trough" },
    ],
  },
  mmf: {
    monitoring_labs: ["CBC", "LFT"],
    frequency: "Monthly",
    critical_alerts: [
      { condition: "neutrophils < 1.0", alert: "MMF-induced neutropenia — reduce or hold MMF; urgently manage infection risk" },
    ],
  },
  rituximab: {
    monitoring_labs: ["CD19_count", "IgG", "IgM", "CBC", "LFT", "hepatitis_B_serology"],
    frequency: "q3 months",
    pre_treatment: ["Hepatitis B serology", "Quantiferon-TB", "Varicella serology", "Live vaccine exclusion"],
    critical_alerts: [
      { condition: "IgG < 4", alert: "Severe hypogammaglobulinaemia — IVIG replacement; infection prophylaxis" },
    ],
  },
  cyclophosphamide: {
    monitoring_labs: ["CBC", "urinalysis", "cumulative_dose"],
    frequency: "Weekly during therapy",
    lifetime_limit: 168,
    critical_alerts: [
      { condition: "cumulative > 168", alert: "LIFETIME DOSE EXCEEDED — absolute contraindication to further cyclophosphamide" },
      { condition: "WBC < 3.0", alert: "Leucopenia — hold cyclophosphamide; infection risk" },
    ],
  },
};

/**
 * Check drug interactions for a drug list + patient context
 * @param {string[]} drugList - lowercase drug names
 * @param {object} ctx - patient context (labs, diagnoses)
 * @returns {object[]} - relevant alerts
 */
export function checkInteractions(drugList = [], ctx = {}) {
  const alerts = [];
  const lowerDrugs = drugList.map(d => d.toLowerCase());

  DRUG_INTERACTIONS.forEach(interaction => {
    const drugMatch = interaction.drugs.filter(d => {
      // Check exact match or context-based match
      if (d === "high_potassium") return ctx.serum_potassium > 5.5;
      if (d === "acute_kidney_injury") return ctx.has_aki;
      if (d === "reproductive_age") return ctx.age >= 12;
      return lowerDrugs.some(ld => ld.includes(d) || d.includes(ld));
    });
    if (drugMatch.length >= 2 || (drugMatch.length >= 1 && interaction.drugs.some(d => ["high_potassium", "acute_kidney_injury", "reproductive_age"].includes(d) && drugMatch.includes(d)))) {
      alerts.push({ ...interaction, type: "interaction" });
    }
  });

  return alerts;
}

/**
 * Check patient context for electrolyte emergencies
 * @param {object} labs - { serum_potassium, serum_sodium, serum_calcium, hco3, serum_phosphate }
 * @returns {object[]}
 */
export function checkElectrolytes(labs = {}) {
  const alerts = [];
  if (labs.serum_potassium > 6.5) alerts.push({ severity: "CRITICAL", alert: "Hyperkalaemia critical (K+ >6.5) — ECG + calcium gluconate STAT", id: "hyperK_critical" });
  else if (labs.serum_potassium > 5.5) alerts.push({ severity: "MAJOR", alert: `Hyperkalaemia (K+ ${labs.serum_potassium}) — dietary restriction; review K+-raising drugs`, id: "hyperK_major" });
  if (labs.serum_sodium < 120) alerts.push({ severity: "CRITICAL", alert: "Severe hyponatraemia (<120) — seizure risk; 3% saline if symptomatic", id: "hypoNa_critical" });
  else if (labs.serum_sodium < 130) alerts.push({ severity: "MAJOR", alert: `Hyponatraemia (Na+ ${labs.serum_sodium}) — fluid restriction; investigate SIADH vs CSW vs NS`, id: "hypoNa_major" });
  if (labs.hco3 < 15) alerts.push({ severity: "MAJOR", alert: `Severe metabolic acidosis (HCO₃⁻ ${labs.hco3}) — sodium bicarbonate; review RRT need if pH <7.1`, id: "acidosis" });
  if (labs.serum_calcium < 1.8) alerts.push({ severity: "MAJOR", alert: `Severe hypocalcaemia (iCa ${labs.serum_calcium}) — IV calcium gluconate; check Mg²⁺`, id: "hypoCa" });
  if (labs.serum_phosphate > 2.5) alerts.push({ severity: "MODERATE", alert: `Hyperphosphataemia (PO₄ ${labs.serum_phosphate}) — dietary restriction; increase binder`, id: "hyperPhos" });
  return alerts;
}

/**
 * Get nephrotoxicity list for reference
 */
export function getNephrotoxins() {
  return NEPHROTOXINS;
}

/**
 * Get monitoring requirements for an immunosuppressant
 */
export function getImmunosuppressantMonitoring(drug) {
  return IMMUNOSUPPRESSION_MONITORING[drug.toLowerCase()] || null;
}

export { DRUG_INTERACTIONS, NEPHROTOXINS, ELECTROLYTE_RULES, IMMUNOSUPPRESSION_MONITORING };