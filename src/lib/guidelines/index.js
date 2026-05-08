/**
 * Master guidelines index — aggregates all module exports
 */
import { CORE_GUIDELINES } from "./guidelinesCore";
import { DIALYSIS_GUIDELINES } from "./guidelinesDialysis";
import { GLOMERULAR_GUIDELINES } from "./guidelinesGlomerular";
import { CAKUT_GUIDELINES } from "./guidelinesCakut";

export const BUILTIN_GUIDELINES = [
  ...CORE_GUIDELINES,
  ...DIALYSIS_GUIDELINES,
  ...GLOMERULAR_GUIDELINES,
  ...CAKUT_GUIDELINES,
];

// ── Emergency Protocols ──────────────────────────────────────────────────
export const EMERGENCY_PROTOCOLS = [
  {
    id: "em-hyperkalemia",
    title: "Hyperkalemia Emergency",
    icon: "⚡",
    color: "red",
    steps: [
      "ECG IMMEDIATELY — peaked T waves / wide QRS / sine wave → cardiac risk",
      "Calcium gluconate 10%: 0.5–1 mL/kg IV over 5 min (cardiac protection; does NOT lower K⁺)",
      "Salbutamol 2.5–5 mg nebulised (K⁺ shift in; onset 30 min)",
      "NaHCO₃ 1–2 mEq/kg IV if acidotic (onset 15–30 min; avoid if hypernatraemic)",
      "Insulin 0.1 U/kg + dextrose 0.5 g/kg IV (monitor glucose q30 min)",
      "Furosemide 1–2 mg/kg IV if not anuric (renal K⁺ excretion)",
      "Calcium resonium 1 g/kg PO/PR (GI removal; slow 4–6h)",
      "Dialysis if K⁺ >7 or ECG worsening despite above — DO NOT DELAY"
    ]
  },
  {
    id: "em-htn-emergency",
    title: "Hypertensive Emergency",
    icon: "🩸",
    color: "red",
    steps: [
      "Confirm end-organ damage: encephalopathy / seizure / papilloedema / AKI",
      "Reduce MAP by 25% over 6–8h ONLY — NOT rapid normalisation (autoregulation)",
      "IV access + continuous arterial BP monitoring (arterial line preferred)",
      "IV nicardipine 1–3 mcg/kg/min infusion (titratable, preferred) OR",
      "IV labetolol 0.25–1 mg/kg bolus q15 min or infusion 0.25–3 mg/kg/h",
      "AVOID sublingual nifedipine — precipitous BP drop → cerebral ischaemia",
      "Seizures → lorazepam; no anti-epileptics needed if BP controlled",
      "Investigate cause: USS, U/A, electrolytes, toxicology, fundoscopy"
    ]
  },
  {
    id: "em-aki-anuria",
    title: "AKI with Anuria",
    icon: "🔴",
    color: "red",
    steps: [
      "Flush urinary catheter / replace if blocked — exclude post-renal obstruction",
      "Urgent renal USS to exclude obstructive uropathy",
      "IV fluid challenge 10–20 mL/kg NS over 30–60 min if pre-renal suspected",
      "No response: furosemide 2–4 mg/kg IV stat",
      "Stat ECG: check for hyperkalaemia; electrolytes + ABG",
      "Restrict fluids to insensible + UO once intrinsic AKI confirmed",
      "Weigh every 6h — fluid overload >15% = diuresis or dialysis trigger",
      "Dialysis if K⁺ >6.5, pH <7.1, fluid overload >20%, or anuria >12–24h"
    ]
  },
  {
    id: "em-ns-relapse-complications",
    title: "NS Relapse + Complications",
    icon: "💧",
    color: "orange",
    steps: [
      "Dipstick 2+ × 3 consecutive days = relapse — restart prednisolone SAME DAY",
      "Prednisolone 60 mg/m²/day (max 60 mg) until 3 consecutive trace/nil",
      "Identify trigger: throat swab, urine C&S, CXR if febrile — treat infection first",
      "SBP suspected (fever + abdominal pain): IV cefotaxime 50 mg/kg/dose TDS + albumin",
      "Severe oedema + albumin >1.5: furosemide 1 mg/kg IV",
      "Severe oedema + albumin <1.5: IV albumin 1 g/kg over 4h + furosemide 1 mg/kg",
      "DVT suspected: USS Doppler; anticoagulate if confirmed",
      "≥3 relapses/year or SDNS pattern → escalate to steroid-sparing agent"
    ]
  },
  {
    id: "em-peritonitis",
    title: "PD Peritonitis",
    icon: "🟡",
    color: "orange",
    steps: [
      "Cloudy effluent + pain ± fever = peritonitis until proven otherwise",
      "Send effluent WBC + Gram stain + C&S BEFORE antibiotics",
      "Heparin 500 U/L in every bag (prevents fibrin clot)",
      "Empiric IP vancomycin 25 mg/L + IP ceftazidime 125 mg/L (every exchange)",
      "Rapid exchanges (1h dwells) × 24h to clear turbid effluent",
      "Effluent WBC at 48–72h: should fall; culture guides de-escalation at 72h",
      "Fungal peritonitis or no response at 96h: remove catheter + antifungal",
      "Duration: ≥14 days; 4 weeks for S. aureus; 6 weeks for fungi"
    ]
  }
];

