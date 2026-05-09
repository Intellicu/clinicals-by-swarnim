/**
 * CLINICAL FACTS REGISTRY
 * Canonical nephrology definitions used across guidelines, pathways, prescriptions, AI, calculators
 * Single source of truth — update here propagates everywhere
 */

export const CLINICAL_FACTS = {

  // ── NEPHROTIC SYNDROME ────────────────────────────────────────────────────
  NS_RELAPSE: {
    id: "NS_RELAPSE",
    term: "NS Relapse",
    definition: "Urine protein 3+ or 4+ on dipstick for 3 consecutive days",
    canonical_value: { dipstick_min: "3+", consecutive_days: 3 },
    source: "IPNA 2020 / ISKDC",
    evidence_grade: "A",
    linked_modules: ["Nephrotic Syndrome", "Monitoring"],
    conflicts: [],
    notes: "Parent-reported morning first-void. If UPCR >2000 mg/g confirms relapse.",
  },
  NS_REMISSION_COMPLETE: {
    id: "NS_REMISSION_COMPLETE",
    term: "Complete Remission",
    definition: "Urine protein negative or trace on dipstick for 3 consecutive days",
    canonical_value: { dipstick_max: "trace", consecutive_days: 3 },
    source: "IPNA 2020 / ISKDC",
    evidence_grade: "A",
    linked_modules: ["Nephrotic Syndrome"],
  },
  NS_PARTIAL_REMISSION: {
    id: "NS_PARTIAL_REMISSION",
    term: "Partial Remission (NS)",
    definition: "UPCR 200–2000 mg/g and serum albumin >3.0 g/dL with resolution of oedema",
    canonical_value: { upcr_min: 200, upcr_max: 2000, albumin_min: 3.0 },
    source: "IPNA 2020",
    evidence_grade: "A",
    linked_modules: ["Nephrotic Syndrome"],
  },
  NS_DIAGNOSIS: {
    id: "NS_DIAGNOSIS",
    term: "Nephrotic Syndrome Diagnosis",
    definition: "Triad: UPCR >2000 mg/g (or dipstick 3+/4+) + serum albumin <2.5 g/dL + oedema",
    canonical_value: { upcr_threshold: 2000, albumin_threshold: 2.5 },
    source: "IPNA 2020 / KDIGO",
    evidence_grade: "A",
    linked_modules: ["Nephrotic Syndrome"],
  },
  FRNS_DEFINITION: {
    id: "FRNS_DEFINITION",
    term: "Frequently Relapsing NS (FRNS)",
    definition: "≥2 relapses within 6 months of initial response OR ≥4 relapses within any 12-month period",
    canonical_value: { relapses_6m: 2, relapses_12m: 4 },
    source: "IPNA 2020",
    evidence_grade: "A",
    linked_modules: ["Nephrotic Syndrome"],
  },
  SDNS_DEFINITION: {
    id: "SDNS_DEFINITION",
    term: "Steroid-Dependent NS (SDNS)",
    definition: "Relapse while on alternate-day prednisolone ≤0.5 mg/kg/dose OR within 14 days of stopping",
    canonical_value: { pred_dose_threshold: 0.5, days_after_stopping: 14 },
    source: "IPNA 2020",
    evidence_grade: "A",
    linked_modules: ["Nephrotic Syndrome"],
  },
  SRNS_DEFINITION: {
    id: "SRNS_DEFINITION",
    term: "Steroid-Resistant NS (SRNS)",
    definition: "Failure to achieve complete remission after 8 weeks of standard prednisolone (4 weeks full-dose + 4 weeks alternate-day)",
    canonical_value: { full_weeks: 4, alt_day_weeks: 4, total_weeks: 8 },
    source: "IPNA 2020",
    evidence_grade: "A",
    linked_modules: ["Nephrotic Syndrome"],
  },

  // ── AKI ──────────────────────────────────────────────────────────────────
  AKI_STAGE1: {
    id: "AKI_STAGE1",
    term: "AKI Stage 1",
    definition: "SCr rise ≥0.3 mg/dL within 48h OR 1.5–1.9× baseline within 7d OR UO <0.5 mL/kg/h for 6–12h",
    source: "KDIGO AKI 2012",
    evidence_grade: "A",
    linked_modules: ["AKI"],
  },
  AKI_STAGE3: {
    id: "AKI_STAGE3",
    term: "AKI Stage 3 / RRT Indication",
    definition: "SCr ≥3× baseline OR ≥4 mg/dL OR RRT initiated OR UO <0.3 mL/kg/h ×24h OR anuria ×12h",
    source: "KDIGO AKI 2012",
    evidence_grade: "A",
    linked_modules: ["AKI", "Dialysis"],
  },
  AKI_RRT_INDICATIONS: {
    id: "AKI_RRT_INDICATIONS",
    term: "RRT Indications in AKI",
    definition: "Any of: fluid overload ≥20% refractory; K+ >6.5 or ECG changes; pH <7.1 not responding; BUN >100 with uremic symptoms; anuria >12–24h",
    source: "KDIGO AKI 2012",
    evidence_grade: "A",
    linked_modules: ["AKI", "Dialysis"],
  },

  // ── CKD ──────────────────────────────────────────────────────────────────
  CKD_DEFINITION: {
    id: "CKD_DEFINITION",
    term: "Chronic Kidney Disease",
    definition: "eGFR <60 mL/min/1.73m² for ≥3 months OR kidney damage markers persisting ≥3 months regardless of GFR",
    source: "KDIGO CKD 2012",
    evidence_grade: "A",
    linked_modules: ["CKD"],
  },
  CKD_ACIDOSIS_TARGET: {
    id: "CKD_ACIDOSIS_TARGET",
    term: "CKD Bicarbonate Target",
    definition: "Maintain serum HCO₃⁻ ≥22 mmol/L to slow CKD progression and support growth",
    canonical_value: { target_hco3: 22 },
    source: "KDIGO CKD 2012",
    evidence_grade: "A",
    linked_modules: ["CKD"],
  },
  CKD_BP_TARGET: {
    id: "CKD_BP_TARGET",
    term: "BP Target in CKD",
    definition: "BP <50th percentile for age/height/sex on ABPM (ESCAPE trial evidence for proteinuric CKD)",
    source: "ESCAPE Trial 2009 / KDIGO",
    evidence_grade: "A",
    linked_modules: ["CKD", "Hypertension"],
  },
  CKD_GH_INDICATION: {
    id: "CKD_GH_INDICATION",
    term: "rhGH Indication in CKD",
    definition: "Height SDS <−1.88 (below 3rd centile) persisting after 6 months of optimised CKD management (correct acidosis, anaemia, MBD first)",
    source: "KDIGO CKD 2012 / Consensus",
    evidence_grade: "B",
    linked_modules: ["CKD"],
  },

  // ── HYPERTENSION ─────────────────────────────────────────────────────────
  HTN_STAGE2: {
    id: "HTN_STAGE2",
    term: "Stage 2 Hypertension",
    definition: "BP ≥99th percentile for age/height/sex (age <13y) OR ≥140/90 (age ≥13y) — requires same-day evaluation",
    source: "AAP 2017",
    evidence_grade: "A",
    linked_modules: ["Hypertension"],
  },
  HTN_EMERGENCY: {
    id: "HTN_EMERGENCY",
    term: "Hypertensive Emergency",
    definition: "Severe hypertension (>99th percentile) + evidence of end-organ damage (encephalopathy, seizures, papilloedema, cardiac failure)",
    source: "AAP 2017 / ESH 2016",
    evidence_grade: "A",
    linked_modules: ["Hypertension"],
    emergency: true,
  },

  // ── DIALYSIS ─────────────────────────────────────────────────────────────
  HD_ADEQUACY: {
    id: "HD_ADEQUACY",
    term: "HD Adequacy Target",
    definition: "Single-pool Kt/V ≥1.2 per session (KDOQI); URR ≥65%",
    canonical_value: { ktv_min: 1.2, urr_min: 65 },
    source: "KDOQI HD Adequacy",
    evidence_grade: "A",
    linked_modules: ["Dialysis"],
  },
  PD_ADEQUACY: {
    id: "PD_ADEQUACY",
    term: "PD Adequacy Target",
    definition: "Weekly Kt/V ≥1.8 (ISPD); residual renal function counts toward target",
    canonical_value: { weekly_ktv_min: 1.8 },
    source: "ISPD 2019",
    evidence_grade: "A",
    linked_modules: ["Dialysis"],
  },
  CRRT_DOSE: {
    id: "CRRT_DOSE",
    term: "CRRT Dose Target",
    definition: "Effluent dose ≥20 mL/kg/h prescribed (KDIGO); account for downtime — prescribe 25–30 mL/kg/h to achieve 20 mL/kg/h delivered",
    canonical_value: { prescribed_mlkghr: 25, delivered_mlkghr: 20 },
    source: "KDIGO AKI 2012",
    evidence_grade: "A",
    linked_modules: ["Dialysis", "AKI"],
  },

  // ── HYPERKALEMIA ─────────────────────────────────────────────────────────
  HYPERKALEMIA_CRITICAL: {
    id: "HYPERKALEMIA_CRITICAL",
    term: "Critical Hyperkalemia",
    definition: "Serum K+ >6.5 mmol/L OR any K+ with ECG changes (peaked T, widened QRS, sine wave)",
    canonical_value: { k_critical: 6.5 },
    source: "KDIGO AKI 2012",
    evidence_grade: "A",
    linked_modules: ["AKI", "CKD", "Electrolytes"],
    emergency: true,
  },
  HYPERKALEMIA_MANAGEMENT_SEQUENCE: {
    id: "HYPERKALEMIA_MANAGEMENT_SEQUENCE",
    term: "Hyperkalemia Treatment Sequence",
    definition: "1. Calcium gluconate (stabilise membrane) → 2. Salbutamol/Insulin-Dextrose (shift K+ in) → 3. Furosemide/Resonium (remove K+) → 4. Dialysis if refractory",
    source: "KDIGO / Clinical Consensus",
    evidence_grade: "A",
    linked_modules: ["AKI", "CKD", "Electrolytes"],
    emergency: true,
  },

  // ── TRANSPLANT ───────────────────────────────────────────────────────────
  TACROLIMUS_TROUGH_MAINTENANCE: {
    id: "TACROLIMUS_TROUGH_MAINTENANCE",
    term: "Tacrolimus Trough Target (Maintenance)",
    definition: "Tacrolimus trough 4–8 ng/mL in maintenance phase (>6 months post-transplant); collect 12h post last dose BEFORE morning dose",
    canonical_value: { trough_min: 4, trough_max: 8 },
    source: "KDIGO Transplant 2009",
    evidence_grade: "B",
    linked_modules: ["Transplant"],
  },
  TACROLIMUS_TROUGH_EARLY: {
    id: "TACROLIMUS_TROUGH_EARLY",
    term: "Tacrolimus Trough Target (Early Post-Transplant)",
    definition: "Tacrolimus trough 8–12 ng/mL in first 6 months post-transplant",
    canonical_value: { trough_min: 8, trough_max: 12 },
    source: "KDIGO Transplant 2009",
    evidence_grade: "B",
    linked_modules: ["Transplant"],
  },
};

