import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { base44 } from "@/api/base44Client";
import { Activity, Upload, Loader2, AlertTriangle, CheckCircle, Info, ChevronDown, ChevronRight } from "lucide-react";

const UROFLOW_PATTERNS = [
  {
    name: "Normal Bell-Shaped Curve",
    color: "bg-green-50 border-green-300",
    badge: "bg-green-100 text-green-800",
    description: "Smooth bell-shaped flow curve, Qmax appropriate for age/voided volume",
    parameters: "Qmax >15 mL/s (adult equivalent), smooth curve, VV appropriate, PVR <20 mL",
    significance: "Normal voiding. No intervention needed."
  },
  {
    name: "Interrupted/Staccato Pattern",
    color: "bg-amber-50 border-amber-300",
    badge: "bg-amber-100 text-amber-800",
    description: "Multiple spikes or interrupted flow, high Qmax with interruptions",
    parameters: "Multiple peaks, flow time > voiding time, straining pattern",
    significance: "Dysfunctional voiding — detrusor-sphincter dyssynergia or overactive bladder with dysfunctional voiding"
  },
  {
    name: "Plateau/Box-Shaped Pattern",
    color: "bg-red-50 border-red-300",
    badge: "bg-red-100 text-red-800",
    description: "Flat-topped curve, reduced Qmax, prolonged voiding",
    parameters: "Qmax <10 mL/s, plateau shape, reduced flow rate throughout",
    significance: "Bladder outlet obstruction — PUV in boys, urethral stenosis, dysfunctional voiding"
  },
  {
    name: "Continuous Low Flow",
    color: "bg-orange-50 border-orange-300",
    badge: "bg-orange-100 text-orange-800",
    description: "Continuous but low amplitude flow, no definite peak",
    parameters: "Low Qmax, prolonged voiding time, smooth but low curve",
    significance: "Underactive detrusor, neurogenic bladder, or severe obstruction"
  },
  {
    name: "High-Flow Rapid Void",
    color: "bg-blue-50 border-blue-300",
    badge: "bg-blue-100 text-blue-800",
    description: "Very rapid voiding, sharp spike, short voiding time",
    parameters: "Very high Qmax, short voiding time, may indicate overactive detrusor",
    significance: "Detrusor overactivity or small bladder capacity. May be associated with urgency incontinence."
  },
  {
    name: "Straining Pattern",
    color: "bg-purple-50 border-purple-300",
    badge: "bg-purple-100 text-purple-800",
    description: "Irregular spikes with abdominal straining, poor flow between strains",
    parameters: "Irregular flow, multiple sharp peaks from straining, poor baseline flow",
    significance: "Acontractile detrusor or severe outlet obstruction. Requires UDS."
  },
];

