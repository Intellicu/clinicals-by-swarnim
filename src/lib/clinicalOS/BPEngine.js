/**
 * PEDIATRIC BP PERCENTILE ENGINE
 * AAP 2017 percentile tables + classification + management recommendations
 * Supports age 1–17y, sex M/F, height percentile input
 */

/**
 * Simplified BP table lookup (representative values from AAP 2017 Appendix B)
 * Full tables: age 1–17, sex, by height percentile
 * Format: { age -> sex -> { p50_sys, p90_sys, p95_sys, p99_sys, p50_dia, p90_dia, p95_dia, p99_dia } }
 *
 * Values here represent approximate 50th height percentile reference (for calculator core)
 */
const BP_TABLE = {
  1:  { M: { p50s: 85, p90s: 98, p95s: 102, p99s: 109, p50d: 40, p90d: 52, p95d: 54, p99d: 61 },
        F: { p50s: 83, p90s: 97, p95s: 100, p99s: 108, p50d: 38, p90d: 52, p95d: 54, p99d: 61 } },
  2:  { M: { p50s: 87, p90s: 101, p95s: 104, p99s: 112, p50d: 43, p90d: 55, p95d: 58, p99d: 65 },
        F: { p50s: 85, p90s: 99, p95s: 102, p99s: 110, p50d: 43, p90d: 56, p95d: 59, p99d: 66 } },
  3:  { M: { p50s: 88, p90s: 101, p95s: 105, p99s: 113, p50d: 46, p90d: 58, p95d: 61, p99d: 68 },
        F: { p50s: 86, p90s: 100, p95s: 104, p99s: 111, p50d: 45, p90d: 58, p95d: 60, p99d: 67 } },
  4:  { M: { p50s: 89, p90s: 103, p95s: 106, p99s: 114, p50d: 48, p90d: 60, p95d: 63, p99d: 70 },
        F: { p50s: 88, p90s: 101, p95s: 105, p99s: 112, p50d: 47, p90d: 60, p95d: 62, p99d: 69 } },
  5:  { M: { p50s: 90, p90s: 104, p95s: 107, p99s: 115, p50d: 49, p90d: 62, p95d: 65, p99d: 72 },
        F: { p50s: 89, p90s: 103, p95s: 106, p99s: 114, p50d: 48, p90d: 61, p95d: 64, p99d: 71 } },
  6:  { M: { p50s: 91, p90s: 105, p95s: 108, p99s: 116, p50d: 50, p90d: 63, p95d: 66, p99d: 74 },
        F: { p50s: 91, p90s: 104, p95s: 108, p99s: 115, p50d: 50, p90d: 63, p95d: 66, p99d: 73 } },
  7:  { M: { p50s: 92, p90s: 106, p95s: 109, p99s: 117, p50d: 52, p90d: 65, p95d: 68, p99d: 75 },
        F: { p50s: 92, p90s: 106, p95s: 109, p99s: 117, p50d: 51, p90d: 64, p95d: 67, p99d: 74 } },
  8:  { M: { p50s: 94, p90s: 107, p95s: 111, p99s: 119, p50d: 53, p90d: 66, p95d: 69, p99d: 77 },
        F: { p50s: 94, p90s: 107, p95s: 111, p99s: 118, p50d: 53, p90d: 66, p95d: 69, p99d: 76 } },
  9:  { M: { p50s: 95, p90s: 109, p95s: 112, p99s: 120, p50d: 54, p90d: 67, p95d: 70, p99d: 78 },
        F: { p50s: 96, p90s: 109, p95s: 113, p99s: 120, p50d: 55, p90d: 68, p95d: 71, p99d: 78 } },
  10: { M: { p50s: 97, p90s: 110, p95s: 114, p99s: 121, p50d: 55, p90d: 68, p95d: 72, p99d: 79 },
        F: { p50s: 98, p90s: 111, p95s: 115, p99s: 122, p50d: 57, p90d: 70, p95d: 73, p99d: 80 } },
  11: { M: { p50s: 99, p90s: 113, p95s: 116, p99s: 124, p50d: 57, p90d: 70, p95d: 73, p99d: 81 },
        F: { p50s: 100, p90s: 114, p95s: 117, p99s: 125, p50d: 59, p90d: 72, p95d: 74, p99d: 82 } },
  12: { M: { p50s: 101, p90s: 115, p95s: 119, p99s: 126, p50d: 59, p90d: 72, p95d: 75, p99d: 82 },
        F: { p50s: 102, p90s: 116, p95s: 119, p99s: 127, p50d: 61, p90d: 74, p95d: 76, p99d: 84 } },
  13: { M: { p50s: 104, p90s: 118, p95s: 121, p99s: 129, p50d: 60, p90d: 73, p95d: 76, p99d: 84 },
        F: { p50s: 104, p90s: 117, p95s: 121, p99s: 128, p50d: 63, p90d: 75, p95d: 78, p99d: 85 } },
  14: { M: { p50s: 106, p90s: 120, p95s: 124, p99s: 131, p50d: 61, p90d: 74, p95d: 77, p99d: 84 },
        F: { p50s: 106, p90s: 119, p95s: 122, p99s: 130, p50d: 64, p90d: 76, p95d: 79, p99d: 86 } },
  15: { M: { p50s: 109, p90s: 122, p95s: 126, p99s: 133, p50d: 62, p90d: 75, p95d: 78, p99d: 85 },
        F: { p50s: 107, p90s: 120, p95s: 123, p99s: 131, p50d: 65, p90d: 77, p95d: 80, p99d: 87 } },
  16: { M: { p50s: 111, p90s: 125, p95s: 128, p99s: 136, p50d: 63, p90d: 76, p95d: 79, p99d: 86 },
        F: { p50s: 108, p90s: 121, p95s: 124, p99s: 132, p50d: 66, p90d: 78, p95d: 81, p99d: 88 } },
  17: { M: { p50s: 114, p90s: 127, p95s: 131, p99s: 138, p50d: 64, p90d: 77, p95d: 80, p99d: 87 },
        F: { p50s: 108, p90s: 122, p95s: 125, p99s: 132, p50d: 66, p90d: 78, p95d: 81, p99d: 88 } },
};

