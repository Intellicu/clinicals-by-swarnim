/**
 * PATHWAY EXECUTION ENGINE
 * Upgrades static pathways to executable clinical workflows.
 * Evaluates trigger conditions, severity logic, escalation flags,
 * and returns dynamic protocol branches.
 */

import { getFact, CLINICAL_FACTS } from "./ClinicalFactsRegistry";
import { checkElectrolytes, checkInteractions } from "./SafetyEngine";

// ── Pathway Registry ────────────────────────────────────────────────────────
export const PATHWAY_REGISTRY = {

  nephrotic_relapse: {
    id: "nephrotic_relapse",
    title: "NS Relapse Pathway",
    category: "Nephrotic Syndrome",
    trigger_condition: {
      description: "Dipstick ≥3+ for 3 consecutive days",
      fn: (ctx) => ctx.dipstick_days >= 3 && ctx.dipstick_level >= 3,
    },
    severity_logic: (ctx) => {
      if (ctx.albumin < 1.0 || ctx.has_peritonitis || ctx.respiratory_distress) return "SEVERE";
      if (ctx.albumin < 2.0) return "MODERATE";
      return "MILD";
    },
    escalation_logic: {
      SEVERE: {
        icu_trigger: ctx => ctx.respiratory_distress || ctx.hemodynamically_unstable,
        actions: ["IV albumin", "IV furosemide", "ICU escalation", "SBP workup"],
        linked_templates: ["albumin_infusion", "ns_emergency_protocol"],
      },
      MODERATE: {
        actions: ["Restart prednisolone 60 mg/m²/day", "Identify trigger infection", "Daily dipstick"],
        linked_templates: ["prednisolone_relapse"],
      },
      MILD: {
        actions: ["Restart prednisolone 60 mg/m²/day", "Parent-initiated protocol", "Clinic in 2 weeks"],
        linked_templates: ["prednisolone_relapse"],
      },
    },
    branch_logic: (ctx) => {
      const branches = [];
      if (ctx.relapse_count_6m >= 2) branches.push("FRNS_branch");
      if (ctx.on_alternate_day_pred && ctx.on_pred_dose <= 0.5) branches.push("SDNS_branch");
      if (ctx.weeks_on_pred >= 8 && ctx.no_remission) branches.push("SRNS_branch");
      return branches;
    },
    emergency_flags: ["SBP_risk", "thrombosis_risk", "hypovolemia_risk"],
    monitoring: ["daily_dipstick", "weekly_albumin", "weekly_BP", "weekly_weight"],
  },

  hyperkalemia: {
    id: "hyperkalemia",
    title: "Hyperkalaemia Emergency Pathway",
    category: "Electrolytes",
    trigger_condition: {
      description: "K+ >5.5 mmol/L",
      fn: (ctx) => ctx.serum_potassium > 5.5,
    },
    severity_logic: (ctx) => {
      if (ctx.serum_potassium > 6.5 || ctx.ecg_changes) return "CRITICAL";
      if (ctx.serum_potassium > 6.0) return "SEVERE";
      return "MODERATE";
    },
    escalation_logic: {
      CRITICAL: {
        icu_trigger: () => true,
        actions: [
          "ECG immediately",
          "Calcium gluconate 0.5–1 mL/kg 10% IV over 5 min",
          "Salbutamol nebulised",
          "Insulin 0.1 U/kg + Dextrose 0.5 g/kg IV",
          "NaHCO₃ 1–2 mEq/kg if acidotic",
          "Dialysis if refractory",
        ],
        linked_templates: ["calcium_gluconate_hyperK", "insulin_dextrose_hyperK"],
      },
      SEVERE: {
        actions: ["Salbutamol neb", "Furosemide 2 mg/kg IV", "Calcium resonium 1 g/kg PO/PR", "Repeat K+ in 2h"],
        linked_templates: ["calcium_resonium_protocol"],
      },
      MODERATE: {
        actions: ["Dietary K+ restriction", "Review K+-sparing drugs (ACE-I, K+-sparing diuretics)", "K+ in 4–6h"],
        linked_templates: [],
      },
    },
    emergency_flags: ["ECG_monitoring_required", "ICU_escalation_if_ECG_changes"],
    monitoring: ["ECG_continuous_if_critical", "K+_q1h_until_normal", "glucose_q30min_on_insulin"],
  },

  hypertensive_emergency: {
    id: "hypertensive_emergency",
    title: "Hypertensive Emergency Pathway",
    category: "Hypertension",
    trigger_condition: {
      description: "BP >99th %ile + end-organ damage signs",
      fn: (ctx) => ctx.bp_percentile > 99 && ctx.end_organ_damage,
    },
    severity_logic: (ctx) => {
      if (ctx.seizures || ctx.altered_consciousness || ctx.papilloedema) return "HYPERTENSIVE_ENCEPHALOPATHY";
      if (ctx.bp_percentile > 99) return "HYPERTENSIVE_URGENCY";
      return "STAGE2";
    },
    escalation_logic: {
      HYPERTENSIVE_ENCEPHALOPATHY: {
        icu_trigger: () => true,
        actions: [
          "ICU admission",
          "IV nicardipine 1–3 mcg/kg/min OR IV labetolol 0.25 mg/kg q15 min",
          "Reduce MAP by 25% over 6–8h ONLY — do NOT rapidly normalize",
          "CT brain to exclude intracranial bleed",
          "Seizure management if active",
        ],
        linked_templates: ["nicardipine_iv", "labetolol_iv"],
      },
      HYPERTENSIVE_URGENCY: {
        actions: [
          "Oral amlodipine 0.2 mg/kg",
          "4-hourly BP monitoring",
          "Urgent secondary cause workup",
          "Nephrology consult same day",
        ],
        linked_templates: ["amlodipine_oral"],
      },
    },
    emergency_flags: ["do_not_rapidly_normalize_BP", "cerebral_autoregulation_risk"],
    monitoring: ["BP_q15min_on_IV", "neurological_status", "renal_function_daily"],
  },

  srns_workup: {
    id: "srns_workup",
    title: "SRNS Diagnostic & Treatment Pathway",
    category: "Nephrotic Syndrome",
    trigger_condition: {
      description: "No remission after 8 weeks full prednisolone",
      fn: (ctx) => ctx.weeks_on_pred >= 8 && ctx.no_remission,
    },
    severity_logic: () => "STANDARD",
    escalation_logic: {
      STANDARD: {
        actions: [
          "Renal biopsy (FSGS, MCD, MN, other)",
          "Genetic panel: NPHS1, NPHS2, WT1, PLCE1, TRPC6, INF2, CD2AP",
          "Tacrolimus 0.1–0.2 mg/kg/day (trough 5–10 ng/mL) + low-dose prednisolone",
          "ACE-I + ARB for antiproteinuric control",
          "Rituximab if CNI failure after 6 months",
        ],
        linked_templates: ["tacrolimus_srns", "mmf_srns"],
      },
    },
    branch_logic: (ctx) => {
      const branches = [];
      if (ctx.genetic_mutation_found) branches.push("genetic_SRNS_branch");
      if (ctx.fsgs_on_biopsy) branches.push("FSGS_treatment_branch");
      return branches;
    },
    monitoring: ["tacrolimus_trough_weekly", "creatinine_weekly", "upcr_monthly"],
  },

  aki_icu: {
    id: "aki_icu",
    title: "AKI ICU Management Pathway",
    category: "AKI",
    trigger_condition: {
      description: "AKI Stage 2–3 in ICU or with complications",
      fn: (ctx) => ctx.aki_stage >= 2 || ctx.fluid_overload_pct >= 15,
    },
    severity_logic: (ctx) => {
      if (ctx.aki_stage === 3 || ctx.fluid_overload_pct >= 20) return "CRITICAL";
      if (ctx.aki_stage === 2 || ctx.fluid_overload_pct >= 15) return "SEVERE";
      return "MODERATE";
    },
    escalation_logic: {
      CRITICAL: {
        icu_trigger: () => true,
        actions: [
          "Immediate RRT initiation (CRRT preferred if hemodynamically unstable)",
          "Strict I/O catheter + daily weight",
          "Stop all nephrotoxins",
          "Electrolytes q4–6h",
          "Nutrition: 1.5–2.0 g/kg/day protein (2.5–3.0 on CRRT)",
        ],
        linked_templates: ["crrt_prescription", "aki_electrolyte_management"],
      },
      SEVERE: {
        actions: [
          "Nephrology urgent consult",
          "Furosemide IV if volume-replete",
          "Daily weight, q6h electrolytes",
          "USS kidneys",
        ],
        linked_templates: ["furosemide_aki"],
      },
    },
    emergency_flags: ["rrt_indication", "fluid_overload_emergency"],
    monitoring: ["hourly_urine_output", "q4h_electrolytes", "daily_weight_twice", "bp_q4h"],
  },
};

