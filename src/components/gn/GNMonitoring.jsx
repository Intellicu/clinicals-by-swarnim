import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ChevronDown, ChevronUp, Activity, TrendingDown, BarChart3 } from "lucide-react";

const MONITORING_PLANS = [
  {
    id: "ns_monitoring",
    name: "Nephrotic Syndrome Monitoring",
    category: "NS",
    frequency: "Monthly (active) / Quarterly (remission)",
    parameters: [
      { name: "Urine PCR", target: "<0.2 (remission)", frequency: "Weekly during relapse, monthly in remission", alert: "PCR >2.0 → relapse workup" },
      { name: "Serum Albumin", target: ">3.5 g/dL (remission)", frequency: "Monthly during active disease", alert: "<2.0 → albumin infusion consideration" },
      { name: "Blood Pressure", target: "<95th percentile for age/sex/height", frequency: "Every visit", alert: "Stage 2 HTN → antihypertensives" },
      { name: "eGFR / Creatinine", target: "Stable baseline", frequency: "Monthly (active), q3 months (remission)", alert: "Rise >25% from baseline → investigate" },
      { name: "Urine dipstick", target: "Trace or negative protein", frequency: "Weekly (home monitoring diary)", alert: "3+ for ≥3 days → relapse — start steroids" },
      { name: "Growth / Weight", target: "Normal growth velocity", frequency: "Every 3 months", alert: "Growth arrest → minimise steroids" },
      { name: "Cholesterol/TG", target: "Cholesterol <5.2 mmol/L", frequency: "q3–6 months", alert: ">6.5 mmol/L persistent → statin discussion" },
    ],
    drug_monitoring: ["Steroid adverse effects (BP, glucose, weight, behaviour)", "MMF: CBC + LFT monthly → q3 months", "CNI trough level monthly (tacrolimus 4–8 ng/mL)", "Rituximab: CD19 count + IgG q3 months"],
  },
  {
    id: "ckd_monitoring",
    name: "CKD Surveillance",
    category: "CKD",
    frequency: "Stage-dependent (q3–12 months)",
    parameters: [
      { name: "eGFR", target: "Stable or declining <1 mL/min/year (low risk)", frequency: "Monthly if declining rapidly; q3–6 months if stable", alert: "Decline >5 mL/min/year → urgent review" },
      { name: "Urine PCR", target: "<0.5 (low risk)", frequency: "q3 months", alert: "PCR >1.0 → biopsy/treatment consideration" },
      { name: "Blood Pressure", target: "<130/80 (adults); 90th%ile (children)", frequency: "Every visit (minimum monthly)", alert: "Uncontrolled → medication adjustment" },
      { name: "Haemoglobin", target: "10–11.5 g/dL", frequency: "q3 months", alert: "<10 → ESA + iron workup" },
      { name: "Phosphate", target: "0.87–1.49 mmol/L (eGFR 15–30)", frequency: "q1–3 months (stage-dependent)", alert: ">1.78 → phosphate binder" },
      { name: "PTH", target: "2–9× ULN (dialysis); 1–2× ULN (pre-dialysis)", frequency: "q3–6 months", alert: ">300 → Vitamin D analog ± calcimimetic" },
      { name: "Potassium", target: "3.5–5.0 mEq/L", frequency: "q1–3 months", alert: ">6.0 → emergency management" },
      { name: "Bicarbonate", target: "≥22 mEq/L", frequency: "q3 months", alert: "<18 → sodium bicarbonate supplementation" },
    ],
    drug_monitoring: ["ACEi/ARB: K+ and creatinine within 2 weeks of change, then q3 months", "SGLT2i: eGFR + K+ q3 months", "ESA: Hb monthly (titration), q3 months (stable)", "Iron: ferritin + TSAT before and q3 months on ESA"],
  },
  {
    id: "transplant_monitoring",
    name: "Transplant Monitoring",
    category: "Transplant",
    frequency: "Weekly (early) → Monthly → Quarterly (long-term)",
    parameters: [
      { name: "Tacrolimus Trough", target: "10–15 ng/mL (0–3 months); 8–12 ng/mL (3–12 months); 5–8 ng/mL (>1 year)", frequency: "Daily initially → weekly → monthly", alert: "<4 → rejection risk; >15 → toxicity risk" },
      { name: "Creatinine/eGFR", target: "Stable or improving", frequency: "Daily (week 1–2); weekly (1–3 months); monthly", alert: "Rise >20% above nadir → rejection workup" },
      { name: "Urine PCR", target: "<0.5 (long-term)", frequency: "Monthly × 12, then q3 months", alert: ">1.0 → recurrent GN / rejection / CNI toxicity" },
      { name: "Haematology", target: "WBC >3k, ANC >1.5k", frequency: "Weekly × 4, then monthly", alert: "Leucopenia → reduce immunosuppression/CMV workup" },
      { name: "CMV PCR", target: "Undetectable", frequency: "Monthly (first 6 months), then q3 months (D+/R-)", alert: "Detectable + clinical → valganciclovir treatment" },
      { name: "BK Virus (urine/plasma)", target: "Urine decoy cells or plasma <200 copies/mL", frequency: "q3 months (first 2 years)", alert: "BK viraemia → reduce immunosuppression" },
    ],
    drug_monitoring: ["MMF: dose based on disease activity + WBC; consider levels in toxicity", "Prednisolone: minimal effective dose; full taper in selected patients", "TMP-SMX prophylaxis: 1 DS tab 3× weekly (first 6–12 months)"],
  },
  {
    id: "cni_monitoring",
    name: "CNI (Tacrolimus/Cyclosporin) Monitoring",
    category: "Drug Monitoring",
    frequency: "Monthly during dose changes; q3 months stable",
    parameters: [
      { name: "Tacrolimus Trough (C0)", target: "NS: 4–8 ng/mL; Transplant induction: 10–15 ng/mL", frequency: "Weekly during titration, monthly stable", alert: "<4 → subtherapeutic; >15 → toxicity" },
      { name: "CSA Trough (C0)", target: "NS: 100–200 ng/mL", frequency: "Weekly during titration, monthly stable", alert: "<80 → subtherapeutic; >250 → toxicity" },
      { name: "Creatinine", target: "Stable (≤25% rise from baseline acceptable)", frequency: "Monthly", alert: ">25% rise → reduce CNI dose" },
      { name: "Blood Pressure", target: "<130/80 adults; 90th%ile children", frequency: "Every visit", alert: "CNI-induced HTN → amlodipine (do NOT use verapamil/diltiazem — increase CNI levels)" },
      { name: "Glucose", target: "Fasting glucose <5.6 mmol/L", frequency: "q3 months", alert: "New-onset diabetes → diabetic management + consider switching CNI" },
      { name: "Potassium", target: "3.5–5.0 mEq/L", frequency: "Monthly", alert: "Hyperkalaemia (CNI reduces aldosterone) → reduce K+ load" },
      { name: "Magnesium", target: ">0.7 mmol/L", frequency: "Monthly", alert: "<0.6 → oral/IV magnesium supplementation" },
    ],
    drug_monitoring: ["CYP3A4/P-glycoprotein interactions: azole antifungals, rifampicin, macrolides all affect CNI levels significantly", "Grapefruit juice: AVOID (increases CNI exposure)", "Trimethoprim: increases creatinine (tubular secretion inhibition) — not true GFR fall"],
  },
  {
    id: "biologic_monitoring",
    name: "Biologic Monitoring (Rituximab / Eculizumab)",
    category: "Drug Monitoring",
    frequency: "q3 months",
    parameters: [
      { name: "CD19/CD20 B-cells (RTX)", target: "Depleted (<5 cells/μL) after induction", frequency: "q3 months", alert: "B-cell recovery + clinical relapse → re-dose RTX" },
      { name: "IgG (RTX)", target: ">6 g/L", frequency: "q3–6 months", alert: "<4 g/L + recurrent infections → IVIG replacement" },
      { name: "CH50 (Eculizumab)", target: "Suppressed to 0 or <10% normal", frequency: "Before each dose, then q3 months", alert: "Incomplete suppression → pharmacokinetic review" },
      { name: "Platelet Count + LDH + Creatinine (aHUS)", target: "Normal + stable", frequency: "Monthly (first 3 months), then q3 months", alert: "Rising LDH + falling platelets → TMA relapse" },
      { name: "CBC", target: "WBC >3k", frequency: "q3 months", alert: "Late-onset neutropenia (RTX) → G-CSF if <1k" },
    ],
    drug_monitoring: ["HBV reactivation (RTX): check anti-HBsAg q3 months; entecavir if reactivation", "CMV/EBV: monitor in immunocompromised", "Meningococcal vaccination: MANDATORY before eculizumab; penicillin V 250 mg BD throughout"],
  },
  {
    id: "htn_monitoring",
    name: "Hypertension Monitoring in GN",
    category: "Hypertension",
    frequency: "Each clinical visit (minimum monthly)",
    parameters: [
      { name: "Clinic BP", target: "Adults: <130/80. Children: <90th%ile for age/sex/height", frequency: "Every visit", alert: "Stage 2 HTN or hypertensive urgency → escalate treatment" },
      { name: "Home BP (HBPM)", target: "Same targets as clinic", frequency: "Twice daily × 1 week per month (or ambulatory)", alert: "Masked HTN (normal clinic, high home) → treat" },
      { name: "24h Ambulatory BP (ABPM)", target: "Daytime average <130/80 (adult)", frequency: "Annually (CKD) or when clinic readings uncertain", alert: "Non-dipping pattern → cardiovascular risk; renal HTN" },
      { name: "K+ (RAAS blockade)", target: "3.5–5.5 mEq/L", frequency: "2 weeks after start/change, then q3 months", alert: ">5.5 → reduce ACEi/ARB or add patiromer/SZC" },
    ],
    drug_monitoring: ["ACEi/ARB: creatinine + K+ 2 weeks post-change", "Amlodipine (CNI-HTN): avoid verapamil/diltiazem (CYP3A4 — increase CNI)", "Steroid-induced HTN: amlodipine 1st line"],
  },
  {
    id: "proteinuria_tracking",
    name: "Proteinuria Tracking",
    category: "Core Monitoring",
    frequency: "q4–12 weeks based on diagnosis",
    parameters: [
      { name: "Urine PCR", target: "NS remission <0.2; CKD management <0.5; IgAN <0.5", frequency: "Monthly (NS), q3 months (CKD)", alert: "PCR >1.0 despite ACEi → biopsy/therapy" },
      { name: "24h Urine Protein", target: "<300 mg/day (normal); <3.5 g/day (non-nephrotic)", frequency: "Baseline + q6 months (clinical trials/research)", alert: ">3.5 g → nephrotic range" },
      { name: "Urine Albumin:Creatinine (ACR)", target: "<30 mg/g (normal); 30–300 (microalbuminuria); >300 (macroalbuminuria)", frequency: "DKD: q3–6 months", alert: ">300 on ACEi/SGLT2i → escalate therapy" },
      { name: "PLA2R Antibody (MN)", target: "Negative or falling titre", frequency: "q3 months", alert: "Rising titre → treat/escalate (rituximab)" },
    ],
    drug_monitoring: ["ACEi/ARB effect: recheck PCR 3 months after starting/titrating", "SGLT2i effect: PCR reduction expected within 2–4 weeks"],
  },
  {
    id: "egfr_tracking",
    name: "eGFR Slope Tracking",
    category: "Core Monitoring",
    frequency: "Monthly (rapid decline) / Quarterly (stable)",
    parameters: [
      { name: "eGFR (CKD-EPI/Schwartz)", target: "Decline <1–2 mL/min/year (low risk)", frequency: "q1–3 months (stage 3b+)", alert: "Decline >5 mL/min/year → urgent nephrology" },
      { name: "Creatinine trend", target: "Stable", frequency: "Same frequency as eGFR", alert: ">25% rise from baseline → investigate cause" },
      { name: "eGFR slope (3-point)", target: "Positive or stable", frequency: "Calculate at 6-month intervals", alert: "Negative slope + proteinuria → referral for RRT planning" },
    ],
    drug_monitoring: ["All nephrotoxics: avoid NSAIDs, aminoglycosides, IV contrast without preparation", "ACEi tolerance: up to 30% creatinine rise acceptable if K+ stable"],
  },
];

