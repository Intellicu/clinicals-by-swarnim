// ── Disease Activity Calculators — Pediatric Rheumatology ─────────────────
// JADAS-27, JADAS-71, SLEDAI-2K, BVAS, CMAS

// ── JADAS (Juvenile Arthritis Disease Activity Score) ──────────────────────
export const JADAS_INFO = {
  name: "JADAS (Juvenile Arthritis Disease Activity Score)",
  variants: ["JADAS-27", "JADAS-71", "JADAS-10", "cJADAS-27"],
  formula: "Physician Global Assessment (0–10) + Parent/Patient Global Assessment (0–10) + ESR normalised (0–10) + Active Joint Count",
  joint_counts: {
    "JADAS-27": 27,
    "JADAS-71": 71,
    "JADAS-10": 10
  },
  esr_normalisation: "ESR: (ESR mm/h − 20) / 10, capped at 0–10",
  cutoffs: {
    oligoarticular: { inactive: [0, 1], low: [1, 2], moderate: [2, 4.2], high: [4.2, 40] },
    polyarticular: { inactive: [0, 1], low: [1, 3.8], moderate: [3.8, 8.5], high: [8.5, 40] },
  },
  disease_states: {
    "Inactive Disease": { color: "bg-green-100 text-green-800", description: "Clinical remission on medication" },
    "Low Activity": { color: "bg-yellow-100 text-yellow-800", description: "Minimal disease activity" },
    "Moderate Activity": { color: "bg-orange-100 text-orange-800", description: "Significant disease activity, treatment review warranted" },
    "High Activity": { color: "bg-red-100 text-red-800", description: "High disease burden, aggressive intervention needed" },
  }
};

export function calculateJADAS27(physicianGlobal, patientGlobal, esr, activeJoints) {
  const esrNorm = Math.max(0, Math.min(10, (esr - 20) / 10));
  const score = physicianGlobal + patientGlobal + esrNorm + activeJoints;
  return {
    score: Math.round(score * 10) / 10,
    components: {
      physician_global: physicianGlobal,
      patient_global: patientGlobal,
      esr_normalised: Math.round(esrNorm * 10) / 10,
      active_joints: activeJoints,
    }
  };
}

export function interpretJADAS(score, subtype = "polyarticular") {
  const cut = JADAS_INFO.cutoffs[subtype] || JADAS_INFO.cutoffs.polyarticular;
  if (score <= cut.inactive[1]) return { state: "Inactive Disease", color: "green" };
  if (score <= cut.low[1]) return { state: "Low Activity", color: "yellow" };
  if (score <= cut.moderate[1]) return { state: "Moderate Activity", color: "orange" };
  return { state: "High Activity", color: "red" };
}