/**
 * Execute a pathway for a given patient context
 * @param {string} pathwayId
 * @param {object} ctx - patient context
 * @returns {{ severity, actions, branches, escalation, emergency_flags, monitoring, safety_alerts }}
 */
export function executePathway(pathwayId, ctx = {}) {
  const pathway = PATHWAY_REGISTRY[pathwayId];
  if (!pathway) return { error: `Unknown pathway: ${pathwayId}` };

  // Check trigger condition
  const triggered = pathway.trigger_condition.fn(ctx);
  if (!triggered) return { triggered: false, pathway: pathway.title, message: "Trigger condition not met" };

  // Evaluate severity
  const severity = pathway.severity_logic(ctx);
  const escalation = pathway.escalation_logic[severity] || {};

  // Run branch logic
  const branches = pathway.branch_logic ? pathway.branch_logic(ctx) : [];

  // Run safety checks
  const safety_alerts = [
    ...checkElectrolytes(ctx),
    ...checkInteractions(ctx.current_medications || [], ctx),
  ];

  return {
    triggered: true,
    pathway: pathway.title,
    severity,
    icu_required: escalation.icu_trigger ? escalation.icu_trigger(ctx) : false,
    actions: escalation.actions || [],
    linked_templates: escalation.linked_templates || [],
    branches,
    emergency_flags: pathway.emergency_flags || [],
    monitoring: pathway.monitoring || [],
    safety_alerts,
  };
}

