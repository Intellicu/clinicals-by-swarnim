/**
 * Dose Rule Engine
 * 
 * AI prescription generation MUST use:
 *   Diagnosis → Indication → DoseRule → Weight/BSA → eGFR → Prescription
 * 
 * This engine fetches indication-specific DoseRules from the database and
 * calculates precise doses. It does NOT derive dosing from free-text descriptions.
 */

import { base44 } from '@/api/client';

/**
 * Find the best DoseRule for a given drug + indication + patient context.
 * @param {string} drugId - Drug entity ID
 * @param {string} indication - Clinical indication (must match DoseRule.indication enum)
 * @param {object} patient - { weight_kg, bsa_m2, age_months, egfr }
 * @param {string} phase - 'induction' | 'maintenance' | 'taper' etc. (optional)
 * @returns {object|null} Best matching DoseRule or null
 */
export async function findDoseRule(drugId, indication, patient = {}, phase = null) {
  const query = { drug_id: drugId, indication };
  if (phase) query.phase = phase;

  const rules = await base44.entities.DoseRule.filter(query);
  if (!rules || rules.length === 0) return null;

  // Filter by age if specified
  const ageMonths = patient.age_months || null;
  const filtered = rules.filter(r => {
    if (ageMonths !== null) {
      if (r.age_min_months && ageMonths < r.age_min_months) return false;
      if (r.age_max_months && ageMonths > r.age_max_months) return false;
    }
    return true;
  });

  // Return first match (rules are indication+phase specific, so usually one)
  return filtered[0] || rules[0];
}

/**
 * Calculate dose from a DoseRule + patient parameters.
 * Enforces eGFR-based caution flags.
 * 
 * @param {object} rule - DoseRule record
 * @param {object} patient - { weight_kg, bsa_m2, egfr }
 * @returns {object} { dosePerAdmin_mg, dailyDose_mg, frequency, route, warnings, tdmRequired, targetTrough, needsWorkup }
 */
export function calculateDoseFromRule(rule, patient) {
  const { weight_kg = 0, bsa_m2 = 0, egfr = null } = patient;
  const warnings = [];

  // eGFR check
  if (egfr !== null && rule.egfr_threshold_caution && egfr < rule.egfr_threshold_caution) {
    warnings.push(`eGFR ${egfr} mL/min/1.73m² is below caution threshold (${rule.egfr_threshold_caution}). ${rule.egfr_adjustment_notes || 'Dose adjustment may be required.'}`);
  }

  let rawDose = 0;
  const unit = rule.dose_unit || '';

  // Calculate based on unit type
  if (unit.includes('/kg/day') || unit === 'mg/kg/day' || unit === 'mcg/kg/day') {
    rawDose = rule.dose_value * weight_kg;
  } else if (unit.includes('/m2/day') || unit === 'mg/m2/day') {
    if (!bsa_m2) {
      warnings.push('BSA not available — using weight-based estimate. Please calculate BSA for accurate dosing.');
      // Rough fallback: BSA ≈ weight^0.5 / 6
      rawDose = rule.dose_value * (Math.sqrt(weight_kg) / 6);
    } else {
      rawDose = rule.dose_value * bsa_m2;
    }
  } else if (unit === 'mg/kg/dose' || unit === 'mcg/kg/dose') {
    rawDose = rule.dose_value * weight_kg;
  } else if (unit === 'mg/m2/dose') {
    rawDose = rule.dose_value * (bsa_m2 || Math.sqrt(weight_kg) / 6);
  } else if (unit === 'mg/dose') {
    rawDose = rule.dose_value;
  } else {
    rawDose = rule.dose_value;
  }

  // Apply min/max per kg bounds
  const minDose = rule.min_dose_per_kg ? rule.min_dose_per_kg * weight_kg : null;
  const maxDose = rule.max_dose_per_kg ? rule.max_dose_per_kg * weight_kg : null;
  const absMax = rule.max_total_mg || null;
  const weightMax = rule.weight_max_kg && weight_kg > rule.weight_max_kg
    ? rule.dose_value * rule.weight_max_kg
    : null;

  if (minDose && rawDose < minDose) {
    rawDose = minDose;
    warnings.push(`Dose adjusted to minimum (${rule.min_dose_per_kg} mg/kg).`);
  }
  if (maxDose && rawDose > maxDose) {
    rawDose = maxDose;
  }
  if (absMax && rawDose > absMax) {
    rawDose = absMax;
    warnings.push(`Dose capped at maximum ${absMax} mg.`);
  }
  if (weightMax && rawDose > weightMax) {
    rawDose = weightMax;
  }

  // Determine if it's per-day or per-dose
  const isPerDay = unit.includes('/day');
  const freqStr = rule.frequency || 'OD';
  const freqCount = parseFrequencyCount(freqStr);

  const dailyDose_mg = isPerDay ? rawDose : rawDose * freqCount;
  const dosePerAdmin_mg = isPerDay ? rawDose / freqCount : rawDose;

  // Rounding
  const rounded = applyRounding(dosePerAdmin_mg, rule.rounding_strategy);

  return {
    dosePerAdmin_mg: rounded,
    dailyDose_mg: parseFloat(dailyDose_mg.toFixed(1)),
    frequency: freqStr,
    route: rule.route,
    indication: rule.indication,
    phase: rule.phase,
    duration_days: rule.duration_days,
    duration_notes: rule.duration_notes,
    tdmRequired: rule.tdm_required || false,
    targetTrough: rule.target_trough || null,
    preWorkup: rule.pre_dose_workup || null,
    guidelineSource: rule.guideline_source || null,
    warnings,
    rule_id: rule.id,
  };
}

