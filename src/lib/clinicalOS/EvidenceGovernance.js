/**
 * EVIDENCE GOVERNANCE SYSTEM
 * Multi-guideline definitions, hierarchy, comparison engine,
 * and expert-review workflow for Pediatric Nephrology Clinical OS
 */

// ── PRIMARY OPERATIONAL GUIDELINE HIERARCHY ───────────────────────────────
export const GUIDELINE_HIERARCHY = {
  nephrotic_syndrome: {
    primary: { org: "ISPN", year: 2023, full: "International Society for Pediatric Nephrology 2023", short: "ISPN 2023" },
    supporting: [
      { org: "IPNA", year: 2020, full: "International Pediatric Nephrology Association 2020" },
      { org: "KDIGO", year: 2021, full: "KDIGO Glomerular Diseases 2021" },
      { org: "ISKDC", year: 1978, full: "International Study of Kidney Disease in Children (historical)" },
    ],
    rationale: "ISPN 2023 is the most recent pediatric-specific comprehensive NS guideline; IPNA 2020 remains operational for certain subsets.",
  },
  hypertension: {
    primary: { org: "AAP", year: 2017, full: "American Academy of Pediatrics CPG 2017", short: "AAP 2017" },
    supporting: [
      { org: "ESH", year: 2016, full: "European Society of Hypertension 2016" },
      { org: "ESCAPE", year: 2009, full: "ESCAPE Trial — BP targets in CKD" },
    ],
    rationale: "AAP 2017 provides pediatric-specific age/sex/height-based BP percentile tables used in all pathway logic.",
  },
  uti: {
    primary: { org: "ISPN", year: 2023, full: "ISPN UTI Guidelines 2023", short: "ISPN 2023" },
    supporting: [
      { org: "AAP", year: 2011, full: "AAP UTI Guideline 2011 (updated 2016)" },
      { org: "NICE", year: 2022, full: "NICE CG54 2022" },
    ],
    rationale: "ISPN provides pediatric nephrology-specific guidance; AAP operational for community-level management.",
  },
  ckd: {
    primary: { org: "IPNA", year: 2021, full: "IPNA CKD Clinical Practice Recommendations 2021", short: "IPNA 2021" },
    supporting: [
      { org: "KDIGO", year: 2012, full: "KDIGO CKD 2012" },
      { org: "KDOQI", year: 2002, full: "KDOQI Pediatric CKD" },
    ],
    rationale: "IPNA 2021 is pediatric-specific; KDIGO 2012 provides foundational staging used across all ages.",
  },
  glomerular_diseases: {
    primary: { org: "IPNA", year: 2021, full: "IPNA Clinical Practice Recommendations 2021", short: "IPNA 2021" },
    supporting: [
      { org: "KDIGO", year: 2021, full: "KDIGO Glomerular Diseases 2021" },
      { org: "EULAR", year: 2023, full: "EULAR/ERA-EDTA Lupus Nephritis 2023" },
    ],
    rationale: "IPNA 2021 for pediatric-specific pathways; KDIGO 2021 for adult-extrapolated guidance where pediatric data limited.",
  },
  tubulopathies: {
    primary: { org: "ERKNet", year: 2021, full: "European Rare Kidney Disease Network 2021", short: "ERKNet 2021" },
    supporting: [
      { org: "ESPN", year: 2022, full: "European Society for Paediatric Nephrology 2022" },
    ],
    rationale: "ERKNet provides rare tubulopathy-specific protocols; ESPN supports management algorithms.",
  },
  peritoneal_dialysis: {
    primary: { org: "ISPD", year: 2019, full: "International Society for Peritoneal Dialysis 2019", short: "ISPD 2019" },
    supporting: [
      { org: "ESPN", year: 2020, full: "ESPN Dialysis Guidelines 2020" },
    ],
    rationale: "ISPD 2019 is the definitive operational guideline for PD adequacy, peritonitis management, and catheter care.",
  },
  aki: {
    primary: { org: "KDIGO", year: 2012, full: "KDIGO AKI Guidelines 2012", short: "KDIGO 2012" },
    supporting: [
      { org: "ADQI", year: 2017, full: "ADQI Pediatric AKI Consensus 2017" },
      { org: "pRIFLE", year: 2007, full: "pRIFLE Pediatric AKI Staging 2007" },
    ],
    rationale: "KDIGO 2012 staging universally applied; pediatric adaptations from ADQI consensus for neonates/small children.",
  },
};

