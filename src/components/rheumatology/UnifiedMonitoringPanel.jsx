import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Activity, TrendingUp, AlertTriangle, CheckCircle, ChevronDown, ChevronUp, Shield } from "lucide-react";

// Unified longitudinal monitoring panel — shared across nephrology + rheumatology
// Shows tracked parameters, alerts, and biologic timeline

const MONITORING_TRACKS = {
  "Renal Function": {
    color: "bg-blue-100 text-blue-800 border-blue-200",
    params: [
      { name: "Serum Creatinine", unit: "mg/dL", target: "Baseline / stable", alert: "Rising >30% from baseline", frequency: "Monthly (nephritis), q3m (stable)" },
      { name: "eGFR (Schwartz)", unit: "mL/min/1.73m²", target: ">60 (G1/G2)", alert: "<60 or declining", frequency: "Monthly (nephritis), q3m (stable)" },
      { name: "Urine PCR", unit: "mg/mg", target: "<0.5 (remission)", alert: ">0.5 (nephritis activity)", frequency: "Monthly in SLE/IgAV nephritis" },
      { name: "BP (age-sex-height %ile)", unit: "mmHg", target: "<90th %ile", alert: "≥95th %ile (Stage 1 HTN)", frequency: "Every visit" },
    ],
  },
  "Inflammation Markers": {
    color: "bg-orange-100 text-orange-800 border-orange-200",
    params: [
      { name: "ESR", unit: "mm/h", target: "<20", alert: ">40 (active disease)", frequency: "Every visit" },
      { name: "CRP", unit: "mg/L", target: "<5", alert: ">20 (active flare)", frequency: "Every visit (note: low on tocilizumab)" },
      { name: "Ferritin", unit: "ng/mL", target: "<500", alert: ">684 + rising (MAS alarm)", frequency: "Daily in sJIA flare; q3m otherwise" },
      { name: "Complement C3/C4", unit: "g/L", target: "Normal range", alert: "Low (SLE activity/nephritis)", frequency: "q3 months in SLE" },
      { name: "Anti-dsDNA", unit: "IU/mL", target: "Negative/low", alert: "Rising titre (SLE flare)", frequency: "q3 months in SLE" },
    ],
  },
  "Disease Activity Scores": {
    color: "bg-purple-100 text-purple-800 border-purple-200",
    params: [
      { name: "JADAS-27", unit: "score", target: "≤1 (inactive)", alert: ">3.8 poly or >4.2 oligo (escalate)", frequency: "Every clinic visit (JIA)" },
      { name: "SLEDAI-2K", unit: "score", target: "0 (no activity)", alert: ">6 (consider escalation)", frequency: "Every clinic visit (SLE)" },
      { name: "BVAS", unit: "score", target: "0 (remission)", alert: ">15 (active vasculitis)", frequency: "Every clinic visit (vasculitis)" },
      { name: "CMAS", unit: "/52", target: ">40 (minimal impairment)", alert: "<25 (severe impairment)", frequency: "Every visit (JDM)" },
    ],
  },
  "Drug Safety": {
    color: "bg-teal-100 text-teal-800 border-teal-200",
    params: [
      { name: "CBC (WBC, Hb, Plt)", unit: "", target: "WBC >3.5k, ANC >1.5k", alert: "WBC <3k, ANC <1.5k — hold drug", frequency: "Monthly initial, then q3m (MTX/AZA/MMF)" },
      { name: "LFT (AST/ALT)", unit: "U/L", target: "<2× ULN", alert: ">2× ULN — reduce/hold", frequency: "Monthly initial (MTX/AZA/MMF), q3m stable" },
      { name: "Cyclosporin trough", unit: "ng/mL", target: "100–150 (JDM/MAS)", alert: ">200 — dose reduction", frequency: "Weekly initial → monthly stable" },
      { name: "Serum IgG", unit: "g/L", target: ">5 (post-rituximab)", alert: "<4 — IVIG replacement", frequency: "q3–6 months on rituximab" },
    ],
  },
  "Biologic Screening": {
    color: "bg-amber-100 text-amber-800 border-amber-200",
    params: [
      { name: "TB screening (IGRA/TST)", unit: "", target: "Negative before biologic", alert: "Positive — treat latent TB before starting", frequency: "Before each new biologic. Annual if ongoing." },
      { name: "HBsAg + anti-HBc", unit: "", target: "Negative", alert: "HBsAg+ — entecavir prophylaxis before RTX/IST", frequency: "Before rituximab or cyclophosphamide" },
      { name: "Varicella VZV IgG", unit: "", target: "Immune (IgG+)", alert: "Susceptible — vaccinate before biologic (≥4 weeks)", frequency: "Before biologic initiation" },
      { name: "CD19/CD20 B cells", unit: "cells/μL", target: "Depleted post-RTX", alert: "B-cell reconstitution timing for re-dosing", frequency: "q3–6 months on rituximab" },
    ],
  },
  "Vaccination Status": {
    color: "bg-green-100 text-green-800 border-green-200",
    params: [
      { name: "Pneumococcal (PCV13 + PPSV23)", unit: "", target: "Completed", alert: "Missing — administer before IS if possible", frequency: "Check baseline; PPSV23 q5y on IS" },
      { name: "Influenza (inactivated)", unit: "", target: "Annual", alert: "Missed — administer (safe on all IS except within 2w of high-dose steroids)", frequency: "Annually" },
      { name: "COVID-19 (inactivated/mRNA)", unit: "", target: "Completed", alert: "Missing — high priority in IS patients", frequency: "Per national schedule" },
      { name: "Live vaccine clearance", unit: "", target: "Not on biologic/high-dose IS", alert: "DO NOT give live vaccines on biologics/high-dose IS", frequency: "Assess before each live vaccine" },
    ],
  },
};

