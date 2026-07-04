import React, { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import {
  Microscope, Activity, TestTube, Brain, Upload, Loader2, Sparkles,
  ChevronDown, ChevronUp, Camera, FileText, Wind
} from "lucide-react";
import { base44 } from "@/api/client";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

const ANALYSERS = [
  {
    id: "lab",
    label: "Lab Report",
    icon: TestTube,
    color: "bg-blue-600",
    badge: "bg-blue-100 text-blue-800",
    prompt: `You are a pediatric clinical expert. Analyze this pediatric lab report comprehensively. Provide:
1. Summary of key abnormal values (highlight critical values)
2. Clinical interpretation (what this means for the patient)
3. Differential diagnoses suggested by these results
4. Recommended further investigations
5. Management priorities
6. Follow-up timeline
Use clear headings and bullet points. Include IAP/AAP/KDIGO guidelines where relevant.`,
    placeholder: "Paste lab values here or upload report image...\nE.g: Na 128, K 6.2, Cr 2.4, Hb 7.5, WBC 14k, Plt 90k, albumin 1.8, urine protein 3+",
    acceptsImage: true,
  },
  {
    id: "urine",
    label: "Urine Analysis",
    icon: TestTube,
    color: "bg-teal-600",
    badge: "bg-teal-100 text-teal-800",
    prompt: `You are a pediatric nephrologist. Analyze this urine report. Include:
1. Key findings summary
2. Pattern interpretation (nephrotic, nephritic, tubular, UTI, etc.)
3. Clinical significance in pediatric context
4. Differential diagnoses
5. Next investigations (UPCR, culture, imaging, renal biopsy?)
6. Management approach
7. Follow-up monitoring plan`,
    placeholder: "Paste urine report:\nE.g: Dipstick: Protein 3+, Blood +, Leukocytes -, pH 6.0\nMicroscopy: RBC 5-10/hpf, WBC 2-3/hpf, RBC casts present\nUPCR: 4.2 mg/mg, Albumin:Cr ratio: 1200 mg/g",
    acceptsImage: true,
  },
  {
    id: "biopsy",
    label: "Biopsy / Histology",
    icon: Microscope,
    color: "bg-violet-600",
    badge: "bg-violet-100 text-violet-800",
    prompt: `You are a pediatric nephro-pathologist. Analyze this biopsy report. Provide:
1. Primary diagnosis and classification
2. Pattern of injury (LM, IF, EM findings summary)
3. Activity and chronicity indices (if applicable)
4. Clinical correlation and significance
5. ISN/RPS or Oxford (MEST-C) or WHO classification where applicable
6. Prognosis factors
7. Treatment implications (specific immunosuppression protocols)
8. Monitoring plan post-biopsy`,
    placeholder: "Paste biopsy report:\nE.g: Light Microscopy: 18 glomeruli; 3 globally sclerosed. Remaining show mesangial hypercellularity with endocapillary proliferation. Crescent formation in 2/18...\nIF: IgA 3+, C3 2+ in mesangium...",
    acceptsImage: true,
  },
  {
    id: "radiology",
    label: "Radiology / Imaging",
    icon: Activity,
    color: "bg-indigo-600",
    badge: "bg-indigo-100 text-indigo-800",
    prompt: `You are a pediatric radiologist. Analyze this pediatric imaging report. Provide:
1. Summary of key findings
2. Clinical interpretation and significance
3. Pattern recognition (if applicable: cystic disease, CAKUT, obstruction, etc.)
4. Correlation with clinical scenarios
5. Differential diagnoses based on imaging
6. Recommended additional imaging
7. Urgency classification
8. Follow-up imaging plan`,
    placeholder: "Paste radiology report:\nE.g: Renal Ultrasound: Right kidney 10.2 cm (for age 7y) with increased echogenicity and loss of corticomedullary differentiation. Left kidney 7.8 cm, normal echogenicity. Bilateral renal pelvic dilatation AP diameter 12mm...",
    acceptsImage: true,
  },
  {
    id: "uroflow",
    label: "Uroflowmetry",
    icon: Activity,
    color: "bg-cyan-600",
    badge: "bg-cyan-100 text-cyan-800",
    prompt: `You are a pediatric urologist with expertise in uroflowmetry. Analyze this uroflow study. Provide:
1. Flow pattern interpretation (bell-shaped, plateau, staccato, interrupted, tower)
2. Key parameters assessment: Qmax, Qave, voiding time, flow time, voided volume, PVR
3. Clinical interpretation for this child's age/weight
4. Dysfunction pattern (voiding dysfunction, obstruction, detrusor underactivity, overactivity)
5. ICCS classification of LUTS if applicable
6. Correlation with DVSS score if provided
7. Recommended further investigations (UDS if indicated)
8. Management approach (urotherapy, biofeedback, anticholinergics, alpha-blockers)`,
    placeholder: "Paste uroflow report:\nE.g: Age 8y, Weight 28kg\nQmax: 9.2 mL/s, Qave: 4.1 mL/s\nVoided volume: 180mL, Voiding time: 44s, Flow time: 38s\nPVR: 45mL\nFlow curve: staccato pattern\nDVSS score: 18/20",
    acceptsImage: true,
  },
  {
    id: "uds",
    label: "Urodynamic Study (UDS)",
    icon: Brain,
    color: "bg-purple-600",
    badge: "bg-purple-100 text-purple-800",
    prompt: `You are a pediatric urodynamicist. Analyze this urodynamic study comprehensively. Provide:
1. CMG (filling cystometrogram) findings: capacity, compliance, sensation, stability
2. Pressure-flow analysis: detrusor pressure, flow rate, bladder outlet resistance
3. Electromyography (EMG/sphincter) findings if reported
4. ICS/ICCS classification of dysfunction
5. Diagnosis: Neurogenic vs non-neurogenic; overactive vs underactive bladder; DSD
6. Clinical correlation with symptoms
7. Risk assessment: upper urinary tract impact, hydronephrosis risk
8. Management plan: urotherapy, pharmacological, surgical considerations`,
    placeholder: "Paste UDS report:\nE.g: Cystometric capacity: 180mL (expected 280mL for age)\nCompliance: 8.2 mL/cmH2O (reduced)\nDetrusor overactivity: present at 120mL fill\nLeak point pressure: 62 cmH2O\nPdetmax: 45 cmH2O at Qmax 6 mL/s\nEMG: paradoxical increase during voiding (DSD)\nBladder neck: open at rest",
    acceptsImage: false,
  },
  {
    id: "abg",
    label: "ABG / Blood Gas",
    icon: Wind,
    color: "bg-rose-600",
    badge: "bg-rose-100 text-rose-800",
    prompt: `You are a pediatric intensivist. Analyze this blood gas. Provide:
1. Primary disorder identification (acidosis/alkalosis, respiratory/metabolic)
2. Compensation assessment (appropriate vs inappropriate)
3. Delta-delta ratio (if metabolic acidosis)
4. Anion gap and corrected anion gap
5. Likely clinical diagnoses
6. Urgency and treatment priorities
7. Target pH and correction strategy`,
    placeholder: "E.g: pH 7.22, PaCO2 18, PaO2 95, HCO3 7.2, BE -18, Na 138, K 5.1, Cl 110, glucose 320, lactate 2.1\nClinical: 8y T1DM, vomiting 2 days",
    acceptsImage: false,
  },
];

function SingleAnalyser({ analyser }) {
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [open, setOpen] = useState(false);
  const fileRef = useRef();

  const Icon = analyser.icon;

  const analyse = async () => {
    if (!text.trim() && !file) { toast.error("Enter text or upload image"); return; }
    setLoading(true); setResult("");
    try {
      let fileUrls = [];
      if (file) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        fileUrls = [file_url];
      }
      const prompt = analyser.prompt + (text ? `\n\nData to analyze:\n${text}` : "");
      const res = await base44.integrations.Core.InvokeLLM({
        prompt,
        file_urls: fileUrls.length ? fileUrls : undefined,
        model: "claude_sonnet_4_6",
      });
      setResult(res);
    } catch (e) {
      toast.error("Analysis failed: " + (e.message || "unknown error"));
    }
    setLoading(false);
  };

  return (
    <Card className="bg-white border border-slate-200 overflow-hidden">
      <button onClick={() => setOpen(v => !v)}
        className={`w-full flex items-center justify-between px-4 py-3 text-left ${open ? analyser.color + " text-white" : "bg-slate-50 hover:bg-slate-100 text-slate-800"}`}>
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4" />
          <span className="font-bold text-sm">{analyser.label} AI Analyser</span>
          <Badge className={`text-[10px] ${open ? "bg-white/20 text-white" : analyser.badge}`}>AI</Badge>
        </div>
        {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {open && (
        <CardContent className="p-4 space-y-3">
          <Textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder={analyser.placeholder}
            rows={4}
            className="text-xs resize-y bg-slate-50 border-slate-200"
          />
          <div className="flex gap-2 flex-wrap">
            {analyser.acceptsImage && (
              <>
                <input type="file" accept="image/*,.pdf" ref={fileRef} className="hidden"
                  onChange={e => setFile(e.target.files?.[0] || null)} />
                <Button size="sm" variant="outline" onClick={() => fileRef.current?.click()}
                  className="text-xs h-8 gap-1 border-slate-300">
                  <Upload className="w-3.5 h-3.5" />
                  {file ? file.name.slice(0, 20) + "…" : "Upload Image/PDF"}
                </Button>
              </>
            )}
            <Button size="sm" onClick={analyse} disabled={loading}
              className={`text-xs h-8 gap-1 text-white flex-1 ${analyser.color.replace("bg-", "bg-")} hover:opacity-90`}>
              {loading ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Analysing…</> : <><Sparkles className="w-3.5 h-3.5" />Analyse</>}
            </Button>
          </div>

          {result && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 max-h-[500px] overflow-y-auto">
              <p className="text-xs font-bold text-slate-600 mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-violet-500" /> AI Analysis (Claude Sonnet)
              </p>
              <div className="prose prose-sm prose-slate max-w-none text-xs">
                <ReactMarkdown>{result}</ReactMarkdown>
              </div>
              <Alert className="mt-3 bg-amber-50 border-amber-200 py-2">
                <AlertDescription className="text-xs text-amber-800">
                  AI-generated. Not a substitute for clinical judgment or specialist review.
                </AlertDescription>
              </Alert>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}

export default function PedsAIAnalysers() {
  return (
    <div className="space-y-3">
      <Alert className="bg-violet-50 border-violet-200">
        <Sparkles className="w-4 h-4 text-violet-600" />
        <AlertDescription className="text-violet-800 text-xs">
          AI Analysers use Claude Sonnet — each analysis uses AI credits. Results are for educational support only.
        </AlertDescription>
      </Alert>
      <div className="grid gap-2">
        {ANALYSERS.map(a => <SingleAnalyser key={a.id} analyser={a} />)}
      </div>
    </div>
  );
}