// ── MULTI-ORGANIZATION DEFINITION REGISTRY ────────────────────────────────
export const MULTI_ORG_DEFINITIONS = {
  SRNS: {
    term: "Steroid-Resistant Nephrotic Syndrome (SRNS)",
    clinical_importance: "Definition determines biopsy timing, genetic workup, and immunosuppression selection. Different criteria between organizations have significant operational implications.",
    definitions: [
      {
        org: "ISPN",
        year: 2023,
        criteria: "Failure to achieve complete remission (urine protein negative/trace × 3 days) after 8 weeks of oral prednisolone: 4 weeks daily at 60 mg/m²/day (max 60 mg/day) + 4 weeks alternate-day at 40 mg/m²/dose (max 40 mg/dose).",
        thresholds: { full_dose_weeks: 4, alt_day_weeks: 4, total_weeks: 8, dose_daily: "60 mg/m²/day", dose_altday: "40 mg/m²/dose" },
        operational_implications: "Biopsy + genetic panel at 8 weeks. Start calcineurin inhibitor (tacrolimus preferred) immediately.",
        note: "ISPN 2023 specifies mg/m² dosing — note difference from ISKDC weight-based historical protocol.",
      },
      {
        org: "IPNA",
        year: 2020,
        criteria: "Failure to achieve complete remission after prednisolone 60 mg/m²/day (max 60 mg) for 4 weeks followed by 40 mg/m²/alternate day for 4 weeks (total 8 weeks).",
        thresholds: { full_dose_weeks: 4, alt_day_weeks: 4, total_weeks: 8 },
        operational_implications: "Biopsy recommended at 4 weeks if no response. Genetic testing at 8 weeks.",
        note: "IPNA 2020 and ISPN 2023 criteria are essentially concordant; differ in subsequent management pathways.",
      },
      {
        org: "KDIGO",
        year: 2021,
        criteria: "No remission despite adequate steroid therapy for 8 weeks. Definition aligned with IPNA/ISPN for childhood NS.",
        thresholds: { total_weeks: 8 },
        operational_implications: "KDIGO 2021 provides adult-adapted guidance; pediatric practice follows ISPN/IPNA.",
        note: "KDIGO defers to pediatric-specific guidelines (ISPN/IPNA) for childhood SRNS management.",
      },
      {
        org: "ISKDC",
        year: 1978,
        criteria: "Historical: failure to remit after 4 weeks of daily prednisolone (60 mg/m²/day) alone. Weight-based dosing.",
        thresholds: { full_dose_weeks: 4 },
        operational_implications: "Historical reference only — 4-week definition superseded by 8-week standard.",
        note: "ISKDC 1978 (4-week definition) is now outdated. Modern practice uses 8-week standard.",
        is_historical: true,
      },
    ],
    consensus_summary: "All current guidelines (ISPN 2023, IPNA 2020, KDIGO 2021) use 8-week standard prednisolone before labelling SRNS. ISKDC historical 4-week definition is obsolete.",
    controversy: "Some centres still use 4-week non-response to trigger biopsy (not to label SRNS); this is consistent with IPNA 2020 biopsy guidance.",
  },

  FRNS: {
    term: "Frequently Relapsing Nephrotic Syndrome (FRNS)",
    clinical_importance: "Triggers steroid-sparing agent initiation. Definition must be met before starting MMF, levamisole, or calcineurin inhibitors.",
    definitions: [
      {
        org: "ISPN",
        year: 2023,
        criteria: "≥2 relapses within 6 months of initial response OR ≥4 relapses in any 12-month period.",
        thresholds: { relapses_6m: 2, relapses_12m: 4 },
        operational_implications: "Meets FRNS → offer levamisole or low-dose alternate-day prednisolone first; escalate to MMF if needed.",
        note: "ISPN 2023 preferred over ISKDC 1981 definition which required relapses within 6m of initial response only.",
      },
      {
        org: "IPNA",
        year: 2020,
        criteria: "≥2 relapses in 6 months of initial response OR ≥4 relapses in any 12 months.",
        thresholds: { relapses_6m: 2, relapses_12m: 4 },
        operational_implications: "Concordant with ISPN 2023. MMF or levamisole first-line after establishing FRNS.",
        note: "IPNA 2020 and ISPN 2023 are operationally identical for FRNS definition.",
      },
      {
        org: "KDIGO",
        year: 2021,
        criteria: "2 or more relapses within a 6-month period following initial response, or 4 or more relapses within any 12-month period.",
        thresholds: { relapses_6m: 2, relapses_12m: 4 },
        operational_implications: "Concordant across organisations. Threshold is the same.",
        note: "No significant operational difference between ISPN/IPNA/KDIGO for FRNS definition.",
      },
    ],
    consensus_summary: "All three organisations are concordant on FRNS definition: ≥2/6m or ≥4/12m. No operational controversy.",
  },

  SDNS: {
    term: "Steroid-Dependent Nephrotic Syndrome (SDNS)",
    clinical_importance: "Determines steroid-sparing approach. SDNS patients often require calcineurin inhibitors or rituximab.",
    definitions: [
      {
        org: "ISPN",
        year: 2023,
        criteria: "Relapse while on alternate-day prednisolone (≤0.5 mg/kg/dose) OR within 14 days of stopping prednisolone. Must be demonstrated on two consecutive occasions.",
        thresholds: { pred_threshold_mg_kg: 0.5, days_after_stopping: 14, consecutive_occasions: 2 },
        operational_implications: "Triggers CNI (tacrolimus) or rituximab pathway. Genetic panel recommended for SDNS with early age of onset.",
        note: "ISPN 2023 requires demonstration on two occasions to avoid labelling based on single episode.",
      },
      {
        org: "IPNA",
        year: 2020,
        criteria: "Two consecutive relapses while on alternate-day steroids or within 14 days of stopping steroids.",
        thresholds: { days_after_stopping: 14, consecutive_occasions: 2 },
        operational_implications: "Concordant with ISPN 2023.",
        note: "IPNA does not specify dose threshold for steroid dependency; ISPN specifies ≤0.5 mg/kg/dose.",
      },
    ],
    consensus_summary: "ISPN 2023 and IPNA 2020 are aligned. The dose threshold (≤0.5 mg/kg/dose) is ISPN-specific but not operationally different in practice.",
  },

  NS_REMISSION: {
    term: "NS Complete Remission",
    clinical_importance: "Response assessment endpoint. Used to determine steroid response and steroid course completion.",
    definitions: [
      {
        org: "ISPN",
        year: 2023,
        criteria: "Urine protein negative or trace (≤1+) on dipstick for 3 consecutive early morning specimens OR urine protein:creatinine ratio (UPCR) <200 mg/g for 3 consecutive days.",
        thresholds: { dipstick_max: "trace", consecutive_days: 3, upcr_max: 200 },
        operational_implications: "Both dipstick and UPCR criteria accepted. UPCR preferred for quantitative follow-up.",
        note: "ISPN 2023 explicitly accepts either dipstick or UPCR — previous definitions relied on dipstick only.",
      },
      {
        org: "IPNA",
        year: 2020,
        criteria: "Urine protein negative or trace on dipstick for 3 consecutive days.",
        thresholds: { dipstick_max: "trace", consecutive_days: 3 },
        operational_implications: "Dipstick-based. UPCR <200 considered equivalent by most centres.",
        note: "IPNA 2020 dipstick-primary; UPCR equivalence is widely accepted in practice.",
      },
    ],
    consensus_summary: "Functionally concordant. ISPN 2023 explicitly accepts UPCR <200 mg/g as equivalent to dipstick negative/trace × 3 days.",
  },

  NS_RELAPSE: {
    term: "NS Relapse",
    clinical_importance: "Triggers reinstitution of full-dose steroids. Relapse counting determines FRNS/SDNS status.",
    definitions: [
      {
        org: "ISPN",
        year: 2023,
        criteria: "Urine protein 3+ or 4+ on dipstick for 3 consecutive early morning specimens (first-void) in a previously remitted patient OR UPCR >2000 mg/g.",
        thresholds: { dipstick_min: "3+", consecutive_days: 3, upcr_threshold: 2000 },
        operational_implications: "Parent-monitored home dipstick testing is standard. UPCR >2000 confirms relapse if dipstick equivocal.",
        note: "First-void urine is specified — random urine may give false 2+ readings.",
      },
      {
        org: "IPNA",
        year: 2020,
        criteria: "Urine protein 3+ or 4+ on dipstick testing for 3 consecutive days in a child who has been in complete remission.",
        thresholds: { dipstick_min: "3+", consecutive_days: 3 },
        operational_implications: "Concordant with ISPN. Home monitoring recommended.",
        note: "Both ISPN and IPNA concordant on 3-day 3+ threshold.",
      },
    ],
    consensus_summary: "ISPN 2023 and IPNA 2020 are concordant: 3+ for 3 consecutive days. ISPN additionally validates UPCR >2000 mg/g.",
  },

  AKI_STAGING: {
    term: "Pediatric AKI Staging",
    clinical_importance: "Staging drives management escalation: nephrology referral, fluid management, RRT timing.",
    definitions: [
      {
        org: "KDIGO",
        year: 2012,
        criteria: "Stage 1: SCr ×1.5–1.9 baseline within 7d OR rise ≥0.3 mg/dL within 48h OR UO <0.5 mL/kg/h ×6–12h. Stage 2: SCr ×2–2.9 OR UO <0.5 mL/kg/h ×12h. Stage 3: SCr ×3 OR ≥4.0 mg/dL OR RRT OR UO <0.3 mL/kg/h ×24h or anuria ×12h.",
        thresholds: { stage1_cr_factor: 1.5, stage2_cr_factor: 2.0, stage3_cr_factor: 3.0, stage3_absolute_cr: 4.0 },
        operational_implications: "KDIGO staging used universally. UO criteria require weight-based calculation.",
        note: "KDIGO applies to all ages. Baseline Cr must be established or estimated for staging.",
      },
      {
        org: "pRIFLE",
        year: 2007,
        criteria: "Risk: eCCl decrease ≥25%; Injury: eCCl decrease ≥50%; Failure: eCCl decrease ≥75% or eCCl <35 mL/min/1.73m²; Loss: persistent failure >4 weeks; End Stage: failure >3 months.",
        thresholds: { risk_decrease: 25, injury_decrease: 50, failure_decrease: 75, failure_egfr: 35 },
        operational_implications: "pRIFLE uses estimated creatinine clearance (eCCl) — useful in children with variable baseline. Validated in paediatric ICU cohorts.",
        note: "pRIFLE (2007) predates KDIGO but remains used in neonatal/infant cohorts where KDIGO baseline Cr is difficult to establish.",
      },
      {
        org: "ADQI",
        year: 2017,
        criteria: "Neonatal modification: SCr rise ≥0.3 mg/dL within 48h OR SCr ≥1.5× reference. Reference Cr = lowest Cr in first 7 days of life for neonates.",
        thresholds: { neonatal_rise: 0.3, neonatal_factor: 1.5 },
        operational_implications: "Modified criteria essential for neonates where physiological Cr transition occurs post-birth.",
        note: "ADQI neonatal AKI definition (Jetton 2016/ADQI 2017) preferred for NICU patients.",
      },
    ],
    consensus_summary: "KDIGO 2012 is the primary operational staging system. pRIFLE remains validated for paediatric ICU. ADQI neonatal modifications apply in neonates.",
  },

  PEDIATRIC_HTN: {
    term: "Pediatric Hypertension Classification",
    clinical_importance: "Classification determines investigation urgency, medication initiation, and referral pathways.",
    definitions: [
      {
        org: "AAP",
        year: 2017,
        criteria: "<13 years: Normal <90th %ile; Elevated 90–<95th %ile (or ≥120/80); Stage 1 HTN ≥95th–<95th+12 mmHg (or 130/80–139/89); Stage 2 HTN ≥95th+12 mmHg (or ≥140/90). ≥13 years: Normal <120/<80; Elevated 120–129/<80; Stage 1 130–139/80–89; Stage 2 ≥140/90.",
        thresholds: { normal_p: 90, elevated_p: 95, stage1_p: 95, stage2_p: 99, adolescent_stage1_sys: 130, adolescent_stage2_sys: 140 },
        operational_implications: "Uses sex/age/height-specific percentile tables. Adolescents ≥13y use absolute values mirroring adult ACC/AHA 2017.",
        note: "AAP 2017 is the primary operational guideline. Tables require height percentile input for accurate staging in children <13y.",
      },
      {
        org: "ESH",
        year: 2016,
        criteria: "Grade 1: 130–139/85–89 (adolescents); Grade 2: 140–159/90–99; Grade 3: ≥160/100 mmHg. Age-specific normative data used for children.",
        thresholds: { grade1_sys: 130, grade2_sys: 140, grade3_sys: 160 },
        operational_implications: "ESH uses different staging nomenclature (Grade 1/2/3 vs Stage 1/2). Less commonly applied in paediatric nephrology practice in India/Asia.",
        note: "ESH 2016 predates AAP 2017; ESH 2022 adult update not directly applied to children.",
      },
    ],
    consensus_summary: "AAP 2017 is the primary operational guideline for paediatric nephrology. ESH thresholds differ in nomenclature but similar staging values.",
    controversy: "AAP 2017 Stage 1 threshold for adolescents (≥130/80) differs from ESH (≥140/90 for Grade 2). This means a 14-year-old with BP 132/82 is Stage 1 HTN by AAP but 'elevated' by ESH.",
  },

  PD_ADEQUACY: {
    term: "Peritoneal Dialysis Adequacy Target",
    definitions: [
      {
        org: "ISPD",
        year: 2019,
        criteria: "Weekly total Kt/V ≥1.8 (combined peritoneal + residual renal). Minimum peritoneal Kt/V ≥1.7 if anuric.",
        thresholds: { weekly_ktv: 1.8, anuric_ktv: 1.7 },
        operational_implications: "Residual renal function contribution must be measured and added. Reassess as residual function declines.",
        note: "ISPD 2019 is the definitive operational standard for PD adequacy.",
      },
      {
        org: "KDOQI",
        year: 2006,
        criteria: "Weekly Kt/V ≥1.7 for CAPD; ≥1.8 for APD.",
        thresholds: { capd_ktv: 1.7, apd_ktv: 1.8 },
        operational_implications: "KDOQI targets slightly lower than ISPD 2019. ISPD 2019 supersedes as current standard.",
        note: "KDOQI 2006 is superseded by ISPD 2019 for clinical operations.",
        is_historical: true,
      },
    ],
    consensus_summary: "ISPD 2019 weekly Kt/V ≥1.8 is the current standard. KDOQI 2006 is historical.",
  },
};