/**
 * Calculate BP percentile for a child
 * @param {{ age_years, sex, systolic, diastolic, height_percentile }} params
 * @returns {{ systolic_percentile, diastolic_percentile, classification, stage, management_recommendation, source }}
 */
export function calculateBPPercentile({ age_years, sex, systolic, diastolic, height_percentile = 50 }) {
  // Validate inputs
  const age = Math.min(17, Math.max(1, Math.round(age_years)));
  const sexKey = sex === "F" || sex === "Female" || sex === "female" ? "F" : "M";

  // Adolescent special rule (≥13y use fixed thresholds per AAP 2017)
  if (age >= 13) {
    const stage = systolic >= 140 || diastolic >= 90 ? "Stage 2 HTN" :
                  systolic >= 130 || diastolic >= 80 ? "Stage 1 HTN" :
                  systolic >= 120 ? "Elevated BP" : "Normal";
    return {
      systolic_percentile: null,
      diastolic_percentile: null,
      classification: stage,
      stage,
      note: "Age ≥13y: uses absolute thresholds (AAP 2017)",
      management_recommendation: getManagementRecommendation(stage, { age, systolic, diastolic }),
      source: "AAP 2017",
    };
  }

  const ref = BP_TABLE[age]?.[sexKey];
  if (!ref) return { error: "Age/sex not in table" };

  // Interpolate for height percentile (simplified linear scaling ±5 mmHg for h%ile extremes)
  const hFactor = (height_percentile - 50) / 50 * 3; // ±3 mmHg at extremes
  const adjP95s = ref.p95s + hFactor;
  const adjP99s = ref.p99s + hFactor;
  const adjP90s = ref.p90s + hFactor;

  // Estimate percentile for systolic (simplified)
  let sysPercentile;
  if (systolic < ref.p50s) sysPercentile = 40;
  else if (systolic < adjP90s) sysPercentile = 50 + Math.round(((systolic - ref.p50s) / (adjP90s - ref.p50s)) * 40);
  else if (systolic < adjP95s) sysPercentile = 90 + Math.round(((systolic - adjP90s) / (adjP95s - adjP90s)) * 5);
  else if (systolic < adjP99s) sysPercentile = 95 + Math.round(((systolic - adjP95s) / (adjP99s - adjP95s)) * 4);
  else sysPercentile = 99;

  sysPercentile = Math.min(99, Math.max(1, sysPercentile));

  // Classification
  const stage = sysPercentile > 99 ? "Stage 2 HTN" :
                sysPercentile >= 95 ? "Stage 1 HTN" :
                sysPercentile >= 90 ? "Elevated BP" : "Normal";

  return {
    systolic_percentile: sysPercentile,
    diastolic_percentile: null, // Simplified — add diastolic table if needed
    classification: stage,
    stage,
    reference_values: { p90: Math.round(adjP90s), p95: Math.round(adjP95s), p99: Math.round(adjP99s) },
    management_recommendation: getManagementRecommendation(stage, { age, systolic, diastolic }),
    source: "AAP Clinical Practice Guideline 2017 (Pediatrics 140:e20171904)",
    note: "Height percentile adjusted. Confirm with full AAP table.",
  };
}

function getManagementRecommendation(stage, ctx = {}) {
  switch (stage) {
    case "Stage 2 HTN":
      return "Same-day evaluation required. Start antihypertensive medication. Urgent secondary cause workup (renal USS, ECHO, labs). Nephrology referral.";
    case "Stage 1 HTN":
      return "3–6 month lifestyle trial (DASH diet, weight management, exercise). Start medication if secondary cause confirmed, DM, CKD, LVH, or persistent. ABPM recommended.";
    case "Elevated BP":
      return "Lifestyle modification for 6 months. Recheck BP. ABPM if white-coat suspected.";
    default:
      return "Routine monitoring. Annual recheck.";
  }
}

/**
 * Classify hypertensive emergency
 */
export function classifyHypertensiveEmergency(ctx = {}) {
  const { systolic_percentile, end_organ_damage, seizures, altered_consciousness, papilloedema } = ctx;
  if ((systolic_percentile > 99 || ctx.systolic >= 140) && (seizures || altered_consciousness || papilloedema)) {
    return {
      class: "HYPERTENSIVE_ENCEPHALOPATHY",
      urgency: "IMMEDIATE",
      treatment: "IV nicardipine 1–3 mcg/kg/min OR IV labetolol. Reduce MAP 25% over 6–8h only. ICU admission.",
    };
  }
  if (systolic_percentile > 99 && end_organ_damage) {
    return {
      class: "HYPERTENSIVE_EMERGENCY",
      urgency: "URGENT",
      treatment: "IV therapy. Monitor continuously. Nephrology same day.",
    };
  }
  if (systolic_percentile > 99) {
    return {
      class: "HYPERTENSIVE_URGENCY",
      urgency: "SAME_DAY",
      treatment: "Oral antihypertensive (amlodipine). 4-hourly BP checks. Secondary workup.",
    };
  }
  return { class: "NON_EMERGENCY", urgency: "ROUTINE" };
}