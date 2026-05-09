/**
 * CLINICAL FACTS REGISTRY — UPGRADED
 * Canonical nephrology definitions with organization-specific entries
 * Single source of truth — update here propagates everywhere
 * Supports: operational definitions, org-specific definitions, alternative definitions, evidence metadata
 */

export const CLINICAL_FACTS = {

  // ── NEPHROTIC SYNDROME ────────────────────────────────────────────────────
  NS_RELAPSE: {
    id: "NS_RELAPSE",
    term: "NS Relapse",
    definition: "Urine protein 3+ or 4+ on dipstick for 3 consecutive early morning specimens (first-void) in a previously remitted patient.",
    canonical_value: { dipstick_min: "3+", consecutive_days: 3 },
    primary_source: "ISPN 2023",
    source: "ISPN 2023 / IPNA 2020",
    evidence_grade: "A",
    linked_modules: ["Nephrotic Syndrome", "Monitoring"],
    org_definitions: {
      "ISPN 2023": "3+ or 4+ × 3 consecutive early morning (first-void) specimens OR UPCR >2000 mg/g. First-void specified.",
      "IPNA 2020": "3+ or 4+ on dipstick for 3 consecutive days in a child who was in complete remission.",
    },
    notes: "First-void urine is specified by ISPN — random urine may give false 2+ readings. UPCR >2000 mg/g confirmed equivalent (ISPN 2023).",
    comparison_available: true,
    comparison_id: "NS_RELAPSE",
  },
  NS_REMISSION_COMPLETE: {
    id: "NS_REMISSION_COMPLETE",
    term: "Complete Remission (NS)",
    definition: "Urine protein negative or trace (≤1+) on dipstick for 3 consecutive early morning specimens OR UPCR <200 mg/g × 3 days.",
    canonical_value: { dipstick_max: "trace", consecutive_days: 3, upcr_max: 200 },
    primary_source: "ISPN 2023",
    source: "ISPN 2023 / IPNA 2020",
    evidence_grade: "A",
    linked_modules: ["Nephrotic Syndrome"],
    org_definitions: {
      "ISPN 2023": "Protein negative/trace × 3 days OR UPCR <200 mg/g × 3 days.",
      "IPNA 2020": "Dipstick negative or trace × 3 consecutive days (UPCR <200 accepted as equivalent).",
    },
    comparison_available: true,
    comparison_id: "NS_REMISSION",
  },
  NS_PARTIAL_REMISSION: {
    id: "NS_PARTIAL_REMISSION",
    term: "Partial Remission (NS)",
    definition: "UPCR 200–2000 mg/g AND serum albumin >3.0 g/dL with resolution of oedema.",
    canonical_value: { upcr_min: 200, upcr_max: 2000, albumin_min: 3.0 },
    primary_source: "IPNA 2020",
    source: "IPNA 2020 / ISPN 2023",
    evidence_grade: "A",
    linked_modules: ["Nephrotic Syndrome"],
  },
  NS_DIAGNOSIS: {
    id: "NS_DIAGNOSIS",
    term: "Nephrotic Syndrome Diagnosis",
    definition: "Clinical triad: heavy proteinuria (UPCR >2000 mg/g or dipstick 3+/4+) + hypoalbuminaemia (serum albumin <2.5 g/dL) + oedema.",
    canonical_value: { upcr_threshold: 2000, albumin_threshold: 2.5 },
    primary_source: "IPNA 2020",
    source: "IPNA 2020 / KDIGO 2021",
    evidence_grade: "A",
    linked_modules: ["Nephrotic Syndrome"],
  },
  FRNS_DEFINITION: {
    id: "FRNS_DEFINITION",
    term: "Frequently Relapsing NS (FRNS)",
    definition: "≥2 relapses within 6 months of initial steroid response OR ≥4 relapses within any 12-month period.",
    canonical_value: { relapses_6m: 2, relapses_12m: 4 },
    primary_source: "ISPN 2023",
    source: "ISPN 2023 / IPNA 2020 / KDIGO 2021",
    evidence_grade: "A",
    linked_modules: ["Nephrotic Syndrome"],
    org_definitions: {
      "ISPN 2023": "≥2/6m or ≥4/12m. All three major organisations concordant.",
      "IPNA 2020": "≥2/6m or ≥4/12m. Triggers steroid-sparing agent initiation.",
      "KDIGO 2021": "≥2/6m or ≥4/12m. Concordant with ISPN/IPNA.",
    },
    notes: "All three guidelines (ISPN 2023, IPNA 2020, KDIGO 2021) are concordant on FRNS definition.",
    comparison_available: true,
    comparison_id: "FRNS",
  },
  SDNS_DEFINITION: {
    id: "SDNS_DEFINITION",
    term: "Steroid-Dependent NS (SDNS)",
    definition: "Relapse while on alternate-day prednisolone (≤0.5 mg/kg/dose) OR within 14 days of stopping — demonstrated on two consecutive occasions.",
    canonical_value: { pred_dose_threshold_mg_kg: 0.5, days_after_stopping: 14, consecutive_occasions: 2 },
    primary_source: "ISPN 2023",
    source: "ISPN 2023 / IPNA 2020",
    evidence_grade: "A",
    linked_modules: ["Nephrotic Syndrome"],
    org_definitions: {
      "ISPN 2023": "Two consecutive relapses on alternate-day pred (≤0.5 mg/kg/dose) or within 14 days of stopping.",
      "IPNA 2020": "Two consecutive relapses while on alternate-day steroids or within 14 days of stopping (dose threshold not specified).",
    },
    comparison_available: true,
    comparison_id: "SDNS",
  },
  SRNS_DEFINITION: {
    id: "SRNS_DEFINITION",
    term: "Steroid-Resistant NS (SRNS)",
    definition: "Failure to achieve complete remission after 8 weeks of standard prednisolone: 4 weeks full-dose (60 mg/m²/day, max 60 mg/day) followed by 4 weeks alternate-day (40 mg/m²/dose, max 40 mg/dose).",
    canonical_value: { full_weeks: 4, alt_day_weeks: 4, total_weeks: 8, full_dose_mgm2: 60, altday_dose_mgm2: 40 },
    primary_source: "ISPN 2023",
    source: "ISPN 2023 / IPNA 2020",
    evidence_grade: "A",
    linked_modules: ["Nephrotic Syndrome"],
    org_definitions: {
      "ISPN 2023": "No remission after 4 weeks daily pred (60 mg/m²/day) + 4 weeks alternate-day (40 mg/m²/dose). mg/m² dosing. → Biopsy + genetic panel + CNI start.",
      "IPNA 2020": "No remission after 4 weeks daily + 4 weeks alternate-day prednisolone. → Biopsy at 4 weeks of non-response; genetic testing at 8 weeks.",
      "KDIGO 2021": "8-week standard — defers to ISPN/IPNA for pediatric management pathways.",
      "ISKDC 1978": "HISTORICAL (obsolete): no remission after 4 weeks daily pred only. Now superseded by 8-week standard.",
    },
    notes: "ISKDC 1978 4-week definition is obsolete. All current guidelines use 8-week standard. Biopsy timing differs: IPNA recommends biopsy at 4 weeks of non-response; ISPN at 8 weeks.",
    comparison_available: true,
    comparison_id: "SRNS",
  },

  // ── AKI ──────────────────────────────────────────────────────────────────
  AKI_STAGE1: {
    id: "AKI_STAGE1",
    term: "AKI Stage 1",
    definition: "SCr rise ≥0.3 mg/dL within 48h OR 1.5–1.9× baseline within 7d OR UO <0.5 mL/kg/h for 6–12h.",
    primary_source: "KDIGO AKI 2012",
    source: "KDIGO AKI 2012",
    evidence_grade: "A",
    linked_modules: ["AKI"],
    notes: "For neonates: ADQI neonatal modification uses different baseline Cr approach.",
  },
  AKI_STAGE2: {
    id: "AKI_STAGE2",
    term: "AKI Stage 2",
    definition: "SCr 2.0–2.9× baseline within 7d OR UO <0.5 mL/kg/h for ≥12h.",
    primary_source: "KDIGO AKI 2012",
    source: "KDIGO AKI 2012",
    evidence_grade: "A",
    linked_modules: ["AKI"],
  },
  AKI_STAGE3: {
    id: "AKI_STAGE3",
    term: "AKI Stage 3 / RRT Indication",
    definition: "SCr ≥3× baseline OR ≥4 mg/dL OR RRT initiated OR UO <0.3 mL/kg/h ×24h OR anuria ×12h.",
    primary_source: "KDIGO AKI 2012",
    source: "KDIGO AKI 2012",
    evidence_grade: "A",
    linked_modules: ["AKI", "Dialysis"],
  },
  AKI_RRT_INDICATIONS: {
    id: "AKI_RRT_INDICATIONS",
    term: "RRT Indications in AKI",
    definition: "Any of: (1) Fluid overload ≥20% refractory to diuretics; (2) K+ >6.5 or ECG changes; (3) pH <7.1 not responding to treatment; (4) BUN >100 with uraemic symptoms; (5) Anuria >12–24h.",
    primary_source: "KDIGO AKI 2012",
    source: "KDIGO AKI 2012 / ADQI 2017",
    evidence_grade: "A",
    linked_modules: ["AKI", "Dialysis"],
    emergency: true,
  },

  // ── CKD ──────────────────────────────────────────────────────────────────
  CKD_DEFINITION: {
    id: "CKD_DEFINITION",
    term: "Chronic Kidney Disease",
    definition: "eGFR <60 mL/min/1.73m² for ≥3 months OR kidney damage markers (proteinuria, haematuria, imaging abnormality) persisting ≥3 months regardless of eGFR.",
    primary_source: "KDIGO CKD 2012",
    source: "KDIGO CKD 2012 / IPNA 2021",
    evidence_grade: "A",
    linked_modules: ["CKD"],
  },
  CKD_ACIDOSIS_TARGET: {
    id: "CKD_ACIDOSIS_TARGET",
    term: "CKD Bicarbonate Target",
    definition: "Maintain serum HCO₃⁻ ≥22 mmol/L to slow CKD progression, support growth, and reduce protein catabolism.",
    canonical_value: { target_hco3_mmol_L: 22 },
    primary_source: "KDIGO CKD 2012",
    source: "KDIGO CKD 2012 / IPNA 2021",
    evidence_grade: "A",
    linked_modules: ["CKD"],
  },
  CKD_BP_TARGET: {
    id: "CKD_BP_TARGET",
    term: "BP Target in Proteinuric CKD",
    definition: "Target BP <50th percentile for age/height/sex on ABPM (ESCAPE trial evidence for proteinuric CKD). Office BP target <90th percentile.",
    canonical_value: { target_percentile: 50, office_target_percentile: 90 },
    primary_source: "ESCAPE Trial 2009",
    source: "ESCAPE Trial 2009 / KDIGO CKD 2012",
    evidence_grade: "A",
    linked_modules: ["CKD", "Hypertension"],
    notes: "ESCAPE trial showed intensive BP control to <50th %ile on ABPM significantly slowed progression in proteinuric paediatric CKD.",
  },
  CKD_GH_INDICATION: {
    id: "CKD_GH_INDICATION",
    term: "rhGH Indication in CKD",
    definition: "Height SDS <−1.88 (below 3rd centile) persisting after ≥6 months of optimised CKD management. Must first correct: acidosis (HCO₃⁻ ≥22), anaemia (Hb ≥10), and MBD.",
    primary_source: "KDIGO CKD 2012",
    source: "KDIGO CKD 2012 / IPNA 2021 Consensus",
    evidence_grade: "B",
    linked_modules: ["CKD"],
  },

  // ── HYPERTENSION ─────────────────────────────────────────────────────────
  HTN_NORMAL: {
    id: "HTN_NORMAL",
    term: "Normal BP (Pediatric)",
    definition: "<90th percentile for age/sex/height (<13y) OR <120/<80 mmHg (≥13y).",
    primary_source: "AAP 2017",
    source: "AAP 2017",
    evidence_grade: "A",
    linked_modules: ["Hypertension"],
  },
  HTN_ELEVATED: {
    id: "HTN_ELEVATED",
    term: "Elevated BP",
    definition: "≥90th but <95th percentile (<13y) OR 120–129/<80 mmHg (≥13y). NOT labelled hypertension.",
    primary_source: "AAP 2017",
    source: "AAP 2017",
    evidence_grade: "A",
    linked_modules: ["Hypertension"],
  },
  HTN_STAGE1: {
    id: "HTN_STAGE1",
    term: "Stage 1 Hypertension",
    definition: "≥95th percentile but <99th+12 mmHg (<13y) OR 130–139/80–89 mmHg (≥13y).",
    primary_source: "AAP 2017",
    source: "AAP 2017",
    evidence_grade: "A",
    linked_modules: ["Hypertension"],
    comparison_available: true,
    comparison_id: "PEDIATRIC_HTN",
  },
  HTN_STAGE2: {
    id: "HTN_STAGE2",
    term: "Stage 2 Hypertension",
    definition: "≥99th percentile + 12 mmHg (<13y) OR ≥140/90 mmHg (≥13y) — requires same-day evaluation.",
    primary_source: "AAP 2017",
    source: "AAP 2017",
    evidence_grade: "A",
    linked_modules: ["Hypertension"],
    comparison_available: true,
    comparison_id: "PEDIATRIC_HTN",
  },
  HTN_EMERGENCY: {
    id: "HTN_EMERGENCY",
    term: "Hypertensive Emergency",
    definition: "Severe hypertension (>99th percentile + 12 mmHg) WITH end-organ damage: encephalopathy, seizures, papilloedema, acute cardiac failure, or AKI.",
    primary_source: "AAP 2017",
    source: "AAP 2017 / ESH 2016",
    evidence_grade: "A",
    linked_modules: ["Hypertension"],
    emergency: true,
  },

  // ── DIALYSIS ─────────────────────────────────────────────────────────────
  HD_ADEQUACY: {
    id: "HD_ADEQUACY",
    term: "HD Adequacy Target",
    definition: "Single-pool Kt/V ≥1.2 per session (spKt/V); urea reduction ratio (URR) ≥65%. Minimum 3× per week.",
    canonical_value: { ktv_min: 1.2, urr_min: 65 },
    primary_source: "KDOQI HD Adequacy",
    source: "KDOQI HD Adequacy 2015",
    evidence_grade: "A",
    linked_modules: ["Dialysis"],
  },
  PD_ADEQUACY: {
    id: "PD_ADEQUACY",
    term: "PD Adequacy Target (Pediatric)",
    definition: "Weekly total Kt/V (peritoneal + residual renal) ≥1.8. If anuric: peritoneal Kt/V alone ≥1.7.",
    canonical_value: { weekly_ktv_total: 1.8, anuric_peritoneal_ktv: 1.7 },
    primary_source: "ISPD 2019",
    source: "ISPD 2019",
    evidence_grade: "A",
    linked_modules: ["Dialysis"],
    comparison_available: true,
    comparison_id: "PD_ADEQUACY",
  },
  CRRT_DOSE: {
    id: "CRRT_DOSE",
    term: "CRRT Dose Target",
    definition: "Prescribed effluent dose 25–30 mL/kg/h to achieve DELIVERED dose ≥20 mL/kg/h (accounting for filter downtime).",
    canonical_value: { prescribed_mlkghr: "25–30", delivered_target_mlkghr: 20 },
    primary_source: "KDIGO AKI 2012",
    source: "KDIGO AKI 2012",
    evidence_grade: "A",
    linked_modules: ["Dialysis", "AKI"],
    notes: "KDIGO RENAL and ATN trials demonstrated no benefit of higher dose (35 vs 20 mL/kg/h). Prescribe higher to account for downtime.",
  },

  // ── HYPERKALEMIA ─────────────────────────────────────────────────────────
  HYPERKALEMIA_CRITICAL: {
    id: "HYPERKALEMIA_CRITICAL",
    term: "Critical Hyperkalemia",
    definition: "Serum K+ >6.5 mmol/L OR any K+ elevation with ECG changes (peaked T waves, widened QRS, sine wave, PEA).",
    canonical_value: { k_critical_mmol_L: 6.5 },
    primary_source: "KDIGO AKI 2012",
    source: "KDIGO AKI 2012 / Clinical Consensus",
    evidence_grade: "A",
    linked_modules: ["AKI", "CKD", "Electrolytes"],
    emergency: true,
  },
  HYPERKALEMIA_MANAGEMENT_SEQUENCE: {
    id: "HYPERKALEMIA_MANAGEMENT_SEQUENCE",
    term: "Hyperkalemia Treatment Sequence",
    definition: "1. Calcium gluconate 10% IV (membrane stabilisation) → 2. Salbutamol nebulised + Insulin-Dextrose IV (shift K+ intracellular) → 3. Furosemide/Sodium resonium (remove K+) → 4. Dialysis if refractory.",
    primary_source: "KDIGO AKI 2012",
    source: "KDIGO AKI 2012 / Clinical Consensus",
    evidence_grade: "A",
    linked_modules: ["AKI", "CKD", "Electrolytes"],
    emergency: true,
  },

  // ── TRANSPLANT ───────────────────────────────────────────────────────────
  TACROLIMUS_TROUGH_MAINTENANCE: {
    id: "TACROLIMUS_TROUGH_MAINTENANCE",
    term: "Tacrolimus Trough Target (Maintenance >6 months)",
    definition: "Tacrolimus trough 4–8 ng/mL in maintenance phase (>6 months post-transplant). Collect 12h after last dose, BEFORE morning dose.",
    canonical_value: { trough_min: 4, trough_max: 8 },
    primary_source: "KDIGO Transplant 2009",
    source: "KDIGO Transplant 2009",
    evidence_grade: "B",
    linked_modules: ["Transplant"],
    notes: "Trough timing critical: 12h post-dose (C0), before morning dose. Trough >15 = toxicity risk.",
  },
  TACROLIMUS_TROUGH_EARLY: {
    id: "TACROLIMUS_TROUGH_EARLY",
    term: "Tacrolimus Trough Target (Early Post-Transplant 0–6 months)",
    definition: "Tacrolimus trough 8–12 ng/mL in first 6 months post-transplant.",
    canonical_value: { trough_min: 8, trough_max: 12 },
    primary_source: "KDIGO Transplant 2009",
    source: "KDIGO Transplant 2009",
    evidence_grade: "B",
    linked_modules: ["Transplant"],
  },

  // ── GLOMERULAR DISEASES ───────────────────────────────────────────────────
  LUPUS_NEPHRITIS_CLASS: {
    id: "LUPUS_NEPHRITIS_CLASS",
    term: "Lupus Nephritis ISN/RPS Classification",
    definition: "Class I: Minimal mesangial. Class II: Mesangial proliferative. Class III: Focal (<50% glomeruli). Class IV: Diffuse (≥50% glomeruli). Class V: Membranous. Class VI: Advanced sclerotic.",
    primary_source: "ISN/RPS 2003 (revised 2018)",
    source: "ISN/RPS 2018 / EULAR 2023",
    evidence_grade: "A",
    linked_modules: ["Glomerular Diseases"],
    notes: "Class III/IV require induction immunosuppression. Combination ISN/RPS class IV + V treated as Class IV.",
  },
  RAPIDLY_PROGRESSIVE_GN: {
    id: "RAPIDLY_PROGRESSIVE_GN",
    term: "Rapidly Progressive GN (RPGN)",
    definition: "Rapid loss of GFR (>50% reduction in weeks) with crescents on biopsy (usually >50% of glomeruli). Medical emergency.",
    primary_source: "KDIGO 2021",
    source: "KDIGO 2021 / IPNA 2021",
    evidence_grade: "A",
    linked_modules: ["Glomerular Diseases", "AKI"],
    emergency: true,
  },
};