// ── PATHWAY SOURCE ATTRIBUTION ─────────────────────────────────────────────
export const PATHWAY_ATTRIBUTION = {
  nephrotic_relapse: {
    name: "Nephrotic Syndrome Relapse Pathway",
    primary_source: "ISPN 2023",
    org: "International Society for Pediatric Nephrology",
    year: 2023,
    doi: "https://doi.org/10.1007/s00467-022-05400-z",
    supporting: ["IPNA 2020", "KDIGO 2021"],
  },
  srns_pathway: {
    name: "SRNS Management Pathway",
    primary_source: "ISPN 2023 + IPNA 2020",
    org: "ISPN / IPNA",
    year: 2023,
    supporting: ["KDIGO 2021"],
  },
  aki_pathway: {
    name: "Pediatric AKI Management Pathway",
    primary_source: "KDIGO AKI 2012",
    org: "Kidney Disease: Improving Global Outcomes",
    year: 2012,
    doi: "https://doi.org/10.1038/kisup.2012.9",
    supporting: ["pRIFLE 2007", "ADQI 2017"],
  },
  ckd_pathway: {
    name: "Pediatric CKD Management Pathway",
    primary_source: "IPNA 2021",
    org: "International Pediatric Nephrology Association",
    year: 2021,
    supporting: ["KDIGO 2012", "KDOQI"],
  },
  hypertension_pathway: {
    name: "Pediatric Hypertension Pathway",
    primary_source: "AAP 2017",
    org: "American Academy of Pediatrics",
    year: 2017,
    doi: "https://doi.org/10.1542/peds.2017-1904",
    supporting: ["ESH 2016", "ESCAPE trial 2009"],
  },
  pd_pathway: {
    name: "Peritoneal Dialysis Pathway",
    primary_source: "ISPD 2019",
    org: "International Society for Peritoneal Dialysis",
    year: 2019,
    supporting: ["ESPN 2020"],
  },
};

