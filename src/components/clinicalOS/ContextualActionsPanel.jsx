/**
 * CONTEXTUAL ACTIONS PANEL
 * Surfaces actionable clinical links based on guideline category
 * Nephrotic syndrome, hyperkalemia, hypertension, AKI, etc.
 */
import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Pill, Calculator, Activity, Shield, Heart, FlaskConical,
  AlertTriangle, ArrowRight, GitBranch, FileText, Stethoscope, Zap, Network
} from "lucide-react";

const CONTEXTUAL_LINKS = {
  "Nephrotic Syndrome": [
    { icon: Pill, label: "Relapse Prescription Generator", desc: "Auto-dose prednisolone taper", color: "text-purple-600 bg-purple-50 border-purple-200", url: "AIPrescriber" },
    { icon: Calculator, label: "Steroid Taper Calculator", desc: "Weight-based dose steps", color: "text-indigo-600 bg-indigo-50 border-indigo-200", url: "DrugsDosing" },
    { icon: Activity, label: "Steroid Toxicity Monitoring", desc: "BP, growth, bones, glucose", color: "text-rose-600 bg-rose-50 border-rose-200", url: "MonitoringHub" },
    { icon: Shield, label: "Vaccination Guidance", desc: "Live vaccines in NS/immunosuppression", color: "text-green-600 bg-green-50 border-green-200", url: "ClinicalSupport" },
    { icon: GitBranch, label: "Edema Management Pathway", desc: "Grade-based fluid/diuretic plan", color: "text-cyan-600 bg-cyan-50 border-cyan-200", url: "ClinicalSupport" },
    { icon: FlaskConical, label: "Urine Dipstick Interpreter", desc: "Relapse/remission assessment", color: "text-amber-600 bg-amber-50 border-amber-200", url: "ClinicalOS" },
  ],
  "Hypertension": [
    { icon: Calculator, label: "BP Percentile Calculator", desc: "AAP 2017 age/sex/height tables", color: "text-rose-600 bg-rose-50 border-rose-200", url: "BPPercentiles" },
    { icon: AlertTriangle, label: "Hypertensive Emergency Protocol", desc: "IV agents, MAP reduction target", color: "text-red-600 bg-red-50 border-red-200", url: "EmergencyHub" },
    { icon: GitBranch, label: "HTN Diagnosis Pathway", desc: "Confirm, stage, investigate", color: "text-orange-600 bg-orange-50 border-orange-200", url: "ClinicalSupport" },
    { icon: Pill, label: "Antihypertensive Prescriber", desc: "Amlodipine, enalapril dosing", color: "text-blue-600 bg-blue-50 border-blue-200", url: "AIPrescriber" },
    { icon: Activity, label: "ABPM Interpretation Guide", desc: "Ambulatory BP targets", color: "text-teal-600 bg-teal-50 border-teal-200", url: "ClinicalOS" },
    { icon: Heart, label: "CKD BP Targets (ESCAPE)", desc: "<50th %ile target for proteinuric CKD", color: "text-indigo-600 bg-indigo-50 border-indigo-200", url: "ClinicalOS" },
  ],
  "AKI": [
    { icon: AlertTriangle, label: "AKI Emergency Pathway", desc: "Stage 3, AKIN, RRT triggers", color: "text-red-600 bg-red-50 border-red-200", url: "EmergencyHub" },
    { icon: Calculator, label: "AKI Staging Calculator", desc: "KDIGO criteria, SCr rise", color: "text-orange-600 bg-orange-50 border-orange-200", url: "AKIStager" },
    { icon: Zap, label: "Hyperkalemia Emergency", desc: "K+ >6.5, ECG changes, protocol", color: "text-red-700 bg-red-100 border-red-300", url: "EmergencyHub" },
    { icon: Activity, label: "Fluid Overload Assessment", desc: "%FO calculation, diuretic protocol", color: "text-blue-600 bg-blue-50 border-blue-200", url: "FluidCalculator" },
    { icon: GitBranch, label: "RRT Decision Pathway", desc: "Indications, modality selection", color: "text-cyan-600 bg-cyan-50 border-cyan-200", url: "ClinicalSupport" },
    { icon: FlaskConical, label: "FENa / FEUrea Calculator", desc: "Pre-renal vs intrinsic AKI", color: "text-amber-600 bg-amber-50 border-amber-200", url: "FENaCalculator" },
  ],
  "CKD": [
    { icon: Calculator, label: "Schwartz GFR Calculator", desc: "Paediatric eGFR from creatinine+height", color: "text-blue-600 bg-blue-50 border-blue-200", url: "SchwartzGFR" },
    { icon: Activity, label: "CKD-MBD Monitoring Panel", desc: "Ca, PO4, PTH targets", color: "text-indigo-600 bg-indigo-50 border-indigo-200", url: "ClinicalSupport" },
    { icon: GitBranch, label: "CKD Staging Pathway", desc: "IPNA 2021 staging + management", color: "text-cyan-600 bg-cyan-50 border-cyan-200", url: "ClinicalSupport" },
    { icon: Heart, label: "Anaemia Management", desc: "ESA, iron targets by CKD stage", color: "text-rose-600 bg-rose-50 border-rose-200", url: "ClinicalOS" },
    { icon: Pill, label: "Bicarbonate Dosing", desc: "HCO3 target ≥22 mmol/L", color: "text-teal-600 bg-teal-50 border-teal-200", url: "DrugsDosing" },
    { icon: Calculator, label: "BP Percentile (ESCAPE target)", desc: "<50th %ile for proteinuric CKD", color: "text-orange-600 bg-orange-50 border-orange-200", url: "BPPercentiles" },
  ],
  "Electrolytes": [
    { icon: Zap, label: "Hyperkalemia Emergency", desc: "Calcium, insulin-dextrose, dialysis", color: "text-red-600 bg-red-50 border-red-200", url: "EmergencyHub" },
    { icon: Calculator, label: "Sodium Correction Calculator", desc: "Hypo/hypernatraemia correction rates", color: "text-blue-600 bg-blue-50 border-blue-200", url: "SodiumCalculator" },
    { icon: Calculator, label: "Potassium Binder Dosing", desc: "Patiromer, sodium zirconium", color: "text-amber-600 bg-amber-50 border-amber-200", url: "DrugsDosing" },
    { icon: GitBranch, label: "Acid-Base Pathway", desc: "Metabolic acidosis/alkalosis approach", color: "text-indigo-600 bg-indigo-50 border-indigo-200", url: "ClinicalSupport" },
    { icon: FlaskConical, label: "Anion Gap Calculator", desc: "Delta-delta, TTKG", color: "text-teal-600 bg-teal-50 border-teal-200", url: "AnionGap" },
  ],
  "Dialysis": [
    { icon: Calculator, label: "Kt/V Calculator", desc: "HD adequacy, spKt/V", color: "text-cyan-600 bg-cyan-50 border-cyan-200", url: "KtVCalculator" },
    { icon: GitBranch, label: "CRRT Dose Calculator", desc: "25–30 mL/kg/h prescribed effluent", color: "text-blue-600 bg-blue-50 border-blue-200", url: "ClinicalOS" },
    { icon: AlertTriangle, label: "Dialysis Emergency Protocol", desc: "Access failure, hypotension", color: "text-red-600 bg-red-50 border-red-200", url: "EmergencyHub" },
    { icon: Activity, label: "RRT Monitoring", desc: "Filter life, alarms, anticoagulation", color: "text-indigo-600 bg-indigo-50 border-indigo-200", url: "MonitoringHub" },
  ],
  "Glomerular Diseases": [
    { icon: GitBranch, label: "Glomerular Disease Pathway", desc: "IgA, MPGN, FSGS, MN", color: "text-indigo-600 bg-indigo-50 border-indigo-200", url: "ClinicalSupport" },
    { icon: Stethoscope, label: "Lupus Nephritis Protocol", desc: "ISN/RPS class, induction", color: "text-purple-600 bg-purple-50 border-purple-200", url: "ClinicalSupport" },
    { icon: Pill, label: "Immunosuppression Prescriber", desc: "MMF, cyclophosphamide, rituximab", color: "text-rose-600 bg-rose-50 border-rose-200", url: "AIPrescriber" },
    { icon: FlaskConical, label: "UPCR Monitoring", desc: "Remission, relapse assessment", color: "text-amber-600 bg-amber-50 border-amber-200", url: "ClinicalOS" },
  ],
  "Transplant": [
    { icon: Activity, label: "Tacrolimus TDM Monitor", desc: "Trough 8–12 (early) / 4–8 (maintenance)", color: "text-teal-600 bg-teal-50 border-teal-200", url: "DrugsDosing" },
    { icon: AlertTriangle, label: "Rejection Pathway", desc: "T-cell, antibody-mediated", color: "text-red-600 bg-red-50 border-red-200", url: "ClinicalSupport" },
    { icon: Shield, label: "Infection Prophylaxis", desc: "PCP, CMV, fungal protocols", color: "text-green-600 bg-green-50 border-green-200", url: "ClinicalSupport" },
    { icon: Calculator, label: "eGFR Trend Monitor", desc: "Post-transplant renal function", color: "text-blue-600 bg-blue-50 border-blue-200", url: "SchwartzGFR" },
  ],
};

