import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Activity, Loader2, Brain, ChevronDown, ChevronUp, BookOpen } from "lucide-react";
import { base44 } from "@/api/client";

const FLOW_PATTERNS = [
  {
    name: "Bell-Shaped",
    icon: "🔔",
    iccs: "Normal voiding pattern",
    normal: true,
    color: "border-green-200 bg-green-50",
    badge: "bg-green-100 text-green-800",
    description: "Smooth symmetric rise to Qmax then gradual decline. Symmetric bell curve.",
    normal_values: "Qmax ≥ 15 mL/s, VV >65% expected capacity, PVR <20 mL",
    interpretation: "Normal detrusor contraction. No obstruction or dyssynergia. Adequate pelvic floor relaxation.",
    renal_risk: "Low — normal voiding physiology",
    management: "Reassure. Annual check if isolated finding. No intervention needed.",
    teaching: "Expected capacity (mL) = 30 + (age × 30) for school-age. Qmax should be ≥15 mL/s.",
  },
  {
    name: "Plateau Pattern",
    icon: "▬",
    iccs: "Obstructed voiding",
    normal: false,
    color: "border-amber-200 bg-amber-50",
    badge: "bg-amber-100 text-amber-800",
    description: "Flat plateau — constant flow without bell peak. Sustained low-to-moderate flow rate throughout voiding.",
    normal_values: "Low Qmax, prolonged flow time, usually low PVR if complete obstruction",
    interpretation: "Fixed or functional outlet obstruction. PUV? Stricture? Meatal stenosis? Posterior urethral narrowing?",
    renal_risk: "High — chronic obstruction causes hydronephrosis and renal damage",
    management: "UDS for Pdet-Qmax analysis. VCUG if PUV suspected. Cystoscopy. Uroflowmetry post-treatment.",
    teaching: "Abrams-Griffiths number = Pdet at Qmax – 2×Qmax. >40 = obstruction.",
  },
  {
    name: "Staccato Pattern",
    icon: "〰️",
    iccs: "Dysfunctional voiding",
    normal: false,
    color: "border-orange-200 bg-orange-50",
    badge: "bg-orange-100 text-orange-800",
    description: "Oscillating flow with multiple peaks — pelvic floor overactivity during voiding causing intermittent interruption.",
    normal_values: "Normal Qmax possible but irregular. Elevated PVR common.",
    interpretation: "Dysfunctional voiding (DV). Pelvic floor does not relax during micturition. Classic BBD pattern in neurologically normal children.",
    renal_risk: "Medium — high PVR + recurrent UTIs → VUR aggravation",
    management: "Biofeedback (EMG-guided). Timed voiding. Pelvic floor physiotherapy. Treat constipation. Alpha-blockers if severe.",
    teaching: "EMG simultaneous with uroflow trace reveals pelvic floor activity during voiding — confirmatory of DV.",
  },
  {
    name: "Interrupted Pattern",
    icon: "⚡",
    iccs: "Underactive detrusor / habitual voiding",
    normal: false,
    color: "border-blue-200 bg-blue-50",
    badge: "bg-blue-100 text-blue-800",
    description: "Intermittent flow with complete stops. Abdominal straining pattern. Patient starts and stops repeatedly.",
    normal_values: "Low Qmax, prolonged voiding time, high PVR, large voided volume",
    interpretation: "Detrusor underactivity (DUA) or habitual incomplete voiding. Abdominal pressure voider. High PVR likely.",
    renal_risk: "High — chronic urinary retention, overflow incontinence, recurrent UTIs",
    management: "Double voiding. CIC if PVR >30% bladder capacity consistently. Timed voiding every 2h. Cholinergic agents limited evidence.",
    teaching: "Distinguish from DV by timing: DV = pelvic floor active DURING flow. DUA = no flow despite trying.",
  },
  {
    name: "Tower Pattern",
    icon: "🗼",
    iccs: "Detrusor overactivity / urgency voiding",
    normal: false,
    color: "border-red-200 bg-red-50",
    badge: "bg-red-100 text-red-800",
    description: "Very high Qmax, very short flow time. Sudden explosive voiding. Often associated with urge incontinence.",
    normal_values: "Very high Qmax (>30 mL/s), very short flow time, near-normal PVR",
    interpretation: "Urgency voiding pattern. Detrusor overactivity (OAB). Giggle incontinence? Neurogenic overactivity?",
    renal_risk: "Medium — if untreated may lead to high intravesical pressure during storage",
    management: "Anticholinergics (oxybutynin/solifenacin). Mirabegron. Bladder training. Timed voiding. UDS if recurrent.",
    teaching: "Very high Qmax in tower pattern is due to strong urgency contraction — child waits too long then voids explosively.",
  },
  {
    name: "Fractionated Pattern",
    icon: "📉",
    iccs: "Multiple separate voidings",
    normal: false,
    color: "border-rose-200 bg-rose-50",
    badge: "bg-rose-100 text-rose-800",
    description: "Child voids, stops completely, then voids again in multiple fractions. Not straining — separate detrusor contractions.",
    normal_values: "Total voided volume may be normal but fractionated",
    interpretation: "Detrusor instability. Giggle incontinence variant. Urgency-driven habitual incomplete voiding.",
    renal_risk: "Low-Medium — chronic if untreated",
    management: "UDS to characterize. Anticholinergics if DO confirmed. Bladder training. Biofeedback.",
    teaching: "Key: is flow truly stopping (fractionated) vs oscillating (staccato)? Clinical observation + EMG clarifies.",
  },
];

