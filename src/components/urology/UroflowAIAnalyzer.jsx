import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Activity, Upload, Loader2, Brain, ChevronDown, ChevronUp } from "lucide-react";
import { base44 } from "@/api/base44Client";

const FLOW_PATTERNS = [
  {
    name: "Bell-Shaped",
    icon: "🔔",
    normal: true,
    description: "Smooth symmetric rise to Qmax then gradual decline. Normal voiding.",
    interpretation: "Normal detrusor contraction. No obstruction or dyssynergia.",
    management: "Reassure. No intervention needed.",
  },
  {
    name: "Plateau Pattern",
    icon: "📊",
    normal: false,
    description: "Flat plateau — constant flow without bell peak. Suggests outlet obstruction.",
    interpretation: "Fixed or functional outlet obstruction. PUV? Stricture? BPH (adolescents)?",
    management: "UDS for Pdet. VCUG if PUV suspected. Uroflow post-treatment.",
  },
  {
    name: "Staccato Pattern",
    icon: "〰️",
    normal: false,
    description: "Oscillating flow with multiple peaks — pelvic floor overactivity during voiding.",
    interpretation: "Dysfunctional voiding. Pelvic floor contraction during micturition. BBD pattern.",
    management: "Biofeedback. Timed voiding. Pelvic floor physiotherapy. Treat constipation.",
  },
  {
    name: "Interrupted Pattern",
    icon: "⚡",
    normal: false,
    description: "Intermittent flow with complete stops. Abdominal straining pattern.",
    interpretation: "Detrusor underactivity or habitual incomplete voiding. High PVR likely.",
    management: "Double voiding. CIC if PVR >30% bladder capacity. Timed voiding protocol.",
  },
  {
    name: "Tower Pattern",
    icon: "🗼",
    normal: false,
    description: "Very high Qmax, very short flow time. Detrusor overactivity pattern.",
    interpretation: "Urgency voiding. Detrusor overactivity. Giggle incontinence?",
    management: "Anticholinergics/mirabegron. Bladder training. Timed voiding. UDS if recurrent.",
  },
];

const InputField = ({ label, value, onChange, unit, placeholder }) => (
  <div className="flex flex-col gap-1">
    <label className="text-xs font-semibold text-slate-600">{label}</label>
    <div className="flex items-center gap-1">
      <input
        className="flex-1 px-3 py-2 text-sm border-2 border-slate-200 rounded-lg focus:border-blue-400 outline-none bg-white"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder || ""}
      />
      {unit && <span className="text-xs text-slate-500 bg-slate-100 px-2 py-2 rounded-lg border">{unit}</span>}
    </div>
  </div>
);