const TREND_PARAMETERS = [
  { name: "eGFR", unit: "mL/min/1.73m²", color: "bg-blue-500", target: ">60", direction: "stable/increasing" },
  { name: "Urine PCR", unit: "mg/mg", color: "bg-amber-500", target: "<0.5", direction: "decreasing" },
  { name: "Blood Pressure", unit: "mmHg", color: "bg-red-500", target: "<130/80", direction: "decreasing" },
  { name: "Serum Albumin", unit: "g/dL", color: "bg-green-500", target: ">3.5", direction: "increasing" },
  { name: "Potassium", unit: "mEq/L", color: "bg-orange-500", target: "3.5–5.0", direction: "stable" },
  { name: "Tacrolimus Trough", unit: "ng/mL", color: "bg-purple-500", target: "4–8 (NS)", direction: "stable" },
  { name: "Ferritin", unit: "μg/L", color: "bg-yellow-500", target: ">200 (CKD anaemia)", direction: "increasing if deficient" },
  { name: "Complements C3/C4", unit: "g/L", color: "bg-teal-500", target: "Normal range", direction: "increasing (recovery)" },
];

const CATEGORY_COLORS = {
  NS: "bg-indigo-100 text-indigo-800",
  CKD: "bg-blue-100 text-blue-800",
  Transplant: "bg-green-100 text-green-800",
  "Drug Monitoring": "bg-purple-100 text-purple-800",
  Hypertension: "bg-red-100 text-red-800",
  "Core Monitoring": "bg-teal-100 text-teal-800",
};

