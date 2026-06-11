import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle, ChevronDown, ChevronUp, Clock, Droplets,
  Thermometer, Pill, Shield, Activity, Info, CheckCircle,
  BookOpen, FlaskConical, Syringe
} from "lucide-react";
import { getFormularyDrug } from "@/lib/formulary/nephrology-drugs";
import FormularyMonograph from "./FormularyMonograph";

// ── Static practical guidance library ──────────────────────────────────────
export const DRUG_GUIDANCE = {
  prednisolone: {
    timing: "Morning dosing (single dose) to mimic cortisol diurnal rhythm. Alternate-day dosing preferred for long-term use.",
    food: "Take WITH food or milk to reduce GI irritation. Never on empty stomach.",
    hydration: "Encourage normal fluid intake. Monitor for fluid retention and edema.",
    storage: "Room temperature. Syrup: refrigerate after opening, use within 28 days.",
    crush: "Tablets can be dispersed in water. Enteric-coated formulations — do NOT crush.",
    ng_tube: "Suspension preferred for NG tube. Flush well after.",
    missed_dose: "If missed same morning — take immediately. If evening already — skip; do NOT double dose.",
    formulations_india: ["Prednisolone 5 mg tab", "Prednisolone 10 mg tab", "Prednisolone 20 mg tab", "Prednisolone 1 mg/mL syrup (Omnacortil)", "Wysolone 5/10/20/40 mg"],
    monitoring: "Weekly BP + weight during induction. Monthly height, glucose, bone profile. Annual ophthalmology (cataracts), DEXA if >3 months.",
    vaccine_precautions: "No live vaccines during high-dose (>2 mg/kg/day or >20 mg/day) steroids. MMR, varicella, BCG — wait till dose ≤0.5 mg/kg/day. Annual influenza (inactivated).",
    contraindications: "Active untreated TB, systemic fungal infection, live vaccine administration during high dose.",
    pearls: "Pulse steroids (30 mg/kg/day methylprednisolone IV × 3 days) for steroid-resistant disease. Calcium 500 mg + Vit D 400 IU daily for all children on >4 weeks steroids. PPI (omeprazole) if concurrent NSAIDs.",
    ckd_notes: "No dose adjustment needed. Monitor fluid retention and hypertension closely in CKD/dialysis.",
    verified: true, last_updated: "2025-01"
  },
  methylprednisolone: {
    timing: "IV infusion over 30–60 minutes. Pulse: 30 mg/kg/dose (max 1 g) × 3 consecutive days.",
    food: "IV formulation. Oral: with food.",
    hydration: "IV: maintain adequate hydration. Monitor BP and cardiac function during pulse therapy.",
    storage: "Reconstituted solution stable 48h at room temperature, 7 days refrigerated (2–8°C).",
    crush: "Oral tabs can be crushed. IV only for pulse therapy.",
    ng_tube: "Oral suspension via NG tube — flush well.",
    missed_dose: "IV pulse — hospital-administered, no missed dose scenario.",
    formulations_india: ["Methylprednisolone 4 mg tab", "Methylprednisolone 16 mg tab", "Solu-Medrol 125 mg/500 mg/1 g vials", "Depomedrol 40 mg/mL depot injection"],
    monitoring: "BP and glucose every 30 min during IV pulse. ECG monitoring if cardiac history. CBC, electrolytes post-pulse.",
    vaccine_precautions: "Same as prednisolone — no live vaccines during high-dose therapy.",
    contraindications: "Systemic fungal infection. Caution in diabetes, active infection, psychosis.",
    pearls: "Conversion: Methylprednisolone 4 mg = Prednisolone 5 mg. Preferred for IV pulse due to minimal mineralocorticoid effect. Bradycardia risk if infused too rapidly — never IV bolus.",
    ckd_notes: "No dose adjustment. Used for transplant rejection — standard doses.",
    verified: true, last_updated: "2025-01"
  },
  tacrolimus: {
    timing: "Twice daily, 12 hours apart. CONSISTENT timing every day. Empty stomach or consistently with food (same way each time).",
    food: "Take on EMPTY stomach for consistent absorption (1 hour before or 2 hours after meals). High-fat meals reduce absorption by 25–40%.",
    hydration: "Adequate hydration essential — nephrotoxicity risk in dehydration.",
    storage: "Room temperature, away from moisture and light. Capsules — do not crush.",
    crush: "Capsules should NOT be opened/crushed (tacrolimus is a vesicant — skin/eye irritant). If unable to swallow: compound suspension by pharmacist only.",
    ng_tube: "Compounded suspension via NG tube — specialist preparation required.",
    missed_dose: "If <6 hours late — take as soon as remembered. If >6 hours — skip that dose. Never double dose.",
    formulations_india: ["Tacrolimus 0.5 mg cap (Pangraf, Tacrograf)", "Tacrolimus 1 mg cap", "Tacrolimus 5 mg cap", "Tacrolimus 0.1 mg/mL oral solution (imported)"],
    monitoring: "Trough levels (C0) before morning dose: target 8–12 ng/mL (1st year transplant), 5–8 ng/mL (maintenance). CBC, creatinine, LFT, glucose, electrolytes: weekly first month, then monthly.",
    vaccine_precautions: "No live vaccines. Annual inactivated influenza. Pneumococcal, Hep B series before transplant ideally.",
    contraindications: "Hypersensitivity to macrolides. Concomitant ciclosporin (not combination).",
    pearls: "CYP3A4 substrate — major interactions with azoles, macrolides, calcium channel blockers. Grapefruit juice increases levels. Post-diarrhea or illness: recheck levels (erratic absorption). New-onset diabetes (PTDM) in ~20% — monitor fasting glucose.",
    ckd_notes: "No dose adjustment by eGFR — TDM-guided. Dialysis: supplemental dose NOT required (not dialysable).",
    dialysis_timing: "Not significantly removed by HD/PD. No supplemental dosing needed post-dialysis.",
    verified: true, last_updated: "2025-01"
  },
  mycophenolate: {
    timing: "Twice daily (BD), 12 hours apart. Consistent timing.",
    food: "Take on empty stomach (1 hour before meals) for best absorption. Can take with food if GI intolerance but absorption reduced ~25%.",
    hydration: "Normal fluid intake. GI side effects (nausea, diarrhoea) are dose-limiting — adequate hydration helps.",
    storage: "Room temperature. Capsules — do not open (teratogenic powder). Tablets — do not crush.",
    crush: "Do NOT crush MMF tablets or open capsules — cytotoxic/teratogenic dust hazard. EC-MPS (Myfortic) is enteric-coated — do NOT crush.",
    ng_tube: "Avoid via NG tube if possible. If necessary, consult pharmacy for suspension formulation.",
    missed_dose: "If <2 hours late — take immediately. If >2 hours — skip dose and resume next scheduled dose.",
    formulations_india: ["MMF 250 mg cap (Cellcept, Mycophenate)", "MMF 500 mg tab", "EC-MPS 180 mg tab (Myfortic)", "EC-MPS 360 mg tab"],
    monitoring: "CBC monthly (cytopenias: hold if WBC <3000/mm³). LFT 3-monthly. Renal function monthly. CMV/BK virus PCR at 3 and 6 months post-transplant.",
    vaccine_precautions: "No live vaccines. Pneumococcal and influenza vaccines recommended.",
    contraindications: "Pregnancy (Category D — teratogenic). Severe neutropenia.",
    pearls: "MMF 1000 mg = EC-MPS 720 mg. Separate from antacids/cholestyramine/iron by 2+ hours. GI side effects may improve with EC-MPS switch. Reduce/hold for CMV disease or severe cytopenias.",
    ckd_notes: "No dose adjustment in CKD (not renally cleared). Accumulation of metabolite MPAG in severe renal failure — monitor for toxicity.",
    dialysis_timing: "MPAG partially removed by HD — clinical significance uncertain.",
    verified: true, last_updated: "2025-01"
  },
  cyclosporine: {
    timing: "Twice daily, CONSISTENT timing. Same time every day.",
    food: "Take consistently WITH or WITHOUT food — do not switch. High-fat meals increase variability. Grapefruit juice — AVOID (increases levels 20–200%).",
    hydration: "Adequate hydration. Nephrotoxicity increases in dehydration.",
    storage: "Room temperature. Oral solution: use provided syringe; wipe with dry cloth (not water). Do not refrigerate solution (may gel).",
    crush: "Capsules should NOT be crushed. Oral solution available for those who cannot swallow capsules.",
    ng_tube: "Oral solution via NG tube — dilute in orange juice or apple juice (not grapefruit).",
    missed_dose: "If <12 hours late — take immediately. If >12 hours — skip. Never double.",
    formulations_india: ["Cyclosporine 25 mg cap (Cyclosporine, Panimun)", "Cyclosporine 100 mg cap", "Cyclosporine 50 mg/mL oral solution", "Sandimmun Neoral 25/100 mg (modified)"],
    monitoring: "C0 trough or C2 (2h post-dose): target 100–150 ng/mL (nephrotic); 200–400 ng/mL (early transplant). Creatinine, BP weekly. LFT, K+, Mg2+ monthly. Lipid profile 3-monthly.",
    vaccine_precautions: "No live vaccines. Annual influenza (inactivated). Complete all vaccinations before starting.",
    contraindications: "Uncontrolled hypertension, renal impairment (relative), concomitant nephrotoxins.",
    pearls: "Neoral (microemulsion) ≠ Sandimmun (standard) — not interchangeable without TDM recheck. Gingival hyperplasia and hypertrichosis are cosmetic side effects — inform family. Hypertension in ~50% — may need CCB (amlodipine, note slight TDM interaction).",
    ckd_notes: "Use cautiously. If baseline creatinine rises >25% above baseline — reduce dose. Avoid in eGFR <30 without nephrology guidance.",
    dialysis_timing: "Not removed by HD/PD. No supplemental dosing.",
    verified: true, last_updated: "2025-01"
  },
  furosemide: {
    timing: "Morning dose preferred (or morning + noon for BD) to avoid nocturnal diuresis. Avoid dosing after 4 PM.",
    food: "Can be taken with or without food. Food slightly reduces absorption — consistent approach.",
    hydration: "Monitor for dehydration — weigh daily. Replace electrolytes as needed.",
    storage: "Room temperature. Oral solution — protect from light.",
    crush: "Tablets can be crushed and dispersed in water.",
    ng_tube: "IV or oral solution preferred. Tablets can be crushed for NG tube.",
    missed_dose: "Take as soon as remembered (same day). Skip if nearly time for next dose.",
    formulations_india: ["Furosemide 40 mg tab (Lasix, Frusenex)", "Furosemide 80 mg tab", "Furosemide 10 mg/mL injection", "Furosemide 10 mg/mL oral solution"],
    monitoring: "Electrolytes (Na, K, Cl) weekly during titration. Renal function. Weight daily for inpatients. Hearing (ototoxicity with high IV doses).",
    vaccine_precautions: "None specific.",
    contraindications: "Anuria (unless obstructive uropathy), hepatic coma, severe hyponatremia/hypokalemia, hypersensitivity to sulfonamides.",
    pearls: "Continuous IV infusion (0.1–1 mg/kg/hr) may be more effective than bolus in diuretic resistance. Combine with albumin infusion in severe hypoalbuminemia (oncotic pull). NSAIDs reduce diuretic response — avoid combination.",
    ckd_notes: "Higher doses needed in CKD (loop diuretics still work but dose threshold rises). eGFR 15–30: may need 80–160 mg doses. eGFR <15: loop diuretics often ineffective.",
    dialysis_timing: "Residual renal function management in PD patients. Removed by HD — limited clinical use.",
    verified: true, last_updated: "2025-01"
  },
  enalapril: {
    timing: "Once or twice daily. Can be given at any time — consistent timing preferred.",
    food: "Can be taken with or without food.",
    hydration: "Maintain adequate hydration — first-dose hypotension, especially after diuretics. Start low, go slow.",
    storage: "Room temperature.",
    crush: "Tablets can be crushed and mixed with water or food. Compounded suspension available.",
    ng_tube: "Crushed tablets or compounded suspension via NG tube.",
    missed_dose: "Take as soon as remembered. Skip if >6 hours late for BD dosing.",
    formulations_india: ["Enalapril 2.5 mg tab (Envas, Enam)", "Enalapril 5 mg tab", "Enalapril 10 mg tab", "Compounded 1 mg/mL suspension"],
    monitoring: "Creatinine and K+ at 1 week, 1 month, then 3-monthly. BP at each visit. Cough is a class-effect side effect (switch to ARB if intolerable).",
    vaccine_precautions: "None specific.",
    contraindications: "Bilateral renal artery stenosis, pregnancy (teratogenic — Category D/X), hyperkalemia >5.5 mEq/L, history of ACEi-associated angioedema.",
    pearls: "Antiproteinuric effect independent of BP lowering. First choice for CKD with proteinuria. Creatinine rise ≤30% acceptable and expected — do not stop. Rise >30% — check for RAS. Hold in AKI, dehydration, perioperative.",
    ckd_notes: "eGFR 30–60: use with close monitoring. eGFR <30: start at 50% dose, monitor K+ weekly. eGFR <15: use cautiously, often held.",
    dialysis_timing: "Removed by HD — supplemental dose may be needed post-dialysis. Not significantly removed by PD.",
    verified: true, last_updated: "2025-01"
  },
  amlodipine: {
    timing: "Once daily, any consistent time. Morning preferred.",
    food: "Can be taken with or without food.",
    hydration: "Normal fluid intake.",
    storage: "Room temperature.",
    crush: "Tablets can be crushed or dispersed. No special concerns.",
    ng_tube: "Crushed/dispersed tablet via NG tube.",
    missed_dose: "Take as soon as remembered. Skip if >12 hours late.",
    formulations_india: ["Amlodipine 2.5 mg tab (Amcard, Amlogard)", "Amlodipine 5 mg tab", "Amlodipine 10 mg tab", "Compounded 1 mg/mL suspension"],
    monitoring: "BP and HR at each visit. Peripheral edema (dose-dependent — reduce dose or switch class). Gingival hyperplasia with concurrent cyclosporine.",
    vaccine_precautions: "None.",
    contraindications: "Cardiogenic shock, severe aortic stenosis, unstable angina (relative).",
    pearls: "First-line antihypertensive in pediatric nephrology. Safe in CKD and dialysis. Mild CYP3A4 inhibitor — may slightly increase tacrolimus/cyclosporine levels. Peripheral edema is cosmetic, not serious — reduce dose.",
    ckd_notes: "No dose adjustment needed. Safe and effective in all stages of CKD and dialysis.",
    dialysis_timing: "Not removed by dialysis — no supplemental dosing.",
    verified: true, last_updated: "2025-01"
  },
  cyclophosphamide: {
    timing: "IV pulse: hospital-administered monthly. Oral: single morning dose.",
    food: "Oral: take on empty stomach or with light meal. IV: fasting not required.",
    hydration: "CRITICAL: 2–3 L/m² IV hydration over 24h for IV pulse. Oral: encourage 2–3 L/day fluids. MESNA if dose >500 mg/m².",
    storage: "IV: reconstituted solution — 24h at room temperature, 6 days refrigerated. Oral tablets — room temperature.",
    crush: "Tablets can be crushed. Hazardous drug — use gloves, mask.",
    ng_tube: "Avoid NG route — cytotoxic handling precautions.",
    missed_dose: "Oral: take same day if remembered. IV pulse: reschedule via clinic.",
    formulations_india: ["Cyclophosphamide 50 mg tab (Endoxan, Cycram)", "Cyclophosphamide 200 mg vial IV", "Cyclophosphamide 500 mg vial IV", "Cyclophosphamide 1 g vial IV"],
    monitoring: "CBC before each IV pulse (hold if WBC <3000 or PMN <1500). CBC weekly for oral. Urinalysis for haematuria before each pulse (haemorrhagic cystitis). LFT, creatinine monthly.",
    vaccine_precautions: "No live vaccines during treatment and 6 months after. No rituximab within 4 weeks.",
    contraindications: "Severe bone marrow suppression, active uncontrolled infection, haemorrhagic cystitis.",
    pearls: "Gonadal toxicity risk — discuss with parents for cumulative dose >200 mg/kg. Ovarian suppression — consider GnRH analogue co-administration in adolescent girls. Bladder toxicity: acrolein metabolite — MESNA + hydration are essential. Morning dosing for oral to allow bladder washout during the day.",
    ckd_notes: "eGFR <30: reduce IV dose by 25%. Adjust dose and interval based on nadir counts.",
    dialysis_timing: "Metabolites removed by HD — supplemental dosing may be needed post-HD (consult oncology/nephrology).",
    verified: true, last_updated: "2025-01"
  },
  rituximab: {
    timing: "IV infusion over 4–6 hours (first dose slower — risk of infusion reactions). Premedication: methylprednisolone 2 mg/kg, paracetamol, chlorpheniramine 30 min before.",
    food: "Fasting not required for infusion.",
    hydration: "Adequate IV access. Monitor BP, O2 sat every 15 min during infusion.",
    storage: "2–8°C. Diluted solution stable 24h refrigerated. Do not freeze.",
    crush: "IV only.",
    ng_tube: "IV only.",
    missed_dose: "Reschedule via clinic. Timing within ±2 weeks is generally acceptable.",
    formulations_india: ["Rituximab 100 mg/10 mL vial (Mabthera, Reditux, Maball)", "Rituximab 500 mg/50 mL vial"],
    monitoring: "CBC before each dose (hold if severe cytopenias). Immunoglobulins (IgG) 3-monthly — risk of hypogammaglobulinaemia. Hepatitis B serology before first dose (reactivation risk). CD19/CD20 B-cell counts to guide redosing (SDNS/FRNS). CMV/EBV PCR if symptomatic.",
    vaccine_precautions: "CRITICAL: No live vaccines 6 months BEFORE and 6 months AFTER rituximab. Ensure all live vaccines (MMR, varicella, BCG) given ≥4 weeks before first dose. Annual inactivated influenza during B-cell depletion.",
    contraindications: "Active severe infection, Hep B surface antigen positive (without antiviral prophylaxis), severe heart failure, live vaccine administration.",
    pearls: "IPNA 2023: Rituximab 375 mg/m² × 4 doses for FRNS/SDNS. CD19 <1% at 1 month confirms B-cell depletion. Re-dose when CD19 recovers to >1% with relapse. Hypogammaglobulinaemia: IgG <400 mg/dL — consider IVIG. PCP prophylaxis (cotrimoxazole) recommended.",
    ckd_notes: "No dose adjustment by eGFR. Use with caution in severe CKD due to infection risk.",
    dialysis_timing: "Not dialysable. Standard dosing.",
    verified: true, last_updated: "2025-01"
  },
  eculizumab: {
    timing: "IV infusion over 35 minutes. Induction: weekly × 4 weeks. Maintenance: every 2 weeks.",
    food: "Fasting not required.",
    hydration: "IV administration only.",
    storage: "2–8°C. Do not freeze. Diluted solution: use within 24 hours.",
    crush: "IV only.",
    ng_tube: "IV only.",
    missed_dose: "Contact specialist immediately. If >2 days late on maintenance — contact unit urgently.",
    formulations_india: ["Eculizumab 300 mg/30 mL vial (Soliris, Aculis — India import/access)", "Available via REMS programme"],
    monitoring: "CBC, creatinine, LDH, haptoglobin, platelets: before each infusion (aHUS). CH50/AP50 to confirm complement inhibition. Urinalysis. Meningococcal antibody titres annually.",
    vaccine_precautions: "MANDATORY before starting eculizumab: Meningococcal vaccines (MenACWY AND MenB) at least 2 weeks before first dose. Pneumococcal (PCV13 + PPSV23), Haemophilus influenzae type B, annual influenza. If urgent aHUS — start antibiotic prophylaxis (penicillin V 250 mg BD or amoxicillin 250 mg BD) from Day 1 until 2 weeks post-vaccination.",
    contraindications: "Active Neisseria meningitidis infection, unvaccinated patients (unless antibiotic cover given), hereditary complement deficiency.",
    pearls: "See full eculizumab guidance section. Paediatric weight-based dosing: 5–10 kg: 300 mg induction (×1), maintenance 300 mg every 3 weeks; 10–20 kg: 600 mg ×1, then 300 mg every 2 weeks; 20–30 kg: 600 mg ×2, then 600 mg every 2 weeks; 30–40 kg: 900 mg ×2, then 1200 mg every 2 weeks; ≥40 kg: adult dosing 900 mg ×4, then 1200 mg every 2 weeks. Plasma exchange supplemental dose: 300 mg per session if PE done within 1 week of eculizumab.",
    ckd_notes: "Indicated specifically for complement-mediated aHUS. Monitor renal function at each infusion. No dose adjustment by eGFR.",
    dialysis_timing: "Some removal by apheresis — supplement dose after each PE/PP session.",
    references: [
      "Indian Journal of Nephrology 2025 — Eculizumab in Paediatric aHUS",
      "Legendre CM et al. NEJM 2013; 368:2169",
      "Greenbaum LA et al. Kidney Int 2016; 89:701",
      "KDIGO aHUS Guidelines 2021"
    ],
    verified: true, last_updated: "2025-05"
  },
  levamisole: {
    timing: "Alternate-day dosing — every other day (same as prednisolone alternate day). Evening dosing recommended.",
    food: "Take with food to reduce nausea.",
    hydration: "Normal fluid intake.",
    storage: "Room temperature.",
    crush: "Tablets can be crushed and mixed with jam or honey for children.",
    ng_tube: "Crushed tablets via NG tube.",
    missed_dose: "Skip missed alternate dose — do not double. Resume regular schedule.",
    formulations_india: ["Levamisole 50 mg tab (Decaris, Vermisol-L)", "Levamisole 50 mg tab — widely available in India"],
    monitoring: "CBC monthly (CRITICAL — agranulocytosis in ~0.3%; hold immediately if ANC <1500/mm³). LFT 3-monthly. Creatinine baseline and 3-monthly.",
    vaccine_precautions: "No specific restrictions. Follow standard immunosuppression vaccination guidelines.",
    contraindications: "Agranulocytosis history, severe hepatic disease.",
    pearls: "ISPN/IPNA 2023 first-line steroid-sparing in FRNS. Dose: 2.5 mg/kg alternate day (max 150 mg). Mean duration 12–24 months. Agranulocytosis warning — give written instructions to parents; fever → immediate CBC. Vasculitic rash (ANCA-associated) — rare but stop levamisole immediately.",
    ckd_notes: "No dose adjustment required.",
    verified: true, last_updated: "2025-01"
  },
  cotrimoxazole: {
    timing: "Once daily (prophylaxis) or BD (treatment). Consistent timing.",
    food: "Take WITH food to reduce GI side effects.",
    hydration: "Maintain good urine output (≥1 mL/kg/hr) — prevents crystalluria with high doses.",
    storage: "Room temperature. Oral suspension — refrigerate after opening.",
    crush: "Tablets can be crushed.",
    ng_tube: "Suspension via NG tube.",
    missed_dose: "Take as soon as remembered. Skip if near next dose time.",
    formulations_india: ["Co-trimoxazole 120 mg tab (40+80 mg)", "Co-trimoxazole 480 mg tab (160+320 mg)", "Co-trimoxazole 240 mg/5 mL suspension (Bactrim, Septran)"],
    monitoring: "CBC monthly (myelosuppression). Creatinine — SMX component raises creatinine by ~5–10% without true eGFR change (blocks tubular secretion). K+ in CKD (trimethoprim is potassium-sparing like amiloride).",
    vaccine_precautions: "None specific.",
    contraindications: "Sulfonamide allergy, G6PD deficiency (haemolytic anaemia risk), severe renal/hepatic impairment, neonates <28 days (kernicterus risk).",
    pearls: "PCP prophylaxis: 5 mg/kg trimethoprim component 3×/week or daily. Use in all patients on rituximab or high-dose steroids + cyclophosphamide. Creatinine rise on cotrimoxazole: check cystatin C or recheck after drug holiday — may be spurious.",
    ckd_notes: "eGFR 15–30: reduce to 50% dose. eGFR <15: avoid if possible.",
    dialysis_timing: "Removed by HD — supplemental half-dose post-dialysis.",
    verified: true, last_updated: "2025-01"
  }
};

