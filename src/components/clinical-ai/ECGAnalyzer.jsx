/**
 * ECGAnalyzer — Pediatric ECG interpretation with Clinical + Educational tabs
 * Uses claude_sonnet_4_6 for analysis
 */
import React, { useState } from "react";
import { base44 } from "@/api/client";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, HeartPulse, Loader2, Upload, BookOpen, Stethoscope, Info } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";

const DISCLAIMER = "This tool provides educational and clinical decision-support information and does not replace physician judgment. Clinical correlation is required.";

const ECG_PATTERNS = [
  { name: "Sinus Tachycardia", finding: "HR >100 (age-adjusted), normal P morphology, normal axis", significance: "Fever, pain, dehydration, SVT mimic — identify cause" },
  { name: "SVT (AVRT/AVNRT)", finding: "HR 180–300, narrow QRS, no visible P waves", significance: "Vagal manoeuvres → adenosine IV. If WPW: avoid adenosine." },
  { name: "WPW Pre-excitation", finding: "Short PR (<120ms), delta wave, wide QRS", significance: "Risk of rapid AF degeneration. Cardiology referral." },
  { name: "Long QT Syndrome", finding: "QTc >460ms (F) or >450ms (M)", significance: "Risk of Torsades de Pointes. Stop QT-prolonging drugs. Genetics referral." },
  { name: "Peaked T waves (Hyperkalaemia)", finding: "Tall, narrow, symmetric T waves in precordial leads", significance: "K+ >6.5 mEq/L → calcium gluconate, insulin-dextrose, salbutamol nebulisation" },
  { name: "Flat T / Prolonged QT (Hypokalaemia)", finding: "Flat/inverted T waves, prominent U wave, QTc prolongation", significance: "K+ <3 mEq/L → IV/oral KCl replacement" },
  { name: "Complete Heart Block", finding: "P-R dissociation, escape rhythm <40 bpm", significance: "Emergency pacing may be required. Check for myocarditis, Lyme disease, post-surgical." },
  { name: "Right Ventricular Hypertrophy", finding: "Right axis deviation, tall R in V1, deep S in V6", significance: "Pulmonary hypertension, tetralogy of Fallot, RV pressure overload" },
];

const LEARNING_POINTS = [
  "Pediatric normal values differ significantly from adults — always use age-specific reference ranges.",
  "Sinus arrhythmia (HR varies with respiration) is normal in children — do not over-diagnose.",
  "QTc is calculated using Bazett formula: QT/√RR. Values >500ms are at high risk for arrhythmia.",
  "WPW in children with SVT — avoid adenosine if AF coexists (can accelerate ventricular rate).",
  "Hyperkalaemia ECG sequence: tall T → flat P → wide QRS → sine wave → VF.",
  "Complete AV block in a neonate suggests neonatal lupus (maternal anti-Ro/La antibodies).",
  "Right axis deviation is normal in neonates and infants up to 6 months.",
  "Athletes may show voltage criteria for LVH without pathology — check history and echo.",
];