function MonitoringCard({ plan }) {
  const [open, setOpen] = useState(false);
  return (
    <Card className="bg-white border-2 border-slate-200 hover:border-teal-300 transition-colors">
      <CardHeader className="pb-2 cursor-pointer" onClick={() => setOpen(o => !o)}>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-0.5">
              <Activity className="w-3.5 h-3.5 text-teal-600" />
              <span className="font-bold text-sm text-slate-900">{plan.name}</span>
              <Badge className={`text-xs border-0 ${CATEGORY_COLORS[plan.category] || "bg-slate-100"}`}>{plan.category}</Badge>
            </div>
            <p className="text-xs text-slate-400">⏱️ {plan.frequency}</p>
          </div>
          {open ? <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />}
        </div>
      </CardHeader>

      {open && (
        <CardContent className="pt-0 space-y-3">
          {/* Parameters table */}
          <div className="space-y-2">
            <p className="text-xs font-bold text-slate-700 uppercase tracking-wide">Monitoring Parameters</p>
            {plan.parameters.map((p, i) => (
              <div key={i} className="border border-slate-200 rounded-lg p-2 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-900">{p.name}</span>
                  <Badge className="bg-green-100 text-green-800 text-xs border-0">{p.target}</Badge>
                </div>
                <p className="text-xs text-slate-500">⏱️ {p.frequency}</p>
                {p.alert && (
                  <div className="text-xs bg-amber-50 border border-amber-200 rounded p-1.5 text-amber-800">
                    ⚠️ {p.alert}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Drug monitoring */}
          {plan.drug_monitoring && plan.drug_monitoring.length > 0 && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-2">
              <p className="text-xs font-bold text-purple-800 mb-1.5">💊 Drug-Specific Monitoring</p>
              {plan.drug_monitoring.map((d, i) => (
                <p key={i} className="text-xs text-purple-900">• {d}</p>
              ))}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}

function TrendPlaceholderCard({ param }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold text-slate-900">{param.name}</span>
        <Badge className="text-xs bg-slate-100 text-slate-600">{param.unit}</Badge>
      </div>
      <div className="h-10 flex items-end gap-1">
        {[60, 75, 65, 80, 70, 85, 78].map((h, i) => (
          <div key={i} className={`flex-1 ${param.color} opacity-${30 + i * 10} rounded-t`} style={{ height: `${h}%` }} />
        ))}
      </div>
      <div className="flex items-center justify-between mt-1.5">
        <span className="text-xs text-slate-400">Target: {param.target}</span>
        <span className="text-xs text-green-600 font-medium">↗ {param.direction}</span>
      </div>
    </div>
  );
}

export default function GNMonitoring() {
  const [catFilter, setCatFilter] = useState("All");
  const [showTrends, setShowTrends] = useState(false);

  const categories = ["All", "NS", "CKD", "Transplant", "Drug Monitoring", "Hypertension", "Core Monitoring"];
  const filtered = catFilter === "All" ? MONITORING_PLANS : MONITORING_PLANS.filter(p => p.category === catFilter);

  return (
    <div className="space-y-3">
      <Alert className="bg-teal-50 border-teal-200">
        <Activity className="w-4 h-4 text-teal-600" />
        <AlertDescription className="text-xs text-teal-900">
          <strong>GN Monitoring Centre:</strong> {MONITORING_PLANS.length} structured monitoring plans — parameters, targets, alert thresholds, drug monitoring, trend tracking.
        </AlertDescription>
      </Alert>

      {/* Trend toggle */}
      <button onClick={() => setShowTrends(t => !t)}
        className="w-full flex items-center justify-between px-3 py-2.5 bg-white border-2 border-blue-200 rounded-xl text-xs font-semibold text-blue-700 hover:border-blue-400 transition-colors">
        <span className="flex items-center gap-2"><BarChart3 className="w-3.5 h-3.5" />Trend Visualization Panels</span>
        {showTrends ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {showTrends && (
        <div className="grid grid-cols-2 gap-2">
          {TREND_PARAMETERS.map(p => <TrendPlaceholderCard key={p.name} param={p} />)}
        </div>
      )}

      {/* Category filter */}
      <div className="flex gap-1.5 flex-wrap">
        {categories.map(c => (
          <button key={c} onClick={() => setCatFilter(c)}
            className={`text-xs px-3 py-1.5 rounded-full border font-semibold transition-all ${catFilter === c ? "bg-teal-600 text-white border-teal-600" : "bg-white text-slate-600 border-slate-200 hover:border-teal-300"}`}>
            {c}
          </button>
        ))}
      </div>

      {filtered.map(p => <MonitoringCard key={p.id} plan={p} />)}
    </div>
  );
}