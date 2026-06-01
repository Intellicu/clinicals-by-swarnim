/**
 * PEDIATRIC BP PERCENTILE ENGINE — UPGRADED
 * AAP 2017 percentile tables with SEPARATE SBP and DBP percentiles
 * Classification based on HIGHER of the two percentiles (AAP operational logic)
 * Source: AAP Clinical Practice Guideline, Pediatrics 2017;140(3):e20171904
 */

/**
 * Representative BP table from AAP 2017 Appendix B (50th height percentile basis)
 * Format: age → sex → { sys percentile values, dia percentile values }
 */
const BP_TABLE = {
  1:  { M: { p50s:85, p90s:98, p95s:102, p99s:109,  p50d:40, p90d:52, p95d:54, p99d:61 },
        F: { p50s:83, p90s:97, p95s:100, p99s:108,  p50d:38, p90d:52, p95d:54, p99d:61 } },
  2:  { M: { p50s:87, p90s:101,p95s:104, p99s:112,  p50d:43, p90d:55, p95d:58, p99d:65 },
        F: { p50s:85, p90s:99, p95s:102, p99s:110,  p50d:43, p90d:56, p95d:59, p99d:66 } },
  3:  { M: { p50s:88, p90s:101,p95s:105, p99s:113,  p50d:46, p90d:58, p95d:61, p99d:68 },
        F: { p50s:86, p90s:100,p95s:104, p99s:111,  p50d:45, p90d:58, p95d:60, p99d:67 } },
  4:  { M: { p50s:89, p90s:103,p95s:106, p99s:114,  p50d:48, p90d:60, p95d:63, p99d:70 },
        F: { p50s:88, p90s:101,p95s:105, p99s:112,  p50d:47, p90d:60, p95d:62, p99d:69 } },
  5:  { M: { p50s:90, p90s:104,p95s:107, p99s:115,  p50d:49, p90d:62, p95d:65, p99d:72 },
        F: { p50s:89, p90s:103,p95s:106, p99s:114,  p50d:48, p90d:61, p95d:64, p99d:71 } },
  6:  { M: { p50s:91, p90s:105,p95s:108, p99s:116,  p50d:50, p90d:63, p95d:66, p99d:74 },
        F: { p50s:91, p90s:104,p95s:108, p99s:115,  p50d:50, p90d:63, p95d:66, p99d:73 } },
  7:  { M: { p50s:92, p90s:106,p95s:109, p99s:117,  p50d:52, p90d:65, p95d:68, p99d:75 },
        F: { p50s:92, p90s:106,p95s:109, p99s:117,  p50d:51, p90d:64, p95d:67, p99d:74 } },
  8:  { M: { p50s:94, p90s:107,p95s:111, p99s:119,  p50d:53, p90d:66, p95d:69, p99d:77 },
        F: { p50s:94, p90s:107,p95s:111, p99s:118,  p50d:53, p90d:66, p95d:69, p99d:76 } },
  9:  { M: { p50s:95, p90s:109,p95s:112, p99s:120,  p50d:54, p90d:67, p95d:70, p99d:78 },
        F: { p50s:96, p90s:109,p95s:113, p99s:120,  p50d:55, p90d:68, p95d:71, p99d:78 } },
  10: { M: { p50s:97, p90s:110,p95s:114, p99s:121,  p50d:55, p90d:68, p95d:72, p99d:79 },
        F: { p50s:98, p90s:111,p95s:115, p99s:122,  p50d:57, p90d:70, p95d:73, p99d:80 } },
  11: { M: { p50s:99, p90s:113,p95s:116, p99s:124,  p50d:57, p90d:70, p95d:73, p99d:81 },
        F: { p50s:100,p90s:114,p95s:117, p99s:125,  p50d:59, p90d:72, p95d:74, p99d:82 } },
  12: { M: { p50s:101,p90s:115,p95s:119, p99s:126,  p50d:59, p90d:72, p95d:75, p99d:82 },
        F: { p50s:102,p90s:116,p95s:119, p99s:127,  p50d:61, p90d:74, p95d:76, p99d:84 } },
  13: { M: { p50s:104,p90s:118,p95s:121, p99s:129,  p50d:60, p90d:73, p95d:76, p99d:84 },
        F: { p50s:104,p90s:117,p95s:121, p99s:128,  p50d:63, p90d:75, p95d:78, p99d:85 } },
  14: { M: { p50s:106,p90s:120,p95s:124, p99s:131,  p50d:61, p90d:74, p95d:77, p99d:84 },
        F: { p50s:106,p90s:119,p95s:122, p99s:130,  p50d:64, p90d:76, p95d:79, p99d:86 } },
  15: { M: { p50s:109,p90s:122,p95s:126, p99s:133,  p50d:62, p90d:75, p95d:78, p99d:85 },
        F: { p50s:107,p90s:120,p95s:123, p99s:131,  p50d:65, p90d:77, p95d:80, p99d:87 } },
  16: { M: { p50s:111,p90s:125,p95s:128, p99s:136,  p50d:63, p90d:76, p95d:79, p99d:86 },
        F: { p50s:108,p90s:121,p95s:124, p99s:132,  p50d:66, p90d:78, p95d:81, p99d:88 } },
  17: { M: { p50s:114,p90s:127,p95s:131, p99s:138,  p50d:64, p90d:77, p95d:80, p99d:87 },
        F: { p50s:108,p90s:122,p95s:125, p99s:132,  p50d:66, p90d:78, p95d:81, p99d:88 } },
};