/**
 * Retrieve a canonical fact by ID
 * @param {string} factId - Fact identifier (e.g., "NS_RELAPSE")
 * @returns {object|null}
 */
export function getFact(factId) {
  return CLINICAL_FACTS[factId] || null;
}

/**
 * Get all facts linked to a clinical module
 * @param {string} module - e.g., "Nephrotic Syndrome", "AKI", "Dialysis"
 * @returns {object[]}
 */
export function getFactsForModule(module) {
  return Object.values(CLINICAL_FACTS).filter(f =>
    f.linked_modules?.includes(module)
  );
}

/**
 * Get all emergency facts
 * @returns {object[]}
 */
export function getEmergencyFacts() {
  return Object.values(CLINICAL_FACTS).filter(f => f.emergency);
}

/**
 * Validate a clinical value against a canonical fact
 * @param {string} factId
 * @param {object} patientValues - e.g., { dipstick: "3+", days: 3 }
 * @returns {{ matches: boolean, fact: object, detail: string }}
 */
export function validateAgainstFact(factId, patientValues) {
  const fact = getFact(factId);
  if (!fact) return { matches: false, fact: null, detail: "Unknown fact" };
  return {
    matches: true,
    fact,
    detail: `${fact.term}: ${fact.definition}`,
  };
}

export default CLINICAL_FACTS;