export default function UroflowAnalyzer() {
  const [inputMode, setInputMode] = useState("manual");
  const [file, setFile] = useState(null);
  const [manualText, setManualText] = useState("");
  const [patientAge, setPatientAge] = useState("");
  const [patientGender, setPatientGender] = useState("Male");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [patternTab, setPatternTab] = useState(null);

  const handleAnalyze = async () => {
    if (!manualText && !file) return;
    setLoading(true);
    try {
      let fileUrl = null;
      if (file) {
        const uploadRes = await base44.integrations.Core.UploadFile({ file });
        fileUrl = uploadRes.file_url;
      }

      const prompt = `You are an expert pediatric urologist and urodynamics specialist interpreting a uroflowmetry study.

Patient: ${patientAge || "Unknown"} years, ${patientGender}
${file ? "Analyze the uploaded uroflowmetry tracing/report image." : `Uroflowmetry Data:\n${manualText}`}

IMPORTANT RULES:
- DO NOT default to "normal" without careful analysis
- Apply Liverpool normograms for pediatric Qmax reference (Qmax expected = voided volume^0.5 × 1.5 for children)
- Assess flow pattern shape carefully (bell / plateau / staccato / interrupted / tower)
- PVR >20% of voided volume in children is significant
- Correlate with bladder diary if available
- Be specific about whether further investigation (UDS) is indicated

Provide a COMPREHENSIVE CLINICAL UROFLOWMETRY REPORT:

1. FLOW_PATTERN: Identify the pattern type (bell/plateau/staccato/interrupted/tower/other)
2. KEY_PARAMETERS: Qmax, average flow rate, voiding time, voided volume, flow time, PVR if reported
3. PATTERN_CLASSIFICATION: Normal / Dysfunctional voiding / Obstruction / Underactive detrusor / Overactive
4. CLINICAL_INTERPRETATION: 2-3 sentence clinical interpretation
5. LIVERPOOL_NOMOGRAM: Is Qmax above or below expected for voided volume? Calculate Liverpool score if possible.
6. PROBABLE_DIAGNOSIS: Most likely diagnosis based on pattern
7. DIFFERENTIALS: Other diagnoses to consider
8. RECOMMENDED_INVESTIGATIONS: UDS, post-void residual, cystoscopy, imaging?
9. MANAGEMENT_SUGGESTIONS: PFMT, biofeedback, alarm therapy, anticholinergics, clean intermittent catheterization?
10. RED_FLAGS: Any urgent findings
11. TEACHING_POINTS: Educational points about this pattern

Be specific and clinical. Use pediatric reference ranges. Mention if formal UDS is indicated.`;

      const res = await base44.integrations.Core.InvokeLLM({
        model: "claude_sonnet_4_6",
        prompt,
        file_urls: fileUrl ? [fileUrl] : undefined,
        response_json_schema: {
          type: "object",
          properties: {
            flow_pattern: { type: "string" },
            key_parameters: { type: "object", additionalProperties: true },
            pattern_classification: { type: "string" },
            clinical_interpretation: { type: "string" },
            liverpool_nomogram: { type: "string" },
            probable_diagnosis: { type: "string" },
            differentials: { type: "array", items: { type: "string" } },
            recommended_investigations: { type: "array", items: { type: "string" } },
            management_suggestions: { type: "array", items: { type: "string" } },
            red_flags: { type: "array", items: { type: "string" } },
            teaching_points: { type: "array", items: { type: "string" } },
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
      {/* Pattern Reference Cards */}
      <Card className="border-2 border-teal-200 bg-teal-50">
        <CardContent className="p-4">
          <p className="text-xs font-bold text-teal-800 mb-3 flex items-center gap-2">
            <Activity className="w-4 h-4" /> Uroflow Pattern Recognition Reference
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {UROFLOW_PATTERNS.map((p, i) => (
              <div key={i} className={`border-2 rounded-lg overflow-hidden ${p.color}`}>
                <button className="w-full flex items-center justify-between p-2.5" onClick={() => setPatternTab(patternTab === i ? null : i)}>
                  <Badge className={`text-xs ${p.badge}`}>{p.name}</Badge>
                  {patternTab === i ? <ChevronDown className="w-3 h-3 text-slate-500" /> : <ChevronRight className="w-3 h-3 text-slate-500" />}
                </button>
                {patternTab === i && (
                  <div className="px-3 pb-3 space-y-1.5">
                    <p className="text-xs text-slate-600 italic">{p.description}</p>
                    <p className="text-xs"><span className="font-semibold">Parameters:</span> {p.parameters}</p>
                    <p className="text-xs font-medium text-slate-700">⟹ {p.significance}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Input */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Activity className="w-4 h-4 text-teal-600" /> Uroflowmetry AI Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Patient Age (years)</label>
              <input type="number" value={patientAge} onChange={e => setPatientAge(e.target.value)}
                className="w-full border border-slate-200 rounded-md px-2 h-8 text-xs bg-white" placeholder="e.g. 8" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Gender</label>
              <select value={patientGender} onChange={e => setPatientGender(e.target.value)}
                className="w-full border border-slate-200 rounded-md px-2 h-8 text-xs bg-white">
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={() => setInputMode("manual")} className={`flex-1 py-2 rounded-lg text-xs font-semibold border-2 transition-all ${inputMode === "manual" ? "bg-teal-600 text-white border-teal-600" : "bg-white border-slate-200 text-slate-600"}`}>
              Type/Paste Values
            </button>
            <button onClick={() => setInputMode("ocr")} className={`flex-1 py-2 rounded-lg text-xs font-semibold border-2 transition-all ${inputMode === "ocr" ? "bg-teal-600 text-white border-teal-600" : "bg-white border-slate-200 text-slate-600"}`}>
              <Upload className="w-3.5 h-3.5 inline mr-1" /> Upload Tracing
            </button>
          </div>

          {inputMode === "manual" ? (
            <Textarea value={manualText} onChange={e => setManualText(e.target.value)}
              placeholder={`Paste uroflowmetry report values here...
Example:
Voided Volume: 180 mL
Qmax: 8.2 mL/s
Average Flow: 5.1 mL/s
Voiding Time: 42 sec
Flow Time: 35 sec
Time to Qmax: 18 sec
PVR: 25 mL
Pattern: Plateau/interrupted curve
Sensation: First desire at 120 mL, strong desire at 180 mL`}
              className="h-40 text-xs font-mono" />
          ) : (
            <div className="border-2 border-dashed border-teal-200 rounded-xl p-6 text-center bg-teal-50">
              <Upload className="w-8 h-8 text-teal-400 mx-auto mb-2" />
              <p className="text-sm text-teal-700 font-medium mb-2">Upload uroflowmetry tracing or report</p>
              <input type="file" accept="image/*,.pdf" onChange={e => setFile(e.target.files[0])} className="hidden" id="uroflow-upload" />
              <label htmlFor="uroflow-upload" className="cursor-pointer inline-block bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-teal-700 transition-colors">
                Choose File
              </label>
              {file && <p className="text-xs text-teal-700 mt-2 font-medium">✓ {file.name}</p>}
            </div>
          )}

          <Button onClick={handleAnalyze} disabled={loading || (!manualText && !file)}
            className="w-full bg-teal-600 hover:bg-teal-700">
            {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Analyzing Uroflowmetry...</> : <><Activity className="w-4 h-4 mr-2" />Analyze Uroflowmetry</>}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <div className="space-y-3">
          <Card className="border-2 border-teal-300 bg-gradient-to-r from-teal-50 to-cyan-50">
            <CardContent className="p-4">
              <p className="text-xs text-slate-500 mb-1">Flow Pattern</p>
              <p className="text-xl font-bold text-teal-800">{result.flow_pattern}</p>
              <p className="text-sm text-slate-700 mt-2">{result.clinical_interpretation}</p>
              <div className="mt-2">
                <Badge className="bg-teal-600 text-white">{result.pattern_classification}</Badge>
              </div>
            </CardContent>
          </Card>

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

          {result.key_parameters && Object.keys(result.key_parameters).length > 0 && (
            <Card>
              <CardContent className="p-4">
                <p className="font-bold text-sm text-slate-700 mb-2">📊 Key Parameters</p>
                {Object.entries(result.key_parameters).map(([k, v]) => (
                  <div key={k} className="flex justify-between text-xs border-b py-1 last:border-0">
                    <span className="text-slate-600 capitalize">{k.replace(/_/g, ' ')}</span>
                    <span className="font-semibold text-slate-800">{String(v)}</span>
                  </div>
                ))}
                {result.liverpool_nomogram && (
                  <div className="mt-2 p-2 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-xs font-semibold text-blue-700">Liverpool Nomogram</p>
                    <p className="text-xs text-blue-800 mt-0.5">{result.liverpool_nomogram}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <div className="grid sm:grid-cols-2 gap-3">
            <Card>
              <CardContent className="p-4">
                <p className="font-bold text-sm text-slate-700 mb-2">🔍 Probable Diagnosis</p>
                <p className="text-sm font-semibold text-teal-800">{result.probable_diagnosis}</p>
                {result.differentials?.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-slate-500 mb-1">Differentials:</p>
                    {result.differentials.map((d, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-slate-700 mb-1">
                        <span className="w-4 h-4 rounded-full bg-teal-100 text-teal-700 text-center flex-shrink-0 font-bold">{i + 1}</span>
                        {d}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="font-bold text-sm text-slate-700 mb-2">🔬 Investigations Needed</p>
                {(result.recommended_investigations || []).map((t, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-slate-700 mb-1">
                    <CheckCircle className="w-3 h-3 text-teal-600 flex-shrink-0" /> {t}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {result.management_suggestions?.length > 0 && (
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4">
                <p className="font-bold text-green-800 text-sm mb-2">✅ Management Suggestions</p>
                {result.management_suggestions.map((m, i) => (
                  <div key={i} className="text-xs text-green-800 mb-1">→ {m}</div>
                ))}
              </CardContent>
            </Card>
          )}

          {result.teaching_points?.length > 0 && (
            <Card className="bg-indigo-50 border-indigo-200">
              <CardContent className="p-4">
                <p className="font-bold text-indigo-800 text-sm mb-2">📚 Teaching Points</p>
                {result.teaching_points.map((t, i) => (
                  <div key={i} className="text-xs text-indigo-800 mb-1">• {t}</div>
                ))}
              </CardContent>
            </Card>
          )}

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-xs text-amber-800">
              <strong>⚠️ Disclaimer:</strong> AI uroflowmetry analysis is for educational and clinical decision support only. Formal urodynamic studies (UDS) should be performed for definitive diagnosis. Clinical correlation with voiding diary, PVR measurements, and specialist review is mandatory.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}