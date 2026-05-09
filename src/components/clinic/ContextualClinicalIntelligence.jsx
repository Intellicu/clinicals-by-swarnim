import React, { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  AlertTriangle, Zap, BookOpen, Pill, Activity, CheckCircle,
  GitBranch, TrendingUp, Shield, ChevronRight, Clock, FileText
} from "lucide-react";

// ── Evidence-based contextual intelligence engine ──────────────────────────
// Maps diagnosis context → relevant pathways, prescriptions, alerts, guidelines
// This is the "invisible Clinical OS layer" — renders only relevant cards

const DIAGNOSIS_CONTEXT = {
  ns: {
    match: (d = "") => /nephrotic|ns\b|frns|srns|mcns|fsgs/i.test(d),
    label: "Nephrotic Syndrome",
    color: "bg-purple-600",
    alerts: (patient) => {
      const alerts = [];
      if (patient?.ckd_stage >= 3) alerts.push({ level: "warn", text: "CKD ≥3 — steroid dose caution", icon: AlertTriangle });
      return alerts;
    },
    quick_actions: [
      { label: "NS Pathway", icon: GitBranch, color: "text-purple-600", path: "ClinicalSupport" },
      { label: "Prednisolone dose", icon: Pill, color: "text-blue-600", path: "AIPrescriber" },
      { label: "Urine PCR calc", icon: Activity, color: "text-green-600", path: "ClinicalToolsHub" },
    ],
    guideline_snippets: [
      "Relapse = protein 3+ × 3 consecutive days (ISPN 2023)",
      "Remission = protein negative/trace × 3 days",
      "Prednisolone 2 mg/kg/day (max 60 mg) × 4 weeks, then taper",
    ],
    monitoring: ["Daily urine dipstick", "Weekly weight + BP", "Fasting glucose monthly on steroids"],
    red_flags: ["Protein 3+ × 3 days = relapse", "K+ >5.5 on calcineurin inhibitor", "Fever during relapse — exclude infection"],
  },
  aki: {
    match: (d = "") => /\baki\b|acute kidney|acute renal/i.test(d),
    label: "AKI",
    color: "bg-red-600",
    alerts: (patient) => {
      const alerts = [{ level: "urgent", text: "AKI — monitor hourly urine output + creatinine 6-hourly", icon: AlertTriangle }];
      return alerts;
    },
    quick_actions: [
      { label: "AKI Pathway", icon: GitBranch, color: "text-red-600", path: "ClinicalSupport" },
      { label: "KDIGO Staging", icon: Activity, color: "text-orange-600", path: "AKIStager" },
      { label: "Emergency Hub", icon: Zap, color: "text-red-600", path: "EmergencyHub" },
    ],
    guideline_snippets: [
      "KDIGO AKI Stage 1: Cr ×1.5 baseline or UO <0.5 mL/kg/hr × 6h",
      "RRT if fluid overload ≥20%, K+ refractory, pH <7.1",
      "Avoid all nephrotoxins. Hold NSAIDs, ACE-I, contrast",
    ],
    monitoring: ["Hourly urine output", "Creatinine 6-12 hourly (acute)", "Daily fluid balance", "Electrolytes daily"],
    red_flags: ["K+ >6.5 → Calcium gluconate STAT", "Fluid overload ≥20% → consider RRT", "Oliguria/anuria >12h"],
  },
  ckd: {
    match: (d = "") => /\bckd\b|chronic kidney|chronic renal/i.test(d),
    label: "CKD",
    color: "bg-blue-600",
    alerts: () => [],
    quick_actions: [
      { label: "CKD Pathway", icon: GitBranch, color: "text-blue-600", path: "ClinicalSupport" },
      { label: "Schwartz GFR", icon: Activity, color: "text-green-600", path: "SchwartzGFR" },
      { label: "CKD-MBD Protocol", icon: BookOpen, color: "text-indigo-600", path: "Guidelines" },
    ],
    guideline_snippets: [
      "BP target <50th %ile (ESCAPE trial / IPNA 2021)",
      "HCO₃⁻ target ≥22 mmol/L — correct acidosis",
      "ACE-I / ARB first-line for proteinuric CKD",
    ],
    monitoring: ["BP weekly", "Renal function monthly", "HCO3, electrolytes monthly", "PTH + phosphate 3-monthly"],
    red_flags: ["eGFR <15 → dialysis preparation", "K+ >6 + CKD = urgent", "Hb <10 → assess for ESA therapy"],
  },
  htn: {
    match: (d = "") => /hypertension|htn\b|high blood pressure/i.test(d),
    label: "Hypertension",
    color: "bg-orange-600",
    alerts: () => [],
    quick_actions: [
      { label: "HTN Pathway", icon: GitBranch, color: "text-orange-600", path: "ClinicalSupport" },
      { label: "BP Percentile", icon: Activity, color: "text-red-600", path: "BPPercentiles" },
      { label: "HTN Guidelines", icon: BookOpen, color: "text-orange-600", path: "Guidelines" },
    ],
    guideline_snippets: [
      "Stage 1: ≥95th %ile; Stage 2: ≥95th + 12 mmHg (AAP 2017)",
      "CKD target: <50th %ile (ESCAPE/IPNA 2021)",
      "ACE-I / ARB first-line if proteinuria or CKD",
    ],
    monitoring: ["BP at every visit", "If on ACE-I: K+/Cr at 1 week, then monthly", "ABPM for white-coat HTN"],
    red_flags: ["BP Stage 2 + headache/vision = hypertensive emergency", "BP ≥ 95th+12 mmHg → Stage 2 protocol"],
  },
  transplant: {
    match: (d = "") => /transplant|renal tx|rtx\b/i.test(d),
    label: "Transplant",
    color: "bg-teal-600",
    alerts: () => [{ level: "info", text: "Tacrolimus trough: AM blood BEFORE dose", icon: Clock }],
    quick_actions: [
      { label: "Transplant Pathway", icon: GitBranch, color: "text-teal-600", path: "ClinicalSupport" },
      { label: "Immunosuppression Rx", icon: Pill, color: "text-blue-600", path: "AIPrescriber" },
      { label: "Drug Interactions", icon: Shield, color: "text-red-600", path: "DrugsDosing" },
    ],
    guideline_snippets: [
      "Tacrolimus trough target 5–10 ng/mL (AM, before dose)",
      "Monitor: creatinine, FK506 trough, urine PCR monthly",
      "Live vaccines CONTRAINDICATED on immunosuppression",
    ],
    monitoring: ["Tacrolimus trough monthly", "Creatinine + urine PCR monthly", "CMV/EBV monitoring 3-monthly", "Lipids 6-monthly"],
    red_flags: ["Cr rise >25% baseline → rejection?", "Fever on IS → opportunistic infection protocol", "Trough >12 = nephrotoxicity risk"],
  },
  dialysis: {
    match: (d = "") => /dialysis|hd\b|pd\b|crrt\b|hemodialysis|peritoneal/i.test(d),
    label: "Dialysis",
    color: "bg-cyan-600",
    alerts: () => [],
    quick_actions: [
      { label: "Dialysis Pathway", icon: GitBranch, color: "text-cyan-600", path: "ClinicalSupport" },
      { label: "Kt/V Calculator", icon: Activity, color: "text-blue-600", path: "KtVCalculator" },
      { label: "RRT Templates", icon: FileText, color: "text-green-600", path: "RRTTemplates" },
    ],
    guideline_snippets: [
      "Kt/V ≥1.2 per session (HD); ≥1.7/week (PD)",
      "PD peritonitis: Cefazolin + Ceftazidime IP empirically",
      "CRRT dose: 20–25 mL/kg/hr (KDIGO 2024)",
    ],
    monitoring: ["Kt/V monthly", "Pre-HD weight, BP", "Hemoglobin 3-monthly", "Ferritin + TSAT 3-monthly"],
    red_flags: ["Cloudy PD effluent → peritonitis protocol", "UFR >13 mL/kg/hr → intradialytic hypotension risk"],
  },
};