// ── EXPERT REVIEW STATUS DEFINITIONS ─────────────────────────────────────
export const REVIEW_STATUS = {
  EXPERT_REVIEWED: { label: "Expert Reviewed", color: "bg-green-100 text-green-800 border-green-200", icon: "✓" },
  PENDING_REVIEW: { label: "Pending Expert Review", color: "bg-amber-100 text-amber-800 border-amber-200", icon: "⏳" },
  AI_GENERATED: { label: "AI Generated — Awaiting Review", color: "bg-blue-100 text-blue-800 border-blue-200", icon: "🤖" },
  AI_SUGGESTION: { label: "AI Suggestion — Not Yet Approved", color: "bg-purple-100 text-purple-800 border-purple-200", icon: "💡" },
  DRAFT: { label: "Draft", color: "bg-slate-100 text-slate-700 border-slate-200", icon: "✏️" },
};

// ── COMPARISON ENGINE ──────────────────────────────────────────────────────
/**
 * Get multi-org definitions for a clinical concept
 * @param {string} conceptId - e.g. "SRNS", "FRNS", "AKI_STAGING"
 * @returns {object|null}
 */
export function getMultiOrgDefinition(conceptId) {
  return MULTI_ORG_DEFINITIONS[conceptId] || null;
}

/**
 * Compare two definitions side-by-side
 * @param {string} conceptId
 * @param {string} org1 - e.g. "ISPN"
 * @param {string} org2 - e.g. "KDIGO"
 * @returns {{ def1, def2, differences }}
 */