/**
 * Detect applicable pathways from patient context
 * @param {object} ctx
 * @returns {object[]}
 */
export function detectApplicablePathways(ctx = {}) {
  return Object.values(PATHWAY_REGISTRY).filter(p => {
    try { return p.trigger_condition.fn(ctx); } catch { return false; }
  });
}

/**
 * Generate a differential from symptom/lab combination
 * @param {object} symptoms - e.g., { hematuria: true, low_c3: true, hypertension: true }
 * @returns {{ differentials, recommended_investigations, linked_pathways }}
 */
export function getDifferentialDiagnosis(symptoms = {}) {
  const ddx = [];

  // Hematuria patterns
  if (symptoms.hematuria && symptoms.low_c3) {
    ddx.push({ dx: "PSGN", probability: "High", investigations: ["ASO titre", "anti-DNase B", "C3 repeat in 6w"] });
    ddx.push({ dx: "Membranoproliferative GN (C3G/MPGN)", probability: "Moderate", investigations: ["C3 nephritic factor", "factor H level", "CFH mutation panel"] });
    ddx.push({ dx: "Lupus Nephritis", probability: "Moderate", investigations: ["ANA", "anti-dsDNA", "C4", "CBC", "urine microscopy"] });
  }
  if (symptoms.hematuria && symptoms.proteinuria && symptoms.hypertension) {
    ddx.push({ dx: "IgA Nephropathy", probability: "Moderate", investigations: ["serum IgA", "renal biopsy if persistent"] });
    ddx.push({ dx: "IgA Vasculitis (HSP)", probability: "Moderate", investigations: ["skin biopsy", "IgA level", "UPCR"] });
  }
  if (symptoms.hematuria && symptoms.hearing_loss) {
    ddx.push({ dx: "Alport Syndrome", probability: "High", investigations: ["COL4A3/4/5 genetics", "skin biopsy EM", "audiogram"] });
  }
  if (symptoms.hemolytic_anemia && symptoms.thrombocytopenia && symptoms.aki) {
    ddx.push({ dx: "STEC-HUS", probability: "High if diarrhea prodrome", investigations: ["stool STEC PCR", "blood film schistocytes", "ADAMTS13"] });
    ddx.push({ dx: "aHUS", probability: "High if no diarrhea", investigations: ["complement C3/C4/CH50", "CFH level", "genetic panel"] });
    ddx.push({ dx: "TTP", probability: "If ADAMTS13 <10%", investigations: ["ADAMTS13 activity URGENTLY before plasma exchange"] });
  }
  if (symptoms.nephrotic_syndrome && symptoms.hearing_loss && !symptoms.edema) {
    ddx.push({ dx: "Congenital Nephrotic Syndrome", probability: "High if <1y", investigations: ["NPHS1", "NPHS2", "WT1"] });
  }
  if (symptoms.srns && symptoms.hearing_loss) {
    ddx.push({ dx: "WT1 mutation (Denys-Drash / Frasier)", probability: "Moderate", investigations: ["WT1 mutation panel", "gonads assessment", "Wilms tumor surveillance"] });
  }
  if (symptoms.recurrent_hus) {
    ddx.push({ dx: "aHUS (complement-mediated)", probability: "High", investigations: ["CFH/CFI/CD46/C3/CFB gene panel", "anti-CFH antibodies"] });
  }

  const linked_pathways = ddx.flatMap(d => {
    if (d.dx.includes("HUS")) return ["aki_icu"];
    if (d.dx.includes("NS")) return ["nephrotic_relapse", "srns_workup"];
    return [];
  });

  return {
    differentials: ddx,
    recommended_investigations: [...new Set(ddx.flatMap(d => d.investigations))],
    linked_pathways: [...new Set(linked_pathways)],
  };
}