// ── SLEDAI-2K ───────────────────────────────────────────────────────────────
export const SLEDAI_ITEMS = [
  { id: "seizure", label: "Seizure", description: "Recent onset, exclude metabolic/drug/infective causes", weight: 8, domain: "Neuropsychiatric" },
  { id: "psychosis", label: "Psychosis", description: "Altered perception/delusions, not drug-related", weight: 8, domain: "Neuropsychiatric" },
  { id: "organic_brain", label: "Organic Brain Syndrome", description: "Altered cognition, excluding metabolic causes", weight: 8, domain: "Neuropsychiatric" },
  { id: "visual_disturbance", label: "Visual Disturbance", description: "Retinal changes, cytoid bodies, retinal haemorrhage", weight: 8, domain: "Neuropsychiatric" },
  { id: "cranial_nerve", label: "Cranial Nerve Disorder", description: "New onset sensory/motor disorder", weight: 8, domain: "Neuropsychiatric" },
  { id: "lupus_headache", label: "Lupus Headache", description: "Severe persistent, not responding to narcotics", weight: 8, domain: "Neuropsychiatric" },
  { id: "cva", label: "CVA / TIA", description: "Cerebrovascular accident, not arteriosclerosis", weight: 8, domain: "Neuropsychiatric" },
  { id: "vasculitis", label: "Vasculitis", description: "Ulceration, gangrene, infarction, digital infarcts", weight: 8, domain: "Vascular" },
  { id: "arthritis", label: "Arthritis", description: "≥2 joints with tenderness + signs of inflammation", weight: 4, domain: "Musculoskeletal" },
  { id: "myositis", label: "Myositis", description: "Proximal muscle aching/weakness + elevated CK/aldolase", weight: 4, domain: "Musculoskeletal" },
  { id: "urinary_casts", label: "Urinary Casts", description: "Granular, red cell, or mixed casts", weight: 4, domain: "Renal" },
  { id: "haematuria", label: "Haematuria", description: ">5 RBCs/hpf, exclude stone/infection", weight: 4, domain: "Renal" },
  { id: "proteinuria", label: "Proteinuria", description: ">0.5g/24h, new or recent increase", weight: 4, domain: "Renal" },
  { id: "pyuria", label: "Pyuria", description: ">5 WBCs/hpf, no infection", weight: 4, domain: "Renal" },
  { id: "rash", label: "Rash", description: "Inflammatory rash — new or recurrence", weight: 2, domain: "Mucocutaneous" },
  { id: "alopecia", label: "Alopecia", description: "Abnormal patchy or diffuse hair loss — active", weight: 2, domain: "Mucocutaneous" },
  { id: "mucosal_ulcers", label: "Mucosal Ulcers", description: "Oral/nasal ulcers — new/active", weight: 2, domain: "Mucocutaneous" },
  { id: "pleurisy", label: "Pleurisy", description: "Pleuritic chest pain + rub/effusion", weight: 2, domain: "Serosal" },
  { id: "pericarditis", label: "Pericarditis", description: "Pericardial pain + friction rub/ECG changes", weight: 2, domain: "Serosal" },
  { id: "low_complement", label: "Low Complement", description: "Decreased C3/C4/CH50 below normal lab range", weight: 2, domain: "Immunologic" },
  { id: "increased_dna", label: "Increased dsDNA Binding", description: ">25% binding or above normal range", weight: 2, domain: "Immunologic" },
  { id: "fever", label: "Fever", description: "≥38°C after excluding infection", weight: 1, domain: "Constitutional" },
  { id: "thrombocytopenia", label: "Thrombocytopenia", description: "Platelets <100×10⁹/L, exclude drug causes", weight: 1, domain: "Hematologic" },
  { id: "leukopenia", label: "Leukopenia", description: "WBC <3×10⁹/L, exclude drug causes", weight: 1, domain: "Hematologic" },
];

export function calculateSLEDAI(checkedItems) {
  const score = SLEDAI_ITEMS
    .filter(item => checkedItems.includes(item.id))
    .reduce((sum, item) => sum + item.weight, 0);
  return score;
}

export function interpretSLEDAI(score) {
  if (score === 0) return { state: "No Activity", color: "green", management: "Continue current therapy, routine monitoring" };
  if (score <= 6) return { state: "Mild Activity", color: "yellow", management: "Review hydroxychloroquine adherence, consider adding low-dose steroid" };
  if (score <= 12) return { state: "Moderate Activity", color: "orange", management: "Increase immunosuppression, nephrology review if renal domain active" };
  if (score <= 20) return { state: "High Activity", color: "red", management: "Aggressive therapy escalation, IV methylprednisolone, assess for hospitalisation" };
  return { state: "Very High Activity", color: "red", management: "Urgent inpatient management, consider biologic rescue therapy" };
}

