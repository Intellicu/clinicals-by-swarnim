/**
 * LONGITUDINAL PEDIATRIC NEPHROLOGY TRACKING ENGINE
 * Trend-aware analysis for creatinine, eGFR, proteinuria, tacrolimus,
 * dialysis adequacy, BP trends, growth velocity, CKD progression
 */

/**
 * Calculate eGFR slope (mL/min/1.73m²/year)
 * @param {Array<{date: string, egfr: number}>} egfrHistory - sorted oldest first
 * @returns {{ slope_per_year, trend, classification, alert }}
 */
export function calculateEgfrSlope(egfrHistory = []) {
  if (egfrHistory.length < 2) return { slope_per_year: null, trend: "insufficient_data" };
  const first = egfrHistory[0];
  const last = egfrHistory[egfrHistory.length - 1];
  const yearsElapsed = (new Date(last.date) - new Date(first.date)) / (1000 * 60 * 60 * 24 * 365.25);
  if (yearsElapsed < 0.08) return { slope_per_year: null, trend: "too_short_interval" };
  const slope = (last.egfr - first.egfr) / yearsElapsed;
  const trend = slope < -5 ? "rapid_decline" : slope < -2 ? "moderate_decline" : slope >= 0 ? "stable_or_improving" : "slow_decline";
  return {
    slope_per_year: Math.round(slope * 10) / 10,
    trend,
    classification: slope < -5 ? "RAPID" : slope < -2 ? "MODERATE" : "STABLE",
    alert: slope < -5 ? "Rapid CKD progression (>5 mL/min/year) — investigate reversible causes urgently" :
           slope < -2 ? "Moderate CKD progression — optimise BP, proteinuria, and avoid nephrotoxins" : null,
    months_to_esrd: slope < 0 ? Math.round((last.egfr - 10) / Math.abs(slope) * 12) : null,
  };
}

/**
 * Proteinuria trend analysis
 * @param {Array<{date: string, upcr: number}>} upcrHistory
 * @returns {{ trend, doubling_detected, remission_sequence, alert }}
 */
export function analyzeProteinuriaTrend(upcrHistory = []) {
  if (upcrHistory.length < 2) return { trend: "insufficient_data" };
  const latest = upcrHistory[upcrHistory.length - 1].upcr;
  const prev = upcrHistory[upcrHistory.length - 2].upcr;
  const doubling = latest > prev * 1.8;
  const remission = latest < 200;
  const nephrotic = latest > 2000;

  // Check for 3-consecutive-day relapse pattern if daily dipstick data
  return {
    trend: latest > prev ? "worsening" : latest < prev * 0.7 ? "improving" : "stable",
    doubling_detected: doubling,
    in_remission: remission,
    in_nephrotic_range: nephrotic,
    latest_upcr: latest,
    alert: doubling ? "UPCR doubled — reassess immunosuppression / biopsy indication" :
           nephrotic ? "Nephrotic-range proteinuria — active disease management required" : null,
  };
}

/**
 * BP trend analysis using percentile history
 * @param {Array<{date: string, systolic: number, diastolic: number, systolic_percentile: number}>} bpHistory
 * @returns {{ trend, stage, alert }}
 */
export function analyzeBPTrend(bpHistory = []) {
  if (bpHistory.length < 2) return { trend: "insufficient_data" };
  const recent = bpHistory.slice(-3);
  const avgSysPercentile = recent.reduce((s, r) => s + (r.systolic_percentile || 0), 0) / recent.length;
  const latest = bpHistory[bpHistory.length - 1];

  return {
    trend: avgSysPercentile > 95 ? "hypertensive" : avgSysPercentile > 90 ? "elevated" : "controlled",
    avg_systolic_percentile: Math.round(avgSysPercentile),
    stage: avgSysPercentile > 99 ? "Stage 2 HTN" : avgSysPercentile > 95 ? "Stage 1 HTN" : avgSysPercentile > 90 ? "Elevated" : "Normal",
    latest_bp: `${latest.systolic}/${latest.diastolic} (${latest.systolic_percentile}th %ile)`,
    alert: avgSysPercentile > 99 ? "Stage 2 HTN — immediate evaluation and medication" :
           avgSysPercentile > 95 ? "Stage 1 HTN — start antihypertensive if secondary cause confirmed" : null,
  };
}

/**
 * Growth velocity analysis
 * @param {Array<{date: string, height_cm: number, age_years: number, height_sds: number}>} growthHistory
 * @returns {{ height_velocity_cm_yr, velocity_sds_change, alert }}
 */