export default function ECGAnalyzer() {
  const [activeTab, setActiveTab] = useState("clinical");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const [reportText, setReportText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [clinicalContext, setClinicalContext] = useState("");

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setImageFile(f);
    setImagePreviewUrl(URL.createObjectURL(f));
    setResult(null);
  };

  const handleAnalyse = async () => {
    if (!imageFile && !reportText.trim()) {
      toast.error("Upload an ECG image or paste the report text");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      let fileUrl = null;
      if (imageFile) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file: imageFile });
        fileUrl = file_url;
      }

      const prompt = `You are a Pediatric Cardiologist providing ECG interpretation for clinical decision support.

${clinicalContext ? `Clinical context: ${clinicalContext}` : ""}
${reportText ? `ECG report/findings text:\n${reportText}` : ""}
${fileUrl ? "(ECG image attached for analysis)" : ""}

Provide a structured pediatric ECG interpretation using this format:

## Rate & Rhythm
[HR, rhythm regularity, P wave presence and morphology]

## Intervals (with age-adjusted normal ranges)
[PR, QRS duration, QTc — flag if abnormal]

## Axis
[P axis, QRS axis — normal/right/left deviation for age]

## Waveform Analysis
[P wave, QRS morphology, ST segment, T wave changes. Note lead-by-lead abnormalities]

## Key Findings
[Bullet list of the 2-4 most clinically significant findings]

## Differential Diagnosis
[Most likely diagnoses in order of probability]

## Urgent Actions Required
[Any immediate management needed — flag life-threatening findings clearly]

## Recommended Next Steps
[Further investigations, monitoring, referral]

Use pediatric age-appropriate reference values. Flag any life-threatening finding with 🚨.`;

      const res = await base44.integrations.Core.InvokeLLM({
        prompt,
        model: "claude_sonnet_4_6",
        file_urls: fileUrl ? [fileUrl] : undefined,
      });
      setResult(res);
    } catch (e) {
      toast.error("Analysis failed — please try again");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 pb-6">
      {/* Persistent disclaimer */}
      <Alert className="bg-amber-50 border-amber-300 py-2">
        <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
        <AlertDescription className="text-amber-800 text-xs">{DISCLAIMER}</AlertDescription>
      </Alert>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
        <button onClick={() => setActiveTab("clinical")}
          className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${activeTab === "clinical" ? "bg-white text-red-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
          <Stethoscope className="w-3.5 h-3.5" /> Clinical Analysis
        </button>
        <button onClick={() => setActiveTab("education")}
          className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${activeTab === "education" ? "bg-white text-blue-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
          <BookOpen className="w-3.5 h-3.5" /> Educational Mode
        </button>
      </div>

      {/* ── Clinical Analysis Tab ── */}
      {activeTab === "clinical" && (
        <div className="space-y-4">
          {/* Upload */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
            <p className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <HeartPulse className="w-4 h-4 text-red-600" /> ECG Input
            </p>

            <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:border-red-400 transition-colors cursor-pointer relative">
              <input type="file" accept="image/*,.pdf" onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer" />
              {imagePreviewUrl ? (
                <img src={imagePreviewUrl} alt="ECG" className="max-h-40 mx-auto rounded-lg object-contain" />
              ) : (
                <>
                  <Upload className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs text-slate-400">Upload ECG image or PDF</p>
                </>
              )}
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Or paste ECG report / findings text</label>
              <textarea
                value={reportText}
                onChange={e => setReportText(e.target.value)}
                placeholder="e.g. HR 72, sinus rhythm, PR 160ms, QRS 80ms, QTc 410ms, normal axis..."
                className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-300 min-h-[80px] resize-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Clinical Context (optional)</label>
              <input
                value={clinicalContext}
                onChange={e => setClinicalContext(e.target.value)}
                placeholder="e.g. 8 years, syncope on exertion, family history of sudden death"
                className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-300 h-9"
              />
            </div>

            <Button onClick={handleAnalyse} disabled={loading || (!imageFile && !reportText.trim())}
              className="w-full bg-red-600 hover:bg-red-700 text-white gap-2">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Analysing ECG...</> : <><HeartPulse className="w-4 h-4" /> Analyse ECG</>}
            </Button>
          </div>

          {/* Result */}
          {result && (
            <div className="bg-white rounded-2xl border border-slate-200 p-4">
              <div className="flex items-center gap-2 mb-3">
                <HeartPulse className="w-4 h-4 text-red-600" />
                <p className="text-sm font-bold text-slate-800">ECG Interpretation</p>
                <Badge className="ml-auto bg-red-100 text-red-700 text-xs">AI-generated — verify clinically</Badge>
              </div>
              <ReactMarkdown className="prose prose-sm max-w-none text-slate-800 [&>h2]:text-sm [&>h2]:font-bold [&>h2]:text-red-800 [&>h2]:mt-3 [&>p]:text-sm [&>ul]:text-sm [&>ol]:text-sm">
                {result}
              </ReactMarkdown>
              <Alert className="bg-amber-50 border-amber-300 mt-4 py-2">
                <AlertDescription className="text-amber-800 text-xs">{DISCLAIMER}</AlertDescription>
              </Alert>
            </div>
          )}
        </div>
      )}

      {/* ── Educational Mode Tab ── */}
      {activeTab === "education" && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
            <p className="text-sm font-bold text-blue-800 mb-1 flex items-center gap-2">
              <Info className="w-4 h-4" /> Key Learning Pearls — Pediatric ECG
            </p>
            <ul className="space-y-1.5 mt-2">
              {LEARNING_POINTS.map((p, i) => (
                <li key={i} className="text-xs text-blue-900 flex items-start gap-2">
                  <span className="text-blue-400 font-bold flex-shrink-0">{i + 1}.</span> {p}
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-bold text-slate-700 uppercase tracking-widest">Important ECG Patterns in Paediatrics</p>
            {ECG_PATTERNS.map((pattern, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-xl p-3 space-y-1">
                <p className="text-sm font-bold text-slate-900">{pattern.name}</p>
                <p className="text-xs text-slate-600"><span className="font-semibold text-slate-500">Finding: </span>{pattern.finding}</p>
                <p className="text-xs text-emerald-800 bg-emerald-50 rounded-lg px-2 py-1">
                  <span className="font-semibold">Clinical significance: </span>{pattern.significance}
                </p>
              </div>
            ))}
          </div>

          <Alert className="bg-amber-50 border-amber-300 py-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <AlertDescription className="text-amber-800 text-xs">{DISCLAIMER}</AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  );
}