/**
 * Main entry point: fetch rule + calculate dose in one call.
 * This is what the AI prescriber and prescription workflow should use.
 */
export async function prescribeByIndication({ drugId, indication, patient, phase = null }) {
  const rule = await findDoseRule(drugId, indication, patient, phase);
  if (!rule) {
    return {
      error: `No DoseRule found for drug ${drugId} + indication "${indication}"${phase ? ` + phase "${phase}"` : ''}. Please add a DoseRule or select correct indication.`,
      dosePerAdmin_mg: null,
    };
  }
  const calc = calculateDoseFromRule(rule, patient);
  return { ...calc, rule };
}

/**
 * Get all available indications for a drug (from DoseRules)
 */
export async function getDrugIndications(drugId) {
  const rules = await base44.entities.DoseRule.filter({ drug_id: drugId });
  if (!rules || rules.length === 0) return [];
  // Unique indications
  const seen = new Set();
  return rules.filter(r => {
    if (seen.has(r.indication)) return false;
    seen.add(r.indication);
    return true;
  }).map(r => ({ indication: r.indication, phase: r.phase, tdmRequired: r.tdm_required }));
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function parseFrequencyCount(freq) {
  const f = (freq || '').toUpperCase();
  if (f.includes('QID') || f.includes('4X') || f.includes('Q6H')) return 4;
  if (f.includes('TDS') || f.includes('TID') || f.includes('3X') || f.includes('Q8H')) return 3;
  if (f.includes('BD') || f.includes('BID') || f.includes('2X') || f.includes('Q12H')) return 2;
  if (f.includes('WEEKLY') || f.includes('ONCE A WEEK')) return 0.14;
  if (f.includes('ALTERNATE') || f.includes('EOD') || f.includes('EVERY OTHER')) return 0.5;
  return 1; // OD default
}

function applyRounding(dose, strategy) {
  if (!strategy || strategy === 'exact') return parseFloat(dose.toFixed(2));
  if (strategy === 'nearest_5') return Math.round(dose / 5) * 5;
  if (strategy === 'nearest_10') return Math.round(dose / 10) * 10;
  if (strategy === 'round_up') return Math.ceil(dose);
  if (strategy === 'round_down') return Math.floor(dose);
  return parseFloat(dose.toFixed(1));
}

/**
 * FORMULARY COLLECTION MAP
 * Used to group Drug entity records by formulary_category in UI.
 */
export const FORMULARY_COLLECTION_LABELS = [
  "Steroids",
  "Calcineurin Inhibitors",
  "Antimetabolites",
  "Alkylating Agents",
  "Biologics",
  "RAAS Blockers",
  "Diuretics",
  "CKD-MBD",
  "Immunization & Infection Prophylaxis",
  "Dialysis Medications",
  "Transplant Medications",
  "ESA & Iron",
  "Emergency",
  "Immunomodulator",
  "Other",
];

/**
 * Fetch Drug records for a formulary collection, excluding hidden duplicates.
 * Always filters is_duplicate_hidden = false.
 */
export async function fetchFormularyCollection(formularyCategory) {
  const query = {
    is_duplicate_hidden: false,
    ...(formularyCategory && formularyCategory !== 'All' ? { formulary_category: formularyCategory } : {})
  };
  return base44.entities.Drug.filter(query, '-updated_date', 50);
}