// ── Audit Engine ──────────────────────────────────────────────────────────
const SECTION_CHECKS = {
  definition:   { label: "Definition", fn: s => !!(s.quick_summary?.definition) },
  emergency:    { label: "Emergency Recognition", fn: s => !!(s.quick_summary?.emergency_recognition?.length >= 2) },
  immediate:    { label: "Immediate Management", fn: s => !!(s.quick_summary?.immediate_management?.length >= 2) },
  staging:      { label: "Staging/Classification", fn: s => !!(s.staging || s.classification) },
  management:   { label: "Stepwise Management", fn: s => !!(s.management && Object.keys(s.management).length > 0) },
  drugs:        { label: "Drug Dosing", fn: s => !!(s.drugs?.length >= 2) },
  monitoring:   { label: "Monitoring", fn: s => !!(s.monitoring?.parameters?.length >= 3) },
  nutrition:    { label: "Nutrition", fn: s => !!(s.nutrition?.length >= 2) },
  vaccination:  { label: "Vaccination", fn: s => !!(s.vaccination?.length >= 1) },
  red_flags:    { label: "Red Flags", fn: s => !!(s.red_flags?.length >= 2) },
  pearls:       { label: "Clinical Pearls", fn: s => !!(s.pearls?.length >= 2) },
};

export function auditGuideline(guideline) {
  if (!guideline.sections) {
    // DB guideline (flat)
    const g = guideline;
    const results = {
      definition:  { present: !!(g.scope_and_population?.length > 30), label: "Clinical Summary" },
      management:  { present: !!(g.key_recommendations?.filter(r => r?.trim()).length >= 3), label: "Management Steps" },
      pearls:      { present: !!(g.practice_pearls?.filter(p => p?.trim()).length >= 2), label: "Practice Pearls" },
      evidence:    { present: !!(g.evidence_level && g.evidence_level !== "Expert Opinion"), label: "Evidence Level" },
      source:      { present: !!(g.source && g.year), label: "Source & Year" },
      summary:     { present: !!(g.summary?.length > 50), label: "Full Summary" },
    };
    const filled = Object.values(results).filter(r => r.present).length;
    const pct = Math.round((filled / 6) * 100);
    const maturity = pct >= 80 ? "Partial" : pct >= 50 ? "Superficial" : "Legacy";
    return { results, pct, maturity, filled, total: 6 };
  }
  // Built-in structured guideline
  const s = guideline.sections;
  const results = {};
  let filled = 0;
  const total = Object.keys(SECTION_CHECKS).length;
  for (const [key, cfg] of Object.entries(SECTION_CHECKS)) {
    const present = cfg.fn(s);
    results[key] = { present, label: cfg.label };
    if (present) filled++;
  }
  const pct = Math.round((filled / total) * 100);
  const maturity = pct >= 90 ? "Mature" : pct >= 65 ? "Partial" : pct >= 35 ? "Superficial" : "Legacy";
  return { results, pct, maturity, filled, total };
}

export function getMaturityColor(maturity) {
  return {
    "Mature":      { bg: "bg-green-100", text: "text-green-800", border: "border-green-300", dot: "bg-green-500" },
    "Partial":     { bg: "bg-blue-100",  text: "text-blue-800",  border: "border-blue-300",  dot: "bg-blue-500" },
    "Superficial": { bg: "bg-amber-100", text: "text-amber-800", border: "border-amber-300", dot: "bg-amber-500" },
    "Legacy":      { bg: "bg-slate-100", text: "text-slate-600", border: "border-slate-300", dot: "bg-slate-400" },
  }[maturity] || { bg: "bg-slate-100", text: "text-slate-600", border: "border-slate-300", dot: "bg-slate-400" };
}

export function getMissingSections(audit) {
  return Object.values(audit.results).filter(r => !r.present).map(r => r.label);
}