// ── Section icon map ──────────────────────────────────────────────────────────
const SECTIONS = [
  { key: "timing", label: "Timing & Administration", icon: Clock, color: "blue" },
  { key: "food", label: "Food Advice", icon: Info, color: "amber" },
  { key: "hydration", label: "Hydration", icon: Droplets, color: "cyan" },
  { key: "formulations_india", label: "Indian Formulations", icon: Pill, color: "purple" },
  { key: "crush", label: "Crushing / NG Tube", icon: FlaskConical, color: "orange" },
  { key: "monitoring", label: "Monitoring Required", icon: Activity, color: "green" },
  { key: "vaccine_precautions", label: "Vaccine Precautions", icon: Syringe, color: "red" },
  { key: "contraindications", label: "Contraindications", icon: AlertTriangle, color: "red" },
  { key: "ckd_notes", label: "CKD / Dialysis Dosing", icon: Shield, color: "indigo" },
  { key: "pearls", label: "Clinical Pearls", icon: CheckCircle, color: "emerald" },
  { key: "references", label: "References", icon: BookOpen, color: "slate" },
];

const COLOR_MAP = {
  blue: "bg-blue-50 border-blue-200 text-blue-800",
  amber: "bg-amber-50 border-amber-200 text-amber-800",
  cyan: "bg-cyan-50 border-cyan-200 text-cyan-800",
  purple: "bg-purple-50 border-purple-200 text-purple-800",
  orange: "bg-orange-50 border-orange-200 text-orange-800",
  green: "bg-green-50 border-green-200 text-green-800",
  red: "bg-red-50 border-red-200 text-red-800",
  indigo: "bg-indigo-50 border-indigo-200 text-indigo-800",
  emerald: "bg-emerald-50 border-emerald-200 text-emerald-800",
  slate: "bg-slate-50 border-slate-200 text-slate-700",
};

