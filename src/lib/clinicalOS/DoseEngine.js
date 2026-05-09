/**
 * DYNAMIC DOSE ENGINE
 * Resolves dosing placeholders using patient context.
 * Integrated with renal/dialysis adjustments and max-dose caps.
 */

// ── Renal Adjustment Factors ────────────────────────────────────────────────
const RENAL_FACTORS = {
  // drug_key -> { egfr_band -> factor }
  enalapril:     { ">=60": 1.0, "30-59": 0.75, "15-29": 0.5, "<15": 0.5, "HD": 0.5, "PD": 0.5 },
  furosemide:    { ">=60": 1.0, "30-59": 1.0, "15-29": 1.0, "<15": 1.0, "HD": 1.0, "PD": 1.0 },
  tacrolimus:    { ">=60": 1.0, "30-59": 1.0, "15-29": 1.0, "<15": 1.0, "HD": 1.0, "PD": 1.0 },
  vancomycin:    { ">=60": 1.0, "30-59": 0.75, "15-29": 0.5, "<15": 0.25, "HD": "post_HD", "PD": 0.5 },
  amikacin:      { ">=60": 1.0, "30-59": 0.75, "15-29": 0.5, "<15": 0.25, "HD": "post_HD", "PD": 0.5 },
  amphotericin:  { ">=60": 1.0, "30-59": 1.0, "15-29": 1.0, "<15": "avoid", "HD": "avoid", "PD": "avoid" },
  acyclovir:     { ">=60": 1.0, "30-59": 1.0, "15-29": 0.75, "<15": 0.5, "HD": "post_HD", "PD": 0.5 },
  cotrimoxazole: { ">=60": 1.0, "30-59": 0.75, "15-29": 0.5, "<15": "avoid", "HD": "post_HD", "PD": "avoid" },
};

// ── eGFR Band Resolution ────────────────────────────────────────────────────
function getEgfrBand(egfr, dialysisType) {
  if (dialysisType === "HD") return "HD";
  if (dialysisType === "PD" || dialysisType === "CRRT") return "PD";
  if (egfr >= 60) return ">=60";
  if (egfr >= 30) return "30-59";
  if (egfr >= 15) return "15-29";
  return "<15";
}

// ── Context Resolver ────────────────────────────────────────────────────────
/**
 * Resolve placeholder tokens in a dose template string using patient context.
 * @param {string} template - e.g. "{{weight_based_dose:0.5}} mg/kg/day"
 * @param {object} ctx - patient context: { weight, bsa, eGFR, ckd_stage, dialysis_type, ... }
 * @returns {{ resolved: string, calculations: object, warnings: string[] }}
 */
export function resolveDose(template, ctx = {}) {
  const warnings = [];
  const calcs = {};
  let resolved = template;

  const w = ctx.weight || 0;
  const bsa = ctx.bsa || (w > 0 ? Math.sqrt((ctx.height * w) / 3600) : 0);
  const egfr = ctx.eGFR;
  const dialysis = ctx.dialysis_type || null;

  // Resolve {{weight}} placeholder
  resolved = resolved.replace(/\{\{weight\}\}/g, w > 0 ? `${w} kg` : "[weight needed]");
  resolved = resolved.replace(/\{\{bsa\}\}/g, bsa > 0 ? `${bsa.toFixed(2)} m²` : "[BSA needed]");
  resolved = resolved.replace(/\{\{eGFR\}\}/g, egfr != null ? `${egfr} mL/min/1.73m²` : "[eGFR needed]");
  resolved = resolved.replace(/\{\{ckd_stage\}\}/g, ctx.ckd_stage || "[CKD stage needed]");
  resolved = resolved.replace(/\{\{dialysis_type\}\}/g, dialysis || "None");
  resolved = resolved.replace(/\{\{serum_potassium\}\}/g, ctx.serum_potassium != null ? `${ctx.serum_potassium} mmol/L` : "[K+ needed]");
  resolved = resolved.replace(/\{\{bp_percentile\}\}/g, ctx.bp_percentile != null ? `${ctx.bp_percentile}th %ile` : "[BP %ile needed]");

  // Resolve weight-based doses: {{dose:0.5|max:60|unit:mg}}
  resolved = resolved.replace(/\{\{dose:([\d.]+)(?:\|max:([\d.]+))?(?:\|unit:([^\}]+))?\}\}/g,
    (_, dosePerKg, maxDose, unit = "mg") => {
      if (!w) { warnings.push("Weight required for dose calculation"); return `[${dosePerKg} ${unit}/kg — weight needed]`; }
      const raw = parseFloat(dosePerKg) * w;
      const capped = maxDose ? Math.min(raw, parseFloat(maxDose)) : raw;
      const capped_rounded = Math.round(capped * 10) / 10;
      calcs[`dose_${dosePerKg}_per_kg`] = { raw, capped: capped_rounded, unit, weight: w };
      if (maxDose && raw > parseFloat(maxDose)) warnings.push(`Dose capped at maximum ${maxDose} ${unit}`);
      return `${capped_rounded} ${unit}`;
    }
  );

  // Resolve BSA-based doses: {{bsa_dose:60|max:60|unit:mg}}
  resolved = resolved.replace(/\{\{bsa_dose:([\d.]+)(?:\|max:([\d.]+))?(?:\|unit:([^\}]+))?\}\}/g,
    (_, dosePerBsa, maxDose, unit = "mg") => {
      if (!bsa) { warnings.push("Height+Weight required for BSA dose"); return `[${dosePerBsa} ${unit}/m² — BSA needed]`; }
      const raw = parseFloat(dosePerBsa) * bsa;
      const capped = maxDose ? Math.min(raw, parseFloat(maxDose)) : raw;
      const capped_rounded = Math.round(capped * 10) / 10;
      calcs[`bsa_dose_${dosePerBsa}`] = { raw, capped: capped_rounded, bsa, unit };
      if (maxDose && raw > parseFloat(maxDose)) warnings.push(`BSA dose capped at maximum ${maxDose} ${unit}`);
      return `${capped_rounded} ${unit}`;
    }
  );

  // Dialysis/renal context warnings
  if (dialysis) {
    warnings.push(`Patient on ${dialysis} — verify renal dose adjustments`);
  } else if (egfr != null && egfr < 30) {
    warnings.push(`Low eGFR (${egfr}) — check renal dose adjustments`);
  }

  // K+ safety check
  if (ctx.serum_potassium > 5.5 && (template.includes("ACE") || template.includes("spironolactone") || template.includes("trimethoprim"))) {
    warnings.push(`⚠️ K+ ${ctx.serum_potassium} mmol/L — use caution with K+-sparing agents`);
  }

  return { resolved, calculations: calcs, warnings };
}

