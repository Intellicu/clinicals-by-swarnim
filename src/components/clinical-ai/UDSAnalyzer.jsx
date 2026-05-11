import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { base44 } from "@/api/base44Client";
import {
  Microscope, Upload, Loader2, AlertTriangle, CheckCircle,
  FlaskConical, Info, ChevronDown, ChevronRight, Droplet, TestTube
} from "lucide-react";

const UDS_PATTERNS = [
  {
    name: "Nephrotic Syndrome",
    color: "bg-blue-50 border-blue-300",
    badge: "bg-blue-100 text-blue-800",
    description: "Heavy proteinuria (3-4+), no significant hematuria, hyaline casts",
    dipstick: "Protein: 3-4+ | Blood: Neg/trace | SG: High | Glucose: Neg",
    microscopy: "Oval fat bodies, fatty casts, hyaline casts",
    significance: "Suggests podocyte injury — MCD, FSGS, MN"
  },
  {
    name: "Nephritic Syndrome",
    color: "bg-red-50 border-red-300",
    badge: "bg-red-100 text-red-800",
    description: "RBC casts, hematuria, proteinuria, reduced GFR",
    dipstick: "Blood: 3+ | Protein: 2-3+ | SG: Low-normal | RBC morphology: Dysmorphic",
    microscopy: "RBC casts (pathognomonic of GN), dysmorphic RBCs (>5% acanthocytes)",
    significance: "Glomerulonephritis — IgAN, PSGN, Lupus, ANCA vasculitis"
  },
  {
    name: "UTI Pattern",
    color: "bg-amber-50 border-amber-300",
    badge: "bg-amber-100 text-amber-800",
    description: "Pyuria, bacteriuria, positive nitrites and leukocyte esterase",
    dipstick: "LE: + | Nitrite: + | Protein: 1-2+ | Blood: ± | pH: Alkaline",
    microscopy: "WBCs >10/HPF, bacteria, WBC clumps",
    significance: "Bacterial UTI — culture essential; consider VUR/structural anomaly in recurrent UTI"
  },
  {
    name: "Tubular Dysfunction",
    color: "bg-teal-50 border-teal-300",
    badge: "bg-teal-100 text-teal-800",
    description: "Glucosuria with normal blood glucose, tubular proteinuria, low SG",
    dipstick: "Glucose: + (with normal serum glucose) | Protein: 1+ | SG: Low (1.005) | pH: Alkaline",
    microscopy: "Granular casts, waxy casts in severe tubular disease",
    significance: "Fanconi syndrome, renal tubular acidosis, nephrotoxin injury"
  },
  {
    name: "Hypercalciuria",
    color: "bg-orange-50 border-orange-300",
    badge: "bg-orange-100 text-orange-800",
    description: "Calcium oxalate crystals, microscopic hematuria",
    dipstick: "Blood: 1-2+ | Protein: Trace-1+ | SG: Variable",
    microscopy: "Calcium oxalate crystals (envelope/dumbbell shaped), RBCs",
    significance: "Commonest cause of isolated hematuria in children — check 24h urine Ca:Cr"
  },
  {
    name: "TMA / HUS Pattern",
    color: "bg-rose-50 border-rose-300",
    badge: "bg-rose-100 text-rose-800",
    description: "Hematuria + proteinuria + AKI picture",
    dipstick: "Blood: 3+ | Protein: 2+ | SG: Low | Hemoglobin: + (free Hb)",
    microscopy: "Fragmented RBCs (schistocytes if hemolysis), RBC casts absent (non-GN mechanism)",
    significance: "Thrombotic microangiopathy — HUS, TTP. Check: smear, LDH, ADAMTS13"
  },
];

