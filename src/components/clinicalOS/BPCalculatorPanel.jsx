import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Activity, AlertTriangle, CheckCircle } from "lucide-react";
import { calculateBPPercentile, classifyHypertensiveEmergency } from "@/lib/clinicalOS/BPEngine";

export default function BPCalculatorPanel() {
  const [form, setForm] = useState({ age: "", sex: "M", systolic: "", diastolic: "", height_percentile: 50 });
  const [result, setResult] = useState(null);

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

  const stageColors = {
    "Stage 2 HTN": "bg-red-100 text-red-800 border-red-300",
    "Stage 1 HTN": "bg-orange-100 text-orange-800 border-orange-300",
    "Elevated BP": "bg-amber-100 text-amber-800 border-amber-300",
    "Normal": "bg-green-100 text-green-800 border-green-300",
  };

  return (
    <Card className="border-2 border-rose-200 shadow-md">
      <CardHeader className="bg-gradient-to-r from-rose-50 to-pink-50 pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Activity className="w-5 h-5 text-rose-600" />
          Pediatric BP Percentile Calculator
          <Badge className="ml-auto bg-rose-600 text-white text-xs">AAP 2017</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-3">
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
            <div className="flex justify-between text-xs text-slate-400">
              <span>5th</span><span className="font-medium text-rose-600">{form.height_percentile}th</span><span>95th</span>
            </div>
          </div>
        </div>

        <Button onClick={handleCalculate} className="w-full bg-rose-600 hover:bg-rose-700">
          Calculate BP Percentile
        </Button>

        {result && !result.error && (
          <div className="space-y-2">
            <div className={`p-3 rounded-xl border-2 ${stageColors[result.stage] || "bg-slate-100"}`}>
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-base">{result.classification}</span>
                {result.systolic_percentile && (
                  <span className="text-sm font-semibold">{result.systolic_percentile}th %ile</span>
                )}
              </div>
              {result.reference_values && (
                <p className="text-xs opacity-75">
                  Reference: 90th={result.reference_values.p90}, 95th={result.reference_values.p95}, 99th={result.reference_values.p99} mmHg
                </p>
              )}
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
              <p className="text-xs font-bold text-slate-600 mb-1.5">Management Recommendation</p>
              <p className="text-xs text-slate-700 leading-relaxed">{result.management_recommendation}</p>
              <p className="text-xs text-slate-400 mt-1.5">{result.source}</p>
              {result.note && <p className="text-xs text-amber-700 mt-1">Note: {result.note}</p>}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}