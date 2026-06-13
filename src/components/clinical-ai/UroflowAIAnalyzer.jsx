/**
 * UroflowAIAnalyzer — Uroflowmetry curve + voiding pattern AI interpretation
 * Uses claude_sonnet_4_6 for high-quality clinical analysis.
 */
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { base44 } from "@/api/base44Client";
import {
  Wind, Upload, Loader2, AlertTriangle, CheckCircle,
  Activity, Info, ChevronDown, ChevronRight
} from "lucide-react";

const FLOW_PATTERNS = [
  {
    name: "Normal Bell Curve",
    color: "border-green-300 bg-green-50",
    badge: "bg-green-100 text-green-800",
    desc: "Smooth bell-shaped curve, Qmax >15 mL/s, no fractionation",
    significance: "Normal voiding. No further workup needed if no symptoms.",
  },
  {
    name: "Tower / Staccato Pattern",
    color: "border-amber-300 bg-amber-50",
    badge: "bg-amber-100 text-amber-800",
    desc: "Rapid spike, plateau or fractionated curve, Qmax high with interrupted flow",
    significance: "Dysfunctional voiding — overactive detrusor or dyssynergia. Seen in constipation, ADHD.",
  },
  {
    name: "Plateau Pattern",
    color: "border-orange-300 bg-orange-50",
    badge: "bg-orange-100 text-orange-800",
    desc: "Flat, prolonged curve; Qmax reduced; voiding time prolonged",
    significance: "Bladder outlet obstruction — PUV in boys, urethral stenosis, constipation.",
  },
  {
    name: "Interrupted / Fractionated",
    color: "border-red-300 bg-red-50",
    badge: "bg-red-100 text-red-800",
    desc: "Multiple peaks, stops and starts during voiding, low Qmax",
    significance: "Dysfunctional voiding — detrusor underactivity or neurogenic bladder. Check post-void residual.",
  },
  {
    name: "Straining Pattern",
    color: "border-rose-300 bg-rose-50",
    badge: "bg-rose-100 text-rose-800",
    desc: "Low flow with abdominal straining artefact peaks, prolonged",
    significance: "Detrusor underactivity. Rule out neurogenic cause — check lumbosacral MRI.",
  },
];

const REFERENCE_VALUES = [
  { param: "Qmax (Maximum Flow Rate)", normal: ">15 mL/s (adults/older children)", note: "Age and voided volume dependent" },
  { param: "Voided Volume", normal: "Expected bladder capacity = (age+1) × 30 mL (up to 300–400 mL)", note: "Interpret Qmax only if >50% expected capacity" },
  { param: "Voiding Time", normal: "<20–30 seconds", note: "Prolonged in obstruction or weak detrusor" },
  { param: "Post-Void Residual (PVR)", normal: "<20 mL or <10% voided volume", note: "Measured by USS immediately post-void" },
  { param: "Average Flow Rate", normal: "~Qmax/2", note: "Low if detrusor weak" },
];