const COMPARISON_DATA = [
  { param: "Flow Shape", normal: "Symmetric bell curve", abnormal: "Flat / irregular / explosive" },
  { param: "Qmax", normal: "≥15 mL/s (>150 mL voided)", abnormal: "<10 mL/s suggests obstruction or underactivity" },
  { param: "Flow Time", normal: "Proportional to volume", abnormal: "Very long (underactive) or very short (tower)" },
  { param: "PVR", normal: "<20 mL or <10% expected capacity", abnormal: ">30% expected capacity is significant" },
  { param: "Voiding Efficiency", normal: ">90% (PVR/total bladder)", abnormal: "<70% → incomplete emptying" },
  { param: "EMG during voiding", normal: "Silent / relaxed", abnormal: "Active = DSD or DV" },
];

const InputField = ({ label, value, onChange, unit, placeholder }) => (
  <div className="flex flex-col gap-1">
    <label className="text-xs font-semibold text-slate-600">{label}</label>
    <div className="flex items-center gap-1">
      <input
        className="flex-1 px-3 py-2 text-sm border-2 border-slate-200 rounded-lg focus:border-teal-400 outline-none bg-white"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder || "—"}
      />
      {unit && <span className="text-xs text-slate-500 bg-slate-100 px-2 py-2 rounded-lg border">{unit}</span>}
    </div>
  </div>
);