export default function UDSAnalyzer() {
  const [inputMode, setInputMode] = useState("manual"); // "manual" | "ocr"
  const [file, setFile] = useState(null);
  const [manualText, setManualText] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [patternTab, setPatternTab] = useState(null);

  const handleAnalyze = async () => {
    const textToAnalyze = inputMode === "manual" ? manualText : "OCR upload";
    if (!textToAnalyze && !file) return;
    setLoading(true);
    try {
      let fileUrl = null;
      if (file) {
        const uploadRes = await base44.integrations.Core.UploadFile({ file });
        fileUrl = uploadRes.file_url;
      }

      const prompt = `You are a pediatric nephrologist interpreting a urine dipstick and microscopy report.

${file ? "Analyze the uploaded urine report image/document." : `Urine Report Text:\n${manualText}`}

Provide a comprehensive clinical interpretation with these sections:

1. DIPSTICK_SUMMARY: Extract/summarize key dipstick values (protein, blood, glucose, ketones, nitrites, LE, pH, SG)
2. MICROSCOPY_FINDINGS: Extract/summarize microscopy findings (RBCs, WBCs, casts, crystals, bacteria)
3. PATTERN: Most likely urinary syndrome pattern (nephrotic/nephritic/UTI/tubular/hypercalciuria/TMA/mixed)
4. CLINICAL_INTERPRETATION: 2-3 sentence clinical interpretation relevant to pediatric nephrology
5. DIFFERENTIALS: Top 3-5 diagnoses to consider with brief reasoning
6. NEPHROLOGY_SIGNIFICANCE: Specific significance for kidney disease (GN, NS, tubular, structural)
7. SUGGESTED_NEXT_TESTS: Prioritized list of next investigations
8. MONITORING_ADVICE: What to monitor and when to escalate
9. RED_FLAGS: Any urgent findings requiring immediate action
10. LINKED_PATHWAYS: Which clinical pathways to trigger (e.g., nephrotic syndrome pathway, AKI pathway)

Be specific and clinical. Use pediatric reference ranges. Flag if pattern suggests urgent nephrology referral.`;

      const res = await base44.integrations.Core.InvokeLLM({
        prompt,
        file_urls: fileUrl ? [fileUrl] : undefined,
        response_json_schema: {
          type: "object",
          properties: {
            dipstick_summary: { type: "object", additionalProperties: true },
            microscopy_findings: { type: "object", additionalProperties: true },
            pattern: { type: "string" },
            clinical_interpretation: { type: "string" },
            differentials: { type: "array", items: { type: "string" } },
            nephrology_significance: { type: "string" },
            suggested_next_tests: { type: "array", items: { type: "string" } },
            monitoring_advice: { type: "array", items: { type: "string" } },
            red_flags: { type: "array", items: { type: "string" } },
            linked_pathways: { type: "array", items: { type: "string" } }
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
      <Card className="border-2 border-purple-200 bg-purple-50">
        <CardContent className="p-4">
          <p className="text-xs font-bold text-purple-800 mb-3 flex items-center gap-2">
            <FlaskConical className="w-4 h-4" /> Urinary Pattern Recognition Reference
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {UDS_PATTERNS.map((p, i) => (
              <div key={i} className={`border-2 rounded-lg overflow-hidden ${p.color}`}>
                <button className="w-full flex items-center justify-between p-2.5" onClick={() => setPatternTab(patternTab === i ? null : i)}>
                  <Badge className={`text-xs ${p.badge}`}>{p.name}</Badge>
                  {patternTab === i ? <ChevronDown className="w-3 h-3 text-slate-500" /> : <ChevronRight className="w-3 h-3 text-slate-500" />}
                </button>
                {patternTab === i && (
                  <div className="px-3 pb-3 space-y-1.5">
                    <p className="text-xs text-slate-600 italic">{p.description}</p>
                    <p className="text-xs"><span className="font-semibold">Dipstick:</span> {p.dipstick}</p>
                    <p className="text-xs"><span className="font-semibold">Microscopy:</span> {p.microscopy}</p>
                    <p className="text-xs font-medium text-slate-700">⟹ {p.significance}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Input Area */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Microscope className="w-4 h-4 text-purple-600" /> Analyze Urine Report
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <button onClick={() => setInputMode("manual")} className={`flex-1 py-2 rounded-lg text-xs font-semibold border-2 transition-all ${inputMode === "manual" ? "bg-purple-600 text-white border-purple-600" : "bg-white border-slate-200 text-slate-600"}`}>
              <TestTube className="w-3.5 h-3.5 inline mr-1" /> Type/Paste Values
            </button>
            <button onClick={() => setInputMode("ocr")} className={`flex-1 py-2 rounded-lg text-xs font-semibold border-2 transition-all ${inputMode === "ocr" ? "bg-purple-600 text-white border-purple-600" : "bg-white border-slate-200 text-slate-600"}`}>
              <Upload className="w-3.5 h-3.5 inline mr-1" /> Upload Report Image
            </button>
          </div>

          {inputMode === "manual" ? (
            <Textarea
              value={manualText}
              onChange={e => setManualText(e.target.value)}
              placeholder="Paste or type urine report values here...
Example:
Urine Dipstick: Protein 3+, Blood 2+, Glucose Neg, Nitrites Neg, LE +, SG 1.025, pH 5.5, Ketones Neg
Urine Microscopy: RBCs 15-20/HPF (dysmorphic), WBCs 2-3/HPF, RBC casts 1-2/LPF, No bacteria"
              className="h-32 text-xs font-mono"
            />
          ) : (
            <div className="border-2 border-dashed border-purple-200 rounded-xl p-6 text-center bg-purple-50">
              <Upload className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <p className="text-sm text-purple-700 font-medium mb-2">Upload urine dipstick/microscopy report</p>
              <input type="file" accept="image/*,.pdf" onChange={e => setFile(e.target.files[0])} className="hidden" id="uds-upload" />
              <label htmlFor="uds-upload" className="cursor-pointer inline-block bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-purple-700 transition-colors">
                Choose File
              </label>
              {file && <p className="text-xs text-purple-700 mt-2 font-medium">✓ {file.name}</p>}
            </div>
          )}

          <Button
            onClick={handleAnalyze}
            disabled={loading || (!manualText && !file)}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyzing...</> : <><Microscope className="w-4 h-4 mr-2" /> Analyze Urine Report</>}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <div className="space-y-3">
          {/* Pattern identification */}
          <Card className="border-2 border-purple-300 bg-gradient-to-r from-purple-50 to-indigo-50">
            <CardContent className="p-4">
              <p className="text-xs text-slate-500 mb-1">Identified Pattern</p>
              <p className="text-xl font-bold text-purple-800">{result.pattern}</p>
              <p className="text-sm text-slate-700 mt-2">{result.clinical_interpretation}</p>
              {result.nephrology_significance && (
                <div className="mt-2 p-2 bg-white rounded-lg border border-purple-200">
                  <p className="text-xs font-semibold text-purple-700">Nephrology Significance</p>
                  <p className="text-xs text-slate-700 mt-1">{result.nephrology_significance}</p>
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

          {/* Values summary */}
          <div className="grid sm:grid-cols-2 gap-3">
            {result.dipstick_summary && Object.keys(result.dipstick_summary).length > 0 && (
              <Card>
                <CardContent className="p-4">
                  <p className="font-bold text-sm text-slate-700 mb-2"><Droplet className="w-3.5 h-3.5 inline mr-1 text-blue-600" />Dipstick Values</p>
                  {Object.entries(result.dipstick_summary).map(([k, v]) => (
                    <div key={k} className="flex justify-between text-xs border-b py-1 last:border-0">
                      <span className="text-slate-600 capitalize">{k.replace(/_/g, ' ')}</span>
                      <span className={`font-semibold ${String(v).includes('+') || String(v).toLowerCase() === 'positive' ? 'text-red-600' : 'text-slate-800'}`}>{String(v)}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
            {result.microscopy_findings && Object.keys(result.microscopy_findings).length > 0 && (
              <Card>
                <CardContent className="p-4">
                  <p className="font-bold text-sm text-slate-700 mb-2"><Microscope className="w-3.5 h-3.5 inline mr-1 text-purple-600" />Microscopy</p>
                  {Object.entries(result.microscopy_findings).map(([k, v]) => (
                    <div key={k} className="flex justify-between text-xs border-b py-1 last:border-0">
                      <span className="text-slate-600 capitalize">{k.replace(/_/g, ' ')}</span>
                      <span className="font-semibold text-slate-800">{String(v)}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Differentials + next tests */}
          <div className="grid sm:grid-cols-2 gap-3">
            <Card>
              <CardContent className="p-4">
                <p className="font-bold text-sm text-slate-700 mb-2">🔍 Differentials</p>
                {(result.differentials || []).map((d, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-slate-700 mb-1.5">
                    <span className="w-4 h-4 rounded-full bg-purple-100 text-purple-700 text-center flex-shrink-0 font-bold">{i + 1}</span>
                    {d}
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="font-bold text-sm text-slate-700 mb-2">🧪 Suggested Next Tests</p>
                {(result.suggested_next_tests || []).map((t, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-slate-700 mb-1">
                    <CheckCircle className="w-3 h-3 text-teal-600 flex-shrink-0" /> {t}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {result.linked_pathways?.length > 0 && (
            <Card className="bg-indigo-50 border-indigo-200">
              <CardContent className="p-4">
                <p className="font-bold text-indigo-800 text-xs mb-2">🔗 Linked Clinical Pathways</p>
                <div className="flex flex-wrap gap-2">
                  {result.linked_pathways.map((p, i) => (
                    <Badge key={i} className="bg-indigo-100 text-indigo-800 text-xs">{p}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}