// Fallback for categories not explicitly mapped
const FALLBACK_LINKS = [
  { icon: GitBranch, label: "Clinical Pathways", desc: "Evidence-based management pathways", color: "text-blue-600 bg-blue-50 border-blue-200", url: "ClinicalSupport" },
  { icon: Pill, label: "AI Prescriber", desc: "Weight-based drug dosing", color: "text-purple-600 bg-purple-50 border-purple-200", url: "AIPrescriber" },
  { icon: Calculator, label: "Clinical Calculators", desc: "GFR, BP, Kt/V, and more", color: "text-teal-600 bg-teal-50 border-teal-200", url: "ClinicalOS" },
];

// Additional OS links appended to every category
const OS_LINKS = [
  { icon: GitBranch, label: "DDx Engine", desc: "Symptom-driven differential diagnosis", color: "text-fuchsia-600 bg-fuchsia-50 border-fuchsia-200", url: "ClinicalOS" },
  { icon: FileText, label: "Knowledge Graph", desc: "Disease–drug–gene–pathway connections", color: "text-emerald-600 bg-emerald-50 border-emerald-200", url: "ClinicalOS" },
];

export default function ContextualActionsPanel({ category, compact = false }) {
  const base = CONTEXTUAL_LINKS[category] || FALLBACK_LINKS;
  const links = compact ? base : [...base, ...OS_LINKS];
  const displayLinks = compact ? links.slice(0, 4) : links;

  if (!links.length) return null;

  return (
    <div className="space-y-2">
      <p className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
        <ArrowRight className="w-3.5 h-3.5" />
        Clinical Actions — {category}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {displayLinks.map((link, i) => (
          <Link key={i} to={createPageUrl(link.url)}>
            <div className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer hover:shadow-sm transition-all active:scale-[0.98] ${link.color}`}>
              <link.icon className="w-4 h-4 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-bold leading-tight truncate">{link.label}</p>
                <p className="text-xs opacity-70 leading-tight truncate">{link.desc}</p>
              </div>
              <ArrowRight className="w-3 h-3 flex-shrink-0 opacity-40 ml-auto" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}