/**
 * Apply renal dose adjustment factor for a named drug
 * @param {string} drugKey
 * @param {number} baseDose
 * @param {number} egfr
 * @param {string|null} dialysisType
 * @returns {{ adjustedDose: number|string, factor: number|string, band: string, note: string }}
 */
export function applyRenalAdjustment(drugKey, baseDose, egfr, dialysisType = null) {
  const factors = RENAL_FACTORS[drugKey.toLowerCase()];
  if (!factors) return { adjustedDose: baseDose, factor: 1.0, band: "unknown", note: "No renal adjustment data" };
  const band = getEgfrBand(egfr, dialysisType);
  const factor = factors[band];
  if (factor === "avoid") return { adjustedDose: "AVOID", factor: "avoid", band, note: `${drugKey} is contraindicated in ${band}` };
  if (factor === "post_HD") return { adjustedDose: "Post-dialysis dose", factor: "post_HD", band, note: "Give supplemental dose after each HD session" };
  const adjusted = Math.round(baseDose * factor * 10) / 10;
  return { adjustedDose: adjusted, factor, band, note: factor < 1 ? `Reduced by ${(1 - factor) * 100}%` : "No adjustment required" };
}

/**
 * Auto-calculate standard pediatric drug doses from context
 * @param {string} drugName
 * @param {object} ctx
 * @returns {{ dose: string, frequency: string, max: string, route: string, renalNote: string, warnings: string[] }}
 */
export const STANDARD_DOSE_TEMPLATES = {
  prednisolone_ns: {
    template: "{{bsa_dose:60|max:60|unit:mg}}/day",
    frequency: "OD (morning)",
    route: "PO",
    indication: "NS induction",
    phase: "full_dose",
  },
  prednisolone_alt_day: {
    template: "{{bsa_dose:40|max:40|unit:mg}} on alternate days",
    frequency: "Alternate days",
    route: "PO",
    indication: "NS consolidation",
  },
  furosemide: {
    template: "{{dose:1|max:200|unit:mg}}/dose",
    frequency: "BD-TDS IV",
    route: "IV or PO",
    indication: "Oedema / fluid overload",
  },
  enalapril: {
    template: "{{dose:0.1|max:20|unit:mg}}/day",
    frequency: "OD",
    route: "PO",
    indication: "HTN / CKD antiproteinuric",
  },
  tacrolimus_ns: {
    template: "{{dose:0.1|max:5|unit:mg}}/kg/day in 2 divided doses",
    frequency: "BD (12h apart)",
    route: "PO",
    indication: "SDNS / SRNS",
    trough_target: "4–8 ng/mL",
  },
  tacrolimus_transplant: {
    template: "{{dose:0.1|max:5|unit:mg}}/kg/day in 2 divided doses",
    frequency: "BD",
    route: "PO",
    indication: "Transplant immunosuppression",
    trough_target: "8–12 ng/mL (early), 4–8 ng/mL (maintenance)",
  },
  amlodipine: {
    template: "{{dose:0.1|max:10|unit:mg}}/day",
    frequency: "OD",
    route: "PO",
    indication: "Hypertension",
  },
  calcium_gluconate: {
    template: "{{dose:0.5|max:20|unit:mL}} of 10% solution",
    frequency: "IV over 5–10 min (may repeat q30min)",
    route: "IV (slow)",
    indication: "Hyperkalaemia cardiac stabilisation",
  },
  sodium_bicarbonate: {
    template: "{{dose:1|max:50|unit:mEq}}",
    frequency: "IV over 10–20 min",
    route: "IV",
    indication: "Metabolic acidosis / hyperkalaemia",
  },
  albumin_20: {
    template: "{{dose:1|max:100|unit:g}} (5 mL/kg of 20%)",
    frequency: "Over 4h",
    route: "IV",
    indication: "Severe NS oedema (albumin <1.5 g/dL)",
  },
  mmf: {
    template: "{{bsa_dose:600|max:1000|unit:mg}}/dose",
    frequency: "BD",
    route: "PO",
    indication: "FRNS / SDNS / transplant",
  },
  levamisole: {
    template: "{{dose:2.5|max:150|unit:mg}}",
    frequency: "Alternate days",
    route: "PO",
    indication: "FRNS",
  },
};