// ── BVAS (Birmingham Vasculitis Activity Score) ─────────────────────────────
export const BVAS_ITEMS = [
  // General
  { id: "bvas_myalgia", label: "Myalgia", domain: "General", weight: 1 },
  { id: "bvas_arthralgia", label: "Arthralgia/Arthritis", domain: "General", weight: 1 },
  { id: "bvas_fever", label: "Fever ≥38°C", domain: "General", weight: 2 },
  { id: "bvas_weight_loss", label: "Weight loss >2kg", domain: "General", weight: 2 },
  // Skin
  { id: "bvas_infarct", label: "Infarct/digital gangrene", domain: "Skin", weight: 6 },
  { id: "bvas_purpura", label: "Purpura", domain: "Skin", weight: 3 },
  { id: "bvas_ulcer", label: "Skin ulcer", domain: "Skin", weight: 6 },
  { id: "bvas_other_skin", label: "Other skin vasculitis", domain: "Skin", weight: 3 },
  // Mucous membranes / eyes
  { id: "bvas_mouth_ulcer", label: "Mouth ulcers", domain: "Mucous Membranes/Eyes", weight: 3 },
  { id: "bvas_conjunctivitis", label: "Conjunctivitis/episcleritis/scleritis", domain: "Mucous Membranes/Eyes", weight: 3 },
  { id: "bvas_visual_loss", label: "Visual loss/sudden blindness", domain: "Mucous Membranes/Eyes", weight: 6 },
  // ENT
  { id: "bvas_nasal", label: "Nasal blockade/discharge", domain: "ENT", weight: 2 },
  { id: "bvas_sinusitis", label: "Paranasal sinus involvement", domain: "ENT", weight: 2 },
  { id: "bvas_subglottic", label: "Subglottic stenosis", domain: "ENT", weight: 6 },
  // Chest
  { id: "bvas_wheeze", label: "Wheeze", domain: "Chest", weight: 2 },
  { id: "bvas_nodules", label: "Nodules/cavities on CXR", domain: "Chest", weight: 3 },
  { id: "bvas_haemoptysis", label: "Haemoptysis", domain: "Chest", weight: 4 },
  { id: "bvas_pleurisy", label: "Pleurisy", domain: "Chest", weight: 4 },
  { id: "bvas_diffuse_alv", label: "Diffuse alveolar haemorrhage", domain: "Chest", weight: 6 },
  // Cardiovascular
  { id: "bvas_pericarditis", label: "Pericarditis", domain: "Cardiovascular", weight: 3 },
  // Abdominal
  { id: "bvas_abdominal", label: "Abdominal pain/peritonism", domain: "Abdominal", weight: 9 },
  // Renal
  { id: "bvas_haematuria", label: "Haematuria (>10 RBC/hpf)", domain: "Renal", weight: 6 },
  { id: "bvas_proteinuria", label: "Proteinuria >1+", domain: "Renal", weight: 4 },
  { id: "bvas_creatinine", label: "Creatinine 125–249 μmol/L", domain: "Renal", weight: 4 },
  { id: "bvas_creatinine_high", label: "Creatinine ≥250 μmol/L or rising >10%", domain: "Renal", weight: 6 },
  // Nervous system
  { id: "bvas_meningitis", label: "Aseptic meningitis", domain: "Nervous System", weight: 9 },
  { id: "bvas_mononeuritis", label: "Mononeuritis multiplex", domain: "Nervous System", weight: 9 },
  { id: "bvas_motor_neuropathy", label: "Motor peripheral neuropathy", domain: "Nervous System", weight: 9 },
];

export function calculateBVAS(checkedItems) {
  return BVAS_ITEMS
    .filter(i => checkedItems.includes(i.id))
    .reduce((sum, i) => sum + i.weight, 0);
}

export function interpretBVAS(score) {
  if (score === 0) return { state: "Remission", color: "green" };
  if (score <= 15) return { state: "Mild-Moderate Activity", color: "yellow" };
  if (score <= 29) return { state: "Moderate-High Activity", color: "orange" };
  return { state: "Very High Activity / Refractory", color: "red" };
}

// ── CMAS (Childhood Myositis Assessment Scale) ──────────────────────────────
export const CMAS_ITEMS = [
  { id: "head_lift", label: "Head Lift", maxScore: 3, description: "Ability to hold head off table" },
  { id: "leg_raise", label: "Leg Raise Duration", maxScore: 3, description: "Hold leg at 45° for up to 30s (0=can't, 3=30s)" },
  { id: "supine_to_sit", label: "Supine to Sitting", maxScore: 3, description: "Sit up from lying without using arms" },
  { id: "sit_to_stand", label: "Sit to Standing", maxScore: 3, description: "Stand up from chair without arm support" },
  { id: "stair_climb", label: "Stair Climbing", maxScore: 3, description: "Climb stairs without handrail" },
  { id: "floor_to_stand", label: "Floor to Standing", maxScore: 3, description: "Stand from sitting on floor" },
  { id: "step_up", label: "Step Up", maxScore: 3, description: "Step up onto single step" },
  { id: "arm_raise", label: "Arm Raise Duration", maxScore: 3, description: "Hold arm at 90° for up to 30s" },
  { id: "arm_overhead", label: "Arm Overhead", maxScore: 3, description: "Raise arm overhead" },
  { id: "reach", label: "Reach and Grasp", maxScore: 3, description: "Reach above head and grasp" },
];

export function interpretCMAS(score) {
  const maxScore = CMAS_ITEMS.reduce((sum, i) => sum + i.maxScore, 0);
  const percent = (score / maxScore) * 100;
  if (percent >= 80) return { state: "Minimal/No Impairment", color: "green" };
  if (percent >= 60) return { state: "Mild Impairment", color: "yellow" };
  if (percent >= 40) return { state: "Moderate Impairment", color: "orange" };
  return { state: "Severe Impairment", color: "red" };
}

export const CMAS_MAX = CMAS_ITEMS.reduce((sum, i) => sum + i.maxScore, 0);