function getContext(diagnosis = "", ckdStage = null) {
  for (const [key, ctx] of Object.entries(DIAGNOSIS_CONTEXT)) {
    if (ctx.match(diagnosis)) return ctx;
  }
  return null;
}

// ── Component ─────────────────────────────────────────────────────────────
export default function ContextualClinicalIntelligence({ patient, vitals, compact = false }) {
  const ctx = useMemo(() => getContext(patient?.diagnosis, patient?.ckd_stage), [patient?.diagnosis, patient?.ckd_stage]);

  if (!ctx || !patient) return null;

  const alerts = ctx.alerts(patient);

  if (compact) {
    // Compact strip for use in encounter headers
    return (
      <div className="flex flex-wrap gap-1.5 items-center">
        <Badge className={`${ctx.color} text-white text-xs border-0`}>{ctx.label}</Badge>
        {alerts.map((a, i) => (
          <Badge key={i} className={`text-xs border-0 ${a.level === "urgent" ? "bg-red-600 text-white" : a.level === "warn" ? "bg-amber-500 text-white" : "bg-blue-100 text-blue-800"}`}>
            <a.icon className="w-3 h-3 mr-1" />{a.text}
          </Badge>
        ))}
        {ctx.red_flags?.slice(0, 1).map((rf, i) => (
          <span key={i} className="text-xs text-red-600 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />{rf}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Urgent alerts */}
      {alerts.length > 0 && (
        <div className="space-y-1.5">
          {alerts.map((a, i) => (
            <div key={i} className={`flex items-start gap-2 px-3 py-2 rounded-xl text-xs font-semibold border ${
              a.level === "urgent" ? "bg-red-50 border-red-300 text-red-800" :
              a.level === "warn" ? "bg-amber-50 border-amber-300 text-amber-800" :
              "bg-blue-50 border-blue-200 text-blue-800"
            }`}>
              <a.icon className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
              {a.text}
            </div>
          ))}
        </div>
      )}

      {/* Quick actions */}
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">Contextual Tools</p>
        <div className="grid grid-cols-3 gap-1.5">
          {ctx.quick_actions.map((action, i) => (
            <Link key={i} to={createPageUrl(action.path)}>
              <div className="flex flex-col items-center gap-1 p-2 bg-white border border-slate-200 rounded-xl hover:border-blue-300 hover:shadow-sm transition-all text-center">
                <action.icon className={`w-4 h-4 ${action.color}`} />
                <span className="text-xs font-semibold text-slate-700 leading-tight">{action.label}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Guideline snippets */}
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">Evidence Snippets</p>
        <div className="space-y-1">
          {ctx.guideline_snippets.map((s, i) => (
            <div key={i} className="flex items-start gap-1.5 text-xs text-slate-700 bg-blue-50 border border-blue-100 rounded-lg px-2.5 py-2">
              <BookOpen className="w-3 h-3 text-blue-500 flex-shrink-0 mt-0.5" />
              {s}
            </div>
          ))}
        </div>
      </div>

      {/* Red flags */}
      {ctx.red_flags?.length > 0 && (
        <div>
          <p className="text-xs font-bold text-red-400 uppercase tracking-wide mb-1.5">Red Flags</p>
          <div className="space-y-1">
            {ctx.red_flags.map((rf, i) => (
              <div key={i} className="flex items-start gap-1.5 text-xs text-red-700 bg-red-50 border border-red-100 rounded-lg px-2.5 py-1.5">
                <AlertTriangle className="w-3 h-3 text-red-500 flex-shrink-0 mt-0.5" />
                {rf}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Monitoring */}
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">Monitoring Checklist</p>
        <div className="grid grid-cols-2 gap-1">
          {ctx.monitoring.map((m, i) => (
            <div key={i} className="flex items-start gap-1.5 text-xs text-green-800 bg-green-50 border border-green-100 rounded-lg px-2 py-1.5">
              <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0 mt-0.5" />
              {m}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}