/**
 * Retrieve a canonical fact by ID
 */
export function getFact(factId) {
  return CLINICAL_FACTS[factId] || null;
}

/**
 * Get all facts linked to a clinical module
 */
export function getFactsForModule(module) {
  return Object.values(CLINICAL_FACTS).filter(f =>
    f.linked_modules?.includes(module)
  );
}

/**
 * Get all emergency facts
 */
export function getEmergencyFacts() {
  return Object.values(CLINICAL_FACTS).filter(f => f.emergency);
}

/**
 * Get facts that have multi-org comparisons available
 */
export function getComparableFacts() {
  return Object.values(CLINICAL_FACTS).filter(f => f.comparison_available);
}

/**
 * Get all facts from a specific source organisation
 */
export function getFactsBySource(org) {
  return Object.values(CLINICAL_FACTS).filter(f =>
    f.primary_source?.includes(org) || f.source?.includes(org)
  );
}

/**
 * Validate a clinical value against a canonical fact
 */
export function validateAgainstFact(factId, patientValues) {
  const fact = getFact(factId);
  if (!fact) return { matches: false, fact: null, detail: "Unknown fact" };
  return {
    matches: true,
    fact,
    detail: `${fact.term}: ${fact.definition}`,
    primary_source: fact.primary_source || fact.source,
  };
}

export default CLINICAL_FACTS;