export function compareDefinitions(conceptId, org1, org2) {
  const concept = MULTI_ORG_DEFINITIONS[conceptId];
  if (!concept) return null;
  const def1 = concept.definitions.find(d => d.org === org1);
  const def2 = concept.definitions.find(d => d.org === org2);
  if (!def1 || !def2) return null;

  const differences = [];
  // Compare threshold keys
  const allKeys = new Set([...Object.keys(def1.thresholds || {}), ...Object.keys(def2.thresholds || {})]);
  allKeys.forEach(key => {
    const v1 = def1.thresholds?.[key];
    const v2 = def2.thresholds?.[key];
    if (v1 !== v2) {
      differences.push({ field: key, org1: v1, org2: v2, hasDifference: true });
    }
  });

  return { def1, def2, differences, concept };
}

/**
 * Get the primary operational guideline for a clinical area
 */
export function getPrimaryGuideline(area) {
  return GUIDELINE_HIERARCHY[area] || null;
}

/**
 * Get all available comparison topics
 */
export function getComparisonTopics() {
  return Object.entries(MULTI_ORG_DEFINITIONS).map(([id, concept]) => ({
    id,
    term: concept.term,
    org_count: concept.definitions.length,
    has_controversy: !!concept.controversy,
  }));
}

export default {
  GUIDELINE_HIERARCHY,
  MULTI_ORG_DEFINITIONS,
  PATHWAY_ATTRIBUTION,
  REVIEW_STATUS,
  getMultiOrgDefinition,
  compareDefinitions,
  getPrimaryGuideline,
  getComparisonTopics,
};