/**
 * Estimate a BP percentile from raw mmHg value against reference thresholds
 */
function estimatePercentile(value, p50, p90, p95, p99) {
  if (value < p50) return Math.max(1, Math.round(40 - ((p50 - value) / p50) * 20));
  if (value < p90) return 50 + Math.round(((value - p50) / (p90 - p50)) * 40);
  if (value < p95) return 90 + Math.round(((value - p90) / (p95 - p90)) * 5);
  if (value < p99) return 95 + Math.round(((value - p95) / (p99 - p95)) * 4);
  return 99;
}

/**
 * Classify BP stage from a combined percentile (AAP 2017)
 * Based on the HIGHER of SBP or DBP percentile
 * AAP 2017: Stage 2 = ≥95th+12 mmHg (percentile ≥99th by approximation) OR ≥140/90
 * Stage 1 = 95th–<95th+12, Elevated = 90th–<95th or ≥120/<80, Normal = <90th
 */
function classifyFromPercentile(pct) {
  if (pct >= 99) return "Stage 2 HTN";
  if (pct >= 95) return "Stage 1 HTN";
  if (pct >= 90) return "Elevated BP";
  return "Normal";
}

/**
 * Calculate separate SBP and DBP percentiles + combined classification
 * AAP 2017 operational logic: classification based on HIGHER of the two
 *
 * @param {{ age_years, sex, systolic, diastolic, height_percentile }} params
 * @returns {BPResult}
 */