function PatternCard({ p, selected, onToggle }) {
  const [showDetail, setShowDetail] = useState(false);
  return (
    <Card
      className={`border-2 transition-all ${selected ? "ring-2 ring-teal-400 " + p.color : p.color}`}
    >
      <CardContent className="p-0">
        <button
          className="w-full flex items-center justify-between p-3"
          onClick={() => { onToggle(); setShowDetail(false); }}
        >
          <div className="flex items-center gap-2">
            <span className="text-xl">{p.icon}</span>
            <div className="text-left">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-sm text-slate-800">{p.name}</p>
                <Badge className={`text-xs ${p.badge}`}>{p.normal ? "Normal" : "Abnormal"}</Badge>
              </div>
              <p className="text-xs text-slate-500">{p.iccs}</p>
            </div>
          </div>
          {selected ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
        </button>
        {selected && (
          <div className="px-3 pb-3 space-y-2">
            <p className="text-xs text-slate-600">{p.description}</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-white rounded-lg p-2 border border-slate-100">
                <p className="font-semibold text-slate-600 mb-1">Typical Values</p>
                <p className="text-slate-500">{p.normal_values}</p>
              </div>
              <div className="bg-white rounded-lg p-2 border border-slate-100">
                <p className="font-semibold text-red-600 mb-1">Renal Risk</p>
                <p className="text-slate-500">{p.renal_risk}</p>
              </div>
            </div>
            <div className="bg-white rounded-lg p-2 border border-slate-100 text-xs">
              <p className="font-semibold text-blue-700">Interpretation</p>
              <p className="text-slate-600">{p.interpretation}</p>
            </div>
            <div className="bg-white rounded-lg p-2 border border-slate-100 text-xs">
              <p className="font-semibold text-green-700">Management</p>
              <p className="text-slate-600">{p.management}</p>
            </div>
            <div className="bg-indigo-50 rounded-lg p-2 border border-indigo-100 text-xs">
              <p className="font-semibold text-indigo-700 flex items-center gap-1">
                <BookOpen className="w-3 h-3" /> Teaching Pearl
              </p>
              <p className="text-slate-600">{p.teaching}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function UroflowAIAnalyzer() {
  const [selectedPattern, setSelectedPattern] = useState("");
  const [qmax, setQmax] = useState("");
  const [qavg, setQavg] = useState("");
  const [volume, setVolume] = useState("");
  const [flowTime, setFlowTime] = useState("");
  const [pvr, setPvr] = useState("");
  const [age, setAge] = useState("");
  const [sex, setSex] = useState("male");
  const [emg, setEmg] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [showComparison, setShowComparison] = useState(false);

  const expectedCapacity = age ? (30 + parseInt(age) * 30) : null;
  const voidingEfficiency = volume && pvr ? ((parseFloat(volume) / (parseFloat(volume) + parseFloat(pvr))) * 100).toFixed(1) : null;

  const handleAnalyze = async () => {
    if (!selectedPattern && !qmax) return;
    setLoading(true);
    try {
      const prompt = `You are a pediatric urodynamics expert (ICCS certified). Analyze this uroflowmetry result.

Patient: ${age} year old ${sex}
Expected bladder capacity: ${expectedCapacity ? expectedCapacity + " mL" : "not calculated"}
Flow Pattern (selected/observed): ${selectedPattern || "not specified"}
Qmax: ${qmax || "not provided"} mL/s
Qavg: ${qavg || "not provided"} mL/s
Voided Volume: ${volume || "not provided"} mL
Flow Time: ${flowTime || "not provided"} seconds
Post-void Residual (PVR): ${pvr || "not provided"} mL
Voiding Efficiency: ${voidingEfficiency ? voidingEfficiency + "%" : "not calculated"}
EMG findings: ${emg || "not described"}
Clinical context: ${notes || "none"}

Use ICCS 2016 terminology. Provide structured interpretation as JSON:
{
  "pattern_iccs_name": "official ICCS pattern name",
  "age_sex_nomogram": "interpretation relative to expected norms for age/sex",
  "qmax_interpretation": "above/below expected for age/voided volume — reference Liverpool nomogram",
  "pvr_significance": "clinical significance: <20mL=normal, 20-30%=borderline, >30%=significant",
  "voiding_efficiency": "assessment",
  "likely_diagnosis": ["primary diagnosis", "secondary if applicable", "tertiary differential"],
  "renal_risk": "low/medium/high with explanation",
  "upper_tract_risk": "explanation of risk to kidneys",
  "dysfunctional_voiding_score": "estimated 0-10",
  "emg_correlation": "how EMG findings correlate if provided",
  "management_suggestions": ["step 1", "step 2", "step 3"],
  "further_tests_needed": ["UDS if...","VCUG if...","biofeedback if..."],
  "urotherapy_recommendation": "specific urotherapy guidance",
  "clinical_summary": "3 sentence overall impression using ICCS terminology",
  "red_flags": ["urgent findings if any"],
  "teaching_pearl": "one key ICCS/pediatric urology teaching point",
  "guideline_reference": "ICCS/EAU/AAP reference applicable"
}`;
      const res = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            pattern_iccs_name: { type: "string" },
            age_sex_nomogram: { type: "string" },
            qmax_interpretation: { type: "string" },
            pvr_significance: { type: "string" },
            voiding_efficiency: { type: "string" },
            likely_diagnosis: { type: "array", items: { type: "string" } },
            renal_risk: { type: "string" },
            upper_tract_risk: { type: "string" },
            dysfunctional_voiding_score: { type: "string" },
            emg_correlation: { type: "string" },
            management_suggestions: { type: "array", items: { type: "string" } },
            further_tests_needed: { type: "array", items: { type: "string" } },
            urotherapy_recommendation: { type: "string" },
            clinical_summary: { type: "string" },
            red_flags: { type: "array", items: { type: "string" } },
            teaching_pearl: { type: "string" },
            guideline_reference: { type: "string" },
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
            <p className="text-teal-100 text-sm">ICCS 2016 patterns · Liverpool nomogram · Renal risk · EMG correlation</p>
          </div>
        </div>
      </div>

      {/* Normal vs Abnormal Comparison */}
      <Card className="border-slate-200">
        <CardContent className="p-0">
          <button
            className="w-full flex items-center justify-between p-3"
            onClick={() => setShowComparison(v => !v)}
          >
            <p className="text-sm font-semibold text-slate-700">Normal vs Abnormal Uroflow — Comparison Table</p>
            {showComparison ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {showComparison && (
            <div className="px-3 pb-3">
              {COMPARISON_DATA.map(row => (
                <div key={row.param} className="grid grid-cols-3 gap-2 text-xs py-1.5 border-b last:border-0">
                  <p className="font-semibold text-slate-700">{row.param}</p>
                  <p className="text-green-700 bg-green-50 rounded px-1">{row.normal}</p>
                  <p className="text-red-700 bg-red-50 rounded px-1">{row.abnormal}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pattern cards — click to select + expand */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Select Observed Pattern (ICCS Library)</p>
        {FLOW_PATTERNS.map(p => (
          <PatternCard
            key={p.name}
            p={p}
            selected={selectedPattern === p.name}
            onToggle={() => setSelectedPattern(prev => prev === p.name ? "" : p.name)}
          />
        ))}
      </div>

      {/* Input panel */}
      <Card className="border-slate-200">
        <CardContent className="p-4 space-y-3">
          <p className="font-semibold text-slate-700 text-sm">Enter Uroflow Parameters</p>
          <div className="grid grid-cols-2 gap-3">
            <InputField label="Age" value={age} onChange={setAge} unit="yrs" />
            <div>
              <label className="text-xs font-semibold text-slate-600">Sex</label>
              <select className="mt-1 w-full px-3 py-2 text-sm border-2 border-slate-200 rounded-lg bg-white" value={sex} onChange={e => setSex(e.target.value)}>
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

          {expectedCapacity && (
            <div className="flex flex-wrap gap-3 text-xs bg-slate-50 rounded-lg p-2 border">
              <span className="text-slate-600">Expected capacity: <strong>{expectedCapacity} mL</strong></span>
              {voidingEfficiency && <span className={parseFloat(voidingEfficiency) < 70 ? "text-red-600 font-semibold" : "text-green-600"}>Voiding efficiency: {voidingEfficiency}%</span>}
              {volume && expectedCapacity && <span className={parseFloat(volume) < expectedCapacity * 0.65 ? "text-amber-600" : "text-green-600"}>Vol: {(parseFloat(volume)/expectedCapacity*100).toFixed(0)}% expected</span>}
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-slate-600">EMG Findings (if available)</label>
            <select className="mt-1 w-full px-3 py-2 text-sm border-2 border-slate-200 rounded-lg bg-white" value={emg} onChange={e => setEmg(e.target.value)}>
              <option value="">Not recorded</option>
              <option value="Silent during voiding (normal)">Silent during voiding (normal)</option>
              <option value="Increased/active during voiding (DV/DSD)">Increased/active during voiding (DV/DSD)</option>
              <option value="Staccato pelvic floor activity">Staccato pelvic floor activity</option>
              <option value="Absent (denervation)">Absent (denervation)</option>
            </select>
          </div>
          <textarea
            className="w-full px-3 py-2 text-sm border-2 border-slate-200 rounded-lg bg-white outline-none focus:border-teal-400 resize-none"
            rows={2}
            placeholder="Clinical context: diagnosis, symptoms (urgency, wetting, UTI history, constipation)..."
            value={notes}
            onChange={e => setNotes(e.target.value)}
          />
          <Button
            className="w-full bg-teal-600 hover:bg-teal-700 text-white"
            onClick={handleAnalyze}
            disabled={loading || (!selectedPattern && !qmax)}
          >
            {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Analyzing...</> : <><Brain className="w-4 h-4 mr-2" />AI Interpret Uroflow (ICCS)</>}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {result && !result.error && (
        <div className="space-y-3">
          <Card className="border-teal-300 bg-gradient-to-br from-teal-50 to-cyan-50">
            <CardContent className="p-4">
              <p className="text-xs text-slate-500 mb-1">ICCS Pattern / Diagnosis</p>
              <p className="text-lg font-bold text-teal-800">{result.pattern_iccs_name}</p>
              <p className="text-sm text-slate-700 mt-2 leading-relaxed">{result.clinical_summary}</p>
            </CardContent>
          </Card>

          {result.red_flags?.length > 0 && (
            <Card className="border-red-300 bg-red-50">
              <CardContent className="p-3">
                <p className="font-bold text-red-800 text-sm flex items-center gap-1 mb-2">
                  <AlertTriangle className="w-4 h-4" /> Red Flags
                </p>
                <div className="flex flex-wrap gap-1">
                  {result.red_flags.map((f, i) => (
                    <span key={i} className="text-xs bg-white text-red-600 border border-red-200 px-2 py-0.5 rounded-full">{f}</span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Renal Risk", value: result.renal_risk, color: "bg-red-50 border-red-200" },
              { label: "DV Score", value: result.dysfunctional_voiding_score, color: "bg-amber-50 border-amber-200" },
              { label: "Qmax", value: result.qmax_interpretation, color: "bg-blue-50 border-blue-200" },
              { label: "PVR", value: result.pvr_significance, color: "bg-teal-50 border-teal-200" },
            ].map(item => (
              <Card key={item.label} className={`border ${item.color}`}>
                <CardContent className="p-2.5">
                  <p className="text-xs font-bold text-slate-500 mb-1">{item.label}</p>
                  <p className="text-xs text-slate-700">{item.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="border-slate-200">
            <CardContent className="p-3">
              <p className="text-xs font-bold text-slate-600 mb-2">Likely Diagnoses</p>
              {result.likely_diagnosis?.map((d, i) => (
                <div key={i} className="flex items-start gap-2 mb-1.5">
                  <span className="w-4 h-4 bg-teal-100 text-teal-700 rounded-full text-xs flex items-center justify-center flex-shrink-0 font-bold">{i + 1}</span>
                  <p className="text-xs text-slate-700">{d}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-3">
              <p className="text-xs font-bold text-blue-700 mb-2">Management Plan</p>
              {result.management_suggestions?.map((m, i) => (
                <p key={i} className="text-xs text-slate-700 mb-1">Step {i + 1}: {m}</p>
              ))}
              {result.urotherapy_recommendation && (
                <div className="mt-2 bg-white rounded-lg p-2 border border-blue-100">
                  <p className="text-xs font-semibold text-blue-700">Urotherapy</p>
                  <p className="text-xs text-slate-700">{result.urotherapy_recommendation}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardContent className="p-3">
              <p className="text-xs font-bold text-slate-600 mb-2">Further Tests Needed</p>
              {result.further_tests_needed?.map((t, i) => (
                <p key={i} className="text-xs text-slate-700">• {t}</p>
              ))}
            </CardContent>
          </Card>

          {result.teaching_pearl && (
            <Card className="border-indigo-200 bg-indigo-50">
              <CardContent className="p-3">
                <p className="text-xs font-bold text-indigo-700 flex items-center gap-1 mb-1">
                  <BookOpen className="w-3.5 h-3.5" /> Teaching Pearl
                </p>
                <p className="text-xs text-slate-700">{result.teaching_pearl}</p>
                {result.guideline_reference && (
                  <p className="text-xs text-slate-500 mt-1 italic">📖 {result.guideline_reference}</p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}