const ALERT_TRIGGERS = [
  { label: "Rising ferritin", detail: "Ferritin >684 ng/mL rising in sJIA — MAS alarm", level: "critical", condition: "sJIA/MAS" },
  { label: "Declining eGFR", detail: "eGFR drop >30% from baseline in any rheumatic disease with renal involvement", level: "high", condition: "Lupus/ANCA/IgAV" },
  { label: "Repeated steroid bursts", detail: "≥3 prednisolone courses in 12 months — consider steroid-sparing escalation", level: "medium", condition: "JIA/SLE/vasculitis" },
  { label: "Biologic failure risk", detail: "Secondary failure (loss of response) — check anti-drug antibodies, consider switch", level: "medium", condition: "JIA on TNFi" },
  { label: "Heavy proteinuria", detail: "Urine PCR >2.0 in SLE — lupus nephritis flare, consider biopsy", level: "critical", condition: "SLE Nephritis" },
  { label: "WBC <3k on DMARD", detail: "Myelosuppression threshold — hold MTX/AZA/MMF, recheck in 1 week", level: "high", condition: "On DMARD" },
  { label: "B-cell reconstitution", detail: "CD19+ B cells returning after rituximab — time next dose or anticipate relapse", level: "medium", condition: "On Rituximab" },
];

const LEVEL_COLORS = {
  critical: "bg-red-50 border-red-200 text-red-800",
  high: "bg-amber-50 border-amber-200 text-amber-800",
  medium: "bg-yellow-50 border-yellow-100 text-yellow-800",
};

function MonitoringTrack({ title, track }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <button className="w-full flex items-center justify-between p-3 hover:bg-slate-50" onClick={() => setOpen(o => !o)}>
        <div className="flex items-center gap-2">
          <Badge className={`text-xs border ${track.color}`}>{title}</Badge>
          <span className="text-xs text-slate-500">{track.params.length} parameters</span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>
      {open && (
        <div className="border-t border-slate-100">
          {track.params.map((p, i) => (
            <div key={i} className={`p-3 ${i !== track.params.length - 1 ? "border-b border-slate-50" : ""}`}>
              <div className="flex items-start justify-between gap-2 mb-1">
                <div>
                  <span className="text-xs font-bold text-slate-800">{p.name}</span>
                  {p.unit && <span className="text-xs text-slate-400 ml-1">({p.unit})</span>}
                </div>
                <Badge className="text-xs bg-teal-100 text-teal-700 border-0 flex-shrink-0">{p.frequency}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-1.5 mt-1">
                <div className="text-xs bg-green-50 rounded p-1.5">
                  <span className="text-green-600 font-semibold">✓ Target: </span>
                  <span className="text-green-800">{p.target}</span>
                </div>
                <div className="text-xs bg-red-50 rounded p-1.5">
                  <span className="text-red-600 font-semibold">⚠ Alert: </span>
                  <span className="text-red-800">{p.alert}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function UnifiedMonitoringPanel() {
  const [showAlerts, setShowAlerts] = useState(true);

  return (
    <div className="space-y-3">
      <Alert className="bg-teal-50 border-teal-200">
        <Shield className="w-4 h-4 text-teal-600" />
        <AlertDescription className="text-xs text-teal-900">
          <strong>Unified Longitudinal Monitoring Engine</strong> — Shared nephrology + rheumatology tracking. Parameters, targets, alerts, and biologic safety screening.
        </AlertDescription>
      </Alert>

      {/* Predictive alert triggers */}
      <div>
        <button className="w-full flex items-center justify-between text-xs font-bold text-slate-600 uppercase tracking-wide mb-2 px-1"
          onClick={() => setShowAlerts(s => !s)}>
          <span className="flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5 text-amber-500" />Predictive Alert Triggers</span>
          {showAlerts ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
        {showAlerts && (
          <div className="space-y-1.5">
            {ALERT_TRIGGERS.map((a, i) => (
              <div key={i} className={`rounded-xl border p-2.5 ${LEVEL_COLORS[a.level]}`}>
                <div className="flex items-center justify-between mb-0.5">
                  <p className="text-xs font-bold">{a.label}</p>
                  <Badge className={`text-xs border-0 ${
                    a.level === "critical" ? "bg-red-200 text-red-900" :
                    a.level === "high" ? "bg-amber-200 text-amber-900" : "bg-yellow-200 text-yellow-900"
                  }`}>{a.condition}</Badge>
                </div>
                <p className="text-xs opacity-90">{a.detail}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Monitoring tracks */}
      <div>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 px-1">
          <Activity className="w-3.5 h-3.5 inline mr-1" />Monitoring Parameter Tracks
        </p>
        <div className="space-y-2">
          {Object.entries(MONITORING_TRACKS).map(([title, track]) => (
            <MonitoringTrack key={title} title={title} track={track} />
          ))}
        </div>
      </div>
    </div>
  );
}