export function calculateBPPercentile({ age_years, sex, systolic, diastolic, height_percentile = 50 }) {
  const age = Math.min(17, Math.max(1, Math.round(age_years)));
  const sexKey = (sex === "F" || sex === "Female" || sex === "female") ? "F" : "M";

  // ── Adolescent rule: ≥13y uses absolute thresholds (AAP 2017) ────────────
  if (age >= 13) {
    const sysStage = systolic >= 140 ? "Stage 2 HTN" : systolic >= 130 ? "Stage 1 HTN" : systolic >= 120 ? "Elevated BP" : "Normal";
    const diaStage = diastolic >= 90 ? "Stage 2 HTN" : diastolic >= 80 ? "Stage 1 HTN" : "Normal";
    // Combined stage = higher of the two
    const stageRank = { "Normal": 0, "Elevated BP": 1, "Stage 1 HTN": 2, "Stage 2 HTN": 3 };
    const combinedStage = stageRank[sysStage] >= stageRank[diaStage] ? sysStage : diaStage;
    return {
      systolic_percentile: null,
      diastolic_percentile: null,
      systolic_stage: sysStage,
      diastolic_stage: diaStage,
      classification: combinedStage,
      stage: combinedStage,
      dominant_component: stageRank[sysStage] >= stageRank[diaStage] ? "systolic" : "diastolic",
      note: "Age ≥13y: absolute thresholds applied (AAP 2017). Stage = higher of SBP/DBP stage.",
      management_recommendation: getManagementRecommendation(combinedStage, { age, systolic, diastolic }),
      source: "AAP Clinical Practice Guideline 2017 (Pediatrics 140:e20171904)",
      guideline_context: {
        primary: "AAP 2017",
        note: "AAP 2017 is the primary operational guideline for pediatric hypertension classification.",
        supporting: ["ESH 2016", "JNC 7 (historical)"],
      },
    };
  }

  const ref = BP_TABLE[age]?.[sexKey];
  if (!ref) return { error: "Age/sex not in table" };

  // Height percentile adjustment (linear scaling ±3 mmHg at extremes)
  const hFactor = ((height_percentile || 50) - 50) / 50 * 3;

  // Adjusted reference values for systolic
  const adjP50s = ref.p50s + hFactor;
  const adjP90s = ref.p90s + hFactor;
  const adjP95s = ref.p95s + hFactor;
  const adjP99s = ref.p99s + hFactor;

  // Adjusted reference values for diastolic
  const adjP50d = ref.p50d + hFactor;
  const adjP90d = ref.p90d + hFactor;
  const adjP95d = ref.p95d + hFactor;
  const adjP99d = ref.p99d + hFactor;

  // Calculate separate percentiles
  const sysPercentile = Math.min(99, Math.max(1, estimatePercentile(systolic, adjP50s, adjP90s, adjP95s, adjP99s)));
  const diaPercentile = Math.min(99, Math.max(1, estimatePercentile(diastolic, adjP50d, adjP90d, adjP95d, adjP99d)));

  // Classify each component separately
  let sysStage = classifyFromPercentile(sysPercentile);
  let diaStage = classifyFromPercentile(diaPercentile);

  // AAP 2017 special rule for <13y: SBP ≥120 or DBP ≥80 = at minimum "Elevated BP"
  // even if below the 90th percentile (accounts for early adolescents with low percentile thresholds)
  const stageRankMap = { "Normal": 0, "Elevated BP": 1, "Stage 1 HTN": 2, "Stage 2 HTN": 3 };
  if (systolic >= 120 && stageRankMap[sysStage] < stageRankMap["Elevated BP"]) sysStage = "Elevated BP";
  if (diastolic >= 80 && stageRankMap[diaStage] < stageRankMap["Stage 1 HTN"]) diaStage = "Stage 1 HTN";

  // AAP operational logic: overall stage = HIGHER of SBP or DBP stage
  const dominantPct = Math.max(sysPercentile, diaPercentile);
  // Combined stage = higher of the two individual stages (accounts for absolute thresholds)
  const combinedStage = stageRankMap[sysStage] >= stageRankMap[diaStage] ? sysStage : diaStage;

  return {
    // Separate percentiles
    systolic_percentile: sysPercentile,
    diastolic_percentile: diaPercentile,
    dominant_percentile: dominantPct,
    dominant_component: stageRankMap[sysStage] >= stageRankMap[diaStage] ? "systolic" : "diastolic",

    // Separate classifications
    systolic_stage: sysStage,
    diastolic_stage: diaStage,

    // Overall classification (AAP 2017: higher of SBP or DBP stage)
    classification: combinedStage,
    stage: combinedStage,

    // Reference values
    systolic_reference: {
      p90: Math.round(adjP90s), p95: Math.round(adjP95s), p99: Math.round(adjP99s),
    },
    diastolic_reference: {
      p90: Math.round(adjP90d), p95: Math.round(adjP95d), p99: Math.round(adjP99d),
    },

    // Clinical outputs
    management_recommendation: getManagementRecommendation(combinedStage, { age, systolic, diastolic }),
    source: "AAP Clinical Practice Guideline 2017 (Pediatrics 140:e20171904)",
    note: `Height percentile (${height_percentile}th) adjusted. Classification based on higher of SBP (${sysPercentile}th %ile, ${sysStage}) vs DBP (${diaPercentile}th %ile, ${diaStage}). ≥120 SBP or ≥80 DBP = at minimum Elevated BP per AAP 2017. Confirm with full AAP tables.`,
    aap_operational_note: `AAP 2017 (<13y): Normal <90th %ile; Elevated = 90th–<95th or SBP≥120/DBP≥80; Stage 1 = 95th–<99th; Stage 2 = ≥99th or ≥95th+12 mmHg. Overall stage = higher of SBP or DBP stage.`,

    guideline_context: {
      primary: "AAP 2017",
      note: "AAP 2017 is the primary operational guideline. ESH uses different staging nomenclature.",
      supporting: ["ESH 2016", "ESCAPE trial 2009 (CKD BP targets)"],
      comparison_available: true,
    },
  };
}