export default function UroflowAIAnalyzer() {
  const [pattern, setPattern] = useState("");
  const [qmax, setQmax] = useState("");
  const [qavg, setQavg] = useState("");
  const [volume, setVolume] = useState("");
  const [flowTime, setFlowTime] = useState("");
  const [pvr, setPvr] = useState("");
  const [age, setAge] = useState("");
  const [sex, setSex] = useState("male");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleAnalyze = async () => {
    if (!pattern && !qmax) return;
    setLoading(true);
    try {
      const prompt = `You are a pediatric urodynamics expert. Analyze this uroflowmetry result for a pediatric patient.

Patient: ${age} year old ${sex}
Flow Pattern: ${pattern || "not specified"}
Qmax: ${qmax || "not provided"} mL/s
Qavg: ${qavg || "not provided"} mL/s
Voided Volume: ${volume || "not provided"} mL
Flow Time: ${flowTime || "not provided"} seconds
Post-void Residual (PVR): ${pvr || "not provided"} mL
Additional Notes: ${notes || "none"}

Provide a structured pediatric uroflowmetry interpretation as JSON:
{
  "pattern_interpretation": "detailed explanation of the flow pattern",
  "age_sex_nomogram": "interpretation relative to expected norms for age/sex",
  "qmax_interpretation": "above/below expected for age/voided volume",
  "pvr_significance": "clinical significance of the PVR",
  "likely_diagnosis": ["primary", "secondary", "tertiary differential"],
  "renal_risk": "low/medium/high with explanation",
  "dysfunctional_voiding_score": "1-10 with explanation",
  "management_suggestions": ["step 1", "step 2", "step 3"],
  "further_tests_needed": ["UDS?", "biofeedback?", "VCUG?"],
  "clinical_summary": "2-3 sentence overall interpretation",
  "red_flags": ["any concerning features"],
  "teaching_pearl": "one educational point about this pattern"
}`;
      const res = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            pattern_interpretation: { type: "string" },
            age_sex_nomogram: { type: "string" },
            qmax_interpretation: { type: "string" },
            pvr_significance: { type: "string" },
            likely_diagnosis: { type: "array", items: { type: "string" } },
            renal_risk: { type: "string" },
            dysfunctional_voiding_score: { type: "string" },
            management_suggestions: { type: "array", items: { type: "string" } },
            further_tests_needed: { type: "array", items: { type: "string" } },
            clinical_summary: { type: "string" },
            red_flags: { type: "array", items: { type: "string" } },
            teaching_pearl: { type: "string" },
          }
        }
      });
      setResult(res);
    } catch (e) {
      setResult({ error: e.message });
    }
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-gradient-to-r from-teal-700 to-cyan-600 p-5 text-white">
        <div className="flex items-center gap-3">
          <Activity className="w-7 h-7" />
          <div>
            <h2 className="text-xl font-bold">Uroflowmetry AI Analyzer</h2>
            <p className="text-teal-100 text-sm">Pattern recognition · Age nomogram · Renal risk · Management guidance</p>
          </div>
        </div>
      </div>

      {/* Pattern reference cards */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Flow Pattern Library</p>
        {FLOW_PATTERNS.map(p => (
          <Card
            key={p.name}
            className={`border-2 cursor-pointer transition-all ${pattern === p.name ? "border-teal-400 bg-teal-50" : "border-slate-200 bg-white"}`}
            onClick={() => setPattern(prev => prev === p.name ? "" : p.name)}
          >
            <CardContent className="p-3">
              <div className="flex items-start gap-3">
                <span className="text-2xl">{p.icon}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm text-slate-800">{p.name}</p>
                    <Badge className={p.normal ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"} variant="secondary">
                      {p.normal ? "Normal" : "Abnormal"}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{p.description}</p>
                  <p className="text-xs text-blue-600 mt-0.5">{p.interpretation}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Input panel */}
      <Card className="border-slate-200">
        <CardContent className="p-4 space-y-3">
          <p className="font-semibold text-slate-700 text-sm">Enter Uroflow Parameters</p>
          <div className="grid grid-cols-2 gap-3">
            <InputField label="Age" value={age} onChange={setAge} unit="years" />
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-600">Sex</label>
              <select
                className="px-3 py-2 text-sm border-2 border-slate-200 rounded-lg bg-white"
                value={sex}
                onChange={e => setSex(e.target.value)}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            <InputField label="Qmax" value={qmax} onChange={setQmax} unit="mL/s" />
            <InputField label="Qavg" value={qavg} onChange={setQavg} unit="mL/s" />
            <InputField label="Voided Volume" value={volume} onChange={setVolume} unit="mL" />
            <InputField label="Flow Time" value={flowTime} onChange={setFlowTime} unit="sec" />
            <InputField label="Post-void Residual" value={pvr} onChange={setPvr} unit="mL" />
          </div>
          <textarea
            className="w-full px-3 py-2 text-sm border-2 border-slate-200 rounded-lg bg-white outline-none focus:border-blue-400 resize-none"
            rows={2}
            placeholder="Additional clinical notes (urgency, daytime wetting, constipation, etc.)"
            value={notes}
            onChange={e => setNotes(e.target.value)}
          />
          <Button
            className="w-full bg-teal-600 hover:bg-teal-700 text-white"
            onClick={handleAnalyze}
            disabled={loading || (!pattern && !qmax)}
          >
            {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Analyzing...</> : <><Brain className="w-4 h-4 mr-2" />AI Interpret Uroflow</>}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {result && !result.error && (
        <div className="space-y-3">
          <Card className="border-teal-200 bg-teal-50">
            <CardContent className="p-4">
              <p className="font-bold text-teal-800 text-sm mb-1">Clinical Summary</p>
              <p className="text-sm text-slate-700">{result.clinical_summary}</p>
            </CardContent>
          </Card>

          {result.red_flags?.length > 0 && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-3">
                <p className="text-xs font-bold text-red-700 mb-2 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> Red Flags
                </p>
                <div className="flex flex-wrap gap-1">
                  {result.red_flags.map((f, i) => (
                    <span key={i} className="text-xs bg-white text-red-600 border border-red-200 px-2 py-0.5 rounded-full">{f}</span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Card className="border-slate-200">
              <CardContent className="p-3">
                <p className="text-xs font-bold text-slate-600 mb-1">Likely Diagnoses</p>
                {result.likely_diagnosis?.map((d, i) => (
                  <p key={i} className="text-xs text-slate-700">{i + 1}. {d}</p>
                ))}
              </CardContent>
            </Card>
            <Card className="border-slate-200">
              <CardContent className="p-3">
                <p className="text-xs font-bold text-slate-600 mb-1">Renal Risk</p>
                <p className="text-xs text-slate-700">{result.renal_risk}</p>
                <p className="text-xs font-bold text-slate-600 mt-2 mb-1">Further Tests</p>
                {result.further_tests_needed?.map((t, i) => (
                  <p key={i} className="text-xs text-slate-700">• {t}</p>
                ))}
              </CardContent>
            </Card>
          </div>

          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-3">
              <p className="text-xs font-bold text-blue-700 mb-2">Management Suggestions</p>
              {result.management_suggestions?.map((m, i) => (
                <p key={i} className="text-xs text-slate-700">Step {i + 1}: {m}</p>
              ))}
            </CardContent>
          </Card>

          {result.teaching_pearl && (
            <Card className="border-indigo-200 bg-indigo-50">
              <CardContent className="p-3">
                <p className="text-xs font-bold text-indigo-700 mb-1">Teaching Pearl</p>
                <p className="text-xs text-slate-700">{result.teaching_pearl}</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}