import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GitBranch, Zap, AlertTriangle, CheckCircle, ChevronRight, ArrowRight } from "lucide-react";
import { executePathway, PATHWAY_REGISTRY, detectApplicablePathways, getDifferentialDiagnosis } from "@/lib/clinicalOS/PathwayEngine";
import SafetyAlertBanner from "./SafetyAlertBanner";

const SEVERITY_COLORS = {
  CRITICAL: "bg-red-600 text-white",
  SEVERE: "bg-orange-500 text-white",
  HYPERTENSIVE_ENCEPHALOPATHY: "bg-red-700 text-white",
  HYPERTENSIVE_URGENCY: "bg-orange-500 text-white",
  MODERATE: "bg-amber-500 text-white",
  MILD: "bg-yellow-500 text-slate-900",
  STANDARD: "bg-blue-600 text-white",
};

const PATHWAY_LIST = Object.values(PATHWAY_REGISTRY).map(p => ({ id: p.id, title: p.title, category: p.category }));

const DEFAULT_CTX = {
  dipstick_days: 0, dipstick_level: 0, albumin: 3.0,
  serum_potassium: 0, ecg_changes: false,
  bp_percentile: 85, end_organ_damage: false, seizures: false,
  aki_stage: 0, fluid_overload_pct: 0,
  weeks_on_pred: 0, no_remission: false,
  relapse_count_6m: 0, on_alternate_day_pred: false, on_pred_dose: 1.0,
  has_aki: false, current_medications: [],
};