export function analyzeGrowthVelocity(growthHistory = []) {
  if (growthHistory.length < 2) return { insufficient_data: true };
  const first = growthHistory[0];
  const last = growthHistory[growthHistory.length - 1];
  const yearsElapsed = (new Date(last.date) - new Date(first.date)) / (1000 * 60 * 60 * 24 * 365.25);
  if (yearsElapsed < 0.25) return { insufficient_data: true, note: "Minimum 3 months needed" };

  const heightVelocity = (last.height_cm - first.height_cm) / yearsElapsed;
  const sdsDrop = last.height_sds - first.height_sds;

  return {
    height_velocity_cm_yr: Math.round(heightVelocity * 10) / 10,
    height_sds_latest: last.height_sds,
    height_sds_change: Math.round(sdsDrop * 100) / 100,
    poor_growth: last.height_sds < -1.88,
    alert: last.height_sds < -1.88 ? "Height SDS <−1.88 — rhGH indication (after correcting acidosis, anaemia, MBD)" :
           sdsDrop < -0.5 ? "Deteriorating height SDS — review CKD control (acidosis, nutrition, MBD)" : null,
    rgh_eligible: last.height_sds < -1.88,
  };
}

/**
 * Tacrolimus trough trend analysis
 * @param {Array<{date: string, trough: number, indication: string}>} troughHistory
 * @param {string} indication - "ns_sdns" | "transplant_early" | "transplant_maintenance"
 * @returns {{ trend, in_range, alert }}
 */
export function analyzeTacrolumusTrend(troughHistory = [], indication = "transplant_maintenance") {
  const targets = {
    ns_sdns: { min: 4, max: 8 },
    transplant_early: { min: 8, max: 12 },
    transplant_maintenance: { min: 4, max: 8 },
  };
  const target = targets[indication] || targets.transplant_maintenance;
  const latest = troughHistory[troughHistory.length - 1];
  if (!latest) return { insufficient_data: true };

  const inRange = latest.trough >= target.min && latest.trough <= target.max;
  const aboveRange = latest.trough > target.max;
  const belowRange = latest.trough < target.min;

  return {
    latest_trough: latest.trough,
    target_range: `${target.min}–${target.max} ng/mL`,
    in_range: inRange,
    trend: troughHistory.length >= 3 ? (
      troughHistory[troughHistory.length - 1].trough > troughHistory[troughHistory.length - 3].trough ? "rising" : "falling"
    ) : "insufficient",
    alert: aboveRange
      ? `Tacrolimus supra-therapeutic (${latest.trough} ng/mL, target ${target.min}–${target.max}) — nephrotoxicity/neurotoxicity risk; reduce dose`
      : belowRange
      ? `Tacrolimus sub-therapeutic (${latest.trough} ng/mL) — rejection/relapse risk; increase dose`
      : null,
  };
}

/**
 * CRRT dose adequacy
 * @param {Array<{date: string, prescribed_mlkghr: number, achieved_mlkghr: number, downtime_pct: number}>} sessions
 * @returns {{ avg_achieved, adequacy, alert }}
 */
export function analyzeCRRTAdequacy(sessions = []) {
  if (!sessions.length) return { insufficient_data: true };
  const recent = sessions.slice(-5);
  const avgAchieved = recent.reduce((s, r) => s + (r.achieved_mlkghr || 0), 0) / recent.length;
  return {
    avg_achieved_mlkghr: Math.round(avgAchieved * 10) / 10,
    adequate: avgAchieved >= 20,
    target: "≥20 mL/kg/h delivered",
    alert: avgAchieved < 20 ? "CRRT dose below target — increase prescription to 25–30 mL/kg/h to achieve 20 mL/kg/h delivered" : null,
  };
}

/**
 * CKD progression risk calculator
 * Uses creatinine, proteinuria, and BP to estimate 2-year ESRD risk
 * (simplified Kidney Failure Risk Equation adaptation for children)
 * @param {{ egfr, upcr, systolic_bp_percentile, diabetes, age_years }} ctx
 */
export function ckdProgressionRisk(ctx) {
  let score = 0;
  if (ctx.egfr < 30) score += 3;
  else if (ctx.egfr < 45) score += 2;
  else if (ctx.egfr < 60) score += 1;
  if (ctx.upcr > 1000) score += 3;
  else if (ctx.upcr > 300) score += 2;
  else if (ctx.upcr > 150) score += 1;
  if (ctx.systolic_bp_percentile > 95) score += 2;
  else if (ctx.systolic_bp_percentile > 90) score += 1;

  const risk = score >= 7 ? "HIGH" : score >= 4 ? "MODERATE" : "LOW";
  return {
    score,
    risk,
    recommendation: risk === "HIGH"
      ? "High progression risk — nephrology review, intensify BP + proteinuria control, RRT planning"
      : risk === "MODERATE"
      ? "Moderate risk — optimise BP target (<50th %ile), ensure ACE-I/ARB, 3-monthly review"
      : "Low risk — 6-monthly monitoring adequate",
  };
}