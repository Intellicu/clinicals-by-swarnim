/**
 * BP CALCULATOR PANEL — UPGRADED
 * Separate SBP + DBP percentiles | AAP 2017 operational logic | Guideline context
 */
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Activity, AlertTriangle, CheckCircle, Info, ChevronDown, ChevronUp } from "lucide-react";
import { calculateBPPercentile, classifyHypertensiveEmergency, getCKDBPTarget } from "@/lib/clinicalOS/BPEngine";

const STAGE_STYLES = {
  "Stage 2 HTN": "bg-red-100 border-red-400 text-red-900",
  "Stage 1 HTN": "bg-orange-100 border-orange-400 text-orange-900",
  "Elevated BP": "bg-amber-100 border-amber-400 text-amber-900",
  "Normal":      "bg-green-100 border-green-400 text-green-900",
};

const PERCENTILE_BAR_COLOR = (pct) =>
  pct >= 99 ? "bg-red-500" : pct >= 95 ? "bg-orange-500" : pct >= 90 ? "bg-amber-400" : "bg-green-400";

function PercentileBar({ label, value, stage }) {
  if (value === null || value === undefined) return null;
  const width = Math.min(100, value);
  return (
    <div>
      <div className="flex justify-between items-center mb-0.5">
        <span className="text-xs text-slate-500 font-medium">{label}</span>
        <span className={`text-xs font-bold ${
          value >= 99 ? "text-red-700" : value >= 95 ? "text-orange-700" : value >= 90 ? "text-amber-700" : "text-green-700"
        }`}>{value}th %ile · {stage}</span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${PERCENTILE_BAR_COLOR(value)}`} style={{ width: `${width}%` }} />
      </div>
      {/* Reference lines */}
      <div className="flex justify-between text-xs text-slate-300 mt-0.5">
        <span>0</span><span>50th</span><span>90th</span><span>95th</span><span>99th</span>
      </div>
    </div>
  );
}

export default function BPCalculatorPanel() {
  const [form, setForm] = useState({ age: "", sex: "M", systolic: "", diastolic: "", height_percentile: 50 });
  const [result, setResult] = useState(null);
  const [showGuideline, setShowGuideline] = useState(false);
  const [showCKD, setShowCKD] = useState(false);

  const ckdTarget = getCKDBPTarget();

  const handleCalculate = () => {
    if (!form.age || !form.systolic || !form.diastolic) return;
    const res = calculateBPPercentile({
      age_years: parseFloat(form.age),
      sex: form.sex,
      systolic: parseFloat(form.systolic),
      diastolic: parseFloat(form.diastolic),
      height_percentile: parseFloat(form.height_percentile) || 50,
    });
    setResult(res);
  };

  return (
    <Card className="border-2 border-rose-200 shadow-md">
      <CardHeader className="bg-gradient-to-r from-rose-50 to-pink-50 pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Activity className="w-5 h-5 text-rose-600" />
          Pediatric BP Percentile Calculator
          <Badge className="ml-auto bg-rose-600 text-white text-xs">AAP 2017</Badge>
        </CardTitle>
        <p className="text-xs text-rose-600 mt-0.5">Separate SBP + DBP percentiles · Classification = higher of the two</p>
      </CardHeader>
      <CardContent className="p-4 space-y-3">
        {/* Input grid */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-slate-500 block mb-0.5">Age (years)</label>
            <input type="number" value={form.age} onChange={e => setForm(p => ({ ...p, age: e.target.value }))}
              placeholder="1–17" className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" />
          </div>
          <div>
            <label className="text-xs text-slate-500 block mb-0.5">Sex</label>
            <select value={form.sex} onChange={e => setForm(p => ({ ...p, sex: e.target.value }))}
              className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300">
              <option value="M">Male</option>
              <option value="F">Female</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-500 block mb-0.5">Systolic (mmHg)</label>
            <input type="number" value={form.systolic} onChange={e => setForm(p => ({ ...p, systolic: e.target.value }))}
              placeholder="e.g. 118" className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" />
          </div>
          <div>
            <label className="text-xs text-slate-500 block mb-0.5">Diastolic (mmHg)</label>
            <input type="number" value={form.diastolic} onChange={e => setForm(p => ({ ...p, diastolic: e.target.value }))}
              placeholder="e.g. 76" className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" />
          </div>
          <div className="col-span-2">
            <label className="text-xs text-slate-500 block mb-0.5">Height Percentile (default 50th)</label>
            <input type="range" min="5" max="95" step="5" value={form.height_percentile}
              onChange={e => setForm(p => ({ ...p, height_percentile: e.target.value }))}
              className="w-full accent-rose-500" />
            <div className="flex justify-between text-xs text-slate-400 mt-0.5">
              <span>5th</span><span className="font-semibold text-rose-600">{form.height_percentile}th</span><span>95th</span>
            </div>
          </div>
        </div>

        <Button onClick={handleCalculate} className="w-full bg-rose-600 hover:bg-rose-700">
          Calculate BP Percentile
        </Button>

        {/* Results */}
        {result && !result.error && (
          <div className="space-y-3">
            {/* Classification card */}
            <div className={`p-3 rounded-xl border-2 ${STAGE_STYLES[result.stage] || "bg-slate-100"}`}>
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-base">{result.classification}</span>
                <span className="text-xs font-semibold opacity-75">
                  {result.dominant_component === "systolic" ? "SBP-driven" : "DBP-driven"}
                </span>
              </div>
              {result.note && <p className="text-xs opacity-75 leading-relaxed">{result.aap_operational_note || result.note}</p>}
            </div>

            {/* Separate percentile bars */}
            {(result.systolic_percentile || result.diastolic_percentile) && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-3">
                <p className="text-xs font-bold text-slate-600 uppercase tracking-wide">Separate Percentiles (AAP 2017)</p>
                <PercentileBar
                  label={`Systolic (${form.systolic} mmHg)`}
                  value={result.systolic_percentile}
                  stage={result.systolic_stage}
                />
                <PercentileBar
                  label={`Diastolic (${form.diastolic} mmHg)`}
                  value={result.diastolic_percentile}
                  stage={result.diastolic_stage}
                />
                <div className="flex items-center gap-1.5 pt-1 border-t border-slate-200">
                  <Info className="w-3 h-3 text-blue-500 flex-shrink-0" />
                  <p className="text-xs text-blue-700">
                    AAP 2017: Overall stage = higher of SBP or DBP stage. Dominant: <strong>{result.dominant_component}</strong> ({result.dominant_percentile}th %ile)
                  </p>
                </div>
              </div>
            )}

            {/* Reference thresholds */}
            {(result.systolic_reference || result.diastolic_reference) && (
              <div className="bg-white border border-slate-200 rounded-xl p-3 space-y-1.5">
                <p className="text-xs font-bold text-slate-600 mb-2">Reference Thresholds (age {form.age}y {form.sex === "M" ? "Male" : "Female"}, {form.height_percentile}th h%ile)</p>
                {result.systolic_reference && (
                  <div className="flex gap-2 text-xs">
                    <span className="text-slate-400 w-16">Systolic</span>
                    <span className="text-slate-600">90th: <strong>{result.systolic_reference.p90}</strong></span>
                    <span className="text-slate-600">95th: <strong>{result.systolic_reference.p95}</strong></span>
                    <span className="text-slate-600">99th: <strong>{result.systolic_reference.p99}</strong></span>
                  </div>
                )}
                {result.diastolic_reference && (
                  <div className="flex gap-2 text-xs">
                    <span className="text-slate-400 w-16">Diastolic</span>
                    <span className="text-slate-600">90th: <strong>{result.diastolic_reference.p90}</strong></span>
                    <span className="text-slate-600">95th: <strong>{result.diastolic_reference.p95}</strong></span>
                    <span className="text-slate-600">99th: <strong>{result.diastolic_reference.p99}</strong></span>
                  </div>
                )}
              </div>
            )}

            {/* Management */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
              <p className="text-xs font-bold text-slate-600 mb-1.5">Management Recommendation</p>
              <p className="text-xs text-slate-700 leading-relaxed">{result.management_recommendation}</p>
              <p className="text-xs text-slate-400 mt-1.5 font-medium">{result.source}</p>
            </div>

            {/* Guideline context toggle */}
            <button onClick={() => setShowGuideline(!showGuideline)}
              className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-semibold">
              <Info className="w-3.5 h-3.5" />
              {showGuideline ? "Hide" : "Show"} guideline context & comparison
              {showGuideline ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
            {showGuideline && result.guideline_context && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 space-y-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-blue-800">Primary guideline:</span>
                  <span className="text-xs px-1.5 py-0.5 bg-blue-600 text-white rounded font-bold">{result.guideline_context.primary}</span>
                </div>
                <p className="text-xs text-blue-700 leading-relaxed">{result.guideline_context.note}</p>
                {result.guideline_context.supporting?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    <span className="text-xs text-blue-600 font-semibold">Supporting:</span>
                    {result.guideline_context.supporting.map((s, i) => (
                      <span key={i} className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">{s}</span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* CKD-specific BP target accordion */}
        <div className="border border-teal-200 rounded-xl overflow-hidden">
          <button onClick={() => setShowCKD(!showCKD)}
            className="w-full flex items-center gap-2 px-3 py-2.5 text-left bg-teal-50 hover:bg-teal-100 transition-colors">
            <Activity className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
            <span className="text-xs font-bold text-teal-800 flex-1">CKD-Specific BP Target (ESCAPE trial)</span>
            {showCKD ? <ChevronUp className="w-3 h-3 text-teal-500" /> : <ChevronDown className="w-3 h-3 text-teal-500" />}
          </button>
          {showCKD && (
            <div className="p-3 bg-white border-t border-teal-100 space-y-1.5">
              <p className="text-xs font-bold text-teal-800">Target: {ckdTarget.target}</p>
              <p className="text-xs text-slate-600 leading-relaxed">{ckdTarget.rationale}</p>
              <p className="text-xs text-slate-500 font-medium">{ckdTarget.source}</p>
              <p className="text-xs text-slate-600">{ckdTarget.drug_choice}</p>
              <p className="text-xs text-amber-700 italic">{ckdTarget.guideline_note}</p>
            </div>
          )}
        </div>

        {result?.error && (
          <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
            <AlertTriangle className="w-4 h-4" />{result.error}
          </div>
        )}
      </CardContent>
    </Card>
  );
}