export default function PathwayExecutor() {
  const [selectedPathway, setSelectedPathway] = useState("nephrotic_relapse");
  const [ctx, setCtx] = useState(DEFAULT_CTX);
  const [result, setResult] = useState(null);
  const [ddxMode, setDdxMode] = useState(false);
  const [ddxSymptoms, setDdxSymptoms] = useState({});
  const [ddxResult, setDdxResult] = useState(null);

  const ctxInputs = {
    nephrotic_relapse: [
      { key: "dipstick_days", label: "Days of 3+ dipstick", type: "number" },
      { key: "dipstick_level", label: "Dipstick level (0=neg, 3=3+, 4=4+)", type: "number" },
      { key: "albumin", label: "Serum albumin (g/dL)", type: "number" },
      { key: "relapse_count_6m", label: "Relapses in last 6 months", type: "number" },
      { key: "weeks_on_pred", label: "Weeks on prednisolone", type: "number" },
      { key: "no_remission", label: "No remission achieved", type: "checkbox" },
      { key: "respiratory_distress", label: "Respiratory distress", type: "checkbox" },
    ],
    hyperkalemia: [
      { key: "serum_potassium", label: "Serum K+ (mmol/L)", type: "number" },
      { key: "ecg_changes", label: "ECG changes present", type: "checkbox" },
    ],
    hypertensive_emergency: [
      { key: "bp_percentile", label: "Systolic BP percentile", type: "number" },
      { key: "seizures", label: "Seizures", type: "checkbox" },
      { key: "altered_consciousness", label: "Altered consciousness", type: "checkbox" },
      { key: "end_organ_damage", label: "End-organ damage present", type: "checkbox" },
    ],
    aki_icu: [
      { key: "aki_stage", label: "AKI Stage (1-3)", type: "number" },
      { key: "fluid_overload_pct", label: "Fluid overload (%)", type: "number" },
    ],
    srns_workup: [
      { key: "weeks_on_pred", label: "Weeks on prednisolone", type: "number" },
      { key: "no_remission", label: "No remission achieved", type: "checkbox" },
      { key: "genetic_mutation_found", label: "Genetic mutation found", type: "checkbox" },
      { key: "fsgs_on_biopsy", label: "FSGS on biopsy", type: "checkbox" },
    ],
  };

  const DDX_SYMPTOMS = [
    { key: "hematuria", label: "Hematuria" },
    { key: "low_c3", label: "Low C3" },
    { key: "proteinuria", label: "Proteinuria" },
    { key: "hypertension", label: "Hypertension" },
    { key: "hemolytic_anemia", label: "Haemolytic anaemia" },
    { key: "thrombocytopenia", label: "Thrombocytopenia" },
    { key: "aki", label: "AKI" },
    { key: "hearing_loss", label: "Hearing loss" },
    { key: "nephrotic_syndrome", label: "Nephrotic syndrome" },
    { key: "recurrent_hus", label: "Recurrent HUS" },
    { key: "srns", label: "SRNS" },
  ];

  const handleExecute = () => {
    const res = executePathway(selectedPathway, ctx);
    setResult(res);
  };

  const handleDDx = () => {
    const res = getDifferentialDiagnosis(ddxSymptoms);
    setDdxResult(res);
  };

  return (
    <Card className="border-2 border-indigo-200 shadow-md">
      <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <GitBranch className="w-5 h-5 text-indigo-600" />
          Pathway Execution Engine
          <div className="ml-auto flex gap-1">
            <button onClick={() => { setDdxMode(false); setResult(null); }}
              className={`px-2.5 py-1 text-xs rounded-lg font-semibold transition-colors ${!ddxMode ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600"}`}>
              Pathways
            </button>
            <button onClick={() => { setDdxMode(true); setDdxResult(null); }}
              className={`px-2.5 py-1 text-xs rounded-lg font-semibold transition-colors ${ddxMode ? "bg-purple-600 text-white" : "bg-slate-100 text-slate-600"}`}>
              DDx Engine
            </button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">

        {!ddxMode ? (
          <>
            <select value={selectedPathway} onChange={e => { setSelectedPathway(e.target.value); setResult(null); }}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300">
              {PATHWAY_LIST.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
            </select>

            {(ctxInputs[selectedPathway] || []).map(field => (
              <div key={field.key} className="flex items-center gap-3">
                <label className="text-xs text-slate-600 flex-1">{field.label}</label>
                {field.type === "checkbox" ? (
                  <input type="checkbox" checked={!!ctx[field.key]}
                    onChange={e => setCtx(p => ({ ...p, [field.key]: e.target.checked }))}
                    className="w-4 h-4" />
                ) : (
                  <input type="number" value={ctx[field.key] || ""}
                    onChange={e => setCtx(p => ({ ...p, [field.key]: parseFloat(e.target.value) || 0 }))}
                    className="w-24 border border-slate-200 rounded px-2 py-1 text-sm" />
                )}
              </div>
            ))}

            <Button onClick={handleExecute} className="w-full bg-indigo-600 hover:bg-indigo-700">
              <Zap className="w-4 h-4 mr-2" /> Execute Pathway
            </Button>

            {result && result.triggered && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className={SEVERITY_COLORS[result.severity] || "bg-slate-500 text-white"}>
                    {result.severity}
                  </Badge>
                  {result.icu_required && (
                    <Badge className="bg-red-600 text-white animate-pulse">ICU ESCALATION</Badge>
                  )}
                </div>

                {result.safety_alerts.length > 0 && (
                  <SafetyAlertBanner alerts={result.safety_alerts} />
                )}

                <div className="bg-white border border-slate-200 rounded-xl p-3">
                  <p className="text-xs font-bold text-slate-500 uppercase mb-2">Clinical Actions</p>
                  <div className="space-y-1.5">
                    {result.actions.map((a, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm">
                        <div className="w-5 h-5 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">{i + 1}</div>
                        <span className="text-slate-800">{a}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {result.branches.length > 0 && (
                  <div className="bg-purple-50 border border-purple-200 rounded-xl p-3">
                    <p className="text-xs font-bold text-purple-700 mb-1">Active Branches</p>
                    {result.branches.map(b => (
                      <Badge key={b} className="mr-1 bg-purple-100 text-purple-800 border border-purple-200">{b.replace(/_/g, " ")}</Badge>
                    ))}
                  </div>
                )}

                {result.monitoring.length > 0 && (
                  <div className="bg-teal-50 border border-teal-200 rounded-xl p-3">
                    <p className="text-xs font-bold text-teal-700 mb-1">Monitoring Protocol</p>
                    <div className="flex flex-wrap gap-1">
                      {result.monitoring.map(m => (
                        <Badge key={m} variant="outline" className="text-xs border-teal-300 text-teal-700">{m.replace(/_/g, " ")}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {result && !result.triggered && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-sm text-green-800">
                <CheckCircle className="w-4 h-4 inline mr-1.5" />Trigger condition not met — no pathway activation required.
              </div>
            )}
          </>
        ) : (
          <>
            <p className="text-xs text-slate-500">Select presenting symptoms/findings:</p>
            <div className="grid grid-cols-2 gap-2">
              {DDX_SYMPTOMS.map(s => (
                <label key={s.key} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={!!ddxSymptoms[s.key]}
                    onChange={e => setDdxSymptoms(p => ({ ...p, [s.key]: e.target.checked }))}
                    className="w-4 h-4" />
                  {s.label}
                </label>
              ))}
            </div>

            <Button onClick={handleDDx} className="w-full bg-purple-600 hover:bg-purple-700">
              Generate Differential Diagnosis
            </Button>

            {ddxResult && ddxResult.differentials.length > 0 && (
              <div className="space-y-2">
                {ddxResult.differentials.map((d, i) => (
                  <div key={i} className="bg-white border border-purple-200 rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-sm text-slate-900">{i + 1}. {d.dx}</span>
                      <Badge className="text-xs bg-purple-100 text-purple-800 border-0">{d.probability}</Badge>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {d.investigations.map(inv => (
                        <Badge key={inv} variant="outline" className="text-xs">{inv}</Badge>
                      ))}
                    </div>
                  </div>
                ))}
                {ddxResult.recommended_investigations.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                    <p className="text-xs font-bold text-blue-700 mb-1.5">Recommended Investigations (all differentials)</p>
                    <div className="flex flex-wrap gap-1">
                      {ddxResult.recommended_investigations.map(i => (
                        <Badge key={i} className="text-xs bg-blue-100 text-blue-800 border-0">{i}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}