function getManagementRecommendation(stage, ctx = {}) {
  switch (stage) {
    case "Stage 2 HTN":
      return "Same-day evaluation required (AAP 2017). Initiate antihypertensive therapy. Urgent secondary cause workup (renal USS, ECHO, labs, fundoscopy). Nephrology referral same day.";
    case "Stage 1 HTN":
      return "3–6 month lifestyle trial: DASH diet, weight management, exercise (AAP 2017). Start medication if secondary cause confirmed, CKD, DM, LVH, or BP persists. ABPM strongly recommended.";
    case "Elevated BP":
      return "Lifestyle modification for 6 months. Recheck BP every 3–6 months. ABPM if white-coat hypertension suspected. No medication unless secondary cause confirmed.";
    default:
      return "Annual BP check. Routine monitoring. Promote healthy lifestyle.";
  }
}

/**
 * Classify hypertensive emergency (AAP 2017 + ESH)
 */
export function classifyHypertensiveEmergency(ctx = {}) {
  const { systolic_percentile, diastolic_percentile, end_organ_damage, seizures, altered_consciousness, papilloedema } = ctx;
  const maxPct = Math.max(systolic_percentile || 0, diastolic_percentile || 0);
  if ((maxPct > 99 || ctx.systolic >= 140) && (seizures || altered_consciousness || papilloedema)) {
    return {
      class: "HYPERTENSIVE_ENCEPHALOPATHY",
      urgency: "IMMEDIATE",
      treatment: "IV nicardipine 1–3 mcg/kg/min OR IV labetalol. Reduce MAP by 25% over 6–8h only (not faster — risk of cerebral ischaemia). ICU admission. Nephrology + neurology.",
      source: "AAP 2017 / ESH 2016",
    };
  }
  if (maxPct > 99 && end_organ_damage) {
    return {
      class: "HYPERTENSIVE_EMERGENCY",
      urgency: "URGENT",
      treatment: "IV antihypertensive therapy. Continuous monitoring. Nephrology same day. Target MAP reduction ≤25% in first hour.",
      source: "AAP 2017",
    };
  }
  if (maxPct > 99) {
    return {
      class: "HYPERTENSIVE_URGENCY",
      urgency: "SAME_DAY",
      treatment: "Oral antihypertensive (amlodipine or nifedipine extended-release). 4-hourly BP checks. Secondary cause workup.",
      source: "AAP 2017",
    };
  }
  return { class: "NON_EMERGENCY", urgency: "ROUTINE", source: "AAP 2017" };
}

/**
 * CKD-specific BP target guidance (ESCAPE trial / KDIGO)
 */
export function getCKDBPTarget() {
  return {
    target: "BP < 50th percentile for age/height/sex on ABPM (preferred) OR office BP <90th percentile",
    rationale: "ESCAPE trial (2009): intensive BP control (50th vs 90th %ile) significantly slowed CKD progression in proteinuric CKD",
    source: "ESCAPE Trial 2009 / KDIGO CKD 2012",
    monitoring: "ABPM preferred over office BP for CKD management decisions",
    drug_choice: "ACE inhibitor (first-line in proteinuric CKD). Add CCB if needed. Avoid dual RAS blockade.",
    guideline_note: "AAP 2017 provides general pediatric BP classification. ESCAPE/KDIGO provides CKD-specific BP targets.",
  };
}