export default function DrugDetailCard({ drug, weight, egfr }) {
  const [expanded, setExpanded] = useState(false);
  const guidanceName = drug?.generic_name?.toLowerCase().replace(/\s+/g, "");
  const guidance = DRUG_GUIDANCE[guidanceName] || null;
  const formularyDrug = getFormularyDrug(drug?.generic_name);

  if (!drug) return null;

  return (
    <div className="space-y-3 mt-4">
      {/* Rich formulary monograph if available */}
      {formularyDrug && (
        <FormularyMonograph drug={formularyDrug} weight={weight} egfr={egfr} />
      )}
      {/* Eculizumab special banner */}
      {guidanceName === "eculizumab" && (
        <Alert className="bg-red-50 border-red-400 border-2">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <AlertDescription>
            <strong className="text-red-900 block mb-1">⚠️ INFECTION EMERGENCY WARNING — Eculizumab</strong>
            <span className="text-red-800 text-sm">
              Patients on eculizumab are at HIGH RISK for life-threatening meningococcal infection.
              ANY fever ≥38°C = medical emergency. Patient/family must present to emergency immediately.
              Carry the patient emergency card at all times. Ceftriaxone IV is first-line empiric therapy.
            </span>
          </AlertDescription>
        </Alert>
      )}

      {/* Storage badge */}
      {guidance?.storage && (
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700">
          <Thermometer className="w-4 h-4 text-slate-500 flex-shrink-0" />
          <span><strong>Storage: </strong>{guidance.storage}</span>
        </div>
      )}

      {/* Toggle full guidance */}
      {guidance && (
        <div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="w-full justify-between border-purple-300 text-purple-700 hover:bg-purple-50"
          >
            <span className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              {expanded ? "Hide" : "Show"} Practical Guidance
              {guidance.verified && <Badge className="bg-green-100 text-green-700 text-xs ml-1">✓ Expert Reviewed</Badge>}
            </span>
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>

          {expanded && (
            <div className="mt-3 space-y-2">
              {guidance.last_updated && (
                <p className="text-xs text-slate-400 text-right">Last updated: {guidance.last_updated}</p>
              )}
              {SECTIONS.map(({ key, label, icon: Icon, color }) => {
                const val = guidance[key];
                if (!val) return null;
                return (
                  <div key={key} className={`rounded-lg border p-3 ${COLOR_MAP[color]}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span className="font-semibold text-xs uppercase tracking-wide">{label}</span>
                    </div>
                    {Array.isArray(val) ? (
                      <ul className="space-y-0.5 mt-1">
                        {val.map((item, i) => (
                          <li key={i} className="text-xs flex items-start gap-1.5">
                            <span className="mt-0.5">•</span> {item}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs leading-relaxed mt-1">{val}</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Quick bedside card always visible */}
      <QuickDoseCard drug={drug} />
    </div>
  );
}

// ── Compact Bedside Quick-Dose Card ──────────────────────────────────────────
export function QuickDoseCard({ drug, weight, egfr }) {
  if (!drug) return null;
  const guidanceName = drug?.generic_name?.toLowerCase().replace(/\s+/g, "");
  const guidance = DRUG_GUIDANCE[guidanceName];

  return (
    <div className="rounded-xl border-2 border-slate-300 bg-white overflow-hidden">
      <div className="bg-slate-800 text-white px-3 py-2 flex items-center justify-between">
        <span className="text-sm font-bold">{drug.generic_name}</span>
        <Badge className="bg-white/20 text-xs">{drug.category || "Drug"}</Badge>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-0 divide-x divide-y divide-slate-200">
        {[
          { label: "Dose", value: drug.dose_weight_based || drug.dose_age_based || "—" },
          { label: "Max/day", value: drug.max_dose_per_day || "—" },
          { label: "Frequency", value: drug.frequency || "—" },
          { label: "Route", value: drug.route || "PO" },
          { label: "Food", value: guidance?.food ? guidance.food.split(".")[0] : "See guidance" },
          { label: "Renal", value: drug.renal_adjust ? drug.renal_adjust.split(".")[0] : "No adjustment" },
        ].map(({ label, value }) => (
          <div key={label} className="p-2">
            <p className="text-xs text-slate-400 uppercase tracking-wide">{label}</p>
            <p className="text-xs font-semibold text-slate-800 mt-0.5 leading-tight">{value}</p>
          </div>
        ))}
      </div>
      {drug.contraindications && (
        <div className="bg-red-50 border-t border-red-200 px-3 py-1.5">
          <p className="text-xs text-red-700"><strong>⚠️ </strong>{drug.contraindications.split(".")[0]}</p>
        </div>
      )}
    </div>
  );
}