export default function UroflowAIAnalyzer() {
  const [inputMode, setInputMode] = useState("text");
  const [file, setFile] = useState(null);
  const [textInput, setTextInput] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("Male");
  const [symptoms, setSymptoms] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refOpen, setRefOpen] = useState(null);

  const handleAnalyze = async () => {
    if (!textInput && !file) return;
    setLoading(true);
    setResult(null);
    try {
      let fileUrl = null;
      if (file) {
        const up = await base44.integrations.Core.UploadFile({ file });
        fileUrl = up.file_url;
      }

      const prompt = `You are a highly experienced pediatric urologist and urodynamics specialist performing a comprehensive clinical interpretation of a uroflowmetry study.

Patient: ${age ? `${age} years old` : "Age not specified"}, ${gender}
Symptoms: ${symptoms || "Not specified"}
${textInput ? `\nUroflowmetry Report / Values:\n${textInput}` : ""}
${fileUrl ? "\nUroflowmetry image/curve has been uploaded — analyse the curve shape, pattern, and numerical values carefully." : ""}

Provide an expert-level clinical analysis structured as follows:

1. FLOW_PATTERN: Identify the uroflow curve pattern (normal bell/tower/plateau/interrupted/fractionated/straining). Describe the curve morphology.
2. QMAX_INTERPRETATION: Comment on Qmax relative to age and voided volume. Is it adequate, borderline, or reduced?
3. VOIDED_VOLUME: Is the voided volume adequate for interpretation? (must be >50% expected bladder capacity)
4. VOIDING_TIME: Normal or prolonged? Significance?
5. BBDSS_INDICATORS: List any BBDSS (Bladder and Bowel Dysfunction Scoring System) indicators present (urgency, frequency, daytime incontinence, nocturia, constipation signs)
6. CLINICAL_DIAGNOSIS: Most likely clinical diagnosis based on uroflow pattern. Include voiding dysfunction type if applicable.
7. DIFFERENTIALS: List 3–5 differential diagnoses with confidence estimates and brief reasoning.
8. POST_VOID_RESIDUAL: Expected PVR findings for this pattern; if known, interpret.
9. FURTHER_INVESTIGATIONS: Recommended next investigations (e.g., USS bladder post-void, urodynamics, lumbosacral MRI, VCUG, bowel history).
10. MANAGEMENT_APPROACH: Evidence-based management approach (timed voiding, pelvic floor physiotherapy, biofeedback, anticholinergics, CIC, neurological referral, urological referral etc.)
11. RED_FLAGS: Any findings requiring urgent escalation (persistent obstruction, neurogenic bladder signs, renal involvement).
12. PARENT_EXPLANATION: A brief, jargon-free explanation suitable for parents (2–3 sentences).

Be specific, evidence-based, and clinically actionable. Use ICCS (International Children's Continence Society) terminology. This is a specialist clinical tool — provide detailed, high-quality interpretation.`;

      const res = await base44.integrations.Core.InvokeLLM({
        prompt,
        file_urls: fileUrl ? [fileUrl] : undefined,
        model: "claude_sonnet_4_6",
        response_json_schema: {
          type: "object",
          properties: {
            flow_pattern: { type: "string" },
            qmax_interpretation: { type: "string" },
            voided_volume: { type: "string" },
            voiding_time: { type: "string" },
            bbdss_indicators: { type: "array", items: { type: "string" } },
            clinical_diagnosis: { type: "string" },
            differentials: { type: "array", items: { type: "string" } },
            post_void_residual: { type: "string" },
            further_investigations: { type: "array", items: { type: "string" } },
            management_approach: { type: "array", items: { type: "string" } },
            red_flags: { type: "array", items: { type: "string" } },
            parent_explanation: { type: "string" },
          }
        }
      });
      setResult(res);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Reference patterns */}
      <Card className="border-2 border-cyan-200 bg-cyan-50">
        <CardContent className="p-4">
          <p className="text-xs font-bold text-cyan-800 mb-3 flex items-center gap-2">
            <Wind className="w-4 h-4" /> Uroflow Pattern Reference (ICCS)
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {FLOW_PATTERNS.map((p, i) => (
              <div key={i} className={`border-2 rounded-lg overflow-hidden ${p.color}`}>
                <button className="w-full flex items-center justify-between p-2.5" onClick={() => setRefOpen(refOpen === i ? null : i)}>
                  <Badge className={`text-xs ${p.badge}`}>{p.name}</Badge>
                  {refOpen === i ? <ChevronDown className="w-3 h-3 text-slate-500" /> : <ChevronRight className="w-3 h-3 text-slate-500" />}
                </button>
                {refOpen === i && (
                  <div className="px-3 pb-3 space-y-1">
                    <p className="text-xs text-slate-600 italic">{p.desc}</p>
                    <p className="text-xs font-medium text-slate-700">⟹ {p.significance}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Reference values */}
          <div className="mt-3 bg-white rounded-lg border border-cyan-200 overflow-hidden">
            <p className="text-xs font-bold text-cyan-800 px-3 py-2 bg-cyan-100">Reference Values</p>
            {REFERENCE_VALUES.map((r, i) => (
              <div key={i} className="flex flex-col sm:flex-row sm:items-start gap-1 px-3 py-2 border-t border-cyan-100 text-xs">
                <span className="font-semibold text-slate-700 sm:w-48 flex-shrink-0">{r.param}</span>
                <span className="text-slate-600">{r.normal}<span className="text-slate-400 ml-1">({r.note})</span></span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Input */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <p className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <Wind className="w-4 h-4 text-cyan-600" /> Analyze Uroflowmetry Study
          </p>

          <div className="grid sm:grid-cols-3 gap-2">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Age (years)</label>
              <input type="number" value={age} onChange={e => setAge(e.target.value)}
                className="w-full border border-slate-200 rounded-md px-2 py-1.5 text-xs h-8" placeholder="e.g. 7" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Gender</label>
              <select value={gender} onChange={e => setGender(e.target.value)}
                className="w-full border border-slate-200 rounded-md px-2 py-1.5 text-xs h-8 bg-white">
                <option>Male</option>
                <option>Female</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Presenting Symptoms</label>
            <input value={symptoms} onChange={e => setSymptoms(e.target.value)}
              className="w-full border border-slate-200 rounded-md px-2 py-1.5 text-xs h-8"
              placeholder="e.g. daytime incontinence, urgency, recurrent UTI, difficulty voiding" />
          </div>

          <div className="flex gap-2">
            <button onClick={() => setInputMode("text")} className={`flex-1 py-2 rounded-lg text-xs font-semibold border-2 transition-all ${inputMode === "text" ? "bg-cyan-600 text-white border-cyan-600" : "bg-white border-slate-200 text-slate-600"}`}>
              <Wind className="w-3.5 h-3.5 inline mr-1" /> Enter Values
            </button>
            <button onClick={() => setInputMode("upload")} className={`flex-1 py-2 rounded-lg text-xs font-semibold border-2 transition-all ${inputMode === "upload" ? "bg-cyan-600 text-white border-cyan-600" : "bg-white border-slate-200 text-slate-600"}`}>
              <Upload className="w-3.5 h-3.5 inline mr-1" /> Upload Curve Image
            </button>
          </div>

          {inputMode === "text" ? (
            <Textarea value={textInput} onChange={e => setTextInput(e.target.value)}
              placeholder="Paste uroflowmetry report or enter values:
Example:
Voided Volume: 180 mL (Expected: 240 mL)
Qmax: 8.2 mL/s
Average Flow Rate: 4.1 mL/s
Voiding Time: 44 seconds
Flow pattern: Interrupted/fractionated
Post-void residual (USS): 45 mL
Comments: Multiple flow interruptions, straining noted"
              className="h-32 text-xs font-mono" />
          ) : (
            <div className="border-2 border-dashed border-cyan-200 rounded-xl p-6 text-center bg-cyan-50">
              <Upload className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
              <p className="text-sm text-cyan-700 font-medium mb-2">Upload uroflow curve/report image</p>
              <input type="file" accept="image/*,.pdf" onChange={e => setFile(e.target.files[0])} className="hidden" id="uroflow-upload" />
              <label htmlFor="uroflow-upload" className="cursor-pointer inline-block bg-cyan-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-cyan-700 transition-colors">
                Choose File
              </label>
              {file && <p className="text-xs text-cyan-700 mt-2 font-medium">✓ {file.name}</p>}
            </div>
          )}

          <Button onClick={handleAnalyze} disabled={loading || (!textInput && !file)}
            className="w-full bg-cyan-700 hover:bg-cyan-800">
            {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyzing with AI...</> : <><Wind className="w-4 h-4 mr-2" /> Analyze Uroflowmetry</>}
          </Button>

          <Alert className="py-2 bg-amber-50 border-amber-200">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <AlertDescription className="text-amber-800 text-xs">
              AI interpretation is a clinical decision-support tool. Findings must be correlated with patient history, physical examination, and urologist review. Not a substitute for formal urodynamic assessment.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <div className="space-y-3">
          {/* Diagnosis + pattern */}
          <Card className="border-2 border-cyan-300 bg-gradient-to-r from-cyan-50 to-blue-50">
            <CardContent className="p-4">
              <p className="text-xs text-slate-500 mb-1">Uroflow Pattern Identified</p>
              <p className="text-xl font-bold text-cyan-800">{result.flow_pattern}</p>
              {result.clinical_diagnosis && (
                <div className="mt-2 p-2 bg-white rounded-lg border border-cyan-200">
                  <p className="text-xs font-semibold text-cyan-700">Clinical Diagnosis</p>
                  <p className="text-sm font-bold text-slate-800 mt-0.5">{result.clinical_diagnosis}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Red flags */}
          {result.red_flags?.length > 0 && (
            <Card className="border-2 border-red-300 bg-red-50">
              <CardContent className="p-4">
                <p className="font-bold text-red-800 text-sm mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" /> Red Flags
                </p>
                {result.red_flags.map((f, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-red-800 mb-1">
                    <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" /> {f}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Flow metrics */}
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { label: "Qmax", value: result.qmax_interpretation },
              { label: "Voided Volume", value: result.voided_volume },
              { label: "Voiding Time", value: result.voiding_time },
              { label: "Post-Void Residual", value: result.post_void_residual },
            ].filter(i => i.value).map((item, i) => (
              <div key={i} className="bg-white rounded-lg p-3 border border-slate-200">
                <p className="text-xs font-bold text-slate-500 uppercase">{item.label}</p>
                <p className="text-sm text-slate-800 mt-1">{item.value}</p>
              </div>
            ))}
          </div>

          {/* BBDSS indicators */}
          {result.bbdss_indicators?.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <p className="font-bold text-sm text-slate-700 mb-2">BBDSS Indicators</p>
                <div className="flex flex-wrap gap-1.5">
                  {result.bbdss_indicators.map((b, i) => (
                    <Badge key={i} className="bg-amber-100 text-amber-800 text-xs">{b}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Differentials + investigations */}
          <div className="grid sm:grid-cols-2 gap-3">
            <Card>
              <CardContent className="p-4">
                <p className="font-bold text-sm text-slate-700 mb-2">🔍 Differentials</p>
                {(result.differentials || []).map((d, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-slate-700 mb-1.5">
                    <span className="w-4 h-4 rounded-full bg-cyan-100 text-cyan-700 text-center flex-shrink-0 font-bold text-xs flex items-center justify-center">{i + 1}</span>
                    {d}
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="font-bold text-sm text-slate-700 mb-2">🧪 Further Investigations</p>
                {(result.further_investigations || []).map((t, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-slate-700 mb-1">
                    <CheckCircle className="w-3 h-3 text-cyan-600 flex-shrink-0" /> {t}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Management */}
          {result.management_approach?.length > 0 && (
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4">
                <p className="font-bold text-green-800 text-sm mb-2">Management Approach</p>
                {result.management_approach.map((m, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-green-800 mb-1.5">
                    <CheckCircle className="w-3 h-3 mt-0.5 text-green-600 flex-shrink-0" /> {m}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Parent explanation */}
          {result.parent_explanation && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <p className="font-bold text-blue-800 text-sm mb-1 flex items-center gap-2">
                  <Info className="w-4 h-4" /> For Parents
                </p>
                <p className="text-sm text-blue-900">{result.parent_explanation}</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}